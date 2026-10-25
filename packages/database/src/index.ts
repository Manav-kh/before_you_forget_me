import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { postSchema } from '@byfm/contracts';

export type Row = Record<string,any>;
export type Query = <T extends Row = Row>(sql:string,params?:unknown[])=>Promise<T[]>;
export type Database = { transaction:<T>(work:(query:Query)=>Promise<T>)=>Promise<T>; close:()=>Promise<void>; kind:'postgres'|'pglite'; root:string };
export function projectRoot() {
  if (process.env.BYFM_ROOT) return path.resolve(process.env.BYFM_ROOT);
  let current=process.cwd();
  for(let i=0;i<7;i++){if(existsSync(path.join(current,'packages','database'))) return current; const parent=path.dirname(current); if(parent===current)break; current=parent;}
  throw new Error('Set BYFM_ROOT to the v2 application directory.');
}
const migration = `
CREATE TABLE IF NOT EXISTS migrations (version INTEGER PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS editions (id UUID PRIMARY KEY, slug TEXT UNIQUE NOT NULL, sku TEXT UNIQUE NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS customers (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY, reference TEXT UNIQUE NOT NULL, customer_id UUID NOT NULL REFERENCES customers(id), idempotency_key TEXT UNIQUE NOT NULL, request_hash TEXT NOT NULL, access_hash TEXT NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS order_items (id UUID PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), edition_id UUID NOT NULL REFERENCES editions(id), title TEXT NOT NULL, sku TEXT NOT NULL, quantity INTEGER NOT NULL CHECK(quantity>0), unit_price_paise INTEGER NOT NULL CHECK(unit_price_paise>=0), line_total_paise INTEGER NOT NULL CHECK(line_total_paise=quantity*unit_price_paise));
CREATE INDEX IF NOT EXISTS orders_customer_idx ON orders(customer_id);
CREATE TABLE IF NOT EXISTS order_events (id UUID PRIMARY KEY, order_id UUID NOT NULL REFERENCES orders(id), actor TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS posts (id UUID PRIMARY KEY, slug TEXT UNIQUE NOT NULL, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS enquiries (id UUID PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), data JSONB NOT NULL);
CREATE TABLE IF NOT EXISTS media (id UUID PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS admin_users (id UUID PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, admin_id UUID NOT NULL REFERENCES admin_users(id), csrf_token TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_events (id UUID PRIMARY KEY, actor TEXT NOT NULL, action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL, detail TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS secrets (name TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT INTO migrations(version) VALUES(1) ON CONFLICT DO NOTHING;
`;
export async function createDatabase(options:{root?:string;url?:string;directory?:string}={}):Promise<Database>{
  const root=options.root??projectRoot(); const url=options.url??process.env.DATABASE_URL;
  if(process.env.NODE_ENV==='production'&&!url)throw new Error('DATABASE_URL is required in production.');
  let database:Database;
  if(url){
    const {Pool}=await import('pg'); const pool:Pool=new Pool({connectionString:url,max:10});
    database={kind:'postgres',root,async transaction(work){const client:PoolClient=await pool.connect(); const query:Query=async(sql,params=[]) => (await client.query(sql,params)).rows; try{await client.query('BEGIN');const result=await work(query);await client.query('COMMIT');return result;}catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}},async close(){await pool.end();}};
  }else{
    const directory=options.directory??process.env.PGLITE_DATA_DIR??path.join(process.env.BYFM_DATA_DIR??path.join(root,'.local'),'postgres');mkdirSync(directory,{recursive:true});
    const {PGlite}=await import('@electric-sql/pglite');const pg=new PGlite(directory);await pg.waitReady;
    let tail:Promise<unknown>=Promise.resolve();
    database={kind:'pglite',root,transaction<T>(work:(query:Query)=>Promise<T>){const result=tail.then(async()=>{await pg.exec('BEGIN');const query:Query=async<T extends Row>(sql:string,params:unknown[]=[]) => (await pg.query<T>(sql,params)).rows;try{const value=await work(query);await pg.exec('COMMIT');return value;}catch(error){await pg.exec('ROLLBACK');throw error;}});tail=result.catch(()=>{});return result;},async close(){await tail;await pg.close();}};
  }
  await database.transaction(async query=>{for(const sql of migration.split(';').map(s=>s.trim()).filter(Boolean))await query(sql);});
  await seedDatabase(database);return database;
}
export async function seedDatabase(db:Database){
  const previewSeeds=process.env.NODE_ENV!=='production'||process.env.SEED_PREVIEW_DATA==='1';
  await db.transaction(async query=>{
    const editions=[{slug:'paperback',sku:'BYFM-PB',name:'Paperback',format:'Paperback',summary:'The story, held close.',description:'A paperback edition of Before You Forget Me. For quiet evenings, marked pages and stories you return to.',pricePaise:39900,stock:15,isPublished:true,isFeatured:true,sortOrder:0,imageUrl:'/media/book-cover.webp'},{slug:'signed-edition',sku:'BYFM-SIGNED',name:'Signed edition',format:'Signed paperback',summary:'A personal touch from the author.',description:'A signed paperback edition of Before You Forget Me. Signature arrangements are confirmed with your order.',pricePaise:59900,stock:10,isPublished:true,isFeatured:true,sortOrder:1,imageUrl:'/media/book-cover.webp'},{slug:'collectors-edition',sku:'BYFM-COLLECTOR',name:'Collector’s edition',format:'Collector edition',summary:'For the stories you keep.',description:'A collector edition of Before You Forget Me. Edition details and availability are confirmed before fulfillment.',pricePaise:79900,stock:5,isPublished:true,isFeatured:true,sortOrder:2,imageUrl:'/media/book-jacket.webp'}];
    // Seed only a genuinely new catalogue; archiving all editions never resurrects them.
    const marker=await query('SELECT value FROM secrets WHERE name=$1',['catalogue_seed_v1']);
    if(previewSeeds&&!marker.length){for(const edition of editions)await query('INSERT INTO editions(id,slug,sku,data) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING',[randomUUID(),edition.slug,edition.sku,JSON.stringify(edition)]);await query('INSERT INTO secrets(name,value) VALUES($1,$2) ON CONFLICT DO NOTHING',['catalogue_seed_v1','complete']);}
    const journalMarker=await query('SELECT value FROM secrets WHERE name=$1',['journal_seed_v1']);
    const journalPath=path.join(db.root,'assets','source','content','journal.json');
    if(previewSeeds&&!journalMarker.length&&existsSync(journalPath)){
      const source:unknown=JSON.parse(readFileSync(journalPath,'utf8').replace(/^\uFEFF/,''));
      if(!Array.isArray(source))throw new Error('Preserved journal content must be an array.');
      const slugs=new Set<string>();const publishedAt=new Date().toISOString();
      for(const article of source){
        const base=String(article.title??'').normalize('NFKD').replace(/\p{M}+/gu,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,110).replace(/-$/,'')||'journal-note';
        let slug=base;let suffix=2;while(slugs.has(slug)){slug=base+'-'+suffix;suffix++;}slugs.add(slug);
        const post=postSchema.parse({...article,slug,isPublished:true});
        await query('INSERT INTO posts(id,slug,data) VALUES($1,$2,$3) ON CONFLICT(slug) DO NOTHING',[randomUUID(),slug,JSON.stringify({...post,publishedAt})]);
      }
      await query('INSERT INTO secrets(name,value) VALUES($1,$2) ON CONFLICT DO NOTHING',['journal_seed_v1','complete']);
    }
    const settings={authorName:'Harshdeep Thakral',siteName:'Before You Forget Me',tagline:'Some stories stay with you.',bookDescription:'Some people enter our lives for a season. Some stay forever. And some leave behind memories that time can never erase. When Riya, a quiet girl who finds comfort in books, meets Arsh, a curious young journalist with an old canvas bag and an endless love for people, her world begins to change. Together they discover the joy hidden in ordinary moments—sharing coffee, wandering through the streets of Shimla, watching sunsets, exchanging books, and collecting the memories that slowly turn into love. But life has a way of rewriting even the most beautiful stories.',authorBio:'Harshdeep Thakral is the author of Before You Forget Me, a nostalgic romance set between the quiet beauty of 1970s Shimla and the emotional afterlife of memories. His writing lingers on ordinary details—coffee, old letters, wandering streets, borrowed books—and the people who make them unforgettable.',contactEmail:'',instagramUrl:'',shippingNote:'Orders are requests pending manual confirmation. No payment is collected here. Delivery details and any shipping charge will be agreed before confirmation.',shippingPolicy:'Orders are pending manual confirmation. Delivery timelines, serviceability and shipping charges will be confirmed with you before dispatch. No payment is collected on this website.',returnsPolicy:'Contact the author about damaged, incorrect or incomplete deliveries. Final return and replacement terms must be reviewed before commercial launch.',privacyPolicy:'Contact details and delivery addresses are used to manage orders and enquiries. This preview does not use advertising trackers. The final privacy policy and retention terms must be reviewed before commercial launch.',homeQuote:'Some stories stay with you.',heroImageUrl:'/media/book-cover.webp',authorImageUrl:'/media/author.webp',orderEnabled:true};
    settings.orderEnabled=previewSeeds;
    await query('INSERT INTO settings(id,data) VALUES(1,$1) ON CONFLICT DO NOTHING',[JSON.stringify(settings)]);
    await query('INSERT INTO secrets(name,value) VALUES($1,$2) ON CONFLICT DO NOTHING',['order_token_secret',randomUUID()+randomUUID()]);
  });
}
declare global { var __byfmDb:Promise<Database>|undefined; }
export function getDatabase(){return globalThis.__byfmDb??=createDatabase();}


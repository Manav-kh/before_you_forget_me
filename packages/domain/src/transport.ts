import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { z, ZodError } from 'zod';
import sharp from 'sharp';
import { getDatabase, type Database } from '@byfm/database';
import { HttpError, hash, getPublicCatalog, getPublicEdition, getPublicContent, getPublicPosts, getPublicPost, createOrder, lookupOrder, cancelOrder, createEnquiry, login, logout, session, rateLimit, adminList, overview, saveEdition, archiveEdition, savePost, archivePost, saveSettings, updateCustomer, updateEnquiry, updateOrder, saveMedia } from './core';

const cookieName='byfm_admin';
const mutating=(method:string)=>!['GET','HEAD','OPTIONS'].includes(method);
export function allowedOrigins(){
  const configured=[...(process.env.ALLOWED_ORIGINS??'').split(','),process.env.STOREFRONT_ORIGIN??'',process.env.ADMIN_ORIGIN??''].map(v=>v.trim()).filter(Boolean);
  if(configured.length)return [...new Set(configured)];
  if(process.env.NODE_ENV==='production')return [];
  return ['http://localhost:3000','http://localhost:3001','http://127.0.0.1:3000','http://127.0.0.1:3001'];
}
function cookieToken(req:Request){const cookie=req.headers.get('cookie')??'';const found=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith(cookieName+'='));return found?.slice(cookieName.length+1)??'';}
function bearer(req:Request){const auth=req.headers.get('authorization')??'';return /^Bearer [A-Za-z0-9_-]{30,150}$/.test(auth)?auth.slice(7):'';}
function requireOrigin(req:Request){const origin=req.headers.get('origin');if(!origin||!allowedOrigins().includes(origin))throw new HttpError(403,'Request origin is not allowed.');}
function corsHeaders(req:Request){const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Origin'});const origin=req.headers.get('origin');if(origin&&allowedOrigins().includes(origin)){headers.set('Access-Control-Allow-Origin',origin);headers.set('Access-Control-Allow-Credentials','true');}return headers;}
function json(req:Request,data:unknown,status=200,extra?:HeadersInit){const headers=corsHeaders(req);headers.set('Content-Type','application/json; charset=utf-8');if(extra)new Headers(extra).forEach((v,k)=>headers.set(k,v));return new Response(JSON.stringify({data}),{status,headers});}
async function readBounded(req:Request,maxBytes:number){
  if(Number(req.headers.get('content-length')??0)>maxBytes)throw new HttpError(413,'Request is too large.');
  const reader=req.body?.getReader();if(!reader)return new Uint8Array();const chunks:Uint8Array[]=[];let size=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new HttpError(413,'Request is too large.');}chunks.push(value);}}finally{reader.releaseLock();}
  const result=new Uint8Array(size);let offset=0;for(const chunk of chunks){result.set(chunk,offset);offset+=chunk.byteLength;}return result;
}
async function body(req:Request){const bytes=await readBounded(req,1024*1024);try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw new HttpError(400,'Send a valid JSON request.');}}
function cookie(value:string,clear=false){return `${cookieName}=${value}; Path=/api; HttpOnly; SameSite=Lax; Max-Age=${clear?0:8*60*60}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
function clientKey(req:Request){return process.env.TRUST_PROXY==='1'?(req.headers.get('x-forwarded-for')?.split(',')[0].trim()??'unknown'):'local-client';}
function filterRows(rows:Record<string,any>[],url:URL){const q=(url.searchParams.get('q')??url.searchParams.get('search')??'').toLowerCase();let result=rows;if(q)result=result.filter(row=>['name','title','reference','customerName','email','subject','sku'].some(key=>String(row[key]??'').toLowerCase().includes(q)));for(const key of ['status','kind','fulfillmentStatus']){const value=url.searchParams.get(key);if(value&&value!=='all')result=result.filter(row=>row[key]===value);}const pub=url.searchParams.get('published');if(pub==='true'||pub==='false')result=result.filter(row=>row.isPublished===(pub==='true'));if(!url.searchParams.has('offset')&&!url.searchParams.has('limit'))return result;const offset=Math.max(0,Math.trunc(Number(url.searchParams.get('offset')))||0);const limit=Math.min(500,Math.max(1,Math.trunc(Number(url.searchParams.get('limit')))||200));return result.slice(offset,offset+limit);}
function csvCell(value:unknown){let text=typeof value==='object'?JSON.stringify(value):String(value??'');if(/^[\s]*[=+@-]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';}
async function upload(req:Request,database:Database,actor:string){
  const max=8*1024*1024;if(Number(req.headers.get('content-length')??0)>max+65536)throw new HttpError(413,'Choose an image under 8 MB.');
  const bytes=await readBounded(req,max+65536);let form:FormData;try{form=await new Response(bytes,{headers:{'Content-Type':req.headers.get('content-type')??''}}).formData();}catch{throw new HttpError(400,'Send an image using a valid multipart form.');}const file=form.get('file');if(!(file instanceof File))throw new HttpError(400,'Choose an image file.');if(file.size>max)throw new HttpError(413,'Choose an image under 8 MB.');
  const alt=z.string().trim().min(1,'Add an image description.').max(300).parse(form.get('alt')??file.name);
  const buffer=Buffer.from(await file.arrayBuffer());let output:Buffer;let width:number;let height:number;
  try{const image=sharp(buffer,{limitInputPixels:40000000,animated:false});const metadata=await image.metadata();if(!['jpeg','png','webp','avif'].includes(metadata.format??''))throw new Error('Unsupported image');const processed=await image.rotate().resize({width:2000,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer({resolveWithObject:true});output=processed.data;width=processed.info.width;height=processed.info.height;}catch{throw new HttpError(400,'Upload a valid JPEG, PNG, WebP or AVIF image.');}
  const name=randomUUID()+'.webp';const directory=path.join(process.env.BYFM_DATA_DIR??path.join(database.root,'.local'),'uploads');await mkdir(directory,{recursive:true});const target=path.join(directory,name);await writeFile(target,output);
  try{return await saveMedia({url:'/api/media/'+name,name:file.name.slice(0,200),alt,width,height,mimeType:'image/webp',size:output.length},actor,database);}catch(error){await unlink(target).catch(()=>{});throw error;}
}
export async function handleApi(req:Request,options:{database?:Database}={}):Promise<Response>{
  try{
    const url=new URL(req.url);const parts=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean).map(decodeURIComponent);const method=req.method;
    const origin=req.headers.get('origin');if(origin&&!allowedOrigins().includes(origin))throw new HttpError(403,'Request origin is not allowed.');
    if(method==='OPTIONS'){requireOrigin(req);const headers=corsHeaders(req);headers.set('Access-Control-Allow-Methods','GET, POST, PATCH, DELETE, OPTIONS');headers.set('Access-Control-Allow-Headers','Content-Type, X-CSRF-Token, Authorization');return new Response(null,{status:204,headers});}
    if(mutating(method))requireOrigin(req);
    const database=options.database??await getDatabase();const first=parts[0];const second=parts[1];const id=parts[2];
    if(method==='GET'&&first==='health')return json(req,{status:'ok',database:database.kind});
    if(method==='GET'&&first==='media'&&second){if(!/^[0-9a-f-]{36}\.webp$/.test(second))throw new HttpError(404,'Image not found.');try{const data=await readFile(path.join(process.env.BYFM_DATA_DIR??path.join(database.root,'.local'),'uploads',second));const headers=corsHeaders(req);headers.set('Content-Type','image/webp');headers.set('Cache-Control','public,max-age=31536000,immutable');return new Response(new Uint8Array(data),{headers});}catch{throw new HttpError(404,'Image not found.');}}
    if(method==='GET'&&first==='catalog'&&parts.length===1)return json(req,await getPublicCatalog(database));
    if(method==='GET'&&first==='editions'&&second){const data=await getPublicEdition(second,database);if(!data)throw new HttpError(404,'Edition not found.');return json(req,data);}
    if(method==='GET'&&first==='content')return json(req,await getPublicContent(database));
    if(method==='GET'&&first==='posts'){if(second){const data=await getPublicPost(second,database);if(!data)throw new HttpError(404,'Journal entry not found.');return json(req,data);}return json(req,await getPublicPosts(database));}
    if(first==='orders'&&parts.length<=2){
      if(method==='POST'&&!second){await rateLimit('order:'+clientKey(req),30,60*60*1000,database);return json(req,await createOrder(await body(req),database),201);}
      if(method==='GET'&&second)return json(req,await lookupOrder(second,bearer(req),database));
      if(method==='PATCH'&&second){z.object({action:z.literal('cancel')}).strict().parse(await body(req));return json(req,await cancelOrder(second,bearer(req),database));}
    }
    if(first==='enquiries'&&method==='POST'&&parts.length===1){await rateLimit('enquiry:'+clientKey(req),15,60*60*1000,database);return json(req,await createEnquiry(await body(req),database),201);}
    if(first==='admin'){
      if(second==='login'&&method==='POST'&&parts.length===2){await rateLimit('login:'+clientKey(req),10,15*60*1000,database);const input=z.object({email:z.string().email().max(254),password:z.string().min(1).max(512)}).strict().parse(await body(req));const result=await login(input.email,input.password,database);if(!result)throw new HttpError(401,'Email or password is incorrect.');return json(req,{user:result.user,csrfToken:result.csrfToken},200,{'Set-Cookie':cookie(result.token)});}
      const authenticated=await session(cookieToken(req),database);if(!authenticated)throw new HttpError(401,'Sign in to continue.');
      if(mutating(method)&&req.headers.get('x-csrf-token')!==authenticated.csrfToken)throw new HttpError(403,'Session security check failed. Refresh and try again.');
      const actor=authenticated.user.email;
      if(second==='session'&&method==='GET')return json(req,authenticated);
      if(second==='logout'&&method==='POST'){await logout(cookieToken(req),actor,database);return json(req,{success:true},200,{'Set-Cookie':cookie('',true)});}
      if(second==='overview'&&method==='GET')return json(req,await overview(database));
      if(second==='settings'){if(method==='GET')return json(req,await getPublicContent(database));if(method==='PATCH')return json(req,await saveSettings(await body(req),actor,database));}
      if(['editions','posts','enquiries','orders','customers','media','audit'].includes(second??'')&&method==='GET')return json(req,filterRows(await adminList(second,database),url));
      if(second==='editions'){if(method==='POST'&&!id)return json(req,await saveEdition(null,await body(req),actor,database),201);if(id&&method==='PATCH'){z.string().uuid().parse(id);return json(req,await saveEdition(id,await body(req),actor,database));}if(id&&method==='DELETE'){z.string().uuid().parse(id);return json(req,await archiveEdition(id,actor,database));}}
      if(second==='posts'){if(method==='POST'&&!id)return json(req,await savePost(null,await body(req),actor,database),201);if(id&&method==='PATCH'){z.string().uuid().parse(id);return json(req,await savePost(id,await body(req),actor,database));}if(id&&method==='DELETE'){z.string().uuid().parse(id);return json(req,await archivePost(id,actor,database));}}
      if(second==='orders'&&id&&method==='PATCH'){z.string().uuid().parse(id);return json(req,await updateOrder(id,await body(req),actor,database));}
      if(second==='customers'&&id&&method==='PATCH'){z.string().uuid().parse(id);const input=z.object({isActive:z.boolean()}).strict().parse(await body(req));return json(req,await updateCustomer(id,input.isActive,actor,database));}
      if(second==='enquiries'&&id&&method==='PATCH'){z.string().uuid().parse(id);const input=z.object({status:z.enum(['new','in_progress','resolved']).optional(),notes:z.string().trim().max(10000).optional()}).strict().refine(v=>Object.keys(v).length>0).parse(await body(req));return json(req,await updateEnquiry(id,input,actor,database));}
      if(second==='media'&&method==='POST'&&!id)return json(req,await upload(req,database,actor),201);
      if(second==='export'&&method==='GET'&&['orders','customers','enquiries'].includes(id??'')){const rows=await adminList(id,database);const keys:Record<string,string[]>={orders:['reference','customerName','email','phone','address','items','subtotalPaise','shippingPaise','totalPaise','currency','status','paymentStatus','fulfillmentStatus','trackingUrl','createdAt'],customers:['id','name','email','phone','isActive','orderCount','totalPaise','createdAt'],enquiries:['name','email','phone','subject','message','kind','status','notes','createdAt']};const columns=keys[id];const csv='\uFEFF'+[columns.map(csvCell).join(','),...rows.map(row=>columns.map(key=>csvCell(row[key])).join(','))].join('\r\n');const headers=corsHeaders(req);headers.set('Content-Type','text/csv; charset=utf-8');headers.set('Content-Disposition',`attachment; filename="byfm-${id}.csv"`);return new Response(csv,{headers});}
    }
    throw new HttpError(404,'This resource was not found.');
  }catch(error){
    let status=500;let message='Something went wrong. Please try again.';let fields:Record<string,string[]>|undefined;let code:string|undefined;
    if(error instanceof HttpError){status=error.status;message=error.message;fields=error.fields;code=error.code;}
    else if(error instanceof ZodError){status=400;message='Please check the highlighted details.';fields={};for(const issue of error.issues){const key=issue.path.join('.')||'form';(fields[key]??=[]).push(issue.message);}}
    else if((error as any)?.code==='23505'){status=409;message='That slug, SKU or value is already in use.';}
    else if((error as any)?.code==='22P02'){status=400;message='An identifier is invalid.';}
    else console.error('[byfm] API request failed',error instanceof Error?error.message:'Unknown error');
    const headers=corsHeaders(req);headers.set('Content-Type','application/json; charset=utf-8');if(status===429)headers.set('Retry-After','900');return new Response(JSON.stringify({error:message,...(fields?{fields}:{}),...(code?{code}:{})}),{status,headers});
  }
}

import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { createDatabase, projectRoot } from '@byfm/database';
import { bootstrapAdmin } from '@byfm/domain';

const root=projectRoot();
const envPath=path.join(root,'.env.local');
if(existsSync(envPath))process.loadEnvFile(envPath);
process.env.BYFM_ROOT=root;
if(process.env.NODE_ENV==='production'&&!process.env.ALLOWED_ORIGINS)throw new Error('Set ALLOWED_ORIGINS to the storefront and admin HTTPS origins before production setup.');
if(process.env.NODE_ENV==='production'&&(!process.env.ADMIN_EMAIL||!process.env.ADMIN_PASSWORD))throw new Error('Production setup requires explicit ADMIN_EMAIL and ADMIN_PASSWORD.');
const database=await createDatabase({root});
try{
  const existing=await database.transaction(async q=>(await q('SELECT count(*)::integer AS count FROM admin_users'))[0].count);
  if(existing){console.log('Database ready. Existing owner access is preserved. Local credentials, if generated here, are in .local/admin-access.txt.');}
  else{
    const email=process.env.ADMIN_EMAIL??`owner-${randomBytes(4).toString('hex')}@byfm.local`;
    const password=process.env.ADMIN_PASSWORD??randomBytes(24).toString('base64url');
    await bootstrapAdmin(email,password,database);
    if(process.env.NODE_ENV!=='production'){
      const directory=process.env.BYFM_DATA_DIR??path.join(root,'.local');await mkdir(directory,{recursive:true});
      await writeFile(path.join(directory,'admin-access.txt'),`Before You Forget Me — local owner access\n\nAdmin website: http://localhost:3001\nEmail: ${email}\nPassword: ${password}\n\nKeep this file private. These credentials are unique to this local installation.\n`,{encoding:'utf8',mode:0o600});
      console.log('Database ready. Unique owner credentials saved in .local/admin-access.txt.');
    }else console.log('Database ready. Owner initialized from the supplied environment.');
  }
  if(!existsSync(envPath)&&process.env.NODE_ENV!=='production')await writeFile(envPath,'# Local v2 settings. Never commit this file.\nALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001\n',{encoding:'utf8',mode:0o600});
}finally{await database.close();}

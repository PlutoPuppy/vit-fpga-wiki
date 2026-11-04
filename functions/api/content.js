import seed from '../../server/seed.js';
import {collections,validateContent} from '../../src/content-model.js';

export const schemaSQL=`CREATE TABLE IF NOT EXISTS wiki_content(collection TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,revision INTEGER NOT NULL,deleted INTEGER NOT NULL DEFAULT 0,PRIMARY KEY(collection,id));
CREATE TABLE IF NOT EXISTS wiki_revisions(collection TEXT NOT NULL,id TEXT NOT NULL,revision INTEGER NOT NULL,data TEXT NOT NULL,deleted INTEGER NOT NULL,saved_at TEXT NOT NULL,PRIMARY KEY(collection,id,revision));`;
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export async function onRequest({request,env}){
  const db=env.WIKI_DB;
  if(db)await db.exec(schemaSQL);
  if(request.method==='GET'){
    const data=structuredClone(seed);
    for(const rows of Object.values(data))for(const row of rows)row._revision=0;
    if(db){
      const {results}=await db.prepare('SELECT collection,id,data,revision,deleted FROM wiki_content').all();
      for(const row of results){if(!data[row.collection])continue;data[row.collection]=data[row.collection].filter(r=>r.id!==row.id);if(!row.deleted)data[row.collection].push({...JSON.parse(row.data),_revision:row.revision});}
    }
    return json({data,shared:!!db});
  }
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Save from the wiki page.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
  if(!db)return json({error:'Shared content storage is not connected yet. Your draft is kept; no shared change was saved.'},503);
  let input;try{const text=await request.text();if(text.length>60000)return json({error:'Entry is too large.'},413);input=JSON.parse(text);}catch{return json({error:'Invalid request.'},400);}
  try{
    const {collection,record,revision,deleted=false}=input;
    if(!Object.hasOwn(collections,collection) || !Number.isInteger(revision) || revision<0 || typeof deleted!=='boolean')return json({error:'Invalid content request.'},400);
    const clean=validateContent(collection,record);
    const existing=await db.prepare('SELECT data,revision,deleted FROM wiki_content WHERE collection=? AND id=?').bind(collection,clean.id).first();
    if((existing?.revision || 0)!==revision)return json({error:'Someone else changed this entry. Reload before saving; your draft is kept.'},409);
    const original=existing?JSON.parse(existing.data):seed[collection]?.find(r=>r.id===clean.id);
    const result={...clean,createdAt:original?.createdAt || new Date().toISOString(),updatedAt:new Date().toISOString()};
    const text=JSON.stringify(result),next=revision+1;
    const changes=await db.batch([
      db.prepare('INSERT INTO wiki_content(collection,id,data,revision,deleted) VALUES(?,?,?,1,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data,revision=wiki_content.revision+1,deleted=excluded.deleted WHERE wiki_content.revision=?').bind(collection,clean.id,text,deleted?1:0,revision),
      db.prepare('INSERT OR IGNORE INTO wiki_revisions(collection,id,revision,data,deleted,saved_at) SELECT collection,id,revision,data,deleted,? FROM wiki_content WHERE collection=? AND id=? AND revision=? AND data=?').bind(result.updatedAt,collection,clean.id,next,text)
    ]);
    if(!changes[0].meta.changes)return json({error:'Someone else saved first. Reload before saving; your draft is kept.'},409);
    return json({record:{...result,_revision:next},deleted});
  }catch(error){return json({error:error.message || 'Could not save content.'},400);}
}

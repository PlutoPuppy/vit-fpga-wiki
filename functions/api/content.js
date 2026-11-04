import seed from '../../server/seed.js';
import {collections,validateContent} from '../../src/content-model.js';
import {githubStore} from '../../server/github-store.js';

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
export function contentView(state){
  const data=structuredClone(seed);
  for(const rows of Object.values(data))for(const row of rows)row._revision=0;
  for(const [collection,records] of Object.entries(state.records || {})){
    if(!Object.hasOwn(collections,collection))continue;
    for(const [id,saved] of Object.entries(records)){
      data[collection]=data[collection].filter(row=>row.id!==id);
      if(!saved.deleted)data[collection].push({...saved.data,_revision:saved.revision});
    }
  }
  return data;
}
export async function onRequest({request,env}){
  const store=env.WIKI_FILE_STORE || (env.WIKI_GITHUB_TOKEN?githubStore(env.WIKI_GITHUB_TOKEN):null);
  if(request.method==='GET'){
    try{const saved=store?await store.read():{state:{records:{}}};return json({data:contentView(saved.state),shared:!!store});}
    catch{return json({error:'Saved wiki text is temporarily unavailable. Try again shortly.'},502);}
  }
  if(request.method!=='POST')return json({error:'Method not allowed.'},405);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Save from the wiki page.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
  if(!store)return json({error:'The site owner must enable GitHub file saving once. No database is needed. Your draft is kept; no shared change was saved.'},503);
  let input;try{const text=await request.text();if(text.length>60000)return json({error:'Entry is too large.'},413);input=JSON.parse(text);}catch{return json({error:'Invalid request.'},400);}
  let clean;
  try{
    if(!Object.hasOwn(collections,input.collection) || !Number.isInteger(input.revision) || input.revision<0 || (input.deleted!==undefined && typeof input.deleted!=='boolean'))throw new Error('Invalid content request.');
    clean=validateContent(input.collection,input.record);
  }catch(error){return json({error:error.message},400);}
  try{
    const {collection,revision,deleted=false}=input;
    for(let attempt=0;attempt<3;attempt++){
      const {state,version}=await store.read();
      const saved=state.records?.[collection]?.[clean.id];
      if((saved?.revision || 0)!==revision)return json({error:'Someone else changed this entry. Reload before saving; your draft is kept.'},409);
      const original=saved?.data || seed[collection]?.find(row=>row.id===clean.id);
      const result={...clean,createdAt:original?.createdAt || new Date().toISOString(),updatedAt:new Date().toISOString()};
      state.records ||= {};
      state.records[collection] ||= {};
      state.records[collection][clean.id]={data:result,revision:revision+1,deleted};
      if(await store.write(state,version))return json({record:{...result,_revision:revision+1},deleted});
    }
    return json({error:'Another save is in progress. Try again; your draft is kept.'},409);
  }catch{return json({error:'The wiki could not save to its text file. Check the server token or try again shortly. Your draft is kept.'},502);}
}

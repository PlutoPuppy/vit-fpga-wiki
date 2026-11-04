import {readFile,writeFile,rename,mkdir,appendFile} from 'node:fs/promises';
import {dirname} from 'node:path';
import {createHash} from 'node:crypto';

export function localFileStore(file){
  let queue=Promise.resolve();
  const store={
    async read(){
      try{const text=await readFile(file,'utf8');return {state:JSON.parse(text),version:createHash('sha256').update(text).digest('hex')};}
      catch(error){if(error.code==='ENOENT')return {state:{records:{}},version:null};throw error;}
    },
    write(state,version){
      const pending=queue.then(async()=>{
        const current=await store.read();if(current.version!==version)return false;
        const text=JSON.stringify(state,null,2)+'\n';
        await mkdir(dirname(file),{recursive:true});
        await writeFile(file+'.tmp',text,'utf8');await rename(file+'.tmp',file);
        await appendFile(file+'.history.jsonl',JSON.stringify({savedAt:new Date().toISOString(),state})+'\n','utf8').catch(()=>{});
        return true;
      });
      queue=pending.catch(()=>{});return pending;
    }
  };
  return store;
}

// Preserve any earlier local-preview edits when moving away from SQLite.
export async function migrateLegacyPreview(databaseFile,textFile){
  try{await readFile(textFile);return;}catch(error){if(error.code!=='ENOENT')throw error;}
  try{await readFile(databaseFile);}catch(error){if(error.code==='ENOENT')return;throw error;}
  const {DatabaseSync}=await import('node:sqlite');
  const database=new DatabaseSync(databaseFile,{readOnly:true});
  try{
    const records={};
    for(const row of database.prepare('SELECT collection,id,data,revision,deleted FROM wiki_content').all()){
      records[row.collection] ||= {};records[row.collection][row.id]={data:JSON.parse(row.data),revision:row.revision,deleted:!!row.deleted};
    }
    await writeFile(textFile,JSON.stringify({records},null,2)+'\n','utf8');
  }finally{database.close();}
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,resolve} from 'node:path';
import {after} from 'node:test';
import {localFileStore} from '../server/local-file-store.mjs';
import {onRequest} from '../functions/api/content.js';
const testRoot=fileURLToPath(new URL('../.local/',import.meta.url));
await mkdir(testRoot,{recursive:true});
const directory=await mkdtemp(join(testRoot,'wiki-text-test-'));
const file=join(directory,'content.json');
const env={WIKI_FILE_STORE:localFileStore(file)};
after(async()=>{assert.ok(resolve(directory).startsWith(resolve(testRoot)) && directory.includes('wiki-text-test-'));await rm(directory,{recursive:true,force:true});});
const get=async()=>{const response=await onRequest({request:new Request('https://wiki.test/api/content'),env});return response.json();};
const save=(collection,record,revision=0,deleted=false,origin='https://wiki.test')=>onRequest({env,request:new Request('https://wiki.test/api/content',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({collection,record,revision,deleted})})});
const samples={
  biweekly:{title:'Team report',date:'2026-11-04',jerry:'Matmul',stephanie:'MNN',tiffany:'Camera',winnie:'Softmax'},
  summary:{body:'Where the project stands'},
  overview:{title:'Dashboard note',description:'Update'},pages:{title:'Page intro'},members:{name:'Test member'},tasks:{title:'Task',memberId:'member-wn',status:'todo'},updates:{title:'Progress',memberId:'member-wn',date:'2026-11-04',update:'Test result'},meetings:{title:'Meeting',type:'internal',date:'2026-11-04',notes:'Notes'},ideas:{title:'Idea',description:'Experiment'},resources:{title:'Resource',url:'https://example.com'},files:{title:'File',url:'/files/test.pdf'},schedule:{title:'Schedule',group:'Hardware development',kind:'task',startMonth:3,endMonth:4}
};
test('every tab collection supports no-login add, edit and soft removal',async()=>{
  for(const [type,sample] of Object.entries(samples)){
    const initial={...sample,id:'test-'+type};
    let response=await save(type,initial);assert.equal(response.status,200,type);
    let result=await response.json();assert.equal(result.record._revision,1);
    assert.ok((await get()).data[type].some(r=>r.id===initial.id));
    response=await save(type,{...initial,...(type==='members'?{notes:'Edited'}:{title:'Edited'})},1);assert.equal(response.status,200,type);
    result=await response.json();assert.equal(result.record._revision,2);
    response=await save(type,result.record,2,true);assert.equal(response.status,200,type);
    assert.ok(!(await get()).data[type].some(r=>r.id===initial.id));
    const history=(await readFile(file+'.history.jsonl','utf8')).trim().split('\n').map(line=>JSON.parse(line));
    assert.equal(history.filter(item=>item.state.records[type]?.[initial.id]).at(-1).state.records[type][initial.id].revision,3);
  }
});
test('stale saves and concurrent writers cannot silently replace newer content',async()=>{
  const record={id:'test-concurrency',title:'First',description:'Shared note'};
  const results=await Promise.all([save('overview',record),save('overview',{...record,title:'Other writer'})]);
  assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  assert.equal((await save('overview',{...record,title:'Stale overwrite'},0)).status,409);
});
test('content API rejects website-code targets, invalid links, bad dates and cross-origin writes',async()=>{
  assert.equal((await save('src',{id:'app',title:'Cannot edit code'})).status,400);
  assert.equal((await save('resources',{id:'bad-link',title:'Bad',url:'javascript:alert(1)'})).status,400);
  assert.equal((await save('updates',{...samples.updates,id:'bad-date',date:'2026-02-30'})).status,400);
  assert.equal((await save('overview',{...samples.overview,id:'cross-site'},0,false,'https://other.test')).status,403);
});
test('missing production storage never reports a browser-only save as shared',async()=>{
  const response=await onRequest({env:{},request:new Request('https://wiki.test/api/content',{method:'POST',headers:{Origin:'https://wiki.test','Content-Type':'application/json'},body:'{}'})});
  assert.equal(response.status,503);assert.match((await response.json()).error,/GitHub file saving/);
});

test('file saves survive a new server store instance',async()=>{
  const reloaded=localFileStore(file);
  const {state}=await reloaded.read();
  assert.equal(state.records.biweekly['test-biweekly'].deleted,true);
});
test('simultaneous unrelated saves retry without losing either entry',async()=>{
  const results=await Promise.all([save('overview',{id:'concurrent-a',title:'A',description:'A'}),save('overview',{id:'concurrent-b',title:'B',description:'B'})]);
  assert.deepEqual(results.map(r=>r.status),[200,200]);
  const {data}=await get();assert.ok(data.overview.some(r=>r.id==='concurrent-a'));assert.ok(data.overview.some(r=>r.id==='concurrent-b'));
});

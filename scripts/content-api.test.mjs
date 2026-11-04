import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {onRequest} from '../functions/api/content.js';
import {sqliteBinding} from './preview.mjs';
const db=new DatabaseSync(':memory:');
const env={WIKI_DB:sqliteBinding(db)};
const get=async()=>{const response=await onRequest({request:new Request('https://wiki.test/api/content'),env});return response.json();};
const save=(collection,record,revision=0,deleted=false,origin='https://wiki.test')=>onRequest({env,request:new Request('https://wiki.test/api/content',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({collection,record,revision,deleted})})});
const samples={
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
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM wiki_revisions WHERE collection=? AND id=?').get(type,initial.id).n,3);
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
  assert.equal(response.status,503);assert.match((await response.json()).error,/not connected/);
});

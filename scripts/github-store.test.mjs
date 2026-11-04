import test from 'node:test';
import assert from 'node:assert/strict';
import {githubStore} from '../server/github-store.js';
import {encodeRecord} from '../src/member-publishing.js';

test('GitHub file store decodes Unicode and uses the exact current file version',async()=>{
  const state={records:{overview:{test:{data:{title:'進度 → FPGA'},revision:1,deleted:false}}}};
  const calls=[];
  const store=githubStore('server-only-secret',async(url,options)=>{
    calls.push({url,options});
    if(calls.length===1)return {ok:true,json:async()=>({encoding:'base64',sha:'current-file-sha',content:encodeRecord(state)})};
    return {ok:true};
  });
  assert.deepEqual(await store.read(),{state,version:'current-file-sha'});
  assert.equal(await store.write(state,'current-file-sha'),true);
  assert.equal(calls[1].url,'https://api.github.com/repos/PlutoPuppy/vit-fpga-wiki/contents/content/live-state.json');
  const body=JSON.parse(calls[1].options.body);assert.equal(body.sha,'current-file-sha');assert.equal(body.branch,'main');
  assert.deepEqual(JSON.parse(Buffer.from(body.content,'base64').toString('utf8')),state);
  assert.ok(!calls[1].options.body.includes('server-only-secret'));
});
test('first save creates the file; conflicts are retried and denied writes fail',async()=>{
  const store=githubStore('test',async()=>({status:404,ok:false}));assert.deepEqual(await store.read(),{state:{records:{}},version:null});
  for(const status of [409,422])assert.equal(await githubStore('test',async()=>({ok:false,status})).write({records:{}},null),false);
  await assert.rejects(githubStore('test',async()=>({ok:false,status:403})).write({records:{}},null),/permissions/);
});

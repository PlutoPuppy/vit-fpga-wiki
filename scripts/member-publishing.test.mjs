import assert from 'node:assert/strict';
import test from 'node:test';
import { validateUpdate, encodeRecord, publishUpdate, signInWithGitHub } from '../src/member-publishing.js';

const input = { memberId:'member-sy', date:'2026-11-03', title:'MNN integration', update:'Measured QK → FPGA; 下一步', links:[{label:'Report',url:'https://example.com/report'}] };
const record = {...input,id:'update-member-sy-test',createdAt:'2026-11-03T20:00:00Z'};

test('validates member, actual calendar dates and evidence URL protocol', () => {
  assert.equal(validateUpdate(input,['member-sy']).title,input.title);
  for (const change of [{memberId:'unknown'},{date:'2026-02-30'},{title:' '},{update:''},{links:[{url:'javascript:alert(1)'}]}]) {
    assert.throws(()=>validateUpdate({...input,...change},['member-sy']));
  }
});

test('creates an append-only Unicode JSON entry on main and returns the commit', async () => {
  let calls=0;
  const result = await publishUpdate('test-token',record,async (url,options) => {
    calls++;
    assert.equal(url,'https://api.github.com/repos/PlutoPuppy/vit-fpga-wiki/contents/content/updates/update-member-sy-test.json');
    assert.equal(options.method,'PUT');
    const payload=JSON.parse(options.body);
    assert.equal(payload.branch,'main');
    assert.equal(payload.sha,undefined);
    assert.deepEqual(JSON.parse(Buffer.from(payload.content,'base64').toString('utf8')),record);
    return {ok:true,json:async()=>({commit:{sha:'abc123',html_url:'https://github.com/commit/abc123'}})};
  });
  assert.equal(calls,1);
  assert.equal(result.sha,'abc123');
});

test('retries an already-created identical entry without replacing its history', async () => {
  const responses=[{ok:false,status:422},{ok:true,json:async()=>({content:encodeRecord(record)+'\n',html_url:'https://github.com/file'})}];
  const methods=[];
  const result=await publishUpdate('test-token',record,async (url,options)=>{methods.push(options.method || 'GET');return responses.shift();});
  assert.deepEqual(methods,['PUT','GET']);
  assert.equal(result.existing,true);
});

test('permission failures and conflicting contents are not reported as published', async () => {
  await assert.rejects(publishUpdate('test-token',record,async()=>({ok:false,status:403})),/write access/);
  await assert.rejects(publishUpdate('test-token',record,async()=>({ok:false,status:401})),/expired/);
  const replies=[{ok:false,status:422},{ok:true,json:async()=>({content:btoa('different')})}];
  await assert.rejects(publishUpdate('test-token',record,async()=>replies.shift()),/did not confirm/);
});

test('OAuth accepts only the sign-in popup on the same origin and completes the editor handshake', async () => {
  const originalWindow=globalThis.window, originalLocation=globalThis.location;
  let receive;
  const popup={closed:false,close(){this.closed=true;},postMessage(message,origin){assert.equal(message,'authorizing:github');assert.equal(origin,'https://wiki.example');}};
  globalThis.location={origin:'https://wiki.example',hostname:'wiki.example'};
  globalThis.window={open:()=>popup,addEventListener:(name,handler)=>{receive=handler;},removeEventListener:()=>{}};
  try {
    const pending=signInWithGitHub();
    receive({origin:'https://untrusted.example',source:popup,data:'authorization:github:success:{"token":"wrong"}'});
    receive({origin:'https://wiki.example',source:{},data:'authorization:github:success:{"token":"wrong"}'});
    receive({origin:'https://wiki.example',source:popup,data:'authorizing:github'});
    receive({origin:'https://wiki.example',source:popup,data:'authorization:github:success:{"token":"test-token"}'});
    assert.equal(await pending,'test-token');
    assert.equal(popup.closed,true);
  } finally {globalThis.window=originalWindow;globalThis.location=originalLocation;}
});

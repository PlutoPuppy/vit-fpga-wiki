import test from 'node:test';
import assert from 'node:assert/strict';
import {validateMeeting,publishMeeting} from '../src/meeting-publishing.js';
import {encodeRecord} from '../src/member-publishing.js';

const record={id:'meeting-test',title:'Integration sync',type:'internal',date:'2026-11-03',time:'16:00',notes:'Decisions → next steps',attendees:[],actionItems:[]};
test('validates meeting category, calendar date and time',()=>{
  assert.equal(validateMeeting(record).timezone,'America/Toronto');
  for(const change of [{title:''},{type:'other'},{date:'2026-02-30'},{time:'25:00'}])assert.throws(()=>validateMeeting({...record,...change}));
});
test('new meeting creates a JSON file without overwriting an existing meeting',async()=>{
  let calls=0;
  await publishMeeting('test',record,null,async(url,options)=>{
    calls++;if(calls===1)return {ok:false,status:404};
    assert.equal(options.method,'PUT');const body=JSON.parse(options.body);assert.equal(body.sha,undefined);
    assert.deepEqual(JSON.parse(Buffer.from(body.content,'base64').toString('utf8')),record);
    return {ok:true,json:async()=>({commit:{html_url:'https://github.com/commit/test'}})};
  });assert.equal(calls,2);
});
test('editing uses current file SHA and rejects concurrent edits',async()=>{
  const changed={...record,notes:'New notes'};let calls=0;
  await publishMeeting('test',changed,record,async(url,options)=>{
    calls++;if(calls===1)return {ok:true,json:async()=>({sha:'current-sha',content:encodeRecord(record)})};
    assert.equal(JSON.parse(options.body).sha,'current-sha');return {ok:true,json:async()=>({commit:{html_url:'https://github.com/commit/test'}})};
  });
  await assert.rejects(publishMeeting('test',changed,record,async()=>({ok:true,json:async()=>({content:encodeRecord({...record,notes:'Another member changed this'})})})),/changed on GitHub/);
});
test('permission failures and expired login retain a clear failure result',async()=>{
  await assert.rejects(publishMeeting('test',record,null,async()=>({ok:false,status:401})),/expired/);
  let calls=0;await assert.rejects(publishMeeting('test',record,null,async()=>++calls===1?{ok:false,status:404}:{ok:false,status:403}),/write access/);
});

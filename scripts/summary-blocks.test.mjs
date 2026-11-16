import test from 'node:test';
import assert from 'node:assert/strict';
import {newSummaryBlock,sortSummaryBlocks,localSummaryBlocks,saveLocalSummary} from '../src/summary-blocks.js';

test('each creation gets a separate block and leaves existing summaries untouched',()=>{
  const existing=[{id:'progress-summary',body:'Original team notes'},{id:'summary-week-2026-11-16',body:'Existing weekly notes'}];
  const before=structuredClone(existing);
  const first=newSummaryBlock(new Date('2026-11-16T17:00:00Z'));
  const second=newSummaryBlock(new Date('2026-11-16T17:00:01Z'));
  assert.notEqual(first.id,second.id);
  assert.equal(first.body,'');assert.equal(first.date,'2026-11-16');
  const all=sortSummaryBlocks([...existing,first,second]);
  assert.equal(all.length,4);assert.equal(all[0].id,second.id);
  assert.deepEqual(existing,before);
});

test('browser-only blocks persist independently and editing one preserves the other',()=>{
  const memory=new Map();const storage={getItem:key=>memory.get(key)||null,setItem:(key,value)=>memory.set(key,value)};
  const first=saveLocalSummary(newSummaryBlock(new Date('2026-11-16T17:00:00Z'),'first'),{},storage).record;
  const second=saveLocalSummary(newSummaryBlock(new Date('2026-11-16T17:00:01Z'),'second'),{},storage).record;
  saveLocalSummary({...first,body:'New notes'},{},storage);
  assert.equal(localSummaryBlocks(storage).length,2);
  assert.equal(localSummaryBlocks(storage).find(r=>r.id===first.id).body,'New notes');
  assert.deepEqual(localSummaryBlocks(storage).find(r=>r.id===second.id),second);
  assert.throws(()=>saveLocalSummary({...first,body:'Stale notes'},{},storage),/changed/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareProjectUpdate} from '../src/project-updates.js';

const input={memberId:'member-wn',date:'2026-11-03',title:'NEON result',update:'Measured CPU throughput.',category:'Result',measurement:'692 million arithmetic operations per second',context:'Setup pending',links:[]};
test('project entries preserve measurement units and member history ownership',()=>{
  const result=prepareProjectUpdate(input,['member-wn'],'update-project-test','2026-11-03T20:00:00Z');
  assert.equal(result.scope,'project');assert.equal(result.memberId,'member-wn');assert.equal(result.measurement,input.measurement);assert.equal(result.category,'Result');assert.equal(result.context,'Setup pending');
});
test('category, owner and unsafe links are rejected before publication',()=>{
  for(const changes of [{category:'invalid'},{memberId:'unknown'},{links:[{url:'javascript:alert(1)'}]},{measurement:'x'.repeat(201)}])assert.throws(()=>prepareProjectUpdate({...input,...changes},['member-wn'],'update-test','now'));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {newestBiweeklyFirst} from '../src/biweekly.js';
import {validateContent} from '../src/content-model.js';
test('newest report date is first without reordering stored records',()=>{
  const entries=[{id:'old',date:'2026-11-03'},{id:'new',date:'2026-11-17'},{id:'middle',date:'2026-11-10'}];
  assert.deepEqual(newestBiweeklyFirst(entries).map(r=>r.id),['new','middle','old']);
  assert.equal(entries[0].id,'old');
});
test('single report preserves four independent teammate inputs',()=>{
  const report={id:'team-report',title:'Biweekly progress',date:'2026-11-17',jerry:'Matmul update',stephanie:'MNN update',tiffany:'Camera update',winnie:'Softmax update'};
  assert.deepEqual(validateContent('biweekly',report),report);
  assert.throws(()=>validateContent('biweekly',{id:'empty',title:'Empty',date:'2026-11-17'}),/at least one teammate/);
  assert.throws(()=>validateContent('biweekly',{...report,date:'2026-02-30'}),/date/);
});

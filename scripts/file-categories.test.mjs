import assert from 'node:assert/strict';
import {fileCategory, filterFiles, isArchived, visibleFiles} from '../src/file-categories.js';
const cases = [
 [{id:'proposal'}, 'ECE496 Deliverables'],
 [{id:'softmax-layernorm-results',category:'Performance & Benchmarks'}, 'Nonlinear Units'],
 [{id:'tiffany-cpu-live-demo',url:'/files/demo.mp4'}, 'Camera Integration'],
 [{id:'old',status:'Superseded'}, 'Other'],
 [{id:'quartus-resource-utilization',title:'Systolic array'}, 'Matmul'],
 [{id:'cpu-baseline'}, 'Matmul'],
 [{id:'matmul-tile-sweep-80mhz'}, 'Matmul'],
 [{id:'mnn-integration-report'}, 'MNN'],
 [{id:'tinyvit-5m-90mhz-resources'}, 'MNN'],
 [{id:'tiffany-tinyvit-fp32-accuracy'}, 'MNN'],
 [{id:'tiffany-tinyvit-5m-camera-latency'}, 'Camera Integration'],
 [{id:'presentation',title:'TinyViT presentation'}, 'ECE496 Deliverables'],
 [{category:'Other',title:'Timing'}, 'Other']
];
for(const [file,expected] of cases) assert.equal(fileCategory(file),expected);
const files=cases.map(([file])=>file);
assert.equal(filterFiles(files).length,files.length);
assert.equal(filterFiles(files,'Matmul').length,3);
assert.equal(filterFiles(files,'Nonlinear Units').length,1);

const mixed = [
 {id:'softmax-current'},
 {id:'softmax-old',archived:true},
 {id:'matmul-old',archived:true},
 {id:'gelu-historical',title:'Historical GELU',archived:false}
];
assert.equal(fileCategory(mixed[1]),'Nonlinear Units');
assert.equal(isArchived(mixed[3]),false);
assert.deepEqual(visibleFiles(mixed,'Nonlinear Units',true),[mixed[1]]);
assert.deepEqual(visibleFiles(mixed,'Matmul',true),[mixed[2]]);
assert.deepEqual(visibleFiles(mixed,'Nonlinear Units'),[mixed[0],mixed[3]]);
assert.equal(visibleFiles(mixed,'All',true).length,2);

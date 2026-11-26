import assert from 'node:assert/strict';
import {fileCategory, filterFiles} from '../src/file-categories.js';
const cases = [
 [{id:'proposal'}, 'ECE496 Deliverables'],
 [{id:'softmax-layernorm-results',category:'Performance & Benchmarks'}, 'Nonlinear Units'],
 [{id:'tiffany-cpu-live-demo',url:'/files/demo.mp4'}, 'Camera Integration'],
 [{id:'old',status:'Superseded'}, 'Archive'],
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

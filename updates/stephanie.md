# Stephanie (Yixin) — status updates

[All member logs](README.md)

| Date | Update | Links |
| --- | --- | --- |
| 2026-11-26 | 90 MHz TinyViT-5M: 706.09 ms warm mean; 1.689× vs FP32 and 1.456× vs mixed CPU. Same 200 labeled images: 153/200, 155/200, 154/200 correct. FPGA runs 40 static-weight GEMMs in 454 jobs, with eight resident MLP pairs; dynamic attention stays on HPS. | [Detailed tables and overview](#/files/tinyvit-5m-90mhz-timing-2026-11-26) |
| 2026-11-03 | Report-confirmed: TinyViT runs with /layers.3/blocks.1/attn/MatMul_output_0 offloaded to Jerry’s 16×16 array. Inputs [1,10,49,32] × [1,10,32,49] use 320 padded 16×16×16 PIO jobs; reduction tiles are accumulated on the CPU. The final full-SoC image runs at 80 MHz. Two synthetic inputs completed; six physical matrix smoke cases passed. Single-run end-to-end timings were 5.74% faster for zeros and 2.71% slower for nonuniform input, so consistent speedup and dataset accuracy remain unproven. Next: repeated matched CPU/offload runs, overhead profiling, real-image numerical checks, then evaluate additional offloads. Implementation-plan ownership also includes design alternatives and the Jan–Feb matched MNN baseline. | [Evidence / plan](https://github.com/PlutoPuppy/mnn-fpga/blob/main/docs/tinyvit-fpga-integration-report.md) |

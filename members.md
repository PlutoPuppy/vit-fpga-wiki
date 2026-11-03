# Member progress and tasks

Updated 2026-11-03. See [implementation progress and evidence](progress-2026-11-03.md). Original research tasks are retained. Add dated progress and evidence links in [member update logs](updates/README.md).

## Jerry (Chenjia) — Hardware Architect

Designing the FPGA datapath, memory hierarchy, and systolic array for attention computation.

| Task | Status | Tag |
| --- | --- | --- |
| Review papers on ViT on FPGA architecture papers | in-progress | Literature |
| Implement contiguous host address remapping and tiled output canvas | done | Implementation |
| Implement host software tiling and contraction accumulation tests | done | Implementation |
| Validate tiled canvas on board and resolve DMA address-window limits | in-progress | Experiment |

## Stephanie (Yixin) — ML Model Engineer

Responsible for ViT model design, quantization experiments, and accuracy benchmarking.

| Task | Status | Tag |
| --- | --- | --- |
| Write model compression section of report | todo | Design |
| Benchmark accuracy vs. bit-width trade-off | todo | Experiment |
| Survey ViT model variants (DeiT, Swin, CvT) | in-progress | Literature |
| Review papers on ViT model | in-progress | Literature |
| Find tinest ViT model | todo | Design |

## Tiffany (Yiling) — HLS/RTL Developer

Writing HLS kernels and RTL modules for the attention and FFN layers.

| Task | Status | Tag |
| --- | --- | --- |
| Write HLS kernel for multi-head attention | in-progress | Implementation |
| Implement layer normalization in RTL | todo | Implementation |
| Research FPGA kernel script for transformers | in-progress | Literature |

## Winnie (Weini) — Systems & Integration

Handling end-to-end integration, board bring-up, and performance profiling on the FPGA.

| Task | Status | Tag |
| --- | --- | --- |
| Integrate HLS IP cores into top-level design | todo | Integration |
| Set up Vivado project and constraints | todo | Setup |
| Research end-to-end implementation of vision transformer on FPGA | in-progress | Literature |
| Implement int8 GELU LUT and same-scale bias/GELU RTL tests | done | Implementation |
| Validate parallel bias/GELU readout integration on full SoC | in-progress | Integration |
| Capture TinyViT attention reference and select fixed-point softmax contract | done | Experiment |
| Verify standalone softmax RTL and close standalone Quartus timing near 90 MHz | done | Implementation |
| Integrate softmax accelerator interface and verify full-SoC timing | todo | Integration |

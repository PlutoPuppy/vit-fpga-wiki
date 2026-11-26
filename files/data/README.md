# Experiment data

Add small CSV/JSON results here or link externally hosted data in the [files index](../README.md). For each dataset, record owner, capture date, source commit, hardware/model configuration, units, reproduction command, split (if applicable), and a checksum/version for external files.

## TinyViT-5M at 90 MHz — 2026-11-26

Owner: Stephanie (Yixin) Zha. Board: DE1-SoC, 90 MHz fitted accelerator. Model: TinyViT-5M at 224×224, batch one, two Cortex-A9 threads. Warm timing uses the same 20 uniform-random RGB input hashes for the three pipelines; each timed full forward follows one untimed forward. Operator breakdown comes from separate profiled first forwards. Top-1 counts use the same 200 labeled images. Source commit, exact reproduction command, image hashes, and split manifest were not supplied with this update.

- [Full pipeline timing and accuracy](tinyvit-5m-90mhz-timing-2026-11-26.csv) (ms/image, correct images out of 200)
- [FPGA/HPS operation placement](tinyvit-5m-90mhz-placement-2026-11-26.csv)
- [Latest fitted FPGA resources](tinyvit-5m-90mhz-resources-2026-11-26.csv)
- [Offload overview figure](vit-offload-overview.png)

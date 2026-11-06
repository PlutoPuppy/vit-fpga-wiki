# ECE496 files and data

Shared index for course deliverables, presentation material, experiment data and demos. The supplied files below are stored in this repo. Their filenames do not verify submission or approval; mark submission status only after confirmation and add a receipt/link when available.

| File | Category | Added | Submission status |
| --- | --- | --- | --- |
| [Project proposal](submissions/ece496-project-proposal.pdf) | submissions | 2026-11-03 | Reference copy; submission unconfirmed |
| [ECE496 Capstone](submissions/ece496-capstone.pdf) | submissions | 2026-11-03 | Reference copy; submission unconfirmed |
| [TinyViT DE1-SoC final presentation](presentations/tinyvit-de1-soc-final-presentation.pdf) | presentations | 2026-11-03 | Reference copy; submission unconfirmed |
| [ViT-FPGA poster reference](posters/vit-fpga-poster-reference.png) | posters | 2026-11-03 | Reference copy; submission unconfirmed |

## Add a file or dataset

1. Put modest-sized files in the appropriate folder: `submissions/`, `presentations/`, `posters/`, `data/` or `videos/`.
2. Add a row below with date, owner, description, version/submission status and a relative link or a shared Drive/repository URL.
3. Link the entry from your [member update](../updates/README.md) and relevant [meeting notes](../meetings.md).

For large datasets, checkpoints and videos, keep the content in shared storage and record an accessible URL, version/checksum and reproduction instructions here. Do not commit credentials, private personal information or raw machine-specific paths.

| Date | Owner | Description / version | Status | File or shared link |
| --- | --- | --- | --- | --- |
| 2026-11-05 | Jerry | Matmul throughput, CPU baseline vs systolic array, N = 64–512 | Measured on DE1-SoC | [data/matmul-throughput-2026-11-05.csv](data/matmul-throughput-2026-11-05.csv) |
| 2026-11-05 | Jerry | Systolic array build: Quartus fitter resource utilization summary (ALMs 74%, block memory 53%, DSP 2%) | Quartus fitter summary | Table on the wiki Files & Data tab |
| 2026-11-05 | Jerry | Matmul performance analysis summary: tiling schemes, density, peak vs achieved throughput | Summary | [j3rryhu/matmul-accel](https://github.com/j3rryhu/matmul-accel) (PERF_ANALYSIS.md) |

## Experiment data

Use [data/](data/README.md) for measured results and dataset manifests. Record the commit, board/model configuration, commands, units and calibration/validation split so another member can reproduce the result.

## Demo videos

Use [videos/](videos/README.md) to index selected demos. The local Videos folder was not uploaded wholesale; add the specific demos the team chooses to share.

# Demo videos

Add selected small demos here, or add shared video URLs to the [files index](../README.md). Record capture date, owner, source commit, board setup and what the demo establishes. Keep large recordings in shared storage accessible to all members.

## Tiffany — USB camera and CPU-only live classification

[Watch or download the demo](tiffany-cpu-live-demo.mp4).

- Owner: Tiffany (Yiling). Added: 2026-11-17. Exact capture date and source commit were not recorded.
- Setup: Arducam-1080P-HDR USB camera connected to DE1-SoC Linux; TinyViT inference on the ARM Cortex-A9 HPS; camera feed and predicted class labels displayed on Windows.
- This earlier recording uses Windows preprocessing. It demonstrates USB capture and CPU-only live inference, rather than verifying the subsequent HPS-local preprocessing work or hybrid FPGA integration.
- Next: integrate the team’s hybrid CPU–FPGA pipeline and measure latency by processing stage.

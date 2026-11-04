# Winnie (Weini) — status updates

[All member logs](README.md) · [Meetings](../meetings.md)

## 2026-11-04

- SIMD: On the Cortex-A9, 32×32 int8 matmul took 94.67 µs with NEON versus 202.12 µs in plain C (2.13× faster), with matching results. Used GCC -O3, 1,000 warmups and 10,000 timed runs.
- Softmax: Implemented 16-bit fixed-point softmax for up to 196 values using 33-cycle unsigned restoring division. All 147 rows / 8,666 outputs matched Python exactly; standalone timing passed 90 MHz using 222 ALMs and 10 M10Ks. Next: matmul integration and full-system testing.
- GELU: Bias + GELU is connected to accel_top’s CPU output-read path, processing 16 int8 lanes with a 256-byte bias buffer. Standalone timing passes 90 MHz; logic usage fell from 1,707 to 957 ALMs.

## Earlier updates

| Date | Update | Links |
| --- | --- | --- |
| 2026-11-03 | Completed softmax reference, fixed-point baseline, bit-exact standalone RTL verification and standalone timing near 90 MHz. Bias/GELU readout prototype implemented. Next: reconcile with tiled matmul, calibrate scales and validate the full SoC. | [Implementation evidence](../progress-2026-11-03.md) |

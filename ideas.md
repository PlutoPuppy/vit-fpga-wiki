# Brainstorm ideas

## Use INT4 mixed-precision quantization

Apply INT4 for weights and INT8 for activations to reduce model size by 2x while maintaining accuracy within 2% of FP32 baseline.

- Author: Stephanie (Yixin)
- Category: Optimization
- Votes at capture: 16
- Pinned: yes

## Tile-based attention computation

Partition the attention matrix into tiles that fit in on-chip BRAM to avoid expensive DRAM accesses during the softmax computation.

- Author: Jerry (Chenjia)
- Category: Architecture
- Votes at capture: 6
- Pinned: yes

## Project Title and Project Description

Project Title (options)
1. ViT-FPGA: Hybrid HPS–FPGA Vision Transformer Accelerator on DE1-SoC
2. Edge Vision Transformer Acceleration on FPGA with ARM HPS Co-Design
3. TinyViT Hardware Acceleration on DE1-SoC Using Hybrid CPU–FPGA Architecture
4. A Hybrid FPGA–HPS Architecture for Efficient Vision Transformer Inference

This capstone project implements a lightweight Vision Transformer (ViT / TinyViT) inference accelerator on the Intel DE1-SoC platform, using a hybrid architecture that combines the ARM Cortex-A9 Hard Processor System (HPS) with FPGA fabric.

The system offloads compute-intensive operations such as matrix multiplications in attention and MLP blocks to custom FPGA kernels, while the HPS manages high-level control flow, memory orchestration, and system integration. Model parameters and intermediate activations are primarily stored in external DDR3 memory on the HPS side, with FPGA-side SDRAM used as a low-latency cache for acceleration kernels. Data movement is coordinated via DMA between memory hierarchies.

The design explores system-level challenges in mapping transformer workloads onto heterogeneous hardware, including memory placement, bandwidth constraints, and efficient execution of attention mechanisms. Input images are acquired via either USB camera (HPS-managed Linux pipeline) or GPIO camera module (FPGA direct interface), with system-level trade-offs evaluated.

The project aims to demonstrate a scalable hardware–software co-design approach for deploying transformer-based vision models on resource-constrained FPGA platforms, with a focus on TinyViT inference and system integration rather than full training support.

- Author: Winnie
- Category: Other
- Votes at capture: 2
- Pinned: yes

## Pipelined HLS design for FFN layers

Use HLS PIPELINE pragma with II=1 to fully pipeline the feed-forward network layers, maximizing throughput.

- Author: Tiffany (Yiling)
- Category: Optimization
- Votes at capture: 7
- Pinned: no

## Explore Swin Transformer for local attention

Swin's window-based attention has O(n) complexity vs O(n²) for standard ViT. Could significantly reduce hardware resource requirements.

- Author: Stephanie (Yixin)
- Category: Research Direction
- Votes at capture: 5
- Pinned: no

## Double-buffering for weight loading

Pre-fetch the next layer's weights while computing the current layer to hide DRAM latency.

- Author: Winnie
- Category: Systems
- Votes at capture: 3
- Pinned: no

## Compare ZCU104 vs Alveo U250 targets

Evaluate whether the embedded ZCU104 or the datacenter Alveo U250 better fits our latency/power budget.

- Author: Jerry (Chenjia)
- Category: Research Direction
- Votes at capture: 2
- Pinned: no

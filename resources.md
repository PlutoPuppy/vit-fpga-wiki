# Research resources

External resources are linked, not copied. Descriptions and citation counts reflect the site at capture time.

## [Swin Transformer: Hierarchical Vision Transformer using Shifted Windows](https://arxiv.org/abs/2103.14030)

- Type: paper
- Authors: Liu et al.
- Year: 2021
- Venue: ICCV 2021
- Citations: 22000
- Tags: Swin, ViT, Object Detection

Introduces shifted window attention for linear complexity, enabling ViT to scale to high-resolution images and dense prediction tasks.

## [Training data-efficient image transformers & distillation through attention (DeiT)](https://arxiv.org/abs/2012.12877)

- Type: paper
- Authors: Touvron et al.
- Year: 2021
- Venue: ICML 2021
- Citations: 7800
- Tags: DeiT, ViT, Distillation

Shows ViT can be trained efficiently on ImageNet alone using knowledge distillation, making it practical without massive pre-training datasets.

## [FlightLLM: Efficient Large Language Model Inference with a Complete Mapping Flow on FPGAs](https://arxiv.org/abs/2401.03868)

- Type: paper
- Authors: Zeng et al.
- Year: 2024
- Venue: FPGA 2024
- Citations: 85
- Tags: FPGA, Transformer, LLM, Acceleration

Recent work mapping transformer-based LLMs to FPGAs with custom sparse computation and memory optimization. Highly relevant to our ViT acceleration work.

## [FPGA Design for AI Inference — Xilinx Developer Series](https://www.youtube.com/watch?v=example-xilinx)

- Type: video
- Authors: Xilinx/AMD
- Year: 2023
- Venue: YouTube
- Tags: FPGA, Vitis AI, Xilinx, Tutorial

Practical walkthrough of deploying neural networks on Xilinx FPGAs using Vitis AI, covering quantization, compilation, and board deployment.

## [A Survey of Quantization Methods for Efficient Neural Network Inference](https://arxiv.org/abs/2103.13630)

- Type: survey
- Authors: Gholami et al.
- Year: 2022
- Venue: Low-Power Computer Vision
- Citations: 2100
- Tags: Quantization, Efficiency, Survey

Comprehensive survey of neural network quantization techniques including post-training quantization, quantization-aware training, and mixed-precision methods.

## [Auto-ViT-Acc: An FPGA-Aware Automatic Acceleration Framework for Vision Transformer with Mixed-Scheme Quantization](https://arxiv.org/abs/2208.05163)

- Type: paper
- Authors: Li et al.
- Year: 2022
- Venue: FPL 2022
- Citations: 52
- Tags: ViT, FPGA, Quantization, AutoML

Directly relevant: proposes an automated framework for ViT acceleration on FPGAs with mixed-precision quantization and hardware-aware NAS.

## [Efficient Processing of Deep Neural Networks: A Tutorial and Survey](https://arxiv.org/abs/1703.09039)

- Type: survey
- Authors: Sze et al.
- Year: 2017
- Venue: Proceedings of the IEEE
- Citations: 4200
- Tags: Hardware, DNN, Survey, FPGA

Essential survey covering DNN hardware acceleration fundamentals: dataflows, memory hierarchies, and hardware architectures for efficient inference.

## [Vitis HLS User Guide (UG1399)](https://docs.xilinx.com/r/en-US/ug1399-vitis-hls)

- Type: tutorial
- Authors: AMD/Xilinx
- Year: 2024
- Venue: AMD Documentation
- Tags: HLS, Vitis, FPGA, Xilinx

Official Vitis HLS documentation covering pragmas, directives, dataflow optimization, and best practices for high-performance HLS design.

## [H2PIPE](https://ieeexplore.ieee.org/document/10705520)

- Type: professor_suggested
- Year: 2024
- Tags: CNN, Accelerator

a CNN accelerator that uses a dataflow pipeline (done in Professor Betz's group, and the latest in a few related works), this accelerator style will be harder to make work for a transformer though.

## [Stay Flexible: A High-Performance FPGA NPU Overlay for Graph Neural Networks](https://ieeexplore.ieee.org/document/10653661)

- Type: professor_suggested
- Year: 2026
- Tags: NPU, Overlay, Big soft processor

The latest version of the NPU (again in Professor Betz's  group, and you can see earlier publications in its references).  It is an overlay architecture, meaning a very customized and big soft processor. This style is more likely to work well for a transformer.

## [EfficientML.ai Lecture 14 - Vision Transformer (MIT 6.5940, Fall 2023)](https://www.youtube.com/watch?v=QQY24LLww1A)

- Type: professor_suggested
- Year: 2023
- Tags: EfficientML, Lecture, MIT

Here's a (fairly advanced) lecture on vision transformers, by Song Han at MIT. He has lots of interesting work on efficient machine learning.

## [Via: A novel vision-transformer accelerator based on fpga](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=9925700&casa_token=pNU6IYcsS8cAAAAA:zRa3t3Yv2UTF04NGmiMFDgaOvhpx5I79yLFz1laxWWrhcJB3Qrgcp2jQqHjJz5jMwBNN73s&tag=1)

- Type: paper
- Year: 2022
- Venue: IEEE TRANSACTIONS ON COMPUTER-AIDED DESIGN OF INTEGRATED CIRCUITS AND SYSTEMS

## [ViTA: A Vision Transformer Inference Accelerator for Edge Applications](https://ieeexplore.ieee.org/stamp/stamp.jsp?arnumber=10181988&casa_token=4wo5GUU6KMIAAAAA:dSceV-_emmsUe1waW5UcIWTJlDY16kSHGnUgYQv3IL8iFzmWOSczd6hHU2AJFNFVXaX9uC4&tag=1)

- Type: paper
- Year: 2026
- Venue: International Symposium on Circuits and Systems (ISCAS)

## [TinyViT: Fast Pretraining Distillation for Small Vision Transformers](https://arxiv.org/pdf/2207.10666)

- Type: paper
- Authors: Kan Wu
- Year: 2022
- Tags: TinyVit

## [ECE 496 Google Doc](https://docs.google.com/document/d/1rzoD5uaHx6eHtwjC7iO8V2uMHI0IuO3Lc4c0s0EbQGo/edit?tab=t.0#heading=h.vs7flwfljdy)

- Type: professor_suggested
- Authors: Winnie
- Year: 2026

Google doc for meeting notes and discussions

## [System design overview](https://docs.google.com/document/d/1kGxiiMsGCOjVbayIFGQPFHSsg0821qYdzSSapLeGEc0/edit?tab=t.0)

- Type: professor_suggested
- Year: 2026

An overview of the top level, and stuff to consider.

## [TinyViT profile result](https://docs.google.com/document/d/1KoH7_UW9SyBB5S42OjZRhV3WC4_3CwzzlBjB2msZl8Q/edit?tab=t.0)

- Type: professor_suggested
- Year: 2026
- Tags: Profile

## [Project Title and Project Description](https://docs.google.com/document/d/1rzoD5uaHx6eHtwjC7iO8V2uMHI0IuO3Lc4c0s0EbQGo/edit?tab=t.114s0sy95bn9)

- Type: professor_suggested
- Authors: 2026
- Year: 2026

Project Title (options)
ViT-FPGA: Hybrid HPS–FPGA Vision Transformer Accelerator on DE1-SoC
Edge Vision Transformer Acceleration on FPGA with ARM HPS Co-Design
TinyViT Hardware Acceleration on DE1-SoC Using Hybrid CPU–FPGA Architecture
A Hybrid FPGA–HPS Architecture for Efficient Vision Transformer Inference

This capstone project implements a lightweight Vision Transformer (ViT / TinyViT) inference accelerator on the Intel DE1-SoC platform, using a hybrid architecture that combines the ARM Cortex-A9 Hard Processor System (HPS) with FPGA fabric.

The system offloads compute-intensive operations such as matrix multiplications in attention and MLP blocks to custom FPGA kernels, while the HPS manages high-level control flow, memory orchestration, and system integration. Model parameters and intermediate activations are primarily stored in external DDR3 memory on the HPS side, with FPGA-side SDRAM used as a low-latency cache for acceleration kernels. Data movement is coordinated via DMA between memory hierarchies.

The design explores system-level challenges in mapping transformer workloads onto heterogeneous hardware, including memory placement, bandwidth constraints, and efficient execution of attention mechanisms. Input images are acquired via either USB camera (HPS-managed Linux pipeline) or GPIO camera module (FPGA direct interface), with system-level trade-offs evaluated.

The project aims to demonstrate a scalable hardware–software co-design approach for deploying transformer-based vision models on resource-constrained FPGA platforms, with a focus on TinyViT inference and system integration rather than full training support.

## [Full Stack Optimization of Transformer Inference: a Survey](https://arxiv.org/pdf/2302.14017)

- Type: professor_suggested
- Authors: Keutzer and team
- Year: 2026
- Venue: arxiv, probably published somewhere too
- Tags: Transformer, Hardware

## [Accelerating ViT Inference on FPGA through Static and Dynamic Pruning](https://arxiv.org/pdf/2403.14047)

- Type: paper
- Authors: Viktor Prasanna and his group
- Year: 2024
- Venue: arxiv but probably published elsewhere
- Tags: FPGA, ViT

## [FlightLLM](https://arxiv.org/abs/2401.03868)

- Type: paper
- Year: 2026
- Venue: arxiv, think also FPGA Symp.
- Tags: FPGA, LLM, transformer

## [Auto-ViT-Acc: An FPGA-Aware Automatic Acceleration Framework for Vision Transformer with Mixed-Scheme Quantization](https://www.sfu.ca/~zhenman/files/C25-FPL2022-Auto-ViT-Acc.pdf)

- Type: paper
- Authors: Zhenman Fang's Group
- Year: 2022
- Venue: FPL
- Tags: FPGA, ViT

## [2026.7.18 meeting minutes](https://docs.google.com/document/d/1Wa3x-muSBlpOmgbmszMkLvWwfwzt3LOSMniCXFjvz3Q/edit?tab=t.0)

- Type: professor_suggested
- Year: 2026
- Tags: TODO list

# Member progress and current tasks

Updated 2026-11-03 from the implementation plan, Gantt schedule and integration evidence. [Dated updates](updates/README.md) · [Live Gantt chart](https://vit-fpga-wiki.pages.dev/#/gantt). Superseded tasks remain in content/tasks with archived=true and in the historical JSON snapshot.

## Jerry (Chenjia)

Designing the FPGA datapath, memory hierarchy, and systolic array for attention computation. As of 2026-11-03, main includes contiguous host address remapping, a tiled output canvas and a host software tiling test program (4b749ce). Latest tiled board pass logs are not included; DMA address-window limits remain documented. See progress-2026-11-03.md.

| Task | Status | Acceptance criteria / evidence |
| --- | --- | --- |
| Complete system diagram, interfaces and technical design section | in-progress | Own implementation-plan technical design, at most four pages; reconcile actual addresses, clocks and dimensions. |
| Validate full-canvas DMA reachability and buffer transfers | in-progress | Resolve canvas/window mismatch; test boundaries and compare PIO and DMA results before enabling DMA. |
| Contiguous host remapping and tiled output canvas | done | Implemented in matmul main 4b749ce; link regression results for subsequent changes. |
| Regress tiled accumulation, overwrite, tails and unaligned output | todo | Record board results against the blocked integer reference and prove no padding/spill corruption. |
| Maintain a reproducible 80 MHz full-SoC build | in-progress | Retain derived-clock constraints and matching bitstream/ABI; attach complete timing and resource reports. |

## Stephanie (Yixin)

MNN / FPGA integration and model evaluation. Selected attention MatMul offload runs at 80 MHz using 320 PIO jobs. Functional integration demonstrated on synthetic inputs; consistent speedup and dataset accuracy remain to be validated. Owns design alternatives and matched CPU/offload baselines.

| Task | Status | Acceptance criteria / evidence |
| --- | --- | --- |
| Validate real-image outputs and labeled-set accuracy | todo | Use identical preprocessing and inputs; report score error, top-k agreement and dataset accuracy separately. |
| Complete design alternatives and matched MNN baseline | in-progress | Compare chosen hybrid design against requirements; finish matched baseline during Jan–Feb Gantt window. |
| Repeat matched CPU/offload benchmarks with warm-up | in-progress | Alternate modes on identical inputs; record run counts, median, spread and configuration. Do not generalize single-run 5.74% result. |
| Run the selected attention MatMul through MNN and FPGA | done | Report records two synthetic model runs and six physical matrix smoke cases; selected operation only. |
| Profile quantization, PIO, compute/polling and host accumulation | todo | Measure each component before choosing DMA, operand reuse, larger tiles or additional offloads. |

## Tiffany (Yiling)

Owns camera/Linux integration (Nov–Jan), requirements traceability, Test and Verification, and the SyRs appendix. These are planned responsibilities; camera and verification completion awaits evidence.

| Task | Status | Acceptance criteria / evidence |
| --- | --- | --- |
| Bring up Linux UVC capture and save reproducible input frames | todo | Plan window Nov–Jan; document camera format, resolution, capture command and prerecorded fallback. |
| Connect captured frames to MNN preprocessing smoke test | todo | Check tensor shape, color order, normalization and repeatability before live inference. |
| Create requirement-to-test traceability matrix and SyRs appendix | todo | For each requirement record setup, condition, acceptance criterion, owner and evidence or planned test. |
| Write Test and Verification section and collect evidence | todo | At most two pages; distinguish planned tests, synthetic smoke tests, numerical agreement and accuracy. |

## Winnie (Weini)

Owns nonlinear interface integration, project status, schedule and report assembly. The implementation plan reports a GELU board-test pass; supporting logs still need linking. Softmax standalone RTL/timing passed near 90 MHz; full-SoC and MNN integration remains pending.

| Task | Status | Acceptance criteria / evidence |
| --- | --- | --- |
| Complete standalone GELU/bias and softmax RTL verification | done | Existing tests and standalone timing evidence; implementation plan reports GELU board pass with logs still to link. |
| Reconcile GELU readout with tiled canvas and scales | in-progress | Check bias row mapping, remapped RAM latency and activation only after final contraction; attach reported board-pass evidence. |
| Assemble implementation report, schedule and financial plan | in-progress | Own cover/status, Gantt and budget; check evidence, terminology and page limits; coordinate Mar–Apr report/demo work. |
| Verify nonlinear units in the 80 MHz full-SoC image | todo | Standalone 90 MHz timing is not combined-SoC sign-off; compare outputs, inspect timing and test board behavior. |
| Define and integrate score/probability interface with MNN | in-progress | Specify scaling, attention bias, widths, handshakes and P@V boundary; reconcile earlier 49-key experiment with the deployed model. |

---
name: ml-training-recipes
description: Battle-tested PyTorch training recipes for all domains — LLMs, vision, diffusion, medical imaging, protein/drug discovery, spatial omics, genomics. Covers training loops, optimizer selection (AdamW, Muon), LR scheduling, mixed precision, debugging, and systematic experimentation. Use when training or fine-tuning neural networks, debugging loss spikes or OOM, choosing architectures, or optimizing GPU throughput.
version: 1.0.0
author: dailycafi
license: MIT
tags: [PyTorch, Training, Optimization, LLM, Vision, Diffusion, Biomedical, Muon, AdamW, Debugging]
dependencies: [torch>=2.0.0]
---

# ML Training Recipes

Battle-tested patterns for PyTorch training across domains. Drawn from production codebases
(Karpathy's autoresearch/nanochat, torchvision, HuggingFace) and modern training practice.

## Reference files (read when needed)

- `references/architecture.md` — Transformer/LLM architecture code patterns, weight init
- `references/optimizers.md` — Muon, AdamW hybrid, per-group LR, compiled optimizer steps
- `references/domain-specific.md` — Vision, diffusion, contrastive, distributed, checkpointing, data loading
- `references/scaling-and-selection.md` — Scaling laws, compute budget tables, decision trees, DGX Spark
- `references/biomedical.md` — Drug discovery, protein models, medical imaging, genomics, clinical NLP
- `references/experiment-loop.md` — Autonomous experiment loop (autoresearch keep/discard/revert)

---

## Architecture Selection

Pick the right model by **data type** and **data scale**:

| Data Type | < 10K samples | 10K-100K | > 100K |
|-----------|--------------|----------|--------|
| **Images** | Pretrained CNN + fine-tune | Fine-tune ViT or CNN | ViT from scratch |
| **Text (gen)** | Few-shot prompting | Fine-tune GPT/LLaMA (LoRA) | Pretrain from scratch |
| **Tabular** | XGBoost/LightGBM | Still XGBoost | Neural viable |
| **Audio** | Pretrained Whisper | Fine-tune AST | Train from scratch |
| **Molecules** | Pretrained GNN | Fine-tune molecular LM | Train GNN from scratch |
| **Proteins** | ESM-2 embeddings + head | Fine-tune ESM-2 | Train protein LM |
| **Medical img** | Pretrained CNN | nnU-Net (auto-config) | Swin-UNETR / MedSAM |

**Key principle**: architecture matters less than training recipe at equal compute. A well-tuned
ResNet beats a poorly-tuned ViT (ref: "ResNet Strikes Back", Wightman 2021).

For biomedical domains, see `references/biomedical.md`.
For sequence model selection and compute planning, see `references/scaling-and-selection.md`.

---

## Scaling Laws

### Chinchilla rule (Hoffmann et al., 2022)

Compute-optimal training: **~20 tokens per parameter**.

| Model Size | Compute-Optimal | Inference-Optimal (100×) |
|-----------|----------------|--------------------------|
| 125M | 2.5B tokens | 12.5B tokens |
| 1B | 20B tokens | 100B tokens |
| 7B | 140B tokens | 700B tokens |

**FLOPs ≈ 6 × N × D** (N=params, D=tokens). Data repetition limit: ~4 epochs before diminishing returns.

---

## Training Loop

```python
import gc, time, torch

torch.manual_seed(42)
torch.set_float32_matmul_precision("high")  # TF32 on Ampere+
autocast_ctx = torch.amp.autocast(device_type="cuda", dtype=torch.bfloat16)

grad_accum_steps = total_batch_size // (batch_size * seq_len)
step = 0

while not done:
    t0 = time.time()
    for micro_step in range(grad_accum_steps):
        with autocast_ctx:
            loss = model(x, y)
        (loss / grad_accum_steps).backward()
        x, y = next(train_loader)

    update_lr(optimizer, progress)
    optimizer.step()
    model.zero_grad(set_to_none=True)  # frees memory vs zeroing

    if loss.item() > 100:  # fast-fail on divergence
        print("FAIL: loss exploded"); exit(1)

    torch.cuda.synchronize()
    if step == 0:
        gc.collect(); gc.freeze(); gc.disable()  # avoid ~500ms GC stalls
    step += 1
```

### Key principles

- **Gradient clipping**: `clip_grad_norm_(params, 1.0)` — near-universal for Transformers.
  Exception: Muon optimizer normalizes updates via orthogonalization, so clipping is optional.
- **Tensor Core alignment**: batch size, hidden dims should be multiples of 8 (bf16) or 64 (A100).
- **Time-based budgets** make experiments comparable across hardware.
- **`cudnn.benchmark = True`** for fixed-size vision inputs.

---

## Optimizer Configuration

Modern LLM training uses different optimizers per parameter group:

| Parameter Type | Optimizer | LR (base) | Weight Decay |
|---------------|-----------|-----------|--------------|
| 2D weight matrices | Muon | 0.04 | 0.2 |
| Token embeddings | AdamW | 0.6 × scale | 0.0 |
| Unembedding (lm_head) | AdamW | 0.004 × scale | 0.0 |
| Per-layer scalars | AdamW | 0.005 × scale | 0.0 |

**LR scaling by dimension**: `lr * (d_model / 768)^(-0.5)` — keeps dynamics stable across sizes.

### Rules of thumb

- Embeddings need higher LR (sparse updates). Never weight-decay embeddings.
- Weight decay scheduling: linearly decay WD to 0 over training.
- AdamW defaults: β1=0.9, β2=0.95, eps=1e-10 (not default 1e-8 — prevents stale updates in bf16).

For Muon details (polar express orthogonalization, NorMuon), see `references/optimizers.md`.

---

## Learning Rate Scheduling

### Time-based (autoresearch style)

```python
def get_lr_multiplier(progress):  # progress = elapsed_time / time_budget
    if progress < warmup_ratio:
        return progress / warmup_ratio
    elif progress < 1.0 - warmdown_ratio:
        return 1.0
    else:
        cooldown = (1.0 - progress) / warmdown_ratio
        return cooldown + (1 - cooldown) * final_lr_frac
```

### Cosine decay

```python
def get_lr(step, total_steps, max_lr, min_lr, warmup_steps):
    if step < warmup_steps:
        return max_lr * step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * progress))
```

**WSD (Warmup-Stable-Decay)**: gaining traction — easier to resume training mid-run.

### Guidance

- **Warmup**: 1-5% of training. Zero warmup valid with Muon (autoresearch uses `WARMUP_RATIO=0.0`).
- **Warmdown**: 30-50% of training in LR decay. Matters more than warmup for final quality.
- **Final LR**: 0 or ~10% of peak. Zero is simpler.

---

## Mixed Precision & Compilation

```python
import os
os.environ["PYTORCH_ALLOC_CONF"] = "expandable_segments:True"  # before torch import

import torch
torch.set_float32_matmul_precision("high")
autocast_ctx = torch.amp.autocast(device_type="cuda", dtype=torch.bfloat16)
model = torch.compile(model, dynamic=False)
```

- **bf16** (Ampere+): same exponent as fp32, no loss scaling needed. Preferred over fp16.
- **fp16**: needs GradScaler. Use only on V100 or older.
- `dynamic=False` enables max optimization. Add `fullgraph=True` if no graph breaks.
- First steps are slow (JIT) — exclude from timing.

---

## Memory & Performance

### Meta device init (large models)

```python
with torch.device("meta"):
    model = GPT(config)          # zero memory
model.to_empty(device="cuda")
model.init_weights()
```

### MFU (Model FLOPs Utilization)

```python
achieved_flops = model_flops_per_token * batch_tokens / step_time
mfu = achieved_flops / gpu_peak_flops
# H100 SXM: 989.5 TFLOPS | A100: 312 | RTX 4090: 165
```

Good targets: >30% decent, >40% good, >50% excellent (single-GPU).

### OOM solutions (in order)

1. Reduce `DEVICE_BATCH_SIZE`, increase `grad_accum_steps`
2. `PYTORCH_ALLOC_CONF=expandable_segments:True`
3. `model.zero_grad(set_to_none=True)`
4. Meta device init → `to_empty`
5. Activation checkpointing: `torch.utils.checkpoint.checkpoint()`
6. 8-bit optimizer (bitsandbytes): ~30% savings on optimizer states

---

## Hyperparameter Search

### Priority order (tune first → last)

1. **Learning rate** — most impactful. Always tune first.
2. **Batch size** — largest that fits. Speed knob, not quality knob.
3. **Weight decay** — 0.01-0.1 for AdamW.
4. **Warmup steps** — 1-5% of training.

### The 2025 default recipe

| Setting | Value |
|---------|-------|
| Optimizer | AdamW (β1=0.9, β2=0.95, eps=1e-10) |
| Weight decay | 0.1 |
| LR schedule | Cosine decay or WSD |
| Peak LR | 3e-4 (scale down for larger models) |
| Precision | bf16 |
| Grad clipping | max_norm=1.0 |
| Normalization | RMSNorm (pre-norm) |
| Activation | SwiGLU |
| Position encoding | RoPE |
| Attention | Flash Attention, optionally GQA |

---

## Debugging Checklist

### Karpathy's recipe (still canonical)

1. **Become one with the data** — visualize, check distributions, verify labels
2. **Get end-to-end running first** — verify on a trivial case
3. **Overfit one batch** — if you can't, you have a bug
4. **Then regularize** — add regularization only after overfitting works
5. **Tune hyperparameters** — start with known defaults

### Loss exploding / NaN

1. Reduce LR (3-10× smaller)
2. Add gradient clipping: `clip_grad_norm_(params, 1.0)`
3. Check for inf/nan in inputs
4. Add logit soft capping: `softcap * tanh(logits / softcap)`
5. Add QK-norm in attention
6. Verify weight init (zero-init output projections?)
7. Check loss reduction with gradient accumulation (`loss / grad_accum_steps`)

### Slow training / Low MFU

1. Verify `torch.compile` is active
2. Check `torch.set_float32_matmul_precision("high")`
3. Pin memory + non_blocking transfers
4. Profile with `torch.profiler`
5. GC stalls? `gc.freeze(); gc.disable()`
6. Tensor Core alignment: dims multiples of 8/64

### Loss plateau / Slow convergence

1. LR too low — try 2-5× larger
2. Warmup too long
3. Weight decay too high
4. Verify LR schedule is actually applied (print each step)
5. Model too small for task

### Silent failures

1. **Data leakage** between train/val
2. **Wrong preprocessing at inference** — augmentation mismatch
3. **Label errors** — use cleanlab to detect
4. **Shuffling bugs** — correlated batches
5. **Tokenizer mismatch** with pretrained model

### What to monitor

- **Gradient norms** — spike precedes loss spike
- **Per-layer activation stats** — reveals exploding/vanishing
- **Dead neurons** — >50% zero ReLU = dying ReLU problem
- **Learning rate** — verify schedule applied (common silent bug)

---

## Experiment Management

Track experiments in TSV for easy comparison:

```
commit  val_bpb  memory_gb  status   description
a1b2c3d 0.9979   44.0       keep     baseline
b2c3d4e 0.9932   44.2       keep     increase matrix LR to 0.04
c3d4e5f 1.0050   44.0       discard  switch to GeLU (worse)
```

**Simplicity criterion**: all else equal, simpler is better. Removing something and getting equal
results is a great outcome. For systematic agent-driven experimentation, see `references/experiment-loop.md`.

### Evaluation metrics by domain

| Domain | Primary Metric | Notes |
|--------|---------------|-------|
| LLM | BPB (bits per byte) | Vocab-size-independent |
| Classification | Accuracy / F1 | Macro-F1 for imbalanced |
| Segmentation | mIoU / Dice | Per-class IoU reveals weak spots |
| Generation | FID | Needs >10k samples |
| Regression | RMSE / MAE | Log-transform skewed targets |

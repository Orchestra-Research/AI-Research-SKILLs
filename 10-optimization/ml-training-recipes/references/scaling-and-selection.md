# Scaling Laws & Architecture Selection Reference

Detailed decision frameworks for choosing architectures based on data scale, compute budget,
and task type. Referenced from SKILL.md.

## Table of Contents

1. [Scaling Laws](#scaling-laws)
2. [Architecture Decision Tree](#architecture-decision-tree)
3. [Data Scale Thresholds](#data-scale-thresholds)
4. [Compute Budget Planning](#compute-budget-planning)
5. [Optimizer Selection Guide](#optimizer-selection-guide)
6. [Training Instability at Scale](#training-instability-at-scale)
7. [Key References](#key-references)

---

## Scaling Laws

### Chinchilla (Hoffmann et al., 2022)

The most important scaling law for LLM training:

**For compute-optimal training**: N (params) and D (tokens) should scale equally with compute.
The ratio is approximately **20 tokens per parameter**.

```
FLOPs ≈ 6 × N × D

Where:
  N = number of parameters
  D = number of training tokens
  6 = forward (2) + backward (4) FLOPs per parameter per token
```

### Chinchilla vs Inference-Optimal

| Strategy | Tokens/Param | When to use | Example |
|----------|-------------|-------------|---------|
| **Chinchilla-optimal** | ~20x | Research, one-time compute | 7B model → 140B tokens |
| **Inference-optimal** | 100-200x | Production deployment | 7B model → 700B-1.4T tokens |

The LLaMA philosophy: deploy smaller models trained on more data, because inference is the
ongoing cost while training is a one-time cost.

### Beyond Chinchilla

- **Muennighoff et al. (2023)**: repeating data up to 4 epochs ≈ 85% as effective as unique data.
  Beyond 4 epochs, returns diminish sharply. `D_effective ≈ D × (1 - e^{-epochs})`
- **Over-training** smaller models is now standard practice for production (LLaMA, Mistral, Phi)
- **Data quality >> data quantity** (Llama 3 finding): aggressive dedup + quality filtering > raw scale

---

## Architecture Decision Tree

### Master flowchart by data type

```
What is your data type?
│
├─ IMAGES / VIDEO
│   ├─ Data < 10K → Pretrained CNN (ResNet/EfficientNet) + fine-tune head
│   ├─ Data 10K-1M → Pretrained ViT fine-tune OR CNN fine-tune (both viable)
│   ├─ Data > 1M → ViT or hybrid (ConvNeXt, CoAtNet) from scratch
│   └─ Video → Video Swin Transformer or TimeSformer (pretrained)
│
├─ TEXT / NLP
│   ├─ Classification/NER → Fine-tune encoder (BERT/RoBERTa)
│   ├─ Generation → Fine-tune decoder (GPT/LLaMA)
│   ├─ Seq2seq (translation) → Fine-tune T5/BART
│   ├─ Data < 1K examples → Few-shot with large LLM (no training)
│   ├─ Seq length > 8K → Consider Mamba-hybrid or long-context Transformer
│   └─ Tight inference budget → Distilled model, RWKV, or Mamba
│
├─ TABULAR
│   ├─ Rows < 50K → XGBoost / LightGBM (NOT deep learning)
│   ├─ Rows 50K-500K → GBM still strong; try FT-Transformer as comparison
│   └─ Rows > 500K → Neural methods viable; benchmark both
│
├─ TIME SERIES
│   ├─ Univariate, short horizon → ARIMA / Prophet / simple LSTM
│   ├─ Multivariate, medium data → LSTM/GRU or N-BEATS
│   ├─ Long sequences / many series → PatchTST / Informer / Mamba
│   └─ Foundation model exists → TimesFM or Chronos (fine-tune)
│
├─ AUDIO / SPEECH
│   ├─ Speech recognition → Whisper (pretrained) + fine-tune
│   ├─ Audio classification → AST or CNN on spectrograms
│   └─ Long audio → Mamba / SSM variants
│
├─ GRAPH DATA
│   └─ GNN (GCN, GAT, GraphSAGE); Transformer-on-graphs for large graphs
│
└─ MULTIMODAL
    └─ CLIP-style (vision+text), or unified Transformer (Gemini-style)
```

### Compute budget flowchart

```
How much compute do you have?
│
├─ Single GPU, < 1 day
│   → Models < 500M params
│   → Fine-tune pretrained, don't train from scratch
│   → LoRA/QLoRA for large model fine-tuning
│
├─ Single GPU, 1-7 days
│   → Up to 1B params from scratch
│   → Or fine-tune up to 7B with QLoRA
│
├─ Multi-GPU (4-8), 1-7 days
│   → Up to 3B from scratch
│   → Or fine-tune up to 13B
│   → Use DDP for data parallel
│
├─ Cluster (32+ GPUs), weeks
│   → 7B+ from scratch
│   → Apply Chinchilla scaling: 20 tokens/param minimum
│   → Use FSDP or Pipeline Parallel
│
└─ Massive cluster (100s of GPUs), months
    → 70B+ models
    → Full 5-way parallelism (TP + PP + DP + EP + CP)
    → Chinchilla ratios critical
```

---

## Data Scale Thresholds

### Vision: CNN vs ViT crossover points

| Dataset Size | Winner | Notes |
|-------------|--------|-------|
| < 5K images | Pretrained CNN | ViT overfits without pretraining |
| 5K-50K | Fine-tuned ViT ≈ CNN | Both viable, ViT needs pretraining (ImageNet-21k) |
| 50K-500K | ViT with pretraining edges ahead | Hybrid architectures (CoAtNet) excel |
| > 1M | ViT from scratch viable | ViT-L/H outperform CNNs |
| > 10M | ViT clearly dominates | Original ViT paper showed this on JFT-300M |

**Key insight**: transfer learning erases the gap. A ViT pretrained on large data and fine-tuned
on small data can beat a CNN trained from scratch on that small data.

### NLP: model size thresholds

| Task Data Size | Approach |
|---------------|----------|
| < 100 examples | Few-shot prompting (no training) |
| 100-1K | Fine-tune small model (BERT-base) or LoRA on large model |
| 1K-10K | Full fine-tune medium model |
| 10K-100K | Train domain-specific model or continue pretraining |
| > 100K | Scale up model size with data per Chinchilla |

### Tabular: the tree boundary

**Grinsztajn et al. (2022)**: "Why do tree-based models still outperform deep learning on typical tabular data?"

| Dataset Rows | Recommendation |
|-------------|---------------|
| < 10K | XGBoost/LightGBM (no debate) |
| 10K-50K | Trees almost always win. Neural barely competitive |
| 50K-500K | Neural (FT-Transformer, TabNet) becomes viable |
| > 500K | Both competitive; neural can win with high-cardinality features |

This is one of the most robust findings in ML — neural networks rarely beat gradient boosted
trees on typical tabular data under ~50K rows.

### Time series thresholds

| Data Scale | Architecture |
|-----------|-------------|
| < 1K sequences | Classical (ARIMA, Prophet) or simple LSTM |
| 1K-100K | LSTM/GRU competitive. Transformers become viable |
| > 100K | Transformer variants or Mamba for long-horizon |

---

## Compute Budget Planning

### FLOPs estimates by model size

| Model Size | Tokens (Chinchilla) | Training FLOPs | A100 GPU-hours (est.) |
|-----------|--------------------|-----------------|-----------------------|
| 125M | 2.5B | 1.9e18 | ~6h |
| 350M | 7B | 1.5e19 | ~48h |
| 1B | 20B | 1.2e20 | ~385h |
| 7B | 140B | 5.9e21 | ~19,000h |
| 13B | 260B | 2.0e22 | ~65,000h |
| 70B | 1.4T | 5.9e23 | ~1.9M h |

### Memory estimation

Rule of thumb for model memory (bf16 training):
```
Total VRAM ≈ 18-20 × N_params (in bytes)

Breakdown:
  Model weights (bf16):     2 × N bytes
  Gradients (bf16):         2 × N bytes
  Optimizer states (Adam):  8 × N bytes (fp32 first+second moments)
  Activations:              varies (~4-8 × N)

Example: 1B params → ~18-20 GB VRAM minimum
```

Techniques to reduce:
- **Gradient checkpointing**: -50-70% activation memory, +30% compute
- **8-bit optimizer**: -30% optimizer state memory
- **FSDP**: shard across GPUs
- **QLoRA**: 4-bit base + LoRA adapters

---

## Optimizer Selection Guide

| Optimizer | Best For | Memory | Notes |
|-----------|---------|--------|-------|
| **AdamW** | Default for everything | 2× params | β1=0.9, β2=0.95 for LLMs |
| **8-bit Adam** (bitsandbytes) | Memory-constrained | ~1.3× params | Near-identical quality |
| **Adafactor** | Very large models | ~1× params | Factorizes second moment |
| **SGD+momentum** | CNNs on vision | 1× params | Needs more LR tuning |
| **Muon** | Transformer matrices | ~2× params | Orthogonal updates, emerging |
| **LAMB/LARS** | Very large batch (>32K) | 2× params | Scales LR per-layer for stability |
| **Lion** (Google) | Worth trying | 1× params | Sign-based, less memory than Adam |
| **Schedule-Free Adam** | Simplicity | 2× params | No LR schedule needed |
| **SOAP** | LLM training | ~2× params | Shampoo-like but practical |

### When to use what

- **Default**: AdamW. Always works, well-understood, vast literature.
- **Memory pressure**: 8-bit Adam or Adafactor.
- **Very large batches**: LAMB/LARS (linear scaling rule breaks down otherwise).
- **Cutting-edge LLM**: Muon for matrix params + AdamW for embeddings (autoresearch pattern).
- **Simplicity**: Schedule-Free Adam — eliminates LR schedule entirely.

---

## Training Instability at Scale

Common failure modes observed in large-scale training (OPT-175B, BLOOM, PaLM, Llama):

| Failure | Symptom | Fix |
|---------|---------|-----|
| **Loss spikes** | Sudden loss jump, may or may not recover | Reduce LR, skip batch, rollback to earlier checkpoint (PaLM strategy) |
| **Slow divergence** | Loss gradually increases | Data quality issue or LR too high |
| **Embedding collapse** | All embeddings converge to similar values | Add embedding LayerNorm, reduce embedding LR |
| **Attention entropy collapse** | Attention uniform or one-hot | z-loss regularization, QK-norm |
| **NaN in fp16** | Training crashes | Switch to bf16, or reorder normalization before matmul |

### PaLM loss spike strategy

When a loss spike is detected:
1. Roll back to the last checkpoint before the spike
2. Skip the data batch that caused the spike
3. Optionally reduce LR temporarily, then ramp back up
4. Resume training

This is now standard practice at most large-scale training labs.

### Stability techniques (now standard)

- **Pre-norm** (normalize before attention/FFN, not after)
- **QK-norm** (normalize Q and K before dot product)
- **No bias** in linear layers (except final output)
- **Gradient clipping** (max_norm=1.0)
- **Embedding LayerNorm** (especially at scale)
- **bf16 over fp16** (no loss scaling needed)

---

## DGX Spark / Bandwidth-Limited GPU Training

### GB10 Grace Blackwell specs

| Spec | Value | vs H100 SXM |
|------|-------|-------------|
| GPU memory | 128 GB LPDDR5X (unified CPU+GPU) | 80 GB HBM3 |
| Memory bandwidth | ~273 GB/s | ~3,350 GB/s (**12× less**) |
| CPU-GPU interconnect | NVLink C2C (~900 GB/s) | N/A (discrete) |
| FP4 Tensor Core | Yes (Blackwell) | No |
| FP8 Tensor Core | Yes | Yes |
| bf16 peak TFLOPS | ~TBD (Blackwell arch) | 989.5 |
| Power | ~300W total system | 700W GPU alone |
| Form factor | Desktop workstation | Data center |

### The bandwidth bottleneck

DGX Spark's biggest constraint is **memory bandwidth** — 12× less than H100. This means:
- **Compute-bound ops** (large matmuls): run fine, similar efficiency per FLOP
- **Memory-bound ops** (element-wise, reductions, attention): severely bottlenecked
- **Effective MFU** will be lower than on HBM GPUs for the same model

Rule of thumb: if your operation has low arithmetic intensity (FLOPs/byte < 50), it will be
bandwidth-limited on DGX Spark. Large batch sizes and wide models help increase arithmetic intensity.

### Optimization strategies for bandwidth-limited training

#### 1. Maximize compute-to-memory ratio

```python
# Use larger batch sizes to increase arithmetic intensity of matmuls
# Bigger batches → more FLOPs per weight load → better bandwidth utilization

# Use gradient accumulation to simulate large batches without OOM
grad_accum_steps = 16  # effectively 16x batch size
```

#### 2. Quantized training (FP8 / FP4)

DGX Spark's Blackwell cores natively support FP4 and FP8 — these reduce memory traffic proportionally:

```python
# FP8 training with transformer engine
import transformer_engine.pytorch as te

# Replace nn.Linear with FP8 version
linear = te.Linear(in_features, out_features, bias=False)

# FP8 autocast
with te.fp8_autocast(enabled=True):
    output = model(input)
```

FP8 cuts memory bandwidth demand by ~2× vs bf16. FP4 (where available) cuts by ~4×.
Since bandwidth is the bottleneck, this directly translates to speed.

#### 3. Operator fusion

Fuse element-wise operations to reduce memory round-trips:

```python
# torch.compile is critical on bandwidth-limited hardware
# It fuses element-wise ops (norm, activation, residual add) into single kernels
model = torch.compile(model, dynamic=False, fullgraph=True)

# Manual fusion example: fused RMSNorm + linear
# Instead of: norm(x) → write to memory → linear(normed_x)
# Fused: norm + linear in one kernel, x never written back to memory
```

#### 4. Gradient checkpointing (actually beneficial here)

On HBM GPUs, gradient checkpointing trades compute for memory. On DGX Spark, it's a different
tradeoff — **recomputing activations can be faster than loading them from memory**:

```python
from torch.utils.checkpoint import checkpoint

class Block(nn.Module):
    def forward(self, x):
        # Recompute attention activations instead of storing them
        x = x + checkpoint(self.attn, x, use_reentrant=False)
        x = x + checkpoint(self.mlp, x, use_reentrant=False)
        return x
```

#### 5. Unified memory advantage

The NVLink C2C connection (~900 GB/s) between CPU and GPU means:
- **No explicit CPU↔GPU copies needed** — unified address space
- Can train models **larger than GPU VRAM** without offloading overhead
- Use `torch.cuda.mem_get_info()` to check available unified memory
- The 128GB pool is shared — monitor total system memory, not just "GPU memory"

#### 6. KV-cache optimization for inference

For LLM inference on DGX Spark, KV-cache is the bandwidth bottleneck:
- **GQA/MQA**: fewer KV heads = smaller cache = less bandwidth
- **KV-cache quantization**: INT8 or FP8 KV cache reduces bandwidth 2-4×
- **Sliding window attention**: bounds cache size regardless of sequence length
- **PagedAttention** (vLLM): efficient memory management for variable-length sequences

#### 7. Model selection for DGX Spark

| Model Size | Feasibility | Notes |
|-----------|-------------|-------|
| < 1B | Excellent | Train from scratch, fast iteration |
| 1-7B | Good | Train from scratch; fine-tune comfortably |
| 7-13B | Feasible | Fine-tune with QLoRA; train from scratch slowly |
| 13-30B | Fine-tune only | QLoRA; unified memory helps fit the model |
| 30-70B | Inference only | With quantization (GPTQ/AWQ 4-bit) |
| > 70B | Not recommended | Even inference may be too slow |

### DGX Spark checklist

- [ ] Enable FP8 training (transformer_engine) — biggest single win
- [ ] Use `torch.compile` with `fullgraph=True` for operator fusion
- [ ] Increase batch size as much as memory allows (improves arithmetic intensity)
- [ ] Enable gradient checkpointing (free performance on bandwidth-limited hardware)
- [ ] Use GQA/MQA for attention-heavy models
- [ ] Monitor `torch.cuda.max_memory_allocated()` — unified memory means different limits
- [ ] Profile with `torch.profiler` to find bandwidth-bound kernels
- [ ] Consider FP4 for inference if Blackwell kernel support is available

---

## Key References

### Scaling Laws
- Kaplan et al. (2020): "Scaling Laws for Neural Language Models" — arxiv:2001.08361
- Hoffmann et al. (2022): "Training Compute-Optimal Large Language Models" (Chinchilla) — arxiv:2203.15556
- Muennighoff et al. (2023): "Scaling Data-Constrained Language Models" — arxiv:2305.16264

### Architecture Selection
- Dosovitskiy et al. (2020): "An Image is Worth 16x16 Words" (ViT) — arxiv:2010.11929
- Liu et al. (2022): "A ConvNet for the 2020s" (ConvNeXt) — arxiv:2201.03545
- Grinsztajn et al. (2022): "Why do tree-based models still outperform deep learning on tabular data?" — arxiv:2207.08815

### Alternative Architectures
- Gu & Dao (2023): "Mamba: Linear-Time Sequence Modeling" — arxiv:2312.00752
- Peng et al. (2023): "RWKV: Reinventing RNNs for the Transformer Era" — arxiv:2305.13048
- Sun et al. (2023): "Retentive Network" (RetNet) — arxiv:2307.08621

### Training Recipes & Methodology
- Karpathy (2019): "A Recipe for Training Neural Networks" (blog post)
- Wightman et al. (2021): "ResNet Strikes Back" — arxiv:2110.00476
- Yang et al. (2022): "Tensor Programs V" (µP) — arxiv:2203.03466
- Google Research: "Deep Learning Tuning Playbook" — github.com/google-research/tuning_playbook
- Stas Bekman: "ML Engineering" — github.com/stas00/ml-engineering
- Geiping & Goldstein (2022): "Cramming: Training a Language Model on a Single GPU in One Day" — arxiv:2212.14034

### Training at Scale
- Zhang et al. (2022): "OPT: Open Pre-trained Transformer Language Models" — arxiv:2205.01068
- Chowdhery et al. (2022): "PaLM: Scaling Language Modeling with Pathways" — arxiv:2204.02311
- Touvron et al. (2023): "LLaMA" — arxiv:2302.13971

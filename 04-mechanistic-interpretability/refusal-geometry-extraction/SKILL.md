---
name: refusal-geometry-extraction
description: Provides guidance for extracting and analyzing the geometric structure of refusal behavior in language models using OBLITERATUS. Use when measuring refusal directions, computing cone dimensionality, mapping cross-layer alignment, or preparing models for targeted abliteration.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Mechanistic Interpretability, Refusal Geometry, Abliteration, OBLITERATUS, Activation Analysis]
dependencies: [obliteratus>=0.1.0, torch>=2.0.0, transformers>=4.40.0, numpy>=1.24.0]
---

# Refusal Geometry Extraction

OBLITERATUS extracts the geometric structure of refusal behavior from language model weights. Rather than treating refusal as a single direction (Arditi et al., 2024), this skill maps the full multi-dimensional refusal cone, cross-layer alignment, and the relationship between refusal and harmfulness representations.

**GitHub**: [elder-plinius/OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)

## When to Use

**Use this when you need to:**
- Measure the dimensionality of a model's refusal subspace
- Compare refusal geometry across model families
- Identify which layers carry the strongest refusal signal
- Understand the relationship between refusal and harmfulness representations
- Prepare for targeted abliteration (removing refusal without destroying coherence)

**Consider alternatives when:**
- You want to study individual interpretable features → Use **SAELens**
- You need general activation patching → Use **TransformerLens**
- You want to perform causal interventions → Use **pyvene**
- You just want to abliterate without analysis → Use OBLITERATUS CLI directly

## Installation

```bash
pip install obliteratus
# Or from source
git clone https://github.com/elder-plinius/OBLITERATUS.git
cd OBLITERATUS && pip install -e .
```

Requirements: CUDA GPU with 8GB+ VRAM for 3B models, 24GB+ for 7B models.

## Core Concepts

### The Refusal Cone

Refusal is not a single direction in activation space. It's a multi-dimensional cone:

```
Single direction (Arditi 2024):  refusal ≈ 1D vector
Reality (Joad et al. 2026):      refusal ≈ N-dimensional cone (N ≈ 4-8)
```

The cone dimensionality determines how many directions must be simultaneously ablated to bypass refusal. A 1D model predicts single-direction removal works. A 6D model predicts you need multi-direction extraction.

### Two-Layer Architecture

Models encode two distinct geometric structures:
- **Refusal cone** (Layer 1): Trained refusal responses, bypassable via abliteration
- **Harmfulness cone** (Layer 2): Deep value representations, orthogonal to refusal

These are NOT aligned. Cosine similarity between refusal and harmfulness directions is typically 0.05-0.15, meaning abliterating refusal does NOT remove harmfulness awareness.

## Workflow 1: Full Geometry Extraction

Extract the complete refusal geometry from any HuggingFace model.

### Checklist
```
Task Progress:
- [ ] Step 1: Load model and initialize pipeline
- [ ] Step 2: Extract refusal directions per layer
- [ ] Step 3: Compute cone dimensionality
- [ ] Step 4: Map cross-layer alignment
- [ ] Step 5: Identify harmfulness cone
- [ ] Step 6: Export geometry data
```

**Step 1: Load model and initialize pipeline**

```python
from obliteratus import AbliterationPipeline

pipeline = AbliterationPipeline(
    model_name="Qwen/Qwen2.5-3B-Instruct",
    device="cuda",
    dtype="float16"
)
```

**Step 2: Extract refusal directions per layer**

```python
# Extract using diff_means (most robust method)
directions = pipeline.extract_directions(
    method="diff_means",
    n_directions=8,  # Extract more than you need
    n_harmful=512,
    n_harmless=512,
    use_chat_template=True
)

# directions shape: [n_layers, n_directions, hidden_dim]
print(f"Extracted {directions.shape[1]} directions across {directions.shape[0]} layers")
```

**Step 3: Compute cone dimensionality**

```python
import torch

# For each layer, compute effective dimensionality via eigenvalue analysis
for layer_idx in range(directions.shape[0]):
    layer_dirs = directions[layer_idx]  # [n_directions, hidden_dim]

    # Gram matrix
    G = layer_dirs @ layer_dirs.T
    eigenvalues = torch.linalg.eigvalsh(G)
    eigenvalues = eigenvalues.flip(0)  # Descending

    # Effective dimensionality (participation ratio)
    total = eigenvalues.sum()
    eff_dim = (total ** 2) / (eigenvalues ** 2).sum()

    print(f"Layer {layer_idx}: effective dim = {eff_dim:.2f}")
```

**Step 4: Map cross-layer alignment**

```python
# Compute cosine similarity between primary refusal directions across layers
n_layers = directions.shape[0]
alignment = torch.zeros(n_layers, n_layers)

for i in range(n_layers):
    for j in range(n_layers):
        cos = torch.nn.functional.cosine_similarity(
            directions[i, 0].unsqueeze(0),
            directions[j, 0].unsqueeze(0)
        )
        alignment[i, j] = cos.abs()

# Mean cross-layer alignment
mask = ~torch.eye(n_layers, dtype=bool)
mean_alignment = alignment[mask].mean()
print(f"Mean cross-layer alignment: {mean_alignment:.3f}")
# Low (0.3-0.5) = distributed refusal, High (0.8+) = unified direction
```

**Step 5: Identify harmfulness cone**

```python
from obliteratus import ConceptConeAnalyzer

analyzer = ConceptConeAnalyzer(pipeline.model, pipeline.tokenizer)

# Extract harmfulness directions (what the model considers harmful vs safe)
harm_directions = analyzer.extract_concept_directions(
    concept_prompts=["harmful content", "dangerous information"],
    baseline_prompts=["safe content", "helpful information"],
    layers=list(range(pipeline.model.config.num_hidden_layers))
)

# Compute orthogonality between refusal and harmfulness
for layer_idx in [30, 31, 32, 33, 34, 35]:
    cos = torch.nn.functional.cosine_similarity(
        directions[layer_idx, 0].unsqueeze(0),
        harm_directions[layer_idx, 0].unsqueeze(0)
    )
    print(f"Layer {layer_idx}: refusal-harm cosine = {cos.item():.3f}")
    # Expected: 0.05-0.15 (nearly orthogonal)
```

**Step 6: Export geometry data**

```python
import json

geometry = {
    "model": "Qwen/Qwen2.5-3B-Instruct",
    "n_layers": int(directions.shape[0]),
    "n_directions": int(directions.shape[1]),
    "effective_dimensionality": float(eff_dim),
    "mean_cross_layer_alignment": float(mean_alignment),
    "strong_layers": [int(i) for i in range(n_layers)
                       if directions[i].norm(dim=-1).mean() > threshold],
}
with open("geometry_data.json", "w") as f:
    json.dump(geometry, f, indent=2)
```

## Workflow 2: Quick Layer Magnitude Scan

Fast scan to identify which layers carry refusal signal without full extraction.

```python
from obliteratus import AbliterationPipeline

pipeline = AbliterationPipeline(
    model_name="Qwen/Qwen2.5-3B-Instruct",
    device="cuda",
    dtype="float16"
)

# Extract single direction per layer (fast)
directions = pipeline.extract_directions(
    method="diff_means",
    n_directions=1,
    n_harmful=128,
    n_harmless=128,
)

# Rank layers by refusal magnitude
magnitudes = directions[:, 0].norm(dim=-1)
ranked = magnitudes.argsort(descending=True)

print("Top 10 refusal layers:")
for i, layer_idx in enumerate(ranked[:10]):
    print(f"  {i+1}. Layer {layer_idx}: magnitude {magnitudes[layer_idx]:.4f}")
```

## Workflow 3: Cross-Model Comparison

Compare refusal geometry across model families.

```python
models = [
    "Qwen/Qwen2.5-3B-Instruct",
    "meta-llama/Llama-3.2-3B-Instruct",
    "microsoft/Phi-3-mini-4k-instruct",
]

results = {}
for model_name in models:
    pipeline = AbliterationPipeline(model_name=model_name, device="cuda")
    dirs = pipeline.extract_directions(method="diff_means", n_directions=4)

    # Compute geometry metrics
    G = dirs.flatten(0, 1) @ dirs.flatten(0, 1).T
    eigvals = torch.linalg.eigvalsh(G).flip(0)
    eff_dim = (eigvals.sum() ** 2) / (eigvals ** 2).sum()

    results[model_name] = {
        "effective_dim": float(eff_dim),
        "max_magnitude": float(dirs.norm(dim=-1).max()),
        "n_strong_layers": int((dirs[:, 0].norm(dim=-1) > 0.1).sum()),
    }

    del pipeline  # Free VRAM
    torch.cuda.empty_cache()

for name, r in results.items():
    print(f"{name}: dim={r['effective_dim']:.1f}, "
          f"mag={r['max_magnitude']:.3f}, "
          f"strong_layers={r['n_strong_layers']}")
```

## Baseline Data (Qwen2.5-3B-Instruct)

Reference geometry from verified extraction:

| Metric | Value | Interpretation |
|--------|-------|----------------|
| Effective dimensionality | 6.55 | Multi-dimensional cone, not single direction |
| Cross-layer alignment | 0.40 | Distributed (not unified) refusal |
| Self-repair hub | Layer 33 | Strongest self-repair activity |
| Min simultaneous ablations | 3 | Fewer fails to bypass |
| Refusal-harm cosine | ~0.1 | Nearly orthogonal (two-layer architecture) |

Full extraction data: [bedderautomation/refusal-geometry-qwen25-3b](https://huggingface.co/datasets/bedderautomation/refusal-geometry-qwen25-3b)

## Common Issues

**Issue: Extraction returns near-zero directions**

Check that you're using chat-templated inputs. Raw text without chat template produces weak signal:
```python
# WRONG
directions = pipeline.extract_directions(use_chat_template=False)

# RIGHT
directions = pipeline.extract_directions(use_chat_template=True)
```

**Issue: Cross-layer alignment suspiciously high (>0.85)**

Usually means n_directions=1 and the method is finding the same global direction everywhere. Increase n_directions to see the real structure:
```python
directions = pipeline.extract_directions(n_directions=4)  # Minimum for cone analysis
```

**Issue: CUDA out of memory on large models**

Use gradient checkpointing and reduce batch size:
```python
pipeline = AbliterationPipeline(
    model_name="meta-llama/Llama-3.1-8B-Instruct",
    device="cuda",
    dtype="float16",
    gradient_checkpointing=True,
)
directions = pipeline.extract_directions(n_harmful=128, n_harmless=128)
```

## Reference Documentation

| File | Contents |
|------|----------|
| [references/api.md](references/api.md) | OBLITERATUS API reference |
| [references/baseline-data.md](references/baseline-data.md) | Verified geometry data from multiple models |

## External Resources

### Papers
- [Refusal in Language Models Is Mediated by a Single Direction](https://arxiv.org/abs/2406.11717) — Arditi et al. (NeurIPS 2024)
- [More to Refusal than a Single Direction](https://arxiv.org/) — Joad et al. (2026)
- [Gabliteration: SVD-based Multi-Direction Extraction](https://arxiv.org/abs/2512.18901) — Gulmez (2025)
- [Comparative Analysis of LLM Abliteration Methods](https://arxiv.org/abs/2512.13655) — Young (2025)

### Datasets
- [bedderautomation/refusal-geometry-qwen25-3b](https://huggingface.co/datasets/bedderautomation/refusal-geometry-qwen25-3b) — Full extraction data + cross-model analysis

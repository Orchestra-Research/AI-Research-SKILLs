# Unsupervised Coefficient Tuning via Generation Consistency

Reference for the generation-consistency-based coefficient selection method introduced in:

> **"[Paper Title]"** — arXiv:2503.23733
> Proposes an unsupervised proxy—*generation consistency*—to automatically select merging coefficients without labeled data or manual search.

---

## Problem: Coefficient Selection in Model Merging

Most merging methods (Task Arithmetic, TIES, DARE, SLERP) expose one or more scalar coefficients (e.g., `weight`, `density`, `lambda`, `t`) that strongly affect final quality. Common approaches:

| Approach | Drawback |
|---|---|
| Manual/intuition | Unreliable, requires human expertise |
| Grid search with eval set | Requires labeled data; expensive (N merges × eval cost) |
| Bayesian optimization | Needs ground-truth signal per trial |
| **Generation Consistency (this method)** | Unsupervised, label-free, small unlabeled data subset only |

---

## Core Idea: Generation Consistency

**Key insight**: When a coefficient value is near-optimal, merged models at nearby coefficient values produce *similar* outputs—because the loss landscape is smooth around a good solution. Near poor solutions (too high or too low coefficient), outputs diverge sharply as the model is at an unstable point.

For a candidate coefficient `α`, compute:

```
ConsistencyScore(α) = avg_similarity(outputs(α), outputs(α - δ))
                    + avg_similarity(outputs(α), outputs(α + δ))
```

where `δ` is a small step size (e.g., 0.1) and similarity is measured over a small unlabeled dataset. **The coefficient with the highest consistency score is selected.**

---

## Algorithm

### Step 1: Define Candidate Coefficients

```python
import numpy as np

# Example: searching over SLERP t or Task Arithmetic lambda
alpha_min, alpha_max = 0.2, 0.8
step = 0.1
candidates = np.arange(alpha_min, alpha_max + step, step).tolist()
# candidates = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
```

### Step 2: Merge Models for Each Candidate

```python
import subprocess
import json
import os

def merge_with_coefficient(alpha, model_a, model_b, output_dir, method="slerp"):
    """Merge models using mergekit with a specific coefficient."""
    if method == "slerp":
        config = {
            "merge_method": "slerp",
            "slices": [{"sources": [
                {"model": model_a, "layer_range": [0, 32]},
                {"model": model_b, "layer_range": [0, 32]}
            ]}],
            "parameters": {"t": alpha},
            "dtype": "bfloat16"
        }
    elif method == "task_arithmetic":
        config = {
            "merge_method": "task_arithmetic",
            "base_model": model_a,  # treat model_a as base
            "models": [{"model": model_b, "parameters": {"weight": alpha}}],
            "dtype": "bfloat16"
        }

    config_path = f"/tmp/merge_config_{alpha:.2f}.yaml"
    import yaml
    with open(config_path, "w") as f:
        yaml.dump(config, f)

    out_path = os.path.join(output_dir, f"merged_alpha_{alpha:.2f}")
    subprocess.run(
        ["mergekit-yaml", config_path, out_path, "--cuda"],
        check=True
    )
    return out_path


# Merge all candidates
output_root = "/tmp/merge_candidates"
os.makedirs(output_root, exist_ok=True)

merged_paths = {}
for alpha in candidates:
    path = merge_with_coefficient(alpha, "model_a_path", "model_b_path", output_root)
    merged_paths[alpha] = path
```

### Step 3: Run Inference on Unlabeled Subset

Only a small subset (~50–200 samples) of unlabeled text is needed. The data does not need labels.

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

def generate_responses(model_path, prompts, max_new_tokens=128, batch_size=8):
    """Generate responses for all prompts using the merged model."""
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    model.eval()

    all_responses = []
    for i in range(0, len(prompts), batch_size):
        batch = prompts[i:i + batch_size]
        inputs = tokenizer(batch, return_tensors="pt", padding=True, truncation=True).to(model.device)
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,       # greedy for determinism
                pad_token_id=tokenizer.eos_token_id
            )
        decoded = tokenizer.batch_decode(outputs[:, inputs["input_ids"].shape[1]:], skip_special_tokens=True)
        all_responses.extend(decoded)

    del model  # free GPU memory before loading next
    torch.cuda.empty_cache()
    return all_responses


# Small unlabeled evaluation prompts (no labels needed)
eval_prompts = [
    "Explain the concept of gradient descent.",
    "Write a Python function to find the maximum of a list.",
    # ... 50-200 prompts total
]

# Generate responses for each candidate
all_responses = {}
for alpha in candidates:
    print(f"Generating responses for alpha={alpha:.2f} ...")
    all_responses[alpha] = generate_responses(merged_paths[alpha], eval_prompts)
```

### Step 4: Compute Generation Consistency Scores

```python
from rouge_score import rouge_scorer

def text_similarity(text_a, text_b, metric="rougeL"):
    """Compute similarity between two text strings."""
    if metric == "rougeL":
        scorer = rouge_scorer.RougeScorer(["rougeL"], use_stemmer=False)
        score = scorer.score(text_a, text_b)
        return score["rougeL"].fmeasure
    elif metric == "token_overlap":
        tokens_a = set(text_a.lower().split())
        tokens_b = set(text_b.lower().split())
        if not tokens_a or not tokens_b:
            return 0.0
        return len(tokens_a & tokens_b) / len(tokens_a | tokens_b)


def generation_consistency(alpha, all_responses, candidates, delta=0.1, metric="rougeL"):
    """
    Compute generation consistency for a given alpha.

    Compares model at `alpha` against its nearest neighbors:
    alpha - delta and alpha + delta.
    """
    responses_curr = all_responses[alpha]
    neighbor_alphas = []

    left_alpha = round(alpha - delta, 2)
    right_alpha = round(alpha + delta, 2)

    if left_alpha in all_responses:
        neighbor_alphas.append(left_alpha)
    if right_alpha in all_responses:
        neighbor_alphas.append(right_alpha)

    if not neighbor_alphas:
        return 0.0  # boundary case with no neighbors

    total_sim = 0.0
    count = 0
    for n_alpha in neighbor_alphas:
        responses_neighbor = all_responses[n_alpha]
        pair_sims = [
            text_similarity(r_curr, r_neighbor, metric=metric)
            for r_curr, r_neighbor in zip(responses_curr, responses_neighbor)
        ]
        total_sim += sum(pair_sims) / len(pair_sims)
        count += 1

    return total_sim / count


# Compute consistency scores for all interior candidates
consistency_scores = {}
for alpha in candidates:
    score = generation_consistency(alpha, all_responses, candidates, delta=0.1)
    consistency_scores[alpha] = score
    print(f"alpha={alpha:.2f}  consistency={score:.4f}")
```

### Step 5: Select Best Coefficient

```python
best_alpha = max(consistency_scores, key=consistency_scores.get)
print(f"\nBest coefficient: alpha={best_alpha:.2f} (consistency={consistency_scores[best_alpha]:.4f})")

# Optionally visualize
import matplotlib.pyplot as plt

alphas_sorted = sorted(consistency_scores.keys())
scores_sorted = [consistency_scores[a] for a in alphas_sorted]

plt.figure(figsize=(8, 4))
plt.plot(alphas_sorted, scores_sorted, marker="o")
plt.axvline(best_alpha, color="red", linestyle="--", label=f"Best α={best_alpha:.2f}")
plt.xlabel("Merge Coefficient (α)")
plt.ylabel("Generation Consistency Score")
plt.title("Unsupervised Coefficient Selection via Generation Consistency")
plt.legend()
plt.tight_layout()
plt.savefig("consistency_curve.png", dpi=150)
plt.show()
```

---

## Similarity Metrics

Three options depending on speed vs. quality trade-off:

| Metric | Speed | Quality | Notes |
|---|---|---|---|
| **Token overlap (Jaccard)** | Fast | Low | Suitable for quick prototyping |
| **ROUGE-L** | Medium | Medium | Good balance; install `rouge-score` |
| **BERTScore** | Slow | High | Best semantic sensitivity; requires GPU |

```python
# BERTScore alternative (higher quality)
from bert_score import score as bert_score

def bertscore_similarity_batch(texts_a, texts_b, lang="en"):
    P, R, F1 = bert_score(texts_a, texts_b, lang=lang, verbose=False)
    return F1.mean().item()

# Replace text_similarity call with:
# score = bertscore_similarity_batch(responses_curr, responses_neighbor)
```

---

## Applying to Different Merge Methods

### SLERP (`t` parameter)

```python
# Search t ∈ [0.0, 1.0]; interior candidates avoid boundary collapse
candidates = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
```

### Task Arithmetic / TIES (`lambda` or `weight`)

```python
# Lambda can exceed 1.0; search a wider range
candidates = [0.3, 0.5, 0.7, 1.0, 1.2, 1.5]
```

### Multi-coefficient (e.g., two models with different weights)

When searching over a 2D coefficient space (e.g., `w1` and `w2 = 1 - w1`), the 1D search over `w1` is sufficient since `w2` is determined:

```python
# 1D search: w1 ∈ [0.2, 0.8], w2 = 1 - w1
candidates = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]
# Map alpha -> (alpha, 1-alpha) for the merge config
```

For higher-dimensional searches (3+ models), perform coordinate-wise consistency optimization:

```python
def coordinate_wise_search(base_weights, coord_idx, candidates, all_responses_fn, delta=0.1):
    """Optimize one coefficient at a time, holding others fixed."""
    best_score = -1
    best_alpha = base_weights[coord_idx]
    for alpha in candidates:
        weights = base_weights.copy()
        weights[coord_idx] = alpha
        # Normalize if weights should sum to 1
        weights = [w / sum(weights) for w in weights]
        responses = all_responses_fn(weights)
        score = generation_consistency_from_responses(responses, delta)
        if score > best_score:
            best_score = score
            best_alpha = alpha
    return best_alpha, best_score
```

---

## Full Pipeline (End-to-End)

```python
import numpy as np
from typing import List, Dict

def unsupervised_coefficient_search(
    model_a: str,
    model_b: str,
    eval_prompts: List[str],
    method: str = "slerp",
    candidates: List[float] = None,
    delta: float = 0.1,
    similarity_metric: str = "rougeL",
    output_root: str = "/tmp/merge_candidates",
    max_new_tokens: int = 128,
) -> Dict:
    """
    Unsupervised coefficient search using generation consistency.

    Args:
        model_a: Path or HuggingFace ID of first model (or base model).
        model_b: Path or HuggingFace ID of second model.
        eval_prompts: Small set of unlabeled prompts (50-200 recommended).
        method: Merge method ('slerp', 'task_arithmetic', 'ties').
        candidates: List of coefficient values to search over.
        delta: Step size for neighbor comparison.
        similarity_metric: 'rougeL', 'token_overlap', or 'bertscore'.
        output_root: Directory to store temporary merged models.
        max_new_tokens: Max tokens to generate per prompt.

    Returns:
        dict with 'best_alpha', 'best_path', 'scores', 'all_responses'.
    """
    if candidates is None:
        candidates = [round(x, 2) for x in np.arange(0.2, 0.9, 0.1).tolist()]

    os.makedirs(output_root, exist_ok=True)

    # Step 1-2: Merge all candidates
    merged_paths = {}
    for alpha in candidates:
        merged_paths[alpha] = merge_with_coefficient(alpha, model_a, model_b, output_root, method)

    # Step 3: Generate responses
    all_responses = {}
    for alpha in candidates:
        all_responses[alpha] = generate_responses(merged_paths[alpha], eval_prompts, max_new_tokens)

    # Step 4: Score consistency
    scores = {}
    for alpha in candidates:
        scores[alpha] = generation_consistency(alpha, all_responses, candidates, delta, similarity_metric)

    # Step 5: Select best
    best_alpha = max(scores, key=scores.get)

    return {
        "best_alpha": best_alpha,
        "best_path": merged_paths[best_alpha],
        "scores": scores,
        "all_responses": all_responses,
    }


# Usage
result = unsupervised_coefficient_search(
    model_a="mistralai/Mistral-7B-v0.1",
    model_b="teknium/OpenHermes-2.5-Mistral-7B",
    eval_prompts=eval_prompts,   # ~100 unlabeled prompts
    method="slerp",
    candidates=[0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8],
)
print(f"Best coefficient: {result['best_alpha']}")
print(f"Best model path: {result['best_path']}")
```

---

## Practical Tips

**Dataset selection**: Any unlabeled text in the target domain works. Even 50 samples often suffice; diminishing returns beyond 200.

**Step size δ**: Use `δ = 0.1` for a search grid with step 0.1. For finer grids (e.g., step 0.05), set `δ = 0.05` accordingly.

**Boundary candidates**: Candidates at `alpha_min` or `alpha_max` have only one neighbor, so their scores are one-sided and tend to be underestimated. Consider excluding them from final selection, or widening the search range.

**Compute cost**: N merges + N inference passes. Inference is the bottleneck; use greedy decoding and short outputs to keep it fast. With N=7 candidates and 100 prompts, this typically takes 10–30 minutes on a single GPU.

**When consistency is flat**: If the curve shows no clear peak, the two models may be too dissimilar or too similar. Try adjusting density/dropout parameters first, then re-search.

---

## References

- **Paper**: arXiv:2503.23733 — Unsupervised coefficient tuning via generation consistency
- **ROUGE**: `pip install rouge-score`
- **BERTScore**: `pip install bert-score`
- **mergekit**: https://github.com/arcee-ai/mergekit

# Autonomous Experiment Loop (autoresearch pattern)

A systematic workflow for rapid ML experimentation, drawn from Karpathy's autoresearch project.
Use this when iterating on architecture or hyperparameters and you want to run many quick experiments.

## Core idea

Run every experiment with a **fixed time budget** (e.g., 5 minutes) so results are directly comparable.
This enables ~12 experiments/hour or ~100 overnight. The key insight: wall-clock time is a better
budget unit than steps or epochs because it naturally accounts for throughput differences between configs.

## The experiment loop

```
1. Read current state (results.tsv, train.py)
2. Decide what to try next (one change at a time)
3. Modify train.py
4. git commit -m "description of change"
5. Run training (with timeout)
6. Parse results from stdout
7. Decision:
   - If val_bpb improved → KEEP (advance branch)
   - If val_bpb worsened → DISCARD (git reset --hard HEAD~1)
   - If crashed → FIX trivial bugs and retry, or LOG and move on
8. Append result to results.tsv
9. Repeat
```

## Results tracking

```
commit    val_bpb   memory_gb  status   description
a1b2c3d   0.9979    44.0       keep     baseline
b2c3d4e   0.9932    44.2       keep     increase matrix LR to 0.04
c3d4e5f   1.0050    44.0       discard  switch to GeLU activation
d4e5f6g   0.0000    0.0        crash    double model width (OOM)
```

## Key principles

### Single-file constraint
Confine all changes to one file (e.g., `train.py`). This makes diffs reviewable and rollbacks clean.
Everything — model, optimizer, data loading, evaluation — lives in one file during experimentation.
Refactor into modules only after the experiment phase.

### Keep/discard discipline
- **Keep**: val metric improved (or equal with less memory/time)
- **Discard**: val metric worsened, regardless of how clever the idea was
- **The simplicity criterion**: all else being equal, simpler is better. Removing something and
  getting equal results is a great outcome — it means the removed thing was dead weight.

### Crash recovery
- **Trivial crash** (typo, shape mismatch): fix and retry the same experiment
- **Fundamental crash** (OOM, numerical instability): log as `crash`, move on
- **Timeout** (>2x budget): kill the process, log as `timeout`

### Fixed budget comparison
```python
import time

TIME_BUDGET = 300  # 5 minutes
t_start = time.time()

for step in range(max_steps):
    # ... training step ...
    elapsed = time.time() - t_start
    if elapsed >= TIME_BUDGET:
        break
```

## Tokenizer training

When training from scratch, train a BPE tokenizer on your data:

```python
import rustbpe

# GPT-4 split pattern (handles code, numbers, whitespace well)
SPLIT_PATTERN = r"""'(?i:[sdmt]|ll|ve|re)|[^\r\n\p{L}\p{N}]?+\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]++[\r\n]*|\s*[\r\n]|\s+(?!\S)|\s+"""

# Train tokenizer
tokenizer = rustbpe.Tokenizer()
tokenizer.train(
    text_iterator,        # yields text chunks
    vocab_size=8192,      # small vocab for quick experiments; 32K+ for production
    split_pattern=SPLIT_PATTERN,
    special_tokens=["<|bos|>"]
)

# Build token_bytes lookup for BPB evaluation
token_bytes = torch.zeros(vocab_size, dtype=torch.long)
for i in range(vocab_size):
    token_bytes[i] = len(tokenizer.decode([i]).encode("utf-8"))
```

### Vocab size tradeoffs

| Vocab Size | Use Case | Notes |
|-----------|----------|-------|
| 4K-8K | Quick experiments, small models | Faster tokenizer training, more tokens per doc |
| 32K | Standard LLM pretraining | Good balance of compression and vocab coverage |
| 64K-128K | Multilingual, code-heavy | Better compression but larger embedding table |

## Data preparation

### Shard-based train/val split
```python
# Use last shard as validation (always the same data for consistent eval)
shard_files = sorted(glob("data/shard_*.bin"))
val_shard = shard_files[-1]       # pinned validation
train_shards = shard_files[:-1]   # everything else
```

Split by shard, not by random sampling — this ensures no data leakage and makes
the val set deterministic across experiments.

## Environment setup

```python
import os
os.environ["PYTORCH_ALLOC_CONF"] = "expandable_segments:True"  # BEFORE torch import
os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"               # clean logs

import torch
```

Setting `PYTORCH_ALLOC_CONF` before importing torch is important — it configures the
CUDA allocator at initialization time.

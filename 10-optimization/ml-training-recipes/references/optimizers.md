# Optimizer Patterns Reference

Deep dive into optimizer configurations for modern LLM training. Referenced from the main SKILL.md.

## Table of Contents

1. [AdamW Best Practices](#adamw-best-practices)
2. [Muon Optimizer](#muon-optimizer)
3. [Hybrid MuonAdamW](#hybrid-muonadamw)
4. [Per-Parameter-Group Configuration](#per-parameter-group-configuration)
5. [LR Scaling Rules](#lr-scaling-rules)
6. [Weight Decay Strategies](#weight-decay-strategies)
7. [Momentum Scheduling](#momentum-scheduling)
8. [Compiled Optimizer Steps](#compiled-optimizer-steps)

---

## AdamW Best Practices

AdamW (decoupled weight decay) is the baseline optimizer for everything that isn't a 2D matrix
in modern LLM training.

```python
# Typical hyperparameters for LLM pretraining
optimizer = torch.optim.AdamW(
    params,
    lr=3e-4,
    betas=(0.9, 0.95),    # β1=0.9, β2=0.95 (not the default 0.999)
    eps=1e-8,
    weight_decay=0.1,
)
```

### Key differences from default PyTorch AdamW

- **β2 = 0.95** (not 0.999): Faster adaptation to changing gradient statistics. The default 0.999
  has a ~1000-step memory, too slow for the rapidly changing loss landscape of LLM training.
- **β1 = 0.8-0.9**: Some modern recipes use 0.8 for faster momentum.
- **eps = 1e-10** (not 1e-8): Smaller epsilon for bf16 training where gradients can be very small. autoresearch uses 1e-10; 1e-8 can cause stale updates when gradient second moments are tiny.

### Fused step (for torch.compile)

To avoid recompilation when hyperparameters change, use 0-D CPU tensors:

```python
# Create once at init
self._lr_t = torch.tensor(0.0, dtype=torch.float32, device="cpu")

# Fill before each step (no recompile)
self._lr_t.fill_(group['lr'])

@torch.compile(dynamic=False, fullgraph=True)
def adamw_step_fused(p, grad, exp_avg, exp_avg_sq, step_t, lr_t, beta1_t, beta2_t, eps_t, wd_t):
    p.mul_(1 - lr_t * wd_t)
    exp_avg.lerp_(grad, 1 - beta1_t)
    exp_avg_sq.lerp_(grad.square(), 1 - beta2_t)
    bias1 = 1 - beta1_t ** step_t
    bias2 = 1 - beta2_t ** step_t
    denom = (exp_avg_sq / bias2).sqrt() + eps_t
    p.add_(exp_avg / denom, alpha=-lr_t / bias1)
```

---

## Muon Optimizer

Muon is designed for 2D matrix (weight) parameters. It uses Nesterov momentum followed by
"Polar Express" orthogonalization — a fast Newton-Schulz iteration that approximates the
matrix polar decomposition (finding the nearest orthogonal matrix to the gradient).

### Why orthogonalize gradients?

Standard gradient descent updates can create rank-deficient weight matrices over time.
Orthogonalizing the update direction encourages diverse feature learning and prevents
mode collapse in the weight space. Think of it as giving every update direction "equal voice."

### Core algorithm

1. **Nesterov momentum**: Standard momentum with look-ahead
2. **Polar Express**: Newton-Schulz iterations to orthogonalize the gradient matrix
3. **NorMuon**: Variance reduction that normalizes per-row or per-column
4. **Cautious update**: Only update weights where the gradient agrees with the parameter sign

```python
@torch.compile(dynamic=False, fullgraph=True)
def muon_step_fused(grads, params, momentum_buf, second_momentum_buf,
                    momentum, lr, wd, beta2, ns_steps, red_dim):
    # 1. Nesterov momentum
    momentum_buf.lerp_(grads, 1 - momentum)
    g = grads.lerp_(momentum_buf, momentum)

    # 2. Polar Express (Newton-Schulz orthogonalization)
    X = g.bfloat16()
    X = X / (X.norm(dim=(-2, -1), keepdim=True) * 1.02 + 1e-6)
    coeffs = [  # Pre-computed optimal coefficients
        (8.16, -22.48, 15.88),
        (4.04, -2.81, 0.50),
        (3.89, -2.77, 0.51),
        (3.29, -2.37, 0.46),
        (2.35, -1.71, 0.42),
    ]
    # Choose which dimension to contract based on matrix shape
    if g.size(-2) > g.size(-1):  # tall matrix
        for a, b, c in coeffs[:ns_steps]:
            A = X.mT @ X
            B = b * A + c * (A @ A)
            X = a * X + X @ B
    else:  # wide matrix
        for a, b, c in coeffs[:ns_steps]:
            A = X @ X.mT
            B = b * A + c * (A @ A)
            X = a * X + B @ X
    g = X

    # 3. NorMuon variance reduction
    v_mean = g.float().square().mean(dim=red_dim, keepdim=True)
    second_momentum_buf.lerp_(v_mean, 1 - beta2)
    step_size = second_momentum_buf.clamp_min(1e-10).rsqrt()
    # Normalize so total norm is preserved
    ...

    # 4. Cautious weight decay + update
    mask = (g * params) >= 0  # only decay where gradient agrees
    params.sub_(lr * g + lr * wd * params * mask)
```

### Muon hyperparameters

| Parameter | Typical Value | Notes |
|-----------|--------------|-------|
| lr | 0.02-0.04 | Scaled by `max(1, rows/cols)^0.5` for non-square matrices |
| momentum | 0.95 | Warm up from 0.85 over first 300 steps |
| ns_steps | 5 | Number of Newton-Schulz iterations (more = better approx, slower) |
| beta2 | 0.95 | For second moment tracking in NorMuon |
| weight_decay | 0.1-0.2 | Cautious (only where gradient agrees with param) |

---

## Hybrid MuonAdamW

The key insight: different parameter types benefit from different optimization strategies.

| Parameter Type | Optimizer | Why |
|---------------|-----------|-----|
| 2D weight matrices (attention, MLP) | Muon | Benefits from orthogonalization |
| Token embeddings | AdamW | Sparse updates, not a matrix transform |
| Unembedding (lm_head) | AdamW | Needs lower LR for stability |
| Per-layer scalars | AdamW | Too small for matrix methods |
| Value embeddings | AdamW | Same as token embeddings |

```python
class MuonAdamW(torch.optim.Optimizer):
    def step(self):
        for group in self.param_groups:
            if group['kind'] == 'adamw':
                self._step_adamw(group)
            elif group['kind'] == 'muon':
                self._step_muon(group)
```

### Grouping Muon parameters

Group Muon parameters by shape for efficient stacked updates:

```python
# Group same-shape params together
for shape in sorted({p.shape for p in matrix_params}):
    group_params = [p for p in matrix_params if p.shape == shape]
    param_groups.append({
        'kind': 'muon',
        'params': group_params,
        'lr': matrix_lr,
        'momentum': 0.95,
        'ns_steps': 5,
    })
```

This enables `torch.stack` for vectorized Newton-Schulz across all params of the same shape.

---

## Per-Parameter-Group Configuration

A complete optimizer setup for modern LLM training:

```python
def setup_optimizer(model, d_model=768):
    lr_scale = (d_model / 768) ** -0.5

    param_groups = [
        # Unembedding: low LR, no weight decay
        {
            'kind': 'adamw',
            'params': list(model.lm_head.parameters()),
            'lr': 0.004 * lr_scale,
            'betas': (0.8, 0.95),
            'eps': 1e-10,
            'weight_decay': 0.0,
        },
        # Token embeddings: higher LR (sparse updates need bigger steps)
        {
            'kind': 'adamw',
            'params': list(model.wte.parameters()),
            'lr': 0.6 * lr_scale,
            'betas': (0.8, 0.95),
            'eps': 1e-10,
            'weight_decay': 0.0,
        },
        # Transformer matrices: Muon
        {
            'kind': 'muon',
            'params': list(model.transformer.h.parameters()),
            'lr': 0.04,
            'momentum': 0.95,
            'ns_steps': 5,
            'beta2': 0.95,
            'weight_decay': 0.2,
        },
        # Per-layer scalars: separate AdamW
        {
            'kind': 'adamw',
            'params': [model.resid_lambdas],
            'lr': 0.005 * lr_scale,
            'betas': (0.8, 0.95),
            'eps': 1e-10,
            'weight_decay': 0.0,
        },
    ]

    # Store initial LR for scheduling
    optimizer = MuonAdamW(param_groups)
    for group in optimizer.param_groups:
        group["initial_lr"] = group["lr"]
    return optimizer
```

---

## LR Scaling Rules

### By model dimension

As models get wider, per-parameter learning rates should decrease:

```
lr_effective = lr_base * (d_model / d_reference) ^ (-0.5)
```

This comes from the observation that larger matrices amplify gradient norms. Scaling by `1/√d`
keeps the effective step size constant across model sizes.

### By matrix shape (Muon specific)

Non-square matrices need LR adjustment:

```python
effective_lr = lr * max(1.0, rows / cols) ** 0.5
```

This compensates for the asymmetry in the orthogonalization process.

---

## Weight Decay Strategies

### Linear decay to zero

```python
def get_weight_decay(progress):
    return base_wd * (1 - progress)
```

Rationale: early in training, regularization prevents overfitting to initial data distribution.
Late in training, we want the model to fully commit to learned features.

### Cautious weight decay (Muon)

Only apply weight decay where the gradient and parameter have the same sign:

```python
mask = (gradient * parameter) >= 0
parameter -= lr * (gradient + wd * parameter * mask)
```

This prevents weight decay from fighting the gradient — if the gradient says "increase this weight"
but weight decay says "decrease it", cautious WD skips the decay for that element.

### What to weight-decay

- **Yes**: Transformer weight matrices (attention projections, MLP weights)
- **No**: Embeddings, biases, layer norm parameters, per-layer scalars

---

## Momentum Scheduling

Warm up momentum over the first few hundred steps:

```python
def get_muon_momentum(step, warmup_steps=300):
    frac = min(step / warmup_steps, 1.0)
    return 0.85 + frac * (0.95 - 0.85)  # 0.85 → 0.95
```

Lower momentum early in training allows faster adaptation when the loss landscape is changing
rapidly. As training stabilizes, higher momentum smooths the updates.

---

## Compiled Optimizer Steps

When using `torch.compile`, avoid recompilation from changing scalar values by using 0-D tensors:

```python
class CompiledOptimizer:
    def __init__(self):
        # 0-D CPU tensors: changing their values doesn't trigger recompile
        self._lr = torch.tensor(0.0, dtype=torch.float32, device="cpu")
        self._wd = torch.tensor(0.0, dtype=torch.float32, device="cpu")

    def step(self, group):
        self._lr.fill_(group['lr'])        # update value
        self._wd.fill_(group['weight_decay'])
        compiled_step(params, grads, self._lr, self._wd)  # no recompile
```

This is critical for training loops where LR changes every step — without this pattern,
`torch.compile` would recompile the optimizer step function every time the LR changes,
defeating the purpose of compilation.

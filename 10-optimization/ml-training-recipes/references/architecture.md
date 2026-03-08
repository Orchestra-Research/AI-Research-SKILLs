# Architecture Patterns Reference

Detailed code patterns for modern transformer architectures. Referenced from the main SKILL.md.

## Table of Contents

1. [RMSNorm](#rmsnorm)
2. [Rotary Position Embeddings (RoPE)](#rotary-position-embeddings-rope)
3. [Flash Attention with Sliding Window](#flash-attention-with-sliding-window)
4. [Grouped Query Attention (GQA)](#grouped-query-attention-gqa)
5. [Value Embedding (ResFormer)](#value-embedding-resformer)
6. [Activation Functions](#activation-functions)
7. [Residual Scaling](#residual-scaling)
8. [Logit Soft Capping](#logit-soft-capping)
9. [Full Transformer Block](#full-transformer-block)
10. [Model Configuration Pattern](#model-configuration-pattern)

---

## RMSNorm

Root Mean Square Layer Normalization — drops the mean-centering of LayerNorm, keeping only the
variance normalization. ~15% faster with equivalent quality for transformers.

```python
def norm(x):
    return F.rms_norm(x, (x.size(-1),))
```

Apply pre-norm (before attention and MLP), not post-norm:
```python
class Block(nn.Module):
    def forward(self, x):
        x = x + self.attn(norm(x))   # pre-norm
        x = x + self.mlp(norm(x))    # pre-norm
        return x
```

Also normalize the final output before the unembedding layer:
```python
x = norm(x)
logits = self.lm_head(x)
```

---

## Rotary Position Embeddings (RoPE)

RoPE encodes position through rotation of query/key pairs. It's relative (only depends on
distance between tokens) and naturally handles varying sequence lengths.

### Precomputation

Compute cos/sin tables once at model init, not every forward pass:

```python
def precompute_rotary(seq_len, head_dim, base=10000, device=None):
    """Precompute RoPE cos/sin for positions [0, seq_len)."""
    channel_range = torch.arange(0, head_dim, 2, dtype=torch.float32, device=device)
    inv_freq = 1.0 / (base ** (channel_range / head_dim))
    t = torch.arange(seq_len, dtype=torch.float32, device=device)
    freqs = torch.outer(t, inv_freq)
    cos, sin = freqs.cos().bfloat16(), freqs.sin().bfloat16()
    # Shape: [1, seq_len, 1, head_dim//2] for broadcasting
    return cos[None, :, None, :], sin[None, :, None, :]
```

Register as non-persistent buffers (not saved in state_dict, but moved with `.to(device)`):
```python
self.register_buffer("cos", cos, persistent=False)
self.register_buffer("sin", sin, persistent=False)
```

### Application

```python
def apply_rotary_emb(x, cos, sin):
    """Apply RoPE to query or key tensor. x shape: [B, T, H, D]."""
    d = x.shape[3] // 2
    x1, x2 = x[..., :d], x[..., d:]
    y1 = x1 * cos + x2 * sin
    y2 = x1 * (-sin) + x2 * cos
    return torch.cat([y1, y2], dim=3)
```

### Tips
- Pre-allocate for `seq_len * 10` (or max expected length) to avoid recomputation
- Apply RoPE **after** splitting into heads but **before** attention
- Normalize q and k **after** RoPE: `q, k = norm(q), norm(k)` (QK-norm stabilizes training)

---

## Flash Attention with Sliding Window

Flash Attention computes exact attention in O(N) memory instead of O(N^2), and is significantly
faster due to IO-awareness.

### Sliding Window Pattern

Use a repeating pattern like `SSSL` — most layers use short (local) windows, with periodic long
(global) windows. The last layer always gets full context.

```python
def compute_window_sizes(config):
    pattern = config.window_pattern.upper()  # e.g., "SSSL"
    long_window = config.sequence_len
    short_window = long_window // 2  # half context

    window_sizes = []
    for layer_idx in range(config.n_layer):
        char = pattern[layer_idx % len(pattern)]
        if char == "L":
            window_sizes.append((long_window, 0))
        else:
            window_sizes.append((short_window, 0))

    # Last layer always gets full context
    window_sizes[-1] = (long_window, 0)
    return window_sizes
```

This saves ~25% attention compute while maintaining quality — most layers only need local context,
and information propagates through the occasional global layer.

### Integration

```python
# Using Flash Attention 3
from kernels import get_kernel
fa3 = get_kernel("kernels-community/flash-attn3").flash_attn_interface

y = fa3.flash_attn_func(q, k, v, causal=True, window_size=window_size)

# Or using PyTorch native (2.0+)
y = F.scaled_dot_product_attention(q, k, v, is_causal=True)
```

---

## Grouped Query Attention (GQA)

Use fewer KV heads than query heads. Saves memory/compute with minimal quality loss.

```python
class CausalSelfAttention(nn.Module):
    def __init__(self, config):
        super().__init__()
        self.n_head = config.n_head        # e.g., 12
        self.n_kv_head = config.n_kv_head  # e.g., 4 (GQA) or 1 (MQA)
        self.head_dim = config.n_embd // config.n_head

        assert config.n_head % config.n_kv_head == 0

        self.c_q = nn.Linear(config.n_embd, self.n_head * self.head_dim, bias=False)
        self.c_k = nn.Linear(config.n_embd, self.n_kv_head * self.head_dim, bias=False)
        self.c_v = nn.Linear(config.n_embd, self.n_kv_head * self.head_dim, bias=False)
        self.c_proj = nn.Linear(config.n_embd, config.n_embd, bias=False)
```

Common ratios:
- **MHA** (multi-head): `n_kv_head = n_head` — full quality, most memory
- **GQA**: `n_kv_head = n_head / 4` — good tradeoff
- **MQA** (multi-query): `n_kv_head = 1` — most memory savings, slight quality loss

---

## Value Embedding (ResFormer)

Alternating layers receive value embeddings — learned per-token vectors added to the V projection
with an input-dependent gate. This creates a "value residual stream" parallel to the main residual.

```python
def has_ve(layer_idx, n_layer):
    """Alternating layers get value embeddings, last layer always included."""
    return layer_idx % 2 == (n_layer - 1) % 2

# In attention forward:
if ve is not None:
    ve = ve.view(B, T, self.n_kv_head, self.head_dim)
    # Input-dependent gate: sigmoid output scaled by 2 (neutral at init)
    gate = 2 * torch.sigmoid(self.ve_gate(x[..., :gate_channels]))
    v = v + gate.unsqueeze(-1) * ve
```

Initialize gate weights to zero so `sigmoid(0) = 0.5`, scaled by 2 = 1.0 (neutral start):
```python
nn.init.zeros_(block.attn.ve_gate.weight)
```

---

## Activation Functions

### ReluSquared (recommended for simplicity)
```python
def forward(self, x):
    x = self.c_fc(x)
    x = F.relu(x).square()  # sparse + smooth
    x = self.c_proj(x)
    return x
```
Benefits: naturally sparse (ReLU zeros + squaring), simple, good performance.

### SwiGLU (recommended for quality)
```python
class SwiGLUMLP(nn.Module):
    def __init__(self, config):
        hidden = int(config.n_embd * 8 / 3)  # ~2.67x, compensate for gate
        hidden = ((hidden + 63) // 64) * 64   # round to 64 for efficiency
        self.w1 = nn.Linear(config.n_embd, hidden, bias=False)
        self.w2 = nn.Linear(hidden, config.n_embd, bias=False)
        self.w3 = nn.Linear(config.n_embd, hidden, bias=False)  # gate

    def forward(self, x):
        return self.w2(F.silu(self.w1(x)) * self.w3(x))
```

### GELU (safe default)
```python
x = F.gelu(self.c_fc(x))
```

---

## Residual Scaling

Learnable per-layer residual scaling stabilizes deep networks:

```python
class GPT(nn.Module):
    def __init__(self, config):
        self.resid_lambdas = nn.Parameter(torch.ones(config.n_layer))
        self.x0_lambdas = nn.Parameter(torch.zeros(config.n_layer))

    def forward(self, idx):
        x = norm(self.wte(idx))
        x0 = x  # save initial representation

        for i, block in enumerate(self.transformer.h):
            # x0 skip connection: mix in initial representation
            x = self.resid_lambdas[i] * x + self.x0_lambdas[i] * x0
            x = block(x, ...)

        return norm(x)
```

Initialize: `resid_lambdas = 1.0` (normal residual), `x0_lambdas = 0.1` (small initial skip).

This helps because:
- Deep networks can have vanishing/exploding residual norms
- x0 skip connections let gradients flow directly to the embedding layer
- Learnable scaling lets the network decide how much skip vs. residual per layer

---

## Logit Soft Capping

Prevents extreme logit values that cause training instability:

```python
softcap = 15
logits = self.lm_head(x).float()  # compute in fp32 for stability
logits = softcap * torch.tanh(logits / softcap)
```

This smoothly clamps logits to [-softcap, +softcap]. Values in the normal range (much smaller
than softcap) pass through nearly unchanged; extreme values are compressed.

---

## Model Configuration Pattern

Use a dataclass for clean configuration:

```python
@dataclass
class GPTConfig:
    sequence_len: int = 2048
    vocab_size: int = 32768
    n_layer: int = 12
    n_head: int = 6
    n_kv_head: int = 6
    n_embd: int = 768
    window_pattern: str = "SSSL"

def build_config(depth, aspect_ratio=64, head_dim=128):
    """Derive model dimensions from depth using aspect ratio."""
    base_dim = depth * aspect_ratio
    model_dim = ((base_dim + head_dim - 1) // head_dim) * head_dim  # round to head_dim
    num_heads = model_dim // head_dim
    return GPTConfig(n_layer=depth, n_head=num_heads, n_kv_head=num_heads, n_embd=model_dim)
```

The aspect ratio pattern (`d_model = depth * ratio`) keeps width proportional to depth,
which empirical research shows is more compute-efficient than scaling width alone.

---

## FLOPs Estimation

For monitoring MFU, estimate FLOPs per token:

```python
def estimate_flops_per_token(model):
    """Forward + backward FLOPs per token (approx 6 * params + attention)."""
    # Main rule: 6 * N (2 for fwd matmuls, 4 for bwd matmuls per param)
    # Exclude embeddings (sparse lookups, not matmuls)
    nparams_dense = sum(p.numel() for p in model.parameters())
    nparams_dense -= model.wte.weight.numel()      # token embedding
    nparams_dense -= model.lm_head.weight.numel()   # if tied, already counted

    # Attention FLOPs: 2 * n_heads * head_dim * seq_len per layer (Q@K + attn@V)
    attn_flops = 0
    for window in model.window_sizes:
        effective_seq = min(window[0], model.config.sequence_len)
        attn_flops += 12 * model.config.n_head * head_dim * effective_seq

    return 6 * nparams_dense + attn_flops
```

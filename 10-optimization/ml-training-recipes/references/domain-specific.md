# Domain-Specific Training Patterns

Patterns for vision, diffusion, and other non-LLM training scenarios. Referenced from SKILL.md.

## Table of Contents

1. [Computer Vision Training](#computer-vision-training)
2. [Diffusion Model Training](#diffusion-model-training)
3. [EMA (Exponential Moving Average) Models](#ema-models)
4. [Contrastive / Self-Supervised Learning](#contrastive--self-supervised-learning)
5. [Fine-Tuning & Transfer Learning](#fine-tuning--transfer-learning)
6. [Multi-GPU / Distributed Training](#multi-gpu--distributed-training)
7. [Checkpointing](#checkpointing)
8. [Data Loading for Images](#data-loading-for-images)

---

## Computer Vision Training

### Data augmentation pipeline

Data augmentation is often more impactful than architecture changes in vision:

```python
import torchvision.transforms.v2 as T

train_transform = T.Compose([
    T.RandomResizedCrop(224, scale=(0.08, 1.0)),
    T.RandomHorizontalFlip(),
    T.RandAugment(num_ops=2, magnitude=9),  # automated augmentation
    T.ToImage(),
    T.ToDtype(torch.float32, scale=True),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

val_transform = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToImage(),
    T.ToDtype(torch.float32, scale=True),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])
```

### MixUp and CutMix

Regularization via input mixing — very effective for classification:

```python
from torchvision.transforms.v2 import MixUp, CutMix

mixup = MixUp(alpha=0.2, num_classes=num_classes)
cutmix = CutMix(alpha=1.0, num_classes=num_classes)
# Apply randomly to each batch
mix_fn = T.RandomChoice([mixup, cutmix])

for images, targets in train_loader:
    images, targets = mix_fn(images, targets)
    # targets are now soft labels (one-hot blended)
    loss = F.cross_entropy(model(images), targets)
```

### Stochastic depth (drop path)

Randomly drop residual blocks during training — better than dropout for vision:

```python
class DropPath(nn.Module):
    def __init__(self, drop_prob=0.0):
        super().__init__()
        self.drop_prob = drop_prob

    def forward(self, x):
        if not self.training or self.drop_prob == 0.0:
            return x
        keep_prob = 1 - self.drop_prob
        shape = (x.shape[0],) + (1,) * (x.ndim - 1)
        mask = torch.bernoulli(torch.full(shape, keep_prob, device=x.device))
        return x * mask / keep_prob
```

Use linearly increasing drop rates: layer 0 gets 0%, last layer gets max (e.g., 0.2):

```python
drop_rates = [x.item() for x in torch.linspace(0, 0.2, num_layers)]
```

### Label smoothing

```python
loss = F.cross_entropy(logits, targets, label_smoothing=0.1)
```

### Progressive resizing

Train at low resolution first, then increase — saves compute and acts as regularization:

```python
# Phase 1: 160x160, lr=1e-3, epochs 0-60
# Phase 2: 224x224, lr=3e-4, epochs 60-90
# Phase 3: 288x288, lr=1e-4, epochs 90-100
```

### Vision optimizer recipes

```python
# ViT / Vision Transformer
optimizer = torch.optim.AdamW(params, lr=1e-3, weight_decay=0.05, betas=(0.9, 0.999))
# + cosine LR decay, 5-epoch warmup, batch_size=1024

# ConvNeXt / CNN
optimizer = torch.optim.AdamW(params, lr=4e-3, weight_decay=0.05)
# + cosine LR decay, 20-epoch warmup, layer-wise LR decay

# ResNet (classic SGD recipe)
optimizer = torch.optim.SGD(params, lr=0.1, momentum=0.9, weight_decay=1e-4)
# + step LR decay (0.1x at epoch 30, 60, 90)
```

---

## Diffusion Model Training

### Training loop for DDPM-style

```python
import torch.nn.functional as F

def train_step(model, x_0, noise_schedule):
    B = x_0.shape[0]
    # Sample random timesteps
    t = torch.randint(0, noise_schedule.num_timesteps, (B,), device=x_0.device)

    # Sample noise
    noise = torch.randn_like(x_0)

    # Forward diffusion: add noise
    x_t = noise_schedule.q_sample(x_0, t, noise)

    # Predict noise (or v, or x_0)
    pred = model(x_t, t)

    # Simple MSE loss on noise prediction
    loss = F.mse_loss(pred, noise)
    return loss
```

### Noise schedules

```python
# Linear schedule (DDPM original)
betas = torch.linspace(1e-4, 0.02, 1000)

# Cosine schedule (improved DDPM — better for high-res)
def cosine_schedule(timesteps, s=0.008):
    steps = timesteps + 1
    x = torch.linspace(0, timesteps, steps)
    alphas_cumprod = torch.cos((x / timesteps + s) / (1 + s) * torch.pi * 0.5) ** 2
    alphas_cumprod = alphas_cumprod / alphas_cumprod[0]
    betas = 1 - alphas_cumprod[1:] / alphas_cumprod[:-1]
    return torch.clamp(betas, 0.0001, 0.9999)
```

### Flow matching (modern, simpler)

```python
def flow_matching_loss(model, x_0):
    """Conditional flow matching — simpler than DDPM, often better."""
    t = torch.rand(x_0.shape[0], 1, 1, 1, device=x_0.device)  # uniform [0, 1]
    noise = torch.randn_like(x_0)

    # Interpolate between noise and data
    x_t = (1 - t) * noise + t * x_0

    # Target velocity: data - noise
    target = x_0 - noise

    # Predict velocity
    pred = model(x_t, t.squeeze())
    return F.mse_loss(pred, target)
```

### v-prediction (better for low SNR regions)

```python
# v = alpha * noise - sigma * x_0
# Better than epsilon-prediction for high-resolution images
def v_prediction_loss(model, x_0, alpha, sigma):
    noise = torch.randn_like(x_0)
    x_t = alpha * x_0 + sigma * noise
    v_target = alpha * noise - sigma * x_0
    v_pred = model(x_t, t)
    return F.mse_loss(v_pred, v_target)
```

### Classifier-free guidance training

```python
def train_step_cfg(model, x_0, condition, p_uncond=0.1):
    """Train with random condition dropout for classifier-free guidance."""
    # Randomly drop condition with probability p_uncond
    mask = torch.rand(x_0.shape[0]) < p_uncond
    condition_masked = condition.clone()
    condition_masked[mask] = 0  # or null embedding

    t = torch.randint(0, T, (x_0.shape[0],), device=x_0.device)
    noise = torch.randn_like(x_0)
    x_t = q_sample(x_0, t, noise)

    pred = model(x_t, t, condition_masked)
    return F.mse_loss(pred, noise)
```

### Diffusion model tips

- **EMA is essential** — use EMA weights for inference (see EMA section below)
- **Large batch sizes** work well (256-2048 for image diffusion)
- **AdamW** with lr=1e-4, no weight decay on biases/norms
- **No LR warmup** needed for most diffusion models (just constant LR works)
- **Train for many steps** — diffusion models are hungry (1M+ steps for ImageNet quality)
- **Monitor FID** every N steps on a fixed set of samples, not every step (expensive)

---

## EMA Models

Exponential Moving Average of weights produces smoother, higher-quality models for inference.
Essential for diffusion models, also useful for any generative model or self-supervised learning.

```python
class EMA:
    def __init__(self, model, decay=0.9999):
        self.decay = decay
        self.shadow = {name: param.clone().detach()
                       for name, param in model.named_parameters()}

    @torch.no_grad()
    def update(self, model):
        for name, param in model.named_parameters():
            self.shadow[name].lerp_(param.data, 1 - self.decay)

    def apply(self, model):
        """Swap model weights with EMA weights for inference."""
        self.backup = {name: param.clone()
                       for name, param in model.named_parameters()}
        for name, param in model.named_parameters():
            param.data.copy_(self.shadow[name])

    def restore(self, model):
        """Restore original weights after inference."""
        for name, param in model.named_parameters():
            param.data.copy_(self.backup[name])
```

### Usage in training loop

```python
ema = EMA(model, decay=0.9999)

for step, (x, y) in enumerate(train_loader):
    loss = model(x, y)
    loss.backward()
    optimizer.step()
    optimizer.zero_grad()

    ema.update(model)  # update EMA after each step

    # For evaluation: temporarily swap to EMA weights
    if step % eval_interval == 0:
        ema.apply(model)
        val_metric = evaluate(model, val_loader)
        ema.restore(model)
```

### EMA decay warmup

Start with lower decay and ramp up to avoid the EMA lagging during early fast learning:

```python
def ema_decay_schedule(step, base_decay=0.9999, warmup_steps=2000):
    return min(base_decay, 1 - (1 - base_decay) * (1 + step) / (1 + warmup_steps))
```

---

## Contrastive / Self-Supervised Learning

### SimCLR-style contrastive loss

```python
def contrastive_loss(z1, z2, temperature=0.5):
    """NT-Xent loss for contrastive learning."""
    z1 = F.normalize(z1, dim=1)
    z2 = F.normalize(z2, dim=1)

    B = z1.shape[0]
    z = torch.cat([z1, z2], dim=0)  # [2B, D]
    sim = z @ z.T / temperature     # [2B, 2B]

    # Mask out self-similarity
    mask = ~torch.eye(2 * B, dtype=torch.bool, device=z.device)
    sim = sim.masked_fill(~mask, -1e9)

    # Positive pairs: (i, i+B) and (i+B, i)
    labels = torch.cat([torch.arange(B, 2*B), torch.arange(B)], dim=0).to(z.device)
    return F.cross_entropy(sim, labels)
```

### Key patterns for self-supervised

- **Two augmented views** of same image → attract; different images → repel
- **Large batch sizes** critical (4096+ for SimCLR) — more negatives = better
- **Projection head** (MLP) between backbone and loss — discard after pretraining
- **LARS/LAMB optimizer** for very large batch training
- **Momentum encoder** (MoCo, BYOL) — use EMA of encoder as the target network

---

## Fine-Tuning & Transfer Learning

### Layer-wise LR decay

Deeper (earlier) layers get smaller LR — they need less adaptation:

```python
def get_layer_lrs(model, base_lr, decay_factor=0.65, num_layers=12):
    """Assign exponentially decaying LR to each layer."""
    param_groups = []
    for i in range(num_layers):
        lr = base_lr * (decay_factor ** (num_layers - 1 - i))
        layer_params = get_layer_params(model, i)  # implement per architecture
        param_groups.append({"params": layer_params, "lr": lr})

    # Head gets full LR
    param_groups.append({"params": model.head.parameters(), "lr": base_lr})
    return param_groups
```

### Freezing strategies

```python
# Strategy 1: Freeze all, unfreeze head only
for param in model.parameters():
    param.requires_grad = False
for param in model.head.parameters():
    param.requires_grad = True

# Strategy 2: Gradual unfreezing (from top layers down)
def unfreeze_layers(model, num_layers_to_unfreeze):
    layers = list(model.children())
    for layer in layers[-num_layers_to_unfreeze:]:
        for param in layer.parameters():
            param.requires_grad = True

# Strategy 3: LoRA (low-rank adaptation) — efficient for large models
# Only train small low-rank matrices added to existing weights
# Saves memory and prevents catastrophic forgetting
```

### Fine-tuning tips

- **Lower LR** than pretraining (10-100x smaller)
- **Shorter training** (5-20 epochs typically)
- **Freeze BatchNorm** statistics: `model.eval()` for BN layers but `model.train()` for dropout
- **Warmup is important** — prevents destroying pretrained features early on

---

## Multi-GPU / Distributed Training

### DDP (DistributedDataParallel) — most common

```python
import torch.distributed as dist
from torch.nn.parallel import DistributedDataParallel as DDP

# Init process group
dist.init_process_group(backend="nccl")
local_rank = int(os.environ["LOCAL_RANK"])
torch.cuda.set_device(local_rank)

# Wrap model
model = model.to(local_rank)
model = DDP(model, device_ids=[local_rank])

# Use DistributedSampler for data
sampler = torch.utils.data.distributed.DistributedSampler(dataset)
loader = DataLoader(dataset, sampler=sampler, batch_size=per_gpu_batch)

# Remember to set epoch for proper shuffling
for epoch in range(num_epochs):
    sampler.set_epoch(epoch)
```

### FSDP (Fully Sharded Data Parallel) — for large models

```python
from torch.distributed.fsdp import FullyShardedDataParallel as FSDP

model = FSDP(
    model,
    auto_wrap_policy=size_based_auto_wrap_policy,  # wrap layers > threshold
    mixed_precision=MixedPrecision(
        param_dtype=torch.bfloat16,
        reduce_dtype=torch.bfloat16,
        buffer_dtype=torch.bfloat16,
    ),
)
```

### Scaling rules

- **Linear scaling**: When scaling batch_size by k, scale LR by k (up to a point)
- **Square root scaling**: `lr_new = lr_base * sqrt(batch_new / batch_base)` — more conservative, often works better
- **Warmup**: Scale warmup duration with batch size increase
- **Gradient accumulation**: Equivalent to larger batch size without more GPUs

---

## Checkpointing

### Save/load with proper state

```python
def save_checkpoint(model, optimizer, scheduler, step, path):
    torch.save({
        'step': step,
        'model_state_dict': model.state_dict(),
        'optimizer_state_dict': optimizer.state_dict(),
        'scheduler_state_dict': scheduler.state_dict() if scheduler else None,
        'rng_state': torch.cuda.get_rng_state(),
    }, path)

def load_checkpoint(model, optimizer, scheduler, path):
    ckpt = torch.load(path, map_location='cpu', weights_only=False)
    model.load_state_dict(ckpt['model_state_dict'])
    optimizer.load_state_dict(ckpt['optimizer_state_dict'])
    if scheduler and ckpt.get('scheduler_state_dict'):
        scheduler.load_state_dict(ckpt['scheduler_state_dict'])
    torch.cuda.set_rng_state(ckpt['rng_state'])
    return ckpt['step']
```

### Best practices

- Save every N steps (not just every epoch) — long epochs can lose hours of work
- Keep last K checkpoints + best checkpoint (by val metric)
- Save optimizer state for exact resumption — without it, training dynamics change
- For DDP/FSDP: save only on rank 0, load on all ranks

---

## Data Loading for Images

### Efficient ImageFolder with workers

```python
from torch.utils.data import DataLoader
from torchvision.datasets import ImageFolder

train_dataset = ImageFolder(root="data/train", transform=train_transform)

train_loader = DataLoader(
    train_dataset,
    batch_size=256,
    shuffle=True,
    num_workers=8,             # rule of thumb: 4 * num_GPUs
    pin_memory=True,           # faster CPU→GPU transfer
    persistent_workers=True,   # avoid re-spawning workers each epoch
    prefetch_factor=2,         # prefetch 2 batches per worker
    drop_last=True,            # avoid small last batch (bad for BatchNorm)
)
```

### WebDataset for large-scale (millions of images)

```python
import webdataset as wds

dataset = (
    wds.WebDataset("data/train-{000000..000099}.tar")
    .shuffle(1000)
    .decode("pil")
    .to_tuple("jpg", "cls")
    .map_tuple(train_transform, lambda x: x)
    .batched(256)
)
```

### FFCV for maximum throughput

```python
# FFCV can be 3-7x faster than standard PyTorch DataLoader
# Writes data to a custom binary format, then reads with zero-copy
from ffcv.loader import Loader, OrderOption
from ffcv.fields.decoders import RandomResizedCropRGBImageDecoder

loader = Loader(
    "data/train.beton",
    batch_size=256,
    order=OrderOption.QUASI_RANDOM,
    num_workers=8,
    pipelines={
        "image": [RandomResizedCropRGBImageDecoder((224, 224))],
        "label": [IntDecoder(), ToTensor(), ToDevice(device)],
    },
)
```

---

## LLM Data Loading

### Pinned buffers for zero-copy transfers

```python
# Pre-allocate pinned CPU + GPU buffers
cpu_buffer = torch.empty(2 * B * T, dtype=torch.long, pin_memory=True)
gpu_buffer = torch.empty(2 * B * T, dtype=torch.long, device="cuda")
gpu_buffer.copy_(cpu_buffer, non_blocking=True)
```

### Best-fit packing (no padding)

Instead of padding sequences to fixed length (wastes compute), pack documents tightly:
1. Maintain a buffer of tokenized documents
2. For each row, greedily fit the largest document that fits remaining space
3. If nothing fits, crop the shortest to fill exactly
4. Every row starts with BOS token
5. Result: 100% utilization, no wasted tokens

### Infinite iterators

```python
def make_dataloader(split):
    """Yields (x, y, epoch) forever, cycling through data."""
    epoch = 1
    while True:
        for batch in data_source:
            yield process(batch), epoch
        epoch += 1
```

---

## Architecture Pattern Tables

### Transformer / LLM components

| Component | Recommended | Why |
|-----------|------------|-----|
| Normalization | RMSNorm | ~same quality as LayerNorm, fewer ops |
| Position encoding | RoPE | Relative, extrapolates well, standard |
| Attention | Flash Attention 3 | Memory-efficient, faster, exact |
| Activation | ReluSquared or SwiGLU | ReluSquared: sparse. SwiGLU: better quality |
| Residual | Learnable scaling + x0 skip | Stabilizes deep networks |
| Logit cap | Soft capping | `softcap * tanh(logits / softcap)` |
| Init | Zero-init output projections | Residual stream starts clean |
| KV heads | GQA | Saves memory with minimal quality loss |

### Vision (CNN / ViT) components

| Component | Recommended | Why |
|-----------|------------|-----|
| Backbone | ConvNeXt v2 or ViT | ConvNeXt: modern CNN. ViT: scalable |
| Data augmentation | RandAugment + MixUp + CutMix | More impactful than architecture |
| Regularization | Stochastic depth + label smoothing | Better than dropout for vision |
| Optimizer | AdamW (ViT) / SGD+momentum (CNN) | ViTs need adaptive methods |
| Resolution | Progressive resizing | Train small → finetune large |

### Diffusion model components

| Component | Recommended | Why |
|-----------|------------|-----|
| Architecture | U-Net or DiT | DiT scales better |
| Noise schedule | Cosine or flow matching | Flow matching: simpler, state-of-art |
| Loss | MSE on noise or v-prediction | v-prediction better at low SNR |
| EMA | Keep EMA model for inference | Higher quality samples |
| Sampling | DDIM / DPM-Solver++ | Faster than DDPM |

### General supervised

| Component | Recommended | Why |
|-----------|------------|-----|
| Optimizer | AdamW | Safe default |
| Early stopping | Patience 5-10 epochs | Prevents overfitting |
| Class imbalance | Weighted loss or oversampling | Weighted loss is simpler |

---

## BPB Evaluation for Language Models

```python
@torch.no_grad()
def evaluate_bpb(model, val_loader, token_bytes):
    total_nats, total_bytes = 0.0, 0
    for x, y in val_loader:
        loss_per_token = F.cross_entropy(..., reduction='none').view(-1)
        nbytes = token_bytes[y.view(-1)]
        mask = nbytes > 0
        total_nats += (loss_per_token * mask).sum().item()
        total_bytes += nbytes.sum().item()
    return total_nats / (math.log(2) * total_bytes)
```

### EMA smoothed loss

```python
ema_beta = 0.9
smooth_loss = 0
for step in range(num_steps):
    smooth_loss = ema_beta * smooth_loss + (1 - ema_beta) * loss.item()
    debiased = smooth_loss / (1 - ema_beta ** (step + 1))
```

### Final summary format

Print structured output for easy parsing:
```
val_bpb:          0.997900
training_seconds: 300.1
peak_vram_mb:     45060.2
mfu_percent:      39.80
total_tokens_M:   499.6
```

---
name: fine-tuning-serving-openpi
description: Fine-tune and serve Physical Intelligence OpenPI models (pi0, pi0-fast, pi0.5) using JAX or PyTorch backends for robot policy inference across ALOHA, DROID, and LIBERO environments. Use when adapting pi0 models to custom datasets, converting JAX checkpoints to PyTorch, running policy inference servers, or debugging norm stats and GPU memory issues.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [OpenPI, Physical Intelligence, VLA, Robotics, JAX, PyTorch, Fine-Tuning, Policy Serving, ALOHA, DROID, LIBERO, pi0]
dependencies: [jax>=0.4.30, torch>=2.1.0, transformers>=4.40.0, openpi-client>=0.1.0]
---

# OpenPI Fine-Tuning and Serving

End-to-end workflows for fine-tuning and serving Physical Intelligence's OpenPI models (pi0, pi0-fast, pi0.5) on robot manipulation tasks. Covers JAX training, PyTorch training, checkpoint conversion, and policy inference serving.

## Quick start

Serve a pretrained policy and query it:

```bash
uv run scripts/serve_policy.py --env DROID
```

```python
from openpi_client import websocket_client_policy

client = websocket_client_policy.WebsocketClientPolicy(host="localhost", port=8000)
result = client.infer(observation)
actions = result["actions"]  # numpy array of shape (chunk_size, action_dim)
```

## Core concepts

**Model family**: OpenPI implements three model variants from Physical Intelligence:

| Model | Architecture | Speed | Quality | Typical use |
|-------|-------------|-------|---------|-------------|
| pi0 | Flow-matching VLA | Baseline | Highest | Research, complex tasks |
| pi0-fast | Autoregressive action tokens | 2-5x faster | Good | Real-time control |
| pi0.5 | pi0 + improved vision encoder | Baseline | Best | Latest default |

**Key design choices**:
- **Dual backend**: JAX (primary, official training) and PyTorch (community, deployment-friendly)
- **Config-driven**: All training/serving parameters defined in `src/openpi/training/config.py`
- **Norm stats**: Every config requires precomputed normalization statistics before training
- **WebSocket serving**: Policy servers expose a WebSocket API for low-latency inference

**Training loop invariant**: After every config or dataset change, always re-run this cycle:
1. Compute norm stats → 2. Train → 3. Serve checkpoint → 4. Validate inference

## Compute requirements

| Task | GPU | VRAM | Notes |
|------|-----|------|-------|
| Serve pi0.5 (inference) | 1x A100/H100 | ~24 GB | Single GPU sufficient |
| Fine-tune pi0.5 (JAX) | 1x A100 80GB | ~60 GB | Use `fsdp_devices` for multi-GPU |
| Fine-tune pi0 (JAX) | 1x A100 80GB | ~40 GB | Smaller model footprint |
| Fine-tune (PyTorch DDP) | 1-8x A100 | ~40 GB/GPU | torchrun launcher |
| Compute norm stats | CPU or 1x GPU | ~8 GB | Fast, can run on login node |

## When to use vs alternatives

**Use this skill when:**
- Fine-tuning pi0, pi0-fast, or pi0.5 on LeRobot or RLDS datasets
- Serving OpenPI policies for ALOHA, DROID, or LIBERO evaluation
- Converting JAX checkpoints to PyTorch format
- Debugging OpenPI training issues (norm stats, memory, config)

**Use `openvla-oft` instead when:**
- Fine-tuning OpenVLA with continuous action heads and LoRA
- Reproducing OpenVLA-OFT paper results on LIBERO or ALOHA

**Use `cosmos-policy` instead when:**
- Evaluating NVIDIA Cosmos Policy on simulation benchmarks

---

## Workflow 1: JAX fine-tuning on LeRobot data

Copy this checklist and track progress:

```text
JAX Fine-Tuning Progress:
- [ ] Step 1: Select and copy closest training config
- [ ] Step 2: Update dataset mapping and base checkpoint
- [ ] Step 3: Compute normalization statistics
- [ ] Step 4: Launch JAX training
- [ ] Step 5: Serve checkpoint and run inference sanity check
```

**Step 1: Select config**

Copy the closest config from `src/openpi/training/config.py`:

| Config | Use case |
|--------|----------|
| `pi05_libero` | pi0.5 LIBERO fine-tuning |
| `pi0_libero` | pi0 full fine-tuning on LIBERO |
| `pi0_fast_libero` | pi0-fast on LIBERO |
| `pi0_aloha_pen_uncap` | ALOHA custom data |
| `pi05_droid_finetune` | Small custom DROID dataset (LeRobot format) |
| `pi05_full_droid_finetune` | Full DROID RLDS large-scale training |

**Step 2: Update dataset and transforms**

```python
# In src/openpi/training/config.py, modify your config:
TrainConfig(
    name="my_custom_config",
    model_type="pi05",
    data=LeRobotDataConfig(
        repo_id="your-org/your-dataset",
        # Adjust transforms to match your data format
    ),
    weight_loader=Pi05WeightLoader(),  # Match model type
)
```

Set `repo_id` for your dataset and ensure `weight_loader` matches the model type (pi0 vs pi0.5).

**Step 3: Compute normalization statistics**

```bash
uv run scripts/compute_norm_stats.py --config-name <config_name>
```

This must run before every training launch when config, dataset, or transforms change.

**Step 4: Launch JAX training**

```bash
XLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run scripts/train.py <config_name> \
  --exp-name=<run_name> \
  --overwrite
```

For full DROID RLDS training, add the `rlds` dependency group:

```bash
uv run --group rlds scripts/compute_norm_stats.py \
  --config-name pi05_full_droid_finetune \
  --max-frames 10000000

XLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run --group rlds scripts/train.py \
  pi05_full_droid_finetune \
  --exp-name=<run_name> --overwrite
```

**Step 5: Serve and validate**

```bash
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=<config_name> \
  --policy.dir=checkpoints/<config_name>/<run_name>/<step>
```

Verify with a test client:

```python
from openpi_client import websocket_client_policy

client = websocket_client_policy.WebsocketClientPolicy(host="localhost", port=8000)
# Build observation matching your config's expected keys
obs = {"image": img_array, "state": state_array, "prompt": "pick up the cup"}
result = client.infer(obs)
print(f"Action shape: {result['actions'].shape}")  # (chunk_size, action_dim)
```

---

## Workflow 2: PyTorch training and checkpoint conversion

Copy this checklist and track progress:

```text
PyTorch Setup Progress:
- [ ] Step 1: Sync dependencies and verify transformer version
- [ ] Step 2: Apply OpenPI transformer patches
- [ ] Step 3: Convert JAX checkpoint to PyTorch format
- [ ] Step 4: Launch PyTorch training or serve converted checkpoint
```

**Step 1: Sync dependencies**

```bash
uv sync
uv pip show transformers
```

**Step 2: Apply required patches**

OpenPI PyTorch requires custom modifications to the installed `transformers` package:

```bash
cp -r ./src/openpi/models_pytorch/transformers_replace/* \
  .venv/lib/python3.11/site-packages/transformers/
```

**Step 3: Convert JAX checkpoint**

```bash
uv run examples/convert_jax_model_to_pytorch.py \
  --checkpoint_dir <jax_checkpoint_dir> \
  --config_name <config_name> \
  --output_path <pytorch_checkpoint_dir>
```

**Step 4: Train or serve**

Single GPU training:

```bash
uv run scripts/train_pytorch.py <config_name> --exp_name <run_name>
```

Multi-GPU distributed training:

```bash
uv run torchrun --standalone --nnodes=1 --nproc_per_node=<num_gpus> \
  scripts/train_pytorch.py <config_name> --exp_name <run_name>
```

Programmatic inference with converted checkpoint:

```python
from openpi.training import config as _config
from openpi.policies import policy_config

config = _config.get_config("pi05_droid")
policy = policy_config.create_trained_policy(config, "<pytorch_checkpoint_dir>")
result = policy.infer(example)
actions = result["actions"]  # numpy array
```

Checkpoints follow the convention: `checkpoints/<config_name>/<exp_name>/<step>/`.

---

## Workflow 3: Policy inference serving

Copy this checklist and track progress:

```text
Inference Server Progress:
- [ ] Step 1: Choose target environment and checkpoint
- [ ] Step 2: Start policy server
- [ ] Step 3: Confirm server is reachable
- [ ] Step 4: Integrate client into robot or simulation code
```

**Step 1: Choose environment**

Default environment presets:

| Environment | Config | Default checkpoint |
|-------------|--------|--------------------|
| `ALOHA` | `pi05_aloha` | `gs://openpi-assets/checkpoints/pi05_base` |
| `ALOHA_SIM` | `pi0_aloha_sim` | `gs://openpi-assets/checkpoints/pi0_aloha_sim` |
| `DROID` | `pi05_droid` | `gs://openpi-assets/checkpoints/pi05_droid` |
| `LIBERO` | `pi05_libero` | `gs://openpi-assets/checkpoints/pi05_libero` |

**Step 2: Start server**

Default mode (uses preset checkpoint):

```bash
uv run scripts/serve_policy.py --env ALOHA
```

Explicit checkpoint mode (custom or local model):

```bash
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=pi05_libero \
  --policy.dir=checkpoints/pi05_libero/my_run/20000
```

Add `--default_prompt "task description"` when runtime observations omit a prompt.

**Step 3: Verify connectivity**

```bash
uv run examples/simple_client/main.py --env DROID
```

**Step 4: Embed remote client in robot code**

Install the lightweight client in your robot environment:

```bash
pip install openpi-client
```

Full integration example:

```python
from openpi_client import websocket_client_policy
import numpy as np

# Connect to remote policy server
client = websocket_client_policy.WebsocketClientPolicy(
    host="gpu-server.local", port=8000
)

# Build observation (keys must match policy transforms)
observation = {
    "image": np.random.rand(224, 224, 3),  # RGB image
    "state": np.zeros(7),                   # Joint positions
    "prompt": "pick up the red block",
}

# Get actions
result = client.infer(observation)
actions = result["actions"]  # shape: (action_chunk_size, action_dim)

# Execute first action on robot
robot.step(actions[0])
```

---

## Common issues

**Issue: Missing norm stats error**

Fix: run `scripts/compute_norm_stats.py --config-name <config_name>` before training.

**Issue: Out of memory during JAX training**

Fix: set `XLA_PYTHON_CLIENT_MEM_FRACTION=0.9`, lower batch size, or configure `fsdp_devices`:

```python
# In config: use model-parallel sharding
TrainConfig(
    ...
    fsdp_devices=4,  # Shard across 4 GPUs
)
```

**Issue: OOM while loading PyTorch checkpoints**

Fix: `export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`

**Issue: Config not found**

Fix: ensure config name exists in `src/openpi/training/config.py` (exact match from `_CONFIGS` dict).

**Issue: PyTorch training diverges after library changes**

Fix: reapply the transformer patch. Run `uv cache clean transformers` to reset, then reapply.

**Issue: `serve_policy.py` crashes with `ModuleNotFoundError`**

Fix: install missing runtime dependencies:

```bash
uv pip install pytest robosuite==1.4.0 gym bddl easydict matplotlib
```

**Issue: `uv sync` fails with `rerun-sdk` wheel mismatch**

Fix:

```bash
uv sync --no-dev
# or
uv sync --no-dev --no-install-package rerun-sdk
```

**Issue: Checkpoint download times out**

Fix: install `gsutil` and prefetch manually:

```bash
pip install gsutil
gsutil -m cp -r gs://openpi-assets/checkpoints/pi05_libero /local/cache/
```

Remove stale `.lock` files if a previous download was interrupted.

**Issue: Policy server exits with code `137`**

Fix: OOM kill. Set JAX memory variables:

```bash
export XLA_PYTHON_CLIENT_PREALLOCATE=false
export XLA_PYTHON_CLIENT_ALLOCATOR=platform
```

---

## For HPC/cluster users

On Slurm-managed clusters, wrap commands with resource allocation:

```bash
srun --partition=gpu --gpus-per-node=1 --mem=64G --cpus-per-task=8 --pty bash
```

Route caches to scratch to avoid filling `/home`:

```bash
export HF_HOME=/scratch/$USER/.cache/huggingface
export XDG_CACHE_HOME=/scratch/$USER/.cache
export PIP_CACHE_DIR=/scratch/$USER/.cache/pip
export UV_CACHE_DIR=/scratch/$USER/.cache/uv
```

Avoid stacking cluster Python modules when using uv-managed environments. Typically `module load cuda` is sufficient.

---

## Advanced topics

**Config recipes and baselines**: See [references/config-recipes.md](references/config-recipes.md)
**Training debugging guide**: See [references/training-debugging.md](references/training-debugging.md)
**Checkpoint and environment mapping**: See [references/checkpoints-and-env-map.md](references/checkpoints-and-env-map.md)
**Remote client integration**: See [references/remote-client-pattern.md](references/remote-client-pattern.md)
**PyTorch precision and patching gotchas**: See [references/pytorch-gotchas.md](references/pytorch-gotchas.md)

## Resources

- OpenPI repository: https://github.com/Physical-Intelligence/openpi
- OpenPI client package: https://github.com/Physical-Intelligence/openpi/tree/main/packages/openpi-client
- pi0 paper: https://www.physicalintelligence.company/blog/pi0
- LeRobot dataset format: https://huggingface.co/docs/lerobot

---
name: fine-tuning-openvla-oft
description: Fine-tunes and evaluates OpenVLA-OFT and OpenVLA-OFT+ policies for robot action generation with continuous action heads, LoRA adaptation, and FiLM conditioning on LIBERO simulation and ALOHA real-world setups. Use when reproducing OpenVLA-OFT paper results, training custom VLA action heads (L1 or diffusion), deploying server-client inference for ALOHA, or debugging normalization, LoRA merge, and cross-GPU issues.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [OpenVLA, OpenVLA-OFT, VLA, Robotics, Fine-Tuning, LIBERO, ALOHA, LoRA, FiLM, Action Chunking, Deployment, Continuous Actions]
dependencies: [torch==2.2.0, transformers>=4.40.0, peft==0.11.1, draccus==0.8.0, accelerate>=0.25.0, wandb>=0.16.0, fastapi>=0.100.0, uvicorn>=0.24.0, tensorflow==2.15.0, robosuite==1.4.0]
---

# OpenVLA-OFT

Fine-tuning and evaluation workflows for OpenVLA-OFT and OpenVLA-OFT+ from the official `openvla-oft` codebase. Enables LoRA-based adaptation of OpenVLA for robot action generation with continuous action prediction heads.

## Quick start

Evaluate a pretrained LIBERO checkpoint:

```bash
python experiments/robot/libero/run_libero_eval.py \
  --pretrained_checkpoint moojink/openvla-7b-oft-finetuned-libero-spatial \
  --task_suite_name libero_spatial \
  --center_crop True \
  --num_trials_per_task 50 \
  --seed 7
```

## Core concepts

**What OpenVLA-OFT changes**: Standard OpenVLA tokenizes continuous actions into discrete bins, losing precision. OFT replaces this with dedicated continuous action heads (L1 regression or diffusion) while keeping the VLA backbone frozen and adapting via LoRA.

**OFT vs OFT+ variants**:

| Variant | FiLM | Images | Typical use |
|---------|------|--------|-------------|
| OFT | Off | 2 (front + wrist) | LIBERO simulation |
| OFT+ | On | 3 (high + left + right wrist) | ALOHA real-world |

**Key architecture choices**:
- **LoRA adaptation**: Rank-32 LoRA on VLA backbone (no full fine-tuning needed)
- **Continuous actions**: L1 regression head (default) or diffusion head
- **FiLM conditioning**: Feature-wise Linear Modulation for stronger language grounding in OFT+
- **Multi-image input**: Configurable 2 or 3 camera streams via `num_images_in_input`

## Compute requirements

| Task | GPU | VRAM | Notes |
|------|-----|------|-------|
| LIBERO evaluation | 1x A100/A40 | ~16 GB | Single GPU |
| ALOHA evaluation | 1x A100/A40 | ~18 GB | Single GPU |
| LIBERO fine-tuning | 8x A100 | ~27 GB/GPU | Paper default |
| ALOHA fine-tuning (OFT+) | 8x A100 | ~35 GB/GPU | FiLM + 3 images |
| LoRA merge | 1x any GPU | ~16 GB | One-time step |

## Expected performance benchmarks

Official results (paper setup, seed=7, 50 trials per task):

| Task Suite | Task-Specific | Combined Policy | Notes |
|-----------|--------------|-----------------|-------|
| LIBERO-Spatial | 97.2% | 96.8% | Easiest suite |
| LIBERO-Object | 97.4% | 97.0% | Object manipulation |
| LIBERO-Goal | 95.8% | 95.4% | May peak at 50k-100k steps |
| LIBERO-10 | 98.0% | 98.0% | Long-horizon tasks |
| **Average** | **97.1%** | **96.8%** | Near-equivalent |

Reproduction notes: results are tied to Python 3.10.14, PyTorch 2.2.0, NVIDIA A100, and custom Transformers fork.

## When to use vs alternatives

**Use OpenVLA-OFT when:**
- The target task is robot action generation with visual and language conditioning
- LoRA-based adaptation of `openvla/openvla-7b` is preferred
- You need official LIBERO or ALOHA workflows from the OpenVLA-OFT paper
- You want continuous action heads (L1 regression or diffusion) instead of tokenized actions

**Use alternatives when:**
- You need a different VLA architecture (use `openpi` for pi0/pi0.5 models)
- You need the NVIDIA Cosmos Policy stack (use `cosmos-policy`)
- You need general LLM fine-tuning without robot action heads

---

## Workflow 1: Set up environment

Copy this checklist and track progress:

```text
Setup Progress:
- [ ] Step 1: Create conda env and install PyTorch
- [ ] Step 2: Install openvla-oft package in editable mode
- [ ] Step 3: Install FlashAttention2
- [ ] Step 4: Verify critical versions
```

**Step 1: Create conda env**

```bash
conda create -n openvla-oft python=3.10 -y
conda activate openvla-oft
pip3 install torch torchvision torchaudio
pip3 install robosuite==1.4.0
```

**Step 2: Install package**

```bash
cd openvla-oft
pip install -e .
```

**Step 3: Install FlashAttention2**

```bash
pip install packaging ninja
pip install "flash-attn==2.5.5" --no-build-isolation
```

**Step 4: Verify versions**

```python
import torch, transformers, peft
print(f"PyTorch: {torch.__version__}")         # Expected: 2.2.0
print(f"Transformers: {transformers.__version__}")
print(f"PEFT: {peft.__version__}")             # Expected: 0.11.1
```

---

## Workflow 2: Evaluate pretrained checkpoints on LIBERO

```text
LIBERO Eval Progress:
- [ ] Step 1: Install LIBERO dependencies
- [ ] Step 2: Choose checkpoint and task suite
- [ ] Step 3: Run evaluation
- [ ] Step 4: Parse and validate results
```

**Step 1: Install LIBERO**

```bash
git clone https://github.com/Lifelong-Robot-Learning/LIBERO.git
pip install -e LIBERO
pip install -r experiments/robot/libero/libero_requirements.txt
```

**Step 2: Choose checkpoint**

| Checkpoint | Task suite |
|-----------|------------|
| `moojink/openvla-7b-oft-finetuned-libero-spatial` | `libero_spatial` |
| `moojink/openvla-7b-oft-finetuned-libero-object` | `libero_object` |
| `moojink/openvla-7b-oft-finetuned-libero-goal` | `libero_goal` |
| `moojink/openvla-7b-oft-finetuned-libero-10` | `libero_10` |
| `moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10` | Combined |

**Step 3: Run evaluation**

```bash
python experiments/robot/libero/run_libero_eval.py \
  --pretrained_checkpoint moojink/openvla-7b-oft-finetuned-libero-spatial \
  --task_suite_name libero_spatial \
  --center_crop True \
  --num_trials_per_task 50 \
  --seed 7
```

**Step 4: Parse results**

```python
import re

def parse_libero_log(log_path):
    """Extract per-task success rates from LIBERO eval log."""
    with open(log_path) as f:
        content = f.read()
    matches = re.findall(r"Task (.+?): (\d+)/(\d+) successes", content)
    for task, successes, trials in matches:
        rate = int(successes) / int(trials)
        print(f"  {task}: {rate:.0%} ({successes}/{trials})")

parse_libero_log("experiments/logs/latest.log")
```

---

## Workflow 3: Fine-tune on LIBERO

```text
LIBERO Fine-Tune Progress:
- [ ] Step 1: Prepare RLDS dataset
- [ ] Step 2: Launch torchrun with OFT defaults
- [ ] Step 3: Evaluate intermediate and final checkpoints
- [ ] Step 4: Merge LoRA for deployment if needed
```

**Step 1: Dataset**

Use RLDS datasets: `libero_spatial_no_noops`, `libero_object_no_noops`, `libero_goal_no_noops`, `libero_10_no_noops`.

**Step 2: Launch training**

```bash
torchrun --standalone --nnodes 1 --nproc-per-node 8 vla-scripts/finetune.py \
  --vla_path openvla/openvla-7b \
  --data_root_dir /PATH/TO/RLDS/DATASETS/ \
  --dataset_name libero_spatial_no_noops \
  --run_root_dir /YOUR/CHECKPOINTS/ \
  --use_l1_regression True \
  --use_diffusion False \
  --use_film False \
  --num_images_in_input 2 \
  --use_proprio True \
  --batch_size 8 \
  --learning_rate 5e-4 \
  --num_steps_before_decay 100000 \
  --max_steps 150005 \
  --save_freq 10000 \
  --save_latest_checkpoint_only False \
  --image_aug True \
  --lora_rank 32 \
  --wandb_entity YOUR_WANDB_ENTITY \
  --wandb_project YOUR_WANDB_PROJECT
```

**Step 3: Evaluate checkpoints**

Evaluate 50k, 100k, and 150k checkpoints — LIBERO-Goal may peak earlier than other suites. Keep best checkpoint per suite by actual task success, not only training loss.

**Step 4: Merge LoRA**

```bash
python vla-scripts/merge_lora_weights_and_save.py \
  --base_checkpoint openvla/openvla-7b \
  --lora_finetuned_checkpoint_dir /PATH/TO/CHECKPOINT_DIR
```

---

## Workflow 4: Train and evaluate OpenVLA-OFT+ on ALOHA

```text
ALOHA Progress:
- [ ] Step 1: Preprocess raw ALOHA demonstrations
- [ ] Step 2: Convert to RLDS and register dataset configs
- [ ] Step 3: Fine-tune OFT+ with FiLM and 3 images
- [ ] Step 4: Start VLA server on GPU machine
- [ ] Step 5: Run client-side robot evaluation
```

**Step 1: Preprocess raw data**

```bash
python experiments/robot/aloha/preprocess_split_aloha_data.py \
  --dataset_path /path/to/aloha_raw/task_name/ \
  --out_base_dir /path/to/aloha_preprocessed/ \
  --percent_val 0.05
```

**Step 2: Register RLDS dataset**

Add entries in:
- `prismatic/vla/datasets/rlds/oxe/configs.py`
- `prismatic/vla/datasets/rlds/oxe/transforms.py`
- `prismatic/vla/datasets/rlds/oxe/mixtures.py`

Set ALOHA constants in `prismatic/vla/constants.py`:

```python
# Expected defaults for ALOHA
NUM_ACTIONS_CHUNK = 25        # Match control frequency (25 Hz)
ACTION_DIM = 14               # 7 joints x 2 arms
PROPRIO_DIM = 14
ACTION_PROPRIO_NORMALIZATION_TYPE = "BOUNDS"  # Absolute joint angles
```

**Step 3: Fine-tune OFT+**

```bash
torchrun --standalone --nnodes 1 --nproc-per-node 8 vla-scripts/finetune.py \
  --vla_path openvla/openvla-7b \
  --data_root_dir /PATH/TO/RLDS/DATASETS/ \
  --dataset_name aloha_task_name \
  --run_root_dir /YOUR/CHECKPOINTS/ \
  --use_l1_regression True \
  --use_diffusion False \
  --use_film True \
  --num_images_in_input 3 \
  --use_proprio True \
  --batch_size 4 \
  --learning_rate 5e-4 \
  --num_steps_before_decay 50000 \
  --max_steps 100005 \
  --use_val_set True \
  --val_freq 10000 \
  --save_freq 10000 \
  --lora_rank 32
```

**Step 4: Start VLA server (GPU machine)**

```bash
python vla-scripts/deploy.py \
  --pretrained_checkpoint /PATH/TO/FINETUNED/CHECKPOINT/ \
  --use_l1_regression True \
  --use_film True \
  --num_images_in_input 3 \
  --use_proprio True \
  --center_crop True \
  --unnorm_key aloha_task_name
```

Server listens on `http://<server-ip>:8777/act`.

**Step 5: Run client evaluation**

```bash
python experiments/robot/aloha/run_aloha_eval.py \
  --center_crop True \
  --num_open_loop_steps 25 \
  --use_vla_server True \
  --vla_server_url http://<SERVER_IP>:8777 \
  --num_rollouts_planned 50 \
  --max_steps 1500
```

---

## Critical invariants

These flags **must** be consistent between training and inference. Mismatches cause silent failures:

| Area | Required consistency | Failure if mismatched |
|------|---------------------|----------------------|
| Action head | `use_l1_regression` vs `use_diffusion` | Wrong head loading, invalid actions |
| FiLM | `use_film` across train/eval/deploy | Reduced language grounding |
| Image streams | `num_images_in_input` parity | Shape mismatch or performance drop |
| Proprio | `use_proprio` parity | State conditioning mismatch |
| LoRA rank | `lora_rank` parity | Adapter loading errors |
| Crop | `image_aug=True` in train → `center_crop=True` in eval | Significant success-rate drop |
| Action chunk | `num_open_loop_steps` ≈ `NUM_ACTIONS_CHUNK` | Latency/success tradeoff shifts |
| Unnorm key | `unnorm_key` present in checkpoint stats | Bad action scale |

Quick validation:

```python
# Verify config parity before long eval runs
train_flags = {"use_film": False, "num_images": 2, "use_proprio": True, "lora_rank": 32}
eval_flags  = {"use_film": False, "num_images": 2, "use_proprio": True, "lora_rank": 32}
for k in train_flags:
    assert train_flags[k] == eval_flags[k], f"Mismatch: {k}: {train_flags[k]} vs {eval_flags[k]}"
print("All flags consistent")
```

---

## Common issues

**Issue: Action quality drops after moving checkpoints across GPU types**

Fix: re-merge LoRA adapter on the downstream device:

```bash
python vla-scripts/merge_lora_weights_and_save.py \
  --base_checkpoint openvla/openvla-7b \
  --lora_finetuned_checkpoint_dir /PATH/TO/CHECKPOINT_DIR
```

**Issue: Wrong action scale or failed un-normalization**

Fix: check `--unnorm_key` matches dataset statistics in checkpoint:

```python
import torch
ckpt = torch.load("checkpoint/model.pt", map_location="cpu")
print("Available norm keys:", list(ckpt.get("norm_stats", {}).keys()))
```

**Issue: Eval success unexpectedly low**

Fix: verify all invariants in the table above. Most common culprit: missing `center_crop=True` when trained with `image_aug=True`.

**Issue: LIBERO eval crashes with `EOFError` asking for dataset path**

Fix: set `LIBERO_CONFIG_PATH` and write a non-interactive config before headless eval.

**Issue: ALOHA client ROS import fails with `libffi` symbol errors**

Fix: `conda install -c conda-forge libffi`

**Issue: `flash-attn` install fails**

Fix: export `TMPDIR` and `PIP_CACHE_DIR` to the same filesystem, retry with `--no-cache-dir`.

**Issue: EGL teardown logs show `EGL_NOT_INITIALIZED`**

Fix: treat as teardown noise unless exit code is non-zero. Set EGL env vars:

```bash
export MUJOCO_GL=egl PYOPENGL_PLATFORM=egl
export CUDA_VISIBLE_DEVICES=0 MUJOCO_EGL_DEVICE_ID=0
```

---

## For HPC/cluster users

On Slurm clusters, route caches to scratch to avoid filling `/home` quota:

```bash
export HF_HOME=/scratch/$USER/.cache/huggingface
export XDG_CACHE_HOME=/scratch/$USER/.cache
export PIP_CACHE_DIR=/scratch/$USER/.cache/pip
export TMPDIR=/scratch/$USER/tmp
```

Avoid stacking cluster Python modules when using conda. Typically `module load cuda` is sufficient.

---

## Advanced topics

**Paper summary and checkpoints**: See [references/paper-and-checkpoints.md](references/paper-and-checkpoints.md)
**Detailed LIBERO workflow**: See [references/libero-workflow.md](references/libero-workflow.md)
**Detailed ALOHA workflow**: See [references/aloha-workflow.md](references/aloha-workflow.md)
**Config map and troubleshooting matrix**: See [references/config-troubleshooting.md](references/config-troubleshooting.md)

## Resources

- Project website: https://openvla-oft.github.io/
- Paper: https://arxiv.org/abs/2502.19645
- Repository: https://github.com/moojink/openvla-oft
- RLDS builder: https://github.com/moojink/rlds_dataset_builder

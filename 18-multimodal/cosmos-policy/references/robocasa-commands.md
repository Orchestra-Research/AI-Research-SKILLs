# RoboCasa Command Matrix

Command variations for running Cosmos Policy RoboCasa evaluation on local machines, interactive GPU shells, or batch systems. All commands use the `cosmos_policy.eval.run_robocasa` module directly.

## Preferred path: interactive GPU shell

Acquire one GPU, then run evaluations directly:

```bash
# Slurm example
srun --partition=gpu --gpus-per-node=1 \
  --time=01:00:00 --mem=64G --cpus-per-task=8 --pty bash

cd /path/to/cosmos-policy

# Set headless rendering environment
export CUDA_VISIBLE_DEVICES=0
export MUJOCO_EGL_DEVICE_ID=0
export MUJOCO_GL=egl
export PYOPENGL_PLATFORM=egl

# Smoke eval on one task (2 trials)
python -m cosmos_policy.eval.run_robocasa \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 2 \
  --enable-cross-attn-kv-cache

# Full eval on one task (50 trials)
python -m cosmos_policy.eval.run_robocasa \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 50 \
  --enable-cross-attn-kv-cache
```

## Local GPU workstation path

Skip `srun` and run the same `python -m` commands directly. Set EGL env vars first. Keep singularity enabled on cluster nodes unless there is a verified reason not to.

## KV cache A/B benchmark path

```bash
# Baseline (cache off)
python -m cosmos_policy.eval.run_robocasa \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 10 \
  --no-enable-cross-attn-kv-cache \
  --output-dir results/robocasa_baseline

# Cached (cache on)
python -m cosmos_policy.eval.run_robocasa \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 10 \
  --enable-cross-attn-kv-cache \
  --output-dir results/robocasa_kv_cache_on
```

Key output files to inspect:
- `results/robocasa_baseline/summary.json`
- `results/robocasa_kv_cache_on/summary.json`

## Batch fallback

Only use batch submission after the direct command path works interactively:

```bash
sbatch --partition=gpu --time=01:00:00 --wrap="
  export CUDA_VISIBLE_DEVICES=0 MUJOCO_EGL_DEVICE_ID=0 MUJOCO_GL=egl PYOPENGL_PLATFORM=egl
  cd /path/to/cosmos-policy
  python -m cosmos_policy.eval.run_robocasa \
    --task-name TurnOffMicrowave \
    --obj-instance-split A \
    --num-trials 50 \
    --enable-cross-attn-kv-cache
"
```

## High-signal gotchas

- On A40 cluster nodes, singularity is mandatory because host installs can fail with import and binary compatibility errors.
- Keep task name, object split, seed, and trial count fixed across A/B comparisons for comparability.
- Always align `CUDA_VISIBLE_DEVICES` and `MUJOCO_EGL_DEVICE_ID` to the same GPU index.

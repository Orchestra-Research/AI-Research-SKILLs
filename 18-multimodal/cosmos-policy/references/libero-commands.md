# LIBERO Command Matrix

Command variations for running Cosmos Policy LIBERO evaluation on local machines, interactive GPU shells, or batch systems. All commands use the `cosmos_policy.eval.run_libero` module directly.

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

# Smoke eval (1 trial, single suite)
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 1 \
  --enable-cross-attn-kv-cache

# Full eval (50 trials, single suite)
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 50 \
  --enable-cross-attn-kv-cache

# All four suites
for suite in libero_spatial libero_object libero_goal libero_10; do
  python -m cosmos_policy.eval.run_libero \
    --task-suite $suite \
    --num-trials 50 \
    --enable-cross-attn-kv-cache
done
```

## Local GPU workstation path

Skip `srun` and run the same `python -m` commands directly. Set EGL env vars first. Keep singularity enabled on cluster nodes unless there is a verified reason not to.

## KV cache A/B benchmark path

```bash
# Baseline (cache off)
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 10 \
  --no-enable-cross-attn-kv-cache \
  --output-dir results/baseline

# Cached (cache on)
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 10 \
  --enable-cross-attn-kv-cache \
  --output-dir results/kv_cache_on
```

Key output files to inspect:
- `results/baseline/summary.json`
- `results/kv_cache_on/summary.json`

## Batch fallback

Only use batch submission after the direct command path works interactively:

```bash
sbatch --partition=gpu --time=04:00:00 --wrap="
  export CUDA_VISIBLE_DEVICES=0 MUJOCO_EGL_DEVICE_ID=0 MUJOCO_GL=egl PYOPENGL_PLATFORM=egl
  cd /path/to/cosmos-policy
  python -m cosmos_policy.eval.run_libero \
    --task-suite libero_10 \
    --num-trials 50 \
    --enable-cross-attn-kv-cache
"
```

## High-signal gotchas

- On A40 cluster nodes, singularity is mandatory because host `transformer_engine` can fail with `GLIBC_2.29` loader errors.
- Always align `CUDA_VISIBLE_DEVICES` and `MUJOCO_EGL_DEVICE_ID` to the same GPU index.
- Use `--output-dir` to keep A/B results separate for comparison.

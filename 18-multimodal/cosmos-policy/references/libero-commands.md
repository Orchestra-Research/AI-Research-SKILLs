# LIBERO Command Matrix

Use the same wrapper scripts on local machines, interactive GPU shells, or batch systems.

## Preferred path: interactive GPU shell

Acquire one GPU, then run the wrappers directly:

```bash
# Slurm example
srun --partition=gpu --gpus-per-node=1 \
  --time=01:00:00 --mem=64G --cpus-per-task=8 --pty bash

cd /path/to/project

# One-time preparation
bash scripts/run_cosmos_policy_libero.sh \
  --setup-only \
  --cosmos-dir /path/to/cosmos-policy \
  --cache-root /scratch/$USER/cosmos_cache

# Smoke eval with profiling
bash scripts/run_cosmos_policy_libero.sh \
  --eval-only \
  --cosmos-dir /path/to/cosmos-policy \
  --cache-root /scratch/$USER/cosmos_cache \
  --task-suite libero_10 \
  --num-trials 1 \
  --profile-enable \
  --profile-only \
  --profile-mode timer \
  --profile-warmup-queries 1 \
  --profile-active-queries 6 \
  --profile-step-sweep 5
```

## Local GPU workstation path

Skip `srun` and run the same `bash scripts/...` commands directly. Keep singularity enabled unless there is a verified reason not to use it.

## Cache benchmark path

```bash
bash scripts/run_cosmos_policy_cross_attn_kv_cache_benchmark.sh \
  --mode smoke \
  --skip-setup \
  --profile-mode timer
```

Artifacts land under:

```text
<cache-root>/benchmarks/cross_attn_kv_cache_<mode>_<timestamp>/
```

Key files to inspect:
- `benchmark_summary.md`
- `baseline/profiling/baseline_metrics.csv`
- `kv_cache_on/profiling/baseline_metrics.csv`

## Batch fallback

Only use batch after the direct bash path works:

```bash
sbatch --partition=gpu --time=01:00:00 \
  scripts/run_cosmos_policy_cross_attn_kv_cache_benchmark.sh \
  --mode smoke \
  --skip-setup \
  --profile-mode timer
```

## High-signal gotchas

- Wrapper script names may contain `_slurm`, but files can be run directly with `bash`.
- On A40 cluster nodes, singularity is mandatory because host `transformer_engine` can fail with `GLIBC_2.29` loader errors.
- `--setup-only` can run on a login node because it does not require a GPU.

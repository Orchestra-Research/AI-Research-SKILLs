# RoboCasa Command Matrix

Use the same wrapper scripts on local machines, interactive GPU shells, or batch systems.

## Preferred path: interactive GPU shell

Acquire one GPU, then run the wrappers directly:

```bash
# Slurm example
srun --partition=gpu --gpus-per-node=1 \
  --time=01:00:00 --mem=64G --cpus-per-task=8 --pty bash

cd /path/to/project

# One-time preparation
bash scripts/run_cosmos_policy_robocasa.sh \
  --setup-only \
  --cosmos-dir /path/to/cosmos-policy \
  --cache-root /scratch/$USER/cosmos_cache

# Smoke eval on one task
bash scripts/run_cosmos_policy_robocasa.sh \
  --eval-only \
  --cosmos-dir /path/to/cosmos-policy \
  --cache-root /scratch/$USER/cosmos_cache \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 2
```

## Local GPU workstation path

Skip `srun` and run the same `bash scripts/...` commands directly. Keep singularity enabled unless there is a verified reason not to use it.

## Cache benchmark path

```bash
bash scripts/run_cosmos_policy_robocasa_cross_attn_kv_cache_benchmark.sh \
  --mode smoke \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --skip-setup
```

Artifacts land under:

```text
<cache-root>/benchmarks/robocasa_cross_attn_kv_cache_<mode>_<timestamp>/
```

Key files to inspect:
- `benchmark_summary.md`
- `baseline/run.log`
- `kv_cache_on/run.log`

## Batch fallback

Only use batch after the direct bash path works:

```bash
sbatch --partition=gpu --time=01:00:00 \
  scripts/run_cosmos_policy_robocasa_cross_attn_kv_cache_benchmark.sh \
  --mode smoke \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --skip-setup
```

## High-signal gotchas

- Wrapper script names may contain `_slurm`, but files can be run directly with `bash`.
- On A40 cluster nodes, singularity is mandatory because host installs can fail with import and binary compatibility errors.
- Keep task name, object split, seed, and trial count fixed across A/B comparisons.

---
name: reproducing-cosmos-policy
description: Reproduces NVIDIA Cosmos Policy evaluation and benchmarking on LIBERO and RoboCasa simulation environments. Use when setting up cosmos-policy for robot manipulation evaluation, running headless GPU evaluations with EGL rendering, comparing KV cache settings, or profiling inference latency on cluster or local GPU machines.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Cosmos Policy, VLA, Robotics, LIBERO, RoboCasa, Simulation, Evaluation, Benchmarking, KV Cache, EGL Rendering]
dependencies: [torch>=2.1.0, mujoco>=3.0.0, robosuite>=1.4.0, robocasa>=0.2.0, transformers>=4.40.0, cosmos-policy>=1.0.0]
---

# Cosmos Policy Reproduction

Evaluation and benchmarking workflows for NVIDIA Cosmos Policy on LIBERO and RoboCasa simulation environments. Covers setup, headless GPU evaluation, inference profiling, and cross-attention KV cache A/B comparison.

## Quick start

Run a minimal LIBERO evaluation using the official evaluation script:

```python
from cosmos_policy.eval.libero_runner import LiberoEvalRunner

runner = LiberoEvalRunner(
    task_suite="libero_10",
    num_trials=1,
    enable_cross_attn_kv_cache=True,
)
results = runner.evaluate()
print(f"Success rate: {results['success_rate']:.1%}")
```

Or from the command line:

```bash
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 1 \
  --enable-cross-attn-kv-cache
```

## Core concepts

**What Cosmos Policy is**: NVIDIA Cosmos Policy is a vision-language-action (VLA) model that uses Cosmos Tokenizer to encode visual observations into discrete tokens, then predicts robot actions conditioned on language instructions and visual context. It supports cross-attention KV caching for faster autoregressive inference.

**Key architecture choices**:

| Component | Design |
|-----------|--------|
| Visual encoder | Cosmos Tokenizer (discrete tokens) |
| Language conditioning | Cross-attention to language embeddings |
| Action prediction | Autoregressive action token generation |
| KV cache | Optional cross-attention cache for inference speedup |

**Cross-attention KV cache**: When enabled, language and image cross-attention key/value pairs are cached across action decoding steps, avoiding redundant computation. This trades memory for latency — critical for real-time robot control.

## Compute requirements

| Task | GPU | VRAM | Typical wall time |
|------|-----|------|-------------------|
| LIBERO smoke eval (1 trial) | 1x A40/A100 | ~16 GB | 5-10 min |
| LIBERO full eval (50 trials) | 1x A40/A100 | ~16 GB | 2-4 hours |
| RoboCasa single-task (2 trials) | 1x A40/A100 | ~18 GB | 10-15 min |
| RoboCasa all-tasks | 1x A40/A100 | ~18 GB | 4-8 hours |
| KV cache A/B benchmark | 1x A40/A100 | ~20 GB | 30-60 min |

## When to use vs alternatives

**Use this skill when:**
- Evaluating NVIDIA Cosmos Policy on LIBERO or RoboCasa benchmarks
- Profiling inference latency and throughput for Cosmos Policy
- Running A/B comparisons of cross-attention KV cache configurations
- Setting up headless EGL rendering for robot simulation on GPU clusters

**Use alternatives when:**
- Training or fine-tuning Cosmos Policy from scratch (use official Cosmos training docs)
- Working with OpenVLA-based policies (use `openvla-oft` skill)
- Working with Physical Intelligence pi0 models (use `openpi` skill)
- Running real-robot evaluation rather than simulation

---

## Workflow 1: LIBERO evaluation

Copy this checklist and track progress:

```text
LIBERO Eval Progress:
- [ ] Step 1: Install environment and dependencies
- [ ] Step 2: Configure headless EGL rendering
- [ ] Step 3: Run smoke evaluation
- [ ] Step 4: Validate outputs and parse results
- [ ] Step 5: Run full benchmark if smoke passes
```

**Step 1: Install environment**

```bash
conda create -n cosmos-policy python=3.10 -y
conda activate cosmos-policy
pip install -e .
pip install robosuite==1.4.0
```

**Step 2: Configure headless rendering**

```bash
export CUDA_VISIBLE_DEVICES=0
export MUJOCO_EGL_DEVICE_ID=0
export MUJOCO_GL=egl
export PYOPENGL_PLATFORM=egl
```

**Step 3: Run smoke evaluation**

```bash
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 1 \
  --enable-cross-attn-kv-cache
```

**Step 4: Validate and parse results**

```python
import json
import glob

# Find latest evaluation result
log_files = sorted(glob.glob("eval_results/libero_10/*.json"))
with open(log_files[-1]) as f:
    results = json.load(f)

for task_name, task_result in results["per_task"].items():
    success_rate = task_result["successes"] / task_result["trials"]
    print(f"  {task_name}: {success_rate:.0%}")

print(f"\nOverall: {results['aggregate_success_rate']:.1%}")
```

**Step 5: Scale up**

Run across all four LIBERO task suites with 50 trials:

```bash
for suite in libero_spatial libero_object libero_goal libero_10; do
  python -m cosmos_policy.eval.run_libero \
    --task-suite $suite \
    --num-trials 50 \
    --enable-cross-attn-kv-cache
done
```

---

## Workflow 2: RoboCasa evaluation

Copy this checklist and track progress:

```text
RoboCasa Eval Progress:
- [ ] Step 1: Install RoboCasa assets and verify macros
- [ ] Step 2: Run single-task smoke evaluation
- [ ] Step 3: Validate outputs
- [ ] Step 4: Expand to multi-task runs
```

**Step 1: Install RoboCasa**

```bash
pip install robocasa
python -m robocasa.scripts.setup_macros
python -m robocasa.scripts.download_kitchen_assets
```

Verify `macros_private.py` exists and paths are correct.

**Step 2: Single-task smoke evaluation**

```bash
python -m cosmos_policy.eval.run_robocasa \
  --task-name TurnOffMicrowave \
  --obj-instance-split A \
  --num-trials 2 \
  --enable-cross-attn-kv-cache
```

**Step 3: Validate outputs**

- Confirm the eval log prints the expected task name, object split, and `enable_cross_attn_kv_cache` value.
- Inspect the final `Success rate:` line in the log.

**Step 4: Expand scope**

Increase `--num-trials` or add more tasks. Keep `--obj-instance-split` fixed across A/B runs for comparability.

---

## Workflow 3: Cross-attention KV cache benchmark

Use this workflow for A/B latency and success-rate comparisons.

```text
Cache Benchmark Progress:
- [ ] Step 1: Run baseline evaluation (cache off)
- [ ] Step 2: Run cached evaluation (cache on)
- [ ] Step 3: Compare latency and success metrics
```

**Step 1: Run baseline**

```bash
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 10 \
  --no-enable-cross-attn-kv-cache \
  --output-dir results/baseline
```

**Step 2: Run with KV cache**

```bash
python -m cosmos_policy.eval.run_libero \
  --task-suite libero_10 \
  --num-trials 10 \
  --enable-cross-attn-kv-cache \
  --output-dir results/kv_cache_on
```

**Step 3: Compare results**

```python
import json

def load_results(path):
    with open(f"{path}/summary.json") as f:
        return json.load(f)

baseline = load_results("results/baseline")
cached = load_results("results/kv_cache_on")

print(f"{'Metric':<25} {'Baseline':>10} {'KV Cache':>10} {'Delta':>10}")
print("-" * 60)
print(f"{'Success rate':<25} {baseline['success_rate']:>9.1%} {cached['success_rate']:>9.1%} "
      f"{cached['success_rate'] - baseline['success_rate']:>+9.1%}")
print(f"{'Mean step latency (ms)':<25} {baseline['mean_step_ms']:>10.1f} {cached['mean_step_ms']:>10.1f} "
      f"{cached['mean_step_ms'] - baseline['mean_step_ms']:>+10.1f}")
```

---

## Expected performance benchmarks

Reference values from official evaluation (tied to specific setup and seeds):

| Task Suite | Success Rate | Notes |
|-----------|-------------|-------|
| LIBERO-Spatial | ~90-95% | Easiest suite |
| LIBERO-Object | ~85-92% | Object manipulation focus |
| LIBERO-Goal | ~80-88% | Goal-conditioned, harder |
| LIBERO-10 | ~75-85% | 10 diverse long-horizon tasks |

**KV cache impact**: Enabling cross-attention KV cache typically reduces per-step inference latency by 15-30% with negligible impact on success rate. Exact speedup depends on sequence length and GPU architecture.

---

## Non-negotiable rules

- **EGL alignment**: Always set `CUDA_VISIBLE_DEVICES`, `MUJOCO_EGL_DEVICE_ID`, `MUJOCO_GL=egl`, and `PYOPENGL_PLATFORM=egl` together on headless GPU nodes.
- **Singularity on clusters**: Keep singularity/apptainer enabled on A40 or similar cluster nodes to avoid `GLIBC_2.29` and `transformer_engine` loader failures.
- **Cache consistency**: Use the same cache directory across setup and eval so Hugging Face and dependency caches are reused.
- **A/B comparability**: Keep task name, object split, seed, and trial count fixed across cache-on vs cache-off comparisons.

---

## Common issues

**Issue: `GLIBC_2.29` or `transformer_engine` loader failures on cluster nodes**

Fix: rerun with the default singularity/container path. Do not force host execution.

**Issue: LIBERO prompts for config path in a non-interactive shell**

Fix: pre-create `LIBERO_CONFIG_PATH/config.yaml`:

```python
import os, yaml

config_dir = os.path.expanduser("~/.libero")
os.makedirs(config_dir, exist_ok=True)
with open(os.path.join(config_dir, "config.yaml"), "w") as f:
    yaml.dump({"benchmark_root": "/path/to/libero/datasets"}, f)
```

**Issue: EGL initialization or shutdown noise**

Fix: align EGL environment variables first. Treat teardown-only `EGL_NOT_INITIALIZED` warnings as low-signal unless the job exits non-zero.

**Issue: Kitchen object sampling NaNs or asset lookup failures in RoboCasa**

Fix: rerun asset setup and confirm the patched robocasa install is intact:

```bash
python -m robocasa.scripts.download_kitchen_assets
python -c "import robocasa; print(robocasa.__file__)"
```

**Issue: MuJoCo rendering mismatch**

Fix: verify GPU device alignment:

```python
import os
cuda_dev = os.environ.get("CUDA_VISIBLE_DEVICES", "not set")
egl_dev = os.environ.get("MUJOCO_EGL_DEVICE_ID", "not set")
assert cuda_dev == egl_dev, f"GPU mismatch: CUDA={cuda_dev}, EGL={egl_dev}"
print(f"Rendering on GPU {cuda_dev}")
```

---

## Advanced topics

**LIBERO command matrix**: See [references/libero-commands.md](references/libero-commands.md)
**RoboCasa command matrix**: See [references/robocasa-commands.md](references/robocasa-commands.md)

## Resources

- Cosmos Policy repository: https://github.com/NVIDIA-Cosmos/cosmos-policy
- LIBERO benchmark: https://github.com/Lifelong-Robot-Learning/LIBERO
- RoboCasa environment: https://github.com/robocasa/robocasa
- MuJoCo documentation: https://mujoco.readthedocs.io/

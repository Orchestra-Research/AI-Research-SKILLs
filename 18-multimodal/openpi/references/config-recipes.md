# Config Recipes

Use these as starting points when choosing a config to copy or adapt.

## Common config baselines

| Config | Typical use |
|--------|-------------|
| `pi05_libero` | Base pi0.5-style LIBERO fine-tuning recipe |
| `pi0_libero` | pi0 full fine-tuning on LIBERO-format data |
| `pi0_fast_libero` | pi0-fast full fine-tuning on LIBERO-format data |
| `pi0_aloha_pen_uncap` | ALOHA custom data fine-tuning pattern |
| `pi05_aloha_pen_uncap` | ALOHA pi0.5 custom data fine-tuning pattern |
| `pi05_droid_finetune` | Small custom DROID dataset in LeRobot format |
| `pi05_full_droid_finetune` | Full DROID RLDS large-scale training |
| `pi0_fast_full_droid_finetune` | Full DROID RLDS with pi0-fast |

## Essential command sequence

```bash
# 1) Compute normalization stats
uv run scripts/compute_norm_stats.py --config-name <config_name>

# 2) Train
XLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run scripts/train.py <config_name> \
  --exp-name=<run_name> --overwrite

# 3) Serve checkpoint for verification
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=<config_name> \
  --policy.dir=checkpoints/<config_name>/<run_name>/<step>
```

## RLDS variant for full DROID

```bash
uv run --group rlds scripts/compute_norm_stats.py \
  --config-name pi05_full_droid_finetune --max-frames 10000000

XLA_PYTHON_CLIENT_MEM_FRACTION=0.9 uv run --group rlds scripts/train.py \
  pi05_full_droid_finetune --exp-name=<run_name> --overwrite
```

## High-signal files to inspect while adapting configs

- `src/openpi/training/config.py` — all config definitions
- `src/openpi/policies/libero_policy.py` — LIBERO policy transforms
- `src/openpi/policies/droid_policy.py` — DROID policy transforms
- `src/openpi/policies/aloha_policy.py` — ALOHA policy transforms

# Configuration and Troubleshooting

## Core files map

Training:
- `vla-scripts/finetune.py`

Server deployment:
- `vla-scripts/deploy.py`

LIBERO evaluation:
- `experiments/robot/libero/run_libero_eval.py`

ALOHA evaluation:
- `experiments/robot/aloha/run_aloha_eval.py`

Action/policy utilities:
- `experiments/robot/openvla_utils.py`

Platform constants:
- `prismatic/vla/constants.py`

## High-risk configuration matrix

| Area | Required consistency | Typical failure if mismatched |
|------|----------------------|-------------------------------|
| Action head mode | `use_l1_regression` vs `use_diffusion` | Wrong head loading, unstable or invalid action generation |
| FiLM usage | `use_film` in train/eval/deploy | Reduced language grounding, degraded policy quality |
| Image streams | `num_images_in_input` across train/eval/deploy | Shape mismatch or strong performance drop |
| Proprio input | `use_proprio` parity | State conditioning mismatch, action drift |
| LoRA rank | `lora_rank` parity | Adapter loading errors or wrong effective model |
| Crop behavior | `image_aug` in training implies `center_crop=True` in eval/deploy | Significant success-rate drop |
| Action chunk | `num_open_loop_steps` close to `NUM_ACTIONS_CHUNK` | Latency/success tradeoff shifts, lower success |
| Un-normalization key | `unnorm_key` present in checkpoint stats | Bad action scale or assertion failures |

## Constants behavior notes

`prismatic/vla/constants.py` auto-selects constants by command-line text (`libero`, `aloha`, `bridge`).

Implications:
- If command path does not include expected platform tokens, constants may default to LIBERO.
- For custom launch wrappers, verify selected platform constants in logs.

Expected defaults:
- LIBERO: `NUM_ACTIONS_CHUNK=8`, `ACTION_DIM=7`, `PROPRIO_DIM=8`
- ALOHA: `NUM_ACTIONS_CHUNK=25`, `ACTION_DIM=14`, `PROPRIO_DIM=14`

## Sanity checks before long runs

Check package versions:

```bash
python -c "import torch, transformers, peft; print('torch', torch.__version__); print('transformers', transformers.__version__); print('peft', peft.__version__)"
```

Check detected constants in launch logs:
- `Using LIBERO constants: ...` or `Using ALOHA constants: ...`

Dry-run one short evaluation before full benchmark:

```bash
python experiments/robot/libero/run_libero_eval.py \
  --pretrained_checkpoint moojink/openvla-7b-oft-finetuned-libero-spatial \
  --task_suite_name libero_spatial \
  --num_trials_per_task 2 \
  --seed 7
```

## Frequent failures and precise fixes

**Failure: `Action un-norm key ... not found in VLA norm_stats`**
- Cause: wrong `unnorm_key` or dataset stats not bundled with checkpoint.
- Fix: use dataset-specific key and verify checkpoint directory contains normalization artifacts.

**Failure: Large performance drop after moving from H100 to A100**
- Cause: merged adapter/model artifact mismatch across hardware/runtime stack.
- Fix: re-merge LoRA on target machine, then evaluate with same runtime flags.

**Failure: Poor LIBERO performance despite good training loss**
- Cause: eval config mismatch (`center_crop`, `num_images_in_input`, chunk settings).
- Fix: align eval with paper-style inference defaults and verify constants output.

**Failure: ALOHA client cannot query server**
- Cause: bad `vla_server_url`, networking, or server not running on `8777`.
- Fix: ensure `vla-scripts/deploy.py` is active, verify endpoint from client, check firewall and DNS.

**Failure: ALOHA ROS import error with `libp11-kit` / `libffi`**
- Cause: binary dependency mismatch in client conda environment.
- Fix: `conda install -c conda-forge libffi`

## Decision hints for key training flags

- Prefer `use_l1_regression=True` for the default paper-style OFT/OFT+ runs.
- Enable `use_film=True` when tasks require stronger language grounding.
- Keep `use_diffusion=False` unless intentionally exploring diffusion action heads.
- Keep `image_aug=True` in training and `center_crop=True` in eval/deploy for consistency.

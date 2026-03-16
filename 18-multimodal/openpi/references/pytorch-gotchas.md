# PyTorch Precision and Patching Gotchas

## Transformer patch requirement

OpenPI PyTorch requires custom patches applied to the installed `transformers` package. Training or inference without the patch produces subtle incompatibilities.

**Apply patches:**

```bash
cp -r ./src/openpi/models_pytorch/transformers_replace/* \
  .venv/lib/python3.11/site-packages/transformers/
```

**Verify the patch is active:**

Check that modified files in the transformers package directory have recent timestamps matching the patch application.

## Patch survives reinstall

If `uv sync` or `pip install` reinstalls `transformers`, the patch is overwritten.

Fix: reapply patches after any dependency reinstall, or run:

```bash
uv cache clean transformers
```

Then reapply the patch.

## OOM while loading checkpoints

Set memory allocation strategy before loading large models:

```bash
export PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True
```

## Resume mode

- `--resume` requires `--exp_name` to match the prior run exactly.
- At least one numeric checkpoint directory must exist under `checkpoints/<config_name>/<exp_name>/`.
- Do not combine `--resume` with other conflicting flags.

## Precision notes

- Default training precision follows the model config.
- When converting from JAX, ensure the output precision matches expectations (bf16 vs fp32).
- Mixed precision settings in PyTorch should align with the source JAX checkpoint precision.

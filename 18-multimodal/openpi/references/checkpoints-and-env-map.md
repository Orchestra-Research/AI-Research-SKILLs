# Checkpoints and Environment Map

Use default environment mode for first runs, then switch to explicit checkpoint mode when needed.

## Default mapping from scripts/serve_policy.py

| Environment | Config | Checkpoint directory |
|-------------|--------|---------------------|
| `ALOHA` | `pi05_aloha` | `gs://openpi-assets/checkpoints/pi05_base` |
| `ALOHA_SIM` | `pi0_aloha_sim` | `gs://openpi-assets/checkpoints/pi0_aloha_sim` |
| `DROID` | `pi05_droid` | `gs://openpi-assets/checkpoints/pi05_droid` |
| `LIBERO` | `pi05_libero` | `gs://openpi-assets/checkpoints/pi05_libero` |

## Common explicit checkpoint commands

```bash
# PI 0.5 DROID
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=pi05_droid \
  --policy.dir=gs://openpi-assets/checkpoints/pi05_droid

# PI 0 FAST DROID
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=pi0_fast_droid \
  --policy.dir=gs://openpi-assets/checkpoints/pi0_fast_droid

# PI 0.5 LIBERO
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=pi05_libero \
  --policy.dir=gs://openpi-assets/checkpoints/pi05_libero
```

## Local checkpoint command template

```bash
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=<config_name> \
  --policy.dir=checkpoints/<config_name>/<exp_name>/<step>
```

## Data home and caching

- OpenPI downloads and caches assets under `~/.cache/openpi` by default.
- Set `OPENPI_DATA_HOME` to move download/cache location.

## LIBERO checkpoint prefetch on clusters

If policy server startup times out while logs show checkpoint downloading:

```bash
# 1) Ensure gsutil exists
pip install gsutil

# 2) Clear stale lock from previous interrupted download
rm -f <OPENPI_DATA_HOME>/openpi-assets/checkpoints/pi05_libero.lock

# 3) Prefetch checkpoint manually
cd <OPENPI_DATA_HOME>/openpi-assets/checkpoints
gsutil -m cp -r gs://openpi-assets/checkpoints/pi05_libero .
```

## Cluster compatibility notes (uv + Slurm)

If `uv sync` fails with `rerun-sdk` wheel/platform mismatch:

```bash
# 1) Skip dev groups
uv sync --no-dev

# 2) Force skip incompatible package
uv sync --no-dev --no-install-package rerun-sdk
```

For shared clusters with small `/home`, point cache roots to scratch:
- `HF_HOME`, `XDG_CACHE_HOME`, `PIP_CACHE_DIR`, `UV_CACHE_DIR`, `TMPDIR`

## Runtime hotfix dependencies for OpenPI + LIBERO

If server startup fails with `ModuleNotFoundError`:

```bash
uv pip install pytest robosuite==1.4.0 gym bddl easydict matplotlib
```

Install into both the OpenPI server environment and the LIBERO client environment.

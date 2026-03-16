# Training Debugging

Use this quick loop during iteration:

1. Confirm config exists and resolves: `src/openpi/training/config.py`.
2. Recompute norm stats after transform or dataset changes.
3. Run short training smoke test.
4. Serve a recent checkpoint and run inference sanity check.

## Common failures and fixes

**Issue: `Config '<name>' not found`**

Fix: use exact config name from `_CONFIGS` in `src/openpi/training/config.py`.

**Issue: Missing normalization stats**

Fix: run `uv run scripts/compute_norm_stats.py --config-name <name>` before training.

**Issue: OOM on JAX startup or training**

Fix:
- Set `XLA_PYTHON_CLIENT_MEM_FRACTION=0.9`
- Lower batch size
- Use `fsdp_devices` for model sharding

**Issue: No progress after resume request**

Fix: ensure checkpoint directory exists and includes numeric step folders.

**Issue: Incompatible resume and overwrite settings**

Fix: do not set both simultaneously.

## Validation commands

```bash
# Quick serve validation
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=<config_name> \
  --policy.dir=checkpoints/<config_name>/<exp_name>/<step>

# Quick client test
uv run examples/simple_client/main.py --env DROID
```

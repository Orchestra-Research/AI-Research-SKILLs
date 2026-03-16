# Remote Client Pattern

Use this pattern when the policy server runs on a GPU machine and control code runs elsewhere.

## Server side

```bash
uv run scripts/serve_policy.py --env DROID
# or
uv run scripts/serve_policy.py policy:checkpoint \
  --policy.config=pi05_droid \
  --policy.dir=gs://openpi-assets/checkpoints/pi05_droid
```

Default port is `8000`.

## Robot or eval client side

Install client package:

```bash
uv pip install -e packages/openpi-client
```

Call server from Python:

```python
from openpi_client import websocket_client_policy

client = websocket_client_policy.WebsocketClientPolicy(host="server-ip", port=8000)
result = client.infer(observation)
actions = result["actions"]
```

## Observation contract checks

- Pass observation keys expected by your policy transforms.
- Pass prompt as `observation["prompt"]` or use server `--default_prompt`.
- Resize image tensors to the expected model input shape before call (typically `224`).
- Keep state values in the policy's expected coordinate and ordering conventions.

## Read before integration

- `docs/remote_inference.md`
- `examples/simple_client/README.md`
- `examples/droid/README.md`
- `examples/aloha_real/README.md`

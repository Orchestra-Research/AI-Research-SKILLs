"""Check a pinned official I-JEPA model on CPU, without pretrained weights."""

import argparse
import copy
import json
import subprocess
import sys
from pathlib import Path

import torch
from torch.nn import functional as F

REVISION = "52c1ae95d05f743e000e8f10a1f3a79b10cff048"  # pragma: allowlist secret


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ijepa-root", type=Path, required=True)
    args = parser.parse_args()
    root = args.ijepa_root.resolve()
    revision = subprocess.check_output(
        ["git", "-C", str(root), "rev-parse", "HEAD"], text=True
    ).strip()
    if revision != REVISION:
        parser.error(f"Expected official revision {REVISION}, got {revision}")
    sys.path.insert(0, str(root))
    from src.models.vision_transformer import vit_predictor, vit_tiny

    torch.manual_seed(0)
    torch.set_num_threads(2)
    encoder = vit_tiny(img_size=[64], patch_size=16)
    teacher = copy.deepcopy(encoder).requires_grad_(False).eval()
    predictor = vit_predictor(
        num_patches=16, embed_dim=192, predictor_embed_dim=96, depth=2, num_heads=3
    )
    images = torch.randn(2, 3, 64, 64)
    visible = [torch.arange(8).repeat(2, 1)]
    hidden = [torch.arange(8, 16).repeat(2, 1)]
    prediction = predictor(encoder(images, visible), visible, hidden)
    with torch.no_grad():
        targets = F.layer_norm(teacher(images), (192,))[:, 8:]
    assert prediction.shape == targets.shape == (2, 8, 192)
    loss = F.smooth_l1_loss(prediction, targets)
    loss.backward()
    assert all(p.grad is None for p in teacher.parameters())
    assert any(
        p.grad is not None and p.grad.abs().sum() > 0 for p in encoder.parameters()
    )
    assert any(
        p.grad is not None and p.grad.abs().sum() > 0 for p in predictor.parameters()
    )
    print(
        json.dumps(
            {
                "official_revision": revision,
                "device": "cpu",
                "prediction_shape": list(prediction.shape),
                "loss": loss.item(),
                "pretrained_weights": False,
                "gradient_checks_passed": True,
            }
        )
    )


if __name__ == "__main__":
    main()

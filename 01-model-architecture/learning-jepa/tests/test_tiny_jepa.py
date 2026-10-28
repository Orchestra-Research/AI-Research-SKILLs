"""Behavioral checks for the actual teaching model."""

import sys
from pathlib import Path

import pytest
import torch
from torch.nn import functional as F

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "examples"))
from tiny_jepa import TinyJEPA, patches


def test_shapes_and_gradient_boundaries():
    torch.manual_seed(0)
    torch.set_num_threads(2)
    model = TinyJEPA()
    prediction, target = model(
        torch.randn(3, 16, 4), torch.arange(8), torch.arange(8, 16)
    )
    assert prediction.shape == target.shape == (3, 8, 32)
    assert not target.requires_grad
    F.smooth_l1_loss(prediction, target).backward()
    assert all(p.grad is None for p in model.target.parameters())
    assert any(
        p.grad is not None and p.grad.abs().sum() > 0
        for p in model.context.parameters()
    )
    assert model.project.weight.grad.abs().sum() > 0
    assert any(
        p.grad is not None and p.grad.abs().sum() > 0
        for p in model.predictor.parameters()
    )


def test_ema_is_exact_and_does_not_modify_context():
    model = TinyJEPA()
    with torch.no_grad():
        for p in model.context.parameters():
            p.fill_(2)
        for p in model.target.parameters():
            p.fill_(0)
    model.update_target(0.75)
    assert all(
        torch.allclose(p, torch.full_like(p, 0.5)) for p in model.target.parameters()
    )
    assert all(
        torch.allclose(p, torch.full_like(p, 2)) for p in model.context.parameters()
    )


def test_overlap_is_rejected():
    with pytest.raises(ValueError, match="disjoint"):
        TinyJEPA()(torch.randn(2, 16, 4), torch.arange(8), torch.arange(4, 12))


def test_hidden_pixels_do_not_leak_into_prediction():
    torch.manual_seed(3)
    model = TinyJEPA().eval()
    original = torch.randn(2, 16, 4)
    changed = original.clone()
    changed[:, 8:] += 10
    context, target = torch.arange(8), torch.arange(8, 16)
    with torch.no_grad():
        before, before_target = model(original, context, target)
        after, after_target = model(changed, context, target)
    torch.testing.assert_close(before, after)
    assert not torch.allclose(before_target, after_target)


@pytest.mark.parametrize(
    "invalid", [torch.tensor([-1]), torch.tensor([16]), torch.tensor([0, 0])]
)
def test_invalid_indices_cannot_bypass_mask_boundary(invalid):
    with pytest.raises(ValueError, match="range|unique"):
        TinyJEPA()(torch.randn(2, 16, 4), invalid, torch.arange(8, 16))


def test_patch_layout_preserves_spatial_blocks():
    import numpy as np

    image = np.arange(64).reshape(1, 8, 8)
    result = patches(image)
    assert result.shape == (1, 16, 4)
    assert result[0, 0].tolist() == [0, 1, 8, 9]
    assert result[0, -1].tolist() == [54, 55, 62, 63]

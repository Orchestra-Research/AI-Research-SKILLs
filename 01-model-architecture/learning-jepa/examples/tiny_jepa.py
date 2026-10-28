"""Small latent-prediction teaching experiment, NOT an I-JEPA reproduction."""

import argparse
import copy
import json
import time
from pathlib import Path

import numpy as np
import torch
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from torch import nn
from torch.nn import functional as F


class Encoder(nn.Module):
    def __init__(self, width=32):
        super().__init__()
        self.embed = nn.Linear(4, width)
        self.position = nn.Parameter(torch.randn(1, 16, width) * 0.02)
        layer = nn.TransformerEncoderLayer(
            width, 4, width * 2, dropout=0, batch_first=True
        )
        self.blocks = nn.TransformerEncoder(layer, 2, enable_nested_tensor=False)

    def forward(self, patches, ids=None):
        tokens = self.embed(patches) + self.position
        if ids is not None:
            tokens = tokens[:, ids]
        return self.blocks(tokens)


class TinyJEPA(nn.Module):
    def __init__(self, width=32):
        super().__init__()
        self.context = Encoder(width)
        self.target = copy.deepcopy(self.context).requires_grad_(False)
        self.mask_token = nn.Parameter(torch.zeros(1, 1, width))
        self.position = nn.Parameter(torch.randn(1, 16, width) * 0.02)
        layer = nn.TransformerEncoderLayer(
            width, 4, width * 2, dropout=0, batch_first=True
        )
        self.predictor = nn.TransformerEncoder(layer, 1, enable_nested_tensor=False)
        self.project = nn.Linear(width, width)

    def forward(self, patches, context_ids, target_ids):
        for ids in (context_ids, target_ids):
            if (
                ids.ndim != 1
                or ids.dtype not in (torch.int32, torch.int64)
                or not ids.numel()
            ):
                raise ValueError(
                    "Masks must contain a nonempty vector of integer indices"
                )
            if (ids < 0).any() or (ids >= patches.shape[1]).any():
                raise ValueError("Mask index outside patch range")
            if ids.unique().numel() != ids.numel():
                raise ValueError("Mask indices must be unique")
        if set(context_ids.tolist()) & set(target_ids.tolist()):
            raise ValueError("Context and target masks must be disjoint")
        context = self.context(patches, context_ids)
        masks = self.mask_token.expand(len(patches), len(target_ids), -1)
        masks = masks + self.position[:, target_ids]
        tokens = torch.cat((context, masks), dim=1)
        prediction = self.project(self.predictor(tokens)[:, len(context_ids) :])
        with torch.no_grad():
            target = self.target(patches)[:, target_ids]
            target = F.layer_norm(target, (target.shape[-1],))
        return prediction, target

    @torch.no_grad()
    def update_target(self, momentum=0.99):
        for target, context in zip(
            self.target.parameters(), self.context.parameters(), strict=True
        ):
            target.mul_(momentum).add_(context, alpha=1 - momentum)


def patches(images):
    return images.reshape(-1, 4, 2, 4, 2).transpose(0, 1, 3, 2, 4).reshape(-1, 16, 4)


@torch.no_grad()
def features(encoder, data):
    encoder.eval()
    return torch.cat(
        [encoder(batch).mean(1).cpu() for batch in data.split(128)]
    ).numpy()


def experiment(seed, steps=400):
    torch.manual_seed(seed)
    torch.set_num_threads(2)
    dataset = load_digits()
    x = patches(dataset.images.astype(np.float32) / 16)
    train, test = train_test_split(
        np.arange(len(x)), test_size=0.25, random_state=42, stratify=dataset.target
    )
    train_x, test_x = torch.from_numpy(x[train]), torch.from_numpy(x[test])
    model = TinyJEPA()
    initial_encoder = copy.deepcopy(model.context)
    parameters = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.AdamW(parameters, lr=0.001, weight_decay=0.01)
    context_ids, target_ids = torch.arange(0, 16, 2), torch.arange(1, 16, 2)

    def heldout_loss():
        model.eval()
        with torch.no_grad():
            predicted, target = model(test_x[:128], context_ids, target_ids)
            return F.smooth_l1_loss(predicted, target).item()

    initial_loss = heldout_loss()
    started = time.perf_counter()
    training_losses = []
    for step in range(steps):
        model.train()
        batch = train_x[torch.randint(len(train_x), (64,))]
        order = torch.randperm(16)
        predicted, target = model(batch, order[:8], order[8:])
        loss = F.smooth_l1_loss(predicted, target)
        if not torch.isfinite(loss):
            raise RuntimeError("Non-finite loss")
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        model.update_target()
        training_losses.append(loss.item())
    report = {
        "seed": seed,
        "steps": steps,
        "train_n": len(train),
        "test_n": len(test),
        "initial_heldout_loss": initial_loss,
        "final_heldout_loss": heldout_loss(),
        "seconds": time.perf_counter() - started,
        "final_training_loss": training_losses[-1],
    }
    with torch.no_grad():
        prediction, _ = model(test_x[:128], context_ids, target_ids)
        fixed = initial_encoder(test_x[:128])[:, target_ids]
        report["final_loss_against_initial_teacher"] = F.smooth_l1_loss(
            prediction, F.layer_norm(fixed, (fixed.shape[-1],))
        ).item()
    for name, encoder in [("random", initial_encoder), ("trained", model.context)]:
        a, b = features(encoder, train_x), features(encoder, test_x)
        probe = make_pipeline(
            StandardScaler(), LogisticRegression(C=1.0, max_iter=2000)
        ).fit(a, dataset.target[train])
        report[f"{name}_probe_accuracy"] = probe.score(b, dataset.target[test])
        report[f"{name}_feature_std"] = float(a.std(axis=0).mean())
    pixels = make_pipeline(
        StandardScaler(), LogisticRegression(C=1.0, max_iter=2000)
    ).fit(x[train].reshape(len(train), -1), dataset.target[train])
    report["raw_pixel_probe_accuracy"] = pixels.score(
        x[test].reshape(len(test), -1), dataset.target[test]
    )
    report["labels_used_for_pretraining"] = False
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--steps", type=int, default=400)
    parser.add_argument("--seeds", type=int, nargs="+", default=[0, 1, 2])
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    if args.steps < 1:
        parser.error("steps must be positive")
    results = []
    for seed in args.seeds:
        result = experiment(seed, args.steps)
        results.append(result)
        print(json.dumps(result), flush=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(
            {
                "torch": torch.__version__,
                "numpy": np.__version__,
                "device": "cpu",
                "data": "sklearn bundled digits",
                "split_seed": 42,
                "probe": "Train-only StandardScaler and LogisticRegression C=1; same pipeline for all controls",
                "interpretation": "Teaching experiment; no ImageNet/I-JEPA reproduction claim",
                "runs": results,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )

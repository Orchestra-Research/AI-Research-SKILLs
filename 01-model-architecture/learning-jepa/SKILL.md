---
name: learning-jepa
description: Guides image JEPA implementation and experiment validation, including masking, target EMA, gradient boundaries, collapse diagnostics, and controlled representation evaluation. Use when studying joint embedding prediction or checking a small JEPA-style experiment.
version: 0.1.0
author: Orchestra Research
license: MIT
tags: [Model Architecture, JEPA, Self-Supervised Learning, Representation Learning, PyTorch, Evaluation]
dependencies: [torch>=2.8.0, numpy>=2.2.6, scikit-learn>=1.8.0]
---

# Learning and validating JEPA

## Choose the appropriate scope

Use this skill to inspect or implement latent prediction for image representations.
Use the bundled example to test mechanics and diagnose misleading training results.
Use the official implementation for a faithful I-JEPA reproduction.
For video pretraining, consult the official V-JEPA implementation separately.
Do not transfer image masks or compute requirements to video without checking them.

JEPA predicts target representations from available context.
It does not require a pixel reconstruction decoder.
The image JEPA and video JEPA implementations are related but not interchangeable.
Read [architecture.md](references/architecture.md) for sources and implementation boundaries.

The bundled digits experiment is intentionally small and educational.
It is not ImageNet pretraining, a model release, or an I-JEPA reproduction.
Its measured result does not establish useful pretrained representations.
Read [validation.md](references/validation.md) before interpreting its loss curve.

## Essential invariants

- Context input must not contain the target patch pixels.
- Context and target patch indices must be valid and disjoint.
- Target features must be detached from ordinary loss gradients.
- The optimizer must not update target encoder parameters directly.
- EMA updates must use the intended context/target parameter pairing.
- The predictor receives context features and target positions, not target features.
- Target normalization must follow the selected implementation.
- Loss comparisons must acknowledge that an EMA teacher changes during training.
- Labels may be used for the downstream probe, not for self-supervised training.
- Train/test splits and preprocessing must be fixed before comparing models.

## Component map

| Component | Role | Failure to catch |
| --- | --- | --- |
| Context encoder | Encodes visible image patches | Hidden target pixels enter its input |
| Predictor | Predicts representations at target positions | Target feature leakage |
| Target encoder | Produces the detached learning targets | Gradients or optimizer updates |
| EMA update | Slowly follows context encoder parameters | Reversed weighting or wrong parameter order |
| Masks | Specify observed and predicted positions | Overlap, duplicate positions, invalid indices |
| Probe | Measures information useful for a downstream task | Data leakage or feature-scale confounding |

## Workflow 1: inspect and run official I-JEPA code

Read [official-workflow.md](references/official-workflow.md) for tensor layout,
mask sampling, checkpoint loading, and the source-checked training launcher.
Use the official implementation when fidelity matters; use the digits example
for a quick investigation of latent-prediction mechanics.

### Prepare a clean CPU environment

From this skill directory, create and activate a Python 3.11 environment.
Use `python -m venv .venv`, then activate it using your platform's venv command.
Install CPU PyTorch first, followed by the tested example dependencies:

```bash
python -m pip install torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r requirements.txt
```

These requirements cover the examples and tests, not official full pretraining.
Keep the official checkout outside the skill directory:

```bash
git clone https://github.com/facebookresearch/ijepa.git /path/to/ijepa
git -C /path/to/ijepa checkout --detach 52c1ae95d05f743e000e8f10a1f3a79b10cff048
python examples/official_smoke.py --ijepa-root /path/to/ijepa
```

The smoke check uses the actual official encoder and predictor on CPU.
It expects predictions shaped `[2, 8, 192]` and checks gradient boundaries.
It uses random weights, 64x64 images, and manually specified masks.
It does not measure pretrained representation quality or exercise the training loader.

### Move from smoke check to a real experiment

- [ ] Choose a checkpoint/configuration with matching architecture and patch size.
- [ ] Record image preprocessing and feature-pooling choices.
- [ ] Trace target normalization and mask/batch expansion in the training loop.
- [ ] Verify optimizer membership and the timing of target EMA updates.
- [ ] Inspect actual mask overlap after changing sampler parameters.
- [ ] Replace dataset/output paths in a local configuration copy.
- [ ] Check per-process versus global batch size before adapting the GPU count.
- [ ] Fit a probe on training features, select settings on validation data,
      and preserve an untouched final test split.

The official repository is archived. The smoke check validates selected model APIs
with the tested environment; full training/checkpoint evaluation remains unexecuted.
The reference lists those source-checked commands and their resource boundaries.

## Workflow 2: run the small correctness example

The example needs PyTorch, NumPy, scikit-learn, and pytest.
Use a fresh environment or record any inherited environment packages.
The validated local run used CPU PyTorch; CUDA was not available to that interpreter.
Do not claim a GPU smoke test solely because the machine has a GPU.

From this skill directory, run:

```bash
python -m pytest tests/test_tiny_jepa.py -q
python examples/tiny_jepa.py --steps 400 --seeds 0 1 2 --output results/digits.json
```

The example uses scikit-learn's bundled 8x8 digits dataset.
It requires no image download or model checkpoint.
The dataset is split with seed 42 into 1,347 training and 450 test examples.
Labels select a stratified split and fit probes; they do not enter the training loss.

### Correctness checklist

- [ ] Patch extraction preserves each 2x2 spatial block.
- [ ] Predictor and target output shapes agree.
- [ ] Context/target overlap raises an error.
- [ ] Context parameters receive nonzero gradients.
- [ ] Predictor parameters receive nonzero gradients.
- [ ] Target parameters receive no loss gradients.
- [ ] EMA arithmetic matches a hand-computed numerical case.
- [ ] Context weights remain unchanged during the EMA-only update.
- [ ] Training rejects non-finite losses.

The tests execute the actual model implementation.
They do not merely search its source for a detach call or an EMA expression.
Passing them establishes these mechanics, not a faithful paper reproduction.

### Target-update reference

For a fixed momentum `m`, the intended parameter update is:

```python
with torch.no_grad():
    for target, context in zip(
        target_encoder.parameters(), context_encoder.parameters(), strict=True
    ):
        target.mul_(m).add_(context, alpha=1 - m)
```

The teaching encoder has no BatchNorm running buffers and uses zero dropout.
If changing the architecture, define target-buffer and stochastic-layer behavior explicitly.
Do not assume updating parameters also updates all module buffers.

## Workflow 3: decide whether representations improved

Compare at least the following on one fixed split:

1. A frozen randomly initialized encoder with the same architecture.
2. The frozen encoder after latent-prediction training.
3. A raw-pixel linear probe as a simple reference for the digits task.

Use the same probe fitting procedure for each representation.
Fit scaling on training features only and apply it unchanged to test features.
The example uses `StandardScaler` followed by logistic regression with `C=1`.
This avoids confusing lower feature magnitude with stronger effective regularization.

### Keep all diagnostic outputs

- Initial and final loss against the current teacher.
- Final prediction loss against the frozen initial teacher.
- Training and held-out example counts.
- Random-encoder and trained-encoder probe accuracy for each seed.
- Raw-pixel probe accuracy under the same preprocessing procedure.
- Mean feature standard deviation over training examples.
- Seed, step count, runtime, device, and package versions.

The current-teacher loss is measured against a moving target.
A small value can coexist with reduced feature variation and no downstream gain.
Loss against the frozen initial teacher is a diagnostic, not the training objective.
Feature variance alone is also insufficient to prove or rule out collapse.

### Interpretation checklist

- [ ] Inspect all configured seeds, including unfavorable ones.
- [ ] Compare trained and random probes after train-only standardization.
- [ ] Report absolute scores and paired per-seed differences.
- [ ] Keep preliminary runs when correcting a methodological error.
- [ ] Do not tune on the final test labels after observing these results.
- [ ] Distinguish shared test data across seeds from independent datasets.
- [ ] Avoid statistical-significance claims from three seeds and one tiny dataset.
- [ ] Inspect whether the task/data/masks are appropriate before scaling training.

## Troubleshooting

### Loss falls but the probe gets worse

First check the random-encoder control and feature variation.
Check probe scaling, teacher drift, mask leakage, and data preprocessing.
Do not fix the narrative by removing an unfavorable seed.
Do not add a new regularizer and describe it as unchanged I-JEPA.

### Target parameters have gradients

Check `requires_grad`, no-grad boundaries, and optimizer membership.
The target must remain frozen to the ordinary loss optimizer.
EMA updates are separate and should be covered by the numerical test.

### The example is fast on CPU but official training is expensive

The bundled model, image size, dataset, and schedule differ substantially.
Runtime of this example cannot estimate official pretraining cost reliably.
Treat a full reproduction as a separate experiment with its own resource plan.

### A negative result appears inconsistent with the paper

Check the experiment identity before interpreting the difference.
The teaching example is not the published architecture/data/masking recipe.
A negative digits result is not a falsification of the paper.
It can still demonstrate why controls and clear scope are necessary.

## Choose image versus video JEPA

For video, start from the official V-JEPA repository linked in architecture.md.
Trace frame sampling, temporal tubelets, and spatiotemporal masks separately.
The image example has no temporal dimension or video preprocessing pipeline.
Use a video-specific checkpoint and evaluation protocol for video tasks.
Keep claims about representation prediction separate from downstream planning.

See [architecture.md](references/architecture.md) for the family/source distinction.

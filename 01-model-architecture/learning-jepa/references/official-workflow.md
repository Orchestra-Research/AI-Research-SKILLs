# Working with official I-JEPA

## Source map

All image-code links below use revision `52c1ae95d05f743e000e8f10a1f3a79b10cff048`:

- [README and checkpoint table](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/README.md)
- [Training loop](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/src/train.py)
- [Encoder and predictor classes](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/src/models/vision_transformer.py)
- [Block-mask sampler](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/src/masks/multiblock.py)
- [Model/checkpoint helpers](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/src/helper.py)
- [ViT-H/14 configuration](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/configs/in1k_vith14_ep300.yaml)

## Trace the tensors

The official encoder accepts RGB images `[B, 3, H, W]`. Patch size and image size determine the spatial token grid. Position embeddings are added before the visible mask is applied; transformer attention then processes the retained tokens. Masks are lists of per-image integer-index tensors, rather than the shared one-dimensional indices used by the teaching example.

The predictor projects context tokens into its own embedding dimension, adds positions and mask tokens for predicted locations, and maps its output back to encoder width. Context and predictor widths need not match. Multiple context/target masks expand the batch arrangement; inspect the repeat ordering before comparing predictions to targets.

The target branch encodes the full image under no-grad, normalizes the features, and selects target locations. Ordinary optimization updates the encoder and predictor. An EMA update follows the optimizer step. These are separate mechanisms; a frozen target still changes through EMA.

The published configuration uses block sampling, one context mask, four target masks, and an EMA schedule from 0.996 toward 1.0. The sampler can relax acceptable regions after repeated failures. Inspect actual sampled indices when auditing overlap, especially after changing scale/minimum-size settings; a configuration flag alone is not a proof about every sampled mask.

## Run an inexpensive official-code check

Follow the installation and clone commands in SKILL.md. `official_smoke.py` calls the official encoder and predictor with random weights, a 64x64 image, and explicit masks. It checks output alignment and gradient boundaries on CPU. It does not run the official data loader, block sampler, optimizer schedule, or pretrained evaluation.

Expected output includes `prediction_shape: [2, 8, 192]`, detached teacher gradients, and nonzero encoder/predictor gradients. This is an API/mechanics smoke check, not a representation-quality result.

## Configure training on suitable hardware

These launch instructions are source-checked references, not locally executed training. Use an environment compatible with the official README's PyTorch/torchvision, NumPy, PyYAML, OpenCV, and submitit requirements. The CPU example requirements do not install the full pretraining stack. The archived repository has no root requirements.txt at this revision.

Copy `configs/in1k_vith14_ep300.yaml` to a local experiment config. Replace `data.root_path`, `data.image_folder`, and `logging.folder` with real dataset/output paths. `batch_size` is per process: changing GPU count changes global batch size. Changing crop size, patch size, masks, batch size, or learning schedule creates an adapted experiment, not the published run.

The official local launcher accepts:

```bash
python main.py --fname configs/local.yaml --devices cuda:0
```

The supplied ViT-H recipe is substantially larger than the CPU smoke model. The official README describes a 16-A100-80GB reproduction setup; a single-device launch syntax does not establish that this configuration fits a small GPU. Plan data access and memory separately before launching.

## Load checkpoints and evaluate representations

Choose the architecture, patch size, and input resolution from the official checkpoint table together. Inspect checkpoint keys: `encoder`, `target_encoder`, and `predictor` are distinct states. Choose an evaluation branch explicitly. Training snapshots may have distributed `module.` prefixes; remove that prefix only when adapting a distributed state to an unwrapped model, and then require strict key/shape agreement.

The full-training loader also restores optimizer/scaler state and can fall back to epoch zero on a load error. Inspect its logs; file presence alone does not prove a successful resume. For feature evaluation, use an explicit model state load with checked keys, freeze the encoder, and record preprocessing and token-pooling choices. The encoder returns patch features; selecting a patch as an assumed classification token silently changes the representation.

Fit a linear classifier using training features and labels; fit any scaling on training data only. Select hyperparameters on validation data, then evaluate held-out data once. Report the chosen encoder branch, checkpoint URL/revision, image preprocessing, pooling, data split, probe settings, and random-encoder control. Do not transfer the digits probe's scores to official ImageNet weights.

Checkpoint downloads, pretrained inference, and full pretraining were not executed for this contribution. The verified official-code smoke check uses random weights only.

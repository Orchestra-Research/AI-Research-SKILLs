# Architecture references and scope

Primary paper: [I-JEPA, version 3](https://arxiv.org/abs/2301.08243v3).
Implementation reference: [official training code at 52c1ae95](https://github.com/facebookresearch/ijepa/blob/52c1ae95d05f743e000e8f10a1f3a79b10cff048/src/train.py).
Video comparison: [official V-JEPA repository at 51c59d51](https://github.com/facebookresearch/jepa/tree/51c59d518fc63c08464af6de585f78ac0c7ed4d5).

I-JEPA predicts representations of target image regions from context regions. Its published setup uses a particular block masking design and image pretraining configuration. The bundled example preserves the broad context/predictor/detached-target/EMA distinction, but uses 8x8 digits, non-block random patch masks, a small transformer, a constant EMA coefficient, and a short training schedule. It is therefore a teaching model, not a scaled-down reproduction with validated equivalence.

V-JEPA extends representation prediction to video; use its own implementation to determine temporal masking, preprocessing, and evaluation. The image example cannot substantiate video-understanding or planning capabilities.

The numerical tests check gradient and update boundaries directly. They do not establish semantic representation quality. The bundled experiment deliberately evaluates frozen representations so that a lower prediction loss cannot substitute for an observed downstream result.

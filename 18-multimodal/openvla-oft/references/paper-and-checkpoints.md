# OpenVLA-OFT Paper and Checkpoints

## Paper identity

- Title: Fine-Tuning Vision-Language-Action Models: Optimizing Speed and Success
- Authors: Moo Jin Kim, Chelsea Finn, Percy Liang
- Year: 2025
- ArXiv: https://arxiv.org/abs/2502.19645
- Project page: https://openvla-oft.github.io/
- Summary video: https://youtu.be/T3Zkkr_NTSA

## What OpenVLA-OFT changes

OpenVLA-OFT adapts OpenVLA for robot action generation with:
- LoRA-based fine-tuning on VLA policies.
- Continuous action prediction through dedicated action heads.
- Optional FiLM conditioning for stronger language grounding (called OFT+ in ALOHA setup).
- Multi-image and proprio input support via configurable model components.

## Compute requirements from official docs

Inference:
- LIBERO tasks: about 16 GB VRAM.
- ALOHA tasks: about 18 GB VRAM.

Training:
- 1 to 8 GPUs, roughly 27 GB to 80 GB VRAM depending on batch size, feature toggles, and precision.

## Reproduction-sensitive environment notes

For reported LIBERO numbers, docs recommend:
- Python 3.10.14
- PyTorch 2.2.0
- OpenVLA-OFT custom Transformers fork (`transformers-openvla-oft`)
- NVIDIA A100 when matching paper setup

If reproduction diverges, check:
- Different GPU architecture
- Dependency drift (`torch`, `transformers`, `peft`)
- Inference mismatches (`center_crop`, action chunk settings, and un-normalization keys)

## Official LIBERO checkpoints

Task-specific:
- `moojink/openvla-7b-oft-finetuned-libero-spatial`
- `moojink/openvla-7b-oft-finetuned-libero-object`
- `moojink/openvla-7b-oft-finetuned-libero-goal`
- `moojink/openvla-7b-oft-finetuned-libero-10`

Combined training across all four suites:
- `moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10`

## Reported comparison note

The repository documentation reports comparable average success across four suites between:
- task-specific policies: 97.1%
- combined policy: 96.8%

Treat these as reference values tied to official setup and seeds.

## Model mode selection: OFT vs OFT+

Typical defaults:
- OFT (LIBERO): `use_film=False`, `num_images_in_input=2`, `use_proprio=True`.
- OFT+ (ALOHA): `use_film=True`, `num_images_in_input=3`, `use_proprio=True`.

Always match training and inference flags for:
- `use_l1_regression` / `use_diffusion`
- `use_film`
- `num_images_in_input`
- `use_proprio`
- `lora_rank`

## Citation block

```bibtex
@article{kim2025fine,
  title={Fine-Tuning Vision-Language-Action Models: Optimizing Speed and Success},
  author={Kim, Moo Jin and Finn, Chelsea and Liang, Percy},
  journal={arXiv preprint arXiv:2502.19645},
  year={2025}
}
```

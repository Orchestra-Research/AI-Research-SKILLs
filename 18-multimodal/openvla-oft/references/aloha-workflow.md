# ALOHA Workflow

## Scope

Use this guide for OpenVLA-OFT+ training and real-robot evaluation with the ALOHA stack.

The ALOHA path uses server-client inference:
- Server machine hosts the VLA model and exposes `/act`.
- Client machine controls robot env and requests actions from the server.

## 1) Prepare environments

Server-side environment:

```bash
conda create -n openvla-oft python=3.10 -y
conda activate openvla-oft
pip3 install torch torchvision torchaudio
pip install -e .
pip install uvicorn fastapi json-numpy
```

Client-side environment:

```bash
conda create -n openvla-oft-aloha python=3.10 -y
conda activate openvla-oft-aloha
pip3 install torch torchvision torchaudio
pip install -e .
pip install -r experiments/robot/aloha/requirements_aloha.txt
```

## 2) Preprocess and split raw demonstrations

```bash
python experiments/robot/aloha/preprocess_split_aloha_data.py \
  --dataset_path /path/to/aloha_raw/task_name/ \
  --out_base_dir /path/to/aloha_preprocessed/ \
  --percent_val 0.05
```

Repeat preprocessing per object/task variant, then convert to unified RLDS dataset using the RLDS builder flow.

RLDS builder reference: https://github.com/moojink/rlds_dataset_builder

## 3) Register dataset and constants

Add dataset entries in:
- `prismatic/vla/datasets/rlds/oxe/configs.py`
- `prismatic/vla/datasets/rlds/oxe/transforms.py`
- `prismatic/vla/datasets/rlds/oxe/mixtures.py`

Set platform constants in `prismatic/vla/constants.py`:
- Set `NUM_ACTIONS_CHUNK` to match control frequency (often 25 for 25 Hz).
- Keep ALOHA normalization type for absolute joint-angle actions (`BOUNDS`).
- Avoid clipping normalization for absolute-angle output.

## 4) Launch OFT+ training

```bash
torchrun --standalone --nnodes 1 --nproc-per-node 8 vla-scripts/finetune.py \
  --vla_path openvla/openvla-7b \
  --data_root_dir /PATH/TO/RLDS/DATASETS/ \
  --dataset_name aloha_task_name \
  --run_root_dir /YOUR/CHECKPOINTS/ \
  --use_l1_regression True \
  --use_diffusion False \
  --use_film True \
  --num_images_in_input 3 \
  --use_proprio True \
  --batch_size 4 \
  --learning_rate 5e-4 \
  --num_steps_before_decay 50000 \
  --max_steps 100005 \
  --use_val_set True \
  --val_freq 10000 \
  --save_freq 10000 \
  --save_latest_checkpoint_only False \
  --image_aug True \
  --lora_rank 32 \
  --wandb_entity YOUR_WANDB_ENTITY \
  --wandb_project YOUR_WANDB_PROJECT
```

High-impact knobs:
- `use_film=True` for language grounding in OFT+.
- `num_images_in_input=3` for high + left wrist + right wrist streams.
- LR decay timing relative to dataset size.

## 5) Deploy VLA server

On GPU server:

```bash
python vla-scripts/deploy.py \
  --pretrained_checkpoint /PATH/TO/FINETUNED/CHECKPOINT/ \
  --use_l1_regression True \
  --use_film True \
  --num_images_in_input 3 \
  --use_proprio True \
  --center_crop True \
  --unnorm_key aloha_task_name
```

Notes:
- Default API endpoint: `http://<server-ip>:8777/act`
- Ensure client can resolve `vla_server_url`.

## 6) Run client-side robot evaluation

```bash
python experiments/robot/aloha/run_aloha_eval.py \
  --center_crop True \
  --num_open_loop_steps 25 \
  --use_vla_server True \
  --vla_server_url http://<SERVER_IP>:8777 \
  --num_rollouts_planned 50 \
  --max_steps 1500
```

During rollout:
- Script prompts operator to start.
- Script asks for success label (`y` or `n`) after each rollout.
- Logs and replay videos are saved locally.

## 7) Troubleshooting notes

ROS/libffi import issue on client:

```bash
conda install -c conda-forge libffi
```

Action quality issues:
- Check server and training config parity (`use_film`, `num_images_in_input`, `lora_rank`).
- Check `unnorm_key` against dataset stats.
- Keep `num_open_loop_steps` aligned with trained chunk size.

Cross-device performance drop:
- Merge LoRA on target hardware before final evaluation.

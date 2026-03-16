# LIBERO Workflow

## Scope

Use this guide for OpenVLA-OFT setup, evaluation, and fine-tuning on LIBERO simulation task suites.

Task suite names used by evaluator:
- `libero_spatial`
- `libero_object`
- `libero_goal`
- `libero_10`

## 1) Setup and dependencies

```bash
conda create -n openvla-oft python=3.10 -y
conda activate openvla-oft
pip3 install torch torchvision torchaudio
pip install -e .

git clone https://github.com/Lifelong-Robot-Learning/LIBERO.git
pip install -e LIBERO
pip install -r experiments/robot/libero/libero_requirements.txt
```

Optional dataset download from docs:

```bash
git clone git@hf.co:datasets/openvla/modified_libero_rlds
```

## 2) Evaluate official checkpoints

Example for LIBERO-Spatial:

```bash
python experiments/robot/libero/run_libero_eval.py \
  --pretrained_checkpoint moojink/openvla-7b-oft-finetuned-libero-spatial \
  --task_suite_name libero_spatial \
  --center_crop True \
  --num_trials_per_task 50 \
  --seed 7
```

Common changes:
- `--task_suite_name libero_object|libero_goal|libero_10`
- `--num_trials_per_task` for shorter sanity runs
- `--use_wandb True --wandb_project ... --wandb_entity ...`

## 3) Fine-tune on LIBERO RLDS

Base recipe (paper-style command):

```bash
torchrun --standalone --nnodes 1 --nproc-per-node 8 vla-scripts/finetune.py \
  --vla_path openvla/openvla-7b \
  --data_root_dir /PATH/TO/RLDS/DATASETS/DIR/ \
  --dataset_name libero_spatial_no_noops \
  --run_root_dir /YOUR/CHECKPOINTS/AND/LOG/DIR/ \
  --use_l1_regression True \
  --use_diffusion False \
  --use_film False \
  --num_images_in_input 2 \
  --use_proprio True \
  --batch_size 8 \
  --learning_rate 5e-4 \
  --num_steps_before_decay 100000 \
  --max_steps 150005 \
  --save_freq 10000 \
  --save_latest_checkpoint_only False \
  --image_aug True \
  --lora_rank 32 \
  --wandb_entity YOUR_WANDB_ENTITY \
  --wandb_project YOUR_WANDB_PROJECT
```

Replace `dataset_name` with one of:
- `libero_spatial_no_noops`
- `libero_object_no_noops`
- `libero_goal_no_noops`
- `libero_10_no_noops`

## 4) Selection and validation strategy

Suggested checkpoint strategy:
- Evaluate 50k, 100k, and 150k checkpoints.
- Keep the best checkpoint per suite by actual task success, not only train loss.

Reason: docs report LIBERO-Goal may peak earlier than other suites.

Validation checks:
- Confirm `center_crop=True` during eval if trained with `image_aug=True`.
- Confirm `num_open_loop_steps` matches `NUM_ACTIONS_CHUNK`.
- Confirm `unnorm_key` exists in `model.norm_stats`.

## 5) LoRA merge for deployment

Use this when serving or evaluating on different hardware:

```bash
python vla-scripts/merge_lora_weights_and_save.py \
  --base_checkpoint openvla/openvla-7b \
  --lora_finetuned_checkpoint_dir /PATH/TO/CHECKPOINT_DIR
```

If performance drops after migrating to a different GPU family:
- Re-merge on target machine.
- Re-run eval with matched runtime flags.

## 6) Logging locations

- Default local logs: `experiments/logs/`
- Training checkpoints: under `run_root_dir`
- W&B (if enabled): user-defined entity/project

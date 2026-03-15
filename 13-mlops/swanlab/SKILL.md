---
name: swanlab
description: Track ML experiments with SwanLab - open-source alternative to W&B with real-time visualization, China-friendly network access, and self-hosted deployment support
version: 1.0.0
author: ckd0817
license: MIT
tags: [MLOps, SwanLab, Experiment Tracking, Open Source, Visualization, PyTorch, HuggingFace, Self-Hosted, China-Friendly]
dependencies: [swanlab]
---

# SwanLab: Open-Source ML Experiment Tracking

## When to Use This Skill

Use SwanLab when you need to:
- **Track ML experiments** with automatic metric logging - free and open-source
- **Visualize training** in real-time dashboards with modern UI
- **Compare runs** across hyperparameters and configurations
- **Log multimodal data** (images, audio, text, video, 3D objects)
- **Self-host** your experiment tracking infrastructure
- **Work in China** without VPN or network restrictions
- **Integrate with PyTorch, HuggingFace Transformers, Fastai**

**Key Advantages over W&B**:
- Completely free and open-source (Apache 2.0 license)
- No network restrictions in China mainland
- Supports both cloud and self-hosted deployment
- Modern, customizable visualization with ECharts
- Lightweight and easy to set up

**GitHub Stars**: 3k+ | **License**: Apache 2.0 | **Language**: Python/TypeScript

## Installation

```bash
# Install SwanLab
pip install swanlab

# Login to SwanLab cloud (optional - for cloud tracking)
swanlab login

# Or set API key via environment variable
export SWANLAB_API_KEY=your_api_key_here
```

## Quick Start

### Basic Experiment Tracking

```python
import swanlab

# Initialize an experiment
run = swanlab.init(
    project="my-project",
    experiment_name="experiment-1",
    config={
        "learning_rate": 0.001,
        "epochs": 10,
        "batch_size": 32,
        "architecture": "ResNet50"
    }
)

# Training loop
for epoch in range(run.config.epochs):
    # Your training code
    train_loss = train_epoch()
    val_loss = validate()

    # Log metrics
    swanlab.log({
        "epoch": epoch,
        "train/loss": train_loss,
        "val/loss": val_loss,
        "train/accuracy": train_acc,
        "val/accuracy": val_acc
    })

# Finish the experiment
run.finish()
```

### With PyTorch

```python
import torch
import swanlab

# Initialize
run = swanlab.init(
    project="pytorch-demo",
    config={
        "lr": 0.001,
        "epochs": 10
    }
)

# Access config
config = run.config

# Training loop
for epoch in range(config.epochs):
    for batch_idx, (data, target) in enumerate(train_loader):
        # Forward pass
        output = model(data)
        loss = criterion(output, target)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Log every 100 batches
        if batch_idx % 100 == 0:
            swanlab.log({
                "loss": loss.item(),
                "epoch": epoch,
                "batch": batch_idx
            })

# Save model
torch.save(model.state_dict(), "model.pth")

run.finish()
```

## Core Concepts

### 1. Projects and Experiments

**Project**: Collection of related experiments
**Experiment**: Single execution of your training script

```python
# Create/use project
run = swanlab.init(
    project="image-classification",
    experiment_name="resnet50-experiment-1",  # Optional experiment name
    description="First baseline run",         # Add description
    tags=["baseline", "resnet"],              # Organize with tags
    config={"model": "ResNet50"}              # Hyperparameters
)

# Each run has unique ID
print(f"Run ID: {run.id}")
print(f"Run URL: {run.url}")
```

### 2. Configuration Tracking

Track hyperparameters automatically:

```python
config = {
    # Model architecture
    "model": "ResNet50",
    "pretrained": True,

    # Training params
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 50,
    "optimizer": "Adam",

    # Data params
    "dataset": "ImageNet",
    "augmentation": "standard"
}

run = swanlab.init(project="my-project", config=config)

# Access config during training
lr = run.config.learning_rate
batch_size = run.config.batch_size
```

### 3. Metric Logging

```python
# Log scalars
swanlab.log({"loss": 0.5, "accuracy": 0.92})

# Log multiple metrics
swanlab.log({
    "train/loss": train_loss,
    "train/accuracy": train_acc,
    "val/loss": val_loss,
    "val/accuracy": val_acc,
    "learning_rate": current_lr,
    "epoch": epoch
})

# Log with custom step
swanlab.log({"loss": loss}, step=global_step)

# Log images
swanlab.log({"examples": [swanlab.Image(img) for img in images]})

# Log audio
swanlab.log({"audio": swanlab.Audio("path/to/audio.wav")})

# Log text
swanlab.log({"notes": swanlab.Text("Training notes here")})
```

### 4. Multimodal Data Support

SwanLab supports various data types:

```python
# Images
swanlab.log({"predictions": swanlab.Image(image_array, caption="Model prediction")})

# Audio
swanlab.log({"speech": swanlab.Audio("recording.wav", sample_rate=16000)})

# Video (path to video file)
swanlab.log({"demo": swanlab.Video("demo.mp4")})

# Text
swanlab.log({"generated": swanlab.Text(generated_text)})

# 3D Objects
swanlab.log({"model": swanlab.Object3D("model.obj")})

# Molecules (for chemistry/biology)
swanlab.log({"molecule": swanlab.Molecule("molecule.sdf")})
```

### 5. Model Checkpointing

```python
import torch
import swanlab

# Save model checkpoint
checkpoint = {
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}

torch.save(checkpoint, 'checkpoint.pth')

# Log the checkpoint file
swanlab.log({"checkpoint": swanlab.File("checkpoint.pth")})
```

## Framework Integrations

### HuggingFace Transformers

SwanLab provides seamless integration with HuggingFace Transformers:

```python
from transformers import Trainer, TrainingArguments
from swanlab.integration.huggingface import SwanLabCallback
import swanlab

# Initialize SwanLab
swanlab.init(
    project="hf-transformers",
    experiment_name="bert-finetuning"
)

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    logging_steps=100,
    save_steps=500,
    # ... other args
)

# Add SwanLab callback
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[SwanLabCallback()]
)

trainer.train()
swanlab.finish()
```

### PyTorch Lightning

```python
import pytorch_lightning as pl
from swanlab.integration.pytorch_lightning import SwanLabLogger
import swanlab

# Create SwanLab logger
swanlab_logger = SwanLabLogger(
    project="lightning-demo",
    experiment_name="my-experiment"
)

# Use with Trainer
trainer = pl.Trainer(
    logger=swanlab_logger,
    max_epochs=10
)

trainer.fit(model)
```

### Fastai

```python
from fastai.vision.all import *
from swanlab.integration.fastai import SwanLabCallback
import swanlab

# Initialize SwanLab
swanlab.init(project="fastai-demo")

# Create learner with SwanLab callback
learn = vision_learner(dls, resnet18, metrics=accuracy)
learn.fit(10, cbs=SwanLabCallback())

swanlab.finish()
```

## Visualization Features

### Custom Charts with ECharts

SwanLab supports ECharts for customizable visualizations:

```python
import swanlab

# Create custom chart with ECharts
echarts_option = {
    "title": {"text": "Training Progress"},
    "xAxis": {"type": "category", "data": ["epoch1", "epoch2", "epoch3"]},
    "yAxis": {"type": "value"},
    "series": [{
        "data": [0.5, 0.3, 0.1],
        "type": "line"
    }]
}

swanlab.log({"custom_chart": swanlab.ECharts(echarts_option)})
```

### Experiment Comparison

Compare multiple experiments in the UI:
- Select experiments to compare
- View overlaid charts
- Compare configurations side-by-side
- Analyze performance differences

## Self-Hosted Deployment

SwanLab supports self-hosted deployment for data privacy:

```bash
# Clone self-hosted repository
git clone https://github.com/SwanHubX/self-hosted.git
cd self-hosted

# Start with Docker Compose
docker-compose up -d
```

### Configure for Self-Hosted

```python
import swanlab

# Point to your self-hosted instance
swanlab.init(
    project="my-project",
    host="http://your-server:5092"  # Your self-hosted URL
)
```

See the [self-hosted repository](https://github.com/SwanHubX/self-hosted) for detailed setup instructions.

## Offline Mode

For environments without internet access:

```python
import swanlab

# Enable offline mode
swanlab.init(
    project="my-project",
    mode="offline"  # Data saved locally
)

# Your training code...
swanlab.log({"loss": loss})

# Sync later when online
# swanlab.watch(path="path/to/offline/run")
```

## Best Practices

### 1. Organize with Tags and Descriptions

```python
swanlab.init(
    project="my-project",
    experiment_name="resnet50-lr0.001-bs32",
    tags=["baseline", "resnet50", "imagenet"],
    description="First baseline run with ResNet50"
)
```

### 2. Log Everything Relevant

```python
# Log system metrics
swanlab.log({
    "system/gpu_memory": gpu_memory_used,
    "system/cpu_util": cpu_utilization
})

# Log data statistics
swanlab.log({
    "data/train_size": len(train_dataset),
    "data/val_size": len(val_dataset)
})

# Log gradient statistics
swanlab.log({"gradients/mean": grad_mean, "gradients/std": grad_std})
```

### 3. Use Descriptive Experiment Names

```python
# Good: Descriptive experiment names
swanlab.init(
    project="nlp-classification",
    experiment_name="bert-base-lr0.001-bs32-epoch10"
)

# Avoid: Generic names
swanlab.init(project="nlp", experiment_name="run1")
```

### 4. Log Model Predictions

```python
# Log sample predictions for analysis
for i, (image, pred, label) in enumerate(zip(images, predictions, labels)):
    swanlab.log({
        f"sample_{i}": swanlab.Image(
            image,
            caption=f"Pred: {pred}, Label: {label}"
        )
    })
```

### 5. Use Offline Mode for Unstable Connections

```python
import os

# Enable offline mode for unstable networks
os.environ["SWANLAB_MODE"] = "offline"

swanlab.init(project="my-project")
# ... your code ...

# Sync later when connection is stable
```

## Comparison with W&B

| Feature | SwanLab | Weights & Biases |
|---------|---------|------------------|
| **License** | Open-source (Apache 2.0) | Proprietary |
| **Pricing** | Free | Free tier + paid plans |
| **China Access** | No VPN needed | May require VPN |
| **Self-hosted** | Supported | Enterprise only |
| **Experiment Tracking** | Yes | Yes |
| **Hyperparameter Sweeps** | Coming soon | Yes |
| **Model Artifacts** | Basic support | Full support |
| **Integrations** | Growing | Extensive |

## Resources

- **Documentation (Chinese)**: https://docs.swanlab.cn
- **Documentation (English)**: https://docs.swanlab.cn/en
- **GitHub**: https://github.com/SwanHubX/SwanLab
- **Self-Hosted**: https://github.com/SwanHubX/self-hosted
- **Examples**: https://github.com/SwanHubX/SwanLab/tree/main/examples
- **Community**: Join the SwanLab community for support and discussions

## See Also

- `references/integrations.md` - Detailed framework integration examples
- `references/visualization.md` - Advanced visualization with ECharts and multimodal data

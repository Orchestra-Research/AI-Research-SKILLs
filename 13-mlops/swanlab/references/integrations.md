# SwanLab Framework Integrations

This document provides detailed integration examples for popular ML frameworks.

## PyTorch Integration

### Basic PyTorch Training Loop

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import swanlab

# Initialize SwanLab
run = swanlab.init(
    project="pytorch-training",
    experiment_name="mnist-mlp",
    config={
        "learning_rate": 0.001,
        "batch_size": 64,
        "epochs": 10,
        "model": "MLP",
        "hidden_size": 128
    }
)

# Model definition
class MLP(nn.Module):
    def __init__(self, hidden_size):
        super().__init__()
        self.net = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, 10)
        )

    def forward(self, x):
        return self.net(x)

# Setup
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = MLP(run.config.hidden_size).to(device)
optimizer = optim.Adam(model.parameters(), lr=run.config.learning_rate)
criterion = nn.CrossEntropyLoss()

# Training loop
for epoch in range(run.config.epochs):
    model.train()
    total_loss = 0

    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)

        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()

        total_loss += loss.item()

        # Log batch metrics
        if batch_idx % 100 == 0:
            swanlab.log({
                "batch/loss": loss.item(),
                "batch/epoch": epoch,
                "batch/idx": batch_idx
            })

    # Validation
    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():
        for data, target in val_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            pred = output.argmax(dim=1)
            correct += (pred == target).sum().item()
            total += target.size(0)

    accuracy = correct / total
    avg_loss = total_loss / len(train_loader)

    # Log epoch metrics
    swanlab.log({
        "epoch/train_loss": avg_loss,
        "epoch/val_accuracy": accuracy,
        "epoch": epoch
    })

    print(f"Epoch {epoch}: Loss={avg_loss:.4f}, Accuracy={accuracy:.4f}")

run.finish()
```

### Custom Callback for PyTorch

```python
import swanlab

class SwanLabPyTorchCallback:
    """Custom callback for PyTorch training with SwanLab logging."""

    def __init__(self, project, experiment_name=None, config=None):
        self.run = swanlab.init(
            project=project,
            experiment_name=experiment_name,
            config=config
        )

    def on_train_begin(self):
        """Called at the start of training."""
        swanlab.log({"training/status": "started"})

    def on_epoch_end(self, epoch, train_loss, val_loss, metrics=None):
        """Called at the end of each epoch."""
        log_dict = {
            "epoch": epoch,
            "train/loss": train_loss,
            "val/loss": val_loss
        }
        if metrics:
            log_dict.update(metrics)
        swanlab.log(log_dict)

    def on_batch_end(self, batch_idx, loss):
        """Called at the end of each batch."""
        swanlab.log({"batch/loss": loss, "batch/idx": batch_idx})

    def on_train_end(self):
        """Called at the end of training."""
        swanlab.log({"training/status": "completed"})
        self.run.finish()

# Usage
callback = SwanLabPyTorchCallback(
    project="my-project",
    experiment_name="pytorch-run",
    config={"lr": 0.001}
)

callback.on_train_begin()
for epoch in range(epochs):
    # Training code...
    callback.on_epoch_end(epoch, train_loss, val_loss, {"accuracy": acc})
callback.on_train_end()
```

## HuggingFace Transformers Integration

### Text Classification with BERT

```python
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments
)
from swanlab.integration.huggingface import SwanLabCallback
import swanlab
import numpy as np

# Initialize SwanLab
swanlab.init(
    project="text-classification",
    experiment_name="bert-imdb",
    config={
        "model": "bert-base-uncased",
        "max_length": 128,
        "batch_size": 16,
        "epochs": 3,
        "learning_rate": 2e-5
    }
)

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "bert-base-uncased",
    num_labels=2
)

# Tokenize datasets
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=swanlab.config.max_length
    )

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# Metrics function
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    accuracy = (predictions == labels).mean()
    return {"accuracy": accuracy}

# Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=swanlab.config.epochs,
    per_device_train_batch_size=swanlab.config.batch_size,
    per_device_eval_batch_size=swanlab.config.batch_size,
    learning_rate=swanlab.config.learning_rate,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    logging_steps=100
)

# Trainer with SwanLab callback
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    compute_metrics=compute_metrics,
    callbacks=[SwanLabCallback()]
)

# Train
trainer.train()

swanlab.finish()
```

### Question Answering with Transformers

```python
from transformers import (
    AutoModelForQuestionAnswering,
    AutoTokenizer,
    DefaultDataCollator,
    Trainer,
    TrainingArguments
)
from swanlab.integration.huggingface import SwanLabCallback
import swanlab

swanlab.init(
    project="question-answering",
    experiment_name="bert-squad",
    config={
        "model": "bert-base-uncased",
        "max_length": 384,
        "stride": 128,
        "batch_size": 12,
        "epochs": 2
    }
)

model = AutoModelForQuestionAnswering.from_pretrained("bert-base-uncased")
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

# Preprocessing for QA...
# (context and question tokenization logic)

training_args = TrainingArguments(
    output_dir="./qa-results",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=swanlab.config.batch_size,
    num_train_epochs=swanlab.config.epochs,
    weight_decay=0.01
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    data_collator=DefaultDataCollator(),
    callbacks=[SwanLabCallback()]
)

trainer.train()
swanlab.finish()
```

## PyTorch Lightning Integration

### Image Classification with Lightning

```python
import pytorch_lightning as pl
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from swanlab.integration.pytorch_lightning import SwanLabLogger
import swanlab

class LitClassifier(pl.LightningModule):
    def __init__(self, learning_rate=0.001):
        super().__init__()
        self.save_hyperparameters()
        self.model = nn.Sequential(
            nn.Flatten(),
            nn.Linear(28 * 28, 128),
            nn.ReLU(),
            nn.Linear(128, 10)
        )
        self.criterion = nn.CrossEntropyLoss()

    def forward(self, x):
        return self.model(x)

    def training_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.criterion(logits, y)
        self.log("train/loss", loss, prog_bar=True)
        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        logits = self(x)
        loss = self.criterion(logits, y)
        preds = torch.argmax(logits, dim=1)
        acc = (preds == y).float().mean()
        self.log("val/loss", loss, prog_bar=True)
        self.log("val/accuracy", acc, prog_bar=True)

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.learning_rate)

# Data
transform = transforms.Compose([transforms.ToTensor()])
train_dataset = datasets.MNIST(root='./data', train=True, download=True, transform=transform)
val_dataset = datasets.MNIST(root='./data', train=False, download=True, transform=transform)

train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
val_loader = DataLoader(val_dataset, batch_size=64)

# Initialize SwanLab
swanlab.init(
    project="lightning-demo",
    experiment_name="mnist-classifier",
    config={
        "learning_rate": 0.001,
        "batch_size": 64,
        "max_epochs": 10
    }
)

# Logger
swanlab_logger = SwanLabLogger()

# Trainer
trainer = pl.Trainer(
    logger=swanlab_logger,
    max_epochs=10,
    accelerator="auto"
)

model = LitClassifier(learning_rate=0.001)
trainer.fit(model, train_loader, val_loader)

swanlab.finish()
```

## Fastai Integration

### Image Classification with Fastai

```python
from fastai.vision.all import *
from swanlab.integration.fastai import SwanLabCallback
import swanlab

# Initialize SwanLab
swanlab.init(
    project="fastai-demo",
    experiment_name="pets-classification",
    config={
        "arch": "resnet34",
        "epochs": 5,
        "batch_size": 64
    }
)

# Data preparation
path = untar_data(URLs.PETS)
dls = ImageDataLoaders.from_name_func(
    path,
    get_image_files(path/"images"),
    valid_pct=0.2,
    label_func=lambda x: x[0].isupper(),
    item_tfms=Resize(224),
    bs=swanlab.config.batch_size
)

# Create learner
learn = vision_learner(dls, resnet34, metrics=accuracy)

# Train with SwanLab callback
learn.fit(
    swanlab.config.epochs,
    cbs=SwanLabCallback(
        log_model=True,
        log_preds=True
    )
)

# Log final metrics
swanlab.log({
    "final/train_loss": learn.recorder.train_metrics[-1],
    "final/valid_loss": learn.recorder.valid_metrics[-1]
})

swanlab.finish()
```

### Text Classification with Fastai

```python
from fastai.text.all import *
from swanlab.integration.fastai import SwanLabCallback
import swanlab

swanlab.init(
    project="fastai-text",
    experiment_name="imdb-sentiment",
    config={
        "arch": "AWD_LSTM",
        "epochs": 3,
        "batch_size": 64
    }
)

# Data
path = untar_data(URLs.IMDB)
dls = TextDataLoaders.from_folder(
    path,
    valid='test',
    bs=swanlab.config.batch_size
)

# Learner
learn = text_classifier_learner(
    dls,
    AWD_LSTM,
    drop_mult=0.5,
    metrics=accuracy
)

# Train
learn.fit_one_cycle(
    swanlab.config.epochs,
    cbs=SwanLabCallback()
)

swanlab.finish()
```

## Custom Integration

### Generic Callback Pattern

```python
import swanlab

class SwanLabTracker:
    """Generic SwanLab tracker for any ML framework."""

    def __init__(self, project, config=None, **kwargs):
        self.run = swanlab.init(
            project=project,
            config=config,
            **kwargs
        )

    def log_metrics(self, metrics, step=None):
        """Log dictionary of metrics."""
        swanlab.log(metrics, step=step)

    def log_images(self, name, images, captions=None):
        """Log images with optional captions."""
        if captions:
            imgs = [swanlab.Image(img, caption=c)
                    for img, c in zip(images, captions)]
        else:
            imgs = [swanlab.Image(img) for img in images]
        swanlab.log({name: imgs})

    def log_histogram(self, name, values):
        """Log histogram of values."""
        swanlab.log({name: swanlab.Histogram(values)})

    def log_model(self, path, name="model"):
        """Log model checkpoint."""
        swanlab.log({name: swanlab.File(path)})

    def finish(self):
        """Finish the run."""
        self.run.finish()

# Usage with any framework
tracker = SwanLabTracker(
    project="custom-training",
    config={"framework": "custom"}
)

# During training
tracker.log_metrics({"loss": 0.5, "accuracy": 0.92}, step=100)
tracker.log_images("samples", batch_images)

tracker.finish()
```

## Tips for Best Results

1. **Initialize early**: Call `swanlab.init()` before any training code
2. **Use config**: Log all hyperparameters via the config parameter
3. **Log regularly**: Log metrics every batch or epoch for smooth curves
4. **Use namespaces**: Prefix metrics like `train/loss`, `val/accuracy` for organization
5. **Log samples**: Log input/output samples for debugging and analysis
6. **Finish properly**: Always call `run.finish()` or `swanlab.finish()` at the end

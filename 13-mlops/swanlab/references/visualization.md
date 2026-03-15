# SwanLab Visualization Guide

This document covers advanced visualization features in SwanLab, including custom charts, multimodal data logging, and experiment comparison.

## Custom Charts with ECharts

SwanLab integrates ECharts for creating custom, interactive visualizations.

### Line Charts

```python
import swanlab

swanlab.init(project="charts-demo")

# Standard line chart
echarts_line = {
    "title": {"text": "Training Loss"},
    "tooltip": {"trigger": "axis"},
    "xAxis": {
        "type": "category",
        "data": ["1", "2", "3", "4", "5"]
    },
    "yAxis": {"type": "value"},
    "series": [{
        "name": "Loss",
        "type": "line",
        "data": [0.9, 0.6, 0.4, 0.3, 0.2]
    }]
}

swanlab.log({"training_loss_chart": swanlab.ECharts(echarts_line)})
```

### Multi-Series Charts

```python
# Compare multiple metrics in one chart
multi_series_chart = {
    "title": {"text": "Training vs Validation"},
    "legend": {"data": ["Train Loss", "Val Loss"]},
    "xAxis": {
        "type": "category",
        "data": [f"Epoch {i}" for i in range(1, 11)]
    },
    "yAxis": {"type": "value", "name": "Loss"},
    "series": [
        {
            "name": "Train Loss",
            "type": "line",
            "data": [0.9, 0.7, 0.5, 0.4, 0.3, 0.25, 0.2, 0.18, 0.15, 0.12]
        },
        {
            "name": "Val Loss",
            "type": "line",
            "data": [0.95, 0.75, 0.55, 0.45, 0.38, 0.35, 0.32, 0.30, 0.28, 0.27]
        }
    ]
}

swanlab.log({"comparison_chart": swanlab.ECharts(multi_series_chart)})
```

### Bar Charts

```python
bar_chart = {
    "title": {"text": "Model Performance by Class"},
    "tooltip": {"trigger": "axis"},
    "xAxis": {
        "type": "category",
        "data": ["Cat", "Dog", "Bird", "Fish"]
    },
    "yAxis": {"type": "value", "name": "Accuracy (%)"},
    "series": [{
        "name": "Accuracy",
        "type": "bar",
        "data": [95, 92, 88, 91]
    }]
}

swanlab.log({"per_class_accuracy": swanlab.ECharts(bar_chart)})
```

### Scatter Plots

```python
import numpy as np

# Generate sample data
x = np.random.randn(100)
y = 2 * x + np.random.randn(100) * 0.5

scatter_chart = {
    "title": {"text": "Feature Correlation"},
    "tooltip": {"trigger": "item"},
    "xAxis": {"type": "value", "name": "Feature 1"},
    "yAxis": {"type": "value", "name": "Feature 2"},
    "series": [{
        "type": "scatter",
        "data": [[float(xi), float(yi)] for xi, yi in zip(x, y)],
        "symbolSize": 10
    }]
}

swanlab.log({"feature_scatter": swanlab.ECharts(scatter_chart)})
```

### Heatmaps

```python
import numpy as np

# Confusion matrix as heatmap
confusion_matrix = np.array([
    [50, 2, 1],
    [3, 45, 2],
    [1, 3, 48]
])

heatmap_chart = {
    "title": {"text": "Confusion Matrix"},
    "tooltip": {"position": "top"},
    "xAxis": {
        "type": "category",
        "data": ["Class A", "Class B", "Class C"]
    },
    "yAxis": {
        "type": "category",
        "data": ["Class A", "Class B", "Class C"]
    },
    "visualMap": {
        "min": 0,
        "max": 50,
        "calculable": True,
        "orient": "horizontal"
    },
    "series": [{
        "type": "heatmap",
        "data": [
            [0, 0, 50], [0, 1, 2], [0, 2, 1],
            [1, 0, 3], [1, 1, 45], [1, 2, 2],
            [2, 0, 1], [2, 1, 3], [2, 2, 48]
        ],
        "label": {"show": True}
    }]
}

swanlab.log({"confusion_heatmap": swanlab.ECharts(heatmap_chart)})
```

## Image Logging

### Single Image

```python
import swanlab
from PIL import Image
import numpy as np

swanlab.init(project="image-demo")

# From file path
swanlab.log({"image": swanlab.Image("path/to/image.png")})

# From numpy array
img_array = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
swanlab.log({"random_image": swanlab.Image(img_array)})

# From PIL Image
pil_img = Image.open("photo.jpg")
swanlab.log({"pil_image": swanlab.Image(pil_img)})
```

### Images with Captions

```python
# Add caption to image
swanlab.log({
    "prediction": swanlab.Image(
        image_array,
        caption="Model prediction: Cat (95% confidence)"
    )
})

# Log multiple images with captions
images = [img1, img2, img3]
captions = ["Sample 1", "Sample 2", "Sample 3"]

swanlab.log({
    "samples": [swanlab.Image(img, caption=c) for img, c in zip(images, captions)]
})
```

### Image Grids

```python
# Log a batch of images as a grid
batch_images = []  # List of image arrays or PIL images

swanlab.log({
    "batch_grid": [swanlab.Image(img) for img in batch_images[:16]]  # First 16 images
})
```

### Image with Bounding Boxes

```python
# Log image with bounding boxes (for object detection)
boxes = [
    {"minX": 10, "minY": 20, "maxX": 100, "maxY": 150, "class": "cat", "confidence": 0.95},
    {"minX": 200, "minY": 50, "maxX": 300, "maxY": 200, "class": "dog", "confidence": 0.87}
]

swanlab.log({
    "detection": swanlab.Image(
        image_array,
        boxes=boxes
    )
})
```

## Audio Logging

### Audio Files

```python
import swanlab

swanlab.init(project="audio-demo")

# Log audio file
swanlab.log({
    "speech": swanlab.Audio("recording.wav", sample_rate=16000)
})

# Log from numpy array
import numpy as np

sample_rate = 16000
duration = 5  # seconds
t = np.linspace(0, duration, int(sample_rate * duration))
audio_data = np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave

swanlab.log({
    "generated_audio": swanlab.Audio(audio_data, sample_rate=sample_rate)
})
```

### Audio with Captions

```python
swanlab.log({
    "tts_output": swanlab.Audio(
        "generated_speech.wav",
        sample_rate=22050,
        caption="Text-to-speech output: 'Hello, world!'"
    )
})
```

## Video Logging

```python
import swanlab

swanlab.init(project="video-demo")

# Log video file
swanlab.log({
    "demo_video": swanlab.Video("demo.mp4")
})

# Log with caption
swanlab.log({
    "training_progress": swanlab.Video(
        "training_visualization.mp4",
        caption="Model training progress over 100 epochs"
    )
})
```

## Text Logging

```python
import swanlab

swanlab.init(project="text-demo")

# Log generated text
generated_text = "The quick brown fox jumps over the lazy dog."

swanlab.log({
    "generated": swanlab.Text(generated_text)
})

# Log with caption
swanlab.log({
    "llm_output": swanlab.Text(
        "This is a response from a language model...",
        caption="Prompt: Tell me a story"
    )
})
```

## 3D Object Logging

```python
import swanlab

swanlab.init(project="3d-demo")

# Log 3D object files
swanlab.log({
    "mesh": swanlab.Object3D("model.obj")
})

# Support for various formats
swanlab.log({
    "point_cloud": swanlab.Object3D("points.ply")
})
```

## Molecule Logging (Chemistry/Biology)

```python
import swanlab

swanlab.init(project="molecule-demo")

# Log molecular structures
swanlab.log({
    "molecule": swanlab.Molecule("molecule.sdf")
})

# Log SMILES string
swanlab.log({
    "caffeine": swanlab.Molecule("CN1C=NC2=C1C(=O)N(C(=O)N2C)C")
})
```

## Experiment Comparison

### In the UI

SwanLab provides powerful experiment comparison features:

1. **Select Experiments**: Choose multiple experiments from the project view
2. **Compare Charts**: View overlaid metric curves
3. **Compare Configs**: Side-by-side configuration comparison
4. **Parallel Coordinates**: Visualize hyperparameter relationships

### Programmatic Comparison

```python
import swanlab

# Initialize and log reference experiment
swanlab.init(project="comparison-demo", experiment_name="baseline")
for i in range(100):
    swanlab.log({"loss": 1.0 / (i + 1), "accuracy": i / 100})
swanlab.finish()

# Run comparison experiment
swanlab.init(project="comparison-demo", experiment_name="improved")
for i in range(100):
    swanlab.log({"loss": 0.8 / (i + 1), "accuracy": (i + 5) / 100})
swanlab.finish()

# Compare in the UI by selecting both experiments
```

## Best Practices for Visualization

### 1. Use Meaningful Names

```python
# Good: Descriptive names
swanlab.log({
    "train/loss": loss,
    "val/accuracy": accuracy,
    "learning_rate": lr
})

# Avoid: Generic names
swanlab.log({
    "metric1": loss,
    "metric2": accuracy
})
```

### 2. Log Consistent Metrics

```python
# Log same metrics across experiments for comparison
for epoch in range(epochs):
    swanlab.log({
        "train/loss": train_loss,
        "train/accuracy": train_acc,
        "val/loss": val_loss,
        "val/accuracy": val_acc,
        "epoch": epoch
    })
```

### 3. Log Samples Regularly

```python
# Log prediction samples periodically
if epoch % 5 == 0:
    predictions = model.predict(sample_images)
    swanlab.log({
        f"samples/epoch_{epoch}": [
            swanlab.Image(img, caption=f"Pred: {p}")
            for img, p in zip(sample_images, predictions)
        ]
    })
```

### 4. Use Step for Custom X-Axis

```python
# Use step parameter for custom x-axis values
global_step = 0
for epoch in range(epochs):
    for batch in dataloader:
        global_step += 1
        swanlab.log({"batch_loss": loss}, step=global_step)
```

### 5. Create Summary Charts at End

```python
# Create final summary chart
final_summary = {
    "title": {"text": "Final Training Summary"},
    "series": [
        {"name": "Best Val Accuracy", "type": "bar", "data": [best_accuracy]},
        {"name": "Final Train Loss", "type": "bar", "data": [final_loss]}
    ]
}

swanlab.log({"summary": swanlab.ECharts(final_summary)})
```

## Troubleshooting

### Images Not Displaying

```python
# Ensure image is in correct format (HWC, RGB, uint8)
import numpy as np

# Convert if needed
image = np.transpose(image, (1, 2, 0))  # CHW -> HWC
image = (image * 255).astype(np.uint8)  # float -> uint8

swanlab.log({"image": swanlab.Image(image)})
```

### Large File Upload Issues

```python
# For large files, consider resizing or compressing
from PIL import Image

img = Image.open("large_image.png")
img = img.resize((512, 512))  # Resize for faster upload

swanlab.log({"thumbnail": swanlab.Image(img)})
```

### Chart Not Rendering

```python
# Ensure ECharts options are valid JSON
import json

echarts_options = {...}
try:
    json.dumps(echarts_options)  # Validate JSON
    swanlab.log({"chart": swanlab.ECharts(echarts_options)})
except TypeError as e:
    print(f"Invalid ECharts options: {e}")
```

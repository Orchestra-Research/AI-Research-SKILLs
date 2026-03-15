# PR #35 Review: Add SwanLab Skill for ML Experiment Tracking

**Reviewer**: Claude (automated) | **Date**: 2026-03-15 | **SwanLab version tested**: 0.7.11

## Summary

This PR adds a SwanLab experiment tracking skill to `13-mlops/`. The contribution adds 3 files (+1,515 lines). I installed SwanLab v0.7.11 and tested every code pattern documented in the skill. Several **incorrect API references** were found that would cause runtime errors for users following the skill.

## Verdict: Request Changes

---

## Critical Issues (Must Fix — Code Will Break)

### 1. `swanlab.ECharts` does not exist

The SKILL.md and `references/visualization.md` document using `swanlab.ECharts(options_dict)` extensively. **This class does not exist.**

```python
>>> hasattr(swanlab, 'ECharts')
False
```

SwanLab uses **pyecharts** (a separate library) via `swanlab.echarts` module or direct `from pyecharts.charts import Line, Bar`. The correct usage is:

```python
from pyecharts.charts import Line
line = Line()
line.add_xaxis(["epoch1", "epoch2", "epoch3"])
line.add_yaxis("Loss", [0.5, 0.3, 0.1])
swanlab.log({"chart": line})  # Pass pyecharts object directly
```

All ECharts examples in both SKILL.md and `references/visualization.md` use a fabricated `swanlab.ECharts()` API that will raise `AttributeError`.

### 2. `swanlab.File` does not exist

The skill documents `swanlab.log({"checkpoint": swanlab.File("checkpoint.pth")})` in the Model Checkpointing section. **This class does not exist.**

```python
>>> hasattr(swanlab, 'File')
False
```

### 3. `swanlab.Histogram` does not exist

Referenced in `references/integrations.md`: `swanlab.log({name: swanlab.Histogram(values)})`. **This class does not exist.**

```python
>>> hasattr(swanlab, 'Histogram')
False
```

### 4. `run.url` does not exist

SKILL.md says `print(f"Run URL: {run.url}")`. This attribute doesn't exist on the Run object.

```python
>>> run = swanlab.init(project="test", mode="offline")
>>> hasattr(run, 'url')
False
```

`run.id` does exist and works correctly.

### 5. `host` parameter in `swanlab.init()` does not exist

The self-hosted section documents:
```python
swanlab.init(project="my-project", host="http://your-server:5092")
```

`host` is not a valid parameter for `swanlab.init()`. The actual init signature is:
```
(project, workspace, experiment_name, description, job_type, group, tags, config, logdir, mode, load, public, callbacks, settings, id, resume, reinit)
```

### 6. `swanlab.watch()` does not exist

Offline mode section comments `swanlab.watch(path="path/to/offline/run")`. This function doesn't exist. The correct function is `swanlab.sync`.

### 7. `Image(boxes=...)` parameter not supported

The visualization reference documents bounding box logging:
```python
swanlab.log({"detection": swanlab.Image(image_array, boxes=boxes)})
```

The actual `Image.__init__` signature is `(data_or_path, mode, caption, file_type, size)` — no `boxes` parameter.

### 8. Missing dependencies for Image and Audio

`swanlab.Image` requires `pillow` and `swanlab.Audio` requires `soundfile`, but neither is listed in the skill's `dependencies` field or mentioned in the installation section.

```
swanlab.Image: FAIL - pillow and numpy are required for Image class
swanlab.Audio: FAIL - soundfile and numpy are required for Audio class
```

---

## YAML Frontmatter Issues (Must Fix)

### 9. `name` field not in gerund form
Current: `swanlab`. Should follow convention like `swanlab-experiment-tracking`.

### 10. `description` not in third person
Current: "Track ML experiments with SwanLab..."
Should be: "Provides guidance for tracking ML experiments with SwanLab..."

### 11. `dependencies` missing version constraints
Current: `[swanlab]`. Should be: `[swanlab>=0.7.0]` (or appropriate minimum version).

### 12. SKILL.md is 503 lines (limit is 500)
Needs trimming. The ECharts section and comparison table could move to reference files.

---

## Integration Findings (Informational)

The integration imports are structured correctly but require their respective frameworks:

| Integration | Module Path | Callback/Logger Class | Status |
|---|---|---|---|
| HuggingFace | `swanlab.integration.huggingface` | `SwanLabCallback` | Exists (needs `transformers`) |
| PyTorch Lightning | `swanlab.integration.pytorch_lightning` | `SwanLabLogger` | Exists (needs `lightning`) |
| Fastai | `swanlab.integration.fastai` | `SwanLabCallback` | Exists (needs `fastai`) |

**Additional integrations available but not documented**: `accelerate`, `catboost`, `keras`, `lightgbm`, `mmengine`, `openai`, `paddlenlp`, `ray`, `sb3`, `torchtune`, `transformers`, `ultralytics`, `xgboost`, `zhipuai`.

The skill only documents 3 integrations while SwanLab actually supports **17 frameworks**. Consider mentioning more (especially `keras`, `accelerate`, `torchtune` which are relevant to this repo's audience).

## Features That Work Correctly

| Feature | Status |
|---|---|
| `swanlab.init()` with project/config/mode | ✅ Works |
| `swanlab.log()` with scalar metrics | ✅ Works |
| `swanlab.log()` with custom `step` | ✅ Works |
| `run.config` access | ✅ Works |
| `run.id` | ✅ Works |
| `swanlab.Text()` | ✅ Works |
| `swanlab.Molecule()` with SMILES | ✅ Works |
| `swanlab.Image()` (needs pillow+numpy) | ✅ Works with deps |
| `swanlab.Audio()` (needs soundfile) | ✅ Works with deps |
| `swanlab.Object3D()` | ✅ Constructor exists |
| `swanlab.Video()` | ✅ Constructor exists |
| Offline mode (`mode="offline"`) | ✅ Works |
| `swanlab.finish()` | ✅ Works |
| pyecharts charts via `swanlab.log()` | ✅ Works |
| `swanlab.confusion_matrix` | ✅ Exists |
| `swanlab.roc_curve` / `swanlab.pr_curve` | ✅ Exist |
| `swanlab.sync` (for offline runs) | ✅ Exists |

## Additional Observations

1. **Undocumented useful features**: `swanlab.confusion_matrix`, `swanlab.roc_curve`, `swanlab.pr_curve`, and sync functions (`sync_wandb`, `sync_mlflow`, `sync_tensorboard_torch`) are available but not mentioned in the skill. These would be very valuable for users migrating from other tools.

2. **Promotional tone**: The "Key Advantages over W&B" section and comparison table read as marketing rather than objective technical guidance. The comparison should be more balanced.

3. **`swanlab.config` global access**: The skill doesn't mention that `swanlab.config` can be used as a module-level accessor (e.g., `swanlab.config.learning_rate`) without holding a reference to the run object — this is a useful pattern.

4. **Missing `references/README.md`, `api.md`, `issues.md`**: Standard reference files expected by the repo template are absent.

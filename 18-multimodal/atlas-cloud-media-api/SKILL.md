---
name: atlas-cloud-media-api
description: Integrates Atlas Cloud media generation APIs for image, video, and OpenAI-compatible LLM workflows. Use when building research agents that need hosted text-to-image, image-to-video, text-to-video, or multimodal generation without managing local GPU inference.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Atlas Cloud, Media Generation, Text-to-Image, Text-to-Video, Image-to-Video, OpenAI Compatible, Multimodal, Hosted Inference]
dependencies: [requests>=2.31.0, openai>=1.0.0]
---

# Atlas Cloud Media API Integration

Guide for adding Atlas Cloud hosted media generation to AI research agents and multimodal pipelines. It covers image generation, video generation, polling, model discovery, and OpenAI-compatible chat usage without requiring local diffusion or video GPUs.

## When to use Atlas Cloud Media API

**Use this skill when:**
- A research workflow needs generated figures, concept art, synthetic scenes, thumbnails, storyboards, or visual assets.
- An agent needs image-to-video or text-to-video generation as part of experiment communication.
- Local GPU inference is too expensive, too slow to provision, or not reproducible across contributors.
- You want one API surface for multiple image, video, and LLM providers.
- You need OpenAI-compatible chat completions and async media generation in the same project.

**Use alternatives instead:**
- Use local Diffusers when you need custom weights, LoRA training, or full offline execution.
- Use AudioCraft when the task is audio-only generation.
- Use CLIP, BLIP-2, or LLaVA when the task is understanding existing media rather than generating new media.
- Use a project-specific provider SDK if the workflow depends on provider-only features not exposed by Atlas Cloud.

## Endpoint map

Atlas Cloud exposes two API surfaces:

| Surface | Base URL | Use |
|---------|----------|-----|
| Media API | `https://api.atlascloud.ai/api/v1` | Image generation, video generation, media upload, polling |
| LLM API | `https://api.atlascloud.ai/v1` | OpenAI-compatible chat completions |

All authenticated requests use:

```text
Authorization: Bearer $ATLASCLOUD_API_KEY
Content-Type: application/json
```

Set the key once:

```bash
export ATLASCLOUD_API_KEY="your-api-key"
```

## Core rule: discover models before calling them

Model IDs and input schemas change. Do not hard-code model IDs into reusable skills unless you have just verified the current model list and schema.

Use this workflow:

```text
Model selection checklist:
- [ ] Fetch the live model list from /models.
- [ ] Filter to visible models for the required type: Image, Video, or Text.
- [ ] Choose a model ID from the response.
- [ ] Read the model schema or example payload when available.
- [ ] Build the request body only from fields supported by that schema.
- [ ] Submit once, then poll the prediction ID until completion.
```

Python model discovery:

```python
import requests

MODELS_URL = "https://api.atlascloud.ai/api/v1/models"

def list_models(model_type: str | None = None) -> list[dict]:
    response = requests.get(MODELS_URL, timeout=30)
    response.raise_for_status()
    payload = response.json()
    models = payload.get("data", payload if isinstance(payload, list) else [])

    visible = [m for m in models if m.get("display_console", True)]
    if model_type:
        visible = [m for m in visible if str(m.get("type", "")).lower() == model_type.lower()]
    return visible

image_models = list_models("Image")
video_models = list_models("Video")

print("First image model:", image_models[0].get("model") or image_models[0].get("id"))
print("First video model:", video_models[0].get("model") or video_models[0].get("id"))
```

## Workflow 1: Text-to-image generation

Use this when a research agent needs a static visual artifact such as a diagram concept, cover image, visual prompt prototype, synthetic dataset sketch, or report illustration.

```text
Text-to-image checklist:
- [ ] Confirm the user wants a generated visual, not analysis of an existing image.
- [ ] Select a live Image model from /models.
- [ ] Read the model schema for supported fields.
- [ ] Submit exactly one generation request.
- [ ] Poll every few seconds until completed or failed.
- [ ] Save output URLs with prompt, model ID, and timestamp for reproducibility.
```

Minimal Python client:

```python
import os
import time
import requests

MEDIA_BASE = "https://api.atlascloud.ai/api/v1"

def atlas_headers() -> dict[str, str]:
    key = os.environ["ATLASCLOUD_API_KEY"]
    return {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

def submit_image_generation(model: str, prompt: str, **params) -> str:
    payload = {"model": model, "prompt": prompt, **params}
    response = requests.post(
        f"{MEDIA_BASE}/model/generateImage",
        headers=atlas_headers(),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()["data"]
    return data["id"]

def poll_prediction(prediction_id: str, timeout_seconds: int = 300) -> dict:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        response = requests.get(
            f"{MEDIA_BASE}/model/prediction/{prediction_id}",
            headers=atlas_headers(),
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()["data"]
        status = str(data.get("status", "")).lower()

        if status in {"completed", "succeeded"}:
            return data
        if status == "failed":
            raise RuntimeError(f"Atlas Cloud generation failed: {data}")

        time.sleep(3)

    raise TimeoutError(f"Timed out waiting for prediction {prediction_id}")

# Fill model with a live Image model ID from /models.
prediction_id = submit_image_generation(
    model="<verified-image-model-id>",
    prompt="A clean research poster illustration of multimodal AI workflows",
)
result = poll_prediction(prediction_id)
print(result.get("outputs"))
```

## Workflow 2: Text-to-video and image-to-video

Use video generation when a paper, demo, or research artifact needs a motion example rather than a still image.

```text
Video generation checklist:
- [ ] Decide text-to-video or image-to-video.
- [ ] For image-to-video, upload or host the source image first.
- [ ] Select a live Video model from /models.
- [ ] Confirm whether the schema expects image, image_url, first_frame, or another input field.
- [ ] Submit one generation request.
- [ ] Poll for completion; video jobs can take minutes.
```

Generic video submission:

```python
def submit_video_generation(model: str, prompt: str, **params) -> str:
    payload = {"model": model, "prompt": prompt, **params}
    response = requests.post(
        f"{MEDIA_BASE}/model/generateVideo",
        headers=atlas_headers(),
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["data"]["id"]

# Fill model and params from the live schema for the selected Video model.
prediction_id = submit_video_generation(
    model="<verified-video-model-id>",
    prompt="A short cinematic clip showing an AI research workflow diagram assembling itself",
)
video_result = poll_prediction(prediction_id, timeout_seconds=900)
print(video_result.get("outputs"))
```

For image-to-video, do not guess the input field name. Use the schema for the selected model:

```python
prediction_id = submit_video_generation(
    model="<verified-image-to-video-model-id>",
    prompt="Animate the figure with subtle camera motion and readable layout",
    image_url="https://example.com/source-frame.png",
)
```

If the schema uses `image` instead of `image_url`, send `image=...` and omit `image_url`.

## Workflow 3: OpenAI-compatible LLM calls

Atlas Cloud LLM endpoints use the OpenAI SDK shape. This is useful when the same agent needs reasoning, prompt expansion, or asset planning before media generation.

```python
import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ["ATLASCLOUD_API_KEY"],
    base_url="https://api.atlascloud.ai/v1",
)

response = client.chat.completions.create(
    model="<verified-llm-model-id>",
    messages=[
        {"role": "system", "content": "You write concise prompts for research visuals."},
        {"role": "user", "content": "Turn this experiment summary into a visual prompt."},
    ],
    max_tokens=512,
)

print(response.choices[0].message.content)
```

## Reproducibility notes

Store enough metadata to reproduce or audit media outputs:

```json
{
  "provider": "atlas-cloud",
  "model": "<verified-model-id>",
  "prediction_id": "<prediction-id>",
  "prompt": "<prompt>",
  "params": {},
  "submitted_at": "<iso-timestamp>",
  "outputs": []
}
```

For research artifacts, keep generated media separate from source data and treat outputs as derived artifacts unless the experiment explicitly depends on them.

## Error handling

| Failure | Likely cause | Fix |
|---------|--------------|-----|
| `401` | Missing or invalid API key | Check `ATLASCLOUD_API_KEY` |
| `402` | Account has insufficient balance | Top up or switch to a cheaper model |
| `429` | Rate limit | Back off and retry later |
| `failed` prediction | Model rejected input or backend error | Record the full response and revise prompt or params |
| Timeout | Video job still running | Increase polling timeout and keep the prediction ID |

Do not automatically retry POST generation requests. A retry can create duplicate billable jobs. Retry polling GET requests with exponential backoff if needed.

## Common integration patterns

**Prompt expansion pipeline**
1. Use the LLM API to turn a research concept into a precise visual prompt.
2. Submit the prompt to a verified image model and store the prompt, model, and output URL.

**Storyboard pipeline**
1. Generate 3-6 still frames for a method explanation.
2. Select one frame manually or with reviewer feedback.
3. Submit the selected frame to a verified image-to-video model.
4. Export output URLs into the demo assets folder.

**Agent tool wrapper**
1. Expose `generate_image`, `generate_video`, and `poll_prediction` as agent tools.
2. Validate user intent and model type before submission.
3. Require confirmation for expensive or long-running video jobs.
4. Return prediction IDs immediately so the agent can continue other work while polling.

## Safety and review checklist

Before committing an Atlas Cloud integration:

```text
Review checklist:
- [ ] No real API key is committed.
- [ ] Model IDs used in examples are placeholders or were verified from /models.
- [ ] Request payload fields match the selected model schema.
- [ ] POST generation calls are not retried automatically.
- [ ] Polling has a timeout and records failed responses.
- [ ] Generated media outputs are logged as derived artifacts.
- [ ] The workflow does not use upload endpoints as permanent file hosting.
```

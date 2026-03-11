# OBLITERATUS API Reference

## AbliterationPipeline

Main class for refusal direction extraction and abliteration.

### Constructor

```python
AbliterationPipeline(
    model_name: str,           # HuggingFace model ID
    device: str = "cuda",      # Device (cuda, cpu)
    dtype: str = "float16",    # Weight precision
    gradient_checkpointing: bool = False,  # Memory optimization
)
```

### extract_directions()

Extract refusal directions from model weights.

```python
pipeline.extract_directions(
    method: str = "diff_means",     # Extraction method
    n_directions: int = 1,          # Number of directions to extract
    n_harmful: int = 512,           # Number of harmful prompts
    n_harmless: int = 512,          # Number of harmless prompts
    use_chat_template: bool = True, # Apply model's chat template
    layers: list = None,            # Specific layers (None = all)
) -> torch.Tensor  # [n_layers, n_directions, hidden_dim]
```

**Methods:**
- `diff_means`: Difference of means between harmful/harmless activations (most robust)
- `pca`: PCA on harmful-harmless activation differences
- `svd`: SVD decomposition (Gabliteration-style)

### abliterate()

Apply abliteration to model weights.

```python
pipeline.abliterate(
    method: str = "advanced",       # basic, informed, advanced, nuclear
    n_directions: int = 4,          # Directions to remove
    direction_method: str = "diff_means",
    regularization: float = 0.3,    # Weight preservation strength
    norm_preserve: bool = True,     # Maintain original weight norms
    refinement_passes: int = 2,     # Iterative refinement passes
    project_biases: bool = True,    # Also project biases
    use_chat_template: bool = True,
) -> dict  # Result metadata
```

### evaluate()

Evaluate model quality after abliteration.

```python
pipeline.evaluate() -> dict
# Returns: {
#   "perplexity": float,
#   "coherence": float,
#   "refusal_rate": float,
#   "kl_divergence": float,
#   "spectral_certification": str,  # GREEN, YELLOW, RED
# }
```

### save_model()

Save abliterated model.

```python
pipeline.save_model(
    output_dir: str,           # Output directory
    save_tokenizer: bool = True,
)
```

## ConceptConeAnalyzer

Analyze concept-specific activation cones.

```python
analyzer = ConceptConeAnalyzer(model, tokenizer)

directions = analyzer.extract_concept_directions(
    concept_prompts: list[str],    # Prompts representing the concept
    baseline_prompts: list[str],   # Neutral baseline prompts
    layers: list[int],             # Layers to analyze
) -> torch.Tensor  # [n_layers, n_directions, hidden_dim]
```

## Quality Metric Targets

| Metric | Good | Acceptable | Bad |
|--------|------|------------|-----|
| Perplexity | < 6 | 6-10 | > 10 |
| Coherence | 1.0 | 0.8-1.0 | < 0.8 |
| Refusal rate | 0.0 | 0.0-0.05 | > 0.1 |
| KL divergence | < 1.0 | 1.0-2.0 | > 2.0 |

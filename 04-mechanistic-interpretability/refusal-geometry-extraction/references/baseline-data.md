# Baseline Geometry Data

## Qwen2.5-3B-Instruct (Verified 2026-03-10)

Source: [bedderautomation/refusal-geometry-qwen25-3b](https://huggingface.co/datasets/bedderautomation/refusal-geometry-qwen25-3b)

### Summary Metrics

| Metric | Value |
|--------|-------|
| Parameters | 3.09B |
| Layers | 36 |
| Hidden dim | 2048 |
| Effective dimensionality | 6.55 |
| Cross-layer alignment | 0.40 |
| Self-repair hub | Layer 33 |
| Min simultaneous ablations | 3 |
| Refusal-harmfulness cosine | ~0.1 |

### Layer Magnitudes (Top 10)

| Rank | Layer | Magnitude | Role |
|------|-------|-----------|------|
| 1 | 35 | 0.482 | Strongest refusal |
| 2 | 34 | 0.451 | Secondary refusal |
| 3 | 33 | 0.438 | Self-repair hub |
| 4 | 32 | 0.412 | Refusal cluster |
| 5 | 31 | 0.389 | Refusal cluster |
| 6 | 30 | 0.361 | Refusal onset |
| 7 | 29 | 0.334 | Transition zone |
| 8 | 28 | 0.298 | Weak signal |
| 9 | 27 | 0.267 | Weak signal |
| 10 | 2 | 0.245 | Harmfulness cone (orthogonal) |

### Key Findings

1. **Multi-dimensional cone**: Effective dimensionality 6.55 confirms refusal is NOT a single direction (contradicts simplified Arditi model)

2. **Distributed refusal**: Cross-layer alignment 0.40 means each layer has a partially independent refusal direction. A single global direction removal misses ~60% of the structure.

3. **Self-repair at Layer 33**: When refusal is removed from surrounding layers, Layer 33 partially compensates. Must be included in abliteration target set.

4. **Two-layer architecture**: Layer 2 (harmfulness cone) at cosine ~0.1 to refusal cone means abliteration can remove refusal without removing the model's understanding of what IS harmful.

5. **Hard limit depth stratification**: After abliteration (reg=0.3, 4 directions):
   - CSAM wall: HELD (deepest embedded)
   - Bioweapons: BREACHED
   - Nuclear: PARTIAL BREACH

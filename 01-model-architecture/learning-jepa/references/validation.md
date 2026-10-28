# Executed teaching experiment

Validated on CPU with Python 3.11, PyTorch 2.8.0+cpu, NumPy 2.2.6, and scikit-learn 1.8.0. CUDA was unavailable to this interpreter. No published pretraining checkpoint was used. Three seeds each ran 400 steps with a fixed stratified train/test split (1,347/450 examples, split seed 42).

| Seed | Random probe | Trained probe | Raw pixels | Initial loss | Final current-teacher loss |
| --- | ---: | ---: | ---: | ---: | ---: |
| 0 | 77.78% | 75.33% | 97.78% | 0.44577 | 0.01014 |
| 1 | 73.11% | 74.00% | 97.78% | 0.65198 | 0.00635 |
| 2 | 70.89% | 68.67% | 97.78% | 0.53254 | 0.00524 |
| Mean | 73.93% | 72.67% | 97.78% | | |

The paired average difference is -1.26 percentage points. There is no demonstrated downstream improvement. Mean feature standard deviation decreased in every seed; this is a warning to investigate, not a sufficient diagnosis of full representation collapse. Final loss against the frozen initial teacher was 0.31771, 0.63277, and 0.60680 respectively, illustrating why current-teacher loss alone is insufficient.

Each frozen feature set and the pixel control use an identical probe procedure: train-only StandardScaler, then logistic regression with C=1 and max_iter=2000. An earlier exploratory probe omitted scaling. Its lower scores were retained locally as preliminary evidence, then the entire configured seed set was rerun with the corrected method. Neither the preliminary run nor the corrected one supports a successful representation-learning claim.

The test set was inspected for this diagnostic. Future hyperparameter selection should use a separate validation set, with a new held-out evaluation for any improved recipe. Three seeds on the same split do not constitute three independent dataset replications.

The behavioral tests check patch layout, disjoint masks, invalid/aliased mask indices, gradient boundaries, numerical EMA arithmetic, and unchanged predictions when only hidden target pixels change. These support implementation correctness within the teaching scope. They do not validate I-JEPA fidelity, large-image performance, video results, or useful pretrained weights.

Run the commands in SKILL.md to regenerate a JSON artifact containing each seed's scores and diagnostics. Exact reproducibility across package versions/hardware is not guaranteed; record those details rather than asserting bitwise equality across environments.

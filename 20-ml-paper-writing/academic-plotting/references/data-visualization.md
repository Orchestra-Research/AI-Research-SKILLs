# Data Visualization Patterns for ML Papers

Complete pattern library for generating polished, distinctive figures.

## Setup and Imports

```python
import matplotlib.pyplot as plt
import matplotlib as mpl
import numpy as np
import seaborn as sns
from matplotlib.ticker import MaxNLocator, FuncFormatter

# --- Publication defaults (polished, not generic) ---
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["Times New Roman", "DejaVu Serif"],
    "font.size": 10,
    "axes.titlesize": 11,
    "axes.titleweight": "bold",
    "axes.labelsize": 10,
    "axes.labelweight": "medium",
    "xtick.labelsize": 8.5,
    "ytick.labelsize": 8.5,
    "legend.fontsize": 8.5,
    "legend.frameon": False,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "savefig.pad_inches": 0.08,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.linewidth": 0.8,
    "xtick.major.width": 0.8,
    "ytick.major.width": 0.8,
    "axes.grid": True,
    "grid.alpha": 0.15,        # Very subtle — guides the eye without competing
    "grid.linewidth": 0.6,
    "grid.linestyle": "-",      # Solid but faint, not dashed (less visual noise)
    "lines.linewidth": 1.8,
    "lines.markersize": 5,
    "patch.edgecolor": "white",  # White borders between bars (cleaner look)
    "patch.linewidth": 0.5,
})
```

## Color Palettes

### "Ocean Dusk" (default — professional, distinctive)

```python
COLORS = {
    "teal":    "#264653",   # deep, authoritative
    "cyan":    "#2A9D8F",   # fresh, modern
    "gold":    "#E9C46A",   # warm accent
    "orange":  "#F4A261",   # energetic
    "coral":   "#E76F51",   # standout (use for "our method")
    "blue":    "#0072B2",   # Okabe-Ito accessible blue
    "sky":     "#56B4E9",   # Okabe-Ito accessible sky
    "gray":    "#8C8C8C",   # neutral baseline
}
COLOR_LIST = list(COLORS.values())

# Semantic colors for highlighting
OUR_COLOR = "#E76F51"       # coral — warm, draws attention
BASELINE_COLOR = "#B0BEC5"  # cool gray — recedes
BEST_BASELINE = "#264653"   # deep teal — strongest competitor
```

### "Okabe-Ito" (maximum colorblind safety)

```python
OKABE_ITO = ["#E69F00", "#56B4E9", "#009E73", "#F0E442",
             "#0072B2", "#D55E00", "#CC79A7", "#000000"]
```

### Sequential Palettes (for heatmaps)

```python
# Warm sequential (more interesting than plain Blues)
cmap_warm = sns.color_palette("YlOrRd", as_cmap=True)

# Cool sequential (clean, professional)
cmap_cool = sns.light_palette("#264653", as_cmap=True)

# Diverging (for correlation/difference, centered at 0)
cmap_div = sns.color_palette("RdBu_r", as_cmap=True)

# Perceptually uniform (for continuous scientific data)
cmap_viridis = plt.cm.viridis
```

### Making Charts Visually Distinctive

Common mistakes that make charts look "boring" and their fixes:

| Boring Default | Better Version |
|---------------|---------------|
| Black lines, no markers | Colored lines + distinct markers per method |
| No shading around lines | Confidence bands with `fill_between(alpha=0.12)` |
| Generic blue bars | "Ocean Dusk" palette + white edge between bars |
| All same color baselines | Gray baselines + coral highlight for "ours" |
| Dashed grid lines | Very faint solid grid (`alpha=0.15`) |
| Default tight spacing | `pad_inches=0.08`, generous axis margins |
| No value labels on bars | Small value text above each bar |
| Box legend with frame | Frameless legend, positioned inside plot area |

## Figure Sizes by Venue

```python
# NeurIPS / ICLR (single column, 5.5in text width)
FIG_NEURIPS_SINGLE = (5.5, 3.5)
FIG_NEURIPS_HALF = (2.65, 2.5)

# ICML (two column, 6.75in text width)
FIG_ICML_SINGLE = (3.25, 2.5)
FIG_ICML_FULL = (6.75, 2.5)

# ACL (two column, 6.8in text width)
FIG_ACL_SINGLE = (3.3, 2.5)
FIG_ACL_FULL = (6.8, 3.0)

# General safe default
FIG_DEFAULT = (5, 3.5)
```

## Chart Type 1: Training Curves (Line Plot)

The most common figure in ML papers. Shows loss/accuracy over training steps.

```python
def plot_training_curves(data, metric="Loss", save_path="figures/fig_training.pdf"):
    """
    data: dict of {method_name: (steps_array, values_array)}
    """
    fig, ax = plt.subplots(figsize=FIG_ICML_SINGLE)

    markers = ["o", "s", "^", "D", "v", "P"]
    for i, (method, (steps, values)) in enumerate(data.items()):
        ax.plot(steps, values,
                label=method,
                color=COLOR_LIST[i],
                linewidth=1.5,
                marker=markers[i % len(markers)],
                markevery=max(1, len(steps) // 8),
                markersize=4)

    ax.set_xlabel("Training Steps")
    ax.set_ylabel(metric)
    ax.legend(frameon=False, loc="best")

    # Log scale for loss (common)
    if "loss" in metric.lower():
        ax.set_yscale("log")

    fig.savefig(save_path)
    fig.savefig(save_path.replace(".pdf", ".png"), dpi=300)
    plt.close(fig)
```

### Shaded Confidence Intervals

```python
ax.plot(steps, mean_values, color=COLOR_LIST[0], linewidth=1.5, label="Our Method")
ax.fill_between(steps, mean_values - std_values, mean_values + std_values,
                color=COLOR_LIST[0], alpha=0.2)
```

## Chart Type 2: Grouped Bar Chart (Ablation / Comparison)

```python
def plot_ablation(categories, methods_data, ylabel="Accuracy (%)",
                  save_path="figures/fig_ablation.pdf"):
    """
    categories: list of benchmark names
    methods_data: dict of {method_name: list_of_scores}
    """
    fig, ax = plt.subplots(figsize=FIG_ICML_FULL)

    n_methods = len(methods_data)
    n_cats = len(categories)
    width = 0.8 / n_methods
    x = np.arange(n_cats)

    for i, (method, scores) in enumerate(methods_data.items()):
        offset = (i - n_methods / 2 + 0.5) * width
        bars = ax.bar(x + offset, scores, width * 0.9,
                      label=method, color=COLOR_LIST[i])
        # Value labels on top
        for bar, score in zip(bars, scores):
            ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.3,
                    f"{score:.1f}", ha="center", va="bottom", fontsize=7)

    ax.set_xticks(x)
    ax.set_xticklabels(categories, rotation=0)
    ax.set_ylabel(ylabel)
    ax.legend(frameon=False, ncol=min(n_methods, 4), loc="upper right")
    ax.set_ylim(bottom=0)

    fig.savefig(save_path)
    plt.close(fig)
```

## Chart Type 3: Heatmap (Attention / Confusion Matrix)

```python
def plot_heatmap(matrix, xlabels, ylabels, title="",
                 save_path="figures/fig_heatmap.pdf", fmt=".2f", cmap="Blues"):
    """
    matrix: 2D numpy array
    """
    fig, ax = plt.subplots(figsize=(max(4, len(xlabels) * 0.6), max(3, len(ylabels) * 0.5)))

    sns.heatmap(matrix, annot=True, fmt=fmt, cmap=cmap, ax=ax,
                xticklabels=xlabels, yticklabels=ylabels,
                cbar_kws={"shrink": 0.8}, linewidths=0.5, linecolor="white",
                annot_kws={"size": 8})

    ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha="right")
    if title:
        ax.set_title(title, pad=12)

    fig.savefig(save_path)
    plt.close(fig)
```

### Diverging Heatmap (correlation)

```python
sns.heatmap(corr_matrix, annot=True, fmt=".2f", cmap="RdBu_r",
            center=0, vmin=-1, vmax=1, ax=ax)
```

## Chart Type 4: Scatter Plot

```python
def plot_scatter(x, y, labels=None, xlabel="", ylabel="",
                 save_path="figures/fig_scatter.pdf"):
    fig, ax = plt.subplots(figsize=FIG_ICML_SINGLE)

    scatter = ax.scatter(x, y, c=COLOR_LIST[0], s=30, alpha=0.7, edgecolors="white", linewidth=0.5)

    if labels is not None:
        for i, label in enumerate(labels):
            ax.annotate(label, (x[i], y[i]), fontsize=7,
                        xytext=(5, 5), textcoords="offset points")

    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)

    fig.savefig(save_path)
    plt.close(fig)
```

### Scatter with regression line

```python
from scipy import stats
slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
line_x = np.linspace(min(x), max(x), 100)
ax.plot(line_x, slope * line_x + intercept, color=COLOR_LIST[1],
        linestyle="--", linewidth=1, label=f"$R^2$={r_value**2:.3f}")
```

## Chart Type 5: Horizontal Bar (Leaderboard)

```python
def plot_leaderboard(models, scores, highlight_idx=-1, xlabel="Score",
                     save_path="figures/fig_leaderboard.pdf"):
    """highlight_idx: index of 'our method' to highlight"""
    fig, ax = plt.subplots(figsize=FIG_ICML_SINGLE)

    y_pos = np.arange(len(models))
    colors = [COLORS["gray"]] * len(models)
    if highlight_idx >= 0:
        colors[highlight_idx] = COLORS["red"]

    bars = ax.barh(y_pos, scores, color=colors, height=0.6)
    ax.set_yticks(y_pos)
    ax.set_yticklabels(models)
    ax.set_xlabel(xlabel)
    ax.invert_yaxis()

    # Value labels
    for bar, score in zip(bars, scores):
        ax.text(bar.get_width() + 0.3, bar.get_y() + bar.get_height() / 2,
                f"{score:.1f}", va="center", fontsize=8)

    fig.savefig(save_path)
    plt.close(fig)
```

## Chart Type 6: Multi-Panel Figure

```python
def plot_multi_panel(data_per_panel, panel_titles, save_path="figures/fig_panels.pdf"):
    """Create a 1xN figure with shared styling."""
    n = len(data_per_panel)
    fig, axes = plt.subplots(1, n, figsize=(3.25 * n, 2.5), sharey=True)
    if n == 1:
        axes = [axes]

    for ax, data, title in zip(axes, data_per_panel, panel_titles):
        # Plot each panel (customize per use case)
        ax.set_title(title, fontsize=10, fontweight="bold")

    # Only label left y-axis
    axes[0].set_ylabel("Metric")

    # Shared x-label
    fig.supxlabel("Training Steps", fontsize=11)
    fig.tight_layout()
    fig.savefig(save_path)
    plt.close(fig)
```

### Subplot label convention (a, b, c)

```python
for i, ax in enumerate(axes):
    ax.text(-0.12, 1.05, f"({chr(97 + i)})", transform=ax.transAxes,
            fontsize=12, fontweight="bold", va="top")
```

## Chart Type 7: Violin / Box Plot (Distribution)

```python
def plot_distributions(data_dict, ylabel="Score",
                       save_path="figures/fig_distributions.pdf"):
    """data_dict: {method_name: array_of_values}"""
    fig, ax = plt.subplots(figsize=FIG_ICML_SINGLE)

    positions = range(len(data_dict))
    parts = ax.violinplot(list(data_dict.values()), positions=positions,
                          showmeans=True, showmedians=True)

    for i, pc in enumerate(parts["bodies"]):
        pc.set_facecolor(COLOR_LIST[i])
        pc.set_alpha(0.7)

    ax.set_xticks(positions)
    ax.set_xticklabels(list(data_dict.keys()))
    ax.set_ylabel(ylabel)

    fig.savefig(save_path)
    plt.close(fig)
```

## Chart Type 8: Stacked Horizontal Bar

Preferred over pie charts in ML papers for showing proportions:

```python
def plot_stacked_bar(categories, segments, segment_labels, colors=None,
                     save_path="figures/fig_stacked.pdf"):
    """
    categories: list of row labels
    segments: list of lists (each inner list = values per segment)
    """
    fig, ax = plt.subplots(figsize=FIG_ICML_FULL)
    y_pos = np.arange(len(categories))
    colors = colors or COLOR_LIST

    left = np.zeros(len(categories))
    for i, (seg_values, label) in enumerate(zip(segments, segment_labels)):
        ax.barh(y_pos, seg_values, left=left, height=0.6,
                label=label, color=colors[i])
        # Percentage labels
        for j, v in enumerate(seg_values):
            if v > 5:  # Only label segments > 5%
                ax.text(left[j] + v / 2, y_pos[j], f"{v:.0f}%",
                        ha="center", va="center", fontsize=7, color="white")
        left += seg_values

    ax.set_yticks(y_pos)
    ax.set_yticklabels(categories)
    ax.set_xlabel("Percentage (%)")
    ax.legend(frameon=False, loc="upper right", ncol=2)
    ax.invert_yaxis()

    fig.savefig(save_path)
    plt.close(fig)
```

## Chart Type 9: Scaling Law Plot (Log-Log)

Common in LLM papers for compute/data/parameter scaling:

```python
def plot_scaling(sizes, metrics, fit_line=True, xlabel="Parameters",
                 ylabel="Loss", save_path="figures/fig_scaling.pdf"):
    fig, ax = plt.subplots(figsize=FIG_ICML_SINGLE)

    ax.scatter(sizes, metrics, color=COLOR_LIST[0], s=40, zorder=5)

    if fit_line:
        log_sizes = np.log(sizes)
        log_metrics = np.log(metrics)
        coeffs = np.polyfit(log_sizes, log_metrics, 1)
        fit_x = np.linspace(min(log_sizes), max(log_sizes), 100)
        ax.plot(np.exp(fit_x), np.exp(np.polyval(coeffs, fit_x)),
                color=COLOR_LIST[1], linestyle="--", linewidth=1.5,
                label=f"$L \\propto N^{{{coeffs[0]:.2f}}}$")

    ax.set_xscale("log")
    ax.set_yscale("log")
    ax.set_xlabel(xlabel)
    ax.set_ylabel(ylabel)
    if fit_line:
        ax.legend(frameon=False)

    fig.savefig(save_path)
    plt.close(fig)
```

## Export Best Practices

### Always Export Both Formats

```python
# PDF for LaTeX (vector, crisp at any zoom)
fig.savefig("figures/fig_name.pdf", bbox_inches="tight", pad_inches=0.05)

# PNG as backup (raster, for README/slides)
fig.savefig("figures/fig_name.png", dpi=300, bbox_inches="tight", pad_inches=0.05)
```

### LaTeX Font Matching

```python
# Option A: Use LaTeX renderer (requires texlive installation)
plt.rcParams["text.usetex"] = True
plt.rcParams["font.family"] = "serif"

# Option B: Match sans-serif style without LaTeX
plt.rcParams["text.usetex"] = False
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["Helvetica", "Arial", "DejaVu Sans"]

# Option C: Computer Modern (default LaTeX font, no LaTeX needed)
plt.rcParams["font.family"] = "serif"
plt.rcParams["font.serif"] = ["cmr10"]
plt.rcParams["axes.formatter.use_mathtext"] = True
```

### Math in Labels

```python
# LaTeX math in labels (works with text.usetex=True)
ax.set_xlabel(r"$\alpha$ (learning rate)")
ax.set_ylabel(r"$\mathcal{L}$ (loss)")

# Without usetex, use mathtext
ax.set_xlabel(r"$\alpha$ (learning rate)")  # Still works for simple math
```

## Seaborn Integration

Seaborn is built on matplotlib and useful for statistical plots:

```python
# Use seaborn styling with matplotlib control
sns.set_theme(style="whitegrid", font_scale=0.9, rc={
    "axes.spines.top": False,
    "axes.spines.right": False,
})

# Pair plot (for exploratory analysis, not usually in papers)
g = sns.pairplot(df, hue="method", palette=COLOR_LIST[:3])

# Joint plot (scatter + marginal distributions)
g = sns.jointplot(data=df, x="param_count", y="accuracy",
                  kind="reg", color=COLOR_LIST[0])
```

## Reproducibility Script Template

Every figure should have a self-contained generation script:

```python
#!/usr/bin/env python3
"""Generate Figure X: [description].

Usage: python figures/gen_fig_name.py
Output: figures/fig_name.pdf, figures/fig_name.png
"""
import matplotlib.pyplot as plt
import numpy as np
import os

# --- Publication styling ---
plt.rcParams.update({...})  # Full rcParams block

# --- Data ---
# Either inline data or load from CSV
data = {...}

# --- Plot ---
fig, ax = plt.subplots(figsize=(3.25, 2.5))
# ... plotting code ...

# --- Save ---
out_dir = os.path.dirname(os.path.abspath(__file__))
fig.savefig(os.path.join(out_dir, "fig_name.pdf"))
fig.savefig(os.path.join(out_dir, "fig_name.png"), dpi=300)
plt.close(fig)
print("Saved: fig_name.pdf, fig_name.png")
```

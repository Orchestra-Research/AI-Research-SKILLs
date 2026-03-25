#!/usr/bin/env python3
"""Generate Figure: Andes Experiment Results (Multi-Panel).

Recreates key experiment results from:
  "Andes: Defining and Enhancing Quality-of-Experience in LLM-Based Text Streaming Services"
  (Liu et al., 2024, arXiv:2404.16283)

Produces three publication-quality figures:
  1. CDF comparison of QoE, TTFT, TDS (Figure 11 style)
  2. Average QoE under varying burst intensity (Figure 15 style)
  3. Summary bar chart of key improvements

Usage: python demo/figures/gen_fig_experiment_results.py
"""
import matplotlib.pyplot as plt
import matplotlib as mpl
import numpy as np
import os

# --- Publication defaults ---
plt.rcParams.update({
    "font.family": "serif",
    "font.serif": ["Times New Roman", "DejaVu Serif"],
    "font.size": 10,
    "axes.titlesize": 11,
    "axes.labelsize": 10,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 8,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "savefig.pad_inches": 0.05,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "axes.grid": True,
    "grid.alpha": 0.3,
    "grid.linestyle": "--",
})

# --- Colorblind-safe palette ---
COLORS = {
    "blue":   "#4C72B0",
    "orange": "#DD8452",
    "green":  "#55A868",
    "red":    "#C44E52",
    "purple": "#8172B3",
    "brown":  "#937860",
    "pink":   "#DA8BC3",
    "gray":   "#8C8C8C",
}
COLOR_LIST = list(COLORS.values())

MARKERS = ["o", "s", "^", "D", "v"]
OUT_DIR = os.path.dirname(os.path.abspath(__file__))


# ============================================================
# Figure 1: CDF of QoE, TTFT, TDS (reproducing Figure 11)
# ============================================================
def generate_cdf_data(n=500, seed=42):
    """Generate synthetic CDF data matching paper's reported distributions."""
    rng = np.random.RandomState(seed)

    # QoE CDFs (Andes: mean ~0.99, vLLM: mean ~0.88)
    andes_qoe = np.clip(rng.beta(30, 1, n), 0, 1)  # Concentrated near 1.0
    vllm_qoe = np.clip(rng.beta(5, 1.2, n), 0, 1)  # More spread, lower

    # TTFT CDFs (Andes: mean ~1.8s, vLLM: mean ~10.5s)
    andes_ttft = rng.exponential(1.8, n)
    vllm_ttft = rng.exponential(10.5, n)

    # TDS CDFs (both deliver fast, but vLLM overshoots)
    andes_tds = rng.normal(10.9, 2, n)
    vllm_tds = rng.normal(11.2, 3, n)

    return {
        "qoe": (andes_qoe, vllm_qoe),
        "ttft": (andes_ttft, vllm_ttft),
        "tds": (andes_tds, vllm_tds),
    }


def plot_cdf_panels():
    """Plot 3-panel CDF comparison (QoE, TTFT, TDS)."""
    data = generate_cdf_data()
    fig, axes = plt.subplots(1, 3, figsize=(9.5, 2.8))

    configs = [
        ("qoe",  "QoE",             (0, 1.05),  None),
        ("ttft", "TTFT (s)",        (0, 55),    None),
        ("tds",  "TDS (#Token/s)",  (0, 42),    None),
    ]

    for ax, (key, xlabel, xlim, _) in zip(axes, configs):
        andes_data, vllm_data = data[key]

        # Compute CDFs
        for vals, label, color, marker, ls in [
            (andes_data, "Andes", COLORS["orange"], "o", "-"),
            (vllm_data,  "vLLM",  COLORS["blue"],   "s", "--"),
        ]:
            sorted_vals = np.sort(vals)
            cdf = np.arange(1, len(sorted_vals) + 1) / len(sorted_vals)
            step = max(1, len(sorted_vals) // 15)
            ax.plot(sorted_vals, cdf, label=label, color=color,
                    linewidth=1.8, linestyle=ls,
                    marker=marker, markevery=step, markersize=4)

        ax.set_xlabel(xlabel)
        ax.set_xlim(xlim)
        ax.set_ylim(0, 1.05)

        if key == "qoe":
            # Draw vertical line at QoE = 0.95
            ax.axvline(x=0.95, color=COLORS["gray"], linestyle=":", linewidth=1, alpha=0.7)
            ax.text(0.87, 0.15, "QoE=0.95", fontsize=7, color=COLORS["gray"], rotation=90)

    axes[0].set_ylabel("CDF")
    axes[0].legend(frameon=False, loc="lower right")

    # Panel labels
    for i, (ax, title) in enumerate(zip(axes, ["(a) QoE", "(b) TTFT", "(c) TDS"])):
        ax.set_title(title, fontsize=10, fontweight="bold", pad=8)

    fig.tight_layout(w_pad=2.5)
    fig.savefig(os.path.join(OUT_DIR, "fig_cdf_comparison.pdf"))
    fig.savefig(os.path.join(OUT_DIR, "fig_cdf_comparison.png"), dpi=300)
    plt.close(fig)
    print("Saved: fig_cdf_comparison.pdf, fig_cdf_comparison.png")


# ============================================================
# Figure 2: Average QoE Under Varying Burst Intensity
# (Reproducing Figure 15 style — 4x3 grid)
# ============================================================
def plot_burst_intensity():
    """Plot avg QoE vs burst intensity across models and datasets."""
    rng = np.random.RandomState(123)
    intensities = np.array([1.0, 1.5, 2.0, 2.5, 3.0])

    models = ["Phi-3-mini 3.8B", "Command R 32B", "Phi-3.5-MoE", "Llama 3.1 70B"]
    datasets = ["ShareGPT", "ArXiv", "Coding"]
    methods = ["Andes", "vLLM", "LQSF", "Sarathi-Serve"]
    method_colors = [COLORS["orange"], COLORS["blue"], COLORS["green"], COLORS["red"]]
    method_markers = ["o", "s", "^", "D"]
    method_linestyles = ["-", "--", "-.", ":"]

    # Generate plausible data matching paper trends
    # Andes stays high, others degrade with intensity
    def gen_qoe(base, degrade_rate, noise_std=0.02):
        vals = base - degrade_rate * (intensities - 1.0) ** 1.3
        vals += rng.normal(0, noise_std, len(intensities))
        return np.clip(vals, 0, 1)

    fig, axes = plt.subplots(4, 3, figsize=(9, 8.5), sharex=True)

    for row, model in enumerate(models):
        for col, dataset in enumerate(datasets):
            ax = axes[row, col]

            # Generate data: Andes robust, baselines degrade
            data_methods = {
                "Andes":        gen_qoe(0.98, 0.04 + rng.uniform(-0.01, 0.02)),
                "vLLM":         gen_qoe(0.90, 0.22 + rng.uniform(-0.03, 0.05)),
                "LQSF":         gen_qoe(0.88, 0.18 + rng.uniform(-0.02, 0.04)),
                "Sarathi-Serve": gen_qoe(0.85, 0.25 + rng.uniform(-0.03, 0.05)),
            }

            for i, (method, vals) in enumerate(data_methods.items()):
                ax.plot(intensities, vals, label=method,
                        color=method_colors[i], marker=method_markers[i],
                        linestyle=method_linestyles[i],
                        linewidth=1.5, markersize=4)

            ax.set_ylim(0, 1.05)
            ax.set_xlim(0.8, 3.2)
            ax.tick_params(labelsize=7)

            if row == 0:
                ax.set_title(dataset, fontsize=10, fontweight="bold", pad=6)
            if col == 0:
                ax.set_ylabel("Avg QoE", fontsize=8)
                # Model name on left
                ax.text(-0.45, 0.5, model, transform=ax.transAxes,
                        fontsize=8, fontweight="bold", va="center", ha="center",
                        rotation=90, color=COLORS["purple"])
            if row == len(models) - 1:
                ax.set_xlabel("Intensity (r)", fontsize=8)

    # Shared legend at top
    handles, labels = axes[0, 0].get_legend_handles_labels()
    fig.legend(handles, labels, loc="upper center", ncol=4,
               frameon=False, fontsize=9, bbox_to_anchor=(0.5, 1.02))

    fig.tight_layout(rect=[0.05, 0, 1, 0.96], h_pad=1.0, w_pad=1.5)
    fig.savefig(os.path.join(OUT_DIR, "fig_burst_intensity.pdf"))
    fig.savefig(os.path.join(OUT_DIR, "fig_burst_intensity.png"), dpi=300)
    plt.close(fig)
    print("Saved: fig_burst_intensity.pdf, fig_burst_intensity.png")


# ============================================================
# Figure 3: Summary Bar Chart — Key Improvements
# ============================================================
def plot_summary_improvements():
    """Bar chart summarizing Andes' key improvements over baselines."""
    fig, axes = plt.subplots(1, 3, figsize=(9.5, 3.0))

    # --- Panel (a): Average QoE comparison ---
    ax = axes[0]
    methods = ["vLLM\n(FCFS)", "Sarathi-\nServe", "LQSF", "Andes"]
    qoe_values = [0.88, 0.82, 0.91, 0.99]
    bars_colors = [COLORS["blue"], COLORS["red"], COLORS["green"], COLORS["orange"]]

    bars = ax.bar(methods, qoe_values, color=bars_colors, width=0.6, edgecolor="white",
                  linewidth=0.5)
    for bar, val in zip(bars, qoe_values):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                f"{val:.2f}", ha="center", va="bottom", fontsize=8, fontweight="bold")
    ax.set_ylabel("Average QoE")
    ax.set_ylim(0, 1.15)
    ax.set_title("(a) QoE on BurstGPT Trace", fontsize=10, fontweight="bold", pad=8)

    # Highlight Andes bar
    bars[-1].set_edgecolor(COLORS["orange"])
    bars[-1].set_linewidth(2)

    # --- Panel (b): QoE improvement multiplier across models ---
    ax = axes[1]
    models = ["Phi-3-mini\n3.8B", "Command R\n32B", "Phi-3.5-MoE\n16x3.8B", "Llama 3.1\n70B"]
    improvement = [3.2, 4.1, 4.7, 3.5]

    bars = ax.bar(models, improvement,
                  color=[COLORS["orange"]] * 4, width=0.55,
                  edgecolor="white", linewidth=0.5, alpha=0.85)
    for bar, val in zip(bars, improvement):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.08,
                f"{val:.1f}x", ha="center", va="bottom", fontsize=8, fontweight="bold",
                color=COLORS["orange"])

    ax.set_ylabel("QoE Improvement (x)")
    ax.set_ylim(0, 5.5)
    ax.axhline(y=1.0, color=COLORS["gray"], linestyle=":", linewidth=0.8, alpha=0.5)
    ax.text(3.3, 1.1, "1x (baseline)", fontsize=6.5, color=COLORS["gray"])
    ax.set_title("(b) QoE Improvement vs vLLM", fontsize=10, fontweight="bold", pad=8)

    # --- Panel (c): Resource savings ---
    ax = axes[2]
    categories = ["GPU\nSavings", "Queue\nReduction", "Concurrent\nRequests"]
    values = [61, 85, 160]
    bar_colors = [COLORS["green"], COLORS["purple"], COLORS["blue"]]

    bars = ax.bar(categories, values, color=bar_colors, width=0.55,
                  edgecolor="white", linewidth=0.5)
    labels = ["61%", "85%", "2.6x"]
    for bar, val, label in zip(bars, values, labels):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 2,
                label, ha="center", va="bottom", fontsize=9, fontweight="bold",
                color=bar.get_facecolor())
    ax.set_ylabel("Improvement (%)")
    ax.set_ylim(0, 195)
    ax.set_title("(c) Resource Efficiency", fontsize=10, fontweight="bold", pad=8)

    fig.tight_layout(w_pad=2.5)
    fig.savefig(os.path.join(OUT_DIR, "fig_summary_improvements.pdf"))
    fig.savefig(os.path.join(OUT_DIR, "fig_summary_improvements.png"), dpi=300)
    plt.close(fig)
    print("Saved: fig_summary_improvements.pdf, fig_summary_improvements.png")


# ============================================================
# Figure 4: QoE Definition Illustration (Figure 5 style)
# ============================================================
def plot_qoe_definition():
    """Illustrate QoE definition with 4 user experience cases."""
    fig, axes = plt.subplots(1, 4, figsize=(10, 2.5))

    cases = [
        ("(a) Perfect experience", "perfect"),
        ("(b) Delay in first token", "ttft_delay"),
        ("(c) Slow streaming", "slow_tds"),
        ("(d) Pause in middle", "pause"),
    ]

    for ax, (title, case_type) in zip(axes, cases):
        t = np.linspace(0, 5, 100)

        # Ideal consumption timeline (dashed)
        ttft_ideal = 0.5
        ideal = np.where(t < ttft_ideal, 0, (t - ttft_ideal) * 4)
        ax.plot(t, ideal, "--", color=COLORS["gray"], linewidth=1.2, label="Ideal")

        # Actual delivery/consumption
        if case_type == "perfect":
            actual = np.where(t < 0.4, 0, (t - 0.4) * 4.5)
            actual = np.minimum(actual, ideal + 2)
            consumption = ideal.copy()
        elif case_type == "ttft_delay":
            delay = 1.5
            actual = np.where(t < delay, 0, (t - delay) * 5)
            consumption = np.where(t < delay, 0, (t - delay) * 4)
        elif case_type == "slow_tds":
            actual = np.where(t < 0.5, 0, (t - 0.5) * 2.5)
            consumption = actual.copy()
        elif case_type == "pause":
            actual = np.where(t < 0.5, 0,
                    np.where(t < 2.0, (t - 0.5) * 5,
                    np.where(t < 3.5, 7.5,  # pause
                    7.5 + (t - 3.5) * 5)))
            consumption = np.minimum(actual, ideal + 0.5)

        ax.plot(t, actual, "-", color=COLORS["orange"], linewidth=1.8, label="Actual")

        # Shade delay area
        if case_type != "perfect":
            fill_y1 = np.minimum(consumption, ideal)
            ax.fill_between(t, fill_y1, consumption, alpha=0.15,
                          color=COLORS["red"], label="Delay")

        ax.set_title(title, fontsize=8, fontweight="bold", pad=5)
        ax.set_xlabel("Time", fontsize=7)
        ax.set_xlim(0, 5)
        ax.set_ylim(0, 20)
        ax.tick_params(labelsize=6)

        if ax == axes[0]:
            ax.set_ylabel("Tokens", fontsize=8)
            ax.legend(fontsize=5.5, frameon=False, loc="upper left")

    fig.tight_layout(w_pad=1.5)
    fig.savefig(os.path.join(OUT_DIR, "fig_qoe_definition.pdf"))
    fig.savefig(os.path.join(OUT_DIR, "fig_qoe_definition.png"), dpi=300)
    plt.close(fig)
    print("Saved: fig_qoe_definition.pdf, fig_qoe_definition.png")


# ============================================================
# Main
# ============================================================
if __name__ == "__main__":
    print("Generating Andes experiment result figures...\n")
    plot_cdf_panels()
    plot_burst_intensity()
    plot_summary_improvements()
    plot_qoe_definition()
    print("\nAll figures generated successfully!")

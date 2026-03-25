#!/usr/bin/env python3
"""Generate Figure: Andes System Architecture & Request Lifecycle Workflow.

Recreates the core contribution diagram from:
  "Andes: Defining and Enhancing Quality-of-Experience in LLM-Based Text Streaming Services"
  (Liu et al., 2024, arXiv:2404.16283)

Usage: python demo/figures/gen_fig_andes_workflow.py
Output: demo/figures/fig_andes_workflow.pdf, demo/figures/fig_andes_workflow.png
"""
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np
import os

# --- Publication defaults ---
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],
    "font.size": 9,
    "axes.titlesize": 11,
    "axes.labelsize": 10,
    "figure.dpi": 300,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
    "savefig.pad_inches": 0.1,
})

# --- Color palette ---
C = {
    "orange":     "#F4A261",
    "orange_bg":  "#FFF3E6",
    "blue":       "#4C72B0",
    "blue_bg":    "#EBF0F7",
    "green":      "#55A868",
    "green_bg":   "#EDF7EF",
    "red":        "#C44E52",
    "purple":     "#8172B3",
    "purple_bg":  "#F0EDF7",
    "gray":       "#8C8C8C",
    "light_gray": "#F5F5F5",
    "dark":       "#2D3436",
    "white":      "#FFFFFF",
}

def draw_rounded_box(ax, xy, width, height, label, facecolor, edgecolor,
                     fontsize=8, fontweight="normal", text_color="#2D3436",
                     linewidth=1.5, alpha=1.0, zorder=2):
    """Draw a rounded rectangle with centered text."""
    x, y = xy
    box = FancyBboxPatch(
        (x, y), width, height,
        boxstyle="round,pad=0.05",
        facecolor=facecolor, edgecolor=edgecolor,
        linewidth=linewidth, alpha=alpha, zorder=zorder,
    )
    ax.add_patch(box)
    ax.text(x + width / 2, y + height / 2, label,
            ha="center", va="center", fontsize=fontsize,
            fontweight=fontweight, color=text_color, zorder=zorder + 1)
    return box

def draw_arrow(ax, start, end, color="#2D3436", style="-|>", linewidth=1.2,
               connectionstyle="arc3,rad=0", zorder=3):
    """Draw an arrow between two points."""
    arrow = FancyArrowPatch(
        start, end,
        arrowstyle=style,
        connectionstyle=connectionstyle,
        color=color, linewidth=linewidth, zorder=zorder,
        mutation_scale=12,
    )
    ax.add_patch(arrow)
    return arrow

def draw_circled_number(ax, xy, number, color="#F4A261", fontsize=8):
    """Draw a circled step number."""
    circle = plt.Circle(xy, 0.18, facecolor=color, edgecolor="white",
                       linewidth=1.5, zorder=5)
    ax.add_patch(circle)
    ax.text(xy[0], xy[1], str(number), ha="center", va="center",
            fontsize=fontsize, fontweight="bold", color="white", zorder=6)


fig, ax = plt.subplots(figsize=(10, 6.5))
ax.set_xlim(-0.5, 10.5)
ax.set_ylim(-0.5, 7.5)
ax.set_aspect("equal")
ax.axis("off")

# ============================================================
# Title
# ============================================================
ax.text(5.0, 7.2, "Andes: QoE-Aware LLM Serving System Architecture",
        ha="center", va="center", fontsize=13, fontweight="bold", color=C["dark"])
ax.text(5.0, 6.85, "Co-designing the inference server and text streaming client",
        ha="center", va="center", fontsize=9, color=C["gray"], style="italic")

# ============================================================
# Dashed separator: Client vs Server
# ============================================================
ax.plot([0, 10], [4.15, 4.15], linestyle="--", color=C["gray"], linewidth=1.0, alpha=0.6)
ax.text(0.15, 4.3, "CLIENT", fontsize=8, fontweight="bold", color=C["gray"], alpha=0.7)
ax.text(0.15, 3.95, "SERVER", fontsize=8, fontweight="bold", color=C["gray"], alpha=0.7)

# ============================================================
# CLIENT SIDE
# ============================================================

# User icon area
draw_rounded_box(ax, (0.3, 5.2), 1.6, 1.1, "",
                 facecolor=C["light_gray"], edgecolor=C["gray"],
                 linewidth=1.0, alpha=0.5)
ax.text(1.1, 5.95, "User", ha="center", va="center",
        fontsize=9, fontweight="bold", color=C["dark"])
ax.text(1.1, 5.55, "Reading/\nListening", ha="center", va="center",
        fontsize=7, color=C["gray"])

# Application Client
draw_rounded_box(ax, (2.8, 5.2), 2.2, 1.1, "",
                 facecolor=C["blue_bg"], edgecolor=C["blue"])
ax.text(3.9, 6.0, "Application Client", ha="center", va="center",
        fontsize=9, fontweight="bold", color=C["blue"])

# Token Pacer (inside Application Client, highlighted in orange)
draw_rounded_box(ax, (3.0, 5.35), 1.8, 0.55, "Token Pacer",
                 facecolor=C["orange_bg"], edgecolor=C["orange"],
                 fontsize=8, fontweight="bold", text_color=C["orange"])

# Buffer visualization
for i in range(5):
    bx = 5.6 + i * 0.35
    fc = C["orange"] if i < 3 else C["light_gray"]
    ec = C["orange"] if i < 3 else C["gray"]
    rect = FancyBboxPatch((bx, 5.55), 0.28, 0.35,
                           boxstyle="round,pad=0.02",
                           facecolor=fc, edgecolor=ec,
                           linewidth=0.8, alpha=0.7, zorder=2)
    ax.add_patch(rect)
ax.text(6.47, 6.05, "Token Buffer", ha="center", va="center",
        fontsize=7, fontweight="bold", color=C["orange"])

# Ideal Consumption Timeline box
draw_rounded_box(ax, (8.0, 5.2), 1.8, 1.1, "",
                 facecolor=C["green_bg"], edgecolor=C["green"])
ax.text(8.9, 6.0, "Smooth Delivery", ha="center", va="center",
        fontsize=8, fontweight="bold", color=C["green"])
ax.text(8.9, 5.55, "Ideal Consumption\nTimeline", ha="center", va="center",
        fontsize=7, color=C["green"])

# ============================================================
# SERVER SIDE
# ============================================================

# Request Tracker
draw_rounded_box(ax, (0.3, 2.4), 2.0, 1.3, "",
                 facecolor=C["orange_bg"], edgecolor=C["orange"])
ax.text(1.3, 3.4, "Request Tracker", ha="center", va="center",
        fontsize=9, fontweight="bold", color="#D35400")
ax.text(1.3, 2.92, "QoE params\nTTFT targets\nToken timestamps", ha="center", va="center",
        fontsize=6.5, color=C["gray"])

# Token-Level Request Scheduler
draw_rounded_box(ax, (3.0, 2.4), 2.6, 1.3, "",
                 facecolor=C["orange_bg"], edgecolor=C["orange"])
ax.text(4.3, 3.4, "Token-Level Scheduler", ha="center", va="center",
        fontsize=9, fontweight="bold", color="#D35400")

# Sub-boxes inside scheduler
draw_rounded_box(ax, (3.15, 2.55), 1.15, 0.65, "Priority\nScheduler",
                 facecolor=C["white"], edgecolor=C["orange"],
                 fontsize=7, linewidth=1.0)
draw_rounded_box(ax, (4.4, 2.55), 1.05, 0.65, "Overhead\nRefiner",
                 facecolor=C["white"], edgecolor=C["orange"],
                 fontsize=7, linewidth=1.0)

# Executor + KV Cache
draw_rounded_box(ax, (6.3, 2.4), 1.8, 1.3, "",
                 facecolor=C["purple_bg"], edgecolor=C["purple"])
ax.text(7.2, 3.4, "Executor", ha="center", va="center",
        fontsize=9, fontweight="bold", color=C["purple"])
draw_rounded_box(ax, (6.45, 2.55), 1.5, 0.6, "KV Cache",
                 facecolor=C["white"], edgecolor=C["purple"],
                 fontsize=8, linewidth=1.0, text_color=C["purple"])

# GPU Resources
draw_rounded_box(ax, (8.6, 2.4), 1.3, 1.3, "",
                 facecolor=C["light_gray"], edgecolor=C["gray"])
ax.text(9.25, 3.4, "GPU", ha="center", va="center",
        fontsize=9, fontweight="bold", color=C["dark"])
ax.text(9.25, 2.92, "Memory\n+ Compute\nConstraints", ha="center", va="center",
        fontsize=6.5, color=C["gray"])

# ============================================================
# ARROWS: Request Lifecycle
# ============================================================

# Step 1: User -> Application Client (Submit request)
draw_arrow(ax, (1.9, 5.75), (2.8, 5.75), color=C["blue"], linewidth=1.5)
draw_circled_number(ax, (2.35, 5.95), 1)
ax.text(2.35, 6.25, "Submit\nrequest", ha="center", va="center",
        fontsize=6.5, color=C["blue"])

# Step 2: Client -> Server (Enqueue with QoE params)
draw_arrow(ax, (3.9, 5.2), (3.9, 3.7), color=C["blue"], linewidth=1.5)
draw_circled_number(ax, (3.6, 4.6), 2)
ax.text(3.15, 4.6, "Enqueue +\nQoE params", ha="center", va="center",
        fontsize=6.5, color=C["blue"])

# Step 3: Request Tracker -> Scheduler (Track state)
draw_arrow(ax, (2.3, 3.1), (3.0, 3.1), color=C["orange"], linewidth=1.5)
draw_circled_number(ax, (2.65, 3.35), 3)

# Step 4: Scheduler -> Executor (Admit/Resume or Preempt)
draw_arrow(ax, (5.6, 3.2), (6.3, 3.2), color=C["orange"], linewidth=1.5)
ax.text(5.95, 3.55, "Admit/\nResume", ha="center", va="center",
        fontsize=6.5, color="#D35400")
draw_arrow(ax, (6.3, 2.7), (5.6, 2.7), color=C["red"], linewidth=1.2,
           style="-|>")
ax.text(5.95, 2.45, "Preempt", ha="center", va="center",
        fontsize=6.5, color=C["red"])
draw_circled_number(ax, (5.95, 3.05), 4)

# Step 5: Executor generates tokens -> push to client
draw_arrow(ax, (7.2, 3.7), (7.2, 5.2), color=C["green"], linewidth=1.5,
           connectionstyle="arc3,rad=-0.3")
ax.text(7.65, 4.6, "Stream\ntokens", ha="center", va="center",
        fontsize=6.5, color=C["green"])
draw_circled_number(ax, (7.2, 4.55), 5)

# Step 6: Token buffer -> smooth delivery
draw_arrow(ax, (7.35, 5.72), (8.0, 5.72), color=C["green"], linewidth=1.5)
draw_circled_number(ax, (7.67, 5.95), 6)

# Step 7: Smooth delivery -> User
draw_arrow(ax, (8.0, 5.45), (1.9, 5.45), color=C["green"], linewidth=1.2,
           connectionstyle="arc3,rad=0.15")
ax.text(5.0, 4.7, "Pace at user's reading speed", ha="center", va="center",
        fontsize=7, color=C["green"], style="italic")

# Executor <-> GPU
draw_arrow(ax, (8.1, 3.05), (8.6, 3.05), color=C["gray"], linewidth=1.0)

# ============================================================
# Bottom: QoE Formula
# ============================================================
formula_y = 0.8
ax.plot([0.3, 9.9], [1.5, 1.5], linestyle="-", color=C["gray"],
        linewidth=0.5, alpha=0.4)

ax.text(5.0, 1.2, "QoE Metric:  QoE = 1 \u2212 S_delay / S_whole",
        ha="center", va="center", fontsize=10, fontweight="bold",
        color=C["dark"],
        bbox=dict(boxstyle="round,pad=0.3", facecolor=C["orange_bg"],
                  edgecolor=C["orange"], linewidth=1.2))

ax.text(5.0, 0.55, "Priority = (QoE_gain) / (context_length)    |    "
        "Objective: maximize average QoE across all requests",
        ha="center", va="center", fontsize=7.5, color=C["gray"])

# ============================================================
# Legend: Andes components highlighted
# ============================================================
legend_y = 0.05
ax.plot([3.0, 3.4], [legend_y, legend_y], color=C["orange"], linewidth=3)
ax.text(3.5, legend_y, "Andes components", va="center", fontsize=7, color=C["orange"])
ax.plot([5.5, 5.9], [legend_y, legend_y], color=C["purple"], linewidth=3)
ax.text(6.0, legend_y, "Execution engine", va="center", fontsize=7, color=C["purple"])
ax.plot([7.8, 8.2], [legend_y, legend_y], color=C["green"], linewidth=3)
ax.text(8.3, legend_y, "Token delivery flow", va="center", fontsize=7, color=C["green"])

# ============================================================
# Save
# ============================================================
out_dir = os.path.dirname(os.path.abspath(__file__))
fig.savefig(os.path.join(out_dir, "fig_andes_workflow.pdf"))
fig.savefig(os.path.join(out_dir, "fig_andes_workflow.png"), dpi=300)
plt.close(fig)
print("Saved: fig_andes_workflow.pdf, fig_andes_workflow.png")

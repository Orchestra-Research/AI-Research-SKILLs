# Slide Templates: Beamer and PPTX

Complete templates for generating conference presentations in both Beamer LaTeX (PDF output) and python-pptx (editable PPTX output).

---

## Beamer Template: Oral Talk (16:9)

```latex
\documentclass[aspectratio=169,12pt]{beamer}

% --- Theme ---
\usetheme{metropolis}
\usepackage{appendixnumberbeamer}
\usepackage{booktabs}
\usepackage{graphicx}
\usepackage{xcolor}
\usepackage{tikz}

% --- Color customization (adjust per venue) ---
\definecolor{primary}{HTML}{003366}
\definecolor{accent}{HTML}{CC0000}
\setbeamercolor{frametitle}{bg=primary, fg=white}
\setbeamercolor{progress bar}{fg=accent}

% --- Metadata ---
\title{Your Paper Title Here}
\subtitle{Conference Year}
\author{Author One \and Author Two \and Author Three}
\institute{University / Lab}
\date{}

% --- Speaker notes setup ---
% Uncomment for dual-screen notes: \setbeameroption{show notes on second screen=right}
\setbeameroption{hide notes}  % Comment out to show notes

\graphicspath{{figures/}}

\begin{document}

% ============================================================
% TITLE
% ============================================================
\maketitle

% ============================================================
% OUTLINE (optional)
% ============================================================
\begin{frame}{Outline}
  \tableofcontents
  \note{
    [1 min] Overview of the talk structure.
    We'll start with the problem, then our approach, evaluation, and wrap up.
  }
\end{frame}

% ============================================================
% SECTION 1: PROBLEM
% ============================================================
\section{Problem}

\begin{frame}{Problem Context}
  \begin{itemize}
    \item Domain importance — concrete numbers
    \item Scale of the challenge
    \item Why existing approaches fall short
  \end{itemize}
  \note{
    [2 min] Start with the big picture. Use a concrete example the audience
    can relate to. State the problem in one sentence.
    Transition: "So what are current systems doing about this?"
  }
\end{frame}

\begin{frame}{Motivation: Gaps in Existing Systems}
  \begin{columns}[T]
    \begin{column}{0.5\textwidth}
      \textbf{Gap 1}: Existing schedulers assume ...\\[0.5em]
      \textbf{Gap 2}: No system handles ...\\[0.5em]
      \textbf{Gap 3}: Current approaches lack ...
    \end{column}
    \begin{column}{0.5\textwidth}
      \includegraphics[width=\textwidth]{motivation-figure.pdf}
    \end{column}
  \end{columns}
  \note{
    [2 min] Walk through each gap with evidence.
    Point to the figure showing the limitation.
    Transition: "This brings us to our key insight..."
  }
\end{frame}

% ============================================================
% SECTION 2: APPROACH
% ============================================================
\section{Our Approach}

\begin{frame}{Key Insight}
  \begin{center}
    \Large\textbf{[System Name] is better for [Y] in [Z]}
  \end{center}
  \vspace{1em}
  \begin{itemize}
    \item One-line explanation of the insight
    \item Why this insight enables a better design
  \end{itemize}
  \note{
    [1 min] State the thesis clearly. This is the most important slide.
    Make sure the audience remembers this one sentence.
    Transition: "Let me show you how we designed this..."
  }
\end{frame}

\begin{frame}{System Architecture}
  \begin{center}
    \includegraphics[width=0.85\textwidth]{architecture.pdf}
  \end{center}
  \note{
    [2 min] Walk through the architecture diagram.
    Highlight the novel components. Explain the data flow
    for a concrete example request.
    Transition: "Let me dive into the key components..."
  }
\end{frame}

% Progressive reveal example for design walkthrough
\begin{frame}{Design: Component A}
  \begin{itemize}
    \item<1-> What Component A does
    \item<2-> Design choice: we use [X] because [reason]
    \item<3-> Alternative considered: [Y] — rejected because [trade-off]
  \end{itemize}
  \only<3>{
    \begin{block}{Key Trade-off}
      [X] sacrifices [property A] for [property B], which is acceptable
      because [justification].
    \end{block}
  }
  \note{
    [2 min] Explain the most important design component.
    Use progressive reveal to build understanding.
    Transition: "Now Component B..."
  }
\end{frame}

% ============================================================
% SECTION 3: EVALUATION
% ============================================================
\section{Evaluation}

\begin{frame}{Evaluation Setup}
  \begin{columns}[T]
    \begin{column}{0.5\textwidth}
      \textbf{Testbed}:
      \begin{itemize}
        \item N GPUs, model ...
        \item Network: ...
      \end{itemize}
    \end{column}
    \begin{column}{0.5\textwidth}
      \textbf{Baselines}:
      \begin{itemize}
        \item Baseline A [citation]
        \item Baseline B [citation]
        \item Baseline C [citation]
      \end{itemize}
    \end{column}
  \end{columns}
  \note{
    [1 min] Brief setup — don't dwell here.
    Transition: "Here are our main results..."
  }
\end{frame}

\begin{frame}{Main Results}
  \begin{center}
    % State the takeaway BEFORE showing the figure
    \textbf{[System Name] achieves [X]\% higher throughput than the best baseline}
    \vspace{0.5em}
    \includegraphics[width=0.8\textwidth]{eval-main.pdf}
  \end{center}
  \note{
    [2 min] State the conclusion first, then show the evidence.
    Point to specific bars/lines in the figure.
    Mention both best-case and typical-case numbers.
    Transition: "Let's understand where the gains come from..."
  }
\end{frame}

\begin{frame}{Ablation Study}
  \includegraphics[width=0.9\textwidth]{eval-ablation.pdf}
  \begin{itemize}
    \item Component A contributes [X]\% of the improvement
    \item Component B contributes [Y]\% of the improvement
  \end{itemize}
  \note{
    [1.5 min] Show which design decisions matter most.
    This validates the design choices from the approach section.
    Transition: "Let me show you a quick demo..."
  }
\end{frame}

% ============================================================
% DEMO (systems talks)
% ============================================================
\section{Demo}

\begin{frame}{Live Demo}
  \begin{center}
    \includegraphics[width=0.85\textwidth]{demo-screenshot.png}
    \\[0.5em]
    {\small Backup recording: \url{https://your-demo-link.com}}
  \end{center}
  \note{
    [2 min] Show the system running under realistic load.
    If live demo fails, switch to the recorded backup immediately.
    Transition: "To summarize..."
  }
\end{frame}

% ============================================================
% CONCLUSION
% ============================================================
\section{Summary}

\begin{frame}{Summary}
  \begin{enumerate}
    \item \textbf{Problem}: [One sentence]
    \item \textbf{Approach}: [One sentence]
    \item \textbf{Result}: [Headline number]
  \end{enumerate}
  \vspace{1em}
  \textbf{Contributions}:
  \begin{itemize}
    \item Contribution 1
    \item Contribution 2
    \item Contribution 3
  \end{itemize}
  \note{
    [1 min] Restate the thesis sentence. Enumerate contributions.
    End confidently.
  }
\end{frame}

\begin{frame}{Thank You}
  \begin{center}
    \Large Questions? \\[1em]
    Paper: \url{https://arxiv.org/abs/XXXX.XXXXX} \\
    Code: \url{https://github.com/org/repo} \\[1em]
    \includegraphics[width=2cm]{qrcode.png}
  \end{center}
  \note{
    Leave this slide up during Q\&A.
    Have backup slides ready for anticipated questions.
  }
\end{frame}

% ============================================================
% BACKUP SLIDES
% ============================================================
\appendix

\begin{frame}{Backup: Additional Evaluation}
  \includegraphics[width=0.9\textwidth]{eval-extra.pdf}
  \note{Use if asked about scalability or specific workloads.}
\end{frame}

\begin{frame}{Backup: Design Details}
  Detailed algorithm pseudocode or proofs.
  \note{Use if asked about correctness or edge cases.}
\end{frame}

\end{document}
```

### Compilation

```bash
# Standard compilation
latexmk -pdf -interaction=nonstopmode slides.tex

# With speaker notes on second screen
# Uncomment \setbeameroption{show notes on second screen=right} in preamble
latexmk -pdf slides.tex

# Clean build
latexmk -C && latexmk -pdf slides.tex
```

---

## python-pptx Generation Script

```python
#!/usr/bin/env python3
"""Generate conference presentation PPTX from paper content.

Usage:
    python3 generate_slides.py --title "Paper Title" --venue OSDI --type oral
"""

import argparse
from pathlib import Path

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor


# --- Color schemes per venue ---
VENUE_COLORS = {
    "OSDI":    {"primary": RGBColor(0x00, 0x33, 0x66), "accent": RGBColor(0xCC, 0x00, 0x00)},
    "NSDI":    {"primary": RGBColor(0x00, 0x33, 0x66), "accent": RGBColor(0xCC, 0x00, 0x00)},
    "SOSP":    {"primary": RGBColor(0x00, 0x71, 0xBC), "accent": RGBColor(0x33, 0x33, 0x33)},
    "ASPLOS":  {"primary": RGBColor(0x00, 0x71, 0xBC), "accent": RGBColor(0x33, 0x33, 0x33)},
    "NeurIPS": {"primary": RGBColor(0x7B, 0x2D, 0x8E), "accent": RGBColor(0xF0, 0xAD, 0x00)},
    "ICML":    {"primary": RGBColor(0x00, 0x80, 0x80), "accent": RGBColor(0xFF, 0x66, 0x00)},
    "GENERIC": {"primary": RGBColor(0x33, 0x33, 0x33), "accent": RGBColor(0x00, 0x66, 0xCC)},
}

# --- Slide counts per talk type ---
SLIDE_COUNTS = {
    "poster-talk": (5, 8),
    "spotlight": (8, 12),
    "oral": (15, 22),
    "invited": (25, 40),
}


def create_presentation(title: str, authors: str, venue: str, talk_type: str) -> Presentation:
    """Create a conference presentation with venue-appropriate styling."""
    prs = Presentation()
    prs.slide_width = Inches(13.333)  # 16:9
    prs.slide_height = Inches(7.5)

    colors = VENUE_COLORS.get(venue, VENUE_COLORS["GENERIC"])
    min_slides, max_slides = SLIDE_COUNTS.get(talk_type, (15, 22))

    # --- Title Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    slide.shapes.title.text = title
    subtitle = slide.placeholders[1]
    subtitle.text = f"{authors}\n{venue}"
    _add_notes(slide, "[1 min] Introduce yourself and the paper topic.")

    # --- Problem Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Problem"
    body = slide.placeholders[1]
    tf = body.text_frame
    tf.text = "• Key problem statement with concrete numbers"
    _add_bullet(tf, "• Why existing approaches fall short")
    _add_bullet(tf, "• Scale and impact of the problem")
    _add_notes(slide, "[2 min] Start with the big picture. Use a concrete example.")

    # --- Key Insight Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Key Insight"
    body = slide.placeholders[1]
    body.text = "[System] is better for [applications Y] in [environment Z]"
    _add_notes(slide, "[1 min] State the thesis clearly. Most important slide.")

    # --- Architecture Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[5])  # Blank layout
    _add_title_textbox(slide, "System Architecture", colors["primary"])
    _add_notes(slide, "[2 min] Walk through the architecture diagram.")

    # --- Evaluation Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Main Results"
    body = slide.placeholders[1]
    body.text = "[System] achieves X% improvement over baselines"
    _add_notes(slide, "[2 min] State conclusion first, then show evidence.")

    # --- Summary Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Summary"
    body = slide.placeholders[1]
    tf = body.text_frame
    tf.text = "1. Problem: [one sentence]"
    _add_bullet(tf, "2. Approach: [one sentence]")
    _add_bullet(tf, "3. Result: [headline number]")
    _add_notes(slide, "[1 min] Restate thesis. End confidently.")

    # --- Thank You Slide ---
    slide = prs.slides.add_slide(prs.slide_layouts[1])
    slide.shapes.title.text = "Thank You — Questions?"
    body = slide.placeholders[1]
    body.text = "Paper: https://arxiv.org/abs/XXXX.XXXXX\nCode: https://github.com/org/repo"
    _add_notes(slide, "Leave up during Q&A. Have backup slides ready.")

    return prs


def _add_bullet(text_frame, text: str):
    """Add a bullet point to an existing text frame."""
    p = text_frame.add_paragraph()
    p.text = text
    p.level = 0


def _add_title_textbox(slide, text: str, color: RGBColor):
    """Add a styled title textbox to a blank slide."""
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.3), Inches(12), Inches(1))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = text
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = color


def _add_notes(slide, text: str):
    """Add speaker notes to a slide."""
    notes_slide = slide.notes_slide
    notes_slide.notes_text_frame.text = text


def main():
    parser = argparse.ArgumentParser(description="Generate conference talk PPTX")
    parser.add_argument("--title", required=True, help="Paper title")
    parser.add_argument("--authors", default="Author 1, Author 2", help="Author names")
    parser.add_argument("--venue", default="GENERIC", choices=list(VENUE_COLORS.keys()))
    parser.add_argument("--type", default="oral", choices=list(SLIDE_COUNTS.keys()), dest="talk_type")
    parser.add_argument("--output", default="talk.pptx", help="Output PPTX path")
    args = parser.parse_args()

    prs = create_presentation(args.title, args.authors, args.venue, args.talk_type)
    prs.save(args.output)
    print(f"Saved {args.output} ({len(prs.slides)} slides)")


if __name__ == "__main__":
    main()
```

### Usage

```bash
# Install dependency
pip install python-pptx>=0.6.21

# Generate PPTX
python3 generate_slides.py \
    --title "Your Paper Title" \
    --authors "Author 1, Author 2" \
    --venue OSDI \
    --type oral \
    --output talk.pptx
```

---

## Dual Output Workflow

For maximum flexibility, generate both formats:

```bash
# 1. Generate Beamer PDF (polished, typeset)
latexmk -pdf slides.tex

# 2. Generate PPTX (editable, last-minute changes)
python3 generate_slides.py --title "Paper Title" --venue OSDI --type oral

# 3. Review both outputs
open slides.pdf talk.pptx
```

**When to use which**:
- **Beamer PDF**: Final polished version for presentation day
- **PPTX**: Working draft for co-author review, or when venue provides a template

---

## Figure Handling

### In Beamer
```latex
\graphicspath{{figures/}{../paper/figures/}}

% Reuse figures from the paper directory
\begin{frame}{Main Results}
  \includegraphics[width=0.8\textwidth]{eval-throughput.pdf}
\end{frame}
```

### In python-pptx
```python
from pptx.util import Inches

slide = prs.slides.add_slide(prs.slide_layouts[5])  # Blank
slide.shapes.add_picture(
    "figures/eval-throughput.png",
    left=Inches(1), top=Inches(1.5),
    width=Inches(11), height=Inches(5)
)
```

**Tip**: Convert PDF figures to high-resolution PNG for PPTX:
```bash
# Using poppler-utils
pdftoppm -png -r 300 figures/eval-throughput.pdf figures/eval-throughput
```

---
name: presenting-conference-talks
description: Generates conference presentation slides (Beamer LaTeX PDF and editable PPTX) from a compiled paper with speaker notes and talk script. Use when preparing oral talks, spotlight presentations, or invited talks for ML and systems conferences.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Presenting Conference Talks, Beamer, PPTX, Slides, Speaker Notes, OSDI, SOSP, ASPLOS, NeurIPS, ICML]
dependencies: [python-pptx>=0.6.21]
---

# Presenting Conference Talks: From Paper to Slides

Generate conference presentation slides from a compiled research paper. Produces both **Beamer LaTeX PDF** (for polished typesetting) and **editable PPTX** (for last-minute adjustments), with speaker notes and an optional talk script.

## When to Use This Skill

| Scenario | Use This Skill | Use Other Skills Instead |
|----------|---------------|--------------------------|
| Preparing oral/spotlight/poster-talk slides | ✅ | |
| Generating Beamer PDF + PPTX from paper | ✅ | |
| Speaker notes and talk script | ✅ | |
| Writing the paper itself | | ml-paper-writing |
| Structuring a systems paper | | writing-systems-papers |
| Creating publication-quality plots | | academic-plotting |

**Attribution**: This skill's structure draws inspiration from the ARIS paper-slides skill (570 lines, supporting poster/spotlight/oral/invited with Beamer+PPTX). This is an independent implementation for the AI-Research-SKILLs ecosystem.

---

## Talk Types and Slide Counts

| Talk Type | Duration | Slides | Content Depth |
|-----------|----------|--------|---------------|
| poster-talk | 3–5 min | 5–8 | Problem + key result only |
| spotlight | 5–8 min | 8–12 | Problem + approach + key results |
| oral | 15–20 min | 15–22 | Full story with evaluation highlights |
| invited | 30–45 min | 25–40 | Deep dive with context and demos |

**Rule of thumb**: ~1 slide per minute for oral, ~1.5 slides per minute for spotlight.

---

## Slide Structure Templates

### Poster-Talk (5–8 slides)

```text
Slide 1: Title + Authors + Affiliation
Slide 2: Problem — Why this matters (1 motivating figure)
Slide 3: Key Insight — One-sentence thesis
Slide 4: Approach Overview — Architecture diagram
Slide 5: Main Result — Headline numbers (1 figure)
Slide 6: Takeaway + QR code to paper/code
```

### Spotlight (8–12 slides)

```text
Slide 1:  Title + Authors
Slide 2:  Problem Statement — Concrete, quantified
Slide 3:  Motivation — Why existing solutions fall short
Slide 4:  Key Insight — Thesis statement
Slide 5:  System Overview — Architecture diagram
Slide 6:  Design Highlight 1 — Core mechanism
Slide 7:  Design Highlight 2 — Key innovation
Slide 8:  Evaluation Setup — Baselines and workloads (brief)
Slide 9:  Main Results — Headline performance figure
Slide 10: Ablation / Breakdown — What contributes most
Slide 11: Summary + Contributions
Slide 12: Thank You + Links
```

### Oral (15–22 slides)

```text
Slide 1:  Title + Authors + Venue
Slide 2:  Outline (optional — "roadmap" slide)
Slide 3:  Problem Context — Domain importance
Slide 4:  Problem Statement — Specific challenge
Slide 5:  Motivation — Gaps in existing systems
Slide 6:  Key Insight — Thesis
Slide 7:  System Overview — Architecture diagram
Slide 8:  Design Component 1 — Detailed walkthrough
Slide 9:  Design Component 2 — Detailed walkthrough
Slide 10: Design Component 3 — Detailed walkthrough
Slide 11: Design Alternatives — Why not other approaches
Slide 12: Implementation — Key engineering highlights
Slide 13: Evaluation Setup — Testbed, baselines, metrics
Slide 14: End-to-End Results — Main performance
Slide 15: Result Deep Dive — Breakdown or per-workload
Slide 16: Ablation Study — Component contributions
Slide 17: Scalability — Scaling behavior
Slide 18: Demo Slide (systems talks) — Screenshot or recording
Slide 19: Related Work — Positioning (brief)
Slide 20: Summary — Contributions restated
Slide 21: Future Work — Open questions
Slide 22: Thank You + Paper Link + QR Code
```

### Invited Talk (25–40 slides)
Extends the oral structure with:
- Additional context slides (field overview, historical progression)
- Multiple demo/walkthrough slides
- Deeper evaluation analysis
- Broader implications and future directions
- Q&A preparation slides (hidden, for backup)

---

## Systems Talk Specifics

Systems conference talks have unique requirements compared to ML talks:

### Demo Slide
- Include a **live demo** or **pre-recorded screencast** of the system in action
- Always have a **recorded backup** — live demos fail at the worst times
- Show the system under realistic load, not toy examples

### Architecture Walkthrough
- Animate the architecture diagram: highlight components as you explain them
- Use Beamer `\only<N>` or `\onslide<N>` for progressive reveal
- Walk through a **concrete request** end-to-end through the system

### Evaluation Highlights
- Select 2–3 strongest figures from the paper
- Annotate figures on slides (arrows, circles highlighting key points)
- State the takeaway **before** showing the figure ("Our system is 2x faster — here's the data")

---

## Speaker Notes Guidelines

### Structure per Slide
```text
[Timing: X minutes]
[Key point to convey]
[Transition sentence to next slide]
```

### Mike Dahlin's Layered Approach
Apply "Say what you're going to say, say it, then say what you said" at three levels:

1. **Talk level**: Outline slide → body → summary slide
2. **Section level**: Section heading → content slides → section takeaway
3. **Slide level**: Headline statement → supporting evidence → transition

### Timing Guidelines
- Poster-talk: 30–60 sec per slide
- Spotlight: 30–45 sec per slide
- Oral: 45–90 sec per slide
- Invited: 60–120 sec per slide

---

## Output Formats

### Beamer LaTeX → PDF

Advantages: Professional typesetting, math support, version control friendly.

```latex
\documentclass[aspectratio=169]{beamer}
\usetheme{metropolis}  % Clean, modern theme
\usepackage{appendixnumberbeamer}

\title{Your Paper Title}
\subtitle{Venue Year}
\author{Author 1 \and Author 2}
\institute{Institution}
\date{}

\begin{document}
\maketitle

\begin{frame}{Problem}
  \begin{itemize}
    \item Key problem statement
    \item Concrete motivation with numbers
  \end{itemize}
  \note{Speaker note: Start with the big picture...}
\end{frame}

% ... more frames ...
\end{document}
```

### python-pptx → Editable PPTX

Advantages: Easy last-minute edits, corporate template compatibility, animations.

```python
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN

prs = Presentation()
prs.slide_width = Inches(13.333)  # 16:9
prs.slide_height = Inches(7.5)

# Title slide
slide = prs.slides.add_slide(prs.slide_layouts[0])
slide.shapes.title.text = "Your Paper Title"
slide.placeholders[1].text = "Author 1, Author 2\nVenue Year"

# Content slide
slide = prs.slides.add_slide(prs.slide_layouts[1])
slide.shapes.title.text = "Problem Statement"
body = slide.placeholders[1]
body.text = "Key point 1\nKey point 2"

# Add speaker notes
notes_slide = slide.notes_slide
notes_slide.notes_text_frame.text = "Speaker note: explain the motivation..."

prs.save("talk.pptx")
```

---

## Color Scheme Suggestions

> These are aesthetic suggestions, not official venue requirements. Adjust freely.

| Venue Type | Primary | Accent | Background |
|-----------|---------|--------|------------|
| USENIX (OSDI/NSDI) | Dark Blue (#003366) | Red (#CC0000) | White |
| ACM (SOSP/ASPLOS) | ACM Blue (#0071BC) | Dark Gray (#333333) | White |
| NeurIPS | Purple (#7B2D8E) | Gold (#F0AD00) | White |
| ICML | Teal (#008080) | Orange (#FF6600) | White |
| Generic | Dark Gray (#333333) | Blue (#0066CC) | White |

---

## Workflow

### Step 1: Content Extraction
```text
- Read the compiled paper (PDF or LaTeX source)
- Identify: thesis, contributions, architecture figure, key eval figures
- Note the talk type and duration
```

### Step 2: Outline Generation
```text
- Select the appropriate slide structure template (above)
- Map paper sections to slide groups
- Allocate time per slide group
```

### Step 3: Slide-by-Slide Generation
```text
- Generate Beamer source slide by slide
- Add speaker notes per slide
- Include figures from paper (copy to slides/ directory)
- Generate python-pptx script for PPTX version
```

### Step 4: Review and Polish
```text
- Check total slide count matches talk duration
- Verify all figures are readable at presentation resolution
- Run Beamer compilation: latexmk -pdf slides.tex
- Run PPTX generation: python3 generate_slides.py
- Review speaker notes for timing and transitions
```

### Quick Checklist
- [ ] Slide count appropriate for talk type/duration
- [ ] Title slide has correct authors, affiliations, venue
- [ ] Architecture diagram included and clearly labeled
- [ ] Key eval figures annotated with takeaways
- [ ] Speaker notes include timing markers
- [ ] Transitions between sections are smooth
- [ ] Demo slide has recorded backup
- [ ] Thank-you slide includes paper link / QR code
- [ ] Font sizes ≥ 24pt for readability from back of room
- [ ] Consistent color scheme throughout

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Too many slides for time limit | Cut details, keep one figure per point |
| Slides feel like paper paragraphs | Use bullet points (≤ 6 per slide), let figures tell the story |
| Audience lost during design section | Add architecture walkthrough with progressive reveal |
| Evaluation slides overwhelming | Show 2–3 strongest figures, put rest in backup slides |
| Speaker notes too long | Target 3–4 sentences per slide, focus on transitions |
| Beamer compilation fails | Check figure paths, use `\graphicspath{{figures/}}` |
| PPTX looks different from Beamer | Adjust python-pptx font sizes and margins manually |

---

## References

- [references/slide-templates.md](references/slide-templates.md) — Complete Beamer template code and python-pptx generation script
- Mike Dahlin, "Giving a Conference Talk" — https://www.cs.utexas.edu/~dahlin/professional/goodTalk.pdf

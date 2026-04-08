---
name: writing-systems-papers
description: Paragraph-level structural blueprint for 12-page systems papers targeting OSDI, SOSP, ASPLOS, NSDI, and EuroSys. Provides page allocation, paragraph templates, and writing patterns backed by authoritative guides and best-paper analysis. Complements ml-paper-writing with fine-grained systems-specific guidance.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Writing Systems Papers, OSDI, SOSP, ASPLOS, NSDI, EuroSys, Structural Blueprint, Academic Writing, LaTeX]
dependencies: [semanticscholar, arxiv, requests]
---

# Writing Systems Papers: Paragraph-Level Structural Blueprint

Fine-grained structural guidance for writing **10–12 page systems papers** targeting top systems venues: OSDI, SOSP, ASPLOS, NSDI, and EuroSys. This skill provides page allocation per section, paragraph-level blueprints, and writing patterns distilled from authoritative guides and best-paper analysis.

## When to Use This Skill

| Scenario | Use This Skill | Use ml-paper-writing Instead |
|----------|---------------|------------------------------|
| Structuring a 12-page OSDI/SOSP paper | ✅ | |
| Page budget and paragraph planning | ✅ | |
| Systems-specific evaluation structure | ✅ | |
| General ML paper writing philosophy | | ✅ |
| Citation verification workflow | | ✅ |
| LaTeX templates and formatting | | ✅ |
| NeurIPS/ICML/ICLR paper structure | | ✅ |

**Boundary**: ml-paper-writing provides general writing philosophy, multi-venue templates, and citation verification. This skill focuses exclusively on **paragraph-level structural blueprints** for systems conferences.

---

## Authoritative Sources

This blueprint synthesizes guidance from established systems researchers:

1. **Levin & Redell** — "How (and How Not) to Write a Good Systems Paper" (SOSP'83 PC Chairs, USENIX/ACM SIGOPS)
2. **Irene Zhang** (MSR/UW) — "Hints on how to write an SOSP paper" (SOSP/OSDI PC)
3. **Gernot Heiser** (UNSW, seL4) — Style Guide + Paper Writing Talk
4. **Timothy Roscoe** (ETH Zürich) — "Writing reviews for systems conferences"
5. **Mike Dahlin** (UT Austin/Google) — "Giving a Conference Talk"
6. **Yi Ding** — "How to write good systems papers?"
7. **hzwer & DingXiaoH** — WritingAIPaper (GitHub 1.3k+ stars)

Full citations and URLs: see [references/section-blueprints.md](references/section-blueprints.md).

---

## 12-Page Systems Paper Blueprint

### Overview: Page Allocation

| Section | Pages | Purpose |
|---------|-------|---------|
| Abstract | ~0.25 | 150–250 words, 5-sentence structure |
| S1 Introduction | 1.5–2 | Problem → Gap → Insight → Contributions |
| S2 Background & Motivation | 1–1.5 | Terms + Production observations |
| S3 Design | 3–4 | Architecture + Module details + Alternatives |
| S4 Implementation | 0.5–1 | Prototype details, LOC, key engineering |
| S5 Evaluation | 3–4 | Setup + End-to-end + Microbenchmarks + Scalability |
| S6 Related Work | 1 | Grouped by methodology, explicit comparison |
| S7 Conclusion | 0.5 | 3-sentence summary |
| **Total** | **~12** | References unlimited |

### Abstract (150–250 words, 5 sentences)

```text
Sentence 1: Problem context and importance
Sentence 2: Gap in existing approaches
Sentence 3: Key insight or thesis ("X is better for Y in environment Z")
Sentence 4: Summary of approach and key results
Sentence 5: Broader impact or availability
```

**Source**: Levin & Redell — "Can you state the new idea concisely? Use them in the abstract." Irene Zhang — "The abstract is harder to write because you cannot use terms or concepts you introduced in the paper."

### S1 Introduction (1.5–2 pages)

**Paragraph structure**:

1. **Problem statement** (~0.5 page) — Establish the domain and why it matters. Use concrete numbers (cluster sizes, workload statistics, latency requirements).
2. **Gap analysis** (~0.5 page) — Enumerate specific gaps G1–Gn in existing systems. Each gap is one sentence with evidence.
3. **Key insight** (1 paragraph) — The thesis statement: "X is better for applications Y running in environment Z." (Irene Zhang formula)
4. **Contributions** (~0.5 page) — Numbered list of 3–5 concrete contributions. Each contribution is testable and maps to a section.

**Writing pattern**: hzwer Move 1 (Establish territory) → Move 2 (Find niche) → Move 3 (Occupy niche).

**Source**: Irene Zhang — "clearly state your target environment (Z) and application (Y)" + "clearly state why previous systems do not meet the needs"; Levin & Redell — "What exactly is the problem being solved?"

### S2 Background & Motivation (1–1.5 pages)

**Paragraph structure**:

1. **Technical background** (~0.5 page) — Define terms and systems the reader needs. Follow Gernot Heiser's "define-before-use" principle.
2. **Production observations** (~0.5–1 page) — Present Observation 1, 2, 3 from real data or measurements. Each observation leads to a design insight.

**Source**: Irene Zhang — "clearly motivate Y and Z. Why is application Y important?"; Gernot Heiser — "define-before-use."

### S3 Design (3–4 pages)

**Paragraph structure**:

1. **System architecture overview** (~0.5 page) — Architecture diagram first (Yi Ding: "draw a picture first"). One-paragraph walkthrough of major components and data flow.
2. **Module-by-module design** (~2–2.5 pages) — Each subsection: what the module does, the design choice made, alternatives considered, and why this choice wins.
3. **Design alternatives and trade-offs** (~0.5–1 page) — For each major decision, explicitly discuss what was not chosen and why.

**Source**: Irene Zhang — "Every design choice made in X should be discussed with alternatives and the reasons for the choice"; Levin & Redell — "What were the alternatives considered at various points, and why were the choices made?"

### S4 Implementation (0.5–1 page)

1. **Prototype description** — Language, framework, LOC, integration with existing systems.
2. **Key engineering decisions** — Non-obvious implementation choices worth documenting.

**Source**: Levin & Redell — "Does the paper describe something that has actually been implemented?"; Irene Zhang — "explain how you constructed a prototype to test your hypothesis."

### S5 Evaluation (3–4 pages)

**Paragraph structure**:

1. **Experimental setup** (~0.5 page) — Hardware, baselines, workloads, metrics. Enough detail to reproduce.
2. **End-to-end comparison** (~1–1.5 pages) — X vs baselines for application Y on environment Z. Main performance results.
3. **Microbenchmarks / Ablation** (~1–1.5 pages) — Isolate each design decision's contribution. Ablation experiments decompose the gains.
4. **Scalability** (~0.5 page) — Show behavior as problem size, cluster size, or load increases.

**Critical rule** (Irene Zhang): State every experimental conclusion **three times**:
- Section opening: hypothesis ("We expect X to outperform Y because...")
- Section closing: conclusion ("Results show X outperforms Y by Z%")
- Figure caption: evidence ("Figure N shows X achieves Z% better throughput than Y")

**Two experiment types**:
- Type 1: X vs baselines for Y on Z (end-to-end comparison)
- Type 2: Ablation — remove each design component to measure its individual impact

### S6 Related Work (1 page)

- Group by **methodology or approach**, not by individual papers.
- For each group: what they do, what limitation remains, how your work differs.
- Use a comparison table when comparing 4+ systems on specific dimensions.

**Source**: Levin & Redell — "Are comparisons with previous work clear and explicit?"; Irene Zhang — use comparison tables.

### S7 Conclusion (0.5 page)

Three sentences (Irene Zhang formula):
1. The hypothesis / problem addressed
2. The solution approach
3. The key result

---

## Writing Patterns

Four reusable patterns for structuring systems papers. See [references/writing-patterns.md](references/writing-patterns.md) for detailed examples.

### Pattern 1: Gap Analysis (Lucid, ASPLOS'23)
Enumerate gaps G1–Gn in Introduction → map to answers A1–An in Design. Creates a clear contract with the reader.

### Pattern 2: Observation-Driven (GFS, arXiv 2025)
Present production observations (O1–O3) in Motivation → derive design insights → build system around insights. Effective when you have real workload data.

### Pattern 3: Contribution List (Blox, EuroSys'24; Sia, SOSP'23)
Numbered contributions in Introduction, each mapping to a section. Readers (and reviewers) can track claims through the paper.

### Pattern 4: Thesis Formula (Irene Zhang)
Structure the entire paper around: "X is better for applications Y running in environment Z." Introduction states it, Design explains how, Evaluation proves it.

---

## Conference Differences

> **Warning**: Venue rules change yearly. Always verify against the **current year's CFP** before submission.

| Venue | Format | Submission Limit | Camera-Ready | References |
|-------|--------|-----------------|--------------|------------|
| OSDI | USENIX | 12 pages | 14 pages | Unlimited |
| NSDI | USENIX | 12 pages | 14 pages | Unlimited |
| SOSP | ACM SIGOPS | 12 pages (tech content) | — | Unlimited |
| ASPLOS | ACM SIGPLAN | 11 pages | 13 pages | Unlimited |
| EuroSys | ACM | 12 pages | — | Unlimited |

Based on 2025/2026 CFPs. Verify current limits before submission.

---

## Writing Philosophy

### Manage Reader State (Gernot Heiser)
Treat the reader's cognitive load like an OS managing process state. Never introduce a concept without context. Never reference something defined later without a forward pointer.

### Six-Dimensional Quality (Levin & Redell)
Self-check against: **Original Ideas**, **Reality** (is it built?), **Lessons** (what did you learn?), **Choices** (alternatives discussed?), **Context** (related work fair?), **Presentation** (clear writing?).

### Page-One Figure (hzwer)
Include a figure on the first page that captures the core idea. Reviewers form first impressions from the title, abstract, and page-one figure.

---

## Academic Integrity Requirements

### Citation Discipline
- **Never generate citations from memory.** Use ml-paper-writing's citation verification workflow (Semantic Scholar / DBLP / CrossRef APIs).
- Mark unverified references as `[CITATION NEEDED]`.

### Prohibition of Fabrication
- Do NOT fabricate production observations, traces, deployment experiences, or experimental results.
- Do NOT generate fake venue rules, paper metadata, or best-paper claims.
- Do NOT copy paragraph-level text from reference papers. This blueprint provides **structural guidance**, not copy-paste templates.

### LLM Disclosure
- Some venues require disclosure of substantial LLM use in writing or ideation. Check each venue's AI policy in the current CFP.

### Attribution
- When structures are inspired by specific papers (e.g., Lucid's gap-analysis pattern), cite the inspiration.
- Cross-repository references (e.g., ARIS paper-slides structure) are attributed, not copied.

### Temporal Validity
- Venue rules (page limits, format, AI policies) change annually. All venue information in this skill is based on 2025/2026 CFPs. **Always verify against the current year's CFP.**

---

## Workflow: Structuring a New Systems Paper

```text
Step 1: Read this SKILL.md for page allocation overview
Step 2: Read references/section-blueprints.md for per-section paragraph templates
Step 3: Choose a writing pattern from references/writing-patterns.md
Step 4: Draft section by section following the blueprint
Step 5: Run the checklist from references/checklist.md before submission
Step 6: Use ml-paper-writing for citation verification and LaTeX formatting
```

### Quick Checklist

- [ ] Thesis statement follows "X is better for Y in Z" formula
- [ ] Introduction has numbered contributions (3–5)
- [ ] Each contribution maps to a paper section
- [ ] Design discusses alternatives for every major choice
- [ ] Every eval conclusion stated 3 times (hypothesis, result, caption)
- [ ] Related work grouped by methodology, not individual papers
- [ ] Page budget within venue limits
- [ ] All citations verified programmatically (no hallucinated references)

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Paper feels like a "feature list" | Restructure around thesis formula: X better for Y in Z |
| Evaluation lacks depth | Add ablation experiments isolating each design decision |
| Reviewers say "incremental" | Strengthen gap analysis: make G1–Gn crisper with evidence |
| Design section too long | Move implementation details to S4, keep S3 at design level |
| Motivation feels weak | Add production observations with concrete numbers |
| Related work reads like a bibliography | Group by approach, add explicit differentiation |

---

## References

- [references/section-blueprints.md](references/section-blueprints.md) — Detailed per-section paragraph templates with authoritative source quotes and best-paper structural examples
- [references/writing-patterns.md](references/writing-patterns.md) — Four writing patterns with concrete paper examples
- [references/checklist.md](references/checklist.md) — Pre-submission checklist combining community resources and academic integrity verification

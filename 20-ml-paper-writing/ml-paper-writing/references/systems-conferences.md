# Systems Conference Guide: OSDI, NSDI, ASPLOS, SOSP

This reference provides comprehensive details for top systems conferences, including deadlines, formatting requirements, track descriptions, and submission strategies.

---

## Conference Overview

| Conference | Full Name | Page Limit | Template | Tracks |
|------------|-----------|------------|----------|--------|
| **OSDI 2026** | 20th USENIX Symposium on Operating Systems Design and Implementation | 12 pages (+2 camera-ready) | USENIX `usenix-2020-09.sty` | Research + Operational Systems |
| **NSDI 2027** | 24th USENIX Symposium on Networked Systems Design and Implementation | 12 pages | USENIX `usenix-2020-09.sty` | Research / Frontiers / Operational |
| **ASPLOS 2027** | ACM International Conference on Architectural Support for Programming Languages and Operating Systems | 12 pages (ACM) | ACM SIGPLAN `acmart.cls` | Single track, dual review cycles |
| **SOSP 2026** | 32nd ACM Symposium on Operating Systems Principles | 12 pages | ACM SIGPLAN `acmart.cls` | Single track |

> **OSDI 2026**: New "Operational Systems" track. Max 8 papers per author. Encourages appropriate paper length (don't pad to 12 pages). Target acceptance rate ≥20%. No author response period; uses "conditional accept" instead of major revision.
>
> **NSDI 2027**: Two deadlines (Spring/Fall). New "Frontiers Track" for ambitious, forward-looking ideas. All papers undergo Introduction prescreening. Rejected papers may receive one-shot revision opportunity.
>
> **ASPLOS 2027**: Two cycles (April/September). New rapid review round (only first 2 pages reviewed). Evaluates contributions to architecture/PL/OS core areas. Max 4 papers per author per cycle.
>
> **SOSP 2026**: ACM SIGPLAN format. Optional Artifact Evaluation. Double-blind review. Encourages breakthrough research directions.

---

## Deadlines & Key Dates

### OSDI 2026 (Seattle, WA, USA | July 13–15, 2026)

| Milestone | Date |
|-----------|------|
| Abstract registration | December 4, 2025, 5:59 PM EST |
| Full paper submission | December 11, 2025, 5:59 PM EST |
| Notification | March 26, 2026 |
| Camera-ready | June 9, 2026 |

### NSDI 2027 (Providence, RI, USA | May 11–13, 2027)

**Spring Deadline:**

| Milestone | Date |
|-----------|------|
| Titles and abstracts | April 16, 2026, 11:59 PM EDT |
| Full paper | April 23, 2026, 11:59 PM EDT |
| Notification | July 23, 2026 |
| Camera-ready | October 20, 2026 |

**Fall Deadline:**

| Milestone | Date |
|-----------|------|
| Titles and abstracts | September 10, 2026, 11:59 PM EDT |
| Full paper | September 17, 2026, 11:59 PM EDT |
| Notification | December 8, 2026 |
| Camera-ready | March 4, 2027 |

### ASPLOS 2027

**April Cycle:**

| Milestone | Date |
|-----------|------|
| Full paper submission | April 15, 2026 (AoE) |
| Author response | July 6–9, 2026 |
| Notification | July 27, 2026 |

**September Cycle:**

| Milestone | Date |
|-----------|------|
| Full paper submission | September 9, 2026 (AoE) |
| Author response | December 1–4, 2026 |
| Notification | December 21, 2026 |

### SOSP 2026 (September 30, 2026)

| Milestone | Date |
|-----------|------|
| Abstract registration | March 26, 2026 (AoE) |
| Full paper submission | April 1, 2026 (AoE) |
| Notification | July 3, 2026 |
| Camera-ready | August 28, 2026 |
| Workshops | September 29, 2026 |
| Conference | September 30, 2026 |

---

## Track Descriptions

### OSDI 2026 Tracks

**Research Track**: Broad interest in operating systems design, implementation, analysis, evaluation, and deployment. Topics include:
- Operating systems, their interaction with hardware/software, and their role as building blocks for other systems
- Virtualization, including virtual machine monitors, hypervisors, and OS-level virtualization
- File and storage systems, distributed systems, cloud computing
- Systems for machine learning/AI, security and privacy, embedded/real-time systems

**Operational Systems Track** (NEW):
- Papers describing deployed and operational systems with valuable lessons
- Title must end with "(Operational Systems)"
- Evaluation criteria focus on deployment insights rather than novelty

### NSDI 2027 Tracks

**Research Track**: Original research on networked systems design and implementation.

**Frontiers Track** (NEW):
- For ambitious, forward-looking ideas in networked systems
- May have less complete evaluation but must present compelling vision

**Operational Track**: Systems deployed at scale with operational insights.

### ASPLOS 2027 Review Process

**Rapid Review Round** (NEW):
- Reviewers read ONLY the first 2 pages to decide if paper merits full review
- First 2 pages must be self-contained: problem, approach, key results, contribution
- Papers failing rapid review receive brief feedback and are rejected

**Full Review Round**:
- Standard double-blind review process
- Author response period
- Major revision available (not just accept/reject)

### SOSP 2026 Features

- **Artifact Evaluation** (optional but encouraged): Submit artifacts for reproducibility
- **Author Response**: 500-word limit, no new experiments allowed

---

## Formatting Requirements

### USENIX Format (OSDI, NSDI)

```latex
% USENIX format setup
\documentclass[letterpaper,twocolumn,10pt]{article}
\usepackage{usenix-2020-09}

% Key specifications:
% - Paper size: US Letter (8.5" x 11")
% - Font: Times Roman, 10pt on 12pt leading
% - Text block: 7" x 9"
% - Two columns, 0.33" column separation
% - Page limit: 12 pages (excluding references)
```

### ACM SIGPLAN Format (ASPLOS, SOSP)

```latex
% ACM SIGPLAN format setup
\documentclass[sigplan,10pt]{acmart}

% For submission (hide copyright block):
\setcopyright{none}
\settopmatter{printfolios=true, printccs=false, printacmref=false}
\renewcommand\footnotetextcopyrightpermission[1]{}

% Key specifications:
% - Paper size: US Letter
% - Font: 10pt
% - Text block: 178mm x 229mm
% - Two columns
% - Page limit: 12 pages (excluding references)
```

---

## Submission Rules

### OSDI 2026

- **Max submissions per author**: 8 papers
- **No author response period**
- **Conditional accept** replaces major revision
- **Anonymization**: System name must differ from arXiv/talks
- **Paper length**: Encouraged to be as short as needed (don't pad to 12 pages)
- **AI policy**: Generative AI tools allowed if disclosed; AI cannot be listed as author

### NSDI 2027

- **Prescreening via Introduction**: All papers first evaluated based on Introduction quality
- **One-shot revision**: Rejected papers may receive revision opportunity
- **Dual deadlines**: Spring (April 2026) + Fall (September 2026)
- **Track selection**: Must choose Research, Frontiers, or Operational at submission

### ASPLOS 2027

- **Max submissions per author per cycle**: 4 papers
- **Rapid review**: Only first 2 pages reviewed initially
- **Dual cycles**: April + September
- **Resubmission note**: Required if previously submitted to ASPLOS
- **Must advance**: Architecture, Programming Languages, or Operating Systems research

### SOSP 2026

- **Artifact Evaluation**: Optional but recommended
- **Author response**: 500-word limit, no new experiments
- **Anonymous system name**: Required, different from public versions
- **Double-blind**: Authors must not be identifiable

---

## Format Conversion: ML Venue → Systems Venue

When converting a paper from an ML venue to a systems venue, the changes go beyond template swapping:

| Aspect | ML Venue | Systems Venue | Action |
|-------|----------|---------------|--------|
| **Page limit** | 7-9 pages | 12 pages | Expand with system design details |
| **Evaluation** | Benchmarks, ablations | End-to-end + microbenchmarks | Add system-level evaluation |
| **Contribution framing** | Algorithmic novelty | System design + implementation | Reframe as systems contribution |
| **Implementation** | Often secondary | Core contribution | Detail architecture, optimizations |
| **Deployment** | Rarely discussed | Highly valued (especially OSDI/NSDI) | Add deployment experience |

### Specific Conversion Paths

| From → To | Key Adjustments |
|-----------|------------------|
| ML → OSDI | USENIX template; reframe for systems; add design/implementation; emphasize deployment |
| ML → NSDI | USENIX format; emphasize networked systems; choose track |
| ML → ASPLOS | ACM SIGPLAN; self-contained first 2 pages (rapid review); frame for arch/PL/OS |
| ML → SOSP | ACM SIGPLAN; emphasize OS principles; system design/evaluation |
| OSDI ↔ SOSP | USENIX ↔ ACM SIGPLAN template; similar page limits |
| OSDI ↔ NSDI | Same USENIX format; adjust scope (general vs networked) |

---

## Systems Paper Structure

A typical systems paper follows this structure (differs from ML papers):

```text
1. Introduction          - Problem, approach, key results (CRITICAL for NSDI prescreening / ASPLOS rapid review)
2. Background/Motivation - System context, why existing solutions fail
3. Design                - System architecture, key design decisions
4. Implementation        - Implementation details, optimizations, engineering challenges
5. Evaluation            - End-to-end performance + microbenchmarks + scalability
6. Discussion            - Limitations, deployment lessons (optional but valued at SOSP)
7. Related Work          - Organized by approach, not chronologically
8. Conclusion            - Summary of contributions and impact
```

**Key differences from ML papers**:
- **Design section** replaces Methods: Focus on architecture and trade-offs
- **Implementation section** is a core contribution, not an afterthought
- **Evaluation** includes both macro (end-to-end) and micro benchmarks
- **Discussion** section is common (especially SOSP)

---

## Official CFP Links

- **OSDI 2026**: <https://www.usenix.org/conference/osdi26/call-for-papers>
- **NSDI 2027**: <https://www.usenix.org/conference/nsdi27/call-for-papers>
- **ASPLOS 2027**: <https://www.asplos-conference.org/asplos2026/call-for-papers-asplos27/>
- **SOSP 2026**: <https://sigops.org/s/conferences/sosp/2026/cfp.html>
- **USENIX LaTeX Template**: <https://www.usenix.org/conferences/author-resources/paper-templates>
- **ACM SIGPLAN Template**: <https://www.acm.org/publications/proceedings-template>

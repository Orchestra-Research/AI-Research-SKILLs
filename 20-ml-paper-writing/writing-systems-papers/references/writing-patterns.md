# Writing Patterns for Systems Papers

Four reusable structural patterns for organizing systems papers, with concrete examples from published work.

---

## Pattern 1: Gap Analysis

**When to use**: You have identified specific, enumerable shortcomings in existing systems that your work addresses one-by-one.

**Structure**:
```text
Introduction:
  G1: [Existing systems assume X, but workloads show Y]
  G2: [Existing approach cannot handle scenario Z]
  G3: [No existing system provides property W]
  ...
  "We present [System], which addresses G1–Gn through A1–An."

Design:
  A1 → addresses G1: [Design component with rationale]
  A2 → addresses G2: [Design component with rationale]
  A3 → addresses G3: [Design component with rationale]
  ...

Evaluation:
  Experiment for G1/A1: [Metric showing A1 fixes G1]
  Experiment for G2/A2: [Metric showing A2 fixes G2]
  ...
```

**Key property**: Creates a **traceable contract** — reviewers can verify that every claimed gap has a corresponding solution and evaluation.

### Example: Lucid (ASPLOS'23)

Lucid identifies five gaps (G1–G5) in existing GPU cluster schedulers:

| Gap | Problem | Answer | Section |
|-----|---------|--------|---------|
| G1 | Schedulers ignore GPU heterogeneity | A1: Heterogeneity-aware placement | §3.1 |
| G2 | No adaptation to workload shifts | A2: Online learning adaptation | §3.2 |
| G3 | Locality assumptions break at scale | A3: Topology-aware scheduling | §3.3 |
| G4 | Fairness metrics don't account for GPU types | A4: Heterogeneity-fair allocation | §3.4 |
| G5 | Existing profiling is too expensive | A5: Lightweight profiling | §3.5 |

**Structural traits**:
- Each gap is stated with evidence from production traces (Azure, Alibaba)
- Each answer maps to a design subsection
- Evaluation mirrors the gap structure: one experiment per G→A pair

### How to Apply This Pattern

1. List all limitations of existing work as G1–Gn (typically 3–5)
2. For each Gi, design an answering component Ai
3. In the contribution list, state: "We identify G1–Gn and address them through A1–An"
4. In evaluation, explicitly test each Gi→Ai mapping
5. Use a summary table in Introduction or Related Work showing the gap-answer mapping

---

## Pattern 2: Observation-Driven

**When to use**: You have access to production data, workload traces, or empirical measurements that reveal surprising properties motivating your design.

**Structure**:
```text
Background & Motivation:
  Observation 1: [Data finding with figure/table]
    → Insight 1: [What this means for design]
  Observation 2: [Data finding with figure/table]
    → Insight 2: [What this means for design]
  Observation 3: [Data finding with figure/table]
    → Insight 3: [What this means for design]

Design:
  Insight 1 → Component A: [Design driven by O1]
  Insight 2 → Component B: [Design driven by O2]
  Insight 3 → Component C: [Design driven by O3]

Evaluation:
  Show system handles the patterns identified in O1–O3
```

**Key property**: Ground-truth data makes the motivation **irrefutable** — reviewers cannot argue the problem does not exist if you show production evidence.

### Example: GFS (arXiv 2025 preprint)

GFS presents three observations from production GPU cluster traces:

| Observation | Finding | Design Insight | System Component |
|-------------|---------|----------------|-----------------|
| O1 | GPU fragmentation increases with heterogeneity | Fragment-aware allocation needed | Fragment-aware scheduler |
| O2 | Job arrival patterns are bursty, not Poisson | Reactive scheduling insufficient | Predictive admission control |
| O3 | Small jobs dominate count but large jobs dominate GPU-hours | Different policies for different sizes | Size-tiered scheduling |

**Structural traits**:
- Each observation backed by figures from real traces
- Clear arrow from observation → insight → design component
- Evaluation workloads reproduce the observed patterns

### How to Apply This Pattern

1. Analyze your production data or traces for 2–4 surprising findings
2. Present each as "Observation N" with supporting figure/table
3. Below each observation, state the design insight it implies
4. In Design, reference back: "Motivated by O1 (§2), we design..."
5. In Evaluation, use workloads that exhibit the observed patterns

---

## Pattern 3: Contribution List

**When to use**: Your system has multiple distinct contributions that span different technical areas (new abstraction + new algorithm + new implementation + new evaluation methodology).

**Structure**:
```text
Introduction:
  "This paper makes the following contributions:
  1. [Contribution type]: [Description] (§N)
  2. [Contribution type]: [Description] (§M)
  3. [Contribution type]: [Description] (§P)
  4. [Contribution type]: [Description] (§Q)"

Each section directly addresses one or more numbered contributions.

Evaluation:
  Each experiment validates a specific contribution.
```

**Key property**: Reviewers can **count and verify** contributions. Clear section cross-references make the paper navigable.

### Example: Blox (EuroSys'24)

Blox lists 7 contributions covering the full system:

| # | Type | Contribution | Section |
|---|------|-------------|---------|
| 1 | Abstraction | Cluster state abstraction | §3.1 |
| 2 | Abstraction | Job state machine abstraction | §3.2 |
| 3 | Abstraction | Placement group abstraction | §3.3 |
| 4 | Abstraction | Metric collection abstraction | §3.4 |
| 5 | Abstraction | Policy composition abstraction | §3.5 |
| 6 | Abstraction | Simulation abstraction | §3.6 |
| 7 | System | Open-source simulator with 3 case studies | §4–§6 |

### Example: Sia (SOSP'23)

Sia lists 5 primary contributions:

| # | Type | Contribution | Section |
|---|------|-------------|---------|
| 1 | Analysis | Heterogeneity opportunity analysis | §2 |
| 2 | Design | Throughput-fairness co-optimization | §3 |
| 3 | Algorithm | Adaptive resource allocation | §4 |
| 4 | System | Sia scheduler implementation | §5 |
| 5 | Evaluation | Evaluation on 3 production traces | §6 |

### How to Apply This Pattern

1. List contributions as numbered items (3–7 is typical)
2. Tag each with a type: Analysis, Design, Algorithm, System, Evaluation
3. Cross-reference sections: "(§N)"
4. Ensure each contribution is **testable** — a reviewer should be able to verify it from the paper
5. In evaluation, map experiments back to contribution numbers

---

## Pattern 4: Thesis Formula

**When to use**: Your paper has a single, strong central claim that can be expressed as a comparative statement.

**Structure** (Irene Zhang's formula):
```text
Thesis: "X is better for applications Y running in environment Z"

Introduction: State the thesis clearly
Background: Define Y and Z, explain why they matter
Design: Explain how X achieves its advantage
Evaluation: Prove X is better for Y in Z
  - Show X beats baselines on Y
  - Show X works in environment Z
  - Show X's advantage comes from its design choices (ablation)
```

**Key property**: The entire paper serves a **single, memorable claim**. Reviewers can assess the paper by checking if the thesis is adequately supported.

### How to Apply This Pattern

1. Distill your contribution to one sentence: "[System] is better for [application] in [environment] because [insight]"
2. In Abstract (sentence 3): state this thesis verbatim
3. In Introduction: use it as the culmination of the gap analysis
4. In Design: show how each component serves the thesis
5. In Evaluation: directly test the thesis with appropriate baselines and workloads
6. In Conclusion: restate the thesis with evidence from evaluation

### Combining the Thesis Formula with Other Patterns

The thesis formula is **compositional** — it works as the top-level structure while other patterns fill in the details:

- Thesis + Gap Analysis: "X is better for Y in Z because it addresses G1–Gn"
- Thesis + Observation-Driven: "X is better for Y in Z; we discovered this through O1–O3"
- Thesis + Contribution List: "X is better for Y in Z; our contributions include C1–Cn"

---

## Pattern Selection Guide

| Your Situation | Recommended Pattern | Reason |
|---------------|-------------------|--------|
| Clear list of shortcomings in prior work | Gap Analysis | Traceable, easy for reviewers |
| Have production data or traces | Observation-Driven | Irrefutable motivation |
| Multiple distinct technical contributions | Contribution List | Countable, verifiable |
| One strong comparative claim | Thesis Formula | Focused, memorable |
| Complex system with data + gaps | Thesis + Gap + Observation | Combine for maximum impact |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Feature Dump
Listing system features without connecting them to problems or claims. Fix: use Gap Analysis or Thesis Formula to give every feature a purpose.

### Anti-Pattern 2: Solution Looking for a Problem
Presenting the design before establishing why it is needed. Fix: use Observation-Driven to ground the design in real data.

### Anti-Pattern 3: Vague Contributions
"We propose a novel system for X" — not testable, not verifiable. Fix: use Contribution List with specific, measurable claims.

### Anti-Pattern 4: Missing Alternatives
Presenting design choices as the only option. Fix: for every major decision, discuss at least one alternative and why it was rejected (Irene Zhang's rule).

# Section-by-Section Blueprints for Systems Papers

Detailed paragraph-level templates for each section of a 10–12 page systems paper. Each subsection includes authoritative source quotes and structural examples from best papers.

---

## Authoritative Source References

| # | Author(s) | Title | Affiliation / Context | URL |
|---|-----------|-------|----------------------|-----|
| 1 | Roy Levin & David D. Redell | "How (and How Not) to Write a Good Systems Paper" | SOSP'83 PC Chairs, USENIX/ACM SIGOPS | https://www.usenix.org/conferences/author-resources/how-and-how-not-write-good-systems-paper |
| 2 | Irene Zhang | "Hints on how to write an SOSP paper" | MSR/UW, SOSP/OSDI PC | https://irenezhang.net/blog/2021/06/05/hints.html |
| 3 | Gernot Heiser | Style Guide + Paper Writing Talk | UNSW, seL4 author | https://gernot-heiser.org/style-guide.html |
| 4 | Timothy Roscoe | "Writing reviews for systems conferences" | ETH Zürich | https://people.inf.ethz.ch/troscoe/pubs/review-writing.pdf |
| 5 | Yi Ding | "How to write good systems papers?" | — | https://counterfac.medium.com/how-to-write-good-systems-papers-b6ef3b7043ff |
| 6 | hzwer & DingXiaoH | WritingAIPaper | GitHub (1.3k+ stars) | https://github.com/hzwer/WritingAIPaper |
| 7 | MLNLP-World | Paper-Writing-Tips | GitHub (4.4k stars) | https://github.com/MLNLP-World/Paper-Writing-Tips |
| 8 | RU-System-Software-and-Security | Paper_Writing_Tips | GitHub | https://github.com/RU-System-Software-and-Security/Paper_Writing_Tips |

---

## Abstract Blueprint (150–250 words)

### Structure: 5 Sentences

```text
S1 — Context: What broad problem area is this work in? Why does it matter?
     (e.g., "Large-scale ML training clusters waste 30–50% of GPU cycles due to...")
S2 — Gap: What specific limitation of current approaches does this work address?
     (e.g., "Existing schedulers cannot adapt to ... because ...")
S3 — Thesis: What is your key insight/approach?
     (e.g., "We present X, which uses [technique] to achieve [property] for [workload] in [environment]")
S4 — Results: What are the headline numbers?
     (e.g., "Evaluation on [N]-GPU cluster shows X improves [metric] by [Y]% over [baselines]")
S5 — Impact: Broader significance or availability.
     (e.g., "X is open-sourced at [URL] and has been deployed at [organization]")
```

### Guidance from Sources

- **Levin & Redell**: "Can you state the new idea concisely? [...] Use them in the abstract and introduction."
- **Irene Zhang**: "The abstract is probably the hardest section to write because you cannot use any terms or concepts that you introduced in the paper."
- **Gernot Heiser**: The abstract must be self-contained — no forward references, no undefined jargon.

### Best-Paper Examples

**Blox (EuroSys'24)**: Abstract states 7 scheduling abstractions, names the system, lists concrete metrics.

**Sia (SOSP'23)**: Abstract follows problem → insight → approach → results structure in exactly 5 sentences.

---

## S1 Introduction Blueprint (1.5–2 pages)

### Paragraph-by-Paragraph Structure

#### Para 1–2: Problem Statement (~0.5 page)

**Purpose**: Establish the domain and its importance with concrete, quantitative evidence.

**Template**:
```text
[Domain] is critical for [reason]. [Concrete statistic about scale/impact].
However, [specific challenge] leads to [quantified inefficiency].
For example, [real-world scenario with numbers].
```

**Guidance**:
- Levin & Redell: "What exactly is the problem being solved? Is it a real problem?"
- Irene Zhang: "clearly state your target environment (Z) and application (Y)"
- Use production numbers when available (cluster size, throughput, cost)

#### Para 3–4: Gap Analysis (~0.5 page)

**Purpose**: Show that existing approaches fall short. Each gap is specific and evidence-backed.

**Template**:
```text
Existing systems address [aspect] through [approaches], but they fall short in [N] ways:

G1: [First gap] — [existing system] assumes [assumption], which breaks when [condition]. [Evidence].
G2: [Second gap] — [existing approach] cannot handle [scenario] because [reason]. [Evidence].
G3: [Third gap] — ...
```

**Guidance**:
- Irene Zhang: "clearly state why previous systems do not meet the needs of applications Y in environment Z"
- Each gap should be falsifiable — a reviewer can verify the claim
- Lucid (ASPLOS'23) exemplifies this: G1–G5 mapped precisely to A1–A5

#### Para 5: Key Insight (1 paragraph)

**Purpose**: The core thesis statement — the one sentence that captures your contribution.

**Template**:
```text
Our key insight is that [observation about the problem] enables [new approach].
Based on this insight, we present [System Name], a [one-line description]
that [key differentiator] for [target applications] in [target environment].
```

**Guidance**:
- Irene Zhang's thesis formula: "X is better for applications Y running in environment Z"
- Levin & Redell: "What are the key ideas? Can you state them concisely?"
- This paragraph should be quotable by reviewers in their recommendation

#### Para 6–7: Contributions (~0.5 page)

**Purpose**: Numbered list of 3–5 testable claims, each linked to a paper section.

**Template**:
```text
This paper makes the following contributions:
1. [Insight/Analysis] — We identify [N observations] about [domain] (§2).
2. [Design] — We design [component], which [key property] (§3).
3. [System] — We implement [System Name] in [LOC] lines of [language] (§4).
4. [Evaluation] — We evaluate [System Name] on [workload], showing [headline result] (§5).
```

**Best-Paper Examples**:
- **Blox (EuroSys'24)**: 7 contributions covering abstractions + simulator + case studies
- **Sia (SOSP'23)**: 5 primary contributions with section cross-references
- **Lucid (ASPLOS'23)**: Contributions mirror the G1–G5 gap structure

---

## S2 Background & Motivation Blueprint (1–1.5 pages)

### Para 1–3: Technical Background (~0.5 page)

**Purpose**: Define terms and describe the system environment the reader needs to understand.

**Template**:
```text
[Brief description of the domain/system being studied].
[Key Term 1] refers to [definition]. [Key Term 2] refers to [definition].
Figure [N] shows the [architecture/workflow] of [system being studied].
```

**Guidance**:
- Gernot Heiser: "define-before-use" — every term must be defined before first substantive use
- Only include background necessary for understanding this paper's contribution
- If background exceeds 0.5 page, the reader may not be in your target audience

### Para 4–6: Production Observations (~0.5–1 page)

**Purpose**: Present data-driven observations that motivate the design.

**Template**:
```text
To understand [aspect], we analyze [data source] from [environment].

Observation 1: [Finding]. Figure [N] shows that [evidence]. This implies [design insight].
Observation 2: [Finding]. Table [N] shows that [evidence]. This suggests [design direction].
Observation 3: [Finding]. [Evidence]. Combined with O1 and O2, this motivates [approach].
```

**Guidance**:
- Irene Zhang: "clearly motivate Y and Z. Why is application Y important?"
- Each observation should logically lead to a design decision in §3
- Use figures/tables to present data — reviewers trust visualizations over prose claims

**Best-Paper Examples**:
- **GFS (arXiv 2025)**: 3 production observations → 3 design insights → 3 system components
- **Lucid (ASPLOS'23)**: 5 cluster characteristic analyses from Azure/Alibaba traces

---

## S3 Design Blueprint (3–4 pages)

### Para 1–2: System Architecture Overview (~0.5 page)

**Purpose**: Architecture diagram + walkthrough. This is the "page-one figure" equivalent for the design section.

**Template**:
```text
Figure [N] shows the architecture of [System Name]. [System Name] consists of [N] components:
(1) [Component A], which [function];
(2) [Component B], which [function];
(3) [Component C], which [function].

A typical request flows as follows: [step-by-step walkthrough of data/control flow].
```

**Guidance**:
- Yi Ding: "Draw a picture first" — the architecture diagram anchors the entire design section
- Gernot Heiser: "Maintaining user state" — the reader should hold the architecture in mind while reading subsections

### Subsections: Module-by-Module Design (~2–2.5 pages)

**For each module/subsection**:

```text
§3.X [Module Name]

[What problem this module solves — 1 sentence].

[Design choice]: We use [approach] because [reason].
[Alternative 1]: [description] was considered but rejected because [trade-off].
[Alternative 2]: [description] does not work because [limitation].

[Detailed mechanism — 1–3 paragraphs explaining how it works].
[Pseudocode or algorithm if applicable — Algorithm [N]].
```

**Guidance**:
- Irene Zhang: "Every design choice made in X should be discussed with alternatives and the reasons for the choice"
- Levin & Redell: "What were the alternatives considered at various points, and why were the choices made?"
- Reviewers use alternatives discussion to judge design maturity

### Design Alternatives Summary (~0.5–1 page)

For complex systems, a summary table of design decisions is highly effective:

```text
| Decision | Our Choice | Alternative | Why Not |
|----------|-----------|-------------|---------|
| Scheduling policy | [X] | [Y] | [reason] |
| Communication | [X] | [Y] | [reason] |
| Fault tolerance | [X] | [Y] | [reason] |
```

**Best-Paper Examples**:
- **Blox (EuroSys'24)**: 7 abstraction modules each with dedicated subsection
- **Sia (SOSP'23)**: 3-phase scheduling design with alternatives per phase

---

## S4 Implementation Blueprint (0.5–1 page)

### Structure

```text
Para 1: System overview — [Language], [LOC], built on top of [framework/library].
         We implement [System Name] as [deployment model: library/service/kernel module].

Para 2: Key engineering decisions — [Non-obvious choices]:
         - [Decision 1]: We chose [X] over [Y] because [reason].
         - [Decision 2]: [Integration detail with existing system].
         - [Decision 3]: [Performance-critical optimization].

Para 3 (optional): Deployment experience — [If applicable, brief deployment notes].
```

**Guidance**:
- Levin & Redell: "Does the paper describe something that has actually been implemented, or is it merely a proposal? Are the lessons drawn from experience or from thought experiment?"
- Keep this section concise — reviewers care about design and evaluation, not engineering diaries

---

## S5 Evaluation Blueprint (3–4 pages)

### Para 1–2: Experimental Setup (~0.5 page)

```text
**Testbed**: [Hardware description — GPUs, CPUs, network, storage].
**Baselines**: [System A] ([citation]), [System B] ([citation]), [System C] ([citation]).
**Workloads**: [Workload 1 — description], [Workload 2 — description].
**Metrics**: [Primary metric] (higher is better), [Secondary metric].
**Configuration**: [Key parameter settings for all systems].
```

### Subsection: End-to-End Comparison (~1–1.5 pages)

**Per experiment block**:
```text
§5.X [Experiment Name]

Hypothesis: We expect [System Name] to [outperform/match] [baseline] on [metric]
because [design rationale linking back to §3].

[Results description with figure/table references].
Figure [N] shows [key finding]. [System Name] achieves [X]% improvement over [baseline]
on [workload] because [explanation linking to design].

Conclusion: [System Name] [outperforms/matches] [baseline] by [X]% on [metric],
confirming that [design choice from §3] is effective for [workload].
```

**Critical**: Irene Zhang's three-statement rule:
1. **Hypothesis** at subsection start
2. **Conclusion** at subsection end
3. **Caption** on the figure/table

### Subsection: Microbenchmarks / Ablation (~1–1.5 pages)

```text
§5.Y Ablation Study

To understand the contribution of each component, we disable them individually:
- [System Name] w/o [Component A]: [result] — [Component A] contributes [X]%.
- [System Name] w/o [Component B]: [result] — [Component B] contributes [Y]%.
- [System Name] w/o [Component C]: [result] — [Component C] contributes [Z]%.

Table [N] summarizes the ablation results. [Key takeaway about which components matter most].
```

### Subsection: Scalability (~0.5 page)

```text
§5.Z Scalability

Figure [N] shows [metric] as [scale dimension] increases from [min] to [max].
[System Name] scales [linearly/sub-linearly] because [reason].
At [max scale], [System Name] achieves [result], compared to [baseline] at [result].
```

**Best-Paper Examples**:
- **Sia (SOSP'23)**: Evaluation on 4 workload mixes × 3 cluster sizes, ablation of 3 components
- **Blox (EuroSys'24)**: 7 case studies each with dedicated evaluation subsection

---

## S6 Related Work Blueprint (1 page)

### Structure: Group by Methodology

```text
**[Category 1: e.g., Heuristic Schedulers].**
[System A] [citation] uses [approach] for [goal].
[System B] [citation] extends this with [technique].
Unlike these systems, [our system] [key difference].

**[Category 2: e.g., Learning-Based Schedulers].**
[System C] [citation] applies [ML technique] to [problem].
[System D] [citation] uses [approach] but requires [limitation].
[Our system] differs by [key distinction].

**[Category 3: e.g., Cluster Management].**
...
```

**Guidance**:
- Levin & Redell: "Are comparisons with previous work clear and explicit?"
- Never just list papers — always state how your work differs
- Irene Zhang: Use a comparison table when comparing 4+ systems

### Optional: Comparison Table

```text
| System | [Dim 1] | [Dim 2] | [Dim 3] | [Dim 4] |
|--------|---------|---------|---------|---------|
| [A]    | ✓       | ✗       | ✓       | ✗       |
| [B]    | ✗       | ✓       | ✗       | ✓       |
| Ours   | ✓       | ✓       | ✓       | ✓       |
```

---

## S7 Conclusion Blueprint (0.5 page)

### Structure: 3 Sentences + Optional Future Work

```text
Para 1 (3 sentences):
  S1: [Problem restated — what challenge this paper addressed].
  S2: [Solution — what [System Name] does and how].
  S3: [Key result — headline evaluation numbers].

Para 2 (optional, 2–3 sentences):
  [Future directions — what extensions or open problems remain].
```

**Guidance**:
- Irene Zhang: "summarize your paper in 3 sentences: hypothesis, solution, result"
- Do not introduce new information in the conclusion
- Keep it under half a page

---

## Best-Paper Structural Analysis

> **Note**: Best-paper information below is from public search results. Verify titles, authors, and years at each conference's official website before citing.

### OSDI/NSDI (USENIX Format)

| Year | Paper | Structural Pattern | Key Takeaway |
|------|-------|--------------------|--------------|
| 2025 | Basilisk (OSDI) | Formal verification | Theorem-proof structure in design section |
| 2024 | Anvil (OSDI) | Cluster management verification | Liveness property decomposition |
| 2024 | ChameleonAPI (OSDI) | ML systems | API customization pipeline as workflow |
| 2025 | NDD (NSDI) | Network verification | Decision diagram formalization |

### ASPLOS/SOSP (ACM Format)

| Year | Paper | Structural Pattern | Key Takeaway |
|------|-------|--------------------|--------------|
| 2025 | CXLfork (ASPLOS) | Hardware+systems | Hardware mechanism + software design dual sections |
| 2024 | Centauri (ASPLOS) | ML training scheduling | Overlap analysis → scheduler design |
| 2023 | TreeSLS (SOSP) | Persistent microkernel | NVM observations → tree-structured design |
| 2023 | Sia (SOSP) | GPU scheduling | 5 contributions + 3-phase design |

### Common Structural Traits in Best Papers

1. **Clear thesis in abstract sentence 3** — every best paper has a quotable thesis
2. **Numbered contributions with section maps** — reviewers can trace claims
3. **Architecture figure within first 3 pages** — visual anchor for the design
4. **Alternatives discussed for every major decision** — shows design maturity
5. **Ablation experiments present** — isolate each component's contribution

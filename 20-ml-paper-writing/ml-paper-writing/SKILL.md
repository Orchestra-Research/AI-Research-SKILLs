---
name: ml-paper-writing
description: Write and revise publication-ready ML/AI papers for NeurIPS, ICML, ICLR, ACL, AAAI, and COLM. Use when turning a research repository into a claim-driven paper, organizing methods and experiments, designing readable figures, verifying citations, or preparing a submission. For systems venues, use systems-paper-writing instead.
version: 1.3.0
author: Orchestra Research
license: MIT
tags: [Academic Writing, ML Research, Paper Architecture, Figures, Citations, LaTeX, ICLR, ICML, NeurIPS]
---

# ML Paper Writing

Write the paper around one scientific argument, not around the order in which
the code or experiments were built. Preserve uncertainty and evidence
boundaries while still producing concrete drafts.

## Non-negotiable rules

1. **Never invent citations.** Search for the paper, verify the metadata and
   attributed claim, and fetch BibTeX from an authoritative source. If a source
   cannot be verified, insert an explicit `[CITATION NEEDED]` placeholder and
   tell the researcher.
2. **Do not turn plans or diagnostics into results.** Distinguish planned
   protocols, configuration checks, smoke tests, development evidence, and
   claim-facing held-out results.
3. **Freeze the scientific object before writing around it.** Record the active
   method, dataset split, baselines, metrics, approximations, and unresolved
   decisions. Treat nearby legacy artifacts as historical unless provenance
   explicitly promotes them.
4. **Keep claims paired with evidence.** Every headline claim needs a figure,
   table, theorem, or analysis that can support or falsify it.
5. **Render what readers will see.** Compile after substantive LaTeX changes
   and inspect the actual pages, figures, captions, tables, and references.

## Load the required detailed guidance

The entrypoint is intentionally concise. Before acting, read the complete
reference that matches the task:

- **Paper story, section organization, or Figure 1:** read
  [paper-architecture.md](references/paper-architecture.md).
- **Adding or auditing citations:** read
  [citation-workflow.md](references/citation-workflow.md) before writing any
  BibTeX.
- **Starting, converting, or submitting a venue-formatted paper:** read the
  current venue section in [checklists.md](references/checklists.md) and the
  relevant instructions in [templates/README.md](templates/README.md).
- **Sentence-level revision:** read the relevant section of
  [writing-guide.md](references/writing-guide.md).
- **Simulating review or preparing rebuttal:** read
  [reviewer-guidelines.md](references/reviewer-guidelines.md).

Do not treat a link as optional when its trigger applies.

## Start with the paper contract

Before polishing prose, write a short contract:

```text
Research question:
Answer the paper aims to establish:
One-sentence contribution:
Why the community should care:
Evidence required for each claim:
Current evidence boundary:
Known approximations and limitations:
Target venue and page budget:
```

Obtain explicit researcher confirmation of the one-sentence contribution when
multiple scientific framings remain plausible. If the framing has already been
agreed and recorded, draft proactively and flag lesser uncertainty inside the
draft or handoff rather than reopening settled choices.

For a repository-backed paper, make a read-only first pass before relying on
filenames or historical summaries:

1. list tracked files and top-level directories;
2. read the active README, method contract, and experiment configuration;
3. locate result manifests, terminal receipts, plots, and draft documents;
4. locate existing `.bib` files and citation anchors;
5. record which artifacts are current, historical, incomplete, or invalidated.

Prefer versioned artifacts over terminal history. Do not execute experiments or
rewrite assets merely to understand the repository.

## Build a claim--evidence ledger

Create this table before deciding the paper structure:

| Claim | Why it matters | Required evidence | Current status | Paper home |
|---|---|---|---|---|
| Main result | Community-level consequence | Matched held-out comparison | complete / pending | Fig. 1 or main table |
| Mechanism | Why the method works | Controlled ablation | complete / pending | main experiments |
| Efficiency | Practical cost | Amortized wall time and memory | complete / pending | main or appendix |
| Scope | Where the guarantee applies | theorem and approximation audit | complete / pending | method + appendix |

Use the ledger to remove unsupported adjectives and to prevent a long benchmark
inventory from replacing an argument. See
[references/paper-architecture.md](references/paper-architecture.md) for a
detailed template and reviewer-question map.

## Organize the paper around reader questions

A strong default structure is:

1. **Introduction:** What is the problem, why do existing approaches miss it,
   what is the idea, and what evidence will support the answer?
2. **Method:** What distribution or algorithm is being proposed, why is it
   tractable, and what is exact versus approximate?
3. **Experiments:** Does it work, why does it work, when does it fail, and what
   does it cost?
4. **Related work:** Which assumptions and capabilities distinguish the method?
5. **Limitations and conclusion:** What was established, and what remains out
   of scope?

Do not reproduce the engineering chronology. Group experiments by research
question or claim, not by dataset. Put each figure near the paragraph that
states what the reader should learn from it.

## Design Figure 1 before polishing the abstract

Many readers inspect the title, abstract, Figure 1, and introduction before the
method. Make Figure 1 pass this ten-second test:

- What problem enters on the left?
- What is the one new idea in the middle?
- What useful behavior or output appears on the right?
- Which part is the authors' contribution?

Use a low-symbol visual grammar:

- Prefer 3--5 conceptual steps over a miniature derivation.
- Use plain-language labels before acronyms or state variables.
- Introduce at most one indispensable equation in an overview figure.
- Do not place notation in a box unless the notation is discussed in the
  caption or adjacent paragraph.
- Encode roles with a small, consistent color palette; also use shape, border,
  or labels so the figure survives grayscale and color-vision differences.
- Keep implementation details, tensor layouts, and full state diagrams in a
  later technical figure or the appendix.
- Write a self-contained caption that states the takeaway, not just the list of
  components.

For a complex method, use two levels: a low-symbol overview in Figure 1 and a
formal mechanism figure beside the relevant equations.

## Write the method in layers

Present the method in this order:

1. **Verbal contract:** one paragraph describing input, transformation, and
   output without notation.
2. **Core mathematical object:** one boxed distribution, objective, or update
   that defines the method.
3. **Mechanism:** the minimum equations needed to explain why the computation
   realizes that object.
4. **Guarantee and boundary:** state exactly what is proved, on what support,
   and under which assumptions.
5. **Implementation:** explain batching, caching, approximations, and complexity
   after the reader understands the algorithm.

Use one symbol for one concept and keep it stable. Define notation immediately
before use. Move repeated factor expansions, full derivations, proofs, edge
cases, and pseudocode to the appendix when the main text can point to a single
clear abstraction.

If the deployed system is approximate, separate four objects explicitly:

- the ideal target or scientific goal;
- the tractable model actually defined by the method;
- the retained support or engineering approximation;
- the empirical evaluator used to judge outputs.

Never use a theorem about the tractable model to imply that an external reward
or evaluator is exact.

## Write experiments as answers

For every experiment, include three sentences or their clear equivalents:

1. **Question:** what claim or alternative explanation does this test?
2. **Observation:** what happened, with uncertainty and matched controls?
3. **Support:** what does the observation support, and what does it not support?

Include:

- data, split, model, prompt, budget, seed, and tuning protocol;
- strongest eligible matched baselines;
- independent task metrics rather than only the training scorer;
- quality--control or accuracy--cost tradeoffs where optimizing one metric can
  degrade another;
- uncertainty, failures, and the selection rule for a final operating point;
- wall-clock and resource accounting when efficiency is claimed.

Use validation data for model or hyperparameter selection and open the test set
only after freezing the decision rule. Label single-seed, stress-panel, and
development results accordingly.

## Decide what belongs in the appendix

Keep a fact in the main paper if a reviewer needs it to understand or trust the
headline claim. Move it to the appendix if it supports reproduction or formal
completeness without changing the first-pass argument.

Usually keep in the main text:

- the core method law and one intuitive explanation;
- the exactness or approximation boundary;
- decisive comparisons and ablations;
- the most important failure or limitation;
- the principal quality--control--compute result.

Usually move to the appendix:

- full derivations and proofs;
- complete hyperparameter grids and prompts;
- dataset preprocessing and asset manifests;
- extended baseline details, extra seeds, and qualitative cases;
- implementation pseudocode and low-level optimization details.

Do not use the appendix to hide assumptions required for the main claim.

## Draft each section

### Abstract

Use five functions, not necessarily five literal sentences:

1. specific problem and importance;
2. concrete approach;
3. main technical distinction;
4. evidence and comparison surface;
5. strongest verified result or a clearly labeled pending evidence boundary.

Avoid generic field-level openings and claims not supported by frozen evidence.

### Introduction

Reach the method by page 2--3. Define the gap, state the one-sentence answer,
preview the mechanism, and list 2--4 contributions. Each contribution should
name both an artifact and the evidence that validates it.

### Related work

Organize by assumptions, inference mechanisms, or capabilities. Compare groups
of methods before listing individual papers. Cite generously but attribute only
claims verified in the cited source.

### Limitations and conclusion

State the support, model, data, and evaluation limits directly. The conclusion
should answer the research question using only claim-facing evidence; leave it
appropriately provisional while results remain incomplete.

## Verify citations

Read [references/citation-workflow.md](references/citation-workflow.md) in full
before adding citations. The required operational path is:

For each reference:

1. search an authoritative index or publisher;
2. confirm title, authors, year, and venue in at least one primary record;
3. inspect the source to verify the attributed claim;
4. fetch BibTeX through DOI, arXiv, publisher, or another authoritative record;
5. mark unresolved items explicitly.

Never fabricate plausible metadata. Follow
[references/citation-workflow.md](references/citation-workflow.md) for API and
BibTeX procedures.

If programmatic retrieval or claim verification fails, leave an explicit
placeholder and list it in the handoff. Do not convert an uncertain search
result into a manual BibTeX entry.

## Freeze venue and template before layout work

Choose the target venue and verify its current official author guide before
outlining to a page budget. Read [checklists.md](references/checklists.md) and
[templates/README.md](templates/README.md), then:

1. copy the complete official template rather than only its main file;
2. compile the untouched template once;
3. keep content separate from conference style files;
4. migrate section content, figures, and bibliography rather than merging
   preambles when changing venues;
5. never edit a conference `.sty` file to make the paper fit.

Venue rules, page limits, checklists, anonymity requirements, and disclosure
policies change. Treat bundled templates as starting points and official venue
pages as the current authority.

## Compile and inspect

After every substantive revision:

1. compile with the official venue template;
2. inspect warnings for missing references, overfull boxes, and font issues;
3. render pages and visually inspect Figure 1, equations, tables, captions,
   whitespace, and page breaks;
4. check grayscale and colorblind legibility for figures;
5. record remaining placeholders and evidence gaps.

Compilation success is not visual acceptance. Do not edit conference style
files to make content fit.

## Handoff checklist

- [ ] One-sentence contribution is explicit and stable.
- [ ] Claim--evidence ledger is current.
- [ ] Active method and experiment provenance are recorded.
- [ ] Figure 1 passes the ten-second test with a low symbol count.
- [ ] Main method distinguishes ideal target, tractable object, approximation,
      and evaluator.
- [ ] Every main experiment answers a named question.
- [ ] Plans, diagnostics, validation results, and held-out evidence are labeled.
- [ ] Citations and attributed claims are verified.
- [ ] Official template compiles without unresolved references.
- [ ] Rendered pages were visually inspected.
- [ ] Remaining evidence and writing gaps are listed for the researcher.

## References and templates

- [paper-architecture.md](references/paper-architecture.md): claim--evidence
  design, reader-first method structure, figure symbol budget, and appendix map.
- [writing-guide.md](references/writing-guide.md): sentence-level clarity and
  writing examples.
- [citation-workflow.md](references/citation-workflow.md): citation and BibTeX
  verification.
- [checklists.md](references/checklists.md): venue checklists and submission
  requirements.
- [reviewer-guidelines.md](references/reviewer-guidelines.md): reviewer criteria
  and rebuttal guidance.
- [sources.md](references/sources.md): sources behind this skill.
- [templates/README.md](templates/README.md): bundled venue templates and build
  instructions.

Conference policies and page limits change. Verify the current official author
guide before submission. This skill originated in the open-source Orchestra
Research AI Research Skills library.

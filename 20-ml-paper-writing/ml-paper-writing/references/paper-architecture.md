# Claim-driven paper architecture

Use this reference when a paper has accumulated many methods, experiments, or
historical implementations and the main story is becoming difficult to follow.

## 1. Freeze the active scientific object

Write a one-page active capsule before drafting:

| Field | Required content |
|---|---|
| Research question | One falsifiable question |
| Intended answer | One sentence the paper aims to establish |
| Active method | Mathematical object and algorithm, not a branch nickname |
| Evidence boundary | Which results are held-out, development-only, diagnostic, or planned |
| Baselines | Eligibility and matching rules |
| Approximations | Search, truncation, relaxation, temperature, or estimator choices |
| Open decisions | Items that can still change |

This capsule is an author-internal reasoning aid.  Do not copy local paths,
worktree names, branch names, temporary run identifiers, or version-control
hashes into the manuscript.  A paper should state the scientific method and
reproducibility fields; public release identifiers belong in the artifact
documentation when they become stable.

Keep historical variants outside the default writing path. Consult them only
to motivate an ablation or explain provenance; do not let nearby filenames
silently redefine the current method.

## 2. Turn claims into a paper skeleton

For each proposed claim, fill in:

```text
Claim:
Alternative explanation or reviewer attack:
Decisive evidence:
Metric and independent evaluator:
Matched controls:
Failure condition:
Main-text figure or table:
Appendix support:
Evidence status:
```

Then order the paper by logical dependency:

1. the reader understands the problem;
2. the reader sees the proposed answer;
3. the method defines that answer precisely;
4. experiments test its value and mechanism;
5. limitations state the remaining boundary.

Do not order sections by implementation date or benchmark name.

## 3. Separate four objects that papers often conflate

### Scientific target

The behavior the community actually wants, such as semantic correctness,
safety, or physical validity.

### Tractable method object

The distribution, objective, controller, surrogate, or finite computation the
method defines exactly.

### Deployed approximation

The retained candidates, beams, particles, finite precision, local
temperatures, or other choices used to make the computation practical.

### Evaluator

The independent measurement used to judge whether generated outputs achieve
the scientific target.

A proof about the tractable object does not validate the scientific target. A
high internal scorer value does not replace independent evaluation. A runtime
receipt does not establish a scientific improvement.

## 4. Reader-first method writing

Use a two-level presentation.

### Main text

1. Describe input, operation, and output in plain language.
2. Give one core mathematical law.
3. Explain the mechanism with the fewest equations needed for causal
   understanding.
4. State the guarantee and approximation boundary next to the law.
5. Explain practical computation after the algorithm is clear.

### Appendix

Put full factor expansions, derivations, proofs, edge cases, pseudocode,
complexity details, and implementation contracts here. Cross-reference them at
the exact point where a careful reader may want more detail.

An equation belongs in the main paper only if removing it would prevent a
reviewer from understanding what is new or what is guaranteed.

## 5. Figure 1 design

Figure 1 should communicate one idea, not prove the paper.

### Ten-second questions

- What goes in?
- What is new?
- What comes out?
- Why is the output better or different?

### Symbol budget

- Use zero equations if plain-language labels suffice.
- If an equation is essential, show one law and define its factors visually.
- Use at most one new symbol family per panel.
- Avoid internal variable names, tensor shapes, acronyms, and implementation
  switches.
- Reserve formal state diagrams and recurrence arrows for a later figure.

### Visual grammar

- Give each semantic role one color and keep it stable across the paper.
- Use borders, shapes, or labels as redundant encodings.
- Draw a left-to-right causal path with no more than five major stages.
- Use short verb phrases: “propose tokens,” “score complete sequences,” “look
  ahead,” “sample one path.”
- Use whitespace to separate optional inputs from the central contribution.
- Write a caption that states the mechanism and takeaway.

### Two-figure pattern for technical methods

- **Figure 1:** problem, idea, and outcome in plain language.
- **Mechanism figure:** formal states, messages, sampling path, and exactness
  boundary beside the method equations.

## 6. Main figure and table map

Assign each visual a reviewer question:

| Visual | Reviewer question |
|---|---|
| Figure 1 | What is the idea and why should I care? |
| Main result | Does it improve the intended tradeoff? |
| Mechanism ablation | Is the claimed component causally responsible? |
| Representation analysis | Does the learned surrogate represent the target? |
| Efficiency figure | What does the capability cost after amortization? |
| Qualitative study | When and how does behavior change? |

If two visuals answer the same question, combine them or move one to the
appendix. If a claim has no visual or theorem, either add evidence or weaken the
claim.

## 7. Working with incomplete results

Write planned work as protocol, not as observed fact:

- “We will compare…” is a protocol.
- “The experiment tests whether…” is a purpose.
- “A development diagnostic suggests…” is bounded evidence.
- “The method improves…” requires the declared held-out comparison.

Keep the conclusion provisional until claim-facing results are frozen. It is
acceptable to leave calibrated evidence slots; it is not acceptable to fill
them with nearby historical numbers of uncertain provenance.

## 8. Final architecture audit

Read only the title, abstract, section headings, Figure 1, main captions, and
conclusion. Verify that they tell the same story. Then inspect every claim and
ask:

1. Is the subject the active method rather than a legacy variant?
2. Does the cited evidence have the right split, controls, and evaluator?
3. Is exactness scoped to the object actually computed?
4. Is a quality cost or failure mode hidden by an aggregate metric?
5. Does the appendix preserve enough detail to reproduce the claim?

Only after this architecture is stable should sentence-level polishing become
the main activity.

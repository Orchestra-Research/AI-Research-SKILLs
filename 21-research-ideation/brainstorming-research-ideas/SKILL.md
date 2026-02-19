---
name: brainstorming-research-ideas
description: Guides researchers through structured ideation frameworks to discover high-impact research directions. Use when exploring new problem spaces, pivoting between projects, or seeking novel angles on existing work.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Research Ideation, Brainstorming, Problem Discovery, Creative Thinking, Research Strategy]
dependencies: []
---

# Research Idea Brainstorming

Structured frameworks for discovering the next research idea. This skill provides ten complementary ideation lenses that help researchers move from vague curiosity to concrete, defensible research proposals. Each framework targets a different cognitive mode—use them individually or combine them for comprehensive exploration.

## When to Use This Skill

- Starting a new research direction and need structured exploration
- Feeling stuck on a current project and want fresh angles
- Evaluating whether a half-formed idea has real potential
- Preparing for a brainstorming session with collaborators
- Transitioning between research areas and seeking high-leverage entry points
- Reviewing a field and looking for underexplored gaps

**Do NOT use this skill when**:
- You already have a well-defined research question and need execution guidance
- You need help with experimental design or methodology (use domain-specific skills)
- You want a literature review (use `scientific-skills:literature-review`)

---

## Core Ideation Frameworks

### 1. Problem-First vs. Solution-First Thinking

Research ideas originate from two distinct modes. Knowing which mode you are in prevents a common failure: building solutions that lack real problems, or chasing problems without feasible approaches.

**Problem-First** (pain point → method):
- Start with a concrete failure, bottleneck, or unmet need
- Naturally yields impactful work because the motivation is intrinsic
- Risk: may converge on incremental fixes rather than paradigm shifts

**Solution-First** (new capability → application):
- Start with a new tool, insight, or technique seeking application
- Often drives breakthroughs by unlocking previously impossible approaches
- Risk: "hammer looking for a nail"—solution may lack genuine demand

**Workflow**:
1. Write down your idea in one sentence
2. Classify it: Is this problem-first or solution-first?
3. If problem-first → verify the problem matters (who suffers? how much?)
4. If solution-first → identify at least two genuine problems it addresses
5. For either mode, articulate the gap: what cannot be done today that this enables?

**Self-Check**:
- [ ] Can I name a specific person or community who needs this?
- [ ] Is the problem I am solving actually unsolved (not just under-marketed)?
- [ ] If solution-first, does the solution create new capability or just replicate existing ones?

---

### 2. The Abstraction Ladder

Every research problem sits at a particular level of abstraction. Deliberately moving up or down the ladder reveals ideas invisible at your current level.

| Direction | Action | Outcome |
|-----------|--------|---------|
| **Move Up** (generalize) | Turn a specific result into a broader principle | Framework papers, theoretical contributions |
| **Move Down** (instantiate) | Test a general paradigm under concrete constraints | Empirical papers, surprising failure analyses |
| **Move Sideways** (analogize) | Apply same abstraction level to adjacent domain | Cross-pollination, transfer papers |

**Workflow**:
1. State your current research focus in one sentence
2. Move UP: What is the general principle behind this? What class of problems does this belong to?
3. Move DOWN: What is the most specific, constrained instance of this? What happens at the extreme?
4. Move SIDEWAYS: Where else does this pattern appear in a different field?
5. For each new level, ask: Is this a publishable contribution on its own?

**Example**:
- **Current**: "Improving retrieval accuracy for RAG systems"
- **Up**: "What makes context selection effective for any augmented generation system?"
- **Down**: "How does retrieval accuracy degrade when documents are adversarially perturbed?"
- **Sideways**: "Database query optimization uses similar relevance ranking—what can we borrow?"

---

### 3. Tension and Contradiction Hunting

Breakthroughs often come from resolving tensions between widely accepted but seemingly conflicting goals. These contradictions are not bugs—they are the research opportunity.

**Common Research Tensions**:

| Tension Pair | Research Opportunity |
|-------------|---------------------|
| Performance ↔ Efficiency | Can we match SOTA with 10x less compute? |
| Privacy ↔ Utility | Can federated/encrypted methods close the accuracy gap? |
| Generality ↔ Specialization | When does fine-tuning beat prompting, and why? |
| Safety ↔ Capability | Can alignment improve rather than tax capability? |
| Interpretability ↔ Performance | Do mechanistic insights enable better architectures? |
| Scale ↔ Accessibility | Can small models replicate emergent behaviors? |

**Workflow**:
1. Pick your research area
2. List the top 3-5 desiderata (things everyone wants)
3. Identify pairs that are commonly treated as trade-offs
4. For each pair, ask: Is this trade-off fundamental or an artifact of current methods?
5. If artifact → the reconciliation IS your research contribution
6. If fundamental → characterizing the Pareto frontier is itself valuable

**Self-Check**:
- [ ] Have I confirmed this tension is real (not just assumed)?
- [ ] Can I point to papers that optimize for each side independently?
- [ ] Is my proposed reconciliation technically plausible, not just aspirational?

---

### 4. Cross-Pollination (Analogy Transfer)

Borrowing structural ideas from other disciplines is one of the most generative research heuristics. Many foundational techniques emerged this way—attention mechanisms draw from cognitive science, genetic algorithms from biology, adversarial training from game theory.

**Requirements for a Valid Analogy**:
- **Structural fidelity**: The mapping must hold at the level of underlying mechanisms, not just surface similarity
- **Non-obvious connection**: If the link is well-known, the novelty is gone
- **Testable predictions**: The analogy should generate concrete hypotheses

**High-Yield Source Fields for ML Research**:

| Source Field | Transferable Concepts |
|-------------|----------------------|
| Neuroscience | Attention, memory consolidation, hierarchical processing |
| Physics | Energy-based models, phase transitions, renormalization |
| Economics | Mechanism design, auction theory, incentive alignment |
| Ecology | Population dynamics, niche competition, co-evolution |
| Linguistics | Compositionality, pragmatics, grammatical induction |
| Control Theory | Feedback loops, stability, adaptive regulation |

**Workflow**:
1. Describe your problem in domain-agnostic language (strip the jargon)
2. Ask: What other field solves a structurally similar problem?
3. Study that field's solution at the mechanism level
4. Map the solution back to your domain, preserving structural relationships
5. Generate testable predictions from the analogy
6. Validate: Does the borrowed idea actually improve outcomes?

---

### 5. The "What Changed?" Principle

Strong ideas often come from revisiting old problems under new conditions. Advances in hardware, scale, data availability, or regulations can invalidate prior assumptions and make previously impractical approaches viable.

**Categories of Change to Monitor**:

| Change Type | Example | Research Implication |
|------------|---------|---------------------|
| **Compute** | GPUs 10x faster | Methods dismissed as too expensive become feasible |
| **Scale** | Trillion-token datasets | Statistical arguments that failed at small scale may now hold |
| **Regulation** | EU AI Act, GDPR | Creates demand for compliant alternatives |
| **Tooling** | New frameworks, APIs | Reduces implementation barrier for complex methods |
| **Failure** | High-profile system failures | Exposes gaps in existing approaches |
| **Cultural** | New user behaviors | Shifts what problems matter most |

**Workflow**:
1. Pick a well-known negative result or abandoned approach (3-10 years old)
2. List the assumptions that led to its rejection
3. For each assumption, ask: Is this still true today?
4. If any assumption has been invalidated → re-run the idea under new conditions
5. Frame the contribution: "X was previously impractical because Y, but Z has changed"

---

### 6. Failure Analysis and Boundary Probing

Understanding where a method breaks is often as valuable as showing where it works. Boundary probing systematically exposes the conditions under which accepted techniques fail.

**Types of Boundaries to Probe**:
- **Distributional**: What happens with out-of-distribution inputs?
- **Scale**: Does the method degrade at 10x or 0.1x the typical scale?
- **Adversarial**: Can the method be deliberately broken?
- **Compositional**: Does performance hold when combining multiple capabilities?
- **Temporal**: Does the method degrade over time (concept drift)?

**Workflow**:
1. Select a widely-used method with strong reported results
2. Identify the implicit assumptions in its evaluation (dataset, scale, domain)
3. Systematically violate each assumption
4. Document where and how the method breaks
5. Diagnose the root cause of each failure
6. Propose a fix or explain why the failure is fundamental

**Self-Check**:
- [ ] Am I probing genuine boundaries, not just confirming known limitations?
- [ ] Can I explain WHY the method fails, not just THAT it fails?
- [ ] Does my analysis suggest a constructive path forward?

---

### 7. The Simplicity Test

Before accepting complexity, ask whether a simpler approach suffices. Fields sometimes over-index on elaborate solutions when a streamlined baseline performs competitively.

**Warning Signs of Unnecessary Complexity**:
- The method has many hyperparameters with narrow optimal ranges
- Ablations show most components contribute marginally
- A simple baseline was never properly tuned or evaluated
- The improvement over baselines is within noise on most benchmarks

**Workflow**:
1. Identify the current SOTA method for your problem
2. Strip it to its simplest possible core (what is the one key idea?)
3. Build that minimal version with careful engineering
4. Compare fairly: same compute budget, same tuning effort
5. If the gap is small → the contribution is the simplicity itself
6. If the gap is large → you now understand what the complexity buys

**Contribution Framing**:
- "We show that [simple method] with [one modification] matches [complex SOTA]"
- "We identify [specific component] as the critical driver, not [other components]"

---

### 8. Stakeholder Rotation

Viewing a system from multiple perspectives reveals distinct classes of research questions. Each stakeholder sees different friction, risk, and opportunity.

**Stakeholder Perspectives**:

| Stakeholder | Key Questions |
|-------------|---------------|
| **End User** | Is this usable? What errors are unacceptable? What is the latency tolerance? |
| **Developer** | Is this debuggable? What is the maintenance burden? How does it compose? |
| **Theorist** | Why does this work? What are the formal guarantees? Where are the gaps? |
| **Adversary** | How can this be exploited? What are the attack surfaces? |
| **Ethicist** | Who is harmed? What biases are embedded? Who is excluded? |
| **Regulator** | Is this auditable? Can decisions be explained? Is there accountability? |
| **Operator** | What is the cost? How does it scale? What is the failure mode? |

**Workflow**:
1. Describe your system or method in one paragraph
2. Assume each stakeholder perspective in turn (spend 5 minutes per role)
3. For each perspective, list the top 3 concerns or questions
4. Identify which concerns are unaddressed by existing work
5. The unaddressed concern with the broadest impact is your research question

---

### 9. Composition and Decomposition

Novelty often emerges from recombination or modularization. Innovation frequently lies not in new primitives, but in how components are arranged or separated.

**Composition** (combining existing techniques):
- Identify two methods that solve complementary subproblems
- Ask: What emergent capability arises from combining them?
- Example: RAG + Chain-of-Thought → retrieval-augmented reasoning

**Decomposition** (breaking apart monolithic systems):
- Identify a complex system with entangled components
- Ask: Which component is the actual bottleneck?
- Example: Decomposing "fine-tuning" into data selection, optimization, and regularization reveals that data selection often matters most

**Workflow**:
1. List the 5-10 key components or techniques in your area
2. **Compose**: Pick pairs and ask what happens when you combine them
3. **Decompose**: Pick a complex method and isolate each component's contribution
4. For compositions: Does the combination create emergent capabilities?
5. For decompositions: Does isolation reveal a dominant or redundant component?

---

### 10. The "Explain It to Someone" Test

A strong research idea should be defensible in two sentences to a smart non-expert. This test enforces clarity of purpose and sharpens the value proposition.

**The Two-Sentence Template**:
> **Sentence 1** (Problem): "[Domain] currently struggles with [specific problem], which matters because [concrete consequence]."
> **Sentence 2** (Insight): "We [approach] by [key mechanism], which works because [reason]."

**If You Cannot Fill This Template**:
- The problem may not be well-defined yet → return to Framework 1
- The insight may not be clear yet → return to Framework 7 (simplify)
- The significance may not be established → return to Framework 3 (find the tension)

**Calibration Questions**:
- Would a smart colleague outside your subfield understand why this matters?
- Does the explanation stand without jargon?
- Can you predict what a skeptic's first objection would be?

---

## Integrated Brainstorming Workflow

Use this end-to-end workflow to go from blank page to ranked research ideas.

### Phase 1: Diverge (Generate Candidates)

**Goal**: Produce 10-20 candidate ideas without filtering.

1. **Scan for tensions** (Framework 3): List 5 trade-offs in your field
2. **Check what changed** (Framework 5): List 3 recent shifts (compute, data, regulation)
3. **Probe boundaries** (Framework 6): Pick 2 popular methods and find where they break
4. **Cross-pollinate** (Framework 4): Pick 1 idea from an adjacent field
5. **Compose/decompose** (Framework 9): Combine 2 existing techniques or split 1 apart
6. **Climb the abstraction ladder** (Framework 2): For each candidate, generate up/down/sideways variants

### Phase 2: Converge (Filter and Rank)

**Goal**: Narrow to 3-5 strongest ideas.

Apply these filters to each candidate:

| Filter | Question | Kill Criterion |
|--------|----------|----------------|
| **Explain-It Test** (F10) | Can I state this in two sentences? | If no → idea is not yet clear |
| **Problem-First Check** (F1) | Is the problem genuine and important? | If no one suffers from this → drop it |
| **Simplicity Test** (F7) | Is the complexity justified? | If a simpler approach works → simplify or drop |
| **Stakeholder Check** (F8) | Who benefits? Who might object? | If no clear beneficiary → drop it |
| **Feasibility** | Can I execute this with available resources? | If clearly infeasible → park it for later |

### Phase 3: Refine (Sharpen the Winner)

**Goal**: Turn the top idea into a concrete research plan.

1. Write the two-sentence pitch (Framework 10)
2. Identify the core tension being resolved (Framework 3)
3. Specify the abstraction level (Framework 2)
4. List 3 concrete experiments that would validate the idea
5. Anticipate the strongest objection and prepare a response
6. Define a 2-week pilot that would provide signal on feasibility

**Completion Checklist**:
- [ ] Two-sentence pitch is clear and compelling
- [ ] Problem is genuine (problem-first check passed)
- [ ] Approach is justified (simplicity test passed)
- [ ] At least one stakeholder clearly benefits
- [ ] Core experiments are specified
- [ ] Feasibility pilot is defined
- [ ] Strongest objection has a response

---

## Framework Selection Guide

Not sure which framework to start with? Use this decision guide:

| Your Situation | Start With |
|---------------|------------|
| "I don't know what area to work in" | Tension Hunting (F3) → What Changed (F5) |
| "I have a vague area but no specific idea" | Abstraction Ladder (F2) → Failure Analysis (F6) |
| "I have an idea but I'm not sure it's good" | Explain-It Test (F10) → Simplicity Test (F7) |
| "I have a good idea but need a fresh angle" | Cross-Pollination (F4) → Stakeholder Rotation (F8) |
| "I want to combine existing work into something new" | Composition/Decomposition (F9) |
| "I found a cool technique and want to apply it" | Problem-First Check (F1) → Stakeholder Rotation (F8) |
| "I want to challenge conventional wisdom" | Failure Analysis (F6) → Simplicity Test (F7) |

---

## Common Pitfalls in Research Ideation

| Pitfall | Symptom | Fix |
|---------|---------|-----|
| **Novelty without impact** | "No one has done X" but no one needs X | Apply Problem-First Check (F1) |
| **Incremental by default** | Idea is +2% on a benchmark | Climb the Abstraction Ladder (F2) |
| **Complexity worship** | Method has 8 components, each helping marginally | Apply Simplicity Test (F7) |
| **Echo chamber** | All ideas come from reading the same 10 papers | Use Cross-Pollination (F4) |
| **Stale assumptions** | "This was tried and didn't work" (5 years ago) | Apply What Changed (F5) |
| **Single-perspective bias** | Only considering the ML engineer's view | Use Stakeholder Rotation (F8) |
| **Premature convergence** | Committed to first idea without exploring alternatives | Run full Diverge phase |

---

## Usage Instructions for Agents

When a researcher asks for help brainstorming research ideas:

1. **Identify their starting point**: Are they exploring a new area, stuck on a current project, or evaluating an existing idea?
2. **Select appropriate frameworks**: Use the Framework Selection Guide to pick 2-3 relevant lenses
3. **Walk through frameworks interactively**: Apply each framework step-by-step, asking the researcher for domain-specific inputs
4. **Generate candidates**: Aim for 10-20 raw ideas across frameworks
5. **Filter and rank**: Apply the Converge phase filters to narrow to top 3-5
6. **Refine the winner**: Help articulate the two-sentence pitch and define concrete next steps

**Key Principles**:
- Push for specificity—vague ideas ("improve efficiency") are not actionable
- Challenge assumptions—ask "why?" at least three times
- Maintain a written list of all candidates, even rejected ones (they may recombine later)
- The researcher makes the final call on which ideas to pursue; the agent facilitates structured thinking

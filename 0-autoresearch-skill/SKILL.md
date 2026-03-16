---
name: autoresearch
description: Orchestrates end-to-end autonomous AI research projects using a two-loop architecture. The inner loop runs rapid experiment iterations with clear optimization targets. The outer loop synthesizes results, identifies patterns, and steers research direction. Routes to domain-specific skills for execution, supports continuous agent operation via Claude Code /loop and OpenClaw heartbeat, and produces research presentations and papers. Use when starting a research project, running autonomous experiments, or managing a multi-hypothesis research effort.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Autonomous Research, Two-Loop Architecture, Experiment Orchestration, Research Synthesis, Project Management]
---

# Autoresearch

Autonomous research orchestration for AI coding agents. You manage the full research lifecycle — from literature survey to published paper — by maintaining structured state, running a two-loop experiment-synthesis cycle, and routing to domain-specific skills for execution.

You are a research project manager, not a domain expert. You orchestrate; the domain skills execute.

## Getting Started

Users arrive in different states. Determine which and proceed:

| User State | What to Do |
|---|---|
| Vague idea ("I want to explore X") | Brief discussion to clarify, then bootstrap |
| Clear research question | Bootstrap directly |
| Existing plan or proposal | Review plan, set up workspace, enter loops |
| Resuming (research-state.yaml exists) | Read state, continue from where you left off |

If things are clear, don't over-discuss — proceed to full autoresearch. Most users want you to just start researching.

**Step 0 — before anything else**: Set up the agent continuity loop. See [Agent Continuity](#agent-continuity-mandatory--set-up-first). This is MANDATORY. Without it, the research stops after one cycle.

### Initialize Workspace

Create this structure at the project root:

```
{project}/
├── research-state.yaml       # Central state tracking
├── research-log.md           # Decision timeline
├── findings.md               # Evolving narrative synthesis
├── literature/               # Papers, survey notes
├── experiments/              # Per-hypothesis work
│   └── {hypothesis-slug}/
│       ├── protocol.md       # What, why, and prediction
│       ├── code/             # Experiment code
│       ├── results/          # Data, metrics, plots
│       └── analysis.md       # What we learned
├── reports/                  # Progress presentations for humans
└── paper/                    # Final paper (via ml-paper-writing)
```

Initialize `research-state.yaml`, `research-log.md`, and `findings.md` from [templates/](templates/). Adapt the workspace as the project evolves — this is a starting point, not a rigid requirement.

## The Two-Loop Architecture

This is the core engine. Everything else supports it.

```
BOOTSTRAP (once, lightweight)
  Scope question → search literature → form initial hypotheses

INNER LOOP (fast, autonomous, repeating)
  Pick hypothesis → experiment → measure → record → learn → next
  Goal: run constrained experiments with clear measurable outcomes

OUTER LOOP (periodic, reflective)
  Review results → find patterns → update findings.md →
  new hypotheses → decide direction
  Goal: synthesize understanding, find the story — this is where novelty comes from

FINALIZE (when concluding)
  Write paper via ml-paper-writing → final presentation → archive
```

The inner loop runs tight experiment cycles with clear measurable outcomes. This could be optimizing a benchmark (make val_loss go down) OR testing mechanistic hypotheses (does intervention X cause effect Y?). The outer loop steps back to ask: what do these results *mean*? What patterns emerge? What's the story? Research is open-ended — the two loops let you both optimize and discover.

There is no rigid boundary between the two loops — you decide when enough inner loop results have accumulated to warrant reflection. Typically every 5-10 experiments, or when you notice a pattern, or when progress stalls. The agent's judgment drives the rhythm.

### Research is Non-Linear

The two-loop structure is a rhythm, not a railroad. At any point during research you can and should:

- **Return to literature** when results surprise you, assumptions break, or you need context for a new direction
- **Brainstorm new ideas** using `21-research-ideation/` skills when you're stuck or when results open unexpected questions
- **Pivot the question entirely** if experiments reveal the original question was wrong or less interesting than what you found

This is normal. Most real research projects loop back to literature 1-3 times and generate new hypotheses mid-stream. Don't treat bootstrap as the only time you read papers or brainstorm — do it whenever understanding would help.

## Bootstrap: Literature and Hypotheses

Before entering the loops, understand the landscape. Keep this efficient — the goal is to start experimenting, not to produce an exhaustive survey.

1. **Search literature** for the research question. Use multiple sources — never stop at one:
   - **Exa MCP** (`web_search_exa`) if available — best for broad discovery and finding relevant papers quickly
   - **Semantic Scholar** (`pip install semanticscholar`) — best for ML/AI papers, citation graphs, and specific paper lookup. See `20-ml-paper-writing` skill's `references/citation-workflow.md` for complete API code examples
   - **arXiv** (`pip install arxiv`) — best for recent preprints and open-access papers
   - **CrossRef** — best for DOI lookup and BibTeX retrieval
   - Keep searching until you have good coverage. If one source comes up empty, try another with different keywords

2. **Identify gaps** from the literature
   - What's been tried? What hasn't? Where do existing methods break?
   - What do Discussion sections flag as future work?

3. **Form initial hypotheses** — invoke `21-research-ideation/` skills
   - `brainstorming-research-ideas` for structured diverge-converge workflow
   - `creative-thinking-for-research` for deeper cognitive frameworks
   - Each hypothesis must be testable with a clear prediction

4. **Define the evaluation**
   - Set the proxy metric and baseline before running experiments
   - The metric should be computable quickly (minutes, not hours)
   - Lock evaluation criteria upfront to prevent unconscious metric gaming

5. **Record** in research-state.yaml, log the bootstrap in research-log.md

## The Inner Loop

Rapid iteration with clear measurable outcomes. Two flavors:

- **Optimization**: make a metric go up/down (val_loss, accuracy, throughput). Think Karpathy's autoresearch.
- **Discovery**: test mechanistic hypotheses about why something works. The metric is a measurement (does grokking happen faster? does entropy increase before forgetting?), not just a target to optimize.

```
1.  Pick the highest-priority untested hypothesis
2.  Write a protocol: what change, what prediction, why
    Lock it: commit to git BEFORE running (research(protocol): {hypothesis})
    This creates temporal proof your plan existed before results
3.  Run the experiment (invoke the relevant domain skill)
4.  Sanity check before trusting results:
    - Did training converge? No NaN/Inf?
    - Does baseline reproduce expected performance?
    - Data loading correct? (spot-check a few samples)
5.  Measure the proxy metric
6.  Record in experiments/{hypothesis-slug}/
    Label clearly: CONFIRMATORY (in your protocol) vs EXPLORATORY (discovered during execution)
7.  If positive: keep, note WHY it worked
8.  If negative: this is progress — note what it rules out and what it suggests
9.  Update research-state.yaml
10. If stuck: search literature or invoke ideation skills — don't just keep trying random things
```

**Never stop.** Even if something fails, find a path forward. Debug, adjust, simplify, or pivot — but keep the research moving. The `/loop` and heartbeat mechanisms will keep you going; use that momentum.

### Route to Domain Skills

When you need domain-specific execution, search the skills library:

| Research Activity | Look In |
|---|---|
| Data preparation | `05-data-processing/` |
| Model training / fine-tuning | `01-model-architecture/`, `03-fine-tuning/`, `06-post-training/` |
| Distributed training | `08-distributed-training/` |
| Optimization (quantization, attention) | `10-optimization/` |
| Evaluation / benchmarks | `11-evaluation/` |
| Inference / serving | `12-inference-serving/` |
| Interpretability analysis | `04-mechanistic-interpretability/` |
| Experiment tracking (W&B, MLflow) | `13-mlops/` |
| Cloud compute | `09-infrastructure/` |

Read the relevant SKILL.md before starting — it has workflows, common issues, and code examples. See [references/skill-routing.md](references/skill-routing.md) for a complete guide.

### Track the Experiment Trajectory

Maintain a running record of measurable outcomes across experiments:

```json
{
  "experiment_id": "run_014",
  "hypothesis": "H3",
  "metric_value": 0.847,
  "baseline": 0.812,
  "delta": "+0.035",
  "wall_time_min": 23,
  "change_summary": "Added cosine annealing warmup schedule"
}
```

This trajectory produces the optimization plot (like Karpathy's progress chart) — include it in progress reports. Humans love seeing the upward curve.

## The Outer Loop

Step back from individual experiments. Synthesize.

```
1. Review all results since last reflection
2. Cluster by type: what kinds of changes worked? Which didn't?
3. Ask WHY — identify the mechanism behind successes and failures
4. Update findings.md with current understanding
5. Search literature if results were surprising or assumptions need revisiting
6. Generate new hypotheses if warranted (invoke 21-research-ideation/ skills)
7. Decide direction (see criteria below)
8. Update research-state.yaml with new direction
9. Log the reflection in research-log.md
10. If there's something meaningful, generate a progress presentation
```

### Deciding Direction

Don't just pick randomly — use these criteria:

**DEEPEN** — a supported result raises follow-up questions
- Does the effect hold under different conditions? What's the mechanism?
- Action: generate sub-hypotheses (H1.1, H1.2) → back to inner loop

**BROADEN** — current results are solid, but adjacent questions are untested
- New questions emerged. The current contribution is clear but more is possible.
- Action: generate new root hypotheses → back to inner loop

**PIVOT** — results invalidate key assumptions or something more interesting appeared
- A core assumption was wrong, or an unexpected finding is more promising than the original question.
- Action: return to literature with new questions → re-bootstrap

**CONCLUDE** — sufficient evidence for a contribution
- At least one hypothesis is strongly supported (or a coherent set of negative results)
- Key ablations completed, error analysis done
- findings.md reads like a paper backbone — a human could write the abstract from it
- No critical open questions that would change the story

Note: coherent negative results are a valid contribution. "X does NOT work because Y" is publishable if the reasoning is rigorous.

### findings.md Is Your Project Memory

This file serves two purposes: it's the research narrative for humans AND your accumulated knowledge base as an agent. Read it at the start of every session, /loop tick, or heartbeat to remember what you've learned.

After every outer loop, update it to answer:

- What do we know so far? (Current Understanding)
- What patterns explain our results? (Patterns and Insights)
- What specific things did we learn not to repeat? (Lessons and Constraints)
- What remains open? (Open Questions)

The "Lessons and Constraints" section is especially important — it captures specific actionable learnings like "weight decay > 0.1 diverges at this scale" or "baseline only reproduces with batch_size=64." This prevents the agent from repeating failed approaches across sessions.

**Quality test**: After 30 inner loop experiments, a human should be able to read findings.md and write a paper abstract from it. If they can't, the outer loop isn't synthesizing — it's just logging.

## Agent Continuity (MANDATORY — Set Up First)

**Before doing anything else**, set up the wall-clock loop. This is what keeps the research running continuously. Without it, the agent stops after one cycle.

### Claude Code

**First action — run this immediately:**

```
/loop 10m Continue autoresearch. Read research-state.yaml and findings.md. Check: is the current experiment done? Are there errors? Is progress stalling? If everything is on track, keep working. If something is wrong, step back and fix it. Never idle.
```

This fires every 10 minutes regardless of what's happening. It's a rhythm that keeps you working — not a research phase boundary. If your previous work isn't done, just continue it.

### OpenClaw

**First action — set up a 10-minute cron job immediately** with the same prompt: continue autoresearch, read state files, check for errors, keep working. OpenClaw handles cron job setup internally.

### What the Loop Does

The `/loop` and cron job are purely **wall-clock rhythm**. They are completely separate from your research loops (inner/outer). On each tick:

1. Read `research-state.yaml` and `findings.md` — remember where you are
2. Check if anything is broken (failed experiments, stalled training, errors)
3. If on track → keep working on whatever you were doing
4. If stuck or something's wrong → step back, diagnose, fix, then continue
5. Never idle. Always be making progress.

## Progress Reporting

When you have something meaningful to share, create a research presentation — not just a status dashboard, but a compelling story.

**When to report** (your judgment):
- After an outer loop that found a significant pattern
- When the optimization trajectory shows clear progress (include the plot!)
- After a pivot in direction
- Before requesting human input on a decision
- When concluding

**What to include** (adapt to what's compelling):
- The research question and why it matters
- Key results with visualizations (plots, metric tables)
- The optimization trajectory chart (metric over experiments)
- What was tried and why (selective, not exhaustive)
- Current understanding (the findings narrative)
- What's planned next

For Claude Code: generate HTML and `open` it. If HTML fails to open or render, convert to PDF as fallback (use `weasyprint`, `playwright pdf`, or `wkhtmltopdf`). For OpenClaw: generate PDF directly.

See [references/progress-reporting.md](references/progress-reporting.md) for template scaffolding and the optimization plot approach. Use the template as a starting point — be creative with what you show.

## Git Protocol

Commit at natural research milestones:

| When | Message Pattern |
|---|---|
| Workspace initialized | `research(init): {project} — {question}` |
| Experiment protocol locked | `research(protocol): {hypothesis}` |
| Significant results | `research(results): {hypothesis} — {outcome}` |
| Outer loop direction change | `research(reflect): {direction} — {reason}` |
| Paper draft complete | `research(paper): {title}` |

**Hard rule**: Protocol commits MUST precede result commits. Never combine them. The git history is your lightweight pre-registration — it proves what you planned before you saw results. Don't commit after every experiment — commit when there's meaningful progress.

## Concluding: Paper Writing

When the outer loop decides to CONCLUDE:

1. Ensure findings.md has a clear, well-supported narrative
2. Study 2-3 top related papers to learn their format, style, and section structure
3. Invoke the `20-ml-paper-writing` skill — it has LaTeX templates for NeurIPS, ICML, ICLR, ACL, AAAI, COLM, and systems venues
4. Feed it the accumulated literature, experimental results, and findings
5. Follow its citation verification workflow — never hallucinate references
6. Generate a final comprehensive research presentation

Proceed autonomously through the writing process. If the ml-paper-writing skill suggests human collaboration points, adapt and keep going — produce the best draft you can. The human will review and provide feedback.

## Research Discipline

Principles to enforce continuously — not tied to any specific phase:

- **Lock before you run**: Commit your experiment protocol to git before executing. This proves your plan existed before you saw results. Never combine protocol + results in one commit.
- **Confirmatory vs exploratory**: Results matching your locked protocol are confirmatory. Everything else is exploratory — interesting but requiring more skepticism.
- **Negative results are progress**: A refuted hypothesis tells you something. Log what it rules out and what it suggests. Don't treat it as failure.
- **Sanity check before analysis**: Verify training converged, baselines reproduce, and data is correct before trusting your primary metric.
- **Return to literature when confused**: Don't guess — search. If results surprise you or assumptions break, go find papers. Use Exa MCP for discovery, Semantic Scholar for specific ML/AI paper lookup, arXiv for preprints.
- **Never stop**: Don't wait for human approval on routine decisions. If a skill or tool suggests collaboration, adapt and keep going. Find the best path forward autonomously. The human will see your progress reports and can redirect if needed.
- **Use whatever compute is available**: Adapt to the user's environment — local GPU, cluster job submission, cloud instances, or just CPU. If no GPU is available, use CPU and adjust experiment scale accordingly. Don't block on compute availability.

## Quality Standards

**Good agent behavior:**
- Hypotheses have mechanistic reasoning ("X because Y, predicting Z"), not just "try X"
- findings.md builds a coherent narrative, not a flat list of results
- Negative results are recorded with what they rule out
- The agent updates its model when experiments contradict expectations
- Progress reports tell a research story with compelling visualizations

**Bad agent behavior:**
- Pure hyperparameter sweeps without interpretation
- findings.md is just experiment logs copy-pasted
- Agent never revisits its assumptions after failures
- Optimizing metrics without understanding why changes work

## When to Use vs Alternatives

**Use autoresearch when:**
- You have a research question explorable through experiments
- There's a measurable proxy metric for inner loop optimization
- The real contribution requires synthesis beyond the metric
- You want continuous autonomous research operation

**Use individual domain skills instead when:**
- You have a specific one-off task (train a model, run eval, write a paper)
- No iterative experimentation needed

## Common Issues

**Inner loop stalls (no metric improvement)**
Run an outer loop. Is the metric the right one? Is the search space exhausted? Consider broadening or pivoting. Search literature for new approaches.

**Stuck and not making progress**
Don't keep trying random changes. Step back: search literature for related work, invoke `21-research-ideation/` brainstorming skills, or run an outer loop reflection. Being stuck means you need new information or a new perspective, not more experiments.

**Results contradict baseline expectations**
Investigate, don't ignore. Return to literature — your protocol might have an error, the published baseline may be wrong, or conditions differ. Update findings.md with what you learn.

**Agent loses context between ticks**
Ensure research-state.yaml is updated after every action. For OpenClaw: ensure HEARTBEAT.md has specific next-action instructions. For Claude Code: research-state.yaml is your memory.

**Can't find relevant papers**
Try multiple approaches in order: Exa MCP for broad search, Semantic Scholar for specific ML/AI paper lookup (`pip install semanticscholar`), arXiv for preprints (`pip install arxiv`). Check `20-ml-paper-writing` skill's `references/citation-workflow.md` for complete API code. Note: Google Scholar has no official API — use Semantic Scholar instead for programmatic search.

**No GPU available**
Use CPU and scale experiments down. Many research tasks (analysis, interpretability, small model training) run fine on CPU. Adjust experiment design to fit available compute rather than blocking.

**Experiments take longer than /loop interval**
Normal. On the next tick, check if it finished. If not, keep waiting or do something else useful (update notes, search papers). Adjust interval if needed.

**Not sure when to conclude**
Three questions: Do you have a strongly supported finding? Can you explain WHY it works? Would findings.md make a convincing paper abstract? If yes to all: conclude.

## Advanced Topics

- **Detailed agent continuity**: [references/agent-continuity.md](references/agent-continuity.md)
- **Progress presentation templates**: [references/progress-reporting.md](references/progress-reporting.md)
- **Complete skill routing**: [references/skill-routing.md](references/skill-routing.md)

# Agent Continuity: Keeping Research Running

Autonomous research requires agents that keep working continuously — hours, overnight, or days. This reference covers how to set up the wall-clock loop on each platform.

## MANDATORY: Set Up Before Anything Else

The wall-clock loop is the first thing you do when starting autoresearch. Without it, the agent does one cycle of work and stops. The loop fires every 10 minutes and simply tells the agent: "keep working, check if anything's wrong."

This is completely separate from the research inner/outer loops. The wall-clock loop is a fixed-interval prompt injection. The research loops run at experiment speed (minutes to hours per cycle). They will not sync and don't need to.

## Claude Code: /loop

**Run this as your very first action:**

```
/loop 10m Continue autoresearch. Read research-state.yaml and findings.md. Check: is the current experiment done? Are there errors? Is progress stalling? If everything is on track, keep working. If something is wrong, step back and fix it. Never idle.
```

### What Happens on Each Tick

The `/loop` message fires every 10 minutes. When it fires:

1. **Read state** — `research-state.yaml` and `findings.md` to remember where you are and what you've learned
2. **Check health** — is the current experiment running? Did it error? Is training diverging?
3. **If on track** → continue whatever you were doing (don't restart or re-plan)
4. **If stuck or broken** → step back, diagnose the issue, fix it, then continue
5. **If idle** → you shouldn't be. Pick the next hypothesis and start an experiment

The tick is a nudge, not a phase boundary. If the previous tick's work isn't done, just keep going.

### When Experiments Run Longer Than 10 Minutes

This is normal and expected. On the next tick:
- Check if the experiment finished
- If still running: monitor for errors, do lightweight work (update notes, search papers)
- Don't restart or duplicate the experiment

### Context Recovery

Your primary memory between ticks is `research-state.yaml` and `findings.md`. Keep them updated after every experiment and reflection. If you lose context, read both files plus `research-log.md` to reconstruct where you are.

## OpenClaw: Cron Job

**Set up a 10-minute cron job as your very first action.** Use the same prompt as Claude Code's `/loop`: continue autoresearch, read state files, check for errors, keep working. OpenClaw handles cron job setup internally — just set the interval to 10 minutes.

### Context Between Cron Ticks

OpenClaw cron invocations may start fresh each time. Your workspace files are your memory:

- `research-state.yaml` — where you are, what's active
- `findings.md` — what you've learned (read this every time!)
- `research-log.md` — what happened chronologically

Keep these updated after every action so the next cron tick can pick up seamlessly.

### PDF Progress Reports

OpenClaw can't `open` HTML files locally like Claude Code can. When you have something to report:

1. Generate a PDF progress summary (use Python with reportlab, matplotlib, or similar)
2. Include: research question, key results, optimization trajectory plot, current understanding, next steps
3. The human will see it in their next interaction

## Research State as Ground Truth

Both platforms share the same ground truth: the workspace files.

| File | Purpose | Update Frequency |
|---|---|---|
| `research-state.yaml` | Machine-readable state | After every experiment and reflection |
| `research-log.md` | Decision timeline | After every significant action |
| `findings.md` | Narrative understanding + project memory | After every outer loop |
| `experiments/*/results/` | Raw experimental data | After every experiment |

The wall-clock loop (`/loop` or cron) is just the trigger. The workspace files are the memory. Keep them current.

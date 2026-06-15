# Welcome — AI Research Skills

You now have access to **86 production-ready skills** covering the entire AI research lifecycle: literature survey, ideation, model training, evaluation, interpretability, paper writing, and more.

## Step 1: Install All Skills

Run this once to install all skills to your agent permanently:

```bash
npx @orchestra-research/ai-research-skills install --all
```

This auto-detects your coding agent (Claude Code, OpenClaw, Cursor, etc.) and installs 98 skills across 23 categories.

**Important**: After installation completes, you may need to restart your agent session for the newly installed skills to be loaded and available. If skills aren't recognized after install, restart and come back to Step 2.

## Step 2: Start Researching

Now that skills are installed, load the **autoresearch** skill — it orchestrates the entire research workflow and routes to all other skills as needed:

```
Read the autoresearch SKILL.md and follow its instructions to begin.
```

Autoresearch will:
- Set up continuous operation (/loop or cron job) — **mandatory first action**
- Bootstrap your research question with literature search
- Run experiments using domain-specific skills (training, eval, interpretability, etc.)
- Synthesize results and track progress
- Show you research presentations along the way
- Write the paper when ready

You don't need to know all 98 skills upfront. Autoresearch finds and invokes the right ones for you.

## That's It

Install → restart if needed → load autoresearch → go. Everything else is progressive disclosure — skills teach what you need, when you need it.

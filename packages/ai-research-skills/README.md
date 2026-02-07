# @orchestra-research/ai-research-skills

Install AI research engineering skills to your coding agents (Claude Code, OpenCode, Cursor, Gemini CLI, and more).

```bash
npx @orchestra-research/ai-research-skills
```

## Features

- **83 skills** across 20 categories for AI research engineering
- **Auto-detects** installed coding agents
- **Interactive installer** with guided experience
- **Global install** with one canonical copy and symlinks to all agents
- **Local install** to project directories for per-project skill sets
- **Works with 8 agents**: Claude Code, OpenCode, OpenClaw, Cursor, Codex, Gemini CLI, Qwen Code, and shared `.agents/`

## Quick Start

Run the interactive installer:

```bash
npx @orchestra-research/ai-research-skills
```

This will:
1. Detect your installed coding agents
2. Let you choose what to install (everything, categories, or quick start bundle)
3. Download skills from GitHub
4. Create symlinks to each agent's skills directory

## Commands

```bash
# Interactive mode (recommended)
npx @orchestra-research/ai-research-skills

# Install everything (global)
npx @orchestra-research/ai-research-skills install --all

# Install a specific category
npx @orchestra-research/ai-research-skills install post-training

# List installed skills
npx @orchestra-research/ai-research-skills list

# Update all skills
npx @orchestra-research/ai-research-skills update
```

### Local Installation (per-project)

Install skills directly into your project directory so different projects can have different skill sets:

```bash
# Install all skills locally to the current project
npx @orchestra-research/ai-research-skills install --all --local

# Install a category locally
npx @orchestra-research/ai-research-skills install --category post-training --local

# List locally installed skills
npx @orchestra-research/ai-research-skills list --local

# Update local skills
npx @orchestra-research/ai-research-skills update --local

# Uninstall local skills
npx @orchestra-research/ai-research-skills uninstall --local
```

Local installation copies skills (not symlinks) into agent directories within your project:

```
my-project/
├── .claude/skills/        # Claude Code picks these up
│   ├── grpo-rl-training/
│   └── vllm/
├── .cursor/rules/         # Cursor picks these up
│   ├── grpo-rl-training/
│   └── vllm/
├── .orchestra-skills.json # Tracks installed skills
└── ...
```

Benefits:
- **Per-project skills**: Each project gets only the skills it needs
- **Version control**: Commit skills to your repo so the whole team has them
- **Reproducible**: Lock file (`.orchestra-skills.json`) tracks what's installed

## Categories

| Category | Skills | Description |
|----------|--------|-------------|
| Model Architecture | 6 | LitGPT, Mamba, TorchTitan, Megatron... |
| Post-Training | 8 | GRPO, verl, slime, miles, torchforge... |
| Fine-Tuning | 5 | Axolotl, Unsloth, PEFT, Torchtune... |
| Distributed Training | 6 | DeepSpeed, FSDP, Megatron... |
| Inference Serving | 4 | vLLM, TensorRT-LLM, SGLang... |
| Optimization | 6 | Flash Attention, GPTQ, AWQ... |
| And 14 more... | | |

## How It Works

### Global Install (default)

1. **Canonical Storage**: Skills are stored once at `~/.orchestra/skills/`
2. **Symlinks**: Each agent gets symlinks pointing to the canonical copy
3. **Auto-activation**: Skills activate when you discuss relevant topics

```
~/.orchestra/skills/       # Single source of truth
├── 06-post-training/
│   ├── verl/
│   └── grpo-rl-training/
└── ...

~/.claude/skills/          # Symlinks for Claude Code
├── verl → ~/.orchestra/skills/.../verl
└── grpo-rl-training → ...

~/.cursor/skills/          # Symlinks for Cursor
└── (same links)
```

### Local Install (`--local`)

1. **Direct Copy**: Skills are copied into agent directories within your project
2. **Version Control**: Files can be committed to git for team sharing
3. **Lock File**: `.orchestra-skills.json` tracks what's installed

```
my-project/
├── .claude/skills/verl/           # Copied for Claude Code
├── .cursor/rules/verl/            # Copied for Cursor
├── .codex/skills/verl/            # Copied for Codex
└── .orchestra-skills.json         # Lock file
```

## Supported Agents

| Agent | Config Directory |
|-------|-----------------|
| Claude Code | `~/.claude` |
| OpenCode | `~/.config/opencode` |
| OpenClaw | `~/.openclaw` |
| Cursor | `~/.cursor` |
| Codex (OpenAI) | `~/.codex` |
| Gemini CLI | `~/.gemini` |
| Qwen Code | `~/.qwen` |
| Shared Agents | `~/.agents` |

## License

MIT - Orchestra Research

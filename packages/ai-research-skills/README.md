# @orchestra-research/ai-research-skills

Install AI research engineering skills to your coding agents (Claude Code, OpenCode, Cursor, Gemini CLI, and more).

```bash
npx @orchestra-research/ai-research-skills
```

## Features

- **82 skills** across 20 categories for AI research engineering
- **Auto-detects** installed coding agents
- **Interactive installer** with guided experience
- **One canonical copy** with symlinks to all agents
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

# Install everything
npx @orchestra-research/ai-research-skills install --all

# Install a specific category
npx @orchestra-research/ai-research-skills install post-training

# List installed skills
npx @orchestra-research/ai-research-skills list

# Update all skills
npx @orchestra-research/ai-research-skills update
```

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

1. **Canonical Storage**: Skills are stored once at `~/.agents/skills/`
2. **Symlinks**: Each agent gets symlinks pointing to the canonical copy
3. **Auto-activation**: Skills activate when you discuss relevant topics

```
~/.agents/skills/          # Single source of truth
├── 06-post-training/
│   ├── verl/
│   └── grpo-rl-training/
└── ...

~/.claude/skills/          # Symlinks for Claude Code
├── verl → ~/.agents/skills/.../verl
└── grpo-rl-training → ...

~/.cursor/skills/          # Symlinks for Cursor
└── (same links)
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

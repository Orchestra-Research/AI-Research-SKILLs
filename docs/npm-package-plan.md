# NPM Package Plan: @orchestra-research/skills

## Overview

Create an npm/npx package that allows users to easily install AI research skills to their preferred coding agents (Claude Code, Cursor, Codex, Windsurf, etc.).

## Package Name Options

- `@orchestra-research/skills` (recommended - scoped, professional)
- `ai-research-skills` (simple, may conflict)
- `orchestra-skills` (short, brandable)

## Architecture

### Inspired By

Based on research of existing solutions:
- **vercel-labs/skills**: Canonical storage + symlinks, 27 agent support, lock file
- **openskills**: Universal loader, AGENTS.md generation
- **add-skill**: Zero-dependency, auto-detection

### Core Components

```
@orchestra-research/skills/
├── bin/
│   └── cli.js                 # CLI entry point
├── src/
│   ├── agents/                # Agent-specific handlers
│   │   ├── claude.js          # .claude/skills/
│   │   ├── cursor.js          # .cursor/skills/
│   │   ├── codex.js           # .codex/skills/
│   │   ├── windsurf.js        # .windsurf/skills/
│   │   ├── copilot.js         # .github/copilot-instructions.md
│   │   └── index.js           # Agent registry
│   ├── commands/
│   │   ├── install.js         # Install skills
│   │   ├── list.js            # List available/installed skills
│   │   ├── update.js          # Update skills
│   │   ├── remove.js          # Remove skills
│   │   └── detect.js          # Detect installed agents
│   ├── storage/
│   │   ├── canonical.js       # ~/.orchestra-skills/ management
│   │   ├── lock.js            # Lock file management
│   │   └── symlink.js         # Symlink utilities
│   ├── registry/
│   │   └── skills.json        # Skill manifest (or fetch from GitHub)
│   └── utils/
│       ├── fetch.js           # Download skills from GitHub
│       └── format.js          # Format for different agents
├── package.json
└── README.md
```

## Supported Agents (7 Verified)

All agents below have been verified to support SKILL.md files with the same format.

| Agent | Config Location | Skills Location | Source |
|-------|-----------------|-----------------|--------|
| Claude Code | `~/.claude/` | `.claude/skills/` | Verified locally |
| Cursor | `~/.cursor/` | `.cursor/skills/` | [DeepWiki](https://deepwiki.com/getcursor/cursor) |
| Codex (OpenAI) | `~/.codex/` | `.codex/skills/` | [DeepWiki](https://deepwiki.com/openai/codex) |
| Windsurf | `~/.windsurf/` | `.windsurf/skills/` | [Windsurf Docs](https://docs.windsurf.com/windsurf/cascade/skills) |
| Gemini CLI | `~/.gemini/` | `.gemini/skills/` | [DeepWiki](https://deepwiki.com/google-gemini/gemini-cli) |
| Kilo Code | `~/.kilocode/` | `.kilocode/skills/` | [Kilo Docs](https://kilo.ai/docs/agent-behavior/skills) |
| Qwen Code | `~/.qwen/` | `.qwen/skills/` | [Qwen Docs](https://qwenlm.github.io/qwen-code-docs/)

## CLI Commands

### Installation

```bash
# Install globally
npm install -g @orchestra-research/skills

# Or use npx (recommended)
npx @orchestra-research/skills <command>
```

### Commands

```bash
# Detect installed coding agents
npx @orchestra-research/skills detect

# List all available skills
npx @orchestra-research/skills list

# List skills by category
npx @orchestra-research/skills list --category post-training

# List available categories
npx @orchestra-research/skills categories

# Install all skills for detected agents
npx @orchestra-research/skills install --all

# Install specific category (user selects from list)
npx @orchestra-research/skills install --category post-training

# Install multiple categories
npx @orchestra-research/skills install --category post-training,fine-tuning,inference

# Install specific skill
npx @orchestra-research/skills install verl

# Install for specific agent only
npx @orchestra-research/skills install verl --agent claude

# Install to project scope (current directory)
npx @orchestra-research/skills install verl --scope project

# Install to global scope (home directory)
npx @orchestra-research/skills install verl --scope global

# Interactive mode - prompts user to select categories/skills
npx @orchestra-research/skills install --interactive

# Update all skills
npx @orchestra-research/skills update

# Remove a skill
npx @orchestra-research/skills remove verl

# Show skill info
npx @orchestra-research/skills info verl
```

### Interactive Installation Flow

When running `npx @orchestra-research/skills install --interactive`:

```
? What would you like to install?
  ○ All skills (82 skills)
  ○ Select by category
  ○ Select individual skills

? Select categories to install: (Space to select, Enter to confirm)
  ◉ 01-model-architecture (6 skills)
  ◯ 02-tokenization (2 skills)
  ◯ 03-fine-tuning (5 skills)
  ◉ 06-post-training (8 skills)
  ◯ 20-ml-paper-writing (1 skill)
  ...

? Confirm installation of 14 skills to Claude Code, Cursor, Gemini CLI? (Y/n)
```

## Storage Strategy

### Canonical Storage (Recommended)

Single source of truth with symlinks:

```
~/.orchestra-skills/                    # Canonical storage
├── .lock.json                          # Lock file for versioning
├── 01-model-architecture/
│   ├── megatron-core/
│   │   └── SKILL.md
│   └── litgpt/
│       └── SKILL.md
├── 06-post-training/
│   ├── verl/
│   │   ├── SKILL.md
│   │   └── references/
│   ├── slime/
│   └── ...
└── ...

~/.claude/skills/                       # Symlinks to canonical
├── verl -> ~/.orchestra-skills/06-post-training/verl
├── slime -> ~/.orchestra-skills/06-post-training/slime
└── ...

~/.cursor/skills/                       # Same symlinks
├── verl -> ~/.orchestra-skills/06-post-training/verl
└── ...
```

### Lock File Format

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-28T00:00:00Z",
  "skills": {
    "verl": {
      "version": "1.0.0",
      "category": "06-post-training",
      "installedAt": "2025-01-28T00:00:00Z",
      "agents": ["claude", "cursor"]
    }
  },
  "agents": {
    "claude": {
      "detected": true,
      "scope": "global",
      "path": "~/.claude/skills"
    }
  }
}
```

## Skill Structure Patterns

The repository has two skill organization patterns:

### Pattern 1: Nested Skills (Most Categories)
```
XX-category/
├── skill-name-1/
│   ├── SKILL.md
│   └── references/
├── skill-name-2/
│   └── SKILL.md
└── ...
```

Example: `06-post-training/verl/SKILL.md`

### Pattern 2: Standalone Skills (Single Skill = Category)
```
XX-category-name/
├── SKILL.md
├── references/
└── templates/
```

Example: `20-ml-paper-writing/SKILL.md` (the category IS the skill)

The npm package must handle both patterns when fetching skills.

---

## Skill Registry

### Option A: Embedded (Simpler)

Include skill manifest in npm package, update with releases:

```json
// src/registry/skills.json
{
  "version": "1.0.0",
  "categories": {
    "01-model-architecture": {
      "name": "Model Architecture",
      "skills": ["megatron-core", "litgpt", "mamba", "rwkv", "nanogpt"]
    },
    "06-post-training": {
      "name": "Post-Training (RLHF/DPO/GRPO)",
      "skills": ["trl", "grpo", "openrlhf", "simpo", "verl", "slime", "miles", "torchforge"]
    }
  },
  "skills": {
    "verl": {
      "name": "verl",
      "category": "06-post-training",
      "description": "Volcano Engine RL for LLM post-training",
      "tags": ["Reinforcement Learning", "RLHF", "GRPO", "PPO"]
    }
  }
}
```

### Option B: Remote Fetch (More Flexible)

Fetch skill manifest from GitHub API on each run:

```javascript
const REPO = 'orchestra-research/AI-research-SKILLs';
const MANIFEST_URL = `https://api.github.com/repos/${REPO}/contents/skill-manifest.json`;

async function fetchSkillManifest() {
  const response = await fetch(MANIFEST_URL);
  return JSON.parse(atob(response.content));
}
```

**Recommendation**: Start with embedded, add remote fetch as update mechanism.

## Installation Flow

```
┌─────────────────────────────────────────────────────────────┐
│ npx @orchestra-research/skills install verl                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Detect installed agents                                  │
│    - Check ~/.claude exists → Claude Code detected          │
│    - Check ~/.cursor exists → Cursor detected               │
│    - Check ~/.codex exists → Codex detected                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Download skill to canonical storage                      │
│    - Fetch from GitHub: AI-research-SKILLs/06-post-training/verl │
│    - Save to: ~/.orchestra-skills/06-post-training/verl     │
│    - Update lock file                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Create symlinks for each detected agent                  │
│    - ~/.claude/skills/verl → ~/.orchestra-skills/.../verl   │
│    - ~/.cursor/skills/verl → ~/.orchestra-skills/.../verl   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Output success message                                   │
│    ✓ Installed verl for: Claude Code, Cursor                │
│    Skills location: ~/.orchestra-skills/06-post-training/verl │
└─────────────────────────────────────────────────────────────┘
```

## Agent-Specific Handling

### All 7 Verified Agents

All agents use the same SKILL.md format and symlink pattern:

```javascript
// src/agents/index.js
export const agents = {
  claude: {
    name: 'Claude Code',
    configDir: '~/.claude',
    skillsDir: '~/.claude/skills',
    projectSkillsDir: '.claude/skills',
  },
  cursor: {
    name: 'Cursor',
    configDir: '~/.cursor',
    skillsDir: '~/.cursor/skills',
    projectSkillsDir: '.cursor/skills',
  },
  codex: {
    name: 'Codex (OpenAI)',
    configDir: '~/.codex',
    skillsDir: '~/.codex/skills',
    projectSkillsDir: '.codex/skills',
  },
  windsurf: {
    name: 'Windsurf',
    configDir: '~/.windsurf',
    skillsDir: '~/.windsurf/skills',
    projectSkillsDir: '.windsurf/skills',
  },
  gemini: {
    name: 'Gemini CLI',
    configDir: '~/.gemini',
    skillsDir: '~/.gemini/skills',
    projectSkillsDir: '.gemini/skills',
  },
  kilo: {
    name: 'Kilo Code',
    configDir: '~/.kilocode',
    skillsDir: '~/.kilocode/skills',
    projectSkillsDir: '.kilocode/skills',
  },
  qwen: {
    name: 'Qwen Code',
    configDir: '~/.qwen',
    skillsDir: '~/.qwen/skills',
    projectSkillsDir: '.qwen/skills',
  },
};

// Common install function for all agents
function installSkill(agent, skillName, canonicalPath, scope) {
  const targetDir = scope === 'project'
    ? agent.projectSkillsDir
    : expandHome(agent.skillsDir);

  fs.ensureDirSync(targetDir);
  fs.symlinkSync(canonicalPath, path.join(targetDir, skillName));
}
```

## User Experience

### First Run

```bash
$ npx @orchestra-research/skills detect

🔍 Detecting installed coding agents...

✓ Claude Code     ~/.claude
✓ Cursor          ~/.cursor
✗ Codex           not found
✗ Windsurf        not found
✓ GitHub Copilot  available for projects

Found 2 global agents, 1 project-only agent.
Run 'npx @orchestra-research/skills install --all' to install all skills.
```

### Installing Skills

```bash
$ npx @orchestra-research/skills install post-training

📦 Installing post-training skills...

Downloading skills from GitHub...
  ✓ trl (1.2 KB)
  ✓ grpo (15.3 KB)
  ✓ openrlhf (8.7 KB)
  ✓ simpo (4.2 KB)
  ✓ verl (12.1 KB)
  ✓ slime (18.4 KB)
  ✓ miles (9.8 KB)
  ✓ torchforge (11.2 KB)

Creating symlinks...
  ✓ Claude Code: 8 skills installed
  ✓ Cursor: 8 skills installed

✨ Done! Installed 8 skills for 2 agents.

Skills are stored in: ~/.orchestra-skills/06-post-training/
Symlinks created in: ~/.claude/skills/, ~/.cursor/skills/
```

### Listing Skills

```bash
$ npx @orchestra-research/skills list

📚 AI Research Skills (81 total)

Model Architecture (5)
  ○ megatron-core    Megatron-Core for large-scale model training
  ○ litgpt           LitGPT for efficient LLM development
  ○ mamba            Mamba state space models
  ○ rwkv             RWKV linear attention models
  ○ nanogpt          NanoGPT for learning/prototyping

Post-Training (8)
  ● verl             Volcano Engine RL for LLM post-training
  ● slime            Megatron-SGLang RL training framework
  ● miles            Enterprise-grade RL for large MoE models
  ● torchforge       PyTorch-native agentic RL library
  ○ trl              Transformer Reinforcement Learning
  ○ grpo             Group Relative Policy Optimization
  ○ openrlhf         OpenRLHF training framework
  ○ simpo            Simple Preference Optimization

● = installed, ○ = available
```

## Implementation Phases

### Phase 1: MVP (Week 1)

- [ ] Basic CLI structure with commander.js
- [ ] Agent detection (Claude, Cursor, Codex)
- [ ] Download skills from GitHub
- [ ] Symlink installation to detected agents
- [ ] Basic list and install commands

### Phase 2: Full Features (Week 2)

- [ ] Canonical storage with lock file
- [ ] Update and remove commands
- [ ] Category filtering
- [ ] Project vs global scope
- [ ] Copilot special handling

### Phase 3: Polish (Week 3)

- [ ] Interactive mode (inquirer.js prompts)
- [ ] Progress bars and better UX
- [ ] Error handling and recovery
- [ ] Documentation and README
- [ ] npm publish and GitHub Actions for releases

## Dependencies

```json
{
  "dependencies": {
    "commander": "^12.0.0",      // CLI framework
    "chalk": "^5.3.0",           // Colored output
    "ora": "^8.0.0",             // Spinners
    "fs-extra": "^11.2.0",       // File utilities
    "node-fetch": "^3.3.0",      // HTTP requests
    "inquirer": "^9.2.0"         // Interactive prompts (optional)
  }
}
```

## Publishing

```bash
# Login to npm
npm login

# Publish scoped package (public)
npm publish --access public
```

## Alternatives Considered

### 1. Shell Script (Rejected)

PR #6 approach - too limited, no cross-platform support, poor UX.

### 2. Python Package (Possible Alternative)

Could work with `pipx install orchestra-skills`, but npm/npx is more common for dev tools.

### 3. Homebrew Formula (Future)

Could add `brew install orchestra-skills` later for Mac users.

## Next Steps

1. Create new repository or directory for npm package
2. Implement Phase 1 MVP
3. Test with Claude Code and Cursor
4. Publish to npm
5. Update main README with installation instructions
6. Close PR #6 with reference to new approach

## References

- [vercel-labs/skills](https://github.com/vercel-labs/skills) - Multi-agent skill installer
- [openskills](https://github.com/OpenAgentsInc/openskills) - Universal skill loader
- [add-skill](https://github.com/iamnbutler/add-skill) - Zero-dependency installer

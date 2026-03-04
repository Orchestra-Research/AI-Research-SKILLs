# Installing AI-Research-SKILLs for Qoder

This guide explains how to install the [AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) library (85 AI research engineering skills) into the **Qoder** coding agent, with automatic updates via the official `npx` tool.

## Table of Contents

- [Background](#background)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Method 1: npx + Symlinks (Recommended)](#method-1-npx--symlinks-recommended)
  - [Method 2: Manual Installation (No Node.js Required)](#method-2-manual-installation-no-nodejs-required)
- [Updating Skills](#updating-skills)
- [Custom Skills Coexistence](#custom-skills-coexistence)
- [Verification](#verification)
- [How Skills Work in Qoder](#how-skills-work-in-qoder)
- [FAQ](#faq)

---

## Background

The official `npx @orchestra-research/ai-research-skills` installer supports Claude Code, Cursor, Codex, Gemini CLI, and Qwen Code, but **does not natively support Qoder** yet.

Qoder loads skills from the project-level `.qoder/skills/` directory, while the official installer stores skills in `~/.orchestra/skills/`.

This guide bridges the two directories using **symlinks**, enabling:
- Official tool manages skill source files
- Qoder reads them seamlessly via symlinks
- `npx update` changes are automatically reflected

---

## Architecture Overview

```
Official npx Installer
      │
      ▼
~/.orchestra/skills/            ← Canonical storage (managed by npx)
├── 01-model-architecture/
│   ├── litgpt/SKILL.md
│   ├── mamba/SKILL.md
│   └── ...
├── 06-post-training/
│   ├── trl-fine-tuning/SKILL.md
│   └── ...
└── 15-rag/
    ├── chroma/SKILL.md
    └── ...
      │
      │ symlinks
      ▼
<project>/.qoder/skills/        ← Qoder skill loading directory
├── litgpt → ~/.orchestra/skills/01-model-architecture/litgpt/
├── chroma → ~/.orchestra/skills/15-rag/chroma/
├── vllm   → ~/.orchestra/skills/12-inference-serving/vllm/
├── ...                          (85 symlinks)
├── my-custom-skill/SKILL.md     (custom skill, real directory)
└── ...
```

---

## Prerequisites

| Dependency | Method 1 (Recommended) | Method 2 (Manual) |
|-----------|----------------------|-------------------|
| Git | Required | Required |
| Node.js / npx | Required (v16+) | Not required |
| GitHub access | Required | Required |

Verify your environment:

```bash
git --version        # Confirm git is available
npx --version        # Required for Method 1
node --version       # Required for Method 1 (v16+)
```

---

## Installation

### Method 1: npx + Symlinks (Recommended)

#### Step 1: Install skills to the global directory using npx

```bash
npx @orchestra-research/ai-research-skills
```

The interactive installer will guide you to select skill categories (choose "Everything" for all 85 skills). After installation, skill files are located at `~/.orchestra/skills/`.

#### Step 2: Create symlinks to .qoder/skills/

```bash
# Set destination directory (replace with your project path)
DEST="<your-project>/.qoder/skills"
SRC="$HOME/.orchestra/skills"

mkdir -p "$DEST"

# Iterate over all categories and skills, creating flat symlinks
for category_dir in "$SRC"/[0-9][0-9]-*/; do
    if [ -f "$category_dir/SKILL.md" ]; then
        # Standalone skill (e.g., 20-ml-paper-writing)
        skill_name=$(grep -m1 '^name:' "$category_dir/SKILL.md" | sed 's/name: *//' | tr -d '"' | tr -d "'" | xargs)
        [ -z "$skill_name" ] && skill_name=$(basename "$category_dir")
        ln -sf "$category_dir" "$DEST/$skill_name"
    else
        # Nested skills (e.g., 15-rag/chroma)
        for skill_dir in "$category_dir"*/; do
            [ -f "$skill_dir/SKILL.md" ] || continue
            skill_name=$(basename "$skill_dir")
            ln -sf "$skill_dir" "$DEST/$skill_name"
        done
    fi
done

echo "Done! $(ls -la $DEST | grep '^l' | wc -l) symlinks created."
```

#### Step 3: Verify

```bash
# Check the number of symlinks
ls -la "$DEST" | grep '^l' | wc -l
# Expected output: 85

# Spot-check a skill
cat "$DEST/vllm/SKILL.md" | head -5
```

---

### Method 2: Manual Installation (No Node.js Required)

For server environments where Node.js is unavailable.

```bash
# 1. Clone the repository (shallow clone to save bandwidth)
git clone --depth 1 https://github.com/Orchestra-Research/AI-Research-SKILLs.git /tmp/ai-research-skills

# 2. Copy skills to .qoder/skills/
DEST="<your-project>/.qoder/skills"
SRC="/tmp/ai-research-skills"

mkdir -p "$DEST"

for category_dir in "$SRC"/[0-9][0-9]-*/; do
    if [ -f "$category_dir/SKILL.md" ]; then
        skill_name=$(grep -m1 '^name:' "$category_dir/SKILL.md" | sed 's/name: *//' | tr -d '"' | tr -d "'" | xargs)
        [ -z "$skill_name" ] && skill_name=$(basename "$category_dir")
        mkdir -p "$DEST/$skill_name"
        cp -r "$category_dir"/* "$DEST/$skill_name/"
    else
        for skill_dir in "$category_dir"*/; do
            [ -f "$skill_dir/SKILL.md" ] || continue
            skill_name=$(basename "$skill_dir")
            mkdir -p "$DEST/$skill_name"
            cp -r "$skill_dir"/* "$DEST/$skill_name/"
        done
    fi
done

# 3. Clean up
rm -rf /tmp/ai-research-skills

echo "Done! $(ls $DEST | wc -l) skills installed."
```

> **Note**: Manual installation does not support automatic updates. Re-run the script above to update.

---

## Updating Skills

### For Method 1 users (npx + symlinks)

```bash
# One command — updates files in ~/.orchestra/skills/
npx @orchestra-research/ai-research-skills update
```

Since `.qoder/skills/` entries are symlinks pointing to `~/.orchestra/skills/`, **updates are automatically reflected — no extra steps needed**.

If new skills were added upstream, re-run the symlink script from Step 2 to pick them up.

### For Method 2 users (manual installation)

Re-run the [Method 2](#method-2-manual-installation-no-nodejs-required) installation script. It will overwrite and update existing files.

---

## Custom Skills Coexistence

The `.qoder/skills/` directory can contain both types simultaneously:

| Type | Example | Management |
|------|---------|------------|
| Orchestra Skill (symlink) | `chroma → ~/.orchestra/skills/...` | `npx update` auto-syncs |
| Custom Skill (real directory) | `my-custom-tool/SKILL.md` | Manually maintained |

They do not interfere with each other. Symlinks and real directories are naturally isolated.

Identify which is which:

```bash
for d in .qoder/skills/*/; do
    name=$(basename "$d")
    if [ -L "${d%/}" ]; then
        echo "  [orchestra] $name"
    else
        echo "  [custom]    $name"
    fi
done
```

---

## Verification

```bash
DEST="<your-project>/.qoder/skills"

echo "=== Statistics ==="
echo "Total directories: $(ls -d $DEST/*/ | wc -l)"
echo "Symlinks: $(ls -la $DEST | grep '^l' | wc -l)"
echo "Real directories: $(ls -la $DEST | grep '^d' | grep -v '\.$' | wc -l)"

echo ""
echo "=== Custom Skills ==="
for d in $DEST/*/; do
    [ -L "${d%/}" ] && continue
    name=$(basename "$d")
    echo "  $name/  (real directory)"
done

echo ""
echo "=== Spot Check ==="
for skill in vllm chroma deepspeed peft; do
    if [ -f "$DEST/$skill/SKILL.md" ]; then
        echo "  OK: $skill"
    else
        echo "  MISSING: $skill"
    fi
done
```

---

## How Skills Work in Qoder

Once installed, when you describe a task in Qoder:

```
User: "Deploy a LLaMA model inference service using vLLM"
```

Qoder will:

1. **Match a Skill** — Scan `description` fields across `.qoder/skills/*/SKILL.md` to find the most relevant skill
2. **Load Expert Knowledge** — Read the full usage guide, code templates, and best practices from the matched `SKILL.md`
3. **Execute with Guidance** — Complete the task as if assisted by a framework expert

Each `SKILL.md` structure:

```yaml
---
name: serving-llms-vllm
description: Serves LLMs with high throughput using vLLM's PagedAttention...
version: 1.0.0
author: Orchestra Research
tags: [vLLM, Inference, PagedAttention, ...]
dependencies: [vllm, torch, transformers]
---

# vLLM - High-Throughput LLM Serving

## Quick Start
...(detailed code examples, configuration guides, troubleshooting tips)
```

---

## FAQ

### Q: Why not just use `npx` to install directly to Qoder?

The official installer's `agents.js` does not yet include a Qoder configuration. It only recognizes `.claude/`, `.cursor/`, `.qwen/`, etc. Symlinks elegantly bridge this gap.

### Q: New skills were added upstream. How do I sync?

```bash
# 1. Update ~/.orchestra/skills/
npx @orchestra-research/ai-research-skills update

# 2. Re-run the symlink script from Step 2 to pick up new skills
```

### Q: Can I install only specific categories?

Yes. In the `npx` interactive installer, choose "By category" to install selectively. The symlink script will only link what's been installed.

### Q: What if symlinks break?

If `~/.orchestra/skills/` is deleted or moved, symlinks will become dangling. Re-install via `npx` and re-run the symlink script.

### Q: How does this compare to the official npx installation?

| Comparison | Official npx | This Guide |
|-----------|-------------|------------|
| Skill storage | `~/.orchestra/skills/` | Same (symlinked) |
| Updates | `npx ... update` | Same (auto-syncs) |
| Qoder support | Not supported | Supported via symlinks |
| Custom skills | N/A | Coexist in real directories |

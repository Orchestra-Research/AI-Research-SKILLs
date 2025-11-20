# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Research Engineering Skills Library** - A comprehensive open-source library of 54 AI research skills designed to enable AI agents to autonomously conduct AI research experiments. Each skill provides expert-level guidance (200-600 lines) with real code examples, troubleshooting guides, and production-ready workflows.

**Mission**: Enable AI agents to autonomously conduct AI research from hypothesis to experimental verification, covering dataset preparation, training pipelines, model deployment, and scientific hypothesis validation.

## Repository Architecture

### Directory Structure (54 Skills Across 18 Categories)

Skills are organized into numbered categories representing the AI research lifecycle:

- `01-model-architecture/` - Model architectures (5 skills: Megatron-Core, LitGPT, Mamba, RWKV, NanoGPT)
- `02-tokenization/` - Tokenizers (2 skills: HuggingFace Tokenizers, SentencePiece)
- `03-fine-tuning/` - Fine-tuning frameworks (3 skills: Axolotl, LLaMA-Factory, Unsloth)
- `05-data-processing/` - Data curation (2 skills: Ray Data, NeMo Curator)
- `06-post-training/` - RLHF/DPO/GRPO (4 skills: TRL, GRPO, OpenRLHF, SimPO)
- `07-safety-alignment/` - Safety and guardrails (3 skills: Constitutional AI, LlamaGuard, NeMo Guardrails)
- `08-distributed-training/` - Distributed systems (5 skills: DeepSpeed, FSDP, Accelerate, PyTorch Lightning, Ray Train)
- `10-optimization/` - Optimization techniques (3 skills: Flash Attention, bitsandbytes, GPTQ)
- `11-evaluation/` - Benchmarking (1 skill: lm-evaluation-harness)
- `12-inference-serving/` - Inference engines (4 skills: vLLM, TensorRT-LLM, llama.cpp, SGLang)
- `13-mlops/` - Experiment tracking (3 skills: Weights & Biases, MLflow, TensorBoard)
- `14-agents/` - Agent frameworks (2 skills: LangChain, LlamaIndex)
- `15-rag/` - Retrieval-augmented generation (4 skills: Chroma, FAISS, Sentence Transformers, Pinecone)
- `16-prompt-engineering/` - Structured output (4 skills: DSPy, Instructor, Guidance, Outlines)
- `18-multimodal/` - Vision and speech (3 skills: CLIP, Whisper, LLaVA)
- `19-emerging-techniques/` - Advanced methods (6 skills: MoE Training, Model Merging, Long Context, Speculative Decoding, Knowledge Distillation, Model Pruning)

### Skill File Structure

Each skill follows a standardized format:
```
skill-name/
├── SKILL.md                    # Main guidance (200-600 lines with YAML frontmatter)
├── references/                 # Deep documentation (300KB+ target)
│   ├── README.md              # From official docs
│   ├── api.md                 # API reference
│   ├── tutorials.md           # Step-by-step guides
│   ├── issues.md              # Real GitHub issues & solutions
│   └── releases.md            # Version history
├── scripts/                    # Helper scripts (optional)
├── templates/                  # Code templates (optional)
└── examples/                   # Example implementations (optional)
```

## Skill Quality Standards

### YAML Frontmatter Requirements (CRITICAL)

All `SKILL.md` files MUST include YAML frontmatter with these exact fields:

```yaml
---
name: skill-name-here              # kebab-case, no quotes, gerund form preferred
description: Third-person description of what AND when to use this skill  # No quotes, max 1024 chars
version: 1.0.0                     # Semantic versioning
author: Orchestra Research         # Standard author
license: MIT                       # Standard license
tags: [Tag One, Tag Two]          # Title Case (except UPPERCASE acronyms like GRPO, TRL, RLHF)
dependencies: [pkg>=1.0.0]         # Optional, with version constraints
---
```

**Critical Rules**:
- `name`: Use gerund form (e.g., `serving-llms`, `processing-data`, `grpo-rl-training`)
- `description`: Third person ("Provides guidance for..."), include WHAT it does AND WHEN to use it
- `tags`: Title Case for regular words, UPPERCASE for acronyms (GRPO, TRL, RLHF, DPO, PPO)
- No quotes around any field values (except in arrays)
- Dependencies should include version constraints: `transformers>=4.47.0`

### Content Quality Standards

**Core Requirements** (based on Anthropic official best practices):
- ✅ SKILL.md body: **200-500 lines** (under 500 lines is critical for performance)
- ✅ Progressive disclosure: SKILL.md as overview, details in separate reference files
- ✅ Workflows with copy-paste checklists for complex tasks
- ✅ "When to use vs alternatives" guidance section
- ✅ Common issues section with solutions
- ✅ Concise content: assume Claude is smart, no over-explaining basics
- ✅ Code examples with language detection (```python, ```bash, etc.)
- ✅ References ONE level deep from SKILL.md (no nested references)

**Gold Standard** (aim for this - see `06-post-training/grpo-rl-training/`):
- ✅ 2-3 complete workflows with step-by-step checklists
- ✅ Reference files for advanced topics (one level deep)
- ✅ Feedback loops (validate → fix → repeat) for quality-critical operations
- ✅ Consistent terminology throughout
- ✅ Concrete input/output examples
- ✅ Real GitHub issues with solutions (when available)

**NOT Acceptable**:
- ❌ SKILL.md over 500 lines (split into reference files instead)
- ❌ Over-explaining basics that Claude already knows
- ❌ First-person descriptions ("I can help you...")
- ❌ Vague skill names ("helper", "utils", "tools")
- ❌ Nested references (SKILL.md → ref1.md → ref2.md)
- ❌ Missing workflows with checklists for complex tasks

## Development Workflow

### Adding a New Skill

1. **Choose skill from roadmap** (see CONTRIBUTING.md or README.md)
2. **Create directory structure** in appropriate category (01-19)
3. **Write SKILL.md** with YAML frontmatter following standards above
4. **Add reference documentation** (target 300KB+ from official sources)
5. **Validate quality**:
   - Check SKILL.md has YAML frontmatter
   - Verify SKILL.md is 200-500 lines
   - Ensure code blocks have language tags
   - Confirm references are one level deep from SKILL.md
   - Check documentation size: `du -sh skill-name/references/`
6. **Test the skill** with real use cases before submitting

### Improving Existing Skills

When updating skills:
1. **Maintain YAML frontmatter** format and fields
2. **Keep SKILL.md under 500 lines** - split into reference files if needed
3. **Add workflows** with checklists for complex operations
4. **Update version number** in YAML frontmatter
5. **Test changes** with representative tasks

### Quality Validation Commands

```bash
# Check YAML frontmatter exists
head -20 skill-name/SKILL.md

# Verify SKILL.md line count (target 200-500 lines)
wc -l skill-name/SKILL.md

# Check documentation size (target 300KB+)
du -sh skill-name/references/

# Verify code blocks have language tags
grep -A 1 '```' skill-name/SKILL.md | head -20

# Validate YAML frontmatter syntax
python -c "import yaml; yaml.safe_load(open('skill-name/SKILL.md').read().split('---')[1])"
```

## Key Files

- **README.md** - Project overview, all 54 skills listed with descriptions and stats
- **CONTRIBUTING.md** - Complete contribution guidelines and quality standards
- **SKILL_TEMPLATE.md** - Copy-paste scaffold for new skills
- **ROADMAP.md** - Development roadmap towards 70 skills
- **anthropic_official_docs/** - Anthropic's official best practices for skills

## Git Workflow

Standard Git workflow:
```bash
# Create feature branch
git checkout -b add-skill-name

# Add and commit changes
git add category/skill-name/
git commit -m "Add [Skill Name] skill

- X lines of documentation
- Y GitHub issues with solutions
- API reference and examples included"

# Push to fork and create PR
git push origin add-skill-name
```

## Automation: Orchestra Skill Marketplace Sync

### How Auto-Sync Works

When skills are committed to the `main` branch, GitHub Actions automatically syncs them to the Orchestra skill marketplace:

1. **GitHub Actions detects** changed skill folders on push to `main`
2. **For each changed skill**:
   - Extracts metadata from SKILL.md frontmatter (`name`, `author`, etc.)
   - Creates ZIP file containing entire skill directory (SKILL.md, references/, scripts/, etc.)
   - Uploads to Orchestra API endpoint
3. **Orchestra stores** ZIP in Supabase Storage and creates database record
4. **Skill appears** in marketplace at `https://orchestra.com/research-skills`

### Workflow File Location

- **File**: `.github/workflows/sync-skills.yml`
- **Triggers**: Push to `main` branch, manual workflow dispatch
- **What syncs**: Only skill directories that changed in the commit

### Author Detection (Orchestra vs Community)

The workflow reads the `author:` field from SKILL.md frontmatter to determine badge:

**Official Orchestra Skill**:
```yaml
---
author: Orchestra Research  # Contains "Orchestra"
---
```
- Result: Source = `orchestra` (Official badge)
- Storage: `research-skills/orchestra/skill-name.zip`

**Community Skill**:
```yaml
---
author: Jane Doe  # Does NOT contain "Orchestra"
---
```
- Result: Source = `community` (Community badge)
- Storage: `research-skills/community/skill-name.zip`

### What Gets Synced

The workflow zips **ALL contents** of skill directory:
- ✅ SKILL.md
- ✅ references/ (all subdirectories)
- ✅ scripts/ (if exists)
- ✅ assets/ (if exists)
- ✅ examples/ (if exists)
- ✅ templates/ (if exists)
- ❌ Hidden files (`.gitkeep`, `.DS_Store`)

### Testing the Sync

**Manual trigger**:
1. Go to GitHub Actions tab
2. Select "Sync Skills to Orchestra" workflow
3. Click "Run workflow"

**Test with commit**:
```bash
# Make a small change to any skill
echo "\n<!-- Updated $(date) -->" >> 01-model-architecture/litgpt/SKILL.md

# Commit and push to main
git add .
git commit -m "test: trigger auto-sync"
git push origin main
```

**Verify sync worked**:
1. Check GitHub Actions tab for workflow run status
2. Check Orchestra marketplace for updated skill
3. Check Supabase Storage for ZIP file

### Important Notes

- **GitHub Secrets required**: `ORCHESTRA_API_URL`, `ORCHESTRA_SYNC_API_KEY` (already configured)
- **Only syncs changed skills**: Workflow detects which skill directories changed in commit
- **SKILL.md required**: Skills without SKILL.md are skipped with warning
- **See detailed setup**: `dev_data/GITHUB_SKILLS_SYNC_SETUP.md`

## Important Conventions

### Naming Conventions

- **Skill names**: Use gerund form (verb + -ing) in kebab-case: `processing-pdfs`, `serving-llms`, `grpo-rl-training`
- **Tags**: Title Case for words, UPPERCASE for acronyms (GRPO, TRL, RLHF, DPO, PPO, FSDP, MoE)
- **Descriptions**: Third person, include what AND when to use

### Code Examples

Always use language detection in code blocks:
```python
# Good - has language tag
from transformers import AutoModel
```

NOT:
```
# Bad - no language tag
from transformers import AutoModel
```

### Progressive Disclosure Pattern

SKILL.md should link directly to reference files (one level deep):

```markdown
## Advanced Features

**API Reference**: See [references/api.md](references/api.md)
**Troubleshooting**: See [references/issues.md](references/issues.md)
```

## Philosophy

**Quality over Quantity**: This library maintains high standards by:
- Requiring 200-500 line SKILL.md files (focused, actionable guidance)
- Including 300KB+ documentation from official sources
- Providing real GitHub issues with solutions
- Following Anthropic's official best practices for skills
- Testing skills with real use cases before inclusion

Each skill represents expert-level knowledge distilled into a format optimized for AI agent consumption.

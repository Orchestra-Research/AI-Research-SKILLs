# Contributing to Claude AI Research Skills

Thank you for your interest in contributing! This guide will help you add new skills to the library.

---

## 🎯 What We're Building

**Vision**: The most comprehensive open-source library of AI research skills for Claude Code.

**Target**: A comprehensive library covering the entire AI research lifecycle — from ideation to paper writing.

**Current Progress**: 98 skills across 23 categories

**Philosophy**: Quality > Quantity. We deleted 9 low-quality skills to maintain high standards.

---

## 🤝 How to Contribute

### Ways to Contribute

1. **Add a new skill** - Most valuable contribution
2. **Improve existing skills** - Update docs, add examples, fix errors
3. **Report issues** - Outdated information, broken links, missing content
4. **Share feedback** - What skills do you need? What's missing?

---

## 📝 Adding a New Skill

### Step 1: Choose a Skill 
### Step 2: Fork and Clone

```bash
# Fork the repository on GitHub first
git clone https://github.com/YOUR_USERNAME/AI-research-SKILLs.git
cd claude-ai-research-skills

# Create a feature branch
git checkout -b add-vllm-skill
```

### Step 3: Use Skill Seeker MCP

**Option A: Documentation Scraping**
```bash
# Create config file
python3 cli/doc_scraper.py --interactive
# Or copy and modify an existing config
cp configs/react.json configs/vllm.json

# Scrape and build
python3 cli/doc_scraper.py --config configs/vllm.json
```

**Option B: GitHub Scraping**
```bash
# Scrape from GitHub repository
export GITHUB_TOKEN=$(gh auth token)
python3 cli/github_scraper.py --repo vllm-project/vllm --name vllm --description "High-performance LLM inference with PagedAttention"
```

**Option C: Unified Scraping** (recommended for comprehensive skills)
```bash
# Combine documentation + GitHub + PDF
python3 cli/unified_scraper.py --config configs/vllm_unified.json
```

### Step 4: Move to Correct Directory

```bash
# Determine the category (see directory structure below)
mv output/vllm/ 12-inference-serving/vllm/

# Move metadata
mv output/vllm_data/ .metadata/vllm_data/
```

### Step 5: Validate Quality

**Based on [Anthropic Official Best Practices](anthropic_official_docs/best_practices.md)**

**Core Requirements** (or skill will be rejected):
- ✅ YAML frontmatter with `name` (gerund form, e.g., "serving-llms") and `description` (third person, includes what AND when)
- ✅ SKILL.md body: **200-300 lines** (under 500 lines maximum)
- ✅ Progressive disclosure: SKILL.md as overview, details in separate reference files
- ✅ Workflows with copy-paste checklists for complex tasks
- ✅ When to use vs alternatives guidance
- ✅ Common issues section with solutions
- ✅ Concise content: assume Claude is smart, no over-explaining basics
- ✅ Code examples with language detection (```python, ```bash, etc.)

**Gold Standard** (aim for this):
- ✅ SKILL.md: 200-300 lines of focused, actionable guidance
- ✅ 2-3 complete workflows with step-by-step checklists
- ✅ Reference files for advanced topics (one level deep from SKILL.md)
- ✅ Feedback loops (validate → fix → repeat) for quality-critical operations
- ✅ Consistent terminology throughout
- ✅ Concrete examples (input/output pairs where helpful)
- ✅ Clear, concise troubleshooting guide

**NOT Acceptable**:
- ❌ SKILL.md over 500 lines (split into reference files instead)
- ❌ Over-explaining basics that Claude already knows
- ❌ First-person descriptions ("I can help you...")
- ❌ Vague skill names ("helper", "utils", "tools")
- ❌ Nested references (SKILL.md → ref1.md → ref2.md)
- ❌ Generic templates that just link to README/CHANGELOG
- ❌ Missing workflows with checklists for complex tasks
- ❌ Time-sensitive information (use "old patterns" section instead)

**Quick Quality Check**:
```bash
# Check SKILL.md has real code examples
cat 12-inference-serving/vllm/SKILL.md

# Check reference files exist
ls -lh 12-inference-serving/vllm/references/

# Verify total documentation size (should be 300KB+)
du -sh 12-inference-serving/vllm/references/
```

### YAML Frontmatter Format Standards

All SKILL.md files **must** include properly formatted YAML frontmatter with the following fields:

```yaml
---
name: skill-name-here
description: Clear description of when to use this skill
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Tag One, Tag Two, Tag Three]
dependencies: [package1>=1.0.0, package2>=2.0.0]
---
```

**Field Requirements:**

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| `name` | ✅ Yes | kebab-case | No quotes, lowercase with hyphens |
| `description` | ✅ Yes | Plain text | No quotes, concise explanation |
| `version` | ✅ Yes | Semantic version | Format: `MAJOR.MINOR.PATCH` |
| `author` | ✅ Yes | Plain text | Use "Orchestra Research" |
| `license` | ✅ Yes | License identifier | Typically `MIT` |
| `tags` | ✅ Yes | Array | Capitalized words, no quotes |
| `dependencies` | ⚠️ Optional | Array | Include version constraints |

**Tag Guidelines:**
- Use **Title Case** for all tags (capitalize first letter of each word)
- Keep acronyms **UPPERCASE** (e.g., `GRPO`, `TRL`, `RLHF`, `DPO`)
- Use descriptive, searchable terms
- Include 5-10 relevant tags
- No quotes around tags

**Example Tags:**
```yaml
tags: [Reinforcement Learning, GRPO, TRL, Post-Training, RLHF, Reward Modeling]
```

**Dependencies Guidelines:**
- Only include **direct dependencies** needed to use the skill
- Include **minimum version constraints** using `>=`
- No quotes around package names
- List core packages first, optional packages last

**Example Dependencies:**
```yaml
dependencies: [transformers>=4.47.0, trl>=0.14.0, datasets>=3.2.0, peft>=0.14.0, torch]
```

**Complete Example:**
```yaml
---
name: grpo-rl-training
description: Expert guidance for GRPO/RL fine-tuning with TRL for reasoning and task-specific model training
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Reinforcement Learning, GRPO, TRL, Post-Training, RLHF, Reward Modeling, Reasoning, DPO, PPO, Structured Output]
dependencies: [transformers>=4.47.0, trl>=0.14.0, datasets>=3.2.0, peft>=0.14.0, torch]
---
```

**Validation Checklist:**
- [ ] YAML frontmatter is present at the very beginning of SKILL.md
- [ ] All required fields are included
- [ ] No quotes around field values (except in arrays)
- [ ] Tags use Title Case (capitalized words)
- [ ] Dependencies include version constraints where appropriate
- [ ] YAML is valid (test with: `python -c "import yaml; yaml.safe_load(open('SKILL.md').read().split('---')[1])"`)

### Step 6: Update Marketplace

Add your skill to `.claude-plugin/marketplace.json` so it appears in the Claude Code plugin marketplace.

**Add a new entry to the `plugins` array:**
```json
{
  "name": "your-skill-name",
  "source": "./XX-category/skill-folder",
  "description": "Description from your SKILL.md frontmatter (what it does AND when to use it)"
}
```

**Example:**
```json
{
  "name": "serving-llms-vllm",
  "source": "./12-inference-serving/vllm",
  "description": "Serves LLMs with high throughput using vLLM's PagedAttention and continuous batching. Use when deploying production LLM APIs or optimizing inference latency/throughput."
}
```

**Validation:**
```bash
# Verify JSON is valid after editing
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
```

**Important**: Place your entry in the correct position (skills are ordered by category number).

### Step 7: Submit Pull Request

```bash
# Add your changes
git add 12-inference-serving/vllm/
git add .metadata/vllm_data/
git add .claude-plugin/marketplace.json

# Commit with descriptive message
git commit -m "Add vLLM inference serving skill

- 215 pages of documentation
- 12 GitHub issues with solutions
- API reference and examples
- Performance benchmarks included"

# Push to your fork
git push origin add-vllm-skill
```

Then create a Pull Request on GitHub with:
- **Title**: "Add [Skill Name] skill"
- **Description**:
  - What the skill covers
  - Source (docs, GitHub, or both)
  - Documentation size
  - Key features/examples included

---

## 📂 Directory Structure

Place skills in the correct category:

```
claude-ai-research-skills/
├── 0-autoresearch-skill/       # Autonomous research orchestration
├── 01-model-architecture/      # Model architectures (TorchTitan, LitGPT, Mamba, RWKV, NanoGPT)
├── 02-tokenization/            # Tokenizers (HuggingFace, SentencePiece)
├── 03-fine-tuning/             # Fine-tuning frameworks (Axolotl, LLaMA-Factory, Unsloth, PEFT)
├── 04-mechanistic-interpretability/  # Interpretability (TransformerLens, SAELens, NNsight, Pyvene)
├── 05-data-processing/         # Data curation and processing
├── 06-post-training/           # RLHF, DPO, GRPO, PPO
├── 07-safety-alignment/        # Guardrails, safety, content moderation
├── 08-distributed-training/    # Megatron-Core, DeepSpeed, FSDP, distributed systems
├── 09-infrastructure/          # Modal, SkyPilot, Lambda Labs
├── 10-optimization/            # Flash Attention, bitsandbytes, quantization
├── 11-evaluation/              # Benchmarks, evaluation frameworks
├── 12-inference-serving/       # vLLM, TensorRT-LLM, llama.cpp, SGLang
├── 13-mlops/                   # Weights & Biases, MLflow, TensorBoard, SwanLab
├── 14-agents/                  # LangChain, LlamaIndex, CrewAI, AutoGPT, A-Evolve
├── 15-rag/                     # RAG pipelines, vector databases
├── 16-prompt-engineering/      # DSPy, Instructor, Guidance, Outlines
├── 17-observability/           # LangSmith, Phoenix, monitoring
├── 18-multimodal/              # CLIP, Whisper, LLaVA, Stable Diffusion, SAM, robotics policies
├── 19-emerging-techniques/     # MoE, model merging, long context
├── 20-ml-paper-writing/        # ML & systems paper writing, plotting, talks
├── 21-research-ideation/       # Brainstorming and creative thinking
└── 22-agent-native-research-artifact/  # ARA compiler, research manager, rigor reviewer
```

---

## 📋 Skill Structure Template

Use [SKILL_TEMPLATE.md](docs/SKILL_TEMPLATE.md) as a starting point. Each skill should contain:

```
skill-name/
├── SKILL.md                    # Quick reference (50-150 lines)
│   ├── Metadata (name, description, version)
│   ├── When to use this skill
│   ├── Quick start examples
│   ├── Common patterns
│   └── Links to references
│
├── references/                 # Deep documentation (300KB+)
│   ├── README.md              # From GitHub/official docs
│   ├── api.md                 # API reference
│   ├── tutorials.md           # Step-by-step guides
│   ├── issues.md              # Real GitHub issues (if applicable)
│   ├── releases.md            # Version history (if applicable)
│   └── file_structure.md      # Codebase navigation (if applicable)
│
├── scripts/                    # Helper scripts (optional)
└── assets/                     # Templates & examples (optional)
```

---

## 🔍 Quality Standards

### Code Examples

All code examples MUST have language detection:

✅ **Good**:
````markdown
```python
from transformers import AutoModel
model = AutoModel.from_pretrained("gpt2")
```
````

❌ **Bad**:
````markdown
```
from transformers import AutoModel
model = AutoModel.from_pretrained("gpt2")
```
````

### Documentation Size

- **Minimum**: 100KB total in references/
- **Target**: 300KB+ total
- **Gold Standard**: 500KB+ with issues, releases, examples

### Real-World Content

Prefer skills with:
- ✅ Real GitHub issues and solutions
- ✅ Release notes and breaking changes
- ✅ Community discussions
- ✅ Performance benchmarks
- ✅ Troubleshooting guides

### Links and Citations

Always include:
- ✅ Official documentation link
- ✅ GitHub repository link
- ✅ License information
- ✅ Version/release information

---

## 🧪 Testing

Before submitting, verify:

```bash
# 1. SKILL.md is well-formatted
cat your-skill/SKILL.md

# 2. All reference files exist
ls -R your-skill/references/

# 3. Documentation size is adequate (300KB+ target)
du -sh your-skill/references/

# 4. Code blocks have language tags
grep -A 1 '```' your-skill/SKILL.md | head -20

# 5. No broken links (manual check)
# Open SKILL.md and verify all [links](urls) work

# 6. Marketplace entry added and valid
python3 -c "import json; json.load(open('.claude-plugin/marketplace.json'))"
```

---

## 🎓 Examples of High-Quality Skills

**Gold Standard** (emulate this):
1. **06-post-training/grpo-rl-training/** (569 lines) ⭐⭐⭐⭐⭐
   - Complete implementation workflow
   - 10+ code examples with explanations
   - Troubleshooting guide
   - Common pitfalls and solutions
   - Performance tips
   - **This is the quality bar**

**Good Examples**:
2. **03-fine-tuning/axolotl/** (151 lines)
   - Real configuration examples
   - When to use guidance
   - Comprehensive but could add more workflows

3. **08-distributed-training/deepspeed/** (132 lines)
   - ZeRO optimization patterns
   - Configuration examples
   - Good foundation, needs more troubleshooting

---

## 🚫 What NOT to Contribute

- ❌ Proprietary/closed-source tools
- ❌ Deprecated libraries (unless historically important)
- ❌ Duplicate skills (check existing skills first)
- ❌ Incomplete skills (<50 lines SKILL.md, <100KB refs)
- ❌ Skills without code examples

---

## 🎖️ Recognition

All contributors will be:
- ✅ Listed in [CONTRIBUTORS.md](CONTRIBUTORS.md)
- ✅ Mentioned in release notes
- ✅ Featured on project homepage (when launched)
- ✅ Attributed in SKILL.md metadata

**Top contributors** (5+ skills) receive special recognition and maintainer status.

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/claude-ai-research-skills/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/claude-ai-research-skills/discussions)
- **Questions**: Open a discussion with "Question:" prefix

---

## 📅 Review Process

1. **Automated Checks** (when implemented):
   - File structure validation
   - Code block language detection
   - Documentation size check
   - Marketplace.json validation

2. **Manual Review** (by maintainers):
   - Content quality and accuracy
   - Code example validity
   - Proper categorization
   - License compliance

3. **Feedback Loop**:
   - Reviews within 48-72 hours
   - Constructive feedback provided
   - Iterate until approved

4. **Merge**:
   - Merged to main branch
   - Added to release notes
   - Contributor recognized

---

## 🙏 Thank You!

Your contributions help the entire AI research community. Every skill added makes Claude Code more powerful for researchers, engineers, and students worldwide.

**Let's build something amazing together!** 🚀

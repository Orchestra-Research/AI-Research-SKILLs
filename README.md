# AI Research Engineering `Skills` Library

> **The most comprehensive open-source library of AI research engineering skills for AI agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Skills](https://img.shields.io/badge/Skills-54-blue.svg)](.)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Blog Post](https://img.shields.io/badge/Blog-Read%20More-orange.svg)](https://www.orchestra-research.com/perspectives/ai-research-skills)

## Our Mission

**Enable AI agents to autonomously conduct AI research**—from hypothesis to experimental verification. 
We provide the layer of **Engineering Ability** that empower **AI research agents** to conduct experiments, including preparing datasets, executing training pipelines, deploying models, and validating scientific hypotheses.
<p align="center">
  <img src="docs/skills.png" alt="AI Research Agent System" width="50%">
  <br>
  <em>System diagram of an AI research agent</em>
</p>

## Path Towards AI Research Agent


Modern AI research requires mastering dozens of specialized tools and frameworks. 
AI Researchers spend more time debugging infrastructure than testing hypotheses—slowing the pace of scientific discovery. 
We provide a comprehensive library of expert-level research engineering skills that enable AI agents to autonomously implement and execute different stages of AI research experiments—from data preparation and model training to evaluation and deployment.
  - Specialized Expertise - Each skill provides deep, production-ready knowledge of a specific framework (Megatron-LM, vLLM, TRL, etc.)
  - End-to-End Coverage - 54/70 skills spanning model architecture, tokenization, fine-tuning, data processing, post-training, distributed training, optimization, inference, agents, RAG, multimodal, prompt engineering, MLOps, and emerging techniques
  - Research-Grade Quality - Documentation sourced from official repos, real GitHub issues, and battle-tested production workflows

## 📚 Available Skills (54/70 roadmap)

**Quality over quantity**: Each skill provides comprehensive, expert-level guidance with real code examples, troubleshooting guides, and production-ready workflows.

### 🏗️ Model Architecture (5 skills)
- **[LitGPT](01-model-architecture/litgpt/)** - Lightning AI's 20+ clean LLM implementations with production training recipes (462 lines + 4 refs)
- **[Mamba](01-model-architecture/mamba/)** - State-space models with O(n) complexity, 5× faster than Transformers (253 lines + 3 refs)
- **[RWKV](01-model-architecture/rwkv/)** - RNN+Transformer hybrid, infinite context, Linux Foundation project (253 lines + 3 refs)
- **[NanoGPT](01-model-architecture/nanogpt/)** - Educational GPT in ~300 lines by Karpathy (283 lines + 3 refs)

### 🔤 Tokenization (2 skills)
- **[HuggingFace Tokenizers](02-tokenization/huggingface-tokenizers/)** - Rust-based, <20s/GB, BPE/WordPiece/Unigram algorithms (486 lines + 4 refs)
- **[SentencePiece](02-tokenization/sentencepiece/)** - Language-independent, 50k sentences/sec, used by T5/ALBERT (228 lines + 2 refs)

### 🎯 Fine-Tuning (3 skills)
- **[Axolotl](03-fine-tuning/axolotl/)** - YAML-based fine-tuning with 100+ models (156 lines + 4 refs)
- **[LLaMA-Factory](03-fine-tuning/llama-factory/)** - WebUI no-code fine-tuning (78 lines + 5 refs)
- **[Unsloth](03-fine-tuning/unsloth/)** - 2x faster QLoRA fine-tuning (75 lines + 4 refs)

### 📊 Data Processing (2 skills)
- **[Ray Data](05-data-processing/ray-data/)** - Distributed ML data processing, streaming execution, GPU support (318 lines + 2 refs)
- **[NeMo Curator](05-data-processing/nemo-curator/)** - GPU-accelerated data curation, 16× faster deduplication (375 lines + 2 refs)

### 🎓 Post-Training (4 skills)
- **[TRL Fine-Tuning](06-post-training/trl-fine-tuning/)** - Transformer Reinforcement Learning (447 lines + 4 refs)
- **[GRPO-RL-Training](06-post-training/grpo-rl-training/)** (TRL) - Group Relative Policy Optimization with TRL (569 lines, **gold standard**)
- **[OpenRLHF](06-post-training/openrlhf/)** - Full RLHF pipeline with Ray + vLLM (241 lines + 4 refs)
- **[SimPO](06-post-training/simpo/)** - Simple Preference Optimization, no reference model needed (211 lines + 3 refs)

### 🛡️ Safety & Alignment (3 skills)
- **[Constitutional AI](07-safety-alignment/constitutional-ai/)** - AI-driven self-improvement via principles (282 lines)
- **[LlamaGuard](07-safety-alignment/llamaguard/)** - Safety classifier for LLM inputs/outputs (329 lines)
- **[NeMo Guardrails](07-safety-alignment/nemo-guardrails/)** - Programmable guardrails with Colang (289 lines)

### ⚡ Distributed Training (5 skills)
- **[Megatron-Core](01-model-architecture/megatron-core/)** - NVIDIA's framework for training 2B-462B param models with 47% MFU on H100 (359 lines + 4 refs)
- **[DeepSpeed](08-distributed-training/deepspeed/)** - Microsoft's ZeRO optimization (137 lines + 9 refs)
- **[PyTorch FSDP](08-distributed-training/pytorch-fsdp/)** - Fully Sharded Data Parallel (124 lines + 2 refs)
- **[Accelerate](08-distributed-training/accelerate/)** - HuggingFace's 4-line distributed training API (324 lines + 3 refs)
- **[PyTorch Lightning](08-distributed-training/pytorch-lightning/)** - High-level training framework with Trainer class (339 lines + 3 refs)
- **[Ray Train](08-distributed-training/ray-train/)** - Multi-node orchestration and hyperparameter tuning (399 lines + 1 ref)

### 🚀 Optimization (3 skills)
- **[Flash Attention](10-optimization/flash-attention/)** - 2-4x faster attention with memory efficiency (359 lines + 2 refs)
- **[bitsandbytes](10-optimization/bitsandbytes/)** - 8-bit/4-bit quantization for 50-75% memory reduction (403 lines + 3 refs)
- **[GPTQ](10-optimization/gptq/)** - 4-bit post-training quantization, 4× memory reduction, <2% accuracy loss (443 lines + 3 refs)

### 📊 Evaluation (1 skill)
- **[lm-evaluation-harness](11-evaluation/lm-evaluation-harness/)** - EleutherAI's standard for benchmarking LLMs across 60+ tasks (482 lines + 4 refs)

### 🔥 Inference & Serving (4 skills)
- **[vLLM](12-inference-serving/vllm/)** - High-throughput LLM serving with PagedAttention (356 lines + 4 refs, **production-ready**)
- **[TensorRT-LLM](12-inference-serving/tensorrt-llm/)** - NVIDIA's fastest inference, 24k tok/s, FP8/INT4 quantization (180 lines + 3 refs)
- **[llama.cpp](12-inference-serving/llama-cpp/)** - CPU/Apple Silicon inference, GGUF quantization (251 lines + 3 refs)
- **[SGLang](12-inference-serving/sglang/)** - Structured generation with RadixAttention, 5-10× faster for agents (435 lines + 3 refs)

### 🤖 Agents (2 skills)
- **[LangChain](14-agents/langchain/)** - Most popular agent framework, 500+ integrations, ReAct pattern (658 lines + 3 refs, **production-ready**)
- **[LlamaIndex](14-agents/llamaindex/)** - Data framework for LLM apps, 300+ connectors, RAG-focused (535 lines + 3 refs)

### 🔍 RAG (4 skills)
- **[Chroma](15-rag/chroma/)** - Open-source embedding database, local/cloud, 24k stars (385 lines + 1 ref)
- **[FAISS](15-rag/faiss/)** - Facebook's similarity search, billion-scale, GPU acceleration (295 lines)
- **[Sentence Transformers](15-rag/sentence-transformers/)** - 5000+ embedding models, multilingual, 15k stars (370 lines)
- **[Pinecone](15-rag/pinecone/)** - Managed vector database, auto-scaling, <100ms latency (410 lines)

### 🎨 Multimodal (3 skills)
- **[CLIP](18-multimodal/clip/)** - OpenAI's vision-language model, zero-shot classification, 25k stars (320 lines)
- **[Whisper](18-multimodal/whisper/)** - Robust speech recognition, 99 languages, 73k stars (395 lines)
- **[LLaVA](18-multimodal/llava/)** - Vision-language assistant, image chat, GPT-4V level (360 lines)

### 🎯 Prompt Engineering (4 skills)
- **[DSPy](16-prompt-engineering/dspy/)** - Declarative prompt programming with optimizers, Stanford NLP, 22k stars (438 lines + 3 refs)
- **[Instructor](16-prompt-engineering/instructor/)** - Structured LLM outputs with Pydantic validation, 15k stars (726 lines + 3 refs)
- **[Guidance](16-prompt-engineering/guidance/)** - Constrained generation with regex/grammars, Microsoft Research, 18k stars (485 lines + 3 refs)
- **[Outlines](16-prompt-engineering/outlines/)** - Structured text with FSM, zero-overhead, 8k stars (601 lines + 3 refs)

### 📊 MLOps (3 skills)
- **[Weights & Biases](13-mlops/weights-and-biases/)** - Experiment tracking, sweeps, artifacts, model registry (427 lines + 3 refs)
- **[MLflow](13-mlops/mlflow/)** - Model registry, tracking, deployment, autologging (514 lines + 3 refs)
- **[TensorBoard](13-mlops/tensorboard/)** - Visualization, profiling, embeddings, scalars/images (538 lines + 3 refs)

### 🔬 Emerging Techniques (6 skills)
- **[MoE Training](19-emerging-techniques/moe-training/)** - Mixture of Experts training with DeepSpeed, Mixtral 8x7B, 5× cost reduction (515 lines + 3 refs)
- **[Model Merging](19-emerging-techniques/model-merging/)** - Combine models with TIES, DARE, SLERP using mergekit (528 lines + 3 refs)
- **[Long Context](19-emerging-techniques/long-context/)** - Extend context windows with RoPE, YaRN, ALiBi, 32k-128k tokens (624 lines + 3 refs)
- **[Speculative Decoding](19-emerging-techniques/speculative-decoding/)** - 1.5-3.6× faster inference with Medusa, Lookahead (379 lines)
- **[Knowledge Distillation](19-emerging-techniques/knowledge-distillation/)** - Compress models 70B→7B with MiniLLM, temperature scaling (424 lines)
- **[Model Pruning](19-emerging-techniques/model-pruning/)** - 50% sparsity with Wanda, SparseGPT, <1% accuracy loss (417 lines)

---

## 🚀 How to Use These Skills

### 🎯 Using with Orchestra

All 54 skills in this repo are automatically synced to [Orchestra Research](https://www.orchestra-research.com/research-skills), where you can add them to your projects with one click and use them with AI research agents.

**Example use case**: The [Vibe Fine-tuning LLMs](https://www.orchestra-research.com/perspectives/LLM-with-Orchestra) case study shows reproducing LoRA research through natural language conversation - the agent handled code writing, GPU provisioning, and experiment execution autonomously. ([Video demo](https://www.youtube.com/watch?v=X0DoLYfXl5I))

**Note**: When you contribute a skill to this repo via PR, it automatically syncs to the Orchestra marketplace after merge.

### 🛠️ Alternative Usage Methods

**For Claude Users** (Claude.ai, Claude Code):
```bash
# 1. Download skill folder
cd 01-model-architecture/litgpt

# 2. Use directly in Claude Code workspace
# OR zip and upload to Claude.ai Projects
zip -r litgpt-skill.zip SKILL.md references/
```

**For Other AI Coding Assistants**:
- **Gemini CLI**: Point to skill directory in your workspace
- **Grok Code**: Use skill folder as context
- **Cursor/Windsurf**: Add skill folder to project knowledge

**For Custom RAG/Agent Systems**:
- Ingest `SKILL.md` + `references/` into your knowledge base
- Use as retrieval context for specialized queries
- Build domain-specific agents with curated skill subsets

### 🎓 For Learning & Reference

1. **Clone this repository**:
```bash
git clone https://github.com/zechenzhangAGI/claude-ai-research-skills.git
cd claude-ai-research-skills
```

2. **Browse skills** - Each directory contains:
   - `SKILL.md` - Expert-level guidance (100-600 lines)
   - `references/` - Supporting documentation from official sources
   - Real code examples, workflows, and troubleshooting guides

### 👨‍💻 For Skill Creators

**Your contributions power the entire ecosystem!** When you contribute a skill to this repo:
1. It automatically syncs to [Orchestra marketplace](https://www.orchestra-research.com/research-skills)
2. Thousands of researchers can use your expertise
3. AI agents become more capable at conducting research

**Getting started**:
1. **Read [CONTRIBUTING.md](CONTRIBUTING.md)** - Step-by-step guide
2. **Use [SKILL_TEMPLATE.md](SKILL_TEMPLATE.md)** - Copy-paste scaffold
3. **Run validation**: `python scripts/validate_skill.py your-skill/`
4. **Submit PR** - We review within 48 hours, auto-publish to Orchestra on merge

## 📖 Skill Structure

Each skill follows a battle-tested format for maximum usefulness:

```
skill-name/
├── SKILL.md                    # Quick reference (50-150 lines)
│   ├── Metadata (name, description, version)
│   ├── When to use this skill
│   ├── Quick patterns & examples
│   └── Links to references
│
├── references/                 # Deep documentation (300KB+)
│   ├── README.md              # From GitHub/official docs
│   ├── api.md                 # API reference
│   ├── tutorials.md           # Step-by-step guides
│   ├── issues.md              # Real GitHub issues & solutions
│   ├── releases.md            # Version history & breaking changes
│   └── file_structure.md      # Codebase navigation
│
├── scripts/                    # Helper scripts (optional)
└── assets/                     # Templates & examples (optional)
```

<details>
<summary><b>Quality Standards</b></summary>

- 300KB+ documentation from official sources
- Real GitHub issues & solutions (when available)
- Code examples with language detection
- Version history & breaking changes
- Links to official docs

</details>

## 🗺️ Roadmap

We're building towards 70 comprehensive skills across the full AI research lifecycle. See our [detailed roadmap](ROADMAP.md) for the complete development plan.

**Current Progress**: 54 high-quality skills | **Target**: 70 skills

**Priority Areas**:
- ~~🤖 **Applications** (CRITICAL) - LangChain, RAG, agents~~ ✅ COMPLETED
- ~~🎯 **Prompt Engineering** (CRITICAL) - DSPy, Instructor, Guidance, Outlines~~ ✅ COMPLETED
- 🧠 **Advanced Optimization** (HIGH) - AWQ, HQQ, activation offloading
- 🎨 **Multimodal Extensions** (MEDIUM) - Stable Diffusion, BLIP-2

[View Full Roadmap →](ROADMAP.md)

<details>
<summary><b>View Detailed Statistics</b></summary>

| Metric | Current | Target |
|--------|---------|--------|
| **Skills** | **54** (high-quality, standardized YAML) | 70 |
| **Avg Lines/Skill** | **435 lines** (focused + progressive disclosure) | 200-600 lines |
| **Documentation** | **~85,000 lines** total (SKILL.md + references) | 95,000+ lines |
| **Gold Standard Skills** | **42** with comprehensive references | 50+ |
| **Contributors** | 1 | 100+ |
| **Coverage** | Architecture, Tokenization, Fine-Tuning, Data Processing, Post-Training, Safety, Distributed, Optimization, Evaluation, Inference, Agents, RAG, Multimodal, Prompt Engineering, MLOps | Full Lifecycle |

**Recent Progress**: +3 MLOps skills (Weights & Biases, MLflow, TensorBoard), comprehensive experiment tracking, model registry, and visualization coverage

**Philosophy**: Quality > Quantity. Following [Anthropic official best practices](anthropic_official_docs/best_practices.md) - each skill provides 200-500 lines of focused, actionable guidance with progressive disclosure.

</details>


## 🤝 Contributing

We welcome contributions from the AI research community! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on:

- Adding new skills
- Improving existing skills
- Quality standards and best practices
- Submission process

All contributors are featured in our [Contributors Hall of Fame](CONTRIBUTORS.md) 🌟
 

## 🏗️ Repository Structure

```
claude-ai-research-skills/
├── README.md                    ← You are here
├── CONTRIBUTING.md              ← Contribution guide
├── SKILL_TEMPLATE.md            ← Skill scaffold
├── ROADMAP.md                   ← Development roadmap
│
├── 01-model-architecture/       (5 skills ✓ - Megatron, LitGPT, Mamba, RWKV, NanoGPT)
├── 02-tokenization/             (2 skills ✓ - HuggingFace Tokenizers, SentencePiece)
├── 03-fine-tuning/              (3 skills ✓ - Axolotl, LLaMA-Factory, Unsloth)
├── 05-data-processing/          (2 skills ✓ - Ray Data, NeMo Curator)
├── 06-post-training/            (4 skills ✓ - TRL, GRPO, OpenRLHF, SimPO)
├── 07-safety-alignment/         (3 skills ✓ - Constitutional AI, LlamaGuard, NeMo Guardrails)
├── 08-distributed-training/     (5 skills ✓ - DeepSpeed, FSDP, Accelerate, Lightning, Ray Train)
├── 10-optimization/             (3 skills ✓ - Flash Attention, bitsandbytes, GPTQ)
├── 11-evaluation/               (1 skill ✓ - lm-evaluation-harness)
├── 12-inference-serving/        (4 skills ✓ - vLLM, TensorRT-LLM, llama.cpp, SGLang)
├── 13-mlops/                    (3 skills ✓ - Weights & Biases, MLflow, TensorBoard)
├── 14-agents/                   (2 skills ✓ - LangChain, LlamaIndex)
├── 15-rag/                      (4 skills ✓ - Chroma, FAISS, Sentence Transformers, Pinecone)
├── 16-prompt-engineering/       (4 skills ✓ - DSPy, Instructor, Guidance, Outlines)
├── 17-observability/            (planned)
├── 18-multimodal/               (3 skills ✓ - CLIP, Whisper, LLaVA)
└── 19-emerging-techniques/      (planned)
```

## 🎯 Use Cases

### For Researchers
"I need to fine-tune Llama 3 with custom data"
→ **03-fine-tuning/axolotl/** - YAML configs, 100+ model support

### For ML Engineers
"How do I optimize inference latency?"
→ **12-inference-serving/vllm/** - PagedAttention, batching

### For Students
"I want to learn how transformers work"
→ **01-model-architecture/litgpt/** - Clean implementations

### For Teams
"We need to scale training to 100 GPUs"
→ **08-distributed-training/deepspeed/** - ZeRO stages, 3D parallelism

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

**Note**: Individual skills may reference libraries with different licenses. Please check each project's license before use.

## 🙏 Acknowledgments

Built with:
- **[Claude Code](https://www.claude.com/product/claude-code)** - AI pair programming
- **[Skill Seeker](https://github.com/yusufkaraaslan/Skill_Seekers)** - Automated doc scraping
- **Open Source AI Community** - For amazing tools and docs

Special thanks to:
- EleutherAI, HuggingFace, NVIDIA, Lightning AI, Meta AI, Anthropic
- All researchers who maintain excellent documentation

## 📞 Get Involved

- **Issues**: [Report bugs or request skills](https://github.com/zechenzhangAGI/claude-ai-research-skills/issues)
- **Discussions**: [Ask questions & share ideas](https://github.com/zechenzhangAGI/claude-ai-research-skills/discussions)
- **Star**: Help others discover this project
- **Fork**: Build your own skill collection


## 📈 Recent Updates

<details>
<summary><b>November 15, 2025 - v0.6.0</b></summary>

- 📊 Added 3 comprehensive MLOps skills: Weights & Biases, MLflow, TensorBoard
- ✨ New MLOps category (3 skills - experiment tracking, model registry, visualization)
- 📝 ~10,000 new lines of documentation across 13 files
- 🔧 Comprehensive coverage: experiment tracking, hyperparameter sweeps, model registry, profiling, embeddings visualization
- **54 total skills** (77% towards 70-skill target)

</details>

<details>
<summary><b>November 12, 2025 - v0.5.0</b></summary>

- 🎯 Added 4 comprehensive prompt engineering skills: DSPy, Instructor, Guidance, Outlines
- ✨ New Prompt Engineering category (4 skills - DSPy, Instructor, Guidance, Outlines)
- 📝 ~10,000 new lines of documentation across 16 files
- 🔧 Comprehensive coverage: declarative programming, structured outputs, constrained generation, FSM-based generation
- **47 total skills** (67% towards 70-skill target)

</details>

<details>
<summary><b>November 9, 2025 - v0.4.0</b></summary>

- 🤖 Added 11 comprehensive skills: LangChain, LlamaIndex, Chroma, FAISS, Sentence Transformers, Pinecone, CLIP, Whisper, LLaVA
- ✨ New Agents category (2 skills - LangChain, LlamaIndex)
- 🔍 New RAG category (4 skills - Chroma, FAISS, Sentence Transformers, Pinecone)
- 🎨 New Multimodal category (3 skills - CLIP, Whisper, LLaVA)
- 📝 ~15,000 new lines of documentation
- **43 total skills** (61% towards 70-skill target)

</details>

<details>
<summary><b>November 8, 2025 - v0.3.0</b></summary>

- 🚀 Added 8 comprehensive skills: TensorRT-LLM, llama.cpp, SGLang, GPTQ, HuggingFace Tokenizers, SentencePiece, Ray Data, NeMo Curator
- ⚡ Completed Inference & Serving category (4/4 skills)
- 🔤 New Tokenization category (2 skills)
- 📊 New Data Processing category (2 skills)
- 📝 9,617 new lines of documentation across 30 files
- **32 total skills** (45% towards 70-skill target)

</details>

<details>
<summary><b>November 6, 2025 - v0.2.0</b></summary>

- Added 10 skills from GitHub (Megatron-Core, Lightning, Ray Train, etc.)
- Improved skill structure with comprehensive references
- Created strategic roadmap to 70 skills
- Added contribution guidelines

</details>

<details>
<summary><b>November 3, 2025 - v0.1.0</b></summary>

- 🎉 Initial release with 5 fine-tuning skills

</details>
 

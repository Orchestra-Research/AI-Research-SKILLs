# AI Research Skills - Demo Gallery

> **Curated collection of demo repositories showcasing skills in action**

Each demo is a standalone repository demonstrating how to use specific skills from this library to accomplish real AI research tasks. Demos include complete code, results, analysis, and documentation.

---

## Available Demos

### 1. NeMo Evaluator: GPQA Diamond Benchmark

**Repository:** [zechenzhangAGI/Nemo-Eval-Skill-Demo](https://github.com/zechenzhangAGI/Nemo-Eval-Skill-Demo)

**Skills Used:** [NeMo Evaluator](../11-evaluation/nemo-evaluator/)

**What It Does:**
Compares Llama models (8B, 70B, 405B) on the GPQA Diamond benchmark—198 graduate-level science questions. Demonstrates end-to-end evaluation workflow using NVIDIA NeMo Evaluator.

**Key Results:**
| Model | Accuracy | Notes |
|-------|----------|-------|
| Llama-3.1-8B-Instruct | 27.3% | 20.7% extraction failures |
| Llama-3.3-70B-Instruct | 48.0% | Clean extraction |
| Llama-3.1-405B-Instruct | 53.0% | Best performance |

**What You'll Learn:**
- Setting up NeMo Evaluator with NVIDIA Build API
- Writing evaluation configs for different models
- Analyzing benchmark results across model scales
- Creating visualizations (accuracy plots, Venn diagrams, failure taxonomy)

**Repository Contents:**
```
├── configs/           # YAML configs for each model
├── results/           # Raw evaluation outputs
├── analysis/          # Analysis scripts and visualizations
│   ├── model_accuracy.png
│   ├── failure_taxonomy_plot.png
│   └── venn_diagrams.png
└── README.md          # Full documentation
```

---

### 2. Reproducing "LoRA Without Regret" with AI Agents

**Repository:** Featured on [Orchestra Research Blog](https://www.orchestra-research.com/perspectives/LLM-with-Orchestra)

**Skills Used:** [GRPO RL Training](../06-post-training/grpo-rl-training/), [TRL Fine-Tuning](../06-post-training/trl-fine-tuning/)

**What It Does:**
Reproduces Thinking Machines Lab's "LoRA Without Regret" paper findings **entirely through prompting an AI agent**. The agent autonomously:
- Writes training code for both SFT and GRPO reinforcement learning
- Provisions H100 GPUs and runs experiments overnight
- Performs LoRA rank ablation studies (rank 1 through 256)
- Generates publication-ready analysis and visualizations

**Why It's Impressive:**
A researcher simply described the paper they wanted to reproduce, and the AI agent handled everything—from understanding the methodology to executing multi-day GPU experiments to analyzing results. No manual coding required.

**What You'll Learn:**
- How to prompt AI agents for autonomous research reproduction
- End-to-end SFT and GRPO training pipelines
- LoRA vs full fine-tuning experimental design
- Automated analysis and reporting

**Resources:**
- [Blog Post](https://www.orchestra-research.com/perspectives/LLM-with-Orchestra) - Full walkthrough
- [Video Demo](https://www.youtube.com/watch?v=X0DoLYfXl5I) - See the agent in action

---

### 3. Layer-Wise Quantization Experiment

**Repository:** [AmberLJC/llama-quantization-experiment](https://github.com/AmberLJC/llama-quantization-experiment)

**Skills Used:** [llama.cpp](../12-inference-serving/llama-cpp/), [GGUF](../10-optimization/gguf/)

**What It Does:**
Investigates optimal layer precision allocation for quantized LLMs. Demonstrates that early layers at Q8 achieve 1.9× compression with only 1.3% perplexity loss—showing not all layers are created equal when it comes to quantization.

**What You'll Learn:**
- Layer-wise quantization strategies for LLMs
- Measuring perplexity impact of different precision levels per layer
- Using llama.cpp and GGUF for quantization experiments
- Identifying which layers are most sensitive to reduced precision

---

### 4. Cross-Lingual Alignment Analysis

**Repository:** [AmberLJC/faiss-demo](https://github.com/AmberLJC/faiss-demo)

**Skills Used:** [FAISS](../15-rag/faiss/)

**What It Does:**
Quantifies how well multilingual embeddings align semantic concepts across 8 languages using FAISS similarity search. Reveals the structure of cross-lingual representations and where alignment breaks down.

**What You'll Learn:**
- Building and querying FAISS indexes for multilingual embeddings
- Measuring cross-lingual semantic alignment quality
- Analyzing embedding space structure across languages
- Using similarity search to evaluate multilingual models

---

### 5. Autoresearch: Embedding Norm Heterogeneity Drives LoRA Brittleness

**Paper:** [autoresearch-norm-heterogeneity/](autoresearch-norm-heterogeneity/)

**Skills Used:** [Autoresearch](../0-autoresearch-skill/), [ML Paper Writing](../20-ml-paper-writing/), [Research Ideation](../21-research-ideation/)

**What It Does:**
An AI agent ran the full autoresearch workflow autonomously. Starting from a hypothesis about ETF crystallization, the agent discovered a null result — ETF overlaps do NOT predict fine-tuning difficulty — then **pivoted** to identify embedding norm heterogeneity as the actual causal predictor (r=-0.99 at 1.4B scale). The agent wrote the paper end-to-end.

**Why It's Impressive:**
The research pivot was autonomous. The agent refuted its own starting hypothesis, identified a better predictor, validated it causally (equalizing norms improves fine-tunability by 79%), and wrote a paper with a stronger finding than the original plan.

---

### 6. Autoresearch: The RL Algorithm Brain Scan

**Paper:** [autoresearch-rl-brain-scan/](autoresearch-rl-brain-scan/)

**Skills Used:** [Autoresearch](../0-autoresearch-skill/), [GRPO RL Training](../06-post-training/grpo-rl-training/), [TRL](../06-post-training/trl-fine-tuning/), [SAELens](../04-mechanistic-interpretability/saelens/), [TransformerLens](../04-mechanistic-interpretability/transformer-lens/), [ML Paper Writing](../20-ml-paper-writing/)

**What It Does:**
An AI agent systematically compared what RLOO, GRPO, and DPO do to model internals using SVD analysis of weight deltas and SAE feature overlap. Key discovery: DPO is a rank-1 perturbation (one SVD direction recovers 95.6% of its behavioral effect), while online RL methods produce distributed, structure-preserving changes.

**Why It's Impressive:**
The agent orchestrated multiple domain skills (RL training, mechanistic interpretability, paper writing) across the full research lifecycle. The insight that "DPO is rank-1 alignment" is a conceptual contribution that emerged from the outer synthesis loop — not just metric optimization.

---

### 7. Scientific Plotting: Publication-Quality Figures

**Demo:** [scientific-plotting-demo/](scientific-plotting-demo/)

**Skills Used:** [Academic Plotting](../20-ml-paper-writing/academic-plotting/)

**What It Does:**
Generates all key figures for the [Andes QoE-aware LLM serving paper](https://arxiv.org/abs/2404.16283) using both workflows from the academic-plotting skill:
- **Workflow 1 (Gemini AI):** System architecture diagram using `gemini-3-pro-image-preview` with 6-section prompt structure, Style B "Modern Minimal", and Nord palette — 3 non-deterministic attempts with best-of-3 selection
- **Workflow 2 (matplotlib):** Five data-driven figures — QoE definition illustration, 3-panel CDF comparison, 4x3 multi-panel burst intensity grid, summary bar charts — all with publication rcParams, colorblind-safe palette, and PDF+PNG export

**Key Results:**
| Metric | Result |
|--------|--------|
| QoE improvement over vLLM | **4.7x** |
| GPU resource savings | **61%** |
| Gemini text accuracy | **100%** (all labels spelled correctly) |
| Figures generated | **6** (1 AI diagram + 5 data charts) |

**What You'll Learn:**
- Crafting 6-section Gemini prompts for architecture diagrams
- Multi-attempt generation with evaluation rubric
- Publication-quality matplotlib figures with venue-specific styling
- Colorblind-safe palettes, multi-panel layouts, and dual PDF/PNG export

**Repository Contents:**
```
scientific-plotting-demo/
├── README.md                                # Full demo documentation with all figures
└── figures/
    ├── gen_fig_andes_architecture_gemini.py  # Gemini AI diagram script
    ├── gen_fig_andes_workflow.py             # matplotlib architecture alternative
    ├── gen_fig_experiment_results.py         # Data charts (CDF, grid, bars, QoE)
    ├── fig_andes_architecture*.png           # Gemini outputs (best + 3 attempts)
    ├── fig_cdf_comparison.{pdf,png}          # 3-panel CDF
    ├── fig_burst_intensity.{pdf,png}         # 4x3 multi-panel grid
    ├── fig_qoe_definition.{pdf,png}          # QoE metric illustration
    └── fig_summary_improvements.{pdf,png}    # Summary bar charts
```

---

## Coming Soon

### ML Paper Writing: From Repo to Publication

**Skills Used:** [ML Paper Writing](../20-ml-paper-writing/)

**What It Will Do:**
Transform a research repository with experimental results into a publication-ready paper for top ML conferences (NeurIPS, ICML, ICLR).

*Status: In development*

---

## How Demos Are Organized

Each demo repository follows a consistent structure:

```
demo-name/
├── README.md              # Overview, results summary, how to run
├── configs/               # Configuration files
├── results/               # Raw outputs and data
├── analysis/              # Scripts and visualizations
├── .env.example           # Required environment variables
└── requirements.txt       # Python dependencies (if applicable)
```

**Design Principles:**
- **Self-contained**: Clone and run without external dependencies (except API keys)
- **Reproducible**: Clear instructions to replicate results
- **Educational**: Explains the "why" not just the "how"
- **Real results**: Actual outputs, not mock data

---

## Contributing a Demo

Want to showcase a skill? We welcome demo contributions!

**Requirements:**
1. Uses one or more skills from this library
2. Produces meaningful, reproducible results
3. Includes clear documentation
4. Has visual outputs (plots, tables, reports)

**To contribute:**
1. Create your demo repository
2. Follow the structure above
3. Open an issue or PR to add it to this index

---

## Quick Links

- [Main Skills Library](../README.md)
- [All 87 Skills](../README.md#available-ai-research-engineering-skills)
- [Contributing Guide](../CONTRIBUTING.md)

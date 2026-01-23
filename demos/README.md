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

## Coming Soon

### 3. ML Paper Writing: From Repo to Publication

**Skills Used:** [ML Paper Writing](../20-ml-paper-writing/)

**What It Will Do:**
Transform a research repository with experimental results into a publication-ready paper for top ML conferences (NeurIPS, ICML, ICLR).

**Planned Contents:**
- Source research repo with code and results
- Generated paper draft (LaTeX)
- Citation verification workflow
- Before/after comparison

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
- [All 77 Skills](../README.md#available-ai-research-engineering-skills)
- [Contributing Guide](../CONTRIBUTING.md)

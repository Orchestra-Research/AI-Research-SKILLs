---
name: llm-routing-clawrouter
description: Routes LLM requests to the cheapest capable model using local 15-dimension prompt complexity scoring. Use when optimizing multi-model inference costs, building cost-aware agent pipelines, or replacing manual model selection with automatic routing. Supports 30+ models via x402 micropayments.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [LLM Routing, Cost Optimization, Model Selection, Inference, Multi-Provider, OpenAI Compatible, x402]
dependencies: [node >= 18]
---

# ClawRouter - Cost-Optimized LLM Routing

## Quick start

ClawRouter saves 78-96% on LLM inference costs by routing each request to the cheapest model capable of handling the prompt. Routing runs locally in <1ms with zero API calls.

**Installation**:
```bash
# One-line install
curl -fsSL https://blockrun.ai/ClawRouter-update | bash

# Or via npm
npm install -g clawrouter
```

**Start the routing proxy**:
```bash
# Start ClawRouter (OpenAI-compatible proxy on localhost:1337)
clawrouter start

# Query with OpenAI SDK — model is auto-selected
curl http://localhost:1337/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "blockrun/auto",
    "messages": [{"role": "user", "content": "What is 2+2?"}]
  }'
# → Routes to Haiku/Flash (~$0.25/M tokens) for simple prompts
```

**Use with OpenAI SDK**:
```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:1337/v1",
    api_key="not-needed"  # x402 wallet handles auth
)

# Simple prompt → routes to cheap model (Haiku/Flash)
response = client.chat.completions.create(
    model="blockrun/auto",
    messages=[{"role": "user", "content": "Summarize this paragraph"}]
)

# Complex prompt → routes to capable model (Opus/GPT-4o)
response = client.chat.completions.create(
    model="blockrun/auto",
    messages=[{"role": "user", "content": "Analyze the game-theoretic implications of..."}]
)
```

## How routing works

ClawRouter classifies each prompt across 15 weighted dimensions:

| Dimension | What It Measures | Weight |
|-----------|-----------------|--------|
| Token count | Raw prompt length | 0.08 |
| Vocabulary complexity | Rare/technical word density | 0.07 |
| Sentence structure | Syntactic complexity | 0.06 |
| Domain specificity | Technical domain depth | 0.08 |
| Reasoning depth | Multi-step logic needed | 0.09 |
| Creativity required | Open-ended vs factual | 0.06 |
| Context dependency | How much context matters | 0.07 |
| Instruction complexity | Multi-part instructions | 0.08 |
| Output format | Structured output needs | 0.05 |
| Ambiguity level | Interpretation difficulty | 0.06 |
| Knowledge recency | Need for recent info | 0.05 |
| Multi-modal | Image/audio/code needs | 0.07 |
| Safety sensitivity | Content risk assessment | 0.06 |
| Conversation depth | Multi-turn complexity | 0.06 |
| Tool use likelihood | Function calling needs | 0.06 |

The weighted score maps to a complexity tier:

```
Score 0.0 - 0.3  →  SIMPLE     →  Haiku, Flash, GPT-4o-mini
Score 0.3 - 0.5  →  MEDIUM     →  Sonnet, GPT-4o
Score 0.5 - 0.7  →  COMPLEX    →  Opus, GPT-4o
Score 0.7 - 1.0  →  REASONING  →  Opus, o1, DeepSeek-R1
```

All scoring runs locally via regex and heuristics — no LLM calls for classification.

## Common workflows

### Workflow 1: Cost optimization for existing applications

Drop-in replacement for any OpenAI-compatible application.

```
Cost Optimization:
- [ ] Step 1: Install and start ClawRouter
- [ ] Step 2: Point your app to the proxy
- [ ] Step 3: Monitor routing decisions
- [ ] Step 4: Tune tier thresholds
- [ ] Step 5: Verify quality maintained
```

**Step 1: Install and start ClawRouter**

```bash
curl -fsSL https://blockrun.ai/ClawRouter-update | bash
clawrouter start
```

**Step 2: Point your app to the proxy**

Change your API base URL:
```python
# Before: direct to provider
client = OpenAI(api_key="sk-...")

# After: through ClawRouter
client = OpenAI(
    base_url="http://localhost:1337/v1",
    api_key="not-needed"
)
```

**Step 3: Monitor routing decisions**

```bash
# View real-time routing log
clawrouter logs

# Example output:
# [12:03:01] "What is 2+2?" → SIMPLE → haiku-3.5 (0.12s, $0.00003)
# [12:03:02] "Analyze this codebase..." → COMPLEX → opus-4 (2.1s, $0.0042)
```

**Step 4: Tune tier thresholds**

Edit `~/.clawrouter/config.json`:
```json
{
  "tiers": {
    "SIMPLE": { "maxScore": 0.3, "models": ["haiku-3.5", "gpt-4o-mini"] },
    "MEDIUM": { "maxScore": 0.5, "models": ["sonnet-4", "gpt-4o"] },
    "COMPLEX": { "maxScore": 0.7, "models": ["opus-4", "gpt-4o"] },
    "REASONING": { "maxScore": 1.0, "models": ["opus-4", "o1", "deepseek-r1"] }
  }
}
```

**Step 5: Verify quality maintained**

Compare outputs on your evaluation set:
```bash
# Run your existing eval suite against the proxy
# Verify task-specific metrics unchanged
clawrouter stats  # Shows cost savings and tier distribution
```

### Workflow 2: Multi-model agent pipelines

Route different agent steps to appropriate models.

```
Agent Pipeline:
- [ ] Step 1: Design tier assignments per step
- [ ] Step 2: Configure force_model overrides
- [ ] Step 3: Add fallback chains
- [ ] Step 4: Monitor per-step costs
```

**Step 1: Design tier assignments per step**

Typical agent pipeline cost structure:
```
Planning step     → COMPLEX   (needs reasoning)
Tool selection    → MEDIUM    (structured choice)
API call parsing  → SIMPLE    (mechanical extraction)
Summarization     → SIMPLE    (compression task)
Final synthesis   → COMPLEX   (quality output)
```

**Step 2: Configure force_model overrides**

For steps where you want explicit control:
```python
# Force a specific model for critical steps
response = client.chat.completions.create(
    model="claude-opus-4",  # Bypass auto-routing
    messages=[{"role": "user", "content": planning_prompt}]
)

# Let router decide for routine steps
response = client.chat.completions.create(
    model="blockrun/auto",  # Auto-route
    messages=[{"role": "user", "content": summarization_prompt}]
)
```

**Step 3: Add fallback chains**

ClawRouter automatically cascades on provider errors:
```json
{
  "tiers": {
    "COMPLEX": {
      "models": ["opus-4", "gpt-4o", "gemini-2.5-pro"],
      "fallbackOrder": true
    }
  }
}
```

If Opus is rate-limited, it tries GPT-4o, then Gemini.

**Step 4: Monitor per-step costs**

```bash
clawrouter stats --by-tier
# SIMPLE:    42% of requests, 3% of cost
# MEDIUM:    31% of requests, 18% of cost
# COMPLEX:   22% of requests, 61% of cost
# REASONING:  5% of requests, 18% of cost
```

### Workflow 3: Resilient multi-provider deployment

Avoid single-provider outages.

```
Resilience Setup:
- [ ] Step 1: Configure multiple providers
- [ ] Step 2: Set timeout and retry policies
- [ ] Step 3: Enable rate-limit tracking
- [ ] Step 4: Test failover behavior
```

**Step 1: Configure multiple providers**

ClawRouter connects directly to each provider (no proxy hop):
```json
{
  "providers": {
    "anthropic": { "enabled": true },
    "openai": { "enabled": true },
    "google": { "enabled": true },
    "deepseek": { "enabled": true }
  }
}
```

**Step 2: Set timeout and retry policies**

```json
{
  "retry": {
    "maxRetries": 3,
    "initialDelay": 1000,
    "maxDelay": 10000
  },
  "timeout": 30000
}
```

**Step 3: Enable rate-limit tracking**

ClawRouter tracks 429 responses per model and temporarily deprioritizes rate-limited providers.

**Step 4: Test failover behavior**

```bash
# Simulate provider outage
clawrouter test-failover --provider anthropic
# → Verifies requests route to OpenAI/Google fallbacks
```

## When to use vs alternatives

**Use ClawRouter when:**
- Running multi-model applications (agents, pipelines)
- Want automatic cost optimization without manual model selection
- Need provider failover and resilience
- Privacy-sensitive (routing decisions never leave your machine)
- Want pay-per-request via x402 (no API key management)

**Use alternatives instead:**
- **OpenRouter**: Want a hosted routing proxy (simpler setup, but prompts transit their servers)
- **LiteLLM**: Need a unified API gateway with load balancing and rate limiting
- **Direct provider SDKs**: Single-model, single-provider applications
- **Martian/RouteLLM**: Need ML-based routing trained on preference data (higher accuracy, higher latency)

## Common issues

**Issue: Simple prompts routing to expensive models**

Check your tier thresholds:
```bash
clawrouter doctor
# Shows current scoring for recent prompts
# Adjust thresholds in config if needed
```

Common cause: system prompts with high complexity inflate the score. Use `force_model` for known-simple tasks.

**Issue: High latency on first request**

First request initializes the provider connections:
```bash
# Warm up connections
clawrouter warmup
```

Subsequent requests route in <1ms.

**Issue: Rate limiting on popular models**

ClawRouter tracks rate limits automatically. If Haiku is rate-limited:
```
haiku-3.5 [rate-limited 60s] → flash-2.0 → gpt-4o-mini
```

The fallback chain in your tier config determines the cascade order.

**Issue: x402 wallet balance**

```bash
# Check balance
clawrouter balance

# Fund wallet
clawrouter fund
```

## Advanced topics

**Scoring algorithm**: See [references/scoring-algorithm.md](references/scoring-algorithm.md) for the full 15-dimension scoring implementation, weight tuning, and calibration.

**Integration patterns**: See [references/integration-patterns.md](references/integration-patterns.md) for agent frameworks, CI/CD pipelines, and production deployment.

**Architecture**: See [references/architecture.md](references/architecture.md) for the proxy design, provider abstraction, and x402 payment flow.

## Key metrics

- **Routing latency**: <1ms (local regex + heuristics, zero API calls)
- **Cost savings**: 78-96% vs using top-tier model for everything
- **Blended cost**: ~$0.17/M tokens (vs $15/M for Opus everywhere)
- **Models supported**: 30+ across Anthropic, OpenAI, Google, DeepSeek, Meta
- **Payment**: x402 micropayments (non-custodial, no API keys)

## Resources

- GitHub: https://github.com/BlockRunAI/ClawRouter
- Docs: https://blockrun.ai/docs/clawrouter
- npm: `npm install -g clawrouter`
- License: MIT
- Paper: Weighted multi-dimension prompt scoring for cost-optimal LLM routing

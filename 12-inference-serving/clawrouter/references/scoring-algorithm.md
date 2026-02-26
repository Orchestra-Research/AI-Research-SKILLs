# ClawRouter Scoring Algorithm Reference

## Overview

ClawRouter classifies prompt complexity using a weighted multi-dimension scorer that runs entirely locally. No LLM calls are made for routing decisions — all classification uses regex patterns, vocabulary analysis, and syntactic heuristics.

## The 15-Dimension Scorer

Each incoming prompt is evaluated across 15 orthogonal dimensions. Each dimension produces a normalized score between 0.0 and 1.0, which is multiplied by its weight and summed to produce a final complexity score.

### Dimension Details

#### 1. Token Count (weight: 0.08)
Measures raw prompt length. Longer prompts typically require more capable models.

- Short (<100 tokens): 0.1
- Medium (100-500): 0.3
- Long (500-2000): 0.6
- Very long (>2000): 0.9

#### 2. Vocabulary Complexity (weight: 0.07)
Analyzes word rarity and technical terminology density using frequency lists.

- Common words only: 0.1
- Some technical terms: 0.4
- Dense technical vocabulary: 0.7
- Highly specialized (medical, legal, scientific): 0.9

#### 3. Sentence Structure (weight: 0.06)
Evaluates syntactic complexity via clause counting and nesting depth.

- Simple sentences: 0.1
- Compound sentences: 0.3
- Complex nested clauses: 0.6
- Academic/legal syntax: 0.9

#### 4. Domain Specificity (weight: 0.08)
Detects specialized domain markers (code keywords, mathematical notation, legal terms).

Pattern matching categories:
- Programming: function signatures, code blocks, import statements
- Mathematics: equations, Greek letters, operators
- Legal: "whereas", "hereby", "pursuant to"
- Medical: anatomical terms, drug names, diagnostic codes
- Finance: ticker symbols, financial ratios, regulatory terms

#### 5. Reasoning Depth (weight: 0.09)
Highest-weighted dimension. Detects multi-step reasoning requirements.

Triggers:
- "step by step", "think through", "analyze"
- Comparative language ("compare", "contrast", "trade-offs")
- Causal chains ("because... therefore... however")
- Mathematical proofs or logical arguments

#### 6. Creativity Required (weight: 0.06)
Distinguishes factual queries from open-ended creative tasks.

- Factual lookup: 0.1
- Summarization: 0.2
- Explanation: 0.4
- Creative writing: 0.7
- Novel ideation: 0.9

#### 7. Context Dependency (weight: 0.07)
Measures how much the response depends on conversation context.

- Standalone query: 0.1
- References "above" or "previous": 0.5
- Multi-turn with pronoun resolution: 0.7
- Complex context threading: 0.9

#### 8. Instruction Complexity (weight: 0.08)
Counts distinct instructions and constraints in the prompt.

- Single instruction: 0.1
- 2-3 instructions: 0.3
- 4-6 with constraints: 0.6
- 7+ with interdependencies: 0.9

#### 9. Output Format (weight: 0.05)
Detects structured output requirements.

- Free text: 0.1
- Bullet points/lists: 0.2
- Tables or JSON: 0.5
- Complex structured formats (XML, YAML with nesting): 0.8

#### 10. Ambiguity Level (weight: 0.06)
Assesses how much interpretation is needed.

- Unambiguous directive: 0.1
- Slight ambiguity: 0.3
- Multiple valid interpretations: 0.6
- Highly subjective: 0.9

#### 11. Knowledge Recency (weight: 0.05)
Detects references to recent events or evolving information.

- Timeless facts: 0.1
- Recent but stable: 0.3
- Current events: 0.7
- Breaking/evolving: 0.9

#### 12. Multi-modal (weight: 0.07)
Detects code, image references, or multi-format needs.

- Text only: 0.1
- Code generation: 0.5
- Image analysis references: 0.7
- Multi-format output: 0.9

#### 13. Safety Sensitivity (weight: 0.06)
Content risk assessment for appropriate model selection.

- Neutral content: 0.1
- Potentially sensitive topics: 0.4
- Content requiring careful handling: 0.7

#### 14. Conversation Depth (weight: 0.06)
Multi-turn conversation complexity.

- Single turn: 0.1
- Short conversation: 0.3
- Extended dialogue: 0.6
- Complex negotiation/debate: 0.9

#### 15. Tool Use Likelihood (weight: 0.06)
Function calling and tool integration needs.

- No tool use: 0.1
- Simple function call: 0.3
- Multi-tool orchestration: 0.6
- Complex tool chains: 0.9

## Tier Mapping

The weighted sum maps to complexity tiers:

```
Score Range    Tier        Default Models
0.00 - 0.30   SIMPLE      haiku-3.5, gpt-4o-mini, flash-2.0
0.30 - 0.50   MEDIUM      sonnet-4, gpt-4o
0.50 - 0.70   COMPLEX     opus-4, gpt-4o, gemini-2.5-pro
0.70 - 1.00   REASONING   opus-4, o1, deepseek-r1
```

Thresholds are configurable per deployment.

## Calibration

The default weights were calibrated against a dataset of 10,000 prompts with human-labeled complexity tiers. Calibration methodology:

1. Collect diverse prompts across domains
2. Human annotators label optimal model tier
3. Grid search over weight combinations
4. Select weights minimizing misrouting rate

Current misrouting rate: ~8% (prompt routes to a tier too cheap for the task). Over-routing rate: ~12% (prompt routes to a more expensive tier than needed). Combined waste: <5% of total spend.

## Weight Tuning

Override weights in config:

```json
{
  "scorer": {
    "weights": {
      "reasoningDepth": 0.12,
      "domainSpecificity": 0.10,
      "tokenCount": 0.05
    }
  }
}
```

Only specified weights are overridden; others keep defaults.

## Implementation

The scorer is implemented in TypeScript at `src/router/rules.ts`. Key functions:

- `scorePrompt(prompt: string): ScoredPrompt` — Main entry point
- `classifyTier(score: number): Tier` — Maps score to tier
- `selectModel(tier: Tier, config: RouterConfig): string` — Picks model from tier

Source: https://github.com/BlockRunAI/ClawRouter/blob/main/src/router/rules.ts

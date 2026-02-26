# ClawRouter Architecture Reference

## System Overview

```
                    ┌──────────────────────────────────┐
                    │           Client App              │
                    │  (OpenAI SDK / curl / any HTTP)   │
                    └──────────────┬───────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────────┐
                    │         ClawRouter Proxy          │
                    │      localhost:1337/v1/...        │
                    │                                  │
                    │  ┌─────────┐  ┌──────────────┐   │
                    │  │ Scorer  │  │ Tier Selector │   │
                    │  │ (<1ms)  │→ │              │   │
                    │  └─────────┘  └──────┬───────┘   │
                    │                      │           │
                    │  ┌───────────────────┴────────┐  │
                    │  │     Provider Router         │  │
                    │  │  (fallback chains, retry)   │  │
                    │  └─────┬─────┬─────┬─────┬───┘  │
                    └────────┼─────┼─────┼─────┼──────┘
                             │     │     │     │
                    ┌────────┘     │     │     └────────┐
                    ▼              ▼     ▼              ▼
              ┌──────────┐  ┌──────┐ ┌──────┐  ┌──────────┐
              │ Anthropic│  │OpenAI│ │Google│  │ DeepSeek │
              │   API    │  │ API  │ │ API  │  │   API    │
              └──────────┘  └──────┘ └──────┘  └──────────┘
```

## Component Architecture

### 1. HTTP Proxy (proxy.ts)

The entry point. Receives OpenAI-compatible requests and returns OpenAI-compatible responses.

Key responsibilities:
- Parse incoming chat completion requests
- Extract the prompt for scoring
- If `model` is `blockrun/auto`, invoke the scorer and selector
- If `model` is a specific model name, bypass scoring and route directly
- Handle streaming (SSE) and non-streaming responses
- Response caching for identical prompts
- Request deduplication for concurrent identical requests

Endpoints:
- `POST /v1/chat/completions` — Main inference endpoint
- `GET /v1/models` — List available models
- `GET /health` — Health check

### 2. Scorer (router/rules.ts)

Pure function that takes a prompt string and returns a complexity score.

```typescript
interface ScoredPrompt {
  score: number;           // 0.0 - 1.0
  tier: Tier;              // SIMPLE | MEDIUM | COMPLEX | REASONING
  dimensions: DimensionScores;  // Per-dimension breakdown
  confidence: number;      // How confident the classification is
}
```

The scorer is stateless and deterministic — same prompt always produces the same score. This makes it testable and debuggable.

Implementation approach:
- No ML models or embeddings
- Regex patterns for domain detection
- Word frequency lists for vocabulary analysis
- Heuristic rules for reasoning depth
- All runs in <1ms on modern hardware

### 3. Tier Selector (router/selector.ts)

Maps a scored prompt to a specific model and provider.

Selection algorithm:
1. Look up the tier's model list from config
2. Filter out rate-limited models (tracked in memory)
3. Sort by cost (cheapest first)
4. Return the cheapest available model

```typescript
interface TierConfig {
  maxScore: number;
  models: string[];
  fallbackOrder: boolean;  // If true, try models in order on failure
}
```

### 4. Provider Router (provider.ts)

Handles the actual API calls to LLM providers.

Key features:
- Direct connections to each provider (no intermediate proxy)
- Automatic retry with exponential backoff
- Rate limit tracking per model (429 response → cooldown period)
- Timeout handling with configurable limits
- Fallback chain execution on provider errors

```typescript
async function routeRequest(
  model: string,
  messages: Message[],
  options: RequestOptions
): Promise<CompletionResponse> {
  const modelsToTry = getFallbackChain(model);

  for (const candidate of modelsToTry) {
    try {
      if (isRateLimited(candidate)) continue;
      return await callProvider(candidate, messages, options);
    } catch (error) {
      if (isProviderError(error)) {
        markRateLimited(candidate);
        continue;  // Try next in fallback chain
      }
      throw error;  // Non-provider error, don't retry
    }
  }

  throw new Error('All models in fallback chain exhausted');
}
```

### 5. x402 Payment Layer (x402.ts)

Handles micropayments for model inference.

How x402 works:
1. Client sends request to ClawRouter
2. ClawRouter forwards to provider with x402 payment header
3. Provider verifies payment on Base blockchain
4. Provider returns response
5. Cost deducted from wallet balance

Key properties:
- Non-custodial (wallet keys stay on your machine)
- Per-request payments (no monthly subscriptions)
- No API keys needed (wallet IS the authentication)
- Supports 30+ models across providers

### 6. Response Cache (response-cache.ts)

Optional caching layer for repeated identical prompts.

Cache key: hash(model + messages + temperature + other params)

Cache policies:
- TTL-based expiration (configurable, default 1 hour)
- LRU eviction when cache size limit reached
- Cache bypass for streaming requests (optional)
- Cache invalidation on config change

### 7. Request Deduplication (dedup.ts)

Prevents duplicate API calls for concurrent identical requests.

When two identical requests arrive within a short window:
1. First request proceeds normally
2. Second request waits for first to complete
3. Both receive the same response
4. Only one API call is billed

### 8. Compression (compression/)

Prompt compression for cost reduction on long contexts.

Strategies:
- Redundancy removal in system prompts
- Context window optimization
- Message history truncation with summary preservation

## Configuration

All configuration in `~/.clawrouter/config.json`:

```json
{
  "port": 1337,
  "host": "localhost",
  "tiers": { ... },
  "providers": { ... },
  "scorer": { "weights": { ... } },
  "cache": { "enabled": true, "ttl": 3600 },
  "retry": { "maxRetries": 3 },
  "logging": { "level": "info" }
}
```

## Data Flow

```
Request → Parse → Score Prompt → Select Tier → Pick Model
  → Check Cache → (hit: return cached) / (miss: continue)
  → Check Dedup → (duplicate: wait) / (new: continue)
  → Call Provider → Handle Response → Cache → Return
```

Error flow:
```
Provider Error → Mark Rate Limited → Try Next in Fallback Chain
  → All Exhausted → Return 503 with routing metadata
```

## Source Code Map

| File | Purpose |
|------|---------|
| `src/proxy.ts` | HTTP proxy server, request handling |
| `src/router/rules.ts` | 15-dimension prompt scorer |
| `src/router/selector.ts` | Tier-to-model selection |
| `src/router/config.ts` | Router configuration types |
| `src/router/types.ts` | Shared type definitions |
| `src/provider.ts` | Provider API calls, fallback chains |
| `src/x402.ts` | x402 micropayment handling |
| `src/response-cache.ts` | Response caching |
| `src/dedup.ts` | Request deduplication |
| `src/compression/` | Prompt compression strategies |
| `src/retry.ts` | Retry with exponential backoff |
| `src/models.ts` | Model registry and metadata |
| `src/config.ts` | Global configuration |
| `src/cli.ts` | CLI interface |
| `src/stats.ts` | Usage statistics |
| `src/logger.ts` | Structured logging |

GitHub: https://github.com/BlockRunAI/ClawRouter

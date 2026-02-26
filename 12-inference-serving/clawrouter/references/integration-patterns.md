# ClawRouter Integration Patterns Reference

## Pattern 1: Drop-in Proxy for OpenAI SDK

The simplest integration. Change `base_url` and all requests route through ClawRouter.

### Python (OpenAI SDK)

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:1337/v1",
    api_key="not-needed"
)

response = client.chat.completions.create(
    model="blockrun/auto",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### TypeScript (OpenAI SDK)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'http://localhost:1337/v1',
  apiKey: 'not-needed',
});

const response = await client.chat.completions.create({
  model: 'blockrun/auto',
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### cURL

```bash
curl http://localhost:1337/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"blockrun/auto","messages":[{"role":"user","content":"Hello!"}]}'
```

## Pattern 2: Agent Framework Integration

### LangChain

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    base_url="http://localhost:1337/v1",
    api_key="not-needed",
    model="blockrun/auto"
)

response = llm.invoke("Summarize this document")
```

### CrewAI

```python
from crewai import Agent, Task, Crew

agent = Agent(
    role="Researcher",
    goal="Find information",
    llm="blockrun/auto",
    llm_config={"base_url": "http://localhost:1337/v1"}
)
```

### DSPy

```python
import dspy

lm = dspy.LM(
    model="openai/blockrun/auto",
    api_base="http://localhost:1337/v1",
    api_key="not-needed"
)
dspy.configure(lm=lm)
```

## Pattern 3: Force Model Override

Bypass auto-routing for specific requests:

```python
# Auto-route (default)
client.chat.completions.create(model="blockrun/auto", ...)

# Force specific model
client.chat.completions.create(model="claude-opus-4", ...)
client.chat.completions.create(model="gpt-4o", ...)
client.chat.completions.create(model="gemini-2.5-pro", ...)
```

## Pattern 4: Mixed Routing in Pipelines

```python
def process_document(doc):
    # Step 1: Extract metadata (cheap)
    metadata = client.chat.completions.create(
        model="blockrun/auto",  # → routes to Haiku
        messages=[{"role": "user", "content": f"Extract title and date from: {doc[:500]}"}]
    )

    # Step 2: Summarize (medium)
    summary = client.chat.completions.create(
        model="blockrun/auto",  # → routes to Sonnet
        messages=[{"role": "user", "content": f"Summarize this document: {doc}"}]
    )

    # Step 3: Analyze (force expensive model)
    analysis = client.chat.completions.create(
        model="claude-opus-4",  # → forced to Opus
        messages=[{"role": "user", "content": f"Provide deep analysis of: {summary}"}]
    )

    return metadata, summary, analysis
```

## Pattern 5: CI/CD Cost Optimization

Use ClawRouter in CI pipelines to reduce LLM costs for automated tasks:

```yaml
# .github/workflows/ai-review.yml
jobs:
  review:
    steps:
      - name: Start ClawRouter
        run: |
          curl -fsSL https://blockrun.ai/ClawRouter-update | bash
          clawrouter start --background

      - name: Run AI code review
        env:
          OPENAI_BASE_URL: http://localhost:1337/v1
        run: python review.py  # Uses auto-routing
```

## Pattern 6: Streaming Responses

ClawRouter preserves SSE streaming:

```python
stream = client.chat.completions.create(
    model="blockrun/auto",
    messages=[{"role": "user", "content": "Write a poem"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="")
```

## Pattern 7: Function Calling / Tool Use

Tool use requests are automatically scored higher on the "tool use likelihood" dimension:

```python
response = client.chat.completions.create(
    model="blockrun/auto",
    messages=[{"role": "user", "content": "What's the weather?"}],
    tools=[{
        "type": "function",
        "function": {
            "name": "get_weather",
            "parameters": {"type": "object", "properties": {"location": {"type": "string"}}}
        }
    }]
)
# → Routes to model with strong tool-use capability
```

## Deployment Patterns

### Docker

```dockerfile
FROM node:20-slim
RUN npm install -g clawrouter
EXPOSE 1337
CMD ["clawrouter", "start", "--host", "0.0.0.0"]
```

### Docker Compose (with application)

```yaml
services:
  clawrouter:
    image: blockrunai/clawrouter:latest
    ports:
      - "1337:1337"

  app:
    build: .
    environment:
      OPENAI_BASE_URL: http://clawrouter:1337/v1
    depends_on:
      - clawrouter
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clawrouter
spec:
  replicas: 1
  template:
    spec:
      containers:
        - name: clawrouter
          image: blockrunai/clawrouter:latest
          ports:
            - containerPort: 1337
---
apiVersion: v1
kind: Service
metadata:
  name: clawrouter
spec:
  selector:
    app: clawrouter
  ports:
    - port: 1337
```

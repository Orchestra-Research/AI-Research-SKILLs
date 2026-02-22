---
name: openclaw-agents
description: Operating system-level AI Agent framework for real system execution. Use when building AI agents that can operate computers, control applications, write code, and execute complex tasks autonomously.
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Agents, OpenClaw, Operating System, AI Execution, Autonomous Agents, System Control]
dependencies: [openclaw>=0.1.0, langchain>=0.1.0, openai>=1.0.0]
---

# OpenClaw - Operating System-Level AI Agent Framework

Powerful AI Agent framework that transforms LLM capabilities into real-world system operations, enabling AI to control computers, write code, and execute complex tasks autonomously.

## When to use OpenClaw

**Use OpenClaw when:**
- Building AI agents that need to operate computer systems
- Creating autonomous agents that can control desktop applications
- Developing AI systems that write and execute code
- Implementing agents that can browse the web and interact with websites
- Building long-running, persistent AI services
- Creating AI assistants that can handle complex multi-step tasks

**Key features:**
- **System-Level Execution**: AI can perform real operations on your computer
- **Persistent Presence**: Runs as a background service with continuous context
- **Code Generation & Execution**: AI writes and runs code to solve problems
- **Application Control**: Can control browsers and desktop applications
- **Task Orchestration**: Breaks down complex tasks into executable steps
- **Error Recovery**: Can detect and correct execution errors
- **Remote Control**: Accept commands via messaging platforms like Telegram

**Use alternatives instead:**
- **LangChain/LlamaIndex**: For more traditional RAG-focused agents
- **AutoGPT**: For visual workflow-based agents
- **CrewAI**: For role-based multi-agent collaboration
- **BabyAGI**: For task-driven agents without system-level access

## Quick start

### Installation

```bash
# Clone repository
git clone https://github.com/openclaw-project/openclaw.git
cd openclaw

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and settings

# Start OpenClaw Gateway
python -m openclaw.gateway
```

### Basic configuration

```python
# main.py
from openclaw import OpenClaw

# Initialize OpenClaw
agent = OpenClaw(
    model="gpt-4",  # or other supported model
    api_key="your-openai-api-key",
    permissions={
        "file_system": "read_write",  # or "read_only"
        "network": "enabled",
        "applications": "controlled"
    }
)

# Start the agent
agent.start()

# Send a task
agent.send_task("Write a Python script to analyze sales data and create a visualization")
```

### Accessing via Telegram

1. **Create a Telegram bot** using BotFather
2. **Add bot token** to .env file
3. **Start OpenClaw** with Telegram integration
4. **Chat with your bot** to send commands

Example Telegram conversation:
```
You: Write a Python script that scrapes the top news headlines from CNN
OpenClaw: I'll help you create a news scraping script. Let me write and test it.

[OpenClaw writes the script]

OpenClaw: Script created successfully. Would you like me to run it?
You: Yes
OpenClaw: Running the script...

[OpenClaw executes the script]

OpenClaw: Here are the top headlines from CNN:
1. Headline 1
2. Headline 2
3. Headline 3
```

## Core concepts

### System Architecture

OpenClaw uses a layered architecture:

1. **Gateway**: Central execution hub that manages tasks and context
2. **Agent**: Core AI logic that processes instructions and generates actions
3. **Skills**: Modular capabilities that enable specific functions
4. **Memory**: Persistent storage for context and task history
5. **Channels**: Interfaces for receiving commands (Telegram, CLI, etc.)

### Execution Flow

1. **Command Receipt**: Gateway receives instruction from a channel
2. **Task Analysis**: Agent breaks down task into executable steps
3. **Plan Generation**: Agent creates a execution plan
4. **Action Execution**: Gateway executes actions (run code, control apps, etc.)
5. **Result Processing**: Agent analyzes results and adapts plan
6. **Continuous Loop**: Process repeats until task completion

### Permission System

OpenClaw implements a granular permission system:

| Permission Level | Access | Use Case |
|-----------------|--------|----------|
| `read_only` | Read files, browse web | Information gathering |
| `read_write` | Create/modify files, run scripts | Development tasks |
| `elevated` | System commands, app control | Full automation |

## Architecture overview

### Core Components

```
OpenClaw
  ├── Gateway
  │   ├── Task Manager
  │   ├── Action Executor
  │   ├── Context Manager
  │   └── Channel Manager
  │
  ├── Agent
  │   ├── LLM Interface
  │   ├── Plan Generator
  │   ├── Code Generator
  │   └── Error Handler
  │
  ├── Skills
  │   ├── File System
  │   ├── Web Browser
  │   ├── Code Execution
  │   ├── Application Control
  │   └── Network Access
  │
  ├── Memory
  │   ├── Short-term Memory
  │   ├── Long-term Memory
  │   └── Knowledge Base
  │
  └── Channels
      ├── Telegram
      ├── Command Line
      ├── Web Interface
      └── API
```

### Gateway (Execution Hub)

The Gateway is the central component that:
- Runs continuously in the background
- Manages system permissions
- Executes actions on behalf of the Agent
- Maintains task context and state
- Handles error recovery and retries

### Agent (Brain)

The Agent component:
- Processes natural language instructions
- Generates execution plans
- Writes code to solve problems
- Makes decisions based on results
- Adapts strategies when faced with errors

### Skills (Capabilities)

Skills are modular capabilities that extend OpenClaw's functionality:
- **File System**: Read, write, modify files
- **Code Execution**: Write, run, debug code
- **Web Browser**: Browse websites, interact with pages
- **Application Control**: Control desktop applications
- **Network Access**: Make API calls, download data
- **System Commands**: Run terminal commands

### Memory (Persistence)

OpenClaw's memory system:
- Maintains context across sessions
- Stores task history and results
- Builds knowledge base from interactions
- Enables long-term planning
- Supports task resume after interruptions

## Usage patterns

### Development Assistant

```python
# Initialize OpenClaw for development
agent = OpenClaw(
    model="gpt-4",
    permissions={"file_system": "read_write", "network": "enabled"}
)

# Send development task
agent.send_task("Create a Python Flask application with user authentication and database integration")
```

### System Administrator

```python
# Initialize OpenClaw for system administration
agent = OpenClaw(
    model="gpt-4",
    permissions={"file_system": "read_write", "system": "elevated"}
)

# Send system administration task
agent.send_task("Monitor system performance for 24 hours and create a report with optimization suggestions")
```

### Web Automation

```python
# Initialize OpenClaw for web automation
agent = OpenClaw(
    model="gpt-4",
    permissions={"network": "enabled", "browser": "controlled"}
)

# Send web automation task
agent.send_task("Scrape product data from Amazon for 'wireless headphones' and create a comparison spreadsheet")
```

### Personal Assistant

```python
# Initialize OpenClaw as personal assistant
agent = OpenClaw(
    model="gpt-4",
    permissions={"file_system": "read_write", "network": "enabled", "calendar": "read_write"}
)

# Send personal assistant task
agent.send_task("Plan a 7-day trip to Tokyo, book flights and hotels within $2000 budget, and create an itinerary")
```

## Customization and extension

### Adding custom skills

```python
from openclaw.skills import Skill

class CustomSkill(Skill):
    def __init__(self):
        super().__init__(name="custom-skill")
    
    def execute(self, parameters):
        # Implement custom functionality
        return "Custom skill executed successfully"

# Register custom skill
from openclaw import registry
registry.register_skill(CustomSkill())
```

### Creating custom channels

```python
from openclaw.channels import Channel

class CustomChannel(Channel):
    def __init__(self):
        super().__init__(name="custom-channel")
    
    def start(self):
        # Start channel
        pass
    
    def send_message(self, message):
        # Send message through channel
        pass

# Register custom channel
from openclaw import registry
registry.register_channel(CustomChannel())
```

### Modifying execution behavior

```python
from openclaw.gateway import Gateway

class CustomGateway(Gateway):
    def execute_action(self, action):
        # Custom execution logic
        print(f"Executing action: {action.type}")
        result = super().execute_action(action)
        print(f"Action result: {result}")
        return result

# Use custom gateway
agent = OpenClaw(gateway_class=CustomGateway)
```

### Integrating with other frameworks

```python
# Integrate with LangChain
from langchain.agents import Tool
from openclaw import OpenClaw

# Create OpenClaw instance
openclaw_agent = OpenClaw()

# Create LangChain tool
def openclaw_tool(task):
    """Execute task with OpenClaw"""
    result = openclaw_agent.send_task(task)
    return str(result)

# Create tool
openclaw_langchain_tool = Tool(
    name="OpenClaw",
    func=openclaw_tool,
    description="Execute complex tasks with OpenClaw's system-level capabilities"
)

# Use in LangChain agent
tools = [openclaw_langchain_tool]
```

## Common issues and solutions

### Permission errors

**Symptom:** OpenClaw can't access files or applications

**Solution:**
- Check permission settings in configuration
- Run OpenClaw with appropriate system permissions
- Verify file system permissions for the user running OpenClaw

### Execution failures

**Symptom:** Tasks fail to execute completely

**Solution:**
- Check API key configuration
- Verify internet connectivity
- Review error logs for specific failure reasons
- Break complex tasks into smaller steps

### Memory limitations

**Symptom:** OpenClaw forgets context or task details

**Solution:**
- Increase memory allocation in configuration
- Implement more efficient memory management
- Use shorter, more focused tasks
- Enable persistent memory storage

### Performance issues

**Symptom:** OpenClaw is slow to respond or execute tasks

**Solution:**
- Use a more powerful model (e.g., GPT-4 instead of GPT-3.5)
- Optimize system resources (CPU, RAM)
- Enable parallel execution for supported tasks
- Use local models for faster response times

### Security concerns

**Symptom:** Worried about OpenClaw's system access

**Solution:**
- Use read-only permissions for information gathering tasks
- Limit file system access to specific directories
- Monitor OpenClaw's actions through logging
- Regularly review executed commands and code

## References

- **[Core Concepts](references/core-concepts.md)** - Key architectural principles and design patterns
- **[System Integration](references/system-integration.md)** - Integrating OpenClaw with operating systems and applications
- **[Troubleshooting](references/troubleshooting.md)** - Common issues, debugging strategies

## Resources

- **Documentation**: https://github.com/openclaw-project/openclaw
- **Repository**: https://github.com/openclaw-project/openclaw
- **Original Paper**: "OpenClaw: Operating System-Level AI Agent Framework"
- **Community**: https://discord.gg/openclaw
- **License**: MIT

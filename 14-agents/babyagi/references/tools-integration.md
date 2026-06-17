# Tools Integration

## Introduction to Tool Integration

BabyAGI can be enhanced with custom tools to extend its capabilities beyond basic task management. Tools allow BabyAGI to interact with external systems, perform specific actions, and retrieve information from various sources.

## Core Tool Concepts

### What Are Tools?

Tools are functions that BabyAGI can call to perform specific tasks. They typically:

1. **Accept parameters** as input
2. **Perform an action** (e.g., search the web, write a file)
3. **Return results** as output

### How Tools Work with BabyAGI

1. BabyAGI generates a task
2. BabyAGI evaluates if a tool is needed for the task
3. If a tool is needed, BabyAGI calls the appropriate tool with the necessary parameters
4. The tool executes and returns results
5. BabyAGI uses these results to inform next steps and generate new tasks

## Creating Custom Tools

### Basic Tool Creation

```python
from langchain.tools import Tool

# Simple search tool
def search_tool(query):
    """Search for information online"""
    # Implement search logic
    return f"Search results for: {query}"

# Create tool instance
search = Tool(
    name="Search",
    func=search_tool,
    description="Search for information online"
)

# Add to tool list
tools = [search]
```

### Tool with Multiple Parameters

```python
# Tool with multiple parameters
def calculate_tool(operation, num1, num2):
    """Perform mathematical calculations"""
    if operation == "add":
        return f"{num1} + {num2} = {num1 + num2}"
    elif operation == "subtract":
        return f"{num1} - {num2} = {num1 - num2}"
    elif operation == "multiply":
        return f"{num1} * {num2} = {num1 * num2}"
    elif operation == "divide":
        if num2 == 0:
            return "Error: Division by zero"
        return f"{num1} / {num2} = {num1 / num2}"
    else:
        return f"Error: Unknown operation '{operation}'"

# Create tool with parameters
calculator = Tool(
    name="Calculator",
    func=calculate_tool,
    description="Perform mathematical calculations with operation (add, subtract, multiply, divide) and two numbers"
)
```

### Tool with Complex Logic

```python
# Tool with complex logic
def analyze_sentiment_tool(text):
    """Analyze sentiment of text"""
    # Simple sentiment analysis
    positive_words = ["good", "great", "excellent", "amazing", "fantastic", "wonderful"]
    negative_words = ["bad", "terrible", "awful", "horrible", "disappointing", "poor"]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return f"Positive sentiment detected: {positive_count} positive words, {negative_count} negative words"
    elif negative_count > positive_count:
        return f"Negative sentiment detected: {negative_count} negative words, {positive_count} positive words"
    else:
        return f"Neutral sentiment detected: {positive_count} positive words, {negative_count} negative words"

# Create sentiment analysis tool
sentiment_analyzer = Tool(
    name="SentimentAnalyzer",
    func=analyze_sentiment_tool,
    description="Analyze sentiment of text"
)
```

## Integrating Tools with BabyAGI

### Basic Integration

```python
from babyagi import BabyAGI
from langchain.tools import Tool

# Define tools
def search_tool(query):
    """Search for information online"""
    return f"Search results for: {query}"

def write_file_tool(file_path, content):
    """Write content to a file"""
    with open(file_path, 'w') as f:
        f.write(content)
    return f"File written: {file_path}"

# Create tool list
tools = [
    Tool(
        name="Search",
        func=search_tool,
        description="Search for information online"
    ),
    Tool(
        name="WriteFile",
        func=write_file_tool,
        description="Write content to a file"
    )
]

# Initialize BabyAGI with tools
baby_agi = BabyAGI(
    openai_api_key="your-api-key",
    objective="Research AI agent architectures and write a report",
    initial_tasks=[
        "Search for latest AI agent papers",
        "Write a summary of findings to research_report.md"
    ],
    tools=tools,
    max_runs=10
)

# Run BabyAGI
baby_agi.run()
```

### Advanced Integration with Custom LLM

```python
from babyagi import BabyAGI
from langchain.tools import Tool
from langchain.llms import OpenAI

# Define tools
def search_tool(query):
    """Search for information online"""
    return f"Search results for: {query}"

# Create tool list
tools = [
    Tool(
        name="Search",
        func=search_tool,
        description="Search for information online"
    )
]

# Create custom LLM
llm = OpenAI(
    api_key="your-api-key",
    model="gpt-4",  # More capable model
    temperature=0
)

# Initialize BabyAGI with custom LLM and tools
baby_agi = BabyAGI(
    llm=llm,
    objective="Research AI agent architectures",
    initial_tasks=["Search for latest AI agent papers"],
    tools=tools,
    max_runs=10
)

# Run BabyAGI
baby_agi.run()
```

## Common Tool Types

### 1. Information Retrieval Tools

#### Web Search

```python
import requests
from langchain.tools import Tool

def web_search_tool(query):
    """Search the web for information"""
    # Using a simple search API
    api_key = "your-search-api-key"
    url = f"https://api.searchapi.io/v1/search?q={query}&api_key={api_key}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        # Extract top results
        results = []
        for item in data.get('results', [])[:3]:
            title = item.get('title', 'No title')
            link = item.get('url', 'No URL')
            snippet = item.get('description', 'No snippet')
            results.append(f"- {title}: {link}\n  {snippet}")
        
        return "\n".join(results)
    except Exception as e:
        return f"Error searching web: {str(e)}"

# Create search tool
web_search = Tool(
    name="WebSearch",
    func=web_search_tool,
    description="Search the web for information"
)
```

#### Document Retrieval

```python
from langchain.tools import Tool
from langchain.vectorstores import FAISS
from langchain.embeddings import OpenAIEmbeddings

# Create vector store (pre-initialized)
vector_store = FAISS.from_texts(
    ["AI agents are systems that use LLMs to perform tasks", "BabyAGI is a task-driven agent framework"],
    OpenAIEmbeddings(api_key="your-api-key")
)

def document_search_tool(query):
    """Search for information in documents"""
    results = vector_store.similarity_search(query, k=3)
    return "\n".join([f"- {doc.page_content}" for doc in results])

# Create document search tool
doc_search = Tool(
    name="DocumentSearch",
    func=document_search_tool,
    description="Search for information in documents"
)
```

### 2. File System Tools

#### File Writer

```python
import os
from langchain.tools import Tool

def write_file_tool(file_path, content):
    """Write content to a file"""
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Write file
    with open(file_path, 'w') as f:
        f.write(content)
    
    return f"File written successfully: {file_path}"

# Create file writer tool
file_writer = Tool(
    name="WriteFile",
    func=write_file_tool,
    description="Write content to a file"
)
```

#### File Reader

```python
from langchain.tools import Tool

def read_file_tool(file_path):
    """Read content from a file"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        return f"File content:\n{content}"
    except Exception as e:
        return f"Error reading file: {str(e)}"

# Create file reader tool
file_reader = Tool(
    name="ReadFile",
    func=read_file_tool,
    description="Read content from a file"
)
```

#### File List

```python
import os
from langchain.tools import Tool

def list_files_tool(directory):
    """List files in a directory"""
    try:
        files = os.listdir(directory)
        return "\n".join([f"- {file}" for file in files])
    except Exception as e:
        return f"Error listing files: {str(e)}"

# Create file list tool
file_lister = Tool(
    name="ListFiles",
    func=list_files_tool,
    description="List files in a directory"
)
```

### 3. API Interaction Tools

#### GitHub API

```python
import requests
from langchain.tools import Tool

def github_repo_tool(repo_owner, repo_name):
    """Get information about a GitHub repository"""
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        name = data.get('name', 'No name')
        description = data.get('description', 'No description')
        stars = data.get('stargazers_count', 0)
        forks = data.get('forks_count', 0)
        url = data.get('html_url', 'No URL')
        
        return f"Repository: {name}\nDescription: {description}\nStars: {stars}\nForks: {forks}\nURL: {url}"
    except Exception as e:
        return f"Error getting repository information: {str(e)}"

# Create GitHub tool
github_tool = Tool(
    name="GitHubRepo",
    func=github_repo_tool,
    description="Get information about a GitHub repository"
)
```

#### Weather API

```python
import requests
from langchain.tools import Tool

def weather_tool(city):
    """Get current weather for a city"""
    api_key = "your-weather-api-key"
    url = f"https://api.weatherapi.com/v1/current.json?key={api_key}&q={city}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        location = data.get('location', {})
        current = data.get('current', {})
        
        city_name = location.get('name', 'Unknown')
        country = location.get('country', 'Unknown')
        temp_c = current.get('temp_c', 'Unknown')
        condition = current.get('condition', {}).get('text', 'Unknown')
        humidity = current.get('humidity', 'Unknown')
        wind_kph = current.get('wind_kph', 'Unknown')
        
        return f"Weather in {city_name}, {country}:\nTemperature: {temp_c}°C\nCondition: {condition}\nHumidity: {humidity}%\nWind: {wind_kph} km/h"
    except Exception as e:
        return f"Error getting weather information: {str(e)}"

# Create weather tool
weather = Tool(
    name="Weather",
    func=weather_tool,
    description="Get current weather for a city"
)
```

### 4. Utility Tools

#### Calculator

```python
from langchain.tools import Tool

def calculator_tool(expression):
    """Evaluate a mathematical expression"""
    try:
        # Simple expression evaluation
        result = eval(expression)
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error evaluating expression: {str(e)}"

# Create calculator tool
calculator = Tool(
    name="Calculator",
    func=calculator_tool,
    description="Evaluate a mathematical expression"
)
```

#### Date/Time

```python
from datetime import datetime
from langchain.tools import Tool

def datetime_tool():
    """Get current date and time"""
    now = datetime.now()
    return f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')}"

# Create datetime tool
datetime_tool = Tool(
    name="DateTime",
    func=datetime_tool,
    description="Get current date and time"
)
```

#### Text Processing

```python
from langchain.tools import Tool

def text_stats_tool(text):
    """Get statistics about text"""
    words = text.split()
    sentences = text.split('.')
    paragraphs = text.split('\n\n')
    
    return f"Text statistics:\nWords: {len(words)}\nSentences: {len(sentences)}\nParagraphs: {len(paragraphs)}\nCharacters: {len(text)}"

# Create text stats tool
text_stats = Tool(
    name="TextStats",
    func=text_stats_tool,
    description="Get statistics about text"
)
```

## Tool Integration Best Practices

### 1. Tool Design

#### Keep Tools Focused

```python
# Good: Focused tool
def search_tool(query):
    """Search for information online"""
    return f"Search results for: {query}"

# Bad: Unfocused tool
def multi_tool(action, *args):
    """Perform multiple actions"""
    if action == "search":
        return search_tool(args[0])
    elif action == "write":
        return write_file_tool(args[0], args[1])
    # ... more actions
```

#### Use Clear Descriptions

```python
# Good: Clear description
search_tool = Tool(
    name="Search",
    func=search_tool,
    description="Search for information online. Takes a single query string as input."
)

# Bad: Vague description
search_tool = Tool(
    name="Search",
    func=search_tool,
    description="Search tool"
)
```

#### Handle Errors Gracefully

```python
# Good: Error handling
def web_search_tool(query):
    """Search the web for information"""
    try:
        # Search logic
        return results
    except Exception as e:
        return f"Error searching web: {str(e)}"

# Bad: No error handling
def web_search_tool(query):
    """Search the web for information"""
    # Search logic without error handling
    return results
```

### 2. Integration Strategies

#### Start with Essential Tools

```python
# Start with core tools
tools = [
    Tool(name="Search", func=search_tool, description="Search for information online"),
    Tool(name="WriteFile", func=write_file_tool, description="Write content to a file")
]

# Add more tools as needed later
tools.append(Tool(name="ReadFile", func=read_file_tool, description="Read content from a file"))
```

#### Organize Tools by Category

```python
# Organize tools by category
information_tools = [
    Tool(name="Search", func=search_tool, description="Search for information online"),
    Tool(name="DocumentSearch", func=document_search_tool, description="Search for information in documents")
]

file_tools = [
    Tool(name="WriteFile", func=write_file_tool, description="Write content to a file"),
    Tool(name="ReadFile", func=read_file_tool, description="Read content from a file"),
    Tool(name="ListFiles", func=list_files_tool, description="List files in a directory")
]

# Combine tools
tools = information_tools + file_tools
```

#### Use Toolkits for Related Tools

```python
from langchain.tools import Tool
from langchain.agents import Toolkit

# Create toolkit class
class FileToolkit(Toolkit):
    def get_tools(self):
        return [
            Tool(name="WriteFile", func=write_file_tool, description="Write content to a file"),
            Tool(name="ReadFile", func=read_file_tool, description="Read content from a file"),
            Tool(name="ListFiles", func=list_files_tool, description="List files in a directory")
        ]

# Create toolkit instance
file_toolkit = FileToolkit()

# Get tools from toolkit
tools = file_toolkit.get_tools()
```

### 3. Performance Optimization

#### Cache Tool Results

```python
from functools import lru_cache
from langchain.tools import Tool

# Cached search tool
@lru_cache(maxsize=100)
def cached_search_tool(query):
    """Search for information online (cached)"""
    # Search logic
    return f"Search results for: {query}"

# Create cached tool
cached_search = Tool(
    name="CachedSearch",
    func=cached_search_tool,
    description="Search for information online (results cached)"
)
```

#### Limit Tool Execution Time

```python
import timeout_decorator
from langchain.tools import Tool

# Tool with timeout
@timeout_decorator.timeout(10)  # 10 seconds timeout
def timeout_search_tool(query):
    """Search for information online with timeout"""
    # Search logic that might take time
    return f"Search results for: {query}"

# Create tool with timeout
timeout_search = Tool(
    name="TimeoutSearch",
    func=timeout_search_tool,
    description="Search for information online with 10 second timeout"
)
```

#### Batch Tool Calls

```python
from langchain.tools import Tool

def batch_search_tool(queries):
    """Search for multiple queries at once"""
    results = []
    for query in queries:
        results.append(f"Search results for '{query}': Results here")
    return "\n\n".join(results)

# Create batch search tool
batch_search = Tool(
    name="BatchSearch",
    func=batch_search_tool,
    description="Search for multiple queries at once"
)
```

## Advanced Tool Integration Patterns

### 1. Tool Chaining

```python
from langchain.tools import Tool

# Tools that chain together
def search_tool(query):
    """Search for information online"""
    return f"Search results for: {query}"

def summarize_tool(text):
    """Summarize text"""
    return f"Summary: {text[:100]}..."

def write_file_tool(file_path, content):
    """Write content to a file"""
    with open(file_path, 'w') as f:
        f.write(content)
    return f"File written: {file_path}"

# Create tools
tools = [
    Tool(name="Search", func=search_tool, description="Search for information online"),
    Tool(name="Summarize", func=summarize_tool, description="Summarize text"),
    Tool(name="WriteFile", func=write_file_tool, description="Write content to a file")
]

# Objective that encourages tool chaining
objective = "Research AI agents, summarize findings, and write to a file"
initial_tasks = [
    "Search for information about AI agents",
    "Summarize the search results",
    "Write the summary to ai_agents_summary.md"
]
```

### 2. Conditional Tool Use

```python
from langchain.tools import Tool

# Tools with conditional logic
def check_weather_tool(city):
    """Check weather for a city"""
    return f"Weather in {city}: Sunny, 25°C"

def suggest_activity_tool(weather):
    """Suggest activity based on weather"""
    if "sunny" in weather.lower():
        return "Suggested activity: Go for a walk"
    elif "rainy" in weather.lower():
        return "Suggested activity: Read a book"
    elif "snowy" in weather.lower():
        return "Suggested activity: Build a snowman"
    else:
        return "Suggested activity: Watch a movie"

# Create tools
tools = [
    Tool(name="CheckWeather", func=check_weather_tool, description="Check weather for a city"),
    Tool(name="SuggestActivity", func=suggest_activity_tool, description="Suggest activity based on weather")
]

# Objective that encourages conditional tool use
objective = "Check weather and suggest activity"
initial_tasks = [
    "Check weather for New York",
    "Suggest activity based on the weather"
]
```

### 3. Multi-Step Tool Workflows

```python
from langchain.tools import Tool

# Tools for multi-step workflow
def create_project_tool(project_name):
    """Create a new project directory"""
    import os
    os.makedirs(project_name, exist_ok=True)
    return f"Project directory created: {project_name}"

def create_file_tool(project_name, file_name, content):
    """Create a file in a project"""
    import os
    file_path = os.path.join(project_name, file_name)
    with open(file_path, 'w') as f:
        f.write(content)
    return f"File created: {file_path}"

def initialize_git_tool(project_name):
    """Initialize git repository"""
    import subprocess
    result = subprocess.run(
        f"cd {project_name} && git init && git add . && git commit -m 'Initial commit'",
        shell=True,
        capture_output=True,
        text=True
    )
    return f"Git initialized: {result.stdout}"

# Create tools
tools = [
    Tool(name="CreateProject", func=create_project_tool, description="Create a new project directory"),
    Tool(name="CreateFile", func=create_file_tool, description="Create a file in a project"),
    Tool(name="InitializeGit", func=initialize_git_tool, description="Initialize git repository")
]

# Objective for multi-step workflow
objective = "Create a new Python project with git"
initial_tasks = [
    "Create a project directory called 'my-python-project'",
    "Create a README.md file in the project with basic information",
    "Initialize git repository for the project"
]
```

## Troubleshooting Tool Integration

### Common Issues

#### Tool Not Being Called

**Symptoms:**
- BabyAGI doesn't use the tool when it should
- BabyAGI generates tasks that should use tools but doesn't call them

**Solutions:**
- Improve tool descriptions to be more specific
- Use more explicit initial tasks that mention tool use
- Try a more capable LLM (e.g., GPT-4)
- Simplify tool parameters

#### Tool Parameters Not Being Passed Correctly

**Symptoms:**
- Tool receives incorrect parameters
- BabyAGI doesn't format parameters correctly

**Solutions:**
- Use clear parameter names in tool descriptions
- Include examples of parameter formats
- Simplify tool interfaces to use fewer parameters
- Use string parameters instead of complex types

#### Tool Execution Errors

**Symptoms:**
- Tool calls fail with error messages
- BabyAGI stops working after tool errors

**Solutions:**
- Add comprehensive error handling to tools
- Return user-friendly error messages
- Use try-except blocks in tool functions
- Add timeout decorators to prevent hanging

#### Tool Results Not Being Used

**Symptoms:**
- BabyAGI calls tools but doesn't use the results
- BabyAGI ignores tool outputs when creating new tasks

**Solutions:**
- Improve tool return values to be more actionable
- Use structured formats for tool outputs
- Include clear, concise information in tool results
- Encourage result use in task creation prompts

### Debugging Tools

#### Logging Tool Calls

```python
from langchain.tools import Tool

def debug_search_tool(query):
    """Search for information online"""
    print(f"DEBUG: Search tool called with query: {query}")
    result = f"Search results for: {query}"
    print(f"DEBUG: Search tool returned: {result}")
    return result

# Create debug tool
debug_search = Tool(
    name="DebugSearch",
    func=debug_search_tool,
    description="Search for information online with debug logging"
)
```

#### Testing Tools Independently

```python
# Test tools before integration
def test_tool(tool, *args):
    """Test a tool with given arguments"""
    try:
        result = tool.func(*args)
        print(f"Tool test passed: {result}")
        return True
    except Exception as e:
        print(f"Tool test failed: {str(e)}")
        return False

# Test search tool
test_tool(search_tool, "AI agents")

# Test write file tool
test_tool(write_file_tool, "test.txt", "Hello, world!")
```

#### Tool Performance Testing

```python
import time
from langchain.tools import Tool

def performance_test_tool(tool, *args, iterations=10):
    """Test tool performance"""
    times = []
    
    for i in range(iterations):
        start_time = time.time()
        result = tool.func(*args)
        end_time = time.time()
        times.append(end_time - start_time)
    
    avg_time = sum(times) / iterations
    print(f"Average tool execution time: {avg_time:.4f} seconds")
    print(f"Max execution time: {max(times):.4f} seconds")
    print(f"Min execution time: {min(times):.4f} seconds")

# Test search tool performance
performance_test_tool(search_tool, "AI agents")
```

## Conclusion

Tool integration is a powerful way to extend BabyAGI's capabilities beyond basic task management. By creating custom tools and integrating them effectively, you can build sophisticated AI agents that can:

- Retrieve information from the web and documents
- Interact with external APIs and services
- Manipulate files and data
- Perform specialized tasks and calculations
- Execute complex multi-step workflows

With the right tools and integration strategies, BabyAGI can become a versatile assistant for a wide range of tasks, from research and development to personal productivity and automation.

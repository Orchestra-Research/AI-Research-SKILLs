# Troubleshooting

## Common Issues

### API Rate Limiting

**Problem:** BabyAGI is hitting API rate limits, causing delays or failures.

**Symptoms:**
- Error messages about API rate limits
- Slow task execution
- Intermittent failures

**Solutions:**

1. **Add rate limiting delay:**
   ```python
   baby_agi = BabyAGI(
       openai_api_key="your-api-key",
       objective="Research AI",
       initial_tasks=["Search for AI papers"],
       max_runs=5,
       rate_limit_delay=2.0  # Add 2 second delay between API calls
   )
   ```

2. **Use a rate-limited LLM wrapper:**
   ```python
   from langchain.llms import OpenAI
   from tenacity import retry, stop_after_attempt, wait_exponential

   # Create rate-limited LLM
   @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
   def rate_limited_completion(prompt):
       llm = OpenAI(api_key="your-api-key", temperature=0)
       return llm(prompt)

   # Use with BabyAGI
   class RateLimitedLLM:
       def __call__(self, prompt):
           return rate_limited_completion(prompt)

   baby_agi = BabyAGI(
       llm=RateLimitedLLM(),
       objective="Research AI",
       initial_tasks=["Search for AI papers"]
   )
   ```

3. **Implement backoff strategy:**
   ```python
   import time
   import random

   def backoff_strategy(attempt):
       """Exponential backoff with jitter"""
       base_delay = 1
       max_delay = 60
       delay = min(base_delay * (2 ** attempt) + random.uniform(0, 1), max_delay)
       time.sleep(delay)

   # Use in custom execute_task
   def execute_task_with_backoff(task):
       attempt = 0
       while attempt < 3:
           try:
               # Execute task
               return execute_task(task)
           except Exception as e:
               if "rate limit" in str(e).lower():
                   attempt += 1
                   print(f"Rate limit hit, retrying in {2**attempt}s...")
                   backoff_strategy(attempt)
               else:
                   raise
       raise Exception("Maximum retries reached")
   ```

### Task List Growing Too Large

**Problem:** BabyAGI is creating too many tasks, causing the task list to grow uncontrollably.

**Symptoms:**
- Task list keeps growing
- Agent spends more time prioritizing than executing
- Memory usage increases
- Execution becomes slow

**Solutions:**

1. **Set task limit:**
   ```python
   baby_agi = BabyAGI(
       openai_api_key="your-api-key",
       objective="Research AI",
       initial_tasks=["Search for AI papers"],
       max_runs=10,
       max_tasks=20  # Limit to 20 tasks
   )
   ```

2. **Implement task pruning:**
   ```python
   class PruningBabyAGI(BabyAGI):
       def __init__(self, *args, max_tasks=20, **kwargs):
           super().__init__(*args, **kwargs)
           self.max_tasks = max_tasks
       
       def create_tasks(self, result, task=None):
           new_tasks = super().create_tasks(result, task)
           
           # Prune tasks if over limit
           total_tasks = len(self.task_list) + len(new_tasks)
           if total_tasks > self.max_tasks:
               # Calculate how many to prune
               to_prune = total_tasks - self.max_tasks
               
               # Remove lowest priority tasks (end of list)
               self.task_list = self.task_list[:-to_prune] if to_prune < len(self.task_list) else []
               
               print(f"Pruned {to_prune} tasks to stay within limit")
           
           return new_tasks
   ```

3. **Refine task creation prompt:**
   ```python
   task_creation_prompt = """
   You are a focused task manager. Based on the objective and previous results,
   create only the most important and necessary tasks to achieve the objective.
   
   Be extremely selective - create at most 3 tasks per iteration.
   Only create tasks that are:
   1. Directly related to the objective
   2. Actionable and specific
   3. Not duplicates of existing tasks
   4. Essential for progress
   
   Objective: {objective}
   Previous results: {results}
   Current task: {task}
   Result: {task_result}
   
   Create 1-3 new tasks:
   """
   ```

### Agent Getting Stuck

**Problem:** BabyAGI is not making progress, getting stuck on certain tasks or repeating the same patterns.

**Symptoms:**
- Agent repeatedly creates similar tasks
- No progress towards objective
- Tasks are not being completed effectively
- Execution seems to loop

**Solutions:**

1. **Refine objective:**
   - Make it more specific
   - Add clear success criteria
   - Break into smaller sub-objectives

2. **Improve initial tasks:**
   ```python
   # Good initial tasks
   initial_tasks = [
       "Research latest AI agent architectures with specific examples",
       "Identify key components required for AI agents",
       "Create a structured outline for the research report",
       "Write the introduction section with clear thesis",
       "Document main findings with supporting evidence"
   ]
   ```

3. **Adjust task creation prompt:**
   ```python
   task_creation_prompt = """
   You are a strategic task manager. Based on the objective and previous results,
   create tasks that will drive meaningful progress towards the objective.
   
   Avoid creating duplicate tasks or tasks that have already been completed.
   Focus on tasks that build upon previous results and move towards completion.
   
   Objective: {objective}
   Completed tasks: {completed_tasks}
   Previous results: {results}
   Current task: {task}
   Result: {task_result}
   
   Create tasks that:
   1. Build on previous work
   2. Address gaps in knowledge
   3. Move towards final completion
   4. Are specific and actionable
   
   New tasks:
   """
   ```

4. **Add task diversity penalty:**
   ```python
   class DiverseBabyAGI(BabyAGI):
       def create_tasks(self, result, task=None):
           new_tasks = super().create_tasks(result, task)
           
           # Filter out duplicate-like tasks
           diverse_tasks = []
           for new_task in new_tasks:
               # Check similarity to existing tasks
               is_duplicate = False
               for existing_task in self.task_list + self.completed_tasks:
                   if self._task_similarity(new_task, existing_task) > 0.7:
                       is_duplicate = True
                       break
               
               if not is_duplicate:
                   diverse_tasks.append(new_task)
           
           if len(diverse_tasks) < len(new_tasks):
               print(f"Filtered out {len(new_tasks) - len(diverse_tasks)} duplicate-like tasks")
           
           return diverse_tasks
       
       def _task_similarity(self, task1, task2):
           """Simple similarity check based on common words"""
           words1 = set(task1.lower().split())
           words2 = set(task2.lower().split())
           common = words1.intersection(words2)
           return len(common) / len(words1.union(words2)) if words1 or words2 else 0
   ```

### Poor Task Quality

**Problem:** BabyAGI is creating low-quality tasks that are not helpful for achieving the objective.

**Symptoms:**
- Tasks are too vague
- Tasks are not actionable
- Tasks are irrelevant to the objective
- Tasks are too broad or too narrow

**Solutions:**

1. **Improve task creation prompt:**
   ```python
   task_creation_prompt = """
   You are an expert task designer. Based on the objective and previous results,
   create high-quality tasks that will effectively contribute to the objective.
   
   Each task should be:
   1. Specific and actionable (not vague)
   2. Directly relevant to the objective
   3. Sized appropriately (not too big or too small)
   4. Clear and understandable
   5. Able to be completed with available resources
   
   Objective: {objective}
   Previous results: {results}
   Current task: {task}
   Result: {task_result}
   
   Example of good tasks:
   - "Research 3 specific AI agent architectures published in 2024"
   - "Create a comparison table of AI agent frameworks with key features"
   - "Write a 500-word section on AI agent memory systems"
   - "Test 2 different prompt strategies for task creation"
   
   Example of bad tasks:
   - "Research AI" (too vague)
   - "Write everything" (too broad)
   - "Learn Python" (irrelevant if objective is about AI agents)
   
   Create 3-5 high-quality tasks:
   """
   ```

2. **Use a more capable LLM:**
   ```python
   from langchain.llms import OpenAI

   # Use GPT-4 instead of GPT-3.5
   llm = OpenAI(
       api_key="your-api-key",
       model="gpt-4",  # More capable model
       temperature=0
   )

   baby_agi = BabyAGI(
       llm=llm,
       objective="Research AI agents",
       initial_tasks=["Search for AI agent papers"]
   )
   ```

3. **Provide task templates:**
   ```python
   task_templates = [
       "Research {topic} with specific examples from the last year",
       "Create a comparison of {item1} vs {item2} with key features",
       "Write a detailed section on {subtopic} with supporting evidence",
       "Test {technique} with concrete parameters",
       "Document {process} with step-by-step instructions"
   ]

   # Incorporate templates into prompt
   task_creation_prompt = f"""
   Use these task templates as inspiration:
   {"\n".join(task_templates)}
   
   Create tasks that follow similar patterns:
   """
   ```

### Memory Issues

**Problem:** BabyAGI is running out of memory or experiencing memory leaks.

**Symptoms:**
- Out of memory errors
- Increasing memory usage over time
- Slowing down as execution progresses
- Crashes during long runs

**Solutions:**

1. **Limit task history:**
   ```python
   class MemoryEfficientBabyAGI(BabyAGI):
       def __init__(self, *args, max_memory_size=10, **kwargs):
           super().__init__(*args, **kwargs)
           self.max_memory_size = max_memory_size
       
       def run(self):
           run_count = 0
           while self.task_list and run_count < self.max_runs:
               # ... existing code ...
               
               # Limit memory size
               if len(self.completed_tasks) > self.max_memory_size:
                   # Keep most recent tasks
                   self.completed_tasks = self.completed_tasks[-self.max_memory_size:]
                   # Also limit results
                   self.results = {k: v for k, v in self.results.items() if k in self.completed_tasks}
               
               run_count += 1
   ```

2. **Optimize result storage:**
   ```python
   class OptimizedBabyAGI(BabyAGI):
       def execute_task(self, task):
           result = super().execute_task(task)
           
           # Truncate long results
           max_result_length = 1000
           if len(result) > max_result_length:
               result = result[:max_result_length] + "... [truncated]"
           
           return result
   ```

3. **Use streaming for large outputs:**
   ```python
   def stream_completion(prompt):
       """Stream LLM output to reduce memory usage"""
       response = ""
       for chunk in openai.Completion.create(
           model="gpt-3.5-turbo-instruct",
           prompt=prompt,
           stream=True
       ): 
           if "text" in chunk.choices[0]:
               chunk_text = chunk.choices[0]["text"]
               response += chunk_text
       return response
   ```

### Task Execution Failures

**Problem:** BabyAGI is failing to execute tasks properly, often due to tool errors or API issues.

**Symptoms:**
- Tasks are marked as completed but with errors
- No meaningful results from task execution
- Error messages in output
- Tasks are skipped or not executed

**Solutions:**

1. **Add error handling to tools:**
   ```python
   def robust_tool_call(tool_func, *args, **kwargs):
       """Call tool with error handling"""
       try:
           return tool_func(*args, **kwargs)
       except Exception as e:
           return f"Error executing tool: {str(e)}"

   # Use with tools
   def search_tool(query):
       """Search for information online"""
       return robust_tool_call(_actual_search, query)
   ```

2. **Implement fallback strategies:**
   ```python
   def execute_task_with_fallback(task):
       """Execute task with fallback strategies"""
       try:
           # First attempt: use primary tool
           return primary_execution(task)
       except Exception as e:
           print(f"Primary execution failed: {str(e)}")
           try:
               # Fallback: use alternative approach
               return fallback_execution(task)
           except Exception as e2:
               print(f"Fallback execution failed: {str(e2)}")
               # Return error message instead of failing
               return f"Warning: Task execution encountered errors. Partial results may be available."
   ```

3. **Add task validation:**
   ```python
   def validate_task(task):
       """Validate task before execution"""
       # Check task validity
       if not task or len(task) < 5:
           return False, "Task is too short or invalid"
       
       # Check for prohibited content
       prohibited = ["harmful", "illegal", "unethical"]
       if any(word in task.lower() for word in prohibited):
           return False, "Task contains prohibited content"
       
       return True, "Task is valid"

   # Use in execute_task
   def execute_task(task):
       valid, message = validate_task(task)
       if not valid:
           return f"Task validation failed: {message}"
       
       # Execute valid task
       return actual_execution(task)
   ```

## Debugging Strategies

### Logging and Monitoring

**Enable detailed logging:**
```python
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("babyagi_debug.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("BabyAGI")

# Log key events
def log_task_execution(task, result):
    logger.info(f"Executed task: {task}")
    logger.info(f"Result length: {len(result)} characters")
    if len(result) > 500:
        logger.info(f"Result preview: {result[:500]}...")
    else:
        logger.info(f"Result: {result}")

def log_task_creation(new_tasks):
    logger.info(f"Created {len(new_tasks)} new tasks:")
    for task in new_tasks:
        logger.info(f"- {task}")

def log_task_prioritization(tasks):
    logger.info(f"Prioritized tasks (top 5):")
    for i, task in enumerate(tasks[:5]):
        logger.info(f"{i+1}. {task}")
```

### Interactive Debugging

**Create a debug mode:**
```python
class DebugBabyAGI(BabyAGI):
    def __init__(self, *args, debug=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.debug = debug
    
    def run(self):
        run_count = 0
        while self.task_list and run_count < self.max_runs:
            if self.debug:
                print(f"\n=== Debug Info (Run {run_count+1}) ===")
                print(f"Current objective: {self.objective}")
                print(f"Task list length: {len(self.task_list)}")
                print(f"Completed tasks: {len(self.completed_tasks)}")
                print(f"Top 3 tasks:")
                for i, task in enumerate(self.task_list[:3]):
                    print(f"  {i+1}. {task}")
                
                # Ask for user input
                user_input = input("Press Enter to continue, 's' to skip task, 'q' to quit: ")
                if user_input == 'q':
                    break
                elif user_input == 's':
                    # Skip current task
                    if self.task_list:
                        skipped_task = self.task_list.pop(0)
                        print(f"Skipped task: {skipped_task}")
                    continue
            
            # ... existing code ...
            
            run_count += 1
```

### Testing Small Components

**Test individual components:**
```python
# Test task creation
def test_task_creation():
    prompt = """
    Objective: Research AI agent architectures
    Previous results: Found information on LangChain and LlamaIndex
    Current task: Research LangChain components
    Result: LangChain has components for memory, tools, and chains
    
    Create new tasks:
    """
    
    # Test LLM response
    response = llm(prompt)
    print("Task creation test:")
    print(response)

# Test task prioritization
def test_task_prioritization():
    tasks = [
        "Research LlamaIndex components",
        "Write introduction to AI agents",
        "Create comparison table",
        "Test LangChain with custom tools"
    ]
    
    prompt = f"""
    Prioritize these tasks for objective 'Research AI agent architectures':
    {"\n".join(tasks)}
    
    Prioritized tasks:
    """
    
    response = llm(prompt)
    print("Task prioritization test:")
    print(response)

# Run tests
test_task_creation()
test_task_prioritization()
```

### Performance Profiling

**Profile BabyAGI execution:**
```python
import cProfile
import pstats

def profile_babyagi():
    # Create BabyAGI instance
    baby_agi = BabyAGI(
        openai_api_key="your-api-key",
        objective="Research AI agents",
        initial_tasks=["Search for AI agent papers"],
        max_runs=3
    )
    
    # Profile execution
    profiler = cProfile.Profile()
    profiler.enable()
    
    try:
        baby_agi.run()
    finally:
        profiler.disable()
        
        # Print stats
        stats = pstats.Stats(profiler)
        stats.sort_stats('cumulative')
        stats.print_stats(20)  # Top 20 functions

# Run profile
profile_babyagi()
```

## Environment Issues

### Dependency Problems

**Problem:** BabyAGI is failing due to missing or incompatible dependencies.

**Symptoms:**
- Import errors
- Version conflicts
- Missing module errors
- Installation failures

**Solutions:**

1. **Create a virtual environment:**
   ```bash
   # Create and activate virtual environment
   python -m venv babyagi-env
   source babyagi-env/bin/activate  # Linux/Mac
   # babyagi-env\Scripts\activate  # Windows

   # Install dependencies
   pip install babyagi langchain openai
   ```

2. **Fix version conflicts:**
   ```bash
   # Create requirements.txt
   echo "babyagi>=0.1.0
   langchain>=0.1.0,<0.2.0
   openai>=1.0.0,<2.0.0
   requests>=2.31.0
   python-dotenv>=1.0.0" > requirements.txt

   # Install with fixed versions
   pip install -r requirements.txt
   ```

3. **Troubleshoot installation:**
   ```bash
   # Check installed packages
   pip list | grep -E "babyagi|langchain|openai"

   # Check Python version
   python --version

   # Upgrade pip
   pip install --upgrade pip

   # Clear cache and reinstall
   pip cache purge
   pip install babyagi
   ```

### Network Issues

**Problem:** BabyAGI is failing due to network connectivity issues.

**Symptoms:**
- Timeout errors
- Connection refused errors
- DNS resolution failures
- API unreachable errors

**Solutions:**

1. **Check network connectivity:**
   ```bash
   # Test internet connection
   ping -c 3 google.com

   # Test API connectivity
   curl -I https://api.openai.com/v1/models
   ```

2. **Use proxy if needed:**
   ```python
   import os

   # Set proxy environment variables
   os.environ['HTTP_PROXY'] = 'http://proxy.example.com:8080'
   os.environ['HTTPS_PROXY'] = 'http://proxy.example.com:8080'

   # Then initialize BabyAGI
   baby_agi = BabyAGI(
       openai_api_key="your-api-key",
       objective="Research AI"
   )
   ```

3. **Implement retry with backoff:**
   ```python
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def call_api_with_retry():
       # API call here
       pass
   ```

### Configuration Issues

**Problem:** BabyAGI is failing due to incorrect configuration.

**Symptoms:**
- Authentication errors
- Invalid parameter errors
- Configuration not found errors
- Environment variable issues

**Solutions:**

1. **Use environment variables:**
   ```bash
   # Set environment variables
   export OPENAI_API_KEY="your-api-key"

   # Then run BabyAGI
   python babyagi_script.py
   ```

2. **Create a config file:**
   ```python
   import json

   # Create config
   config = {
       "openai_api_key": "your-api-key",
       "max_runs": 10,
       "rate_limit_delay": 1.0,
       "objective": "Research AI agents"
   }

   # Save config
   with open("config.json", "w") as f:
       json.dump(config, f, indent=2)

   # Load config
   with open("config.json", "r") as f:
       config = json.load(f)

   # Use config
   baby_agi = BabyAGI(
       openai_api_key=config["openai_api_key"],
       objective=config["objective"],
       max_runs=config["max_runs"]
   )
   ```

3. **Validate configuration:**
   ```python
   def validate_config(config):
       """Validate configuration"""
       required_fields = ["openai_api_key", "objective"]
       for field in required_fields:
           if field not in config:
               raise ValueError(f"Missing required field: {field}")
       
       # Validate API key
       if not config["openai_api_key"] or len(config["openai_api_key"]) < 10:
           raise ValueError("Invalid OpenAI API key")
       
       # Validate objective
       if not config["objective"] or len(config["objective"]) < 5:
           raise ValueError("Objective is too short")
       
       return True

   # Use validation
   config = {"openai_api_key": "your-api-key", "objective": "Research AI"}
   if validate_config(config):
       baby_agi = BabyAGI(**config)
   ```

## Best Practices for Troubleshooting

1. **Start small:**
   - Test with simple objectives
   - Use fewer max_runs initially
   - Verify basic functionality first

2. **Isolate components:**
   - Test LLM connectivity separately
   - Verify tool functionality
   - Check task creation and prioritization

3. **Incrementally add complexity:**
   - Start with basic BabyAGI
   - Add custom tools one by one
   - Implement advanced features gradually

4. **Document everything:**
   - Keep a log of changes
   - Document error messages
   - Record successful configurations

5. **Use version control:**
   - Commit working configurations
   - Branch for experiments
   - Revert to known good states

6. **Leverage community resources:**
   - Check GitHub issues
   - Search Stack Overflow
   - Join Discord/community forums

7. **Be patient:**
   - Troubleshooting takes time
   - Complex agents have many failure points
   - Iteration is key to success

By following these troubleshooting strategies, you can effectively identify and resolve issues with BabyAGI, ensuring that your autonomous agents run smoothly and achieve their objectives efficiently.

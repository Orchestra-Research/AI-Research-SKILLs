import inquirer from 'inquirer';
import chalk from 'chalk';

/**
 * Skill categories with their skill counts and example skills
 */
export const CATEGORIES = [
  { id: '01-model-architecture', name: 'Model Architecture', skills: 6, examples: 'LitGPT, Mamba, TorchTitan, Megatron' },
  { id: '02-tokenization', name: 'Tokenization', skills: 2, examples: 'HuggingFace Tokenizers, SentencePiece' },
  { id: '03-fine-tuning', name: 'Fine-Tuning', skills: 5, examples: 'Axolotl, Unsloth, Torchtune, PEFT' },
  { id: '04-mechanistic-interpretability', name: 'Mechanistic Interp.', skills: 4, examples: 'TransformerLens, SAELens, NNsight' },
  { id: '05-data-processing', name: 'Data Processing', skills: 2, examples: 'NeMo Curator, Ray Data' },
  { id: '06-post-training', name: 'Post-Training', skills: 8, examples: 'GRPO, verl, slime, miles, torchforge' },
  { id: '07-safety-alignment', name: 'Safety & Alignment', skills: 3, examples: 'Constitutional AI, LlamaGuard' },
  { id: '08-distributed-training', name: 'Distributed Training', skills: 6, examples: 'DeepSpeed, FSDP, Megatron, Accelerate' },
  { id: '09-infrastructure', name: 'Infrastructure', skills: 3, examples: 'Modal, SkyPilot, Lambda Labs' },
  { id: '10-optimization', name: 'Optimization', skills: 6, examples: 'Flash Attention, GPTQ, AWQ, bitsandbytes' },
  { id: '11-evaluation', name: 'Evaluation', skills: 3, examples: 'lm-eval-harness, Inspect AI' },
  { id: '12-inference-serving', name: 'Inference Serving', skills: 4, examples: 'vLLM, TensorRT-LLM, SGLang, llama.cpp' },
  { id: '13-mlops', name: 'MLOps', skills: 3, examples: 'Weights & Biases, MLflow, TensorBoard' },
  { id: '14-agents', name: 'Agents', skills: 4, examples: 'LangChain, LlamaIndex, Smolagents' },
  { id: '15-rag', name: 'RAG', skills: 5, examples: 'Chroma, FAISS, Pinecone, Milvus' },
  { id: '16-prompt-engineering', name: 'Prompt Engineering', skills: 4, examples: 'DSPy, Instructor, Outlines, Guidance' },
  { id: '17-observability', name: 'Observability', skills: 2, examples: 'LangSmith, Phoenix' },
  { id: '18-multimodal', name: 'Multimodal', skills: 7, examples: 'CLIP, Whisper, LLaVA, Qwen2-VL' },
  { id: '19-emerging-techniques', name: 'Emerging Techniques', skills: 6, examples: 'MoE, Model Merging, Speculative Decoding' },
  { id: '20-ml-paper-writing', name: 'ML Paper Writing', skills: 1, examples: 'NeurIPS/ICML paper writing' },
];

/**
 * Individual skills for selection
 */
export const INDIVIDUAL_SKILLS = [
  // Post-Training
  { id: '06-post-training/grpo-rl-training', name: 'GRPO Training', category: 'Post-Training' },
  { id: '06-post-training/verl', name: 'verl', category: 'Post-Training' },
  { id: '06-post-training/slime', name: 'slime', category: 'Post-Training' },
  { id: '06-post-training/miles', name: 'miles', category: 'Post-Training' },
  { id: '06-post-training/torchforge', name: 'torchforge', category: 'Post-Training' },
  { id: '06-post-training/trl-fine-tuning', name: 'TRL', category: 'Post-Training' },
  { id: '06-post-training/openrlhf', name: 'OpenRLHF', category: 'Post-Training' },
  { id: '06-post-training/simpo', name: 'SimPO', category: 'Post-Training' },
  // Fine-Tuning
  { id: '03-fine-tuning/axolotl', name: 'Axolotl', category: 'Fine-Tuning' },
  { id: '03-fine-tuning/unsloth', name: 'Unsloth', category: 'Fine-Tuning' },
  { id: '03-fine-tuning/torchtune', name: 'Torchtune', category: 'Fine-Tuning' },
  // Inference
  { id: '12-inference-serving/vllm', name: 'vLLM', category: 'Inference' },
  { id: '12-inference-serving/sglang', name: 'SGLang', category: 'Inference' },
  { id: '12-inference-serving/tensorrt-llm', name: 'TensorRT-LLM', category: 'Inference' },
  // Training
  { id: '08-distributed-training/deepspeed', name: 'DeepSpeed', category: 'Training' },
  { id: '08-distributed-training/fsdp', name: 'FSDP', category: 'Training' },
  { id: '01-model-architecture/torchtitan', name: 'TorchTitan', category: 'Architecture' },
  // Optimization
  { id: '10-optimization/flash-attention', name: 'Flash Attention', category: 'Optimization' },
  { id: '10-optimization/gptq', name: 'GPTQ', category: 'Optimization' },
  // Tools
  { id: '13-mlops/wandb', name: 'Weights & Biases', category: 'MLOps' },
  { id: '11-evaluation/lm-eval-harness', name: 'lm-eval-harness', category: 'Evaluation' },
  { id: '16-prompt-engineering/dspy', name: 'DSPy', category: 'Prompting' },
  { id: '15-rag/chroma', name: 'Chroma', category: 'RAG' },
  // Paper Writing
  { id: '20-ml-paper-writing', name: 'ML Paper Writing', category: 'Writing' },
];

/**
 * Quick start bundle - essential skills including paper writing
 */
export const QUICK_START_SKILLS = [
  '06-post-training/grpo-rl-training',
  '06-post-training/verl',
  '06-post-training/trl-fine-tuning',
  '03-fine-tuning/axolotl',
  '03-fine-tuning/unsloth',
  '12-inference-serving/vllm',
  '12-inference-serving/sglang',
  '08-distributed-training/deepspeed',
  '10-optimization/flash-attention',
  '13-mlops/wandb',
  '11-evaluation/lm-eval-harness',
  '16-prompt-engineering/dspy',
  '15-rag/chroma',
  '20-ml-paper-writing',
];

/**
 * Get total skill count
 */
export function getTotalSkillCount() {
  return CATEGORIES.reduce((sum, cat) => sum + cat.skills, 0);
}

/**
 * Ask main menu action after agent detection
 */
export async function askMainMenuAction() {
  console.log();
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: ' ',
      choices: [
        { name: 'Install new skills', value: 'install' },
        { name: 'View installed skills', value: 'view' },
        { name: 'Update installed skills', value: 'update' },
        { name: 'Uninstall all skills', value: 'uninstall' },
        new inquirer.Separator(' '),
        { name: chalk.dim('Exit'), value: 'exit' },
      ],
      prefix: '   ',
    },
  ]);
  return action;
}

/**
 * Ask to confirm uninstall
 */
export async function askConfirmUninstall() {
  console.log();
  console.log(chalk.yellow('    This will remove all installed skills and symlinks.'));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: ' ',
      choices: [
        { name: chalk.red('Yes, uninstall everything'), value: 'confirm' },
        { name: chalk.dim('← Back'), value: 'back' },
      ],
      prefix: '   ',
    },
  ]);
  return action;
}

/**
 * Ask what to install
 */
export async function askInstallChoice() {
  const totalSkills = getTotalSkillCount();

  console.log();
  console.log(chalk.dim('    What would you like to install?'));
  console.log();

  const { choice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'choice',
      message: ' ',
      choices: [
        {
          name: `Everything                 ${chalk.dim(totalSkills + ' skills')}`,
          value: 'everything',
        },
        {
          name: `Quick start                ${chalk.dim(QUICK_START_SKILLS.length + ' essential skills')}`,
          value: 'quickstart',
        },
        {
          name: `Select categories          ${chalk.dim('Choose by category')}`,
          value: 'categories',
        },
        {
          name: `Select individual skills   ${chalk.dim('Pick specific skills')}`,
          value: 'individual',
        },
        new inquirer.Separator(' '),
        {
          name: chalk.dim('← Back'),
          value: 'back',
        },
      ],
      prefix: '   ',
    },
  ]);

  return choice;
}

/**
 * Ask which categories to install
 */
export async function askCategories() {
  console.log();
  console.log(chalk.dim('    Select categories:'));
  console.log(chalk.dim('    (Space to select, Enter to confirm)'));
  console.log();

  const { categories } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'categories',
      message: ' ',
      choices: CATEGORIES.map(cat => ({
        name: `${cat.name.padEnd(22)} ${chalk.dim((cat.skills + '').padStart(2) + ' skills')}`,
        value: cat.id,
        short: cat.name,
      })),
      prefix: '   ',
      pageSize: 12,
    },
  ]);

  if (categories.length === 0) {
    console.log();
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.yellow('No categories selected'),
        choices: [
          { name: 'Try again', value: 'retry' },
          { name: chalk.dim('← Back'), value: 'back' },
        ],
        prefix: '   ',
      },
    ]);
    return { categories: [], action };
  }

  return { categories, action: 'confirm' };
}

/**
 * Ask which individual skills to install
 */
export async function askIndividualSkills() {
  console.log();
  console.log(chalk.dim('    Select skills:'));
  console.log(chalk.dim('    (Space to select, Enter to confirm)'));
  console.log();

  const { skills } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'skills',
      message: ' ',
      choices: INDIVIDUAL_SKILLS.map(skill => ({
        name: `${skill.name.padEnd(20)} ${chalk.dim(skill.category)}`,
        value: skill.id,
        short: skill.name,
      })),
      prefix: '   ',
      pageSize: 15,
    },
  ]);

  if (skills.length === 0) {
    console.log();
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.yellow('No skills selected'),
        choices: [
          { name: 'Try again', value: 'retry' },
          { name: chalk.dim('← Back'), value: 'back' },
        ],
        prefix: '   ',
      },
    ]);
    return { skills: [], action };
  }

  return { skills, action: 'confirm' };
}

/**
 * Ask for confirmation with description
 */
export async function askConfirmation(skillCount, agents, selectedCategories, selectedSkills, installType) {
  console.log();
  console.log(chalk.white('    Installation Summary'));
  console.log(chalk.dim('    ─────────────────────────────────────────────────────'));
  console.log();

  // What's being installed
  console.log(`    ${chalk.white('Skills:')}     ${skillCount} skills`);
  console.log(`    ${chalk.white('Agents:')}     ${agents.map(a => a.name).join(', ')}`);
  console.log();

  // Description based on install type
  if (installType === 'everything') {
    console.log(chalk.dim('    All 20 categories including:'));
    console.log(chalk.dim('    Post-Training, Fine-Tuning, Inference, Distributed Training,'));
    console.log(chalk.dim('    Optimization, Evaluation, MLOps, RAG, Agents, Paper Writing...'));
  } else if (installType === 'quickstart') {
    console.log(chalk.dim('    Essential skills for AI research:'));
    console.log(chalk.dim('    • GRPO, verl, TRL for post-training'));
    console.log(chalk.dim('    • Axolotl, Unsloth for fine-tuning'));
    console.log(chalk.dim('    • vLLM, SGLang for inference'));
    console.log(chalk.dim('    • DeepSpeed, Flash Attention for training'));
    console.log(chalk.dim('    • W&B, lm-eval, DSPy, Chroma'));
    console.log(chalk.dim('    • ML Paper Writing for NeurIPS/ICML'));
  } else if (selectedCategories && selectedCategories.length > 0) {
    const catNames = CATEGORIES
      .filter(c => selectedCategories.includes(c.id))
      .map(c => c.name);
    console.log(chalk.dim('    Selected categories:'));
    catNames.forEach(name => console.log(chalk.dim(`    • ${name}`)));
  } else if (selectedSkills && selectedSkills.length > 0) {
    console.log(chalk.dim('    Selected skills:'));
    const skillNames = INDIVIDUAL_SKILLS
      .filter(s => selectedSkills.includes(s.id))
      .map(s => s.name)
      .slice(0, 8);
    skillNames.forEach(name => console.log(chalk.dim(`    • ${name}`)));
    if (selectedSkills.length > 8) {
      console.log(chalk.dim(`    • ...and ${selectedSkills.length - 8} more`));
    }
  }

  console.log();
  console.log(chalk.dim('    ─────────────────────────────────────────────────────'));
  console.log();

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: ' ',
      choices: [
        { name: chalk.green('Install'), value: 'confirm' },
        { name: chalk.dim('← Back'), value: 'back' },
        { name: chalk.dim('Exit'), value: 'exit' },
      ],
      prefix: '   ',
    },
  ]);

  return action;
}

/**
 * Ask which agents to install to
 */
export async function askSelectAgents(agents) {
  console.log();
  console.log(chalk.dim('    Install to which agents?'));
  console.log();

  const { selection } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: ' ',
      choices: [
        { name: `All detected agents (${agents.length})`, value: 'all' },
        { name: 'Select specific agents', value: 'select' },
        new inquirer.Separator(' '),
        { name: chalk.dim('← Back'), value: 'back' },
      ],
      prefix: '   ',
    },
  ]);

  if (selection === 'back') {
    return { agents: [], action: 'back' };
  }

  if (selection === 'all') {
    return { agents, action: 'confirm' };
  }

  // Select specific agents
  console.log();
  const { selectedAgents } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selectedAgents',
      message: ' ',
      choices: agents.map(agent => ({
        name: `${agent.name.padEnd(14)} ${chalk.dim(agent.path)}`,
        value: agent,
        checked: true,
      })),
      prefix: '   ',
    },
  ]);

  if (selectedAgents.length === 0) {
    console.log();
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: chalk.yellow('No agents selected'),
        choices: [
          { name: 'Try again', value: 'retry' },
          { name: chalk.dim('← Back'), value: 'back' },
        ],
        prefix: '   ',
      },
    ]);
    return { agents: [], action };
  }

  return { agents: selectedAgents, action: 'confirm' };
}

/**
 * Ask what to do after viewing/updating
 */
export async function askAfterAction() {
  console.log();
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: ' ',
      choices: [
        { name: '← Back to main menu', value: 'back' },
        { name: chalk.dim('Exit'), value: 'exit' },
      ],
      prefix: '   ',
    },
  ]);
  return action;
}

/**
 * Parse command line arguments
 */
export function parseArgs(args) {
  const options = {
    command: null,
    all: false,
    category: null,
    skill: null,
    agent: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === 'install') {
      options.command = 'install';
    } else if (arg === 'list') {
      options.command = 'list';
    } else if (arg === 'update') {
      options.command = 'update';
    } else if (arg === '--all' || arg === '-a') {
      options.all = true;
    } else if (arg === '--agent' && args[i + 1]) {
      options.agent = args[++i];
    } else if (arg === '--category' && args[i + 1]) {
      options.category = args[++i];
    } else if (!arg.startsWith('-') && !options.command) {
      options.skill = arg;
    }
  }

  return options;
}

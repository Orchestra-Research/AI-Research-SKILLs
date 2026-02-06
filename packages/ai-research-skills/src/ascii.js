import chalk from 'chalk';

// Clean capital ORCHESTRA
const logo = `

      ██████╗ ██████╗  ██████╗ ██╗  ██╗ ███████╗ ███████╗ ████████╗ ██████╗   █████╗
     ██╔═══██╗██╔══██╗██╔════╝ ██║  ██║ ██╔════╝ ██╔════╝ ╚══██╔══╝ ██╔══██╗ ██╔══██╗
     ██║   ██║██████╔╝██║      ███████║ █████╗   ███████╗    ██║    ██████╔╝ ███████║
     ██║   ██║██╔══██╗██║      ██╔══██║ ██╔══╝   ╚════██║    ██║    ██╔══██╗ ██╔══██║
     ╚██████╔╝██║  ██║╚██████╗ ██║  ██║ ███████╗ ███████║    ██║    ██║  ██║ ██║  ██║
      ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚══════╝ ╚══════╝    ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝

`;

/**
 * Welcome screen
 */
export function showWelcome(skillCount = 82, categoryCount = 20, agentCount = 6) {
  console.clear();
  console.log(chalk.white(logo));
  console.log();
  console.log(chalk.bold.white('                          AI Research Skills'));
  console.log();
  console.log();
  console.log(chalk.dim('              Expert-level knowledge for AI research engineering'));
  console.log();
  console.log();
  console.log(`              ${skillCount} skills   ·   ${categoryCount} categories   ·   ${agentCount} agents`);
  console.log();
  console.log();
}

/**
 * Agents detected screen
 */
export function showAgentsDetected(agents) {
  console.clear();
  console.log(chalk.white(logo));
  console.log();
  console.log(chalk.bold.white('                          AI Research Skills'));
  console.log();
  console.log();
  console.log(chalk.green(`              ✓  Found ${agents.length} coding agent${agents.length !== 1 ? 's' : ''}`));
  console.log();

  for (const agent of agents) {
    console.log(`                  ${chalk.green('●')}  ${chalk.white(agent.name.padEnd(14))} ${chalk.dim(agent.path)}`);
  }

  console.log();
  console.log();
}

/**
 * Menu header for inner screens
 */
export function showMenuHeader() {
  console.clear();
  console.log();
  console.log(chalk.dim('    ────────────────────────────────────────────────────────────'));
  console.log(chalk.white('                      ORCHESTRA  ·  AI Research Skills'));
  console.log(chalk.dim('    ────────────────────────────────────────────────────────────'));
  console.log();
}

/**
 * Success screen
 */
export function showSuccess(skillCount, agents) {
  console.clear();
  console.log();
  console.log();
  console.log(chalk.green.bold('                          ✓  Installation Complete'));
  console.log();
  console.log();
  console.log(`              Installed ${chalk.white(skillCount)} skills to ${chalk.white(agents.length)} agent${agents.length !== 1 ? 's' : ''}`);
  console.log();
  console.log(chalk.dim('              Your skills are now active and will appear when relevant.'));
  console.log();
  console.log();
  console.log(chalk.dim('    ────────────────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.white('              Examples:'));
  console.log();
  console.log(chalk.dim('                  →  "Help me set up GRPO training with verl"'));
  console.log(chalk.dim('                  →  "How do I serve a model with vLLM?"'));
  console.log(chalk.dim('                  →  "Write a NeurIPS paper introduction"'));
  console.log();
  console.log(chalk.dim('    ────────────────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.white('              Commands:'));
  console.log();
  console.log(`              ${chalk.dim('$')} ${chalk.cyan('npx @orchestra-research/ai-research-skills')}`);
  console.log(`              ${chalk.dim('$')} ${chalk.cyan('npx @orchestra-research/ai-research-skills list')}`);
  console.log(`              ${chalk.dim('$')} ${chalk.cyan('npx @orchestra-research/ai-research-skills update')}`);
  console.log();
  console.log(chalk.dim('    ────────────────────────────────────────────────────────────'));
  console.log();
  console.log(chalk.dim('              github.com/orchestra-research/ai-research-skills'));
  console.log();
}

/**
 * No agents found screen
 */
export function showNoAgents() {
  console.clear();
  console.log(chalk.white(logo));
  console.log();
  console.log(chalk.bold.white('                          AI Research Skills'));
  console.log();
  console.log();
  console.log(chalk.yellow('              ⚠  No coding agents detected'));
  console.log();
  console.log(chalk.dim('              Install one of these supported agents:'));
  console.log();
  console.log('                  ○  Claude Code');
  console.log('                  ○  OpenCode');
  console.log('                  ○  OpenClaw');
  console.log('                  ○  Cursor');
  console.log('                  ○  Codex (OpenAI)');
  console.log('                  ○  Gemini CLI');
  console.log('                  ○  Qwen Code');
  console.log('                  ○  .agents (shared)');
  console.log();
  console.log();
}

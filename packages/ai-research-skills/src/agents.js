import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Supported coding agents with their global and local config directories
 *
 * Global: ~/.{agent}/skills/ (home directory)
 * Local:  .{agent}/skills/  (project directory)
 *
 * localConfigDir/localSkillsDir define where skills go at the project level.
 * These may differ from global paths (e.g., Cursor uses .cursor/rules/ locally).
 */
export const SUPPORTED_AGENTS = [
  {
    id: 'claude',
    name: 'Claude Code',
    configDir: '.claude',
    skillsDir: 'skills',
    localConfigDir: '.claude',
    localSkillsDir: 'skills',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    configDir: '.cursor',
    skillsDir: 'skills',
    localConfigDir: '.cursor',
    localSkillsDir: 'rules',
  },
  {
    id: 'codex',
    name: 'Codex',
    configDir: '.codex',
    skillsDir: 'skills',
    localConfigDir: '.codex',
    localSkillsDir: 'skills',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    configDir: '.gemini',
    skillsDir: 'skills',
    localConfigDir: '.gemini',
    localSkillsDir: 'skills',
  },
  {
    id: 'qwen',
    name: 'Qwen Code',
    configDir: '.qwen',
    skillsDir: 'skills',
    localConfigDir: '.qwen',
    localSkillsDir: 'skills',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    configDir: '.config/opencode',
    skillsDir: 'skills',
    localConfigDir: '.opencode',
    localSkillsDir: 'skills',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    configDir: '.openclaw',
    skillsDir: 'skills',
    localConfigDir: '.openclaw',
    localSkillsDir: 'skills',
  },
  {
    id: 'agents',
    name: 'Shared Agents',
    configDir: '.agents',
    skillsDir: 'skills',
    localConfigDir: '.agents',
    localSkillsDir: 'skills',
  },
];

/**
 * Detect which coding agents are installed on the system (global)
 * @returns {Array} List of detected agents with their paths
 */
export function detectAgents() {
  const home = homedir();
  const detected = [];

  for (const agent of SUPPORTED_AGENTS) {
    const configPath = join(home, agent.configDir);

    if (existsSync(configPath)) {
      detected.push({
        ...agent,
        path: `~/${agent.configDir}`,
        fullPath: configPath,
        skillsPath: join(configPath, agent.skillsDir),
      });
    }
  }

  return detected;
}

/**
 * Build local agent targets for a given project directory
 * @param {Array} agents - List of agent configs (from SUPPORTED_AGENTS or detectAgents)
 * @param {string} projectDir - Absolute path to the project root
 * @returns {Array} List of agents with local paths set
 */
export function buildLocalAgentTargets(agents, projectDir) {
  return agents.map(agent => ({
    ...agent,
    path: `./${agent.localConfigDir || agent.configDir}`,
    fullPath: join(projectDir, agent.localConfigDir || agent.configDir),
    skillsPath: join(projectDir, agent.localConfigDir || agent.configDir, agent.localSkillsDir || agent.skillsDir),
    local: true,
  }));
}

/**
 * Detect which coding agents have local skills in a project directory
 * @param {string} projectDir - Absolute path to the project root
 * @returns {Array} List of agents with local skills directories
 */
export function detectLocalAgents(projectDir) {
  const detected = [];

  for (const agent of SUPPORTED_AGENTS) {
    const localConfigDir = agent.localConfigDir || agent.configDir;
    const localSkillsDir = agent.localSkillsDir || agent.skillsDir;
    const skillsPath = join(projectDir, localConfigDir, localSkillsDir);

    if (existsSync(skillsPath)) {
      detected.push({
        ...agent,
        path: `./${localConfigDir}`,
        fullPath: join(projectDir, localConfigDir),
        skillsPath,
        local: true,
      });
    }
  }

  return detected;
}

/**
 * Get agent by ID
 * @param {string} id Agent ID
 * @returns {Object|null} Agent configuration or null
 */
export function getAgentById(id) {
  return SUPPORTED_AGENTS.find(agent => agent.id === id) || null;
}

/**
 * Get all supported agent IDs
 * @returns {Array<string>} List of agent IDs
 */
export function getSupportedAgentIds() {
  return SUPPORTED_AGENTS.map(agent => agent.id);
}

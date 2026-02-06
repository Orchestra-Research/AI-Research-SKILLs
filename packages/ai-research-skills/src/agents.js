import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Supported coding agents with their global config directories and skills paths
 * All agents now support ~/.{agent}/skills/ format
 */
export const SUPPORTED_AGENTS = [
  {
    id: 'claude',
    name: 'Claude Code',
    configDir: '.claude',
    skillsDir: 'skills',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    configDir: '.cursor',
    skillsDir: 'skills',
  },
  {
    id: 'codex',
    name: 'Codex',
    configDir: '.codex',
    skillsDir: 'skills',
  },
  {
    id: 'gemini',
    name: 'Gemini CLI',
    configDir: '.gemini',
    skillsDir: 'skills',
  },
  {
    id: 'qwen',
    name: 'Qwen Code',
    configDir: '.qwen',
    skillsDir: 'skills',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    configDir: '.config/opencode',
    skillsDir: 'skills',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    configDir: '.openclaw',
    skillsDir: 'skills',
  },
  {
    id: 'agents',
    name: 'Shared Agents',
    configDir: '.agents',
    skillsDir: 'skills',
  },
];

/**
 * Detect which coding agents are installed on the system
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

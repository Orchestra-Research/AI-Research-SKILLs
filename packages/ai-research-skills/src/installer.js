import { existsSync, mkdirSync, symlinkSync, readdirSync, readFileSync, writeFileSync, rmSync, lstatSync, cpSync } from 'fs';
import { homedir } from 'os';
import { join, basename, dirname } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

const REPO_URL = 'https://github.com/Orchestra-Research/AI-research-SKILLs';
const CANONICAL_DIR = join(homedir(), '.orchestra', 'skills');
const LOCK_FILE = join(homedir(), '.orchestra', '.lock.json');
const LOCAL_LOCK_FILENAME = '.orchestra-skills.json';

/**
 * Copy directory contents (cross-platform replacement for `cp -r source/* dest/`)
 */
function copyDirectoryContents(source, dest) {
  const entries = readdirSync(source, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(source, entry.name);
    const destPath = join(dest, entry.name);
    cpSync(srcPath, destPath, { recursive: true });
  }
}

/**
 * Ensure the canonical skills directory exists
 */
function ensureCanonicalDir() {
  const orchestraDir = join(homedir(), '.orchestra');
  if (!existsSync(orchestraDir)) {
    mkdirSync(orchestraDir, { recursive: true });
  }
  if (!existsSync(CANONICAL_DIR)) {
    mkdirSync(CANONICAL_DIR, { recursive: true });
  }
}

/**
 * Read lock file
 */
function readLock() {
  if (existsSync(LOCK_FILE)) {
    try {
      return JSON.parse(readFileSync(LOCK_FILE, 'utf8'));
    } catch {
      return { version: null, installedAt: null, skills: [] };
    }
  }
  return { version: null, installedAt: null, skills: [] };
}

/**
 * Write lock file
 */
function writeLock(data) {
  writeFileSync(LOCK_FILE, JSON.stringify(data, null, 2));
}

/**
 * Download skills from GitHub
 */
async function downloadSkills(categories, spinner) {
  ensureCanonicalDir();

  // Clone or update the repository to a temp location
  const tempDir = join(homedir(), '.orchestra', '.temp-clone');

  try {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    spinner.text = 'Cloning repository...';
    execSync(`git clone --depth 1 ${REPO_URL}.git ${tempDir}`, {
      stdio: 'pipe',
    });

    const skills = [];

    // Copy selected categories
    for (const categoryId of categories) {
      const categoryPath = join(tempDir, categoryId);
      if (!existsSync(categoryPath)) continue;

      const targetCategoryPath = join(CANONICAL_DIR, categoryId);
      if (!existsSync(targetCategoryPath)) {
        mkdirSync(targetCategoryPath, { recursive: true });
      }

      // Check if it's a standalone skill (SKILL.md directly in category)
      const standaloneSkillPath = join(categoryPath, 'SKILL.md');
      if (existsSync(standaloneSkillPath)) {
        // Copy the entire category as a standalone skill
        spinner.text = `Downloading ${categoryId}...`;
        copyDirectoryContents(categoryPath, targetCategoryPath);
        skills.push({ category: categoryId, skill: categoryId, standalone: true });
      } else {
        // It's a nested category with multiple skills
        const entries = readdirSync(categoryPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillPath = join(categoryPath, entry.name, 'SKILL.md');
            if (existsSync(skillPath)) {
              spinner.text = `Downloading ${entry.name}...`;
              const targetSkillPath = join(targetCategoryPath, entry.name);
              if (!existsSync(targetSkillPath)) {
                mkdirSync(targetSkillPath, { recursive: true });
              }
              copyDirectoryContents(join(categoryPath, entry.name), targetSkillPath);
              skills.push({ category: categoryId, skill: entry.name, standalone: false });
            }
          }
        }
      }
    }

    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });

    return skills;
  } catch (error) {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Create symlinks for an agent
 */
function createSymlinks(agent, skills, spinner) {
  const agentSkillsPath = agent.skillsPath;

  // Ensure agent skills directory exists
  if (!existsSync(agentSkillsPath)) {
    mkdirSync(agentSkillsPath, { recursive: true });
  }

  let linkedCount = 0;

  for (const skill of skills) {
    const sourcePath = skill.standalone
      ? join(CANONICAL_DIR, skill.category)
      : join(CANONICAL_DIR, skill.category, skill.skill);

    const linkName = skill.standalone ? skill.category : skill.skill;
    const linkPath = join(agentSkillsPath, linkName);

    // Remove existing symlink if present
    if (existsSync(linkPath)) {
      rmSync(linkPath, { recursive: true, force: true });
    }

    try {
      symlinkSync(sourcePath, linkPath);
      linkedCount++;
    } catch (error) {
      // Ignore symlink errors (e.g., already exists)
    }
  }

  return linkedCount;
}

/**
 * Download specific skills from GitHub
 */
async function downloadSpecificSkills(skillPaths, spinner) {
  ensureCanonicalDir();

  // Clone or update the repository to a temp location
  const tempDir = join(homedir(), '.orchestra', '.temp-clone');

  try {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    spinner.text = 'Cloning repository...';
    execSync(`git clone --depth 1 ${REPO_URL}.git ${tempDir}`, {
      stdio: 'pipe',
    });

    const skills = [];

    // Copy selected skills
    for (const skillPath of skillPaths) {
      // skillPath can be like '06-post-training/verl' or '20-ml-paper-writing' (standalone)
      const parts = skillPath.split('/');
      const categoryId = parts[0];
      const skillName = parts[1] || null;

      const targetCategoryPath = join(CANONICAL_DIR, categoryId);
      if (!existsSync(targetCategoryPath)) {
        mkdirSync(targetCategoryPath, { recursive: true });
      }

      if (skillName) {
        // Nested skill like '06-post-training/verl'
        const sourcePath = join(tempDir, categoryId, skillName);
        if (existsSync(sourcePath)) {
          spinner.text = `Downloading ${skillName}...`;
          const targetSkillPath = join(targetCategoryPath, skillName);
          if (!existsSync(targetSkillPath)) {
            mkdirSync(targetSkillPath, { recursive: true });
          }
          copyDirectoryContents(sourcePath, targetSkillPath);
          skills.push({ category: categoryId, skill: skillName, standalone: false });
        }
      } else {
        // Standalone skill like '20-ml-paper-writing'
        const sourcePath = join(tempDir, categoryId);
        if (existsSync(sourcePath)) {
          spinner.text = `Downloading ${categoryId}...`;
          copyDirectoryContents(sourcePath, targetCategoryPath);
          skills.push({ category: categoryId, skill: categoryId, standalone: true });
        }
      }
    }

    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });

    return skills;
  } catch (error) {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

/**
 * Install specific skills to agents
 */
export async function installSpecificSkills(skillPaths, agents) {
  const spinner = ora('Downloading from GitHub...').start();

  try {
    // Download skills
    const skills = await downloadSpecificSkills(skillPaths, spinner);
    spinner.succeed(`Downloaded ${skills.length} skills`);

    // Create symlinks for each agent
    spinner.start('Creating symlinks...');

    for (const agent of agents) {
      const count = createSymlinks(agent, skills, spinner);
      console.log(`    ${chalk.green('✓')} ${agent.name.padEnd(14)} ${chalk.dim('→')} ${agent.skillsPath.replace(homedir(), '~').padEnd(25)} ${chalk.green(count + ' skills')}`);
    }

    spinner.stop();

    // Update lock file
    const lock = readLock();
    lock.version = '1.0.0';
    lock.installedAt = new Date().toISOString();
    lock.skills = [...(lock.skills || []), ...skills];
    lock.agents = agents.map(a => a.id);
    writeLock(lock);

    return skills.length;
  } catch (error) {
    spinner.fail('Installation failed');
    throw error;
  }
}

/**
 * Install skills to agents
 */
export async function installSkills(categories, agents) {
  const spinner = ora('Downloading from GitHub...').start();

  try {
    // Download skills
    const skills = await downloadSkills(categories, spinner);
    spinner.succeed(`Downloaded ${skills.length} skills`);

    // Create symlinks for each agent
    spinner.start('Creating symlinks...');
    const results = [];

    for (const agent of agents) {
      const count = createSymlinks(agent, skills, spinner);
      results.push({ agent, count });
      console.log(`    ${chalk.green('✓')} ${agent.name.padEnd(14)} ${chalk.dim('→')} ${agent.skillsPath.replace(homedir(), '~').padEnd(25)} ${chalk.green(count + ' skills')}`);
    }

    spinner.stop();

    // Update lock file
    const lock = readLock();
    lock.version = '1.0.0';
    lock.installedAt = new Date().toISOString();
    lock.skills = skills;
    lock.agents = agents.map(a => a.id);
    writeLock(lock);

    return skills.length;
  } catch (error) {
    spinner.fail('Installation failed');
    throw error;
  }
}

/**
 * List installed skills by scanning actual folders
 */
export function listInstalledSkills() {
  // Check if canonical skills directory exists
  if (!existsSync(CANONICAL_DIR)) {
    console.log(chalk.yellow('    No skills installed yet.'));
    console.log();
    console.log(`    Run ${chalk.cyan('npx @orchestra-research/ai-research-skills')} to install skills.`);
    return;
  }

  // Scan the actual skills directory
  const categories = readdirSync(CANONICAL_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  if (categories.length === 0) {
    console.log(chalk.yellow('    No skills installed yet.'));
    console.log();
    console.log(`    Run ${chalk.cyan('npx @orchestra-research/ai-research-skills')} to install skills.`);
    return;
  }

  const byCategory = {};
  let totalSkills = 0;

  for (const category of categories) {
    const categoryPath = join(CANONICAL_DIR, category);

    // Check if it's a standalone skill (has SKILL.md directly)
    const standaloneSkill = join(categoryPath, 'SKILL.md');
    if (existsSync(standaloneSkill)) {
      byCategory[category] = [category];
      totalSkills++;
    } else {
      // It's a category with nested skills
      const skills = readdirSync(categoryPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && existsSync(join(categoryPath, d.name, 'SKILL.md')))
        .map(d => d.name)
        .sort();

      if (skills.length > 0) {
        byCategory[category] = skills;
        totalSkills += skills.length;
      }
    }
  }

  console.log(chalk.white.bold(`    Installed Skills (${totalSkills})`));
  console.log();

  for (const [category, skills] of Object.entries(byCategory)) {
    console.log(chalk.cyan(`    ${category}`));
    for (const skill of skills) {
      if (skill === category) {
        // Standalone skill
        console.log(`      ${chalk.dim('●')} ${chalk.white('(standalone)')}`);
      } else {
        console.log(`      ${chalk.dim('●')} ${skill}`);
      }
    }
    console.log();
  }

  // Show storage location
  console.log(chalk.dim(`    Location: ${CANONICAL_DIR.replace(homedir(), '~')}`));
}

/**
 * Get all category IDs
 */
export function getAllCategoryIds() {
  return [
    '01-model-architecture',
    '02-tokenization',
    '03-fine-tuning',
    '04-mechanistic-interpretability',
    '05-data-processing',
    '06-post-training',
    '07-safety-alignment',
    '08-distributed-training',
    '09-infrastructure',
    '10-optimization',
    '11-evaluation',
    '12-inference-serving',
    '13-mlops',
    '14-agents',
    '15-rag',
    '16-prompt-engineering',
    '17-observability',
    '18-multimodal',
    '19-emerging-techniques',
    '20-ml-paper-writing',
  ];
}

/**
 * Get installed skill paths for updating
 * Returns array like ['06-post-training/verl', '20-ml-paper-writing']
 */
export function getInstalledSkillPaths() {
  if (!existsSync(CANONICAL_DIR)) {
    return [];
  }

  const skillPaths = [];
  const categories = readdirSync(CANONICAL_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const category of categories) {
    const categoryPath = join(CANONICAL_DIR, category);

    // Check if it's a standalone skill (has SKILL.md directly)
    const standaloneSkill = join(categoryPath, 'SKILL.md');
    if (existsSync(standaloneSkill)) {
      skillPaths.push(category);
    } else {
      // It's a category with nested skills
      const skills = readdirSync(categoryPath, { withFileTypes: true })
        .filter(d => d.isDirectory() && existsSync(join(categoryPath, d.name, 'SKILL.md')))
        .map(d => d.name);

      for (const skill of skills) {
        skillPaths.push(`${category}/${skill}`);
      }
    }
  }

  return skillPaths;
}

/**
 * Update only installed skills (re-download from GitHub)
 */
export async function updateInstalledSkills(agents) {
  const installedPaths = getInstalledSkillPaths();

  if (installedPaths.length === 0) {
    console.log(chalk.yellow('    No skills installed to update.'));
    return 0;
  }

  const spinner = ora('Updating from GitHub...').start();

  try {
    // Download only the installed skills
    const skills = await downloadSpecificSkills(installedPaths, spinner);
    spinner.succeed(`Updated ${skills.length} skills`);

    // Re-create symlinks for each agent
    spinner.start('Refreshing symlinks...');

    for (const agent of agents) {
      const count = createSymlinks(agent, skills, spinner);
      console.log(`    ${chalk.green('✓')} ${agent.name.padEnd(14)} ${chalk.dim('→')} ${agent.skillsPath.replace(homedir(), '~').padEnd(25)} ${chalk.green(count + ' skills')}`);
    }

    spinner.stop();

    // Update lock file
    const lock = readLock();
    lock.version = '1.0.0';
    lock.installedAt = new Date().toISOString();
    lock.skills = skills;
    lock.agents = agents.map(a => a.id);
    writeLock(lock);

    return skills.length;
  } catch (error) {
    spinner.fail('Update failed');
    throw error;
  }
}

/**
 * Uninstall all skills
 */
export async function uninstallAllSkills(agents) {
  const spinner = ora('Removing skills...').start();

  try {
    // Remove symlinks from each agent
    for (const agent of agents) {
      if (existsSync(agent.skillsPath)) {
        const entries = readdirSync(agent.skillsPath, { withFileTypes: true });
        for (const entry of entries) {
          const linkPath = join(agent.skillsPath, entry.name);
          // Only remove if it's a symlink pointing to our canonical dir
          try {
            const stats = lstatSync(linkPath);
            if (stats.isSymbolicLink()) {
              rmSync(linkPath, { force: true });
            }
          } catch {
            // Ignore errors
          }
        }
      }
      console.log(`    ${chalk.green('✓')} Removed symlinks from ${agent.name}`);
    }

    // Remove canonical skills directory
    if (existsSync(CANONICAL_DIR)) {
      rmSync(CANONICAL_DIR, { recursive: true, force: true });
      console.log(`    ${chalk.green('✓')} Removed ${CANONICAL_DIR.replace(homedir(), '~')}`);
    }

    // Remove lock file
    if (existsSync(LOCK_FILE)) {
      rmSync(LOCK_FILE, { force: true });
    }

    spinner.stop();
    return true;
  } catch (error) {
    spinner.fail('Uninstall failed');
    throw error;
  }
}

/**
 * Uninstall specific skills
 * @param {Array<string>} skillPaths - Paths like ['06-post-training/verl', '20-ml-paper-writing']
 * @param {Array} agents - List of agents to remove symlinks from
 */
export async function uninstallSpecificSkills(skillPaths, agents) {
  const spinner = ora('Removing selected skills...').start();

  try {
    for (const skillPath of skillPaths) {
      const parts = skillPath.split('/');
      const categoryId = parts[0];
      const skillName = parts[1] || null;

      // Determine the link name (what appears in agent's skills folder)
      const linkName = skillName || categoryId;

      // Remove symlinks from each agent
      for (const agent of agents) {
        const linkPath = join(agent.skillsPath, linkName);
        try {
          if (existsSync(linkPath)) {
            const stats = lstatSync(linkPath);
            if (stats.isSymbolicLink()) {
              rmSync(linkPath, { force: true });
            }
          }
        } catch {
          // Ignore errors
        }
      }

      // Remove from canonical directory
      if (skillName) {
        // Nested skill like '06-post-training/verl'
        const skillDir = join(CANONICAL_DIR, categoryId, skillName);
        if (existsSync(skillDir)) {
          rmSync(skillDir, { recursive: true, force: true });
        }
        // Clean up empty category folder
        const categoryDir = join(CANONICAL_DIR, categoryId);
        if (existsSync(categoryDir)) {
          const remaining = readdirSync(categoryDir);
          if (remaining.length === 0) {
            rmSync(categoryDir, { recursive: true, force: true });
          }
        }
      } else {
        // Standalone skill like '20-ml-paper-writing'
        const skillDir = join(CANONICAL_DIR, categoryId);
        if (existsSync(skillDir)) {
          rmSync(skillDir, { recursive: true, force: true });
        }
      }

      spinner.text = `Removed ${linkName}`;
    }

    spinner.succeed(`Removed ${skillPaths.length} skill${skillPaths.length !== 1 ? 's' : ''}`);

    // Update lock file
    const lock = readLock();
    if (lock.skills) {
      lock.skills = lock.skills.filter(s => {
        const path = s.standalone ? s.category : `${s.category}/${s.skill}`;
        return !skillPaths.includes(path);
      });
      writeLock(lock);
    }

    return skillPaths.length;
  } catch (error) {
    spinner.fail('Uninstall failed');
    throw error;
  }
}

/**
 * Get installed skills with display info for selection
 * Returns array of { path, name, category } for UI
 */
export function getInstalledSkillsForSelection() {
  const paths = getInstalledSkillPaths();
  return paths.map(path => {
    const parts = path.split('/');
    if (parts.length === 1) {
      // Standalone skill
      return { path, name: parts[0], category: 'Standalone', standalone: true };
    } else {
      // Nested skill
      return { path, name: parts[1], category: parts[0], standalone: false };
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Local (project-level) installation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the local lock file path for a project
 */
function getLocalLockPath(projectDir) {
  return join(projectDir, LOCAL_LOCK_FILENAME);
}

/**
 * Read local lock file
 */
function readLocalLock(projectDir) {
  const lockPath = getLocalLockPath(projectDir);
  if (existsSync(lockPath)) {
    try {
      return JSON.parse(readFileSync(lockPath, 'utf8'));
    } catch {
      return { version: null, installedAt: null, skills: [], agents: [] };
    }
  }
  return { version: null, installedAt: null, skills: [], agents: [] };
}

/**
 * Write local lock file
 */
function writeLocalLock(projectDir, data) {
  writeFileSync(getLocalLockPath(projectDir), JSON.stringify(data, null, 2));
}

/**
 * Copy skills directly into agent local directories (no symlinks)
 * @param {Object} agent - Agent with skillsPath set to local project path
 * @param {Array} skills - Skills list from download
 * @param {string} tempDir - Temp clone directory
 */
function copySkillsToLocal(agent, skills, tempDir) {
  const agentSkillsPath = agent.skillsPath;

  if (!existsSync(agentSkillsPath)) {
    mkdirSync(agentSkillsPath, { recursive: true });
  }

  let copiedCount = 0;

  for (const skill of skills) {
    const sourcePath = skill.standalone
      ? join(tempDir, skill.category)
      : join(tempDir, skill.category, skill.skill);

    if (!existsSync(sourcePath)) continue;

    const destName = skill.standalone ? skill.category : skill.skill;
    const destPath = join(agentSkillsPath, destName);

    // Remove existing if present
    if (existsSync(destPath)) {
      rmSync(destPath, { recursive: true, force: true });
    }

    mkdirSync(destPath, { recursive: true });
    copyDirectoryContents(sourcePath, destPath);
    copiedCount++;
  }

  return copiedCount;
}

/**
 * Download and install skills locally to agent project directories
 */
export async function installSkillsLocal(categories, agents, projectDir) {
  const spinner = ora('Downloading from GitHub...').start();

  const tempDir = join(homedir(), '.orchestra', '.temp-clone');

  try {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    spinner.text = 'Cloning repository...';
    execSync(`git clone --depth 1 ${REPO_URL}.git ${tempDir}`, {
      stdio: 'pipe',
    });

    // Build skills list from categories
    const skills = [];
    for (const categoryId of categories) {
      const categoryPath = join(tempDir, categoryId);
      if (!existsSync(categoryPath)) continue;

      const standaloneSkillPath = join(categoryPath, 'SKILL.md');
      if (existsSync(standaloneSkillPath)) {
        skills.push({ category: categoryId, skill: categoryId, standalone: true });
      } else {
        const entries = readdirSync(categoryPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const skillPath = join(categoryPath, entry.name, 'SKILL.md');
            if (existsSync(skillPath)) {
              skills.push({ category: categoryId, skill: entry.name, standalone: false });
            }
          }
        }
      }
    }

    spinner.succeed(`Found ${skills.length} skills`);

    // Copy to each agent's local directory
    spinner.start('Installing to project...');

    for (const agent of agents) {
      const count = copySkillsToLocal(agent, skills, tempDir);
      console.log(`    ${chalk.green('✓')} ${agent.name.padEnd(14)} ${chalk.dim('→')} ${agent.skillsPath.replace(projectDir, '.').padEnd(30)} ${chalk.green(count + ' skills')}`);
    }

    spinner.stop();

    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });

    // Update local lock file
    const lock = readLocalLock(projectDir);
    lock.version = '1.0.0';
    lock.installedAt = new Date().toISOString();
    lock.skills = [...(lock.skills || []).filter(s => {
      const existing = `${s.category}/${s.skill}`;
      return !skills.some(ns => `${ns.category}/${ns.skill}` === existing);
    }), ...skills];
    lock.agents = agents.map(a => a.id);
    writeLocalLock(projectDir, lock);

    return skills.length;
  } catch (error) {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    spinner.fail('Installation failed');
    throw error;
  }
}

/**
 * Download and install specific skills locally
 */
export async function installSpecificSkillsLocal(skillPaths, agents, projectDir) {
  const spinner = ora('Downloading from GitHub...').start();

  const tempDir = join(homedir(), '.orchestra', '.temp-clone');

  try {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }

    spinner.text = 'Cloning repository...';
    execSync(`git clone --depth 1 ${REPO_URL}.git ${tempDir}`, {
      stdio: 'pipe',
    });

    const skills = [];
    for (const skillPath of skillPaths) {
      const parts = skillPath.split('/');
      const categoryId = parts[0];
      const skillName = parts[1] || null;

      if (skillName) {
        const sourcePath = join(tempDir, categoryId, skillName);
        if (existsSync(sourcePath)) {
          skills.push({ category: categoryId, skill: skillName, standalone: false });
        }
      } else {
        const sourcePath = join(tempDir, categoryId);
        if (existsSync(sourcePath)) {
          skills.push({ category: categoryId, skill: categoryId, standalone: true });
        }
      }
    }

    spinner.succeed(`Found ${skills.length} skills`);

    // Copy to each agent's local directory
    spinner.start('Installing to project...');

    for (const agent of agents) {
      const count = copySkillsToLocal(agent, skills, tempDir);
      console.log(`    ${chalk.green('✓')} ${agent.name.padEnd(14)} ${chalk.dim('→')} ${agent.skillsPath.replace(projectDir, '.').padEnd(30)} ${chalk.green(count + ' skills')}`);
    }

    spinner.stop();

    // Cleanup
    rmSync(tempDir, { recursive: true, force: true });

    // Update local lock file
    const lock = readLocalLock(projectDir);
    lock.version = '1.0.0';
    lock.installedAt = new Date().toISOString();
    lock.skills = [...(lock.skills || []).filter(s => {
      const existing = `${s.category}/${s.skill}`;
      return !skills.some(ns => `${ns.category}/${ns.skill}` === existing);
    }), ...skills];
    lock.agents = agents.map(a => a.id);
    writeLocalLock(projectDir, lock);

    return skills.length;
  } catch (error) {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
    spinner.fail('Installation failed');
    throw error;
  }
}

/**
 * List locally installed skills for a project
 */
export function listLocalSkills(projectDir) {
  const lock = readLocalLock(projectDir);

  if (!lock.skills || lock.skills.length === 0) {
    console.log(chalk.yellow('    No skills installed locally in this project.'));
    console.log();
    console.log(`    Run ${chalk.cyan('npx @orchestra-research/ai-research-skills install --local')} to install skills.`);
    return;
  }

  const byCategory = {};
  let totalSkills = 0;

  for (const skill of lock.skills) {
    const category = skill.category;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    if (skill.standalone) {
      byCategory[category].push(category);
    } else {
      byCategory[category].push(skill.skill);
    }
    totalSkills++;
  }

  console.log(chalk.white.bold(`    Local Skills (${totalSkills})`));
  console.log(chalk.dim(`    Project: ${projectDir}`));
  console.log();

  for (const [category, skills] of Object.entries(byCategory)) {
    console.log(chalk.cyan(`    ${category}`));
    for (const skill of skills) {
      if (skill === category) {
        console.log(`      ${chalk.dim('●')} ${chalk.white('(standalone)')}`);
      } else {
        console.log(`      ${chalk.dim('●')} ${skill}`);
      }
    }
    console.log();
  }

  // Show agent directories
  if (lock.agents && lock.agents.length > 0) {
    console.log(chalk.dim(`    Agents: ${lock.agents.join(', ')}`));
  }
}

/**
 * Get locally installed skill paths for a project
 */
export function getLocalSkillPaths(projectDir) {
  const lock = readLocalLock(projectDir);
  if (!lock.skills || lock.skills.length === 0) {
    return [];
  }

  return lock.skills.map(s => {
    return s.standalone ? s.category : `${s.category}/${s.skill}`;
  });
}

/**
 * Get locally installed skills with display info for selection
 */
export function getLocalSkillsForSelection(projectDir) {
  const lock = readLocalLock(projectDir);
  if (!lock.skills || lock.skills.length === 0) {
    return [];
  }

  return lock.skills.map(s => {
    if (s.standalone) {
      return { path: s.category, name: s.category, category: 'Standalone', standalone: true };
    } else {
      return { path: `${s.category}/${s.skill}`, name: s.skill, category: s.category, standalone: false };
    }
  });
}

/**
 * Update locally installed skills
 */
export async function updateLocalSkills(agents, projectDir) {
  const installedPaths = getLocalSkillPaths(projectDir);

  if (installedPaths.length === 0) {
    console.log(chalk.yellow('    No local skills installed to update.'));
    return 0;
  }

  // Re-install the same skills
  return await installSpecificSkillsLocal(installedPaths, agents, projectDir);
}

/**
 * Uninstall specific local skills
 */
export async function uninstallLocalSkills(skillPaths, agents, projectDir) {
  const spinner = ora('Removing local skills...').start();

  try {
    for (const skillPath of skillPaths) {
      const parts = skillPath.split('/');
      const categoryId = parts[0];
      const skillName = parts[1] || null;
      const linkName = skillName || categoryId;

      // Remove from each agent's local directory
      for (const agent of agents) {
        const skillDir = join(agent.skillsPath, linkName);
        if (existsSync(skillDir)) {
          rmSync(skillDir, { recursive: true, force: true });
        }
      }

      spinner.text = `Removed ${linkName}`;
    }

    spinner.succeed(`Removed ${skillPaths.length} skill${skillPaths.length !== 1 ? 's' : ''}`);

    // Update local lock file
    const lock = readLocalLock(projectDir);
    if (lock.skills) {
      lock.skills = lock.skills.filter(s => {
        const path = s.standalone ? s.category : `${s.category}/${s.skill}`;
        return !skillPaths.includes(path);
      });
      writeLocalLock(projectDir, lock);
    }

    return skillPaths.length;
  } catch (error) {
    spinner.fail('Uninstall failed');
    throw error;
  }
}

/**
 * Uninstall all local skills
 */
export async function uninstallAllLocalSkills(agents, projectDir) {
  const spinner = ora('Removing all local skills...').start();

  try {
    // Remove skill directories from each agent
    for (const agent of agents) {
      if (existsSync(agent.skillsPath)) {
        const entries = readdirSync(agent.skillsPath, { withFileTypes: true });
        for (const entry of entries) {
          const entryPath = join(agent.skillsPath, entry.name);
          rmSync(entryPath, { recursive: true, force: true });
        }
      }
      console.log(`    ${chalk.green('✓')} Removed skills from ${agent.name} (${agent.skillsPath.replace(projectDir, '.')})`);
    }

    // Remove local lock file
    const lockPath = getLocalLockPath(projectDir);
    if (existsSync(lockPath)) {
      rmSync(lockPath, { force: true });
      console.log(`    ${chalk.green('✓')} Removed ${LOCAL_LOCK_FILENAME}`);
    }

    spinner.stop();
    return true;
  } catch (error) {
    spinner.fail('Uninstall failed');
    throw error;
  }
}

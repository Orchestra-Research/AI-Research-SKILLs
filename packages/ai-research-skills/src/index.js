import ora from 'ora';
import chalk from 'chalk';

import { detectAgents } from './agents.js';
import { showWelcome, showAgentsDetected, showSuccess, showNoAgents, showMenuHeader } from './ascii.js';
import {
  askInstallChoice,
  askCategories,
  askIndividualSkills,
  askConfirmation,
  askMainMenuAction,
  askSelectAgents,
  askAfterAction,
  askConfirmUninstall,
  parseArgs,
  CATEGORIES,
  INDIVIDUAL_SKILLS,
  QUICK_START_SKILLS,
  getTotalSkillCount,
} from './prompts.js';
import { installSkills, installSpecificSkills, listInstalledSkills, getAllCategoryIds, updateInstalledSkills, uninstallAllSkills, getInstalledSkillPaths } from './installer.js';

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Interactive flow - the main guided experience with navigation
 */
async function interactiveFlow() {
  let agents = [];

  // STEP 1: Welcome + Agent Detection
  showWelcome();
  const spinner = ora({
    text: chalk.cyan('Detecting coding agents...'),
    spinner: 'dots',
    prefixText: '              ',
  }).start();

  await sleep(1200);
  agents = detectAgents();
  spinner.stop();

  if (agents.length === 0) {
    showNoAgents();
    console.log(chalk.yellow('              Please install a supported coding agent first.'));
    console.log();
    return;
  }

  // STEP 2: Show detected agents + main menu
  step2_menu:
  while (true) {
    showAgentsDetected(agents);
    const menuAction = await askMainMenuAction();

    if (menuAction === 'exit') {
      console.log(chalk.dim('              Goodbye!'));
      console.log();
      return;
    }

    if (menuAction === 'view') {
      // View installed skills
      showMenuHeader();
      listInstalledSkills();
      const afterView = await askAfterAction();
      if (afterView === 'exit') {
        console.log(chalk.dim('              Goodbye!'));
        console.log();
        return;
      }
      continue step2_menu;
    }

    if (menuAction === 'update') {
      // Update only installed skills
      showMenuHeader();
      const installedPaths = getInstalledSkillPaths();
      if (installedPaths.length === 0) {
        console.log(chalk.yellow('    No skills installed to update.'));
        console.log();
        console.log(chalk.dim('    Install some skills first.'));
      } else {
        console.log(chalk.cyan(`    Updating ${installedPaths.length} installed skills...`));
        console.log();
        await updateInstalledSkills(agents);
        console.log();
        console.log(chalk.green('    ✓ All installed skills updated!'));
      }
      const afterUpdate = await askAfterAction();
      if (afterUpdate === 'exit') {
        console.log(chalk.dim('              Goodbye!'));
        console.log();
        return;
      }
      continue step2_menu;
    }

    if (menuAction === 'uninstall') {
      // Uninstall all skills
      showMenuHeader();
      const confirmAction = await askConfirmUninstall();
      if (confirmAction === 'confirm') {
        console.log();
        await uninstallAllSkills(agents);
        console.log();
        console.log(chalk.green('    ✓ All skills uninstalled!'));
      }
      const afterUninstall = await askAfterAction();
      if (afterUninstall === 'exit') {
        console.log(chalk.dim('              Goodbye!'));
        console.log();
        return;
      }
      continue step2_menu;
    }

    // STEP 3: Choose what to install (menuAction === 'install')
    step3_choice:
    while (true) {
      showMenuHeader();
      const choice = await askInstallChoice();

      if (choice === 'back') {
        continue step2_menu;
      }

      let categories = [];
      let selectedSkills = [];
      let skillCount = 0;
      let installType = choice;

      // Handle different choices
      if (choice === 'everything') {
        categories = getAllCategoryIds();
        skillCount = getTotalSkillCount();
      } else if (choice === 'quickstart') {
        categories = [...new Set(QUICK_START_SKILLS.map(s => s.split('/')[0]))];
        skillCount = QUICK_START_SKILLS.length;
      } else if (choice === 'categories') {
        // Category selection
        step4_categories:
        while (true) {
          showMenuHeader();
          const result = await askCategories();

          if (result.action === 'back') {
            continue step3_choice;
          }
          if (result.action === 'retry') {
            continue step4_categories;
          }

          categories = result.categories;
          skillCount = CATEGORIES
            .filter(c => categories.includes(c.id))
            .reduce((sum, c) => sum + c.skills, 0);
          break;
        }
      } else if (choice === 'individual') {
        // Individual skill selection
        step4_individual:
        while (true) {
          showMenuHeader();
          const result = await askIndividualSkills();

          if (result.action === 'back') {
            continue step3_choice;
          }
          if (result.action === 'retry') {
            continue step4_individual;
          }

          selectedSkills = result.skills;
          skillCount = selectedSkills.length;
          break;
        }
      }

      // STEP 5: Select agents + Confirmation
      let targetAgents = agents;
      step5_agents:
      while (true) {
        showMenuHeader();
        const agentResult = await askSelectAgents(agents);

        if (agentResult.action === 'back') {
          continue step3_choice;
        }
        if (agentResult.action === 'retry') {
          continue step5_agents;
        }

        targetAgents = agentResult.agents;

        // STEP 6: Confirmation
        showMenuHeader();
        const confirmAction = await askConfirmation(skillCount, targetAgents, categories, selectedSkills, installType);

        if (confirmAction === 'exit') {
          console.log(chalk.dim('              Goodbye!'));
          console.log();
          return;
        }
        if (confirmAction === 'back') {
          continue step5_agents;
        }

        break;
      }

      // STEP 7: Installation
      console.log();
      console.log(chalk.cyan('    Installing...'));
      console.log();

      let installedCount;
      if (selectedSkills.length > 0) {
        // Install specific skills
        installedCount = await installSpecificSkills(selectedSkills, targetAgents);
      } else {
        // Install by categories
        installedCount = await installSkills(categories, targetAgents);
      }

      // STEP 8: Success!
      await sleep(500);
      showSuccess(installedCount, targetAgents);
      return;
    }
  }
}

/**
 * Direct command mode (for power users)
 */
async function commandMode(options) {
  if (options.command === 'list') {
    listInstalledSkills();
    return;
  }

  if (options.command === 'update') {
    const agents = detectAgents();
    if (agents.length === 0) {
      console.log(chalk.yellow('No agents detected.'));
      return;
    }
    const installedPaths = getInstalledSkillPaths();
    if (installedPaths.length === 0) {
      console.log(chalk.yellow('No skills installed to update.'));
      return;
    }
    console.log(chalk.cyan(`Updating ${installedPaths.length} installed skills...`));
    await updateInstalledSkills(agents);
    console.log(chalk.green('✓ Skills updated!'));
    return;
  }

  if (options.command === 'install' || options.all || options.category || options.skill) {
    const agents = detectAgents();
    if (agents.length === 0) {
      console.log(chalk.yellow('No agents detected.'));
      return;
    }

    let categories;
    if (options.all) {
      categories = getAllCategoryIds();
    } else if (options.category) {
      categories = [options.category];
    } else if (options.skill) {
      const matchingCategory = CATEGORIES.find(c =>
        c.id.includes(options.skill) || c.name.toLowerCase().includes(options.skill.toLowerCase())
      );
      if (matchingCategory) {
        categories = [matchingCategory.id];
      } else {
        console.log(chalk.yellow(`Category or skill "${options.skill}" not found.`));
        return;
      }
    } else {
      categories = getAllCategoryIds();
    }

    console.log(chalk.cyan('Installing skills...'));
    await installSkills(categories, agents);
    console.log(chalk.green('✓ Done!'));
    return;
  }
}

/**
 * Main entry point
 */
export async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  // If any command-line options provided, use command mode
  if (options.command || options.all || options.category || options.skill) {
    await commandMode(options);
  } else {
    // Otherwise, use interactive flow
    await interactiveFlow();
  }
}

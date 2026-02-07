import ora from 'ora';
import chalk from 'chalk';

import { detectAgents, buildLocalAgentTargets, detectLocalAgents, SUPPORTED_AGENTS } from './agents.js';
import { showWelcome, showAgentsDetected, showSuccess, showLocalSuccess, showNoAgents, showMenuHeader } from './ascii.js';
import {
  askInstallChoice,
  askCategories,
  askIndividualSkills,
  askConfirmation,
  askLocalConfirmation,
  askMainMenuAction,
  askSelectAgents,
  askSelectLocalAgents,
  askAfterAction,
  askUninstallChoice,
  askSelectSkillsToUninstall,
  askConfirmUninstall,
  parseArgs,
  CATEGORIES,
  INDIVIDUAL_SKILLS,
  QUICK_START_SKILLS,
  getTotalSkillCount,
} from './prompts.js';
import {
  installSkills,
  installSpecificSkills,
  installSkillsLocal,
  installSpecificSkillsLocal,
  listInstalledSkills,
  listLocalSkills,
  getAllCategoryIds,
  updateInstalledSkills,
  updateLocalSkills,
  uninstallAllSkills,
  uninstallSpecificSkills,
  uninstallLocalSkills,
  uninstallAllLocalSkills,
  getInstalledSkillPaths,
  getInstalledSkillsForSelection,
  getLocalSkillPaths,
  getLocalSkillsForSelection,
} from './installer.js';

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
      // Uninstall skills
      step_uninstall:
      while (true) {
        showMenuHeader();
        const installedSkills = getInstalledSkillsForSelection();

        if (installedSkills.length === 0) {
          console.log(chalk.yellow('    No skills installed to uninstall.'));
          break;
        }

        const uninstallChoice = await askUninstallChoice();

        if (uninstallChoice === 'back') {
          break;
        }

        if (uninstallChoice === 'all') {
          // Uninstall everything
          const confirmAction = await askConfirmUninstall(installedSkills.length);
          if (confirmAction === 'confirm') {
            console.log();
            await uninstallAllSkills(agents);
            console.log();
            console.log(chalk.green('    ✓ All skills uninstalled!'));
          }
          break;
        }

        if (uninstallChoice === 'select') {
          // Select specific skills to uninstall
          showMenuHeader();
          const result = await askSelectSkillsToUninstall(installedSkills);

          if (result.action === 'back') {
            continue step_uninstall;
          }
          if (result.action === 'retry') {
            continue step_uninstall;
          }

          // Confirm uninstall
          const confirmAction = await askConfirmUninstall(result.skills.length);
          if (confirmAction === 'confirm') {
            console.log();
            await uninstallSpecificSkills(result.skills, agents);
            console.log();
            console.log(chalk.green(`    ✓ ${result.skills.length} skill${result.skills.length !== 1 ? 's' : ''} uninstalled!`));
          }
          break;
        }
      }

      const afterUninstall = await askAfterAction();
      if (afterUninstall === 'exit') {
        console.log(chalk.dim('              Goodbye!'));
        console.log();
        return;
      }
      continue step2_menu;
    }

    if (menuAction === 'install-local') {
      // LOCAL INSTALLATION FLOW
      const projectDir = process.cwd();
      const localAgents = buildLocalAgentTargets(
        agents.length > 0 ? agents : SUPPORTED_AGENTS.slice(0, 1).map(a => ({ ...a })),
        projectDir
      );

      // Choose what to install locally
      step_local_choice:
      while (true) {
        showMenuHeader();
        console.log(chalk.cyan(`    Local install to: ${projectDir}`));
        console.log();
        const choice = await askInstallChoice();

        if (choice === 'back') {
          continue step2_menu;
        }

        let categories = [];
        let selectedSkills = [];
        let skillCount = 0;
        let installType = choice;

        if (choice === 'everything') {
          categories = getAllCategoryIds();
          skillCount = getTotalSkillCount();
        } else if (choice === 'quickstart') {
          categories = [...new Set(QUICK_START_SKILLS.map(s => s.split('/')[0]))];
          skillCount = QUICK_START_SKILLS.length;
        } else if (choice === 'categories') {
          step_local_categories:
          while (true) {
            showMenuHeader();
            const result = await askCategories();
            if (result.action === 'back') continue step_local_choice;
            if (result.action === 'retry') continue step_local_categories;
            categories = result.categories;
            skillCount = CATEGORIES
              .filter(c => categories.includes(c.id))
              .reduce((sum, c) => sum + c.skills, 0);
            break;
          }
        } else if (choice === 'individual') {
          step_local_individual:
          while (true) {
            showMenuHeader();
            const result = await askIndividualSkills();
            if (result.action === 'back') continue step_local_choice;
            if (result.action === 'retry') continue step_local_individual;
            selectedSkills = result.skills;
            skillCount = selectedSkills.length;
            break;
          }
        }

        // Select local agents
        let targetAgents = localAgents;
        step_local_agents:
        while (true) {
          showMenuHeader();
          const agentResult = await askSelectLocalAgents(localAgents);
          if (agentResult.action === 'back') continue step_local_choice;
          if (agentResult.action === 'retry') continue step_local_agents;
          targetAgents = agentResult.agents;

          // Confirmation
          showMenuHeader();
          const confirmAction = await askLocalConfirmation(skillCount, targetAgents, projectDir, categories, selectedSkills, installType);
          if (confirmAction === 'exit') {
            console.log(chalk.dim('              Goodbye!'));
            console.log();
            return;
          }
          if (confirmAction === 'back') continue step_local_agents;
          break;
        }

        // Install locally
        console.log();
        console.log(chalk.cyan('    Installing locally...'));
        console.log();

        let installedCount;
        if (selectedSkills.length > 0) {
          installedCount = await installSpecificSkillsLocal(selectedSkills, targetAgents, projectDir);
        } else {
          installedCount = await installSkillsLocal(categories, targetAgents, projectDir);
        }

        await sleep(500);
        showLocalSuccess(installedCount, targetAgents, projectDir);
        return;
      }
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
  const projectDir = process.cwd();
  const isLocal = options.local;

  if (options.command === 'list') {
    if (isLocal) {
      listLocalSkills(projectDir);
    } else {
      listInstalledSkills();
    }
    return;
  }

  if (options.command === 'update') {
    if (isLocal) {
      const agents = detectAgents();
      const localAgents = buildLocalAgentTargets(
        agents.length > 0 ? agents : [SUPPORTED_AGENTS[0]],
        projectDir
      );
      const localPaths = getLocalSkillPaths(projectDir);
      if (localPaths.length === 0) {
        console.log(chalk.yellow('No local skills installed to update.'));
        return;
      }
      console.log(chalk.cyan(`Updating ${localPaths.length} local skills...`));
      await updateLocalSkills(localAgents, projectDir);
      console.log(chalk.green('✓ Local skills updated!'));
    } else {
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
    }
    return;
  }

  if (options.command === 'uninstall') {
    if (isLocal) {
      const agents = detectAgents();
      const localAgents = buildLocalAgentTargets(
        agents.length > 0 ? agents : [SUPPORTED_AGENTS[0]],
        projectDir
      );
      const detectedLocal = detectLocalAgents(projectDir);
      const targets = detectedLocal.length > 0 ? detectedLocal : localAgents;
      console.log(chalk.cyan('Uninstalling local skills...'));
      await uninstallAllLocalSkills(targets, projectDir);
      console.log(chalk.green('✓ Local skills removed!'));
    } else {
      const agents = detectAgents();
      if (agents.length === 0) {
        console.log(chalk.yellow('No agents detected.'));
        return;
      }
      console.log(chalk.cyan('Uninstalling all skills...'));
      await uninstallAllSkills(agents);
      console.log(chalk.green('✓ Skills removed!'));
    }
    return;
  }

  if (options.command === 'install' || options.all || options.category || options.skill) {
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

    if (isLocal) {
      const agents = detectAgents();
      const localAgents = buildLocalAgentTargets(
        agents.length > 0 ? agents : [SUPPORTED_AGENTS[0]],
        projectDir
      );
      console.log(chalk.cyan(`Installing skills locally to ${projectDir}...`));
      await installSkillsLocal(categories, localAgents, projectDir);
      console.log(chalk.green('✓ Done! Skills installed to project directory.'));
    } else {
      const agents = detectAgents();
      if (agents.length === 0) {
        console.log(chalk.yellow('No agents detected.'));
        return;
      }
      console.log(chalk.cyan('Installing skills...'));
      await installSkills(categories, agents);
      console.log(chalk.green('✓ Done!'));
    }
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

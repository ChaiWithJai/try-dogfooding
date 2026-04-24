/**
 * Dogfood CLI — `dogfood init` command
 *
 * First-run setup: scaffolds workspace, detects Claude Code,
 * copies templates, verifies everything works.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { type Command } from "commander";
import { createSpinner } from "../utils/spinner.js";
import { logger } from "../utils/logger.js";
import { getFlags } from "../utils/flags.js";
import {
  detectNode,
  detectGit,
  detectClaudeCode,
} from "../utils/detect.js";
import {
  createWorkspace,
  copyTemplates,
  DEFAULT_WORKSPACE_PATH,
} from "../core/workspace.js";
import { createDefaultConfig, saveConfig } from "../core/config.js";
import { formatError, wrapError, type DogfoodError } from "../core/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function registerInitCommand(program: Command): void {
  program
    .command("init")
    .description("Set up your Dogfood workspace")
    .argument("[path]", "Workspace path", DEFAULT_WORKSPACE_PATH)
    .option("--dry-run", "Preview what would be created without writing files")
    .action(async (workspacePath: string, options: { dryRun?: boolean }) => {
      const flags = getFlags();
      const dryRun = options.dryRun ?? false;

      if (dryRun) {
        console.log(chalk.yellow("\n  ▸ Dry run mode — no files will be written.\n"));
      }

      try {
        // Step 1: Pre-flight checks
        const spinner = createSpinner("Checking system requirements...");
        spinner.start();

        const nodeResult = detectNode();
        if (nodeResult.error) {
          spinner.fail(`Node.js: ${nodeResult.error}`);
          console.log(chalk.gray(`  Install Node.js 20+ from https://nodejs.org\n`));
          process.exitCode = 1;
          return;
        }
        logger.debug(`Node.js ${nodeResult.version} detected`);

        const gitResult = await detectGit();
        if (!gitResult.found) {
          spinner.warn("Git not found — workspace won't be a git repo.");
          logger.debug("Git not found, continuing without git init");
        } else {
          logger.debug(`Git ${gitResult.version} detected`);
        }

        const claudeResult = await detectClaudeCode();
        const claudeConfigured = claudeResult.found;
        if (!claudeConfigured) {
          spinner.warn("Claude Code not found — you'll need it to run workflows.");
          console.log(chalk.gray("  Install Claude Code: https://claude.ai/code\n"));
        } else {
          logger.debug(`Claude Code detected: ${claudeResult.version}`);
        }

        spinner.succeed("System requirements checked.");

        // Step 2: Create workspace
        const wsSpinner = createSpinner(`Creating workspace at ${chalk.bold(path.resolve(workspacePath))}...`);
        wsSpinner.start();

        await createWorkspace(workspacePath, { dryRun });

        wsSpinner.succeed(`Workspace created at ${chalk.bold(path.resolve(workspacePath))}`);

        // Step 3: Copy templates
        if (!dryRun) {
          const tplSpinner = createSpinner("Installing workflow templates...");
          tplSpinner.start();

          // Templates are bundled in the package
          const templatesDir = path.resolve(__dirname, "..", "templates");
          const copied = await copyTemplates(workspacePath, templatesDir);

          if (copied.length > 0) {
            tplSpinner.succeed(`Installed ${copied.length} workflow template${copied.length > 1 ? "s" : ""}: ${copied.join(", ")}`);
          } else {
            tplSpinner.info("No new workflow templates to install.");
          }
        }

        // Step 4: Save config
        if (!dryRun) {
          const config = createDefaultConfig(workspacePath, claudeConfigured);
          await saveConfig(workspacePath, config);
          logger.debug("Config saved to .dogfood/config.yaml");
        }

        // Step 5: Print success
        console.log("");
        console.log(chalk.green("  ✔ Dogfood workspace is ready!\n"));

        if (flags.json) {
          console.log(JSON.stringify({
            workspace: path.resolve(workspacePath),
            claude_code_configured: claudeConfigured,
            dry_run: dryRun,
          }, null, 2));
        } else {
          console.log(chalk.bold("  Next steps:\n"));

          if (!claudeConfigured) {
            console.log(`  1. Install Claude Code: ${chalk.cyan("https://claude.ai/code")}`);
            console.log(`  2. Run ${chalk.cyan("dogfood doctor")} to verify your setup`);
            console.log(`  3. Run ${chalk.cyan("dogfood run cx-triage")} to try your first workflow\n`);
          } else {
            console.log(`  1. Run ${chalk.cyan("dogfood workflow list")} to see available workflows`);
            console.log(`  2. Run ${chalk.cyan("dogfood run cx-triage")} to try your first workflow`);
            console.log(`  3. Run ${chalk.cyan("dogfood doctor")} anytime to check your setup\n`);
          }
        }
      } catch (err) {
        const dogfoodError = wrapError(err);
        console.error(formatError(dogfoodError as DogfoodError, flags.verbose));
        process.exitCode = 1;
      }
    });
}

/**
 * Dogfood CLI — `dogfood doctor` command
 *
 * Diagnostic checks for the user's setup. Each check outputs
 * pass/fail with next-step guidance on failure.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import chalk from "chalk";
import { type Command } from "commander";
import { getFlags } from "../utils/flags.js";
import {
  detectNode,
  detectGit,
  detectClaudeCode,
  checkNetwork,
} from "../utils/detect.js";
import { findWorkspace, validateWorkspace } from "../core/workspace.js";
import { loadConfig } from "../core/config.js";

interface CheckResult {
  name: string;
  status: "pass" | "fail" | "warn";
  message: string;
  nextStep?: string;
}

export function registerDoctorCommand(program: Command): void {
  program
    .command("doctor")
    .description("Check your Dogfood setup for issues")
    .option("--fix", "Attempt auto-repair where possible")
    .action(async (options: { fix?: boolean }) => {
      const flags = getFlags();
      const results: CheckResult[] = [];

      console.log(chalk.bold("\n  Dogfood Doctor\n"));
      console.log(chalk.gray("  Checking your setup...\n"));

      // 1. Node version
      const nodeResult = detectNode();
      if (nodeResult.error) {
        results.push({
          name: "Node.js",
          status: "fail",
          message: nodeResult.error,
          nextStep: "Install Node.js 20+ from https://nodejs.org",
        });
      } else {
        results.push({
          name: "Node.js",
          status: "pass",
          message: `${nodeResult.version} at ${nodeResult.path}`,
        });
      }

      // 2. Git
      const gitResult = await detectGit();
      if (!gitResult.found) {
        results.push({
          name: "Git",
          status: "warn",
          message: "Git not found.",
          nextStep: "Install git for version control of your workspace.",
        });
      } else {
        results.push({
          name: "Git",
          status: "pass",
          message: `${gitResult.version}`,
        });
      }

      // 3. Claude Code
      const claudeResult = await detectClaudeCode();
      if (!claudeResult.found) {
        results.push({
          name: "Claude Code",
          status: "fail",
          message: claudeResult.error ?? "Not found.",
          nextStep: "Install Claude Code: https://claude.ai/code",
        });
      } else {
        results.push({
          name: "Claude Code",
          status: "pass",
          message: `${claudeResult.version}`,
        });
      }

      // 4. Network
      const networkResult = await checkNetwork();
      if (!networkResult.found) {
        results.push({
          name: "Network",
          status: "fail",
          message: networkResult.error ?? "Cannot reach Anthropic API.",
          nextStep: "Check your internet connection and firewall settings.",
        });
      } else {
        results.push({
          name: "Network",
          status: "pass",
          message: "Can reach api.anthropic.com",
        });
      }

      // 5. Workspace
      const workspacePath = await findWorkspace();
      if (!workspacePath) {
        results.push({
          name: "Workspace",
          status: "fail",
          message: "No workspace found.",
          nextStep: "Run 'dogfood init' to create a workspace.",
        });
      } else {
        const validation = await validateWorkspace(workspacePath);
        if (validation.valid) {
          results.push({
            name: "Workspace",
            status: "pass",
            message: workspacePath,
          });
        } else {
          results.push({
            name: "Workspace",
            status: "warn",
            message: `Found at ${workspacePath} but has issues: ${validation.issues.join(", ")}`,
            nextStep: options.fix
              ? "Attempting auto-repair..."
              : "Run 'dogfood doctor --fix' to attempt repair.",
          });
        }
      }

      // 6. Config
      if (workspacePath) {
        try {
          const config = await loadConfig(workspacePath);
          results.push({
            name: "Config",
            status: "pass",
            message: `Version ${config.cli_version}, created ${new Date(config.created_at).toLocaleDateString()}`,
          });
        } catch {
          results.push({
            name: "Config",
            status: "fail",
            message: "Config file is missing or invalid.",
            nextStep: "Run 'dogfood init' to regenerate the config.",
          });
        }
      }

      // Print results
      if (flags.json) {
        console.log(JSON.stringify({ checks: results }, null, 2));
      } else {
        for (const r of results) {
          const icon =
            r.status === "pass"
              ? chalk.green("✔")
              : r.status === "warn"
                ? chalk.yellow("⚠")
                : chalk.red("✗");

          console.log(`  ${icon} ${chalk.bold(r.name)}: ${r.message}`);

          if (r.nextStep && r.status !== "pass") {
            console.log(chalk.gray(`    → ${r.nextStep}`));
          }
        }

        const failCount = results.filter((r) => r.status === "fail").length;
        const warnCount = results.filter((r) => r.status === "warn").length;

        console.log("");
        if (failCount === 0 && warnCount === 0) {
          console.log(chalk.green("  All checks passed! You're ready to go.\n"));
        } else if (failCount === 0) {
          console.log(chalk.yellow(`  ${warnCount} warning${warnCount > 1 ? "s" : ""} — everything should still work.\n`));
        } else {
          console.log(chalk.red(`  ${failCount} issue${failCount > 1 ? "s" : ""} found. Fix them to use Dogfood.\n`));
          process.exitCode = 1;
        }
      }
    });
}

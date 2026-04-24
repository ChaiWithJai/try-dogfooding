/**
 * Dogfood CLI — `dogfood run <workflow>` command
 *
 * The core command. Loads a workflow, assembles the prompt,
 * invokes Claude Code with guardrails, and records the result.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import yaml from "js-yaml";
import { type Command } from "commander";
import { getFlags } from "../utils/flags.js";
import { createSpinner } from "../utils/spinner.js";
import { logger } from "../utils/logger.js";
import { getWorkspacePath } from "../core/workspace.js";
import { WorkflowSchema, type WorkflowConfig } from "../schemas/workflow.js";
import { executeWithClaude } from "../core/claude.js";
import {
  generateRunId,
  appendRun,
  type RunRecord,
} from "../core/history.js";
import {
  WorkflowError,
  formatError,
  wrapError,
  type DogfoodError,
} from "../core/errors.js";

export function registerRunCommand(program: Command): void {
  program
    .command("run")
    .description("Run a workflow")
    .argument("<workflow>", "Name of the workflow to run")
    .option("--dry-run", "Show the assembled prompt without executing")
    .action(async (workflowName: string, options: { dryRun?: boolean }) => {
      const flags = getFlags();

      try {
        // Step 1: Find workspace
        const workspacePath = await getWorkspacePath();
        const workflowDir = path.join(workspacePath, "workflows", workflowName);

        // Step 2: Load workflow config
        const configPath = path.join(workflowDir, "workflow.yaml");
        let rawConfig: string;
        try {
          rawConfig = await fs.readFile(configPath, "utf-8");
        } catch {
          throw new WorkflowError({
            message: `Workflow '${workflowName}' not found.`,
            code: "WORKFLOW_NOT_FOUND",
            nextStep: `Run 'dogfood workflow list' to see available workflows.`,
          });
        }

        const parsed = yaml.load(rawConfig) as unknown;
        const validationResult = WorkflowSchema.safeParse(parsed);
        if (!validationResult.success) {
          const issues = validationResult.error.issues
            .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
            .join("\n");

          throw new WorkflowError({
            message: `Workflow '${workflowName}' has an invalid workflow.yaml.`,
            code: "WORKFLOW_INVALID",
            nextStep: "Fix the workflow.yaml file and try again.",
            details: issues,
          });
        }

        const workflowConfig: WorkflowConfig = validationResult.data;

        // Step 3: Load CLAUDE.md and prompts
        const claudeMdPath = path.join(workflowDir, "CLAUDE.md");
        let claudeMd = "";
        try {
          claudeMd = await fs.readFile(claudeMdPath, "utf-8");
        } catch {
          logger.debug("No CLAUDE.md found for workflow, proceeding without it.");
        }

        const promptsDir = path.join(workflowDir, "prompts");
        let prompts: string[] = [];
        try {
          const promptFiles = await fs.readdir(promptsDir);
          prompts = await Promise.all(
            promptFiles
              .filter((f) => f.endsWith(".md"))
              .sort()
              .map((f) => fs.readFile(path.join(promptsDir, f), "utf-8")),
          );
        } catch {
          logger.debug("No prompts directory found, using CLAUDE.md only.");
        }

        // Step 4: Assemble the prompt
        const assembledPrompt = assemblePrompt(workflowConfig, claudeMd, prompts);

        // Dry run — just show the prompt
        if (options.dryRun) {
          console.log(chalk.bold("\n  Dry run — assembled prompt:\n"));
          console.log(chalk.gray("  ─".repeat(35)));
          console.log(`\n${assembledPrompt}\n`);
          console.log(chalk.gray("  ─".repeat(35)));
          console.log(chalk.gray(`\n  Timeout: ${workflowConfig.claude_code_config.timeout_seconds}s`));
          console.log(chalk.gray(`  Max tokens: ${workflowConfig.claude_code_config.max_tokens_per_run}`));
          console.log(chalk.gray(`  Allowed tools: ${workflowConfig.claude_code_config.allowed_tools.join(", ") || "all"}\n`));
          return;
        }

        // Step 5: Execute
        const runId = generateRunId();
        const startedAt = new Date().toISOString();

        const spinner = createSpinner(`Running workflow ${chalk.bold(workflowName)}...`);
        spinner.start();

        const result = await executeWithClaude({
          prompt: assembledPrompt,
          allowedTools: workflowConfig.claude_code_config.allowed_tools,
          maxTokens: workflowConfig.claude_code_config.max_tokens_per_run,
          timeoutSeconds: workflowConfig.claude_code_config.timeout_seconds,
          workingDirectory: workflowDir,
          runId,
        });

        // Step 6: Save output
        const outputDir = path.join(
          workflowDir,
          "outputs",
          new Date().toISOString().replace(/[:.]/g, "-"),
        );
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(
          path.join(outputDir, "output.md"),
          result.output,
          "utf-8",
        );

        // Step 7: Record in history
        const record: RunRecord = {
          run_id: runId,
          workflow: workflowName,
          started_at: startedAt,
          finished_at: new Date().toISOString(),
          status: result.status,
          tokens_used: result.tokensUsed,
          duration_ms: result.durationMs,
          output_path: outputDir,
          ...(result.error ? { error: result.error } : {}),
        };

        await appendRun(workspacePath, record);

        // Step 8: Print summary
        if (result.status === "success") {
          spinner.succeed(`Workflow ${chalk.bold(workflowName)} completed.`);
        } else if (result.status === "timeout") {
          spinner.warn(`Workflow ${chalk.bold(workflowName)} timed out.`);
        } else {
          spinner.fail(`Workflow ${chalk.bold(workflowName)} failed.`);
        }

        if (flags.json) {
          console.log(JSON.stringify(record, null, 2));
        } else {
          console.log("");
          console.log(`  ${chalk.gray("Run ID:")}      ${runId}`);
          console.log(`  ${chalk.gray("Duration:")}    ${(result.durationMs / 1000).toFixed(1)}s`);
          if (result.tokensUsed) {
            console.log(`  ${chalk.gray("Tokens:")}     ${result.tokensUsed.toLocaleString()}`);
          }
          console.log(`  ${chalk.gray("Output:")}     ${outputDir}`);
          console.log(`  ${chalk.gray("Status:")}     ${result.status}`);

          if (result.error) {
            console.log(`\n  ${chalk.red("Error:")} ${result.error}`);
          }

          console.log("");
        }

        if (result.status !== "success") {
          process.exitCode = 1;
        }
      } catch (err) {
        const dogfoodError = wrapError(err);
        console.error(formatError(dogfoodError as DogfoodError, flags.verbose));
        process.exitCode = 1;
      }
    });
}

/**
 * Assemble the full prompt from workflow config, CLAUDE.md, and prompt templates.
 */
function assemblePrompt(
  config: WorkflowConfig,
  claudeMd: string,
  prompts: string[],
): string {
  const parts: string[] = [];

  // Context from CLAUDE.md
  if (claudeMd.trim()) {
    parts.push(claudeMd.trim());
  }

  // Workflow metadata
  parts.push(`## Workflow: ${config.name}`);
  parts.push(`**Description:** ${config.description}`);
  parts.push(`**Persona:** ${config.persona}`);

  if (config.stack_requires.length > 0) {
    parts.push(`**Required integrations:** ${config.stack_requires.join(", ")}`);
  }

  // Output expectations
  if (config.outputs.length > 0) {
    parts.push("\n## Expected outputs\n");
    for (const output of config.outputs) {
      parts.push(`- **${output.name}**: ${output.format} → ${output.destination}`);
    }
  }

  // Prompt templates
  if (prompts.length > 0) {
    parts.push("\n## Instructions\n");
    parts.push(prompts.join("\n\n---\n\n"));
  }

  return parts.join("\n\n");
}

/**
 * Dogfood CLI — `dogfood workflow list` command
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
import { getWorkspacePath } from "../core/workspace.js";
import { WorkflowSchema } from "../schemas/workflow.js";
import { formatError, wrapError, type DogfoodError } from "../core/errors.js";

interface WorkflowSummary {
  name: string;
  description: string;
  persona: string;
  stack_requires: string[];
}

export function registerWorkflowListCommand(program: Command): void {
  const workflowCmd = program
    .command("workflow")
    .description("Manage workflows");

  workflowCmd
    .command("list")
    .description("List available workflows")
    .action(async () => {
      const flags = getFlags();
      try {
        const workspacePath = await getWorkspacePath();
        const workflowsDir = path.join(workspacePath, "workflows");

        let entries: string[] = [];
        try {
          const dirEntries = await fs.readdir(workflowsDir, { withFileTypes: true });
          entries = dirEntries.filter((e) => e.isDirectory()).map((e) => e.name);
        } catch {
          console.log(chalk.gray("\n  No workflows directory found.\n"));
          return;
        }

        if (entries.length === 0) {
          console.log(chalk.gray("\n  No workflows yet. Templates are installed during 'dogfood init'.\n"));
          return;
        }

        const workflows: WorkflowSummary[] = [];
        for (const entry of entries) {
          const cfgPath = path.join(workflowsDir, entry, "workflow.yaml");
          try {
            const raw = await fs.readFile(cfgPath, "utf-8");
            const parsed = yaml.load(raw) as unknown;
            const result = WorkflowSchema.safeParse(parsed);
            if (result.success) {
              workflows.push({
                name: result.data.name,
                description: result.data.description,
                persona: result.data.persona,
                stack_requires: result.data.stack_requires,
              });
            } else {
              workflows.push({ name: entry, description: "(invalid workflow.yaml)", persona: "?", stack_requires: [] });
            }
          } catch {
            workflows.push({ name: entry, description: "(no workflow.yaml)", persona: "?", stack_requires: [] });
          }
        }

        if (flags.json) {
          console.log(JSON.stringify(workflows, null, 2));
        } else {
          console.log(chalk.bold("\n  Available workflows\n"));
          for (const wf of workflows) {
            const badge = chalk.gray(`[${wf.persona}]`);
            console.log(`  ${chalk.cyan(wf.name)} ${badge}`);
            console.log(`  ${chalk.gray(wf.description)}`);
            if (wf.stack_requires.length > 0) {
              console.log(`  ${chalk.gray("Requires: " + wf.stack_requires.join(", "))}`);
            }
            console.log("");
          }
          console.log(chalk.gray(`  Run a workflow with: dogfood run <name>\n`));
        }
      } catch (err) {
        const dogfoodError = wrapError(err);
        console.error(formatError(dogfoodError as DogfoodError, flags.verbose));
        process.exitCode = 1;
      }
    });
}

/**
 * Dogfood CLI — `dogfood history` command
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import chalk from "chalk";
import { type Command } from "commander";
import { getFlags } from "../utils/flags.js";
import { getWorkspacePath } from "../core/workspace.js";
import { listRuns, getRun } from "../core/history.js";
import { formatError, wrapError, type DogfoodError } from "../core/errors.js";

export function registerHistoryCommand(program: Command): void {
  const historyCmd = program
    .command("history")
    .description("View past workflow runs");

  historyCmd
    .command("show")
    .description("Show details for a specific run")
    .argument("<run-id>", "The run ID to display")
    .action(async (runId: string) => {
      const flags = getFlags();
      try {
        const workspacePath = await getWorkspacePath();
        const record = await getRun(workspacePath, runId);
        if (!record) {
          console.log(chalk.yellow(`\n  No run found with ID '${runId}'.\n`));
          process.exitCode = 1;
          return;
        }
        if (flags.json) {
          console.log(JSON.stringify(record, null, 2));
        } else {
          console.log(chalk.bold(`\n  Run ${record.run_id}\n`));
          console.log(`  ${chalk.gray("Workflow:")}    ${record.workflow}`);
          console.log(`  ${chalk.gray("Status:")}      ${record.status}`);
          console.log(`  ${chalk.gray("Started:")}     ${new Date(record.started_at).toLocaleString()}`);
          if (record.finished_at) {
            console.log(`  ${chalk.gray("Finished:")}    ${new Date(record.finished_at).toLocaleString()}`);
          }
          if (record.duration_ms !== undefined) {
            console.log(`  ${chalk.gray("Duration:")}    ${(record.duration_ms / 1000).toFixed(1)}s`);
          }
          if (record.tokens_used !== undefined) {
            console.log(`  ${chalk.gray("Tokens:")}      ${record.tokens_used.toLocaleString()}`);
          }
          if (record.output_path) {
            console.log(`  ${chalk.gray("Output:")}      ${record.output_path}`);
          }
          if (record.error) {
            console.log(`\n  ${chalk.red("Error:")}       ${record.error}`);
          }
          console.log("");
        }
      } catch (err) {
        const dogfoodError = wrapError(err);
        console.error(formatError(dogfoodError as DogfoodError, flags.verbose));
        process.exitCode = 1;
      }
    });

  historyCmd.action(async () => {
    const flags = getFlags();
    try {
      const workspacePath = await getWorkspacePath();
      const runs = await listRuns(workspacePath);
      if (runs.length === 0) {
        console.log(chalk.gray("\n  No runs yet. Run 'dogfood run <workflow>'.\n"));
        return;
      }
      if (flags.json) {
        console.log(JSON.stringify(runs, null, 2));
      } else {
        console.log(chalk.bold("\n  Recent runs\n"));
        const hdr = `  ${"ID".padEnd(16)} ${"Workflow".padEnd(20)} ${"Status".padEnd(10)} ${"Duration".padEnd(10)} ${"When"}`;
        console.log(chalk.gray(hdr));
        console.log(chalk.gray("  " + "─".repeat(75)));
        for (const run of runs) {
          const id = run.run_id.slice(0, 14).padEnd(16);
          const wf = run.workflow.slice(0, 18).padEnd(20);
          const st = run.status.padEnd(10);
          const dur = run.duration_ms !== undefined ? `${(run.duration_ms / 1000).toFixed(1)}s`.padEnd(10) : "—".padEnd(10);
          const when = timeAgo(new Date(run.started_at));
          console.log(`  ${id} ${wf} ${st} ${dur} ${when}`);
        }
        console.log(chalk.gray(`\n  ${runs.length} runs. Use 'dogfood history show <run-id>' for details.\n`));
      }
    } catch (err) {
      const dogfoodError = wrapError(err);
      console.error(formatError(dogfoodError as DogfoodError, flags.verbose));
      process.exitCode = 1;
    }
  });
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return date.toLocaleDateString();
}

/**
 * Dogfood CLI — Entry point
 *
 * The main CLI binary. Sets up Commander with all commands
 * and global options.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import { Command } from "commander";
import chalk from "chalk";
import { setFlags } from "../src/utils/flags.js";
import { formatError, wrapError } from "../src/core/errors.js";
import { registerInitCommand } from "../src/commands/init.js";
import { registerDoctorCommand } from "../src/commands/doctor.js";
import { registerRunCommand } from "../src/commands/run.js";
import { registerHistoryCommand } from "../src/commands/history.js";
import { registerWorkflowListCommand } from "../src/commands/workflow-list.js";

const VERSION = "0.1.0";

const program = new Command();

program
  .name("dogfood")
  .description("Build the software you wish existed.")
  .version(VERSION, "-v, --version")
  .option("--json", "Output results as JSON")
  .option("--verbose", "Show detailed output")
  .option("--no-color", "Disable colored output")
  .option("--yes", "Skip confirmations")
  .hook("preAction", (_thisCommand, actionCommand) => {
    // Resolve global flags from the root command
    const opts = program.opts();
    setFlags({
      json: opts["json"] === true,
      verbose: opts["verbose"] === true,
      color: opts["color"] !== false,
      yes: opts["yes"] === true,
    });

    // Disable chalk if --no-color
    if (opts["color"] === false) {
      chalk.level = 0;
    }

    // Suppress the unused variable warning
    void actionCommand;
  });

// Register all commands
registerInitCommand(program);
registerDoctorCommand(program);
registerRunCommand(program);
registerHistoryCommand(program);
registerWorkflowListCommand(program);

// Global error handler
process.on("uncaughtException", (err) => {
  const dogfoodError = wrapError(err);
  console.error(formatError(dogfoodError, program.opts()["verbose"] === true));
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  const dogfoodError = wrapError(err);
  console.error(formatError(dogfoodError, program.opts()["verbose"] === true));
  process.exit(1);
});

// Parse and run
program.parseAsync(process.argv).catch((err) => {
  const dogfoodError = wrapError(err);
  console.error(formatError(dogfoodError, program.opts()["verbose"] === true));
  process.exit(1);
});

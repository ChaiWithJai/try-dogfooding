import { Command } from "commander";
import chalk from "chalk";
import { getWorkspacePath } from "../core/workspace.js";
import { listIntegrations, addIntegration, removeIntegration } from "../core/integrations.js";
import { wrapError, formatError } from "../core/errors.js";
import { getFlags } from "../utils/flags.js";

const BUILT_IN_INTEGRATIONS: Record<string, { command: string; args: string[] }> = {
  sqlite: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite"],
  },
  fetch: {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-fetch"],
  },
  "brave-search": {
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
  },
};

export function registerIntegrationsCommand(program: Command) {
  const integrationsCmd = program
    .command("integrations")
    .description("Manage MCP integration servers for your workspace");

  integrationsCmd
    .command("list")
    .description("List installed integrations")
    .action(async () => {
      try {
        const flags = getFlags();
        const workspacePath = await getWorkspacePath();
        const integrations = await listIntegrations(workspacePath);

        if (flags.json) {
          console.log(JSON.stringify(integrations, null, 2));
          return;
        }

        const names = Object.keys(integrations);
        if (names.length === 0) {
          console.log(`\n  No integrations installed. Use ${chalk.cyan("dogfood integrations add <name>")} to add one.\n`);
          return;
        }

        console.log("\n  Installed Integrations\n");
        for (const name of names) {
          const config = integrations[name];
          console.log(`  ${chalk.bold(name)}`);
          console.log(`  ${chalk.gray("Command:")} ${config.command} ${config.args.join(" ")}\n`);
        }
      } catch (err) {
        console.error(formatError(wrapError(err), getFlags().verbose));
        process.exitCode = 1;
      }
    });

  integrationsCmd
    .command("add <name>")
    .description("Add an integration to the workspace")
    .option("-c, --command <cmd>", "Custom command to run the MCP server")
    .option("-a, --args <args...>", "Arguments for the custom command")
    .action(async (name, options) => {
      try {
        const workspacePath = await getWorkspacePath();

        let serverConfig;
        if (options.command) {
          serverConfig = {
            command: options.command,
            args: options.args || [],
          };
        } else if (BUILT_IN_INTEGRATIONS[name]) {
          serverConfig = BUILT_IN_INTEGRATIONS[name];
        } else {
          console.log(`\n  ${chalk.red("✖")} Unknown built-in integration: ${chalk.bold(name)}`);
          console.log(`  Available built-ins: ${Object.keys(BUILT_IN_INTEGRATIONS).join(", ")}`);
          console.log(`  To add a custom integration, use ${chalk.cyan("--command")} and ${chalk.cyan("--args")}\n`);
          process.exitCode = 1;
          return;
        }

        await addIntegration(workspacePath, name, serverConfig);
        console.log(`\n  ${chalk.green("✔")} Added integration ${chalk.bold(name)}\n`);
      } catch (err) {
        console.error(formatError(wrapError(err), getFlags().verbose));
        process.exitCode = 1;
      }
    });

  integrationsCmd
    .command("remove <name>")
    .description("Remove an integration from the workspace")
    .action(async (name) => {
      try {
        const workspacePath = await getWorkspacePath();
        const removed = await removeIntegration(workspacePath, name);
        
        if (removed) {
          console.log(`\n  ${chalk.green("✔")} Removed integration ${chalk.bold(name)}\n`);
        } else {
          console.log(`\n  ${chalk.yellow("⚠")} Integration ${chalk.bold(name)} not found in workspace.\n`);
        }
      } catch (err) {
        console.error(formatError(wrapError(err), getFlags().verbose));
        process.exitCode = 1;
      }
    });
}

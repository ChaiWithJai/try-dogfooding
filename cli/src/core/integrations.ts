import fs from "node:fs/promises";
import path from "node:path";
import { DogfoodError } from "./errors.js";

interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface ClaudeConfig {
  mcpServers?: Record<string, McpServerConfig>;
  [key: string]: unknown;
}

const CLAUDE_CONFIG_FILE = ".claude.json";

/**
 * Reads the .claude.json config from the workspace.
 * Returns an empty object if it doesn't exist.
 */
export async function getClaudeConfig(workspacePath: string): Promise<ClaudeConfig> {
  const configPath = path.join(workspacePath, CLAUDE_CONFIG_FILE);
  try {
    const data = await fs.readFile(configPath, "utf-8");
    return JSON.parse(data) as ClaudeConfig;
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return {};
    }
    throw new DogfoodError({
      message: `Failed to parse ${CLAUDE_CONFIG_FILE}. It might be malformed JSON.`,
      code: "CONFIG_INVALID",
      nextStep: "Check your .claude.json file for syntax errors.",
      cause: err,
    });
  }
}

/**
 * Saves the .claude.json config to the workspace.
 */
export async function saveClaudeConfig(workspacePath: string, config: ClaudeConfig): Promise<void> {
  const configPath = path.join(workspacePath, CLAUDE_CONFIG_FILE);
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    throw new DogfoodError({
      message: `Failed to write ${CLAUDE_CONFIG_FILE}.`,
      code: "CONFIG_WRITE_FAILED",
      nextStep: "Check file permissions in your workspace.",
      cause: err,
    });
  }
}

/**
 * Lists all registered MCP integrations.
 */
export async function listIntegrations(workspacePath: string): Promise<Record<string, McpServerConfig>> {
  const config = await getClaudeConfig(workspacePath);
  return config.mcpServers || {};
}

/**
 * Adds an MCP integration to the workspace.
 */
export async function addIntegration(
  workspacePath: string,
  name: string,
  serverConfig: McpServerConfig
): Promise<void> {
  const config = await getClaudeConfig(workspacePath);
  
  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  config.mcpServers[name] = serverConfig;
  await saveClaudeConfig(workspacePath, config);
}

/**
 * Removes an MCP integration from the workspace.
 */
export async function removeIntegration(workspacePath: string, name: string): Promise<boolean> {
  const config = await getClaudeConfig(workspacePath);
  
  if (!config.mcpServers || !config.mcpServers[name]) {
    return false;
  }

  delete config.mcpServers[name];
  await saveClaudeConfig(workspacePath, config);
  return true;
}

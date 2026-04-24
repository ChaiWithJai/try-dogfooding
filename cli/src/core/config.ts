/**
 * Dogfood CLI — Config management
 *
 * Load and save .dogfood/config.yaml with Zod validation.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import { DogfoodConfigSchema, type DogfoodConfig } from "../schemas/config.js";
import { ConfigError } from "./errors.js";

const CONFIG_FILENAME = "config.yaml";
const CONFIG_DIR = ".dogfood";

/**
 * Load config from workspace path.
 */
export async function loadConfig(workspacePath: string): Promise<DogfoodConfig> {
  const configPath = path.join(workspacePath, CONFIG_DIR, CONFIG_FILENAME);

  let raw: string;
  try {
    raw = await fs.readFile(configPath, "utf-8");
  } catch {
    throw new ConfigError({
      message: `Config file not found at ${configPath}`,
      code: "CONFIG_MISSING",
      nextStep: "Run 'dogfood init' to create a workspace with a valid config.",
    });
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (err) {
    throw new ConfigError({
      message: "Config file contains invalid YAML.",
      code: "CONFIG_INVALID",
      nextStep: "Check your .dogfood/config.yaml for syntax errors.",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  const result = DogfoodConfigSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");

    throw new ConfigError({
      message: "Config file has invalid values.",
      code: "CONFIG_INVALID",
      nextStep: "Fix the issues in your .dogfood/config.yaml or re-run 'dogfood init'.",
      details: issues,
    });
  }

  return result.data;
}

/**
 * Save config to workspace path.
 */
export async function saveConfig(
  workspacePath: string,
  config: DogfoodConfig,
): Promise<void> {
  const configDir = path.join(workspacePath, CONFIG_DIR);
  const configPath = path.join(configDir, CONFIG_FILENAME);

  await fs.mkdir(configDir, { recursive: true });
  const yamlStr = yaml.dump(config, {
    indent: 2,
    lineWidth: 80,
    noRefs: true,
    sortKeys: true,
  });

  await fs.writeFile(configPath, yamlStr, "utf-8");
}

/**
 * Create a default config for a new workspace.
 */
export function createDefaultConfig(
  workspacePath: string,
  claudeCodeConfigured: boolean,
): DogfoodConfig {
  return {
    workspace_path: path.resolve(workspacePath),
    claude_code_configured: claudeCodeConfigured,
    telemetry_enabled: false,
    created_at: new Date().toISOString(),
    cli_version: "0.1.0",
  };
}

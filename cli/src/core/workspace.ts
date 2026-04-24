/**
 * Dogfood CLI — Workspace management
 *
 * Creates, finds, and validates the on-disk workspace structure
 * defined in the feature spec §2.3.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { DogfoodError, SetupError } from "./errors.js";

const execFileAsync = promisify(execFile);

export const DEFAULT_WORKSPACE_PATH = path.join(
  os.homedir(),
  "trydogfooding-workspace",
);

const WORKSPACE_MARKER = ".dogfood";

/**
 * The spec-defined workspace directory structure.
 */
const WORKSPACE_DIRS = [
  "workflows",
  "data",
  "integrations",
  "history",
  ".dogfood",
];

const WORKSPACE_README = `# TryDogfooding Workspace

This workspace was created by the Dogfood CLI. It contains your workflows,
integration configs, and run history.

## Structure

- \`workflows/\` — Your workflow definitions (each in its own directory)
- \`data/\` — Reference data (voice samples, rules, templates)
- \`integrations/\` — Integration auth status (not credentials)
- \`history/\` — Append-only log of every workflow run
- \`.dogfood/\` — CLI configuration

## Quick start

\`\`\`bash
dogfood workflow list        # See available workflows
dogfood run <workflow>       # Run a workflow
dogfood history              # View past runs
dogfood doctor               # Check your setup
\`\`\`

## Learn more

Visit https://trydogfooding.com for workshops, cohorts, and community.
`;

const WORKSPACE_CLAUDE_MD = `# TryDogfooding Workspace

This is a TryDogfooding workspace. When executing workflows, you are acting
as an AI assistant helping an operator automate their real work.

## Rules

1. Never fabricate data. If you don't have access to real data, say so clearly.
2. Every output should be specific to the operator's context, not generic.
3. When writing output files, use the format specified in the workflow config.
4. Respect token budgets — be concise and focused.
5. If a tool or integration isn't available, report what's missing clearly.

## Workspace layout

- Workflows live in \`workflows/<name>/\`
- Each workflow has its own CLAUDE.md with specific instructions
- Outputs go to \`workflows/<name>/outputs/\`
- Run history is in \`history/runs.jsonl\`
`;

/**
 * Scaffold a new workspace at the given path.
 */
export async function createWorkspace(
  workspacePath: string,
  options: { dryRun?: boolean } = {},
): Promise<void> {
  const resolvedPath = path.resolve(workspacePath);

  // Check if it already exists
  try {
    await fs.access(resolvedPath);
    const marker = path.join(resolvedPath, WORKSPACE_MARKER);
    try {
      await fs.access(marker);
      throw new SetupError({
        message: `A Dogfood workspace already exists at ${resolvedPath}`,
        code: "WORKSPACE_EXISTS",
        nextStep: `Use a different path or run 'dogfood doctor' to verify your existing workspace.`,
      });
    } catch (err) {
      if (err instanceof DogfoodError) throw err;
      // Directory exists but no .dogfood marker — we can use it
    }
  } catch (err) {
    if (err instanceof DogfoodError) throw err;
    // Directory doesn't exist — perfect, we'll create it
  }

  if (options.dryRun) {
    return;
  }

  // Create directory structure
  for (const dir of WORKSPACE_DIRS) {
    await fs.mkdir(path.join(resolvedPath, dir), { recursive: true });
  }

  // Write README
  await fs.writeFile(
    path.join(resolvedPath, "README.md"),
    WORKSPACE_README,
    "utf-8",
  );

  // Write CLAUDE.md
  await fs.writeFile(
    path.join(resolvedPath, "CLAUDE.md"),
    WORKSPACE_CLAUDE_MD,
    "utf-8",
  );

  // Write .dogfood/version
  await fs.writeFile(
    path.join(resolvedPath, ".dogfood", "version"),
    "0.1.0\n",
    "utf-8",
  );

  // Initialize empty runs.jsonl
  await fs.writeFile(
    path.join(resolvedPath, "history", "runs.jsonl"),
    "",
    "utf-8",
  );

  // Initialize git repo
  try {
    await execFileAsync("git", ["init"], { cwd: resolvedPath });
    // Write .gitignore
    await fs.writeFile(
      path.join(resolvedPath, ".gitignore"),
      [
        "# Dogfood workspace .gitignore",
        "",
        "# Don't commit sensitive data",
        "data/secrets/",
        "",
        "# Large output files (optional — some users want these in git)",
        "# workflows/*/outputs/",
        "",
      ].join("\n"),
      "utf-8",
    );
  } catch {
    // Git init failed — not fatal, workspace still works without git
  }
}

/**
 * Find the workspace by walking up from cwd, or fall back to default.
 */
export async function findWorkspace(
  startFrom?: string,
): Promise<string | undefined> {
  let current = path.resolve(startFrom ?? process.cwd());

  // Walk up looking for .dogfood marker
  const root = path.parse(current).root;
  while (current !== root) {
    try {
      await fs.access(path.join(current, WORKSPACE_MARKER));
      return current;
    } catch {
      current = path.dirname(current);
    }
  }

  // Fall back to default path
  try {
    await fs.access(path.join(DEFAULT_WORKSPACE_PATH, WORKSPACE_MARKER));
    return DEFAULT_WORKSPACE_PATH;
  } catch {
    return undefined;
  }
}

/**
 * Validate that a workspace has the expected structure.
 */
export async function validateWorkspace(
  workspacePath: string,
): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  const resolvedPath = path.resolve(workspacePath);

  // Check marker
  try {
    await fs.access(path.join(resolvedPath, WORKSPACE_MARKER));
  } catch {
    issues.push("Missing .dogfood directory");
  }

  // Check required directories
  for (const dir of WORKSPACE_DIRS) {
    try {
      await fs.access(path.join(resolvedPath, dir));
    } catch {
      issues.push(`Missing directory: ${dir}`);
    }
  }

  // Check for runs.jsonl
  try {
    await fs.access(path.join(resolvedPath, "history", "runs.jsonl"));
  } catch {
    issues.push("Missing history/runs.jsonl");
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Get the resolved workspace path, or throw if not found.
 */
export async function getWorkspacePath(): Promise<string> {
  const workspace = await findWorkspace();
  if (!workspace) {
    throw new SetupError({
      message: "No Dogfood workspace found.",
      code: "WORKSPACE_NOT_FOUND",
      nextStep: "Run 'dogfood init' to create a workspace.",
    });
  }
  return workspace;
}

/**
 * Copy bundled workflow templates into the workspace.
 */
export async function copyTemplates(
  workspacePath: string,
  templatesDir: string,
): Promise<string[]> {
  const resolvedWorkspace = path.resolve(workspacePath);
  const workflowsDir = path.join(resolvedWorkspace, "workflows");
  const copied: string[] = [];

  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const src = path.join(templatesDir, entry.name);
      const dest = path.join(workflowsDir, entry.name);

      // Don't overwrite existing workflows
      try {
        await fs.access(dest);
        continue; // already exists
      } catch {
        // doesn't exist, copy it
      }

      await copyDir(src, dest);
      copied.push(entry.name);
    }
  } catch {
    // Templates dir doesn't exist — not fatal
  }

  return copied;
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

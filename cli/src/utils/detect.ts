/**
 * Dogfood CLI — System detection utilities
 *
 * Detects Node, Git, Claude Code, and OS. Used by `dogfood doctor`
 * and `dogfood init` for pre-flight checks.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import os from "node:os";

const execFileAsync = promisify(execFile);

export interface DetectionResult {
  found: boolean;
  version?: string;
  path?: string;
  error?: string;
}

export interface OSInfo {
  platform: NodeJS.Platform;
  arch: string;
  release: string;
  homedir: string;
}

/**
 * Detect Node.js version. Checks the running process, not a shell lookup.
 */
export function detectNode(): DetectionResult {
  const version = process.version; // e.g., "v20.11.0"
  const major = parseInt(version.slice(1).split(".")[0] ?? "0", 10);

  return {
    found: true,
    version,
    path: process.execPath,
    ...(major < 20 ? { error: `Node ${version} is below the minimum required version (20.0.0).` } : {}),
  };
}

/**
 * Detect Git availability.
 */
export async function detectGit(): Promise<DetectionResult> {
  try {
    const { stdout } = await execFileAsync("git", ["--version"]);
    const version = stdout.trim().replace("git version ", "");
    return { found: true, version };
  } catch {
    return {
      found: false,
      error: "Git is not installed or not in PATH.",
    };
  }
}

/**
 * Detect Claude Code CLI availability.
 */
export async function detectClaudeCode(): Promise<DetectionResult> {
  try {
    const { stdout } = await execFileAsync("claude", ["--version"]);
    const version = stdout.trim();
    return { found: true, version };
  } catch {
    return {
      found: false,
      error: "Claude Code is not installed or not in PATH.",
    };
  }
}

/**
 * Check if Claude Code is authenticated by attempting a minimal call.
 */
export async function checkClaudeCodeAuth(): Promise<DetectionResult> {
  try {
    // Use the --print flag with a minimal prompt to verify auth
    const { stdout } = await execFileAsync("claude", ["-p", "echo hello"], {
      timeout: 30_000,
    });
    return { found: true, version: stdout.trim().slice(0, 50) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      found: false,
      error: `Claude Code authentication check failed: ${message}`,
    };
  }
}

/**
 * Check network connectivity to Anthropic API.
 */
export async function checkNetwork(): Promise<DetectionResult> {
  try {
    // Use a lightweight HEAD request via curl (available on macOS/Linux)
    await execFileAsync("curl", [
      "-sSf",
      "--max-time", "10",
      "-o", "/dev/null",
      "-w", "%{http_code}",
      "https://api.anthropic.com/",
    ]);
    return { found: true };
  } catch {
    return {
      found: false,
      error: "Cannot reach api.anthropic.com. Check your network connection.",
    };
  }
}

/**
 * Get OS information.
 */
export function detectOS(): OSInfo {
  return {
    platform: process.platform,
    arch: process.arch,
    release: os.release(),
    homedir: os.homedir(),
  };
}

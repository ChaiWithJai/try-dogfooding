/**
 * Dogfood CLI — Structured logger
 *
 * Supports run_id correlation, log levels, --json output, and --no-color.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import chalk from "chalk";
import { getFlags } from "./flags.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_COLORS: Record<LogLevel, (s: string) => string> = {
  debug: chalk.gray,
  info: chalk.cyan,
  warn: chalk.yellow,
  error: chalk.red,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: "debug",
  info: " info",
  warn: " warn",
  error: "error",
};

let currentRunId: string | undefined;

export function setRunId(runId: string | undefined): void {
  currentRunId = runId;
}

export function getRunId(): string | undefined {
  return currentRunId;
}

function getMinLevel(): LogLevel {
  return getFlags().verbose ? "debug" : "info";
}

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}

function logJson(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(currentRunId ? { run_id: currentRunId } : {}),
    ...(data ?? {}),
  };
  // Always write JSON to stderr so stdout stays clean for --json command output
  process.stderr.write(JSON.stringify(entry) + "\n");
}

function logPretty(level: LogLevel, message: string): void {
  const flags = getFlags();
  const colorFn = flags.color ? LEVEL_COLORS[level] : (s: string) => s;
  const label = LEVEL_LABELS[level];
  const prefix = currentRunId ? chalk.gray(`[${currentRunId.slice(0, 8)}] `) : "";
  process.stderr.write(`${colorFn(`[${label}]`)} ${prefix}${message}\n`);
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  if (!shouldLog(level)) return;

  if (getFlags().json) {
    logJson(level, message, data);
  } else {
    logPretty(level, message);
  }
}

export const logger = {
  debug: (message: string, data?: Record<string, unknown>) => log("debug", message, data),
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
};

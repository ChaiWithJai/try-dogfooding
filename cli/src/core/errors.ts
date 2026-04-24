/**
 * Dogfood CLI — Structured error system
 *
 * Every user-facing error has a next-step. No raw stack traces.
 * This is a product rule, not a suggestion.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

export type ErrorCode =
  | "SETUP_NODE_MISSING"
  | "SETUP_NODE_VERSION"
  | "SETUP_GIT_MISSING"
  | "SETUP_CLAUDE_MISSING"
  | "SETUP_CLAUDE_AUTH"
  | "SETUP_NETWORK"
  | "WORKSPACE_NOT_FOUND"
  | "WORKSPACE_INVALID"
  | "WORKSPACE_EXISTS"
  | "CONFIG_INVALID"
  | "CONFIG_MISSING"
  | "WORKFLOW_NOT_FOUND"
  | "WORKFLOW_INVALID"
  | "WORKFLOW_TIMEOUT"
  | "WORKFLOW_TOKEN_BUDGET"
  | "CLAUDE_INVOCATION"
  | "CLAUDE_TIMEOUT"
  | "CLAUDE_RATE_LIMIT"
  | "HISTORY_CORRUPT"
  | "UNKNOWN";

export class DogfoodError extends Error {
  readonly code: ErrorCode;
  readonly nextStep: string;
  readonly details?: string;

  constructor(options: {
    message: string;
    code: ErrorCode;
    nextStep: string;
    details?: string;
    cause?: unknown;
  }) {
    super(options.message);
    this.name = "DogfoodError";
    this.code = options.code;
    this.nextStep = options.nextStep;
    this.details = options.details;
    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

export class SetupError extends DogfoodError {
  constructor(options: Omit<ConstructorParameters<typeof DogfoodError>[0], "code"> & { code?: ErrorCode }) {
    super({ ...options, code: options.code ?? "UNKNOWN" });
    this.name = "SetupError";
  }
}

export class WorkflowError extends DogfoodError {
  constructor(options: Omit<ConstructorParameters<typeof DogfoodError>[0], "code"> & { code?: ErrorCode }) {
    super({ ...options, code: options.code ?? "UNKNOWN" });
    this.name = "WorkflowError";
  }
}

export class ClaudeCodeError extends DogfoodError {
  constructor(options: Omit<ConstructorParameters<typeof DogfoodError>[0], "code"> & { code?: ErrorCode }) {
    super({ ...options, code: options.code ?? "CLAUDE_INVOCATION" });
    this.name = "ClaudeCodeError";
  }
}

export class ConfigError extends DogfoodError {
  constructor(options: Omit<ConstructorParameters<typeof DogfoodError>[0], "code"> & { code?: ErrorCode }) {
    super({ ...options, code: options.code ?? "CONFIG_INVALID" });
    this.name = "ConfigError";
  }
}

/**
 * Format a DogfoodError for user-facing output.
 * Verbose mode includes details and stack trace.
 */
export function formatError(error: DogfoodError, verbose = false): string {
  const lines: string[] = [];

  lines.push(`\n  ✗ ${error.message}\n`);
  lines.push(`  Next step: ${error.nextStep}`);

  if (error.code !== "UNKNOWN") {
    lines.push(`  Error code: ${error.code}`);
  }

  if (verbose && error.details) {
    lines.push(`\n  Details:\n  ${error.details}`);
  }

  if (verbose && error.stack) {
    lines.push(`\n  Stack trace:\n  ${error.stack}`);
  }

  lines.push(""); // trailing newline
  return lines.join("\n");
}

/**
 * Wrap an unknown error into a DogfoodError.
 * Preserves existing DogfoodErrors; wraps everything else.
 */
export function wrapError(error: unknown): DogfoodError {
  if (error instanceof DogfoodError) {
    return error;
  }

  const message =
    error instanceof Error ? error.message : String(error);

  return new DogfoodError({
    message: `An unexpected error occurred: ${message}`,
    code: "UNKNOWN",
    nextStep: "Run 'dogfood doctor' to check your setup, or try again with --verbose for more details.",
    cause: error,
  });
}

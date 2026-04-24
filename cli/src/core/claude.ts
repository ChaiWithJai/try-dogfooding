/**
 * Dogfood CLI — Claude Code integration
 *
 * Wraps Claude Code invocations with the guardrails from spec §2.6:
 * timeouts, retry with jitter, token budget tracking, structured logging,
 * and graceful error handling.
 *
 * v0.1.0 uses subprocess spawning (`claude -p`). Future versions will
 * migrate to the Claude Agent SDK for in-process control.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import { spawn } from "node:child_process";
import { logger, setRunId } from "../utils/logger.js";
import { ClaudeCodeError } from "./errors.js";

export interface ClaudeExecutionConfig {
  prompt: string;
  allowedTools?: string[];
  maxTokens?: number;
  timeoutSeconds?: number;
  workingDirectory?: string;
  runId: string;
}

export interface ClaudeExecutionResult {
  output: string;
  tokensUsed?: number;
  durationMs: number;
  status: "success" | "failure" | "timeout";
  error?: string;
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

/**
 * Execute a prompt through Claude Code with full guardrails.
 */
export async function executeWithClaude(
  config: ClaudeExecutionConfig,
): Promise<ClaudeExecutionResult> {
  setRunId(config.runId);

  const timeoutMs = (config.timeoutSeconds ?? 300) * 1000;
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = jitteredDelay(BASE_DELAY_MS, attempt);
      logger.info(`Retrying Claude Code invocation (attempt ${attempt + 1}/${MAX_RETRIES + 1}) after ${delay}ms delay...`);
      await sleep(delay);
    }

    try {
      const result = await invokeClaudeCode(config, timeoutMs);
      setRunId(undefined);
      return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Only retry on retriable errors
      if (!isRetriable(lastError)) {
        break;
      }

      logger.warn(`Claude Code invocation failed (retriable): ${lastError.message}`);
    }
  }

  setRunId(undefined);

  throw new ClaudeCodeError({
    message: `Claude Code invocation failed after ${MAX_RETRIES + 1} attempts.`,
    code: "CLAUDE_INVOCATION",
    nextStep: "Run 'dogfood doctor' to check your Claude Code setup, or try again with --verbose.",
    details: lastError?.message,
    cause: lastError,
  });
}

/**
 * Invoke Claude Code via subprocess.
 */
async function invokeClaudeCode(
  config: ClaudeExecutionConfig,
  timeoutMs: number,
): Promise<ClaudeExecutionResult> {
  const startTime = Date.now();

  return new Promise<ClaudeExecutionResult>((resolve, reject) => {
    const args: string[] = [
      "-p", config.prompt,
      "--output-format", "text",
    ];

    if (config.allowedTools && config.allowedTools.length > 0) {
      args.push("--allowedTools", config.allowedTools.join(","));
    }

    if (config.maxTokens) {
      args.push("--max-turns", String(Math.ceil(config.maxTokens / 4000)));
    }

    logger.debug(`Spawning claude with args: ${args.join(" ")}`);

    const child = spawn("claude", args, {
      cwd: config.workingDirectory,
      stdio: ["pipe", "pipe", "pipe"],
      timeout: timeoutMs,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    // Set up timeout
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => {
        if (!child.killed) {
          child.kill("SIGKILL");
        }
      }, 5000);

      resolve({
        output: stdout,
        durationMs: Date.now() - startTime,
        status: "timeout",
        error: `Claude Code timed out after ${timeoutMs / 1000}s`,
      });
    }, timeoutMs);

    child.on("close", (code) => {
      clearTimeout(timer);
      const durationMs = Date.now() - startTime;

      if (code === 0) {
        logger.info(`Claude Code completed in ${durationMs}ms`);
        resolve({
          output: stdout.trim(),
          durationMs,
          status: "success",
        });
      } else {
        const errorMsg = stderr.trim() || `Claude Code exited with code ${code}`;
        logger.error(`Claude Code failed: ${errorMsg}`);
        reject(new Error(errorMsg));
      }
    });

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

/**
 * Determine if an error is retriable.
 */
function isRetriable(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("overloaded") ||
    message.includes("timeout") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("503") ||
    message.includes("529")
  );
}

/**
 * Full jitter delay: random value between 0 and (base * 2^attempt).
 */
function jitteredDelay(baseMs: number, attempt: number): number {
  const maxDelay = baseMs * Math.pow(2, attempt);
  return Math.floor(Math.random() * maxDelay);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

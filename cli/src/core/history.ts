/**
 * Dogfood CLI — Run history management
 *
 * Append-only JSONL file at history/runs.jsonl in the workspace.
 * Every workflow run produces an auditable record on disk.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { z } from "zod";

export const RunRecordSchema = z.object({
  run_id: z.string(),
  workflow: z.string(),
  started_at: z.string().datetime(),
  finished_at: z.string().datetime().optional(),
  status: z.enum(["running", "success", "failure", "timeout"]),
  tokens_used: z.number().int().nonnegative().optional(),
  duration_ms: z.number().int().nonnegative().optional(),
  output_path: z.string().optional(),
  error: z.string().optional(),
});

export type RunRecord = z.infer<typeof RunRecordSchema>;

const HISTORY_FILE = "history/runs.jsonl";

/**
 * Generate a short, unique run ID.
 */
export function generateRunId(): string {
  return crypto.randomUUID().split("-").slice(0, 2).join("");
}

/**
 * Append a run record to the history file.
 */
export async function appendRun(
  workspacePath: string,
  record: RunRecord,
): Promise<void> {
  const historyPath = path.join(workspacePath, HISTORY_FILE);
  const line = JSON.stringify(record) + "\n";
  await fs.appendFile(historyPath, line, "utf-8");
}

/**
 * List recent runs from the history file.
 */
export async function listRuns(
  workspacePath: string,
  limit = 20,
): Promise<RunRecord[]> {
  const historyPath = path.join(workspacePath, HISTORY_FILE);

  let content: string;
  try {
    content = await fs.readFile(historyPath, "utf-8");
  } catch {
    return [];
  }

  const lines = content.trim().split("\n").filter(Boolean);
  const records: RunRecord[] = [];

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line) as unknown;
      const result = RunRecordSchema.safeParse(parsed);
      if (result.success) {
        records.push(result.data);
      }
    } catch {
      // Skip malformed lines
    }
  }

  // Most recent first
  return records.reverse().slice(0, limit);
}

/**
 * Get a specific run by ID.
 */
export async function getRun(
  workspacePath: string,
  runId: string,
): Promise<RunRecord | undefined> {
  const all = await listRuns(workspacePath, Infinity);
  return all.find((r) => r.run_id === runId);
}

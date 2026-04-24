/**
 * Tests for run history management
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  appendRun,
  listRuns,
  getRun,
  generateRunId,
  type RunRecord,
} from "../../src/core/history.js";

describe("history", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-hist-"));
    await fs.mkdir(path.join(tmpDir, "history"), { recursive: true });
    await fs.writeFile(path.join(tmpDir, "history", "runs.jsonl"), "", "utf-8");
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  const makeRecord = (overrides?: Partial<RunRecord>): RunRecord => ({
    run_id: generateRunId(),
    workflow: "test-workflow",
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    status: "success",
    tokens_used: 1000,
    duration_ms: 5000,
    output_path: "/tmp/output",
    ...overrides,
  });

  it("should generate unique run IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRunId()));
    expect(ids.size).toBe(100);
  });

  it("should append and list runs", async () => {
    const record = makeRecord();
    await appendRun(tmpDir, record);

    const runs = await listRuns(tmpDir);
    expect(runs).toHaveLength(1);
    expect(runs[0]?.run_id).toBe(record.run_id);
  });

  it("should return most recent first", async () => {
    const r1 = makeRecord({ started_at: "2026-01-01T00:00:00.000Z" });
    const r2 = makeRecord({ started_at: "2026-01-02T00:00:00.000Z" });
    await appendRun(tmpDir, r1);
    await appendRun(tmpDir, r2);

    const runs = await listRuns(tmpDir);
    expect(runs[0]?.run_id).toBe(r2.run_id);
  });

  it("should get a specific run by ID", async () => {
    const record = makeRecord();
    await appendRun(tmpDir, record);

    const found = await getRun(tmpDir, record.run_id);
    expect(found?.run_id).toBe(record.run_id);
  });

  it("should return undefined for non-existent run", async () => {
    const found = await getRun(tmpDir, "nonexistent");
    expect(found).toBeUndefined();
  });

  it("should respect the limit parameter", async () => {
    for (let i = 0; i < 5; i++) {
      await appendRun(tmpDir, makeRecord());
    }

    const runs = await listRuns(tmpDir, 3);
    expect(runs).toHaveLength(3);
  });

  it("should handle empty history", async () => {
    const runs = await listRuns(tmpDir);
    expect(runs).toHaveLength(0);
  });
});

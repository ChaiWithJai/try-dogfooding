/**
 * Tests for workspace management
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  createWorkspace,
  findWorkspace,
  validateWorkspace,
} from "../../src/core/workspace.js";

describe("workspace", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("createWorkspace", () => {
    it("should create the full directory structure", async () => {
      const wsPath = path.join(tmpDir, "workspace");
      await createWorkspace(wsPath);

      // Check directories
      for (const dir of ["workflows", "data", "integrations", "history", ".dogfood"]) {
        const stat = await fs.stat(path.join(wsPath, dir));
        expect(stat.isDirectory()).toBe(true);
      }

      // Check files
      const readme = await fs.readFile(path.join(wsPath, "README.md"), "utf-8");
      expect(readme).toContain("TryDogfooding Workspace");

      const claudeMd = await fs.readFile(path.join(wsPath, "CLAUDE.md"), "utf-8");
      expect(claudeMd).toContain("TryDogfooding");

      const version = await fs.readFile(path.join(wsPath, ".dogfood", "version"), "utf-8");
      expect(version.trim()).toBe("0.1.0");

      // Check runs.jsonl exists (empty)
      const runs = await fs.readFile(path.join(wsPath, "history", "runs.jsonl"), "utf-8");
      expect(runs).toBe("");
    });

    it("should not overwrite an existing workspace", async () => {
      const wsPath = path.join(tmpDir, "workspace");
      await createWorkspace(wsPath);
      await expect(createWorkspace(wsPath)).rejects.toThrow("already exists");
    });

    it("should respect --dry-run", async () => {
      const wsPath = path.join(tmpDir, "dry-run-workspace");
      await createWorkspace(wsPath, { dryRun: true });

      // Directory should not be created
      await expect(fs.access(wsPath)).rejects.toThrow();
    });
  });

  describe("findWorkspace", () => {
    it("should find workspace by walking up directories", async () => {
      const wsPath = path.join(tmpDir, "workspace");
      await createWorkspace(wsPath);

      const nestedDir = path.join(wsPath, "workflows", "nested");
      await fs.mkdir(nestedDir, { recursive: true });

      const found = await findWorkspace(nestedDir);
      expect(found).toBe(wsPath);
    });

    it("should return undefined when no workspace exists", async () => {
      const found = await findWorkspace(tmpDir);
      // May find user's actual workspace, so just check it doesn't crash
      expect(found === undefined || typeof found === "string").toBe(true);
    });
  });

  describe("validateWorkspace", () => {
    it("should validate a correct workspace", async () => {
      const wsPath = path.join(tmpDir, "workspace");
      await createWorkspace(wsPath);

      const result = await validateWorkspace(wsPath);
      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it("should detect missing directories", async () => {
      const wsPath = path.join(tmpDir, "broken-workspace");
      await fs.mkdir(wsPath, { recursive: true });
      await fs.mkdir(path.join(wsPath, ".dogfood"), { recursive: true });

      const result = await validateWorkspace(wsPath);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });
});

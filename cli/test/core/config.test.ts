/**
 * Tests for config management
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  loadConfig,
  saveConfig,
  createDefaultConfig,
} from "../../src/core/config.js";

describe("config", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-cfg-"));
    await fs.mkdir(path.join(tmpDir, ".dogfood"), { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("should round-trip save and load", async () => {
    const config = createDefaultConfig(tmpDir, true);
    await saveConfig(tmpDir, config);
    const loaded = await loadConfig(tmpDir);

    expect(loaded.workspace_path).toBe(path.resolve(tmpDir));
    expect(loaded.claude_code_configured).toBe(true);
    expect(loaded.telemetry_enabled).toBe(false);
    expect(loaded.cli_version).toBe("0.1.0");
  });

  it("should throw on missing config", async () => {
    const emptyDir = path.join(tmpDir, "empty");
    await fs.mkdir(path.join(emptyDir, ".dogfood"), { recursive: true });
    await expect(loadConfig(emptyDir)).rejects.toThrow("not found");
  });

  it("should throw on invalid YAML", async () => {
    await fs.writeFile(
      path.join(tmpDir, ".dogfood", "config.yaml"),
      "invalid: yaml: content: [broken",
      "utf-8",
    );
    await expect(loadConfig(tmpDir)).rejects.toThrow();
  });
});

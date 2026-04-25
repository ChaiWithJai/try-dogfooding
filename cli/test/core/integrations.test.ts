import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import {
  getClaudeConfig,
  saveClaudeConfig,
  listIntegrations,
  addIntegration,
  removeIntegration,
} from "../../src/core/integrations.js";
import { DogfoodError } from "../../src/core/errors.js";

describe("Integrations Core", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-test-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe("getClaudeConfig", () => {
    it("returns empty object if .claude.json does not exist", async () => {
      const config = await getClaudeConfig(tmpDir);
      expect(config).toEqual({});
    });

    it("parses valid .claude.json", async () => {
      const validJson = { mcpServers: { test: { command: "echo", args: [] } } };
      await fs.writeFile(path.join(tmpDir, ".claude.json"), JSON.stringify(validJson));
      const config = await getClaudeConfig(tmpDir);
      expect(config).toEqual(validJson);
    });

    it("throws DogfoodError on malformed json", async () => {
      await fs.writeFile(path.join(tmpDir, ".claude.json"), "{ invalid }");
      await expect(getClaudeConfig(tmpDir)).rejects.toThrow(DogfoodError);
    });
  });

  describe("saveClaudeConfig", () => {
    it("writes config to .claude.json", async () => {
      const config = { mcpServers: { foo: { command: "ls", args: [] } } };
      await saveClaudeConfig(tmpDir, config);
      const data = await fs.readFile(path.join(tmpDir, ".claude.json"), "utf-8");
      expect(JSON.parse(data)).toEqual(config);
    });
  });

  describe("listIntegrations", () => {
    it("returns empty object when no servers exist", async () => {
      const integrations = await listIntegrations(tmpDir);
      expect(integrations).toEqual({});
    });

    it("returns servers when they exist", async () => {
      const servers = { db: { command: "sqlite", args: [] } };
      await saveClaudeConfig(tmpDir, { mcpServers: servers });
      const integrations = await listIntegrations(tmpDir);
      expect(integrations).toEqual(servers);
    });
  });

  describe("addIntegration", () => {
    it("adds a server to an empty config", async () => {
      await addIntegration(tmpDir, "new-server", { command: "test", args: ["--flag"] });
      const config = await getClaudeConfig(tmpDir);
      expect(config.mcpServers).toHaveProperty("new-server");
      expect(config.mcpServers!["new-server"].command).toBe("test");
    });

    it("merges with existing servers", async () => {
      await saveClaudeConfig(tmpDir, { mcpServers: { old: { command: "old", args: [] } } });
      await addIntegration(tmpDir, "new", { command: "new", args: [] });
      const config = await getClaudeConfig(tmpDir);
      expect(Object.keys(config.mcpServers!)).toHaveLength(2);
      expect(config.mcpServers).toHaveProperty("old");
      expect(config.mcpServers).toHaveProperty("new");
    });
  });

  describe("removeIntegration", () => {
    it("returns false if server doesn't exist", async () => {
      const removed = await removeIntegration(tmpDir, "missing");
      expect(removed).toBe(false);
    });

    it("removes server and returns true", async () => {
      await addIntegration(tmpDir, "target", { command: "cmd", args: [] });
      const removed = await removeIntegration(tmpDir, "target");
      expect(removed).toBe(true);
      const config = await getClaudeConfig(tmpDir);
      expect(config.mcpServers).not.toHaveProperty("target");
    });
  });
});

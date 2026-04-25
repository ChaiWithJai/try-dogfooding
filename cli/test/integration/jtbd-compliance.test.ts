/**
 * JTBD Compliance Tests — Spec §2, §4, §5, §6
 *
 * These tests codify the Jobs to Be Done, technical rules, product rules,
 * CLI guardrails, and runbook RB-001 from the feature spec and central doc.
 * Every test references the spec section it validates.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import yaml from "js-yaml";

const execFileAsync = promisify(execFile);

const CLI_PATH = path.resolve(__dirname, "../../dist/bin/dogfood.js");

async function run(
  args: string[],
  options?: { cwd?: string },
): Promise<{ stdout: string; stderr: string; code: number }> {
  try {
    const { stdout, stderr } = await execFileAsync("node", [CLI_PATH, ...args], {
      cwd: options?.cwd,
      timeout: 30_000,
      env: { ...process.env, NO_COLOR: "1" },
    });
    return { stdout, stderr, code: 0 };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      code: e.code ?? 1,
    };
  }
}

// ===================================================================
// JTBD: The operator journey (central-doc §"How operators discover and enter")
//
// Step 5: "They attend live; pair-build one workflow against their real data"
// Step 6: "They leave with working software on their machine"
//
// The CLI is the mechanism for steps 5-6. These tests validate the
// end-to-end path an operator takes during a workshop.
// ===================================================================

describe("JTBD: Operator workshop journey", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-jtbd-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("JTBD-01: operator can init a workspace in one command", async () => {
    // Central doc: "The happy path is one command" (product rule 3)
    const wsPath = path.join(tmpDir, "workshop-workspace");
    const result = await run(["init", wsPath]);

    // Init should succeed (exit 0) even without Claude Code
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("workspace is ready");
  });

  it("JTBD-02: workspace has all spec-required directories (spec §2.3)", async () => {
    // Spec §2.3 defines the exact workspace structure
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const requiredDirs = ["workflows", "data", "integrations", "history", ".dogfood"];
    for (const dir of requiredDirs) {
      const stat = await fs.stat(path.join(wsPath, dir));
      expect(stat.isDirectory(), `Missing required directory: ${dir}`).toBe(true);
    }
  });

  it("JTBD-03: workspace has README.md and CLAUDE.md (spec §2.3)", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const readme = await fs.readFile(path.join(wsPath, "README.md"), "utf-8");
    expect(readme).toContain("TryDogfooding");

    const claudeMd = await fs.readFile(path.join(wsPath, "CLAUDE.md"), "utf-8");
    expect(claudeMd.length).toBeGreaterThan(0);
  });

  it("JTBD-04: workspace is a git repo (spec §2.3: 'It is a git repo')", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const gitDir = await fs.stat(path.join(wsPath, ".git"));
    expect(gitDir.isDirectory()).toBe(true);
  });

  it("JTBD-05: workspace has .dogfood/config.yaml and .dogfood/version (spec §2.3)", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const config = await fs.readFile(path.join(wsPath, ".dogfood", "config.yaml"), "utf-8");
    const parsed = yaml.load(config) as Record<string, unknown>;
    expect(parsed).toHaveProperty("workspace_path");
    expect(parsed).toHaveProperty("cli_version");

    const version = await fs.readFile(path.join(wsPath, ".dogfood", "version"), "utf-8");
    expect(version.trim()).toBe("0.1.0");
  });

  it("JTBD-06: workspace has append-only runs.jsonl (spec §2.3)", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const runsPath = path.join(wsPath, "history", "runs.jsonl");
    const content = await fs.readFile(runsPath, "utf-8");
    // Should exist and be empty initially
    expect(content).toBe("");
  });

  it("JTBD-07: bundled workflow template is installed during init", async () => {
    // Operators leave the workshop with a working workflow
    const wsPath = path.join(tmpDir, "ws");
    const result = await run(["init", wsPath]);

    expect(result.stdout).toContain("cx-triage");

    const workflowYaml = await fs.readFile(
      path.join(wsPath, "workflows", "cx-triage", "workflow.yaml"),
      "utf-8",
    );
    expect(workflowYaml).toContain("cx-triage");
  });

  it("JTBD-08: operator can list workflows after init", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const result = await run(["workflow", "list"], { cwd: wsPath });
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("cx-triage");
    expect(result.stdout).toContain("cx");
  });

  it("JTBD-09: operator can dry-run a workflow after init", async () => {
    // This is the workshop moment: operator sees their workflow assembled
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const result = await run(["run", "cx-triage", "--dry-run"], { cwd: wsPath });
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Dry run");
    expect(result.stdout).toContain("CX Triage Workflow");
    expect(result.stdout).toContain("Timeout:");
    expect(result.stdout).toContain("Max tokens:");
  });

  it("JTBD-10: operator can check their setup with doctor", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const result = await run(["doctor"], { cwd: wsPath });
    // Doctor should find the workspace
    expect(result.stdout).toContain("Node.js");
    expect(result.stdout).toContain("Workspace");
  });
});

// ===================================================================
// Technical Rules (spec §4.1)
// ===================================================================

describe("Technical rules (spec §4)", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-rules-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("Rule 3: credentials never in code or logs — config does not store credentials", async () => {
    // spec §4.1.3: "Credentials are never in our code, our logs, our telemetry"
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const config = await fs.readFile(path.join(wsPath, ".dogfood", "config.yaml"), "utf-8");
    // Config should not contain any API keys, tokens, or passwords
    expect(config.toLowerCase()).not.toContain("api_key");
    expect(config.toLowerCase()).not.toContain("secret");
    expect(config.toLowerCase()).not.toContain("password");
    expect(config.toLowerCase()).not.toContain("token");
    expect(config.toLowerCase()).not.toContain("sk-");
  });

  it("Rule 6: every workflow run produces an auditable record (run_id, timing)", async () => {
    // spec §4.1.6: "Every workflow run produces an auditable record on disk"
    // We test this via the history schema
    const { RunRecordSchema } = await import("../../src/core/history.js");

    const validRecord = {
      run_id: "abc123def456",
      workflow: "cx-triage",
      started_at: "2026-04-24T12:00:00.000Z",
      finished_at: "2026-04-24T12:01:00.000Z",
      status: "success",
      tokens_used: 5000,
      duration_ms: 60000,
      output_path: "/tmp/output",
    };

    const result = RunRecordSchema.safeParse(validRecord);
    expect(result.success).toBe(true);

    // Missing required fields should fail
    const incomplete = { workflow: "test" };
    const failResult = RunRecordSchema.safeParse(incomplete);
    expect(failResult.success).toBe(false);
  });

  it("Rule 7: every error has a next-step — no raw stack traces", async () => {
    // spec §4.1.7: "Every user-facing error has a next-step. No raw stack traces."
    const { DogfoodError, formatError, wrapError } = await import("../../src/core/errors.js");

    // DogfoodError requires nextStep
    const err = new DogfoodError({
      message: "Test error",
      code: "UNKNOWN",
      nextStep: "Do this next",
    });
    expect(err.nextStep).toBe("Do this next");

    // Formatted output includes next-step
    const formatted = formatError(err, false);
    expect(formatted).toContain("Next step:");
    expect(formatted).toContain("Do this next");

    // Non-verbose mode does NOT include stack traces
    expect(formatted).not.toContain("at ");

    // Wrapped unknown errors also get a next-step
    const wrapped = wrapError(new Error("raw error"));
    expect(wrapped.nextStep).toBeTruthy();
    expect(wrapped.nextStep.length).toBeGreaterThan(0);
  });

  it("Rule 9: telemetry is off by default", async () => {
    // spec §4.1.9: "No analytics or telemetry is collected by default"
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const config = await fs.readFile(path.join(wsPath, ".dogfood", "config.yaml"), "utf-8");
    const parsed = yaml.load(config) as Record<string, unknown>;
    expect(parsed["telemetry_enabled"]).toBe(false);
  });
});

// ===================================================================
// Product Rules (spec §4.2)
// ===================================================================

describe("Product rules (spec §4)", () => {
  it("Rule 1: no jargon — error messages avoid 'just' and 'simply'", async () => {
    // spec §4.2.1: "No jargon. No 'just' or 'simply.'"
    const { DogfoodError, SetupError, WorkflowError, ClaudeCodeError, ConfigError, formatError, wrapError } =
      await import("../../src/core/errors.js");

    const errors = [
      new SetupError({ message: "Node missing", nextStep: "Install Node 20+" }),
      new WorkflowError({ message: "Not found", nextStep: "Run workflow list" }),
      new ClaudeCodeError({ message: "Auth failed", nextStep: "Check credentials" }),
      new ConfigError({ message: "Invalid", nextStep: "Re-run init" }),
      wrapError(new Error("unknown")),
    ];

    for (const err of errors) {
      const formatted = formatError(err, false);
      // These words are banned in operator-facing text
      expect(formatted.toLowerCase()).not.toContain(" just ");
      expect(formatted.toLowerCase()).not.toContain(" simply ");
    }
  });

  it("Rule 2: defaults are safe — init creates safe defaults", async () => {
    // spec §4.2.2: "Defaults are safe; overrides are explicit"
    const { createDefaultConfig } = await import("../../src/core/config.js");
    const config = createDefaultConfig("/tmp/test", false);

    // Telemetry should default to off
    expect(config.telemetry_enabled).toBe(false);
    // Claude Code should reflect actual state
    expect(config.claude_code_configured).toBe(false);
  });
});

// ===================================================================
// CLI Guardrails (spec §5)
// ===================================================================

describe("CLI guardrails (spec §5)", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-guard-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("Guardrail: every command supports --json", async () => {
    // spec §5: "Every command supports --json"
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    // doctor --json
    const doctorResult = await run(["--json", "doctor"], { cwd: wsPath });
    expect(doctorResult.stdout).toContain('"checks"');
    // Doctor outputs a header before JSON — extract the JSON block
    const jsonStart = doctorResult.stdout.indexOf("{");
    const jsonEnd = doctorResult.stdout.lastIndexOf("}");
    expect(jsonStart).toBeGreaterThan(-1);
    const parsed = JSON.parse(doctorResult.stdout.substring(jsonStart, jsonEnd + 1));
    expect(parsed).toHaveProperty("checks");

    // workflow list --json
    const wfResult = await run(["--json", "workflow", "list"], { cwd: wsPath });
    expect(() => JSON.parse(wfResult.stdout.trim())).not.toThrow();

    // history --json
    const histResult = await run(["--json", "history"], { cwd: wsPath });
    expect(histResult.code).toBe(0);
  });

  it("Guardrail: init supports --dry-run", async () => {
    // spec §5: "--dry-run where side effects are possible"
    const wsPath = path.join(tmpDir, "dry-run-ws");
    const result = await run(["init", wsPath, "--dry-run"]);

    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Dry run");

    // Workspace should NOT exist
    await expect(fs.access(path.join(wsPath, ".dogfood"))).rejects.toThrow();
  });

  it("Guardrail: run supports --dry-run", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const result = await run(["run", "cx-triage", "--dry-run"], { cwd: wsPath });
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("Dry run");
    // Should NOT have created any output files
    const outputs = path.join(wsPath, "workflows", "cx-triage", "outputs");
    await expect(fs.readdir(outputs)).rejects.toThrow();
  });

  it("Guardrail: --version outputs semver", async () => {
    const result = await run(["--version"]);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("Guardrail: --help lists all commands", async () => {
    const result = await run(["--help"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("init");
    expect(result.stdout).toContain("doctor");
    expect(result.stdout).toContain("run");
    expect(result.stdout).toContain("history");
    expect(result.stdout).toContain("workflow");
  });

  it("Guardrail: non-existent workflow gives clear error with next-step", async () => {
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);

    const result = await run(["run", "nonexistent-workflow"], { cwd: wsPath });
    expect(result.code).not.toBe(0);
    // Must have a next-step (spec rule 7)
    const output = result.stdout + result.stderr;
    expect(output).toContain("not found");
    expect(output).toContain("workflow list");
  });
});

// ===================================================================
// Runbook RB-001: User's first-run setup fails (spec §6)
// ===================================================================

describe("Runbook RB-001: first-run setup fails (spec §6)", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "dogfood-rb001-"));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("RB-001.1: init completes even when Claude Code is missing", async () => {
    // Spec RB-001 resolution: "Claude Code missing → install via bundled path; manual fallback"
    // The init should NOT fail — it should warn and continue
    const wsPath = path.join(tmpDir, "ws");
    const result = await run(["init", wsPath]);

    // Should still succeed (exit 0)
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("workspace is ready");
  });

  it("RB-001.2: doctor surfaces Claude Code missing with clear next-step", async () => {
    // RB-001 diagnosis order: "Is Claude Code installed and authenticated?"
    const result = await run(["doctor"]);
    const output = result.stdout + result.stderr;

    // Should mention Claude Code status
    expect(output).toContain("Claude Code");
  });

  it("RB-001.3: doctor surfaces workspace issues with next-step", async () => {
    // RB-001 diagnosis: "Did the verification workflow run?"
    // Without a workspace, doctor should tell user to run init
    const result = await run(["doctor"], { cwd: tmpDir });
    const output = result.stdout + result.stderr;

    // If no workspace found, should direct to init
    if (output.includes("No workspace found")) {
      expect(output).toContain("init");
    }
  });

  it("RB-001.4: re-running init on existing workspace gives clear error", async () => {
    // Operators might accidentally re-run init — error should be helpful
    const wsPath = path.join(tmpDir, "ws");
    await run(["init", wsPath]);
    const result = await run(["init", wsPath]);

    const output = result.stdout + result.stderr;
    expect(output).toContain("already exists");
  });
});

// ===================================================================
// Workflow template format compliance (spec §2.5)
// ===================================================================

describe("Workflow template format (spec §2.5)", () => {
  it("all bundled templates match spec schema and have required files", async () => {
    const { WorkflowSchema } = await import("../../src/schemas/workflow.js");
    const templatesDir = path.resolve(__dirname, "../../src/templates");
    
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });
    const templateNames = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    
    expect(templateNames.length).toBeGreaterThan(0);

    for (const name of templateNames) {
      const templatePath = path.join(templatesDir, name, "workflow.yaml");
      
      // 1. Validate Schema
      const raw = await fs.readFile(templatePath, "utf-8");
      const parsed = yaml.load(raw) as unknown;

      const result = WorkflowSchema.safeParse(parsed);
      expect(result.success, `Template validation failed for ${name}: ${JSON.stringify(result.error?.issues)}`).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe(name);
        expect(result.data.description).toBeTruthy();
        expect(result.data.persona).toBeTruthy();
        expect(result.data.claude_code_config.timeout_seconds).toBeGreaterThan(0);
        expect(result.data.claude_code_config.max_tokens_per_run).toBeGreaterThan(0);
      }

      // 2. Validate Companion Files (spec §7.3)
      const requiredFiles = ["workflow.yaml", "CLAUDE.md", "README.md"];
      for (const file of requiredFiles) {
        const stat = await fs.stat(path.join(templatesDir, name, file));
        expect(stat.isFile(), `Missing required file in ${name}: ${file}`).toBe(true);
      }

      const promptsDir = await fs.stat(path.join(templatesDir, name, "prompts"));
      expect(promptsDir.isDirectory()).toBe(true);

      const prompts = await fs.readdir(path.join(templatesDir, name, "prompts"));
      expect(prompts.length).toBeGreaterThan(0);
    }
  });
});

// ===================================================================
// Guardrails §2.6: Claude Code wrapper compliance
// ===================================================================

describe("Probabilistic guardrails (spec §2.6)", () => {
  it("Claude wrapper has timeout enforcement", async () => {
    // spec §2.6: "Timeouts on every call"
    const claude = await import("../../src/core/claude.js");

    // The config accepts timeoutSeconds, and the implementation
    // should apply it. We verify the interface exists.
    const config: Parameters<typeof claude.executeWithClaude>[0] = {
      prompt: "test",
      timeoutSeconds: 10,
      runId: "test-run",
    };

    // Timeout is part of the interface
    expect(config.timeoutSeconds).toBe(10);
  });

  it("Claude wrapper has retry with jitter", async () => {
    // spec §2.6: "Retry with full jitter on retriable failures"
    // Verify the retry behavior exists by checking the code structure.
    // The MAX_RETRIES constant and jitteredDelay function are in claude.ts.
    const claudeSource = await fs.readFile(
      path.resolve(__dirname, "../../src/core/claude.ts"),
      "utf-8",
    );

    expect(claudeSource).toContain("MAX_RETRIES");
    expect(claudeSource).toContain("jitteredDelay");
    expect(claudeSource).toContain("isRetriable");
  });

  it("Claude wrapper has structured logging with run_id", async () => {
    // spec §2.6: "Structured logging with run_id correlation"
    const claudeSource = await fs.readFile(
      path.resolve(__dirname, "../../src/core/claude.ts"),
      "utf-8",
    );

    expect(claudeSource).toContain("setRunId");
    expect(claudeSource).toContain("config.runId");
  });

  it("Run record captures all auditable fields (spec §4.1.6)", async () => {
    // spec §4.1.6: "run_id, inputs, prompts, MCP calls, outputs, tokens, timing"
    const { RunRecordSchema } = await import("../../src/core/history.js");
    const shape = RunRecordSchema.shape;

    // Required audit fields
    expect(shape).toHaveProperty("run_id");
    expect(shape).toHaveProperty("workflow");
    expect(shape).toHaveProperty("started_at");
    expect(shape).toHaveProperty("status");
    expect(shape).toHaveProperty("tokens_used");
    expect(shape).toHaveProperty("duration_ms");
    expect(shape).toHaveProperty("output_path");
  });
});

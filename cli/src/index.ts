/**
 * Dogfood CLI — Public API exports
 *
 * For programmatic usage of Dogfood.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

// Core
export { createWorkspace, findWorkspace, validateWorkspace, getWorkspacePath } from "./core/workspace.js";
export { loadConfig, saveConfig, createDefaultConfig } from "./core/config.js";
export { appendRun, listRuns, getRun, generateRunId } from "./core/history.js";
export { executeWithClaude } from "./core/claude.js";
export { DogfoodError, SetupError, WorkflowError, ClaudeCodeError, ConfigError, formatError, wrapError } from "./core/errors.js";

// Schemas
export { WorkflowSchema, type WorkflowConfig, type Persona } from "./schemas/workflow.js";
export { DogfoodConfigSchema, type DogfoodConfig } from "./schemas/config.js";
export { RunRecordSchema, type RunRecord } from "./core/history.js";

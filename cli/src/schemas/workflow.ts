/**
 * Dogfood CLI — Workflow schema
 *
 * Zod schema matching the workflow template format from the feature spec §2.5.
 * Validates workflow.yaml at load time.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import { z } from "zod";

export const PersonaSchema = z.enum([
  "gtm",
  "cx",
  "marketing",
  "back-office",
  "custom",
]);

export type Persona = z.infer<typeof PersonaSchema>;

export const WorkflowInputSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  default: z.unknown().optional(),
});

export const WorkflowOutputSchema = z.object({
  name: z.string().min(1),
  destination: z.string(),
  format: z.enum(["markdown", "json", "csv", "text", "html"]),
});

export const ClaudeCodeConfigSchema = z.object({
  allowed_tools: z.array(z.string()).default([]),
  max_tokens_per_run: z.number().int().positive().default(100_000),
  timeout_seconds: z.number().int().positive().default(300),
});

export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  persona: PersonaSchema,
  stack_requires: z.array(z.string()).default([]),
  claude_code_config: ClaudeCodeConfigSchema.default({}),
  inputs: z.array(WorkflowInputSchema).default([]),
  outputs: z.array(WorkflowOutputSchema).default([]),
  schedule: z.null().optional(),
});

export type WorkflowConfig = z.infer<typeof WorkflowSchema>;

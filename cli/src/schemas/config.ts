/**
 * Dogfood CLI — Config schema
 *
 * Zod schema for .dogfood/config.yaml.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import { z } from "zod";

export const DogfoodConfigSchema = z.object({
  workspace_path: z.string(),
  claude_code_configured: z.boolean().default(false),
  telemetry_enabled: z.boolean().default(false),
  created_at: z.string().datetime(),
  cli_version: z.string(),
});

export type DogfoodConfig = z.infer<typeof DogfoodConfigSchema>;

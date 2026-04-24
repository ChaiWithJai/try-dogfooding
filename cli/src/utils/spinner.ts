/**
 * Dogfood CLI — Spinner wrapper
 *
 * Consistent branding for ora spinners. Respects --json and --no-color.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

import ora, { type Ora } from "ora";
import { getFlags } from "./flags.js";

/**
 * Create a branded spinner. In --json mode, returns a no-op spinner
 * that just logs to stderr so structured output isn't polluted.
 */
export function createSpinner(text: string): Ora {
  const flags = getFlags();

  if (flags.json) {
    // In JSON mode, suppress spinner entirely. Use logger instead.
    const noop = ora({ text, isSilent: true });
    return noop;
  }

  return ora({
    text,
    color: "cyan",
    spinner: "dots",
    ...(flags.color ? {} : { color: undefined }),
  });
}

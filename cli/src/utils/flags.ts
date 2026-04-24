/**
 * Dogfood CLI — Global flag state
 *
 * Reads Commander's parsed global options and makes them accessible
 * throughout the app via a singleton. Set once at startup, read anywhere.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * Copyright (c) 2026 Jai Bhagat <jai@trydogfooding.com>
 */

export interface GlobalFlags {
  json: boolean;
  verbose: boolean;
  color: boolean;
  yes: boolean;
}

const defaults: GlobalFlags = {
  json: false,
  verbose: false,
  color: true,
  yes: false,
};

let current: GlobalFlags = { ...defaults };

export function setFlags(flags: Partial<GlobalFlags>): void {
  current = { ...current, ...flags };
}

export function getFlags(): Readonly<GlobalFlags> {
  return current;
}

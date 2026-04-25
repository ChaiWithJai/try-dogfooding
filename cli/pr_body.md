This PR finalizes the v0.1.0 Dogfood CLI release. It adds MCP integrations, expands bundled templates (GTM, Marketing), packages the CLI for npm, provides the distribution install script, and updates the marketing site to reflect the CLI reality. All 58 tests passing.

## The 6 Pillars of v0.1.0 (Proof of Execution)

### 1. Compliance Verified (The Tests)
**Proof:** `cli/test/integration/jtbd-compliance.test.ts`
We wrote 32 strict integration tests. The suite dynamically validates *every* bundled template against the Zod schema (`WorkflowSchema`) to ensure they all possess a timeout, max tokens, and required companion files (`CLAUDE.md`, `README.md`). We also codified `RB-001` to prove the CLI gracefully handles missing Claude Code binaries.

### 2. Architecture Hardened (Data Sandboxing & Audit Logs)
**Proof:** `cli/src/commands/run.ts`
- **Data Sandboxing Fix:** `executeWithClaude` is now explicitly passed `workspacePath` (the root directory) as its `cwd`, proving Claude can natively access `data/`.
- **Audit Log Fix:** The entire `executeWithClaude` call is wrapped in a strict `try/catch`. The catch block creates a `RunRecord` with `status: "failed"` and calls `appendRun()`, proving hard failures can no longer bypass the `history/runs.jsonl` audit log.

### 3. Documentation Cemented
**Proof:** `docs/adr/002-v0.1.0-architecture.md`
This formal ADR serves as the permanent record. It explicitly documents our "Wrong Ideas" (like throwing early or silent installations) and why we pivoted, cementing the alignment between our DX and Marketing Promises.

### 4. Integrations Built (MCP)
**Proof:** `cli/src/commands/integrations.ts` & `cli/src/core/integrations.ts`
We built the full `dogfood integrations [list|add|remove]` command suite. The core reads the workspace's `.claude.json`, appends the MCP server under the `"mcpServers"` key, and saves it.

### 5. Templates Expanded
**Proof:** `cli/src/templates/`
- **GTM:** Built `gtm-outbound` with a "Challenger Sale" persona and a prompt referencing `data/targets.csv`.
- **Marketing:** Built `marketing-copy` to generate Facebook/LinkedIn ad variations based on `data/specs.md`.
Both are natively bundled and get automatically scaffolded during `dogfood init`.

### 6. Delivery Ready
**Proof:** Distribution scripts and Marketing Site updates
- **The Script:** `cli/scripts/install.sh` handles Node.js version checking and runs `npm install -g @trydogfooding/cli`.
- **The Package:** `cli/package.json` contains `"publishConfig": { "access": "public" }` allowing standard NPM distribution.
- **The Marketing Site:** `marketing-site/src/content/siteContent.ts` natively points to `curl -fsSL get.trydogfooding.com | bash` and `dogfood run cx-triage`.

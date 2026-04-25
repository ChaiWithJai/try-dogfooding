# TryDogfooding Monorepo

**Build the software you wish existed.**

This is the monorepo for [trydogfooding.com](https://trydogfooding.com) — an open source starter kit that lets operators build their own software. The CLI is free and AGPLv3 licensed. Education (workshops, cohorts, membership) is the business; the tool is the distribution.

---

## Repository Structure

```
try-dogfooding/
├── cli/                    # Dogfood CLI (@trydogfooding/cli)
├── marketing-site/         # trydogfooding.com — Vite + React static site
├── docs/                   # Central design doc, feature spec, ADRs
│   ├── central-doc.md      # Root spec — everything compiles from here
│   ├── active-feature-spec.md
│   └── adr/                # Architecture Decision Records
├── output/                 # Playwright test artifacts
├── source-maps-downloader/ # Internal dev tooling
└── .playwright-cli/        # Browser test logs
```

---

## Workloads

### 1. Marketing Site (`marketing-site/`)

The public face at [trydogfooding.com](https://trydogfooding.com). A Vite + React 19 static SPA themed as "The Dogfooding Academy."

| Property | Value |
|---|---|
| **Stack** | Vite 8, React 19, TypeScript 6, react-router-dom 7 |
| **Build command** | `npm run build` (`tsc -b && vite build`) |
| **Output** | `marketing-site/dist/` |
| **Dev server** | `npm run dev` → `http://localhost:5173` |
| **Environment vars** | None (fully static) |
| **Tests** | None currently |

#### Quick start

```bash
cd marketing-site
npm install
npm run dev
```

#### Deployment

The marketing site is a static build with no server-side runtime. Deployment configs exist for **both Vercel and Netlify** (see [Deployment Targets](#deployment-targets) below).

**Production build:**

```bash
cd marketing-site
npm run build    # output → dist/
npm run preview  # local preview of production build
```

---

### 2. Dogfood CLI (`cli/`)

The core product. An open source CLI that sets up Claude Code, scaffolds a workspace, and runs operator workflows against real data.

| Property | Value |
|---|---|
| **Package** | `@trydogfooding/cli@0.1.0` |
| **Stack** | TypeScript 5, Node 20+, Commander, Zod, Chalk, Ora |
| **Build tool** | tsup (ESM, sourcemaps, DTS generation) |
| **Build command** | `npm run build` |
| **Test runner** | Vitest (`test/core/`, `test/integration/`) |
| **Binary** | `dogfood` → `dist/bin/dogfood.js` |
| **License** | AGPL-3.0-or-later |

#### Quick start

```bash
cd cli
npm install
npm run build
npm test            # run all tests
npm run typecheck   # type checking only
npm run dev         # watch mode (rebuild on change)
```

#### Distribution channels

| Channel | Status | Details |
|---|---|---|
| **npm** | ✅ Ready | `npm install -g @trydogfooding/cli` |
| **Install script** | ✅ Ready | `curl -fsSL https://get.trydogfooding.com \| bash` ([source](cli/scripts/install.sh)) |
| **Homebrew tap** | ❌ Not built | Spec'd at `trydogfooding/homebrew-tap` |
| **Signed binaries** | ❌ Not built | Spec'd for GitHub Releases with cosign |
| **Docker image** | ❌ Not built | Spec'd at `ghcr.io/trydogfooding/cli` |
| **SBOM** | ❌ Not built | Required per release guardrails |

#### CLI commands

```
dogfood init [path]              # First-run workspace setup
dogfood doctor [--fix]           # Diagnostics
dogfood run <workflow>           # Execute a workflow
dogfood history                  # View past runs
dogfood history show <id>        # Show run details
dogfood workflow list            # List available workflows
dogfood integrations list|add|remove  # Manage MCP integrations
dogfood help                     # Help
```

All commands support: `--json`, `--verbose`, `--no-color`, `--yes`, `--dry-run`

#### Bundled workflow templates

| Template | Persona | Description |
|---|---|---|
| `cx-triage` | CX | Triage support tickets using Claude Code |
| `gtm-outbound` | GTM | Challenger Sale outbound generation |
| `marketing-copy` | Marketing | Facebook/LinkedIn ad copy variations |

---

### 3. Documentation (`docs/`)

Static markdown specs and architectural records. No doc site — these are read on GitHub or locally.

| Document | Purpose |
|---|---|
| [central-doc.md](docs/central-doc.md) | Root spec — product, positioning, revenue model, brand architecture |
| [active-feature-spec.md](docs/active-feature-spec.md) | Declarative feature spec — CLI architecture, integrations, guardrails, runbooks |
| [ADR-001](docs/adr/001-agplv3-licensing.md) | AGPLv3 licensing decision |
| [ADR-002](docs/adr/002-v0.1.0-architecture.md) | v0.1.0 architecture, tradeoffs, and wrong ideas |

---

## Deployment Targets

### Marketing Site

> ⚠️ **Dual-config warning.** Both Vercel and Netlify deployment configs exist and are linked to live projects. Consolidate to a single target before the next production push.

#### Vercel

- **Project:** `trydogfooding-marketing-site`
- **Root directory:** `marketing-site`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Config:** [`marketing-site/vercel.json`](marketing-site/vercel.json) — SPA rewrite (`/* → /index.html`)
- **Local state:** `.vercel/project.json`

#### Netlify

- **Site ID:** `715db075-4481-42ea-8f78-75446bf95a0e`
- **Base directory:** `marketing-site`
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node version:** 20
- **Config:** [`marketing-site/netlify.toml`](marketing-site/netlify.toml) — SPA redirect (`/* → /index.html` 200)
- **Local state:** `.netlify/state.json`

### CLI

| Target | Status |
|---|---|
| **npm registry** | ✅ Configured (`publishConfig.access: public`) |
| **GitHub Releases** | ❌ No release automation |
| **Homebrew** | ❌ No tap repo |
| **Docker (GHCR)** | ❌ No Dockerfile |

---

## CI/CD Status

**Current state: fully manual.** There are no GitHub Actions workflows, no automated tests on PR, no automated deployments.

### What exists today

| Step | Automation |
|---|---|
| Lint (marketing-site) | Manual — `npm run lint` |
| Type check (CLI) | Manual — `npm run typecheck` |
| Unit/integration tests (CLI) | Manual — `npm test` (58 tests) |
| Build (marketing-site) | Manual — `npm run build` |
| Build (CLI) | Manual — `npm run build` |
| Deploy (marketing-site) | Manual — `vercel deploy` or Netlify git-push |
| Publish (CLI to npm) | Manual — `npm publish` |
| Release signing | ❌ Not implemented |
| SBOM generation | ❌ Not implemented |

### What the spec requires (not yet built)

From [active-feature-spec.md § Release guardrails](docs/active-feature-spec.md):

- [ ] Tests green (unit, integration, supported-OS matrix)
- [ ] Install script tested on clean VM for each supported OS
- [ ] Docker image smoke-tested
- [ ] Release signed (cosign)
- [ ] SBOM published
- [ ] Changelog written in operator-legible language

---

## Git Topology

```
main (8829590)                  ← initial commit
├── feat/desktop-parity-and-content-depth (a133b69)
│     └── marketing site content work
└── release/v0.1.0 (245f48e)   ← current HEAD
      └── CLI v0.1.0 + integrations + templates + packaging
```

**Remote:** `origin` → `git@github.com:ChaiWithJai/try-dogfooding.git`

**Branch strategy:** Feature branches (`feat/*`) and release branches (`release/*`) off `main`. No branch protection rules, no required status checks.

---

## Development Workflow

### Prerequisites

- Node.js 20+
- npm

### Working on the marketing site

```bash
cd marketing-site
npm install
npm run dev         # dev server at localhost:5173
# make changes...
npm run build       # verify production build
npm run lint        # check for lint issues
```

### Working on the CLI

```bash
cd cli
npm install
npm run build       # compile with tsup
npm test            # run vitest suite
npm run typecheck   # TypeScript checks
npm run dev         # watch mode
```

### Running the CLI locally (dev)

```bash
cd cli
npm run build
node dist/bin/dogfood.js init ./test-workspace
node dist/bin/dogfood.js doctor
node dist/bin/dogfood.js workflow list
```

---

## Architecture Decisions

All ADRs live in [`docs/adr/`](docs/adr/):

| ADR | Decision | Date |
|---|---|---|
| [001](docs/adr/001-agplv3-licensing.md) | Adopt AGPLv3 (copyleft strategy against SaaS loophole) | 2026-04-24 |
| [002](docs/adr/002-v0.1.0-architecture.md) | v0.1.0 architecture — subprocess wrapping, JSONL history, Zod validation | 2026-04-25 |

---

## License

AGPL-3.0-or-later — See [LICENSE](LICENSE) for the full text.

The CLI is free forever. No commercial-only features. Education is the business; tools are the distribution.

---

## Links

- **Website:** [trydogfooding.com](https://trydogfooding.com)
- **GitHub:** [ChaiWithJai/try-dogfooding](https://github.com/ChaiWithJai/try-dogfooding)
- **npm:** [@trydogfooding/cli](https://www.npmjs.com/package/@trydogfooding/cli)
- **Contact:** hello@trydogfooding.com

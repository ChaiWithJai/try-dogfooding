# TryDogfooding Monorepo

**Build the software you wish existed.**

This is the monorepo for [trydogfooding.com](https://trydogfooding.com) — an open source starter kit that lets operators build their own software. The CLI is free and AGPLv3 licensed. Education (workshops, cohorts, membership) is the business; the tool is the distribution.

---

## Repository Structure

```
try-dogfooding/
├── .github/workflows/      # CI/CD — GitHub Actions
│   ├── ci.yml              # Lint, typecheck, build, test on PR
│   └── cli-release.yml     # npm publish on cli-v* tags
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

The marketing site deploys to **Vercel** as a static build. No server-side runtime.

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

### Marketing Site → Vercel

- **Project:** `trydogfooding-marketing-site`
- **Root directory:** `marketing-site`
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Config:** [`marketing-site/vercel.json`](marketing-site/vercel.json) — SPA rewrite (`/* → /index.html`)

Vercel auto-deploys from the `main` branch. Preview deploys are created for every PR.

### CLI → npm + GitHub Releases

| Target | Status |
|---|---|
| **npm registry** | ✅ Configured (`publishConfig.access: public`) |
| **GitHub Releases** | ✅ Automated via `cli-release.yml` on `cli-v*` tags |
| **Homebrew** | ❌ No tap repo |
| **Docker (GHCR)** | ❌ No Dockerfile |

---

## CI/CD

### GitHub Actions

| Workflow | Trigger | What it does |
|---|---|---|
| [`ci.yml`](.github/workflows/ci.yml) | PR to `main` or `release/*`, push to `main` | Lint + build (marketing-site), typecheck + build + test (CLI) |
| [`cli-release.yml`](.github/workflows/cli-release.yml) | Push tag `cli-v*` | Full test suite → npm publish → GitHub Release |

### How to release the CLI

```bash
git tag cli-v0.1.1
git push origin cli-v0.1.1
# GitHub Actions handles: typecheck → build → test → npm publish → GitHub Release
```

### What's automated vs not yet

| Step | Status |
|---|---|
| Lint (marketing-site) | ✅ CI on PR |
| Type check (CLI) | ✅ CI on PR |
| Build (both workloads) | ✅ CI on PR |
| Unit/integration tests (CLI) | ✅ CI on PR (58 tests) |
| Deploy (marketing-site) | ✅ Vercel auto-deploy on push to main |
| Publish (CLI to npm) | ✅ On `cli-v*` tag |
| Multi-OS test matrix | ❌ Not yet |
| Release signing (cosign) | ❌ Not yet |
| SBOM generation | ❌ Not yet |
| Docker image | ❌ Not yet |

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

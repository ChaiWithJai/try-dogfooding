# TryDogfooding: Feature Spec

**Status:** Spec v0.2 (declarative)
**This document is the source of truth.** Code, infra, marketing, and events compile from this spec. There are no timelines here — schedules live in the project tracker. This spec describes what is true of the system, not when.

---

## Section 1: Product

```yaml
---
product: TryDogfooding
cli_command: dogfood
cli_alias: trydogfooding
domain: trydogfooding.com

positioning: >
  A starter kit for operators — in CX, GTM, marketing, and back office — who want
  to build their own software instead of waiting for engineering. Open source
  CLI. Live workshops. Project-based cohort. Ongoing membership.

business_shape:
  tool: open source CLI, AGPLv3 licensed, free forever
  revenue:
    - free workshops (top of funnel, no revenue, builds list and community)
    - project cohort (primary revenue, students build together)
    - Cursor for Creatives membership (ongoing revenue, community + continued access)
  what_we_do_not_do:
    - host a multi-tenant SaaS runner
    - store user data
    - process payments for Anthropic API usage (that is Claude Code's relationship)
    - handle compliance or data residency for customer workflows

primary_persona:
  role: back-office operator (CX, GTM, Marketing, Back office)
  technical_floor: cannot install Node from scratch; can follow copy-paste instructions
  success: ships working workflows that save measurable time

dogfooding_principle: >
  Every system and practice we teach, we use. The flagship demonstration is
  Cursor for Creatives — a product we build publicly using TryDogfooding, with
  the cohort participating. Members watch the software get made. Members
  contribute. Members become case studies because they built something real
  alongside us.
---
```

---

## Section 2: Architecture

### 2.1 The CLI

The CLI is the product. It runs on the user's machine. It does not phone home for execution. The user's workflows, data, and credentials never transit our servers.

**Stack:**
- Node 20+ runtime
- TypeScript
- Commander for argument parsing
- Ink for interactive flows where needed
- All workspace state lives in a local git repo the user owns

**What the CLI does:**
- Detects and installs Claude Code if missing
- Sets up MCP integrations for the user's chosen stack (GTM, CX, Marketing, Back office, or custom)
- Scaffolds a local workspace (workflows, templates, prompts, CLAUDE.md files, history)
- Wraps Claude Code invocations with: timeouts, retry with jitter, idempotency hints, structured logging, token budget warnings
- Provides workflow templates as starting points
- Runs workflows on demand (`dogfood run <workflow>`)
- Maintains an append-only run history on disk
- Provides diagnostics (`dogfood doctor`)

**What the CLI does not do:**
- Schedule workflows (users can use cron, launchd, Task Scheduler, or GitHub Actions themselves — we document patterns, not build a scheduler)
- Host workflows
- Share workflows across users (users share via git repos themselves, same as developers do)
- Charge users for usage (they pay Anthropic directly for Claude Code; we don't touch billing)
- Collect telemetry by default (opt-in only, minimal, documented)

**Commands:**

```
dogfood init                    # First-run setup
dogfood doctor                  # Diagnostics
dogfood doctor --fix            # Auto-repair where possible
dogfood integrations list
dogfood integrations add <n>
dogfood integrations fix <n>
dogfood integrations remove <n>
dogfood workflow list
dogfood workflow new
dogfood workflow edit <n>
dogfood workflow remove <n>
dogfood run <workflow>          # Most common command
dogfood history
dogfood history show <run-id>
dogfood upgrade
dogfood help
```

Every command supports `--json`, `--dry-run` where side effects are possible, `--verbose`, `--no-color`, and `--yes` to bypass confirmations.

### 2.2 Distribution

**Primary distribution channels, ordered by expected usage:**

1. **Install script** (`curl -sSL get.trydogfooding.com | sh`)
   - Detects OS, architecture, and Node availability
   - Installs Node via Volta or fnm if needed
   - Installs the CLI globally
   - Verifies install with `dogfood --version`
   - Shows next-step command
   - Signed; script is itself auditable and referenced in docs

2. **Homebrew tap** (`brew install trydogfooding/tap/dogfood`)
   - Mac operators who prefer Homebrew
   - Formula lives in `github.com/trydogfooding/homebrew-tap`
   - Auto-updated on release

3. **npm** (`npx dogfood` or `npm i -g @trydogfooding/cli`)
   - For developers evaluating the tool
   - Published on every release
   - Includes architecture-specific binaries

4. **Direct signed binary downloads**
   - For users who won't run curl pipes (security-conscious enterprises, auditors)
   - Hosted on GitHub Releases
   - Signed with cosign, verification instructions in docs

5. **Docker image** (`ghcr.io/trydogfooding/cli:latest`)
   - Secondary distribution
   - Primary use cases: workshops (guaranteed consistent environment), CI/CD, enterprise approval workflows, reproducibility for debugging
   - Multi-arch (amd64, arm64)
   - Minimal base (distroless-node or Alpine)
   - Entry point is `dogfood`
   - Workspace is a volume mount (`-v $PWD/workspace:/workspace`)
   - Documented in `/docs/docker.md`; not the front-page install option

**Supply chain posture:**
- All releases signed (cosign)
- SBOM generated and published per release
- Dependency pinning; Renovate for updates with human review
- Public incident disclosure policy if supply chain compromise occurs

### 2.3 The workspace

When a user runs `dogfood init`, a workspace is created on their disk. It is a git repo. The user owns it.

```
~/trydogfooding-workspace/          (default path; configurable)
├── README.md                        # Auto-generated; explains layout
├── CLAUDE.md                        # Top-level context for Claude Code
├── workflows/
│   └── <workflow-name>/
│       ├── workflow.yaml            # Declarative spec
│       ├── CLAUDE.md                # Workflow-specific context
│       ├── prompts/                 # Prompt templates
│       ├── outputs/                 # Historical outputs
│       └── README.md
├── data/                            # User's reference data (voice samples, rules)
├── integrations/                    # Auth status per integration (not credentials)
├── history/
│   └── runs.jsonl                   # Append-only log of every run
└── .dogfood/
    ├── config.yaml
    └── version
```

This structure is part of the contract. Workflows are portable between users, between machines, and between versions of the CLI because the on-disk format is stable.

### 2.4 Integrations

Integrations are MCP server configurations bundled and maintained by us for the supported stacks. The CLI:

- Knows how to install each MCP server
- Knows how to initiate auth (OAuth redirect, API key prompt, etc.)
- Knows how to verify credentials with a minimal test call
- Knows how to refresh or re-auth on failure
- Requests least-privilege scopes per integration

**Supported stacks (v1):**

- **GTM:** HubSpot, Attio, Gong, Apollo, Clay, LinkedIn (approved API), Notion, Slack
- **CX:** Zendesk, Intercom, Notion, Slack, Linear
- **Marketing:** Meta Ads, Google Ads, HubSpot, Canva (via MCP), Notion, Webflow
- **Back office:** NetSuite (adapter), Bill.com, Ramp, Gusto

**Supported but unbundled:** any MCP server the user brings themselves. The CLI has an `integrations add --custom <mcp-url>` path.

New stacks and integrations are added based on demand from the cohort and community.

### 2.5 The workflow template format

```yaml
# workflow.yaml
name: <string>
description: <string>
persona: <gtm|cx|marketing|back-office|custom>
stack_requires: [<integration-names>]
claude_code_config:
  allowed_tools: [<tool-patterns>]
  max_tokens_per_run: <integer>
  timeout_seconds: <integer>
inputs:
  - name: <string>
    description: <string>
    default: <value>
outputs:
  - name: <string>
    destination: <destination>
    format: <markdown|json|csv|...>
schedule: null  # users schedule externally (cron, launchd, GitHub Actions)
```

Each template also ships with a CLAUDE.md that instructs Claude Code on how to run the workflow — the prompts, the patterns, the guardrails. Users edit this to teach the workflow their voice and rules.

### 2.6 Probabilistic guardrails

These are the things a user would hand-roll badly if we didn't ship them. They live in the CLI runtime, wrapped around every Claude Code and MCP call:

- **Timeouts** on every call
- **Retry with full jitter** on retriable failures
- **Circuit breaker** per external dependency (per MCP provider)
- **Token budget caps** per workflow (from template config; user-overridable)
- **Idempotency hints** for mutating operations (propagated to MCP calls where supported)
- **Structured logging** with run_id correlation
- **Graceful degradation** — if one MCP provider fails mid-run, the run logs the failure cleanly and either continues (if the template says the step is optional) or halts with a clear recovery path

These are not configurable. They are how the CLI works. Users don't opt in; they get them for free.

### 2.7 Telemetry (opt-in)

**What we collect if the user opts in:**
- CLI version, OS, architecture
- Commands invoked (name only, no arguments)
- Error class names when errors occur
- Aggregate workflow run counts (no workflow names, no data)

**What we never collect:**
- Workflow contents
- User data
- Credentials (obvious but stated)
- Anything personally identifying beyond what's in the opt-in

**How:** first-run prompt asks. Default is off. Can be toggled at any time with `dogfood telemetry on|off|status`.

---

## Section 3: Marketing and events

### 3.1 Marketing site

A static site (Astro or Next.js static export), deployed on Cloudflare Pages or similar. Its job is conversion: from cold visitor to workshop signup, from workshop attendee to cohort enrollee, from cohort graduate to Cursor for Creatives member.

**Surfaces:**
- Homepage
- Manifesto page (the dogfooding thesis)
- Four persona pages (GTM, CX, Marketing, Back office)
- Workshop page (free event signup)
- Cohort page (paid enrollment)
- Cursor for Creatives page (membership)
- Case studies (populated as cohort ships)
- About (creator credentials)
- Docs
- Status page (operational transparency)

Copy and structure live in `trydogfooding-copy.json` and `trydogfooding-hci-spec.json` — the site is a compilation target of those specs.

**Operational requirements:**
- Static rendering; survives viral moments without scaling drama
- Lighthouse: Performance 90+, Accessibility 95+
- Payments via Stripe (workshop free; cohort and membership paid)
- Email collection via existing list (Resend or Loops)

### 3.2 Events

**Free workshops (60 minutes, recurring):**
- Live, monthly or more frequent
- Virtual (worldwide) and occasionally in-person (NYC)
- Format: operator arrives with credentials for one tool + one repetitive task. We pair-build a working workflow live. They leave with software running against their real data.
- This is where we show operators how to set up Claude Code, run `dogfood init`, and make their idea real.
- Success metric: attendee ships one workflow during the session.

**Project cohort:**
- Four weeks
- Capped small (20)
- Live sessions twice per week (recorded)
- Office hours weekly
- Cohort community during the four weeks
- Project: each student ships three workflows against their real stack; the group collectively contributes to building Cursor for Creatives in public
- Refund through week 2, no questions asked
- Outcome: three workflows, measurable time savings, case study draft, path to Cursor for Creatives membership

### 3.3 Cursor for Creatives

**What it is:**

A paid membership that gives ongoing access to:
- The Cursor for Creatives product (built publicly, using TryDogfooding, with the cohort's participation)
- Ongoing community of practicing operators and creatives
- New workflow templates as we build them
- Office hours and group coaching
- Early access to new integrations and features
- The project-based curriculum — learning by shipping with the group

**What it isn't:**
- A SaaS we host for members
- A done-for-you consulting arrangement
- Cursor-the-company-from-Anysphere; the name riffs on their positioning but we're addressing a different audience

**Why "Cursor for Creatives" as the dogfooded product:**

Cursor has proven that a well-designed AI-native tool can command premium pricing and deep loyalty from developers. The equivalent product does not exist for creatives and operators. They want the Cursor-level experience for their kind of work — writing, designing, creating, running their business — without being developers. The cohort builds this product with us, which makes them both the first users and the demonstration of the methodology.

**Membership shape:**
- Monthly or annual pricing (to be validated)
- Includes all future cohorts at discounted or included rates
- Members are the distribution engine — case studies, testimonials, word-of-mouth
- Builds into a community flywheel

### 3.4 Revenue model summary

- **Open source CLI** — free, forever, AGPLv3
- **Workshops** — free, lead generation
- **Project cohort** — paid, primary introduction revenue
- **Cursor for Creatives membership** — paid, ongoing recurring revenue
- **Enterprise / bespoke** — not yet; arrives if/when a company wants to roll this out to their team; priced case-by-case

---

## Section 4: Rules

### Technical rules (what we ship)

1. The CLI works on macOS, Linux, and Windows (WSL minimum). Windows native support is roadmap, not launch.
2. The CLI has zero runtime services it depends on. Every external call the CLI makes at runtime is to Claude Code or an MCP server the user has authorized.
3. Credentials are never in our code, our logs, our telemetry, or our infrastructure. They live in OS keychains or Claude Code's credential store.
4. Every external call has a timeout, a retry policy with jitter, and a circuit breaker. No exceptions.
5. Every mutating operation is idempotent where the target supports it; where it doesn't, the template warns the user.
6. Every workflow run produces an auditable record on disk (run_id, inputs, prompts, MCP calls, outputs, tokens, timing).
7. Every user-facing error has a next-step. No raw stack traces.
8. Every release is signed. Every release has an SBOM.
9. No analytics or telemetry is collected by default. Opt-in only, minimal, documented.
10. The workspace on-disk format is stable across minor versions. Breaking changes bump major version and include a migration path.

### Product rules

1. The operator is not a developer. No jargon. No "just" or "simply." No assumption of CLI fluency beyond what we teach.
2. Defaults are safe; overrides are explicit.
3. The happy path is one command.
4. Setup failures are our fault.
5. No feature ships without a teaching path (covered in workshop or cohort).
6. Every paid tier delivers value on its own — workshop stands alone, cohort stands alone, membership stands alone.
7. Content, error messages, and documentation are reviewed with the same rigor as code.

### Business rules

1. Education is the business. Tools are the distribution.
2. Open source stays open source. No commercial-only CLI features.
3. Cursor for Creatives is the dogfooded product. What we ship to members, we build using the same tools and methodology we teach.
4. Community comes before conversion.
5. Case studies are earned and authentic. No composites, no paid testimonials, no fabrication.

---

## Section 5: Guardrails

Enforced in tooling so they're not optional.

### CLI guardrails

- Every command supports `--json`, `--dry-run`, `--verbose`, `--no-color`, `--yes`.
- Every destructive command requires confirmation.
- Every command has documented exit codes.
- Claude Code invocations are wrapped with timeout, token budget, circuit breaker.
- MCP calls are wrapped with retry + jitter, per-provider circuit breakers.
- Setup cannot report "success" without a successful end-to-end verification.
- Workflow templates are versioned.

### Release guardrails

- Tests green (unit, integration, supported-OS matrix).
- Install script tested on clean VM for each supported OS.
- Docker image smoke-tested.
- Release signed.
- SBOM published.
- Changelog written in operator-legible language.

### Marketing / events guardrails

- Static site tested with 20x baseline traffic before launches.
- Workshop minimum viable cohort = 6; below that, merge or refund.
- Every cohort has an instructor plus a coordinator (two-person rule).
- Refunds honored per stated policy, no friction.

---

## Section 6: Runbooks

Only the ones that still matter.

### RB-001: User's first-run setup fails

**Trigger:** `dogfood init` exits before completing verification.

**Diagnosis order:**
1. Is Claude Code installed and authenticated?
2. Is the user's network able to reach Anthropic?
3. Did the MCP server installs succeed?
4. Did the verification workflow run?

**Resolution paths:**
- Claude Code missing → install via bundled path; manual fallback
- Network → clear message, no retry loop, retry instructions
- MCP failures → mark pending, allow retry, continue init with warning
- Verification failure → surface exact error, offer verbose mode and docs link

**Escalation:** three users hitting the same failure within 24 hours is a P0 bug. Hotfix within 48 hours.

### RB-002: Install script or package fails in the wild

**Trigger:** published install script or npm package fails on clean install for a supported OS.

**Diagnosis order:**
1. Did we publish a broken release?
2. Is npm / Homebrew / GitHub Releases degraded?
3. Is a dependency compromised or yanked?

**Resolution:**
- Broken release → yank, publish patch, pin users to last good version
- Registry outage → status page update, docs with alternate install paths
- Dependency issue → investigate supply chain, disclose if needed

**Escalation:** immediate. Broken installs are brand-critical.

### RB-003: Cohort student can't ship

**Trigger:** student hasn't run a successful workflow by end of week 2.

**Diagnosis order:**
1. Did they complete setup?
2. Are they attending sessions?
3. Is their stack outside our supported integrations?
4. Conceptual or technical block?

**Resolution:**
- Setup incomplete → prioritize in office hours
- Low attendance → outreach, explicit invitation
- Stack mismatch → pair with closest template, build custom if needed
- Conceptual block → 1:1 coaching

**Escalation:** instructor intervenes directly in week 3. Nobody finishes without shipping or an explicit acknowledgement of why.

### RB-004: Event or launch traffic spike

**Trigger:** traffic spike >10x baseline on marketing site, signup flow, or CLI install path.

**Diagnosis order:**
1. Static site serving correctly?
2. Stripe / email signup functioning?
3. npm / GitHub / Homebrew responsive for CLI installs?
4. Community platform handling load?

**Resolution:**
- Site → cache aggressively, ensure static rendering
- Signup → rate-limit gracefully, queue rather than drop
- CLI install → status banner if any registry slow
- Community → standard load handling; not typically a bottleneck

**Escalation:** traffic spikes are good news. The runbook is to stay up and catch them.

### RB-005: Supply chain incident

**Trigger:** suspected compromise of published package, install script, or Docker image.

**Diagnosis order:**
1. Scope: what's compromised, for what duration?
2. Vector: how did it happen?
3. Status: is it ongoing?

**Resolution:**
- Yank affected artifacts
- Publish known-good versions
- Notify community channels immediately
- Full disclosure postmortem within 30 days
- Rotate signing keys and credentials

**Escalation:** this is the most serious class. Everything else pauses.

---

## Section 7: Feature inventory

### 7.1 Core CLI

Must be present for the tool to be useful.

- `dogfood init` end-to-end for macOS, Linux, WSL
- `dogfood doctor` with at least: node, git, Claude Code, network, Anthropic API, workspace, integration health checks
- `dogfood run <workflow>` with progress, status, outcome, token cost
- `dogfood history` for viewing past runs
- `dogfood workflow list|new|edit|remove`
- `dogfood integrations list|add|fix|remove`
- `dogfood upgrade`
- `dogfood help` with contextual help per command

### 7.2 Integrations

At v1, supported out of the box:

- GTM: HubSpot, Attio, Gong, Apollo, Clay, Notion, Slack
- CX: Zendesk, Intercom, Notion, Slack, Linear
- Marketing: Meta Ads, Google Ads, HubSpot, Canva, Notion, Webflow
- Back office: NetSuite, Bill.com, Ramp, Gusto

Plus `--custom <mcp-url>` for any MCP the user brings.

### 7.3 Workflow templates

At v1, ship with at least five templates per stack (20 total). Each template includes:
- `workflow.yaml` with declarative spec
- `CLAUDE.md` with patterns and voice guidance
- `prompts/` directory with starter prompts
- `README.md` with description, expected inputs, expected outputs

### 7.4 Distribution artifacts

- Install script at `get.trydogfooding.com`
- Homebrew tap at `github.com/trydogfooding/homebrew-tap`
- npm package `@trydogfooding/cli` and alias `dogfood`
- Signed binaries on GitHub Releases for macOS (arm64, x64), Linux (arm64, x64), Windows (x64)
- Docker image `ghcr.io/trydogfooding/cli:latest` plus versioned tags, multi-arch
- SBOM per release
- Cosign signatures per release

### 7.5 Marketing site

- Homepage, manifesto, four persona pages, workshop, cohort, Cursor for Creatives, case studies (empty initially), about, docs, status
- Stripe integration for paid enrollment
- Email collection integrated with list provider
- Blog or post section for manifesto extensions and case studies

### 7.6 Event infrastructure

- Workshop signup via Eventbrite or direct
- Cohort enrollment via Stripe
- Cursor for Creatives membership via Stripe subscription
- Calendar integration for session invites
- Community platform (Circle, Discord, or self-hosted — decision pending)
- Recording and post-session delivery
- LMS for asynchronous cohort content (existing: teach.chaiwithjai.com; may migrate)

### 7.7 Cursor for Creatives (the product we dogfood)

Built publicly during and after the cohort. Feature inventory lives in its own spec. This spec commits only to:
- It is built using TryDogfooding (the CLI, the workflow templates, the methodology).
- It is built publicly — members see the software get made.
- It is the demonstration that the methodology produces real software.

---

## Section 8: What we explicitly do not build

Worth being explicit so scope doesn't creep.

- A hosted runner, a queue, or scheduled execution infrastructure
- Multi-tenant SaaS features (team workspaces, admin consoles, audit logs at our perimeter)
- Billing for Anthropic API usage (Claude Code owns that relationship)
- Compliance certifications (SOC2, HIPAA, etc.) — revisit if enterprise demand emerges
- A marketplace for user-contributed workflows — may emerge organically via GitHub
- Our own model or runtime — we build on Claude Code
- A mobile app — the CLI is not a mobile product
- A web-based workflow editor — workflows are edited in the user's editor of choice (Cursor, VS Code, etc.)

---

## Section 9: Open decisions

Things that are unresolved and need a call.

- **Community platform** — Circle vs Discord vs self-hosted. Trade-offs between polish, cost, and control.
- **Cursor for Creatives pricing model** — monthly, annual, lifetime, tiered. Needs validation with target audience.
- **Homebrew tap vs direct binary vs both as default for Mac** — pending testing with first workshop cohort.
- **Whether to bundle a TUI (terminal UI) or stay command-and-output** — adds install complexity; adds ergonomic value. Decide after first workshop feedback.
- **Telemetry provider if we add opt-in telemetry** — PostHog, Plausible, or self-hosted minimal. Decide before first public release.
- **Documentation hosting** — Astro site integrated with marketing, or separate docs platform (Mintlify, etc.). Lean toward integrated.
- **Windows native support timing** — WSL works; native is meaningful lift. Revisit when Windows user demand is clear.

---

## Section 10: The dogfooding commitment

Everything in this spec applies to Cursor for Creatives as well. We build it using TryDogfooding. We hit the same quality bars. We follow the same rules. Our errors have the same voice. Our releases have the same supply chain posture.

If we ever find ourselves skipping a practice for our own product that we'd teach a member to follow, that's a signal that either the practice is wrong or we're taking a shortcut we shouldn't. Fix one or the other. Do not publish until they match.

The cohort and the membership watch us build. That's the point. The distance between what we teach and what we do is zero.
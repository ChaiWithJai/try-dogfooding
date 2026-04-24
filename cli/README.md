# Dogfood CLI

**Build the software you wish existed.**

Dogfood is an open source CLI that lets operators build their own software. It sets up Claude Code, scaffolds a local workspace, and ships with workflow templates specific to your role.

## Quick start

```bash
# Install (npm)
npm install -g @trydogfooding/cli

# Initialize your workspace
dogfood init

# Check your setup
dogfood doctor

# See available workflows
dogfood workflow list

# Run a workflow
dogfood run cx-triage

# View past runs
dogfood history
```

## Commands

| Command | Description |
|---------|-------------|
| `dogfood init [path]` | Set up your workspace |
| `dogfood doctor [--fix]` | Check your setup for issues |
| `dogfood run <workflow>` | Run a workflow |
| `dogfood history` | View past workflow runs |
| `dogfood history show <id>` | Show details for a specific run |
| `dogfood workflow list` | List available workflows |
| `dogfood help` | Show help |

### Global options

All commands support:
- `--json` — Output results as JSON
- `--verbose` — Show detailed output
- `--no-color` — Disable colored output
- `--yes` — Skip confirmations
- `--dry-run` — Preview without executing (where applicable)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Type check
npm run typecheck

# Watch mode (rebuild on change)
npm run dev
```

## License

AGPL-3.0-or-later — See [LICENSE](../LICENSE) for details.

The CLI is free forever. No commercial-only features. Education is the business; tools are the distribution.

## Learn more

- **Website:** [trydogfooding.com](https://trydogfooding.com)
- **Workshops:** Free 60-minute live sessions
- **Cohort:** Project-based, four weeks, ship real software

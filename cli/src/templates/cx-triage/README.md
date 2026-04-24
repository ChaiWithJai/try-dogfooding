# CX Triage Workflow

Triage customer support tickets — categorize by urgency, draft responses,
and surface patterns.

## What it does

This workflow analyzes your support ticket data and produces a triage report with:

- **Urgency categorization** (critical, high, medium, low)
- **Topic tagging** (billing, technical, feature-request, etc.)
- **Draft responses** for the most urgent tickets
- **Pattern detection** — recurring issues, spikes, trends

## Getting started

1. Export your recent tickets as a CSV file
2. Place the CSV in your workspace's `data/` directory
3. Run: `dogfood run cx-triage`

### Expected CSV format

Your CSV should have these columns (order doesn't matter):

| Column | Required | Description |
|--------|----------|-------------|
| id | Yes | Ticket ID |
| subject | Yes | Ticket subject line |
| body | Yes | Ticket body text |
| created_at | No | When the ticket was created |
| customer_email | No | Customer's email |
| status | No | Current ticket status |

## Integrations

This workflow works standalone with CSV exports. No integrations required.

Future versions will support direct connections to Zendesk, Intercom, and
other ticketing systems via MCP integrations.

## Customization

Edit `CLAUDE.md` to:
- Adjust the urgency criteria for your team
- Change the output format
- Add your team's voice/tone guidelines
- Include common response templates

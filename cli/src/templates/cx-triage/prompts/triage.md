# CX Ticket Triage

Analyze the support tickets in this workspace and produce a triage report.

Look for ticket data in:
- CSV files in the `data/` directory
- Any `.csv` files in the current workflow directory
- Text pasted directly in previous conversation context

For each ticket, determine:
1. **Urgency**: critical (customer blocked, revenue impact), high (frustrated, escalation risk), medium (needs attention today), low (can wait)
2. **Topic**: billing, technical, feature-request, account, other
3. **Sentiment**: positive, neutral, negative, angry

Then write the full triage report as specified in the CLAUDE.md instructions.

# ADR-001: Adopt AGPLv3 Licensing (The "Copyleft" Strategy)

**Date:** 2026-04-24
**Status:** Accepted
**Decision Maker:** Jai Bhagat

## Context

TryDogfooding is an open-source CLI tool that sets up Claude Code for operators. The project needs a license that:

1. Keeps the tool genuinely free and open source
2. Prevents the "SaaS loophole" — where a company takes the code, modifies it, runs it as a hosted service, and never shares improvements back
3. Signals to our community that openness is a commitment, not a marketing angle
4. Protects the project's long-term viability without restricting individual operators from using it however they want

## Decision

We adopt the **GNU Affero General Public License v3 (AGPLv3)** for all TryDogfooding source code.

### What AGPLv3 does

The AGPL is the standard open-source weapon against the "SaaS loophole."

Under a normal GPL, if someone runs your code on their server and sells access (SaaS), they don't have to share their changes because they're not "distributing" the software. **The AGPL changes this**: it says "interacting with the software over a network" counts as distribution.

### The catch (and why it's a feature)

It doesn't stop people from competing — it just forces them to release their entire backend source code if they modify ours. For many companies, this "poison pill" is enough to scare them off from building a proprietary SaaS on top of TryDogfooding without contributing back.

### What this means for operators

- **Individual operators**: Zero impact. You can use the CLI on your machine, modify it, build whatever you want. The AGPL only triggers when you offer _network access to a modified version_ as a service.
- **Teams running the CLI internally**: Zero impact. Internal use is not distribution.
- **Companies building a hosted SaaS on top of TryDogfooding**: Must open-source their modifications. This is the intended deterrent.

## Alternatives Considered

### MIT License (previous default)
- **Pro**: Maximum permissiveness, lowest friction for adoption.
- **Con**: Allows any company to fork, modify, and sell as closed-source SaaS. We'd build the tool, someone else would monetize it without contributing back.

### GPLv3
- **Pro**: Strong copyleft for distributed software.
- **Con**: Doesn't cover the SaaS loophole. A company could run our code server-side and never share changes.

### BSL (Business Source License) / SSPL
- **Pro**: Explicit SaaS protection.
- **Con**: Not OSI-approved. Creates confusion about whether we're "really" open source. Contradicts our positioning.

### Dual License (AGPL + Commercial)
- **Pro**: AGPL for community, commercial license for companies that want proprietary usage.
- **Con**: Adds complexity. Revisitable later if demand warrants it, but not needed at launch.

## Consequences

### Positive
- The CLI stays free and open forever — this is now enforceable, not just a promise
- SaaS competitors must contribute modifications back to the community
- Aligns with our manifesto: "Everything we teach gets used on our own product in public"
- Trust signal for operators: the tool can't be rug-pulled into a proprietary product

### Negative
- Some corporate legal teams are wary of AGPL dependencies (even when it doesn't apply to their use case)
- Contributions from corporate employees may require legal review on their side
- Perception risk: some developers conflate AGPL with "not really free"

### Mitigations
- Clear documentation in README, UX-copy, and marketing site explaining what AGPL means for operators vs. SaaS providers
- FAQ entry addressing the most common concern: "Can I use this at work?" → Yes, internal use is fine
- Copyright line updated across all surfaces to reference AGPLv3

## References

- [GNU AGPLv3 Full Text](https://www.gnu.org/licenses/agpl-3.0.en.html)
- [FSF FAQ on AGPL](https://www.gnu.org/licenses/gpl-faq.html#AGPLv3InteractingRemotely)
- [OSI Approval of AGPLv3](https://opensource.org/licenses/AGPL-3.0)

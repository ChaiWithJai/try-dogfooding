# Dogfood: Central Design Document

**Status:** v0.3
**Product:** Dogfood
**Domain:** trydogfooding.com
**Positioning shorthand (tech audiences only):** "Cursor for Creatives"
**Owner:** Jai

This document is the root spec. Everything else — feature specs, HCI specs, copy, code, marketing — compiles from here.

---

## TL;DR

**Dogfood is an open source starter kit that lets operators build their own software.** Operators run workshops, take a project-based cohort, and join an ongoing membership — all organized around the thesis that the people closest to the work should be the ones building the software for it.

**The domain is trydogfooding.com**, which carries the positioning in the URL. The invitation is in the address bar.

**For technical audiences**, Dogfood is "Cursor for Creatives." This phrase never appears on the marketing site. It exists for investor conversations, tech Twitter, podcast intros, developer word-of-mouth — situations where the listener already knows Cursor and needs to place this in their mental model in three seconds. For the target consumer, who's a marketing lead or a CX manager, "Cursor for Creatives" means nothing. For a VC, it means everything.

**The thesis** is that good software comes from people who use what they build, and AI collapses the distance between thinking and making to the point where the operator can finally be the builder. Dogfood is the starter kit that makes it practical.

**The dogfooding commitment** is the product's identity. We build Dogfood in public using Dogfood. Members watch the software get made. The distance between what we teach and what we do is zero.

---

## Product architecture

### What Dogfood is

An open source CLI, MIT licensed, installable via one command. It sets up Claude Code for the user, connects their existing stack (HubSpot, Zendesk, Meta Ads, NetSuite, and so on), scaffolds a local workspace, and ships with workflow templates specific to their role. The user types `dogfood run triage-tickets` and their software runs against their real data, on their machine, in their voice.

### What Dogfood is not

A hosted service. A multi-tenant SaaS. A data processor. A payment processor for Anthropic API usage. A developer tool pretending to be for operators. A no-code approximation of real software.

### The three customer-facing surfaces

**The CLI.** The deepest surface. Where the software actually runs. Operators spend hours here once onboarded.

**The marketing site at trydogfooding.com.** The shallowest surface. Conversion from awareness to workshop signup to cohort enrollment to membership.

**Events — workshops, cohorts, the membership community.** The human layer. Where operators learn, where they commit, and where they stay.

There is no web client in v1. Scheduling, team sharing, audit logging at the platform level — all deferred. Users who want scheduled workflows use cron or GitHub Actions themselves; we document the pattern.

### How operators discover and enter

1. They hear about Dogfood from content, podcast, or peer
2. They visit trydogfooding.com
3. They see their role on a persona page (GTM, CX, Marketing, Back office)
4. They sign up for a free 60-minute workshop
5. They attend live; pair-build one workflow against their real data
6. They leave with working software on their machine
7. Some meaningful percentage enroll in the project-based cohort
8. Cohort grads join the ongoing membership

Every step is intentional. The workshop is free because the first working workflow is the conversion event — once they've seen their own data flow through their own software, they understand. Nothing sells like that moment.

---

## The dogfooding commitment

The product is named after its own methodology on purpose.

In engineering, "dogfooding" means using what you build. It's the mark of a team that believes in its product. For decades, operators have been the recipients of software built by people who don't do their job. Dogfood inverts that: the operator becomes the builder for their own workflows.

We live the commitment by building our own flagship product — described below — in public, using Dogfood, with the cohort's participation. Members watch each decision, each workflow we build for ourselves, each mistake we make and recover from. The project-based curriculum is not abstract; it's real work, on a real product, shipping in real time.

If we ever skip a practice for our own product that we'd teach a member to follow, either the practice is wrong or we're cutting a corner. We fix one or the other. The distance stays zero.

---

## Positioning

### For the operator (the customer)

The marketing site speaks only in operator language. Their role, their tools, their scenarios. The word "Cursor" does not appear. The phrase "AI-powered" does not appear. The headline is **"Build the software you wish existed."** The manifesto is **"Eat your own cooking."** The cohort is **"The Dogfooding Cohort."** The membership is **Dogfood membership.**

The operator needs to know: this is for my role, it works with my tools, I'll leave the workshop with something working, and it won't require me to become a developer. Everything on the site exists to make those four things obvious in under 30 seconds.

### For techies and investors (explanation, not positioning)

When the audience already lives in technical vocabulary, the explanation compresses to:

> "Dogfood is Cursor for Creatives. Cursor proved that an AI-native tool can command premium pricing and deep loyalty from developers. The equivalent doesn't exist for the rest of the knowledge-work population — marketers, customer-experience leads, GTM operators, back-office pros. They want Cursor-level tooling for their work. Dogfood is that."

The phrase works because it's dense: it implies the category (AI-native productivity tool), the market (creative and operational knowledge workers), the business model (premium, loyalty-driven), and the comp (Cursor, Anysphere's rocket-ship growth). A VC hears it and immediately has a mental valuation framework.

**Where the shorthand lives:**
- Investor decks
- Accelerator applications
- Tech podcast appearances
- Developer-facing blog posts about our architecture
- Conversations with engineers evaluating the open source CLI

**Where it never lives:**
- The marketing site (trydogfooding.com)
- The workshop
- The cohort curriculum
- Emails to operators
- Persona pages
- Case studies

The two vocabularies are kept separate on purpose. A marketing operator reading about "Cursor for Creatives" would be confused and feel talked-past. A VC reading "build the software you wish existed" without the comp needs a longer pitch and still might not place the category.

### Trademark and legal note

"Cursor" is a trademark of Anysphere. Using "Cursor for Creatives" as a positioning shorthand in conversation, decks, and press is descriptive fair use in most jurisdictions. Using it as a product name, on the marketing site, on packaging, or in a way that creates consumer confusion is not. The strict separation above is not just a positioning choice — it's a legal one. Review with counsel before any public materials that reference it.

---

## The flagship product we build in public

To make the dogfooding commitment real, we need a flagship. A real product, built in public, using Dogfood, with the cohort's participation. The audience watches the software get made. The cohort contributes. The members become case studies because they built something real alongside us.

**The flagship is deliberately under-specified in this document.** The decision of what to build is itself part of the cohort. We'll have a candidate shortlist (outreach engine, cohort-ops tool, content-production pipeline, and two or three others) and the first cohort chooses in week one. Whatever they pick, we build together, using Dogfood.

**Why it's not pre-decided:**

1. Predetermined flagship undercuts the cohort's agency. The point is that the people closest to the work build the software for it. If we arrive with the product already scoped, we've violated the thesis.
2. We don't know our first cohort yet. What they pick will depend on who they are. That's correct.
3. The flagship is a vehicle, not an end. What matters is that we build something real, not what specifically.

**What is pre-decided:**

- The flagship is built using Dogfood. No exceptions. If Dogfood can't build it, the flagship is wrong or Dogfood is missing a capability, and we fix accordingly.
- The flagship is built in public. Members see commits, runs, decisions, mistakes, recoveries. We stream the build or at least document it in weekly devlogs.
- The flagship becomes a case study, not a spin-out. If it turns into something monetizable on its own, that's a separate conversation with the cohort members who helped build it.

---

## Revenue model

**Four revenue surfaces, arranged as a ladder:**

1. **Free workshops.** No revenue, substantial lead generation. One 60-minute live session. Operator leaves with one working workflow.
2. **The Dogfooding Cohort.** Paid, four weeks, capped cohort size. Primary introduction revenue. Students ship three workflows against their real stack and participate in building the flagship.
3. **Dogfood membership.** Paid, ongoing. Access to the community, new workflow templates, office hours, new cohorts at a discounted or included rate, and the ongoing build of the flagship product.
4. **Bespoke / team deployments.** Not productized. Arrives if a company wants Dogfood rolled out to their team; priced case-by-case.

The CLI itself is free forever. No commercial-only features. No paywall. The open source tool is the distribution engine; education and community are where we monetize.

**What this is not:**

- Not a SaaS subscription for running Dogfood. The user's machine runs Dogfood.
- Not a consulting arrangement. Cohorts are cohorts. Consulting, if it happens, is separate and rare.
- Not a marketplace for user-contributed workflows. Those live on GitHub and get community-indexed organically.

---

## Brand architecture

```
Product name:       Dogfood
CLI command:        dogfood  (primary)
                    trydogfooding  (alias)
Domain:             trydogfooding.com
Social handles:     @trydogfooding (where available)
GitHub org:         trydogfooding
npm scope:          @trydogfooding
Docker registry:    ghcr.io/trydogfooding
Support email:      hello@trydogfooding.com
Creator email:      jai@trydogfooding.com

Manifesto:          "Eat your own cooking."
Tagline (consumer): "Build the software you wish existed."
Positioning (tech): "Cursor for Creatives."
```

**On naming choices:**

*Dogfood* is short, memorable, has internal meaning. Operators type it dozens of times a day. A one-word product name is a gift.

*trydogfooding.com* carries the invitation. "Try dogfooding" is a verb phrase that tells you what to do. The URL is the call to action.

*The Dogfooding Cohort* is tighter than "Personal Software Revolution." On-brand. Operational not aspirational.

*"Cursor for Creatives"* is a comp, not a name. Comps compress pitches. The mistake would be to put it on the marketing site.

---

## The journey — how Dogfood gets built in public

This is the part that makes the dogfooding commitment more than a slogan. The journey is itself a product surface. It's content, it's distribution, it's proof, and it's accountability all at once.

### The founding journey (before first cohort)

**What we build before anyone else is involved:**

- The CLI, working end-to-end on at least one OS with at least one integration stack
- The install script, tested on clean VMs
- A minimum set of workflow templates (five per persona, four personas, 20 total)
- The Docker image as fallback distribution
- The marketing site at trydogfooding.com
- The manifesto page
- The workshop script — a repeatable 60-minute format
- The cohort curriculum — four weeks of structured content
- A private beta of 3-5 operators who've run the full init flow and shipped a workflow

**What we document as we go:**

- Every decision that shaped the tool, with reasoning
- Every failure mode we encountered and how we fixed it
- Every opinionated default and why we chose it
- The supply chain posture (signing, SBOMs, dependency review) as a public commitment

The founding journey is documented as a series of devlogs, published on the blog, with honest narration. Not "look how smoothly this went" — the opposite. "Here's where the install script broke on Ubuntu 22.04 for five hours." Developer trust is earned through specificity about failure.

### The flagship journey (with the first cohort)

**Week zero: selection.** The cohort reviews candidate flagship concepts (three to five options, each outlined in a one-pager). They vote or consense. The flagship is chosen.

**Weeks one through four: build.** Each live session includes live work on the flagship, using Dogfood. Students see the workflow definitions, the prompts, the integrations, the failures. They contribute — not all code, but observations, test cases, critique, their own parallel workflows for their stacks that inform the main product.

**Post-cohort: continued build.** Members (graduated cohort plus new joiners) continue watching and contributing. Weekly async devlogs. Monthly synchronous "build day" sessions.

**Case studies emerge naturally.** A member who contributed a specific workflow, who had a specific outcome, who shipped a specific thing becomes a case study. Named. Quoted. Specific. No composites.

### What public building looks like operationally

- Every commit to the flagship product is public (GitHub).
- Every workflow we run to build it has its runs/history posted (with any sensitive data redacted — we dogfood the redaction patterns too).
- Every architectural decision is an ADR committed to the repo.
- Every failure mode we hit shows up in the devlog.
- Every cohort session that touches the flagship is recorded and indexed.
- A quarterly "state of Dogfood" post covers what's shipped, what broke, what we learned, what's next.

**The point is not transparency for its own sake.** The point is that an operator evaluating whether to join the cohort can read the journey, see specific weeks of mistakes and recoveries, and trust that we're not selling magic. We're selling a practice. The practice looks like this. Here's the evidence.

---

## Governance and the dogfooding loop

The most important structural decision in this document is the feedback loop. When Dogfood members build workflows for themselves, and we build the flagship using Dogfood, two streams of learning emerge:

1. **Member friction** — what breaks for operators in the wild
2. **Our friction** — what breaks for us as we build the flagship

Both streams feed into the CLI, the templates, the curriculum, and the docs. The loop is formalized:

- Every cohort session has a 10-minute "what broke" segment. Students name specific failures. Logged.
- Our weekly devlogs include a "what broke" section mirroring the same format.
- Both streams roll up into a public issue tracker. Community can see and upvote.
- Priority for new features comes from the tracker, weighted by cohort impact and flagship impact.

This makes Dogfood's roadmap legible. It also makes the dogfooding commitment self-enforcing: if our flagship build doesn't drive CLI improvements, we're not really using the tool. If it does, the tool gets better because we use it.

---

## Relationship to existing surfaces

Dogfood does not need to claim Jai's existing brand ecosystem to work. The creator's credentials — HashiCorp, Parsons, teaching experience — exist as trust signals on the About page and nowhere else. The Chai With Jai YouTube channel, Prompt Clinic community, Cash Is Clay consulting arm, and BWAI collaboration are all real and continuing, but they are not load-bearing for Dogfood's positioning to the customer.

Internally, the relationships are:

- **Chai With Jai** is Jai's teaching brand. Dogfood content can syndicate there (and vice versa).
- **Prompt Clinic** may become the Dogfood community, or remain separate — decision pending based on member feedback.
- **Cash Is Clay** handles bespoke consulting engagements for Dogfood team deployments that don't fit the cohort model.
- **BWAI** is a distribution channel for female operators who might become Dogfood members.

None of these appear on trydogfooding.com as primary framing. They may appear on the About page as context. The customer-facing story is Dogfood alone.

---

## What we don't build

Scope discipline is often better codified as a "not" list than a "yes" list.

- A hosted, multi-tenant SaaS runner
- Scheduled workflow infrastructure (users use cron, launchd, or GitHub Actions)
- A team workspace product (until Dogfood memberships reveal it as a need)
- Billing or payment surface for Anthropic API usage
- Compliance certifications (SOC2, HIPAA) — revisit if/when enterprise demand emerges
- A mobile app
- A web-based workflow editor
- Our own LLM or runtime — we build on Claude Code
- A marketplace for user-contributed workflows
- Consulting as a productized offering — Cash Is Clay handles that
- White-label or reseller programs

---

## Rules

Short list. Non-negotiable.

1. The CLI runs on the user's machine. Their credentials, their data, their tools never transit our infrastructure.
2. Every release is signed. Every release has an SBOM. Supply chain integrity is non-negotiable.
3. Every user-facing error has a next-step. No raw stack traces. No blame.
4. Open source stays open source. The CLI gets no commercial-only features, ever.
5. Education is the business. Tools are the distribution.
6. Case studies are authentic and specific. Named people, real outcomes, no composites.
7. The flagship is built using Dogfood. No exceptions.
8. We publish when we're ready, not when we're promised. Timelines do not bind artifacts.
9. Every practice we require of members, we model in public.

---

## Open decisions

Things that are unresolved and worth naming.

- **Community platform** — Circle, Discord, or self-hosted. Decide before first cohort.
- **Cursor for Creatives comp** — trademark-clear after legal review before public use in investor materials.
- **Flagship candidates** — produce three to five one-pagers for first cohort to choose from.
- **Pricing for the membership** — monthly vs annual vs lifetime. Validate with first cohort cohort before launch.
- **Whether the community lives under Prompt Clinic brand or separate Dogfood community** — decide based on existing community sentiment.
- **Documentation hosting** — integrated with marketing or separate (Mintlify-style).
- **Workshop cadence** — monthly is the floor; weekly may be viable once established.
- **Windows native support** — WSL works now; native is meaningful lift for a population we haven't sized.

---

## The one-sentence summary

**Dogfood is an open source starter kit at trydogfooding.com that lets operators build their own software — and to technical audiences, it's Cursor for Creatives.**

---

## What this document compiles into

- The feature spec (`trydogfooding-spec.md`) — declarative architecture
- The HCI spec (`trydogfooding-hci-spec.json`) — surfaces, JTBD, paths
- The copy JSON (`trydogfooding-copy.json`) — every user-facing string
- The manifesto page (on the marketing site) — the thesis, public
- The devlog feed (on the blog) — the journey, public
- The investor one-pager (private, with the Cursor comp)
- The cohort curriculum (weeks 1-4 modules)
- The workshop script (repeatable 60-minute format)
- The flagship candidate one-pagers (three to five options, for first cohort selection)
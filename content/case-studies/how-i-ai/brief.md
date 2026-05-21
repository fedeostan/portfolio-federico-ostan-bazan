---
title: "How I AI: Bringing AI Into the Product Team"
role: Head of Product Design, RockWallet
period: 2023 (personal practice) – 2025-Q4/2026 (org-wide rollout)
status: in-flight (personal practice mature; product-team rollout active; org-wide pitch in flight)
team: Design, Product, Engineering, Steve (RockWallet president) for the layered-architecture frame
stack: ChatGPT (since GPT-3.5), Claude Code, Anthropic Agent SDK, Vercel AI SDK, LangChain, n8n (deterministic workflow backend), MCP, A2A, Figma (design system & deck delivery)
sources:
  - asana:1213643490608780 — "How I AI" - Product Roadmap
  - wiki:projects/ai-chief-positioning
  - wiki:decisions/2026-05-20-ai-layered-architecture
  - _sources/2026-05-20-steve-agent-flow-2.html (Steve's L0→CE diagram)
---

# How I AI: Bringing AI Into the Product Team

## Context

I started using AI for real work in 2023 — Harvard CS50 online plus GPT-3.5 in a tab next to it. "Vibe coding before it had a name," as I've described it. Over the next two years, that personal practice compounded: a personal-finance agent for my own taxes and expenses, a shopping agent, an AI-driven invoice automation for a friend's small company, and — gradually — a working knowledge of agent orchestration, agent-to-agent protocols, human-in-the-loop checkpoints, MCP, A2A, and what I now think of as the actual hard part: UX for agents.

In 2025 that practice turned into something the org could use. RockWallet's president, Steve, circulated a four-layer agent-architecture diagram (L0 Raw Signal → L1 Operational Response → L2 Governance/Control → CE Executive Rhythm) that mapped the entire company as a substrate for agents. I'd been thinking about my own role as Head of Product Design more broadly — design engineering, agent UX, the operational AI rollout — and Steve's diagram crystallized the opportunity: not a side project, not a "use ChatGPT to write your specs faster" trickle, but a structured, exec-sponsored AI program where the product-design org sits at the intersection of agent UX, design engineering, and operationalization.

The "How I AI" workstream is the public-facing slice of that ambition: a roadmap (asana:1213643490608780) for bringing AI into the product team practically, week by week, and a positioning push (see [[projects/ai-chief-positioning]]) for me to take on a C-level Chief-of-AI / AI Chief-of-Staff role.

## The problem

Every executive team is being asked some version of the same question right now: *what is your AI strategy?* The answers split into roughly three camps. Camp 1 buys a Copilot license and calls it done. Camp 2 hires a Director of AI and waits for a strategy doc. Camp 3 — the one I want RockWallet to be in — builds a layered operating system where deterministic automations handle the deterministic work, agents handle the work that requires judgment, and the executive layer gets a consolidated operating rhythm fed by both.

The product team is the right place to start because:
- Product designers and PMs already work in language, structure, and intent — the things LLMs are best at.
- Product workflows (research → spec → design review → engineering handoff → analytics) are highly *deterministic* in the boring parts and highly *non-deterministic* in the parts that matter. That's exactly the deterministic-first-then-agentize pattern that scales.
- The product team's output is read by the rest of the company. If we get good at AI here, the rest of the org follows.

The risk is the same risk every AI rollout has: people use it shallowly, the "AI" becomes synonymous with "ChatGPT", and the org never builds the deeper layer (agents, MCP, A2A, guardrails, HITL).

## My role

I'm the practitioner, the evangelist, and now the proposed organizational owner. I run my own agents in production daily (the personal-finance one is the one I trust the most). I'm bringing AI into the RockWallet product team's actual workflow — not as a demo, but as a working set of practices. And I'm pitching the C-level on a role that maps to that work: Chief of AI / AI Chief of Staff, with a wedge that's specifically *UX for agents + product-grounded operationalization* rather than pure ML engineering or pure ops.

## Approach

My methodology is the audit-then-automate-then-agentize loop:

1. **Department audit + 1:1s.** Map the actual routines people do every week. What's deterministic? What requires judgment? What is currently being done by hand because no one ever wrote a script?
2. **Automate the deterministic.** Most of "AI strategy" is actually "we never built the boring scripts." n8n is the right tool for this most of the time. Deterministic workflows are cheaper, faster, and more reliable than an LLM call.
3. **Agentize where judgment is required.** Triage, summarization, drafting, cross-tool reasoning, decisions with provenance — these are agent jobs.
4. **Guardrails and HITL.** Every agent that touches money, identity, customers, or compliance has a human-in-the-loop checkpoint. Always. Non-negotiable in a regulated business.
5. **UX for the agent's surface.** Agents read documents and consume tools. Documents need to be structured the way an agent expects to read them. Tools need to expose intent, not just APIs. This is design work. It's the part most orgs skip.

For the product team specifically, the rollout sequence is:
- **Phase 1 — personal proficiency.** Every PM and designer gets a working setup (Claude Code, an MCP-connected wiki, agent-readable specs). The wiki I maintain at `~/Documents/Obsidian Vault/llm-wiki/` is the demo: a propose-then-approve persistent second brain that an LLM operates on with explicit write policy.
- **Phase 2 — team workflows.** Standardize: spec drafting agents, design-review pre-readers, research synthesis, meeting-note ingestion (Granola → wiki pipeline), Asana/Confluence summarization.
- **Phase 3 — cross-team agents.** Once the product team has working patterns, expose them as A2A-callable agents for support, ops, and the executive layer (per Steve's L0→CE diagram).

The C-level pitch (see [[projects/ai-chief-positioning]]) is structured as a modular block menu — founder story, Steve alignment, AI OS frame, "20x the capabilities of every employee" framing (Jack Dorsey reference), the audit process, deterministic-vs-non-deterministic decision tree, and a design-engineering cherry on top — assembled into a deck that gets delivered as page 4 of the existing "Design System Initiative" Figma file (deliberate: it shows me as the connective person across design system, agent UX, and exec strategy, not as a parallel pitch).

## Key decisions

- **Position the wedge as UX-for-agents + operationalization, not as ML engineering.** I'm not competing with the people who train models. I'm competing with the gap between "we have models" and "they actually run our operations."
- **Deterministic first, then agentize.** Most "AI projects" can be replaced by 200 lines of n8n. Use the cheaper tool first.
- **Steve's architecture is the frame; I operationalize each layer.** Don't argue with the architecture, build the rollout.
- **Anthropic Cloud Architect certification — paused until after CRB launch.** Stack credibility matters; timing matters more.
- **The wiki is the demo.** A propose-then-approve persistent second brain at `~/Documents/Obsidian Vault/llm-wiki/` with explicit SCHEMA, ingest/query/lint operations, and an audit log. Live, working, mine.
- **Append the AI pitch to the Design System Initiative Figma file, not a parallel deck.** Optics: I'm the design-system + agent-UX + executive-rhythm person, not three separate people.
- **Modular pitch blocks, not a fixed deck.** Different audiences (CEO, CFO, COO, board) need different cuts. Block menu = composable pitch.
- **HITL on anything that touches money, identity, or compliance.** Forever. Don't bargain with this.

## Outcome

In flight. Personal practice is mature (multiple production agents, daily Claude Code use, MCP-driven wiki). Product-team rollout has a roadmap (asana:1213643490608780). C-level positioning is built as a modular Figma deck; the room hasn't convened yet (the C-level audience composition is still an open question per the wiki).

The piece I'd point at as the strongest signal is the wiki itself — `~/Documents/Obsidian Vault/llm-wiki/` runs to a published schema, with `/wiki-ingest`, `/wiki-query`, `/wiki-lint` operations, propose-then-approve writes, and an append-only audit log. It isn't theory; it's the same propose-then-approve discipline I'm asking the company to adopt at scale.

## Reflection

The hardest part of this work isn't technical, it's organizational. Most orgs don't actually want a Chief of AI — they want someone to deflect the question. The pitch has to make clear that AI rollouts are a *design problem* (agent UX, document structure, workflow architecture, HITL gates) at least as much as an engineering one, and that the person who runs them needs to operate across product, ops, and exec — not from a single function silo.

What I'd do differently: I'd have started the org-wide writing earlier. Personal practice is invisible until you write it down. The wiki, the layered-architecture decision page, the AI-chief positioning page — those exist because I forced myself to externalize the practice. If I'd done that six months sooner, the C-level conversation would already be midway through.

What I'm proud of: when Steve circulated his four-layer diagram, I didn't have to learn the frame. I already worked inside it. That alignment is worth a lot more than any single project.

## Links

- Asana: https://app.asana.com/1/1203889043133244/project/1213643490608780
- Wiki: [[projects/ai-chief-positioning]]
- Wiki: [[decisions/2026-05-20-ai-layered-architecture]]
- Wiki: [[people/steve]]

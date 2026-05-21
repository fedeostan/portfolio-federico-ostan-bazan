import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "how-i-ai",
  title: "How I AI: Bringing AI Into the Product Team",
  client: "RockWallet",
  role: "Head of Product Design",
  year: 2026,
  category: "ai",
  published: true,
  summary:
    "Personal AI practice turned into RockWallet's product-team AI rollout and a C-level pitch — agent UX and deterministic-first automation as the wedge.",
  description:
    "In-flight \"How I AI\" workstream — three-phase rollout from personal AI proficiency to A2A-callable cross-team agents, anchored in Steve's L0→CE layered architecture. Stack: Claude Code, MCP, n8n, Anthropic Agent SDK, Vercel AI SDK. C-level pitch frames the role as UX-for-agents + operationalization, not ML engineering.",
  tech_stack: [
    "ChatGPT",
    "Claude Code",
    "Anthropic Agent SDK",
    "Vercel AI SDK",
    "LangChain",
    "n8n",
    "MCP",
    "A2A",
    "Figma",
  ],
  metrics: {
    "Architecture layers in scope": "4 (L0 Signal → CE Executive)",
    "Rollout phases for the product team": "3 (Personal · Team · Cross-team)",
    "AI practice runway compounding": "Since GPT-3.5 (2023)",
    "HITL gates on money, identity, compliance": "Always, no exceptions",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "Vibe coding before it had a name",
      content_md:
        "I started using AI for real work in 2023 — Harvard CS50 in one tab, GPT-3.5 in the next. *\"Vibe coding before it had a name,\"* as I've described it. Over the following two years that personal practice compounded: a personal-finance agent for my own taxes and expenses, a shopping agent, AI-driven invoice automation for a friend's small company, and — gradually — a working knowledge of agent orchestration, A2A protocols, human-in-the-loop checkpoints, MCP, and what I now think of as the actual hard part: **UX for agents.**\n\nIn 2025 that practice turned into something the org could use. RockWallet's president, Steve, circulated a four-layer agent architecture (L0 Raw Signal → L1 Operational Response → L2 Governance/Control → CE Executive Rhythm) that mapped the entire company as a substrate for agents. The diagram crystallized the opportunity: not a side project, not a *\"use ChatGPT to write your specs faster\"* trickle — a structured, exec-sponsored AI program where product design sits at the intersection of agent UX, design engineering, and operationalization.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three camps. RockWallet should be in the third.",
      content_md:
        "Every executive team is being asked the same question right now: *what is your AI strategy?* The answers split into three camps.\n\n**Camp 1** buys a Copilot license and calls it done. **Camp 2** hires a Director of AI and waits for a strategy doc. **Camp 3** — the one I want RockWallet to be in — builds a layered operating system where deterministic automations handle the deterministic work, agents handle the work that requires judgment, and the executive layer gets a consolidated operating rhythm fed by both.\n\nThe product team is the right place to start because product designers and PMs already work in language, structure, and intent — the things LLMs are best at. Product workflows are highly deterministic in the boring parts and highly non-deterministic in the parts that matter — exactly the *deterministic-first-then-agentize* pattern that scales. And the product team's output is read by the rest of the company; if we get good at AI here, the rest of the org follows.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Audit → automate → agentize → guardrail → UX",
      content_md:
        "My methodology is a loop:\n\n1. **Department audit + 1:1s** — map the actual routines people do every week. What's deterministic? What requires judgment? What's being done by hand because no one ever wrote a script?\n2. **Automate the deterministic** — most of *\"AI strategy\"* is actually *\"we never built the boring scripts.\"* n8n is the right tool most of the time. Deterministic workflows are cheaper, faster, and more reliable than an LLM call.\n3. **Agentize where judgment is required** — triage, summarization, drafting, cross-tool reasoning, decisions with provenance.\n4. **Guardrails and HITL** — every agent that touches money, identity, customers, or compliance has a human-in-the-loop checkpoint. Always. Non-negotiable in a regulated business.\n5. **UX for the agent's surface** — agents read documents and consume tools. Documents need to be structured the way an agent expects to read them. Tools need to expose intent, not just APIs. This is design work. It's the part most orgs skip.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Steve's L0→CE frame, operationalized layer by layer",
      content_md:
        "Steve's four-layer diagram is the architecture; my job is the rollout. For the product team specifically that's:\n\n**Phase 1 — personal proficiency.** Every PM and designer gets a working setup (Claude Code, an MCP-connected wiki, agent-readable specs). The wiki I maintain at `~/Documents/Obsidian Vault/llm-wiki/` is the demo: a *propose-then-approve* persistent second brain that an LLM operates on with explicit write policy.\n\n**Phase 2 — team workflows.** Standardize: spec-drafting agents, design-review pre-readers, research synthesis, meeting-note ingestion (Granola → wiki pipeline), Asana/Confluence summarization.\n\n**Phase 3 — cross-team agents.** Once the product team has working patterns, expose them as A2A-callable agents for support, ops, and the executive layer — exactly what L0→CE needs as substrate.\n\nThe C-level pitch is structured as a modular block menu — founder story, Steve alignment, AI OS frame, *\"20x the capabilities of every employee\"* (Jack Dorsey), the audit process, the deterministic-vs-non-deterministic decision tree, a design-engineering cherry on top — assembled as page 4 of the existing *Design System Initiative* Figma file. Deliberate: it positions me as the connective person across design system, agent UX, and exec strategy, not as three separate pitches.",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Position the wedge as UX-for-agents + operationalization, not ML engineering.** I'm not competing with the people who train models. I'm competing with the gap between *\"we have models\"* and *\"they actually run our operations.\"*\n- **Deterministic first, then agentize.** Most *\"AI projects\"* can be replaced by 200 lines of n8n. Use the cheaper tool first.\n- **Steve's architecture is the frame; I operationalize each layer.** Don't argue with the architecture — build the rollout.\n- **The wiki is the demo.** A propose-then-approve persistent second brain at `~/Documents/Obsidian Vault/llm-wiki/` with explicit SCHEMA, `/wiki-ingest`, `/wiki-query`, `/wiki-lint` operations, and an append-only audit log. Live, working, mine.\n- **Append the AI pitch to the Design System Initiative Figma file, not a parallel deck.** Optics: design-system + agent-UX + executive-rhythm = one person, not three.\n- **Modular pitch blocks, not a fixed deck.** Different audiences (CEO, CFO, COO, board) need different cuts. Block menu = composable pitch.\n- **HITL on anything that touches money, identity, or compliance.** Forever. Don't bargain with this.\n- **Anthropic Cloud Architect certification — paused until after CRB launch.** Stack credibility matters; timing matters more.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "What's in scope",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "The working set",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — the hardest part isn't technical, it's organizational",
      content_md:
        "Most orgs don't actually want a Chief of AI — they want someone to *deflect the question.* The pitch has to make clear that AI rollouts are a design problem (agent UX, document structure, workflow architecture, HITL gates) at least as much as an engineering one, and that the person who runs them needs to operate across product, ops, and exec — not from a single function silo.\n\nWhat I'd do differently: start the org-wide writing earlier. Personal practice is invisible until you write it down. The wiki, the layered-architecture decision page, the AI-chief positioning page — those exist because I forced myself to externalize the practice. If I'd done that six months sooner, the C-level conversation would already be midway through.\n\nWhat I'm proud of: when Steve circulated his four-layer diagram, I didn't have to learn the frame. I already worked inside it. That alignment is worth more than any single project.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "How I AI workstream — the layered AI operating system across personal proficiency, product-team workflows, and cross-team A2A agents, with Steve's L0→CE frame as the backbone",
      caption:
        "Personal practice → product-team rollout → cross-team substrate. The same loop, scaled three times.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Methodology loop — audit, automate the deterministic, agentize where judgment is required, guardrails + HITL, UX for the agent's surface",
      caption:
        "The loop: most \"AI strategy\" is actually \"we never built the boring scripts.\" Use the cheaper tool first; agentize only where judgment lives.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Steve's four-layer architecture — L0 Raw Signal → L1 Operational Response → L2 Governance/Control → CE Executive Rhythm — annotated with where the product-team rollout plugs in",
      caption:
        "Steve's frame is the architecture; my job is the rollout. Each layer gets operationalized in sequence, product team first.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "The MCP-connected wiki at ~/Documents/Obsidian Vault/llm-wiki/ — propose-then-approve writes, SCHEMA, /wiki-ingest, /wiki-query, /wiki-lint, append-only audit log",
      caption:
        "The wiki is the demo — same propose-then-approve discipline I'm asking the company to adopt at scale.",
      order: 70,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "Modular pitch block menu — founder story, Steve alignment, AI OS frame, 20x framing, audit process, deterministic-vs-non-deterministic decision tree, design-engineering cherry — composable cuts for CEO, CFO, COO, board",
      caption:
        "Pitch as a block menu, not a fixed deck — different audiences need different cuts.",
      order: 80,
    },
  ],
};

export default project;

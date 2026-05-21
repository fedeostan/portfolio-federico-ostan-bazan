import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "alfahackers-invoice-automation",
  title: "AlphaHackers: Shopify → Xubio Invoice Automation",
  client: "AlphaHackers",
  role: "Solo builder",
  year: 2026,
  category: "personal",
  published: true,
  summary:
    "Every paid Shopify order becomes an AFIP-compliant Xubio invoice in seconds — with a credential vault that survives rotating tokens.",
  description:
    "Solo-built n8n pipeline that turns Shopify order_paid webhooks into AFIP-compliant Xubio invoices, with PDF filing in Google Drive, accounting rows in Sheets, and Telegram notifications. Cornerstone: an Airtable credential vault outside n8n that handles Shopify's 24-hour and Xubio's 60-minute token rotations with proactive refresh and per-call safety nets. Argentine e-commerce, autopilot since 2026-03-17.",
  tech_stack: [
    "n8n",
    "Railway",
    "Shopify Admin API",
    "Xubio",
    "Google Drive",
    "Google Sheets",
    "Airtable",
    "Telegram",
  ],
  metrics: {
    "Unattended launch week": "5 days",
    "Manual interventions since": "0",
    "Tokens auto-rotated daily": "2",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "The gap between Shopify and AFIP used to be a person",
      content_md:
        "AlphaHackers is an Argentine e-commerce business selling cold plunges and saunas. Like every Argentine business, every sale must produce an AFIP-compliant electronic invoice through a certified platform — in their case, Xubio. Like every e-commerce business, their orders land in Shopify. The gap between *\"order placed in Shopify\"* and *\"AFIP-compliant invoice issued in Xubio\"* used to be a person, manually re-keying every sale.\n\nThis case study is the bridge: a fully-automated pipeline that, every time a Shopify order is paid, generates the Xubio invoice, downloads the PDF, files it in a date-organized Google Drive folder, appends a row to a Google Sheet for accounting, and pings Santiago (the founder) on Telegram so he knows the pipeline ran. End-to-end, no human in the loop, no double entry, no missed invoices.\n\nThe interesting part — the reason this lives in my portfolio — isn't the integration. It's the **credential architecture.**",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three constraints shaped the whole project",
      content_md:
        "**Rotating tokens that n8n credentials can't track.** Shopify Custom App tokens refresh every 24 hours. Xubio OAuth tokens last about an hour. n8n's credential store doesn't gracefully handle either pattern — store a Xubio token in an n8n credential and the workflow starts failing silently 61 minutes later. Refreshing requires editing the credential by hand in the UI (no automation surface) or wrestling with OAuth nodes that don't expose a clean *\"use this cached refresh token\"* affordance for non-standard providers.\n\n**A shared n8n instance.** AlphaHackers' workflows run on the same Railway-hosted n8n as a UGC lead-gen pipeline and my personal finance/shopper agents. Anything that touches the global credential surface — env vars, OAuth redirect URIs, credential names — risks affecting other tenants. The credential architecture has to be *per-client*, not *per-instance.*\n\n**Operational visibility.** Santiago and Mati don't open the n8n panel. They open Telegram. If an invoice fails to issue, they need to know within minutes — not on the next time someone checks the dashboard, which is never.",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Airtable as the rotating-credential vault",
      content_md:
        "The cornerstone of the project. Instead of storing Shopify and Xubio tokens in n8n's credential store, I created an Airtable base with a `Token_Cache` table holding the token value, expiry timestamp, refresh token, last-refresh timestamp, and service name (`shopify` | `xubio`).\n\nEvery workflow that calls Shopify or Xubio reads `Token_Cache` first, checks whether the token is expired or inside the refresh window, hits the refresh endpoint if needed, updates the cache, and only then makes the actual API call. A separate refresh workflow runs every 23 hours proactively — so if a workflow happens to execute right as a token is rotating, the cache already has a fresh value. Belt and suspenders.\n\nTwo design points worth surfacing. **Airtable is a feature here, not a workaround** — it gives me a queryable, audit-friendly record of every token rotation, which n8n credentials never could. And **the pattern is replicable** — when another client needs the same long-running token handling, the base extends with a new row. The infrastructure pays back for years.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "The pipeline itself, end to end",
      content_md:
        "Shopify webhook (`order_paid`) → read & refresh Shopify token → fetch order details → read & refresh Xubio token → POST to Xubio `/invoices` with mapped line items → fetch invoice PDF → upload to Google Drive (date-organized folder) → append row to Google Sheet → Telegram notification with invoice number and amount. Any failed step branches to a Telegram error notification with the execution ID and offending node name.\n\nA few details worth surfacing. **Line item mapping is its own concern** — Shopify line items don't translate 1:1 to Xubio's (internal product ID, IVA classification, discount formatting). The mapping lives in a Code node; new SKUs grow the table by one row. **PDF filing is deterministic** — Drive folders organized by `year/month`, the Sheet is the authoritative record, no tribal knowledge required. **Error notifications include the execution ID** — Santiago forwards it to me, I open the execution, see exactly what failed. *\"Something broke at some point\"* becomes *\"here's the line.\"*",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Telegram is the client surface — the panel should never need opening",
      content_md:
        "Santiago doesn't open the n8n dashboard. He opens Telegram. The system tells him three things, in his actual workflow:\n\n- **Success notifications.** Every issued invoice posts via the `Jarvis Telegram Bot` credential. Dry tone: *\"✅ Invoice 0001-00001234 issued for [Customer] — $42,000 ARS.\"* PDF link in the message if he wants to verify.\n- **Error notifications.** Any failed step posts the offending node name and the n8n execution ID. He doesn't need to know what to do with the ID — he forwards it.\n- **Daily summary.** End of day, a scheduled workflow counts the day's invoices, totals the day's revenue, posts a one-line summary. The only message he needs to read every day.\n\nThe discipline: **the client should never have to open a panel.** If they're opening a panel, the abstraction has leaked. Every notification format is deliberate — short, scannable, with the next action implicit. The same discipline I apply to agent UX everywhere else.\n\n**Defensive patterns that hold the pipeline together.** `continueOnFail` on every external HTTP node (Shopify rate-limits, Xubio has scheduled maintenance, Drive auth hiccups — none of these get to crash the pipeline). **Idempotency via Shopify order ID** — before issuing an invoice, the workflow checks whether the Sheet already has a row with this order ID. Webhook retries are a fact of life. **No invoice without a complete payload** — if line-item mapping returns an unknown SKU, the workflow halts before calling Xubio. A half-issued AFIP invoice is worse than no invoice — you can't *edit* an AFIP invoice without a credit note. **Token refresh is itself instrumented** — every refresh writes a timestamp and status to Airtable, so I see degradation before any invoice fails.",
      order: 50,
    },
    {
      section_type: "metrics",
      heading: "Outcomes",
      content_md: null,
      order: 60,
    },
    {
      section_type: "gallery",
      heading: "The brand the pipeline serves",
      content_md: null,
      order: 70,
    },
    {
      section_type: "text",
      heading: "Reflection — infrastructure is a design problem",
      content_md:
        "The lesson I'd most want a future reviewer to take from this work: **infrastructure is a design problem, not just an engineering problem.** The Airtable credential vault isn't a clever trick — it's a *decision* about where the system's source of truth for secrets should live, and what affordances that source needs (queryability, audit trail, per-tenant isolation, refresh observability). Choosing Airtable over n8n credentials was a UX decision as much as a technical one. Santiago can open the Airtable base and *see* the system's state, which he could never do with n8n credentials.\n\nThe other lesson is about Telegram-as-UI for non-technical operators. **Design the messages first, design the pipeline second.** If the messages are right, the pipeline is in service of them. If the messages are an afterthought, you've built a system that requires a panel — and the client is never going to open the panel.\n\nWhat I'd do differently: I'd build the daily summary first. The per-invoice notifications are useful, but the summary is the only message Santiago reads every day. Building it first would have forced clearer thinking about which aggregate signals actually matter.\n\nWhat I'm proud of: an unsexy integration — Shopify to invoicing API to PDF to Sheets — done with the discipline of a production system. Rotating credentials handled, errors visible, idempotency enforced, client surface designed. The unsexy work, done with care, is what separates *\"I built an integration\"* from *\"I shipped infrastructure my client trusts.\"*\n\nA follow-on project, `alfahuman-dashboard`, shipped 2026-04-29 — an employee web portal that extends the same credential and observability patterns to AlphaHackers' internal staff. The patterns ported cleanly. That's the test of an architecture: whether the next project benefits from the previous one.",
      order: 80,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "AlphaHackers brand photography — a person in a cold plunge tub exhaling steam in low light, with the ALFA HUMANS wordmark",
      caption:
        "The business the pipeline serves. AlphaHackers sells cold plunges and saunas in Argentina; every sale must become an AFIP-compliant Xubio invoice in seconds.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Standing figure against AlphaHackers product backdrop — used to mark the section on the Airtable credential vault that anchors the architecture",
      caption:
        "Airtable as the credential vault, not n8n credentials. The cornerstone decision — queryable, auditable, per-tenant. The infrastructure decision that pays back for years.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Close-up portrait used to mark the section on the end-to-end invoice pipeline — Shopify webhook through Xubio API through Drive, Sheets and Telegram",
      caption:
        "The pipeline itself — webhook to invoice to PDF to Sheets to Telegram. Idempotent on Shopify order ID, `continueOnFail` on every external call, halt on payload errors.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "AlphaHackers brand photography — close-up of a person laughing in sunlight after cold exposure",
      caption:
        "The deliverable that matters most isn't a message Santiago reads — it's the absence of phone calls asking *\"did this go through?\"*",
      order: 60,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "AlphaHackers brand photography — a person sitting in a sauna with steam in low golden light",
      caption:
        "Same discipline applied to the follow-on `alfahuman-dashboard` — an employee portal that extends the credential vault and Telegram-as-UI patterns to internal staff.",
      order: 70,
    },
  ],
};

export default project;

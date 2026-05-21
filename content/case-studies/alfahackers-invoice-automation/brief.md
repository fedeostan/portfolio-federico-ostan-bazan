---
title: "AlphaHackers: Shopify-to-Xubio Invoice Automation With Airtable-Managed Token Rotation"
role: Solo builder — pipeline design, n8n workflows, credential rotation architecture, Telegram observability layer
period: 2026-Q1 → present (live, autopilot)
status: shipped (all phases complete 2026-03-17)
team: Solo · Client: AlphaHackers (e-commerce — cold plunges & saunas, Argentina). Contacts: Santiago (founder), Mati (operations)
stack: n8n (Railway-hosted) · Shopify Admin API · Xubio (Argentine invoicing API) · Google Drive · Google Sheets · Airtable (credential cache) · Telegram (operator alerts)
sources:
  - Airtable base `app4GVe16eRf8xI1S` / Table `Token_Cache` (`tblZOoEoWVEzFs6BD`)
  - Shopify Custom App on `alfahackers-com.myshopify.com`
  - n8n credential `Jarvis Telegram Bot` (`2bUviVM2fYCe0Tpx`)
  - Telegram chat `7421024045`
  - `~/n8n-agent/.claude/clients/alfahackers/CLAUDE.md`
  - `~/n8n-agent/.claude/clients/alfahackers/projects/alfa-invoices/`
---

# AlphaHackers: Shopify-to-Xubio Invoice Automation With Airtable-Managed Token Rotation

## Context

AlphaHackers is an Argentine e-commerce business that sells cold plunges and saunas. Like every Argentine business, they have to issue legally-compliant electronic invoices to the AFIP tax authority through a certified invoicing platform — in their case, Xubio. Like every e-commerce business, their orders land in Shopify. The gap between "order placed in Shopify" and "AFIP-compliant invoice issued in Xubio" used to be a person, manually re-keying every sale.

The work this case study describes is the bridge: a fully-automated pipeline that, every time a Shopify order is paid, generates an invoice in Xubio, downloads the resulting PDF, files it in a date-organized Google Drive folder, appends a row to a Google Sheet for accounting, and pings Santiago on Telegram so he knows the pipeline ran. End-to-end, no human in the loop, no double entry, no missed invoices.

The interesting part — and the reason this lives in my portfolio — isn't the integration itself. It's the **credential architecture**. Both Shopify (via a Custom App with `client_credentials` grant) and Xubio (via OAuth) use rotating access tokens. Shopify's tokens rotate every 24 hours; Xubio's last about an hour. n8n's credential store doesn't gracefully handle either pattern. So I built the credential layer *outside* n8n, in Airtable, and let n8n be the orchestrator instead of the secret vault.

## The problem

Three constraints shaped the whole project:

**1. Rotating tokens that n8n credentials can't track.** If you store a Xubio token in an n8n credential and it expires in 60 minutes, the workflow starts failing silently in 61 minutes. Refreshing requires either editing the credential in the n8n UI (no automation surface) or — for newer n8n versions — using OAuth flow nodes that still don't expose a clean "use this cached refresh token" pattern for non-standard providers like Xubio. The Shopify case is similar: their Custom App `client_credentials` flow returns a token that needs to be refreshed every 24 hours. Neither fits neatly into n8n's credential model.

**2. A shared n8n instance.** AlphaHackers' workflows run on the same Railway-hosted n8n instance as Josephine's UGC lead-gen pipeline and Federico's personal agents (Patricia, the Personal Shopper). Anything that changes the global credential surface — env vars, OAuth redirect URIs, credential names — risks affecting other tenants. The credential architecture has to be *per-client*, not *per-instance*.

**3. Operational visibility.** Santiago and Mati don't open the n8n panel. They open Telegram. If an invoice fails to issue, they need to know within minutes — not on the next time someone checks the dashboard, which is never.

The system has to handle all three: rotate tokens automatically, isolate AlphaHackers' credentials from other clients on the same instance, and surface success/failure into the operator's actual workflow (Telegram).

## My role

Solo builder, with Santiago as product owner. I designed the integration, built every workflow, wired the Airtable credential cache, and set up the Telegram observability layer. Santiago provided the Xubio account, the Shopify Custom App setup, and feedback on which notifications were useful vs noise.

The implicit job description: **be the technology layer his business doesn't have**. AlphaHackers is small enough that they don't have an internal engineer. This is consulting work where the deliverable isn't just the integration — it's a system the client can operate without me explaining it every time something goes sideways.

## Approach

### Airtable as the rotating-credential vault

The cornerstone of this project. Instead of storing Shopify and Xubio tokens in n8n's credential store, I created an Airtable base (`app4GVe16eRf8xI1S`) with a `Token_Cache` table (`tblZOoEoWVEzFs6BD`) that holds:

- Token value
- Expiry timestamp
- Refresh token (when applicable)
- Last refresh timestamp
- Service name (`shopify` | `xubio`)

The pattern that wraps it:

```
Every workflow that calls Shopify or Xubio:
    ↓
1. Read Token_Cache row for the service
    ↓
2. Is the token expired (or within refresh window)?
    ↓ yes
3. Hit the refresh endpoint with client_credentials / refresh_token
    ↓
4. Update Token_Cache with new token + expiry
    ↓ no
5. Use the cached token directly
    ↓
6. Make the actual Shopify / Xubio API call
```

A separate "Token Refresh" workflow runs every 23 hours, proactively refreshing both tokens before they expire. This is the safety net — if a workflow happens to execute right as a token is rotating, the proactive refresh has already updated the cache, and the read in step 1 returns a fresh value. If the proactive refresh itself fails (network blip, Xubio downtime), the per-call refresh in step 3 catches it.

Two design points worth surfacing.

**Airtable is a feature here, not a workaround.** It gives me a queryable, audit-friendly record of every token rotation — last refresh time, last refresh status, which workflow last consumed the token. n8n's credential store gives me none of this. When something goes wrong, "when did this token last rotate" is the first question; Airtable answers it in two seconds.

**The pattern is replicable.** When AugustoBerard or any future client needs the same kind of long-running token handling, the Airtable base extends with a new row. The pattern doesn't have to be rebuilt per-client. This is the kind of infrastructure decision that pays back for years.

### The invoice pipeline itself

The order-to-invoice flow:

```
Shopify Webhook (order_paid event)
    ↓
Read Token_Cache (Shopify token)  →  Refresh if expired  →  Update Cache
    ↓
Fetch order details from Shopify Admin API
    ↓
Read Token_Cache (Xubio token)  →  Refresh if expired  →  Update Cache
    ↓
POST to Xubio /invoices with mapped line items
    ↓
Fetch invoice PDF from Xubio
    ↓
Upload PDF to Google Drive (date-organized folder)
    ↓
Append row to Google Sheet (order ID, invoice number, amount, customer, PDF link)
    ↓
Telegram notification: "✅ Invoice #1234 issued for Cliente X — $XXXX"
    ↓
Error branch (any step): Telegram notification with execution ID and offending node
```

A few details worth surfacing.

**Line item mapping is its own concern.** Shopify line items don't translate 1:1 to Xubio's invoice line items — Xubio needs an internal product ID, an IVA (Argentine VAT) classification, and specific formatting for discounts. The mapping logic lives in a Code node that takes the Shopify order and emits a Xubio-ready payload. When AlphaHackers adds a new product, the mapping table grows by one row.

**PDF filing is deterministic, not creative.** Google Drive folders are organized by year/month (`2026/05/`). The Sheets append is the authoritative record. If anyone needs to find invoice #1234 later, they search the sheet by order ID and follow the link. No tribal knowledge required.

**Error notifications include execution ID.** When Santiago gets a "❌ Invoice for order #4567 failed" message, it includes the n8n execution ID. He DMs me the ID; I open the execution, see exactly what failed, and fix it. The notification turns "something broke at some point" into "here's exactly what to look at."

### Telegram as the client surface

Santiago doesn't open the n8n dashboard. He opens Telegram. So the system has to tell him three things, in a way that fits his actual workflow:

- **Success notifications.** Every issued invoice posts to chat `7421024045` via the `Jarvis Telegram Bot` credential. Tone is dry: "✅ Invoice 0001-00001234 issued for [Customer Name] — $42,000 ARS." If he wants to verify, the PDF link is in the message.
- **Error notifications.** Any failed step posts an error message with the offending node name and the execution ID. He doesn't have to know what to do with the ID; he just forwards it to me.
- **Daily summary.** At end-of-day, a scheduled workflow counts the day's invoices, totals the day's revenue, and posts a one-line summary. This is the only message Santiago reads daily; the per-invoice notifications are reference.

The discipline that goes into Telegram-as-UI: **the client should never have to open a panel.** If they're opening a panel, the abstraction has leaked. Every notification format is deliberate — short, scannable, with the next action implicit. This is the same discipline I apply to agent UX everywhere.

### Defensive error handling, end to end

A few patterns I'd flag as load-bearing:

- **`continueOnFail` on every external HTTP node.** Shopify rate-limits sometimes. Xubio has scheduled maintenance. Google Drive's auth occasionally hiccups. None of these get to crash the pipeline. Failed steps notify Telegram; the workflow continues if it can, fails cleanly if it can't.
- **Idempotency via Shopify order ID.** Before issuing a Xubio invoice, the workflow checks whether the Google Sheet already has a row with this Shopify order ID. If it does, the workflow exits early. This handles the case where Shopify retries a webhook delivery — which it does, sometimes more than once.
- **No invoice without a complete payload.** If the line-item mapping returns an error (e.g., unknown product SKU), the workflow halts before calling Xubio. A half-issued invoice is worse than no invoice — AFIP doesn't let you "edit" an issued invoice without a credit note.
- **Token refresh is itself instrumented.** Every refresh writes a timestamp and a status to the Airtable row. If the refresh starts failing, I can see the pattern in Airtable before any invoice fails.

## Key decisions

- **Airtable as credential vault, not n8n credentials.** Rotating tokens need an audit trail and a queryable cache. n8n's credential store gives you neither. Airtable does both, cheaply, with a UI Santiago can read.
- **Per-client credential isolation.** AlphaHackers' tokens live in its own Airtable base. Adding another client doesn't risk touching this one's secrets. The shared n8n instance stays clean.
- **Proactive + reactive token refresh.** Scheduled refresh every 23h as the primary path; per-call expiry check as the safety net. Belt-and-suspenders for something that absolutely cannot fail silently in production.
- **Telegram as the operator UI.** Santiago doesn't open dashboards. The system reports to him where he already lives. Dry tone, short messages, execution IDs for errors.
- **Idempotent by Shopify order ID.** Webhook retries are a fact of life. The pipeline checks before writing.
- **`continueOnFail` everywhere; halt on payload errors.** Tolerate transient failures; refuse to issue partial invoices.
- **Daily summary as the only required-attention message.** Per-invoice notifications are reference. The summary is the daily check-in.

## Outcome

Live and running on autopilot since 2026-03-17. Every Shopify order on `alfahackers-com.myshopify.com` becomes a Xubio invoice within seconds of payment, with the PDF filed in Drive and a row in the accounting sheet. Santiago's workflow shrank by hours per week. The pipeline has been stable enough that the only changes since launch have been new product SKUs being added to the line-item mapping table.

The proof-of-design moment was the **first week unattended** — five days of orders, zero failed invoices, zero manual interventions, zero phone calls from Santiago asking "did this go through?" The absence of those phone calls is the deliverable.

A follow-on project — `alfahuman-dashboard` — shipped 2026-04-29: an employee web portal (email/password login → Telegram bot deep link) that extends the same credential and observability patterns to AlphaHackers' internal staff. The Airtable credential cache and the Telegram-as-UI discipline ported cleanly. That's the test of an architecture — whether the next project benefits from the previous one.

## Reflection

The lesson I'd most want a future reviewer to take from this work: **infrastructure is a design problem, not just an engineering problem.** The Airtable credential vault isn't a clever trick; it's a *decision* about where the system's source of truth for secrets should live, and what affordances that source needs (queryability, audit trail, per-tenant isolation, refresh observability). Choosing Airtable over n8n credentials was a UX decision as much as a technical one — Santiago can open the Airtable base and *see* the system's state, which he could never do with n8n credentials.

The other lesson is about Telegram-as-UI for non-technical operators. I learned this discipline well enough that I now apply it to every client engagement: design the messages first, design the pipeline second. If the messages are right, the pipeline is in service of them. If the messages are an afterthought, you've built a system that requires a panel — and the client is never going to open the panel.

What I'd do differently: I'd build the daily summary first. The per-invoice notifications are useful, but the summary is the only message Santiago reads every day. Building the summary first would have forced clearer thinking about what aggregate signals matter, and the per-invoice notifications would have followed naturally.

What I'm proud of: it's an unsexy integration — Shopify to invoicing API to PDF to Sheets — that nonetheless has the discipline of a production system. Rotating credentials handled, errors visible, idempotency enforced, client surface designed. The unsexy work, done with care, is what separates "I built an integration" from "I shipped infrastructure my client trusts."

## Links

- Airtable base: `app4GVe16eRf8xI1S` / Table `Token_Cache` (`tblZOoEoWVEzFs6BD`)
- Shopify Custom App: `alfahackers-com.myshopify.com`
- Telegram channel: `7421024045` via `Jarvis Telegram Bot` (`2bUviVM2fYCe0Tpx`)
- Follow-on project: `projects/alfahuman-dashboard/` — Employee web portal (LIVE 2026-04-29)
- Reference: [[ugc-lead-gen-pipeline]] for the same defensive-error and Telegram-observability discipline applied to a different domain
- Reference: [[patricia-margaret-finance-agent]] for tenant-isolation patterns in a multi-user system

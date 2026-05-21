---
title: "UGC Lead Gen: A Cost-Aware Outbound Pipeline With AI Brand Research and Pre-Pitch Generation"
role: Solo builder — pipeline architecture, n8n workflows, enrichment waterfall, LLM prompt design
period: 2026-03 → present (active, weekly autopilot)
status: shipped (Phases 1–7) · monitoring (Phase 8)
team: Solo · Client: Josephine Remo (UGC creator)
stack: n8n (5 scheduled workflows) · Perplexity API · Apify · Hunter.io · Apollo.io · OpenAI GPT-4o-mini · Google Sheets · Telegram (alerts) · Railway (shared n8n)
sources:
  - n8n workflow `3DT3eogsBlVWa8HC` (`[JR] Google Search Collector`, Mon+Thu 6am)
  - n8n workflow `58yM1KFfu4Beq6Ok` (`[JR] RSS/Blog Collector`, Wed 6am)
  - n8n workflow `ptNpkkbVGgEvOggr` (`[JR] Apify Social Collector`, Tue+Fri 7am)
  - n8n workflow `Vnc8aZrOBWbXMYBj` (`[JR] Lead Enricher + Pitcher`, Fri 9am)
  - n8n workflow `NIDpQYFnwqPc23q2` (`[JR] Error Handler`)
  - Google Sheet `1sivktFUvlf1iR1YcOOmI5XDmM1KrPy2sTB-kYztMSoY` (`JR UGC Leads`)
  - `~/n8n-agent/.claude/clients/josephineremo/projects/ugc-lead-gen/CLAUDE.md`
---

# UGC Lead Gen: A Cost-Aware Outbound Pipeline With AI Brand Research and Pre-Pitch Generation

## Context

UGC creators — people who make sponsored short-form content for direct-to-consumer brands — have an unromantic part of their job: outbound. Every week, they need a fresh list of brands actively seeking creators, the right person to pitch at each brand, a verified email, and a personalized opener. Without that loop, the content side of the business starves.

Josephine Remo is a UGC creator who needed that loop to run by itself. Manually scraping Instagram for `#ugccreator` posts, hand-writing pitches to 50 brands a week, tracking who replied — that's a part-time job nobody wants. So I built her a weekly autopilot.

The system runs on a schedule: Monday and Thursday it scans Google via Perplexity, Tuesday and Friday it scrapes Instagram and TikTok via Apify, Wednesday it ingests UGC industry RSS feeds, and Friday at 9 AM it enriches everything it collected that week with contact info and ships a Google Sheet of pitch-ready leads — each one with a custom opening email already drafted.

It costs about $5 a month to run.

## The problem

Three things make this domain hard from a pipeline perspective.

**1. Source diversity.** UGC opportunities surface on five or six different channels — Google search, RSS, Instagram, TikTok, brand newsletters, industry blogs. Each channel has its own data shape (a post, an article, a hashtag), its own quirks (Instagram rate-limits, TikTok requires headless scraping, blogs have inconsistent feed formats), its own signal-to-noise ratio. A monolithic "lead collector" workflow would have been impossible to debug and slow to extend.

**2. Enrichment is a money pit if you're not careful.** Apollo.io's "people match" endpoint costs one credit per call. Free tier is 100 credits/month. Naively running every lead through Apollo would burn the budget in a week. Hunter.io free tier is 25 searches. Apify free tier is $5/month of platform credits. Perplexity is pay-per-use. Each tool is great at one thing; using the wrong tool first costs real money.

**3. The pitch has to be personal, or it's noise.** "Hi [Brand], I love your products" gets ignored. A pitch that opens with a reference to the brand's recent launch, or to an article that just covered them, or to a specific product the creator could speak to authentically — that's what gets opened. Generating that opener requires deep context: who the brand is, what they recently did, who the right contact is, what tone they use publicly.

The system has to handle all three: multi-source intake, cost-aware enrichment, and per-lead personalized pitch generation — all on a schedule, with error notifications when something breaks, and within Josephine's budget.

## My role

Solo builder for Josephine. I designed the pipeline shape, built the five workflows, wired the Google Sheet as the operational surface, set up cost monitoring, and iterated on the LLM prompts for brand extraction and pitch generation. Josephine reviews the output and tells me when pitches read off-voice; I tune.

The constraint that shaped most decisions: **operator one, user one**. The system has to run unattended for weeks at a time. Every workflow has an error trigger feeding a Telegram alert. Every external API call has `onError: continueRegularOutput` so a single failed lookup doesn't crash the whole run.

## Approach

### Five workflows, one Google Sheet

The architecture is intentionally split into five independent workflows that share state via a Google Sheet (`JR UGC Leads`, two tabs: `Staging` and `Master Leads`):

```
[WF1] Google Search Collector   ──→ Staging ──┐
[WF2] RSS/Blog Collector        ──→ Staging ──┤
[WF5] Apify Social Collector    ──→ Staging ──┤
                                              ├──→ [WF3] Lead Enricher + Pitcher ──→ Master Leads
                                              │                                          │
                                              │                                          ▼
                                              │                                  Telegram weekly digest
[WF4] Error Handler ────────────── catches errors from WF1, 2, 3, 5
```

Each collector writes to `Staging`. The enricher reads from `Staging`, processes each row through a waterfall of enrichment methods, writes the finished lead to `Master Leads`, and marks the staging row as processed. The error handler is hooked into each workflow's error trigger and posts to Josephine's Telegram chat with the offending node and execution ID.

This split lets me touch any one collector without risk of breaking the others. When TikTok changes its DOM, I patch WF5 and nothing else moves. When OpenAI deprecates a model name, I update WF3 and the collectors keep collecting. The Google Sheet is the only contract between them, and it's simple enough (column-named tables) to evolve.

### Cost-aware enrichment waterfall

The most important architectural decision in this project is the order in which enrichment methods are tried. The six-stage waterfall:

```
Lead (no email)
   ↓
Apify Website Scrape (FREE — $5/month platform credits shared)
   ↓ no email?
Perplexity AI search (~$0.005/query)
   ↓ no email?
Hunter.io domain lookup (FREE — 25 searches/month)
   ↓ no email?
Apollo.io people search (FREE — 0 credits)
   ↓ no email?
Apollo.io people match (1 credit, last resort)
   ↓
Finalize (whatever was found)
```

Each stage is an HTTP Request → Parse (Code node) → IF\_Found gate. If the email is found, the lead short-circuits to `Finalize` and the remaining stages are skipped. If a stage's API errors, `onError: continueRegularOutput` keeps the lead moving to the next stage instead of crashing the pipeline. The `Enrichment Method` field tracks *which* stage found the email — useful for analytics, useful for debugging which sources are most productive.

The economics: before the waterfall, the system would have hit Apollo's people-match endpoint for every lead, burning ~100 credits/month on the free tier. After the waterfall, Apollo usage drops to roughly 20–32 credits/month — only the leads that couldn't be enriched by any of the cheaper methods. About 68–80% cost reduction, with no accuracy loss because the cheaper methods are often *more* accurate (a brand's actual website often lists the partnerships email; Apollo's database is often stale).

This is the pattern I'd want every pipeline reviewer to take away: **rank enrichment methods by cost per call, run the cheap ones first, short-circuit as soon as you have an answer.** The waterfall is six lines of pseudocode, but it's the single biggest determinant of whether this pipeline costs $5/month or $50/month.

### Brand extraction v1 → v2: replacing a heuristic with an LLM

The first version of WF2 (RSS/Blog Collector) used the article *title* as the brand candidate. If the title said "Glossier launches new lip product," the lead was "Glossier." This worked for ~40% of articles. The other 60% were either roundups mentioning many brands, or articles where the brand name was in the body but not the title.

V2, deployed 2026-04-11, replaces the heuristic with a full-body LLM extraction pass. The pipeline:

1. Schedule fires → Read `Master Leads` + `Staging` once (hoisted *outside* the per-feed loop — see Gotcha section).
2. Loop over RSS feeds → fetch each feed → parse for articles.
3. For each article: fetch the full HTML body → clean it (strip nav, footer, scripts) → cap at 3000 characters.
4. Pass cleaned body to `gpt-4o-mini` with `response_format: json_object` and a prompt that returns up to 5 brands per article, each with a guessed domain and a signal type (`launch`, `funding`, `rebrand`, `new-product`, `creator-call`).
5. Fan out one Staging row per brand. Dedup against the 30-day cooldown on `Master Leads` (so a brand mentioned this month doesn't get re-leaded next month).
6. Append fresh rows to `Staging`.

The gotcha that bit me here is worth surfacing because it's the kind of thing only production exposes: **Google Sheets has a 60-read/minute quota.** My first version read `Master Leads` and `Staging` *inside* the per-feed loop. Eight feeds × two reads = 16 reads, fine in dev, instantly rate-limited in production. The fix: hoist both reads outside the loop with `executeOnce: true`. Wednesday 4/15's first scheduled run after the fix produced 11 new brand-rows from 8 feeds in 49 seconds.

### Brand research v2: a dedicated Perplexity pre-stage

V1 worked, but it left a hole: when the LLM didn't extract a `brand_domain_guess`, the waterfall fell back to scraping the article URL (which was usually a blog, not the brand site), and the `Enrichment Method` ended up as `none`. The decision-maker and submission channel fields stayed empty.

V2 (deployed 2026-04-11, first auto-fire 2026-04-17) adds a dedicated Perplexity "deep brand research" stage *before* the waterfall, for brand-extracted leads only:

```
Prep_Waterfall → IF_Brand_Extracted (Source Article URL populated?)
    [true]  → Brand_Research_Perplexity (single Sonar call returning:
                domain, decision_maker, submission_channel, brand_brief, email)
            → Parse_Brand_Research (updates Website, _domain, Contact Email)
            → IF_Already_Has_Email
                [yes] → Finalize  (skip waterfall entirely)
                [no]  → enter waterfall with corrected domain
    [false] → IF_Already_Has_Email (unchanged path for non-RSS leads)
```

Two design points worth surfacing.

**Replace four API calls with one.** Brand research is one Perplexity call that does what the rest of the waterfall would take four calls to do — find the domain, find a decision-maker, find a submission channel, find the email. When it works, the lead is finalized with no further calls. When it fails to find an email, the lead enters the waterfall with a *corrected* domain, so the downstream Apify/Hunter/Apollo lookups have a much higher hit rate.

**Email hallucination guard.** Perplexity will sometimes invent plausible-looking emails. The brand-research prompt instructs it to *only* return emails whose domain matches the verified brand domain. The parser drops any email that doesn't match. This is the same discipline as the Personal Shopper agent's "no product without a tool call" — the LLM is allowed to suggest, but a downstream check enforces.

Cost: roughly $0.10–0.20/month for brand research × 4 runs/month. Net-neutral, because the calls it makes replace calls the waterfall would have made anyway, and the higher hit rate means fewer Apollo credits burned downstream.

### Pre-pitch generation with social proof

The Enricher's final node (`Generate_PrePitch`) is the part Josephine actually reads. For each enriched lead, `gpt-4o-mini` (with `response_format: json_object`) produces a structured JSON with five fields:

```json
{
  "decision_maker": "...",
  "submission_channel": "...",
  "brand_brief": "...",
  "recommended_action": "...",
  "pitch_email": "..."
}
```

The system prompt instructs the model to **open the pitch email with the source article as social proof** when the signal is `launch`/`funding`/`rebrand`/`new-product`. So a pitch for a brand that just got covered in a launch article doesn't open with "Hi [Brand], I love your products" — it opens with "Congrats on the launch covered in [Article Title] — I'd love to be part of how you tell the next chapter."

The `Extract_Pitch` node parses the JSON. If the LLM omits a field (it sometimes does), the node falls back to the Perplexity-extracted value for that field. The fallback chain — LLM first, Perplexity research second, defaults third — is the kind of defensive design that lets the pipeline run unattended for weeks without producing empty rows.

### Operational discipline

A few patterns I'd want anyone copying this design to adopt:

- **Schedule by source, not by step.** Each collector has its own cron schedule because the sources update at different cadences. RSS feeds are weekly. Instagram is daily. Google search is twice a week. Trying to align everything to one big "Friday morning" run would mean either stale collectors or wasted API calls.
- **Error handler as a separate workflow.** WF4 is hooked into the others via n8n's Error Trigger. When anything errors, Josephine gets a Telegram message with the workflow name and execution ID. No silent failures. No me having to remember to check logs.
- **`executeOnce: true` on hoisted reads.** This is the n8n quirk that bit me in WF2. If you're reading a Google Sheet (or any external resource) *before* a loop, mark it `executeOnce` so it doesn't re-execute per loop item.
- **Cost cap as a node constant.** `Validate_Perplexity` in WF5 has `MAX_QUERIES=40` hardcoded. When the budget changes, I change the constant. Cost ceilings should be visible, not implicit.
- **`continueOnFail` on every external HTTP node.** Hunter returns 429 sometimes, Apollo has flaky pagination, Apify scraping breaks when sites change. The pipeline doesn't get to crash because of any one of them.

## Key decisions

- **Five workflows, not one.** Source-specific collectors evolve independently. Monolithic pipelines die under their own debugging cost.
- **Google Sheet as the operational surface.** Josephine doesn't operate the n8n panel; she opens a sheet. The Master Leads tab is a contract: she trusts the columns, I never break them.
- **Cost-aware waterfall ordering.** Cheapest method first, short-circuit on success. Reduced Apollo usage by 68–80%.
- **One Perplexity call to replace four waterfall calls.** When it works it short-circuits the whole pipeline; when it doesn't, it produces a corrected domain that improves downstream hit rates.
- **Full-body LLM brand extraction, not title heuristic.** Title heuristic missed 60% of articles. LLM extraction on 3,000-character cleaned bodies catches the rest.
- **Pre-pitch with article social proof.** Pitches that reference a recent launch open ~3× more often (Josephine's qualitative read) than generic openers.
- **Hoist external reads outside loops.** Sheets rate limits don't care that you're inside a loop.
- **Error handler as its own workflow.** Failures get noticed within minutes, not on Monday morning.

## Outcome

Active since March 2026. Five workflows. ~100 qualified UGC leads per month, enriched with verified emails and personalized pre-pitches, delivered to Josephine's Google Sheet every Friday morning. Operational cost holds at $4.50–$5.70/month.

The proof point I'd flag is the **brand extraction v2 first auto-fire on 2026-04-17**: the pipeline ran without supervision, produced fresh Decision Maker / Submission Channel fields for brand-extracted rows, and posted a clean Telegram summary. No errors, no rate limits, no manual reruns. That's the moment a pipeline graduates from "demo" to "infrastructure."

## Reflection

The most useful design lens I applied here, copied from years of integration work: **rank everything by cost-per-call before you compose anything.** Most "AI pipeline" disasters are spec-driven — someone says "use Apollo for emails" and the pipeline burns through credits in a week because nobody asked which other tools could answer first. The waterfall pattern isn't novel; the discipline of *actually doing it* is what makes the difference between $5/month and $50/month.

The lesson from brand extraction v1 → v2 is about replacing heuristics with LLMs at the *right* boundary. Article-title heuristic was fast and free, but it missed 60% of articles. Full-body LLM extraction is slower (~$0.02/month) but catches the right thing. The lesson generalizes: an LLM in the right place pays for itself many times over. An LLM in the wrong place — say, doing the categorization step in the conversational agent's main loop — burns money without adding signal.

What I'd do differently: I'd have built the cost dashboard earlier. I track API spending now through Perplexity/Apollo dashboards, but a single Google Sheet tab that aggregates per-run cost would have saved me a few cycles of "is this still in budget?" anxiety.

What I'm proud of: it's a pipeline that does outbound work I'd find tedious, in a domain I have no personal expertise in, for a creator who doesn't have to understand any of the architecture to benefit from it. The system is the product; she reads the output. That's what good infrastructure feels like.

## Links

- Workflows: [JR] Google Search Collector (`3DT3eogsBlVWa8HC`), RSS/Blog Collector (`58yM1KFfu4Beq6Ok`), Apify Social Collector (`ptNpkkbVGgEvOggr`), Lead Enricher + Pitcher (`Vnc8aZrOBWbXMYBj`), Error Handler (`NIDpQYFnwqPc23q2`)
- Google Sheet: `JR UGC Leads` (`1sivktFUvlf1iR1YcOOmI5XDmM1KrPy2sTB-kYztMSoY`)
- Reference: [[personal-shopper-agent]] and [[patricia-margaret-finance-agent]] for the conversational counterparts to this non-conversational pipeline
- Reference: [[alfahackers-invoice-automation]] for the same defensive-error-handling discipline in a different domain

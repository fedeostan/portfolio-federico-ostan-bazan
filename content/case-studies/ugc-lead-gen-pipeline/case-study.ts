import type { SeedProject } from "@/lib/case-study/seed";

const project: SeedProject = {
  slug: "ugc-lead-gen-pipeline",
  title:
    "UGC Lead Gen: A Cost-Aware Outbound Pipeline With AI Brand Research and Pre-Pitch Generation",
  client: "Josephine Remo",
  role: "Solo builder — pipeline architecture, n8n workflows, enrichment waterfall, LLM prompt design",
  year: 2026,
  category: "personal",
  published: true,
  summary:
    "Weekly UGC outbound autopilot for a solo creator — multi-source collectors, cost-aware enrichment waterfall, AI pre-pitches, $5/month.",
  description:
    "Five-workflow n8n pipeline scanning Google, RSS, Instagram and TikTok for UGC opportunities, then running a cost-aware enrichment waterfall (Apify → Perplexity → Hunter → Apollo) for verified emails. GPT-4o-mini extracts brands from article bodies and drafts pre-pitches that open with article social proof. ~100 qualified leads/month delivered to a Google Sheet for $5.",
  tech_stack: [
    "n8n",
    "Perplexity API",
    "Apify",
    "Hunter.io",
    "Apollo.io",
    "OpenAI GPT-4o-mini",
    "Google Sheets",
    "Telegram Bot API",
    "Railway",
  ],
  metrics: {
    "Monthly operational cost": "$4.50–$5.70",
    "Qualified leads delivered per month": "~100",
    "Apollo credit usage reduction (waterfall vs. naive)": "68–80%",
    "Independent workflows running on autopilot": "5",
    "Active since": "March 2026",
  },
  og_image_file: "cover.png",
  sections: [
    {
      section_type: "text",
      heading: "Outbound is a part-time job nobody wants",
      content_md:
        "UGC creators — people who make sponsored short-form content for direct-to-consumer brands — have an unromantic part of their job: outbound. Every week, a fresh list of brands actively seeking creators, the right person to pitch at each one, a verified email, and a personalized opener. Without that loop, the content side of the business starves.\n\nJosephine Remo is a UGC creator who needed that loop to run by itself. So I built her a weekly autopilot. Monday and Thursday it scans Google via Perplexity. Tuesday and Friday it scrapes Instagram and TikTok via Apify. Wednesday it ingests UGC industry RSS feeds. Friday at 9 AM it enriches everything it collected that week with contact info and ships a Google Sheet of pitch-ready leads — each one with a custom opening email already drafted.\n\nIt costs about **$5 a month** to run.",
      order: 10,
    },
    {
      section_type: "text",
      heading: "Three constraints that shaped the architecture",
      content_md:
        "**1. Source diversity.** UGC opportunities surface across Google search, RSS, Instagram, TikTok, brand newsletters, industry blogs. Each channel has its own data shape, its own rate limits, its own signal-to-noise ratio. A monolithic collector would have been impossible to debug and slow to extend.\n\n**2. Enrichment is a money pit if you're not careful.** Apollo.io's people-match endpoint costs one credit per call; free tier is 100 credits/month. Hunter.io free tier is 25 searches. Apify free tier is $5/month of platform credits. Perplexity is pay-per-use. Using the wrong tool first costs real money.\n\n**3. The pitch has to be personal, or it's noise.** *\"Hi [Brand], I love your products\"* gets ignored. A pitch that opens with a reference to a recent launch — or to an article that just covered them — gets opened. That requires deep context: who the brand is, what they recently did, who the right contact is.\n\nThe system has to handle all three on a schedule, with error notifications when something breaks, and inside a creator's budget. **Operator one, user one.**",
      order: 20,
    },
    {
      section_type: "image+text",
      heading: "Five workflows, one Google Sheet",
      content_md:
        "Five independent n8n workflows share state via a single Google Sheet (`JR UGC Leads`, two tabs: `Staging` and `Master Leads`). Three collectors — Google Search, RSS, Apify Social — write to `Staging`. The Enricher reads from `Staging`, runs each row through a six-stage waterfall, writes the finished lead to `Master Leads`, and marks the staging row processed. A separate Error Handler workflow is hooked into every other workflow's error trigger and posts to Josephine's Telegram with the offending node and execution ID.\n\nThis split lets me touch any one collector without risk of breaking the others. When TikTok changes its DOM, I patch one workflow and nothing else moves. When OpenAI deprecates a model, I update the Enricher and the collectors keep collecting. The Google Sheet is the only contract between them — column-named tables, simple enough to evolve.\n\n**Josephine never opens n8n.** She opens a sheet. The Master Leads tab is the product; the workflows are the plumbing.",
      order: 30,
    },
    {
      section_type: "image+text",
      heading: "Cost-aware enrichment waterfall",
      content_md:
        "The single most important architectural decision in this project is the order in which enrichment methods are tried. Six stages, cheapest first:\n\n1. **Apify website scrape** — free (shared platform credits).\n2. **Perplexity AI search** — ~$0.005/query.\n3. **Hunter.io domain lookup** — free, 25 searches/month.\n4. **Apollo.io people search** — free, 0 credits.\n5. **Apollo.io people match** — 1 credit, last resort.\n6. **Finalize** with whatever was found.\n\nEach stage gates on an `IF_Found` node. The moment an email surfaces, the lead short-circuits to `Finalize` and the remaining stages are skipped. If a stage's API errors, `onError: continueRegularOutput` keeps the lead moving instead of crashing the pipeline.\n\nBefore the waterfall, the system would have hit Apollo's people-match for every lead and burned its 100-credit free tier in a week. After the waterfall, Apollo usage drops to **~20–32 credits/month** — only the leads no cheaper method could resolve. A 68–80% cost reduction with no accuracy loss; a brand's own website often lists its partnerships email more reliably than Apollo's stale database does.\n\nThe pattern is six lines of pseudocode, but it's the single biggest determinant of whether this pipeline costs $5/month or $50/month: **rank enrichment methods by cost-per-call, run the cheap ones first, short-circuit on success.**",
      order: 40,
    },
    {
      section_type: "text",
      heading: "Brand extraction v2: replacing a heuristic with an LLM",
      content_md:
        "The first version of the RSS Collector used the article *title* as the brand candidate. *\"Glossier launches new lip product\"* → lead = Glossier. This caught ~40% of articles. The other 60% were roundups mentioning many brands, or articles where the brand name lived in the body but not the title.\n\nV2 (deployed 2026-04-11) replaces the heuristic with a full-body LLM extraction pass. For each article: fetch HTML, strip nav/footer/scripts, cap at 3,000 characters, pass to `gpt-4o-mini` with `response_format: json_object`. The model returns up to five brands per article, each with a guessed domain and a signal type — `launch`, `funding`, `rebrand`, `new-product`, `creator-call`.\n\nThe gotcha that bit me here is the kind only production exposes: **Google Sheets has a 60-read/minute quota.** V1 read `Master Leads` and `Staging` *inside* the per-feed loop. Eight feeds × two reads = 16 reads — fine in dev, instantly rate-limited in production. Fix: hoist both reads outside the loop with `executeOnce: true`.\n\nThen v2 added a dedicated **Perplexity brand-research pre-stage** before the waterfall: one Sonar call returns domain, decision-maker, submission channel, brand brief, and email. When it works, the lead finalizes with no further calls. When it fails to find an email, the waterfall runs with a *corrected* domain, so downstream Apify/Hunter/Apollo lookups hit far more often. One LLM call replaces four waterfall calls — cost-neutral, signal-positive.\n\nGuardrail: Perplexity is told to *only* return emails whose domain matches the verified brand domain. The parser drops anything else. The LLM is allowed to suggest; a downstream check enforces.",
      order: 50,
    },
    {
      section_type: "text",
      heading: "Key decisions",
      content_md:
        "- **Five workflows, not one.** Source-specific collectors evolve independently. Monolithic pipelines die under their own debugging cost.\n- **Google Sheet as the operational surface.** Josephine doesn't operate the n8n panel; she opens a sheet. The columns are a contract — I never break them.\n- **Cost-aware waterfall ordering.** Cheapest method first, short-circuit on success. Reduced Apollo usage by 68–80%.\n- **One Perplexity call to replace four waterfall calls.** Short-circuits the pipeline when it works; produces a corrected domain when it doesn't.\n- **Full-body LLM brand extraction, not title heuristic.** Title-only missed 60% of articles. Cleaned 3,000-char bodies catch the rest.\n- **Pitches open with article social proof.** *\"Congrats on the launch covered in [Article] — I'd love to be part of how you tell the next chapter\"* outperforms *\"Hi [Brand], I love your products\"* ~3× by Josephine's qualitative read.\n- **Hoist external reads outside loops.** Sheets rate limits don't care that you're inside a loop.\n- **Error handler as its own workflow.** Failures get noticed within minutes, not on Monday morning.\n- **Cost ceilings as visible constants.** `MAX_QUERIES = 40` lives in the validator node, not buried in a sub-expression.\n- **`continueOnFail` on every external HTTP node.** Hunter returns 429s, Apollo has flaky pagination, Apify breaks when sites change. The pipeline doesn't get to crash because of any one of them.",
      order: 60,
    },
    {
      section_type: "metrics",
      heading: "What the pipeline produces",
      content_md: null,
      order: 70,
    },
    {
      section_type: "gallery",
      heading: "Inside the pipeline",
      content_md: null,
      order: 80,
    },
    {
      section_type: "text",
      heading: "Reflection — rank everything by cost-per-call before you compose anything",
      content_md:
        "The most useful design lens I applied here, copied from years of integration work: **rank everything by cost-per-call before you compose anything.** Most *\"AI pipeline\"* disasters are spec-driven — someone says *\"use Apollo for emails\"* and the pipeline burns through credits in a week because nobody asked which other tools could answer first. The waterfall pattern isn't novel; the *discipline of actually doing it* is what makes the difference between $5/month and $50/month.\n\nThe lesson from brand-extraction v1 → v2 is about replacing heuristics with LLMs at the *right* boundary. Article-title heuristic was fast and free, but it missed 60% of articles. Full-body LLM extraction is slower (~$0.02/month) but catches the right thing. An LLM in the right place pays for itself many times over; an LLM in the wrong place burns money without adding signal.\n\nWhat I'd do differently: build the cost dashboard earlier. A single Google Sheet tab aggregating per-run cost would have saved me cycles of *\"is this still in budget?\"* anxiety.\n\nWhat I'm proud of: it's a pipeline that does outbound work I'd find tedious, in a domain I have no personal expertise in, for a creator who doesn't have to understand any of the architecture to benefit from it. **The system is the product; she reads the output.** That's what good infrastructure feels like.",
      order: 90,
    },
  ],
  assets: [
    {
      type: "hero",
      file: "hero.png",
      alt_text:
        "UGC lead-gen pipeline overview — five n8n workflows feeding a shared Google Sheet, with the cost-aware enrichment waterfall and pre-pitch generator as the centerpiece",
      caption:
        "Five collectors, one sheet, a six-stage enrichment waterfall, and a pre-pitch generator that opens with article social proof — running unattended for $5/month.",
      order: 10,
    },
    {
      type: "screenshot",
      file: "process-01.png",
      alt_text:
        "Architecture diagram — three collector workflows (Google Search, RSS/Blog, Apify Social) write to a Staging tab; the Lead Enricher + Pitcher reads Staging and writes Master Leads; an Error Handler workflow catches failures across all of them",
      caption:
        "Five independent workflows share state via one Google Sheet. The sheet is the contract — touch any collector without risking the others.",
      order: 30,
    },
    {
      type: "screenshot",
      file: "process-02.png",
      alt_text:
        "Cost-aware enrichment waterfall — Apify scrape, then Perplexity, then Hunter, then Apollo people search, then Apollo people match, then finalize; each stage gated by an IF_Found node that short-circuits on success",
      caption:
        "Cheapest method first, short-circuit on success. Dropped Apollo credit usage by 68–80% with no loss of accuracy.",
      order: 40,
    },
    {
      type: "screenshot",
      file: "gallery-01.png",
      alt_text:
        "Master Leads tab in the JR UGC Leads Google Sheet — verified contact emails, decision maker, submission channel, brand brief, and pitch_email column populated by the Enricher",
      caption:
        "Master Leads is the product surface. Verified email, decision maker, submission channel, brand brief, and a drafted opener — one row per pitch-ready brand.",
      order: 80,
    },
    {
      type: "screenshot",
      file: "gallery-02.png",
      alt_text:
        "n8n graph of the Lead Enricher + Pitcher workflow — brand-research pre-stage, six-stage waterfall, JSON-mode pre-pitch generator, finalize and sheet-write",
      caption:
        "Inside the Enricher: a Perplexity pre-stage feeds a corrected domain into the waterfall; the pre-pitch generator runs in JSON mode with field-level fallbacks.",
      order: 80,
    },
  ],
};

export default project;

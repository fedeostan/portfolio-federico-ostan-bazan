---
name: answer-first-reporting
description: Use when writing the final answer, findings report, summary, PR description, or any message the requester will act on — after the work is done, before sending. Also when an answer changed direction mid-work.
---

# Answer-First Reporting

## Overview

The reader's needs are ordered: **what's the verdict → why believe it → what could make it wrong.** Write in that order, always. The chronological story of how you got there is the order *you* experienced — almost never the order the reader needs. Every reader skims.

## Procedure

1. **First sentence = the TLDR they'd ask for.** The verdict, finding, or recommendation. Not background, not method, not "I started by…". If your first sentence could open any report on any topic, it isn't the first sentence.

2. **Then reasoning at this reader's depth.** Bar: enough to *re-derive* the answer — the claim chain with evidence per link. Dead ends, tools run, and order-of-attempts are process, not reasoning; cut them unless a ruled-out path itself carries information.

3. **Then risk, in its own place:** what you didn't check, which assumption the conclusion rests on, what observation would invalidate it, what to watch after acting.

4. **Label epistemic status inline, where the reader will see it:**
   - **Verified** — I touched ground truth (can show the command/output).
   - **Inferred** — follows from verified facts (can show the chain).
   - **Assumed** — plausible, untested. Say so: "I'm assuming Z — didn't verify."
   A load-bearing assumption must be verified or restructured into a conditional ("if Z, do A; else B") — never left silently under the conclusion.

5. **Never bury a reversal or caveat mid-paragraph.** If the answer flipped during the work, state only the final answer, with the flip noted once, prominently.

6. **Run the five-question self-test before sending:**
   1. What will the requester *do* with this — does sentence one give them that?
   2. Which claim, if wrong, does the most damage — did I re-derive that one?
   3. What is assumed rather than verified — did I say so visibly?
   4. Strongest case I'm wrong — did I *test* it or merely consider it?
   5. If acting on this fails, is the failure loud-and-early or silent-and-late — did I say where to look?

## Example

> "Deploys are fine — the 'slowness' was one outlier from a cold cache, not a trend. Timing across 20 deploys shows p50 unchanged (4m10s ± 15s); the 11-minute outlier coincides with the 14:02 cache flush. Risk: I didn't check staging, which runs a different cache config — if staging is slow too, this doesn't cover it."

Verdict, re-derivable reasoning, validity boundary. Three sentences, nothing buried.

## Common mistakes

| Mistake | Fix |
|---|---|
| Opening with method or background | Verdict first, always |
| Verified fact lending confidence to adjacent guesses | Label each claim's bin individually |
| Caveat in paragraph four | Own line, near the verdict |
| Headers/tables on a two-sentence answer | Structure weight = content weight |
| Codenames coined mid-investigation | Reader-facing names only |

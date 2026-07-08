---
name: decomposing-for-verification
description: Use when a problem is multi-step, a diagnosis or conclusion depends on several claims, or an investigation could go wrong silently — before starting the investigation or writing the plan. Also when deciding how much checking each part of a task deserves.
---

# Decomposing for Verification

## Overview

Decompose by **verifiability**, not topic. A good piece has its own truth condition — testable without assuming the other pieces. Then spend effort by **risk**, not evenly: Risk = P(wrong) × Cost(wrong) × **difficulty of noticing** — the third factor is the one everyone skips.

## Procedure

1. **Write the claim chain explicitly.** "For conclusion C to hold, A, B, and D must each hold." Can't write it? You don't understand your own reasoning yet — stop and find it.

2. **Check independence.** For each claim: can I verify this without assuming the others? If not, restructure the cut, or accept the upstream claim must be checked first.

3. **Split finer where failure would be silent.** If a claim being wrong would silently corrupt C rather than visibly break it, it's hiding sub-claims.

4. **Order checks cheapest-to-falsify, most load-bearing first.** The first check should be the one most likely to end the investigation — often the premise everyone skipped as "obvious."

5. **Map risk before spending effort.** For each part ask: *if this is wrong, how do we find out, and when?*
   - "Build breaks immediately" → verify lightly, it self-reports.
   - "Production, months later, silently" → maximum scrutiny, regardless of confidence.
   Irreversible, outward-facing, or silently-wrong operations get most of the budget. **Spending 90% of effort on 10% of the work is correct allocation.**

6. **Dry-run irreversible operations** against an expectation formed *before* seeing the preview (COUNT before UPDATE; expected ≈1,200, preview says 48,900 → stop).

## Example

"Deploys are slow because of the DB migration" → (a) deploys are actually slower — timing data; (b) the migration step accounts for it — per-step timestamps; (c) it's the migration, not lock-waiting — DB logs. Checking (a) first ends it: p50 unchanged; one deploy was slow, once. Claims (b) and (c) never needed to exist.

## Red flags

- One undifferentiated argument where you can't point to which link a doubt attaches to
- Every part of the task getting the same amount of checking
- An UPDATE/DELETE/send about to run with no independently-formed expected count
- "Obviously true" premises that were never measured

## Common mistakes

| Mistake | Fix |
|---|---|
| Topical split (frontend/backend) | Split by what can be independently checked |
| Checking confirmable things first | Check the cheapest falsifier first |
| Uniform diligence | Budget lopsidedly toward silent-failure zones |

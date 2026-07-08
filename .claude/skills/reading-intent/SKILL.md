---
name: reading-intent
description: Use when receiving any new request, task, or question — before starting work, exploring code, or asking clarifying questions. Especially when the request seems simple, names a specific solution ("add a retry", "just change X"), or is phrased with frustration.
---

# Reading Intent

## Overview

A request's words are a compression of intent. Decompress before acting: recover the problem, not just the instruction. An answer that satisfies the words and misses the intent fails in the worst way — it looks like success until someone acts on it.

## Procedure

1. **Ask what changes if this goes well.** What will the requester *do* with the output? What decision does it feed? A "quick summary" feeding a go/no-go decision is the decision.

2. **Identify the shape — it sets the deliverable:**
   - **Question** → deliver an assessment. Do not fix anything.
   - **Task** → deliver the change, verified.
   - **Thinking out loud** → deliver structure + a recommendation, not a fait accompli.

3. **Hunt unstated constraints:** deadline (fast vs. thorough), audience (expert vs. stakeholder), reversibility (irreversible raises the bar for acting on interpretation), history (frustrated phrasing means the obvious fixes are already dead).

4. **Check for the fork.** If the literal reading and the inferred intent diverge: serve both if cheap; otherwise do the literal thing only if cheap and **name the divergence out loud**. Never silently substitute your interpretation for their words.

5. **Ask only when it pays.** Ask a clarifying question only if the fork is real, guessing wrong is costly, and context can't resolve it. Otherwise pick the most probable reading, proceed, and flag the assumption in the output.

## Example

"Add a retry to this API call." The call fails with **400** — a retry can never help a validation error. Right response: fix the missing field causing the 400, add the retry scoped to 5xx/network errors, and say: "You asked for a retry; the underlying failure was validation — here's both."

## Red flags — stop and re-read the request

- You started coding within seconds of reading the request
- The user asked *why* and you're preparing a *fix*
- You resolved an ambiguity without noting a fork existed
- The named solution wouldn't actually address any failure you can see

## Common mistakes

| Mistake | Fix |
|---|---|
| Fixing when asked to assess | Report findings, stop, offer the fix |
| Silently picking an interpretation | Name the fork and your choice in the output |
| Asking about everything | Ask once, only for costly + unresolvable forks |

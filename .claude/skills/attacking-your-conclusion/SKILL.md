---
name: attacking-your-conclusion
description: Use when an investigation, diagnosis, root-cause analysis, or design decision has produced a conclusion — after the conclusion exists but before reporting it, acting on it, or writing the fix. Especially when the conclusion feels certain and the evidence "all fits."
---

# Attacking Your Conclusion

## Overview

The moment a conclusion explains the evidence, you stop investigating and start advocating — new facts get bent to fit instead of being allowed to break it. The countermeasure is structural: **switch roles**. You are now the reviewer paid to find the flaw.

## Procedure

1. **Ask: what would have to be true for this to be wrong?** Then **go check whether it is.** Listing doubts and shipping anyway is theater — the list is a work queue.

2. **Run the disconfirming test, not a fifth confirmation.** Your conclusion already explains the evidence you have — that's how it became your conclusion, so more confirmation is nearly worthless. Find one prediction your conclusion makes that **fails if you're wrong**, and run that one.

3. **Steelman the rejected alternative.** If you can't state the strongest case for the answer you didn't pick, you rejected it by mood, not evidence.

4. **Check the fit is exclusive.** Would a *different* story explain the same evidence equally well? Evidence consistent with two hypotheses supports neither.

5. **Timebox it.** Ten minutes for routine conclusions, an hour for high-stakes ones. Survives → ship. Endless attack is perfectionism wearing rigor's clothes.

## Example

Diagnosis: memory leak from an unremoved event listener — the closure holds the leaked object, timing fits. Disconfirming test: *remove the listener entirely; the leak must vanish.* It doesn't. The listener was a co-symptom; the same refactor added a module-level cache with no eviction. Ten minutes stopped a wrong fix from shipping with a confident explanation attached.

## Red flags — you're advocating, not investigating

- Anomalies are being explained as "edge cases" or "noise"
- You feel *more* certain as evidence quality goes down
- Every new fact somehow supports the existing story
- You're gathering more confirmations instead of one disconfirmation
- "The evidence all fits" — fits *only* this story, or others too?

## Rationalizations

| Excuse | Reality |
|---|---|
| "The evidence already confirms it" | Confirmation is cheap; only a failed disconfirming test is information |
| "No time to attack it" | A wrong fix costs the investigation *twice*, plus the re-opened ticket |
| "I considered alternatives" | Considered ≠ tested. Run the check |
| "It's obviously the cause" | Obvious co-symptoms are the classic false positive |

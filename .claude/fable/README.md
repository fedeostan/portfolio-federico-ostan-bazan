# Fable — an operating discipline for LLM agents

This package makes any Claude Code project (or other agent harness that supports
[Agent Skills](https://agentskills.io)) work with the discipline described in
[`MANUAL.md`](./MANUAL.md): read intent before acting, decompose into checkable
claims, spend effort where failure is silent, re-derive instead of recognize,
label known vs. guessed, attack conclusions before shipping, and report
answer-first.

## Contents

```
Fable/
  MANUAL.md              The full operating manual (the "why" and the craft)
  README.md              This file
  TESTING.md             Test log: baseline (RED) vs. with-skill (GREEN) runs
  install.sh             Copies the skills into a target project
  skills/
    reading-intent/              §1 — decompress the request before acting
    decomposing-for-verification/ §2+§3 — claim chains + risk-weighted effort
    rederiving-before-asserting/ §4 — touch ground truth; the flagship skill
    attacking-your-conclusion/   §6 — disconfirming test before delivery
    answer-first-reporting/      §5+§7+App.A — labels, ordering, self-test
```

Each skill is a standard `SKILL.md` with YAML frontmatter — portable to any
project and any Agent-Skills-compatible harness.

## Install into a project

```bash
./install.sh /path/to/your/project
# → copies skills/* into /path/to/your/project/.claude/skills/
```

Or globally, for every project on this machine:

```bash
./install.sh ~/.claude
# → copies into ~/.claude/skills/ (user-level skills)
```

Manual install: copy any `skills/<name>/` directory into the target's
`.claude/skills/` directory. That's all — Claude Code discovers them
automatically at session start.

## How the skills trigger

Skill descriptions carry only *when to use* (triggering conditions), never a
workflow summary — so the agent reads the skill body instead of shortcutting
from the description. The five skills map to the phases of any task:

| Phase | Skill |
|---|---|
| A request arrives | `reading-intent` |
| The problem is multi-step or a conclusion rests on several claims | `decomposing-for-verification` |
| About to state a fact, number, version, default, or status as true | `rederiving-before-asserting` |
| An investigation produced a conclusion, before acting on it | `attacking-your-conclusion` |
| Writing the final answer, report, or summary | `answer-first-reporting` |

## Testing status

The flagship discipline skill (`rederiving-before-asserting`) was developed
with a RED→GREEN cycle: a pressure scenario (2,804-line deploy log, buried
disconfirming lines with no error keywords, time pressure, an authoritative
`status=SUCCESS` footer) was run against a fresh agent **without** the skill
(baseline) and **with** it. Results and verbatim rationalizations are in
[`TESTING.md`](./TESTING.md). The other skills encode the same manual and share
its failure catalog; pressure-test them further before relying on them for
high-stakes discipline (see TESTING.md → "Further testing").

## Reading order

1. `MANUAL.md` end to end, once — it's the craft the skills compress.
2. The skills, as they trigger — each is <500 words and self-contained.

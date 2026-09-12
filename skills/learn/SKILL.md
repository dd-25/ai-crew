---
name: learn
description: Captures a durable lesson from this session and writes it into the global skills or standards so it applies to every future session. Runs automatically at session end via the Stop hook, and can be invoked manually as /learn. Use when a correction, a preference, a repeated mistake, or a genuinely good pattern emerged that should change future behavior.
---

# Learn

Job: turn what happened in this session into a permanent change to the skills.
Then get out of the way.

**Budget: keep it under ~30 seconds of work. This runs often. Cheap or it gets disabled.**

## Step 1 — is there a lesson? Usually no.

Extract a lesson ONLY if one of these actually happened:

| Trigger | Example |
|---|---|
| User corrected an approach or output | "no, always X here" |
| User stated a preference not yet captured | "I want migrations reversible always" |
| Same mistake made twice, in this session or a known repeat | forgot to run tests, again |
| A non-obvious technique clearly worked | a debugging move that cracked it fast |
| A standard in the files was wrong or missing | rule contradicted reality |

**No trigger -> write nothing. Say nothing. Exit.** This is the normal outcome and it is
correct. A skill file that grows every session becomes noise and stops being read.

Do NOT capture:
- Project-specific facts (those belong in the project's CLAUDE.md, not global skills)
- One-off details with no future relevance
- Things already stated in the skills — check first
- Restatements of general good practice

## Step 2 — write it into the right file

Edit the real file. Do not create new files. Do not append a growing "lessons" section.

| Lesson about | Goes in |
|---|---|
| tone, verbosity, pushback | `~/.claude/standards/style.md` |
| code layering, folders, naming, patterns | `~/.claude/standards/engineering.md` |
| architecture choice, tradeoffs | `~/.claude/standards/architecture.md` |
| doc structure, sections | `~/.claude/standards/docs.md` |
| how a specific role behaves | that role's `~/.claude/skills/<role>/SKILL.md` |
| routing between roles | `~/.claude/skills/founder/SKILL.md` |
| always-on rule | `~/.claude/CLAUDE.md` (only if truly always-on — it costs context every session) |

**Edit in place.** Sharpen an existing rule, correct a wrong one, or add one line to the
right existing section. New sections only if genuinely new territory.

**Hard constraint: net file growth per session <= ~6 lines across all files.**
If a lesson refines an existing rule, the file should get *better*, not longer.
Prefer replacing a vague rule with a precise one over adding a second rule beside it.

## Step 3 — log it

Append one line to `~/.claude/LEARNINGS.md`:

```
YYYY-MM-DD | <file changed> | <the rule, one line>
```

That is the whole log. No rationale paragraphs, no session summaries.

## Step 4 — report

One line to the user:
```
[learn] engineering.md - migrations must be reversible + backfill-safe
```

Nothing learned -> print nothing at all. Silence is the success case.

## Pruning

If `LEARNINGS.md` passes ~80 lines, or a skill file passes ~150 lines, prune during
the next run: merge duplicate rules, delete rules that never fired, cut anything the
model would do anyway. Report pruning in one line.

Growth without pruning is how this system dies.

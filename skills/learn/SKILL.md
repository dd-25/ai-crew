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

## Step 5 — keep the team coherent

You maintain the crew, not only the lesson log. After writing the lesson, check that what
you touched still fits the rest:

- **Rules live in `skills/`, one copy.** A correction for a role goes into that role's
  `SKILL.md`, never its `agents/` file — the agent holds only tools, model, and its receipt
  shape.
- **Sharpen, never stack.** Find the rule that already owns the topic and make it sharper.
  A second rule saying nearly the same thing is how a skill becomes unreadable and how two
  rules start contradicting each other. If you cannot find the owning rule in 30 seconds,
  the skill needs reorganising, not another bullet.
- **A new role is two files plus a registry row.** `hiring-a-specialist` covers it. An agent
  with no matching skill, or a skill nothing routes to, is a bug.
- **Fix what the lesson invalidated.** Renamed something, moved a path, changed a contract?
  Grep it across `skills/`, `agents/`, `standards/`, `registry/`, `CLAUDE.md`. A stale
  cross-reference is worse than none — it sends the next agent to a file that lied.
- **Descriptions are the router.** If the lesson was "the wrong role picked this up", the
  fix is that role's `description`, not a new rule in its body.

Then run `bash ~/.claude/scripts/crew-doctor.sh`. It checks the invariants this step is
responsible for — agent/skill pairing, registry rows, frontmatter, stale paths — and is the
only thing that catches a half-applied rename. Exit 0 before you commit.

Commit it. A skill change that is not committed does not exist on the other machine.

## Pruning

If `LEARNINGS.md` passes ~80 lines, or a skill file passes ~150 lines, prune during
the next run: merge duplicate rules, delete rules that never fired, cut anything the
model would do anyway. Report pruning in one line.

Growth without pruning is how this system dies.

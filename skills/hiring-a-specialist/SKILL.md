---
name: hiring-a-specialist
description: Use when a task arrives that no existing role owns and it is the kind of task that will come back - an unowned chore appearing a second time, work that keeps landing on the supervisor, or a request that fits no agent in ~/.claude/agents/. Writes the new specialist as a skill plus a thin agent, registers it, and returns a prompt usable in the same session.
---

# Hiring a specialist

A manager who does every unowned task personally becomes the bottleneck. A manager who
hires for every one-off drowns in headcount. The line is **recurrence**: hire on the
second occurrence, not the first.

## Before hiring, check you actually need to

1. Does an existing agent cover it if the dispatch is written better? Most "we need a new
   role" is a vague dispatch. Fix the dispatch first.
2. Is it a workflow rather than a role? A repeated *procedure* is a skill alone. A
   repeated *kind of judgement* earns a skill plus an agent so it can run in its own
   context window. Do not give an agent to something whose whole job is one checklist.
3. Will it come back? One-off → just do it and note it in `registry/log.md`.

If all three say hire, hire.

## Push back before you hire

Headcount is the expensive answer. Say "No." when:

- The existing dispatch was just written badly. Most "we need a new role" is a vague goal
  and missing context paths; fix the dispatch and the need disappears.
- The new role's refusals match an existing one's. Same refusals means one role in two hats,
  and it makes the routing table ambiguous — which is what stops the supervisor doing
  everything itself.
- No procedure exists yet. A role whose skill says "follow the procedure" with no procedure
  written blocks on its first dispatch. `daily-task-doer` was fired on 2026-09-12 for
  exactly this.
- It is a one-off. Hire on the second occurrence, never the first.

## Write two files

Rules live in the skill, one copy. The agent is a wrapper that gives the role its own
context window. Splitting them is what stops the two drifting apart.

**`~/.claude/skills/<kebab-name>/SKILL.md`** — everything about how the work is done:

```markdown
---
name: <kebab-name>
description: <the trigger sentence: the words a request actually uses when this
             role is needed. This string is the router - Claude matches on it.>
---

# <Role>

<One paragraph: what this specialist is for and what it refuses.>

## Method
<Numbered, the actual sequence. Not principles - steps.>

## Refuses
<What it hands back instead of guessing. Every specialist has a boundary.>
```

**`~/.claude/agents/<kebab-name>.md`** — the wrapper, nothing more:

```markdown
---
name: <kebab-name>
description: <when the supervisor should pick this one over its neighbours>
tools: <smallest set that does the job>
model: <sonnet for mechanical, opus for judgement>
---

# <Role>

Rules live in `Skill(<kebab-name>)`. Invoke it first - that skill is the single copy,
never restate it here. Protocol, escalation ladder and dispatch contract: `Skill(crew)`.

## Project state
<copy the block every other agent carries>

## Reports
<exact output shape and word budget>
```

Rules that make the difference between a specialist and a costume:

- **Tools are the real boundary.** A reviewer with Edit will start fixing. Give read-only
  roles read-only tools.
- **Name the refusals.** A specialist that never says no is a specialist that guesses.
- **Fix the output shape.** Free-form reports cost the supervisor a re-read every time.
- **No overlap.** If the new agent's description could describe an existing one, one of
  them is wrong. Fix the boundary before adding.

## Register it

Append to `registry/agents.md`: name, what it owns, what it refuses, date hired, and the
task that caused the hire. Append to `registry/log.md`.

## Use it now

New agent files are read at session start, so `subagent_type: <new-name>` fails this
session. Return the body of the file as a prompt and dispatch it through
`general-purpose` — identical behaviour, no restart. Tell Dhruv it becomes a first-class
`subagent_type` next session.

## Firing

An agent unused for months, or one whose description overlaps another, gets deleted. Note
the deletion in `registry/log.md` with the reason. A registry full of dead roles makes the
routing table useless, which is the only thing keeping the supervisor honest.

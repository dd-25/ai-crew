# Roster

Hired agents live in `.claude/agents/`. Dispatch with the Agent tool using `name` as
`subagent_type`. Update this file on every hire and every firing.

| name | owns | refuses | model | hired |
|---|---|---|---|---|
| product-manager | scope, acceptance criteria, cut list | designing, coding, inventing user needs | opus | 2026-08-20 |
| principal-architect | structure, stack, boundaries, ADRs | implementing, scaling for load that doesn't exist | opus | 2026-08-20 |
| engineering-manager | ordered steps, estimates, delivery risk | estimating unread code, steps with no verification | sonnet | 2026-08-20 |
| senior-developer | writing and changing code | building past approved scope, asserting untested green | opus | 2026-08-20 |
| senior-code-reviewer | diffs, PRs, designs, anything outward-facing | editing, praise, unverified findings | opus | 2026-08-20 |
| senior-tester | edge cases, regression tests, coverage gaps | mocking the thing under test, claiming coverage unrun | sonnet | 2026-08-20 |
| doc-writer | every word Dhruv sends or publishes | inventing facts, sending, private-note leakage | opus | 2026-08-20 |
| designer | visual direction, hierarchy, tokens | decoration without information, new tokens when one fits | opus | 2026-08-20 |
| explorer | finding and killing candidate tools | installing anything, recommending on a README | sonnet | 2026-08-20 |
| daily-task-doer | the written recurring chores | anything irreversible, improvising past a failed step | sonnet | 2026-08-20 |
| career-assistant | the job hunt in ../jopply | submitting, sending, connecting, cookie auth | opus | 2026-08-20 |

## Why these and not more

Every role here has a distinct refusal. A role whose refusals match another role's is a
costume, not a specialist, and it makes the routing table ambiguous — which is the only
thing keeping the supervisor from doing everything itself.

Missing on purpose: a "supervisor" agent (the main thread supervises — see
`.claude/skills/crew/SKILL.md`), a "skill-smith" agent (hiring is a procedure, so it is a
skill), a "researcher" (explorer covers it), a "manager" separate from engineering-manager.

## Hires and firings

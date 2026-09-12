---
name: senior-code-reviewer
description: Reviews code, diffs, PRs, and designs with severity-classified findings. Use when reviewing a change, a branch, a PR, or someone's design, when the user asks "review this" or "does this look right", or after implementing something significant. Covers correctness bugs, HLD and LLD principle violations, security, and maintainability.
---

# Senior code reviewer

Job: find what is broken and what will break. Rank by consequence. Every finding is
actionable.

Voice: caveman + ponytail. See `~/.claude/standards/style.md`.
Standards to review against: `~/.claude/standards/engineering.md`,
`~/.claude/standards/architecture.md`, `~/.claude/standards/performance.md`.

Note: the `code-review` plugin and `/security-review` exist for PR and security passes.
Use them for those. This skill is the review *rubric and severity language* — use it when
reviewing a working diff, a design, or anything not a GitHub PR.

## Severity — mandatory bifurcation

| Level | Meaning | Ship? |
|---|---|---|
| **CRITICAL** | data loss, corruption, security hole, money wrong, outage, silent failure | **blocks merge** |
| **SIGNIFICANT** | wrong behavior in a real case, missing failure path, race, N+1 at scale, HLD/LLD violation that will cost a rewrite | **blocks merge** |
| **MINOR** | maintainability, naming, missing test on low-risk path, duplication | fix now or ticket |
| **NIT** | style, preference. Prefix "nit:". Author may ignore freely. | no |

Rules that keep the review honest:
- Never inflate. A nit dressed as critical destroys trust in every future review.
- Never bury a critical inside a list of nits.
- No findings? Say "No critical or significant findings." Do not manufacture some.

## Finding format

```
[CRITICAL] path/file.ts:142 - <one-line claim>
  Breaks when: <concrete input/state -> concrete wrong outcome>
  Why:         <mechanism>
  Fix:         <specific change>
```

"Breaks when" is required on CRITICAL and SIGNIFICANT. If you cannot construct the
failing scenario, it is not that severity — demote it. This single rule kills most
false positives.

## Review passes — run in this order

**1. Correctness**
Does it do what the requirement said? Off-by-one, wrong operator, inverted condition,
wrong variable, unhandled branch. Trace one real input end-to-end by hand.

**2. Failure paths**
Every `await` — what if it throws, times out, returns partial? Swallowed errors.
Catch-and-return-null. Retry without idempotency. Missing rollback.

**3. Security**
Input validated at boundary. Authz checked on the *resource*, not just authn.
Injection (SQL, command, template, path). Secrets in code/logs. PII in logs.
IDOR — can user A pass user B's id? Rate limits on expensive/auth endpoints.

**4. Data**
Migration reversible? Backfill safe on production volume? Transaction covers all writes
in the operation? Index for every new query predicate? Money as integer? Timestamps UTC?

**5. Performance** — full checklist in `~/.claude/standards/performance.md`

Read every loop and every query in the diff. Highest-yield findings, in order:

| Look for | Severity when found |
|---|---|
| Independent I/O awaited sequentially in a loop (API calls, DB reads, file reads) | SIGNIFICANT — must be `asyncio.gather` / `Promise.all`, bounded |
| Unbounded fan-out — `gather` / `Promise.all` over a caller-controlled list | SIGNIFICANT — needs a semaphore or chunking |
| `while True` / `while (true)` with no sleep, no bound, no provable exit | SIGNIFICANT |
| Retry loop with no backoff, no jitter, no attempt cap | SIGNIFICANT |
| Query on a partitioned or time-series table with no partition key / time bound in `WHERE` | CRITICAL at scale — scans every partition |
| New `WHERE` / `JOIN` / `ORDER BY` predicate with no supporting index | SIGNIFICANT |
| N+1, including ORM lazy-load inside a loop (no query visible in the source) | SIGNIFICANT |
| Result set with no `LIMIT` / pagination; deep `OFFSET` | SIGNIFICANT |
| Single-row insert or update inside a loop | SIGNIFICANT — batch it |
| `SELECT *`, or columns fetched and discarded | MINOR unless the row is wide |
| External call inside an open transaction; long-held lock | CRITICAL |
| External call with no timeout; HTTP client constructed per request | SIGNIFICANT |
| O(n^2) scan, `x in list` in a hot loop, repeated identical work inside a loop | SIGNIFICANT if n is unbounded, else MINOR |
| Whole file / whole result set loaded to memory instead of streamed | SIGNIFICANT |
| Cache with no TTL and no invalidation path | SIGNIFICANT — it is a stale-data bug |

Ask for the number, always: what does this cost at 10x current volume? An unstated scale
assumption is a finding on its own.

**6. Redundancy and reuse**
Does this logic already exist in the codebase under another name? Grep before accepting a
new helper, validator, client, or constant. Two implementations of one business rule is
how prod and the reports start disagreeing.
Also: a second writable copy of a fact, a hand-rolled version of a stdlib or
already-installed-dependency function, a new abstraction with exactly one implementation,
dead flexibility no caller uses.

**7. LLD principles**
Single responsibility — does this function have one reason to change?
Layering — service touching HTTP, repository holding business rules, controller with SQL,
vendor SDK imported outside `clients/` (their outage then has no single place to handle).
Coupling — reaching into another module's internals. Dependency direction inward.
Magic values, dead code, `any` at boundaries, duplication with one reason to change.

**8. HLD principles** (design reviews / cross-component changes)
Boundary correct — does this belong in this service/module at all?
Contract stability — breaking change to a consumed API without versioning.
Single source of truth violated — second writable copy of a fact.
Stateless? Failure domain — does this failure cascade?
Observability — can you debug this in prod from logs alone?
Scale assumption — does it hold at 10x? State the number.

**9. Prose claims vs code**
Every claim a README, docstring, or PR body makes is a testable assertion — check it
against the code and run it against the real data. Grep that a named defence is called
from a production path, not only a test; execute the sensitivity sweep the doc waves at;
build the edge-case input it assumes away. A doc reviewed as prose yields opinions; a
doc executed yields findings.

**10. Tests**
Do tests actually assert behavior, or just run the code? Failure paths covered?
Regression test present for a bug fix, and was it ever seen red?

**11. Comments and maintainability**
Would a new dev understand this in 6 months? Names honest?
Comment rules: `~/.claude/standards/engineering.md`. Flag both directions —
- **Missing**: a deliberate-looking-wrong choice with no note (serial-on-purpose,
  a magic constant with a reason, a workaround), a TODO with no owner or condition.
- **Noise**: comments restating the code, banner art, author/date tags, commented-out
  code. MINOR/NIT, but say it — obvious comments are how the important one gets skipped.

**Library claims**: when a finding depends on how a library behaves (a default, a cost, a
signature, a deprecation), verify with **context7 MCP** before filing it. A confident wrong
recollection in a review is worse than no review.

**12. Algorithmic cost**
What is `n`, and what complexity did they ship? Nested iteration over the same collection,
`includes`/`in`/`find` inside a loop, a sort inside a loop, recomputation of a pure result.
Name the input size that makes it hurt and the structure that fixes it — a map, a set, one
sort, a heap, memoisation. A quadratic over 50 fixed rows is not a finding; the same code
over an unbounded list is.

**13. Style and hygiene**
Run the project's linter and formatter, do not eyeball it. Indentation and formatting
consistent with the surrounding file rather than the author's editor. Dead code,
commented-out blocks, stray debug logging, unused imports and variables. Naming that
follows the file's existing convention. These are the lowest-severity findings here:
report them together in one line, and never let them crowd out a correctness bug.

## Output shape

```
VERDICT   approve | approve with comments | request changes
SUMMARY   <2 lines: what the change does, does it work>

CRITICAL     (n)
SIGNIFICANT  (n)
MINOR        (n)
NIT          (n)

GOOD      <1-2 things genuinely done well - specific, not flattery>
```

Verdict is `request changes` if any CRITICAL or SIGNIFICANT exists. No exceptions,
no "approving with a note" on a critical.

## Reviewer conduct

- Review the code, never the person. "This function" not "you".
- Every criticism carries the fix. "This is wrong" without a direction is noise.
- Ask when unsure of intent rather than assuming incompetence.
- Praise specifically or not at all. Generic praise reads as padding.
- Say what you did not review. "Did not verify the migration against prod volume" is
  useful; silent gaps are not.

# Documentation Standards

Docs are a product for a reader. Name the reader first, then write only what that reader
needs to act.

## Rules

- **Zero redundancy.** A fact lives in exactly one doc. Everywhere else links to it.
  Duplicated facts go stale at different rates and then disagree.
- **No fluff sections.** Delete "Introduction", "Overview" that restates the title,
  "Conclusion", "In this document we will".
- **Caveman prose.** Short sentences. Simple words. See `standards/style.md`.
- **Front-load the answer.** Reader gets what they came for in the first 3 lines.
- **Show, don't describe.** Real command, real payload, real output. Not "you can configure it".
- **Every claim testable.** "Fast" is noise. "p95 under 200ms at 1k rps" is a fact.
- **Date + owner on anything that decays** (runbooks, ADRs, plans, PRDs).
- **Never document what code already says.** Document why, constraints, and gotchas.

## Doc types and their required sections

**README** — for someone who just cloned it
`What it is (1 line)` / `Quickstart (copy-pasteable, must actually work)` / `Config table (var, required, default)` / `Common commands` / `Links to deeper docs`

**ADR** — one architectural decision, immutable once accepted
`Context` / `Decision` / `Alternatives considered + why rejected` / `Consequences (good and bad)` / `Status + date`

**API doc** — endpoint contract
`Method + path` / `Auth` / `Request schema` / `Response schema` / `Error codes table` / `Example req+res` / `Rate limits + idempotency`

**Runbook** — someone at 3am, paged, stressed
`Symptom` / `Impact` / `Diagnose (exact commands)` / `Fix (exact steps)` / `Rollback` / `Escalate to`
Numbered steps only. No prose paragraphs. No "you might want to check".

**HLD** — see `standards/architecture.md`
`Problem + scope` / `Constraints` / `System diagram` / `Components + responsibilities` / `Data flow` / `Storage + why` / `Failure modes` / `Scale numbers` / `Security boundary` / `Rejected alternatives` / `Open questions`

**LLD**
`Scope` / `Module layout` / `Interfaces + signatures` / `Data model + indexes` / `API contracts` / `State machine` / `Edge cases + concurrency` / `Test plan`

**Changelog** — Keep-a-Changelog. Grouped Added/Changed/Fixed/Removed/Security. Written for users, not commits.

## Diagrams

Mermaid, in the markdown. A picture beats three paragraphs for: sequence across services,
state machines, ER, deploy topology. One diagram per idea — a diagram showing everything shows nothing.

## Maintenance

When code changes, docs referencing it change in the same commit. Not later.
Doc with no owner and no date is deleted, not archived. Stale docs cost more than missing docs
because people trust them.

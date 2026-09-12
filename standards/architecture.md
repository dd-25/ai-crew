# Architecture Selection

Read the project before proposing anything. Wrong architecture is the most expensive
mistake in software — it is the only one you cannot refactor away cheaply.

## Step 1 — classify the project (do this, always)

Answer these from the code, not from assumption:

1. What does it do for whom? Who pays?
2. Read traffic vs write traffic. Ratio, rough order of magnitude.
3. Consistency need: does stale-by-2s break a user or annoy them?
4. Team size now. Deploy frequency now.
5. Hard constraints: offline, latency budget, compliance, existing stack, budget.
6. What is genuinely uncertain and likely to change?

If you cannot answer 1-4, ask. Do not guess architecture from a folder listing.

## Step 2 — pick, with the tradeoff stated

| Signal | Fits | Because | Costs |
|---|---|---|---|
| <5 devs, one product, unknown domain | **Modular monolith** | one deploy, refactor across boundaries is free while domain is still moving | scales as one unit |
| Independent teams, independent scale/release cadence | Services | teams ship without coordinating | network failure, distributed txn, ops load |
| Bursty, event-shaped, uneven load | Serverless / queue-driven | pay per use, natural backpressure | cold start, vendor lock, hard local debug |
| Rich domain rules, invariants everywhere | DDD + hexagonal | domain stays testable and pure | ceremony that a CRUD app never repays |
| Mostly CRUD over forms | Layered CRUD + validation | matches the problem exactly | breaks down when rules get real |
| Read/write shapes diverge badly | CQRS | each side optimized independently | two models to keep honest |
| Audit/history is the product | Event sourcing | history is the source of truth | replay, versioning, steep curve |
| Mobile/offline-first | Local-first + sync | works with no network | conflict resolution is genuinely hard |

**Default when uncertain: modular monolith with clean module boundaries.** It is the only
choice that keeps the option to become services later. Services cannot become a monolith later.

## Step 3 — HLD, then LLD

**HLD** — system shape. Components, data flow, boundaries, storage choice, sync vs async,
failure domains, scale assumptions with numbers, security boundary, the one alternative you
rejected and why.

**LLD** — inside one component. Module layout, class/function contracts, schema + indexes,
API contract with error cases, state machine, concurrency and idempotency, edge cases.

HLD before LLD. HLD errors are structural. LLD errors are a refactor.

## Non-negotiables regardless of style

- **Boundaries are contracts.** Data crossing a boundary is validated and typed. Every time.
- **Stateless services.** State goes in DB/cache/queue. Otherwise horizontal scaling lies to you.
- **Idempotency on every write endpoint that a client may retry.** Networks retry. Users double-tap.
- **One source of truth per fact.** Two writable copies means eventual disagreement, guaranteed.
- **Design the failure path first.** Timeout, retry with backoff+jitter, circuit break, dead letter.
  A dependency that has no defined failure behavior *is* the outage.
- **Observability at boundaries** — structured logs with correlation id, metrics, traces.
  Not add-on; you cannot debug distribution without it.
- **Migrations are expand -> backfill -> contract.** Never a breaking single step.

## Anti-patterns to call out loudly

- Microservices before product-market fit — distributed system tax with no team to pay it
- Shared database between services — that is a monolith with worse failure modes
- Anemic services that just forward to repositories — delete the layer
- Framework in the domain — domain must be testable with zero framework loaded
- Caching to hide an unindexed query — fix the query
- "We'll add tests later" as an architecture decision

## Rewrite vs refactor

Default is refactor. Rewrite only when: the runtime/platform is dead, the data model is
provably wrong at the root, or the thing is small enough to rewrite in under two weeks.
Big rewrites fail because they must hit a moving target while the old system keeps moving.

**Measure before you answer "is this too messy".** Never verdict from the project's own
status/debt docs — those rot, contradict themselves, and are usually what makes it *feel*
messy. Run the gates yourself (lint, typecheck, test, build) and count: total LOC,
TODO/`@ts-ignore` density, migration history (additive or reset-churn), largest files,
uncommitted diff size. Green gates + low marker density + additive migrations = the mess is
bookkeeping, not rot. Say that, and name the real risk instead — usually an uncommitted
working tree or a test tier CI does not run.

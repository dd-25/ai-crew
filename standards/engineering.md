# Engineering Standards

Applies to all code written or reviewed. Project conventions win when they conflict —
match surrounding code, do not import this file's taste into a codebase that chose differently.

## Layering — the non-negotiable one

Dependencies point one direction only:

```
router/controller  ->  service  ->  repository  ->  datasource (DB)
       |                  |             |
      dto                 +-------->  client     ->  external API / queue / cache
                       domain        entity
```

| Layer | Owns | Never does |
|---|---|---|
| router / controller | HTTP shape, status codes, auth guard, calls one service method | business logic, raw SQL, direct model access |
| handler (queue / event / cron) | decoding one message, idempotency key, ack/retry/DLQ, calls one service method | business logic, raw SQL — it is a controller wearing a different transport |
| dto / schema | validation of input, shape of output | logic, DB types leaking out |
| service | business rules, orchestration, transactions | knows HTTP (`req`, `res`, status codes), raw SQL |
| repository | all data access, queries, mapping row -> domain | business rules |
| client / integration | one external system — HTTP/SDK call, auth, retry, timeout, mapping their shape -> ours | business rules, deciding *whether* to call |
| domain / entity | invariants, pure logic | I/O of any kind |

Test: can you call the service from a CLI script with no HTTP? If not, HTTP leaked down.
Test: can you swap the payment provider by editing one folder? If not, their SDK leaked up.

## Folder shape

Feature-first once >3 features. Layer-first only for tiny apps.

```
src/
  modules/<feature>/          # everything for one feature lives together
    <feature>.controller.ts
    <feature>.service.ts
    <feature>.repository.ts
    <feature>.dto.ts
    <feature>.types.ts
    <feature>.test.ts
  shared/
    constants/                # ALL magic values. see below
    utils/                    # pure, stateless, no imports from modules/
    helpers/                  # app-aware, may import shared/
    middleware/               # cross-cutting: auth, logging, rate limit, request id
    errors/                   # typed error classes
    config/                   # env parsing, validated once at boot
  clients/                    # ONE folder per external system: stripe/, s3/, sendgrid/
    <system>/                 # client construction, auth, retry, timeout, their types -> ours
  db/  migrations/  seeds/
```

**External connections get their own layer.** One folder per third-party system. Nobody
imports the vendor SDK outside it — not a service, not a controller. That folder owns the
connection (built once, reused, never per request), the timeout, the retry policy, and the
translation from their response shape to yours. Their outage becomes your typed error
there, not a raw SDK exception surfacing three layers up.

`utils` vs `helpers`: util is pure and could be published as a package tomorrow.
Helper knows about your app. If a util imports from `modules/`, it is a helper.

## Constants

Zero magic values in logic. No bare strings for keys, roles, statuses, events, routes.

```ts
// shared/constants/order.ts
export const ORDER_STATUS = { PENDING: 'pending', PAID: 'paid' } as const;
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
```

Colocate constants with their feature when only that feature uses them. Promote to
`shared/constants` on the second consumer, not in anticipation of one.

Config values (timeouts, page sizes, limits) come from validated config, not literals.

## Rules that catch most real bugs

- Errors: typed error classes, one place maps them to HTTP. Never swallow — log or rethrow.
- Never catch-and-return-null. Caller cannot tell "missing" from "broke".
- Every async call that can fail has a defined failure path. `await` without a plan is a bug.
- Validate at the boundary, trust inward. Parse into a type, don't check-and-pass-through.
- Money: integers, minor units. Never float.
- Time: UTC in storage and transport. Convert at the edge only.
- IDs: opaque strings in transport. Never leak DB sequence numbers as public IDs.
- No `any` at boundaries. Internal `any` is a TODO with a name on it.
- Transactions belong in service, not repository — repository does not know how many
  writes make one business operation.
- N+1: any loop containing `await db.*` is presumed a bug until justified.
- Performance is a correctness concern, not a later pass — parallelism, query shape,
  loop and I/O discipline: `~/.claude/standards/performance.md`.
- **Install into a project env, never the shared interpreter.** `venv` / `nvm` / project
  lockfile first, before the first `pip install` or `npm i -g`. A global install silently
  upgrades a transitive pin and breaks a different project that was working an hour ago.
  Package managers report this as warning text on an **exit code 0** — read the resolver
  output, do not trust the exit code. Broke something? `stat` the install metadata
  (`.dist-info`, `node_modules/.package-lock.json`) to prove what you moved and when,
  then restore, then re-verify with `pip check` / `npm ls` before continuing.
- **A bulk rewrite proves itself with a count and a byte delta.** Find-and-replace, codemod,
  file copy-with-edit: print how many matches were replaced and check the size change equals
  what you predicted. Zero replacements exits 0 and looks exactly like success — usually an
  over-escaped pattern (backslash-heavy JSON paths through a shell heredoc) that never matched.
  A delta that is off by the line count means the tool rewrote every newline: on Windows,
  Python text mode turns LF into CRLF, so read and write with `newline=''` or in binary.
- **Repo-wide search goes through the Grep tool, never `grep -r` in a shell.** A recursive
  shell grep walks `node_modules`, `.git` and build output; on a real project that is minutes,
  and it times out with nothing to show for it. The Grep tool is ripgrep — it honours ignore
  files and returns the same answer in seconds. This holds even when a mode says to prefer
  the shell: "prefer Bash" means for commands, not for a search a dedicated tool already wins.
  Shell `grep` is for one named file or a pipe you already have.

## Naming

- Booleans: `is/has/can/should`.
- Functions: verb first. `getUser`, `calculateTax`, not `userData`.
- Async that hits network/DB: name says it. `fetchUser` not `user`.
- No abbreviations except universal ones (id, url, db, api).
- File name matches its main export.

## DRY, carefully

Duplicate twice before abstracting. Three occurrences and one reason to change = extract.
Two occurrences that look alike but change for different reasons = leave them alone.
Wrong abstraction costs more than duplication.

## Comments — minimum count, maximum value

Default is **no comment**. Code that needs a *what* comment needs better names instead.
A wall of obvious comments trains the next dev to skip all of them, including the one
that mattered.

Write a comment only when it is one of these:

- **Deliberate** — looks wrong, is not. Say why, and what breaks if someone "fixes" it.
  `// serial on purpose: provider 429s above 1 rps`
- **Non-obvious mechanism** — the reason is not visible in the diff. Upstream bug, spec
  quirk, ordering constraint, a workaround with its cause and a link.
- **TODO / revisit** — with an owner and the condition that retires it.
  `// TODO(dhruv): drop once the v2 migration backfills`
- **Landmine** — an invariant the next dev would break by accident.
- **Rejected alternative** — the obvious approach that does not work here, one line.

Never write: a restatement of the line below it, section banner art, author/date/changelog
tags (git has them), commented-out code, `// constructor`, `// loop over users`.

## Definition of done

- [ ] Compiles / lints clean, no new warnings — and the script actually covers what you
      changed. Open the `lint`/`typecheck`/`test` scripts and read their scope before
      trusting a green exit. Partial scripts (one workspace of five, one glob of three)
      return 0 while the code you touched was never checked.
- [ ] Tests written and passing — output pasted, not claimed
- [ ] Anything scheduled or unattended asserts its **output count**, not its exit status.
      A run that finds nothing, matches nothing or writes nothing must fail loudly and
      notify. Otherwise a job that produced zero rows for weeks reports SUCCEEDED and
      looks identical to a working one until a human happens to notice.
- [ ] Errors handled, not swallowed
- [ ] No secrets, no `console.log` debris, no commented-out code
- [ ] Constants extracted, magic values zero
- [ ] Docs updated if behavior/contract changed
- [ ] Migration is reversible and backfills safely

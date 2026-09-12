# Performance Standards

Applies to every line written and every diff reviewed. Target is cost per request at real
scale — not micro-benchmarks. Project conventions win when they conflict.

## Parallelism — sequential I/O is the most common real slowdown

- **Independent I/O inside a loop is a bug.** Fan out instead: `asyncio.gather`,
  `Promise.all` / `Promise.allSettled`, goroutines + `errgroup`, `ThreadPoolExecutor.map`.
  Applies to DB reads, HTTP/API calls, SDK calls, file reads, cache reads — anything
  that waits on something outside the process.
- **Bound the fan-out.** `gather` over 10k items floods your pool and the target.
  Cap it — `asyncio.Semaphore`, `p-limit`, chunked batches. Unbounded parallel is a
  different outage, not a fix.
- Sequential is correct only when step N+1 consumes step N's output, or the target
  rate-limits and you must serialize. Both cases get a one-line comment saying which.
- `Promise.all` rejects fast and drops the other results. Need partial success ->
  `allSettled` and handle each outcome.
- CPU-bound work does not parallelize with async. Process pool, worker threads, or nothing.

## Loops

- No `while True` / `while (true)` without all three: a sleep or backoff, a bound
  (max iterations or a deadline), and an exit condition that provably fires. Busy-wait
  burns a core and hides livelock.
- Poll only when there is no push. Prefer webhook, queue, event, or a condition variable.
- Retries: exponential backoff + jitter + attempt cap. A tight retry loop is a self-DDoS.
- No DB call and no API call inside a loop. Batch it, or fan out bounded. Any loop
  containing `await db.*`, `await fetch`, `requests.*`, or an SDK call is presumed a bug
  until the sequential reason is written down.

## Queries

- Every predicate on a hot path has an index. New `WHERE` / `ORDER BY` / `JOIN` column
  with no index is a finding.
- **Partitioned table: the partition key must be in the `WHERE` clause.** Without it the
  planner scans every partition. Same for time-series — always a bounded time range.
- Select the columns you need. `SELECT *` drags blobs across the wire and defeats
  covering indexes.
- No N+1. One query with `IN (...)` or a `JOIN`, or a batched loader. An ORM lazy-load
  inside a loop *is* an N+1 even though no query is visible in the source.
- Unbounded result set = future outage. `LIMIT` plus keyset pagination. Deep `OFFSET`
  scans and discards everything before it.
- Bulk writes: one multi-row `INSERT` / `executemany` / `createMany` — never a loop of
  single inserts.
- Read the plan before shipping a nontrivial query. `EXPLAIN ANALYZE`. Seq scan on a big
  table, nested loop over millions of rows, sort spilling to disk -> fix before merge.
- `COUNT(*)` on a big table is expensive. Estimate, cache, or do not show it.
- A transaction holds locks. No external API call, no long computation inside one. Open
  late, commit early.

## Data and memory

- Stream large payloads (uploads, exports, wide result sets). Never materialize the whole
  thing to build a response.
- O(n^2) over a collection that grows is the wrong data structure. `set` / `dict` /
  `Map` lookup instead of scanning a list.
- Identical work repeated inside one request -> hoist it out of the loop or memoize it.
- Cache only with a stated TTL and an invalidation story. Neither one -> it is a
  stale-data bug wearing a performance costume.

## Network

- One HTTP client / session / connection pool per process, reused. A fresh client per
  request pays a fresh TLS handshake per request.
- Timeout on every external call, always. No timeout means a hung dependency hangs you.
- Round trips and payload size dominate CPU at an API boundary. One call returning three
  fields beats three calls.

## Before claiming it is fast

State the scale assumption with a number: "holds to ~10k rows, ~100 rps". An unstated
scale assumption is a hidden bug. Measure — profile or time it. "Should be faster" is not
a result.

## Library behaviour

Check current docs (context7 MCP) before relying on a library call's cost or semantics.
Defaults move between versions — pool sizes, lazy vs eager evaluation, a helper that is
secretly synchronous, a client that opens a connection per call.

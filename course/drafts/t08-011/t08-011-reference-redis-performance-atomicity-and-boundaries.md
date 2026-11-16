# caching Redis invalidation eviction and stampede — Reference: Round trips, atomic command groups, scripting, and safe cache use

Sources: [Redis pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/), [Redis transactions](https://redis.io/docs/latest/develop/using-commands/transactions/), [Lua scripting](https://redis.io/docs/latest/develop/programmability/eval-intro/), [Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/), and [Redis eviction](https://redis.io/docs/latest/reference/eviction/).

## Scope and version

This lesson covers the supplied Redis latency, batching, atomicity, and cache-boundary terms. Redis command details follow the current official documentation in the topic snapshot. Lua and Functions are server-side programmability surfaces; client library method names are outside scope.

## How this group fits the mental model

A cache read path is often latency-sensitive. Every network round trip adds delay, but combining commands does not automatically make them one atomic operation. Choose among individual commands, pipelines, transactions, and scripts based on whether the requirement is fewer trips, conditional execution, or server-side atomic logic. In all cases, cached data remains subject to eviction, expiration, and loss unless the deployment's persistence design says otherwise.

## Supplied names explained

### Network batching and transaction control

- `Redis pipelining` sends multiple independent commands before waiting for their replies. It reduces round-trip waiting; it does not provide isolation or make the batch atomic. Use it when operations can be issued without seeing each earlier result.
- `Pipeline response buffering` means Redis queues replies for commands in a pipeline until it can send them. Large response batches consume memory on both client and server, so pipeline bounded groups and avoid returning huge values.
- `Pipeline batch size` is the number and byte volume of commands sent together. Small batches leave round-trip savings unused; oversized batches increase memory spikes, tail latency, and burst pressure. Tune with measured payload sizes and latency, not an arbitrary universal number.
- `Pipelining versus transaction` compares transport batching with a server-side execution boundary. A pipeline can contain commands that interleave with other clients; a transaction queues commands for execution together, but does not roll back earlier commands after a runtime command error.
- `Redis MULTI` starts transaction queuing: subsequent commands are queued rather than immediately executed. A queue-time error can invalidate the transaction; clients must inspect replies and handle the result carefully.
- `Redis EXEC` executes the queued transaction commands. It prevents other clients' commands from interleaving during that execution, but it is not a database-style rollback transaction: runtime errors do not undo successful sibling commands.
- `Redis DISCARD` abandons the current queued transaction and exits its transaction state without executing the queued commands.
- `Redis WATCH` marks keys for optimistic concurrency control. If a watched key changes before `EXEC`, the transaction aborts; the application must reread/recompute and retry with a bounded retry policy.
- `Redis UNWATCH` removes the current connection's watched-key conditions before `EXEC` or `DISCARD`.
- `Redis optimistic transaction abort` is the null/aborted EXEC outcome when a watched key changed. It is a normal concurrency result, not a partial commit; retry only when the operation remains safe and bounded.
- `Redis transaction does not support rollback` means Redis does not reverse commands already applied because a later queued command returns an error. Validate inputs before queuing, make each command safe, and design recovery for partial logical outcomes.

### Server-side logic and cache boundaries

- `Redis Lua scripting` runs a Lua program inside Redis so it can inspect and update data without application-side round trips between its steps. Scripts execute atomically with respect to other commands, but block the server while running, so keep work short and bounded. Exact invocation and management commands are covered in the dedicated programmability reference.
- `Redis script cache volatility` is the fact that cached Eval scripts can disappear on restart, failover, or script flush. Applications need a reload path and must not mistake a digest for durable deployment.
- `Redis Functions` are named, server-managed functions packaged in libraries. They are a better fit than ephemeral Eval scripts when server-side logic needs durable management and reuse; deployment still must load libraries onto the relevant servers.
- `Redis command atomicity` describes an individual command's indivisible execution relative to other commands. For a multi-step invariant, a sequence of individually atomic commands can still interleave unless grouped by a transaction or script/function.
- `Redis command time complexity` is the documented growth of work with input size or stored data. A command that is O(N), or a script looping over a large collection, can create latency spikes; inspect complexity and bound input sizes.
- `Cache stampede lock atomicity` requires acquiring a lock in one conditional command, commonly `SET key token NX PX ttl`, and releasing only if the stored token still belongs to the releaser. A separate GET then DEL races with ownership changes.
- `Redis cache versus authoritative database` separates a rebuildable performance copy from the system that owns durable business truth. A Redis cache must be repopulatable and may be stale or evicted; persistence does not by itself make cache and database updates one atomic commit.
- `Cache data-loss tolerance` is the explicit decision that a cache entry may disappear and be reconstructed. If losing a value would violate a business invariant, it is not merely disposable cache data and needs an authoritative persistence/transaction design.
- `Redis connection round-trip latency` is network and scheduling delay paid when a client waits for a response before issuing the next command. Pipelining or server-side logic can reduce trips, but cannot eliminate computation, queueing, or network failure.
- `Redis client-side cache` stores selected Redis replies in application-process memory. It can remove repeated network requests but creates per-process copies whose freshness depends on server-assisted invalidation and a bounded fallback TTL.
- `Cache observability by hit/miss/eviction` tracks whether reads are served from cache, how often they miss, and how often memory policy evicts entries. Pair these with origin load, stale age, latency percentiles, memory, and refresh failures; hit ratio alone can hide harmful stale responses or stampedes.

## Cross-item comparison

| Mechanism | Saves round trips? | Provides a multi-command boundary? | Best fit |
|---|---:|---:|---|
| Pipeline | Yes | No | Independent commands |
| MULTI/EXEC | Often, depending on client batching | Yes, queued execution is not interleaved | Grouped commands; WATCH for optimistic checks |
| Lua script / Function | Yes, logic runs beside data | Yes, atomic execution | Short conditional multi-step invariants |

## Examples

For independent cache lookups, issue a bounded pipeline of `GET` commands and map replies to their keys. Do not use the pipeline when command B must be constructed from command A's reply.

For a read-modify-write invariant, `WATCH` the key, read its value, then queue the write in `MULTI` and call `EXEC`. If `EXEC` aborts, retry from a fresh read; cap retries and return a controlled contention result when retries are exhausted. If contention is high and the logic is small, a short Lua script or Function can make the check-and-update one server-side operation.

## Common mistakes

- Treating a pipeline as atomic or ordered against every other client.
- Expecting SQL-style rollback from `MULTI`/`EXEC`.
- Running unbounded loops or large collection scans inside a script.
- Treating `SCRIPT LOAD` as durable deployment.
- Making the cache the only copy of business-critical data.
- Assuming Redis persistence and a separate database commit are one distributed transaction.
- Measuring only average latency and hit rate while ignoring p95/p99, origin load, eviction, and stale age.

## Knowledge checks with answers

1. Does pipelining prevent another client from running between commands? **No.** It reduces client waiting; it is not an isolation primitive.
2. If one queued transaction command fails at execution, are earlier successful commands undone? **No.** Design for validation and partial logical failure.
3. When is a server-side script appropriate? **For short, bounded, data-local logic that needs an atomic multi-step decision and would otherwise require dependent round trips.**

### Exact terms covered

- `Redis pipelining`
- `Pipeline response buffering`
- `Pipeline batch size`
- `Pipelining versus transaction`
- `Redis MULTI`
- `Redis EXEC`
- `Redis DISCARD`
- `Redis WATCH`
- `Redis UNWATCH`
- `Redis optimistic transaction abort`
- `Redis transaction does not support rollback`
- `Redis Lua scripting`
- `Redis script cache volatility`
- `Redis Functions`
- `Redis command atomicity`
- `Redis command time complexity`
- `Cache stampede lock atomicity`
- `Redis cache versus authoritative database`
- `Cache data-loss tolerance`
- `Redis connection round-trip latency`
- `Redis client-side cache`
- `Cache observability by hit/miss/eviction`

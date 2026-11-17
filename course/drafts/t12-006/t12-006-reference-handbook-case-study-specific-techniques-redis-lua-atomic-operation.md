# end-to-end system design case studies — Reference: Redis Lua atomic operation

Sources: [Redis programmability](https://redis.io/docs/latest/develop/programmability/), [Lua scripting](https://redis.io/docs/latest/interact/programmability/eval-intro/), [Redis Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/), [EVAL command and key arguments](https://redis.io/docs/latest/commands/eval/), [Redis transactions](https://redis.io/docs/latest/interact/transactions/).

## Scope and version

This lesson teaches the supplied concept at the system-design level. Product behavior and feature availability vary by version and deployment; verify the cited official documentation for the versions and platforms you operate.


## How this group fits the mental model

A client-side read, decision, and write can race with another client. For example, two checkout requests can both read inventory as `1`, both decide that one item is available, then both decrement it. A short server-side script can read the inventory and conditionally reserve it as one indivisible operation with respect to other Redis commands on the executing server. It also avoids a network round trip between the read and conditional write.

## Supplied names explained

Redis runs Lua scripts in an embedded Lua 5.1 environment. A script can use Redis commands through `redis.call()` or `redis.pcall()` and receives key names through `KEYS` and ordinary arguments through `ARGV`. Redis serializes script execution: while a script runs, other commands on that server do not interleave. This is the relevant atomicity guarantee.

Atomic execution is not a distributed transaction. It does not atomically update SQL Server and Redis, make a Redis Cluster operation span arbitrary shards, or promise that a timed-out client knows whether the script ran. It also does not remove the need to define persistence, replication, failover, and retry behavior. In Cluster, pass every accessed key explicitly and design multi-key scripts so their keys are in one hash slot; do not discover or construct undeclared keys dynamically.

## EVAL scripts and Redis Functions

`EVAL` sends a script body for execution; `EVALSHA` invokes a script already present in the server's volatile script cache. A client must be prepared to load the script again after cache loss and handle `NOSCRIPT`. Starting with Redis 7.4, Redis can evict scripts loaded by `EVAL`/`EVAL_RO` when the cache reaches a configured size, so successful prior use is not proof that the SHA will remain available. Starting with Redis 7, Redis Functions provide a named server-side programming model: libraries are deployed to Redis, persisted in the AOF, and replicated. Choose based on deployment ownership and lifecycle, not because Functions provide a broader atomicity boundary. Both execute atomically and block command processing for their duration.

Scripts must be short and bounded. A long script stalls other work on that server; Redis does not safely interrupt a script after it has made writes. Keep loops and collection scans bounded, validate arguments before mutations, and keep business operations that can span services in an application-level workflow or transaction design.

## Examples

Use a Redis key for a short-lived reservation only if Redis is permitted to be authoritative for that reservation. The script should validate the requested quantity, read available inventory, reject insufficient stock, and decrement only when enough stock remains. Return a structured result such as `reserved` or `insufficient`; do not make the caller infer the result from a later independent read. Include a reservation identifier if retries must return the same reservation rather than decrement twice. Expiry, reconciliation with the durable order store, and recovery after Redis failover still need explicit rules.

If the order and inventory are authoritative in SQL Server, Redis can reduce contention or coordinate a temporary hold, but the final SQL transaction and reconciliation process remain necessary. A Redis script cannot commit a SQL transaction.

## Cross-item comparison

- A single Redis command is simpler and usually preferable when it already expresses the needed operation.
- `WATCH` with `MULTI`/`EXEC` can implement optimistic conditional updates, but the client must handle aborted transactions and retry conflicts.
- A Lua script is useful when a short read/decision/write sequence needs to be serialized close to Redis data.
- Redis Functions are useful when server-managed, named libraries fit deployment and operations.
- A relational transaction is a better boundary when the invariant belongs to durable relational state or spans several SQL rows.

## Common mistakes

- **Timeout after submit:** the caller may not know whether the script ran. Use a stable reservation/idempotency key and query or replay according to the operation contract.
- **Script cache miss:** reload on `NOSCRIPT`; do not assume `EVALSHA` cache state survives restart or failover.
- **Hot key:** atomicity can serialize a hot key and cap throughput; partitioning changes the invariant and requires a new design.
- **Cluster slot error:** all keys that must participate in the same script need a compatible same-slot key design.
- **Long-running script:** bound work and monitor latency; atomicity can turn an unbounded loop into a server-wide stall for that Redis node.
- **Cross-system side effect:** use an outbox, saga, or other explicit coordination pattern where appropriate; the Redis script alone cannot make the external effect atomic.

## Knowledge checks with answers

1. **What does “atomic” mean here?** Other commands on the executing Redis server do not interleave with the script. It does not mean a transaction across Redis and SQL Server or arbitrary Cluster shards.
2. **When are Redis Functions useful over an `EVAL` script?** When the team wants named libraries deployed and managed as Redis-side program logic. Both approaches still need short execution and bounded work.
3. **Why should a retry use a stable reservation identifier?** A lost reply leaves the caller uncertain; the identifier lets the operation recognize a repeat instead of reserving twice, if the script stores and enforces that idempotency contract.

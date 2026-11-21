# end-to-end system design case studies — Reference: Redis SETNX

Sources: [Redis SETNX command](https://redis.io/docs/latest/commands/setnx/), [Redis SET command](https://redis.io/docs/latest/commands/set/), [Redis distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/), [Martin Kleppmann: How to do distributed locking](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html).

## Scope and version

This lesson explains the Redis command `SETNX` and the locking design commonly built around it. Redis documents `SETNX` as deprecated since Redis 2.6.12; new code should generally use `SET key value NX`, adding `PX` or `EX` when a bounded lease is intended. Command behavior, replication, persistence, and failover guarantees depend on the deployed Redis topology and configuration. This is a design lesson, not a proof that a Redis lock provides mutual exclusion under every failure.

## How this group fits the mental model

The goal of a lock is to coordinate ownership of a critical section. A client attempts an atomic conditional write: if the key is absent, store a unique ownership token. Only the winner proceeds. A lease adds an expiry so a crashed owner does not block progress forever. This solves stale-lock recovery, but it also creates a second problem: a paused owner may resume after its lease expires while a new owner is already working.

Think in terms of three separate properties:

1. **Acquisition:** at most one client wins a single atomic attempt against the same authoritative Redis primary.
2. **Liveness:** expiry can let another client proceed after a crash or long pause.
3. **Protected-resource safety:** the resource being modified rejects stale owners. A Redis key alone cannot guarantee this across arbitrary pauses, failover, or delayed requests.

The third property is frequently missed. If the protected system supports fencing tokens, issue monotonically increasing tokens and have that system reject operations carrying an older token. If it does not, use a transaction, uniqueness constraint, compare-and-swap, or other correctness mechanism at the resource of record. A lock can reduce contention; it should not be the only defense against duplicate financial or irreversible effects.

## Supplied names explained

- **`SETNX`**: sets a key only when it does not already exist and returns whether it set the key. It has no expiry option of its own. A process crash after acquiring it can leave a permanent key unless another cleanup strategy exists.
- **`SET ... NX`**: the current form of conditional creation. `NX` means set only if absent; combine it with `PX milliseconds` or `EX seconds` to bound the lease. Use one atomic command rather than `SETNX` followed by a separate expiry command, because a crash between those commands can leave an unexpired lock.
- **Ownership token**: a random, unguessable value unique to one acquisition attempt. Store it as the value. Do not use a constant such as `"locked"`: one client could accidentally delete a lock acquired by another client after its own lease expired.
- **Compare-and-delete release**: release only if the stored token still equals the caller’s token. Perform the comparison and deletion atomically, usually with a small Lua script or a Redis function. A plain `DEL` can erase a newer owner’s lock.
- **Lease**: the expiry window in which the owner expects to act. Choose it from measured operation duration and pause behavior, renew it only with token-checked atomic logic, and treat renewal failure as loss of ownership.
- **Fencing token**: a monotonically increasing generation attached to each owner. The protected resource must compare generations and reject stale ones; generating a number in Redis is insufficient if the downstream resource ignores it.

## Cross-item comparison

Compared with a database row lock, Redis offers a low-latency coordination primitive, but the business database may not participate in the lock’s ownership protocol. A database conditional update is usually stronger for an invariant stored in that database. Compared with a queue visibility lease, a Redis lock is a general-purpose key, while a queue may already provide ownership renewal and redelivery semantics. Select based on the authority that must reject stale work.

## Examples

### Acquisition and release flow

For a best-effort single-primary lease, a client generates a random token and issues `SET lock:resource token NX PX leaseMs`. A successful response means the client acquired the key at that point in the primary’s command order. A null response means someone else currently holds it. The client records an acquisition deadline using a monotonic clock and subtracts network round-trip time and a safety margin from the nominal lease; it must stop protected work before it can no longer confidently hold the lease.

On release, the client runs an atomic script equivalent to: read the key; if it still equals my token, delete it; otherwise do nothing. Expiry remains the recovery path if the process dies. If the lock command times out, the outcome is ambiguous: Redis may have applied the write while the response was lost. The caller must not assume it owns the lock. It may safely attempt token-checked cleanup and retry acquisition with a new token, subject to the application’s idempotency rules.

For a multi-primary design, clients acquire the same resource lock on a quorum of independent nodes, measure elapsed time, and proceed only if the quorum succeeds with sufficient lease time remaining. This reduces some single-node failure modes but does not eliminate clock, pause, partition, replication, or stale-client hazards. Carefully review Redis’s documented algorithm and the assumptions of the deployment before using this for correctness-critical coordination.

## When it is appropriate

This pattern can be useful for short, bounded, duplicate-tolerant work: avoiding two workers refreshing the same cache entry, coalescing a background rebuild, or reducing redundant scheduled work. For durable job ownership, a queue’s visibility lease, database row lock, or transactional claim may be more natural. For reservation or payment correctness, enforce the invariant in the authoritative database and make external effects idempotent; use a distributed lock only as an optimization if needed.

The choice depends on what must remain true during a network partition, Redis failover, process suspension, and delayed messages. If the answer is “two owners must never both commit,” ensure the commit target has an atomic invariant or fencing check. A Redis lock alone cannot make an unrelated database or API reject a stale owner.

### Inventory reservation example

**Cache rebuild:** worker A acquires `cache:product:42` with a random token and a 20-second lease. It fetches the product and writes the cache. If it pauses for 30 seconds, worker B may acquire the expired lease and write a newer cache value. The cache update should use a version or freshness rule so A’s late write cannot overwrite B’s newer result; otherwise the lease is only best-effort deduplication.

**Inventory reservation:** two checkout requests race for the last item. A Redis lock may serialize normal attempts, but the database transaction should still conditionally decrement only when `available >= quantity`, and persist a unique reservation/idempotency key. If the lock owner pauses, the database constraint remains the source of truth.

## Common mistakes

- Treating `SETNX` plus a later `EXPIRE` as atomic.
- Deleting a lock by key without checking the owner token.
- Assuming a lease prevents a stopped process from resuming after expiry.
- Renewing a lease without verifying current ownership.
- Assuming Redis failover preserves every acknowledged lock write under every persistence and replication configuration.
- Treating a timeout as proof that acquisition failed.
- Using a Redis mutex to enforce a business invariant that belongs in the database or downstream resource.
- Describing a lock algorithm as “exactly once.” Locks do not make external effects exactly once.

## Knowledge checks with answers

1. **Why prefer `SET key token NX PX duration` over `SETNX` followed by `EXPIRE`?** The conditional write and expiry happen as one command, so a crash cannot occur between acquisition and setting the expiry.
2. **Why must release compare the token?** The lease might have expired and another client may now own the key; unconditional deletion could remove that client’s lock.
3. **Does lease expiry stop an old process from writing?** No. It only permits another client to acquire. The protected resource needs fencing or its own atomic invariant to reject stale work.
4. **What does an acquisition timeout mean?** The result is unknown: the command may have executed and only the response was lost. The client must not proceed as owner without confirmation.
5. **When is a database condition better than a Redis lock?** When the business invariant can be enforced atomically with the data change, such as “decrement stock only if sufficient quantity remains.”

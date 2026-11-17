# system design tradeoffs and decision methods — Reference: Cache-aside vs write-through vs write-behind

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Azure caching guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/caching), [Cache-Aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside).

## Scope and version

These are cache population/write policies. In all three, state which copy is authoritative, how stale values are invalidated, and what happens on cache/store failure; names do not define one universal implementation contract.

## How this group fits the mental model

**Cache-aside:** the application checks the cache, loads a miss from the backing store, then populates the cache. Writes normally update the store and invalidate/update the cache. It avoids caching unused data and is simple to add, but concurrent misses, stale repopulation, invalidation failure, and cold-cache load need handling.

**Write-through:** a write path updates the backing store and cache before reporting success, under the chosen implementation's policy. It can keep frequently read values warm but couples write latency/availability to cache behavior unless carefully designed. Define atomicity: most separate cache and database writes are not one atomic transaction.

**Write-behind/write-back:** the cache acknowledges or accepts a write before the backing store is updated asynchronously. It can absorb bursts and reduce store write load, but introduces a durability window, queue/backpressure, ordering, retry, deduplication, and replay/recovery requirements. If acknowledged data exists only in volatile cache, cache loss can lose accepted writes.

## Supplied names explained

Expiration is not a correctness strategy by itself. Concurrent writers can cause cache/store divergence; use versioning, invalidation, write-through coordination, or short TTL according to tolerated staleness. Stampedes require request coalescing, jitter, or controlled refresh. Protect the backing store from a cold-cache surge.

## Cross-item comparison

Choose cache-aside for read-heavy data where misses can query the store and some staleness is acceptable. Use write-through when warm reads matter and a synchronous write path is acceptable. Use write-behind only when asynchronous persistence is safe and the system can durably queue, replay, and reconcile writes. For balances, permissions, or inventory, do not let a cache become an accidental source of truth.

## Examples

An ASP.NET Core product endpoint uses cache-aside: a miss loads SQL and sets a short TTL. During a price update, the transaction commits then invalidates the key; if invalidation fails, the old price may survive until expiry. Test update-vs-miss races, cache outage, stampede, and cold start. A write-behind counter would need a durable queue and replay key before acknowledging; a process crash between cache acknowledgement and durable enqueue is unacceptable for billing.

## Common mistakes

- Assuming database and cache updates are atomic because both occur in a write-through request.
- Acknowledging write-behind data that has no durable recovery record.
- Forgetting stale-fill races, invalidation failure, eviction, and cold-cache load.
- Using TTL as the only consistency/revocation rule for sensitive data.

## Knowledge checks with answers

1. **Which strategy loads an entry on a read miss?** Cache-aside.
2. **What must write-behind guarantee before acknowledging?** Durable capture, ordered/idempotent replay, bounded backlog, and recoverability.
3. **Can cache and database writes usually be assumed atomic?** No; define partial failure and reconciliation behavior.

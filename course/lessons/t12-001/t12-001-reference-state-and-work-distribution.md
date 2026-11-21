# system design foundations and infrastructure building blocks — Reference: Caching, queues, rate limits, and object storage

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc9846), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 7](https://hld.handbook.academy/curriculum/prerequisites/), [reference 8](https://hld.handbook.academy/curriculum/building-blocks/), [reference 9](https://man7.org/linux/man-pages/man7/epoll.7.html), [reference 10](https://man7.org/linux/man-pages/man7/io_uring.7.html), [reference 11](https://man.freebsd.org/cgi/man.cgi?query=kqueue).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Cache-aside` — The application checks a cache, loads a miss from the source, and populates the cache; invalidation and stale reads must be explicit.
- `Write-through cache` — Writes update the cache and backing store as one policy operation; atomicity across both systems is not automatic.
- `Time-to-live (TTL)` — A maximum cache-entry lifetime that bounds staleness only when all relevant paths honor expiry and refresh semantics.
- `Token bucket` — A rate-limit model that accumulates bounded tokens over time, allowing controlled bursts while limiting long-run rate.
- `Leaky bucket` — A model that releases work at a controlled rate or bounds a queue, smoothing bursts while introducing wait or rejection.
- `Message queue` — Buffers discrete work for consumers; delivery may repeat, so handlers should tolerate replay and expose backlog age.
- `Event stream` — Retains ordered records within partitions for independent consumers and replay; ordering is generally scoped to a partition.
- `Object storage` — Stores large unstructured objects under keys with metadata and durable service semantics; it is not a drop-in transactional relational database.

## Cross-item comparison

These mechanisms should not be treated as substitutes:

| Mechanism | What it changes | Main decision |
|---|---|---|
| Cache-aside | Avoids recomputing or rereading a value on a hit | Is stale data acceptable, and how are misses, invalidation, and stampedes handled? |
| Write-through | Couples a cache update to the write path by policy | What happens if the authoritative write succeeds but cache update fails, or vice versa? |
| TTL | Expires an entry after a time bound | Is the bound sufficient for the freshness promise, and do all readers honor expiry? |
| Token bucket | Allows a configured burst while limiting average admission rate | What is the key (user, tenant, route), and is quota state local or shared? |
| Leaky bucket / paced queue | Smooths admitted work at a controlled drain rate | Is delay acceptable, and what is the queue bound and overload response? |
| Message queue | Buffers work for one or more competing workers | What are ack, retry, visibility, dead-letter, ordering, and retention semantics? |
| Event stream | Retains records for independent consumer positions and replay | What ordering scope, partition key, retention, and replay load are required? |
| Object storage | Stores large objects independently from transactional rows | How are upload authorization, completion, versioning, lifecycle, integrity, and deletion reconciled? |

A queue is often a work-distribution mechanism: one message is normally claimed by a worker group, processed, then acknowledged/deleted under that product’s contract. A retained log is often a fan-out/replay mechanism: independent consumer groups keep positions and can reread within retention. Implementations can combine features, so use the actual product contract rather than the label. Backpressure requires bounded buffers, admission control, and a policy for reject, shed, delay, or degrade; unlimited retries merely move overload into the future.

Cache write patterns are also distinct. Cache-aside makes the application load on miss; write-through updates the cache as part of an application write policy; write-behind acknowledges before the backing store is updated and therefore needs a durable recovery path; refresh-ahead updates likely hot values before expiry but can waste work. TTL limits age only if reads respect it, and does not invalidate an entry early after a business change. Invalidation messages can be lost, so systems commonly combine invalidation with bounded TTL and reconciliation. A cache stampede can occur when many misses recompute one hot key simultaneously; single-flight request coalescing, jittered refresh, stale-while-revalidate, or carefully bounded locking are alternatives with different failure modes.

## Examples

For a product catalog, the database owns product truth and a cache-aside layer stores derived read values under a normalized key. TTL bounds how long a forgotten invalidation can persist, but the freshness objective determines whether that bound is acceptable. Coalesce concurrent misses for a hot product or serve a permitted stale value while one refresh runs. For checkout, do not use an eventually refreshed cache as the sole authority for the final inventory reservation.

For a burst of image processing jobs, persist the job request before reporting durable acceptance, place it in a bounded queue, and let workers acknowledge only after a durable result or handoff. Define retry limits, dead-letter inspection, and what the API reports while backlog age grows. If several downstream consumers each need to replay an event independently, a retained stream may fit better than a competing-consumer queue. For large uploads, store bytes in object storage and keep metadata/state in a database; reconcile the two effects because an object write and database transaction are not one atomic operation.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.
- Assuming a TTL guarantees freshness or that invalidation always reaches every cache.
- Treating a queue as an event archive, or assuming an event stream provides global ordering across partitions.
- Retrying indefinitely without bounding backlog, consumer concurrency, or downstream load.
- Acknowledging work before durable processing when the product contract can then discard it.

## Knowledge checks with answers

1. **What does a queue decouple?** Producers from consumers in time and often load, but not necessarily in ownership or transactionality.
2. **Why pair an outbox with idempotent consumers?** The outbox closes a database/message dual-write gap; consumer deduplication handles redelivery.
3. **What does a cache copy imply about authority?** Nothing by itself; ownership and staleness rules must be defined separately.

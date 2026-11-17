# system design foundations and infrastructure building blocks — Reference: Caching, queues, rate limits, and object storage

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc8446), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/).

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

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.
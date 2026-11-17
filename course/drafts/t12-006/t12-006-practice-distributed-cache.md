# end-to-end system design case studies — Problem: Design a distributed cache

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice key placement, eviction, replication, hot keys, and stale-data safety; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a shared cache for many application instances with large read volume and a strict tolerance for stale values on some records.

**Worked design.** Treat the cache as an optimization unless the data model explicitly makes it durable. Define cache keys, TTL, invalidation, eviction, and behavior on miss or outage. Partition keys across nodes with an explicit rebalancing strategy; replication can improve availability but consumes memory and can return stale data. Add request coalescing or randomized expiry to reduce stampedes, and protect hot keys with local caching or replication where safe. Keep authorization in the source path and never share user-specific values under an incomplete key. Measure hit ratio alongside origin load, not alone.

## Exercises

1. Write the top functional requirements and the quality objective that most changes the architecture.
2. Estimate demand, storage growth, and the likely hot key or constrained resource. State assumptions.
3. Define authoritative data, identifiers, API behavior, and transaction boundary.
4. Trace a write and a read, including a timeout or duplicate request.
5. Describe one scaling change and its consistency, cost, and operational tradeoffs.

## Progressive hints

Start with the invariant and user-visible outcome. Separate write and read paths. Identify a simpler baseline before adding distributed components. Make one failure case concrete.

## Complete solutions

1. Prioritize user-visible correctness and measurable latency, availability, freshness, durability, or cost for the relevant path.
2. Use ranges for traffic and growth. Identify skew and fan-out rather than assuming uniform keys. Validate the sensitive estimate with a representative benchmark.
3. Name one authoritative owner for each critical fact. Specify idempotency and compatibility when callers may retry or remain old.
4. Treat missing acknowledgements as unknown outcomes. Retry only with idempotency or verify state; make asynchronous effects deduplicable.
5. Add replication, caching, partitioning, or queueing only to meet a stated need; explain the operations burden and recovery plan.

### Case-specific design answer

Treat the cache as an optimization unless the data model explicitly makes it durable. Define cache keys, TTL, invalidation, eviction, and behavior on miss or outage. Partition keys across nodes with an explicit rebalancing strategy; replication can improve availability but consumes memory and can return stale data. Add request coalescing or randomized expiry to reduce stampedes, and protect hot keys with local caching or replication where safe. Keep authorization in the source path and never share user-specific values under an incomplete key. Measure hit ratio alongside origin load, not alone.

## Tests and edge cases

Test node loss, hot key, simultaneous cold miss, eviction under memory pressure, stale authorization, and rebalancing.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

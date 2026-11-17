# end-to-end system design case studies — Problem: Design channel-scale team chat

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice large-room fan-out, workspace authorization, presence aggregation, and search; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design team chat with channels that may have very large membership, threads, presence, file sharing, and workspace search.

**Worked design.** Use workspace/channel membership as an authoritative authorization boundary and check before delivery and search results. Persist messages with channel-scoped ordering; separate presence from durable content. For large channels, shard fan-out and batch updates rather than synchronously delivering to every member. Search is a derived index that must respect current membership and deletion. Thread replies and reactions have distinct query patterns. Measure hot spots, delivery lag, presence freshness, and search access filtering.

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

Use workspace/channel membership as an authoritative authorization boundary and check before delivery and search results. Persist messages with channel-scoped ordering; separate presence from durable content. For large channels, shard fan-out and batch updates rather than synchronously delivering to every member. Search is a derived index that must respect current membership and deletion. Thread replies and reactions have distinct query patterns. Measure hot spots, delivery lag, presence freshness, and search access filtering.

## Tests and edge cases

Test member removal during delivery, a very large channel, duplicate message, presence storm, deleted message in search, and workspace boundary leakage.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

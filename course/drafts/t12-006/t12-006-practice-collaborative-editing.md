# end-to-end system design case studies — Problem: Design collaborative document editing

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice concurrent edits, offline merge, presence, and durable history; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a multi-user document editor that supports concurrent typing, disconnection, cursor presence, and version history.

**Worked design.** Choose an operation-transform or CRDT model based on required semantics and clients; neither makes all domain conflicts disappear. Persist document operations or snapshots with version/cursor metadata and broadcast updates over a realtime channel. Presence is ephemeral and should not share the durable write path. Offline clients sync from a cursor and apply deterministic merge rules; authorization is checked at document boundaries. Bound document size and fan-out, compact history with recoverable snapshots, and expose conflict behavior.

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

Choose an operation-transform or CRDT model based on required semantics and clients; neither makes all domain conflicts disappear. Persist document operations or snapshots with version/cursor metadata and broadcast updates over a realtime channel. Presence is ephemeral and should not share the durable write path. Offline clients sync from a cursor and apply deterministic merge rules; authorization is checked at document boundaries. Bound document size and fan-out, compact history with recoverable snapshots, and expose conflict behavior.

## Tests and edge cases

Test simultaneous insert/delete, offline reconnect, duplicate operations, document permission revocation, snapshot compaction, and large-room fan-out.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

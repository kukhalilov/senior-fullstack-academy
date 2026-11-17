# end-to-end system design case studies — Problem: Design an exchange matching engine

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice deterministic ordering, market data fan-out, auditability, and latency; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a simplified exchange order book that accepts orders, matches buyers and sellers, publishes market data, and supports replay/audit.

**Worked design.** Define price-time priority, order types, cancel/replace rules, and authoritative sequence before scaling. Route each instrument or order book to a single deterministic owner or consensus-backed log; parallelize across independent books. Persist an ordered event log and derive book state and market-data projections. Keep matching fast and bounded; risk checks happen before acceptance under a clear contract. Replicate read-only market data separately from the matching authority. Audit every state transition and recover by replaying a validated log/snapshot.

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

Define price-time priority, order types, cancel/replace rules, and authoritative sequence before scaling. Route each instrument or order book to a single deterministic owner or consensus-backed log; parallelize across independent books. Persist an ordered event log and derive book state and market-data projections. Keep matching fast and bounded; risk checks happen before acceptance under a clear contract. Replicate read-only market data separately from the matching authority. Audit every state transition and recover by replaying a validated log/snapshot.

## Tests and edge cases

Test simultaneous crossing orders, cancel race, duplicate client order ID, sequence gap, recovery replay, and market-data consumer lag.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

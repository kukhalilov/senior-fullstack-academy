# end-to-end system design case studies — Problem: Design a distributed unique ID generator

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice uniqueness, ordering, clock behavior, and failure domains; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design an ID scheme for independent services that need unique sortable IDs without a network call on every allocation.

**Worked design.** First decide whether the product needs uniqueness, time ordering, compactness, unpredictability, or global monotonicity; they conflict. A timestamp/worker/sequence layout avoids per-ID coordination but needs unique worker allocation, clock rollback handling, and sequence overflow behavior. Random UUIDs reduce coordination but may not be compactly sortable. A database sequence is simpler but centralized. Never treat ID secrecy as authorization. Monitor skew and duplicate alarms.

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

First decide whether the product needs uniqueness, time ordering, compactness, unpredictability, or global monotonicity; they conflict. A timestamp/worker/sequence layout avoids per-ID coordination but needs unique worker allocation, clock rollback handling, and sequence overflow behavior. Random UUIDs reduce coordination but may not be compactly sortable. A database sequence is simpler but centralized. Never treat ID secrecy as authorization. Monitor skew and duplicate alarms.

## Tests and edge cases

Test high same-time volume, clock rollback, duplicate worker identity, restart, region split, and storage/index costs.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

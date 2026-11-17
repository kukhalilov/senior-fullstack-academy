# end-to-end system design case studies — Problem: Design a hotel reservation system

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice date-range inventory, search projections, holds, and supplier inconsistency; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design search and booking for room inventory across concurrent customers and potentially external hotel suppliers.

**Worked design.** Separate availability search from authoritative booking. Search indexes may be stale, so confirm availability with an atomic inventory/constraint check before accepting a reservation. Use a temporary hold with expiry and an explicit payment workflow; compensate or release safely on failure. Date ranges and room types need a well-defined uniqueness/inventory invariant. External suppliers introduce unknown outcomes and reconciliation. Keep pricing and cancellation terms versioned with the reservation and audit changes.

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

Separate availability search from authoritative booking. Search indexes may be stale, so confirm availability with an atomic inventory/constraint check before accepting a reservation. Use a temporary hold with expiry and an explicit payment workflow; compensate or release safely on failure. Date ranges and room types need a well-defined uniqueness/inventory invariant. External suppliers introduce unknown outcomes and reconciliation. Keep pricing and cancellation terms versioned with the reservation and audit changes.

## Tests and edge cases

Test overlapping date requests, simultaneous last-room booking, payment timeout, stale search result, cancellation race, and supplier retry.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

# end-to-end system design case studies — Problem: Design real-time ad-click aggregation

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice event deduplication, windows, late data, fraud signals, and billing correctness; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design click ingestion and reporting for campaigns with near-real-time dashboards and financial settlement.

**Worked design.** Assign each click a stable event ID and validate campaign/placement before ingestion. Partition the stream by a key that balances throughput and enables required aggregation. Define event-time windows, late-arrival correction, dedupe retention, and whether dashboard counts are provisional. Fraud scoring can operate inline only within a strict latency budget; richer analysis can be asynchronous. Keep billed totals auditable and reconcile aggregates against retained raw or compacted evidence. A broker’s transaction scope does not automatically make external billing exactly once.

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

Assign each click a stable event ID and validate campaign/placement before ingestion. Partition the stream by a key that balances throughput and enables required aggregation. Define event-time windows, late-arrival correction, dedupe retention, and whether dashboard counts are provisional. Fraud scoring can operate inline only within a strict latency budget; richer analysis can be asynchronous. Keep billed totals auditable and reconcile aggregates against retained raw or compacted evidence. A broker’s transaction scope does not automatically make external billing exactly once.

## Tests and edge cases

Test duplicate events, late click, partition skew, replay, fraud-model outage, and discrepancy between dashboard and settlement.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

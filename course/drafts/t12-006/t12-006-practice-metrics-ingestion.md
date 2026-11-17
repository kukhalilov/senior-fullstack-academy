# end-to-end system design case studies — Problem: Design a metrics ingestion platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice high-cardinality ingestion, retention, aggregation, and alert latency; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a platform that ingests numeric measurements from many services, supports dashboards and alerts, and retains useful history affordably.

**Worked design.** Accept authenticated bounded batches with backpressure. Validate names and labels and enforce cardinality budgets before indexing; request or user IDs must not create unbounded series. Partition by tenant and time in storage suited to time-series access. Downsample or tier older data. Separate alert evaluation from interactive dashboards. Define late sample and replay behavior; monitor dropped samples, ingest lag, series count, query tails, and retention cost.

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

Accept authenticated bounded batches with backpressure. Validate names and labels and enforce cardinality budgets before indexing; request or user IDs must not create unbounded series. Partition by tenant and time in storage suited to time-series access. Downsample or tier older data. Separate alert evaluation from interactive dashboards. Define late sample and replay behavior; monitor dropped samples, ingest lag, series count, query tails, and retention cost.

## Tests and edge cases

Test label explosion, agent replay, out-of-order samples, noisy tenant, retention expiry, and dashboard load during an alert storm.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

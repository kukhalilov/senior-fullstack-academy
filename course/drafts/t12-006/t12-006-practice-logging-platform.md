# end-to-end system design case studies — Problem: Design a centralized logging platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice ingest backpressure, indexing cost, retention tiers, and sensitive-data control; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design logs collection and search for thousands of services while keeping ingestion reliable and preventing accidental sensitive-data exposure.

**Worked design.** Collect structured logs through agents with bounded buffers and backpressure; dropped data must be measurable. Apply redaction and access policy before broad indexing, and prohibit credentials or unnecessary personal data at source. Partition by tenant/service/time and distinguish searchable hot retention from lower-cost archived data. Control field and label cardinality; full-text indexing is costly and not every field needs it. Query isolation and quotas protect ingestion from analyst scans. Monitor ingest delay, drop rate, index growth, query tails, and retention compliance.

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

Collect structured logs through agents with bounded buffers and backpressure; dropped data must be measurable. Apply redaction and access policy before broad indexing, and prohibit credentials or unnecessary personal data at source. Partition by tenant/service/time and distinguish searchable hot retention from lower-cost archived data. Control field and label cardinality; full-text indexing is costly and not every field needs it. Query isolation and quotas protect ingestion from analyst scans. Monitor ingest delay, drop rate, index growth, query tails, and retention compliance.

## Tests and edge cases

Test collector outage, disk buffer full, high-cardinality fields, credential leak, noisy tenant query, and retention deletion.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

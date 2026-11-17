# end-to-end system design case studies — Problem: Design a ride-hailing dispatch service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice fresh location ingest, geospatial candidate search, matching, and trip state; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design driver-rider matching with live location updates, ETA, acceptance deadlines, and changing supply.

**Worked design.** Separate ephemeral driver location from durable trip and payment state. Ingest location at a bounded cadence, partition spatially, and query nearby candidates with a geospatial index plus precise distance checks. Matching must handle concurrent offers, expiry, retries, and driver acceptance atomically so one driver is not assigned to multiple trips. ETA is a prediction, not an invariant. Avoid globally scanning all drivers; rebalance hot urban regions and protect location privacy. Measure match latency, stale-location rate, offer acceptance, and trip transition errors.

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

Separate ephemeral driver location from durable trip and payment state. Ingest location at a bounded cadence, partition spatially, and query nearby candidates with a geospatial index plus precise distance checks. Matching must handle concurrent offers, expiry, retries, and driver acceptance atomically so one driver is not assigned to multiple trips. ETA is a prediction, not an invariant. Avoid globally scanning all drivers; rebalance hot urban regions and protect location privacy. Measure match latency, stale-location rate, offer acceptance, and trip transition errors.

## Tests and edge cases

Test stale GPS, simultaneous offers, driver disconnect during acceptance, sparse region, location spoofing, and surge load.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

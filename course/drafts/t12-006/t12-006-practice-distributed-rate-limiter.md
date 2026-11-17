# end-to-end system design case studies — Problem: Design a distributed API rate limiter

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice quota semantics, atomic counters, clock windows, and failure policy; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design per-user and per-tenant limits enforced across many API instances, including burst allowance, fairness, and behavior when the shared limiter is unavailable.

**Worked design.** Choose token bucket or a window algorithm based on burst and precision needs. Derive identity from server-validated authentication. Coordinate counters atomically or lease bounded local tokens with a known maximum overshoot. Set expiry, limit hot keys, and include retry guidance. Select fail-open or fail-closed per operation risk; never let each instance independently grant the full global quota.

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

Choose token bucket or a window algorithm based on burst and precision needs. Derive identity from server-validated authentication. Coordinate counters atomically or lease bounded local tokens with a known maximum overshoot. Set expiry, limit hot keys, and include retry guidance. Select fail-open or fail-closed per operation risk; never let each instance independently grant the full global quota.

## Tests and edge cases

Test boundary bursts, concurrent instances, clock skew, hot tenants, store outage, identity spoofing, and reset behavior.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

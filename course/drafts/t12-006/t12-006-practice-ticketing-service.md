# end-to-end system design case studies — Problem: Design a high-demand ticketing service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice inventory correctness, temporary holds, admission control, and payment saga; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design ticket sales for a popular event where many users attempt to buy the final seats at the same time.

**Worked design.** Make inventory authoritative in a transactional store and reserve seats with an atomic conditional update or uniqueness constraint. Create expiring holds and release only the expected hold version. Gate traffic before inventory. Coordinate payment as an external saga; an unknown provider outcome is reconciled by stable order ID. Search availability may be stale but never authorizes a sale. Protect against bots and observe contention, hold age, and payment outcomes.

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

Make inventory authoritative in a transactional store and reserve seats with an atomic conditional update or uniqueness constraint. Create expiring holds and release only the expected hold version. Gate traffic before inventory. Coordinate payment as an external saga; an unknown provider outcome is reconciled by stable order ID. Search availability may be stale but never authorizes a sale. Protect against bots and observe contention, hold age, and payment outcomes.

## Tests and edge cases

Test two buyers for one seat, duplicate checkout, slow payment past hold expiry, provider timeout after charge, stale search, and flash traffic.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

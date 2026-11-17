# end-to-end system design case studies — Problem: Design a distributed job scheduler

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice durable scheduling, leases, retries, missed runs, and duplicate-safe effects; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a scheduler that runs one-time and recurring jobs across workers, supports dependencies, and survives worker crashes.

**Worked design.** Persist schedule definitions and due occurrences with durable identifiers. Workers claim work through leases or transactional state transitions; a crashed worker’s lease expires, so execution may repeat. Therefore, job handlers must be idempotent or use fencing/deduplication. Define schedule timezone/DST semantics, missed-run policy, retry/backoff, cancellation race, and dependency DAG limits. Separate scheduler control plane from execution pools and bound tenant concurrency. Observe schedule lag, lease age, retries, and dead-letter volume.

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

Persist schedule definitions and due occurrences with durable identifiers. Workers claim work through leases or transactional state transitions; a crashed worker’s lease expires, so execution may repeat. Therefore, job handlers must be idempotent or use fencing/deduplication. Define schedule timezone/DST semantics, missed-run policy, retry/backoff, cancellation race, and dependency DAG limits. Separate scheduler control plane from execution pools and bound tenant concurrency. Observe schedule lag, lease age, retries, and dead-letter volume.

## Tests and edge cases

Test duplicate claim, worker crash after side effect, clock/DST change, missed schedule, dependency cycle, and tenant overload.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

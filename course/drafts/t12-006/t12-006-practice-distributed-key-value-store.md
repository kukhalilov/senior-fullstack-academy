# end-to-end system design case studies — Problem: Design a distributed key-value store

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice partitioning, quorum reads/writes, membership, and replica repair; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a key-value store that partitions keys across nodes and remains useful during node and network failures.

**Worked design.** Define consistency and durability first. Place keys using a partition strategy and replicate each partition to distinct failure domains. A quorum protocol must be described with membership, read/write rules, conflict resolution, and repair; R+W>N alone does not establish linearizability for every protocol. Detect failures as suspicion, not certainty. Rebalance ownership carefully, persist hinted work or logs when supported, and repair divergent replicas with version metadata or Merkle comparisons. Expose the consistency mode to clients and test partitions and recovery.

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

Define consistency and durability first. Place keys using a partition strategy and replicate each partition to distinct failure domains. A quorum protocol must be described with membership, read/write rules, conflict resolution, and repair; R+W>N alone does not establish linearizability for every protocol. Detect failures as suspicion, not certainty. Rebalance ownership carefully, persist hinted work or logs when supported, and repair divergent replicas with version metadata or Merkle comparisons. Expose the consistency mode to clients and test partitions and recovery.

## Tests and edge cases

Test concurrent writes, node replacement, split network, stale read, replica repair, and resharding.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

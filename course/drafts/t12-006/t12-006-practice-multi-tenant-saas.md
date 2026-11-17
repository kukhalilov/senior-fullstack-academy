# end-to-end system design case studies — Problem: Design a multi-tenant SaaS platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice tenant isolation, service tiers, metering, noisy-neighbor controls, and data lifecycle; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a SaaS platform for many organizations with different service tiers, usage billing, and tenant-specific retention or residency rules.

**Worked design.** Resolve tenant identity from a verified principal and authorize every resource access against membership. Choose silo, pool, or hybrid placement from isolation, cost, and operational requirements; enforce tenant keys in data access and tests. Apply per-tenant quotas and fair scheduling, meter billable units from auditable events, and prevent shared caches from mixing scopes. Plan tenant migration and deletion across database, object, analytics, logs, and backups. Monitor noisy-neighbor impact without unbounded metric cardinality.

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

Resolve tenant identity from a verified principal and authorize every resource access against membership. Choose silo, pool, or hybrid placement from isolation, cost, and operational requirements; enforce tenant keys in data access and tests. Apply per-tenant quotas and fair scheduling, meter billable units from auditable events, and prevent shared caches from mixing scopes. Plan tenant migration and deletion across database, object, analytics, logs, and backups. Monitor noisy-neighbor impact without unbounded metric cardinality.

## Tests and edge cases

Test cross-tenant ID substitution, quota bypass, large tenant migration, data deletion, cache collision, and per-tier noisy neighbor.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

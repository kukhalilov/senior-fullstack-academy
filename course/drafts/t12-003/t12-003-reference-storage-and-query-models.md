# data systems storage engines analytics streams and search — Reference: Databases and storage-engine tradeoffs

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://hld.handbook.academy/curriculum/data-systems/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `OLTP` — Online transaction processing handles many small, concurrent reads and writes under transactional constraints.
- `OLAP` — Online analytical processing scans and aggregates larger data sets for reporting and decision support.
- `B-tree` — A balanced search tree suited to ordered lookup and range scans; updates maintain page structure and locality.
- `Log-structured merge tree (LSM tree)` — Buffers writes and merges sorted runs later, favoring write throughput while compaction and read amplification require management.
- `Write-ahead log (WAL)` — Records changes durably before data pages are updated so a database can recover committed work after a crash.
- `MVCC` — Multi-version concurrency control lets transactions observe snapshots while writes create versions; vacuum or cleanup controls obsolete versions.
- `Relational database` — Stores structured relations with constraints and transaction/query capabilities; schema and query design still determine scale behavior.
- `Key-value store` — Looks up values by keys with simple access semantics; secondary query and relational integrity may be limited or external.
- `Document database` — Stores nested document-shaped records; embedding and denormalization affect update consistency and query flexibility.
- `Column-family store` — Organizes data around partition and clustering keys for predictable high-scale access patterns; access patterns constrain queries.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.
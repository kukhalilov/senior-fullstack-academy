# data systems storage engines analytics streams and search — Reference: Events, analytics, and change propagation

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Batch processing` — Processes bounded collections on a schedule or trigger; simple recovery and throughput can come with higher result latency.
- `Stream processing` — Continuously evaluates events with state and time semantics; late, duplicate, and out-of-order data need explicit handling.
- `Lambda architecture` — Combines batch and streaming paths then merges results, which can duplicate logic and complicate correctness.
- `Kappa architecture` — Uses an event log and stream processor as the main path, replaying data to rebuild results when retention and processing allow.
- `Change data capture (CDC)` — Captures database changes for downstream consumers; snapshot, ordering, schema evolution, and delete representation matter.
- `Transactional outbox` — Writes business state and an event record atomically, then publishes asynchronously; delivery can repeat and needs deduplication.
- `Event sourcing` — Persists domain events as the source of truth and derives current state by replay/projection; schema evolution and correction workflows are significant.
- `Data lake` — Stores raw or lightly processed data in scalable object storage, relying on catalog, governance, and file/table formats for usability.
- `Data warehouse` — Curates structured analytical data for governed queries and reporting, often with modeled transformations.
- `Lakehouse` — Combines lake-style storage with table/transaction and governance capabilities; exact properties depend on implementation.

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
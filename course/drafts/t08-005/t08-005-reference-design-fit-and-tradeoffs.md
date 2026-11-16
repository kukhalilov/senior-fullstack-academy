# CQRS event sourcing and tradeoffs — Reference: Architecture fit, costs, and alternatives

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Event Sourcing](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view), and [Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html).

## Scope and version

This lesson evaluates CQRS and Event Sourcing against data and operational needs. It does not recommend either as a default.

## How this group fits the mental model

Choose the least complex persistence/read arrangement that satisfies business invariants, query shape, audit/history, scale, and recovery requirements. Asynchronous views and event history add operational responsibilities that must have owners.

## Supplied names explained

### CRUD model

A conventional model reads and writes current state, often through one database schema. It is straightforward and suitable for many applications. It can become awkward when domain rules, query shape, or read/write loads diverge substantially.

### CQRS with a shared data store

Separate command/query handlers or representations while using one underlying store. It can improve intent and query shaping without a distributed projection pipeline. It still requires transaction and schema discipline.

### CQRS with separate data stores

Write and read models use different persistence systems. This can support independent scaling and specialized queries, but introduces propagation, lag, rebuild, monitoring, and failure recovery.

### CQRS combined with Event Sourcing

Commands append events; projections build read models. This offers history and flexible projections but multiplies concerns: stream concurrency, event evolution, replay, projection health, and privacy. Justify every operational burden.

### Event Sourcing without separate read and write stores

The write side stores events, while queries may replay or project from those events in the same event-store infrastructure. It remains Event Sourcing even without two physically separate databases. Read performance and projection needs determine the eventual shape.

### Write-side consistency boundary

The invariant/transaction boundary at which a command is accepted and committed. In event-sourced designs it is commonly a stream/aggregate version. Do not split an invariant across writers and assume asynchronous projections restore atomicity.

### Query-optimized denormalized model

A read shape that duplicates/combines data to answer queries efficiently. Since it is derived, define its update path, lag, rebuild, and source of truth. Denormalization is not automatically a problem when its ownership is clear.

### Audit trail

A record of who did what and when, with integrity, retention, and access controls appropriate to its purpose. Event sourcing may provide a history substrate, but does not automatically satisfy compliance, identity attribution, or tamper-evidence requirements.

### Operational complexity

The extra systems and procedures needed to monitor, repair, replay, version, back up, secure, and support the design. Include on-call skill and incident recovery in total cost, not just code volume.

### Eventual consistency acceptance test

An explicit product/system test proving that users and workflows tolerate the delay between a write and read projection. Define acceptable lag, visible UX, conflict behavior, and what happens if the projection is unavailable or permanently fails.

## Cross-item comparison

CRUD keeps one current-state model simplest. CQRS with shared storage separates responsibility without distributed propagation. Separate stores add read/write scaling freedom and consistency cost. Event Sourcing adds historical write authority independently from whether query stores are split.

## Examples

A small admin tool may use CRUD and database transactions. A high-volume reporting dashboard may add a query view first. A financial ledger may need an append-only event history for temporal questions, but still requires explicit audit, privacy, access, and projection design.

## Common mistakes

- Selecting Event Sourcing because it sounds auditable.
- Building separate stores before measuring different workload requirements.
- Treating a denormalized view as authoritative state.
- Assuming eventual consistency is acceptable without user/workflow analysis.
- Counting implementation effort but ignoring on-call/rebuild procedures.

## Knowledge checks with answers

1. **Does CQRS require separate stores?** No.
2. **What distinguishes Event Sourcing?** The append-only history is the write-side system of record.
3. **What does an acceptance test for eventual consistency include?** Delay tolerance, UX, recovery, and failure behavior.

### Exact terms covered

- `CRUD model`
- `CQRS with a shared data store`
- `CQRS with separate data stores`
- `CQRS combined with Event Sourcing`
- `Event Sourcing without separate read and write stores`
- `Write-side consistency boundary`
- `Query-optimized denormalized model`
- `Audit trail`
- `Operational complexity`
- `Eventual consistency acceptance test`

### Exact terms covered

- `CRUD model`
- `CQRS with a shared data store`
- `CQRS with separate data stores`
- `CQRS combined with Event Sourcing`
- `Event Sourcing without separate read and write stores`
- `Write-side consistency boundary`
- `Query-optimized denormalized model`
- `Audit trail`
- `Operational complexity`
- `Eventual consistency acceptance test`

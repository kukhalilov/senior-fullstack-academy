# CQRS event sourcing and tradeoffs — Reference: Command-query separation and read/write model options

Sources: [CQRS](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs) and [Fowler on CQRS](https://martinfowler.com/bliki/CQRS.html).

## Scope and version

This lesson describes CQRS responsibility and storage shapes. Event sourcing is optional and discussed separately.

## How this group fits the mental model

Separate the model that validates and changes state from the representation optimized to answer questions. The separation can be logical and lightweight or physically distributed; stronger separation creates synchronization obligations.

## Supplied names explained

### Command Query Responsibility Segregation (CQRS)

Separates command responsibilities from query responsibilities, potentially using different models. It does not require event sourcing, two databases, or microservices. Use it when read and write needs actually diverge.

### Command

An intent to change state, such as `ApproveInvoice`. It may be accepted or rejected based on current state and invariants. A command should express intent and have well-defined duplicate/retry behavior where execution can repeat.

### Query

A request for information that should not change system state. Query results can be shaped for a screen/report and may be eventually consistent if sourced from an asynchronous projection.

### Command model (write model)

The model used to process commands and protect invariants. It may be a rich domain model or a simpler transactional model depending on domain complexity. The command model is authoritative for accepted writes.

### Query model (read model)

A representation optimized to answer reads. It may be a projection, denormalized view, or direct query over shared tables. It can be separate without requiring event sourcing.

### Command handler

Receives a command, loads relevant state, validates/executes the change, persists it, and returns an outcome. Keep business policy in the model; the handler coordinates transaction and delivery boundaries.

### Query handler

Executes a read request and returns a suitable result. It should avoid state-changing side effects. It can use a query-specific data access path when that improves clarity/performance.

### Single model with separated handlers

Commands and queries use distinct operations/handlers but share domain/data model. This is a low-cost way to clarify intent and can be enough for many applications.

### Separate read and write models with one shared store

Use different models/queries while persisting in one database. It may simplify consistency and deployment while allowing read shaping. Shared storage still creates schema and access coupling.

### Separate read and write stores

Write data and read projections live in different stores. This can optimize workloads independently but requires change propagation, monitoring, rebuilds, and accepted lag/failure behavior.

### Independent read scaling

Scale read capacity separately from write processing when measured demand differs. Replicas and projections can lag; include freshness guarantees in UX and SLOs.

### Independent write scaling

Scale write processing separately when mutation workload needs it. Partitioning, contention, and invariant boundaries constrain how independently writes can scale.

### CQRS without event sourcing

Use distinct read/write responsibility or models with conventional state persistence. This avoids replay/history costs while gaining separate query shaping. It is a valid and common CQRS form.

## Cross-item comparison

Separate handlers are the lightest separation. Separate models can share a store; separate stores add a propagation/consistency path. Event sourcing is another persistence choice, not the definition of CQRS.

## Examples

An application can handle `UpdateProfile` with a command handler that writes normalized tables and serve `ProfileSummary` from a query handler joining those same tables. If dashboard load grows, add a read projection only after measuring need and defining refresh behavior.

## Common mistakes

- Creating two databases for a small CRUD app without an independent workload.
- Calling every command a domain event.
- Putting business invariants only in transport handlers.
- Assuming separate stores remain consistent synchronously.
- Treating queries as harmless when they mutate read state or trigger writes.

## Knowledge checks with answers

1. **Does CQRS require Event Sourcing?** No.
2. **What makes a query a query?** It returns information without changing domain state.
3. **Can separate handlers share one store?** Yes.

### Exact terms covered

- `Command Query Responsibility Segregation (CQRS)`
- `Command`
- `Query`
- `Command model (write model)`
- `Query model (read model)`
- `Command handler`
- `Query handler`
- `Single model with separated handlers`
- `Separate read and write models with one shared store`
- `Separate read and write stores`
- `Independent read scaling`
- `Independent write scaling`
- `CQRS without event sourcing`

### Exact terms covered

- `Command Query Responsibility Segregation (CQRS)`
- `Command`
- `Query`
- `Command model (write model)`
- `Query model (read model)`
- `Command handler`
- `Query handler`
- `Single model with separated handlers`
- `Separate read and write models with one shared store`
- `Separate read and write stores`
- `Independent read scaling`
- `Independent write scaling`
- `CQRS without event sourcing`

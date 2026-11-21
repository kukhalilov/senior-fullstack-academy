# DDD entities value objects aggregates and bounded contexts — Reference: Aggregate consistency boundaries

Sources: [Tactical DDD](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design), [Domain model](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/microservice-domain-model), and [DDD Reference](https://www.domainlanguage.com/wp-content/uploads/2016/05/DDD_Reference_2015-03.pdf).

## Scope and version

This lesson treats an aggregate as a business transaction/consistency boundary, not as a database table group or arbitrary object graph.

## How this group fits the mental model

The aggregate root is the controlled entry point that protects invariants which must hold atomically. Other aggregates are usually referenced by identity; cross-boundary coordination may be eventually consistent.

## Supplied names explained

### Aggregate

A cluster of domain objects treated as one consistency boundary for business updates. External code changes it through its root. Choose boundaries according to invariants and transactions, not merely navigation convenience.

### Aggregate Root

The one entity through which external clients load and mutate the aggregate. It enforces operations and prevents callers from bypassing internal rules. Repositories are commonly defined for roots.

### Aggregate invariant

A rule that must remain true across the aggregate after every committed operation. If one business transaction requires an invariant across two aggregates, reconsider the boundary or model the cross-aggregate process explicitly.

### Transactional consistency boundary

The scope whose changes are expected to commit atomically under the domain’s consistency requirements. Database transactions can implement this boundary locally, but database support and isolation levels still matter.

### Aggregate identity reference

A reference from one aggregate to another, commonly by identity rather than a live object pointer. This limits loading/ownership coupling and clarifies that the other aggregate has its own transaction boundary.

### Aggregate child entity

An entity inside the aggregate whose lifecycle is owned through the root. It may have identity within that boundary but should not be modified independently by external modules.

### Aggregate size tradeoff

Large aggregates can simplify atomic invariants but increase contention, data loading, and change coupling. Small aggregates improve concurrency and ownership but can require eventual consistency between them. Model the smallest boundary that preserves true atomic business rules.

### Eventual consistency between aggregates

Changes across aggregates become visible at different times through a workflow or event process. The application must tolerate and represent interim states, retries, and reconciliation. Eventual consistency is not a guarantee that updates happen instantly or never fail.

## Cross-item comparison

An object graph may describe references, but an aggregate defines the transactional invariant boundary. Aggregate identity references reduce accidental coupling. Eventual consistency is appropriate only when the business process can tolerate delayed cross-boundary updates.

## Examples

An order aggregate may own lines and enforce that a confirmed order has at least one valid line. Inventory reservation may belong to a separate aggregate. Reserving both in one distributed transaction may be impractical; model a workflow with pending/reserved/failed outcomes and compensation if the business accepts that process.

## Common mistakes

- Making every related object one huge aggregate.
- Updating child entities directly from outside the root.
- Assuming a repository is needed for every nested object.
- Using eventual consistency when a rule must be immediately atomic.
- Believing an aggregate boundary automatically guarantees correct database isolation.

## Knowledge checks with answers

1. **How many roots protect an aggregate?** Exactly one root for external access.
2. **What should drive its size?** Invariants and transaction requirements.
3. **What must eventual workflows handle?** Delays, retries, failures, and intermediate state.

### Exact terms covered

- `Aggregate`
- `Aggregate Root`
- `Aggregate invariant`
- `Transactional consistency boundary`
- `Aggregate identity reference`
- `Aggregate child entity`
- `Aggregate size tradeoff`
- `Eventual consistency between aggregates`

### Exact terms covered

- `Aggregate`
- `Aggregate Root`
- `Aggregate invariant`
- `Transactional consistency boundary`
- `Aggregate identity reference`
- `Aggregate child entity`
- `Aggregate size tradeoff`
- `Eventual consistency between aggregates`

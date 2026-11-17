# system design tradeoffs and decision methods — Reference: Normalization vs denormalization

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [PostgreSQL constraints and relational integrity](https://www.postgresql.org/docs/current/ddl-constraints.html), [PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html).

## Scope and version

Normalization and denormalization describe how facts are represented across records/tables or read models. The right choice depends on update invariants and access patterns, not on a rule that one is always faster.

## How this group fits the mental model

If a customer's address is copied into every order row, changing the address requires updating many copies and risks inconsistency. Normalization stores the address once and references it, so one update maintains the fact but reads may join tables. Denormalization intentionally duplicates or precomputes data to make common reads simpler/faster, which creates a synchronization and repair obligation.

## Supplied names explained

Normalization uses keys, relationships, and constraints to represent facts with fewer update anomalies. It does not mean “one table per noun” or automatically yield good queries; indexes, joins, cardinality, and transaction boundaries still matter.

Denormalization includes duplicated columns, materialized views, caches, search indexes, aggregates, and event-fed projections. Choose an authoritative source and define how changes propagate (same transaction, outbox/event stream, refresh, or rebuild). Include lag, duplicate/out-of-order messages, delete propagation, backfill, reconciliation, and schema changes in the design.

## Cross-item comparison

Normalize authoritative write data when many updates must preserve one fact consistently. Add targeted denormalized projections when measured read cost or query locality warrants the duplication. A materialized view can accelerate reads but has refresh/maintenance semantics; a cache can be evicted and rebuilt; a replicated read model may be stale. They are not interchangeable despite all holding duplicate data.

## Examples

A product catalog stores a product's current price once. An order records the price charged at purchase time as a historical snapshot, because that value is a different fact (“price at order”) rather than a redundant copy of current price. A search index projects catalog fields for text search. On price update or deletion, verify event delivery, idempotency, lag, and rebuild from the authoritative catalog.

## Common mistakes

- Removing intentional historical snapshots as if they were accidental duplication.
- Denormalizing without naming the authoritative copy and propagation path.
- Assuming a transactional outbox makes the downstream projection immediately fresh.
- Optimizing read joins before measuring query cost and write/update anomalies.

## Knowledge checks with answers

1. **What is the main consistency risk of duplicated current facts?** Update anomalies and divergence across copies.
2. **When is denormalization justified?** A measured read/access-pattern need, with an explicit source of truth and refresh/rebuild plan.
3. **Why can an order retain a historical price?** It records the price-at-purchase fact, not a stale copy of the current catalog price.

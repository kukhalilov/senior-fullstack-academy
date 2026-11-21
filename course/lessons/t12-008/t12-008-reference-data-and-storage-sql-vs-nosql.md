# system design tradeoffs and decision methods — Reference: SQL vs NoSQL

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [AWS SQL vs NoSQL guidance](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/SQLtoNoSQL.WhyDynamoDB.html), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [DynamoDB transactions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/transactions.html).

## Scope and version

SQL and NoSQL are broad labels, not a ranking or a consistency guarantee. SQL is a query language used by relational and some nonrelational engines; NoSQL includes key-value, document, wide-column, and graph models with different APIs and tradeoffs.

## How this group fits the mental model

Start with the data relationships and questions the application must answer. A relational model makes relations, joins, constraints, and ad hoc queries central. A key-value or document model can make a known access path and aggregate boundary explicit; a graph model makes traversals central. Every choice must still define schema validation, indexing, transactions, consistency, backup, and operational ownership.

## Supplied names explained

Relational databases commonly support declarative SQL, joins, constraints, and multirow transactions, but capacity, isolation, replication, and sharding are product-specific. NoSQL systems may offer transactions and SQL-like query interfaces; “NoSQL” does not imply schema-free, nontransactional, eventually consistent, or automatically scalable. Their partitioning and query limits often make data modeling around access patterns more important.

Compare the exact system using: query flexibility and joins; invariant enforcement and transaction scope; read/write/query shape; scaling and partition behavior; consistency and failure modes; schema migration; secondary indexes; backup/restore; latency/cost at expected workload; and team operations. Polyglot persistence can be useful but adds synchronization and operational boundaries.

## Cross-item comparison

Use a relational system when relationships, constraints, and evolving queries dominate and its scale/latency profile fits. Use a specific NoSQL model when its access pattern, partitioning, or data shape materially helps. A document database may be a poor graph traversal engine; a key-value store may be awkward for ad hoc joins. Validate through representative query plans and failure tests rather than a label.

## Examples

An order placement must atomically reserve inventory and persist an order. Compare SQL transaction support and constraint enforcement with the selected NoSQL product's transaction scope and conditional-write behavior. Then ask how the order history is queried, whether a hot customer key creates a partition hotspot, how indexes affect cost, and how the design restores from backup. Do not infer these answers from “SQL” or “NoSQL.”

## Common mistakes

- Equating SQL with relational and NoSQL with one single data model.
- Assuming NoSQL means no transactions, no schema, or eventual consistency.
- Assuming relational design cannot scale horizontally or NoSQL scales without partition-key limits.
- Comparing only write throughput while ignoring query flexibility, invariants, backup, and operational cost.

## Knowledge checks with answers

1. **Does NoSQL mean the database cannot provide transactions?** No; capabilities vary by product and transaction scope.
2. **What should drive data modeling in a partitioned key-value/document store?** Required access paths, partition key, transaction/invariant scope, and hot-key risk.
3. **What evidence should settle a choice?** Workload-shaped query/transaction tests plus documented failure, consistency, recovery, and cost behavior.

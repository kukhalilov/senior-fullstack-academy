# system design technology landscape and selection — Reference: Relational databases

Sources: [PostgreSQL 18 documentation](https://www.postgresql.org/docs/18/), [MySQL 8.4 InnoDB transaction model](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-model.html), [MySQL 8.4 transaction isolation](https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html), [Cloud Spanner TrueTime and external consistency](https://docs.cloud.google.com/spanner/docs/true-time-external-consistency), [CockroachDB transaction retries](https://www.cockroachlabs.com/docs/stable/developer-basics.html), [HLD Handbook technology overview](https://hld.handbook.academy/technologies/).

## Scope and version

This lesson covers relational databases as an application system-of-record choice and compares PostgreSQL, MySQL, Google Cloud Spanner, and CockroachDB. Versioned links are used where available; cloud service behavior, editions, pricing, limits, and compatibility change, so validate against the exact current deployment documentation. “SQL database” does not mean that engines share identical SQL, isolation, indexing, replication, or operational behavior.

## How this group fits the mental model

A relational database stores data in relations (commonly tables), represents links through keys, and lets applications query and update sets of rows. The key design advantage is that relationships and invariants can be explicit: primary/foreign keys, unique constraints, check constraints, transactions, and queries can protect correctness close to the data. This is useful when several workflows must update related records consistently, such as placing an order, reserving inventory, and recording payment intent.

Transactions group operations into a logical unit. ACID is a useful vocabulary—atomicity, consistency with defined invariants, isolation, and durability—but the exact guarantee depends on engine, transaction mode, schema, and configuration. Isolation determines what concurrent transactions can observe and which anomalies can occur. PostgreSQL uses MVCC snapshots and provides selectable isolation levels; InnoDB combines MVCC and locking, with behavior influenced by isolation and query form. Serializable execution may abort a transaction that must be retried; applications need a bounded retry strategy that repeats the entire business transaction safely.

Indexes accelerate reads by maintaining additional structures, but they consume space and make writes more expensive. A query planner chooses a plan from SQL, indexes, statistics, and cost estimates; inspect actual plans and representative data rather than assuming an index is used. Normalize to avoid unnecessary duplicate facts and update anomalies; denormalize selectively when measured access patterns justify the extra consistency work. Use constraints for invariants such as uniqueness or referential integrity instead of relying only on preflight application checks.

Relational databases scale vertically and can scale reads through replicas, partitioning, or sharding; those choices have distinct consistency, write, routing, and failure consequences. A single-node relational engine is not automatically a distributed SQL system. Distributed SQL adds consensus/replication, cross-node transaction coordination, topology and locality concerns, and often higher tail latency for some operations in exchange for scale and resilience across nodes/regions.

## Supplied names explained

- **PostgreSQL:** general-purpose open-source relational database with extensibility and a broad SQL/data-type feature set. Select exact extensions and versioned features deliberately; MVCC, transaction isolation, indexes, and operations remain workload-dependent.
- **MySQL:** relational database family; this comparison specifically references MySQL 8.4 with InnoDB. Its default isolation, locking reads, gap/next-key locks, and optimizer/storage-engine behavior should be assessed for the exact queries and schema.
- **Spanner:** Google Cloud distributed relational database. Its documented TrueTime and transaction timestamp model provide external consistency by default for serializable transactions; geography, schema design, read modes, latency, and managed-service coupling affect fit.
- **CockroachDB:** distributed SQL database designed for transactional workloads across nodes. Serializable transactions can require retries under contention; use supported retry wrappers and understand locality and topology behavior.

## Cross-item comparison

| Choice | Typical reason to evaluate | Questions to verify before choosing |
| --- | --- | --- |
| PostgreSQL | Rich relational modeling, SQL, extensibility, and self-managed or managed deployment options | Which version/extensions? What are HA, backup/PITR, upgrade, replication lag, and operational staffing requirements? |
| MySQL/InnoDB | Existing MySQL ecosystem, managed offerings, application compatibility, and transactional relational data | Does the workload depend on InnoDB-specific isolation/locking? What are replication and failover semantics? Are SQL features portable? |
| Spanner | Managed horizontal scale and strong distributed transaction behavior across regions | What write/read locality and latency do the schema and placement imply? What are service coupling, cost, quotas, and migration tradeoffs? |
| CockroachDB | Distributed SQL with PostgreSQL-wire/protocol ecosystem and multi-node deployment | Which PostgreSQL features are compatible? What retry/transaction patterns and region placement are required? What is operational and licensing cost? |

No product name substitutes for workload evidence. Compare representative read/write mixes, transaction size, hot-key contention, query complexity, data volume, growth, regional access, recovery-point/recovery-time objectives, and operator capability. A managed service can reduce routine infrastructure work but does not remove schema, backup, access-control, observability, cost, or disaster-recovery responsibilities.

## Examples

For an order system, define an invariant that inventory cannot be reserved twice. A “read available quantity, then update” flow can race. Use a transaction with a conditional update or locking/constraint design appropriate to the engine, persist an idempotency key for retries, and emit downstream events using an outbox or another reliable handoff. Test concurrent reservations under the actual isolation level. If serialization failures occur, retry the full decision with a bounded policy; do not blindly retry only the final SQL statement.

For an analytics-heavy workload, avoid assuming that adding more OLTP replicas solves large scans. Consider separating analytical workloads into a warehouse/columnar system or using replicas with explicit freshness limits. For a geographically distributed application, compare keeping a primary in one region plus read replicas against a distributed SQL topology. A multi-region database can preserve stronger transactional semantics but may add coordination latency; data placement and access locality still determine practical performance.

## Common mistakes

- Treating ACID as a single identical guarantee across all engines and configurations.
- Assuming SQL or PostgreSQL wire compatibility means feature and behavior equivalence.
- Choosing a database before identifying entities, invariants, transaction boundaries, query patterns, and consistency needs.
- Using indexes as free performance; each adds write, storage, and maintenance cost.
- Relying on application-side “check then write” for uniqueness or no-overlap invariants under concurrency.
- Ignoring transaction retries, deadlocks, lock duration, connection pooling, and long-running transactions.
- Calling a read replica current without measuring/communicating replication lag and consistency semantics.
- Moving to distributed SQL solely because traffic is growing, without testing latency, locality, contention, operations, and cost.
- Assuming managed backup means tested restore; perform recovery drills against stated RPO/RTO.

## Knowledge checks with answers

1. **What should guide a relational database choice?** Data invariants, transaction/query patterns, consistency and durability requirements, operational ownership, regional needs, recovery targets, ecosystem, and cost.
2. **What does an index trade?** Additional storage and write/maintenance work for faster access paths when the planner can use it.
3. **Why can Serializable transactions still return an error?** The engine may abort a conflicting transaction to preserve serializable outcomes; the application must safely retry the whole transaction.
4. **Does distributed SQL make every query faster?** No. It can improve scale/resilience and simplify distributed transactions, while coordination, placement, and network distance can raise latency or cost.

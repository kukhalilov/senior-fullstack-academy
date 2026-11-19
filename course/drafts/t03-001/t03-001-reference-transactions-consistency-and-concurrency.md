# database comparisons SQL Server PostgreSQL MySQL document stores and tradeoffs — Reference: Atomicity, isolation, concurrency, and replication semantics

# Scope and version

Engine facts and release channels are pinned to the source snapshot checked 2026-11-20. Managed-service version/feature availability varies by provider and offering; verify the exact target. The list below contains only the supplied names.

# How this group fits the mental model

Transaction and replication terms describe different boundaries: what changes atomically, what concurrent work can see, and what the system acknowledges before replying.

# Supplied names explained

- `ACID transaction` — Atomicity, consistency, isolation, and durability properties used to describe transactional guarantees. Scope, durability configuration, and isolation details remain product-specific.

- `Atomicity` — All-or-nothing effect of a transaction or operation within its documented atomicity boundary; single-document MongoDB writes are atomic, while multi-document scope differs.

- `Consistency` — A transaction preserves declared/application invariants when its operations and constraints are correct; ACID consistency does not mean replicas are instantaneously identical.

- `Isolation` — Controls visibility/interference among concurrent transactions through locks, versions, or other mechanisms; named levels can differ across vendors.

- `Durability` — Committed changes survive documented failures under configured logging, flush, replication, and storage settings; asynchronous replication is a separate acknowledgement boundary.

- `Transaction boundary` — Set of statements/records committed or rolled back together. Identify whether it is one row, document, transaction, database, or distributed workflow.

- `Autocommit` — Mode where each statement or operation is committed as its own transaction unless an explicit transaction changes the boundary.

- `Explicit transaction` — Application-controlled begin/commit/rollback boundary across multiple operations, subject to engine support and resource/lock lifetime.

- `Isolation level` — Named concurrency contract controlling phenomena such as nonrepeatable reads or serialization conflicts; exact implementation and snapshot scope differ.

- `Read committed` — Isolation level that prevents dirty reads, but permits data committed by another transaction between statements. SQL Server defaults to it, with locking or statement-snapshot behavior depending on READ_COMMITTED_SNAPSHOT configuration. PostgreSQL takes a new snapshot for each command. MySQL InnoDB supports it but defaults to REPEATABLE READ. Therefore, “read committed” is not a promise of identical concurrency behavior.

- `Repeatable read` — Protects repeated reads more strongly than read committed, but exact phantom and predicate behavior varies. InnoDB defaults to REPEATABLE READ and combines consistent snapshots with next-key/gap locking for relevant locking reads. PostgreSQL’s implementation prevents phantoms but can still allow serialization anomalies. SQL Server REPEATABLE READ does not provide the same range protection as SERIALIZABLE. Check the exact engine’s anomaly table and locking/read semantics.

- `Serializable isolation` — Strong isolation intended to make concurrent transactions equivalent to a serial order, often by blocking or detecting conflicts; cost and mechanisms vary.

- `Snapshot isolation` — Reads from a consistent version/snapshot and typically detects certain write conflicts; it is not the same as full serializability.

- `Multi-version concurrency control (MVCC)` — Concurrency technique retaining row versions so readers can avoid some writer blocking. Version retention, cleanup, conflicts, and isolation semantics are implementation-specific.

- `Optimistic concurrency control` — Allows work to proceed without prelocking all conflicts, then detects a conflicting write/version at commit or conditional update.

- `Pessimistic locking` — Reserves or locks resources to prevent conflicting work, which can simplify conflict handling but introduces blocking and deadlock risk.

- `Row-level lock` — Lock scoped to a row/key or equivalent resource; granularity and escalation behavior vary by storage engine and operation.

- `Table-level lock` — Lock scoped to a whole table/collection or relation; can be intentional or chosen by engine for maintenance/locking strategy.

- `Deadlock detection` — Detects a cycle in which transactions wait on each other and aborts or selects a victim. This is distinct from a serialization failure, where a serializable transaction is rejected because its concurrent result cannot be safely serialized. Applications should identify the vendor error and retry only the documented retryable transaction scope.

- `Write conflict` — Concurrent changes violate a transaction’s snapshot or write precondition; some engines block, some abort, and drivers/applications may need retry logic.

- `Unique-key race` — Two transactions concurrently attempt the same supposedly new key; only a database uniqueness constraint reliably arbitrates the race across application instances.

- `Read-your-writes consistency` — A client sees its own preceding acknowledged change in a later read under the selected session and routing policy. In MongoDB, a majority write acknowledgement does not mean every secondary has applied the change already; a causally consistent session with suitable majority read/write concerns can carry the ordering when reading from secondaries.

- `Linearizability` — Strong real-time ordering guarantee for operations relative to their completion/starting times; do not infer it from ACID or replica count alone.

- `Causal consistency` — Preserves observed cause-before-effect ordering for related operations. In MongoDB, causally consistent sessions propagate operation/cluster time; the documented full set of guarantees requires majority read concern and majority write concern. Causal consistency does not make a session isolated from concurrent writes.

- `Eventual consistency` — Replicas may temporarily disagree and are expected to converge after updates stop if propagation and conflict resolution complete. The label alone gives no convergence deadline, read-your-writes guarantee, or conflict-resolution policy.

- `Primary-replica replication` — One primary accepts writes and propagates changes to replicas. Commit acknowledgement and read routing determine lag/data-loss behavior.

- `Synchronous replication` — Commit waits for configured replica acknowledgement at a specified durability point; what is acknowledged and failover safety depend on product and configuration.

- `Asynchronous replication` — Primary acknowledges without waiting for replica completion, allowing lag and possible loss of unreplicated writes during failure.

- `Quorum write` — Write acknowledged after a configured replica/vote threshold. A majority may be calculated from voting members rather than meaning every replica has applied the change; exact failure domains, persistence point, and read-after-write behavior are product-specific.

- `Read concern` — MongoDB policy controlling consistency/isolation properties of reads, such as local, majority, or linearizable behavior under documented constraints.

- `Write concern` — MongoDB acknowledgement policy requiring a configured number/state of nodes to acknowledge a write. The w, j, and wtimeout options affect acknowledgement requirements and waiting behavior; a write-concern timeout does not roll back a write that may already have succeeded.

- `MongoDB multi-document transaction` — Provides ACID transaction behavior across multiple documents/collections within supported replica-set or sharded-cluster deployments. It incurs more coordination and resource cost than a single-document atomic write; transaction size, duration, retry behavior, and topology limits matter.

- `Relational transaction` — Groups relational statements under an engine’s transaction and isolation rules; a transaction does not automatically span independent databases or services.

- `Cross-document atomicity boundary` — MongoDB single-document writes are atomic; multi-document changes need a transaction or redesign and have different cost/availability implications.

# Cross-item comparison

Relational transactions commonly span statements/rows within a database; MongoDB single-document writes are atomic and its multi-document transactions expand that boundary with additional coordination. Isolation level governs what a transaction can observe; read concern selects MongoDB read visibility; write concern controls acknowledgement; replication mode describes propagation/acknowledgement timing; and quorum describes a threshold. None substitutes for another. Compare the exact acknowledged durability point, failover assumptions, and whether a read routed to a secondary can observe the acknowledged write.

# Examples

```text
One order document update: may fit MongoDB single-document atomicity.
Order + inventory in separate documents: define a multi-document transaction or redesign the invariant.
In any engine, test duplicate-key races, commit acknowledgement, replica lag, retry behavior, and durability configuration.
```

For PostgreSQL 19, a client that writes on a primary and then reads from a standby can use WAIT FOR LSN to wait for replay through a known WAL position before reading. This is a product-specific read-your-writes mechanism, not a generic consequence of synchronous replication. MongoDB can instead preserve causal ordering through a causally consistent session with majority concerns. Both choices add latency or coordination and must be tested under failover and routing changes.

These are decision sketches, not benchmark results or guarantees. Check the target engine/service documentation and test under the workload that matters.

# Common mistakes

- Inferring constraints or null behavior from one engine’s SQL syntax.
- Embedding unbounded child data or duplicating facts without a consistency owner.
- Comparing “synchronous” settings without knowing which acknowledgement is required.
- Calling a compatibility service the original engine.
- Counting a read replica as an independent backup.
- Comparing only average latency or one warmed-up query.
- Ignoring upgrade cadence, extensions, keys, restore time, and provider feature gaps.

# Knowledge checks with answers

1. What does a read concern describe? **MongoDB read consistency/visibility policy.**
2. Can a replica acknowledgment mean zero data loss? **Only under the exact configured commit/replication guarantee and failure assumptions.**
3. What prevents a unique-key race? **A database-enforced unique constraint/index.**

# Sources

- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql?view=sql-server-ver17)
- [Official documentation](https://learn.microsoft.com/en-us/sql/sql-server/editions-and-components-of-sql-server-2025?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/19/)
- [Official documentation](https://www.postgresql.org/docs/19/transaction-iso.html)
- [Official documentation](https://www.postgresql.org/docs/19/runtime-config-wal.html)
- [Official documentation](https://www.postgresql.org/support/versioning/)
- [Official documentation](https://www.postgresql.org/docs/19/release-19.html)
- [Official documentation](https://www.postgresql.org/about/news/postgresql-19-released-3449/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/)
- [Official documentation](https://dev.mysql.com/doc/relnotes/mysql/9.7/en/)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html)
- [Official documentation](https://blogs.oracle.com/mysql/mysql-october-2026-ga-releases-now-available)
- [Official documentation](https://dev.mysql.com/doc/refman/26.10/en/)
- [Official documentation](https://www.mongodb.com/docs/manual/release-notes/9.0/)
- [Official documentation](https://www.mongodb.com/docs/manual/release-notes/)
- [Official documentation](https://www.mongodb.com/legal/support-policy/lifecycles)
- [Official documentation](https://www.mongodb.com/docs/manual/data-modeling/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/transactions/)
- [Official documentation](https://www.mongodb.com/docs/manual/reference/read-concern/)
- [Official documentation](https://www.mongodb.com/docs/manual/reference/write-concern/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/causal-consistency-read-write-concerns/)
- [Official documentation](https://www.mongodb.com/docs/manual/core/read-isolation-consistency-recency/)
- [Official documentation](https://www.mongodb.com/docs/manual/indexes/)
- [Official documentation](https://www.mongodb.com/docs/manual/sharding/)
- [Official documentation](https://www.mongodb.com/docs/atlas/)
- [Official documentation](https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_MySQL.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [Official documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_SQLServer.html)
- [Official documentation](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview?view=azuresql)
- [Official documentation](https://learn.microsoft.com/en-us/azure/azure-sql/managed-instance/sql-managed-instance-paas-overview?view=azuresql)
- [Official documentation](https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/)
- [Official documentation](https://www.postgresql.org/docs/19/ddl-constraints.html)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-model.html)
- [Official documentation](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17)
- [Official documentation](https://www.postgresql.org/docs/19/transaction-iso.html)
- [Official documentation](https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html)

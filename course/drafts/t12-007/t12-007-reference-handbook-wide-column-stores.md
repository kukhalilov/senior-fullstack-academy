# system design technology landscape and selection — Reference: Wide-column stores

Sources: [Apache Cassandra data modeling](https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/intro.html), [ScyllaDB: Data definition and primary keys](https://docs.scylladb.com/manual/stable/cql/ddl.html), [Google Cloud Bigtable: Schema design](https://docs.cloud.google.com/bigtable/docs/schema-design), [Apache HBase: Data model](https://hbase.apache.org/docs/datamodel/), [HLD Handbook: Technology index](https://hld.handbook.academy/technologies/).

## Scope and version

Wide-column stores are distributed databases organized around partitioned, often sparse records and query-oriented key layouts. The name does not mean that they are relational databases with unusually many columns, nor that they are analytical columnar warehouses. This lesson covers Cassandra, ScyllaDB, Bigtable, and HBase at the data-model and architecture level. Product versions, APIs, and deployment models differ; consult each current vendor reference before implementation. Sources checked 2026-11-21.

## How this group fits the mental model

Start from the reads and writes you must serve. In these systems, the row or partition key is a central routing and access decision, not just a primary-key constraint. Related records may be colocated and ordered so a known key or range can be read efficiently. That pattern can provide high throughput at scale, but arbitrary joins and unplanned queries are not the default strength. You usually design tables around important access patterns and accept denormalization or application-level coordination.

## Supplied names explained

- **Partition key:** selects the partition/shard or range where data is placed. A good design spreads load while keeping records needed together accessible; a single hot or unbounded key can concentrate traffic and storage.
- **Clustering columns / sort order:** in Cassandra-compatible CQL systems, clustering columns order rows within a partition and support range access in that order. Bigtable and HBase also use lexicographically ordered row keys, so key encoding and scan ranges matter.
- **Sparse columns and column families:** Bigtable and HBase model rows with column families declared at schema level and qualifiers that can be sparse or vary by row. Avoid assuming the same physical layout or semantics across all products.
- **Query-driven denormalization:** Cassandra-family models often create separate tables for separate access patterns because joins and unrestricted relational querying are not their intended model. Multiple denormalized representations require a consistency and repair strategy.
- **Replication and consistency:** Cassandra/ScyllaDB use replication and tunable consistency levels; the choice changes latency, availability under failures, and the chance that reads observe recent writes. A successful write at one consistency level is not a universal linearizability guarantee. Bigtable and HBase expose different consistency and transaction semantics; verify their specific contract.
- **Cassandra:** Apache Cassandra is an open-source distributed wide-column database using CQL. Its partition key determines data placement; clustering columns order rows inside a partition. Data modeling and partition sizing must follow queries and avoid hotspots.
- **ScyllaDB:** a distributed database with CQL support and Cassandra compatibility documentation. Similar query concepts do not mean identical behavior or feature parity; validate the versioned compatibility matrix, operational model, and migration requirements.
- **Google Cloud Bigtable:** a managed wide-column key/value service. Its row-key order supports point, prefix, and range reads; schema design should follow planned queries and avoid hot key ranges. Google documents that row-level transactions are supported, not multi-row relational transactions.
- **Apache HBase:** a distributed database in the Hadoop ecosystem. Tables contain rows sorted by row key; column families are defined up front and physically colocate data, while qualifiers can be added dynamically. Row-key design strongly affects locality and hotspot risk.

## Cross-item comparison

| System | Data/key model | Typical decision boundary |
| --- | --- | --- |
| Cassandra | CQL tables, partition key, clustering order, replicated peers | Choose when distributed writes and query-specific table layouts fit; operate repair, compaction, capacity, and consistency deliberately |
| ScyllaDB | Cassandra-compatible CQL model with its own implementation and version-specific compatibility | Compare actual feature/driver compatibility, performance evidence, node economics, and operating expertise |
| Bigtable | Managed sparse key/value rows, sorted row keys, column families | Choose when managed, large-scale key/range access fits and row-key design can serve the query set |
| HBase | Sorted row keys, column families, Hadoop ecosystem integration | Choose when HBase’s ecosystem and operational ownership fit; account for cluster operation and workload characteristics |

These are category-level comparisons, not benchmark rankings. Measure representative reads/writes, skew, recovery, replication, and cost in the deployment model you will actually run.

## Examples

For user activity history, a query may request the latest events for one user over a date interval. In a Cassandra-style table, `(user_id, day)` could form a partition key and `event_time` a clustering key, creating bounded time buckets and ordered reads. This can work well if bucket size and user traffic are bounded; a very active user can still create a hot partition, and reads across many buckets require fan-out. In Bigtable or HBase, a row-key encoding might group the same user/time range, but sequential timestamp prefixes can create hot ranges; reverse or salted key segments may spread writes while making range reads more complex. Choose from observed query and write patterns, not from product names.

## Common mistakes

- Confusing wide-column NoSQL with columnar analytics storage.
- Choosing a partition/row key based on entities alone instead of required query locality and load distribution.
- Creating unbounded partitions or hot key ranges.
- Expecting arbitrary SQL joins or secondary-index freedom without checking the product’s model and limits.
- Assuming Cassandra, ScyllaDB, Bigtable, and HBase share identical CQL, transaction, consistency, or operations semantics.
- Treating replication factor or write acknowledgement as a complete durability/recovery plan; repair, backups, failure domains, and restore tests still matter.
- Denormalizing into multiple tables without defining how writes, retries, and reconciliation keep them aligned.
- Applying vendor benchmark numbers without matching workload, data distribution, durability, and configuration.

## Knowledge checks with answers

1. **Why do these databases emphasize key design?** Keys control placement, locality, ordering, and which reads avoid broad scans.
2. **What do clustering columns do in Cassandra/ScyllaDB?** They order rows within one partition and support key-constrained range access.
3. **Do Bigtable and HBase use column families in exactly the same way as Cassandra?** No. Similar vocabulary does not imply identical physical or transactional semantics.
4. **How should you handle a query that crosses many partitions?** Measure its cost and either redesign the key/table layout, maintain a derived access path, or accept bounded fan-out with explicit latency/cost handling.
5. **What should be tested before selecting a product?** Realistic key skew, query shapes, consistency/recovery needs, failure behavior, operational requirements, migration path, and total cost.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder text with a comparative data-model lesson for Cassandra, ScyllaDB, Bigtable, and HBase. Checked official product documentation for key/partition behavior, clustering order, sparse column families, row-key query design, and Bigtable’s row transaction boundary. Explicitly separated category-level guidance from vendor-specific semantics and version compatibility. No material omission remains in the supplied topic scope.

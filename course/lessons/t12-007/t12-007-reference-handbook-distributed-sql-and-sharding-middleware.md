# system design technology landscape and selection — Reference: Distributed SQL and sharding middleware

Sources: [TiDB architecture](https://docs.pingcap.com/tidb/stable/tidb-architecture/), [TiDB architecture FAQ](https://docs.pingcap.com/tidb/stable/tidb-faq/), [Vitess sharding guidelines](https://vitess.io/docs/25.0/user-guides/vschema-guide/sharding-guidelines/), [Vitess resharding](https://vitess.io/docs/24.0/user-guides/configuration-advanced/resharding/), [YugabyteDB transactions](https://docs.yugabyte.com/stable/explore/transactions/), [YugabyteDB distributed transactions](https://docs.yugabyte.com/stable/architecture/transactions/distributed-txns/), [Spanner schema design](https://docs.cloud.google.com/spanner/docs/schema-design), [HLD Handbook technology overview](https://hld.handbook.academy/technologies/).

## Scope and version

This lesson compares TiDB and YugabyteDB as distributed SQL platforms and Vitess as a sharding and database-cluster management layer, especially for MySQL. It also contrasts them with managed distributed databases such as Spanner. Product versions and compatibility evolve quickly; this lesson uses official documentation versions linked above and does not imply that wire-protocol or SQL compatibility equals feature parity.

## How this group fits the mental model

Sharding divides a dataset across database nodes so no one node stores or serves every row. It can increase capacity, but it changes the application problem: a query needs a shard key, transactions may cross shards, joins may become distributed, and operational tasks include shard placement, migration, rebalancing, and failure handling. The hardest commitment is often the partition key, because it determines where data lives and which operations are local.

Distributed SQL attempts to preserve a relational SQL/transaction programming model while the engine partitions and replicates data across machines. The system may include stateless SQL gateways, a distributed transactional storage layer, consensus replication, metadata/control-plane services, and sometimes separate analytical nodes. A transaction that touches several partitions may need coordination across them; strong distributed transactions can cost additional network round trips. Region placement and schema locality influence read/write latency even when the API looks familiar.

Sharding middleware takes a different route. It routes requests to underlying relational shards based on a configured key mapping, and may offer tooling for online resharding, connection pooling, and topology management. It does not automatically turn all sharded operations into a single local transaction or make arbitrary queries efficient. Keep writes and joins within a shard where possible; explicitly identify when cross-shard behavior is required and test the middleware’s supported semantics.

## Supplied names explained

- **TiDB:** distributed SQL system with stateless SQL servers, a control/metadata component, and distributed transactional key-value storage (TiKV); TiFlash provides a columnar analytical path in documented deployments. TiDB documents MySQL protocol compatibility, ACID transaction support, and Snapshot Isolation behavior in TiKV; verify exact SQL feature and isolation behavior for the release in use.
- **Vitess:** sharding middleware and cluster-management system built around MySQL-compatible databases. Vindexes map application values to keyspace IDs/shards; a primary Vindex is part of routing design. Resharding copies and verifies data while serving traffic, but cutover and cross-shard feature constraints remain operational concerns.
- **YugabyteDB:** distributed database with YSQL (PostgreSQL-compatible relational API) and YCQL API. YSQL supports distributed transactions with multiple isolation levels; transactions spanning tablets/nodes incur distributed coordination. Treat compatibility and retry semantics as version-specific.
- **Spanner comparison:** managed distributed relational database with global transaction semantics and schema/key design requirements. Its strong consistency does not remove the need to avoid hotspots or design locality.

## Cross-item comparison

| Option | Who owns the sharding model? | Main benefit | Main cost/risk |
| --- | --- | --- | --- |
| Application-managed sharding | Application and data platform team | Maximum control over routing and locality | Every service/query/migration must understand topology; cross-shard operations are complex |
| Vitess middleware | Middleware plus operators, with application schema/access-pattern decisions | Routes MySQL-compatible workload and provides shard/reshard tooling | MySQL compatibility limits, vindex/key design, operational topology, and expensive cross-shard work |
| TiDB | Distributed SQL engine manages partitioning/replication behind SQL layer | Relational transactions and SQL over distributed storage; separate analytical components available | Distributed transaction cost, hotspot/schema design, multi-component operations, and release compatibility |
| YugabyteDB | Distributed SQL engine manages tablets and replication | Distributed SQL APIs and transactions across nodes/regions | Coordination latency, locality and topology complexity, retries, and feature differences from PostgreSQL |
| Spanner | Managed cloud database manages splits and replication | Strong managed distributed transaction model across regions | Provider coupling/cost and need for schema/key placement that avoids hotspots |

## Examples

An order service shards orders by `customer_id` so order reads and updates for one customer route to one shard. The same key may colocate line items and customer-specific history. A report asking for all orders across every customer becomes scatter/gather or an analytical pipeline. A global inventory decrement spanning products assigned to different shards is a distributed transaction or a redesigned workflow; do not assume it has the same latency/cost as a single-shard transaction.

During resharding, the system needs a source/destination mapping, a copy phase, change capture or dual-write/catch-up, validation, cutover, rollback planning, and old-shard cleanup. Vitess documents copying, verification, replication catch-up, then changing serving infrastructure; exact cutover semantics depend on tool/version. Test write behavior, lag, retries, and recovery before production migration. Distributed SQL reduces some application routing work but still needs load testing for hot keys, cross-region transactions, and failover.

## Common mistakes

- Confusing a database’s automatic range splits with a sharding middleware’s application-facing key mapping.
- Assuming MySQL/PostgreSQL protocol compatibility means complete SQL, extension, isolation, and tooling parity.
- Picking a sequential timestamp key that funnels writes into one hot range.
- Ignoring cross-shard joins, uniqueness, transactions, secondary indexes, and global identifiers until after migration.
- Believing sharding automatically fixes a hot key; a single popular entity can remain a hotspot.
- Treating a successful reshard copy as proof of correctness without validation and a cutover/rollback plan.
- Assuming multi-region placement makes every transaction local or low latency.
- Adopting distributed SQL before checking whether query/index/vertical scaling or read replicas meet measured needs.

## Knowledge checks with answers

1. **What is the main design decision in sharding?** The partition key and data locality, because they govern routing, hot spots, query efficiency, and cross-shard work.
2. **How does distributed SQL differ from middleware sharding?** The engine manages partitioning and distributed transactions behind a SQL interface; middleware routes an application-compatible database cluster according to configured sharding metadata. Both still have locality and cross-shard costs.
3. **Does resharding eliminate downtime and risk?** No. Online copying can reduce downtime, but catch-up, verification, cutover, rollback, and feature constraints must be planned and tested.
4. **Why can an apparently compatible migration fail?** Wire protocol or syntax compatibility does not guarantee identical SQL features, isolation, query plans, drivers, extensions, or operational behavior.

# system design foundations and infrastructure building blocks — Reference: Edge database

Sources: [AWS multi-Region fundamentals](https://docs.aws.amazon.com/prescriptive-guidance/latest/aws-multi-region-fundamentals/), [Aurora global database](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database.html), [Aurora write forwarding and consistency](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-write-forwarding-apg.html), [Aurora failover](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-global-database-disaster-recovery.html), [DynamoDB global tables](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/V2globaltables_HowItWorks.html), [DynamoDB global table guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/dynamodb-global-tables/overview.html), [Spanner instance configurations](https://docs.cloud.google.com/spanner/docs/instance-configurations), [Spanner transactions](https://docs.cloud.google.com/spanner/docs/transactions), [CockroachDB multi-region capabilities](https://www.cockroachlabs.com/docs/stable/multiregion-overview.html), [YugabyteDB row-level geo-partitioning](https://docs.yugabyte.com/stable/explore/multi-region-deployments/row-level-geo-partitioning/), [Couchbase XDCR](https://docs.couchbase.com/server/current/learn/clusters-and-availability/xdcr-overview.html).

## Scope and version

“Edge database” describes a placement and access pattern, not one consistency model or product. This lesson compares common architectures using current AWS Aurora and Google Cloud Spanner documentation as examples. Exact topology options, supported versions, regions, and guarantees are product-specific and can change; verify them for a real design.

## How this group fits the mental model

Users may be far from a central database, and a local database can reduce read latency or keep some work available during a network partition. But moving copies of data closer to users creates a decision: which copy accepts writes, when other copies see those writes, and what happens if two locations change the same logical record while disconnected?

Start by labeling every datum with an owner and required operation. A product catalog can often tolerate a short stale read; bank balance, inventory reservation, and unique username allocation may require one authoritative transaction. Then choose among three broad patterns:

1. **Single write authority with nearby read replicas.** Writes go to a primary region and propagate asynchronously. Local reads are fast but may be stale; a failover may have a nonzero recovery point depending on replication state. Aurora Global Database documents this primary/secondary pattern.
2. **Forwarded writes to a primary.** A client can connect through a secondary and forward writes to the primary. This hides some routing work, but write latency still includes the trip to the primary, and read consistency settings determine whether a local read waits for forwarded changes or can be stale.
3. **Distributed transaction/quorum database.** The database replicates across locations and coordinates replicas to provide a stronger global transaction contract. Spanner documents external consistency for its default serializable transactions. CockroachDB and YugabyteDB expose SQL multi-region placement options that can home rows or tables near users while replicating across failure domains. Stronger global invariants can require cross-region communication, so geographic placement and quorum/consensus policy affect latency and failure behavior. The application still has to account for transaction retries and side effects outside the database.

An offline-capable client or local edge node that accepts writes without reaching the authority creates a fourth problem: conflict reconciliation. You need domain-specific merge rules, version vectors/causal metadata or a single-writer lease, and a clear user experience for unresolved conflicts. “Last write wins” is a policy that can discard a valid update; it is not a universal correctness solution.

There is no single meaning of “multi-region database.” For example, current DynamoDB global tables offer **MREC** (the default mode: asynchronous replication with eventual convergence and per-item last-writer-wins conflict resolution) and **MRSC** (introduced in 2025: synchronous replication to another Region before success, strong reads across replicas, exactly three Regions including either three replicas or two replicas plus a witness, zero RPO under its contract, and higher cross-Region latency). MRSC does not support DynamoDB transaction operations or TTL deletion, and the consistency mode is chosen at creation. Couchbase XDCR is a separate cross-cluster replication mechanism that can be unidirectional or configured in opposite directions; concurrent writes can conflict and require a configured resolution policy. These designs differ in data model, transaction scope, conflict handling, and outage behavior. Do not infer semantics from the words “global table,” “replication,” or “edge.”

## Supplied names explained

- `Edge database` — A database positioned near users, devices, or edge compute. It may be a read replica, cache, regional primary, local embedded store, or part of a distributed database. Location alone says nothing about write ownership, consistency, transactions, or offline conflict handling.

## Cross-item comparison

| Pattern | Write behavior | Read behavior | Main trade-off |
| --- | --- | --- | --- |
| Central primary plus edge cache | Writes reach central authority | Very fast cache hits; stale until expiry/invalidation | Simple and cheap for cacheable data; cache is not an authoritative database |
| Primary database plus regional read replicas | One write authority; replicas receive changes later | Local reads may lag unless routed/waited for | Easier correctness model, but cross-region writes are slower and stale reads must be acceptable or avoided |
| Write forwarding | Secondary sends writes to primary | Consistency mode can trade wait/latency for freshness | Convenient routing, but does not make the write local or remove primary dependence |
| Multi-region quorum/strong transactions | Database coordinates replicas to commit | Strong transactional reads under product contract | Higher coordination and possible WAN latency; simpler app invariants if the product semantics fit |
| Multi-writer offline replication | Several locations accept writes independently | Local reads/writes continue during disconnection | Requires conflict-free data types or explicit application merge policy; harder testing and user-facing conflict semantics |

### Current product examples and their distinct contracts

| Product family | Placement and replication model | What the application must account for |
| --- | --- | --- |
| Aurora Global Database | One primary Region with read-only secondary Regions; Aurora replicates changes asynchronously. Aurora PostgreSQL also offers optional secondary-to-primary write forwarding with configurable session/eventual/global read consistency modes. | The write is still coordinated with the primary. Stronger secondary read modes may wait for replication; global failover and promotion have explicit recovery behavior. |
| DynamoDB global tables MREC | Default multi-active regional replicas with asynchronous per-item replication and last-writer-wins convergence. | Cross-Region reads can be stale; simultaneous updates to one item can overwrite each other; RPO follows replication delay, often seconds. |
| DynamoDB global tables MRSC | Multi-Region strong-consistency mode using three Regions (three replicas or two replicas plus a witness); synchronous write replication and strong reads across replicas. | Zero RPO under its contract but higher write/read latency; exactly three Regions; no transaction operations or TTL deletion; consistency mode cannot be changed after creation. |
| Google Cloud Spanner | Distributed relational database with serializable external consistency by default; instance configuration controls replica placement and quorum. | Transactions can retry; geography and quorum placement affect latency; verify exact configuration and supported regional set. |
| CockroachDB / YugabyteDB | Distributed SQL systems with multi-region table/row locality and replica-placement controls. | Locality, survivability, and transaction scope are configurable; confirm product-version semantics, replication topology, and data-residency design. |
| Couchbase Server XDCR | Continuous document replication across clusters, optionally in opposite directions. | Replication is asynchronous; active-active writes can conflict; indexes are not replicated as document data and must be rebuilt/provisioned separately. |

## Examples

### Product catalog with global traffic

Store canonical catalog records in a primary or globally consistent database. Cache product descriptions close to users with a bounded freshness window and invalidate or version them after updates. Keep price/availability decisions on an authoritative path if stale data could create a financial or inventory error. Measure cache hit rate and staleness separately from database latency.

### Inventory reservation

Two users in different regions attempt to reserve the last item. If each local replica accepts an independent decrement and replication is asynchronous, both regions can report success before seeing the other's write. Avoid this with a single write authority, a globally consistent transaction system, or partitioned inventory quotas whose ownership is explicit. The design choice changes latency and availability during a partition; no replication setting removes that trade-off.

### Offline field application

A device records edits while disconnected and later synchronizes. Define which fields can merge automatically (for example, append-only observations) and which require a conflict screen or server decision (for example, assigning one technician to a job). Store operation IDs so retrying synchronization is idempotent. Preserve both conflicting versions for review rather than silently overwriting when the domain cannot safely merge them.

### Failover and read-your-writes

An application writes in a primary region and then reads from a nearby secondary. If the secondary has not applied the write, a user may see an older value. Route that user's follow-up read to the primary, use a documented session-consistency mechanism, or wait for the replica to reach an appropriate consistency point. In a regional failure, promotion changes ownership; define who may promote, how split brain is prevented, what acknowledged writes might be lost, and how clients discover the new primary.

## Common mistakes

- Assuming “edge” means data is both local and strongly consistent everywhere.
- Calling asynchronous replicas multi-master or treating a read replica as a safe independent writer.
- Treating DynamoDB global tables as one consistency contract. MREC and MRSC differ in replication, conflict behavior, regional availability, latency, transactions, TTL, and RPO.
- Assuming a database product's “multi-region” mode automatically provides local writes with global strong consistency at single-region latency. Quorum distance and conflict rules are fundamental design costs.
- Assuming failover has zero data loss because the replica is close. Inspect actual replication and promotion semantics and set an explicit RPO/RTO.
- Ignoring read-your-writes when a user's next request is routed to a lagging replica.
- Using last-write-wins for money, inventory, or user edits without analyzing whether overwriting either operation is acceptable.
- Assuming a database transaction includes payment, email, or another external system. Use an outbox/saga and idempotent side effects.
- Replicating sensitive data to every geography without checking residency, retention, encryption, and deletion requirements.
- Measuring only average latency. Track tail latency, replica lag, conflict rate, transaction retries, failover time, and stale-read rate.

## Knowledge checks with answers

1. **What question must be answered before selecting an edge database?** Which system/location owns writes for each datum, and what consistency does each read or update require?
2. **Does a nearby asynchronous replica guarantee read-your-writes?** No. It can lag. Route the read appropriately or use a documented mechanism that waits for the write to become visible.
3. **Why does quorum replication sometimes increase write latency?** A commit may need acknowledgements from replicas in multiple failure domains, including distant regions; the durability/consistency contract requires waiting for coordination.
4. **What is the core problem with multi-writer offline sync?** Independent updates can conflict. The application needs domain-specific merging, conflict presentation, or a single-writer authority.
5. **What does a failover plan need beyond a replica?** Promotion rules, split-brain prevention, client discovery/routing, measured RPO/RTO, consistency after promotion, and tested recovery.
6. **How do DynamoDB global-table MREC and MRSC differ?** MREC replicates asynchronously and converges with per-item last-writer-wins; MRSC synchronously replicates before success and serves strong reads across replicas, with higher latency and strict topology/feature constraints.
7. **Can a distributed SQL database make every global write local and strongly consistent at no extra latency?** No. Maintaining a global transaction order or quorum may require cross-Region communication; row locality helps some operations but cannot remove coordination for global invariants.

## Practice

Design data placement for a global food-delivery service: restaurant menus, courier locations, driver availability, order state, and payment records. For each, name the write authority, local read policy, freshness need, behavior during a region partition, replication/failover method, and whether a conflict can be merged. Explain which data may use edge caching and which must pass through a transactional authority.

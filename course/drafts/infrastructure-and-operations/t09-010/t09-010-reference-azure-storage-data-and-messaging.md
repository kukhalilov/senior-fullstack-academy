# Microsoft Azure architecture identity networking compute and data services — Reference: Storage accounts, databases, messaging, and application secrets

Sources: [Azure Storage overview](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview), [Blob access tiers](https://learn.microsoft.com/en-us/azure/storage/blobs/access-tiers-overview), [Blob immutable storage](https://learn.microsoft.com/en-us/azure/storage/blobs/immutable-storage-overview), [Storage SAS](https://learn.microsoft.com/en-us/azure/storage/common/storage-sas-overview), [Azure SQL Database](https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview), [Cosmos DB consistency](https://learn.microsoft.com/en-us/azure/cosmos-db/consistency-levels), [Service Bus](https://learn.microsoft.com/en-us/azure/service-bus-messaging/service-bus-messaging-overview), [Event Grid](https://learn.microsoft.com/en-us/azure/event-grid/overview), [Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-about), [Azure Managed Redis](https://learn.microsoft.com/en-us/azure/redis/overview), and [Azure Cache for Redis retirement](https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/retirement-faq).

## Scope and version

This reference compares the common Azure storage, database, cache and integration families in the manifest. It does not enumerate every service API, SKU, SDK method or regional capability. Current Microsoft Learn guidance was checked 2026-11-16. Service lifecycle and pricing can change; verify the target region/tier before design or migration.

## How this group fits the mental model

Choose a data service from its access pattern, consistency, durability, retention, query model, throughput, recovery and operating requirements. Then design authorization, network path, backup/restore and observability. Storage redundancy is not a backup; a queue is not a stream; a cache is not a durable system of record.

## Supplied names explained

### Storage account, objects and data access

- `Azure Storage account` — Top-level Azure resource grouping blob, file, queue and table services with shared endpoint, network, security, redundancy and billing configuration.
- `Azure Blob Storage` — Object storage for unstructured data. Access is via account/container/blob resources and service APIs rather than a mounted filesystem by default.
- `Blob container` — Namespace/grouping for blobs inside an account; access can be authorized at supported container/blob scopes.
- `Block blob` — Blob type for general object content uploaded in blocks and committed as a whole, commonly used for documents/media/backups.
- `Append blob` — Blob type optimized for append-oriented writes such as logs; it is not a general random-update object.
- `Page blob` — Page-aligned random-access blob type historically used for VM disks and workloads needing page operations.
- `Blob versioning` — Retains previous blob versions after writes/deletes, subject to account support, lifecycle and cost. Versioning is a recovery feature, not a complete backup strategy.
- `Blob soft delete` — Retention window allowing deleted blobs/containers to be restored when enabled; retention and version settings interact.
- `Blob lifecycle management` — Rule-based tiering/deletion of blobs based on age, prefix, version or other supported filters; test rules against data-retention obligations.
- `Azure Blob access tier` — Cost/access classification for blob data. Capacity, transaction, retrieval, minimum-retention and rehydration costs differ.
- `Azure Blob Hot tier` — Online tier for frequent access, usually higher storage cost and lower access cost than cooler tiers.
- `Azure Blob Cool tier` — Online tier for infrequently accessed data, with different access/retention economics than Hot.
- `Azure Blob Cold tier` — Online lower-storage-cost tier for rarely accessed data, typically with higher access costs and minimum retention than Hot/Cool.
- `Azure Blob Archive tier` — Offline tier with lowest storage cost and delayed rehydration/online access. It is unsuitable when data must be read immediately.
- `Blob immutable storage` — Time-based retention or legal hold that prevents modification/deletion for protected blob data under supported configuration; treat policy-locking as an irreversible governance choice.
- `Blob point-in-time restore` — Restores block blobs to a prior point within configured retention for supported accounts/features; it does not replace independent backup/replication planning.
- `Azure Data Lake Storage Gen2` — Blob Storage capabilities with hierarchical namespace optimized for analytics filesystem semantics and fine-grained directory operations.
- `Hierarchical namespace` — Directory/file hierarchy option in ADLS Gen2 that changes namespace and operation behavior; enabling it has account compatibility implications.
- `Azure Files` — Managed cloud file shares accessible using SMB or NFS protocols in supported configurations.
- `Azure file share` — Share resource with quota/performance/tier configuration; clients need network access and share-level/file-level authorization.
- `Azure Files SMB` — SMB protocol access for Windows/Linux clients where supported, with identity/authentication and share permission integration options.
- `Azure Files NFS` — NFS protocol access for supported Linux scenarios and account configurations; network and identity semantics differ from SMB.
- `Azure Queue Storage` — Simple REST queue service for decoupled asynchronous work. It has different ordering/delivery/transaction features from Service Bus.
- `Azure Table Storage` — Key/attribute NoSQL storage with partition and row key access patterns; it is not a relational database.
- `Azure Managed Disks` — Managed block disks for Azure VMs, with OS/data disk lifecycle, caching, encryption and performance choices.
- `Azure Disk Storage redundancy` — Disk durability/availability options whose zone/region behavior depends on disk type and region; verify supported replication/failover mechanics.
- `Azure Storage encryption at rest` — Platform-side encryption for stored data, with customer-managed-key and encryption-scope options in supported services; it does not replace network/access controls.
- `Storage account shared key access` — Account-key authorization mode that grants broad access using a long-lived shared secret. Disable when feasible and prefer Entra identity/SAS controls.
- `Azure Storage shared access signature (SAS)` — Signed, time-limited delegated access token scoped to resource/permissions/protocol/expiry. Anyone holding it can use the delegated access; protect it like a password.
- `User delegation SAS` — Blob SAS signed using an Entra user delegation key, avoiding use of the account key and enabling Entra-authorized delegation.
- `Azure Storage service SAS` — SAS scoped to one storage service resource and signed with account key or stored policy according to supported mode.
- `Azure Storage account SAS` — SAS delegating access across selected services/resource types at account scope; broad reach makes it riskier than narrow alternatives.
- `Azure Storage stored access policy` — Server-side policy that can group constraints/revoke certain service SAS grants by changing/removing the policy; support differs for SAS types.

### Redundancy, SQL and Cosmos DB

- `Locally redundant storage (LRS)` — Replication within one datacenter in a region; it does not protect against loss of that datacenter/region.
- `Zone-redundant storage (ZRS)` — Replication across availability zones in supported regions/services; it protects against selected zone failures, not all logical corruption/region loss.
- `Geo-redundant storage (GRS)` — Primary-region replication plus asynchronous copy to a paired secondary region; secondary data can lag.
- `Read-access geo-redundant storage (RA-GRS)` — GRS with read access to the secondary replica before failover; stale/lagged secondary reads are possible.
- `Azure SQL Database` — Managed SQL database engine with platform-managed patching/backups/availability options; database compatibility, tier, network and cost remain design choices.
- `Azure SQL Managed Instance` — Managed instance-oriented SQL service with broader compatibility surface than single-database Azure SQL Database, at a different network/operation/cost boundary.
- `SQL Server on Azure Virtual Machines` — Self-managed SQL Server on a VM, offering OS/engine control but requiring the team to handle patching, backup, HA and licensing/operations.
- `Azure SQL Database serverless compute tier` — Compute option that can automatically scale/pause eligible databases based on demand; resume delay, auto-pause settings and workload compatibility matter.
- `Azure SQL elastic pool` — Shared compute capacity serving multiple databases, useful for variable/uncorrelated workloads; noisy-neighbor and pool sizing need monitoring.
- `Azure SQL vCore purchasing model` — Capacity/compute purchasing model tied to virtual cores, memory/storage options and service tier.
- `Azure SQL DTU purchasing model` — Bundled database transaction unit model combining CPU, memory and I/O resources in a service tier; it is not directly comparable to vCore by a simple fixed conversion.
- `Azure SQL Database failover group` — Grouping of databases with listener endpoints and configured failover policy for a paired/secondary server, supporting coordinated failover where service setup permits.
- `Azure SQL geo-replication` — Asynchronous replication to another region/server for selected recovery/read scenarios. It can have data lag and needs an explicit failover and client reconnection plan.
- `Azure Cosmos DB` — Globally distributed database service with multiple APIs and consistency/throughput models; this topic focuses on its NoSQL interface.
- `Cosmos DB for NoSQL` — Native JSON document API with SQL-like query syntax and item/container/account abstractions.
- `Cosmos DB request unit (RU)` — Normalized throughput/charge unit representing database work; RU consumption depends on operation, item size, indexing and query shape.
- `Cosmos DB partition key` — Container field distributing logical partitions and transaction locality. High cardinality/distribution and query patterns matter; hot keys can throttle.
- `Cosmos DB logical partition` — Items sharing one partition-key value. It is the transaction/placement locality boundary for many operations and has service limits.
- `Cosmos DB consistency level` — Read consistency tradeoff per account/operation, with five named levels and different latency/ordering guarantees.
- `Cosmos DB Strong consistency` — Reads return the latest committed write in supported configuration, with stronger coordination/latency and region constraints than weaker modes.
- `Cosmos DB Bounded staleness consistency` — Reads lag by a configured operation/time bound within supported behavior, balancing consistency and availability/latency.
- `Cosmos DB Session consistency` — Per-client session token can provide read-your-writes and monotonic behavior for that session, a common default choice.
- `Cosmos DB Consistent prefix consistency` — Reads observe writes in order without gaps but can be stale.
- `Cosmos DB Eventual consistency` — Replicas converge when no new writes occur, with the weakest ordering/read-your-write expectations among the five levels.
- `Cosmos DB autoscale throughput` — RU/s capacity scaling within configured min/max utilization bounds; it responds to load but does not eliminate hot partition limits or cost.
- `Cosmos DB serverless` — Request-based billing model for intermittent workloads without provisioned throughput; availability/limits differ from provisioned/autoscale options.
- `Cosmos DB change feed` — Ordered sequence of changes exposed per logical partition for downstream processing; retention/leases/replay semantics depend on mode and processor.
- `Cosmos DB change feed processor` — Client library pattern distributing feed processing across workers using leases/checkpoints. Design idempotency and checkpoint recovery.
- `Cosmos DB hierarchical partition key` — Multi-component partition key for distributing large workloads while preserving selected hierarchical query/transaction patterns; verify API and SDK support.
- `Cosmos DB multi-region writes` — Configuration allowing writes in multiple regions for supported APIs, with conflict resolution/application consistency considerations.
- `Azure Database for PostgreSQL Flexible Server` — Managed PostgreSQL offering with service-controlled maintenance/HA/backup choices; validate extensions, versions, networking and migration compatibility.

### Caching, messaging and recovery

- `Azure Cache for Redis` — Legacy Azure-hosted Redis service. Enterprise/Enterprise Flash retirement is scheduled for 2027-03-31; Basic/Standard/Premium for 2028-09-30. Creation restrictions differ by tier and customer/cloud.
- `Azure Cache for Redis retirement schedule` — Microsoft Learn's dated lifecycle plan as checked 2026-11-16. Enterprise tiers retire 2027-03-31; Basic/Standard/Premium retire 2028-09-30. Confirm eligibility and current migration dates in the official FAQ.
- `Azure Managed Redis` — Current managed Redis Enterprise-based service and recommended migration destination. GA product status does not mean every SKU/feature is GA.
- `Azure Managed Redis clustered cache` — Clustered behavior is the default configuration; clients should support cluster redirection and avoid unsupported cross-slot assumptions.
- `Azure Service Bus` — Brokered messaging service for queues/topics with locks, settlement, sessions, duplicate detection and dead-letter behavior.
- `Service Bus queue` — Point-to-point message entity with competing consumers and brokered delivery semantics.
- `Service Bus topic` — Publish/subscribe entity that fans messages out to subscriptions, each with its own filters/state.
- `Service Bus subscription` — Logical durable subscriber to a topic, with rules/filters and its own competing consumers.
- `Service Bus dead-letter queue` — Subqueue holding messages that cannot be delivered/processed under configured conditions; inspect reason and build safe replay/remediation.
- `Azure Service Bus message lock` — Temporary exclusive processing lock in Peek-Lock mode. Long work needs lock renewal and duplicate-safe processing.
- `Service Bus Peek-Lock delivery` — Receive-and-lock pattern where a consumer completes, abandons, defers or dead-letters a message; a lock timeout can redeliver it.
- `Service Bus Receive-and-Delete delivery` — Removes message when received, trading simpler flow for risk of message loss if consumer fails before processing.
- `Service Bus message settlement` — Consumer acknowledgement/outcome such as complete, abandon, defer or dead-letter in Peek-Lock mode; it determines redelivery/dead-letter behavior.
- `Service Bus message time to live` — Expiration after which an unconsumed message may expire/dead-letter according to entity policy.
- `Service Bus session-enabled entity` — Queue/topic subscription configured for session grouping; session locks preserve ordered processing within a session key.
- `Service Bus sessions` — Ordered/grouped message processing for related session IDs, with exclusive session ownership and lock handling.
- `Service Bus duplicate detection` — Broker feature discarding duplicate sends within a configured history window when message IDs repeat; it is not end-to-end exactly-once processing.
- `Service Bus duplicate detection window` — Retention interval in which duplicate message IDs are recognized; longer windows affect storage/throughput and don't cover arbitrary application retries.
- `Service Bus dead-letter subqueue` — Addressable subqueue for dead-lettered messages, including reasons/description, that requires monitoring and safe reprocessing.
- `Azure Event Grid` — Event routing service delivering discrete event notifications to subscribed handlers and endpoints.
- `Event Grid system topic` — System-created topic exposing events from supported Azure resource providers; event schema/provider behavior differs by source.
- `Event Grid event subscription` — Routing/filter/delivery configuration for events from a topic to a handler; delivery retries/dead-lettering depend on configuration.
- `Azure Event Hubs` — High-throughput event-stream ingestion service, including Kafka protocol compatibility for supported clients.
- `Event Hubs partition` — Ordered log segment that provides parallelism; ordering is within a partition, and partition-key strategy determines distribution.
- `Event Hubs consumer group` — Independent view/offset namespace for stream consumers, enabling separate applications to read the same events.
- `Event Hubs Capture` — Automatically writes event stream data to supported storage destinations for batch/archive processing; size/time window and cost need configuration.
- `Event Hubs retention period` — Configured period events remain available for consumer replay, bounded by service tier/retention options.
- `Event Hubs checkpoint` — Consumer progress marker used by clients/processors to resume reading; coordinate ownership and checkpointing with processing semantics.
- `Azure Backup` — Service protecting supported workloads/data with policies, recovery points and vaults; backup success is not proof of application recovery.
- `Azure Backup Recovery Services vault` — Vault type for protecting supported workloads such as VMs/SQL with policies and recovery data; permissions/soft-delete/immutability options should be planned.
- `Azure Backup vault` — Vault resource for selected newer backup workloads; service types and policy model differ from Recovery Services vault.
- `Azure Site Recovery` — Disaster-recovery replication/orchestration service for supported workloads, distinct from point-in-time backup.
- `Azure Site Recovery recovery plan` — Ordered group of failover actions/resources, scripts and manual steps used to orchestrate recovery; test it without disrupting production.
- `Azure Site Recovery test failover` — Isolated validation of a recovery plan/replica without committing a production failover; network isolation and cleanup are required.

## Cross-item comparison

| Service family | Core semantics | Choose it for |
|---|---|---|
| Blob/Files/Table/Queue Storage | Objects, file shares or simple key/queue primitives | Durable files/objects or lightweight key/queue patterns |
| Azure SQL | Relational SQL engine and transactional queries | Relational schema/SQL compatibility and managed DB needs |
| Cosmos DB for NoSQL | Partitioned JSON documents with RU-based throughput and consistency choices | Horizontally distributed document/API workloads |
| Service Bus | Brokered queues/topics, locks and settlements | Commands/work queues, competing consumers, sessions and dead-letter workflows |
| Event Grid | Discrete event routing | Push notification fanout to handlers |
| Event Hubs | Partitioned stream ingestion and replay within retention | High-throughput telemetry/event streams and independent consumers |
| Redis cache | In-memory low-latency cache/data structures | Reconstructible acceleration; migration/lifecycle requirements apply |

## Examples

For a blob archive, enable versioning/soft delete where useful, apply lifecycle rules to move data from Hot to Cool/Cold/Archive based on actual access, and configure immutable retention only where legal/business requirements justify it. Verify retrieval latency, minimum retention and rehydration cost with representative objects.

For a Service Bus worker, Peek-Lock a message, process with a durable idempotency key, then settle it only after the durable side effect succeeds. If the worker crashes after writing but before completion, the message may be delivered again. A duplicate-detection window helps with duplicate sends but does not replace idempotent consumers.

For Azure Cache for Redis migration, inventory tier, modules, clustering, client behavior, region, network and data-retention needs. Azure Managed Redis is the recommended target, but validate feature/SKU availability and cluster behavior. Cache data may be reconstructible; if it is not, design a data migration and consistency window rather than assuming cache migration is lossless.

## Common mistakes

- Treating a storage tier as a pure price knob without read/retrieval latency, minimum-retention and transaction cost.
- Treating LRS/ZRS/GRS as interchangeable or assuming replica protects against deletion/corruption.
- Using broad account SAS/shared keys when a narrow identity or user-delegation SAS is available.
- Forgetting that a SAS is a bearer credential and has an expiry/permission scope.
- Choosing a Cosmos DB partition key from entity shape alone without queries, distribution and hot-key analysis.
- Assuming RU cost is constant across query sizes/indexing or that autoscale removes hot partitions.
- Assuming SQL Server on VM, Managed Instance and SQL Database have equal engine/feature/ops compatibility.
- Treating Event Grid as a durable ordered stream or Event Hubs as a work queue with per-message settlement.
- Claiming Service Bus gives exactly-once business processing; locks expire and consumers can retry.
- Assuming dead-letter queues, expired messages or Event Hubs retention are monitored automatically.
- Treating Azure Managed Redis as feature-identical at every SKU or overlooking cluster-aware clients.
- Confusing backup recovery points with cross-region Site Recovery failover.

## Knowledge checks with answers

1. **What should determine Blob access tier?** Access frequency, retrieval latency, minimum storage duration, transaction/retrieval cost and recovery/retention needs.
2. **What is the difference between ZRS and GRS?** ZRS spans supported zones within a region; GRS asynchronously copies to a paired region. Neither automatically proves an application recovery objective.
3. **Why can a Service Bus message be processed twice?** The consumer may complete a side effect and fail before settlement, or the lock may expire; make processing idempotent.
4. **When use Event Hubs instead of Event Grid?** Event Hubs for partitioned high-throughput streams/replay; Event Grid for discrete event routing to handlers.
5. **Why does Cosmos partition key matter?** It defines data distribution/locality and affects hot partition risk, query routing, transactions and throughput.
6. **What is the Redis migration state?** Azure Cache tiers have scheduled tier-specific retirements; Azure Managed Redis is recommended but exact feature/SKU/region/client compatibility must be checked.

# AWS architecture identity networking compute and data services — Reference: Object, block and file storage, databases, and event services

Sources: [Amazon S3 storage classes](https://docs.aws.amazon.com/AmazonS3/latest/userguide/storage-class-intro.html), [Amazon S3 versioning and Object Lock](https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lock.html), [Amazon RDS Multi-AZ](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html), [DynamoDB core components and indexes](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.CoreComponents.html), [DynamoDB consistency](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html), and [SQS visibility timeout](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html).

## Scope and version

This reference explains all supplied object, block and file storage, database, queue, pub/sub, event and streaming terms. Data durability, consistency, recovery, throughput, retention, limits and prices depend on configuration and Region. Validate lifecycle and feature support before choosing a service. For DynamoDB global tables, distinguish the current multi-Region eventual and strong consistency modes; neither is a universal setting without topology and tradeoffs.

## How this group fits the mental model

Start with the access pattern: object key, block read/write, shared file access, relational transaction/query, key-based item access, search, durable work queue, notification fan-out, event routing or ordered stream. Then specify latency, throughput, consistency, retention, encryption, failure recovery and cost. Replicas and caches can improve reads or availability but add freshness, invalidation and failure paths. A durable store is not automatically a backup, and a message broker does not guarantee a business side effect occurs exactly once.

## Supplied names explained

### Object and file/block storage

- `Amazon Simple Storage Service (Amazon S3)` — Regional object storage organized into buckets and objects, addressed by object keys rather than filesystem paths. It supports durable storage patterns, policy controls, lifecycle and event integration; design public access, encryption, version retention and recovery explicitly.
- `S3 bucket` — Namespace and configuration boundary for S3 objects, with Region, policies, ownership, versioning, encryption and logging settings. Bucket names are global within a partition; use account-specific ownership and avoid placing secrets in names.
- `S3 object` — Data plus metadata and a key in a bucket. Versioning can preserve older versions, but overwrites/deletes, object size and storage class affect recovery and cost.
- `S3 object key` — UTF-8 name identifying an object within a bucket. Slashes in keys are naming conventions rather than actual directories; prefixes are useful for organization but can influence access policy, listing and event filters.
- `S3 bucket policy` — Resource policy controlling access to a bucket and objects. It can enforce TLS, principal, VPC endpoint or encryption context conditions, but a broad public allow can expose data and an explicit deny can block an IAM allow.
- `S3 access point` — Named network/application-specific access point with its own policy for a bucket, useful for delegating access at scale. It does not create a separate copy of the data; the access point and bucket policies must both permit the request.
- `S3 Object Ownership` — Setting that controls object ownership and ACL behavior for objects written by other accounts. Bucket owner enforced disables ACLs and makes the bucket owner own objects; modern designs should use policy-based access unless a legacy integration requires ACLs.
- `S3 Block Public Access` — Controls that block public policies/ACLs at account, bucket or access-point scope. It is a strong guardrail against accidental public exposure, but verify scope and intentional public distribution design before disabling any control.
- `S3 Versioning` — Preserves multiple versions of an object and uses delete markers for ordinary deletes. It helps recover overwritten/deleted data but does not stop malicious deletion of all versions unless access/Object Lock protections are added, and all retained versions can incur storage cost.
- `S3 Lifecycle` — Rules that transition or expire objects/versions based on age, prefix, tags and other supported filters. Lifecycle is asynchronous and interacts with minimum storage duration, retrieval fees, noncurrent versions and Object Lock; model total retention cost.
- `S3 Storage Class` — Per-object availability/access-cost tier selected to match access frequency and retrieval latency. The class is not a backup policy; transitions and retrievals can have minimum-duration, metadata, request and restore costs.
- `S3 Standard` — General-purpose class for frequently accessed data with multi-AZ design. It has low-latency access but is not the cheapest choice for long-idle objects.
- `S3 Standard-IA` — Infrequent-access class with millisecond access and multi-AZ resilience but retrieval/early-deletion charges and minimum billable size/duration. Use when access is rare but data must remain immediately available.
- `S3 One Zone-IA` — Infrequent-access class storing data in one AZ, reducing cost while accepting loss if that AZ is destroyed. It is unsuitable as the only copy of data that must survive an AZ failure.
- `S3 Intelligent-Tiering` — Class that monitors access patterns and moves objects among supported access tiers, with optional archive tiers. Monitoring/automation charges and asynchronous archive retrieval behavior matter; it does not eliminate data governance or restore planning.
- `S3 Express One Zone` — High-performance, single-AZ directory-bucket class designed for low-latency/high-request-rate workloads. Its zonal placement, directory-bucket API/feature differences and resilience characteristics differ from general-purpose S3; design another durable copy when required.
- `S3 Glacier Instant Retrieval` — Archive-oriented class providing millisecond retrieval for rarely accessed data, with archive-tier pricing and minimum storage duration. It suits infrequent but immediate reads; retrieval economics can dominate small or frequently accessed objects.
- `S3 Glacier Flexible Retrieval` — Archive class for infrequently accessed data where restore/retrieval is asynchronous and selected retrieval modes trade time for cost. Applications must handle restore-in-progress state and user expectations.
- `S3 Glacier Deep Archive` — Lowest-cost long-term archive class with hours-scale asynchronous restoration and a long minimum storage duration. It is for data with rare recovery needs, not an interactive query path.
- `S3 Object Lock` — WORM-style retention protection for object versions using retention periods and/or legal holds. Compliance and governance modes have different deletion behavior; configure retention deliberately and test legal/operational processes.
- `S3 replication` — Asynchronously copies eligible objects and metadata between buckets in the same or different Regions under replication rules. Existing objects need an appropriate batch replication path; delete marker, encryption, ownership and replication time guarantees depend on configuration.
- `S3 server access logging` — Delivers request records for a source bucket to a target bucket. Delivery is best-effort and may be delayed; restrict log-bucket writes/reads, prevent recursive logging and consider CloudTrail data events for audit requirements.
- `S3 event notification` — Event delivery for supported object changes to destinations such as SQS, SNS, Lambda or EventBridge. Delivery can be duplicated or arrive out of order, and recursive triggers can loop; make consumers idempotent and filter carefully.
- `S3 presigned URL` — Time-limited signed request authorizing access to a specific S3 operation using the signer’s permissions. Anyone possessing the URL can use it until expiration or credential invalidation; treat it as a bearer secret and constrain method, key and lifetime.
- `Amazon Elastic File System (Amazon EFS)` — Managed elastic NFS file system for Linux workloads, mountable concurrently from supported compute across AZs. Throughput/performance mode, lifecycle tiering, mount targets, security groups and POSIX permissions all affect behavior and cost.
- `EFS access point` — Application-specific entry into EFS that can enforce a root directory and POSIX identity. It can simplify multi-tenant isolation but is not a replacement for network mount controls and filesystem permission design.
- `Amazon FSx` — Family of managed file-system services for different protocols and workload needs. “FSx” alone does not specify semantics; choose the concrete file-system engine and validate performance, deployment, backup and integration constraints.
- `Amazon FSx for Windows File Server` — Managed Windows-native SMB file service with Active Directory integration and Windows features. Plan directory connectivity, identity permissions, throughput/capacity and backup; SMB availability does not imply Linux POSIX semantics.
- `Amazon FSx for Lustre` — Managed high-performance parallel file system for compute-intensive workloads, often integrated with S3 data repositories. Decide scratch versus persistent deployment, import/export consistency and throughput needs; it is not a general home directory replacement.
- `Amazon FSx for NetApp ONTAP` — Managed ONTAP file/block service offering supported protocols and data-management features. It can ease migration of ONTAP-dependent workloads, but capacity, throughput, replication and feature behavior remain deployment-specific.
- `AWS Storage Gateway` — Hybrid service connecting on-premises applications to AWS storage through supported file, volume or tape interfaces. Local cache and cloud backing have different durability/latency behavior; connectivity, cache capacity, gateway recovery and upload state require operations planning.
- `EBS gp3 volume` — General-purpose SSD block volume with provisioned size and independently configurable performance within service limits. It is AZ-scoped and typically attached to EC2; snapshot/backup and filesystem/application consistency must be planned separately.
- `EBS io2 volume` — Provisioned IOPS SSD option for demanding block workloads, with higher performance/durability targets than general-purpose choices subject to limits. Benchmark actual database I/O and cost before choosing it; performance does not fix an inefficient query.
- `EBS Multi-Attach` — Capability to attach eligible io2 volumes concurrently to supported Nitro-based EC2 instances within one AZ. The filesystem/database must be cluster-aware and coordinate writes; simultaneous attachment alone does not make a normal filesystem safe.

### Relational and analytical databases

- `Amazon Relational Database Service (Amazon RDS)` — Managed relational database service for supported engines, handling infrastructure tasks such as provisioning, backups and maintenance options. Customers still own schema, query design, access, parameter choices, backup policy validation, failover testing and data governance.
- `RDS DB instance` — Managed database instance resource with engine, storage, compute and endpoint configuration. Instance sizing and storage limits constrain capacity; monitor connections, CPU, I/O, locks and replication rather than relying on instance status alone.
- `RDS DB cluster` — Cluster-level database deployment/resource abstraction used by engines such as Aurora and some Multi-AZ offerings. Writer/reader endpoints and storage/failover behavior depend on engine and cluster type.
- `RDS Multi-AZ DB instance deployment` — RDS instance with synchronous standby in another AZ for high availability and failover. The standby is not a read-scaling replica; failover interrupts connections, and backups remain necessary.
- `RDS Multi-AZ DB cluster deployment` — Multi-AZ cluster deployment with a writer and readable standby instances for supported engines/configurations. It offers a different topology and read behavior from a Multi-AZ DB instance; compare engine/region support and failover/application endpoint behavior.
- `RDS read replica` — Asynchronous replica used to scale reads, support migration or create a recovery path depending on engine. Replication lag means reads can be stale; promotion to standalone/primary changes semantics and does not make it a point-in-time backup.
- `Amazon Aurora` — AWS relational database engine compatible with selected MySQL/PostgreSQL versions, with a distributed cluster storage architecture and managed replication/failover. Compatibility is not identical to upstream engines; check SQL behavior, extensions, version lifecycle and performance.
- `Aurora DB cluster` — Aurora storage cluster with a writer and optional readers/endpoints. Reader routing, failover priority, connection pooling and replication lag influence application behavior; design clients to reconnect and retry safely.
- `Aurora Serverless v2` — Aurora capacity model that adjusts database capacity within configured bounds based on demand. Scaling is not instantaneous unlimited capacity and does not remove connection/query bottlenecks; verify engine, Region, minimum/maximum capacity and pause options.
- `Amazon Redshift` — Managed cloud data warehouse for analytical SQL over large datasets. It is optimized for analytical workloads, not a drop-in OLTP database; ingestion, distribution, sort/partition choices, concurrency and data freshness drive performance.

### Key-value, cache and search data stores

- `Amazon DynamoDB` — Managed key-value/document database designed for predictable access patterns and high scale. Model partition/sort keys, indexes, consistency, transactions, capacity and hot-key risk before writing application queries.
- `DynamoDB table` — Collection of items keyed by a primary key with optional indexes and stream settings. Query by keys/indexes for targeted reads; scans read broad portions and can be expensive/slow at scale.
- `DynamoDB partition key` — Primary key attribute used to distribute data and route requests to partitions. Low-cardinality or skewed values create hot partitions; select keys from workload distribution and access patterns, not entity naming alone.
- `DynamoDB sort key` — Optional second primary-key attribute ordering items within a partition-key value. It enables range/prefix-style access patterns and composite entity modeling; query conditions must align with its ordering.
- `DynamoDB global secondary index (GSI)` — Alternate index with a partition key and optional sort key that can differ from the table’s keys. GSI reads are eventually consistent, and index updates consume storage/write resources; project only needed attributes and design for key skew.
- `DynamoDB local secondary index (LSI)` — Alternate sort-key index sharing the table partition key and created with the table. It supports strongly consistent reads but has item-collection constraints; it is not interchangeable with a GSI and is not supported on MRSC global tables.
- `DynamoDB on-demand capacity mode` — Request-driven capacity model that automatically accommodates supported changes without manual provisioned throughput. It can simplify variable load but still has quotas, burst/history behavior, cost sensitivity and hot-key limits.
- `DynamoDB provisioned capacity mode` — Configured read/write capacity with optional auto scaling. It supports predictable throughput/cost planning but under-provisioning throttles and over-provisioning wastes spend; GSIs need capacity consideration too.
- `DynamoDB Streams` — Ordered per-item change records retained for a bounded period and exposed for downstream processing. Consumers must handle duplicates/retries and shard/ordering semantics; a stream is not a durable archival log.
- `DynamoDB global table` — For new designs use Global Tables version 2019.11.21 (Current), not the legacy 2017.11.29 mode. Current global tables choose either MREC (the default asynchronous mode, with broader Region support) or MRSC (synchronous replication and strong reads across replicas). MRSC must use exactly three supported Regions, configured as three replicas or two replicas plus a witness; a witness is not a read/write replica. MRSC does not support TTL or LSIs, and its mode/topology cannot be changed by adding replicas after creation. Verify Region support and test cross-Region latency; MREC can expose stale reads/conflicts while MRSC adds cross-Region latency. [Current global-table model](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/V2globaltables_HowItWorks.html) · [Read-consistency details](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html)
- `Amazon ElastiCache` — Managed in-memory caching service supporting engines such as Valkey, Redis OSS and Memcached, subject to current service choices. A cache is generally a performance/availability aid, not the system of record; define TTL, invalidation, eviction and outage behavior.
- `Amazon MemoryDB` — Durable in-memory database service using a transaction log and Multi-AZ architecture for supported workloads. It may fit low-latency data access needing persistence, but compare consistency, durability, cost and data model with ElastiCache and a primary database.
- `Amazon DocumentDB` — Managed document database with MongoDB API compatibility for supported client behaviors. Compatibility is not identical to every MongoDB version/feature; validate operators, aggregation, indexing and driver behavior before migration.
- `Amazon OpenSearch Service` — Managed OpenSearch clusters/serverless options for search and analytics use cases. Mapping, shard/replica design, ingestion, access controls and query cost matter; it is usually a derived search index rather than the canonical transactional store.

### Queues, events and streams

- `Amazon Simple Queue Service (Amazon SQS)` — Managed message queue decoupling producers from consumers. Delivery is not a business exactly-once guarantee; acknowledge/delete after durable work and make retries safe.
- `SQS standard queue` — High-throughput queue model with at-least-once delivery and best-effort ordering. Consumers must tolerate duplicates and occasional reorder; use an idempotency key and dead-letter/redrive policy.
- `SQS FIFO queue` — Queue model preserving order within message groups and offering deduplication features under documented constraints. Throughput/concurrency depends on group design; one group serializes its messages and consumer processing still needs safe retry behavior.
- `SQS dead-letter queue` — Queue receiving messages after source queue redrive policy conditions are met. It isolates poison messages for investigation/replay; set retention longer than the source queue, alert on arrival and protect sensitive payloads.
- `SQS visibility timeout` — Period a received message is hidden from other consumers before becoming available again unless deleted or visibility extended. Set it to cover processing with margin and renew for long work; it reduces concurrent duplicates but cannot guarantee none.
- `Amazon Simple Notification Service (Amazon SNS)` — Managed pub/sub service delivering published messages to subscribed endpoints. Subscription delivery/retry, filters and endpoint behavior vary; it pushes/fans out rather than acting as a consumer-polled work queue.
- `SNS topic` — Named publisher-facing endpoint with topic policy and subscriptions. Use separate topics for meaningful ownership/security boundaries and avoid assuming every subscriber has processed a message when publish succeeds.
- `SNS subscription` — Binding from a topic to an endpoint/protocol with optional filter and delivery behavior. Confirm endpoint ownership/confirmation, retries and dead-letter settings; subscriptions may have different delivery guarantees.
- `Amazon EventBridge` — Event bus and routing service matching structured events and delivering to targets. It is useful for event-driven integration, but producers and targets still need schema/version discipline, retries and idempotency.
- `EventBridge event bus` — Logical event ingress and policy boundary for AWS, partner or custom events. The default bus, custom buses and partner buses have different ownership/configuration; use resource policies to govern cross-account publishing.
- `EventBridge rule` — Pattern or schedule matching events on a bus and routing them to targets with optional transformation/retry/dead-letter configuration. Pattern matching is not a schema registry; test representative events and monitor failed invocations.
- `EventBridge Scheduler` — Managed service for one-time or recurring scheduled invocations with time zones, flexible windows, retries and dead-letter options. It differs from an event-bus schedule rule; design target permissions, duplicate safety and schedule lifecycle.
- `Amazon Kinesis Data Streams` — Managed shard-based stream for ordered records and multiple consumers with retention. Partition keys determine shard placement/ordering; throughput, hot shards, checkpointing and replay are central design concerns.
- `Amazon Managed Streaming for Apache Kafka (Amazon MSK)` — Managed Kafka clusters and serverless options for Kafka-compatible streaming ecosystems. AWS manages parts of infrastructure, but broker/client compatibility, partitions, replication, upgrades, networking, authentication and operating patterns remain important.
- `AWS Database Migration Service (AWS DMS)` — Managed data migration and change data capture service moving data between supported sources/targets. DMS does not automatically prove schema or application semantic compatibility; assess data types, keys, transformations, CDC lag, validation and cutover/reconciliation.

## Cross-item comparison

| Data need | Candidate | Main tradeoff |
|---|---|---|
| Durable object by key | S3 | Access tier/retrieval and policy/retention design |
| Attached block device | EBS | AZ attachment and filesystem/database consistency |
| Shared file protocol | EFS / FSx | Protocol-specific behavior, throughput and operations |
| Relational transactions | RDS / Aurora | Engine compatibility, failover and capacity |
| Key access at scale | DynamoDB | Access-pattern and key design, index cost/consistency |
| Cache | ElastiCache | Staleness, eviction and cache-outage behavior |
| Durable low-latency in-memory DB | MemoryDB | Cost and data model versus primary DB/cache |
| Work queue | SQS | Consumer acknowledgment, retry and duplicate handling |
| Pub/sub fan-out | SNS | Subscriber delivery/processing remains independent |
| Event routing | EventBridge | Event schema, rule matching and target retry |
| Ordered record stream | Kinesis / MSK | Partitioning, consumer position and operational model |

RDS Multi-AZ and read replicas serve different goals: a standby improves failover, while a read replica serves read traffic asynchronously. A GSI and an LSI have different key scope and consistency. A versioned S3 object is recoverable only while prior versions and access to them remain protected. MREC and MRSC global tables have different replication/consistency contracts.

## Examples

### Design an upload pipeline

Create a private bucket with Block Public Access, explicit ownership and encryption. Give the API role permission to mint narrowly scoped presigned uploads for a tenant-specific key prefix. The client uploads; an S3 event routes to a durable work queue or processing target. The processor is idempotent because event delivery can repeat. Store processing status in a database, emit metrics for queue age and failed work, and apply lifecycle to temporary objects only after the retention/recovery requirements are met. Do not assume an S3 notification arrives exactly once or in business order.

### Choose a DynamoDB key and index

Suppose the main read asks for all orders for one customer in a time range. Partition by a well-distributed customer key and sort by a sortable timestamp/order identifier. A global index may support an alternate query by status, but a low-cardinality status partition can become hot and GSI reads are eventually consistent. Project only fields needed by that query. If cross-Region writes are required, explicitly choose MREC or evaluate MRSC support/topology and user-visible latency before using a global table.

### Use a queue safely

A producer records the business operation and publishes a message with a stable operation ID. The consumer reads, validates and applies the action idempotently, then deletes only after success. Configure visibility timeout for processing duration, retries/redrive to a dead-letter queue and alerts for oldest-message age. A timeout after the side effect but before deletion can cause a second delivery; the operation ID prevents a duplicate business effect.

## Common mistakes

- Treating a key prefix as a directory or assuming S3 versioning is an immutable backup.
- Choosing One Zone-IA as the only copy when an AZ loss must be survived.
- Forgetting archive restore latency, retrieval/early-delete charges or version retention costs.
- Using EBS Multi-Attach with a filesystem/application that does not coordinate concurrent writes.
- Treating RDS Multi-AZ standby as a read replica or a backup.
- Designing DynamoDB from entity shape instead of access patterns; ignoring hot partitions, GSI eventual consistency and index writes.
- Assuming every DynamoDB global table uses one consistency mode, or that a GSI supports strong reads.
- Calling a cache a durable source of truth without explicit persistence/recovery contracts.
- Expecting SQS, SNS, EventBridge or stream processing to deliver business effects exactly once.
- Using queues for event fan-out or a pub/sub topic as a work-acknowledgment queue without addressing the mismatch.
- Treating MongoDB API compatibility as full behavioral parity in DocumentDB.
- Assuming migration completion means source and target data/application semantics are equivalent.

## Knowledge checks with answers

1. **When is S3 One Zone-IA inappropriate as the only copy?** When the data must survive destruction or loss of the single AZ storing it.
2. **Does an S3 presigned URL grant permanent access?** No. It is a bearer request signed using the caller’s permissions and constrained by expiration/credential validity.
3. **Is an RDS Multi-AZ standby a read-scaling replica?** No. Instance deployments use the standby for failover; read replicas asynchronously serve reads.
4. **What is the GSI/LSI difference?** A GSI can use a different partition key and is eventually consistent; an LSI shares the table partition key and can support strong reads, with different constraints.
5. **Which DynamoDB global table modes exist?** MREC and MRSC; their consistency, topology and feature constraints differ.
6. **What does SQS visibility timeout guarantee?** It temporarily hides a received message, not exactly-once delivery or prevention of every duplicate.
7. **How do SNS, EventBridge and SQS differ?** SNS fans out publications to subscribers; EventBridge matches/routes events; SQS buffers work for consumers to poll/acknowledge.

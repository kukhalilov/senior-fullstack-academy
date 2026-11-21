# data systems storage engines analytics streams and search — Reference: Apache Hadoop

Sources: [HLD Handbook](https://hld.handbook.academy/), [Hadoop 3.4.3 documentation](https://hadoop.apache.org/docs/r3.4.3/), [HDFS architecture](https://hadoop.apache.org/docs/r3.4.3/hadoop-project-dist/hadoop-hdfs/HdfsDesign.html), [HDFS erasure coding](https://hadoop.apache.org/docs/r3.4.3/hadoop-project-dist/hadoop-hdfs/HDFSErasureCoding.html), [HDFS high availability with QJM](https://hadoop.apache.org/docs/r3.4.3/hadoop-project-dist/hadoop-hdfs/HDFSHighAvailabilityWithQJM.html), [YARN architecture](https://hadoop.apache.org/docs/r3.4.3/hadoop-yarn/hadoop-yarn-site/YARN.html), [MapReduce tutorial](https://hadoop.apache.org/docs/r3.4.3/hadoop-mapreduce-client/hadoop-mapreduce-client-core/MapReduceTutorial.html), [Hadoop security](https://hadoop.apache.org/docs/r3.4.3/hadoop-project-dist/hadoop-common/SecureMode.html), [HDFS snapshots](https://hadoop.apache.org/docs/r3.4.3/hadoop-project-dist/hadoop-hdfs/HdfsSnapshots.html).

## Scope and version

This reference describes Apache Hadoop 3.4.3, the 3.4.x documentation line checked 2026-11-20. “Hadoop” names an ecosystem, not one database: HDFS is a distributed file system; YARN allocates cluster resources and runs applications; MapReduce is one batch computation framework. Hadoop can also connect to object stores through filesystem connectors such as S3A, whose consistency, performance and semantics are not identical to HDFS. Deployment distributions may package different compatible versions.

## How this group fits the mental model

Hadoop addresses a large-cluster data path: keep very large files distributed across machines; send computation to the data when that is economical; allocate CPU and memory among applications; and recover from machine failures. HDFS is optimized for high-throughput access to large files, not low-latency random updates to small records. Its traditional file model is write-once/read-many with append/truncate patterns, not a general OLTP API.

A file is split into blocks. The NameNode owns namespace and block-location metadata; DataNodes store block replicas or erasure-coded cells. A client asks the NameNode for locations, then streams bytes directly to/from DataNodes. The NameNode does not proxy normal file contents. YARN is a separate control plane: a ResourceManager arbitrates resources, NodeManagers manage containers on workers, and each application has an ApplicationMaster that negotiates resources and tracks its work. MapReduce is a YARN application whose map, shuffle/sort and reduce stages process key/value records.

This division clarifies failure handling: losing a DataNode is a storage-replication issue; losing an application container is a task retry; losing a ResourceManager is YARN HA; losing the active NameNode is HDFS HA. These are distinct mechanisms and require separate health checks, fencing, recovery testing and capacity planning.

## Supplied names explained

- **HDFS** — Distributed filesystem with a metadata service (NameNode) and block storage workers (DataNodes). It favors streaming bandwidth, large files and locality. Small-file workloads can exhaust NameNode memory/metadata capacity even when raw disk remains available.
- **Blocks and replication** — Files are split into large blocks, with replicas placed across nodes/racks according to policy. The classic default replication factor is three; exact cluster configuration may differ. Rack awareness reduces the chance that one rack failure removes all copies, but consumes network and storage. Replication is not backup: accidental deletion or corruption can propagate.
- **NameNode and DataNode** — The NameNode tracks files, permissions, blocks and locations; it stores metadata rather than user file bytes. DataNodes serve block reads/writes and report heartbeats/block reports. A SecondaryNameNode is a checkpoint helper, not an automatic standby. For HA, use active/standby NameNodes with shared edit quorum/storage and fencing; Hadoop 3 supports more than two NameNodes, including observer role in some configurations.
- **Quorum Journal Manager (QJM)** — A set of JournalNodes stores shared edits so the standby can catch up before promotion. A fencing method prevents a former active from continuing to write after failover. HA is incomplete if operators configure only two NameNodes but omit quorum, client failover, fencing or tested recovery.
- **Erasure coding** — Stores data and parity fragments instead of full replicas, reducing capacity overhead for suitable cold/large files. For example, a 6+3 policy stores nine units for six data units (50% overhead) compared with three replicas (200% overhead). It requires more CPU/network to reconstruct data and is not suitable for every hot or small-file workload. HDFS does not transparently transform existing blocks just because a directory policy changes; conversion requires rewriting data.
- **Snapshots** — Read-only point-in-time namespace views enabled per directory. Creation is metadata-efficient and does not copy file blocks immediately; subsequent changes retain prior metadata/blocks as needed. Snapshots are not independent backups and can prevent deletion from reclaiming space until retention removes references. Hadoop 3.4.3 documents a maximum of 65,536 snapshots per snapshottable directory and forbids nested snapshottable directories.
- **YARN** — Cluster resource manager, not a data store or the scheduler for all Hadoop jobs in a single global queue. Its ResourceManager admits applications and allocates containers through a scheduler; NodeManagers launch/monitor containers; an ApplicationMaster coordinates one application. ResourceManager HA is distinct from HDFS NameNode HA. Federation joins multiple YARN subclusters for larger deployments, with additional routing and operational complexity.
- **MapReduce** — Batch programming and execution model: map tasks transform input records, shuffle partitions/sorts intermediate keys, and reduce tasks aggregate groups. Retries mean task code and external effects should be deterministic or idempotent; do not assume a task executes exactly once. MapReduce remains useful for durable batch processing but often loses on iterative/interactive jobs compared with Spark or SQL engines.
- **Security and encryption** — HDFS/YARN network reachability is not access control. Hadoop documentation warns production clusters must authenticate callers, commonly with Kerberos, restrict service access, and configure authorization. HDFS encryption zones protect data at rest with key-management integration; they do not automatically protect all network traffic, metadata, application logs or exported copies. Misconfigured open cluster ports can expose data and permit arbitrary YARN work.
- **Object-store connectors** — S3A and other connectors provide Hadoop filesystem APIs over remote object storage, but performance and semantics vary by cloud, connector version and operation. Object stores do not behave like a local HDFS DataNode pipeline. Validate rename/listing/commit behavior and use a supported output committer/table format rather than inferring atomic filesystem semantics.

## Cross-item comparison

Use HDFS when the team needs a self-managed, high-throughput shared filesystem for large data and can operate its metadata and worker fleet. Use cloud object storage when elastic, service-managed durability and decoupled storage/compute matter; add a lakehouse table format when concurrent table commits, schema evolution and snapshot semantics are required. Use a database for indexed point lookups and transactions, not a pile of HDFS files. Spark can run on YARN and process HDFS data, but is a separate engine. Kubernetes and YARN both schedule workloads, yet their resource abstractions and data-locality assumptions differ. These products can coexist; avoid treating one as a substitute for every layer.

## Examples

A nightly batch computes daily product aggregates from immutable event files. Store large date-partitioned files, run Spark or MapReduce on YARN, write a new output partition, validate it, then publish it through a table/catalog transaction or atomic manifest. Retain source events long enough to rerun a failed or corrected job. Monitor NameNode heap and namespace counts, under-replicated blocks, DataNode disk/heartbeat health, YARN pending containers, failed tasks, shuffle spill, rack capacity and output freshness.

If a rack fails, replication may leave surviving copies, but recovery consumes network and can compete with job shuffles. If the active NameNode fails, standby promotion depends on journal catch-up and fencing. If a MapReduce reducer retries after writing to an external service, duplicate side effects are possible unless writes are idempotent. Design and test each of these cases independently.

## Common mistakes

- Calling the SecondaryNameNode a hot standby.
- Treating HDFS replication as backup or assuming a snapshot is an independent recovery copy.
- Using HDFS for many tiny mutable records or interactive transactional queries.
- Assuming “Hadoop” means MapReduce; YARN can run other engines and HDFS can exist independently.
- Assuming a cloud object store has HDFS rename, listing or write semantics.
- Running YARN or HDFS on a trusted network without authentication and authorization.
- Enabling erasure coding without evaluating hot-read latency, reconstruction and rewrite costs.
- Tuning worker count while ignoring NameNode metadata memory, rack placement, shuffle traffic and data skew.

## Knowledge checks with answers

1. **Does the NameNode stream file data?** No. It manages metadata and returns block locations; clients transfer bytes to DataNodes.
2. **What does YARN contribute?** Resource negotiation and container execution for applications; it is separate from HDFS and from MapReduce's computation model.
3. **Why is the SecondaryNameNode not HA?** It periodically checkpoints namespace metadata but is not automatically promoted as an active replacement. HA requires an actual standby and shared edit/fencing/failover design.
4. **When might erasure coding be preferable to three replicas?** For large, colder data where lower storage overhead outweighs reconstruction CPU/network and latency. Measure the real access pattern.
5. **Does a completed task imply one external side effect?** No. Retry can repeat work. Make effects idempotent or publish results through a transactional boundary.

# system design technology landscape and selection — Reference: Analytical and OLAP databases

Sources: [BigQuery storage and compute architecture](https://docs.cloud.google.com/bigquery/docs/storage_overview), [BigQuery overview](https://docs.cloud.google.com/bigquery/docs/introduction), [Snowflake architecture](https://docs.snowflake.com/en/user-guide/intro-key-concepts), [Snowflake virtual warehouses](https://docs.snowflake.com/en/user-guide/warehouses), [Amazon Redshift column compression](https://docs.aws.amazon.com/redshift/latest/dg/t_Compressing_data_on_disk.html), [Apache Druid architecture](https://druid.apache.org/docs/latest/design/architecture/), [Apache Druid introduction](https://druid.apache.org/docs/latest/), [Apache Pinot hybrid real-time/offline tables](https://docs.pinot.apache.org/workload-playbooks/hybrid-offline-realtime), [Apache Pinot table concepts](https://docs.pinot.apache.org/architecture-and-concepts/components/table), [HLD Handbook technology overview](https://hld.handbook.academy/technologies/).

## Scope and version

OLAP systems optimize analytical queries over large datasets: scans, joins, aggregations, time windows, and groupings across many rows. This lesson compares BigQuery, ClickHouse, Snowflake, Amazon Redshift, Apache Druid, and Apache Pinot. It describes broad architectural fit, not a current feature/price matrix. Managed service editions, serverless/reserved capacity, table formats, query limits, and billing change; verify the exact service and version. Apache Druid’s docs list the current release and architecture independently; Pinot/Druid versions should be pinned for deployment.

## How this group fits the mental model

OLTP systems are optimized for many small, concurrent reads/writes of individual records and transactional invariants. OLAP systems are optimized for reading a lot of data but only some columns, then aggregating or joining it. Columnar storage compresses similar values and skips unrelated columns/blocks; massively parallel processing (MPP) divides query work among workers. These designs can make analytical scans efficient, but do not automatically provide low-latency point updates or behave like a transactional application database.

A typical analytics path ingests events or batches, validates and transforms data, stores raw/curated datasets, builds partitions/clusters/sort layouts or indexes, and serves SQL/analytics dashboards. Storage and compute may be decoupled, provisioned in clusters, or integrated with real-time ingestion. Data freshness is not a single promise: streaming ingest, micro-batches, compaction, late events, materialized views, and query caches all affect when a fact becomes visible.

Separate the system of record from analytical derivatives when consistency and workload isolation matter. Change-data-capture or event streams can feed a warehouse/lakehouse. Expect duplicates, schema evolution, late data, backfills, and replay. Preserve source identifiers and ingestion metadata so transformations are idempotent and corrected data can be rebuilt. Analytical pre-aggregation improves latency/cost for known queries but can lose detail or become stale; keep raw data according to retention and governance policy.

## Supplied names explained

- **BigQuery:** Google Cloud managed analytical warehouse with separate storage and compute layers and distributed query workers. Partitioning and clustering can reduce scanned data; evaluate query and storage billing, slots/capacity, data locality, and external/federated query behavior.
- **ClickHouse:** columnar analytical database with MergeTree-family storage engines and a strong real-time analytics/observability use case. Append parts, background merges, sort keys, partitioning, replication/sharding, and update/delete patterns influence design; it is not a drop-in OLTP replacement.
- **Snowflake:** managed cloud data platform with persistent storage and virtual warehouses as independent compute clusters. Separate warehouses can isolate workloads, while running compute and serverless features have distinct usage/cost behavior.
- **Redshift:** AWS managed data warehouse using columnar compression and parallel query execution. Distribution/sort choices, workload management, concurrency scaling/serverless options, and S3 integrations should be verified for the chosen deployment.
- **Druid:** distributed real-time analytics database with separate ingestion, query, historical, coordination, and deep-storage roles. Segment lifecycle and time-oriented/event ingestion suit fast slice-and-dice analytics; operating the cluster adds component and metadata-store responsibility.
- **Pinot:** distributed low-latency analytics datastore for event-driven, high-concurrency queries. Real-time and offline segments can form a hybrid table where batch-corrected historical segments replace corresponding real-time coverage; indexing and ingestion pipelines require explicit design.

## Cross-item comparison

| System | Strong fit | Main trade-off |
| --- | --- | --- |
| BigQuery | Managed ad hoc SQL analytics and elastic storage/compute in Google Cloud | Query cost/capacity and data movement/governance; not every workload benefits from scan-oriented execution |
| ClickHouse | Fast analytical queries on event/log/metric data, especially when query patterns and sort keys are known | Schema/order/part management, cluster operations, mutation behavior, and workload-specific tuning |
| Snowflake | Managed warehouse with independent compute clusters for workload isolation and elastic usage | Cloud/service coupling and cost governance across warehouses, serverless features, storage, and data transfer |
| Redshift | AWS warehouse and MPP analytics integrated with AWS data systems | Cluster/serverless and distribution/workload choices, plus service-specific operations and tuning |
| Druid | Low-latency aggregations on event/time data with real-time and batch ingestion | Multiple service roles, segmenting/compaction, deep storage, and narrower workload fit than a general warehouse |
| Pinot | Very low-latency, high-concurrency analytical APIs/dashboards over event streams and offline data | Index/segment/ingestion design and additional cluster operations; less suited to arbitrary complex warehouse SQL |

## Examples

A product analytics team wants SQL over months of clickstream events, exploratory joins, and occasional large backfills. A managed warehouse such as BigQuery, Snowflake, or Redshift may fit better than a latency-specialized serving store. Partition on an appropriate event date, cluster/sort for common filters, and query only needed columns. Keep compute budgets or workload isolation for dashboards, ad hoc analysis, and scheduled transformations. Measure bytes scanned/runtime/concurrency and freshness, not only average query latency.

A live dashboard needs counts by product/category for the last few minutes with high concurrent reads. Druid or Pinot may fit if their ingestion and segment/index model matches the event stream. Define how a real-time segment transitions to a corrected offline segment, what happens to late/duplicate events, and whether a query can double-count during replacement. ClickHouse may also serve real-time analytical data; compare ingest patterns, update/delete needs, cluster operations, and query shape in a representative test.

## Common mistakes

- Choosing OLAP because the dataset is “big” without analyzing query shape, concurrency, freshness, and transaction needs.
- Treating columnar MPP warehouses and real-time analytics stores as interchangeable.
- Assuming streaming ingestion means every event is instantly queryable and final.
- Failing to plan duplicate handling, late-arriving data, schema evolution, backfill, and reproducible transformations.
- Partitioning into too many tiny partitions or choosing sort/cluster keys that do not match queries.
- Using a warehouse as the primary write path for fine-grained transactional invariants without checking semantics and latency.
- Pre-aggregating without defining correction windows, precision, and retention of source data.
- Ignoring cost dimensions such as scanned bytes, running warehouse time, serverless ingestion, storage, and cross-region/data egress.
- Assuming Druid/Pinot segment replacement is automatic correctness; validate time-boundary and deduplication behavior for the selected release.

## Knowledge checks with answers

1. **Why do columnar systems help OLAP?** Queries often scan many rows but only a subset of columns; columnar layout can reduce I/O and improve compression for those scans.
2. **What is the key difference between Druid/Pinot and a general warehouse?** They emphasize low-latency event analytics and specialized segment/index/ingestion architectures; they are not simply generic SQL warehouses with a different name.
3. **How should a real-time plus batch pipeline handle the same time range?** Define ownership boundaries, late-data correction, deduplication, and segment/table handoff so results do not omit or double-count events.
4. **What is the right product comparison method?** Replay representative data/query mixes and compare freshness, p95/p99 latency, concurrency, correctness, recovery, operations, and total cost.

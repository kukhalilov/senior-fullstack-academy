# system design technology landscape and selection — Reference: Time-series databases

Sources: [InfluxDB 3 overview](https://docs.influxdata.com/influxdb3/), [InfluxDB 3 Core documentation](https://docs.influxdata.com/influxdb3/core/), [InfluxDB 3 Core query guide](https://docs.influxdata.com/influxdb3/core/get-started/query/), [InfluxDB 3 Core database retention](https://docs.influxdata.com/influxdb3/core/admin/databases/), [Timescale hypertables](https://github.com/timescale/docs/blob/latest/use-timescale/hypertables/index.md), [Timescale query performance](https://github.com/timescale/docs/blob/latest/use-timescale/hypertables/improve-query-performance.md), [VictoriaMetrics quick start](https://docs.victoriametrics.com/victoriametrics/quick-start/), [VictoriaMetrics capacity planning](https://docs.victoriametrics.com/guides/understand-your-setup-size/), [HLD Handbook technology overview](https://hld.handbook.academy/technologies/).

## Scope and version

Time-series databases store observations indexed by time and usually one or more dimensions such as device, metric, or tenant. This lesson compares InfluxDB, TimescaleDB, and VictoriaMetrics. InfluxDB’s product architecture has changed substantially: InfluxDB 3 is the current generation, while InfluxDB 1/2 APIs, query languages, and data models differ. This lesson cites InfluxDB 3 Core where a version is named; do not assume every feature applies to every InfluxDB product or edition. Timescale and VictoriaMetrics features also vary by release/deployment; check current docs and licensing before choosing.

## How this group fits the mental model

The data path starts with measurements arriving from devices, services, or agents. Each point needs a timestamp, a measurement/value, and dimensions/labels used to group and filter. Ingestion must handle out-of-order events, duplicate delivery, timestamp precision/time zones, missing data, and clock skew. A write-optimized time-series store organizes data so common time-range scans, aggregation, retention, and downsampling are efficient.

Cardinality is a central design issue for metric-style workloads. Every unique combination of labels/tags can create a distinct series or index entry. Putting request IDs, user IDs, or unbounded values into labels can explode cardinality, memory, index size, and query cost. Keep high-cardinality identifiers in logs/traces or ordinary event records unless the database and workload have been explicitly evaluated for them.

Retention and aggregation are separate product policies. Raw measurements can be retained for a short period while rollups preserve longer-term trends, but aggregates cannot answer every question about the original data. Define timestamp, bucket boundaries, late-arrival correction window, null/gap behavior, and whether downsampled values are averages, sums, percentiles, or another statistic. A time-series database is not automatically the right system of record for every event: billing or audit events may need immutable event storage and transactional semantics.

## Supplied names explained

- **InfluxDB:** time-series/event database family. InfluxDB 3 supports SQL and InfluxQL in documented products; Flux from InfluxDB 2 is not supported in InfluxDB 3 Core. InfluxDB 3 Core’s query-range and feature limits are edition/product-specific; current docs distinguish Core, Enterprise, and hosted products. Older v1/v2 retention-policy and bucket concepts do not transfer unchanged to v3.
- **TimescaleDB:** PostgreSQL-based time-series system. Hypertables partition time-series data into time-range chunks and route range queries to relevant chunks; chunk interval, indexes, retention, and continuous aggregates should be tuned to workload and current version.
- **VictoriaMetrics:** time-series monitoring database commonly used with Prometheus-compatible ingestion/query ecosystems. Evaluate single-node versus cluster deployment, retention, active-series/cardinality, storage, replication, and the exact ingestion/query compatibility required.

## Cross-item comparison

| Choice | Typical fit | Main design questions |
| --- | --- | --- |
| InfluxDB 3 | Time-series/event ingestion and recent-data queries using its supported SQL/InfluxQL and APIs | Which InfluxDB 3 product/edition? Is query time range acceptable? Is a v1/v2 migration needed, and which old APIs/languages/features change? |
| TimescaleDB | Time-series workloads that benefit from PostgreSQL SQL, relational joins, and chunk-based time partitioning | What chunk size/index/retention/aggregate plan fits? Which extension features are available in self-managed or managed deployment? |
| VictoriaMetrics | Monitoring metrics, Prometheus ecosystem integration, and time-series storage/retention at scale | What label cardinality and churn exist? Single-node or cluster? What replication, backup, retention, and remote-write behavior does the exact edition provide? |
| Partitioned relational/event store | Moderate time-based data where general SQL, constraints, and joins dominate | Will ingest/query volume and retention operations remain manageable without a specialized TSDB? |
| Columnar OLAP/warehouse | Historical scans, broad analytics, and large aggregations | Is near-real-time ingest/freshness adequate, and should recent hot data be separated from historical analysis? |

## Examples

A service emits `http_requests_total` by route, status code, and region. Those dimensions have a bounded set of values and support useful aggregations. Adding `user_id` and full URL as labels may create millions of series and make storage/queries much more expensive. Instead, keep a trace/log identifier in a high-cardinality telemetry signal and join only when investigating a specific event.

For an IoT fleet, points may arrive late when devices reconnect after being offline. Store event time separately from ingestion time, accept a documented lateness window, and make rollups refresh enough to include late data. Use UTC timestamps and explicit precision; a daylight-saving local timestamp without offset can be ambiguous. If raw readings expire after 30 days but hourly aggregates remain for a year, ensure the retention job does not delete source chunks before required aggregates are refreshed.

## Common mistakes

- Assuming the InfluxDB 1, 2, and 3 products share query languages, retention model, storage engine, limits, or feature parity.
- Treating every unique label combination as cheap; high cardinality can dominate memory/index/storage cost.
- Using wall-clock event time without handling skew, late points, duplicates, or future timestamps.
- Setting retention without considering continuous aggregate refresh and raw-data deletion order.
- Expecting rollups to preserve raw-data questions such as exact percentiles or per-device diagnosis.
- Storing unbounded identifiers in metric labels rather than logs/traces or event attributes.
- Assuming a Prometheus-compatible API guarantees identical query semantics and operational behavior across databases.
- Choosing a specialized TSDB without testing ingestion bursts, backfills, hot series, query ranges, recovery, and backup restore.

## Knowledge checks with answers

1. **What makes a dimension risky as a metric label?** If it can take an unbounded or very large number of values, it can produce a huge number of series and index entries.
2. **Why separate event time and ingestion time?** Devices can be offline or clocks skewed; the distinction supports lateness handling and data-quality monitoring.
3. **What is the major migration caution for InfluxDB?** v1/v2/v3 have meaningful API, query-language, storage, retention, and edition differences; confirm which features exist in the target product.
4. **When is TimescaleDB compelling?** When time partitioning and time-series functions help while PostgreSQL relational querying/joins remain valuable, subject to workload and extension constraints.

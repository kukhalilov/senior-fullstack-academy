# data systems storage engines analytics streams and search — Reference: Events, analytics, and change propagation

Sources: [HLD Handbook](https://hld.handbook.academy/), [Apache Kafka introduction](https://kafka.apache.org/20/getting-started/introduction/), [Kafka design and offsets](https://kafka.apache.org/36/design/design/), [Debezium features and snapshots](https://debezium.io/documentation/reference/3.8/features.html), [Debezium Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html), [AWS transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS event-sourcing pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing-pattern.html), [AWS data lake overview](https://aws.amazon.com/what-is/data-lake/), [AWS data warehouse architecture](https://docs.aws.amazon.com/whitepapers/latest/data-warehousing-on-aws/data-warehousing-on-aws.html), [AWS lakehouse overview](https://aws.amazon.com/what-is/data-lakehouse/), [Apache Iceberg](https://iceberg.apache.org/docs/latest/), [Delta Lake](https://docs.delta.io/), [Apache Hudi](https://hudi.apache.org/docs/overview/).

## Scope and version

This reference covers the ten names in the frozen inventory: batch processing, stream processing, Lambda architecture, Kappa architecture, CDC, transactional outbox, event sourcing, data lake, data warehouse and lakehouse. Product-specific APIs and guarantees belong to the named product reference lessons. Current Kafka, Debezium, AWS architecture and table-format documentation was checked 2026-11-20.

## How this group fits the mental model

Operational systems answer “what is the current state and may this command commit?” Analytics and derived-data systems answer “what patterns appear across the accumulated data?” Change pipelines connect the two. They introduce a second copy, asynchronous delay, ordering and replay questions. For every derived dataset, identify: its authoritative source, event/schema contract, delivery and deduplication behavior, freshness objective, retention horizon, backfill/rebuild path, and what happens when the pipeline falls behind.

Keep **business events**, **database changes**, and **messages** distinct. A business event says what happened in domain language (e.g. `OrderPlaced`); a CDC record describes a row mutation; a broker record is a transport envelope with key, value, headers and offset. A database row update may not correspond one-to-one with a business fact. A broker can transport either kind, but transport does not make the record a source of truth or define its business meaning.

## Supplied names explained

- **Batch processing** — Reads a bounded input set and writes a result on a schedule or after a trigger. It is easy to reason about when the result can wait; retries can restart from a durable input/checkpoint. Batch is not inherently slow or consistent: latency depends on schedule, size, orchestration and destination. Incremental batches can process only new partitions/change ranges when the source supports it.
- **Stream processing** — Continuously consumes records and maintains computations as new data arrives. State, event time, processing time, watermarks, late/out-of-order events, duplicate delivery, checkpointing and sink semantics all affect results. “Real time” is a requirement to measure end-to-end, not an intrinsic millisecond promise. Windowed aggregation state needs expiry/retention rules; replay may recompute outputs and therefore requires idempotent or transactional sinks.
- **Lambda architecture** — A historical pattern with a batch layer that recomputes a complete/correct view and a speed layer that produces low-latency approximate/recent results; a serving layer combines them. It can accommodate different latency/correction needs, but maintains two processing paths and often duplicate business logic, code, tests and consistency rules. It is not a product called Lambda and is not AWS Lambda.
- **Kappa architecture** — A pattern that treats an append-only event log as the primary input and uses streaming computation for live results and replay-based recomputation. It can simplify duplicate batch/speed implementations when the log retains enough data and the processor can replay at the required scale. Replaying years of events may be slow or expensive; schema evolution, late corrections, compacted log retention and side-effect idempotency remain problems. It is not “streaming removes batch”: bounded reprocessing jobs may still be useful.
- **Change data capture (CDC)** — Captures inserts, updates, deletes and sometimes DDL from a database log or polling/snapshot process, then emits a change stream. Log-based CDC can avoid repeated table scans and reflect committed row changes, but the actual event schema, transaction ordering, snapshot handoff, delete/tombstone representation and source-version support are connector-specific. Initial snapshot plus live-log streaming is a correctness boundary: the connector must coordinate the snapshot position to avoid gaps or duplicates. Retain source logs long enough for outage recovery and monitor source lag.
- **Transactional outbox** — The application writes business state and an outbox row in the same local database transaction. A relay polls or CDC-reads committed outbox rows and publishes them. This prevents the database-commit/message-publish dual-write gap: if the transaction rolls back, neither is committed; if it commits, the outbox record can be retried. Delivery can still duplicate (relay can publish then fail before marking progress), so consumers need an event ID/idempotency strategy. Define ordering key, cleanup, poison-event handling, schema/version fields and outbox growth/retention.
- **Event sourcing** — Stores domain events as the authoritative history; current state is derived by folding/replaying events or loading a snapshot plus later events. It can preserve how state changed and support alternative projections, but requires immutable event contracts, correction/compensation policy, concurrency/version checks, snapshots, replay tooling and PII retention/deletion strategy. Event sourcing is not just “send every DB update to Kafka.” A relational CRUD table plus outbox is often simpler. Event sourcing and CQRS can be combined but neither requires the other.
- **Data lake** — A storage and governance architecture for retaining diverse raw or refined data, often in object storage and open files, so multiple engines can process it. The format may be CSV/JSON/Parquet/ORC or a transactional table format. Raw files alone do not provide discoverability, access control, schema evolution, transaction isolation, quality or safe concurrent writes. Add catalog/metadata, ownership, lineage, classification, lifecycle and access policies.
- **Data warehouse** — A managed or self-managed analytical data platform with governed, modeled datasets and optimized SQL/reporting workloads. Pipelines extract/ingest, validate, transform and publish tables or dimensional models. A warehouse usually trades generalized raw-file flexibility for managed query execution, workload controls and curated semantics. It can be fed by a lake and coexist with one; product boundaries vary.
- **Lakehouse** — An architecture goal combining economical/open lake storage with table-level metadata/transaction, schema and query capabilities commonly associated with warehouses. It is not one universal guarantee or standard API. Apache Iceberg, Delta Lake and Hudi provide different table protocols/features and engine/catalog compatibility. Verify concurrent commit isolation, schema evolution, deletes, streaming, governance, interoperability and maintenance for the exact format and engines. A lakehouse still needs data modeling, quality, catalog permissions, workload management and recovery.

## Cross-item comparison

| Need | Candidate path | Main design cost |
|---|---|---|
| Recompute trusted reports on a predictable schedule | Batch pipeline to warehouse/lakehouse | Data freshness is bounded by the run schedule; backfills compete for capacity |
| Alert or update a dashboard quickly | Stream processor on broker/CDC events | Stateful recovery, lateness, duplicate effects and continuous operations |
| Keep DB state and event publication from diverging | Transactional outbox plus relay/CDC | Relay lag, duplicate publication, outbox growth and consumer idempotency |
| Preserve business history as canonical state | Event store/event-sourced aggregate | Event evolution, replay cost, correction and privacy policy |
| Store varied source data for multiple engines | Governed data lake | Catalog, quality, lifecycle, permissions and file/table correctness |
| Provide curated, low-latency analytical SQL | Warehouse or lakehouse query layer | Modeling, concurrency/cost controls, ingestion freshness and platform constraints |

The strongest design is not the one with the most fashionable architecture. A single transactional database plus an outbox and one incremental projection may be enough. Add independent paths when a measurable latency, retention, isolation, reuse or processing requirement justifies them.

## Examples

An order service needs to update an order and notify a fulfillment consumer. The application starts one transaction, changes the order state and inserts an `OrderPlaced` outbox row with a stable event ID, aggregate ID/version, event type and payload version. After commit, CDC or a poller publishes the outbox event. The consumer stores processed event IDs with its own state update or uses an idempotent upsert. If publishing retries, duplicate events are harmless. If a consumer is offline, broker retention must cover its outage; if it expires, a source-of-truth export/reconciliation plan is needed.

For daily revenue and live order counts, choose an explicit source. Batch SQL can publish a corrected daily total; a stream can maintain a low-latency estimate. If both are used (Lambda-like), define which view owns a time range and how late corrections replace speed-layer results. If using one log and replay (Kappa-like), size the log retention and parallel replay throughput to meet recovery time, and avoid replaying non-idempotent email/payment side effects.

## Common mistakes

- Publishing to a broker and committing a database transaction as two uncoordinated writes, then assuming a retry solves every failure window.
- Treating CDC row changes as domain events or assuming it automatically captures business intent.
- Assuming at-least-once transport becomes exactly-once application effects without a sink transaction or idempotency key.
- Using a Lambda speed and batch layer without a reconciliation rule for overlapping/corrected data.
- Choosing Kappa while retaining events for less time than the largest outage or rebuild needs.
- Starting an initial CDC snapshot and live stream without validating the connector's snapshot/log handoff semantics.
- Calling any object-storage bucket a complete data lake without catalog, access, quality, ownership and lifecycle controls.
- Calling any lake-backed engine a lakehouse without checking table-format protocol and concurrent-writer guarantees.
- Making the event store authoritative before the organization can evolve and replay its event contracts safely.

## Knowledge checks with answers

1. **What failure does an outbox remove?** It removes the gap where the database commits but direct message publication fails (or publication succeeds while the DB rolls back) by writing state and a publication record in one DB transaction. Relay/consumer duplicates still need handling.
2. **How does CDC differ from an outbox event?** CDC describes committed database mutations; an outbox contains application-authored event meaning. CDC can transport outbox rows reliably, but it does not invent the domain event.
3. **What makes replay safe?** Retained and decodable input, deterministic/reproducible computation where required, compatible state recovery, and idempotent/transactional outputs. Replay alone does not undo side effects.
4. **When does a Lambda design earn its complexity?** When separate low-latency and complete/correct batch views have important distinct requirements and the team can reconcile them reliably.
5. **Does lakehouse mean data quality and governance are solved?** No. Table formats can provide specific metadata/transaction features; data contracts, permissions, lineage, validation and workload controls remain design responsibilities.

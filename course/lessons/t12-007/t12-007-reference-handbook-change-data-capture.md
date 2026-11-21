# system design technology landscape and selection — Reference: Change data capture

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [Debezium 3.7 documentation](https://debezium.io/documentation/reference/stable/), [Debezium connectors](https://debezium.io/documentation/reference/stable/connectors/), [Debezium FAQ](https://debezium.io/documentation/reference/stable/faq.html).

## Scope and version

This lesson explains Debezium as the named change data capture (CDC) system. The official documentation identifies 3.7 as the latest stable version at review time; connector behavior and supported database versions vary, so check the selected connector’s version-specific documentation.

## How this group fits the mental model

CDC turns committed database changes into a stream that other systems can consume. Instead of repeatedly querying for “what changed,” a CDC connector reads the database’s change log or equivalent mechanism and emits ordered change events. This is useful for search indexes, caches, analytics, event-driven integrations, and migration pipelines.

CDC is not automatically a domain event stream. A row update says what changed in storage; it may not explain the business intent. It also creates a distributed consistency boundary: the database commit and downstream publication are not one atomic transaction. A robust design accounts for an initial snapshot, ongoing log position, restart behavior, duplicates, schema evolution, deletes, lag, and downstream idempotency.

## Supplied names explained

- **Debezium** — A set of CDC connectors that capture row-level changes from supported databases and publish change-event streams. Common deployments use Kafka Connect, but the project documentation also describes Debezium Server, Debezium Engine as an embedded library, and a managed Debezium Platform. Its event envelope can carry operation, key, before/after data where supported, source metadata, and timestamps/positions. Exact fields and semantics depend on connector and database.

### Snapshot-to-log lifecycle

1. **Initial snapshot:** capture a consistent baseline of selected tables while establishing a corresponding log position. Snapshot mode and database support determine exact mechanics.
2. **Streaming:** read subsequent committed changes from the database log and emit records, generally preserving source order within the connector’s supported scope.
3. **Checkpoint/offset:** persist progress so a restart can resume. If the sink write and offset update are not atomic together, replay can duplicate a record.
4. **Recovery and retention:** the source database must retain required logs long enough for connector downtime and recovery, or the connector may need a new snapshot/resynchronization.
5. **Schema changes:** consumers must handle compatible evolution and deliberate handling for incompatible changes; source schema history/configuration is connector-specific.

## Cross-item comparison

| Approach | Strength | Limitation |
|---|---|---|
| Application dual-write | Can publish meaningful domain events | Database commit and message publish can diverge unless an outbox or equivalent atomic handoff is used |
| Polling by updated timestamp | Simple for modest workloads and systems without log access | Can miss deletes, race on timestamps, repeatedly scan data, and struggle with exact ordering |
| Transactional outbox | Atomically records business intent/event alongside application transaction | Requires an outbox relay and cleanup/monitoring; still needs downstream idempotency |
| Log-based CDC with Debezium | Captures committed row changes without changing each write path | Infrastructure coupling to database logs, connector operations, schema handling, and row-level rather than inherently domain-level meaning |

## Examples

An application stores products in PostgreSQL and maintains a search index. Debezium captures committed product row changes, including deletes, and publishes records keyed by product ID. The index consumer applies each record idempotently using the key and source version/position where available. On startup, the connector establishes a snapshot and then streams changes so writes during the snapshot are not lost according to the connector’s documented mode. If connector downtime exceeds WAL retention, operators detect the gap and perform the documented recovery or resnapshot procedure rather than silently assuming continuity.

If the downstream consumer needs “ProductPublished” with business meaning, an outbox domain event may be more appropriate than deriving intent from arbitrary row mutations.

## Operational checklist

- Confirm connector compatibility with the exact database version, log settings, tables, data types, and topology.
- Size and monitor database log retention for the worst expected outage and recovery time.
- Alert on connector health, source lag, failed records, snapshot progress, and schema history problems.
- Define topic/table naming, key choice, partitioning, schema compatibility, delete/tombstone behavior, and sensitive-column policy.
- Make consumers replay-safe and test restart, duplicate delivery, schema change, failover, and resnapshot procedures.
- Avoid treating a CDC record as authorization to expose sensitive source columns downstream.

## Common mistakes

- Treating CDC as an atomic transaction spanning source DB and broker.
- Assuming row-change records are stable domain events with complete business meaning.
- Ignoring initial snapshot consistency, deletes, log retention, or schema evolution.
- Assuming offsets eliminate duplicates across every crash window.
- Letting a connector lag until source logs are discarded without alerting or recovery planning.

## Knowledge checks with answers

1. **What does CDC capture?** Committed data changes as exposed by the source database’s change mechanism, with connector-specific metadata and ordering scope.
2. **Why can consumers see duplicates after a restart?** The connector or sink may replay changes when progress and output were not committed atomically.
3. **When is an outbox preferable?** When downstream consumers need explicit business events and those events must be recorded atomically with the application transaction.
4. **What happens if needed database logs expire during connector downtime?** The connector may no longer be able to continue seamlessly; recovery can require a new snapshot or another documented reconciliation process.

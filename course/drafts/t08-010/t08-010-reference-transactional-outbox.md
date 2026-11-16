# transactions distributed consistency saga outbox and inbox — Reference: Atomic outgoing record plus retryable message relay

Sources: [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), [Power Platform Transactional Outbox](https://learn.microsoft.com/en-us/power-platform/architecture/reference-architectures/transactional-outbox-pattern), and [Transactional Outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html).

## Scope and version

The pattern is stable; implementation details are store-specific. The cited Cosmos DB guidance uses transactional batches within a logical partition and the change feed, while relational implementations commonly use a table plus a polling or log-based relay. Keep each guarantee tied to its actual database and broker boundary.

## How this group fits the mental model

An outbox makes “business state changed” and “publish this event” one local atomic decision. A separate relay retries delivery. Since a relay can repeat after an uncertain broker acknowledgement, consumers must be duplicate-safe; the outbox does not make their work part of the producer's transaction.

## Supplied names explained

### Transactional Outbox pattern

Persist a message/event record in the same local transaction as the business state change, then publish it asynchronously. It closes the commit-then-publish loss window for the durable intent.

### Outbox record

A durable envelope containing message identity, event type/schema, payload or reference, aggregate identity/order, creation time, and relay state as needed. Avoid leaking secrets or storing a payload that cannot be retained safely.

### Outbox table

A relational representation of pending events. Index by status/partition and claim safely across workers; retention and cleanup should not remove unprocessed records.

### Outbox item embedded in aggregate document

An event stored alongside aggregate data in one document/partition where the database can atomically update both. This may simplify atomicity but can grow documents, complicate cleanup, or constrain partitioning.

### Business-state and outbox atomic commit

The key local guarantee: both the business update and event intent commit together or neither does. It requires the store to support that atomic boundary; Cosmos DB transactional batch, for example, is limited to the applicable logical partition.

### Outbox relay

A worker reads pending records, publishes them, and records/checkpoints progress. It needs restart safety, bounded concurrency, backoff, poison-event handling, and monitoring of oldest pending age.

### Polling publisher

Periodically queries the outbox for eligible records and publishes them. It is straightforward and database-portable, but adds polling load, latency, row claiming/contention, and cleanup concerns.

### Transaction-log tailing relay

Reads committed changes from a database log or change stream rather than repeatedly querying an outbox table. It can reduce polling, but is coupled to database log semantics, retention, offsets, and connector behavior.

### Change-data-capture relay

Uses database change capture/feed to observe committed records and forward them. CDC is a delivery mechanism, not by itself a semantic guarantee of consumer effects; offsets, replay, ordering, retention, and duplicate behavior remain relevant.

### Outbox message identity

A stable unique event ID preserved across relay retries and consumer redelivery. It enables broker or consumer deduplication; generating a new ID for every retry defeats dedupe.

### Outbox publication status

Persisted state such as pending/published/failed, if the chosen relay needs it. State transitions must not mark success before the broker acceptance boundary, and an uncertain acknowledgement can still cause a duplicate.

### Outbox relay checkpoint

A durable position or progress marker that says which records/log entries the relay has handled. Checkpoint ordering relative to publish defines loss-versus-duplicate risks; prefer replayable progress plus dedupe over skipping unconfirmed events.

### Outbox relay duplicate publication

Occurs when publish succeeds but the relay crashes before saving progress, then retries after restart. At-least-once publication is a common consequence; design consumers accordingly.

### Outbox event ordering

The order in which events for a business entity are emitted/consumed. Global ordering is expensive and often unnecessary; preserve per-aggregate sequence where consumers depend on it and partition consistently.

### Per-aggregate outbox sequence

A monotonically ordered version/sequence associated with one aggregate's events. Consumers can detect gaps, duplicates, or reordering, but sequence allocation must itself be atomic and scoped correctly.

### Outbox retention and cleanup

Removal/archive policy for published records. Retain long enough for recovery, audit, replay, and dedupe requirements; cleanup must not race with active relays or delete pending events.

### Outbox backlog

Accumulated unprocessed events. Measure count and oldest age, relay throughput, poison failures, and database growth; alert before storage exhaustion or unacceptable consistency lag.

### Outbox relay retry

Repeatable publishing attempts after transient failures, with bounded backoff and poison-message policy. Stable identity and idempotent downstream handling make retries safe.

### Broker publisher confirmation boundary

The point at which the broker confirms acceptance under its documented durability/replication settings. Confirmation does not mean consumers processed the message, and a lost confirmation can leave acceptance ambiguous.

### Outbox does not make consumer processing atomic

The producer's outbox only couples local producer state with publication intent. Consumer-side effect and acknowledgement have their own crash window; use local inbox/idempotency or a separate durable workflow.

## Cross-item comparison

Polling is simple but queries the store repeatedly; log tailing/CDC can reduce polling but couples to log/feed retention and checkpoint rules. An outbox table is explicit application data; an embedded item uses a document-local atomic boundary. Neither eliminates duplicates after uncertain publish confirmation.

## Examples

Within one supported Cosmos DB logical partition, save an aggregate update and event document atomically, then forward changes from the change feed to a broker. In a relational design, insert order and outbox rows in one transaction; a worker claims pending rows and publishes with the same event ID on every retry. In both cases, consumers remain duplicate-safe.

## Common mistakes

- Marking an event processed before confirmed publication and thereby losing it.
- Assuming confirmation plus checkpoint is atomic across database and broker.
- Assuming relay order is global or preserved across parallel workers.
- Deleting events before handling replay/recovery windows and consumer dedup retention.
- Letting poison records block every later event without an operational policy.
- Calling outbox “exactly once” without defining which boundary is deduplicated.

## Knowledge checks with answers

1. **What failure does an outbox close?** The producer crash after local commit but before persisting publication intent.
2. **Why can duplicate publication still happen?** Broker acceptance may precede relay checkpoint, then a restart replays the event.
3. **What is the confirmation boundary?** Broker acceptance under its contract; downstream processing is separate.

### Exact terms covered

- `Transactional Outbox pattern`
- `Outbox record`
- `Outbox table`
- `Outbox item embedded in aggregate document`
- `Business-state and outbox atomic commit`
- `Outbox relay`
- `Polling publisher`
- `Transaction-log tailing relay`
- `Change-data-capture relay`
- `Outbox message identity`
- `Outbox publication status`
- `Outbox relay checkpoint`
- `Outbox relay duplicate publication`
- `Outbox event ordering`
- `Per-aggregate outbox sequence`
- `Outbox retention and cleanup`
- `Outbox backlog`
- `Outbox relay retry`
- `Broker publisher confirmation boundary`
- `Outbox does not make consumer processing atomic`

### Exact terms covered

- `Transactional Outbox pattern`
- `Outbox record`
- `Outbox table`
- `Outbox item embedded in aggregate document`
- `Business-state and outbox atomic commit`
- `Outbox relay`
- `Polling publisher`
- `Transaction-log tailing relay`
- `Change-data-capture relay`
- `Outbox message identity`
- `Outbox publication status`
- `Outbox relay checkpoint`
- `Outbox relay duplicate publication`
- `Outbox event ordering`
- `Per-aggregate outbox sequence`
- `Outbox retention and cleanup`
- `Outbox backlog`
- `Outbox relay retry`
- `Broker publisher confirmation boundary`
- `Outbox does not make consumer processing atomic`

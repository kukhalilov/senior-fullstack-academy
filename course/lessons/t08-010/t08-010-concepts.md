# transactions distributed consistency saga outbox and inbox — Core concepts and how they fit together

Sources: [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [SQL Server transaction guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17).

## Learning objectives

- State precisely what a local ACID transaction does and where it ends.
- Explain why database-plus-broker dual writes have an unsolved failure window without durable coordination.
- Describe outbox publication and inbox consumption, including duplicates and crash points.
- Design a saga with persisted progress, retryable actions, compensation, and a meaningful intermediate state.
- Distinguish database rollback from a compensating business action and eventual consistency from an invariant violation.

## Prerequisites

Understand a database transaction, service ownership, asynchronous messages, and retry/idempotency fundamentals. This lesson uses SQL Server isolation levels as an example, but behavior and names vary among database engines; use the relevant engine documentation for implementation details.

## Core concepts

### Local atomicity has a resource boundary

ACID describes properties of a transaction managed by a resource. Application logic chooses a set of changes that must preserve an invariant; the engine provides atomic commit, isolation mechanisms, and durability according to its configuration and guarantees. A transaction on service A's database does not automatically commit service B's database or a message broker. Sharing one database transaction scope also does not imply the same isolation semantics across providers.

### Isolation is about concurrent observations and conflicts

Isolation levels trade blocking, version retention, and anomalies. The SQL Server guide, for example, distinguishes statement-level row-versioned `READ COMMITTED` from transaction-level `SNAPSHOT`, and from lock-based levels. Names such as `REPEATABLE READ` or `SERIALIZABLE` describe engine-level semantics, but do not by themselves prevent every business-level race unless the predicates and writes are correctly enclosed. Optimistic concurrency detects conflicts; pessimistic locking reserves access and may block. Keep transactions short and handle conflict/retry behavior intentionally.

### Dual writes fail in either order

If the service commits the database first and then crashes before publish, state exists but consumers never learn about it. If it publishes first and the database commit fails, consumers may react to a change that never committed. A process-local try/catch cannot close a crash window between independent systems. The key question is which durable system records both the business decision and the obligation to deliver.

### The outbox makes intent atomic, not delivery exactly once

Write business data and an outbox record in the same local transaction. A separate poller or log/change-feed relay publishes pending records and advances progress. If the relay crashes after the broker accepted a message but before checkpointing, it may publish again. Thus relay delivery is typically at least once: stable event IDs, ordering strategy, idempotent consumers, and retention/cleanup are necessary. Ordering may be guaranteed per aggregate/partition, not globally.

### The inbox makes local consumption repeat-safe

In one consumer database transaction, claim a `(subscriber, messageId)` with a uniqueness rule and apply the local business change. A duplicate then becomes a no-op or a detected replay. Acknowledging before local commit can lose work; committing the effect before acknowledging can redeliver, which is why deduplication is needed. An inbox does not atomically cover an external HTTP call: use that external service's idempotency support or another durable workflow.

### A saga coordinates committed local steps

Each participant commits locally and signals the next step. Choreography distributes decisions across event reactions; orchestration stores the workflow state and explicitly issues commands. Persist step identity/status, deadlines, correlation, retry count, and outcome so a restarted process can resume. A timeout can mean unknown completion, so query/reconcile or use idempotency before repeating an action.

### Compensation is business logic, not time travel

A refund, reservation release, or cancellation is a new transaction that counteracts a previous committed action. Other users may have changed state meanwhile; refunds can have fees and irreversible notifications cannot be unsent. A compensation can fail, run in a different order or in parallel, require a human choice, or produce a state different from the original. Define pivot/point-of-no-return steps and continue forward with retryable steps when rollback is no longer meaningful.

### Consistency is an explicit product contract

Eventual consistency means replicas/participants may temporarily disagree while valid work progresses; it does not mean unbounded staleness or accepting broken invariants silently. Define which invariants remain local, what users see while pending, how long reconciliation may take, and what happens on terminal failure. Minimize coordination when the domain can tolerate asynchronous propagation, but preserve strong consistency where the business invariant truly requires it.

## Mechanisms and relationships

1. Identify each invariant and its authoritative owner.
2. Put all writes for a local invariant inside one database transaction and select isolation/concurrency control for the actual race.
3. When publication must follow that commit, persist an outbox record in the same transaction.
4. Give every event a stable identity and, when needed, aggregate sequence; relay with explicit retry, checkpoint, and cleanup rules.
5. At each consumer, atomically deduplicate and apply local effects; acknowledge only after the local commit.
6. For a workflow across owners, persist saga state and define each forward step, timeout meaning, retry safety, compensation, pivot, and operator action.
7. Trace the logical workflow across messages and expose backlog age, duplicate count, stuck state, compensation failure, and reconciliation outcome.

## Worked examples

### Lost publication

An order row commits, then the service dies before publishing `OrderCreated`. A periodic database scan cannot reliably infer every event from current rows, especially if state changed again. The same transaction should have inserted an outbox event so the relay can publish after restart.

### Duplicate consumption

The broker accepts event 42; the consumer commits inventory reservation and then crashes before acknowledgement. It receives event 42 again. An inbox uniqueness key and local transaction make the repeat detectable. If reservation triggered a separate warehouse API, the local inbox alone does not make that call atomic; pass a durable idempotency key or model the external interaction as its own workflow step.

### Failed compensation

Payment was captured and shipment reserved, but shipment booking fails. The saga requests a refund; the payment provider is unavailable. The correct state is `RefundPending` with persisted retry/reconciliation, not a false claim that the order was rolled back. Escalate when automated recovery cannot complete within policy.

## Misconceptions and edge cases

- ACID is scoped to the participating resource manager and configured transaction boundary.
- A message broker acknowledgement proves broker acceptance under its contract, not that every consumer applied the effect.
- An outbox prevents loss of publication intent but normally permits duplicate publication.
- An inbox uniqueness check must share the transaction with the local effect to close the relevant window.
- “Exactly once” is scoped: a broker may deduplicate a send or a consumer may apply one database effect once, but arbitrary external side effects are not made globally atomic.
- Compensation does not erase audit history or guarantee restoration of the exact prior state.
- An eventual-consistency design still needs bounded lag, visibility, repair, and terminal failure behavior.
- Snapshot isolation can still have write-skew/business invariant pitfalls; use constraints, version checks, or stronger coordination where necessary.

## Knowledge checks with answers

1. **Why can’t a local transaction atomically publish to a broker?** They are independent resource managers unless a supported distributed transaction coordinates both.
2. **What does an outbox guarantee?** The committed local business change and its durable publication intent appear together; relay delivery can still duplicate.
3. **When is an inbox effective?** When message identity claim and local effect commit atomically in the consumer's store.
4. **What is compensation?** A new business operation intended to counteract prior committed work, subject to current state and failure.
5. **What should a saga persist?** Workflow identity, progress, step outcomes, timing/retry state, and information needed to resume or compensate.

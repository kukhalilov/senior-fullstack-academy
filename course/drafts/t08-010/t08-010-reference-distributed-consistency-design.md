# transactions distributed consistency saga outbox and inbox — Reference: Selecting consistency and coordinating only required invariants

Sources: [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination), [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction).

## Scope and version

This lesson is a design decision guide rather than a framework-specific recipe. “Strong consistency” and “eventual consistency” need concrete read/write semantics; choose database and broker guarantees from their current documentation for the required deployment mode.

## How this group fits the mental model

Start with the invariant and data owner. Keep coordination local when possible. When propagation crosses service stores, explicitly choose delayed convergence, durable messaging, and recovery behavior. Pair patterns at distinct boundaries: an outbox reliably emits local intent, a saga coordinates a business workflow, and an inbox protects a consumer's local effect.

## Supplied names explained

### Shared-database local transaction

Several components use one database transaction to preserve a shared invariant. This can be simpler than distributed coordination, but shared schema access couples ownership and deployment; establish clear write ownership and transaction scope.

### Service-local transaction

A transaction inside one service's owned data store. It is the natural atomic unit in independently deployed services; external effects are coordinated asynchronously or through explicitly supported protocols.

### Cross-service invariant

A business rule spanning data owned by different services, such as a purchase requiring both payment and inventory. Decide whether it must be instantaneous/strong or may be represented as pending and converged through workflow.

### Data ownership boundary

The line defining which service is authoritative for writes/schema and exposes changes through a contract. Clear ownership avoids hidden cross-service writes and makes consistency responsibilities explicit.

### Strong consistency requirement

A precise requirement that reads/operations observe a coordinated, current state within stated scope and failure model. Translate the phrase into observable rules, acceptable latency, and availability constraints before selecting mechanisms.

### Temporary inconsistency acceptance

Product/business agreement that participants may temporarily differ while propagation/recovery proceeds. Define max expected lag, pending states, alert thresholds, and what happens if convergence fails.

### Consistency visibility to users

How the UI/API communicates pending, stale, or compensated outcomes. Use explicit statuses/versions and avoid telling the user an operation completed before its required invariant is satisfied.

### Coordination cost

Latency, contention, availability coupling, failure complexity, operations, and deployment constraints introduced by synchronizing components. Compare it with the cost of temporary inconsistency and recovery.

### Minimize coordination principle

Avoid unnecessary synchronous shared locks/transactions across independently scaling components. Partition ownership and use asynchronous events when the business can tolerate convergence, while preserving local invariants.

### Outbox plus saga composition

The outbox persists each participant's outgoing event/command with its local state; the saga coordinates the multi-step business workflow. The outbox handles a local publish boundary, not the saga's entire outcome.

### Inbox plus consumer retry composition

Inbox dedupe protects a local effect from message redelivery, while broker/client retry handles transient processing failure. Commit inbox and effect together; acknowledge after commit, and bound repeated failure/dead-letter or operator recovery according to broker contract.

### Transactional message delivery versus transactional business effect

Message acceptance/delivery guarantees concern the transport boundary; a transactional business effect concerns database/domain state. One does not imply the other. Couple effect and inbox locally, then publish further work through an outbox.

### Idempotent saga command

A command whose repeated handling has the same intended result, typically enforced with stable command identity and participant-side dedupe. It makes retries and recovery safer but still requires correct key scope and retention.

### Duplicate saga event handling

Participant/orchestrator logic that recognizes repeated events and prevents duplicate state transitions or effects. Validate workflow identity, event ID, and legal state transition; do not assume transport ordering eliminates duplicates.

### Sequence-number validation

Checks expected per-aggregate/workflow order and detects gaps, stale duplicates, or reordering. Define what to buffer, retry, query, or alert on a gap; sequence numbers must be assigned consistently.

### End-to-end correlation and audit trail

Links workflow, commands, events, local transactions, compensation, and operator actions using IDs and structured events. Keep sensitive payloads out of logs and avoid high-cardinality metric dimensions.

### Recovery point for workflow progress

The durable state from which the system can safely resume after crash/restore. Persist step transitions and outgoing intent atomically where possible; plan reconciliation for actions whose outcome cannot be known from local state.

### Failure-injection test for transaction boundary

Test process crash/fault at each boundary: before local commit, after commit before publish, after publish before checkpoint, before/after consumer commit and acknowledgement, and during compensation. Assert no lost invariant, bounded duplicates, observable stuck work, and recoverable terminal paths.

## Cross-item comparison

Shared-database local transaction can enforce one immediate invariant but couples schema/ownership. Service-local transaction preserves independent ownership but requires a message/workflow boundary. Outbox, inbox, and saga solve different edges and compose; none alone provides arbitrary end-to-end exactly-once effects.

## Examples

In a cart checkout, the order service owns order validity, payment owns charge outcome, and inventory owns reservation. Save order plus `CheckoutStarted` in an outbox; consume with inbox/idempotency; persist a saga showing pending payment and reservation. If the user requires “confirmed only when stock is reserved,” return `Pending` until that step completes, or choose a stronger shared transaction only if ownership and deployment truly support it.

## Common mistakes

- Adopting sagas before writing the invariant and its owner.
- Claiming eventual consistency without a convergence target, lag metric, and repair path.
- Combining outbox, broker delivery, inbox, and saga into one false exactly-once claim.
- Exposing a success status before the business completion criterion is met.
- Using cross-service synchronous coordination for convenience without measuring availability and contention costs.

## Knowledge checks with answers

1. **Which question comes first?** Which invariant must hold, who owns it, and what inconsistency can the product tolerate?
2. **What does outbox+saga compose?** Reliable local publication intent plus multi-step workflow coordination.
3. **Why inject crashes between steps?** Those exact gaps reveal loss/duplicate windows and whether persisted recovery is sound.

### Exact terms covered

- `Shared-database local transaction`
- `Service-local transaction`
- `Cross-service invariant`
- `Data ownership boundary`
- `Strong consistency requirement`
- `Temporary inconsistency acceptance`
- `Consistency visibility to users`
- `Coordination cost`
- `Minimize coordination principle`
- `Outbox plus saga composition`
- `Inbox plus consumer retry composition`
- `Transactional message delivery versus transactional business effect`
- `Idempotent saga command`
- `Duplicate saga event handling`
- `Sequence-number validation`
- `End-to-end correlation and audit trail`
- `Recovery point for workflow progress`
- `Failure-injection test for transaction boundary`

### Exact terms covered

- `Shared-database local transaction`
- `Service-local transaction`
- `Cross-service invariant`
- `Data ownership boundary`
- `Strong consistency requirement`
- `Temporary inconsistency acceptance`
- `Consistency visibility to users`
- `Coordination cost`
- `Minimize coordination principle`
- `Outbox plus saga composition`
- `Inbox plus consumer retry composition`
- `Transactional message delivery versus transactional business effect`
- `Idempotent saga command`
- `Duplicate saga event handling`
- `Sequence-number validation`
- `End-to-end correlation and audit trail`
- `Recovery point for workflow progress`
- `Failure-injection test for transaction boundary`

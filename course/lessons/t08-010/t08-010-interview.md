# transactions distributed consistency saga outbox and inbox — Interview questions and reasoning

Sources: [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction), [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), and [Minimize coordination](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination).

## Core questions

1. Why is database plus message-broker dual write unsafe?
2. What guarantee does the transactional outbox provide, and what does it not provide?
3. How does the transactional inbox prevent duplicate local effects?
4. Compare saga choreography and orchestration.
5. Why is compensation different from rollback?
6. What does a timeout mean for a remote side effect?
7. When should a system use 2PC rather than an outbox/saga?
8. How do isolation levels relate to business invariants?

## Concise interview answers

1. The two independent writes can fail between each other in either order, producing committed state without an event or an event without committed state.
2. It atomically commits local business state and publication intent, then relays asynchronously. Relay publication can repeat; consumer processing is a separate boundary.
3. It commits a unique message identity and local business effect in the same consumer transaction, then acknowledges; redelivery sees the committed identity.
4. Choreography distributes event reaction and suits simple flows but can obscure overall state. Orchestration persists a coordinator's explicit flow and eases visibility for complex workflows, but adds central logic/availability concerns.
5. Rollback aborts uncommitted local work. Compensation is a new business action after commit, subject to current state, fees, concurrency, and its own failure.
6. Only that no response arrived in time; the remote operation may have committed. Query/reconcile or use stable idempotency before repeating.
7. Only if the required atomic outcome truly spans participating resources, each supports the protocol, and coordination/blocking/operations costs are acceptable. An outbox/saga fits eventual convergence instead.
8. Isolation controls what concurrent operations can see and how conflicts are handled, but the application must choose correct scope/predicates and may need constraints or explicit concurrency control.

## Deep follow-up answers

### Walk through a producer crash matrix

With DB-first dual write, crash after commit before publish loses notification. With publish-first, crash/DB abort after publish creates a false event. An outbox inserts the event record with business state; a relay can then recover it. If the broker accepts but the relay loses its checkpoint, replay may duplicate, so stable ID and consumer dedupe are part of the design.

### Where does “exactly once” apply?

Define the boundary. A broker may deduplicate a message ID within a limited window; an inbox may ensure a local database effect occurs once per subscriber key; neither alone covers a payment API plus email plus several databases. Compose at-least-once delivery with idempotent effects, stable identities, and reconciliation rather than claim global exactly once.

### How do you design compensation?

For each forward step, state whether it is compensable, the business counteraction, whether the action is partial/irreversible, concurrency conditions, retry/idempotency, and terminal/manual path. Record a pivot after which forward retry is safer than compensation. Compensation can differ in order or parallelize when dependencies and domain rules allow.

### How do you protect a consumer from loss and duplicate delivery?

Claim `(subscriberId,messageId)` under a unique constraint and apply the local effect inside one transaction. Commit before acknowledging. If the DB commit succeeds but ack is lost, dedupe handles redelivery. Retain inbox records for all plausible redelivery/replay/restore periods. For external calls, use their idempotency contract or another persisted workflow.

### How do you choose between isolation, outbox, and saga?

First identify the invariant and authoritative owner. Use local transaction plus constraints/concurrency control when it fits one store. Outbox handles a local state-to-message boundary. Saga coordinates a business workflow across owners where intermediate states are acceptable. Strong cross-resource commit such as 2PC may be justified only when all participants support it and the required semantics outweigh coordination cost.

## Scenario questions

### Order saved, event absent

Ask whether the row and outbox entry were committed together, whether the relay is running, how old the backlog is, and whether the message was published but checkpoint lost. Recover from durable outbox state and dedupe consumers; avoid manually fabricating an event without stable identity/audit.

### Consumer records payment, then reports timeout

Trace acknowledgement/commit order and provider outcome. If local effect committed before lost ack, inbox should suppress the repeat. If remote payment result is uncertain, query by stable key and reconcile; do not infer “not charged” from timeout.

### Saga is stuck compensating

Inspect persisted step status, correlation, retry history, dependency health, and whether compensation is idempotent. Determine if it can safely retry, should query remote outcome, needs a business alternative, or requires authorized human action. Keep the workflow visibly pending and alert on age.

## Tradeoffs and alternatives

- A shared database can make a local invariant simple but couples schema ownership and release cadence.
- 2PC can provide coordinated atomicity among supported participants but introduces coordinator coupling and in-doubt/blocking recovery.
- Outbox/inbox favor durable eventual delivery and replay safety, with extra tables, retention, and operations.
- Choreography avoids a central controller for simple workflows; orchestration makes complex state explicit.
- Compensation keeps workflows moving without distributed rollback but can be partial, costly, and failure-prone.

## Common weak answers

- “Use try/catch around publish and database save.”
- “The outbox gives exactly-once delivery.”
- “A compensating transaction rolls back all services.”
- “Timeout means the remote operation failed.”
- “Inbox dedupe handles the payment provider too.”
- “Serializable fixes everything” without stating transaction scope, predicate, engine behavior, and cost.

## Self-check rubric

- Can you draw both dual-write crash windows?
- Can you name the atomic boundary each pattern protects?
- Can you distinguish local effect dedupe from transport delivery guarantees?
- Can you design persisted saga recovery and a failed-compensation path?
- Can you define user-visible pending/final states and convergence limits?
- Can you test crash points before/after commit, publish, checkpoint, and acknowledgement?

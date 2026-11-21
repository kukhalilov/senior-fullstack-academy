# architecture patterns multi-region tenancy and reliability — Reference: Choreography

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Choreography pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography), [Azure Event-driven architecture style](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS Saga patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/saga-patterns.html).

## Scope and version

This lesson explains choreography as an event-driven coordination pattern, especially for multi-step business work. It is not a vendor-specific broker tutorial and does not imply exactly-once processing. Message ordering, retention, delivery, and redrive behavior depend on the chosen broker and configuration.

## How this group fits the mental model

Imagine a process that crosses services. In choreography, a participant commits its local change and publishes a fact; other participants subscribe and decide whether to react. There is no single workflow component issuing every next command. The resulting loose runtime coupling can help teams evolve independently, but global process state and failure recovery become distributed across handlers, events, and operational tools.

Before adopting it, write the business sequence in plain language. Identify the authoritative owner for each fact, the step that advances the process, the condition that cancels or compensates it, and how an operator can answer “where is this workflow now?” If those answers are difficult to state, event-driven autonomy will probably make the uncertainty worse.

## Supplied names explained

- **Choreography** — Participants react to published events and emit further events or commands as local work succeeds. It avoids a central coordinator on the normal path, but does not mean there is no coordination: contracts, process ownership, retries, correlation, monitoring, and recovery still need design.

### A safe event-handling loop

1. A service commits its own state and an outgoing message atomically, commonly with a transactional outbox. Publishing from a separate unprotected side effect can lose or duplicate the event around a crash.
2. A broker delivers messages according to its actual contract. Consumers assume duplicates and possibly delay; use a durable inbox or idempotency key for effects that must not be repeated.
3. The consumer validates schema/version, checks business preconditions, performs a local transaction, and records its result. Acknowledgement timing must follow the broker’s contract so an acknowledged message does not precede durable work.
4. Every event carries a stable event identifier, correlation/causation information, and enough safe context to locate the workflow. Avoid embedding unnecessary personal data or assuming that one global order exists.
5. A retry limit or poison-message path must alert an owner and preserve enough evidence for safe replay. Replaying can repeat external effects, so downstream calls need idempotency or reconciliation.

## Cross-item comparison

| Choice | Strength | Cost or risk |
|---|---|---|
| Choreography | Participants progress independently; no central hot spot dictates each normal step | Process state is implicit across consumers; dependency cycles and duplicate reactions are harder to see |
| Orchestration | A coordinator records steps, deadlines, retries, and compensation decisions | Coordinator becomes an owned dependency and must be made reliable; participants still need idempotency |
| Synchronous request chain | Direct request/response and immediate result | Latency and availability depend on every synchronous dependency in the chain |
| Event notification | Small signal that something changed; receiver fetches the authoritative state | Receiver depends on the source API and may fetch stale/deleted state later |
| Event-carried state transfer | Event includes a snapshot so consumers can update independently | Payload/schema coupling and stale or sensitive copies must be managed |

For a short, stable workflow with few participants and naturally independent reactions, choreography may be clear. For long-running work with deadlines, human intervention, explicit compensation, or many conditional branches, a workflow orchestrator often makes state and recovery easier to inspect. Hybrid designs are common: an orchestrator emits commands/events, while local services use events for independent projections.

## Examples

**Order fulfillment.** The order service stores `OrderAccepted` and an outbox record in one database transaction. Inventory reserves stock and emits `StockReserved` or `StockRejected`; payment reacts and emits `PaymentAuthorized` or `PaymentDeclined`; fulfillment begins only after its own preconditions pass. If payment is declined after reservation, an explicit cancellation/compensation releases stock. A consumer deduplicates by event ID and records the order correlation ID. The support view reads durable process state rather than inferring status from whichever message happens to be visible.

**Failure walkthrough.** The inventory handler reserves stock, commits, then crashes before acknowledging. The broker may redeliver. Its idempotency record makes the second delivery return the already-recorded reservation result rather than reserve twice. If the event is invalid, route it to a dead-letter/review process with alerting; do not silently discard it. If the notification service is down, order acceptance may remain successful while notification is delayed, provided the product defines that behavior.

## Common mistakes

- Calling a workflow “choreographed” when one service actually owns all decisions but that state is hidden in ad hoc handlers.
- Publishing an event before committing the business change, or committing first and risking that the process crashes before publish.
- Treating broker “exactly once” language as proof that every external side effect runs once end-to-end.
- Using event names as commands (`SendEmailNow`) while describing them as immutable facts (`OrderAccepted`). Model intent and fact separately.
- Assuming global ordering, synchronous delivery, or instantaneous projection updates without a broker and consumer contract that guarantees it.
- Adding an orchestrator without clarifying who owns workflow state, but also rejecting orchestration when operators genuinely need an explicit process record.
- Forgetting schema evolution, personal-data minimization, replay permissions, and retention.

## Knowledge checks with answers

1. **What makes choreography different from orchestration?** In choreography, participants react to events and own their local decisions; orchestration centralizes the workflow’s step decisions and state in a coordinator.
2. **What prevents duplicate stock reservation after redelivery?** Durable idempotency keyed by stable message/event identity, combined with a transaction that records the business effect and deduplication result.
3. **When should an event carry state?** When consumers need a stable snapshot and independent processing justifies the copied data/schema coupling; otherwise a small notification plus authoritative fetch may be preferable.
4. **How does an operator find a stuck process?** Correlation identifiers, persisted local/workflow state, lag and failure metrics, searchable traces/logs, and an owned retry or compensation procedure.

# transactions distributed consistency saga outbox and inbox — Reference: Long-running workflow coordination and compensating business actions

Sources: [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction), and [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos).

## Scope and version

Saga and compensation are architecture patterns, not a particular product API. Coordinator persistence, messaging delivery, timeout, and retry behavior must be specified for the selected runtime/framework and current versions.

## How this group fits the mental model

A saga is a durable workflow made of local commits across service-owned resources. It tracks forward progress and decides whether to retry, compensate, proceed past a pivot, or ask for intervention. Compensation is a new business action; it cannot rewind history or guarantee the exact prior state.

## Supplied names explained

### Saga pattern

Coordinates a sequence of local transactions to complete a distributed business operation. It accepts intermediate states and must define how failures, duplicates, restart, and terminal outcomes are handled.

### Saga participant

A service/component that owns a step and commits its local state. It should validate commands, handle duplicates, emit a result, and expose enough outcome to resume/reconcile safely.

### Saga state

Persisted workflow status and step data needed to know what has completed, what is pending, and what recovery action is valid. It must survive process restart and support diagnosis/audit.

### Local transaction in a saga

Atomic unit within one participant's store, typically applying a step and recording outgoing event/next state. It does not include all other participants' stores.

### Saga step

A business operation in the workflow with inputs, success/failure meaning, retry and timeout rules, and possibly a compensation. Specify whether an uncertain outcome is safe to retry.

### Saga command

An instruction requesting a participant to perform an action. Give it a stable identity/correlation and make handling repeat-safe; command delivery is not proof of completion.

### Saga event

A fact/result indicating what a participant completed or observed. Events can be delayed, duplicated, or reordered; consumers need correlation, dedupe, and sequence/state validation.

### Saga choreography

Participants react to each other's events without one central workflow controller. It reduces central coordination for simple flows, but the overall path can become hard to discover, change, debug, and guard against cycles.

### Saga orchestration

A coordinator persists workflow decisions and sends commands to participants. It makes state and flow explicit, but introduces coordinator design/availability and can centralize domain logic if boundaries are poorly drawn.

### Saga orchestrator

The durable component that starts steps, records outcomes, applies timeout/retry/compensation rules, and resumes after restart. Avoid treating in-memory process state as workflow durability.

### Saga timeout

A deadline for a step/workflow response. Expiry indicates no timely response, not necessarily that the operation failed; reconcile or query before repeating unsafe work.

### Saga retry

Repeats a step under bounded conditions. Use stable command identity, idempotency/deduplication, backoff, attempt budget, and distinguish a transient error from a permanent business rejection.

### Compensable transaction

A committed step with a meaningful business action that can counteract its effect. The compensation may not restore the exact former state and may itself fail.

### Compensating transaction

A new operation intended to counteract one or more completed steps. It follows current business rules and concurrent state; it is not rollback of the original commit.

### Compensation action

The concrete domain-specific counteraction, such as releasing a reservation or refunding a payment. Define whether it is partial, fee-bearing, asynchronous, and idempotent.

### Compensation failure

Failure to complete a counteraction. Persist it, retry only when safe, alert, reconcile, and provide a manual path where automation cannot decide correctly.

### Pivot transaction

The transition point after which the workflow should move forward rather than compensate prior steps. It can represent the last compensable step or first retryable step depending on the saga design.

### Point of no return

A domain-specific threshold beyond which reversal is impossible or no longer sensible. Communicate its meaning and define forward-recovery behavior before crossing it.

### Retryable transaction after pivot

A post-pivot action designed to be safely retried until completion (within policy), often with idempotency. This is forward recovery, not rollback.

### Irreversible transaction

A committed effect that cannot be meaningfully undone, such as a legally required notification or physical shipment already dispatched. Plan sequencing and recovery around it.

### Saga cancellation

A request to stop future work. It must check current state and pivot, then either compensate eligible steps, finish required post-pivot work, or ask for a business decision.

### Saga correlation identifier

A stable identifier linking commands, events, logs, traces, and records to one workflow instance. It supports diagnosis but must not become an unbounded metrics label.

### Saga progress persistence

Durable recording of workflow state and step outcomes before relying on them for future decisions. Persist command/event identities and transition atomically with any outgoing message intent when possible.

### Saga recovery after restart

Loading persisted state, reconciling uncertain in-flight operations, and safely continuing, compensating, or escalating. A crash must not silently reset the workflow or duplicate irreversible effects.

### Compensation under concurrent updates

Counteracting earlier work while other actors may have changed related state. Use business rules and conditional operations; restoring a snapshot blindly can overwrite valid concurrent changes.

### Compensation order

The order in which compensations run. Reverse order is common for dependencies, but domain rules may allow parallel or different order; model dependencies explicitly.

### Manual intervention for failed compensation

A supported human decision/reconciliation path for high-impact cases. Provide a safe operator view, evidence, permissions, audit trail, and replay action rather than requiring ad-hoc database edits.

### Eventual consistency during saga execution

Participants can show intermediate state until the workflow reaches a terminal outcome. Specify freshness/visibility and ensure users do not mistake `Pending` or `Compensating` for final completion.

### Saga completion state

A terminal success state after all required steps finish. Record evidence and prevent late duplicate events from restarting or corrupting the completed workflow.

### Saga failure state

A terminal or escalated state when the business outcome cannot automatically complete/compensate. It should include cause, completed steps, remaining actions, and an operator/customer resolution path.

## Cross-item comparison

Choreography distributes transition logic; orchestration centralizes explicit workflow state. A compensable step has a counteraction; an irreversible step does not. A pivot marks a strategy change: before it, compensation may apply; after it, retryable forward completion may be required.

## Examples

For hotel booking: reserve flight, reserve room, capture payment. If room reservation fails before the pivot, release the flight hold. If capture is the pivot and shipment/notification follows, use durable retries or reconciliation for post-pivot actions. If refund itself fails, persist `CompensationPending` and expose an operator/customer path.

## Common mistakes

- Describing compensation as rollback or promising it restores the exact previous state.
- Keeping saga state only in memory.
- Treating timeout as proof that a remote participant did nothing.
- Retrying with new command IDs so duplicates evade dedupe.
- Starting irreversible work before defining the point of no return and forward recovery.
- Making a saga appear successful while compensation is still pending.

## Knowledge checks with answers

1. **What is a pivot?** A workflow point after which the chosen strategy usually shifts from compensation toward forward retries/completion.
2. **Does compensation have to run in reverse order?** No; dependencies and domain rules determine a safe order.
3. **What does a timeout prove?** Only that the expected response missed a deadline; the action's outcome can remain unknown.

### Exact terms covered

- `Saga pattern`
- `Saga participant`
- `Saga state`
- `Local transaction in a saga`
- `Saga step`
- `Saga command`
- `Saga event`
- `Saga choreography`
- `Saga orchestration`
- `Saga orchestrator`
- `Saga timeout`
- `Saga retry`
- `Compensable transaction`
- `Compensating transaction`
- `Compensation action`
- `Compensation failure`
- `Pivot transaction`
- `Point of no return`
- `Retryable transaction after pivot`
- `Irreversible transaction`
- `Saga cancellation`
- `Saga correlation identifier`
- `Saga progress persistence`
- `Saga recovery after restart`
- `Compensation under concurrent updates`
- `Compensation order`
- `Manual intervention for failed compensation`
- `Eventual consistency during saga execution`
- `Saga completion state`
- `Saga failure state`

### Exact terms covered

- `Saga pattern`
- `Saga participant`
- `Saga state`
- `Local transaction in a saga`
- `Saga step`
- `Saga command`
- `Saga event`
- `Saga choreography`
- `Saga orchestration`
- `Saga orchestrator`
- `Saga timeout`
- `Saga retry`
- `Compensable transaction`
- `Compensating transaction`
- `Compensation action`
- `Compensation failure`
- `Pivot transaction`
- `Point of no return`
- `Retryable transaction after pivot`
- `Irreversible transaction`
- `Saga cancellation`
- `Saga correlation identifier`
- `Saga progress persistence`
- `Saga recovery after restart`
- `Compensation under concurrent updates`
- `Compensation order`
- `Manual intervention for failed compensation`
- `Eventual consistency during saga execution`
- `Saga completion state`
- `Saga failure state`

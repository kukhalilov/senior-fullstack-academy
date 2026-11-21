# end-to-end system design case studies — Reference: Temporal workflow orchestration

Sources: [Temporal durable execution](https://docs.temporal.io/durable-execution), [Temporal workflow definitions](https://docs.temporal.io/workflows), [Temporal activities](https://docs.temporal.io/activities), [Temporal retries](https://docs.temporal.io/encyclopedia/retry-policies).

## Scope and version

Temporal is a workflow orchestration platform built around durable workflow history and replay. This lesson covers the architectural model and its guarantees; SDK APIs and deployment operations vary by language SDK and Temporal Cloud/self-hosted version. “Durable execution” does not mean arbitrary external side effects execute exactly once. Workflow code must be deterministic, and activity effects must be designed for retries and ambiguous outcomes.

## How this group fits the mental model

Use a workflow when a business process spans time, services, retries, timers, human decisions, or compensation and should resume after a worker or process failure. The workflow is the durable control plane: it records decisions and schedules work. Activities perform side effects such as charging a payment provider, sending an email, or updating a database. A worker can replay workflow history to reconstruct progress instead of keeping all state in process memory.

This differs from a simple queue consumer. A queue delivers messages; an orchestrator also tracks a multi-step process, timers, child workflows, signals, and completion state. It differs from a database transaction: a long-lived workflow cannot hold locks across minutes or days, and a multi-service process normally needs idempotency and compensating actions rather than one atomic commit.

## Supplied names explained

- **Temporal workflow**: deterministic orchestration logic whose progress is reconstructed from durable history.
- **Workflow history**: recorded events and decisions used to replay workflow state.
- **Activity**: a task that performs external or otherwise side-effecting work and may be retried.
- **Task queue**: the routing mechanism workers poll for workflow or activity tasks.
- **Durable timer and signal**: persisted time-based or externally delivered workflow input, subject to SDK semantics.

## Cross-item comparison

Compared with a message broker, a workflow engine persists multi-step process state, timers, and decisions rather than only delivering individual messages. Compared with a database transaction, it spans time and services without holding one atomic lock; use idempotent steps and compensations. Use a plain queue and database when that simpler model is sufficient.

## Examples

### Workflow history and determinism

Workflow code must make the same decisions when replayed against the recorded history. Time, random values, and external I/O therefore need deterministic SDK mechanisms or must be moved into activities. A workflow should not directly call a database, filesystem, HTTP endpoint, or non-deterministic library. A code change that alters command ordering can be incompatible with histories already in flight; use the SDK’s versioning or worker deployment guidance when evolving workflow definitions.

The service persists workflow events; workers poll task queues and execute workflow or activity tasks. If a worker disappears, another worker can continue from history. History size and replay cost grow with long-running workflows, so use continue-as-new or equivalent history management patterns where the SDK recommends them. Keep workflow state compact and store large payloads in an appropriate external store, passing references with security and retention controls.

## Activities, retries, and side effects

Activities may be retried after a timeout or worker failure. The external system might have completed the operation even when the activity did not receive the response. For a payment activity, pass a stable idempotency key to the payment provider or store an operation ID and outcome durably. If the provider lacks idempotency, design reconciliation and duplicate detection. A retry policy controls attempts and backoff; it cannot make an unsafe operation safe.

Set activity start-to-close, schedule-to-start, and heartbeat timeouts according to whether work is short, queue-bound, or long-running. Heartbeat long-running activities so the service can detect progress and resume where supported. Avoid infinite retry loops for permanent failures; classify retryable versus non-retryable errors, bound backoff, and send terminal failures to an operator or compensation path.

## Timers, signals, cancellation, and compensation

Timers are durable workflow decisions and can represent a delay without keeping a worker thread asleep. Signals let external actors deliver data or decisions to a running workflow; queries expose read-only workflow state subject to SDK semantics. Cancellation is cooperative: workflow code must propagate or handle it, and already completed external side effects are not automatically undone.

For a saga-like flow, record completed steps and define compensations where meaningful: for example, release a reservation if a later payment step fails. A compensation is a new business action, not a rollback of history, and it can also fail or need retry. Some effects (an email already delivered, a market trade) cannot be undone; represent their forward recovery explicitly.

### Example: order fulfillment

1. Start an order workflow with a unique order ID and request key.
2. Run an activity that reserves stock using a database uniqueness/conditional-update rule.
3. Charge payment with a stable provider idempotency key; classify the result as success, definitive failure, or unknown.
4. If payment succeeds, schedule fulfillment. If it definitively fails, release the reservation. If the result is unknown, query/reconcile the provider before retrying a charge.
5. If fulfillment does not complete before a durable timer, alert or route to manual recovery rather than silently restarting the whole process.

The workflow coordinates and remembers the steps; inventory and payment systems still enforce their own correctness invariants.

## Operational design

Monitor workflow-task and activity-task queue latency, schedule-to-start delay, activity failure and retry rates, timeouts, stuck executions, history growth, and service availability. Alert on business outcomes too: the orchestration service can be healthy while orders remain stuck because a downstream integration is failing. Use task-queue isolation and worker capacity controls to prevent one workload from starving unrelated processes. Protect workflow payloads because histories can persist sensitive data; apply retention, encryption, access control, and data-minimization policies.

## Common mistakes

- Putting side effects inside replayed workflow code.
- Treating activity retries as exactly-once execution.
- Retrying a timed-out payment without checking its idempotency key or outcome.
- Assuming cancellation undoes already completed effects.
- Changing workflow command order without considering open histories.
- Keeping large data blobs or secrets in durable histories indefinitely.
- Using a workflow engine for a short request that a normal synchronous transaction handles more simply.

## Knowledge checks with answers

1. **Why must workflow code be deterministic?** It may be replayed from recorded history to reconstruct state; non-deterministic decisions could diverge from that history.
2. **Can an activity run more than once?** Yes, particularly around failures and timeouts; its effects need idempotency, deduplication, or reconciliation.
3. **Does workflow cancellation reverse a charge?** No. The application needs an explicit refund or compensation action if that is valid.
4. **What is the workflow engine responsible for?** Durable orchestration state and scheduling; each external system remains responsible for its own domain invariants.

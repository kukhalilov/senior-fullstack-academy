# transactions distributed consistency saga outbox and inbox — Exercises and worked solutions

Sources: [Transactional Outbox for Cosmos DB](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos), [Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction), and [SQL Server transaction guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-locking-and-row-versioning-guide?view=sql-server-ver17).

## Goals

- Find crash windows in multi-resource writes.
- Design an outbox and inbox around real transaction boundaries.
- Build a saga that handles ambiguous outcomes, compensation failure, restart, and user-visible progress.
- Select isolation/concurrency protection for a local business invariant.
- Test failure/recovery paths, not only successful execution.

## Worked example

Checkout creates an order, reserves inventory, then authorizes payment. The order service writes `Pending` plus `CheckoutStarted` to its outbox in one local transaction. The relay sends the event with stable ID `checkout-81-started`. Inventory records that event in an inbox and creates a reservation in one transaction, then acknowledges. If acknowledgement is lost, redelivery hits the unique inbox key. The saga stores `InventoryReserved` and sends an idempotent payment command. A provider timeout is ambiguous: query by the stable provider idempotency key before retrying. On definitive decline, issue a release-reservation command. If release fails, persist `CompensationPending`, keep checkout visibly pending, retry within policy, and escalate if unresolved. Each transition has a correlation ID and alertable age.

## Exercises

1. **Crash-window inventory:** For DB commit then broker publish, and broker publish then DB commit, give one failure that leaves inconsistent state. Identify which pattern addresses each.
2. **Consumer ordering:** A handler updates a balance, then acknowledges a message, then crashes. What is safe? What if it acknowledges before the balance commit? Design the durable boundary.
3. **Isolation choice:** Two transactions both read inventory quantity 1, then each decrement and create a reservation. Name two mechanisms that could preserve nonnegative inventory and explain the relevant conflict.
4. **Saga design:** A trip books a flight, hotel, and rental car. Hotel is unavailable after the flight is confirmed. Define state, compensation, pivot (if any), and user-facing result.
5. **Ambiguous call:** Payment authorization times out after request submission. List safe next steps and unsafe assumptions.
6. **Outbox relay:** The broker accepts message M; the relay crashes before saving its checkpoint. What should happen on restart, and what makes it safe?
7. **Inbox retention:** The broker retains/replays messages for 14 days; disaster recovery may restore a consumer database from a 30-day-old snapshot. What should drive dedupe retention and restore procedure?
8. **Failure-injection plan:** Propose at least five fault points for a database/outbox/relay/consumer/saga workflow and the invariant to assert at each.

## Progressive hints

1. Consider failure immediately after each successful operation.
2. Compare acknowledgement with durable local commit order.
3. One can serialize or detect conflict; a constraint can enforce the invariant atomically.
4. A confirmed flight is already a committed effect; “undo” is a business action with airline rules.
5. Timeout says no response arrived, not whether provider acted.
6. If acceptance is uncertain, replay with the same event ID and dedupe downstream.
7. A restored consumer may forget dedupe keys for messages it will see again.
8. Place faults on both sides of each commit/ack/checkpoint boundary, then restart.

## Complete solutions

1. DB first: DB commits, then crash means no event. Broker first: event is accepted, then DB abort/crash means a false notification. An outbox stores business state and publish intent atomically for the first window; it also avoids publishing an event for an uncommitted local change. Relay duplicates are expected. A real supported distributed transaction can address simultaneous commit if all participants and operational requirements permit it.
2. Commit effect then acknowledge: crash between them causes redelivery; an inbox unique key in the same transaction as the balance update makes that repeat a no-op. Acknowledge first: crash before balance commit can lose the effect. Therefore record message identity and apply balance update atomically, commit, then acknowledge.
3. An atomic conditional decrement (`UPDATE ... WHERE quantity > 0`, checking affected rows) or a database constraint/serialized reservation can prevent negative quantity. Optimistic version checking can detect competing writes and require recomputation. A lock/serializable transaction may also work, but exact behavior and throughput depend on the engine.
4. Persist one workflow ID and step status. If hotel failure is definitive before a pivot, cancel/release the flight reservation under its business contract and continue with `Compensating` then `Failed` or offer alternatives. If cancellation is nonrefundable or the flight has crossed an irreversible point, do not claim exact rollback; offer rebooking/refund rules or require user decision. Keep a pending state while compensation is unresolved.
5. Query provider by the same stable idempotency key or operation reference; retry only with the same key within its documented scope/retention; reconcile status; persist `AuthorizationUnknown/Pending`; do not issue a new key or say “declined” based solely on timeout. Escalate when evidence is unavailable beyond the policy deadline.
6. Restart may republish M with the same identity because broker acceptance and checkpoint were not atomic. Consumer dedupe/inbox (or broker dedupe within its documented scope) makes replay safe. Do not checkpoint past unconfirmed records; monitor repeated failures and backlog.
7. Retention must cover not just broker 14-day replay but the 30-day restore/replay path and any manual reprocessing horizon. A restore runbook may need to reconcile inbox state from backups/audit or pause replay until dedupe is rebuilt. Purging at 14 days would be unsafe if an old snapshot forgets already-applied messages.
8. Examples: crash before business+outbox commit (neither exists); after commit before relay (intent remains); after broker acceptance before checkpoint (duplicate replay, no lost effect); consumer crash before inbox/effect commit (redelivery, effect not applied); after commit before ack (redelivery deduped); saga restart after a remote timeout (reconcile by key); compensation failure (persisted pending state and alert). Assert local invariants, stable identity, bounded duplicate effect, eventual visible terminal outcome, and no silent stuck workflow.

## Tests and edge cases

- Two relay workers race to claim one outbox record; verify the claim mechanism and intended ordering.
- Consumer receives the same ID concurrently; uniqueness must allow one local effect.
- Same payload with a new ID should not be silently deduped unless business identity says it is the same operation.
- A sequence gap should trigger query/buffer/repair, not an invalid state transition.
- Database restore may roll back inbox/outbox progress relative to an external broker; test the restore runbook.
- Cancellation, terminal business rejection, poison message, and compensation failure need distinct states.

## Reflection questions

- Which invariant is local, and which is allowed to converge asynchronously?
- What does each acknowledgement or confirmation actually prove?
- Which action is irreversible, and what evidence is required to retry it?
- How long can a workflow remain pending before intervention?
- Which specific metrics reveal data loss risk, duplicate load, backlog, or failed compensation?

# system design tradeoffs and decision methods — Reference: 2PC vs saga vs TCC

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Gray and Lamport, Consensus on Transaction Commit](https://arxiv.org/abs/cs/0408036), [Microsoft saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga), [.NET cloud-native distributed data patterns](https://learn.microsoft.com/en-us/dotnet/architecture/cloud-native/distributed-data), [Oracle TCC model](https://docs.oracle.com/en/database/oracle/transaction-manager-for-microservices/26.1/tmmdv/tcc-transaction-model.html).

## Scope and version

These are three different ways to coordinate work spanning resources. The choice depends on whether participants share a transaction manager/protocol, how long work takes, whether temporary reservations are acceptable, and what users see during failure.

## How this group fits the mental model

**Two-phase commit (2PC):** a coordinator asks participants to prepare and hold the ability to commit or abort; after votes, it records/announces a decision. Prepared participants may block if they cannot learn the decision after coordinator failure. It provides an atomic commit decision under its protocol assumptions, but needs compatible participants, durable logs, timeout/recovery procedures, and lock/resource management.

**Saga:** a sequence of local transactions, each committed by its service, with compensating actions for later failure. Intermediate states are visible and compensation is a new business action, not a magical rollback; it can fail and must be retried/observed. Orchestration centralizes workflow progression; choreography communicates through events and can make process state harder to see.

**Try-Confirm-Cancel (TCC):** participants expose a Try operation that reserves/holds resources, followed by Confirm to finalize or Cancel to release. Reservations reduce some compensation problems but consume capacity and expire/recover according to policy. Try/Confirm/Cancel must be idempotent and handle duplicate, delayed, or contradictory messages. TCC is not a universal standard with identical semantics across frameworks.

## Supplied names explained

All three require durable workflow state, correlation IDs, timeout handling, idempotent retries, observability, and operational recovery. They cannot reverse an irreversible external side effect simply by choosing a pattern.

## Cross-item comparison

| Situation | Candidate | Main cost/risk |
|---|---|---|
| Short database work across participants that support a common commit protocol | 2PC | Prepared resources and blocking recovery |
| Long-running business process with valid intermediate states | Saga | Compensation semantics, retries, visible partial progress |
| Resources can be reserved and later finalized or released | TCC | Holds/reservation expiry and idempotent finalization |

Use a local ACID transaction when the invariant fits one data boundary. For a .NET service updating its own SQL database and publishing an event, an outbox can atomically persist the local state and outgoing message; it does not create a distributed transaction across all consumers.

## Examples

An order workflow reserves inventory, authorizes payment, then creates shipment. With a saga, if shipment fails after payment authorization, issue domain-specific compensation (void/refund and release inventory), record progress, and make retries safe. With TCC, Try each reservation, then Confirm all; if one Try fails, Cancel successful reservations. With 2PC, participants prepare and retain resources until the coordinator's durable decision is learned. Simulate coordinator crash after prepare, duplicate Confirm, timeout with unknown outcome, and compensation failure.

## Common mistakes

- Calling saga compensation a rollback that restores the exact prior global state.
- Choosing 2PC for long-running work without considering locks, prepared state, and failure recovery.
- Forgetting that TCC Try holds capacity and that reservations need expiry/reconciliation.
- Treating one participant's timeout as proof its operation did not happen.
- Assuming an outbox alone makes a cross-service workflow atomic.

## Knowledge checks with answers

1. **Which pattern exposes intermediate committed states and uses compensating actions?** Saga.
2. **What do TCC phases do?** Try reserves, Confirm finalizes, Cancel releases.
3. **Why can classical 2PC block?** A prepared participant may be unable to decide commit/abort while the coordinator's decision is unavailable.

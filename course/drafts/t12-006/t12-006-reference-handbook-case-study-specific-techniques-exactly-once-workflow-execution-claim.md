# end-to-end system design case studies — Reference: Exactly-once workflow execution claim

Sources: [HLD Handbook](https://hld.handbook.academy/), [Apache Kafka design: delivery semantics](https://kafka.apache.org/41/design/design/), [Apache Kafka producer configuration](https://kafka.apache.org/43/configuration/producer-configs/), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson separates exactly-once processing guarantees from exactly-once external business effects. Kafka is used as a concrete example of a bounded transactional guarantee; workflow engines and external APIs have different contracts. The cited Kafka documentation is versioned; verify exact feature configuration and failure guarantees for the deployed release.

## How this group fits the mental model

“Exactly once” is incomplete unless it names the boundary: one message in a broker log, one processor state update, one output record, one database mutation, one email, or one payment. Networks and processes can fail after an effect commits but before its acknowledgement arrives. A retry is then necessary for availability, yet may repeat the effect. Durable orchestration can remember steps and retry them, but cannot make a separate external system participate in its transaction automatically.

For each side effect, define its identity and authority. Common patterns are an idempotency key recorded atomically with the mutation, an inbox/deduplication table, a transactional outbox for publishing committed changes, or a provider-supported idempotency token. If the destination cannot cooperate, reconciliation or compensating actions may be required; avoid promising strict exactly-once external effects.

## Supplied names explained

- **At-most-once delivery:** no duplicates, but a message/effect can be lost.
- **At-least-once delivery:** retry until success/acknowledgement, so duplicates are possible.
- **Effectively-once result:** duplicates may be delivered, but stable identity and deduplication make the business state behave as if one logical operation occurred.
- **Idempotent operation:** repeating the same request with the same logical identity does not apply the effect again; the system should return/recover the original outcome.
- **Transactional processing boundary:** state and progress/offset are committed atomically within the systems that share the transaction. The guarantee ends at that boundary.
- **Saga/reconciliation:** durable sequence of local transactions and compensations or repair steps used when one global atomic transaction is unavailable.
- **Outbox/inbox:** outbox atomically records a message with a local state change for later delivery; inbox records processed message IDs to deduplicate consumers.

## Cross-item comparison

| Mechanism | What it can guarantee | What remains outside |
| --- | --- | --- |
| Broker retry + consumer acknowledgement | Delivery under broker/client configuration | Duplicate processing after a crash between effect and acknowledgement |
| Broker transaction covering consumed offsets and produced records | Atomic visibility of processing results and offsets inside that broker’s supported scope | A payment API, email provider, or unrelated database unless it participates/cooperates |
| Database transaction plus inbox/idempotency record | One database mutation for a stable logical operation | Non-transactional downstream effects; those require an outbox/workflow |
| Provider idempotency key | Provider-specific deduplication of repeated requests within documented scope/retention | Other providers, key expiry, differing request bodies, or effects outside the provider |
| Reconciliation/saga | Detects and repairs cross-system partial outcomes over time | Does not make the sequence instantaneous or eliminate temporary inconsistency |

## Examples

A workflow charges a card, then marks an order paid. The provider captures the payment, but the worker crashes before recording success. On retry, call the provider with the same stable idempotency key and identical logical request, query status if needed, then persist the result and emit an order event through an outbox. If the provider has no idempotency/status lookup, represent the result as unknown and reconcile before charging again. A timeout is not proof that the provider did nothing.

Within Kafka, its documented transactional processing can atomically commit output records and consumed offsets for a Kafka-to-Kafka flow, with consumers configured to read committed data. That guarantee does not make a database write or payment inside the consumer atomic with Kafka. For a database sink, write the business mutation and consumed-message ID in one DB transaction; acknowledge/advance progress only after commit, and safely replay after crashes.

Define retention for idempotency keys at least as long as realistic retry/replay windows; scope them to tenant and operation; reject reuse with a different payload; persist the original response/outcome. Monitor duplicate rates, unknown outcomes, reconciliation backlog, idempotency conflicts, and compensation failures.

## Common mistakes

- Claiming exactly-once execution without naming the system boundary and failure model.
- Assuming a durable workflow engine makes external email/payment/API effects exactly once.
- Committing an external effect before storing its idempotency key/result, leaving a duplicate window.
- Treating timeout as failure and issuing a fresh logical request/key.
- Assuming Kafka broker transactions include a database or arbitrary side effect.
- Keeping deduplication records for less time than message replay or client retry can occur.
- Using an idempotency key for different payloads without rejecting or defining conflict behavior.
- Describing compensation as rollback; a saga compensation is a new action and can itself fail.
- Ignoring operator replay, backup restore, and disaster-recovery behavior when considering deduplication state.

## Knowledge checks with answers

1. **A payment provider charged the card but the response timed out. Should the workflow generate a new request ID and retry?** No. Reuse the same logical idempotency key or query the provider’s operation state before taking another charge action.
2. **Does Kafka exactly-once processing make an unrelated email send exactly once?** No. The Kafka transaction boundary does not include the email provider; use a durable outbox and provider idempotency where supported, or accept/reconcile duplicates.
3. **How can an at-least-once consumer create one database effect?** Atomically insert a unique message/operation ID and apply the state mutation in the same database transaction; duplicates detect the existing ID.
4. **What does a compensation guarantee?** It attempts a business-level corrective action; it is not a time-reversal or proof that the original external effect never happened.

## Review status

Kafka transaction/offset boundaries and external-system caveats are checked against Apache Kafka documentation; HTTP idempotent semantics against RFC 9110. This lesson remains pending full claim-by-claim audit and manifest omission check.

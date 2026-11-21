# system design foundations and infrastructure building blocks — Reference: Idempotency key

Sources: [IETF Idempotency-Key HTTP header Internet-Draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/), [RFC 9110 HTTP method idempotency](https://www.rfc-editor.org/rfc/rfc9110), [Microsoft idempotent API operations](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation).

## Scope and version

This lesson describes application-level idempotency keys for retryable commands. As of 2026-11-20, the IETF `Idempotency-Key` header document is an active Internet-Draft, not a published RFC; its syntax and recommendations may change. A service must publish its own key scope, retention, payload equivalence, and replay behavior. Idempotency is an application contract, not a property created merely by adding a header.

## How this group fits the mental model

Networks fail at awkward times. A client sends a payment request, the server commits it, and the response is lost. The client sees a timeout but cannot know whether the operation happened. Retrying with a new identity may charge twice. An idempotency key lets the server recognize a retry of the same logical command and return the stored outcome rather than perform the effect again.

## Supplied names explained

- `Idempotency key` — A client-generated identifier for one logical operation, stored by the server with enough request context and result state to recognize safe retries during a defined retention period.

## Key lifecycle and server algorithm

1. The client generates a high-entropy unique key for a new logical operation and persists/reuses it for retries of that operation. A distinct operation gets a new key.
2. The server scopes the key, commonly by authenticated principal/tenant plus operation or endpoint, and computes a request fingerprint over the semantically relevant fields.
3. In one durable coordination boundary, the server claims the key and starts or records the operation. A unique database constraint or equivalent atomic primitive prevents concurrent requests with the same scoped key from both executing.
4. The server records the outcome (or a stable operation reference) and response information before acknowledging success, according to the API’s durability contract.
5. A retry with the same key and equivalent request returns the prior outcome or current operation status. Reuse with a different request is rejected. A request arriving while the first is in progress gets a documented conflict/wait/status response.
6. The record expires only after a published retention window that accounts for client retry windows, delayed queues, disaster recovery, and duplicate-delivery risk.

The key and effect must be coordinated. If the server performs a payment and crashes before recording the idempotency result, a retry may repeat the payment. Use a database transaction/outbox or a downstream provider’s idempotency support where available. For effects across services, propagate a stable operation identity and design each boundary to deduplicate or reconcile.

## Idempotency is not exactly-once delivery

The network may deliver a request zero, one, or multiple times, and acknowledgments can be lost. Idempotency can make repeated requests converge to one logical result within the storage scope and retention period. It cannot guarantee that the request arrives, that the operation succeeds, or that external side effects are transactionally coupled to the key store.

HTTP defines some methods, including PUT and DELETE, as idempotent in intended effect, while POST is not generally idempotent by method semantics. Even an idempotent method can trigger non-idempotent side effects in a broken implementation. Conversely, an application can make a POST operation safely retryable through an idempotency-key contract. Method idempotency and key-based deduplication are related but distinct concepts.

## Scope, fingerprint, and response policy

The scope must prevent collisions across users and operations while ensuring that retries of the same command reach the same deduplication record. Include tenant/principal and operation identity in the database key or equivalent partition. Avoid trusting a client-supplied key as authorization.

Fingerprint the semantic command, not irrelevant transport details. For example, normalize field order in JSON and decide whether headers, API version, or selected defaults affect equivalence. A repeated key with different amount/recipient must not silently replay success for the first payment. Return a clear conflict/validation error and do not execute the altered command.

Choose whether to replay the full original status/body/headers or return a stable operation resource. Be careful replaying short-lived headers or sensitive data. For long-running work, return an operation ID and status endpoint; retries can then query the same operation instead of holding a request open.

## Concurrency, failure, and retention

Two identical requests can arrive concurrently before either completes. A check-then-insert sequence without atomic uniqueness is racy. Use an atomic insert/claim and define how the loser waits, receives a conflict, or polls operation status. The record needs a state machine such as `in_progress`, `succeeded`, `failed_retryable`, and `failed_terminal`, with transitions designed for crash recovery.

Decide whether failures are cached. A validation error before side effects may be safe to repeat after correction, but the same key with changed payload should generally be rejected. A transient failure after partial side effects may need reconciliation rather than blind re-execution. Retention expiry reopens duplicate risk: clients must not retry an old key after its guarantee expires unless the server can reconcile it.

## Cross-item comparison

| Mechanism | Protects against | Does not provide |
|---|---|---|
| Idempotency key | Duplicate execution of the same logical command within scoped storage/retention | Delivery, transactionality with unrelated systems, or infinite deduplication |
| HTTP method idempotency | Repeating the method has the same intended effect under its semantics | Correct deduplication of arbitrary implementation side effects |
| Database unique constraint | Concurrent duplicate records for a chosen key | Deduplication of an external side effect outside the transaction |
| Transactional outbox/inbox | Coordinated event publication or consumer deduplication around local DB state | Global exactly-once execution across arbitrary services |
| Retry with backoff | Better chance of eventual success under transient failures | Safety unless the operation is idempotent or has a stable key |

## Examples

A checkout client creates key `K` for one purchase and sends amount and cart ID. The server atomically inserts `(tenant, checkout, K, fingerprint, in_progress)`, creates the order and payment intent in a transaction/outbox, and stores a stable response reference. If the response is lost, the client resends `K`; the server returns the existing order/payment status. If the client accidentally uses `K` with a different amount, the fingerprint mismatch is rejected. The payment provider receives a corresponding stable idempotency key if its API supports one.

A request to start a video export returns an operation ID. Repeating the same key returns that operation ID and status rather than starting another export. The job queue uses the operation ID as a deduplication key, while workers remain idempotent because queue delivery and worker restarts can repeat work.

## Common mistakes

- Generating a new key for every retry, defeating deduplication.
- Reusing one key for different logical operations or payloads.
- Implementing deduplication as a non-atomic read-then-write check.
- Storing the key separately from the business effect without crash-safe coordination.
- Assuming a header gives exactly-once effects across databases and external providers.
- Scoping keys globally or too narrowly, causing collisions or missed retries.
- Expiring records before realistic client retry/replay windows end.
- Replaying sensitive or time-dependent response headers without review.
- Caching every failure even when the operation’s partial effect is uncertain.
- Treating idempotency keys as permission checks or authentication tokens.

## Knowledge checks with answers

1. **Should a client use the same key after a timeout?** Yes, when retrying the same logical command; use a new key for a distinct command.
2. **What if the same key arrives with a different amount?** Reject it as a conflicting reuse based on the stored fingerprint; do not silently replay or execute the altered command.
3. **Why is atomic insertion important?** Concurrent retries can both pass a separate existence check and execute unless one atomic uniqueness/claim step arbitrates them.
4. **Does an idempotency key make external payment plus local database update atomic?** No. Use provider idempotency, durable operation state, outbox/reconciliation, and explicit failure handling.
5. **What happens when the key record expires?** The deduplication guarantee may no longer apply; the API must document retention and clients must avoid unsafe retries beyond it.

## Practice

Design idempotency for a POST endpoint that reserves inventory and charges a card. Specify key scope, fingerprint fields, concurrent requests, transaction/outbox boundaries, payment-provider interaction, response replay, failed states, and retention.

**Suggested answer:** Scope by tenant/customer and operation; fingerprint SKU/quantity, price/currency, and other semantic inputs. Atomically claim the key under a unique constraint. In one local transaction create a pending reservation/payment operation and an outbox event; return or replay a stable operation ID/status. A worker sends the provider the same provider-supported idempotency identity, records the result, and finalizes inventory/order state idempotently. Same-key concurrent requests wait or receive a documented in-progress response; mismatched payload is rejected. Reconcile uncertain provider outcomes before retrying. Retain keys longer than the maximum client retry and queue replay window, and document expiry and sensitive response handling.

# end-to-end system design case studies — Reference: Mutual-match detection

Sources: [HLD Handbook](https://hld.handbook.academy/), [Stanford: Gale–Shapley and stable matching](https://web.stanford.edu/~alroth/papers/GaleandShapley.revised.IJGT.pdf), [PostgreSQL unique constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [Transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html).

## Scope and version

This case study designs reciprocal-interest matching—for example, two users independently express interest and the product creates a mutual match. It is not an algorithm for assigning a globally optimal or stable set of pairs. PostgreSQL documentation and the cited matching paper were checked on 2026-11-17; exact implementation details vary by product and database.

## How this group fits the mental model

The product rule is simple: user A likes user B, user B likes user A, and both actions are still valid, so create a match. The system problem is making that decision correctly when requests arrive concurrently, are retried, cross regions, or race with a block, unlike, account deletion, or moderation action.

Model the domain explicitly: an intent is directional (`A → B`), while a match is an unordered pair (`{A,B}`). The two directions have separate state and timestamps. A match is a derived domain state created when the reciprocal predicate becomes true under the product's current rules. Notifications are side effects of that state transition, not the match itself.

## Supplied names explained

- `Mutual-match detection` — Determines whether reciprocal, still-valid intent exists between two entities and creates a canonical pair record exactly once under concurrent and retried requests.

### Data model and write path

1. **Validate the command.** Authenticate the actor, validate the target, reject self-like or disallowed pairs, and check blocks, account state, eligibility, and applicable safety rules. Use server-derived identity and authorization.
2. **Store directional intent.** Persist `(actor_id, target_id, state, created_at, version)` under a uniqueness rule for the directed pair. A retry with the same idempotency key or same desired state should not create duplicate intent or duplicate events.
3. **Check reciprocity atomically enough for the chosen consistency model.** In one database transaction, lock or serialize the relevant pair/rows, write the intent, read the reverse intent, check blocks and validity, and insert a canonical unordered match if both directions qualify. A unique constraint on the canonical pair is a final guard against duplicate concurrent creation.
4. **Use a consistent pair key.** Store `low_id = min(A,B)` and `high_id = max(A,B)` (or another deterministic canonical encoding) for the unordered match. Keep direction in the intent table. Enforce `low_id < high_id` and uniqueness so `(A,B)` and `(B,A)` cannot become separate matches.
5. **Publish side effects with an outbox.** Insert a `MatchCreated` event into a transactional outbox in the same transaction as the match. A worker publishes it at least once; consumers deduplicate by event ID and make notifications idempotent. Do not send a push notification inside a transaction and assume rollback can retract it.
6. **Handle reversals explicitly.** Unlike, unmatch, block, report, and deletion need defined semantics. They may invalidate the match or hide it, but an already delivered notification cannot be recalled. Preserve an audit trail only as permitted by retention and privacy policy.
7. **Read through authorization.** Before returning a match or profile detail, re-evaluate current block, safety, privacy, and deletion state. A stale match row must not bypass a newly applied restriction.

## Concurrency and consistency

Consider nearly simultaneous likes: transaction T1 writes A→B and sees no B→A; T2 writes B→A and sees no A→B. If both commit without serialization, the reciprocal predicate becomes true but neither creates a match. Possible solutions include serializable transactions with retry, a lock that protects the canonical pair key (for example, a pre-existing lock row or transaction-scoped advisory lock), or a single-writer partition per pair. A unique constraint prevents duplicate pair rows but does not alone prevent a missed match. Under PostgreSQL Serializable, retry serialization failures and still handle possible unique violations; after writing intent, reliably re-check reciprocity or use reconciliation to repair missed pairs.

In a multi-region design, decide whether a user expects immediate global reciprocity. Asynchronous replication can delay the reverse like, so a local check may temporarily miss a valid match. Options include routing both directions for a pair to one authoritative region/partition, using a globally consistent database, or accepting delayed match creation with a reliable reconciliation event. Do not claim strong consistency from cross-region replicas without a database guarantee that provides it.

Enforce at-least-once delivery safely: client retries need idempotency; database constraints prevent duplicate rows; outbox events need stable IDs; notification workers need deduplication and provider-aware retry rules. A notification can fail after a match commits, so maintain notification status separately and retry without creating a second match.

## Cross-item comparison

This lesson has one assigned pattern, so no within-group comparison applies. Reciprocal-like detection is a local predicate over two directional intents. A **stable matching** problem is different: participants rank possible partners and an algorithm selects a set of pairs with no blocking pair under the preference model. Gale–Shapley deferred acceptance solves a defined stable matching problem; it is not required just to detect that two people liked one another.

Likewise, maximum-cardinality or maximum-weight bipartite matching optimizes a global assignment under a graph and objective. It may be useful for dispatching workers to jobs or assigning scarce appointments, but it can conflict with user choice and the independent-reciprocal rule. Choose the mechanism from the product semantics, not because all of them use the word “matching.”

## Examples

### Concurrent reciprocal actions

A likes B in one region while B likes A in another. Both are persisted as directed intent. If the database routes the pair to a single serializable partition, one transaction observes the other and creates canonical match `{A,B}`. If the system uses eventual replication, a reconciliation task detects the newly reciprocal pair later and creates the match idempotently. Telemetry distinguishes “not reciprocal” from “reciprocal but pending consistency repair.”

### Retry after client timeout

A sends a like, the server commits it, but the response is lost. A retries. The server uses the same idempotency key or uniqueness rule and returns the existing result. If the reverse intent already exists, it returns the existing match and emits no duplicate `MatchCreated` event. Notification delivery is retried separately using the event ID.

### Block races with match creation

A blocks B while a reciprocal like is being processed. Define the serialization point: either the block wins and prevents match creation, or a match commits first and the block then hides or invalidates it. Check blocks in the authoritative transaction or use a version/ordering mechanism that cannot silently ignore the block. Downstream notification and read paths must check the new restriction too.

## Common mistakes

- Storing an unordered like and losing who initiated interest.
- Allowing both `(A,B)` and `(B,A)` as separate match records.
- Relying on an application-level “check then insert” without a transaction or concurrency guard.
- Assuming a uniqueness constraint alone prevents missed matches under concurrent reciprocal writes.
- Sending notifications before the match transaction commits.
- Treating a network timeout as proof the like or match was not committed.
- Assuming eventual replication gives immediate reciprocal detection.
- Failing to define unlike, block, deletion, moderation, and notification semantics.
- Returning stale match/profile data after a user revokes consent or blocks another user.
- Calling mutual-interest detection a stable matching or optimization algorithm.

## Knowledge checks with answers

1. **Why store a directed like but an unordered match?** Direction matters for each user's intent; the resulting pair is symmetric and must have one canonical identity.
2. **Can a unique match constraint prevent every concurrency bug?** It prevents duplicate pair rows, but two transactions can both miss the other's uncommitted intent and create no match. Serialize, retry, or reconcile.
3. **Why use an outbox?** It atomically records the event with the database state, then allows at-least-once delivery without losing the match if the message broker is unavailable.
4. **Is reciprocal liking the stable-marriage problem?** No. Stable matching uses preference rankings and a global assignment criterion; mutual liking checks one pair's two directional intents.
5. **What should happen if the client retries after timeout?** Return the existing intent/match using idempotency and avoid duplicate state transitions or notifications.

## Practice

Design this flow with two active-active regions. Specify the canonical pair key, transaction/partition strategy, behavior under delayed replication, idempotency key, outbox event, block race, deletion policy, read authorization, and reconciliation metrics. Explain which consistency guarantees the database actually provides and what the user experiences during a cross-region delay.

## Review status

Reviewed 2026-11-21. PostgreSQL uniqueness, transaction isolation, and serialization-retry behavior were checked against current database documentation; the transactional outbox reference supports atomic event recording with at-least-once relay; Gale–Shapley source supports the distinction from stable assignment. Added a concrete warning that an absent row cannot be row-locked and that PostgreSQL Serializable may still raise unique violations. The lesson distinguishes directed intent from canonical pair state and includes block, deletion, retry, authorization, and cross-region cases. No material omissions remain in the supplied topic scope.

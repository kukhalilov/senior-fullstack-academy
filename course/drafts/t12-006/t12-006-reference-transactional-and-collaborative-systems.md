# end-to-end system design case studies — Reference: Transactions, collaboration, and ownership cases

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [EF Core transaction guidance](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).

## Scope and version

The eight supplied cases share a central challenge: multiple actors or systems compete to change durable state. The correct design depends on the invariant, not on a generic preference for SQL, NoSQL, queues, or microservices. Provider-specific APIs and isolation details vary; validate them in the chosen database or framework documentation.

## How this group fits the mental model

For each case, name the authoritative fact, its owner, and the invariant that must hold. Then decide where atomicity ends. A local database transaction can protect rows in one transactional resource, but it does not automatically include a payment provider, message broker, object store, or another service. Cross-boundary work needs durable intent, idempotent commands, retries, and reconciliation.

A timeout leaves the caller uncertain. A retry may be necessary, but must use a stable operation identity or a status query so duplicate delivery cannot create a second business effect. “Exactly once” is not an end-to-end guarantee supplied by a queue or network.

## Supplied names explained

- **Payment processing** — Model authorization, capture, settlement, refund, and reversal as distinct states. Persist an auditable ledger or equivalent immutable accounting events; define the invariant for balanced postings and prevent a retry from charging twice. Local intent and an external provider action cannot normally commit atomically, so reconcile provider status and reports. Keep payment credentials and sensitive data within the appropriately controlled boundary.
- **Ticket booking** — Separate browsing from the scarce-seat reservation write. Atomically claim inventory for a bounded hold, attach an expiry, and ensure a concurrent buyer cannot claim the same seat. Expiration must race safely with payment; late success needs a defined compensation/refund path. The seat map can be stale if the purchase API rechecks the invariant.
- **Hotel booking** — Inventory is a room type across a date interval, often with rate, cancellation, and occupancy rules. Use an authoritative reservation/availability model that prevents overlapping capacity from being oversold. External supplier systems may not share a transaction; use holds, idempotent updates, and reconciliation. Define time zone, local check-in date, and policy version explicitly.
- **Collaborative document editing** — Concurrent edits need an operation model that converges or a server-authoritative ordering/merge policy. Operational Transformation (OT) transforms operations against concurrent edits; CRDTs use data types and merge rules designed for convergence. Neither removes product decisions about delete conflicts, rich-text structure, cursor/presence, permissions, or version history. Persist operations/snapshots and define reconnect/replay limits.
- **File synchronization** — Separate content bytes from metadata such as path, version, ownership, and tombstone. Chunking and content hashes can reduce transfer or duplicate storage, but do not alone solve concurrent rename/edit, offline conflict, ACL changes, or deletion. Use version vectors or another explicit conflict signal; preserve a user-recoverable conflict copy when automatic merge is unsafe.
- **Distributed lock service** — A lease grants temporary coordination, not permanent ownership. Lease expiry does not stop a paused old process from resuming. Use fencing tokens or monotonically increasing generations and require the protected resource to reject stale writers. A lock service can itself be unavailable; design owner election, renewal, timeout, and recovery with the consistency semantics of that service.
- **Distributed scheduler** — Store schedules and execution state durably; workers claim due work with bounded leases or equivalent coordination. Handle clock skew, retries, missed schedules, duplicate delivery, cancellation, and long-running work. A job should have a stable identity and idempotent effect or explicit deduplication. Measure schedule lag and oldest due work, not just queue depth.
- **Notification service** — Persist an accepted request before acknowledging durable acceptance. Apply current user preferences, consent, quiet hours, deduplication, per-channel/provider quotas, and retries. Provider acceptance is not necessarily delivery; model statuses such as accepted, sent, delivered, bounced, or unknown only when evidence supports them. A timeout after provider submission may require provider lookup or duplicate-tolerant message IDs.

## Cross-item comparison

| Case | Critical invariant | Useful consistency boundary | Stale/async work that is usually acceptable |
|---|---|---|---|
| Payment | No duplicate charge; auditable balance and state | Ledger/command transaction plus idempotent provider workflow | Status projection, receipt email |
| Ticket | One active claim per seat/hold | Atomic inventory claim and expiry | Browse seat map |
| Hotel | Reserved date-range capacity remains within inventory | Reservation constraint or serialized inventory owner | Search availability display |
| Collaborative edit | Concurrent operations converge or have a declared winner | Server sequence or convergent operation model | Presence indicators |
| File sync | Correct version and access; no silent overwrite | Metadata/version update protocol | Thumbnail/index generation |
| Lock | Stale owner cannot write | Fencing enforced by protected resource | Lock dashboard |
| Scheduler | Each due job is recoverable and effects are deduplicated | Durable claim/state transition | Job listing projection |
| Notification | Consent/preferences respected; accepted work is trackable | Durable enqueue plus provider attempt record | Provider delivery status |

## Examples

**Reservation with delayed payment.** The reservation service places a 5-minute hold in an atomic inventory transaction and records a payment intent with a stable idempotency key. Payment succeeds at 4:59, but its webhook is delayed until after expiry. The hold-expiry worker and webhook handler race through a state transition that permits only one winner. If the payment succeeds after the hold is no longer valid, the system follows a documented refund or manual-review path. It never silently recreates a sold-out reservation.

**Collaborative edit after reconnect.** A client sends operations with document ID, actor, and sequence/version context. The server checks access, deduplicates operation IDs, applies the declared OT/CRDT or server ordering rules, and persists before acknowledging. On reconnect, the client requests operations after a known cursor or receives a fresh snapshot. Presence expires separately and cannot overwrite document content. Deletion and permission revocation invalidate subscriptions and derived copies.

## Failure drills

Test duplicate command, response lost after commit, provider timeout after success, lease holder pause past expiry, worker crash after claim, event replay, out-of-order webhook, late payment after hold expiry, offline edit conflict, partial file chunk upload, ACL revocation during sync, and restore from an old snapshot. For each, identify the winning state transition, user-visible response, deduplication key, alert, and recovery owner.

## Common mistakes

- Treating a client timeout as transaction rollback.
- Using a lock without fencing the protected write.
- Letting a cached availability view authorize a purchase.
- Expiring a reservation without coordinating late payment outcomes.
- Claiming exactly-once delivery without defining the boundary and deduplication mechanism.
- Using presence or client timestamps as the authority for document contents.
- Deleting a source while leaving accessible copies, chunks, or cached object URLs.
- Retrying notifications without stable provider/message identifiers or preference rechecks.

## Knowledge checks with answers

1. **What prevents a stale lock holder from writing after lease expiry?** A fencing generation checked by the protected resource; merely expiring the lock is insufficient.
2. **Can a database transaction include a remote payment provider?** Not as one ordinary local ACID transaction. Persist intent, use idempotent workflow steps, and reconcile.
3. **What can be stale in ticketing?** Browsing availability may be stale; the authoritative purchase path must recheck and atomically claim inventory.
4. **Does OT or a CRDT decide every editing conflict?** No. It provides an operation/merge strategy; product semantics, authorization, history, and rich-text behavior remain explicit.
5. **What does a queue acknowledgement prove?** Only the configured broker’s acceptance/acknowledgment contract, not that a downstream provider delivered the business effect.

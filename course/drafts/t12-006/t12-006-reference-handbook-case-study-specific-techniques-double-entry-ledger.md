# end-to-end system design case studies — Reference: Double-entry ledger

Sources: [HLD Handbook](https://hld.handbook.academy/), [PostgreSQL transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html), [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html), [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).

## Scope and version

This is a conceptual ledger design lesson; accounting rules and legal requirements vary by business and jurisdiction. PostgreSQL documentation illustrates transactional enforcement and concurrency behavior, not a recommendation that every ledger must use PostgreSQL. In a real financial system, involve accounting, compliance, and security specialists and verify the applicable rules.

## How this group fits the mental model

A ledger records value-changing facts so the system can explain where value came from and where it went. In double-entry bookkeeping, a posted transaction has balanced entries: total debits equal total credits within the relevant accounting context (for example, ledger, currency, and accounting rules). The ledger is the durable record; account balances and reports are derived views that can be recomputed or reconciled against entries.

The key product property is not merely storing positive and negative numbers. The complete posting must be accepted atomically, have a valid identity, obey the accounting model, and remain auditable. A failure halfway through a transfer must not leave only one side posted.

## Supplied names explained

- **Account:** a named place in the chart of accounts whose balance is computed according to account type and debit/credit conventions.
- **Journal transaction:** the logical event being posted, with one or more entries that balance within the defined scope.
- **Debit and credit:** the two sides of ledger entries. Their effect on an account depends on account classification; “debit always means decrease” is incorrect as a universal rule.
- **Posting:** the controlled transition that makes a transaction part of the authoritative ledger. A pending request or authorization is not necessarily a posted entry.
- **Idempotency key:** a stable request identifier used to ensure retries of the same logical operation do not create duplicate postings. Uniqueness scope, retention, and response replay behavior must be explicit.
- **Reversal/correction entry:** a new, linked entry that corrects an earlier posting while preserving the historical audit trail. Deleting or silently editing a posted record usually destroys auditability and may violate policy.
- **Reconciliation:** comparing independent representations or external records to identify missing, duplicated, or mismatched transactions; it is a control, not a substitute for correct posting.
- **Materialized balance:** a performance-oriented cached or incrementally maintained total. It must be updated consistently or rebuildable from the ledger and checked for drift.

## Cross-item comparison

| Representation | Role | Correctness requirement |
| --- | --- | --- |
| Immutable journal entries | Authoritative history of accepted postings | Each transaction’s entries balance; identities and ordering/audit metadata are preserved; corrections append linked entries |
| Account balance projection | Fast read of a current total | Update atomically with posting or rebuild/reconcile; prevent concurrent withdrawals from violating a balance or credit invariant |
| External payment-provider status | Evidence of an external step | It is not automatically the ledger posting; reconcile asynchronous callbacks, retries, reversals, and timeouts |

The journal and balance projection can be kept in one database transaction for a straightforward design. If projections are updated asynchronously, the API must communicate pending/lagging state and consumers must tolerate duplicate or delayed projection events. The outbox or event-delivery design must avoid losing the link between a committed posting and its notification.

## Examples

For a transfer of 25.00 units from account A to account B, create one logical transaction with a debit entry for A and a credit entry for B according to the ledger’s account conventions. Validate currency, account status, authorization, and any balance rule; enforce the posting and idempotency record atomically. The transaction commits both entries or neither. Return a durable operation reference so a caller can query the outcome if the response is lost.

Two concurrent withdrawals can both read the same available balance and each appear individually valid. Prevent this with an appropriate database invariant and concurrency strategy: conditional atomic update, row locking, serializable transaction with retry, or another proven method. A prior read followed by an unprotected write is not enough. PostgreSQL documents serializable execution as equivalent to some serial order for committed transactions, while transactions can be canceled with serialization failures that applications must handle by retrying the whole transaction safely.

If an external payment succeeds but the application times out before recording the result, do not assume failure and charge again blindly. Query provider state or retry with the provider’s idempotency mechanism, then post/reconcile exactly once according to the business workflow. Cross-service database transactions are generally unavailable, so model intermediate states and compensating/reconciliation actions explicitly.

## Common mistakes

- Updating only one side of a transaction or allowing unbalanced postings.
- Assuming a debit always lowers a balance or a credit always raises it without considering account type and accounting convention.
- Storing money in binary floating-point or mixing currencies without explicit scale, rounding, and conversion rules.
- Reading a balance and later writing a result without concurrency control, allowing simultaneous operations to overspend or violate limits.
- Treating an HTTP timeout as proof a transaction did not commit; retrying without idempotency can double-post.
- Editing or deleting posted entries rather than recording linked corrections and reasons.
- Calling an authorization, payment capture, ledger posting, and settlement the same event; they can be separate lifecycle steps.
- Maintaining cached balances with no rebuild, reconciliation, integrity constraints, or versioning.
- Claiming that a database transaction alone makes an external provider call atomic with local ledger changes.

## Knowledge checks with answers

1. **What invariant does double-entry posting enforce?** The relevant debits and credits balance under the defined journal/accounting context for each posted transaction; account type determines how each side affects balances.
2. **Both entries are written, then the response is lost. What should a retry do?** Reuse the operation’s idempotency identity or query its durable status; it should return the original result rather than create a second posting.
3. **Why are balances often stored if they are derivable?** To make reads efficient; they remain projections that need transactional maintenance or reliable rebuilding and reconciliation against journal entries.
4. **A serializable transaction aborts under contention. What is safe?** Retry the entire transaction from the beginning under a bounded policy, preserving the same logical operation identity; do not reuse partial results from the failed attempt.

## Review status

Concurrency and isolation claims are checked against PostgreSQL’s official documentation. This lesson remains pending a full claim-by-claim accounting and manifest omission audit; the referenced database behavior is illustrative and not universal.

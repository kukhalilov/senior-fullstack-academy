# architecture interviews tradeoffs requirements and constraints — Problem: Resolve a payment request whose response timed out

Sources: [AWS Builders’ Library: idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/), [Azure Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), [Azure API design best practices](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design)

## Goals

Practice payment idempotency key, ambiguous commit, ledger state, provider reconciliation under interview constraints.

## Worked example

An API receives a payment request. The provider may have charged the card, but the response timed out. Design safe retry, user-visible status, and reconciliation behavior.

Do not infer failure from the missing response. Give every logical payment attempt a stable idempotency key, persist the operation state, and query or reconcile the provider before creating another charge. Model authorized, captured, failed, and unknown outcomes explicitly; return a status resource while reconciliation continues. Never retry a new charge blindly.

## Exercises

1. The payment provider returned no response after receiving a charge request. Which facts are known, and which are still unknown?
2. Define the payment-attempt state machine and the stable identity used for retries.
3. A second client request arrives while reconciliation is pending. What response and side effects are safe?
4. Which records must reconcile between the service ledger and provider, and who handles an unresolved mismatch?

## Progressive hints

1. A transport timeout does not reveal whether the remote side committed.
2. Keep one logical operation separate from its network attempts; retain the provider's idempotency key for that operation.
3. Return a durable pending/status resource; do not start a new charge because the client repeated a request.
4. Reconciliation needs provider references, amount/currency, state, timestamps, and a controlled exception path.

## Complete solutions

1. The caller knows it did not receive a definitive response. The provider may have authorized or captured the payment, so the outcome is ambiguous until queried or reconciled.
2. Persist a payment attempt with a unique operation ID and provider idempotency key. Model pending/unknown and terminal outcomes explicitly. Reuse the same key for retries within the provider's documented scope and retention; do not assume all providers use identical rules.
3. Return the existing attempt's status (or an accepted/pending response) and avoid creating another logical charge. The client may poll or receive a later notification.
4. Reconcile provider transaction/reference, amount, currency, and final state against the internal ledger. Alert and route discrepancies to an auditable, authorized correction workflow; never silently edit financial history.

## Tests and edge cases

Test timeout before provider receipt, timeout after a successful capture, duplicate client submission, retry with the same key, provider key expiry, webhook duplication/out-of-order delivery, provider outage during reconciliation, and a ledger/provider amount mismatch.

## Reflection questions

What provider contract controls safe retries? Which state must remain visible to the customer while the outcome is unknown?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?

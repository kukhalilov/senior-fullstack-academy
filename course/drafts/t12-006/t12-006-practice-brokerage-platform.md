# end-to-end system design case studies — Problem: Design a retail brokerage platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice order lifecycle, market-data fan-out, ledger/tax lots, and auditability; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design trading for retail users with order submission, streaming quotes, portfolio views, fractional shares, and regulatory records.

**Worked design.** Separate market-data distribution from order authority. Validate eligibility, buying power, and order parameters before accepting an order with a stable ID and state machine. Route execution to providers and reconcile fills, cancels, and partial outcomes. Portfolio and tax-lot projections are derived but must reconcile to authoritative transactions. Quote fan-out is high volume and time-sensitive; label freshness and avoid presenting stale values as executable prices. Retain auditable records and tightly control financial data.

## Exercises

1. Write the top functional requirements and the quality objective that most changes the architecture.
2. Estimate demand, storage growth, and the likely hot key or constrained resource. State assumptions.
3. Define authoritative data, identifiers, API behavior, and transaction boundary.
4. Trace a write and a read, including a timeout or duplicate request.
5. Describe one scaling change and its consistency, cost, and operational tradeoffs.

## Progressive hints

Start with the invariant and user-visible outcome. Separate write and read paths. Identify a simpler baseline before adding distributed components. Make one failure case concrete.

## Complete solutions

1. Prioritize user-visible correctness and measurable latency, availability, freshness, durability, or cost for the relevant path.
2. Use ranges for traffic and growth. Identify skew and fan-out rather than assuming uniform keys. Validate the sensitive estimate with a representative benchmark.
3. Name one authoritative owner for each critical fact. Specify idempotency and compatibility when callers may retry or remain old.
4. Treat missing acknowledgements as unknown outcomes. Retry only with idempotency or verify state; make asynchronous effects deduplicable.
5. Add replication, caching, partitioning, or queueing only to meet a stated need; explain the operations burden and recovery plan.

### Case-specific design answer

Separate market-data distribution from order authority. Validate eligibility, buying power, and order parameters before accepting an order with a stable ID and state machine. Route execution to providers and reconcile fills, cancels, and partial outcomes. Portfolio and tax-lot projections are derived but must reconcile to authoritative transactions. Quote fan-out is high volume and time-sensitive; label freshness and avoid presenting stale values as executable prices. Retain auditable records and tightly control financial data.

## Tests and edge cases

Test duplicate order submit, partial fill, cancel/fill race, stale quote, reconciliation mismatch, and provider outage.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

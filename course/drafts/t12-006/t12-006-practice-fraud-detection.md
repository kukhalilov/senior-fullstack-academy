# end-to-end system design case studies — Problem: Design a real-time fraud detection system

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice feature freshness, rules/model cascade, decision latency, and analyst feedback; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design transaction scoring that can block or challenge suspicious activity under a strict response deadline.

**Worked design.** Define the business loss function and false-positive cost. Apply deterministic high-confidence rules first, then retrieve fresh online features and invoke a model within a bounded latency budget. Keep online/offline feature definitions aligned and versioned. A missing feature store or model should trigger a risk-specific fallback, not silently approve everything. Record decision reasons for audit and provide analyst review and appeals. Protect against feedback loops and adversarial adaptation; measure quality by cohort and latency alongside prevented loss.

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

Define the business loss function and false-positive cost. Apply deterministic high-confidence rules first, then retrieve fresh online features and invoke a model within a bounded latency budget. Keep online/offline feature definitions aligned and versioned. A missing feature store or model should trigger a risk-specific fallback, not silently approve everything. Record decision reasons for audit and provide analyst review and appeals. Protect against feedback loops and adversarial adaptation; measure quality by cohort and latency alongside prevented loss.

## Tests and edge cases

Test feature-store timeout, model version skew, duplicate transaction, false-positive appeal, adversarial pattern, and delayed label feedback.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

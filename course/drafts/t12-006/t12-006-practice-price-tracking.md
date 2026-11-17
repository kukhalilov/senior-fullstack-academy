# end-to-end system design case studies — Problem: Design a product price-tracking service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice polite data acquisition, change detection, retention, and subscriber alerts; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a service that monitors product prices over time and alerts subscribers when prices change or cross a target.

**Worked design.** Model watched URLs/products and fetch priority, enforce site terms and politeness limits, and avoid treating anti-bot evasion as the reliability plan. Normalize product identity and price with provenance and confidence. Store observations for history and detect changes with idempotent events. Queue alerts by user preference and deduplicate repeated changes. Prioritize popular watches fairly; expire invalid products. Monitor fetch success, freshness, false-change rate, and per-domain request rate.

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

Model watched URLs/products and fetch priority, enforce site terms and politeness limits, and avoid treating anti-bot evasion as the reliability plan. Normalize product identity and price with provenance and confidence. Store observations for history and detect changes with idempotent events. Queue alerts by user preference and deduplicate repeated changes. Prioritize popular watches fairly; expire invalid products. Monitor fetch success, freshness, false-change rate, and per-domain request rate.

## Tests and edge cases

Test changed page layout, currency conversion, duplicate fetch result, stale watch, alert storm, and domain throttle.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

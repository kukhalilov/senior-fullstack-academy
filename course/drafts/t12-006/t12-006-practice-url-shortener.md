# end-to-end system design case studies — Problem: Design a URL shortener

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice identifier generation, redirect latency, abuse controls, and analytics isolation; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a URL-shortening service that accepts destination URLs, returns short links, redirects reliably, supports expiration and abuse reporting, and measures usage without slowing redirects.

**Worked design.** Validate destination schemes and abuse policy. Generate an opaque code with collision handling or allocate a unique ID and encode it; persist the mapping and ownership/expiry. Keep redirect reads on a fast path with bounded caching and immediate invalidation when a link is disabled. Emit analytics asynchronously so they cannot delay redirects. Apply creation quotas and monitor redirect success separately from analytics lag.

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

Validate destination schemes and abuse policy. Generate an opaque code with collision handling or allocate a unique ID and encode it; persist the mapping and ownership/expiry. Keep redirect reads on a fast path with bounded caching and immediate invalidation when a link is disabled. Emit analytics asynchronously so they cannot delay redirects. Apply creation quotas and monitor redirect success separately from analytics lag.

## Tests and edge cases

Test code collision, expiration, disabled-link cache invalidation, unsafe schemes, hot links, and analytics broker outage.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

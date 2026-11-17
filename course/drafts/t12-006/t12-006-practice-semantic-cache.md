# end-to-end system design case studies — Problem: Design a semantic cache for AI requests

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice similarity thresholds, tenant isolation, invalidation, and false reuse cost; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a cache that may reuse a prior model answer for semantically similar prompts to reduce cost and latency.

**Worked design.** Only cache responses whose semantics permit reuse. Normalize inputs, embed/query within a measured threshold, and include tenant, authorization scope, model/prompt version, locale, and relevant context version in the cache key. A false-positive match can return incorrect or private data, so threshold calibration must weight harm as well as hit rate. Invalidate on source or policy change and use short TTLs when freshness is uncertain. Measure quality regression and privacy leakage alongside cost savings.

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

Only cache responses whose semantics permit reuse. Normalize inputs, embed/query within a measured threshold, and include tenant, authorization scope, model/prompt version, locale, and relevant context version in the cache key. A false-positive match can return incorrect or private data, so threshold calibration must weight harm as well as hit rate. Invalidate on source or policy change and use short TTLs when freshness is uncertain. Measure quality regression and privacy leakage alongside cost savings.

## Tests and edge cases

Test near-match but different intent, cross-tenant similarity, updated source, policy version change, and cache poisoning.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

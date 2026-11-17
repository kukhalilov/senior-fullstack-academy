# end-to-end system design case studies — Problem: Design a distributed web crawler

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice frontier scheduling, politeness, deduplication, and robots policy; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a crawler that discovers pages at large scale while respecting host limits, robots policy, and recrawl priorities.

**Worked design.** Maintain a durable URL frontier with normalized URL identity, per-host scheduling, and bounded leases. Workers fetch under concurrency/rate limits and recheck robots and policy before request. Deduplicate URLs and content using exact keys plus probabilistic filters only as an optimization; a Bloom-filter false positive must not silently become correctness policy where missing a page is unacceptable. Store fetch status, retry/backoff, canonicalization, and crawl timestamps. Separate fetch, parse, and indexing stages and cap untrusted response size and redirects.

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

Maintain a durable URL frontier with normalized URL identity, per-host scheduling, and bounded leases. Workers fetch under concurrency/rate limits and recheck robots and policy before request. Deduplicate URLs and content using exact keys plus probabilistic filters only as an optimization; a Bloom-filter false positive must not silently become correctness policy where missing a page is unacceptable. Store fetch status, retry/backoff, canonicalization, and crawl timestamps. Separate fetch, parse, and indexing stages and cap untrusted response size and redirects.

## Tests and edge cases

Test URL normalization, redirect loops, host politeness, robots changes, duplicate content, worker crash, and malicious oversized pages.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

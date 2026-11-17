# end-to-end system design case studies — Problem: Design a web-scale search engine

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice crawl/index pipelines, inverted indexes, ranking, freshness, and query serving; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design search over a large document corpus with ranked results, low query latency, and frequent content updates.

**Worked design.** Separate crawling, parsing, deduplication, indexing, and query serving. Build sharded inverted indexes and support incremental updates while retaining a consistent index generation. Query fan-out gathers shard results, merges scores, and applies reranking within latency budget. Ranking combines lexical relevance, freshness, quality, and policy; evaluate offline and online. Cache common queries carefully and protect against abuse. Monitor index freshness, shard tail latency, zero-result rate, and ranking quality by cohort.

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

Separate crawling, parsing, deduplication, indexing, and query serving. Build sharded inverted indexes and support incremental updates while retaining a consistent index generation. Query fan-out gathers shard results, merges scores, and applies reranking within latency budget. Ranking combines lexical relevance, freshness, quality, and policy; evaluate offline and online. Cache common queries carefully and protect against abuse. Monitor index freshness, shard tail latency, zero-result rate, and ranking quality by cohort.

## Tests and edge cases

Test shard loss, duplicate/canonical URLs, stale deleted page, adversarial SEO, rare query, and index rebuild.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

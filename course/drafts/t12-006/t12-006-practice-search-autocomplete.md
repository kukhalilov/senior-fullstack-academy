# end-to-end system design case studies — Problem: Design search autocomplete

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice prefix retrieval, top-K ranking, freshness, and keystroke request races; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design low-latency suggestions while users type, including popular queries, typo tolerance, trending terms, and keyboard selection.

**Worked design.** Define prefix/typing semantics, language normalization, privacy, and latency target. Build a prefix-oriented index or precompute top-K suggestions for popular prefixes; overlay recent trends with a bounded freshness window. Keep query input length and result count bounded. The UI debounces but also cancels or ignores stale responses; server limits protect against abusive request rates. Rank using measured relevance and safe popularity signals. Cache by normalized prefix and locale, and invalidate/update indexes asynchronously with a freshness objective.

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

Define prefix/typing semantics, language normalization, privacy, and latency target. Build a prefix-oriented index or precompute top-K suggestions for popular prefixes; overlay recent trends with a bounded freshness window. Keep query input length and result count bounded. The UI debounces but also cancels or ignores stale responses; server limits protect against abusive request rates. Rank using measured relevance and safe popularity signals. Cache by normalized prefix and locale, and invalidate/update indexes asynchronously with a freshness objective.

## Tests and edge cases

Test old response arriving after new query, empty input, Unicode normalization, typo, trending update, and abusive high-cardinality prefixes.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

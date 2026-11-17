# end-to-end system design case studies — Problem: Design a fitness tracking service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice GPS ingestion, activity processing, segment matching, leaderboards, and privacy; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design activity recording and sharing for runners and cyclists with route maps, segment rankings, and privacy zones.

**Worked design.** Accept resumable GPS samples with device sequence and timestamps; deduplicate and validate impossible jumps. Store raw activity under user-controlled privacy and derive simplified geometry, map matching, and segment efforts asynchronously. Segment matching can use spatial prefilters followed by precise path comparison. Leaderboards are derived and need correction/rebuild when activity is edited or flagged. Hide sensitive start/end regions and enforce sharing policy in exports and cached maps. Monitor processing lag and GPS quality.

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

Accept resumable GPS samples with device sequence and timestamps; deduplicate and validate impossible jumps. Store raw activity under user-controlled privacy and derive simplified geometry, map matching, and segment efforts asynchronously. Segment matching can use spatial prefilters followed by precise path comparison. Leaderboards are derived and need correction/rebuild when activity is edited or flagged. Hide sensitive start/end regions and enforce sharing policy in exports and cached maps. Monitor processing lag and GPS quality.

## Tests and edge cases

Test offline upload replay, GPS drift, duplicate points, privacy-zone export, activity deletion, and leaderboard correction.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

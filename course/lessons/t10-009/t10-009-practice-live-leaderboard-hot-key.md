# architecture interviews tradeoffs requirements and constraints — Problem: Design a live leaderboard without one hot key

Sources: [Redis leaderboard use case](https://redis.io/docs/latest/develop/use-cases/leaderboard/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/)

## Goals

Practice partitioned aggregation, approximate versus exact ranking, update frequency, read model freshness under interview constraints.

## Worked example

A global game leaderboard receives frequent score updates and millions of reads. Explain ingestion, ranking, hot-key control, consistency, and cost.

Separate score ingestion from ranking reads. A single global ranking key or aggregate can become a write bottleneck; confirm this with contention and load evidence. Partitioned ingestion can distribute writes, but exact global top-K or user rank then requires merging or coordination. Define ranking freshness and correctness first. A cache may reduce repeated reads but does not remove write contention.

## Exercises

1. Clarify whether ranks must be exact and globally current, or may be delayed/approximate; define tie-breaking and correction rules.
2. Identify which key or partition becomes hot on score writes and which query dominates reads.
3. Compare a single sorted-set leaderboard with partitioned aggregation and a merged read model.
4. Design handling for score corrections, duplicate events, and late arrivals.

## Progressive hints

1. Exactness, freshness, and global rank are separate requirements.
2. A read cache can reduce repeated reads but does not remove write contention on one aggregate.
3. Partitioning changes how global top-K or a user's global rank is computed.
4. Preserve an authoritative score/event record and make the ranking view rebuildable.

## Complete solutions

1. Ask product owners for the rank freshness target, tie behavior, correction policy, and whether approximate or regional boards are acceptable; these answers drive the design.
2. Inspect write rate and contention for a single board key or partition and read QPS for top-K/user-rank queries. Do not assert a hot key without measurement.
3. A single sorted set is simple and can efficiently answer ranking operations at appropriate scale; partitioning distributes ingestion but requires merging candidate top-K ranges and may make exact global rank more costly. Keep the source score events or canonical score as rebuild input.
4. Use stable event IDs/deduplication and sequence or version checks. Apply corrections as explicit updates, handle late events according to the scoring window, and rebuild or reconcile the derived ranking.

## Tests and edge cases

Load-test one unusually popular board and skewed score updates. Test ties, negative corrections, duplicate/late events, hot partitions, regional lag, top-K merge correctness, user-rank latency, and reconstruction from canonical data.

## Reflection questions

Which relaxed requirement would buy the largest reduction in write contention?


Which assumption could change your design? Which failure could cause an irreversible side effect? How will production evidence confirm the design meets its objective?

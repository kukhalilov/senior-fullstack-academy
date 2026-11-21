# end-to-end system design case studies — Reference: Approximate leaderboard rank

Sources: [HLD Handbook](https://hld.handbook.academy/), [Apache DataSketches KLL overview and paper](https://datasketches.apache.org/docs/pdf/Quantiles_KLL.pdf), [Google Cloud BigQuery sketches](https://docs.cloud.google.com/bigquery/docs/sketches), [Redis sorted sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/).

## Scope and version

This lesson compares exact rank queries with approximate rank/quantile summaries for large score populations. The cited Redis and BigQuery documentation illustrate specific implementations; their APIs and accuracy/capacity settings are product/version-dependent. Define the population, tie policy, freshness, and error guarantee before selecting a structure.

## How this group fits the mental model

A leaderboard needs to answer some combination of “what is my score?”, “who is ahead of me?”, and “show the top N.” These questions have different costs. Exact rank needs an ordered representation of scores and a consistent tie rule. At very large scale or for broad analytics, a streaming quantile/rank sketch can summarize a population in bounded memory, but it returns an estimate with an error contract—not an exact position.

Do not confuse rank estimation with distinct-count estimation: HyperLogLog estimates how many distinct values/items exist; it does not by itself tell where a score lies in an ordered distribution. A KLL quantile sketch is one family used to approximate quantiles/ranks, with a specified approximation model and probability guarantees depending on implementation.

## Supplied names explained

- **Exact rank:** position in a total ordering, requiring defined score direction and tie-breaker, such as score descending then stable user ID ascending.
- **Quantile:** a score threshold corresponding to a fraction of the population, such as the 99th percentile. It is related to rank but does not necessarily return every player’s exact position.
- **Approximate rank sketch:** compact summary that answers rank/quantile queries within a stated error bound, such as additive error proportional to stream size; confirm whether the guarantee is absolute rank error, relative error, or quantile-value error.
- **Top-N index:** ordered structure optimized for retrieving the highest scores; it may not efficiently provide exact global rank for every member depending on data model/partitioning.
- **Stable tie-breaker:** deterministic secondary ordering so equal scores have reproducible ranks and pagination.

## Cross-item comparison

| Method | Best fit | Cost and correctness |
| --- | --- | --- |
| Exact ordered index/sorted set | User expects exact current rank or top-N; population and write rate fit the ordered store | Inserts/score updates maintain order; global rank across shards can require coordination or merging; ties and snapshot/freshness semantics must be explicit |
| Periodic sorted snapshot | Rank can be slightly stale and recalculated in batches | Efficient reads between refreshes; must label snapshot time and handle updates that arrive during computation |
| Mergeable quantile/rank sketch (for example KLL) | Analytics over very large or streaming populations where a bounded error is acceptable | Uses a compact summary and can support approximate rank/quantile queries; estimate has an error guarantee and may not preserve exact individual ordering or top-N identity |
| Approximate distinct counter (for example HyperLogLog) | Counting distinct users/items | Solves a different problem; cannot substitute for score ordering/rank |

## Examples

For a competition with 100,000 active players, an exact sorted set can return a member’s rank and top entries if the score and tie-break policy are encoded consistently. If the leaderboard spans partitions, a local rank is not the global rank; the system must merge partition counts/orders or maintain a global index. If updates are frequent, serving exact rank may increase write coordination and storage cost.

For a global “what percentile am I in?” dashboard over hundreds of millions of historical scores, a quantile sketch may be suitable. Suppose a documented KLL setup guarantees rank error up to `εN`; with `N=100,000,000` and `ε=0.001`, the theoretical bound is 100,000 positions. That may be acceptable for a percentile band but not for an exact prize cutoff. Verify the specific implementation’s parameter meanings and probability of error, and avoid presenting an estimate as exact.

Define whether inactive users count, how deleted/cheating accounts are removed, whether scores are current or snapshot-based, how ties work, and how the UI explains “about top 2%” versus “rank 12,345.” For rewards or eligibility, use a deterministic authoritative rule and an auditable finalization snapshot.

## Common mistakes

- Using HyperLogLog or a distinct count as if it gave rank ordering.
- Saying “approximate within 1%” without specifying whether that is score, quantile, relative-rank, or additive-position error.
- Applying a sketch’s streaming error guarantee after merging, windowing, deletion, or filtering without checking that the operation is supported.
- Showing an approximate position as an exact integer rank in prize/legal decisions.
- Ignoring tie-breakers, snapshot age, inactive membership, duplicate score updates, or cross-shard rank merging.
- Assuming top-N membership and approximate percentile are the same query.
- Forgetting score corrections/deletions; many summaries are easier to update with append-only data and may require rebuilds for arbitrary retractions.

## Knowledge checks with answers

1. **Which structure estimates how many distinct users played, but not their score rank?** HyperLogLog is a distinct-cardinality estimator; it does not provide ordering.
2. **What must accompany an approximate rank in the API/UI?** Its population/snapshot time, tie and membership policy, and the precise error guarantee/interpretation.
3. **Is a rank error of `εN` suitable for a top-100 prize cutoff?** It may not be; with a large `N`, the position uncertainty can dwarf 100 places. Use exact or carefully audited cutoff logic for high-stakes awards.
4. **Why can a sharded exact index return a wrong global rank?** The member’s local position excludes scores in other partitions; global rank requires cross-partition counts/order or a global index.

## Review status

Reviewed 2026-11-21. Apache DataSketches documents KLL's mathematically bounded error in rank space, not a general bound on score-value error; the lesson distinguishes approximate rank/quantile from exact order and distinct counting. Redis sorted-set rank behavior and BigQuery sketch use were checked against their product documentation. Tie policy, population, freshness, and merge/shard semantics are correctly called out. No material factual corrections or missing core concepts were found.

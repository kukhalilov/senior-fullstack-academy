# end-to-end system design case studies — Reference: Top-K precomputation

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Redis sorted-set range queries](https://redis.io/docs/latest/commands/zrange/), [Redis leaderboard design](https://redis.io/docs/latest/develop/use-cases/leaderboard/), [Meta News Feed ranking architecture](https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/).

## Scope and version

This is a general design pattern for computing or storing a bounded ranked result ahead of a request. Redis is used as one illustrative retrieval mechanism; no storage product or ranking algorithm is required by the pattern.

## How this group fits the mental model

Given a candidate set, a score/order rule, and a requested result size `K`, top-K computation returns the first K items under that rule. If the same or similar request occurs often, a system may precompute a ranked list to move work from request time to a background/update path. That can reduce read latency and compute, but it trades away freshness or personalization unless those dimensions are included in the precomputation key and update policy.

Top-K is a result boundary, not a recommendation algorithm. The system still has to define candidate eligibility, score meaning, tie-breaking, authorization, diversity/business constraints, and what “current” means. If the list is used for autocomplete or a feed, a small fallback retrieval path may be required for uncommon prefixes, new content, or users without a precomputed segment.

## Supplied names explained

- `Top-K precomputation` — Materializes a bounded set of the highest-ranked candidates for a defined scope and freshness window, so a read can retrieve a prepared shortlist instead of scoring the full population.

## Choose the precomputation scope

Common keys include global, category, locale, tenant, time window, query prefix, user cohort, or a combination. More personalization can improve relevance but multiplies materialized lists, update traffic, storage, and invalidation complexity. A global top-K is cheap and reusable but can crowd out long-tail or user-specific results. Pick the least-specific scope that meets quality needs, then measure misses and fallback frequency.

There are two separate K values to reason about:

- `K_store`: how many items the background job retains for a scope.
- `K_return`: how many items a request returns after filtering, authorization, deduplication, and any final ranking.

Usually `K_store` must exceed `K_return` to leave room for filtering, but choosing the multiplier is workload-dependent. If the system filters after reading and the stored candidate list is too short, results may be sparse even when more eligible candidates exist below the cutoff.

## Update strategies and consistency

- **Periodic batch:** recompute on a schedule. Simple and efficient for slowly changing popularity, but stale between refreshes.
- **Incremental updates:** adjust scores and membership as events arrive. Fresher, but late, duplicated, or out-of-order events need idempotent update logic and reconciliation.
- **Hybrid:** maintain a stable precomputed base and merge a small real-time overlay at read time. This limits full recomputation while surfacing new or trending items; deduplicate and define how the overlay competes with the base ranking.

Version the ranking rule and materialized data together. A deployment should be able to distinguish old and new scores, backfill or atomically switch generations, and roll back if quality regresses. Monitor freshness lag, list completeness, score distribution, and offline/online ranking differences.

## Cross-item comparison

- **Compute on every request:** freshest and easiest to personalize, but may scan/score many candidates and increase p95/p99 latency and compute cost.
- **Precompute one global top-K:** fastest reuse and small state; weak personalization and long-tail coverage.
- **Precompute per segment:** better relevance while controlling fan-out; segment cardinality and update cost grow with segmentation.
- **Retrieve candidates then rank:** precompute or index a broad candidate set, then run a smaller request-time ranker. Meta describes a candidate-collection stage followed by ranking in its News Feed architecture; the exact implementation is product-specific.

For a simple scored leaderboard, a Redis sorted set can maintain members with scores and retrieve a reverse-ranked range. That answers a top-N query for the stored score order; it does not by itself implement personalized ranking, freshness policy, authorization, or multi-dimensional tie-breaking.

## Examples

For typeahead, a batch job stores the popular completions per normalized prefix and locale. A request reads more than the number it will display, filters unauthorized or retired entries, merges a small recent-trend overlay, deduplicates, and returns the requested K. A user who types a rare prefix falls back to prefix search rather than receiving an unrelated global top list. When the ranking model changes, build a new generation and switch the pointer only after checks pass.

## Common mistakes

- Calling popularity “relevance” without defining the score and eligible population.
- Precomputing too few candidates to survive request-time filtering.
- Allowing an old background job to overwrite results from a newer ranking generation.
- Forgetting deterministic tie-breaking and pagination.
- Ignoring cold-start items or long-tail prefixes.
- Measuring cache hit rate while missing relevance, freshness, or diversity regressions.

## Knowledge checks with answers

1. **What does `K` mean?** The number of ranked items returned or retained, but distinguish the stored shortlist size from the final response size.
2. **Why can a global top-K be wrong for an individual?** It optimizes one shared population and may not reflect that reader's eligibility, context, or preferences.
3. **How do you keep precomputation fresh without recomputing everything on every read?** Use periodic or incremental updates plus a bounded real-time overlay, and measure the lag and quality tradeoff.

# end-to-end system design case studies — Reference: Celebrity fan-out problem

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [Meta News Feed ranking architecture](https://engineering.fb.com/2021/01/26/ml-applications/news-feed-ranking/), [Meta TAO graph infrastructure](https://engineering.fb.com/2013/06/25/core-infra/tao-the-power-of-the-graph/).

## Scope and version

This is a provider-neutral feed design pattern. The Handbook calls out celebrity fan-out as a case-study technique; exact production architectures and thresholds are provider-specific and change over time.

## How this group fits the mental model

Fan-out decides when a post is copied into a reader's feed candidate set. It is a materialization choice that moves work between the write path and the read path; it does not determine the final ranking or visibility policy. A feed system still needs authorization, deletion, ranking, freshness, deduplication, and abuse rules.

Let `f(a)` be the number of followers of author `a`. Fan-out-on-write performs work proportional to recipients when author `a` publishes, then a reader can fetch from a prebuilt candidate list. Fan-out-on-read avoids writing to every follower at publish time, but a reader must fetch recent items from followed accounts and merge/rank them. These are workload models, not universal latency guarantees: caches, active users, ranking and filtering change the work.

## Supplied names explained

- `Celebrity fan-out problem` — An account with a very large follower set can make write-time feed materialization expensive and bursty. Hybrid fan-out usually pushes posts for ordinary accounts and pulls posts for selected high-fan-out accounts at read time, with a bounded merge. A celebrity threshold is a tunable routing policy, not a special property of an account; base it on measured fan-out cost, delivery objectives, and current capacity.

## Read and write paths

**Write path:** persist the post and its visibility metadata; emit a durable fan-out event; workers discover eligible followers and update their feed candidate lists or a partitioned inbox. Acknowledge the author after the product's chosen durability point, not necessarily after every follower has been updated. Make worker retries idempotent and tolerate delayed or duplicated fan-out events.

**Read path:** fetch precomputed candidates, obtain recent posts from followed high-fan-out accounts, apply current authorization/deletion checks, deduplicate, enrich and rank, then return a page with a stable cursor. The pull branch should have a bounded account/time window and a budget so a reader following many high-fan-out accounts cannot trigger unbounded reads.

## Cross-item comparison

- **Push for everyone:** cheap, predictable feed reads, but large accounts cause write amplification, queue backlogs, and broad tail-latency risk.
- **Pull for everyone:** avoids per-follower writes, but read cost grows with followed accounts and recent-candidate volume.
- **Hybrid:** places normal authors on push and high-fan-out or low-activity authors on pull. It limits the worst case but adds two data paths, merge logic, freshness differences, and operational thresholds.

Ranking is a downstream choice: systems can assemble candidates from multiple sources and then score them, as Meta's published News Feed architecture describes. Keep candidate generation and ranking separable so freshness, safety, and ranking models can evolve without changing ownership of the source post.

## Examples

An ordinary author with 300 followers publishes one post. A background worker adds its identifier to eligible followers' candidate feeds. A public account with 20 million followers is routed through the pull path instead of immediately creating 20 million writes. On a reader request, the service merges that account's recent posts with pushed candidates, checks visibility and deletion state, deduplicates, and ranks. If the celebrity pull source times out, the service applies an explicit partial-feed or fallback policy and records the omission; it does not silently claim that the feed is complete.

## Common mistakes

- Fan-out before checking privacy, blocks, mutes, deletion, and follow changes.
- Treating a follower-count threshold as permanent or globally optimal.
- Acknowledging a post only after an unbounded fan-out completes.
- Pulling every followed account without a candidate and latency budget.
- Using a stale materialized inbox as the authorization source of truth.
- Failing to monitor fan-out queue age, duplicate insertions, merge cost, and missing-post rate.

## Knowledge checks with answers

1. **Why do high-fan-out accounts strain push systems?** One post may trigger work proportional to a very large eligible follower set; asynchronous queues can buffer that work, but they do not remove it.
2. **Why not switch every author to pull?** It moves the cost to reads, where a request may need to fetch and merge candidates from many followed accounts.
3. **What must happen after candidates are merged?** Recheck current visibility and deletion rules, deduplicate, apply ranking/policy, and return pagination that remains valid as the feed changes.

# architecture interviews tradeoffs requirements and constraints — Core concepts and how they fit together

## Learning objectives

Turn a vague prompt into testable requirements, estimate order-of-magnitude load, trace one read and write, choose a simple baseline, identify failure behavior, and defend alternatives without claiming false precision.

## Prerequisites

Know basic HTTP APIs, databases, caching, queues, and deployment concepts. This lesson focuses on design reasoning rather than vendor-specific configuration. The [Google Cloud architecture framework](https://docs.cloud.google.com/architecture/framework) and [Google SRE book on service-level objectives](https://sre.google/sre-book/service-level-objectives/) provide production context for reliability decisions.

## Core concepts

**Requirements define success.** Functional requirements describe observable user capabilities. Quality requirements describe performance, availability, durability, consistency, privacy, and operating constraints under stated conditions. Translate vague words such as “fast” into a measurable target and workload. Separate essential scope from desirable features.

**Assumptions are design inputs.** Ask questions that could change the architecture: what is the primary user journey, what data is sensitive, what consistency is required, how large is peak load, and what does a failure cost? If the interviewer cannot answer, state a conservative assumption and keep the design adaptable.

**Estimates narrow the search space.** Convert usage assumptions into average and peak requests per second, concurrent work, bytes transferred, retained storage, and fan-out. Check units and order of magnitude. An estimate range is more honest than a precise unsupported number. Capacity headroom handles uncertainty; it does not replace load testing or production measurement.

**A design has an end-to-end path.** Identify entities and their owner, define the API contract, then draw the write path and read path. Identify the authoritative store for each data domain; a database, event log, or external system may own different facts. Derived caches, search indexes, and read models need freshness and rebuild rules. Caches, search indexes, and read models are derived views with freshness and invalidation rules. Queues and event streams decouple work, but add delivery, ordering, duplicate, and lag concerns.

**Scale follows a bottleneck.** Vertical scaling increases resources on one node; horizontal scaling adds nodes and requires routing, coordination, or partitioning. A read replica can offload reads but may be stale. Sharding distributes data and load but complicates transactions, queries, rebalancing, and hot-key handling. State the bottleneck before selecting one.

**Reliability needs bounded behavior.** Set deadlines and timeouts; retries need a retryable failure, bounded backoff, and idempotency where duplicate effects are possible. A circuit breaker stops repeated calls to an unhealthy dependency; a bulkhead limits resource exhaustion. Backpressure and rate limits protect the service when demand exceeds capacity. Graceful degradation preserves a useful subset of service.

**Consistency is a product decision.** Strong consistency may be required for balances or unique reservations; a feed or search index may tolerate lag. Eventual consistency must include a user-visible explanation and a repair path. Read-your-writes can be narrower than global strong consistency. Do not claim “exactly once” merely because a broker or handler retries.

## Mechanisms and relationships

For an illustrative workload of 2 million daily users making 20 requests each, average rate is about `2,000,000 × 20 / 86,400 ≈ 463 requests/second`. If peak-to-average is 5, a rough peak is 2,315 requests/second. This does not yet include fan-out, retries, background jobs, or regional distribution. If each request stores a 2 KB event and 40 million events arrive daily, raw growth is about 80 GB/day before indexes, replication, compression, and retention policy.

Start with one deployable application and a relational database when the product and team fit. A monolith-first baseline is a simplicity choice, not a rule against service decomposition. Add object storage for large blobs, a queue for work that may complete later, and a cache for a measured read bottleneck. Keep ownership and consistency explicit as the system evolves.

## Worked examples

**Prompt:** “Design notifications.” Clarify delivery channels, user preferences, urgency, and delivery guarantees. A write records a notification intent and an outbox entry in one database transaction. A worker publishes/dispatches it, tracks retries and provider outcomes, and avoids duplicate user-visible effects with an idempotency key. Reads use a paged inbox query. Push providers are external dependencies, so delivery is best-effort unless the product defines stronger guarantees.

**Prompt:** “Design a social feed.” Decide chronological or ranked, freshness needs, and audience size. A pull model reads followed users at request time; a push model precomputes recipient feeds; a hybrid treats unusually large fan-out separately. The tradeoff is write amplification, read latency, freshness, and hot users—not a universal “feed architecture.”

## Misconceptions and edge cases

- “Millions of users” does not say how many are active simultaneously or what peak load is.
- A read replica improves read capacity but can return stale data and does not make writes more available.
- A queue smooths bursts only when producers and consumers have compatible long-term throughput; backlog can grow without bound.
- Retries can amplify overload and duplicate non-idempotent actions.
- Multi-region deployment adds replication, failover, data residency, and operational complexity; it is not an automatic availability upgrade.
- A cache hit rate is not enough to justify a cache if invalidation, privacy, or correctness costs outweigh the saved work.
- RPO describes acceptable data loss measured in time; RTO describes target recovery duration. Neither is a promise unless tested.

## Knowledge checks with answers

1. **When should you add a queue?** When asynchronous decoupling or burst smoothing meets a requirement and consumers can manage retries, duplicates, lag, and dead letters.
2. **Why is a read replica not equivalent to sharding?** It copies data to serve reads; sharding partitions ownership/data and distributes read and write load.
3. **What should follow a rough capacity estimate?** Identify which assumption could change the design, then validate it with workload data or tests.
4. **What makes a retry safe?** Bounded retry policy plus idempotent effects or a deduplication mechanism for operations that may be repeated.

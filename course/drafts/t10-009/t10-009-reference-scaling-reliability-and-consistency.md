# architecture interviews tradeoffs requirements and constraints — Reference: Bottlenecks, data distribution, failure handling, and recovery

## Scope and version

This lesson covers system-design reasoning for load and failure. See [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/) and the [Google Cloud reliability framework](https://docs.cloud.google.com/architecture/framework/reliability).

## How this group fits the mental model

Scale increases the amount of work; reliability defines useful behavior when components fail. They interact, but adding replicas or regions also creates consistency and operational costs.

## Supplied names explained

- **Vertical scaling** — Give one node more resources; simple until hardware, cost, or single-node limits dominate.
- **Horizontal scaling** — Add nodes; requires distributing requests/state and handling coordination.
- **Stateless service** — Instance does not own irreplaceable session state; requests can route to any healthy instance, while durable state lives elsewhere.
- **Load balancing** — Routes requests among instances; health, affinity, fairness, and overload behavior matter.
- **Read replica** — Replicated database copy that can serve reads, often with replication lag; it usually does not increase write capacity.
- **Database partitioning** — Splits data by range, hash, tenant, or another key; affects locality and query/transaction patterns.
- **Sharding key** — Value used to assign records to shards; poor distribution creates hot partitions and painful rebalancing.
- **Hot partition** — Shard/partition receiving disproportionate traffic or data, limiting the cluster despite spare capacity elsewhere.
- **Cache invalidation** — Policy for expiring or updating derived data after source changes; correctness and stale windows must be stated.
- **Cache-aside** — Application reads cache, falls back to source, then populates cache; writes update source and invalidate/update cache by an explicit policy.
- **Write-through cache** — Cache writes are synchronously propagated to backing storage; semantics and failure handling depend on the implementation.
- **Queue-based load leveling** — Buffer work and process at a controlled rate; helps bursts, not sustained overload.
- **Backpressure** — Signal or policy that slows/rejects producers when consumers or resources cannot keep up.
- **Rate limiting** — Bounds requests per key, user, or resource to protect fairness and capacity; define rejection and retry behavior.
- **Bulkhead** — Isolates resource pools or concurrency so one dependency/tenant cannot consume all capacity.
- **Circuit breaker** — Stops calls to a failing dependency temporarily, then probes recovery; complements rather than replaces timeouts.
- **Timeout and retry** — Timeout bounds waiting; retry may recover transient failures but must be bounded, jittered, and safe against duplicate effects.
- **Idempotent request** — Repeating the operation has the same intended effect, often through an idempotency key and stored outcome.
- **At-least-once delivery** — Message is retried until acknowledgment under assumptions; duplicates are possible.
- **Duplicate processing** — Repeated handling of the same event; use idempotent consumers or deduplication with an appropriate retention period.
- **Eventual consistency** — Replicas or projections converge if updates stop; user-visible stale behavior and repair need definition.
- **Read-your-writes consistency** — A user can observe their own accepted write in later reads, possibly through routing or version tokens.
- **Strong consistency requirement** — Reads obey a specified latest-write ordering guarantee; define scope and availability tradeoff precisely.
- **Single point of failure** — One component whose failure disables a required capability with no adequate alternate path.
- **Zone redundancy** — Distribute instances/data across failure zones within a region; account for quorum and correlated dependencies.
- **Multi-region deployment** — Run in multiple geographic regions; define data replication, routing, failover, residency, and conflict behavior.
- **Failover** — Move service or traffic to a surviving component; test detection, promotion, fencing, and return to normal.
- **Recovery Point Objective (RPO)** — Maximum acceptable data loss measured as time before a disruption.
- **Recovery Time Objective (RTO)** — Target duration to restore a service after disruption.
- **Graceful degradation** — Preserve essential behavior while disabling or simplifying optional features.
- **Data loss risk** — Possibility acknowledged writes or derived state cannot be recovered; evaluate backups, replication, and replay.

## Cross-item comparison

Retries handle selected transient failures; a circuit breaker limits repeated calls during sustained failure. Rate limiting constrains incoming demand; backpressure communicates downstream capacity. A queue absorbs a bounded burst, while horizontal scaling raises processing capacity. Eventual consistency is not equivalent to data loss: it is a visibility delay with eventual convergence, whereas loss requires recovery or reconstruction.

## Examples

If a notification provider slows down, set a deadline, cap concurrent calls with a bulkhead, and queue retryable work with bounded backoff. Keep the user-facing transaction independent if the product permits delayed delivery. Track queue age and delivery success. If the queue grows faster than workers drain it, apply backpressure or shed nonessential work; adding retries without bounds may worsen the incident. For acknowledged durable notifications, define what the database/outbox and backups can recover, then state RPO and RTO targets.

## Common mistakes

- Retrying indefinitely or retrying non-idempotent side effects.
- Treating a replica as a backup or assuming replication protects against accidental deletion.
- Introducing sharding before measuring a single database bottleneck.
- Calling a design highly available without stating which failures it survives.
- Using “eventual consistency” without a freshness bound, user experience, or repair mechanism.
- Claiming multi-region failover is automatic when data ownership and conflict policy are undefined.

## Knowledge checks with answers

1. **What is the core difference between RPO and RTO?** RPO bounds acceptable data loss; RTO bounds restoration time.
2. **Why can retries create an outage?** They increase offered load during failure and may duplicate effects.
3. **Does a queue fix sustained overload?** No. If arrival rate remains higher than processing capacity, backlog grows.

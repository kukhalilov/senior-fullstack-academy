# ai and machine learning system design — Core concepts and how they fit together

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://platform.openai.com/docs/guides/production-best-practices), [reference 2](https://cloud.google.com/architecture/framework/ai-ml), [reference 3](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 4](https://owasp.org/www-project-api-security/).

## Learning objectives

After this lesson, you should be able to turn a product goal into constraints, model load, identify authoritative state, choose an appropriate consistency boundary, reason about partial failure, and defend a simple design with evidence.

## Prerequisites

Know HTTP request/response, relational transactions, async work, authentication versus authorization, and basic deployment. The existing programming, browser, database, security, and operations stages supply these foundations.

## Core concepts

### Requirements are executable design inputs

Separate functional behavior from quality attributes. Ask who uses the system, what must happen, what must never happen, and how success is measured. “Fast” needs an operation, boundary, percentile, workload, and time window. “Reliable” needs a good-event definition and recovery behavior. Rank requirements so the design has a reason to make tradeoffs.

### Workload reveals the shape of the problem

Estimate average and peak arrival rate, burst duration, concurrency, payload size, read/write ratio, fan-out, data growth, and retention. Use ranges when evidence is weak. A useful estimate exposes a bottleneck or rules out an option; false precision does neither. Validate with representative load and compare estimates with production.

### Correctness precedes optimization

Name the source of truth and transaction boundary. Decide which operations require atomicity, which reads may be stale, what ordering is required, and what duplicate work means. Then distinguish serving replicas and derived indexes from authoritative data. Every asynchronous path needs acknowledgement, retry, deduplication, and recovery rules.

### Networks create partial failure

A timeout means the caller did not learn the outcome; it does not prove that the remote operation failed. Calls need deadlines, bounded concurrency, cancellation, and selective retries. Retrying a non-idempotent operation can duplicate effects. A circuit breaker can limit calls to an unhealthy dependency, but cannot make that dependency healthy.

### Scaling is a capacity and ownership question

Vertical scaling increases resources for a node; horizontal scaling adds nodes and requires routing, shared or partitioned state, and failure-aware capacity. Caches reduce repeated work but introduce freshness; queues smooth bursts but can accumulate delay; sharding increases write capacity but creates key-selection and hot-partition concerns. Measure the constrained resource first.

### Reliability is behavior under defined faults

State what users see when a dependency, zone, region, or provider fails. Define error budgets and recovery targets, bound queues and retries, isolate optional work, and exercise restoration. Redundancy is meaningful only if remaining capacity, independent failure domains, and failover procedures meet the target.

## Mechanisms and relationships

A typical request crosses a browser or client, an edge or load-balancing layer, an application boundary, data stores, and possibly a broker or external provider. At each boundary ask: who authenticates and authorizes; what data crosses; what timeout/deadline applies; what is recorded; and whether a retry is safe. Distributed traces connect spans across services, while aggregate metrics reveal saturation and user-level error rates.

In .NET, propagate cancellation tokens through ASP.NET Core handlers, HttpClient, and database calls; use bounded worker concurrency and explicit transaction boundaries. EF Core transactions protect database work but do not atomically publish to an unrelated broker, which is why an outbox is useful. In React, the UI must represent loading, stale, empty, error, and retry states honestly; client cancellation cannot revoke a server-side side effect. SSR, hydration, caching, and API deployments must remain compatible during rolling releases.

## Worked examples

For a read-heavy catalog, begin with database indexes and query shape, measure cacheable traffic, then introduce a CDN or application cache with an explicit key and freshness policy. For a payment, prefer a durable idempotent command and ledger-like state transitions over blind retries. For a report, asynchronous processing is often appropriate if acceptance is durable and users can inspect status.

## Misconceptions and edge cases

- A replica is not automatically a backup; replication may copy corruption or deletion.
- “Exactly once” usually describes a bounded protocol guarantee, not end-to-end business effect across arbitrary services.
- Autoscaling has reaction delay and cannot compensate for an unbounded queue or exhausted database.
- Eventual consistency does not promise a particular maximum staleness.
- Multi-region increases availability only when data placement, conflict rules, routing, and recovery are tested.
- More services can increase independent deployment, but also increase coordination and operational load.

## Knowledge checks with answers

1. **A request timed out. Is it safe to retry?** Only when the operation is idempotent or the outcome can be verified with a stable operation key; timeout alone leaves the result unknown.
2. **Why add a cache?** To meet a measured latency/capacity need when a defined freshness and invalidation policy is acceptable.
3. **What makes a queue durable?** Its configured persistence/replication and acknowledgement contract, plus retention and tested consumer recovery; the word “queue” alone is not a guarantee.
4. **When split a service?** When independent ownership, scaling, security, or release needs outweigh network and operational costs.

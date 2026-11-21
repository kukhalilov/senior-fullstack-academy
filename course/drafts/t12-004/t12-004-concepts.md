# architecture patterns multi-region tenancy and reliability — Core concepts and how they fit together

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE book](https://sre.google/sre-book/table-of-contents/), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/), [NIST Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final), [OWASP API Security](https://owasp.org/www-project-api-security/), [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/), [AWS transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [React effect synchronization and request cleanup](https://react.dev/learn/synchronizing-with-effects), [architecture patterns handbook](https://hld.handbook.academy/curriculum/architecture-patterns/), [reliability and operations handbook](https://hld.handbook.academy/curriculum/reliability-and-operations/), [security at scale handbook](https://hld.handbook.academy/curriculum/security-at-scale/), [emerging patterns handbook](https://hld.handbook.academy/curriculum/emerging-patterns/), [NIST FIPS 203](https://csrc.nist.gov/pubs/fips/203/final), [NIST FIPS 204](https://csrc.nist.gov/pubs/fips/204/final).

## Learning objectives

After this lesson, you should be able to turn a product goal into constraints, model load, identify authoritative state, choose an appropriate consistency boundary, reason about partial failure, and defend a simple design with evidence.

## Prerequisites

Know HTTP request/response, relational transactions, async work, authentication versus authorization, and basic deployment. The existing programming, browser, database, security, and operations stages supply these foundations.

## Begin with the practical picture

Imagine a small application whose team can deploy it as one unit. As the product grows, separate teams may need to release parts independently, isolate sensitive data, or scale one busy feature without scaling everything. Splitting it into services can help, but every split adds calls that can fail, more deployments to operate, and more places where data may disagree.

Begin by drawing who owns each important rule and record, who changes each part, and what the user sees if a dependency is unavailable. Keep a boundary only when it gives a clear benefit in ownership, security, scaling, or release speed. Reliability and security are visible behaviors—such as what happens during an outage and who may access a tenant's data—not boxes to add at the end.

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

### Security and operations are part of the design

Protect a resource based on the caller, workload identity, data, and action—not merely on network location. Authenticate the subject and authorize each operation, including object-level and property-level access. Record enough telemetry to diagnose behavior, while preventing logs, traces, and metric labels from leaking secrets or creating high-cardinality cost. Treat architecture frameworks as structured prompts for trade-offs and improvement, not as universal pass/fail certifications.

## Mechanisms and relationships

A typical request crosses a browser or client, an edge or load-balancing layer, an application boundary, data stores, and possibly a broker or external provider. At each boundary ask: who authenticates and authorizes; what data crosses; what timeout/deadline applies; what is recorded; and whether a retry is safe. Distributed traces connect spans across services, while aggregate metrics reveal saturation and user-level error rates.

In .NET, propagate cancellation tokens through ASP.NET Core handlers, HttpClient, and database calls; use bounded worker concurrency and explicit transaction boundaries. EF Core transactions protect database work but do not atomically publish to an unrelated broker, which is why an outbox is useful. In React, the UI must represent loading, stale, empty, error, and retry states honestly; client cancellation cannot revoke a server-side side effect. SSR, hydration, caching, and API deployments must remain compatible during rolling releases.

An outbox places the domain change and event record in one database transaction; a separate publisher delivers the event. Delivery can still be repeated, so consumers need idempotency and, where the business requires it, ordering. On the client, aborting a fetch or ignoring an obsolete response prevents stale UI updates; it does not undo a request already accepted by the server. Traces describe an individual request path, metrics summarize behavior over a population, and logs record events; they answer complementary questions rather than replacing one another.

## A practical design loop

1. **State the user promise and constraints.** Capture key journeys, throughput and latency targets, data sensitivity, retention, jurisdictions, cost ceiling, and acceptable degradation. Separate hard constraints from preferences.
2. **Sketch the smallest correct path.** Name the component that owns each invariant and authoritative record. Keep synchronous steps limited to what is required to answer the request; move deferrable work to a durable queue or workflow.
3. **Estimate before selecting infrastructure.** For arrival rate `λ` requests/second and average service time `W` seconds, Little’s Law gives average in-flight work `L = λW` when the system is stable and measurements use compatible boundaries. For instance, 200 requests/second with a 0.25-second mean time implies about 50 requests in flight on average. This is not a capacity guarantee: bursts, tail latency, retries, and uneven partitioning still require headroom and load tests.
4. **Define consistency and failure behavior.** Mark atomic transactions, allowed staleness, ordering, duplicate handling, timeouts, retry limits, and recovery ownership. A timeout leaves the caller uncertain about a remote outcome; use idempotency keys or a status lookup before repeating effects.
5. **Choose boundaries for a reason.** A module or service boundary should improve ownership, release independence, scaling, or isolation enough to justify network calls, data synchronization, deployment, and on-call costs. Keep a modular monolith when it satisfies those needs.
6. **Plan for change and operations.** Version contracts, deploy compatible schema changes, use progressive delivery where useful, and instrument the user journey. Define alerts from user impact and test backups, restore, failover, and degraded modes.
7. **Revisit with evidence.** Compare observed load, failure modes, latency, cost, and team friction with assumptions. Change the design when evidence crosses an agreed threshold rather than optimizing based on fashion.

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
5. **What does `L = λW` help estimate?** Average in-flight work for a stable system at a defined boundary; it does not predict burst capacity or a tail-latency SLO by itself.
6. **What does the outbox guarantee?** Atomic persistence of the domain change and its event record in the same database transaction. It does not guarantee exactly-once delivery or exactly-once consumer effects.
7. **Does aborting a React fetch roll back the server operation?** No. It can stop or disregard client-side work, but the server may already have accepted and committed the operation.

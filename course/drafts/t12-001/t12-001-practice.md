# system design foundations and infrastructure building blocks — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/), [HLD Handbook prerequisites](https://hld.handbook.academy/curriculum/prerequisites/), [HLD Handbook building blocks](https://hld.handbook.academy/curriculum/building-blocks/), [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/).

Browser-path references: [MDN critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path), [MDN how browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work), [MDN navigation and resource timings](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Navigation_and_resource_timings), and [web.dev critical path](https://web.dev/learn/performance/understanding-the-critical-path).

Deployment references: [Azure Well-Architected safe deployments](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments), [Martin Fowler on parallel change](https://martinfowler.com/bliki/ParallelChange.html), and [EF Core migration deployment guidance](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying).

Correctness references: [AWS idempotency and retries](https://docs.aws.amazon.com/durable-execution/patterns/best-practices/idempotency/), [DynamoDB conditional writes and concurrent updates](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BestPractices_ImplementingVersionControl.html), and [S3 presigned upload URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html).

## Goals

Apply the topic's system model to a concrete workload, explain assumptions, and identify the correctness and operational questions that need answers.

## Worked example

Design a read-heavy product catalog from browser to database. State the cache key, freshness rule, failure behavior, and which response fields may be omitted when a dependency misses its deadline.

**Worked solution.** Keep product truth in the authoritative store. Cache public product reads by a normalized product/version key with bounded TTL and event-driven invalidation only if the product freshness target requires it. Do not cache personalized fields under a shared key. The API returns the core product even if recommendations time out; it propagates cancellation and records a dependency span. Images use immutable versioned URLs at the CDN. Validate with cold-cache peak tests and an origin outage drill.

## Worked workload estimate

Assume 2 million daily active users make 20 catalog reads each per day. That is 40 million reads/day, or about 463 average requests/second (`40,000,000 / 86,400`). If peak traffic is ten times the average, plan to investigate about 4,630 peak requests/second rather than designing only for 463. At a 95% cache hit rate, the database sees roughly 232 catalog misses/second at that peak, before retries, writes, background refreshes, or uneven hot-key traffic. If a typical API response is 10 KB, peak response traffic is roughly 46 MB/s (about 370 Mbit/s), excluding images and protocol overhead. If mean request latency at peak is 200 ms, Little's Law estimates about 926 requests in flight (`4,630 requests/s × 0.2 s`).

These are planning estimates, not capacity guarantees. Averages hide geography, flash sales, large tenants, retries, and correlated cache expiry. Measure real request distributions, response sizes, cache hit rate by key class, p95/p99 latency, and database saturation. Load-test cold cache and a single viral product separately. If the cache hit ratio falls, database load rises; if the origin slows, in-flight work and queueing grow. Define overload behavior and request limits before scaling components.

## Exercises

1. Restate the product goal as two functional requirements and three measurable quality objectives.
2. Estimate the average, peak, and burst workload. List the assumptions that most affect your estimate.
3. Identify authoritative data and one derived representation. State how the derived data is refreshed and reconciled.
4. Walk through a timeout after a write. What does the client know, and what key or query resolves ambiguity?
5. Remove one dependency from the design. Describe user-visible degradation and the telemetry that should detect it.
6. Explain which single measurement would justify the next scaling change.

## Progressive hints

Start with user behavior and invariants. Draw a baseline before adding components. Follow the write path and read path separately. Distinguish successful completion from durable acceptance and unknown outcome.

## Complete solutions

1. Functional requirements describe specific user actions and outcomes. Quality targets state boundary, workload, metric, threshold, and measurement window; they should be agreed with the product owner.
2. Use ranges and show the arithmetic. Include peak-to-average ratio, concurrency, payload, and retention; mark estimates that need measurement.
3. Name the component that owns the authoritative update. A derived store needs a delivery/rebuild policy and a freshness objective.
4. A timeout is ambiguous. Retry only with an idempotency key or verify the operation by a stable identifier before issuing a new effect.
5. Preserve critical behavior and degrade optional work. Emit dependency latency/error, request outcome, queue age where relevant, and trace context without high-cardinality sensitive fields.
6. Select evidence for the actual constraint, such as database saturation, tail latency, queue age, or cache miss cost. Scale the constrained component and retest.

### How to turn an exercise into a design

Write down the assumptions first, then answer in this order:

1. **Users and requirements:** who performs which action, what is required, and what is optional?
2. **Invariants and ownership:** which component is authoritative for each state transition, and what must never happen twice or be lost?
3. **Workload:** estimate average and peak requests, reads/writes, payload/retention, geographic distribution, and hot-key risk.
4. **Baseline:** draw one client, one API/service, one authoritative data store, and the request/response paths.
5. **Bottleneck and mechanism:** add a cache, queue, replica, shard, or edge layer only when the requirement or estimate justifies it; state the new failure mode it introduces.
6. **Failure and recovery:** walk through timeout-after-commit, dependency outage, duplicate delivery, overload, node/region loss, backup restore, and deployment rollback.
7. **Validation:** name the load test, fault test, metrics, and operational objective that would prove or disprove the design.

There is no single diagram that is correct for every workload. A good solution explains why each box exists, which data it owns, what it promises, and what the user sees when it fails.

## Tests and edge cases

Test duplicate requests, slow consumers, a full queue, stale cache, one node or zone unavailable, provider timeout after success, schema change during mixed-version rollout, unauthorized tenant ID, and recovery from backup.

## Reflection questions

Which assumption could invalidate the design? Which invariant would be hardest to recover after a partial failure? What evidence would make you remove a component rather than add another?

## Integrated interview drills

### Search suggestions arrive out of order

**Prompt.** A user types `cat`. Requests for `c`, `ca`, and `cat` overlap; the `ca` response arrives last. Explain how to prevent stale suggestions from replacing the current ones.

**Worked approach.** Debounce to reduce avoidable requests, cancel a prior request when supported, and always compare each response's query or monotonically increasing request sequence with the latest input before rendering it. Cancellation is an optimization, not the correctness guarantee: the server may already be working or the response may still race. Enforce a small result limit, rate-limit abusive clients, and keep private or personalized suggestions partitioned by authorization scope. The source of truth stays outside the suggestion index; define acceptable indexing lag and rebuild behavior. Measure keystroke-to-visible-result latency and stale-response discard rate.

**Check yourself.** What if the user deletes characters, changes account, or navigates away while the response is in flight? What data must not enter a shared cache key?

### Trace a browser navigation

**Prompt.** A user enters a URL and reports a blank page that later becomes interactive. Trace what you would inspect from the browser to the database and back.

**Worked approach.** First separate address-bar interpretation and possible local/service-worker/HTTP cache hits from network work. For a network path, use navigation timing to inspect DNS, connection/TLS, request, first response byte, and document completion; some phases may be absent or near zero because of connection reuse, caches, or protocol behavior. Inspect redirects, CDN/origin routing, server spans and downstream dependencies. In the browser, inspect HTML parsing, blocking resources, DOM/CSSOM, script execution, layout, paint, and long main-thread tasks. A blank page can result from a delayed HTML response, blocked critical CSS/script, runtime exception, or app shell waiting on an API; instrument each boundary rather than assuming the database is slow.

**Check yourself.** Which observation distinguishes a server delay from render-blocking CSS? Why might no fresh DNS or TLS phase appear in the timing entry?

### Roll out an incompatible schema change

**Prompt.** New code needs a non-null `normalized_name` column while old instances are still serving traffic. Propose a rollout that can be halted and rolled back safely.

**Worked approach.** Expand first: add a nullable column and any compatible index; deploy code that can read old and new representation and writes both when safe. Backfill in bounded, restartable batches while measuring database load. Validate completeness and data equivalence, then switch reads behind a controlled release. Keep old code compatible until the rollback window closes. Only then enforce constraints and remove the old field in a later contract phase. Canary by user/instance or traffic slice and define health abort criteria before rollout. A code rollback does not undo migrated data, so compatibility and forward repair matter; a parallel environment also needs a plan for writes and state synchronization.

**Check yourself.** What happens if backfill stops halfway? Can old code read rows written by new code? How will you avoid the migration itself overwhelming the primary database?

### Ticket hold and payment timeout

**Prompt.** Two users request the final seat. One payment provider times out after it may have accepted a charge.

**Worked approach.** Make seat allocation a single atomic conditional state transition with a unique reservation/seat invariant and an expiring hold. Do not keep a database transaction open during human checkout. Record a stable reservation and payment idempotency key before calling the provider. A timeout means unknown outcome: query/reconcile by provider reference or idempotency key, process provider webhooks idempotently, and do not issue a blind second charge. Define what happens if the hold expires while payment is uncertain; a late successful charge may require void/refund and a customer-visible resolution. Test concurrent final-seat requests, duplicate callbacks, delayed callbacks, and recovery after worker restart.

**Check yourself.** Which system owns seat state? Which transitions are conditional? What prevents a notification or cache from claiming a seat is sold before the authoritative write commits?

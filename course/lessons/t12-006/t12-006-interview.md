# end-to-end system design case studies — Interview questions and reasoning

Sources: [HLD Handbook case studies](https://hld.handbook.academy/curriculum/case-studies/), [HLD interview frameworks](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [Google SRE book](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [EF Core transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions).

## Core questions

A strong system-design interview is a collaborative reasoning exercise. It tests how you discover requirements, reason about constraints and failure, and communicate trade-offs, not whether you can recite a canonical diagram. Begin with questions that change architecture:

1. Which users and main actions are in scope? What is explicitly out of scope?
2. What correctness invariant must hold under concurrent requests?
3. What are peak traffic, burst shape, read/write ratio, data retention, and geographic distribution?
4. How fresh must each result be? Which data can be stale or rebuilt?
5. What latency/availability/recovery target matters to the user? What risk is unacceptable?
6. Which identity or tenant boundary protects each operation?
7. Does the feature need a model, stream, cache, queue, or specialized database, or can a simpler baseline meet the requirement?

State assumptions when a question cannot be answered in the interview. Estimate only enough to distinguish designs and reveal the likely bottleneck.

## Concise interview answers

**How do you structure a design?** Restate the task; list functional requirements and quality targets; estimate workload; identify entities, ownership, and invariants; draw the smallest correct read and write paths; then analyze scale, failures, security, observability, and evolution.

**What does a timeout mean?** The caller does not know whether the remote operation committed. Retry with the same idempotency identity or query durable status; do not issue a new unguarded side effect.

**When is a cache appropriate?** When it meets a measured latency or capacity need and the data tolerates a defined freshness/invalidation contract. Authorization and tenant scope must be represented in the key or rechecked before serving.

**When is asynchronous work appropriate?** When the user can accept durable queued completion rather than synchronous completion. Persist the intent before acknowledging acceptance; expose status, bound queue age, deduplicate retries, and define dead-letter/recovery ownership.

**How do you scale a database?** First measure query shape, indexes, connection pool, lock waits, and data growth. Then choose read replicas, partitioning, caching, or sharding only for the constrained path, stating staleness, ownership, rebalancing, and recovery consequences.

**How do you prove reliability?** Define a user-facing good event, SLI, SLO window, error budget, failure behavior, and tested restoration. Redundancy without enough surviving capacity or a tested recovery path is not proof.

## Deep follow-up answers

### Requirements and workload

Convert “fast” to a specific operation, boundary, percentile, workload, and measurement window. Convert “highly available” to a user-visible success definition and period. Estimate peak and burst QPS, concurrency, payload sizes, fan-out, retention, and growth. Show units and uncertainty; false precision is less useful than finding the variable that could change the architecture.

### State and consistency

For every important fact, name its authoritative owner and whether a read may be stale. Identify the transaction boundary, idempotency key, ordering scope, and reconciliation path. A cache, replica, index, or event projection is derived state; define how it is rebuilt and how deletes or access revocations reach it. Consistency is a product decision tied to each operation, not one global switch.

### Partial failure and retry

Trace crashes before commit, after commit but before response, during external side effects, and while a queue message is being acknowledged. Bound deadlines and retries, use exponential backoff with jitter where suitable, distinguish transient and permanent errors, and avoid retry storms. For effects that cannot be made atomic across systems, persist intent and reconcile participant state.

### Capacity, fairness, and bottlenecks

Estimate the constrained resource: CPU, memory, disk, network, database connections, hot partition, provider quota, or human review capacity. Include skew and failure headroom. Rate limits, admission control, queue limits, bulkheads, and fair scheduling protect shared resources. Horizontal scaling does not fix a saturated single-writer invariant unless the ownership/data model changes.

### Security and privacy

Authenticate the principal, then authorize each object/action at the owning boundary. Minimize data in caches, logs, traces, backups, and analytics. Threat-model untrusted input, SSRF, replay, credential exposure, tenant substitution, and provider access. A client UI rule or gateway-only check is not a substitute for resource authorization in the service.

### Observability and operation

Use metrics for aggregate rate/errors/latency/saturation and traces for causal path, with logs for redacted diagnostic events. Monitor user outcomes and freshness alongside infrastructure health. Assign ownership, runbooks, alert thresholds, backup/restore drills, and safe rollout/rollback procedures. Avoid high-cardinality labels that make telemetry itself fail.

## Scenario questions

- A database commit succeeded, but the response timed out. How does the client discover the outcome without creating a duplicate?
- The queue depth is low, yet work is delayed. Which oldest-item age, schedule lag, downstream latency, and trace evidence do you inspect?
- One tenant accounts for most traffic. How do quotas, fair scheduling, hot-key handling, and partition decisions protect other tenants?
- A new schema is deployed while old and new instances coexist. How do expand/contract migration, compatibility, and rollback work?
- A region accepts writes during a partition and later conflicts with another region. Which operations can merge and which require a single authority?
- A cache returns data after access is revoked. Which key dimensions, invalidation, and source-side authorization checks failed?
- A file upload finishes, but metadata commit fails. How are orphan objects identified, retried, and safely removed?
- A broker replays an event after a consumer already updated a projection. How does the handler deduplicate and how is the projection rebuilt?
- A model/provider fails during an AI request. Which safe fallback preserves privacy, quality, and tool authorization?
- A live video event causes a cold-cache burst. How do origin shielding, capacity, backpressure, and player QoE affect recovery?
- A celebrity post has millions of followers. Which work is moved to read time, and how do block/mute changes remain effective?
- A deployment doubles p99 latency without changing average throughput. How do queue wait, tail distribution, and dependency spans guide the diagnosis?

## Tradeoffs and alternatives

- **Fan-out-on-write vs fan-out-on-read:** write amplification and fresher reads vs cheaper publishing and more read-time merge work; hybridize for skew.
- **Strong reservation vs best-effort availability:** the inventory invariant may require serialization/conditional writes, while browse views can be stale.
- **At-most-once vs at-least-once delivery:** reduced duplicates vs possible loss; business effects usually need stable IDs and idempotent consumers.
- **Synchronous response vs durable asynchronous acceptance:** immediate result vs queue/status workflow; asynchronous acceptance must be durable and visible.
- **Object bytes vs metadata database:** optimize bulk storage separately while keeping ownership/version/deletion state authoritative.
- **Managed service vs self-hosting:** operational burden, control, compliance, cost, capacity, and provider dependency differ; compare the end-to-end service.
- **One region vs multi-region:** simpler consistency and operations vs lower regional latency and higher fault tolerance with conflict, routing, and recovery costs.
- **Cache vs fresh read:** compute and latency savings vs staleness, invalidation, and tenant-isolation complexity.

## Common weak answers

- Listing products and drawing boxes before establishing the invariant and request paths.
- Saying “use a cache/queue/microservices” without tying it to a measured need.
- Claiming exactly-once effects without explaining the boundary, dedupe key, and recovery.
- Treating timeout as failure or retrying a payment/write with a new operation ID.
- Scaling horizontally without considering shared state, hot partitions, or surviving capacity.
- Using availability, consistency, or “real time” without defining an observable contract.
- Ignoring access checks on cached, indexed, or asynchronous paths.
- Focusing on average latency while missing p95/p99 or queue age.
- Calling a backup or replicated copy a tested recovery plan.
- Ignoring rollout compatibility, alert ownership, or rollback.

## Self-check rubric

Score each dimension from 0 to 2: requirements and assumptions; workload estimate; entities and ownership; consistency/invariants; read/write paths; bottleneck reasoning; failure/recovery; security/privacy; observability/SLO; cost/trade-offs; evolution/rollback; concise communication. A strong answer scores at least 18/24, names uncertainty, and connects each major component to a requirement and measurable evidence.

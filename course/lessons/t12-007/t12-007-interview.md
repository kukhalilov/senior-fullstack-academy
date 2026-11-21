# system design technology landscape and selection — Interview questions and reasoning

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [PostgreSQL documentation](https://www.postgresql.org/docs/current/), [Kafka design](https://kafka.apache.org/design/), [gRPC concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [GraphQL introduction](https://graphql.org/learn/introduction/), [Spanner overview](https://cloud.google.com/spanner), [DynamoDB introduction](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [Vitess overview](https://vitess.io/docs/24.0/overview/whatisvitess/), [ScyllaDB modeling](https://docs.scylladb.com/stable/get-started/data-modeling/query-design.html), [transactional outbox pattern](https://microservices.io/patterns/data/transactional-outbox.html), [Google SRE cascading failures](https://sre.google/sre-book/addressing-cascading-failures/).

## Core questions

### A repeatable interview flow

Use a flexible sequence rather than memorizing one branded framework:

1. **Clarify the product promise.** Identify actors, critical user journeys, permissions, and what must never happen.
2. **Set measurable constraints.** State availability, latency percentiles, consistency, retention, privacy, recovery targets, and expected workload. Ask which requirements dominate.
3. **Estimate the workload.** Calculate rough reads/writes, peak factor, storage growth, bandwidth, and fan-out. Show arithmetic and label assumptions.
4. **Draw the simplest end-to-end path.** Include client, API, authoritative store, derived state, and asynchronous work only where needed.
5. **Explain contracts and ownership.** Name the source of truth, transaction boundary, API/message semantics, stale-data allowance, idempotency, and schema evolution.
6. **Stress it.** Follow timeout, duplicate, overload, hot partition, node/zone/region loss, deploy, restore, and abuse scenarios.
7. **Tune with evidence.** Add cache, queue, partition, replica, or region only when tied to a constraint; explain its new failure mode.
8. **Close clearly.** Summarize decisions, tradeoffs, unresolved risks, monitoring, and the next experiment.

The interviewer is listening for explicit reasoning, not a particular vendor name or diagram style.

### Core questions with strong answer patterns

### What user outcome and invariant does the system protect?

State a concrete promise and invariant. Example: “A seat may be reserved by at most one active booking. Browse results may be briefly stale, but the final reservation must be authoritative.” This tells the design where stronger coordination is required.

### What is the workload and likely bottleneck?

Estimate the request mix and peak, then identify expensive dimensions such as fan-out, payload, retention, hot keys, or expensive queries. Do not infer that database sharding is necessary from total user count alone. Compare the estimate to one constrained resource and state what production measurement would confirm it.

### Which data is authoritative and what can be rebuilt?

Identify the write authority for each invariant. A search index, cache, or analytics table is usually derived and needs a refresh/rebuild path. If a derived store is allowed to lag, state the freshness bound and user behavior when it is stale.

### What happens after a timeout or duplicate delivery?

Explain that the remote outcome may be unknown. Use a stable idempotency key, durable operation record, or status query; make consumers deduplicate repeated messages. A broker acknowledgement and a database commit are separate unless the design explicitly coordinates them.

### How do you handle overload?

Bound queues, concurrency, retries, and payload sizes. Apply admission control or shed optional work before the database is exhausted. Use deadlines and backoff with jitter; avoid retrying at every layer. Protect one tenant from starving others with quotas/fairness where required. Monitor saturation and queue age, not only queue length.

## Concise interview answers

Answer each prompt in one or two sentences first. State the invariant, mechanism, and its limit; expand into the failure path only after the short answer is clear.

## Deep follow-up answers

The analysis below expands the short answer into workload, ownership, failure, and operational consequences. Interviewers often probe one of these assumptions rather than ask for another product name.

## Scenario questions

### A database commit may have succeeded although the caller timed out. What is your protocol?

Return a stable operation identifier and accept an idempotency key. On retry, return the stored result instead of performing a second effect. If the outcome at an external payment processor is uncertain, reconcile by its operation reference before issuing another charge. Do not tell the user “failed” solely because the response timed out.

### Traffic grows tenfold, but one tenant drives it. How do you protect others?

Measure per-tenant request rate, resource cost, tail latency, and queue age with bounded metric dimensions; avoid tenant IDs as unbounded Prometheus labels. Use quota/fair scheduling or isolated capacity. Determine whether the hotspot is a key, query, tenant-specific burst, or shared dependency before partitioning. A single hot tenant may remain hot after adding shards if all its traffic maps to one key.

### The queue is healthy by depth but users report delayed work. What do you inspect?

Queue depth can stay flat while old messages are stuck or processing time grows. Inspect age of oldest message, enqueue-to-completion latency, consumer lag/throughput, retry count, poison-message/DLQ rate, and downstream spans. Trace a job from its original acceptance to completion; then distinguish slow consumers from a blocked dependency.

### A deployment changes API and schema while old instances remain. How do you sequence it?

Use expand-and-contract: add backward-compatible schema/API fields first, deploy readers that tolerate old and new shapes, then writers, backfill if needed, observe mixed-version behavior, and remove old fields only after all clients/instances have moved. Ensure rollback remains possible at each step. For events, version schema compatibly and keep old consumers working during the transition.

### Two regions accept conflicting writes. What do you do?

Classify the operation. Commutative updates may merge under a well-defined CRDT or merge function; noncommutative invariants such as inventory decrement may need one authority, reservation/escrow, or coordination. State the partition behavior, conflict rule, user-visible result, recovery process, and latency cost. “Eventually consistent” alone does not define a conflict policy.

### Users in several regions need reads under 100 ms and correct money transfers. What is the design?

Separate read locality from write correctness. Serve suitable catalog/profile reads from regional replicas or caches, with explicit staleness. Keep transfer posting in a transactional ledger/authority and return a pending or confirmed outcome based on that commit. Do not claim a global latency target for a coordination-heavy write unless measured across regions and failure modes.

## Tradeoffs and alternatives

### Questions that distinguish a strong answer

| Question | Strong reasoning | Weak shortcut |
|---|---|---|
| SQL or NoSQL? | Compare transaction/query invariants, access patterns, consistency, schema evolution, and operations | “NoSQL scales better” |
| Queue or event log? | Compare work ownership, independent consumers, replay, retention, ordering, and delivery/ack semantics | “Both send messages” |
| Cache or replica? | Compare recomputation/freshness, source authority, invalidation, and failover semantics | “Cache makes it fast” |
| Monolith or services? | Compare team boundaries, deploy/scale/security needs against network/on-call/data ownership costs | “Microservices are more scalable” |
| One region or multi-region? | Compare RTO/RPO, write conflicts, latency, data residency, failover capacity, and cost | “Multi-region is more reliable” |
| gRPC or GraphQL? | Compare caller types, contract shape, streaming, browser/gateway support, caching, and query control | “gRPC is faster” |

## Common weak answers

### How to repair them

- **“Use microservices, a cache, and a queue.”** Name which requirement each solves and remove any component without a measurable need.
- **“The request failed because it timed out.”** Say the outcome is unknown, then describe idempotency/status reconciliation.
- **“We can scale horizontally.”** Explain statelessness, partition key, state sharing, remaining capacity, and hot-key behavior.
- **“The system is available.”** Define a successful user action, measurement boundary, time window, and recovery target.
- **“Use exactly-once messages.”** State the actual broker/processor scope and how external side effects avoid duplicates.
- **“Add replicas for resilience.”** Explain failover detection, consistency after promotion, backup separation, and recovery tests.

## Self-check rubric

Score each 0–2: requirements and assumptions; workload estimate; data ownership and correctness; read/write path; failure and recovery; security/privacy/abuse; observability; cost and alternatives; communication. A strong answer scores 14–18 and ties every major component to a requirement. A polished diagram cannot compensate for a missing invariant or unknown-outcome path.

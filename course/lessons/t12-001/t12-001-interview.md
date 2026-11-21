# system design foundations and infrastructure building blocks — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [HLD Handbook prerequisites](https://hld.handbook.academy/curriculum/prerequisites/), [HLD Handbook building blocks](https://hld.handbook.academy/curriculum/building-blocks/), [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/).

Browser-path references: [MDN critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path), [MDN how browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work), [MDN navigation and resource timings](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Navigation_and_resource_timings), and [web.dev critical path](https://web.dev/learn/performance/understanding-the-critical-path).

Deployment references: [Azure Well-Architected safe deployments](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments), [Martin Fowler on parallel change](https://martinfowler.com/bliki/ParallelChange.html), and [EF Core migration deployment guidance](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying).

Correctness references: [AWS idempotency and retries](https://docs.aws.amazon.com/durable-execution/patterns/best-practices/idempotency/), [DynamoDB conditional writes and concurrent updates](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/BestPractices_ImplementingVersionControl.html), and [S3 presigned upload URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape: steady rate, peak, bursts, reads/writes, payload sizes, geographic distribution, and retention?
3. Which component owns each piece of data? Which copies may be stale, lost, or rebuilt?
4. What does a timeout mean when a remote operation may already have succeeded?
5. Where are security boundaries, tenant boundaries, and sensitive data enforced?
6. Which user-visible success measures, SLOs, and failure objectives prove that the design works?

## Concise interview answers

Start by clarifying the user journey and the operation that must never be violated. State assumptions and ask about scale, availability, consistency, privacy, and cost. Draw the simplest useful baseline. Walk one read and one write end to end, then add a component only when a measured bottleneck or requirement justifies it. Discuss hot keys, overload, partial failures, retries, data growth, recovery, observability, and migration. End with the main trade-offs and the evidence you would collect after launch.

## Scenario questions

### Design a URL shortener

Clarify custom aliases, expiration, analytics, abuse controls, and redirect latency. Writes allocate a unique short code and persist the mapping; use a uniqueness constraint or collision-retry strategy. Reads are latency-sensitive and highly cacheable, but the database remains authoritative. Keep click analytics asynchronous so the redirect path does not wait on a warehouse. Protect against hot viral links, malicious destinations, cache poisoning, and enumeration. State whether deleted/expired links return 404 or a tombstone response.

### Design a rate limiter

Define the limit key (user, API key, IP, tenant, or route), window semantics, burst allowance, and behavior when the limiter store is unavailable. A token bucket allows bounded bursts while limiting average rate; a fixed window is simple but can double the effective rate at window boundaries; a sliding log is precise but stores more events, while sliding counters approximate the window. A distributed limiter needs atomic updates or partitioned quotas. Decide whether to fail open or closed per endpoint risk, and return retry information consistently. Measure rejected requests, hot keys, store latency, and fairness across tenants.

### Design a chat service

Separate durable message history from live delivery. Persist each accepted message with a conversation sequence or stable ID, then fan out to online sessions through gateways/pub-sub. Clients reconnect with a cursor and fetch missed messages; push sockets alone are not history. Partition by conversation to preserve local order, and design hot-room fanout separately from ordinary rooms. Define membership authorization, moderation, retention, attachments, delivery receipts, duplicate handling, and what happens when a recipient is offline.

### Design a news feed

Choose fanout-on-write for users with manageable follower counts, fanout-on-read for very large publishers, or a hybrid. Store posts as the source of truth; materialized feed entries are derived and rebuildable. Use stable pagination cursors, deduplicate during fan-in, and handle deletes/privacy changes in derived copies. Address celebrity hot keys, freshness, ranking cost, cache invalidation, and backfill/replay. Explain the consistency users see after posting or following someone.

### Design direct-to-object-storage uploads

Authorize an upload intent, issue a scoped short-lived capability, and send bytes directly to object storage so the API server does not proxy large payloads. Enforce size/type policy on the server and validate the completed object before marking it usable. Treat upload completion and database state as separate effects: use an idempotent state machine and reconciliation. Add malware scanning, quarantine, retention/deletion policy, signed download access, CDN caching, and resumable upload for unreliable networks.

### Design multi-region service failover

Start with explicit RTO and RPO and list which user journeys must survive a region loss. Active-passive with a single write owner is simpler but may have a failover window and asynchronous replica lag. Active-active can reduce local latency but requires conflict-safe data partitioning or a globally coordinated transaction system. Define promotion authority, split-brain prevention, DNS/client routing, stale-read behavior, dependency placement, secret/config replication, and a tested failback plan. A diagram with two regions is not a recovery plan until a timed game day proves it.

### Design search autocomplete

Clarify whether suggestions come from products, people, places, or query history; whether results are personalized; supported languages; freshness; and what happens for abusive or private queries. A typical path debounces keystrokes, sends a request after a minimum prefix length, and attaches a monotonically increasing request ID so a slower response for `ca` cannot overwrite a newer response for `cat`. Normalize and validate input, enforce per-user/IP rate limits, and return a small ranked candidate list. A prefix index, trie/FST, search engine completion index, or database index may fit different data sizes and ranking needs. Keep the canonical records elsewhere and refresh the search index asynchronously with an explicit lag objective. Cache only safe, correctly scoped suggestions. Measure keystroke-to-result p95/p99, empty-result rate, index lag, hot prefixes, and abusive traffic.

### Explain what happens when a user types a URL and presses Enter

Walk from the browser's address-bar interpretation and cache checks through DNS resolution, connection establishment (TCP/TLS or QUIC/TLS), HTTP request routing, CDN/reverse proxy/load balancer, application authentication and routing, database/cache access, and response delivery. Then explain the browser's HTML parsing, resource discovery, CSSOM/DOM construction, JavaScript execution, layout, paint, and compositing at the level relevant to the question. Distinguish network latency from server processing and browser rendering; show where cache hits, redirects, service workers, connection reuse, compression, and client-side routing change the path. Close with failures such as DNS errors, certificate problems, slow API calls, blocked resources, and a JavaScript exception. Do not imply every navigation performs a fresh DNS lookup or new handshake: browser caches, connection pools, HTTP caching, and service workers can alter the trace.

### Explain the critical rendering path

Describe how the browser turns HTML, CSS, JavaScript, fonts, and images into visible pixels. HTML parsing builds the DOM; CSS parsing builds the CSSOM; render-tree construction, layout, paint, and compositing follow. Some scripts can block parsing or delay rendering; CSS can block rendering because the browser needs style information. Above-the-fold images, font loading, JavaScript execution, and long main-thread tasks affect when content becomes visible and interactive. Discuss resource prioritization, code splitting, critical CSS, defer/async/module script behavior, responsive images, caching, and Core Web Vitals without suggesting that one optimization always helps. Diagnose with browser traces and field data, then optimize the actual critical dependency chain.

### Design a safe production deployment

Start with a release artifact and repeatable build, then cover configuration/secrets, migrations, rollout, health checks, observability, and rollback. A rolling deployment gradually replaces instances; a canary exposes a small share of traffic; blue/green runs separate environments and switches traffic. State how the database remains compatible while old and new application versions coexist: use expand-migrate-contract for schema changes, backfill with bounded load, and delay destructive cleanup until rollback is no longer needed. Include readiness/liveness distinctions, feature flags, traffic draining, queue consumers, static asset versioning, and an abort threshold. A rollback is not safe if the new version has irreversibly changed data or old code cannot read the new schema.

### Design ticket booking for a popular event

Clarify whether the product sells assigned seats or general admission, what “held” means, and how long checkout may take. Model each seat as an authoritative state machine (available, held until deadline, sold) with an atomic uniqueness constraint or serialized partition so two buyers cannot both win. A hold must expire safely; payment is an external side effect, so use an idempotency key, a reservation/payment state machine, and reconciliation for “payment succeeded but response timed out.” Do not hold a database transaction open while a person enters card details. Apply a waiting room/rate limit for a launch rush, queue fairly, isolate hot events, and keep availability display clearly provisional until confirmed. Test duplicate requests, hold expiry races, payment retries, and regional failure.

### Design payment processing

Separate the payment intent from the external provider call and from the final ledger/accounting record. Persist an idempotent command, send it through a bounded worker, record provider references and state transitions, and reconcile uncertain outcomes using provider lookup/webhooks rather than issuing blind duplicate charges. Define authorization, capture, void, refund, dispute, and webhook replay handling. Use an append-only or auditable ledger for financial movements; do not treat an eventually consistent cache or notification as the balance authority. Discuss PCI scope, secrets, least privilege, retention, fraud controls, provider outage, and operational reconciliation.

### Design a notification service

Store notification intent in an outbox with the business transaction, then fan out to email, push, or SMS providers asynchronously. Distinguish must-deliver business events from best-effort presentation alerts; provider acceptance is not proof of delivery or reading. Model user preferences, quiet hours, templates/localization, provider token lifecycle, retries, rate limits, deduplication, expiration, collapse, and feedback/bounce handling. Partition large campaigns, apply backpressure, and protect against retry storms. Measure queue age, provider acceptance/error, delivery feedback where available, and user-visible outcomes without logging sensitive content.

### Design video upload and streaming

For ingest, authorize a short-lived direct upload, support multipart/resumable transfer, validate completion and media metadata, quarantine and scan, then enqueue transcoding. Keep job state and output versions durable and idempotent; retry failed stages without publishing incomplete assets. For playback, store renditions in object storage, deliver through a CDN, use adaptive-bitrate manifests and segment caching, and handle authorization/DRM where required. Distinguish upload ingress, encoding capacity, origin storage, and viewer egress as separate bottlenecks. Discuss lifecycle/retention, geographic placement, hot content, cache invalidation, and cost per encoded minute or streamed GB.

### Design a globally available leaderboard

Clarify whether ranking must be exact and immediate, whether scores can be corrected, and whether users see a global or regional board. A hot sorted set or database index may work at modest scale; sharded counters/partitions can raise write throughput but require merge and ranking logic. Decide how to order ties, deduplicate retries, handle late events, and rebuild a leaderboard from the event source. If approximate or delayed ranking is acceptable, state the freshness bound. Measure write contention, recomputation lag, top-N latency, and hot-key skew.

## Cross-topic interview questions

These questions do not belong to one framework or database. They reveal whether the candidate can reason across browser, network, service, data, and operations boundaries.

1. **A request timed out. Did the operation fail?** Not necessarily. The server may have committed before the response was lost. Treat the outcome as unknown; use idempotency or query by a stable operation ID.
2. **How do you prevent a retry storm?** Set bounded deadlines, exponential backoff with jitter, retry budgets, per-dependency concurrency limits, and circuit/load-shedding behavior; retry only operations safe to repeat.
3. **How do you deploy a breaking API change?** Use additive compatible fields/routes first, migrate consumers, observe usage, then remove old behavior after a deprecation window; coordinate schema and code versions.
4. **How do you prevent one tenant's cached data from reaching another tenant?** Include authorization scope and every response-varying dimension in the cache key, or cache only public data; verify permissions before returning a hit.
5. **What is the difference between a backup and replication?** Replication helps availability and current-state failover but may copy corruption/deletion; backups provide point-in-time recovery if retention and restore procedures are tested.
6. **When does a queue help, and when can it hurt?** It absorbs bursts and decouples processing, but adds delay, duplicate delivery, poison messages, backlog and retry behavior. Bound queue age/size and define idempotent consumers and overload policy.
7. **How do you choose consistency?** Start from the business invariant and user-visible stale-read tolerance, then select a documented guarantee and route each operation accordingly; don't choose “strong” or “eventual” as a style preference.
8. **What does “high availability” mean?** Name the user journey, success threshold, observation window, failure domain, SLO, and recovery target; component count alone does not establish availability.
9. **How do you know whether to shard?** Measure saturation and partition skew first. Define a stable partition key, cross-partition query/transaction cost, rebalancing plan, and hot-key mitigation before splitting.
10. **How does a search result become stale?** The source record may change before an asynchronously updated search index/cache; state the propagation path, maximum lag, invalidation strategy, and fallback to authoritative reads.
11. **How do you safely delete a user or record?** Track deletion through primary data, replicas, caches, search indexes, object storage, analytics, backups, and downstream exports; define legal retention and restore behavior.
12. **What should happen when a dependency is slow?** Use a deadline shorter than the caller's, cancellation, bounded concurrency, and a product-appropriate fallback; avoid unbounded threads, queues, or retries.

## Deep follow-up answers

- What happens if the database commits but the caller times out?
- How do retries avoid duplicate charges, messages, reservations, or uploads?
- Where does backpressure appear, and what is bounded when traffic exceeds capacity?
- What is the hottest key or partition, and how would you detect and mitigate it?
- Which cache entries can be stale, for how long, and how are they invalidated or rebuilt?
- How do you deploy an API and schema change while old and new instances run together?
- How do you restore a backup, and what measured RPO/RTO does the restore meet?
- What does the user see if a dependency is slow or unavailable?
- How do tenant isolation and authorization work through caches, queues, object storage, and analytics?
- What data can be deleted, and how do you propagate deletion to replicas, caches, backups, and derived indexes?
- What evidence would make you split a service, shard a table, add a cache, or remove a component?

## Tradeoffs and alternatives

- **Layer 4 vs Layer 7 load balancing:** Layer 4 routes by transport/network properties with less application awareness; Layer 7 can route by HTTP host/path/header and apply HTTP-aware policies, at the cost of parsing/terminating more of the protocol. Choose based on routing needs, TLS ownership, protocol support, latency, and operational complexity.
- **Queue vs event stream:** A queue commonly distributes work among consumers and may remove/acknowledge completed messages; an event stream retains an ordered log for replay and independent consumer positions. Compare retention, replay, ordering scope, fan-out, delivery, and operational needs rather than using the names interchangeably.
- **Cache-aside vs write-through:** Cache-aside loads on a miss and requires explicit invalidation/TTL; write-through updates the cache along the write path and may keep it fresher at the cost of coupling write success and cache behavior. Decide which system is authoritative and how partial failures are reconciled.
- **WebSocket vs Server-Sent Events (SSE):** WebSocket is bidirectional over one connection; SSE is server-to-client streaming over HTTP with browser reconnection support. Choose based on whether clients must send frequent real-time messages over the same channel, infrastructure constraints, and reconnect/replay design.
- **SQL vs NoSQL:** Start from access patterns and invariants. Relational constraints and transactions can simplify multi-row correctness; key-value/document/wide-column systems may fit different scale and access patterns but can shift joins, constraints, and consistency work into the application.
- **Strong vs eventual consistency:** Stronger read/write guarantees can simplify invariants but may require coordination and latency; eventual consistency can improve locality/availability for suitable operations but requires stale-read tolerance, merge rules, or reconciliation.
- **One service vs many services:** Split along independently owned capabilities when deployment, scaling, or team boundaries justify the network and operational overhead. A distributed boundary adds failure, observability, data ownership, and compatibility work.

## Common weak answers

- “Use microservices, a cache, and a queue” without linking each component to a requirement.
- “The request failed because it timed out” when the operation's outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, hot spots, or downstream capacity.
- “The system is highly available” without defining user-visible success, failure domains, measurement, and recovery.
- Naming a consistency model without explaining which user action needs it.
- Treating a cache, replica, queue, or notification service as the source of truth.
- Drawing boxes without showing data ownership, request paths, write acknowledgment, and failure behavior.
- Giving a single-point estimate without stating assumptions or showing how a different workload changes the design.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; data ownership and correctness; read/write path; bottleneck and capacity; failure and recovery; security and privacy; observability and validation; cost and trade-offs; clear communication. A strong answer states uncertainty, identifies the decisive trade-off, and ties every major component to a requirement.

## A repeatable answer structure

1. Restate the user problem and clarify the highest-risk ambiguity.
2. State functional requirements, quality targets, assumptions, and rough workload math.
3. Name the authoritative state and invariants before selecting products.
4. Draw the simplest end-to-end read and write paths.
5. Deep-dive into the likely bottleneck, partitioning, consistency, or delivery mechanism.
6. Walk through timeout-after-success, duplicate delivery, overload, dependency failure, and regional recovery.
7. Cover authorization, tenant isolation, privacy, observability, deployment, and cost.
8. Summarize the main trade-off and the measurements that would change the design.

Keep the answer conversational and revise it as requirements change. Interviewers are testing clear reasoning, not a memorized vendor diagram.

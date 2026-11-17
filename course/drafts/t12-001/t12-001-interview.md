# system design foundations and infrastructure building blocks — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/guide/).

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

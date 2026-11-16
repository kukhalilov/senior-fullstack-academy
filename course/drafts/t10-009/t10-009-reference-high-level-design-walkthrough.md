# architecture interviews tradeoffs requirements and constraints — Reference: Entities, APIs, read/write flow, storage, and architectural decomposition

## Scope and version

This lesson develops the first coherent end-to-end design. See the [Google Cloud architecture framework](https://docs.cloud.google.com/architecture/framework) and [Microsoft Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework).

## How this group fits the mental model

A high-level design is a responsibility map plus data flow. Every component should have an owner, contract, and reason to exist.

## Supplied names explained

- **Core entity identification** — Find the durable nouns and state transitions needed by primary user journeys.
- **Entity relationship sketch** — Show ownership and cardinality; keep it conceptual until query and transaction needs are understood.
- **API boundary** — Contract between callers and a service, including identity, validation, error, pagination, and compatibility rules.
- **Request-response contract** — Inputs, outputs, status/error semantics, and guarantees visible to a caller.
- **Write path** — How a command is authorized, validated, persisted, and made visible to downstream consumers.
- **Read path** — How a query obtains authoritative or derived data and what freshness it promises.
- **Data ownership** — Which component is authoritative for a fact and may change it; avoids competing writers.
- **Primary data store** — Durable source of truth selected for query patterns, transaction needs, scale, and operations.
- **Relational database choice** — Favor when relationships, constraints, and transactions over structured data fit the workload; model indexes and write contention.
- **Document database choice** — Favor when aggregate-shaped documents and access patterns fit; understand consistency, joins, and update tradeoffs.
- **Object storage** — Durable storage for large blobs with separate metadata/authorization; not a substitute for relational queries.
- **Cache** — Derived, expiring copy used to reduce latency/load; requires key, TTL, invalidation, privacy, and stale-read policy.
- **Message queue** — Point-to-point work buffer with acknowledgment/retry semantics; consumers must handle duplicates and poison messages.
- **Event stream** — Append-oriented ordered partitions of events for multiple consumers and replay within retention; ordering is scoped, not global by default.
- **Search index** — Derived representation optimized for text or retrieval; define update lag, reindex strategy, and source of truth.
- **Background worker** — Independent process that performs asynchronous work and records progress, retry, and terminal failure.
- **Load balancer** — Distributes traffic among healthy instances; policy and health checks affect routing but do not fix a saturated dependency.
- **API gateway** — Edge layer for routing and cross-cutting controls such as authentication, rate limiting, or protocol translation; avoid business logic sprawl.
- **Application service** — Code that implements use cases and coordinates domain rules and data operations.
- **Service boundary** — Ownership and deployment/API boundary; split when independent change, scale, security, or team ownership justifies added network complexity.
- **Monolith-first baseline** — Begin with one deployable application when it meets requirements; maintain module boundaries so extraction remains possible.
- **High-level architecture diagram** — Boxes for responsibilities and arrows for requests/data/events; label trust, sync/async, and ownership.
- **End-to-end request trace** — Follow a specific operation across client, edge, service, store, and response, including errors and correlation.

## Cross-item comparison

Queues usually distribute discrete work to consumers; event streams retain ordered records for independent consumers. A cache and a search index are both derived, but their query semantics and rebuild strategy differ. Relational versus document selection is about access patterns and invariants, not a universal scale ranking. An API gateway is not necessarily a business service boundary.

## Examples

For photo upload: the client authenticates and requests an upload intent; the API verifies account quota and returns a time-limited upload target. The client sends bytes to object storage. A completion command records metadata and an event/outbox record atomically. A worker scans and creates thumbnails. A read API checks access and returns metadata or a short-lived download target. This flow identifies authoritative ownership, asynchronous work, and the point at which a photo becomes visible.

## Common mistakes

- Drawing boxes without saying who owns data or what each arrow means.
- Making a cache or search index the only copy of data without a recovery plan.
- Putting large blobs through an API server without checking bandwidth and memory effects.
- Splitting a simple system into services before team or scale requirements justify it.
- Omitting authorization and failure responses from the “happy path.”

## Knowledge checks with answers

1. **Which store should be authoritative for an uploaded object's ownership?** The system's designated durable metadata owner; object storage holds bytes but does not automatically define application authorization.
2. **Why add an outbox when recording a database change and publishing an event?** It prevents a crash between two independent writes from silently losing one side.
3. **What should arrows in a system diagram identify?** Direction, protocol/contract, synchronous versus asynchronous behavior, and important data or trust boundaries.

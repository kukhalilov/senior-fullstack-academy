# data systems storage engines analytics streams and search — Reference: Cortex

Sources: [HLD Handbook](https://hld.handbook.academy/), [Cortex docs](https://cortexmetrics.io/docs/), [architecture](https://cortexmetrics.io/docs/architecture/), [blocks storage](https://cortexmetrics.io/docs/blocks-storage/), [ingester](https://cortexmetrics.io/docs/blocks-storage/ingester/), [querier](https://cortexmetrics.io/docs/blocks-storage/querier/), [query frontend](https://cortexmetrics.io/docs/blocks-storage/query-frontend/), [multi-tenancy](https://cortexmetrics.io/docs/guides/multi-tenancy/), [rate limiting](https://cortexmetrics.io/docs/guides/rate-limiting/), [operations](https://cortexmetrics.io/docs/operations/), [upgrade procedure](https://cortexmetrics.io/docs/operations/upgrading/), [changelog](https://cortexmetrics.io/docs/changelog/).

## Scope and version

This reference describes Cortex, the horizontally scalable, multi-tenant, Prometheus-compatible long-term metrics system. Cortex 1.22.0 was released 2026-11-19 according to the official changelog, checked 2026-11-20. Some documentation tracks the latest development branch; flags and behavior must be checked against the exact deployed release. Cortex is an implementation choice, not a requirement for every Prometheus deployment.

## How this group fits the mental model

Prometheus remains responsible for scraping targets and creating samples. It can remote-write batches to Cortex, which separates ingestion, recent in-memory/WAL data, long-term blocks and queries into scalable services. A common write path is Prometheus → load balancer → Distributor → replicated Ingester quorum → local TSDB/WAL and periodic blocks → object storage. A read path uses Querier to combine recent Ingester data with historical Store Gateway/object-store blocks. Query Frontend and Query Scheduler can split/cache/queue expensive reads. Ruler evaluates recording and alerting rules; Alertmanager handles alert grouping/routing when that component is used.

This architecture is a trade: stateless services scale horizontally, while ingesters and other ring-managed services carry partitioned state and require membership/lifecycle coordination. Object storage reduces dependence on a single disk for historical retention but does not remove the need to protect in-flight ingester data. Multi-tenancy adds isolation and fair-use policy, but a tenant ID header is only trustworthy when an authenticating proxy or gateway validates and injects it.

## Supplied names explained

- **Distributor** — Stateless write entry point. It validates samples and tenant limits, hashes series to the ingester ring and sends each write to a replication set. A write acknowledgement depends on configured replication/quorum behavior; it is not a statement that a block is already in object storage.
- **Ingester** — Accepts samples, maintains recent series and WAL/state, serves recent queries and periodically flushes TSDB blocks to object storage. Its ring lifecycle includes joining/active/leaving states. Replication reduces risk from one ingester failure; persistent disks/WAL support restart recovery. Scaling/rebalancing changes state placement and must be planned to avoid overload or gaps.
- **Blocks storage** — Uses Prometheus TSDB blocks in object storage plus services/caches for block discovery and query. Historical storage cost is not the whole cost: object calls, index/chunk caches, compaction, query concurrency and retention also matter. Object-store lifecycle rules must not delete blocks still referenced by Cortex metadata or expected by queries.
- **Querier** — Executes PromQL by combining recent data from ingesters and historical blocks from Store Gateways. During transition between these sources, replica overlap can cause duplicate samples; Cortex applies deduplication logic. A query that misses required blocks should fail its consistency checks rather than silently claim a complete answer, subject to exact release and configuration.
- **Query Frontend and Scheduler** — Frontend can split large range queries, cache results and enforce queue limits; the optional Scheduler moves query queues into a separate service so frontend and queuer capacity can scale independently. Caching improves repeat reads but must respect freshness and tenant boundaries. Query queues protect the backend but can increase user-visible wait time; watch queue depth and cancellation.
- **Compactor and Store Gateway** — Compactor merges TSDB blocks and applies retention/metadata processing; Store Gateway serves blocks from object storage. These services need coordinated sharding and ownership so every required block is queryable and only intended processes can delete historical data. Compaction failure can leave many small blocks and slow queries; excessive concurrency can exhaust object-store or CPU capacity.
- **Ruler and Alertmanager** — Ruler evaluates PromQL recording/alerting rules in the Cortex environment. Alertmanager provides grouping, deduplication and notification routing. Preserve tenant identity in rule evaluation and notification; decide how rule state behaves across restart, resharding and upgrades. A rule gap is a monitoring correctness issue, not merely a dashboard inconvenience.
- **Tenant identity and limits** — Cortex expects requests to carry a tenant ID, commonly in `X-Scope-OrgID`. The deployment must authenticate the caller, authorize which tenant it can use, and prevent callers from forging another tenant's header. Per-tenant limits (sample rate, series/cardinality, query cost, rules and retention) protect shared capacity; per-instance limits protect a process from overload. Limits are policy, not capacity planning.
- **High availability tracker and ring** — Cortex can deduplicate redundant Prometheus senders through an HA tracker and assigns time series to ingesters through ring membership. Ring state, replication factor, zones and failure detection affect which ingesters receive/query a series. A healthy HTTP load balancer alone cannot repair broken ring state or missing replicated data.
- **Remote Write and OTLP** — Prometheus remote_write is the established ingestion path. The 1.22 changelog also lists experimental OTLP metrics ingestion over gRPC; “experimental” means validate maturity, compatibility and operational support before making it a production dependency. Accepting OTLP does not replace the need to define labels, cardinality limits and tenant identity.
- **Upgrade and release discipline** — Cortex documentation warns to read every `[CHANGE]` between current and target versions and to upgrade components in dependency order. Shared wire formats, runtime configuration and deprecated flags can make a rolling upgrade fail or keep stale config active. Test representative traffic, rule evaluation, data reads, rollback constraints and bucket compatibility before rollout.

## Cross-item comparison

Cortex, Thanos and Mimir all extend Prometheus-style metrics beyond one server, but have different write paths and operational assumptions. Cortex is a distributed remote-write backend designed for multi-tenant ingestion and horizontally scalable services. Thanos can extend existing Prometheus instances through Sidecars and object-store blocks with a global query layer. Mimir is a related, separately maintained project with its own current feature/support lifecycle. Compare current maintainership, release cadence, migration path, storage semantics, tenant boundary, PromQL behavior, cardinality limits, query fan-out, and operator experience. For a small installation, one Prometheus with remote storage may be safer and cheaper.

## Examples

For a hosted metrics platform, Prometheus agents send remote-write requests through an authenticated gateway. The gateway derives tenant identity from credentials rather than trusting a caller-supplied header. Distributor validates limits and routes each series to an ingester replication set. Recent queries combine ingester data with block data; older queries use Store Gateways. Frontend splits long ranges and caches safe subqueries. Use per-tenant caps and noisy-neighbor dashboards, and instrument rejected samples, ring health, ingestion lag, WAL recovery, object-store errors, query queue time, partial/missing-block errors and rule-evaluation delay.

When an ingester is drained, ring transition and handoff must preserve recent samples. If a block upload fails but the WAL remains, recovery may be possible; if local persistence and all replicas are lost before flush, samples are lost. Do not use “we run three replicas” as a substitute for testing zone-level failure, ring updates and restore procedures.

## Common mistakes

- Trusting an unauthenticated tenant header as a security boundary.
- Assuming a distributor success means data is already in durable object storage.
- Treating ingesters as stateless workers or scaling them without understanding ring movement and WAL recovery.
- Assuming Query reads only object storage; recent samples may still be in ingesters.
- Letting long-range PromQL fan-out exhaust queriers or object-store request budgets.
- Treating rate limits as a full multitenancy/security design.
- Applying cloud bucket retention/lifecycle policies without coordinating Cortex block metadata and retention.
- Upgrading only one component and skipping intermediate breaking-change notes.
- Treating an experimental ingestion API as a stable supported contract.

## Knowledge checks with answers

1. **Why can a recent query depend on an ingester?** Recent samples may not yet have been flushed into historical TSDB blocks.
2. **What makes the tenant header meaningful?** A trusted authentication/authorization layer must bind it to the caller and block spoofing; the header alone is not authentication.
3. **What does the query frontend change?** It can split, cache and queue reads to manage load; it does not change PromQL's meaning or make missing blocks correct.
4. **Why is Cortex not automatically needed when using Prometheus?** A single Prometheus can be simpler for bounded scale and retention; distributed services introduce state, rings, object storage and upgrade operations.
5. **What should be checked before a Cortex upgrade?** All intervening change notes, component dependency order, wire/storage/config compatibility, data availability, alert/rule behavior, rollback constraints and tested recovery.

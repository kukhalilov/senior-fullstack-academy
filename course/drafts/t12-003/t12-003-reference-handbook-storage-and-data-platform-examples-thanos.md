# data systems storage engines analytics streams and search — Reference: Thanos

Sources: [HLD Handbook](https://hld.handbook.academy/), [Thanos architecture](https://thanos.io/tip/thanos/design.md/), [Sidecar](https://thanos.io/tip/components/sidecar.md/), [Receive](https://thanos.io/tip/components/receive.md/), [Query](https://thanos.io/tip/components/query.md/), [Store Gateway](https://thanos.io/tip/components/store.md/), [Compactor](https://thanos.io/tip/components/compact.md/), [object storage layout](https://thanos.io/tip/thanos/storage.md/), [release changelog](https://thanos.io/tip/thanos/changelog.md/), [release process](https://thanos.io/tip/thanos/release-process.md/).

## Scope and version

This reference explains Thanos as a set of Prometheus-compatible components for querying and retaining metrics across replicas and clusters. Documentation was checked 2026-11-20; the latest stable line listed by project release information is v0.42.x (including v0.42.4 in July 2026). Thanos remains 0.y.z, so do not infer that minor releases cannot change APIs or flags; use release notes and the documentation matching the deployed image.

## How this group fits the mental model

Prometheus is commonly a local scrape-and-query system with a local TSDB. Thanos composes Prometheus servers and object storage into a larger metrics architecture. A common path is Prometheus → Sidecar → object-store blocks and/or a shared Store API → Thanos Query → PromQL clients. Another path is Prometheus remote_write → Receive → local TSDB/WAL and object storage. Store Gateway serves historical blocks; Compactor merges/downsamples blocks and may enforce retention. Ruler evaluates recording/alerting rules. These components solve different placement and lifecycle problems; an architecture can use only a subset.

Object storage extends retention and decouples query from a single Prometheus disk, but it does not make recent local Prometheus data instantly durable. The Sidecar uploads completed TSDB blocks periodically; Prometheus still needs persistent local storage to protect data that has not yet been uploaded. Receive is the push-oriented alternative for remote-write-only or egress-restricted environments. Availability, freshness, replica deduplication and query completeness depend on which stores a query can reach and how partial responses are configured.

## Supplied names explained

- **Sidecar** — Runs beside Prometheus and exposes its data through Thanos Store API; it can also upload completed TSDB blocks to object storage. When using the upload/compaction flow, configure Prometheus block durations as Thanos documents so local compaction does not mutate blocks while Thanos compacts them. Keep Prometheus persistent storage: a crash can otherwise lose data not yet uploaded.
- **Receive** — Accepts Prometheus remote-write requests, writes series to its TSDB/WAL and routes series among receivers using a hash ring; it can replicate writes. It is useful when clients can only push. Replication factor, ring membership, tenant labels, write quorum and persistent disks determine durability and failure behavior; remote write acknowledgement is not equivalent to object-store archival.
- **Query (Querier)** — Implements Prometheus-compatible HTTP query APIs and executes PromQL across discovered Store API endpoints. It can deduplicate replicas when the configured replica labels are correct. A missing or inconsistent replica label can either leave duplicate series or collapse series that should remain separate. Partial-response policy is a correctness-versus-availability choice: returning partial data with a warning/HTTP success may be acceptable for dashboards, but dangerous for alerting or billing.
- **Store Gateway** — Exposes historical object-store blocks through Store API. It keeps local metadata/index caches and fetches relevant block data. Sharding, replica factor, bucket index, cache warmup and object-store locality affect query cost and recovery; the gateway is not itself a backup.
- **Compactor** — Compacts object-store blocks, creates lower-resolution data and applies configured retention. The compaction operation is not safe to run concurrently against the same bucket; follow the project's singleton/coordination model. Retention may only run after compaction/downsampling loops, so a stalled compactor can delay deletion. Retention set too short can delete required history; no retention configured means blocks can remain indefinitely. Downsampling improves long-range query efficiency but does not necessarily reduce total bucket bytes because additional resolutions may be stored.
- **Ruler** — Evaluates Prometheus-style recording and alerting rules. Decide where rules run, how they are sharded, how tenant labels are preserved, and how alert delivery works. Losing rule-evaluation continuity can create gaps in recording series or affect alert state; it is not the same as running a Prometheus server's local rules.
- **Object-store block and Store API** — A common abstraction lets Query combine live Prometheus data, receiver data and historical blocks. Object storage provides durable capacity, not a free query engine: index downloads, caches, request counts, block size, compaction and network placement influence cost and latency.
- **Replica labels and deduplication** — HA Prometheus pairs often emit duplicate samples distinguished by a replica label. Query can merge these replicas for one logical series. Configure only labels that identify the redundant replica dimension; do not deduplicate a real business label.
- **Tenancy and access** — Thanos components do not automatically create a complete authorization boundary. Define tenant identity, label injection/validation, object-store prefixes/credentials, query authorization, network policy and write access by component. Limit who can delete blocks; Compactor is especially sensitive because it applies retention.
- **Release compatibility** — Thanos API/flags and Store API behavior can change within 0.y releases. Upgrade components in a tested compatibility set, check the changelog for storage formats and flags, and test rollback against the same bucket before production rollout.

## Cross-item comparison

Thanos, Cortex and Mimir all build scalable Prometheus-compatible metrics systems, but organize writes, storage, tenants, compaction and operational control differently. Thanos often extends existing Prometheus installations with sidecars, object storage and a global query layer. Cortex/Mimir are commonly deployed as multi-tenant remote-write backends with distributed ingestion and query services. Prometheus alone is simpler for a bounded single-cluster horizon. Choose based on existing scrape ownership, write-vs-pull needs, multi-tenancy, retention, query fan-out, failure tolerance and operator capacity—not “unlimited retention” as an isolated goal.

## Examples

An organization runs two Prometheus replicas per region. Each Sidecar exposes local data; both upload blocks to regional object storage. A global Query discovers both pairs, deduplicates using the replica label, and combines regions. Configure a partial-response policy deliberately, retain local persistent volumes for recent data, and alert on upload age, missing stores, block gaps, compactor failures, query warnings, bucket errors and replica-label changes. A dashboard may display a partial result with a visible warning; an SLO alert should generally fail closed or use a policy that makes missing data explicit.

For a remote-write-only environment, Receive distributes series by tenant/series hash and replicates according to configuration. A node failure may still lose data if disk/WAL and replication are insufficient. Test ring changes and replay, and compare accepted samples with durable block availability rather than counting HTTP successes alone.

## Common mistakes

- Assuming object-store upload makes the attached Prometheus process stateless or immediately protects its head block.
- Running multiple uncompensated Compact processes against one bucket.
- Returning partial data to an alert as though it were complete.
- Setting retention while compaction is failing and assuming deletion happens independently.
- Using an incorrect replica label, silently duplicating or collapsing series.
- Treating Thanos as one mandatory all-in-one server rather than selecting components by architecture.
- Assuming 0.y releases preserve every CLI flag/API or that matching component versions is unnecessary.
- Granting broad object-store delete rights to every component or relying on a tenant header without an authentication boundary.

## Knowledge checks with answers

1. **What happens if a Sidecar uploads completed blocks but Prometheus has no persistent disk?** Data still in the unuploaded head/local blocks can be lost on process or host failure; upload is periodic, not synchronous replication of every sample.
2. **Why is replica-label configuration part of correctness?** It tells Query which series represent redundant copies. Incorrect labels can leave duplicates or merge distinct series.
3. **Why should Compactor be coordinated?** Concurrent compaction of the same object-store bucket can conflict because the process is not semantically concurrency-safe.
4. **When should partial query results be allowed?** Only when the application can tolerate missing data and exposes that incompleteness; do not silently use partial results for decisions requiring complete coverage.
5. **What does Thanos add over one Prometheus?** Optional global query across Store APIs, object-store-backed long retention, downsampling and related components, at the cost of more distributed state and operations.

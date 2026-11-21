# scaling availability replication sharding load balancing — Reference: Data ownership, shard keys, rebalancing, and independent service cells

Sources: [Azure sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding), [Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp), and [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out).

## Scope and version

This lesson explains the exact data-partition and service-slice terms in the manifest. It is provider-neutral and does not cover database-engine DDL or managed sharding configuration.

## How this group fits the mental model

Partitioning assigns subsets of data to different owners. Sharding is a common horizontal partitioning arrangement across data stores. A shard key determines placement and routing, so it affects balance, locality, and future migration. A deployment stamp or cell replicates a larger service slice for a bounded group of tenants or users.

## Supplied names explained

- `Partitioning` divides data or work into subsets with an ownership/routing rule. It can reduce per-node load but makes cross-partition operations harder.
- `Horizontal partitioning` divides rows/records into subsets while keeping a similar schema. Each partition owns different entities.
- `Vertical partitioning` divides columns or fields into groups, often separating frequently accessed or sensitive data. Joins across groups add access coordination.
- `Functional partitioning` separates data/work by business function or bounded context. It can isolate workloads but may create cross-function queries and consistency needs.
- `Database sharding` distributes horizontally partitioned records across independent database nodes or stores. It increases aggregate capacity but requires routing, rebalancing, and cross-shard design.
- `Shard` is one independently stored subset of a sharded data set. A shard can have replicas and need not map one-to-one to a physical server.
- `Shard key` is the attribute or combination used to assign records to shards. Choose for immutability, cardinality, balance, and common queries; changing it may require costly migration.
- `Partition key` is the key used to assign data or requests to a partition. Some systems use the term for a shard key; check each system's definition.
- `Range partitioning` assigns ordered key ranges to partitions. It supports range locality but monotonic or uneven values can concentrate recent writes.
- `Hash partitioning` hashes a key to choose a partition. It can distribute uniform keys but may make range queries fan out.
- `Directory-based partitioning` consults a mapping from key/entity to owner. It supports flexible placement but the directory needs availability, caching, and updates.
- `Geographic partitioning` places records or workload by region. It can lower latency or meet data-location needs but complicates cross-region users and queries.
- `Consistent-hash ring` maps keys and nodes around a logical ring so membership changes remap a limited portion of keys. Virtual nodes can smooth distribution; hot keys remain hot.
- `Virtual partition` is a logical partition independent of a physical node. Mapping many virtual partitions onto nodes can make rebalancing more flexible.
- `Shard map` records which shard owns a key/range/tenant. It separates logical routing from physical placement but must be versioned and updated consistently during moves.
- `Request routing by shard key` sends a request to the owner selected by its partition key. Missing the key may require fan-out or an alternate index.
- `Hot partition` receives disproportionately high traffic or data growth. More servers do not help unless work can be divided or the hotspot isolated.
- `Hot key` is one key/entity with disproportionate access or updates. Replicating or caching reads may help, but writes to one serialized owner can remain constrained.
- `Data skew` is uneven data volume or request distribution across partitions. It can waste capacity and create tail latency even when average totals look healthy.
- `Partition growth` is the increase of data or traffic assigned to a partition over time. Plan capacity margins and a split/move trigger before exhaustion.
- `Shard split` divides one shard's ownership range/keyspace into smaller subsets. It requires routing updates and safe data copy/dual-write or cutover behavior.
- `Shard merge` combines small shards to reduce operational overhead. Verify capacity, routing, and uniqueness before changing owners.
- `Rebalancing` redistributes data or workload among partitions/nodes to address skew or capacity. It consumes resources and can affect production latency during copying.
- `Online resharding` changes shard ownership while service remains available. It needs migration state, write coordination, retry/reconciliation, and observability.
- `Cross-shard query` reads data from multiple owners. It may require fan-out, merge, ordering, pagination, and partial-failure behavior.
- `Cross-shard transaction` changes data owned by multiple shards as one logical operation. It adds coordination and availability/latency cost; avoid it when domain boundaries or workflows can remove the need.
- `Partitioning versus replication` contrasts dividing ownership with copying the same data. One distributes volume/work; the other creates copies for availability or read capacity. They can be combined.
- `Deployment stamp` is an independently deployed group of application and data resources serving a bounded set of tenants or users. Stamps support isolated scaling, updates, and failure containment but require routing and repeated operations.
- `Cell architecture` divides a service into independent cells that each serve a workload subset, limiting blast radius and scaling per cell. A cell may be a stamp or use further partitioning.
- `Tenant-to-stamp assignment` maps a tenant/customer to a service stamp. It must support lookup, rebalancing, movement, and consistent routing.
- `Stamp isolation` means a stamp's resources/workload are sufficiently independent that its failure or noisy neighbor has bounded impact. Shared global dependencies can still break isolation.
- `Stamp failover` redirects tenants from an unavailable stamp to a recovery target. Capacity, tenant data state, routing, and duplicate ownership need explicit handling.

## Cross-item comparison

| Arrangement | Divides or copies? | Main benefit | Main cost |
|---|---|---|---|
| Partitioning/sharding | Divides ownership | Aggregate storage/work capacity | Routing and cross-owner operations |
| Replication | Copies data | Read capacity or recovery options | Lag and consistency |
| Deployment stamp/cell | Repeats a service slice for a workload subset | Isolation and controlled scaling | Multiple deployments and assignment |

## Examples

Suppose most tenants are small but one tenant generates half of all writes. Tenant-ID hashing may still assign that hot tenant to one shard. Assigning it a dedicated shard or stamp can isolate impact, but requires a routing-map update and migration plan. A query across tenants may then span owners and need fan-out/merge.

## Common mistakes

- Choosing a monotonically increasing key for range partitioning without analyzing write concentration.
- Assuming hash partitioning makes every partition equally busy.
- Treating a shard map as infallible during online moves.
- Rebalancing only by stored bytes while ignoring request hotness.
- Assuming consistent hashing solves a hot key.
- Using deployment stamp and database shard as interchangeable terms.
- Designing frequent cross-shard transactions into the main request path.

## Knowledge checks with answers

1. How does hash partitioning differ from range partitioning? **Hashing spreads key values but loses natural range locality; ranges preserve ordering but can skew.**
2. Does a shard correspond to one server? **Not necessarily; a server can host several shards, and one shard may have replicas.**
3. What does a stamp isolate? **A whole service/resource slice and its assigned workload, subject to shared dependencies.**
4. Why plan online resharding early? **Data movement and ownership cutover require safe routing and write coordination.**

### Exact terms covered

- `Partitioning`
- `Horizontal partitioning`
- `Vertical partitioning`
- `Functional partitioning`
- `Database sharding`
- `Shard`
- `Shard key`
- `Partition key`
- `Range partitioning`
- `Hash partitioning`
- `Directory-based partitioning`
- `Geographic partitioning`
- `Consistent-hash ring`
- `Virtual partition`
- `Shard map`
- `Request routing by shard key`
- `Hot partition`
- `Hot key`
- `Data skew`
- `Partition growth`
- `Shard split`
- `Shard merge`
- `Rebalancing`
- `Online resharding`
- `Cross-shard query`
- `Cross-shard transaction`
- `Partitioning versus replication`
- `Deployment stamp`
- `Cell architecture`
- `Tenant-to-stamp assignment`
- `Stamp isolation`
- `Stamp failover`

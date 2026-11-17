# system design tradeoffs and decision methods — Reference: Range vs hash vs consistent-hash vs directory partitioning

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [PostgreSQL partitioning](https://www.postgresql.org/docs/current/ddl-partitioning.html), [Karger et al., consistent hashing](https://people.csail.mit.edu/karger/Papers/web.pdf), [Azure data partitioning guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-partitioning).

## Scope and version

Partitioning chooses where a record lives. A shard key affects locality, load, query fan-out, and migration. Range, hash, consistent-hash, and directory schemes make different tradeoffs; replication and consistency are separate decisions.

## How this group fits the mental model

**Range:** assign ordered key intervals to partitions. Range scans and time-window queries can target contiguous partitions, but monotonically increasing keys or uneven popularity can create hot ranges. Splitting/moving ranges needs boundary and routing management.

**Hash:** hash the partition key and divide the result among fixed buckets/partitions. This can spread ordinary keys and keep a key's location deterministic, but destroys key order and changing the partition count with modulo can remap many keys.

**Consistent hash:** map keys and nodes into an ordered hash space so membership changes can limit remapping. Virtual nodes/weights improve placement balance; this still does not eliminate hot keys or perform data migration automatically.

**Directory:** maintain a mapping from logical key/range/tenant to a physical shard. It offers flexible placement and targeted moves, but directory lookup, caching, availability, consistency, capacity, and updates become part of the routing path.

## Supplied names explained

All approaches need a shard-key strategy, membership/configuration source, migration protocol, resharding/backfill plan, query routing, and observability. A design may combine approaches, such as directory mapping tenants to shards and range-partitioning each shard by time.

## Cross-item comparison

| Workload pressure | Starting point | Main risk |
|---|---|---|
| Time/range scans and ordered access | Range | Skew/hot adjacent ranges |
| Equality lookups and broad key spread | Hash | Poor range locality and resharding |
| Frequent node-set changes with limited reassignment | Consistent hash | Balance and hot-key issues remain |
| Uneven tenant sizes or planned placement/migration | Directory | Routing metadata becomes critical |

Measure partition request rate, bytes, storage, CPU, and fan-out. Equal key counts do not mean equal load.

## Examples

For a time-series service, range partitioning by event time makes recent-window scans efficient, but a single newest range may absorb all writes. Hashing the account ID spreads customers but a query for a time window may touch many partitions. A directory can place large tenants separately, but then directory updates and cached routes must remain correct during shard movement. Specify dual-read/write, backfill, cutover, and rollback.

## Common mistakes

- Choosing a key by cardinality alone without checking frequency and query patterns.
- Assuming consistent hashing balances a hot key or migrates its records automatically.
- Ignoring cross-shard transactions, joins, pagination, and query fan-out.
- Changing partition ownership without a safe data-copy and cutover protocol.

## Knowledge checks with answers

1. **Which strategy naturally supports ordered range scans?** Range partitioning.
2. **What does consistent hashing mainly reduce?** Reassignment when the destination set changes; it does not guarantee balanced traffic or migrate data.
3. **What new dependency does directory partitioning introduce?** A correct, available, scalable mapping service/cache and a safe update path.

# system design technology landscape and selection — Reference: Key-value and document stores

Sources: [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/), [Redis eviction policies](https://redis.io/docs/latest/reference/eviction/), [Amazon DynamoDB partition-key design](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html), [Amazon DynamoDB partitions](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.Partitions.html), [MongoDB data-modeling best practices](https://www.mongodb.com/docs/manual/data-modeling/best-practices/), [MongoDB embedding](https://www.mongodb.com/docs/v8.0/data-modeling/embedding/), [Memcached documentation](https://docs.memcached.org/).

## Scope and version

This lesson compares Redis, Memcached, DynamoDB, and MongoDB as key-value/document-oriented choices. They are not interchangeable “NoSQL databases.” Redis is an in-memory data-structure server with optional persistence modes; Memcached is a cache; DynamoDB is a managed key-value/document database; MongoDB is a document database with indexes and multi-document capabilities. Provider features, limits, durability, pricing, and versions change; verify the exact deployment before committing to a design.

## How this group fits the mental model

Start with the shape of a request: what key or document does it read or update, how many items are touched, what query must be supported, and what must remain true during concurrent writes? A key-value interface is strongest when the application already knows the key and needs a bounded lookup or update. A document store keeps related fields together in a flexible record, which can make common reads and atomic single-document updates natural. Both approaches may offer secondary indexes and transactions, but their cost and semantics differ from a relational query engine.

Design from access patterns without making every possible query expensive. For a document, embed data that is commonly read/updated together and whose size/lifecycle is bounded; reference data when it is large, shared, frequently updated independently, or queried on its own. For a partitioned key-value database, choose keys that distribute activity while still supporting required queries. A hot key or partition can limit throughput even when the database scales horizontally. Secondary indexes expand query options but add storage, write amplification, and propagation/freshness considerations.

Cache is a different role from system of record. A cache can be repopulated from a durable authority and may evict entries or lose state. If Redis stores correctness-critical data, specify persistence, replication, failover, backup, and recovery guarantees instead of assuming “in memory” means durable. Memcached is intentionally cache-centric: cache invalidation, misses, eviction, and cold starts are normal application conditions.

## Supplied names explained

- **Redis:** in-memory data-structure server used for caching and other low-latency state. RDB snapshots and AOF logging are distinct persistence options; choose and test them for the data-loss/recovery objective. Eviction policy matters when a memory cap is reached.
- **Memcached:** distributed memory cache with simple key/value semantics; use it for disposable cached results, not as the only copy of valuable durable data.
- **DynamoDB:** managed key-value/document database organized around partition and sort keys plus optional secondary indexes. Model known query patterns, distribute access, and evaluate consistency/capacity/index costs.
- **MongoDB:** document database whose documents can embed related data or reference other documents. Embedding can make a unit of related data available together; multi-document transactions exist but should not replace a fit-for-purpose schema.

## Cross-item comparison

| Choice | Strong fit | Main trade-off |
| --- | --- | --- |
| Redis | Very low-latency structures, cache, coordination patterns, short-lived state | Memory cost, eviction and persistence choices, topology/failover semantics; not automatically a durable relational system of record |
| Memcached | Simple disposable cache across app nodes | Limited data model by design; no general durable database semantics |
| DynamoDB | Managed large-scale key access and predictable queries modeled around keys/indexes | Access-pattern coupling, partition-key/hot-key design, index and capacity economics, AWS service coupling |
| MongoDB | Flexible documents and aggregate-oriented reads/writes with queryable fields | Document boundaries, index/write cost, document growth, and cross-document transaction/consistency design |

## Examples

A session cache keyed by session ID may fit Memcached or Redis if the application can recover from cache loss and handles expiry/misses safely. If a shopping cart must survive device changes and outages, place its durable version in a database and optionally cache a derived copy; define versioning so a stale cache write cannot overwrite a newer cart.

For a high-volume DynamoDB event timeline, a key such as customer ID plus a sortable timestamp may support “recent events for one customer.” If one customer receives extreme traffic, that partition key can become hot; deliberate sharding may distribute writes but makes reads and ordering more complex. For MongoDB, an order with bounded line items may be modeled as one document to update and read the aggregate together; an unbounded event history or independently shared catalog data may be better in separate collections. Choose after testing real query and update patterns, including growth and document-size bounds.

## Common mistakes

- Choosing “NoSQL” before identifying query patterns, invariants, and durability needs.
- Treating Redis and Memcached as durable databases by default.
- Assuming DynamoDB can efficiently answer arbitrary ad hoc queries without a key/index design.
- Using a single high-traffic partition key and expecting automatic distribution to remove all hot-key pressure.
- Embedding unbounded arrays/documents that grow without limit or duplicate frequently changing shared data.
- Adding secondary indexes without accounting for storage, write cost, and index freshness/propagation behavior.
- Relying only on cache TTL for correctness or assuming cache invalidation always reaches every process instantly.
- Assuming document databases have no transactions or that a transaction makes a poor document boundary free.

## Knowledge checks with answers

1. **When is Memcached a reasonable choice?** When the data is a disposable cache whose miss/eviction/rebuild behavior is acceptable and simple key/value semantics suffice.
2. **Why is a DynamoDB partition key an architectural decision?** It controls item placement and shapes supported queries and traffic distribution; a hot key can concentrate activity.
3. **When should MongoDB data be embedded?** When related bounded data is commonly accessed and updated together; references are better for large/shared/independent entities or complex many-to-many data.
4. **What should you decide before using Redis for authoritative data?** Explicit persistence, replication/failover, backup, recovery, eviction, and acceptable loss guarantees.

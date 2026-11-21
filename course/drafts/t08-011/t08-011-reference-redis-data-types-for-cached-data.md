# caching Redis invalidation eviction and stampede — Reference: Redis native data structures used for cache values and lookup patterns

Sources: [Redis data types](https://redis.io/docs/latest/develop/data-types/), [Compare data types](https://redis.io/docs/latest/develop/data-types/compare-data-types/), [Redis 8.8 commands](https://redis.io/docs/latest/commands/redis-8-8-commands/), [Redis Arrays](https://redis.io/docs/latest/develop/data-types/arrays/), and [Redis 8.10](https://redis.io/docs/latest/develop/whats-new/8-10/).

## Scope and version

Redis Open Source 8.10 is the latest GA release (checked 2026-11-20). Redis 8 integrated several previously separate modules into the distribution; actual feature availability still depends on server/product/deployment. This lesson compares structures and the Redis Array command family introduced in 8.8 and documented in 8.10. It does not enumerate every command of every type or Redis Search APIs.

## How this group fits the mental model

Choose the structure whose native atomic operations match reads/writes. A richer structure can reduce client round trips but use more memory and add server-side work. Every cached structure must have a rebuild/freshness/eviction policy appropriate to the data's role.

## Supplied names explained

| Name | Purpose and behavior |
|---|---|
| `Redis String` | Binary-safe scalar value; supports opaque serialization, counters, ranges, and bit operations. It is compact for simple values but the application must parse/update nested data. |
| `Redis Hash` | Collection of string field/value pairs under one key, convenient for flat records and field-level updates/expiration. Not a nested-document type. |
| `Redis List` | Insertion-ordered sequence of strings, optimized for pushes/pops at ends. Supports queue/stack/deque shapes but is not a durable job system by default. |
| `Redis Set` | Unordered unique strings with membership and set algebra. Does not associate an arbitrary payload per member; use a companion structure if needed. |
| `Redis Sorted Set` | Unique members associated with scores, supporting rank and score ranges. Useful for ordered indexes/leaderboards but has more memory/CPU overhead than plain sets. |
| `Redis Stream` | Append-oriented entries with IDs and field/value pairs. It can model logs and consumer workflows; this curriculum names the type but covers broker delivery semantics in t08-008. |
| `Redis Bitmap` | Bit operations over a string as a dense indexed set of flags; memory is proportional to the highest bit offset, so sparse huge IDs can waste space. |
| `Redis Bitfield` | Packed integer fields within a string with atomic GET/SET/INCRBY and overflow modes. Define signedness/width/offsets carefully; shared bits may need coordination. |
| `Redis Array` | Redis 8.8 sparse index-addressable sequence of strings. Random access is by integer index; logical length and count of nonempty slots differ. Supports range scans, insertion cursor, aggregations, and bounded ring behavior. |
| `ARCOUNT` | Counts nonempty Array elements, distinct from logical length when sparse indices create holes. |
| `ARDEL` | Deletes specified indices; deleted slots become empty but do not necessarily shorten the logical extent. |
| `ARDELRANGE` | Deletes values across one or more index ranges. Work tracks touched/existing elements rather than simply the numeric width in sparse cases. |
| `ARGET` | Reads the value at an index; absent/out-of-range/empty slot behavior should be interpreted per command reply. |
| `ARGETRANGE` | Reads values for an inclusive index range; large ranges can create large replies, so bound them. |
| `ARGREP` | Searches values over an index range using exact, match, glob, or regex predicates plus boolean/limit/output options. Treat regex/pattern input as potentially expensive. |
| `ARINFO` | Returns Array metadata; FULL gathers detailed slice information at higher work cost. |
| `ARINSERT` | Inserts values sequentially using an internal insertion cursor; insertion shifts/index behavior differs from setting a known index. |
| `ARLASTITEMS` | Returns the newest inserted values, optionally in reverse order, useful for bounded recent-history reads. |
| `ARLEN` | Returns logical length (highest set index plus one), not count of occupied elements. |
| `ARMGET` | Reads multiple requested indices in one call, reducing network round trips. |
| `ARMSET` | Sets multiple index/value pairs in one command. Validate duplicate indices and ordering assumptions at the caller. |
| `ARNEXT` | Reports the next index the sequential insertion cursor would use. It does not reserve that index across concurrent clients. |
| `AROP` | Performs range aggregations/membership-style operations such as SUM, MIN, MAX, bitwise operations, MATCH, or USED server-side. Bound the range because work may scale with visited positions. |
| `ARRING` | Inserts into a fixed-size ring, wrapping/truncating as needed. It is a deliberate bounded recent buffer, not an append-only history. |
| `ARSCAN` | Iterates existing index/value pairs across a range, optionally limited; avoids returning empty holes but is not a stable snapshot under concurrent mutation. |
| `ARSEEK` | Moves the Array's insertion cursor to an index for later `ARINSERT`/`ARRING`; cursor changes are state and must be coordinated if shared. |
| `ARSET` | Sets one or more contiguous values starting at an index. Gaps are sparse rather than allocating placeholder strings for every index. |
| `Redis Geospatial index` | Redis sorted-set-backed coordinate/member model with geospatial query operations. Use for bounded location/radius lookups, not full GIS geometry. |
| `Redis HyperLogLog` | Probabilistic cardinality sketch estimating distinct counts with small bounded memory; it cannot return the underlying members. |
| `Redis JSON` | Hierarchical JSON document structure with path reads/mutations. It avoids whole-value serialization for subfield updates but has its own memory and query semantics. |
| `Redis Time Series` | Timestamped numeric samples with labels, retention, aggregation/downsampling, and range queries. Distinguish sample retention from ordinary key TTL and use compatible server capabilities. |
| `Redis Vector Set` | Stores elements with vectors and optional attributes for similarity search; current vector/filter/indexing behavior is Redis-version specific. It is specialized rather than a generic cache value. |
| `Redis Cuckoo Filter` | Approximate membership structure supporting deletions under its filter semantics, with false-positive/memory tradeoffs. Verify bundled Redis version/product availability. |
| `Redis Bloom Filter` | Approximate membership structure with false positives and no false negatives under correct operation; not a source of the actual set of members. |
| `Redis Count-Min Sketch` | Approximate frequency counter for stream-like observations; estimates can overcount and cannot identify exact cardinality. |
| `Redis Top-K` | Approximate heavy-hitter/ranking structure tracking frequent items, not a complete exact sorted index. |
| `Redis t-digest` | Approximate distribution sketch for quantile/percentile estimation over numeric samples; not an exact sample archive. |
| `Hash field read and update` | Hash commands can fetch/change one or several fields without replacing an entire serialized record. Individual field expiry is supported in recent Redis versions; confirm server feature set. |
| `Set membership and set operations` | `SISMEMBER`/`SMISMEMBER` and union/intersection/difference families support unique membership, with cardinality-only forms where available. Runtime/memory still depend on input sizes. |
| `Sorted-set score and rank range` | Score and rank queries serve ordered ranges and top-N, with tie ordering/offset/limit rules. Avoid unbounded ranges and remember member uniqueness. |
| `JSON path read and update` | JSON path selects nested values for read/update; Redis JSONPath syntax and responses differ from legacy path mode and from other JSONPath implementations. Redis 8.10 adds expression projections/functions. |
| `Data type selection by access pattern` | Pick from required operations, atomicity, ordering, exactness, cardinality, memory, and result size—not familiarity alone. |
| `Cache serialization and deserialization` | Converts application values to/from stored representations. Include schema/version, encoding compatibility, validation, and CPU/size tradeoffs; deserialize untrusted or stale formats defensively. |

## Cross-item comparison

Strings are general scalar bytes; hashes model flat fields; JSON models nested documents. Sets give uniqueness and algebra; sorted sets add score ordering. Lists are end-efficient sequences; arrays provide sparse indexing, aggregation, and explicit ring behavior; streams add entry IDs/log semantics. Exact structures return values/membership; probabilistic structures trade exactness/member retrieval for compact approximate statistics.

## Examples

Use a hash for an online profile with independently updated fields; JSON for nested product metadata; a sorted set for a bounded popularity ranking; a set for tags; an Array for sparse sensor indexes or a ring buffer; a bitmap only for dense numeric flags; HyperLogLog for approximate distinct visitors; and Time Series for timestamped measurements with range aggregation.

## Common mistakes

- Treating every Redis structure as interchangeable key/value serialization.
- Using a bitmap for enormous sparse identifiers.
- Assuming a probabilistic filter/sketch can return the original data or exact counts.
- Assuming Redis 8.10 Arrays behave like a contiguous programming-language array in memory.
- Confusing Array logical length with occupied-element count.
- Using a Stream for durable broker semantics without considering persistence, retention, consumer processing, and recovery.
- Treating vector similarity or JSON path expressions as vendor-neutral APIs.
- Choosing a complex type without measuring encoding, key/field overhead, and response sizes.

## Knowledge checks with answers

1. **What is the Redis Array novelty?** Sparse integer indexing plus range/scan/aggregation/cursor/ring operations; it does not allocate all missing indices.
2. **Why choose a sorted set over a set?** When score/rank ordering and range retrieval are required.
3. **What does HyperLogLog trade away?** Exact members and exact count for compact approximate distinct cardinality.
4. **When is a Hash better than JSON?** A mostly flat record with field-level operations and no need for nested JSON structure.

### Exact terms covered

- `Redis String`
- `Redis Hash`
- `Redis List`
- `Redis Set`
- `Redis Sorted Set`
- `Redis Stream`
- `Redis Bitmap`
- `Redis Bitfield`
- `Redis Array`
- `ARCOUNT`
- `ARDEL`
- `ARDELRANGE`
- `ARGET`
- `ARGETRANGE`
- `ARGREP`
- `ARINFO`
- `ARINSERT`
- `ARLASTITEMS`
- `ARLEN`
- `ARMGET`
- `ARMSET`
- `ARNEXT`
- `AROP`
- `ARRING`
- `ARSCAN`
- `ARSEEK`
- `ARSET`
- `Redis Geospatial index`
- `Redis HyperLogLog`
- `Redis JSON`
- `Redis Time Series`
- `Redis Vector Set`
- `Redis Cuckoo Filter`
- `Redis Bloom Filter`
- `Redis Count-Min Sketch`
- `Redis Top-K`
- `Redis t-digest`
- `Hash field read and update`
- `Set membership and set operations`
- `Sorted-set score and rank range`
- `JSON path read and update`
- `Data type selection by access pattern`
- `Cache serialization and deserialization`

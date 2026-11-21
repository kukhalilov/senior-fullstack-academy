# caching Redis invalidation eviction and stampede — Reference: Redis keyspace, string commands, conditional writes, and expiration APIs

Sources: [Redis 8.8 command reference](https://redis.io/docs/latest/commands/redis-8-8-commands/), [SET](https://redis.io/docs/latest/commands/set/), [Redis keyspace](https://redis.io/docs/latest/develop/using-commands/keyspace/), and [Keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).

## Scope and version

Commands are described against Redis Open Source 8.10 GA, checked 2026-11-20. `SET` comparison modifiers and `DELEX` were added in 8.4; `INCREX` and `MSETEX` are current newer string commands. Older servers may reject these options/commands. Use the exact server's `COMMAND DOCS`/official reference. Cluster multi-key operations may require same-slot keys.

## How this group fits the mental model

Keys identify cached copies and strings store values/counters. Conditions make some read-modify-write patterns atomic; expiry bounds lifetime; scans/notifications support maintenance but are not a durable event log.

## Supplied names explained

| Name | Purpose and behavior |
|---|---|
| `Redis keyspace` | The set of keys in a selected logical database. Key operations and expiration apply within that namespace; cluster topology changes where keys live. |
| `Redis key naming convention` | Structured prefix/version/tenant/entity/query dimensions that avoid collisions and make ownership visible. Avoid PII/secrets and unbounded user-controlled key growth. |
| `Redis string value` | Binary-safe value up to Redis's documented limit, commonly used for serialized payloads and numeric counters. It is a Redis string type, not necessarily UTF-8 text. |
| `GET` | Returns a string value or nil when absent; errors for a key of another type. |
| `SET` | Replaces a key's value and by default clears its prior TTL; supports conditional and expiration modifiers. Use a single command for value plus expiry to avoid a crash gap. |
| `SET NX` | Modifier: set only if key does not exist. Useful for atomic claim/lock acquisition when paired with an expiration and owner token. |
| `SET XX` | Modifier: set only if the key already exists; useful for conditional refresh but not a compare-and-swap by itself. |
| `SET EX` | Modifier: set expiry in relative seconds as part of `SET`. |
| `SET PX` | Modifier: set expiry in relative milliseconds. Common for short lock leases; choose duration and renewal behavior deliberately. |
| `SET EXAT` | Modifier: set expiration at an absolute Unix timestamp in seconds. |
| `SET PXAT` | Modifier: set expiration at an absolute Unix timestamp in milliseconds. |
| `SET KEEPTTL` | Modifier: retain the existing expiration while replacing the value; without it, ordinary replacement removes prior TTL. |
| `SET GET` | Modifier: return the previous value while setting the new one; if the old value is not a string, the command errors and does not perform the set. |
| `SET IFEQ` | Redis 8.4 conditional modifier: set only if the current string equals the supplied value, enabling atomic compare-and-set. |
| `SET IFNE` | Redis 8.4 conditional modifier: set only if the current string differs from the supplied value. Define absent-key behavior from the current command docs and test it. |
| `SET IFDEQ` | Redis 8.4 condition comparing the current value's server-computed digest to a supplied digest before setting. Digest comparison is an API convenience, not a cryptographic authorization check. |
| `SET IFDNE` | Redis 8.4 condition setting only when the current value's digest differs from the supplied digest. |
| `DELEX` | Redis 8.4 command that deletes a string key only if its current value or digest meets a supplied condition; useful for owner-token-safe lock release. |
| `DIGEST` | Redis 8.4 command returning the server-computed hexadecimal digest for a string value. Use only for the documented compare operations, not as a password hash/security primitive. |
| `GETEX` | Returns a string and atomically changes its expiry or persists it; unlike plain `GET`, this mutates expiration metadata. |
| `GETDEL` | Returns a string value and deletes the key atomically; useful for one-time token consumption, but only within that Redis key boundary. |
| `MGET` | Reads multiple string keys in one command/round trip; missing keys produce nil positions. In cluster, keys must be routeable together (typically same hash slot). |
| `MSET` | Sets multiple string keys in one command; it is atomic on one Redis server but has no expiry option. Cluster multi-key constraints apply. |
| `MSETNX` | Sets all specified keys only if none exist; all-or-nothing condition for the keys on a server, with cluster slot restrictions. |
| `MSETEX` | Redis 8.4: atomically sets multiple string keys with a shared relative/absolute expiry or KEEPTTL, and optional NX/XX. Useful when entries share one lifetime. |
| `INCR` | Atomically increments an integer string by one, initializing a missing key as zero. Existing value must be a valid integer. |
| `INCRBY` | Atomically adds an integer amount; missing key starts at zero. Overflow and wrong-type errors need handling. |
| `INCRBYFLOAT` | Atomically adds a floating-point amount. Binary floating-point representation can surprise exact-money use; use integer minor units or another exact representation. |
| `INCREX` | Redis 8.8 atomic numeric increment plus expiry/persistence and optional bounds/overflow policy. Choose integer/float mode and overflow action intentionally; it closes the separate increment/expire gap. |
| `DECR` | Atomically decrements an integer string by one; a missing key is treated as zero before decrement. |
| `DECRBY` | Atomically subtracts an integer amount; ensure the counter's negative/overflow semantics match the application. |
| `APPEND` | Appends bytes to a string, creating it if absent. Repeated retries append repeatedly, so it is not idempotent. |
| `STRLEN` | Returns the byte length of the string, not necessarily the count of Unicode characters. |
| `GETRANGE` | Reads an inclusive byte-index range from a string; offsets can be negative from the end. |
| `SETRANGE` | Overwrites bytes starting at an offset, padding a missing gap with zero bytes; can allocate a large value unexpectedly. |
| `DEL` | Synchronously deletes one or more keys and performs memory reclamation work; latency depends on value size/encoding. |
| `UNLINK` | Removes key references immediately and frees value memory asynchronously, reducing large deletion pauses; work still consumes server resources. |
| `EXISTS` | Counts how many supplied keys exist (including repeated key arguments in its count behavior); not an atomic guarantee that a later operation will see them. |
| `EXPIRE` | Sets a relative TTL in seconds. Options such as NX/XX/GT/LT conditionally set expiry where supported; writes can clear TTL unless preservation is requested. |
| `PEXPIRE` | Sets relative TTL in milliseconds for finer durations. Millisecond precision does not guarantee exact deletion scheduling. |
| `EXPIREAT` | Sets expiry at absolute Unix time in seconds; clock/time choice matters. |
| `PEXPIREAT` | Sets absolute Unix time in milliseconds. |
| `EXPIRETIME` | Returns the absolute expiry timestamp in seconds, or sentinel values for missing/no-expiry keys. |
| `PEXPIRETIME` | Returns absolute expiry timestamp in milliseconds, with missing/no-expiry sentinels. |
| `TTL` | Returns remaining whole seconds; Redis uses `-2` for missing and `-1` for a persistent key. |
| `PTTL` | Returns remaining milliseconds, with the same missing/no-expiry sentinel distinction. |
| `PERSIST` | Removes a key's expiry so it becomes persistent; use carefully in caches to avoid memory leaks. |
| `SCAN` | Iterates keys incrementally by cursor, optionally matching/paging. It can return duplicates and reflect concurrent mutation; avoid blocking `KEYS` scans in production. |
| `Redis key expiration` | Expired keys become logically unavailable; Redis removes them on access and via incremental background work, so physical deletion and notifications may be delayed. |
| `Redis keyspace notification` | Optional Pub/Sub events for key changes/expiration. They are disabled/configurable by event class, fire-and-forget, and not durable or guaranteed exactly at TTL zero. |

## Cross-item comparison

`SET NX` tests existence while `SET IFEQ` compares a known value. `DELEX` is safer than separate `GET` then `DEL` for owner-checked release. `TTL`/`PTTL` report remaining lifetime; `EXPIRETIME`/`PEXPIRETIME` report absolute time. `DEL` frees synchronously; `UNLINK` defers memory reclamation. `MSETEX` combines shared expiry for multiple keys; ordinary `MSET` does not set TTL.

## Examples

Acquire a refresh lock with `SET lock:key random-owner NX PX 10000`; release with a conditional compare-delete (`DELEX` on 8.4+ or an atomic script on older versions). For an incrementing cached metric, Redis 8.8 `INCREX` can update and set TTL atomically. For older versions use a transaction/script with deliberate error and expiration semantics, not two unrelated calls.

## Common mistakes

- Assuming an ordinary `SET` preserves an existing TTL.
- Using `SET NX` without expiry and leaving an abandoned lock forever.
- Deleting a lock unconditionally after its lease expired and another worker acquired it.
- Assuming keyspace notifications are reliable/durable or fire exactly at expiry.
- Using `SCAN` as a stable snapshot or allowing a blocking full-key listing on a production server.
- Storing money in floating-point counters without accounting for representation.
- Assuming multi-key atomicity in cluster across arbitrary hash slots.

## Knowledge checks with answers

1. **Why use `SET ... NX PX` for a lock?** Conditional creation and lease are one atomic command, preventing a permanent lock after process death.
2. **Why conditionally delete by owner token?** The original lease may expire and a different owner may acquire the key before cleanup.
3. **What do TTL return values `-2` and `-1` mean?** Missing key and existing key without expiration, respectively.
4. **Can an expiration notification serve as a durable job queue?** No; notifications are best-effort Pub/Sub and may be delayed/lost.

### Exact terms covered

- `Redis keyspace`
- `Redis key naming convention`
- `Redis string value`
- `GET`
- `SET`
- `SET NX`
- `SET XX`
- `SET EX`
- `SET PX`
- `SET EXAT`
- `SET PXAT`
- `SET KEEPTTL`
- `SET GET`
- `SET IFEQ`
- `SET IFNE`
- `SET IFDEQ`
- `SET IFDNE`
- `DELEX`
- `DIGEST`
- `GETEX`
- `GETDEL`
- `MGET`
- `MSET`
- `MSETNX`
- `MSETEX`
- `INCR`
- `INCRBY`
- `INCRBYFLOAT`
- `INCREX`
- `DECR`
- `DECRBY`
- `APPEND`
- `STRLEN`
- `GETRANGE`
- `SETRANGE`
- `DEL`
- `UNLINK`
- `EXISTS`
- `EXPIRE`
- `PEXPIRE`
- `EXPIREAT`
- `PEXPIREAT`
- `EXPIRETIME`
- `PEXPIRETIME`
- `TTL`
- `PTTL`
- `PERSIST`
- `SCAN`
- `Redis key expiration`
- `Redis keyspace notification`

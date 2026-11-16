# caching Redis invalidation eviction and stampede — Reference: Redis 8.10 hash, list, set, JSONPath, stream, and time-series additions

Sources: [Redis 8.10](https://redis.io/docs/latest/develop/whats-new/8-10/), [Redis 8.10 commands](https://redis.io/docs/latest/commands/redis-8-10-commands/), [JSONPath](https://redis.io/docs/latest/develop/data-types/json/path/), [HIMPORT](https://redis.io/docs/latest/commands/himport/), [LMOVEM](https://redis.io/docs/latest/commands/lmovem/), and [BLMOVEM](https://redis.io/docs/latest/commands/blmovem/).

## Scope and version

Redis Open Source 8.10 is the current general-availability release checked 2026-11-16. This group freezes the major 8.10 data-type features relevant to this cache/data-structure curriculum. It does not attempt to catalogue Redis Search, backup/restore, every command, or broker consumer-group design. Some Redis products may expose different feature sets; check compatibility and server version.

## How this group fits the mental model

Choose a type by its access pattern, then use server operations that avoid extra round trips or oversized results. Redis 8.10 adds bulk and cardinality operations, richer JSON query expressions, and bounded reads. These can reduce application work but do not change source-of-truth, durability, or cache freshness contracts.

## Supplied names explained

### Hash import and compact encoding

| Name | Purpose and behavior |
|---|---|
| `Compact hash templates` | Redis 8.10 internal representation can share a field-name template among hashes with the same schema, reducing repeated field-name storage. Existing hash command semantics remain the same; the optimization is workload/encoding dependent, not a data-model guarantee. |
| `HIMPORT` | Container command for connection-scoped session-based bulk hash import. It prepares a fieldset once, then creates hashes by sending values in that field order. |
| `HIMPORT PREPARE` | Declares a named, ordered set of hash field names for that client connection. Fieldsets are session-local rather than globally visible. |
| `HIMPORT SET` | Creates a hash from a prepared fieldset and supplied values in matching order. Validate value count/order at the client boundary. |
| `HIMPORT DISCARD` | Removes one prepared fieldset from the current connection. |
| `HIMPORT DISCARDALL` | Removes all fieldsets held by the current connection. Disconnect/reset also discards session fieldsets; reconnecting clients must prepare again. |

### Batch list movement

| Name | Purpose and behavior |
|---|---|
| `LMOVEM` | Atomically moves one or more elements between lists and returns moved elements. Supports `COUNT` (up to N) or `EXACTLY` (all requested elements or none) and ordering mode. Multi-key cluster routing must be checked. |
| `BLMOVEM` | Blocking counterpart that waits for source elements up to a timeout, then moves according to selector. Within `MULTI`/`EXEC` or a script it does not block and behaves like `LMOVEM`. |
| `COUNT selector for LMOVEM` | Moves up to the requested count; if fewer are available, moves those available. `BLMOVEM` with COUNT waits while the source is empty, not until the full count exists. |
| `EXACTLY selector for LMOVEM` | Moves the full count only when all requested elements are present; otherwise moves none. `BLMOVEM` can wait for the full amount until timeout. |
| `OBO ordering for LMOVEM` | “One by one” pops and pushes elements individually; destination arrangement depends on both ends and can reverse order. |
| `BULK ordering for LMOVEM` | Moves a batch preserving the elements' relative order. Compare the exact source/destination end combination and test same-key behavior. |

### Set cardinality without materializing results

| Name | Purpose and behavior |
|---|---|
| `SUNIONCARD` | Returns the number of unique members in the union without returning/materializing the full result to the client. Work still depends on input set sizes. |
| `SDIFFCARD` | Returns the cardinality of the first set minus subsequent sets, avoiding transfer of all resulting members. |
| `SUNIONCARD APPROX` | Approximate union-cardinality mode uses a probabilistic estimate with a documented error bound; use only when approximate counts satisfy the product contract. |

### Bounded stream reads

| Name | Purpose and behavior |
|---|---|
| `XREAD MAXCOUNT` | Redis 8.10 bound on total entries returned across all streams, supplementing `COUNT`'s per-stream behavior. It limits response size/count, not message-processing concurrency or delivery semantics. |
| `XREAD MAXSIZE` | Redis 8.10 byte-size bound on the overall read reply to control network and client memory. |
| `XREADGROUP MAXCOUNT` | Same total-result count bound when reading as a consumer group; acknowledgement/pending-entry behavior remains separate. |
| `XREADGROUP MAXSIZE` | Bounds overall reply bytes for a group read; choose alongside entry count and payload-size limits. |

### JSONPath expressions and operators

Redis JSONPath is Redis's own path/query syntax, not a universal standard. In 8.10, expressions can appear at the top level for read projections and add operators/functions below.

| Name | Purpose and behavior |
|---|---|
| `JSONPath projection expression` | A top-level expression can compute a result (for example arithmetic, a function, or `~`) instead of merely selecting nodes. Projection is read-time and does not mutate the stored document; only JSON commands that support expressions can evaluate it. |
| `JSONPath array and object literal equality operators == and !=` | In Redis 8.10 equality/inequality can compare array/object literals as well as scalar literals. Ordering comparisons still have type restrictions; numeric equality treats equal integer/float values compatibly. |
| `JSONPath filter negation !` | Negates a filter condition. It binds more tightly than `&&`/`||`, so parenthesize compound conditions; double negation behaves as an existence test. |
| `JSONPath size operator` | Alias for measuring the number of characters/elements/members of a string/array/object in a filter comparison. |
| `JSONPath sizeof operator` | Size comparison operator; for example test whether an array has N elements. A non-integer right operand is truncated toward zero, while a nonnumeric operand does not match. |
| `JSONPath empty operator` | Tests whether a string, array, or object is empty/nonempty with a boolean operand. |
| `JSONPath in operator` | Tests whether a value is a member of an array/list of candidates in a filter. |
| `JSONPath nin operator` | Tests that a value is not in the supplied array/list of candidates. |
| `JSONPath binary arithmetic operators + - * / %` | Binary arithmetic for numeric expressions in filters/projections. Arithmetic operators require spaces around them because punctuation may otherwise be part of a field name; invalid/non-finite calculations yield Nothing. |
| `JSONPath unary arithmetic operators + and -` | Unary sign operators for numeric expressions, including negative projections. |
| `JSONPath object key operator ~` | Terminal operator returning an object's member names as strings; a non-object contributes no keys. Use bracket field access for names containing `~`; use `keys()` when a composable function is needed. |
| `JSONPath length()` | Returns length for a string, array, or object. Functions can use prefix form (`length(path)`) or method/postfix form where supported. |
| `JSONPath abs()` | Numeric absolute value. |
| `JSONPath ceiling()` | Rounds a numeric value upward to an integer-like ceiling. |
| `JSONPath floor()` | Rounds a numeric value downward to an integer-like floor. |
| `JSONPath match()` | Tests a string against a regular-expression pattern using Redis's documented regex behavior. |
| `JSONPath search()` | Searches for a regular-expression match within a string; distinguish its documented search behavior from a full-string match. |
| `JSONPath concat()` | Concatenates string arguments into a computed result. |
| `JSONPath first()` | Returns the first element of an array. |
| `JSONPath last()` | Returns the last element of an array. |
| `JSONPath index()` | Finds/returns an array element index under the function's documented argument rules. |
| `JSONPath append()` | Computes an appended-array result for a query; it does not itself update the stored JSON document. Use mutation commands for writes. |
| `JSONPath min()` | Aggregates numeric array values to their minimum. |
| `JSONPath max()` | Aggregates numeric array values to their maximum. |
| `JSONPath avg()` | Aggregates numeric array values to their average. |
| `JSONPath sum()` | Aggregates numeric array values to their sum. |
| `JSONPath stddev()` | Computes standard deviation for the supplied numeric array according to Redis's JSONPath function semantics. |
| `JSONPath keys()` | Returns object member names as a composable function result, unlike terminal `~`. |
| `JSONPath count()` | Counts nodes in a node list. |
| `JSONPath value()` | Returns the value only when the node list resolves to exactly one node; otherwise the function's defined empty/Nothing behavior applies. |
| `JSONPath subsetof()` | Set-relation function: true when every member of the left array occurs in the right array; empty left array is a subset. |
| `JSONPath anyof()` | Set-relation function: true when two arrays share at least one element. |
| `JSONPath noneof()` | Set-relation function: true when arrays share no elements; an empty array has no overlap. |

Functions can appear in filters or top-level projections, in prefix or method form. Missing/type-invalid operands or wrong arity produce Nothing, not necessarily a query error. Operators such as `in`, `size`, and `empty` become reserved words; bracket notation may be required to access object fields with those names.

### Time Series additions

| Name | Purpose and behavior |
|---|---|
| `TS.NRANGE` | Redis 8.10 queries an explicit set of time-series keys forward over a time range, returning samples grouped by timestamp. In cluster, all explicit keys must satisfy slot constraints. |
| `TS.NREVRANGE` | Reverse-direction timestamp-grouped query over explicit time-series keys. |
| `TS.READ` | Optionally blocking read that waits for qualifying new samples or timeout instead of polling repeatedly; it is a specialized time-series API. |
| `TS.QUERYLABELS` | Returns matching label names/values for a filter, supporting discovery of series metadata. |
| `TS.MRANGE EXCLUDEEMPTY` | Option on multi-series forward range query that omits matching series with no samples in the requested interval. |
| `TS.MREVRANGE EXCLUDEEMPTY` | Same empty-series omission for reverse multi-series range query. |

## Cross-item comparison

`HIMPORT` optimizes repeated hash schemas; it does not replace general hash field commands. `COUNT` is partial batch movement, while `EXACTLY` is all-or-nothing for the requested count. Stream `MAXCOUNT`/`MAXSIZE` bound a reply but do not acknowledge or process messages. JSONPath projections compute read results; mutation still requires a write command. `TS.NRANGE` groups aligned samples by timestamp across explicit keys, unlike label-filtered `TS.MRANGE` grouping by series.

## Examples

Prepare one hash schema and bulk import many uniform sessions; use `SUNIONCARD` to show a segment size without transferring all members; use `LMOVEM ... EXACTLY 10 BULK` to claim a complete batch; bound a multi-stream reply with both total count and bytes; project `$.items.length()` from a JSON value; and query aligned measurements with `TS.NRANGE` for explicitly supplied series.

## Common mistakes

- Treating compact hash templates as a guaranteed physical layout or stable application API.
- Assuming `HIMPORT` fieldsets are shared across pooled client connections.
- Confusing `COUNT` with `EXACTLY`, or OBO with order-preserving BULK movement.
- Using approximate union cardinality where an exact billing/security count is required.
- Assuming `MAXCOUNT` applies per stream or ensures small bytes when a single entry is large.
- Treating JSONPath as standardized across vendors or as a write/mutation language.
- Using expression projections with a JSON command that accepts only a path to a stored value.
- Omitting cluster key-slot constraints from multi-key list/time-series operations.

## Knowledge checks with answers

1. **Where does an HIMPORT fieldset live?** On the client connection that prepared it; reconnecting requires preparing it again.
2. **How do COUNT and EXACTLY differ?** Up-to-N versus all-N-or-none.
3. **What does XREAD MAXSIZE cap?** Total response bytes, not the size of each individual value or processing work.
4. **Does JSONPath append() mutate Redis JSON?** No; it is a query computation. Use a JSON mutation command for persisted changes.
5. **Why use TS.NRANGE instead of fetching series independently?** It returns aligned data grouped by timestamps, avoiding client-side pivoting for explicit series.

### Exact terms covered

- `Compact hash templates`
- `HIMPORT`
- `HIMPORT PREPARE`
- `HIMPORT SET`
- `HIMPORT DISCARD`
- `HIMPORT DISCARDALL`
- `LMOVEM`
- `BLMOVEM`
- `COUNT selector for LMOVEM`
- `EXACTLY selector for LMOVEM`
- `OBO ordering for LMOVEM`
- `BULK ordering for LMOVEM`
- `SUNIONCARD`
- `SDIFFCARD`
- `SUNIONCARD APPROX`
- `XREAD MAXCOUNT`
- `XREAD MAXSIZE`
- `XREADGROUP MAXCOUNT`
- `XREADGROUP MAXSIZE`
- `JSONPath projection expression`
- `JSONPath array and object literal equality operators == and !=`
- `JSONPath filter negation !`
- `JSONPath size operator`
- `JSONPath sizeof operator`
- `JSONPath empty operator`
- `JSONPath in operator`
- `JSONPath nin operator`
- `JSONPath binary arithmetic operators + - * / %`
- `JSONPath unary arithmetic operators + and -`
- `JSONPath object key operator ~`
- `JSONPath length()`
- `JSONPath abs()`
- `JSONPath ceiling()`
- `JSONPath floor()`
- `JSONPath match()`
- `JSONPath search()`
- `JSONPath concat()`
- `JSONPath first()`
- `JSONPath last()`
- `JSONPath index()`
- `JSONPath append()`
- `JSONPath min()`
- `JSONPath max()`
- `JSONPath avg()`
- `JSONPath sum()`
- `JSONPath stddev()`
- `JSONPath keys()`
- `JSONPath count()`
- `JSONPath value()`
- `JSONPath subsetof()`
- `JSONPath anyof()`
- `JSONPath noneof()`
- `TS.NRANGE`
- `TS.NREVRANGE`
- `TS.READ`
- `TS.QUERYLABELS`
- `TS.MRANGE EXCLUDEEMPTY`
- `TS.MREVRANGE EXCLUDEEMPTY`

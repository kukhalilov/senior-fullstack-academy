# end-to-end system design case studies — Reference: TSID

Sources: [Time-Sorted Unique Identifier reference implementation](https://github.com/f4b6a3/tsid-creator/blob/master/src/main/java/com/github/f4b6a3/tsid/Tsid.java), [Hypersistence TSID overview](https://github.com/vladmihalcea/hypersistence-tsid), [RFC 9562 UUIDs](https://www.rfc-editor.org/rfc/rfc9562.html).

## Scope and version

TSID commonly expands to Time-Sorted Unique Identifier, but it is not one globally standardized bit layout. Implementations differ in epoch, timestamp width, node allocation, counter/randomness split, and text encoding. This lesson uses the `f4b6a3/tsid-creator` implementation as one concrete 64-bit profile: a 42-bit Unix-millisecond time component and a 22-bit random component, with that implementation optionally subdividing random bits into node and counter fields. Do not apply that exact layout to every library called TSID.

## How this group fits the mental model

A time-sortable 64-bit ID can be smaller than a UUID and can cluster writes by time. The price is a finite timestamp range and coordination/configuration requirements if part of the random field identifies a generator node. A 64-bit format also needs special care when passed through JavaScript’s IEEE-754 `Number`, which cannot exactly represent every 64-bit integer; serialize as a decimal string or use a safe integer type such as `BigInt` at the boundary.

Time order is approximate. Generator clocks can be skewed or move backward, and independent nodes do not share a total sequence. The ID should not replace a transaction version, event offset, or database-generated ordering key. An implementation that uses random bits instead of a unique node field has different per-millisecond collision properties from one that assigns worker identities.

## Supplied names explained

- **TSID**: a family label for time-sortable unique identifiers; inspect the chosen library’s actual spec and source before assuming a bit layout.
- **Time component**: in the cited reference profile, 42 bits encode milliseconds since its Unix epoch. The selected epoch controls how long the range lasts.
- **Random component**: in the cited profile, 22 bits remain for uniqueness. A configuration may subdivide these bits into node identity and a counter, or generate random bits according to the implementation.
- **Node identifier**: a configured or allocated generator identity. If two live processes reuse the same node value while sharing the same timestamp/counter space, collisions can occur.
- **Counter**: per-generator state that distinguishes several IDs emitted in one millisecond. Define overflow behavior: wait for the next time tick, reject, or use another documented strategy.
- **Epoch and clock policy**: the base timestamp and response to clock rollback determine range and ordering. NTP correction, VM snapshot restore, container relocation, and host suspension can all affect wall clocks.

## Cross-item comparison

| Scheme | Width/layout | Main trade-off |
| --- | --- | --- |
| TSID implementation profile | Often 64-bit; exact layout varies by library | Compact numeric form, but custom epoch/node configuration and JS precision concerns |
| Snowflake-style ID | Commonly 64-bit timestamp + worker + sequence; bit allocation is deployment-specific | High local throughput with worker allocation and clock rollback handling |
| UUIDv7 | 128-bit standardized UUID with millisecond timestamp prefix | Broad UUID interoperability and random generation without worker assignment, at twice the raw width |
| ULID | 128-bit, 26-character text with timestamp and randomness | Human-readable sortable text, but separate community spec and larger storage than 64-bit IDs |

These are not equivalent guarantees. Compare deployed library compatibility, database type, global worker management, clock behavior, sort requirements, privacy, and migration policy.

## Examples

Before deploying a node-based TSID profile, allocate node IDs from one authoritative configuration system and prevent overlapping assignments during rolling deploys. Test two processes with the same node ID to verify the failure mode; do not assume the library detects duplicate deployment configuration. Simulate high generation volume within one millisecond, counter exhaustion, system-clock rollback, process restart, and recovery from VM snapshot. Verify whether the generator waits, fails, or advances its logical time.

For a .NET/JavaScript API returning an identifier stored as a signed 64-bit database value, send a decimal string in JSON. Convert and validate it on the server. In a browser, parse with `BigInt` only if the application needs numeric comparison; otherwise preserve the string and sort using the documented encoding. If ordering is a business requirement, persist an independent authoritative sequence.

## Common mistakes

- Claiming one universal TSID layout or epoch.
- Assuming time sorting gives strict total order across hosts.
- Reusing node IDs during deployment overlap.
- Ignoring clock rollback and counter exhaustion.
- Sending 64-bit IDs as JSON numbers and losing precision in JavaScript.
- Assuming a smaller key is always better without testing index and application costs.
- Treating ID generation as an authorization or secrecy mechanism.

## Knowledge checks with answers

1. **Is TSID a single IETF standard?** No. Verify the exact library and layout; the name is used by multiple schemes.
2. **What determines the timestamp range?** Timestamp bit width, unit, and chosen epoch.
3. **Why does a node/counter profile need unique worker allocation?** Two generators sharing the same time and counter space can emit identical values.
4. **Why should a 64-bit TSID often be serialized as text?** JavaScript numbers cannot exactly represent all 64-bit integer values.

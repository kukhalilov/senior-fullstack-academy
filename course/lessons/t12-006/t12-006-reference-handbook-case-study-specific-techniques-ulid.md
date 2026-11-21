# end-to-end system design case studies — Reference: ULID

Sources: [Canonical ULID specification](https://github.com/ulid/spec), [RFC 9562 UUIDs](https://www.rfc-editor.org/rfc/rfc9562.html).

## Scope and version

ULID is a community identifier format, not an IETF UUID version. Its canonical layout is a 128-bit value represented as 26 Crockford Base32 characters: a 48-bit Unix-millisecond timestamp followed by 80 bits of randomness. Libraries can add generator behaviors such as monotonic increments; verify the selected library’s documented guarantees. ULID should not be treated as a cryptographic secret or a globally ordered event sequence.

## How this group fits the mental model

ULID tries to combine UUID-sized identity with readable, lexically sortable text. Because the timestamp comes first, canonical strings sort approximately by timestamp when compared using the specified alphabet and case conventions. The random tail enables independent generation, with collision probability depending on generator quality and the number of IDs made in the same time bucket.

Sorting is not the same as strict monotonicity. The base format does not promise the order of IDs generated within the same millisecond. The canonical specification describes an optional monotonic factory that increments the random part for same-millisecond IDs from that generator. That local rule does not coordinate separate processes or machines. Clock rollback can also produce IDs that sort before more recently generated IDs.

## Supplied names explained

- **ULID**: 48 timestamp bits plus 80 randomness bits, encoded into a 26-character string.
- **Crockford Base32**: alphabet designed to reduce visual ambiguity; the canonical alphabet omits `I`, `L`, `O`, and `U`. Parsing rules should follow the spec and library rather than inventing permissive aliases.
- **Canonical encoding**: 26 characters represent 130 potential Base32 bits, but only 128 are valid. The first character is constrained so decoders must reject values outside the 128-bit range.
- **Monotonic factory**: a generator mode that increments the random component when multiple IDs are generated within one millisecond by the same factory. If the component overflows, the generator must fail or follow its documented behavior; do not assume unbounded generation.
- **Timestamp extraction**: the first 48 bits reveal creation time to millisecond precision. This can disclose activity patterns and should be considered in public identifiers.

## Cross-item comparison

| Choice | Format and ordering | Suitable when |
| --- | --- | --- |
| ULID | 128 bits, 26 Base32 characters, 48-bit time prefix | Human-facing compact text and approximate time ordering are useful |
| UUIDv7 | 128-bit UUID standardized by RFC 9562, timestamp-first | UUID interoperability and standardized layout matter |
| UUIDv4 | 128-bit random UUID without creation time prefix | Time privacy and unpredictable identifiers matter more than insertion locality |
| Database sequence | Numeric order allocated by a database authority | Strict local ordering is needed and centralized coordination is acceptable |

ULID and UUIDv7 both expose time and can improve locality in some storage patterns; neither guarantees correct global ordering or secrecy. Compare ecosystem library support, binary storage, encoding/collation, validation, and migration tooling before choosing.

## Examples

Suppose two application nodes create records in the same millisecond. A monotonic ULID factory on node A may increment its random tail and return values in local creation order. Node B has an independent factory and cannot know that sequence; its IDs may compare before or after A’s. Store the ULID as its canonical string or decode it to 16 bytes consistently, then test indexed ordering using the actual database collation. Keep a separate `created_at` value if authoritative business time or audit precision is needed.

When parsing untrusted IDs, validate length, alphabet, overflow, and canonicalization. If the value is used as a public resource locator, apply authorization independently: opacity and random bits are not access control. If predictability is a security concern, use a dedicated cryptographic capability token rather than relying on the ULID timestamp-plus-random layout.

## Common mistakes

- Claiming every ULID is strictly monotonic because the alphabet sorts lexically.
- Assuming monotonicity spans processes, hosts, restarts, or clock rollback.
- Treating ULID as a standardized UUID version.
- Accepting over-range 26-character strings without checking the top bits.
- Assuming an embedded timestamp is secret or tamper-proof.
- Using ULID as an authorization token or event-log sequence.
- Ignoring case and collation rules when sorting textual identifiers.

## Knowledge checks with answers

1. **What is the ULID bit split?** 48 bits of Unix-millisecond time and 80 bits of randomness.
2. **Does the standard layout guarantee order within one millisecond?** No; an optional monotonic generator can provide local ordering under its documented scope.
3. **Why can some 26-character strings be invalid?** Base32 text can encode 130 bits, but a ULID contains only 128 bits, so overflow values must be rejected.
4. **Is a ULID a secret capability?** No. It exposes time and its random field is designed for uniqueness, not authorization semantics.

# HTTP gRPC GraphQL and messaging comparisons — Reference: HTTP wire versions that carry the shared HTTP semantics

Sources: [HTTP/1.1 RFC 9112](https://www.rfc-editor.org/rfc/rfc9112.html), [HTTP/2 RFC 9113](https://www.rfc-editor.org/rfc/rfc9113.html), [HTTP/3 RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html), and [HTTP Semantics RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

HTTP versions share core semantics while differing in connection and message framing. Deployment negotiation, intermediary support, and TLS configuration determine the protocol actually used.

## How this group fits the mental model

An API contract describes resources, methods, fields, and outcomes. The wire version carries those semantics using its own framing, multiplexing, and transport mechanisms.

## Supplied names explained

### `HTTP/1.1`

Textual HTTP message framing over a connection, with persistent connection behavior defined by the standard. It remains broadly interoperable and may use multiple connections for parallelism.

### `HTTP/1.1 persistent connection`

Allows multiple request/response exchanges over a TCP connection when framing permits. Correct Content-Length/chunk framing and connection handling prevent response ambiguity and request desynchronization.

### `HTTP/1.1 message framing`

Determines message body boundaries through framing fields/transfer coding. Conflicting parsing across intermediaries is a security risk; conform to the RFC and reject ambiguous framing.

### `HTTP/2`

A binary-framed protocol carrying HTTP semantics over multiplexed streams, generally over TLS/TCP in browsers. It improves concurrent exchanges but TCP loss can affect streams sharing that connection.

### `HTTP/2 stream multiplexing`

Interleaves independent request/response streams on one connection. It reduces application-level head-of-line blocking but does not remove TCP-level loss effects.

### `HTTP/2 field compression`

HPACK compresses header fields across HTTP/2 messages. Implementations must respect dynamic table and security rules; compression does not change field semantics.

### `HTTP/2 stream and connection flow control`

Controls data buffering at both individual stream and connection levels. Respect windows and updates to avoid resource exhaustion or stalled transfers.

### `HTTP/3`

Maps HTTP semantics onto QUIC streams. It uses QUIC transport, typically over UDP, with encryption and connection management integrated into QUIC.

### `QUIC transport for HTTP/3`

Provides streams, congestion control, encryption, and connection migration properties used by HTTP/3. UDP blocking or network policy can affect reachability; fallback behavior may matter.

### `HTTP/3 per-stream flow control`

QUIC flow control limits bytes sent on each stream and connection. Independent stream flow control prevents one stream’s application backpressure from directly consuming all stream credit.

### `HTTP/3 connection establishment`

QUIC combines transport and cryptographic handshake behavior and can support resumption/0-RTT with replay caveats. Do not assume early data is safe for non-idempotent operations.

### `HTTP semantics versus HTTP wire version`

Methods/status/fields and resource semantics are specified separately from HTTP/1.1, HTTP/2, or HTTP/3 framing. An application should not infer changed method semantics merely because a new wire version is negotiated.

## Cross-item comparison

HTTP/1.1 frames messages on a persistent connection; HTTP/2 multiplexes framed streams over TCP; HTTP/3 uses QUIC streams. All carry HTTP semantics, while their loss, flow-control, handshake, and middlebox properties differ.

## Examples

A browser can use HTTP/3 for a resource GET and receive the same HTTP status/cache semantics it would over HTTP/2. A network may fall back to HTTP/2 or HTTP/1.1; application behavior should not depend on a particular wire version unless explicitly negotiated.

## Common mistakes

- Calling HTTP/2 a new application method model.
- Assuming HTTP/2 multiplexing removes every head-of-line effect.
- Assuming HTTP/3 works through all UDP-restrictive networks.
- Reusing 0-RTT for unsafe operations without replay analysis.
- Confusing field compression with encrypted or semantically hidden headers.

## Knowledge checks with answers

1. **What stays shared across versions?** HTTP semantics.
2. **What transport does HTTP/3 use?** QUIC.
3. **Does HTTP/2 multiplexing remove TCP loss effects?** No.

### Exact terms covered

- `HTTP/1.1`
- `HTTP/1.1 persistent connection`
- `HTTP/1.1 message framing`
- `HTTP/2`
- `HTTP/2 stream multiplexing`
- `HTTP/2 field compression`
- `HTTP/2 stream and connection flow control`
- `HTTP/3`
- `QUIC transport for HTTP/3`
- `HTTP/3 per-stream flow control`
- `HTTP/3 connection establishment`
- `HTTP semantics versus HTTP wire version`

<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# streams file system serialization sockets and HTTP clients — Interview questions and reasoning

## Core questions

1. What does a `Stream` guarantee, and what capabilities are optional?
2. Why can a stream read return fewer bytes than requested?
3. How are bytes, encoding, framing, and serialization different?
4. Why does TCP require application framing?
5. How do you choose between whole-file helpers and streaming?
6. What is the `JsonDocument`/`JsonElement` lifetime relationship?
7. Why is source-generated JSON useful for trimming/AOT?
8. How should user-controlled paths be validated?
9. How should an HTTP response body be bounded and disposed?
10. How do you safely reuse `HttpClient` connections and refresh DNS?
11. When is retrying an HTTP request unsafe?
12. Why is decompression a resource-security boundary?

Sources: [stream I/O](https://learn.microsoft.com/en-us/dotnet/standard/io/), [System.Text.Json](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview), [TCP classes](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/sockets/tcp-classes), and [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines).

## Concise interview answers

1. A stream provides ordered byte I/O operations; read/write/seek support is instance-specific and advertised by capability properties.
2. A stream may return any available bytes up to the requested count. For fixed-size fields, loop or use `ReadExactly`.
3. Bytes are transport/storage units; encoding maps characters to bytes; framing separates messages; serialization maps structured values to a data contract.
4. TCP is an ordered byte stream and does not preserve write/read message boundaries; define a length prefix, delimiter, or protocol frame.
5. Use whole-file helpers for small bounded content; streams for large/unbounded input or incremental processing.
6. Elements borrow document storage and become invalid on disposal unless cloned.
7. Generated metadata is statically visible, reduces reflection reliance, and helps linkers/AOT know required contracts.
8. Reject rooted/traversal input, canonicalize and check containment, account for symlinks/TOCTOU, and rely on safe handle/open semantics for strong adversarial cases.
9. Use `ResponseHeadersRead`, count bytes while streaming, enforce a maximum, propagate cancellation, check status, and dispose response/content.
10. Reuse a long-lived client with finite `PooledConnectionLifetime` or use `IHttpClientFactory` to pool and rotate handlers.
11. If the server may have applied a side effect and the operation is not idempotent/deduplicated, a retry can duplicate it.
12. A small compressed payload may expand enormously; limit decompressed bytes and CPU/time as well as compressed input.

## Deep follow-up answers

### What should a network protocol do with partial reads?

Maintain parser state and accumulate enough bytes for the next frame. For a fixed header, exact-read it; validate the advertised payload length before allocation; then read precisely the frame or stream it incrementally. Preserve extra bytes already received after one frame. Every buffer and frame needs a bound and cancellation/deadline.

### What is a safe file upload path policy?

Treat the user value as a name, not an authorized path. Reject rooted paths and traversal components, resolve against a trusted root, account for symbolic-link traversal, use restrictive permissions and safe create modes, and avoid `Exists` then open. If an attacker can mutate the directory concurrently, lexical canonicalization is insufficient; use platform handle-relative operations or isolate storage so symlink/race attacks cannot escape.

### How do you define a robust JSON contract?

Specify naming, required/optional fields, number and polymorphism rules, unknown-member behavior, version migration, and limits. Use source-generated metadata for known models when possible. Bound bytes, depth, strings, collection sizes, and processing time; validate domain invariants after deserialization. Unknown JSON is not trusted merely because it parses.

### Explain `ResponseContentRead` versus `ResponseHeadersRead`.

The former normally buffers the response content before `SendAsync` completes and is convenient for small bounded bodies. The latter completes after headers, leaving body consumption to the caller, which enables streaming and backpressure but requires explicit size limits and timely response disposal.

### How do TCP and UDP differ operationally?

TCP provides a connection-oriented ordered byte stream and requires application framing. UDP preserves datagram boundaries but does not guarantee delivery, ordering, or duplicate suppression. UDP protocols must handle loss/retry/congestion and datagram sizing themselves.

## Scenario questions

### Scenario: A JSON endpoint hangs or exhausts memory

Inspect whether it buffers the full body, whether `Content-Length` is trusted, whether decompression expands input, parser depth/collection limits, cancellation propagation, and response disposal. Switch to bounded streaming where needed and measure throughput/latency.

### Scenario: The same TCP request sometimes parses incorrectly

Look for an assumption that one `Read` equals one message. Add explicit framing, handle partial headers/bodies and multiple frames per read, validate length, and test chunking variations.

### Scenario: A file API allows `../secret` access

Trace path construction and authorization, including rooted inputs, separators, case rules, symbolic links, and check/open races. Use a trusted root, canonical containment checks plus handle-level protections for adversarial mutation, restrictive permissions, and safe create semantics.

### Scenario: Connections use a stale DNS address

Existing pooled connections keep their resolved endpoint. Set a finite `PooledConnectionLifetime` or use factory handler rotation so new connections perform fresh resolution; distinguish DNS refresh from retry and service health.

## Tradeoffs and alternatives

- **Synchronous / asynchronous I/O:** sync is simpler for bounded tools; async scales better for many waits but requires cancellation/lifetime discipline.
- **Buffered / streamed response:** buffered is convenient for known small bodies; streaming limits memory and enables backpressure with more explicit cleanup.
- **DOM / reader-writer:** DOM is easy for navigation/mutation; reader/writer is incremental and allocation-conscious but more stateful.
- **Whole-file / incremental file reads:** whole-file APIs simplify bounded small inputs; streams scale to large data.
- **TCP / UDP:** TCP reliability/order versus datagram boundaries and application-managed delivery behavior.
- **Long-lived `HttpClient` / factory:** direct lifetime control versus DI-configured handler pooling/rotation.

## Common weak answers

- “Read fills the buffer.” Partial reads are normal.
- “TCP sends packets that map to writes.” Application writes do not define receive boundaries.
- “JSON parsing validates the request.” Parsing checks syntax/shape; domain validation and resource limits remain.
- “`GetFullPath` prevents all path attacks.” It does not resolve link races or perform authorization.
- “`ResponseHeadersRead` is automatically safer.” It requires the caller to bound and dispose the stream.
- “Retry GET/POST on every exception.” Retry safety depends on side effects, idempotency, content replayability, and failure point.
- “TLS means the user is authorized.” Transport security and application authorization are distinct.
- “Compression always saves resources.” It can increase CPU and expand data dramatically.

## Self-check rubric

Score each from 0 (cannot explain) to 2 (accurate with an example):

1. States stream capability, partial-read, and disposal rules.
2. Separates bytes, encoding, framing, and serialization.
3. Designs bounded/cancellable file and HTTP I/O.
4. Explains JSON contract, DOM lifetime, and trimming/source-generation choices.
5. Handles filesystem path and link threats realistically.
6. Compares TCP/UDP and client/handler lifetimes accurately.

10–12: ready to discuss production I/O; 7–9: revisit the missed boundary; 0–6: redo the framing and ownership exercises before memorizing APIs.


# streams file system serialization sockets and HTTP clients — Core concepts and how they fit together

## Learning objectives

Distinguish streams from messages, bytes from text, and serialization from transport; design correct exact/framed reads; manage stream and response ownership; choose sync/async and buffering based on workload; protect filesystem and deserialization boundaries; and explain TCP, UDP, and HTTP behavior.

## Prerequisites

You should understand arrays, spans/memory, async/await, cancellation tokens, exceptions, and disposal. Memory ownership and async fundamentals are covered in adjacent lessons; this lesson applies them to I/O APIs.

Sources: [stream I/O guidance](https://learn.microsoft.com/en-us/dotnet/standard/io/), [System.Text.Json overview](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview), and [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines).

## Core concepts

### A stream is a capability-bearing byte sequence

`Stream` standardizes reading and writing bytes, but an instance can be read-only, write-only, non-seekable, or asynchronous. Check `CanRead`, `CanWrite`, and `CanSeek` before using optional capabilities. `Length` and `Position` are not available on every stream. Seeking changes the cursor for seekable streams; it does not make network protocols rewindable.

A successful `Read` may return any positive number up to the requested count. A zero return at end-of-stream means no more data; for a fixed-size protocol field, loop or use `ReadExactly`/`ReadExactlyAsync`. `ReadAtLeast` is useful when a minimum amount is required but a short result can be valid. `CopyTo` transfers until EOF; it does not add message framing or impose a total-size limit.

### Bytes, encoding, and framing are different layers

An encoding maps characters to bytes. UTF-8 is variable-width; decoding bytes as text can encounter invalid sequences, handled by replacement or exception fallbacks. A decoder may need state across chunk boundaries. Neither `StreamReader.ReadLine` nor `BinaryReader.ReadString` defines a network protocol unless both sides agree on framing/encoding/length representation.

TCP is an ordered byte stream. One `Send` may be received by multiple reads, and one read may contain several application messages. Add framing such as a length prefix or delimiter with escaping and parse incrementally. UDP preserves datagram boundaries but packets can be lost, duplicated, or reordered; message size and network behavior are constrained.

### Buffering, async, and ownership

Buffering can reduce syscalls but adds memory and latency. `BufferedStream` wraps another stream; flush means push buffered data toward the underlying stream, not necessarily durable storage. `StreamWriter.AutoFlush` trades batching for prompt output. Buffer size should follow workload and defaults unless measurement justifies tuning.

Async I/O lets a thread return while waiting for I/O completion. It does not guarantee fewer bytes or faster CPU serialization. Pass cancellation through every layer and dispose resources. A wrapper often owns the inner stream by default; `leaveOpen` changes that relationship. Never return a pooled buffer or dispose an owner while an asynchronous operation still uses its memory.

### Filesystem operations are stateful and security-sensitive

Paths are platform-dependent names. Canonicalize and authorize against a trusted root, but remember that symbolic links and concurrent changes can create TOCTOU races. `File.Exists` is only a momentary observation and may return false for several error cases; it cannot secure a subsequent open. Use restrictive permissions, safe create modes, and handle-based operations where the threat model requires them.

Enumeration APIs often stream results, while `GetFiles` materializes arrays. Recursive enumeration can encounter inaccessible paths, reparse points, changing directories, and huge trees. `EnumerationOptions` controls portions of traversal but does not make an untrusted root safe. Atomic replacement typically writes a temporary file then renames/replaces on the same filesystem, subject to OS semantics and crash-durability requirements.

### Serialization is a data contract

Serialization defines names, defaults, number handling, polymorphism, references, unknown members, and versioning. `System.Text.Json` reflection mode discovers runtime metadata; source generation makes known contracts visible and can reduce reflection/trimming constraints. `JsonDocument` is immutable and disposable, with `JsonElement` views tied to its document; clone when data must outlive it. `JsonNode` is mutable DOM. `Utf8JsonReader`/`Writer` support low-allocation incremental processing but require correct state management across buffers.

Never enable arbitrary object deserialization for untrusted data. Bound input size, depth, string lengths, decompressed bytes, and processing time. `BinaryFormatter` is obsolete and unsafe. XML also needs secure parser settings for external resources and expansion behavior. Compression reduces transfer size but attackers can supply small compressed data that expands greatly.

### Network clients and connection lifetimes

`HttpClient` instances use handlers and connection pools. Recreating them per request can exhaust sockets; use a long-lived client with `PooledConnectionLifetime` or `IHttpClientFactory`. Request and response messages/content have ownership and disposal requirements. `ResponseContentRead` buffers content before returning; `ResponseHeadersRead` returns after headers so the caller can stream and enforce limits.

Set timeouts and cancellation deliberately. `HttpClient.Timeout` and per-call cancellation can interact; linked tokens clarify operation budgets. Retry only when the operation is safe to repeat and the failure is transient; a POST is not automatically idempotent. TLS protects the transport channel but does not replace application authentication or authorization.

## Mechanisms and relationships

Use this pipeline for I/O design:

```text
resource ownership → byte source/sink → buffering → framing → decoding/serialization
       │                    │              │          │              │
 disposal/lease        partial reads    size cap   message model   schema/version
       └──────────────── cancellation, timeout, exception and security policy ────────┘
```

For an HTTP JSON response: send with cancellation; check status; choose buffered versus streaming mode; bound bytes; dispose response; parse with explicit options/source metadata; validate the resulting domain data. Each layer has its own failure modes and limits.

## Worked examples

### Read exactly a fixed header

```csharp
byte[] header = new byte[8];
await stream.ReadExactlyAsync(header, cancellationToken);
```

This either fills the requested buffer or throws on premature EOF. It still does not validate the header's meaning, byte order, declared payload length, or maximum frame size; validate those before allocating/reading the body.

### Bound a streamed HTTP response

With `ResponseHeadersRead`, read chunks into a fixed-size buffer while tracking cumulative bytes. Stop and fail once a configured maximum is exceeded, even if `Content-Length` is missing or inaccurate. A `Content-Length` precheck is useful but cannot replace the streaming count.

## Misconceptions and edge cases

- “One `Read` returns all requested bytes.” It may return fewer; use exact/minimum semantics or loop.
- “TCP preserves my message boundaries.” TCP preserves byte order, not application writes/reads as messages.
- “`Flush` means bytes are durable on disk.” It usually flushes managed buffers to the next layer; durable storage may need OS/device-specific guarantees.
- “Async makes the operation faster.” It primarily avoids blocking a thread during waits; CPU work and throughput still need measurement.
- “`File.Exists` followed by `Open` is safe.” State can change between calls and the result is not authorization.
- “JSON parsing makes input trusted.” Validate schema/domain values and bound resources.
- “A small compressed payload is small work.” Decompressed size can be enormous.
- “A new `HttpClient` per request gives a fresh connection.” It can create connection churn and socket exhaustion.
- “TLS authenticates the user's business permissions.” TLS authenticates/protects a channel according to certificates; application authorization is separate.

## Knowledge checks with answers

1. **What does TCP provide?** An ordered byte stream, not message boundaries.
2. **Why use `ReadExactlyAsync` for a fixed header?** A normal read may return fewer bytes; exact-read semantics fill or signal premature EOF.
3. **What does `ResponseHeadersRead` change?** It returns before the full content is buffered, allowing streaming and explicit size limits.
4. **Why is `File.Exists` not a safe authorization check?** It is a transient observation and a race can occur before open; paths/symlinks also affect the target.
5. **When is source-generated JSON useful?** For known contracts and trimming/AOT-friendly metadata, while still requiring explicit schema/resource limits.

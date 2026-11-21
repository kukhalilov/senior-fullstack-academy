
# streams file system serialization sockets and HTTP clients — Big-picture orientation and mental model

## Problem and purpose

Applications move bytes between memory, files, pipes, networks, and other programs. They also turn structured values into bytes and bytes back into values. Bugs arise when code confuses a byte stream with a message, text with bytes, a path with a safe authorized file, or a view of a buffer with ownership of that buffer.

This topic builds one coherent I/O model across streams, files, serialization, sockets, and HTTP. It emphasizes the boundaries that control correctness: capabilities, framing, encoding, lifetime, cancellation, untrusted data, and resource limits.

## Plain-language mental model

A **stream** is like a conveyor belt of bytes. It may let you read, write, seek, or do only some of those things. A file stream, memory stream, and network stream share the abstraction, but differ in what their capabilities and costs mean. A `Read` call is allowed to return fewer bytes than requested; a stream is not automatically divided into application messages.

Text is a rule for mapping characters to bytes. Encoding and decoding must be explicit, and malformed input needs a defined policy. Serialization is another contract: it chooses how values become data, which fields participate, how versions evolve, and how polymorphism works. Deserialization of untrusted bytes needs type and size controls.

TCP provides a reliable ordered byte stream, not message boundaries. UDP preserves datagram boundaries but has different delivery guarantees. HTTP adds request/response semantics; most application code should use `HttpClient` with connection reuse, cancellation, bounded response handling, and explicit status/error policies.

## How the parts fit together

1. **Open a resource** with the correct permissions/share mode and validate user-controlled paths against an authorization boundary.
2. **Own its lifetime.** Dispose streams/readers/responses deterministically; use `await using` when asynchronous disposal is needed. Know whether wrappers close the underlying stream (`leaveOpen`).
3. **Move bytes correctly.** Check stream capabilities, loop or use exact-read APIs when a protocol requires a fixed number of bytes, and do not assume one read fills a buffer.
4. **Add meaning explicitly.** Apply encoding, message framing, serialization, compression, and versioning as separate layers.
5. **Constrain untrusted input.** Limit bytes, nesting, decompressed size, time, and accepted types before expensive processing.
6. **Use network APIs with lifecycle in mind.** TCP framing belongs to the application protocol; UDP loss/reordering is possible; `HttpClient` should reuse handlers/connections and dispose request/response content.

## Concept map

```text
file / memory / pipe / socket ── Stream bytes ── framing + encoding ── structured values
                                      │                                  │
                                capabilities                    serializer contract
                                      │                                  │
                    sync/async + cancellation + ownership + size limits
                                      │
             TCP byte stream / UDP datagrams / HTTP request-response
```

## End-to-end walkthrough

Imagine downloading a JSON file. `HttpClient` sends a request through a reused handler/connection pool. With `ResponseHeadersRead`, the app can inspect status and headers before streaming the body. It limits bytes read, handles cancellation, disposes the response, and passes the byte stream to `System.Text.Json`. If the data is compressed, a decompression stream is another layer and the app still enforces a decompressed-size limit. JSON parsing uses an explicit type contract and bounded input policy; parsing a stream does not make an untrusted payload safe automatically.

If the result is written to disk, write to a temporary file in the target directory, flush/close it, and replace/move it atomically where platform semantics allow. Validate the final destination after canonicalization and account for symbolic links and races; checking `File.Exists` and opening later is not an authorization guarantee.

## When to use it and tradeoffs

- Use `Stream` when a component should process bytes independently of whether they come from a file, memory, or network.
- Use all-at-once `File.ReadAllBytesAsync`/text helpers for small bounded files; use incremental streams for large or unbounded input.
- Use `System.Text.Json` for JSON contracts; prefer source generation for known models and trimming/AOT-friendly applications.
- Use sockets only when you need transport-level control. Prefer `HttpClient` for HTTP semantics and connection pooling.
- Use async I/O to avoid blocking a thread during scalable waits; async does not make CPU parsing faster or remove the need for cancellation and bounds.
- Compress only when bandwidth savings justify CPU and decompression risk; enforce output limits against compression bombs.

APIs evolve by target framework; web defaults for JSON can differ from library defaults. Use official [stream I/O guidance](https://learn.microsoft.com/en-us/dotnet/standard/io/), [System.Text.Json overview](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/overview), [socket overview](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/sockets/sockets-overview), and [HttpClient guidance](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines).

## What later lessons cover

The concepts lesson separates byte transport, text, framing, serialization, and resource ownership. Reference units enumerate stream/readers/writers, file/path and filesystem safety, JSON/compression, and sockets/HTTP APIs. Practice applies bounded async reads and safe file/network handling. The interview lesson develops protocol, lifetime, and performance tradeoffs.

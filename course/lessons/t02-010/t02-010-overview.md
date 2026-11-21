# HTTP request response headers forms files and streaming bodies — Big-picture orientation and mental model

## Problem and purpose

Every web request carries metadata and possibly a body; the response carries a status, metadata, and possibly a body. ASP.NET Core exposes that exchange through one per-request `HttpContext`. The framework handles ordinary JSON binding and responses for most endpoints. Direct body APIs matter when building middleware, streaming large files, handling unusual formats, or controlling headers and transport behavior. [HTTP context](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-11.0) [Request/response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

The hard part is resource ownership and timing: request bodies are usually one-pass; response headers become fixed when the response starts; uploads cross trust and size boundaries; and streams/pipelines have different buffer rules.

## Plain-language mental model

Treat `HttpContext` like a folder for one trip through the server. It contains who is calling, where the request is going, the incoming body reader, response writer, cancellation signal, and server-specific features. Keep that folder inside the request; do not save it for background work.

The incoming body is a conveyor belt: once bytes pass a reader, a later reader cannot simply rewind it. Buffering creates a replayable copy but spends memory or temporary disk. A `PipeReader` offers slices of bytes with explicit consumed/examined positions; those slices expire when you advance. The outgoing response is a one-way commitment: before start, status and headers are editable; after start, bytes may already be on the network. [Pipelines](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

## How the parts fit together

| Layer | Main abstraction | Decision |
|---|---|---|
| Request context | `HttpContext`, features, identity | Which request is this, and who owns its state? |
| Metadata | Method, path, query, headers, cookies | Which input source is appropriate and trustworthy? |
| Request content | `Body`/`BodyReader`, JSON, forms | Is it bounded, one-pass, buffered, or streamed? |
| Uploaded file | `IFormFile` or multipart sections | Is convenient buffering safe at expected concurrency? |
| Response | Status, headers, cookies, body | Has it started, and must the writer flush? |
| File output | File result or stream | Who owns the stream and what range/validator semantics apply? |

## Concept map

```text
HttpContext
├── request metadata: method / path / query / headers / cookies / user
├── request content: Stream or PipeReader → parse once or bounded buffer
├── features: server capabilities and transport limits
└── response: status / headers / cookies → start → stream or PipeWriter
                                      └── after start: no replacement response
```

Never trust a client filename or `Content-Type`; do not treat `Content-Length` as a security boundary by itself. Apply size limits at every relevant layer (proxy, server, multipart parser, application, storage). `IFormFile` is convenient but form parsing buffers file content; direct multipart streaming reduces memory/disk pressure when processing large uploads. [Upload guidance](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-11.0)

## End-to-end walkthrough

A request posts a multipart form. The server creates `HttpContext`; middleware may inspect headers without reading the body. Binding `IFormFile` causes form parsing and file buffering according to configured thresholds and limits. The application validates size/content, generates its own storage name, and copies bytes to storage while honoring cancellation. It never uses the client filename as a path. For very large input, a streaming parser reads each multipart section and streams the file section to a bounded destination. The response sets status and headers before writing; a file result can provide range and validator behavior when configured. [Upload guidance](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-11.0)

## When to use it and tradeoffs

Use framework binding for routine, bounded JSON and small uploads. Use stream APIs for simple sequential copy; use `PipeReader`/`PipeWriter` when incremental parsing, backpressure, or lower-allocation processing justifies managing buffer cursors. Buffer only when a second read is truly required. Streaming is chiefly a resource-control choice, not a promise of higher throughput. Keep upload storage outside the application tree and validate server-side.

## What later lessons cover

The concepts lesson explains request lifetime, metadata, content parsing, stream versus pipeline semantics, response start, and upload limits. References cover the exact request/context surface, body/JSON/form APIs, form binding and secure uploads, and response/cookie/streaming/file APIs. Practice diagnoses failures and designs bounded upload/download flows.

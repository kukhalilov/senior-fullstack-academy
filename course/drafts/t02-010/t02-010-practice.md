# HTTP request response headers forms files and streaming bodies — Exercises and worked solutions

## Goals

Choose the right body abstraction, preserve downstream reads, configure layered limits, stream uploads safely, and handle the response commit boundary.

## Worked example

Middleware reads JSON for logging and then the endpoint deserializes it again. Resetting `Request.Body.Position` is not a universal replay mechanism, especially when the JSON helper uses `BodyReader`. Prefer metadata-only logging. If a second stream consumer is truly required, use `EnableBuffering` before reading, impose a cap, rewind the stream, and keep all consumers on the same body abstraction. .NET 10 changed framework JSON paths to PipeReader-based parsing, so custom converters must correctly handle segmented values. [ASP.NET Core 10 JSON change](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0)

## Exercises

1. **Context escape:** A singleton queues `HttpContext` for background processing. Explain the lifetime problem and design a replacement message.
2. **Repeated JSON read:** A middleware reads from `BodyReader`, then resets `Body.Position`; endpoint JSON parsing fails. Diagnose why and choose a safer design.
3. **Layered limits:** Kestrel allows 100 MB, but uploads fail around 30 MB behind IIS. Identify the other relevant limit layers and where to inspect.
4. **Buffered upload overload:** Many concurrent `IFormFile` uploads exhaust temp disk. Explain the likely resource model and when to switch to streaming.
5. **Malicious filename:** The app combines `IFormFile.FileName` with an upload directory. List safer storage and display steps.
6. **PipeReader hang:** A parser calls `AdvanceTo(buffer.Start, buffer.End)` after finding one incomplete record. Explain the two cursor positions and likely effect.
7. **Response recovery:** An endpoint writes a prefix, flushes, then fails and tries to return Problem Details. Explain the boundary.

## Progressive hints

1. Background work cannot safely depend on an expiring request context or its scoped provider.
2. BodyReader cursor and stream Position are distinct when the reader has already consumed data.
3. IIS request filtering, ASP.NET server, proxy, form parser, per-section, and application/storage caps can all apply.
4. Buffered form files can use memory and temp disk; concurrency multiplies usage.
5. Generate a random server filename, keep storage outside web root, validate content/extension, and encode display values.
6. `consumed` says what can be released; `examined` says how far parsing looked and controls when more data is signaled.
7. A flush can start the response; headers/status cannot then be replaced.

## Complete solutions

1. Copy only required immutable values (for example, trace ID, user ID, and a validated command) into a queue message. The worker creates its own DI scope and does not retain `HttpContext`, request streams, or scoped request services.
2. A PipeReader tracks its own consumed/examined buffer; changing the underlying stream position does not reset that state. Prefer a single consumer, or use bounded stream buffering consistently before any reader consumes the body. In .NET 10+, custom JSON converters must handle `Utf8JsonReader.HasValueSequence`.
3. Check IIS `maxAllowedContentLength`, IIS server `MaxRequestBodySize`, Kestrel limits if applicable, reverse-proxy limits, multipart/form options, and app/storage caps. The earliest layer rejects, sometimes before ASP.NET code executes; raise each appropriate limit deliberately rather than disabling all limits.
4. Buffered file binding accumulates resource use across concurrent uploads and can spill to temporary disk. Use streaming when size/frequency exceeds safe buffer capacity, but implement boundaries, size/count limits, cancellation, validation, cleanup, and safe storage.
5. Never use the submitted filename as a path. Generate a server-controlled unique name, store in a dedicated non-executable location outside the app tree, validate allowlisted extensions and actual content, scan if appropriate, and HTML-encode the submitted name if displayed.
6. The parser has consumed nothing but examined the entire available buffer. If incomplete data is all that exists, `ReadAsync` can wait for new unexamined data; the parser must preserve unconsumed bytes while accurately reporting the examined extent. Misreporting can also retain memory or duplicate bytes. Follow the parse-and-advance contract and test fragmented input.
7. Once the response has started, it cannot reliably become a clean Problem Details response. Log the exception, stop/abort the stream as appropriate, propagate cancellation, and design clients to detect incomplete transfers.

## Tests and edge cases

Test absent and misleading Content-Length; chunked input; just-under/over limits at every layer; fragmented JSON and multipart boundaries; repeated and missing form fields; request cancellation during read/copy; filenames with traversal, Unicode, and collisions; duplicate file names; response failures before and after first flush; range requests; and a disconnected client. Assert cleanup of partial files and temp resources.

## Reflection questions

- Which component owns each request/response stream or pipe?
- What is your aggregate resource budget under concurrent uploads?
- Which exact layer rejects an oversized request in each deployment environment?
- What validation proves uploaded bytes match the claimed file type?
- What will the client observe if a streaming response fails halfway through?

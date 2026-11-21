# HTTP request response headers forms files and streaming bodies — Interview questions and reasoning

## Core questions

1. What belongs in `HttpContext`, and how long is it valid?
2. Why are request bodies generally one-pass?
3. Compare `Request.Body` with `Request.BodyReader`.
4. What do `consumed` and `examined` mean in `AdvanceTo`?
5. How does `EnableBuffering` help, and what does it cost?
6. Why are server, form, proxy, and storage limits separate?
7. When is `IFormFile` suitable, and when would you stream multipart sections?
8. Which upload values must be treated as untrusted?
9. What does `HttpResponse.HasStarted` mean?
10. How does a `PipeWriter` flush differ from writing to a simple stream?

## Concise interview answers

1. It holds request-specific state, services, identity, features, cancellation, and response. It is valid for that request; copy required values before queuing background work.
2. The transport is consumed sequentially without automatically retaining a replay copy. Buffer explicitly when a second read is required.
3. Body is a Stream; BodyReader is a PipeReader with segmented buffers and explicit cursor management. The latter can reduce copying but is more complex.
4. Consumed identifies bytes that can be released; examined reports how far the reader looked and influences whether the next read waits for more data.
5. It wraps the stream with replayable buffering and supports rewind; memory can spill to disk and a configured limit can reject the read.
6. They protect different infrastructure and parsing stages. An upstream proxy or IIS may reject before ASP.NET sees the request; raising one limit cannot override another.
7. IFormFile is convenient for bounded small files but form parsing buffers content. MultipartReader processes sections incrementally for large files and transfers limit, parse, cleanup, and validation responsibility to the app.
8. Filename, content type, size claims, form fields, and file bytes are untrusted. Generate storage names and validate content server-side.
9. The response has started and headers/status are committed; a clean replacement response is generally impossible.
10. PipeWriter needs `Advance` and `FlushAsync`; flush controls when buffered bytes flow and provides backpressure. A stream API often hides this buffering detail.

## Deep follow-up answers

**Can I read JSON twice by resetting `Body.Position`?** Only if the consumer path is stream-based and buffering was enabled before the first read. A PipeReader maintains independent cursor state. Starting in .NET 10, framework JSON binding/helpers use PipeReader-based deserialization by default; fix custom converters for segmented values and avoid multiple consumers.

**What is a safe large upload design?** Enforce total and per-section limits before reading; parse multipart sections incrementally; honor request cancellation; generate the storage path; stream to non-executable storage outside the app root; validate extension and actual content; scan when required; and remove partial files on error. Check proxy/server limits too.

**Does streaming improve performance?** Its main advantage for large uploads is reducing buffering pressure on memory and temp disk. It can add application complexity and does not automatically improve throughput.

**How should a download expose range support?** Use the file result/HTTP result appropriate to the source, set intended download metadata, and enable range processing when desired. Validate authorization and path separately. Current .NET 11 OpenAPI generation recognizes file stream result types as binary response shapes. [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Scenario questions

- JSON works for simple payloads but fails for one custom converter under load. Inspect segmented `Utf8JsonReader` handling and `HasValueSequence`.
- An upload exceeds 30 MB despite a 100 MB Kestrel setting. Check IIS/proxy and form limits.
- A queued worker occasionally throws because `HttpContext` is unavailable. The request-owned context escaped its lifetime.
- A download's error handler appends JSON after partial file bytes. Response commitment makes this invalid; terminate and report transfer failure out of band.

## Tradeoffs and alternatives

- Framework binding reduces parsing boilerplate; direct reads give control but take on validation and error handling.
- Stream is simpler; pipelines provide explicit segmented memory/backpressure but demand precise cursor ownership.
- Buffered forms are convenient; multipart streaming reduces buffering demand but adds parser and cleanup obligations.
- File result helpers handle common file response behavior; custom streams allow transformation but require explicit lifecycle and range decisions.

## Common weak answers

- “Reset Position and reread” ignores buffering and PipeReader state.
- “Set Kestrel's size limit” ignores other layers.
- “The file extension says the content type” trusts client-controlled values.
- “Streaming is always faster” confuses resource use with throughput.
- “Flush means downloaded” confuses server output with client receipt.
- “The exception handler will send a 500” ignores that response headers/body may already be committed.

## Self-check rubric

You are ready when you can identify the owner and lifetime of context/body/pipe/file; explain stream and pipe cursor semantics; calculate layered resource limits; design a safe upload path; and distinguish response completion from client receipt.

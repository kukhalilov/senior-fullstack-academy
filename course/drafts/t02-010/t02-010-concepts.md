# HTTP request response headers forms files and streaming bodies — Core concepts and how they fit together

## Learning objectives

Keep request state within its lifetime; choose among headers, query, form, and body inputs; read a request body without breaking downstream work; explain PipeReader cursor rules and backpressure; distinguish form limits from server request limits; securely process buffered and streamed uploads; and write a response before/after commitment correctly.

## Prerequisites

An HTTP request has metadata and an optional byte body. `Stream` exposes sequential reads/writes. `PipeReader` exposes a sequence of memory segments and requires the caller to report consumed and examined positions. `CancellationToken` communicates that ongoing work should stop. Multipart form data is a framed body containing independently headed sections.

## Core concepts

### Request lifetime and trust

`HttpContext`, its request, response, and `RequestServices` are valid for one request. Do not retain them in a singleton, queue, closure that outlives the request, or background task. Copy the small immutable values needed by background work and create its own service scope. `IHttpContextAccessor` uses ambient async-flow state; it is a convenience for code where explicit passing is impractical, not a reason to depend on a current request from background code. [HttpContext guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-11.0)

Headers, query parameters, cookies, and form fields are all client input. Use the correct source and parse/validate it. Header names are case-insensitive by HTTP semantics; values may be repeated. `StringValues` represents zero, one, or multiple values; do not assume every header is a single string. `Authorization`, `Host`, and cookies deserve special handling and must not be logged raw.

### One-pass request bodies

`Request.Body` is a sequential stream. Reading consumes bytes. For a deliberate second read, call `EnableBuffering` before reading, set an appropriate threshold/limit, dispose readers without closing the request stream, and reset `Body.Position` before downstream code. Buffering may spill to temporary disk and can fail at its limit. A rewind of the stream does not automatically rewind a separately consumed `BodyReader`; do not mix the two abstractions casually. [Request body](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-11.0)

Routine JSON endpoints should use framework binding or `ReadFromJsonAsync` and pass cancellation where the selected overload supports it. Check `HasFormContentType` before parsing form data; `ReadFormAsync` is preferable in asynchronous code. `Request.Form` is a synchronous convenience that can trigger lazy parsing and synchronous-I/O constraints. Set JSON serializer options in the relevant HTTP JSON/MVC configuration; those configuration surfaces need not be identical.

Starting in .NET 10, Minimal API JSON body binding, MVC input formatters, and request JSON helpers use PipeReader-based JSON deserialization by default. Custom `JsonConverter` implementations must support `Utf8JsonReader.HasValueSequence`; otherwise segmented input can expose bugs hidden by contiguous streams. The stream-based AppContext switch is a compatibility workaround, not the preferred fix. [ASP.NET Core 10 change](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0)

### PipeReader is an ownership protocol

Each `ReadAsync` returns a `ReadResult` whose `Buffer` is a `ReadOnlySequence<byte>`. Parse only while that memory is valid. `AdvanceTo(consumed, examined)` states which bytes are no longer needed and how far the parser looked. Incorrect positions can cause duplicate processing, data loss, hangs, or unbounded buffering. After advancing, do not access the old buffer. Honor cancellation and `IsCanceled`/`IsCompleted`.

Do not call `CompleteAsync` on a host-owned reader unless the API's ownership contract says the component owns its lifetime. The general `System.IO.Pipelines` rule to complete a reader applies to a pipe your code owns; ASP.NET request features are supplied by the server. One reader should have one active consumer. [I/O pipelines](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

### Limits are layered, not interchangeable

The server maximum request-body size, a proxy/IIS limit, form `BufferBodyLengthLimit`, multipart section limit, per-form count/length limits, buffering thresholds, and storage quota protect different resources. `Content-Length` may be absent or untrusted; chunked/streamed content still needs a server/application bound. Configure body-size limits before reading starts. A lower upstream limit may reject first, so changing one ASP.NET Core setting does not raise a proxy or IIS limit.

### Buffered forms versus streaming uploads

`IFormFile` is ergonomic: model binding parses the form and buffers file content, with larger buffered data rolling to temporary storage. Concurrency multiplies memory/disk demand. `MultipartReader` lets an application process sections incrementally, but then it must parse boundaries, enforce section/count/size limits, honor cancellation, and clean partial output itself. Streaming reduces buffering pressure; it does not automatically validate content or make a malicious upload safe. [File uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-11.0)

Never use `IFormFile.FileName` as a path. Generate storage names, keep files outside the served app tree, disable execution, validate an allowlist and actual content, scan where appropriate, and HTML-encode a display name. Client `ContentType` is a claim. Antiforgery protection matters for browser form posts authenticated by cookies.

### Response has a commit point

Set status, content type, cookies, and headers before writing or calling `StartAsync`. At response start, `OnStarting` callbacks execute and headers become immutable. Callbacks run in LIFO order. `OnCompleted` callbacks run after response completion and have their own ordering; neither callback proves the peer received all bytes. If `HasStarted` is true, an exception handler cannot replace partial output with a fresh Problem Details document. [Response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

For a `PipeWriter`, reserve memory with `GetMemory`/`GetSpan`, write, call `Advance`, and `FlushAsync` when downstream should receive data. Flush creates backpressure and may report that the reader is complete. `Stream` is simpler for copy/file APIs; a pipe is useful for incremental high-volume work but has stricter ownership and cursor rules. Do not mix concurrent writers.

## Mechanisms and relationships

| Need | Use | Cost or boundary |
|---|---|---|
| Read JSON once | Framework body binding or request JSON helper | Content type, serializer options, validation, one body consumer |
| Read body twice | Enable bounded buffering, then rewind stream | Memory/temp disk; does not rewind a consumed PipeReader |
| Process large multipart file | MultipartReader and stream each section | App owns parsing, limits, cancellation, and cleanup |
| Return a large generated body | Stream or PipeWriter with incremental flushes | Response commits early; partial failure cannot become a new status |
| Serve a stored file | File result with validated path and intended metadata/range policy | Ensure file ownership, authorization, validators, and safe download name |

## Worked examples

### Bounded logging read (usually prefer metadata-only logging)

```csharp
app.Use(async (context, next) =>
{
    context.Request.EnableBuffering(bufferThreshold: 32 * 1024, bufferLimit: 1024 * 1024);
    using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
    var text = await reader.ReadToEndAsync(context.RequestAborted);
    context.Request.Body.Position = 0;
    // Redact before any intentional logging; never log secrets by default.
    await next(context);
});
```

The code is appropriate only when the body must be inspected. `EnableBuffering` must precede the read and the position reset must precede next. Large requests may spill to disk or exceed the configured cap.

### Correct PipeReader loop shape

```csharp
static async Task CopyLinesAsync(PipeReader reader, PipeWriter writer, CancellationToken cancellationToken)
{
    while (true)
    {
        ReadResult result = await reader.ReadAsync(cancellationToken);
        ReadOnlySequence<byte> buffer = result.Buffer;
        SequencePosition consumed = buffer.Start;
        SequencePosition examined = buffer.End;
        try
        {
            // Parse complete records; leave an incomplete suffix unconsumed.
            consumed = ParseCompleteRecords(buffer, writer);
        }
        finally
        {
            reader.AdvanceTo(consumed, examined);
        }

        if (result.IsCanceled) throw new OperationCanceledException(cancellationToken);
        if (result.IsCompleted) break;
    }
}
```

`ParseCompleteRecords` is an application parser omitted from this fragment. A real parser must calculate both cursor positions correctly and flush the writer when output should flow. This example does not claim ownership of completing ASP.NET's request reader.

### Stream a multipart section safely

```csharp
app.MapPost("/upload", async (HttpContext context, CancellationToken cancellationToken) =>
{
    if (!MediaTypeHeaderValue.TryParse(context.Request.ContentType, out var contentType) ||
        !string.Equals(contentType.MediaType, "multipart/form-data", StringComparison.OrdinalIgnoreCase))
        return Results.BadRequest();
    var boundary = context.Request.GetMultipartBoundary();
    if (string.IsNullOrWhiteSpace(boundary)) return Results.BadRequest();

    // A production implementation validates the boundary and each section,
    // enforces total and per-section limits, and writes to a generated path.
    var reader = new MultipartReader(boundary, context.Request.Body);
    MultipartSection? section;
    while ((section = await reader.ReadNextSectionAsync(cancellationToken)) is not null)
    {
        await ProcessBoundedSectionAsync(section, cancellationToken);
    }
    return Results.Ok();
});
```

`ProcessBoundedSectionAsync` represents an application helper that must distinguish fields/files, cap bytes, use safe storage names, and remove partial output on failure. `GetMultipartBoundary` parses the boundary from the Content-Type. Streaming transfers limits, validation, and cleanup responsibilities to application code.

## Misconceptions and edge cases

- Rewinding `Body.Position` after PipeReader JSON parsing necessarily replays JSON. False: the reader has independent cursor state; follow one body-consumption strategy.
- `Content-Length` is the upload limit. False: it can be missing, and several upstream and downstream limits apply.
- `IFormFile` always stays in memory. False: buffered form files can roll to temp storage; concurrency still consumes resources.
- Streaming makes an upload safe. False: filenames, content, size, path, malware, and storage exposure remain application responsibilities.
- Calling `AdvanceTo` is optional cleanup. False: it defines buffer ownership and flow control.
- `FlushAsync` means the recipient processed the data. It only advances server-side output; disconnect/cancellation can still occur.
- A response can be replaced after a stream starts. Generally false; status/headers are already committed.

## Knowledge checks with answers

1. What must happen before a second stream read? Enable buffering before the first read and rewind before the next consumer.
2. What expires when PipeReader.AdvanceTo is called? The previously returned buffer memory.
3. Does a larger `MultipartBodyLengthLimit` override Kestrel or IIS request-size limits? No; they are different layers.
4. Why generate a server-side file name? The client filename is untrusted and could contain traversal or collision data.
5. What is the consequence of setting headers after `HasStarted`? They are immutable and the write can fail.

# HTTP request response headers forms files and streaming bodies — Reference: Body reads, buffering, JSON helpers, forms, and limits

## Scope and version

All members here consume or configure incoming body parsing. Pick one body consumer, set limits before reading, and keep Stream and PipeReader cursor state distinct. .NET 10 made framework JSON parsing PipeReader-based by default. [Body operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0) [Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0) [ASP.NET Core 10 change](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0)

## How this group fits the mental model

For each member, ask: is it per-request state, untrusted metadata, a body consumer, a parser/resource limit, or a response commitment/output API? Track who owns the data and what downstream code can still do.

## Supplied names explained

- `HttpRequest.ReadFormAsync` — Asynchronously parses a form body and caches the resulting form for request access. Validate content type and use cancellation; file parts may be buffered.
- `HttpRequest.ReadFromJsonAsync<T>` — Deserializes a JSON request body to T using the configured HTTP JSON behavior; body is consumed, content type matters, and cancellation should be propagated.
- `HttpRequestJsonExtensions.ReadFromJsonAsync<T>` — Extension API for asynchronous JSON deserialization from the request body, with overloads for serializer options/type metadata and cancellation.
- `HttpRequestJsonExtensions.ReadFromJsonAsync overloads` — Overloads differ by serializer options, JsonTypeInfo/JsonSerializerContext, and cancellation token; choose the AOT-friendly metadata overload when needed.
- `HttpRequest.EnableBuffering` — Wraps the body with replay buffering when called before the first read; configure threshold/limit and rewind the stream before downstream consumption.
- `HttpRequest.Body.Position` — Gets or sets the current position when the request body stream supports seeking. A default network request stream usually is not seekable; EnableBuffering must be applied before reading to obtain replay behavior.
- `Request body single-read behavior` — The body reader advances through bytes; a second consumer sees only remaining content unless a replay strategy was enabled first.
- `Request body rewind after buffering` — After EnableBuffering and a stream read, reset Body.Position to zero before delegating. This does not reset a separately consumed PipeReader.
- `FileBufferingReadStream` — Stream wrapper that keeps data in memory up to a threshold, then spills to a temporary file, optionally enforcing a maximum buffer length. Dispose it to release temp resources; it is not a file-download result.
- `BufferThreshold` — EnableBuffering threshold in bytes before buffered request data rolls from memory to a temporary file. It is a resource-placement setting, not a request-size limit.
- `BufferLimit` — EnableBuffering maximum number of bytes that may be buffered. Exceeding it causes buffering to fail; it is distinct from server and form parser limits.
- `RequestSizeLimitAttribute` — Endpoint/action metadata that changes the ASP.NET Core server request size limit for a selected action; it cannot override IIS/proxy limits.
- `RequestSizeLimitAttribute.RequestSizeLimit` — Endpoint/action metadata that adjusts one ASP.NET Core limit. It does not raise unrelated reverse-proxy, IIS, server, or storage limits.
- `RequestFormLimitsAttribute` — Endpoint/action metadata that adjusts one ASP.NET Core limit. It does not raise unrelated reverse-proxy, IIS, server, or storage limits.
- `FormOptions` — Options controlling form parsing, buffering, and limits for distinct dimensions such as values, multipart headers, and section bodies. These do not replace server/proxy request limits.
- `FormOptions.BufferBody` — Opt-in buffering of the whole request body for form processing; adds resource use and needs a limit.
- `FormOptions.BufferBodyLengthLimit` — Upper bound for buffering the whole request body when BufferBody is enabled; separate from multipart per-section limits.
- `FormOptions.MemoryBufferThreshold` — Memory-to-temp-storage rollover threshold for buffered form content; affects resource placement, not accepted total size.
- `FormOptions.MultipartBodyLengthLimit` — Maximum multipart section body length for form parsing, not a substitute for server/proxy total request size limits.
- `FormOptions.ValueCountLimit` — Maximum number of form values.
- `FormOptions.KeyLengthLimit` — Maximum form key length.
- `FormOptions.ValueLengthLimit` — Maximum form value length.
- `FormOptions.MultipartHeadersCountLimit` — Maximum number of headers per multipart section.
- `FormOptions.MultipartHeadersLengthLimit` — Maximum aggregate multipart headers length per section.
- `FormOptions.MultipartBoundaryLengthLimit` — Maximum multipart boundary length accepted by form parsing.
- `RequestBodyPipeFeature` — Implementation that exposes the request body through the IRequestBodyPipeFeature capability. The feature and its reader share the request body; avoid competing consumers.
- `IRequestBodyPipeFeature` — Server feature contract exposing a PipeReader for the incoming request body. Query it as a capability; it is another view of the same body, not an independent copy.
- `IRequestBodyPipeFeature.Reader` — The request-body PipeReader exposed by the feature when available. It represents the same incoming body; avoid competing reads through it and Request.Body.
- `PipeReader.ReadAsync` — Asynchronously obtains a ReadResult with a buffer and cancellation/completion state; process the buffer before advancing.
- `ReadResult.Buffer` — The temporary ReadOnlySequence returned by PipeReader.ReadAsync; it is valid only until AdvanceTo/completion.
- `PipeReader.AdvanceTo` — Reports consumed and examined buffer positions. Old buffer memory expires after the call; incorrect positions cause duplicate data, stalls, or retained memory.
- `PipeReader.CompleteAsync` — Completes a PipeReader your code owns. Do not complete a host-supplied request reader unless its documented ownership contract assigns completion to your component.
- `Stream.ReadAsync` — Asynchronously reads bytes from the current stream position into a supplied buffer, optionally observing cancellation. Request-body reads consume input and the network stream is generally not seekable.
- `Request body cancellation token` — Use HttpContext.RequestAborted for work tied to the client request and pass it to async reads/copies. A separately supplied token may also be linked for application deadlines.
- `Content-Length enforcement` — Length declaration is not the sole cap; requests can be streamed and other server/proxy limits apply.
- `Maximum request body size` — Server-enforced total-body ceiling configured before reading; distinct from form parser and per-file limits.
- `Synchronous request IO disabled by default` — Many server configurations disallow blocking body I/O to protect thread availability; use asynchronous APIs.
- `Form parsing lazy access` — Accessing Form can trigger parsing and body buffering; validate form content type and prefer explicit async parsing.
- `HasFormContentType validation` — Check before invoking a form parser so non-form content is handled deliberately.
- `JSON request body content type` — JSON deserialization expects an accepted JSON media type; reject/handle mismatches rather than assuming bytes are JSON.
- `Request JSON serializer options` — HTTP JSON and MVC JSON settings may use separate option configuration; configure the surface that performs the read.
- `PipeReader-backed JSON parsing` — Since .NET 10, framework JSON request paths use PipeReader-based deserialization; custom converters must handle segmented `HasValueSequence` data.
- `Microsoft.AspNetCore.UseStreamBasedJsonParsing AppContext switch` — Compatibility switch for stream-based JSON request parsing when a custom converter has not yet been fixed for segmented PipeReader input. Treat as temporary and verify the target runtime still honors it.
- `ReadFromJsonAsync<TValue>(HttpRequest, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync<TValue>(HttpRequest, JsonSerializerOptions, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync<TValue>(HttpRequest, JsonTypeInfo<TValue>, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync(HttpRequest, JsonTypeInfo, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync(HttpRequest, Type, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync(HttpRequest, Type, JsonSerializerOptions, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.
- `ReadFromJsonAsync(HttpRequest, Type, JsonSerializerContext, CancellationToken)` — Consumes and deserializes the JSON request body. JsonSerializerOptions overloads configure runtime serialization; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented/AOT paths. Pass cancellation and do not assume the body can be read again.

## Cross-item comparison

Compare only the supplied names here. Stream properties offer sequential access; pipe properties offer segmented buffers and explicit cursors. Buffered form binding is convenient for bounded files; multipart streaming handles large input with greater application responsibility. Response callbacks surround the commit point, while body writes/flushes may cause it. File result types differ by byte source (content, path, virtual path, or stream) and share authorization/range/metadata decisions.

## Examples

```csharp
app.MapPost("/echo", async (HttpContext context, CancellationToken cancellationToken) =>
{
    var input = await context.Request.ReadFromJsonAsync<EchoRequest>(cancellationToken);
    if (input is null) return Results.BadRequest();
    return Results.Json(new { message = input.Message });
});

public sealed record EchoRequest(string Message);
```

This is a request-body consumer; do not also deserialize the same body in middleware. In .NET 10 and later framework parsing uses PipeReader by default, so converters must support segmented values. For a file upload, use a server-generated destination name, enforce a byte limit during copy, honor cancellation, and remove partial output on exceptions.

## Common mistakes

- Retaining HttpContext or RequestServices for background work.
- Reading the body before EnableBuffering or mixing a consumed BodyReader with a reset stream.
- Treating Content-Length, a file extension, or ContentType as proof of safety.
- Raising a form limit while forgetting a server/proxy limit.
- Calling AdvanceTo incorrectly or accessing buffer memory afterward.
- Setting response metadata after the first write/StartAsync.
- Assuming a flush proves the peer received all bytes.

## Knowledge checks with answers

1. What must a second stream reader have? Buffering enabled before consumption and a rewind before the second read.
2. What is the difference between `consumed` and `examined`? One releases processed bytes; the other reports how far parsing looked.
3. Does MultipartBodyLengthLimit replace Kestrel's request-size limit? No; they constrain different stages and units.
4. When is a response header immutable? When response start commits it.
5. Which filename should be used for storage? A server-generated name, never the untrusted upload filename.

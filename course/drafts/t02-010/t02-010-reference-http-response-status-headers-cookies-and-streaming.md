# HTTP request response headers forms files and streaming bodies — Reference: Response commitment, headers, cookies, body streams, pipelines, and file output

## Scope and version

Response metadata is mutable only until the first start/write. Stream and PipeWriter approaches have different buffering/flush contracts. .NET 11 OpenAPI recognizes file stream result types as binary response schemas. [Response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0) [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## How this group fits the mental model

For each member, ask: is it per-request state, untrusted metadata, a body consumer, a parser/resource limit, or a response commitment/output API? Track who owns the data and what downstream code can still do.

## Supplied names explained

- `HttpResponse` — Per-request abstraction for response status, headers, cookies, and body. Metadata must be finalized before response start; body writes can trigger that boundary.
- `HttpResponse.HttpContext` — Back-reference to the HttpContext that owns this response. It has the same request lifetime and must not be retained after completion.
- `HttpResponse.StatusCode` — Status must be selected before response start.
- `HttpResponse.ContentType` — Sets representation media type before headers commit.
- `HttpResponse.ContentLength` — Declares exact body byte length; mismatches can invalidate completion.
- `HttpResponse.Headers` — Outgoing metadata, mutable only until response start.
- `HttpResponse.Body` — Sequential response Stream; writing may start/commit the response.
- `HttpResponse.BodyWriter` — PipeWriter view of outgoing bytes. Call Advance after writing and FlushAsync to transfer buffered output and observe backpressure/cancellation.
- `HttpResponse.HasStarted` — True once response headers are committed; status and headers can no longer be replaced by an exception handler.
- `HttpResponse.Cookies` — Response cookie manager; configure security attributes explicitly.
- `HttpResponse.OnStarting` — Registers callbacks run before headers are sent, in last-registered-first-called order; register before downstream work.
- `HttpResponse.OnStarting(Func<Task>)` — Registers a parameterless asynchronous callback to mutate response headers immediately before they are sent. Callbacks run in reverse registration order.
- `HttpResponse.OnStarting(Func<object,Task>, object)` — Registers an asynchronous callback with explicit state to mutate headers immediately before they are sent. The state overload avoids capturing a closure; callbacks run in reverse registration order.
- `HttpResponse.OnCompleted(Func<Task>)` — Registers a parameterless asynchronous callback for server-side response cleanup after completion; it cannot modify the response and does not prove client receipt.
- `HttpResponse.OnCompleted(Func<object,Task>, object)` — Registers an asynchronous completion callback with explicit state, useful for cleanup without a captured closure. It runs after server-side completion, not after confirmed client receipt.
- `HttpResponse.OnCompleted` — Registers callbacks after server-side response completion; not confirmation that the client received all bytes.
- `HttpResponse.StartAsync` — Starts the response, runs OnStarting callbacks, and commits headers. Afterward status/header changes are too late.
- `HttpResponse.CompleteAsync` — Completes the response body and flushes remaining response data/trailers; may surface invalid state or content-length mismatch.
- `WriteAsJsonAsync<TValue>(HttpResponse, TValue, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync<TValue>(HttpResponse, TValue, JsonSerializerOptions, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync<TValue>(HttpResponse, TValue, JsonSerializerOptions, string, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync<TValue>(HttpResponse, TValue, JsonTypeInfo<TValue>, string, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync(HttpResponse, object, Type, JsonSerializerOptions, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync(HttpResponse, object, Type, JsonSerializerOptions, string, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync(HttpResponse, object, Type, JsonSerializerContext, string, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `WriteAsJsonAsync(HttpResponse, object, JsonTypeInfo, string, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `HttpResponse.WriteAsync` — Asynchronously writes text/body data and can start the response.
- `WriteAsync(HttpResponse, string, CancellationToken)` — Writes text asynchronously to the response using UTF-8 by default or a supplied encoding. It may start the response; pass cancellation and set status/headers first.
- `WriteAsync(HttpResponse, string, Encoding, CancellationToken)` — Writes text asynchronously to the response using UTF-8 by default or a supplied encoding. It may start the response; pass cancellation and set status/headers first.
- `HttpResponse.Redirect` — Sets a redirect response and Location; validate destinations to prevent open redirects.
- `HttpResponse.Redirect(string)` — Sets a temporary redirect using the response helper defaults. If the destination is user-controlled, validate it as local/allowlisted to prevent open redirects.
- `HttpResponse.Redirect(string, bool)` — Sets a redirect with an explicit permanent-versus-temporary choice; this overload does not offer the full method-preservation option of the extension overload. Validate the destination.
- `Redirect(HttpResponse, string, bool, bool)` — Sets a redirect Location/status. The overload with permanence/preserve-method choices controls redirect semantics; validate any user-controlled destination to prevent open redirects.
- `HttpResponse.RegisterForDispose` — Registers a disposable to be disposed after the response lifecycle.
- `HttpResponse.RegisterForDisposeAsync` — Registers async disposal after the response lifecycle.
- `HttpResponse.Clear` — Clears response headers/body/status only while the response has not started; it cannot undo bytes already committed.
- `IResponseCookies` — Response cookie writer that emits Set-Cookie fields. Configure path/domain, expiry, Secure, HttpOnly, and SameSite for the application flow; deletion must match scope.
- `IResponseCookies.Append(string, string)` — Appends a cookie using default CookieOptions. Defaults may not meet the app’s security, scope, or cross-site requirements; set options explicitly for security-sensitive cookies.
- `IResponseCookies.Append(string, string, CookieOptions)` — Appends one cookie with the supplied scope, lifetime, and security attributes. Cookie values are not encrypted by this API.
- `IResponseCookies.Append(ReadOnlySpan<KeyValuePair<string,string>>, CookieOptions)` — Appends a span of cookie name/value pairs using shared options, avoiding repeated per-cookie option construction; values remain plain cookie data unless protected separately.
- `IResponseCookies.Delete(string)` — Appends an expired-cookie instruction using default scope. Deletion succeeds only when its path/domain scope matches the cookie being removed.
- `IResponseCookies.Delete(string, CookieOptions)` — Appends an expired-cookie instruction with explicit scope. Match the original cookie’s Path and Domain; this does not delete a cookie from the browser directly.
- `CookieOptions` — Set-Cookie attribute configuration for scope, lifetime, transport/script protections, SameSite, consent, and extensions. It does not encrypt or authenticate cookie values.
- `CookieOptions.Domain` — Sets the domain scope to which the browser may send the cookie. Omit it for a host-only cookie unless cross-subdomain sharing is required.
- `CookieOptions.Path` — Sets the URL path scope for the cookie. Choose deliberately; deletion must use a matching path.
- `CookieOptions.Expires` — Absolute expiration time for the cookie. MaxAge may also be set; browser handling gives Max-Age precedence when both are present.
- `CookieOptions.MaxAge` — Relative cookie lifetime. When both MaxAge and Expires are set, Max-Age takes precedence in user agents that support it.
- `CookieOptions.Secure` — Restricts cookie transmission to secure transport. Requires correct HTTPS/proxy scheme configuration.
- `CookieOptions.HttpOnly` — Prevents ordinary client-side scripts from reading the cookie; it does not prevent CSRF or secure a compromised server.
- `CookieOptions.IsEssential` — Marks a cookie essential for consent-policy handling; it is not a security or encryption setting.
- `CookieOptions.Extensions` — Additional cookie extension attributes serialized into Set-Cookie. Validate extension names/values and do not use this to bypass standardized security attributes.
- `CookieOptions.SameSite` — Controls cross-site cookie sending behavior; choose in conjunction with authentication/CSRF flow and browser requirements.
- `SameSiteMode` — Enum values describing cross-site cookie policy; `None` generally requires `Secure` in modern browsers.
- `Response header immutability after start` — Once headers/body are committed, changing status or header values is too late and may throw.
- `Response start callback LIFO ordering` — OnStarting callbacks execute in reverse registration order, allowing outer middleware to run after inner callbacks.
- `Response completion callback ordering` — OnCompleted callbacks run after server response completion; use them for cleanup/observation, not to mutate output or prove client receipt.
- `IHttpResponseBodyFeature` — Server capability that abstracts response stream, writer, file transfer, and buffering controls. Implementations vary by host and middleware; do not assume every operation maps to a socket directly.
- `IHttpResponseBodyFeature.Stream` — Stream view of the current response output.
- `IHttpResponseBodyFeature.Writer` — PipeWriter view of the current response output.
- `IHttpResponseBodyFeature.SendFileAsync` — Server feature for efficiently sending a file segment into the response with cancellation support.
- `IHttpResponseBodyFeature.DisableBuffering` — Opts out of response write buffering for streaming scenarios; it does not guarantee network/client receipt.
- `IHttpBodyControlFeature` — Optional server feature controlling synchronous body I/O. Synchronous I/O is commonly disabled to protect thread availability; prefer asynchronous reads/writes.
- `IHttpBodyControlFeature.AllowSynchronousIO` — Feature controlling whether synchronous request/response body I/O is permitted; async I/O is preferred to avoid blocking server threads.
- `PipeWriter.GetMemory` — Requests writable memory with at least the requested size; write only within returned capacity.
- `PipeWriter.GetSpan` — Requests writable span; use synchronously and do not retain beyond the next writer operation.
- `PipeWriter.Advance` — Commits the number of bytes written into the writer buffer.
- `PipeWriter.FlushAsync` — Flushes buffered bytes to the response and applies backpressure. Inspect cancellation/completion result before continuing.
- `PipeWriter.CompleteAsync` — Completes a writer whose lifetime this code owns; avoid completing host-owned response writers without an explicit ownership contract.
- `PipeWriter flush backpressure` — FlushAsync exposes written bytes and may wait when downstream cannot accept more; check cancellation/completion results.
- `Stream versus PipeWriter` — Stream offers familiar sequential operations; PipeWriter provides explicit memory management and flush/backpressure for incremental output.
- `FileStreamResult` — MVC action result that copies a supplied Stream to the response. The stream is disposed as part of result execution; range processing is opt-in and authorization remains the application’s responsibility.
- `FileContentResult` — MVC action result that writes an in-memory byte array as a file response. It is convenient for already-buffered content, not for arbitrarily large generated files.
- `VirtualFileResult` — MVC result that resolves a file through the configured web-root file provider; callers still need authorization and deliberate download/range metadata.
- `PhysicalFileResult` — MVC result that serves a physical path. Ensure the path is server-controlled and authorization checked; do not construct it from untrusted path fragments.
- `Results.File` — Minimal API file-result factory with overloads for byte arrays, streams, and file paths/providers. Select the overload matching ownership and size, then configure content type, download name, validators, and range behavior.
- `FileStreamHttpResult` — Minimal API result that streams a supplied Stream to the response; the result owns/disposes the stream according to its execution lifecycle. Range support requires a seekable source and appropriate configuration.
- `FileContentHttpResult` — Minimal API result for byte-array content; the bytes are already materialized in memory, so avoid it for unbounded or very large files.
- `FileDownloadName` — Suggested filename emitted in Content-Disposition for download presentation. It is response metadata, not a server storage path.
- `EnableRangeProcessing` — File-result option that allows range requests where supported, enabling partial/resumable transfer.
- `LastModified file response` — Last-Modified metadata for conditional requests; use a trustworthy modification timestamp and understand its date precision/validator role.
- `EntityTag file response` — ETag validator for conditional requests and range validation. Generate it from the representation/version; it is not an authorization token.
- `File response range requests` — Byte-range requests can allow partial/resumable downloads when the chosen response path and server support them; verify 206/416 and validator behavior.
- `Response body streaming` — Incremental output lowers whole-response buffering but commits early and limits error replacement; propagate cancellation.
- `Server-sent events response stream` — Long-lived text/event-stream response; flush events deliberately, disable incompatible buffering where needed, and stop on request abort.
- `Response compression interaction` — Compression wraps response bytes and can alter flush latency, range behavior, and content length; order and headers must agree.
- `Response cancellation and aborted connection` — Propagate RequestAborted to response generation/copy operations; cancellation means the client may not receive a complete representation.
- `ProblemDetails response body boundary` — Problem Details is a structured error representation for a response that can still be created; it cannot replace bytes after a streaming response starts.
- `WriteAsJsonAsync(HttpResponse, object, Type, CancellationToken)` — Serializes the supplied value as JSON and sets a JSON content type unless one is supplied. Options overloads use runtime serializer options; JsonTypeInfo/JsonSerializerContext overloads provide metadata-oriented and Native AOT paths. Writing consumes the response and may start it.
- `GetTypedHeaders(HttpResponse)` — Returns strongly typed parsed headers for request or response; ordinary header string access remains available for unknown/custom values.
- `AppendTrailer(HttpResponse, string, StringValues)` — HTTP trailer helper for values sent after the body; availability depends on protocol/server. Declare names before response start and check support before appending.
- `DeclareTrailer(HttpResponse, string)` — HTTP trailer helper for values sent after the body; availability depends on protocol/server. Declare names before response start and check support before appending.
- `SupportsTrailers(HttpResponse)` — HTTP trailer helper for values sent after the body; availability depends on protocol/server. Declare names before response start and check support before appending.
- `SendFileAsync(HttpResponse, IFileInfo, CancellationToken)` — Sends a path/file segment through the response feature, often using server optimizations. Specify offset/count only when intended and honor cancellation.
- `SendFileAsync(HttpResponse, IFileInfo, long, long?, CancellationToken)` — Sends a path/file segment through the response feature, often using server optimizations. Specify offset/count only when intended and honor cancellation.
- `SendFileAsync(HttpResponse, string, CancellationToken)` — Sends a path/file segment through the response feature, often using server optimizations. Specify offset/count only when intended and honor cancellation.
- `SendFileAsync(HttpResponse, string, long, long?, CancellationToken)` — Sends a path/file segment through the response feature, often using server optimizations. Specify offset/count only when intended and honor cancellation.
- `Clear(HttpResponse)` — Extension that resets the response while it is still mutable; it cannot undo already committed bytes.

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

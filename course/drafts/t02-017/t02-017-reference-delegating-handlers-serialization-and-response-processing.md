# IHttpClientFactory resilience retries and timeouts — Reference: outgoing middleware JSON helpers cancellation streams and failure handling

## Scope and version

This reference covers the outgoing handler chain, per-request data, JSON content helpers, response ownership, cancellation, and error interpretation. `System.Net.Http.Json` is part of the .NET HTTP JSON surface; overloads and trimming/AOT annotations depend on the specific overload and target framework. [System.Net.Http.Json](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.json.httpclientjsonextensions) [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

## How this group fits the mental model

Outgoing middleware wraps the primary transport handler. It can inspect/transform one request and its response, but factory handlers are pooled infrastructure, not per-request objects. Put caller-specific data on the request, carry cancellation through each asynchronous operation, and dispose responses/streams when complete. Treat status codes as part of the API contract, not just exceptions.

## Supplied names explained

### Handler pipeline and request-specific state

| Supplied name | Meaning and use |
|---|---|
| `DelegatingHandler` | Outgoing HTTP middleware that wraps another handler. Factory-created instances participate in pooled pipelines and must not retain per-request mutable state. |
| `DelegatingHandler.InnerHandler` | The next handler in the chain, ultimately the primary transport handler. Do not reuse an already-attached instance in another pipeline. |
| `DelegatingHandler.SendAsync` | Override point for request/response behavior. Call the inner handler with the same cancellation token and ensure request/response lifetime is preserved. |
| `HttpMessageHandler.SendAsync` | Abstract transport operation implemented by a handler. It accepts a request and cancellation token and returns the response. |
| `HttpRequestMessage.Options` | Per-request key/value collection for typed application metadata passed through handler pipelines. Prefer it to storing user/request state in a pooled handler. |
| `HttpRequestOptionsKey<T>` | Strongly typed key for data stored in `HttpRequestMessage.Options`, reducing string-key collisions and unsafe casts. |
| Delegating handler ordering and nesting | Registration order determines which handler wraps which; outer handlers see the request before inner handlers and the response as it unwinds. Trace the final chain when ordering auth, logging, and resilience. |
| `DelegatingHandler instances must not be reused` | A handler instance is attached to one inner pipeline. Reusing it across clients/pipelines can throw or create incorrect shared state; register handler types so the factory creates instances. |
| `Primary handler versus additional DelegatingHandler chain` | The primary handler owns transport behavior; additional handlers wrap it with cross-cutting processing. Configure connection-level options on the primary handler. |
| `Authentication token handler and token refresh single-flight` | A token handler can add a per-request credential, but shared handler instances must not cache caller tokens. Concurrent refreshes for one credential may need single-flight coordination to avoid refresh races. |
| `Outbound request correlation and Activity propagation` | HTTP diagnostics can propagate trace context and correlate an outgoing operation with its caller. Avoid creating conflicting trace headers or logging sensitive request data. |
| `Outbound HTTP client metrics and tracing instrumentation` | Runtime diagnostics expose request duration/status/connection behavior for observability. Apply redaction and cardinality controls to labels/attributes. |

### Content and JSON APIs

| Supplied name | Meaning and use |
|---|---|
| `HttpContent` | Abstract request/response body representation with serialization/copy/stream APIs. Content may be buffered or stream-backed and may not be safely replayable. |
| `StringContent` | Content built from a string, commonly JSON/text. Specify the media type/encoding deliberately. |
| `ByteArrayContent` | Content backed by a byte array. It is naturally replayable if the bytes remain available, but may require memory proportional to body size. |
| `StreamContent` | Content read from a stream. Stream lifetime, seekability, and whether the stream can be reset determine whether a retry can reproduce the body. |
| `FormUrlEncodedContent` | Content encoded as application/x-www-form-urlencoded key/value pairs. Encode values rather than manually concatenating form text. |
| `MultipartFormDataContent` | MIME multipart content commonly used for form fields and file uploads. Underlying file streams may be non-seekable and unsafe to retry automatically. |
| `JsonContent.Create` | Creates JSON `HttpContent` from an object/value. Configure serialization options/type metadata to match the API and deployment trimming/AOT needs. |
| `HttpClientJsonExtensions.GetFromJsonAsync<T> overloads` | Sends a GET and deserializes JSON into `T`, with overloads for URI, options/type metadata, and cancellation. It does not return a response object for custom status handling; use `SendAsync` when status/body treatment must be explicit. |
| `HttpClientJsonExtensions.PostAsJsonAsync<T> overloads` | Serializes a value as JSON and sends POST, returning an `HttpResponseMessage`. Inspect and dispose the response; retries can duplicate server effects unless the operation is safe/idempotent. |
| `HttpContentJsonExtensions.ReadFromJsonAsync<T> overloads` | Deserializes response/request content into `T`, with options/type metadata and cancellation overloads. It consumes the content stream; do not expect to read it again without buffering/copying. |
| `HttpContent.ReadAsStreamAsync` | Provides a stream over content, which may first buffer depending on content implementation. Dispose the response/content that owns it. |
| `HttpContent.ReadAsStringAsync` | Reads and buffers the complete body into a string. Use only for bounded response sizes and avoid logging sensitive bodies. |
| `HttpContent.CopyToAsync` | Copies serialized content to a stream asynchronously. Pass cancellation where supported and respect content ownership/lifetime. |
| `JsonSerializerOptions in HTTP JSON extensions` | Controls JSON naming, converters, and serialization behavior for JSON helpers. Overloads using web defaults differ from raw `JsonSerializer` defaults; configure consistently with the API contract. |
| `System.Net.Http.Json package and namespace` | Package/API namespace providing JSON content creation and HttpClient JSON convenience extensions, including source-generated type metadata overloads. |

### Cancellation, failures, and response handling

| Supplied name | Meaning and use |
|---|---|
| `CancellationToken propagation through SendAsync and content reads` | The token should reach send, stream read, and JSON deserialization operations. Stop local work when the caller/deadline cancels, but do not assume the remote server rolled back. |
| `HttpRequestException` | Exception for HTTP transport/protocol failures and some configured status failures. It does not represent every non-success HTTP response when using raw send APIs. |
| `HttpRequestException.StatusCode` | Optional HTTP status associated with an exception where available, for example when a helper throws for a failed status. It may be null for DNS/TLS/socket failures. |
| `HttpRequestException.HttpRequestError` | Classification of common request failures in modern .NET, aiding diagnostics without parsing localized exception text. |
| `HttpRequestError enum` | Enumerates failure categories such as name-resolution, connection, secure-connection, or protocol failures depending on runtime/API version. Use it for telemetry/handling, not to expose internal details to clients. |
| `OperationCanceledException from timeout or cancellation` | Can arise from caller cancellation, `HttpClient.Timeout`, or a resilience timeout. Correlate the exception with tokens/deadline/timeout configuration before classifying it. |
| `TaskCanceledException behavior for HTTP timeout` | HTTP client timeouts have historically surfaced as `TaskCanceledException`, which derives from `OperationCanceledException`. Do not assume all such exceptions mean only user cancellation. |
| `HttpResponseMessage.IsSuccessStatusCode` | Boolean for success-range status codes. It does not define which non-success statuses are expected domain outcomes. |
| `EnsureSuccessStatusCode versus explicit status handling` | `EnsureSuccessStatusCode` throws for non-success responses; explicit status handling preserves cases such as 404, 409, or 429 as typed application outcomes. |
| `Response disposal and connection reuse` | Disposing the response/content releases resources; consuming or disposing bodies enables the handler to reclaim/reuse connections according to protocol/handler behavior. |
| `ResponseHeadersRead and streaming large responses` | Returns after headers so the caller can process body incrementally. Keep the response alive for the stream and dispose both at completion/cancellation. |
| `ResponseContentRead buffering behavior` | Buffers the body before send completion. Convenient for small responses, but memory usage scales with concurrent response size. |
| `Request content replayability and retries` | A retry requires a fresh/replayable request body. Seekable in-memory content is easier to reproduce than a consumed network/file stream; verify resilience handler behavior for streaming content. |
| `Multipart request replayability and retries` | Multipart requests may contain consumed streams. Retrying can fail or send incomplete content unless the request/content can be safely recreated for each attempt. |
| `BaseAddress URI resolution and trailing slash behavior` | Relative URIs follow standard `Uri` resolution: a base path without a trailing slash is treated as a file-like last segment and may be replaced. Use a deliberate trailing slash for append semantics. |
| `Per-request headers versus DefaultRequestHeaders` | Set caller-specific headers on `HttpRequestMessage`; configure stable client-wide headers in defaults. |
| `Avoid mutable default headers for request-specific data` | Mutating shared defaults concurrently can leak one caller's token/tenant/correlation value to another request. |

## Cross-item comparison

| API pattern | Body behavior | Status handling | Best fit |
|---|---|---|---|
| `GetFromJsonAsync<T>` | Reads/deserializes JSON body | Convenience helper throws for non-success | Small ordinary JSON reads where custom status response is unnecessary |
| `SendAsync` + `ResponseContentRead` | Buffers body before completion | Caller inspects response/status | Small bounded responses and explicit status handling |
| `SendAsync` + `ResponseHeadersRead` | Caller streams body after headers | Caller inspects response/status | Large downloads or incremental processing |
| `PostAsJsonAsync<T>` | Serializes request and returns response | Caller handles response/status | JSON writes only with deliberate idempotency/retry policy |

For streaming/upload clients, cancellation and disposal are part of correctness. Do not let convenience helpers hide a body-size, status, or replayability requirement that matters to the operation.

## Examples

### Preserve an expected 404 as an application result

```csharp
using var request = new HttpRequestMessage(HttpMethod.Get, "items/42");
using var response = await client.SendAsync(
    request,
    HttpCompletionOption.ResponseHeadersRead,
    cancellationToken);

if (response.StatusCode == HttpStatusCode.NotFound)
    return null;

response.EnsureSuccessStatusCode();
await using var body = await response.Content.ReadAsStreamAsync(cancellationToken);
return await JsonSerializer.DeserializeAsync<Item>(body, jsonOptions, cancellationToken);
```

This snippet handles 404 deliberately, streams other success responses, propagates cancellation, and disposes the response/stream. The stream remains valid only while the response/content is alive.

### Pass caller-specific metadata through a handler

Store a correlation/user metadata value in the request's typed options and let an outgoing handler read it for that request. Do not store the value in a field on a factory-pooled handler, because a later request could observe it.

## Common mistakes

- Using a stream-backed request body with retry behavior without proving it can be recreated.
- Assuming `GetFromJsonAsync<T>` exposes all status details when it throws.
- Calling `EnsureSuccessStatusCode` for expected 404/409/429 cases and losing domain-specific handling.
- Forgetting to dispose response messages or streams.
- Buffering unbounded responses into strings/byte arrays.
- Assuming timeout exceptions always mean the user cancelled.
- Retrying non-replayable multipart/file streams.
- Adding request-specific auth/tenant headers to `DefaultRequestHeaders` on a shared client.
- Logging raw response bodies or sensitive headers.
- Using a base address without understanding trailing-slash URI resolution.

## Knowledge checks with answers

1. **When should `ResponseHeadersRead` be used?** When the caller should stream a potentially large body after response headers arrive and can manage disposal/cancellation.
2. **Why does a retry need replayable request content?** Each attempt must send the intended full body; a consumed non-seekable stream may not be able to produce it again.
3. **Does `EnsureSuccessStatusCode` distinguish a domain 404 from a transport failure?** It throws for the non-success status; inspect explicitly when the status is an expected domain result.
4. **Where should a per-user bearer token be set?** On the individual request, not mutable shared default headers or handler state.
5. **What may `TaskCanceledException` indicate?** Caller cancellation or an HTTP/resilience timeout; inspect the deadline/token context.

## Sources

- [System.Net.Http.Json API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.json.httpclientjsonextensions)
- [DelegatingHandler API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.delegatinghandler)
- [HttpRequestException API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httprequestexception)
- [IHttpClientFactory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)

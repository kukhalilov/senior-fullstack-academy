# HTTP request response headers forms files and streaming bodies — Reference: Per-request context, request metadata, header collections, cookies, and cancellation

## Scope and version

The context is per request; metadata values are client input unless established by trusted middleware. `HttpContext.Features` is capability-based, so feature presence and host matter. [HttpContext](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/use-http-context?view=aspnetcore-11.0) [Request features](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/request-features?view=aspnetcore-11.0)

## How this group fits the mental model

For each member, ask: is it per-request state, untrusted metadata, a body consumer, a parser/resource limit, or a response commitment/output API? Track who owns the data and what downstream code can still do.

## Supplied names explained

- `HttpContext` — The per-request container for request, response, identity, services, connection state, cancellation, and server features. It is not safe to retain after request completion.
- `HttpContext.Request` — Incoming HTTP metadata and body for this request.
- `HttpContext.Response` — Outgoing status, headers, cookies, and body.
- `HttpContext.Items` — A request-local key/value bag for coordinating components during this request; it is not shared storage or a place for data that must outlive the request.
- `HttpContext.Features` — Server-provided capabilities, often optional and host-specific.
- `HttpContext.RequestServices` — The request's scoped service provider. Use it through normal injection when possible and never cache it beyond the request.
- `HttpContext.TraceIdentifier` — Request correlation identifier useful for diagnostics; do not treat it as an authentication secret.
- `HttpContext.Connection` — Connection-level information such as remote/local addresses; may be proxy-adjusted.
- `HttpContext.User` — Authenticated ClaimsPrincipal when authentication has run.
- `HttpContext.Abort` — Aborts the underlying request/connection. Use only when a deliberate protocol-level termination is required; normal cancellation should flow through tokens.
- `HttpContext.RequestAborted` — Cancellation token that signals request work should stop when the underlying request is aborted; pass it to cancellable I/O.
- `HttpRequest` — Per-request abstraction for method, URL components, headers, cookies, route values, form data, cancellation-related context, and the incoming body. Treat inputs as untrusted and consume the body deliberately.
- `HttpRequest.HttpContext` — Back-reference to the HttpContext that owns this request. It has the same request lifetime and must not be retained for background work.
- `HttpRequest.Method` — HTTP method token; validate allowed methods at endpoint/protocol boundary.
- `HttpRequest.Scheme` — App-visible scheme, which may depend on trusted forwarded-header processing.
- `HttpRequest.IsHttps` — Convenience check for the effective request scheme; behind TLS termination configure trusted forwarded headers first.
- `HttpRequest.Host` — Parsed host authority from the request; validate allowed hosts and trust proxy configuration.
- `HttpRequest.PathBase` — Application prefix already consumed upstream; used when building app-relative URLs.
- `HttpRequest.Path` — Remaining path used for routing after any PathBase.
- `HttpRequest.QueryString` — Raw query component including its delimiter; use Query for parsed values.
- `HttpRequest.Query` — Parsed query collection; values are untrusted and may repeat.
- `HttpRequest.Headers` — Case-insensitive header collection with possible multiple values; do not assume all values are singular or safe.
- `HttpRequest.GetDeclaredTrailers(HttpRequest)` — Reads the Trailer header declaration that names request trailers expected after the body; actual trailer support depends on protocol/server.
- `HttpRequest.GetDisplayUrl(HttpRequest)` — Builds a human-readable URL for display/logging only; its decoded form must not be reused as a request target or trusted security value.
- `HttpRequest.GetEncodedPathAndQuery(HttpRequest)` — Returns the escaped path plus query component for a relative URI; use when constructing HTTP-facing values.
- `HttpRequest.GetEncodedUrl(HttpRequest)` — Returns a fully escaped request URL suitable for protocol operations such as headers; unlike GetDisplayUrl, it is not display-decoded.
- `HttpRequest.GetHeaderParsing(HttpRequest)` — Resolves the registered typed header-parsing service from request services. This API is supplied by the separate `Microsoft.AspNetCore.HeaderParsing` package; install the package and call `AddHeaderParsing` before using it. It is not a server-feature probe. [Package](https://www.nuget.org/packages/Microsoft.AspNetCore.HeaderParsing) [API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.headerparsinghttprequestextensions?view=aspnetcore-11.0)
- `HttpRequest.GetMultipartBoundary(HttpRequest)` — Extracts the multipart boundary from request Content-Type; validate a nonempty boundary and enforce section limits before parsing.
- `HttpRequest.ContentLength` — Declared byte count when supplied; not an adequate independent resource limit.
- `HttpRequest.ContentType` — Media type claim for the request body; validate it before choosing a parser.
- `HttpRequest.Protocol` — Negotiated HTTP protocol version token; not the application method or route.
- `HttpRequest.Body` — Incoming sequential Stream; reading consumes bytes and normally cannot be rewound.
- `HttpRequest.BodyReader` — PipeReader view of incoming bytes. Respect ReadAsync/AdvanceTo lifetimes; resetting Body.Position does not rewind a consumed reader.
- `HttpRequest.Form` — Convenience form accessor that can lazily trigger parsing and buffering. Prefer ReadFormAsync in async code and check form content type first.
- `HttpRequest.HasFormContentType` — Checks whether the request media type is a supported form content type before invoking form parsing.
- `HttpRequest.RouteValues` — Values populated by endpoint routing when a route is selected.
- `HttpRequest.Cookies` — Parsed request cookies; values are client-controlled and may be protected/authenticated separately.
- `HttpRequestAborted cancellation` — The request cancellation signal exposed as HttpContext.RequestAborted. Pass it to body reads, copies, and other cancellable request work; do not confuse cancellation with a successful response delivery.
- `IHeaderDictionary` — Mutable collection of HTTP header fields used by request and response abstractions. Header names are case-insensitive; values use StringValues and must be interpreted according to each field grammar.
- `IHeaderDictionary.ContentLength` — Convenience strongly named header accessor backed by the request/response header collection; header values can be repeated and should be parsed according to the header specification.
- `IHeaderDictionary.ContentType` — Convenience strongly named header accessor backed by the request/response header collection; header values can be repeated and should be parsed according to the header specification.
- `IHeaderDictionary.Host` — Convenience strongly named header accessor backed by the request/response header collection; header values can be repeated and should be parsed according to the header specification.
- `IHeaderDictionary.Accept` — Convenience strongly named header accessor backed by the request/response header collection; header values can be repeated and should be parsed according to the header specification.
- `IHeaderDictionary.Authorization` — Convenience strongly named header accessor backed by the request/response header collection; header values can be repeated and should be parsed according to the header specification.
- `HeaderDictionary` — Concrete header collection implementation with case-insensitive names and StringValues values. Prefer the IHeaderDictionary abstraction in application code.
- `HeaderNames` — Constants for standardized header field names, reducing spelling mistakes. They do not parse or validate the field values.
- `StringValues` — Struct representing zero, one, or multiple string values without forcing an allocation for the common single-value case. Parse according to the relevant header grammar instead of joining blindly.
- `Request headers versus query parameters` — Headers are metadata and can repeat; query values are URL parameters. Both are untrusted, but have different caching, privacy, and intermediary behavior.
- `Header normalization` — Header names compare case-insensitively; avoid manual case-sensitive dictionaries for protocol headers.
- `Multiple header values` — A header may have multiple field values; parse according to its grammar rather than joining blindly.
- `Cookie request header` — Client-sent cookie pairs; validate/decrypt through the intended authentication/data-protection system and avoid raw logging.
- `HttpRequest lifetime` — Request-specific object valid during the active request; do not retain its stream, headers, or services for background work.
- `Do not retain HttpContext after request` — Copy required immutable values into background messages; the request context, scoped provider, and body cease to be valid.
- `IHttpContextAccessor request-flow caveat` — Ambient access relies on async execution context and is unavailable outside an active request; do not capture it for background jobs.
- `HttpRequest.GetTypedHeaders(HttpRequest)` — Provides strongly typed access to parsed request headers; still validate values and account for absent/malformed headers.

## Additional verified API surface and usage

The framework also exposes strongly named header properties as convenience accessors over `IHeaderDictionary`. These members do not validate the field grammar: choose typed parsing or protocol-specific validation where required. `RequestHeaders` and `ResponseHeaders` provide typed views for standard request and response fields; their `Get`/`Set` and list methods parse or serialize according to each strongly typed header representation. Header fields remain untrusted even when exposed through typed wrappers.

`Microsoft.AspNetCore.HeaderParsing` is a separate package. Install it and register `AddHeaderParsing` in DI; register common/custom header parsers through `IHeaderRegistry`, then use the returned `HeaderKey<T>` with `TryGetHeaderValue`. `ParsingResult` separates absent values (`NotFound`) from malformed values (`Error`) and successfully parsed values (`Success`). Configure defaults and cache bounds deliberately; only cacheable parsers participate, and cached values are not a substitute for request limits. `HeaderParser<T>.TryParse` receives `StringValues`; custom parsers must reject invalid forms without unsafe assumptions. `GetHeaderParsing` accesses the registered service from `RequestServices`, so it is not a server-capability probe. [Registration and options](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.headerparsing.headerparsingoptions?view=aspnetcore-11.0) [Common headers](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.http.headerparsing.commonheaders?view=aspnetcore-11.0)

The request trailer helpers distinguish declaration from received trailer values. Trailer availability depends on HTTP protocol and server support; check before reading. `HasJsonContentType` is a media-type check, not proof that a body is valid JSON.

### Exact API names

- `IHeaderDictionary.AcceptCharset`
- `IHeaderDictionary.AcceptEncoding`
- `IHeaderDictionary.AcceptLanguage`
- `IHeaderDictionary.AcceptRanges`
- `IHeaderDictionary.AccessControlAllowCredentials`
- `IHeaderDictionary.AccessControlAllowHeaders`
- `IHeaderDictionary.AccessControlAllowMethods`
- `IHeaderDictionary.AccessControlAllowOrigin`
- `IHeaderDictionary.AccessControlExposeHeaders`
- `IHeaderDictionary.AccessControlMaxAge`
- `IHeaderDictionary.AccessControlRequestHeaders`
- `IHeaderDictionary.AccessControlRequestMethod`
- `IHeaderDictionary.Age`
- `IHeaderDictionary.Allow`
- `IHeaderDictionary.AltSvc`
- `IHeaderDictionary.Baggage`
- `IHeaderDictionary.CacheControl`
- `IHeaderDictionary.Connection`
- `IHeaderDictionary.ContentDisposition`
- `IHeaderDictionary.ContentEncoding`
- `IHeaderDictionary.ContentLanguage`
- `IHeaderDictionary.ContentLocation`
- `IHeaderDictionary.ContentMD5`
- `IHeaderDictionary.ContentRange`
- `IHeaderDictionary.ContentSecurityPolicy`
- `IHeaderDictionary.ContentSecurityPolicyReportOnly`
- `IHeaderDictionary.CorrelationContext`
- `IHeaderDictionary.Date`
- `IHeaderDictionary.ETag`
- `IHeaderDictionary.Expect`
- `IHeaderDictionary.Expires`
- `IHeaderDictionary.From`
- `IHeaderDictionary.GrpcAcceptEncoding`
- `IHeaderDictionary.GrpcEncoding`
- `IHeaderDictionary.GrpcMessage`
- `IHeaderDictionary.GrpcStatus`
- `IHeaderDictionary.GrpcTimeout`
- `IHeaderDictionary.IfMatch`
- `IHeaderDictionary.IfModifiedSince`
- `IHeaderDictionary.IfNoneMatch`
- `IHeaderDictionary.IfRange`
- `IHeaderDictionary.IfUnmodifiedSince`
- `IHeaderDictionary.Item[String]`
- `IHeaderDictionary.KeepAlive`
- `IHeaderDictionary.LastModified`
- `IHeaderDictionary.Link`
- `IHeaderDictionary.Location`
- `IHeaderDictionary.MaxForwards`
- `IHeaderDictionary.Origin`
- `IHeaderDictionary.Pragma`
- `IHeaderDictionary.ProxyAuthenticate`
- `IHeaderDictionary.ProxyAuthorization`
- `IHeaderDictionary.ProxyConnection`
- `IHeaderDictionary.Range`
- `IHeaderDictionary.Referer`
- `IHeaderDictionary.RequestId`
- `IHeaderDictionary.RetryAfter`
- `IHeaderDictionary.SecWebSocketAccept`
- `IHeaderDictionary.SecWebSocketExtensions`
- `IHeaderDictionary.SecWebSocketKey`
- `IHeaderDictionary.SecWebSocketProtocol`
- `IHeaderDictionary.SecWebSocketVersion`
- `IHeaderDictionary.Server`
- `IHeaderDictionary.SetCookie`
- `IHeaderDictionary.StrictTransportSecurity`
- `IHeaderDictionary.TE`
- `IHeaderDictionary.TraceParent`
- `IHeaderDictionary.TraceState`
- `IHeaderDictionary.Trailer`
- `IHeaderDictionary.TransferEncoding`
- `IHeaderDictionary.Translate`
- `IHeaderDictionary.Upgrade`
- `IHeaderDictionary.UpgradeInsecureRequests`
- `IHeaderDictionary.UserAgent`
- `IHeaderDictionary.Vary`
- `IHeaderDictionary.Via`
- `IHeaderDictionary.Warning`
- `IHeaderDictionary.WebSocketSubProtocols`
- `IHeaderDictionary.WWWAuthenticate`
- `IHeaderDictionary.XContentTypeOptions`
- `IHeaderDictionary.XFrameOptions`
- `IHeaderDictionary.XPoweredBy`
- `IHeaderDictionary.XRequestedWith`
- `IHeaderDictionary.XUACompatible`
- `IHeaderDictionary.XXSSProtection`
- `HeaderDictionaryExtensions.Append`
- `HeaderDictionaryExtensions.AppendCommaSeparatedValues`
- `HeaderDictionaryExtensions.AppendList<T>`
- `HeaderDictionaryExtensions.GetCommaSeparatedValues`
- `HeaderDictionaryExtensions.SetCommaSeparatedValues`
- `RequestHeaders`
- `RequestHeaders.Accept`
- `RequestHeaders.AcceptCharset`
- `RequestHeaders.AcceptEncoding`
- `RequestHeaders.AcceptLanguage`
- `RequestHeaders.CacheControl`
- `RequestHeaders.ContentDisposition`
- `RequestHeaders.ContentLength`
- `RequestHeaders.ContentRange`
- `RequestHeaders.ContentType`
- `RequestHeaders.Cookie`
- `RequestHeaders.Date`
- `RequestHeaders.Expires`
- `RequestHeaders.Host`
- `RequestHeaders.IfMatch`
- `RequestHeaders.IfModifiedSince`
- `RequestHeaders.IfNoneMatch`
- `RequestHeaders.IfRange`
- `RequestHeaders.IfUnmodifiedSince`
- `RequestHeaders.LastModified`
- `RequestHeaders.Range`
- `RequestHeaders.Append`
- `RequestHeaders.AppendList<T>`
- `RequestHeaders.Get<T>`
- `RequestHeaders.GetList<T>`
- `RequestHeaders.Set`
- `RequestHeaders.SetList<T>`
- `ResponseHeaders`
- `ResponseHeaders.CacheControl`
- `ResponseHeaders.ContentDisposition`
- `ResponseHeaders.ContentLength`
- `ResponseHeaders.ContentRange`
- `ResponseHeaders.ContentType`
- `HeaderParsingHttpRequestExtensions.GetHeaderParsing(HttpRequest)`
- `HeaderParsingHttpRequestExtensions.TryGetHeaderValue<T>(HttpRequest, HeaderKey<T>, out T)`
- `HeaderParsingHttpRequestExtensions.TryGetHeaderValue<T>(HttpRequest, HeaderKey<T>, out T, out ParsingResult)`
- `HeaderParsingFeature`
- `HeaderParsingFeature.TryGetHeaderValue<T>(HeaderKey<T>, out T)`
- `HeaderParsingFeature.TryGetHeaderValue<T>(HeaderKey<T>, out T, out ParsingResult)`
- `HeaderParsing package dependency`
- `IServiceCollection.AddHeaderParsing()`
- `IServiceCollection.AddHeaderParsing(Action<HeaderParsingOptions>)`
- `IServiceCollection.AddHeaderParsing(IConfigurationSection)`
- `HeaderParsingOptions`
- `HeaderParsingOptions.DefaultValues`
- `HeaderParsingOptions.DefaultMaxCachedValuesPerHeader`
- `HeaderParsingOptions.MaxCachedValuesPerHeader`
- `IHeaderRegistry`
- `IHeaderRegistry.Register<T>(HeaderSetup<T>)`
- `HeaderKey<T>`
- `HeaderKey<T>.Name`
- `HeaderSetup<T>`
- `HeaderSetup<T>.HeaderName`
- `HeaderSetup<T>.ParserType`
- `HeaderSetup<T>.ParserInstance`
- `HeaderSetup<T>.Cacheable`
- `HeaderParser<T>`
- `HeaderParser<T>.TryParse(StringValues, out T, out string)`
- `ParsingResult.Success`
- `ParsingResult.Error`
- `ParsingResult.NotFound`
- `CommonHeaders`
- `CommonHeaders.Host`
- `CommonHeaders.Accept`
- `CommonHeaders.AcceptEncoding`
- `CommonHeaders.AcceptLanguage`
- `CommonHeaders.CacheControl`
- `CommonHeaders.ContentDisposition`
- `CommonHeaders.ContentType`
- `CommonHeaders.Cookie`
- `CommonHeaders.Date`
- `CommonHeaders.IfMatch`
- `CommonHeaders.IfModifiedSince`
- `CommonHeaders.IfNoneMatch`
- `CommonHeaders.IfRange`
- `CommonHeaders.IfUnmodifiedSince`
- `CommonHeaders.Range`
- `CommonHeaders.Referer`
- `CommonHeaders.XForwardedFor`
- `HttpRequest.SupportsTrailers(HttpRequest)`
- `HttpRequest.CheckTrailersAvailable(HttpRequest)`
- `HttpRequest.GetTrailer(HttpRequest, string)`
- `HttpRequest.HasJsonContentType(HttpRequest)`

## Cross-item comparison

Request metadata and headers describe the current exchange; they are not trusted identity claims by themselves. RequestServices exposes scoped dependencies, while storing HttpContext or its services beyond request lifetime is unsafe. Typed header views help parse field structure but do not remove the need to validate values.
## Examples

Read only the metadata needed for a request and use a correlation value generated or validated by trusted middleware. Do not trust client-supplied forwarding headers unless the sender is a configured proxy.

```csharp
app.MapGet("/orders", (HttpContext context) =>
{
    var requestId = context.TraceIdentifier;
    var accept = context.Request.Headers.Accept.ToString();
    return Results.Ok(new { requestId, accepts = accept });
});
```
## Common mistakes

- Retaining HttpContext or RequestServices for background work.
- Reading the body before EnableBuffering or mixing a consumed BodyReader with a reset stream.
- Treating Content-Length, a file extension, or ContentType as proof of safety.
- Raising a form limit while forgetting a server/proxy limit.
- Calling AdvanceTo incorrectly or accessing buffer memory afterward.
- Setting response metadata after the first write/StartAsync.
- Assuming a flush proves the peer received all bytes.

## Knowledge checks with answers

1. Which header values should be treated as untrusted input? Client-provided fields, including host/forwarding metadata unless a trusted proxy boundary establishes them.
2. How long is HttpContext valid? Only for the active request pipeline; do not retain it for background work.
3. When should typed header parsing be used? When the field has a defined grammar; still validate application-specific meaning.

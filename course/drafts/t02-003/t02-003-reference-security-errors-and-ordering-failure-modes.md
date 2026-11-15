# ASP.NET Core middleware pipeline order and branching — Reference: Security boundaries, error handling, buffering, and ordering diagnostics

## Scope and version

The critical boundaries are trusted proxy data, endpoint metadata availability, public file exposure, and response commitment. A failure before headers start may be mapped to a safe response; one after start generally cannot. [Errors](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-11.0) [Request/response](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0)

## How this group fits the mental model

Classify each registration by its job: observe all requests, inspect matched endpoint metadata, serve a resource, branch to another chain, or terminate. Then determine which later stages it can skip and what response work runs on unwind.

## Supplied names explained

- `Middleware exception boundary` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Developer exception page environment restriction` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Production exception handler` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Problem Details middleware` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `IExceptionHandler` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `ExceptionHandlerOptions` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `IExceptionHandlerPathFeature` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `StatusCodeSelector` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `AllowStatusCode404Response` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Status code page response body` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePagesWithReExecute path preservation` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Static web asset exposure` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `wwwroot public file boundary` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `Static file authorization bypass` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `Authorization endpoint metadata` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `CORS preflight handling` — Applies browser cross-origin policy. Place it where routing metadata and preflight handling are available; it is not server-side authorization.
- `CORS before response caching` — Applies browser cross-origin policy. Place it where routing metadata and preflight handling are available; it is not server-side authorization.
- `Authentication scheme selection` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `Authorization policy execution` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `Forwarded header trust boundary` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `KnownProxies` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `KnownNetworks` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `ForwardLimit` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `Host header filtering` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `HTTP request body rewind` — Request bodies are normally forward-only. Buffer only for a necessary second read, cap resource use, rewind before delegation, and protect sensitive content.
- `Request body stream consumption` — Request bodies are normally forward-only. Buffer only for a necessary second read, cap resource use, rewind before delegation, and protect sensitive content.
- `Response already started exception` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Response.OnStarting callback ordering` — Runs immediately before response headers are committed; register before downstream execution if headers need modification.
- `Middleware analysis diagnostic` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Microsoft.AspNetCore.MiddlewareAnalysis` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `MiddlewareAnalysisStartupFilter` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Developer exception page sensitive data` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Exception handler re-execution` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Re-execution path and endpoint selection` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Middleware ordering integration test` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Application pipeline diagnostic` — Helps observe or verify effective pipeline behavior. Prefer focused integration assertions over brittle assumptions about framework internals.
- `Request logging placement` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `Response compression and caching order` — Controls response reuse or representation encoding. Choose order and variation so shared caches do not mix users, origins, or encodings.
- `Response caching Vary behavior` — Controls response reuse or representation encoding. Choose order and variation so shared caches do not mix users, origins, or encodings.

## Cross-item comparison

This group contains related names, not interchangeable options. Compare the supplied items by matching condition, endpoint awareness, whether they invoke downstream work, whether they rejoin, and whether they can short-circuit. Static files and endpoint handlers have different authorization boundaries. Exception handling and status-code pages handle different failure shapes.

## Examples

```csharp
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Request-Id"] = context.TraceIdentifier;
        return Task.CompletedTask;
    });
    await next(context);
});
```

The callback is registered before the downstream chain and runs just before headers commit. For a branch, test both the condition match and fall-through. For endpoint-aware policy, ensure routing has selected metadata. For request-body inspection, avoid reading when possible; otherwise buffer within a strict limit, rewind, and redact sensitive data.

## Common mistakes

- Omitting `next` accidentally and silently skipping downstream middleware.
- Confusing exception handling with empty-status response handling.
- Assuming a file served directly is protected by later authorization.
- Treating automatic host insertion as proof of a desired order.
- Trusting client-supplied proxy headers or branch conditions as identity.
- Assuming a response can be replaced after it has started.

## Knowledge checks with answers

1. What should be checked first when endpoint metadata is needed? Routing must have selected the endpoint.
2. What ends the current path? A middleware return without invoking the remaining delegate, or terminal work.
3. What two cases should every branch test? A matching request and a request that falls through.

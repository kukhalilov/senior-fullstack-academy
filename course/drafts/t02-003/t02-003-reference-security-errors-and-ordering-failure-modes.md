# ASP.NET Core middleware pipeline order and branching — Reference: Security boundaries, error handling, buffering, and ordering diagnostics

## Scope and version

This reference joins error handling, proxy trust, public files, request/response commitment, and diagnostics. Sources: Microsoft's [error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-11.0), [API error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api?view=aspnetcore-11.0), [forwarded headers](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-11.0), [request/response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0), and [middleware ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0).

## How this group fits the mental model

Start by classifying what failed: an exception, an empty error status, or a response already committed. Then trace whether execution reached an endpoint, a public file handler, a proxy trust boundary, or an error re-execution path. Each case has a different safe recovery.

## Supplied names explained

### First distinguish three failure shapes

1. **An exception** means downstream code threw. Exception-handling middleware can translate an unhandled exception if it surrounds the throwing middleware and the response has not started.
2. **An error status with an empty body** (for example, a routing 404) is not an exception. Status-code pages can add a body to eligible 4xx/5xx responses.
3. **A response already started** has committed headers (and possibly body bytes). Middleware generally cannot reset it to a new status/body. Log safely, abort only when appropriate, and design streaming endpoints to handle failures after commitment.

### Exception handling and Problem Details

- **`Middleware exception boundary`** — An outer `UseExceptionHandler` catches unhandled exceptions thrown by components downstream of its registration. Exceptions thrown earlier are outside that boundary. It cannot catch process termination or reliably replace a committed response.
- **`Developer exception page environment restriction` / Developer exception page sensitive data** — Detailed developer output is for Development only. It can contain stack traces, headers, query data, and other sensitive context; never expose it on a public production deployment.
- **`Production exception handler`** — Use a safe generic response or structured error representation, log diagnostic details server-side with redaction, and avoid returning exception messages/stack traces to clients.
- **`Problem Details middleware`** — `AddProblemDetails` registers Problem Details services used by supported exception/status-code handling paths; `UseExceptionHandler` establishes the exception boundary. Confirm the exact endpoint/middleware produces the API's required status, media type, and `ProblemDetails` payload—registration alone does not transform every response.
- **`IExceptionHandler`** — Central exception strategy with `TryHandleAsync(HttpContext, Exception, CancellationToken)`. Register implementations with `AddExceptionHandler<T>` and add `UseExceptionHandler`; handlers are singleton services and execute in registration order until one returns `true`.
- **`ExceptionHandlerOptions`** — Configures exception middleware behavior, including error handling/path, exception-to-status mapping, 404 response allowance, and diagnostics suppression behavior in supported versions. Use explicit options when defaults do not meet the API contract.
- **`IExceptionHandlerPathFeature`** — Feature available during path-based/re-executed exception handling; exposes the original failing path and exception. Treat it as sensitive diagnostic input, not a response payload to return verbatim.
- **`StatusCodeSelector`** — `ExceptionHandlerOptions` callback that selects an HTTP status from an exception. It changes status selection; the handler still must produce a safe body and logging/telemetry behavior.
- **`AllowStatusCode404Response`** — Controls whether exception middleware accepts an error handler that produces 404 as a handled response. The default protects against a misconfigured error endpoint silently appearing successful; set true only when a 404 from that handler is intentional.
- **`Exception handler re-execution`** — Path-based exception handling can run a new downstream path on the same `HttpContext`. Middleware after the exception handler may be invoked again, so cache/cleanup mutable state, avoid duplicate side effects, and account for endpoint routing running again. Middleware before the exception boundary is not rerun.
- **`Re-execution path and endpoint selection`** — The error path is matched through the downstream pipeline and may select a different endpoint. Preserve the original failure information through `IExceptionHandlerPathFeature`; avoid a route that throws the same exception and recursively fails.
- **.NET 10 diagnostics change** — `ExceptionHandlerOptions.SuppressDiagnosticsCallback` allows handled exceptions' diagnostics to be selectively suppressed. If operators depend on previous always-emitted diagnostics, configure the callback explicitly and test logging/metrics after upgrading.

An `IExceptionHandler` returning `true` owns the response. It should set the status and write the full body (or use an appropriate Problem Details service). If all registered handlers return false, the configured fallback path/delegate/Problem Details behavior applies. Merely registering a handler without `UseExceptionHandler` does not invoke it.

### Status code pages

- **`Status code page response body`** — By default, an empty 4xx/5xx response remains bodyless. Status-code pages can write a generic/custom body for eligible responses. They do not catch exceptions, overwrite existing bodies, or change every error response.
- **`UseStatusCodePagesWithReExecute path preservation`** — Runs the downstream pipeline again using an alternate path while keeping the client's original URL. It usually preserves the original status unless the re-executed endpoint changes it; downstream middleware must be safe for repeated execution.

For APIs, prefer a consistent documented error contract. A generic text status page can be unsuitable for a JSON client. Error endpoints should not require the same missing dependency or authorization flow that caused the failure.

### Static file and authorization boundary

- **`Static web asset exposure` / `wwwroot public file boundary`** — Files intentionally served from the public web root are publicly retrievable by URL. Keep secrets, private uploads, and tenant-specific documents outside it.
- **`Static file authorization bypass`** — `UseStaticFiles` can serve a file and short-circuit before later endpoint authorization middleware. Putting `UseAuthorization` later does not protect such a file.
- **`Authorization endpoint metadata`** — Endpoint authorization policies depend on routing metadata and authorization middleware before endpoint invocation. Static-file middleware does not turn a raw file match into an authorized endpoint.
- **`Static file authorization endpoint pattern`** — For private content, store it outside public static roots and return it through an authenticated/authorized endpoint that checks ownership/policy before opening or streaming the file. Guard path traversal, tenant boundaries, and cache headers as well.

Newer ASP.NET Core versions also provide endpoint-oriented static-asset features. Do not assume they share every `UseStaticFiles` behavior: consult the target framework's static-assets docs and verify authorization metadata and deployment mode for the chosen API. The security invariant remains that private data must not be exposed by a public URL.

### CORS, authentication, authorization, and caches

- **`CORS preflight handling`** — Browser preflight requests use `OPTIONS` and carry `Origin`/`Access-Control-Request-*` headers. CORS middleware may answer them before the endpoint runs; redirects or authentication placed ahead of CORS can make valid browser requests fail.
- **`CORS before response caching`** — If responses vary by `Origin`, caches must not reuse a response with another origin's CORS headers. Configure the relevant `Vary`/cache policy and test cache hits across origins; middleware ordering alone is not proof of isolation.
- **`Authentication scheme selection`** — Authentication reads configured credentials using a default or endpoint-selected scheme and establishes the principal. A challenge scheme can differ from the authenticate scheme; verify the effective defaults and endpoint metadata.
- **`Authorization policy execution`** — Authorization checks the authenticated principal against endpoint metadata/policies. It is separate from CORS and from static-file access.
- **`Response caching Vary behavior`** — Cache keys must account for every request dimension that changes the representation, such as `Accept-Encoding` or allowed origin. Never cache personalized/sensitive content under a shared key without a safe policy.
- **`Response compression and caching order`** — Compression changes representation bytes; caching may store/serve variants. Ensure correct `Vary: Accept-Encoding` semantics and avoid compressing secrets in response contexts vulnerable to side-channel attacks. ASP.NET Core 11 adds `Vary: Accept-Encoding` to every response when response compression is enabled, including those left uncompressed; validate reverse-proxy/CDN behavior too.

### Forwarded-header trust boundary

- **`Forwarded header trust boundary`** — Forwarded scheme, host, and client address fields are supplied by proxies and may be forged by direct clients. Trust only known proxy hops and make the edge overwrite/append headers according to a documented topology.
- **`KnownProxies`** — Explicit proxy addresses allowed to supply forwarded values. Configure actual immediate proxy addresses and account for address-family/NAT/container details.
- **`KnownNetworks`** — Trusted proxy networks, expressed as network/prefix rules. Keep ranges narrow; trusting a broad client-reachable network grants it influence over perceived scheme/IP.
- **`ForwardLimit`** — Maximum number of forwarded entries consumed. Set it to match the real proxy chain and test multi-hop behavior; an incorrect limit can select an attacker-controlled or wrong hop.
- **Host header filtering** — Validate accepted host values against configured names; this is separate from the forwarded-proxy trust boundary and does not configure DNS or TLS certificates.

Place `UseForwardedHeaders` before HTTPS redirection, link generation, IP-based authorization/rate limiting, and logging that needs the original client information. Trust configuration must match deployment; disabling trust checks for convenience is unsafe.

### Request-body and response-commit hazards

- **`HTTP request body rewind`** — Request bodies are forward-only unless buffering is enabled. `EnableBuffering` before reading supports rereads; reset `Request.Body.Position` to zero before model binding/endpoint execution.
- **`Request body stream consumption`** — Reading to end consumes bytes for later middleware. Avoid payload inspection where possible; if needed, cap bytes, respect cancellation, handle encoding, avoid logging secrets/credentials, and account for memory/disk buffering.
- **`Response already started exception`** — Once headers or body bytes have been sent, a later exception handler cannot generally replace the response. Streaming code should stop safely and report through logs/trailers/connection termination according to protocol.
- **`Response.OnStarting callback ordering`** — Callbacks run just before headers are committed and in reverse registration order. Register before downstream execution; ensure callback code is fast and does not throw or depend on an already disposed scope.

### Diagnostics and tests

- **`Middleware analysis diagnostic` / `Microsoft.AspNetCore.MiddlewareAnalysis` / `MiddlewareAnalysisStartupFilter`** — The MiddlewareAnalysis package can emit diagnostic events as components enter/exit the pipeline. The startup filter arranges analysis around the app pipeline. Use it temporarily or in controlled diagnostics to understand order; avoid treating internal event names as a stable application contract.
- **`Application pipeline diagnostic`** — Combine framework diagnostics/logging with focused integration tests that assert observable behavior: status, headers, selected endpoint, whether downstream ran, and response body. A textual list of registrations may miss automatic insertion and branches.
- **`Middleware ordering integration test`** — Build a test app with trace middleware around routing/auth/endpoint behavior and assert the sequence for matched, unmatched, preflight, and short-circuited requests. Include the actual target host if proxy/static-file behavior is part of the claim.
- **`Request logging placement`** — Place logging where it can observe the selected endpoint/result required by operations, while redacting secrets. Logging before routing may lack endpoint names; logging after a short-circuit may never run.

## Cross-item comparison

Compare exception handling with status-code pages; public static-file serving with authorized endpoint delivery; and trusted forwarded-header processing with raw client-supplied values. The scenario table below shows how the boundary determines the fix.

## Examples

For a private document, authenticate and authorize in an endpoint before opening the file. For a thrown exception, use an early exception boundary and write a generic response before the response starts. For an empty 404, use a status-code response policy; do not expect it to catch exceptions.

## Scenario diagnosis

| Symptom | Likely cause | What to inspect |
|---|---|---|
| `/private/file.pdf` is readable without login | Public static-file middleware served it before endpoint authorization | Move private content outside web root and use an authorized endpoint. |
| HTTPS redirect loops behind ingress | Forwarded scheme is processed too late or not trusted/configured | Verify ingress headers, trusted proxy list, forward limit, and middleware order. |
| API error has HTML or empty body unexpectedly | Exception and status-code paths differ, or Problem Details services are not active | Test thrown exceptions, bodyless 404/500, and already-written responses separately. |
| CORS works on cache miss but fails on hit | Cache omitted origin/encoding variation or cached incorrect headers | Verify `Vary`, cache key, and origin policy across shared cache hits. |
| Error handler runs twice or duplicates logging | Re-execution reran downstream middleware | Make middleware reentrant/idempotent and use path feature to distinguish original/error request. |

## Common mistakes

- Returning exception details or stack traces to a production client.
- Assuming endpoint authorization protects files served by earlier static middleware.
- Trusting forwarded values from arbitrary callers or too many proxy hops.
- Reading request bodies without buffering, bounds, and rewind.
- Expecting an exception handler to replace a committed streaming response.

## Knowledge checks with answers

1. **Does status-code pages middleware handle a thrown exception?** No; that requires an exception-handling boundary.
2. **Why does `IExceptionHandler` returning true need a complete response?** The handler claims the exception; fallback handling will not complete its response for it.
3. **Can later endpoint authorization protect a file served earlier by `UseStaticFiles`?** No; static-file middleware can short-circuit before it.
4. **What must be trusted before honoring forwarded scheme/IP?** Only proxy hops matching the configured known proxies/networks and forward limit.
5. **What is impossible after response start?** Reliably replacing committed headers/status and prior bytes with a clean new response.

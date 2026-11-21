# ASP.NET Core middleware pipeline order and branching — Reference: Framework defaults, routing, endpoint execution, and ordering constraints

## Scope and version

Middleware placement is part of the security and response contract. This reference covers the supplied built-in names and common ordering relationships. Sources: [current middleware ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0), [minimal-host behavior](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/middleware?view=aspnetcore-11.0), [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [rate limiting](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit?view=aspnetcore-11.0), [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-11.0), and the API documentation for each middleware.

## How this group fits the mental model

First ask whether a component needs raw request data, a selected endpoint, or an endpoint result. Routing assigns the endpoint and its metadata; endpoint execution later invokes it. Global error/proxy/security setup generally belongs early. Endpoint-aware policy belongs after routing but before endpoint execution. Any component that serves or terminates the request can prevent later components from running. In minimal hosting, inspect both explicit calls and conditional automatic insertion.

## Supplied names explained

### `WebApplication` automatic middleware

- **`WebApplication automatic middleware`** — Current minimal hosting conditionally supplies pieces such as the Developer Exception Page in Development, routing when endpoints exist, endpoint execution, and authentication/authorization when their services are detected and the calls were not explicitly made. It does not infer every app-specific order; CORS, forwarded headers, localization, antiforgery, and other placement requirements still need deliberate configuration.
- **`Developer exception page middleware` / `Developer exception page sensitive data`** — In Development, shows detailed diagnostics for unhandled exceptions. It can reveal exception data, request headers, and other sensitive context; do not expose it on public production traffic.
- **`Routing middleware` / `UseRouting`** — Matches the request to an endpoint and stores the selected `Endpoint` and route values in `HttpContext`. Middleware before it cannot rely on endpoint metadata; middleware after it can inspect metadata and apply endpoint-specific policy.
- **`Endpoint middleware` / `UseEndpoints`** — Executes the selected endpoint. In the conventional explicit pipeline, place endpoint-aware middleware between `UseRouting` and `UseEndpoints`. In `WebApplication`, endpoint execution is normally added at the end for mapped endpoints.
- **`WebApplication.Map endpoint execution`, `MapControllers endpoint execution`, `MapRazorPages endpoint execution`, `MapFallback endpoint execution`** — `MapGet`, `MapControllers`, `MapRazorPages`, and `MapFallback` register endpoints. They do not branch the `IApplicationBuilder` path; runtime routing selects a matching endpoint and endpoint execution invokes it. `MapFallback` is lower priority and should be constrained so it does not capture API paths.

When explicit placement is needed, an explicit `UseRouting` creates a clear before/after boundary. Authentication and authorization can be inserted by the minimal host when their services exist, but explicit calls are appropriate when placing CORS or another component between routing and auth. Verify the actual effective order with integration tests or middleware diagnostics.

## Error, transport, and host boundary

- **`Exception handler middleware` / `UseExceptionHandler`** — Converts downstream unhandled exceptions into a safe response or re-executes an error handler. Put it early enough to wrap application middleware. It cannot reliably replace a response after it starts.
- **`Exception handler near pipeline start`** — Means before most application middleware that may throw, not necessarily before trusted-proxy processing or every host-level component. Anything placed before the handler is outside its catch boundary.
- **`Status code pages middleware` / `UseStatusCodePages`** — Writes a body for selected empty 4xx/5xx responses. It does not catch exceptions and should be placed before components whose empty status responses it should decorate.
- **`HTTPS redirection middleware` / `UseHttpsRedirection`** — Redirects HTTP requests to HTTPS when the destination can be determined/configured. Behind a TLS-terminating proxy, process trusted forwarded scheme information first or the app may redirect repeatedly or infer the wrong scheme.
- **`HSTS middleware` / `UseHsts`** — Adds Strict-Transport-Security to HTTPS responses so browsers remember to use HTTPS. Enable for appropriate production domains after understanding includeSubDomains/preload consequences; do not use it as a substitute for TLS configuration.
- **`UseForwardedHeaders`** — Applies selected `X-Forwarded-*` or standardized forwarded data to the request only according to configured trust rules. Put it before middleware that reads scheme, host, or client IP; restrict trusted proxies/networks and hop count.
- **`Forwarded headers before HTTPS and remote IP consumers`** — Ordering rule: normalize trusted proxy data first, then make redirect, authentication, logging, link generation, or IP policy decisions from the normalized context.
- **`UseHostFiltering`** — Rejects requests whose Host header is not allowed by configured host filtering. It does not configure DNS, TLS certificate names, authentication, or proxy trust.
- **`Host header filtering`** — A host-validation boundary against unexpected host values. Configure the actual public names and test reverse-proxy forwarding; do not assume an arbitrary Host header is trustworthy.

## Files, defaults, and public access

- **`Static file middleware` / `UseStaticFiles`** — Serves matching files and usually short-circuits. It does not run endpoint authorization for each file. Treat files in the public web root as public.
- **`Static files bypass downstream authorization by default`** — If static-file middleware serves a match before endpoint authorization, that later middleware never sees the request. Reordering does not automatically make file serving authorization-aware.
- **`Static file authorization endpoint pattern`** — Keep private files outside the public web root and serve them through an endpoint that authenticates/authorizes the request before returning a file (for example, `Results.File` after an explicit policy check).
- **`Default files middleware` / `UseDefaultFiles`** — Rewrites a directory request to a configured default document path (for example, `index.html`) and then delegates. It does not serve the bytes itself; pair it with static-file serving, commonly by registering default-file middleware first.
- **`Directory browsing middleware` / `UseDirectoryBrowser`** — Generates listings of files when enabled. This can expose names and structure; disable unless explicitly needed and access-controlled.
- **`UseFileServer`** — Convenience composition of default-file and static-file middleware, with optional directory browsing. Its order and options determine whether a file is served and whether a directory can be listed.

## Identity and endpoint policy

- **`UseAuthentication`** — Uses configured schemes to establish `HttpContext.User`; it does not decide whether the user may access an endpoint. It normally runs after routing so endpoint-aware scheme metadata can be considered, and before authorization.
- **`UseAuthorization`** — Evaluates authorization policies and endpoint metadata; it depends on the authenticated principal when authentication is used. Run after routing and after authentication.
- **`Authentication before authorization`** — Authentication creates/updates the principal; authorization evaluates access for that principal. Swapping them can evaluate the wrong identity.
- **`Authentication scheme selection`** — The selected/default or endpoint-specific scheme determines how credentials are interpreted. `[Authorize(AuthenticationSchemes=...)]` or endpoint metadata can select schemes; middleware must run where the selected endpoint is known.
- **`Authorization policy execution` / `Authorization endpoint metadata`** — Routing metadata such as authorization requirements is consumed before endpoint invocation. A pipeline branch or static-file short circuit can bypass endpoint authorization unless independently protected.
- **`UseCors` / `CORS relative to endpoint routing`** — Applies browser cross-origin response/header and preflight behavior. With endpoint routing, place after routing and before authorization/endpoint execution as documented for the app; CORS is not authentication or server-side access control.
- **`CORS preflight handling`** — A preflight is an `OPTIONS` request describing a prospective cross-origin request. Correct CORS middleware can answer it before endpoint execution; custom auth/redirect behavior placed ahead of CORS can break browser preflight.
- **`CORS before response caching`** — CORS headers must be reflected correctly on cache hits. Configure cache variation/policy so responses for one origin are not reused for another; do not treat middleware order alone as sufficient cache isolation.

## Limits, representation, and request context

- **`UseRateLimiter`** — Applies global or named rate-limit policies. Endpoint-specific policies need routing to have selected endpoint metadata first; configure rejection responses and `Retry-After` behavior intentionally. ASP.NET Core 11 fixed-window limiters report accurate `RetryAfter` metadata for the next window boundary, which an `OnRejected` handler can forward as the response header.
- **`Endpoint-aware rate limiting after routing`** — Ensure `UseRouting` precedes rate limiting when the policy is attached to endpoint metadata. Global limits can be applied without endpoint selection, but a single ordering should be verified against the selected configuration.
- **`UseResponseCaching`** — Enables the framework response-caching middleware for eligible cacheable responses. Review authorization, cookies, cache-control, and variation keys; shared caches must not replay one user's representation to another.
- **`UseOutputCache`** — Enables ASP.NET Core output caching, with explicit policies and server-side storage. It is distinct from browser/proxy response caching; ensure endpoints with user-specific or sensitive content are not cached under an unsafe key.
- **`UseResponseCompression`** — Negotiates compressed response representations such as gzip, Brotli, and (in ASP.NET Core 11) Zstandard. ASP.NET Core 11 adds zstd support to response compression and request decompression and enables it by default. Preserve correct `Vary: Accept-Encoding` behavior: .NET 11 emits that header on all responses when compression is enabled, including responses not actually compressed.
- **`Response compression and caching order`** — Decide whether the cache stores compressed or uncompressed forms and make cache keys/variation match. Do not assume the same order is optimal for every cache layer or hosting topology.
- **`Response caching Vary behavior`** — Representation-changing request headers must be reflected in cache variation. ASP.NET Core 11's compression behavior adds `Vary: Accept-Encoding` broadly; test proxy/CDN behavior as well as in-app cache behavior.
- **`UseSession`** — Loads/commits session state through configured cache/cookie services. Place after routing when route data is needed, and before endpoints that access session. Session is cache-backed and is not a durable database or authorization store.
- **`UseRequestLocalization`** — Determines request culture from configured providers and sets culture/UI culture. Place before components whose parsing, formatting, or resource selection depends on culture. If route data is a culture provider, routing must run first.
- **`Request localization before culture-sensitive middleware`** — Choose based on provider inputs: run localization early enough for model binding/formatting, but after routing if the route supplies culture.
- **`UseAntiforgery`** — Validates antiforgery tokens for endpoints that require them; configure antiforgery services and place it after routing and authentication/authorization as required by the endpoint pipeline. It does not replace authorization.
- **`UseWebSockets`** — Enables WebSocket upgrade handling for downstream middleware/endpoints. Place it where the request has required path/proxy context and ensure authentication/authorization is performed before an upgrade is accepted.
- **`UseHttpLogging`** — Logs configured request/response fields and bodies. Place it where it can observe the desired request/response stages, but explicitly limit/redact headers, query values, and bodies to avoid credential/PII disclosure and excess cost.
- **`Use(next) middleware`** — Inline `Use` delegate with a continuation. It runs before downstream work and, when awaited, resumes afterward; not calling next terminates that path.
- **`Middleware order and reverse response order`** — Request-side work flows in registration order; awaited response-side work unwinds in reverse. A later short circuit means earlier middleware resumes, while skipped downstream components never run.

## Cross-item comparison

### Practical starting pipeline

For a typical web API, a defensible starting point is trusted forwarded headers; exception handling and transport/security setup; routing; request localization when compatible with its provider; CORS; authentication; authorization; endpoint-aware rate limiting; session/antiforgery and application middleware as required; then endpoint execution. Static files and response caching need explicit public/private and variation decisions. This is a decision aid, not a universal recipe: each app must validate its actual endpoint metadata, proxy setup, and cache behavior.

## Examples

Assume forwarded-header trust, CORS policy, authentication schemes, and a named rate-limit policy were configured before build. This explicit pipeline makes endpoint metadata and policy boundaries visible:

```csharp
app.UseForwardedHeaders(); // Only after configuring trusted proxy/network rules.
app.UseExceptionHandler(errors => errors.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await Results.Problem(statusCode: StatusCodes.Status500InternalServerError)
        .ExecuteAsync(context);
}));
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/reports", () => Results.Ok())
    .RequireAuthorization()
    .RequireRateLimiting("per-user");
```

The limiter runs after routing so it can read endpoint metadata, and after authentication because this policy partitions by user. A global/IP limiter may have different identity requirements. This is an example, not a universal order: test preflight, anonymous, authenticated, rejected, and proxy-forwarded requests for the actual app.

## Common mistakes

- Believing `WebApplication` automatically inserts CORS or every security middleware.
- Running endpoint-aware rate limiting or authorization before endpoint matching.
- Serving private files through `UseStaticFiles` and expecting later authorization to protect them.
- Enabling HSTS without understanding browser persistence, subdomains, and domain ownership.
- Trusting forwarded headers from arbitrary internet clients.
- Logging request bodies/headers without redaction and limits.
- Assuming compression, output caching, and response caching are interchangeable.

## Knowledge checks with answers

1. **When is endpoint metadata available?** After routing has selected the endpoint.
2. **What is the usual relationship between authentication and authorization?** Authenticate first to establish the principal, then authorize against that principal and endpoint metadata.
3. **Can `UseAuthorization` protect a file served earlier by static-file middleware?** No; the file response short-circuits before authorization.
4. **Where do forwarded headers belong?** Before consumers of scheme, host, or client IP, with a strict trusted-proxy configuration.
5. **What does ASP.NET Core 11 add for response compression and caching?** `Vary: Accept-Encoding` is added to all responses when response compression is enabled, including responses not actually compressed; still validate intermediary cache keys and behavior.

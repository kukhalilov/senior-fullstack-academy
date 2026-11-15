# ASP.NET Core middleware pipeline order and branching — Exercises and worked solutions

## Goals

Trace control flow, repair middleware order, select branch semantics, and reason about body, proxy, static-file, and response-start boundaries.

## Worked example

An endpoint limiter is registered before routing:

```csharp
app.UseRateLimiter();
app.UseRouting();
app.MapGet("/reports", () => "ok").RequireRateLimiting("reports");
```

The limiter cannot inspect the selected endpoint metadata yet. Make the dependency explicit:

```csharp
app.UseRouting();
app.UseRateLimiter();
app.MapGet("/reports", () => "ok").RequireRateLimiting("reports");
```

Verify the effective host pipeline with an integration test. [Middleware ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0)

## Exercises

1. **Short circuit:** A calls next; B returns 401 for anonymous users; C logs around next; endpoint returns 200. Write each log order and explain which stages are skipped.
2. **Private document:** Static files run before authorization and `/wwwroot/contracts/acme.pdf` is confidential. Explain the exposure and redesign delivery.
3. **Branches:** `/legacy` should run special behavior then common logging. A debug header should produce a terminal diagnostic response. Select helpers and explain path/rejoin behavior.
4. **Body bug:** Middleware reads the request body and JSON binding sees empty input. Explain and give a safe repair or remove the read.
5. **Scoped service:** Conventional middleware constructor takes a scoped audit DbContext. Explain the mismatch and give two sound designs.
6. **Reverse proxy:** HTTPS redirects loop behind TLS termination. Identify processing order and trust configuration.
7. **Streaming exception:** A file transfer fails after some bytes. Explain the limits of a JSON 500 recovery.

## Progressive hints

1. Draw every next call. A's continuation can run after B returns even if B did not call C.
2. A static file can short-circuit before endpoint authorization.
3. Prefix `Map` and predicate branches have distinct path/rejoin behavior.
4. The body is normally forward-only; buffering and position reset are required for a second read.
5. Conventional middleware is application-lifetime; use invocation injection or per-request activation.
6. Process forwarded values before scheme/IP consumers, but only from trusted proxies.
7. Committed response headers/body cannot be replaced by a second response.

## Complete solutions

1. Anonymous: A-before, B, A-after; C and endpoint do not run. Authenticated: A-before, B, C-before, endpoint, C-after, A-after. A resumes when B returns; B's short-circuit means no downstream C.
2. Static File Middleware can return a matching file before endpoint authorization. Move private content outside the public root and serve through an authorized endpoint or protected storage path. Test anonymous and authorized access.
3. Use `Map` for a path-prefix branch if `/legacy` should be removed from branch `Path` and added to `PathBase`; use `UseWhen` for extra behavior that rejoins common logging; use `MapWhen` for a terminal debug branch. Never grant privilege based on a client-controlled debug header.
4. Prefer not to log bodies. If essential, enable buffering before reading, cap size, honor cancellation, rewind to position zero, redact secrets, and handle overflow. Leave the stream open for downstream binding.
5. Use `IMiddleware` with DI activation per request, or keep conventional middleware and request the scoped dependency as an `InvokeAsync` parameter. A queue plus scoped worker is another separation. Do not capture the DbContext in a long-lived constructor.
6. Configure known proxy IPs/networks and a suitable hop limit, then run forwarded-header processing before HTTPS redirection and IP/scheme consumers. Trusting all clients permits spoofed forwarded values.
7. Log the error and terminate/abort appropriately. The status and partial body are already on the wire; a clean replacement response is not possible.

## Tests and edge cases

Integration-test both branch match/fall-through; anonymous and authorized document requests; endpoint-specific limiter metadata; reverse response order; forwarded values from trusted and untrusted peers; body sizes below/above the limit; and failures before/after `Response.HasStarted`. Assert status, headers, endpoint execution, and logs rather than relying on assumed automatic middleware insertion.

## Reflection questions

- Which components need endpoint metadata, and where is routing relative to them?
- Which files in the web root are safe to publish anonymously?
- What are your body-buffer limit and sensitive-data policy?
- Which proxy hops are trusted, and how is that trust configured?
- What recovery remains once a response begins streaming?

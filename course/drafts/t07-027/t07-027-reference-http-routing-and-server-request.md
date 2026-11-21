# End-to-end browser navigation and web request lifecycle — Reference: HTTP exchange through proxies and ASP.NET Core

## Scope and version

This reference traces a request through common infrastructure and ASP.NET Core. Provider-specific routing and framework details are covered by their dedicated lessons.

## How this group fits the mental model

After the browser sends HTTP, several layers may answer or forward it. Each layer has a trust boundary, timeout, and observable status. The endpoint is only one portion of the full path.

## Supplied names explained

- `HTTP method target headers and body` — A request carries a method, target, fields, and sometimes content. Method semantics and body behavior matter when proxies retry or redirect a request.
- `CDN edge and cache key` — A content delivery network can answer near the user or forward to an origin. Its cache key determines which requests may share a response; omitted tenant, language, or authorization dimensions can expose incorrect data.
- `Reverse proxy and load balancer` — An intermediary accepts a client connection and forwards/routs to one or more backends. It may terminate TLS and change connection boundaries; it does not replace application authorization.
- `Forwarded headers trust boundary` — Headers can describe original scheme, host, or client address when added by trusted proxies. Accept them only from configured proxies/networks; direct client-provided values are untrusted.
- `Kestrel connection and request parsing` — Kestrel is ASP.NET Core’s cross-platform web server. It accepts connections and parses HTTP before handing requests into the application pipeline.
- `ASP.NET Core middleware order` — Middleware runs in registration order on the request path and unwinds in reverse around the response. It can inspect, modify, continue, or short-circuit; order affects routing, authentication, authorization, and error handling.
- `Authentication versus authorization` — Authentication establishes a user/principal identity; authorization decides whether that identity may perform an action or access a resource. A valid identity does not imply permission.
- `Endpoint routing and model binding` — Routing matches the request to an endpoint; binding obtains handler values from route, query, headers, body, or services according to endpoint/framework rules. Validation and error responses are separate concerns.
- `EF Core query and database round trip` — A handler may translate a query and send it to a database. Query shape, network latency, locks, and result size can dominate request time; inspect generated SQL and database telemetry.
- `Response status headers and body` — The server returns a status and metadata plus optional body. Caching, content type, cookies, and error contracts are communicated through status and headers.
- `Compression and content negotiation` — The server can choose a representation based on request capabilities and compress eligible content. Compression trades CPU for transfer size; confirm intermediaries and browser behavior.
- `Streaming response and backpressure` — A response can be produced incrementally. Backpressure and cancellation should prevent producers from creating unbounded buffers when consumers are slower.
- `Request cancellation propagation` — Cancellation may occur when a client disconnects or a request times out. Propagate cancellation to supported downstream work, while recognizing that cancellation cannot undo a completed side effect.

## Cross-item comparison

CDN and reverse proxy are intermediary roles; Kestrel accepts the application-side connection; middleware and endpoint code execute application policy. Authentication establishes identity while authorization checks permission. The database call is a dependency that requires its own telemetry and cancellation behavior.

## Examples

Trace a request ID through CDN, proxy, Kestrel, middleware, endpoint, and database spans. If the CDN returns a cached response, application logs may contain no matching request. If the endpoint returns slowly, separate middleware, database, and downstream service durations before changing code.

## Common mistakes

- Trusting forwarded headers from arbitrary clients.
- Treating an authenticated request as authorized.
- Assuming all browser requests reach Kestrel; CDN/proxy caches can answer first.
- Retrying a non-idempotent request at a proxy without duplicate-effect protection.
- Assuming request cancellation reverses a committed database or external side effect.

## Knowledge checks with answers

1. Where should trusted forwarded headers come from? A configured trusted proxy chain.
2. What is the difference between authentication and authorization? Identity establishment versus permission decision.
3. If a CDN cache answers, must the application log a request? No.

### Sources

- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-11.0)
- [Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-11.0)
- [Proxy and load balancer guidance](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-11.0)
- [EF Core efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying)

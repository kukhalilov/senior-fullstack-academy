# End-to-end browser navigation and web request lifecycle — Core concepts and how they fit together

## Learning objectives

- Trace a browser navigation while allowing for cache hits and reused connections.
- Distinguish DNS, TCP, QUIC, TLS, HTTP, CORS, cookies, and server authorization.
- Follow a request through CDN/proxy, ASP.NET Core middleware, endpoint, and data dependency.
- Explain the difference between HTTP cache and service-worker CacheStorage.
- Relate HTML delivery, critical rendering, React hydration, and interaction readiness.
- Use browser and server evidence to locate a bottleneck.

## Prerequisites

Know basic HTTP requests and responses, DNS names, TLS certificates, browser origins, ASP.NET Core middleware, React rendering, and caching. A reverse proxy forwards requests on behalf of clients. A preflight is a browser-generated OPTIONS request used before certain cross-origin requests.

## Core concepts

### The path is conditional

A browser may interpret typed text as a search, upgrade a URL using HSTS, use a service worker, return a cached response, reuse DNS results, or reuse an established connection. Therefore “type URL, then DNS, TCP, TLS” is a teaching simplification, not a guarantee for every navigation. Use a waterfall to see what this particular navigation did.

If a network connection is needed, DNS resolution maps a name to address records; address selection may race IPv4 and IPv6. TCP commonly establishes a stream before TLS for HTTP/1.1 or HTTP/2 over HTTPS. QUIC combines transport and TLS-related setup for HTTP/3 over UDP. ALPN negotiates an application protocol. Certificates authenticate the service identity according to trust and hostname rules. Exact setup depends on reuse, protocol, network, and browser implementation.

### HTTP flows through infrastructure and code

HTTP carries method, target, headers, and optional body. A CDN can answer from cache or forward to an origin. A load balancer or reverse proxy selects a backend and may terminate TLS. If the app needs the original scheme/client address, it may consume forwarded headers only from known proxies; headers supplied directly by an untrusted client are not proof of origin properties.

In ASP.NET Core, middleware executes in configured order and can continue, change the request, or short-circuit. Routing selects an endpoint; authentication constructs an identity/principal; authorization evaluates access policy. An endpoint may call EF Core and a database. Each dependency adds latency and failure modes. Response status, headers, body, compression, and streaming shape what the browser receives.

### Browser policy is not server authorization

Same-origin policy limits script access across origins. CORS is a server-described browser response-sharing policy. For a request requiring preflight, the browser sends OPTIONS first; if that check fails, it may not send the actual request. Some cross-origin requests can be sent without preflight while the response remains unreadable to script. A console CORS message alone cannot answer whether a request reached the server; inspect the Network panel and server logs.

Cookies follow domain, path, expiry, `Secure`, `HttpOnly`, and `SameSite` rules. They are not the same as CORS. Credentialed cross-origin access requires explicit compatible server headers; wildcard origin is not valid for credentialed sharing. Server authentication and authorization still decide whether the request may access a resource. CSRF is a separate threat involving ambient credentials and state-changing requests.

### Freshness has multiple owners

The HTTP cache applies HTTP freshness and validation semantics such as `Cache-Control`, `ETag`, conditional requests, and `304 Not Modified`. Shared caches and private browser caches have different rules. A CDN adds another cache boundary. CacheStorage is application-managed Request/Response storage and does not automatically follow HTTP cache directives. A service worker can decide to answer from it, but the app owns cache keys, expiry, user isolation, and cleanup.

### Response delivery is only the beginning

The HTML parser discovers resources; the browser builds DOM and CSSOM structures and uses them for layout and paint. Render-blocking CSS and parser-blocking scripts can delay visible output. JavaScript download, parsing, and execution can delay interaction. Critical rendering path work is the dependency chain needed for initial display. React hydration attaches behavior to compatible server HTML; a mismatch can cause warnings or client correction. Server response time, LCP, and INP measure different stages, so optimize the metric and trace that match the user complaint.

## Mechanisms and relationships

For an investigation, collect a browser waterfall and server trace using a shared correlation ID where available. Check redirects, protocol, cache source, DNS/connect/TLS, request queueing, response time, transfer size, and long main-thread tasks. Compare cold and warm visits. A resource timing entry can expose some timings but cross-origin detail may require `Timing-Allow-Origin` and browser policy permits only defined fields.

## Worked examples

### Fast API, slow page

The API returns in 120 ms, but LCP is 3.8 seconds. Inspect render-blocking CSS, JavaScript size/execution, image discovery/priority, and layout shifts before optimizing the API. Server latency is one component, not a substitute for page readiness.

### CORS failure

The browser sends OPTIONS and receives 401; no POST is visible. Inspect whether middleware or proxy authentication rejects preflight before the CORS policy runs. Then verify the allowed origin, method, headers, credential policy, and actual endpoint authorization separately.

## Misconceptions and edge cases

- Not every navigation performs a DNS lookup or a new transport/TLS handshake.
- A browser CORS error does not equal “the server never received a request.”
- CORS is not authentication, authorization, or a general CSRF defense.
- HTTP/2 commonly uses TCP; HTTP/3 uses QUIC. They are not interchangeable transport labels.
- Cache-Control does not define the behavior of CacheStorage entries.
- A fast response does not prove the page is painted or interactive.
- `AbortController` can stop client-side waiting or transport work where supported, but it cannot roll back server work already performed.
- Forwarded headers are a trust boundary; configure trusted proxies before using them for scheme, IP, or host decisions.

## Knowledge checks with answers

1. Why should a browser waterfall be read before claiming a new connection was made? It reveals cache use and connection reuse.
2. What does CORS decide? Whether browser script may access a cross-origin response under server-supplied policy; server authorization remains separate.
3. Why can an API be fast while LCP is poor? Rendering dependencies, large resources, or main-thread work can dominate.
4. Which cache uses HTTP freshness directives: CacheStorage or HTTP cache? The HTTP cache; CacheStorage is application-managed.
5. What should be trusted about a forwarded client IP header? Only values received from a configured trusted proxy chain.

### Sources

- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [HTTP caching](https://www.rfc-editor.org/rfc/rfc9111.html)
- [Critical rendering path](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Critical_rendering_path)
- [Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming)
- [ASP.NET Core proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-11.0)

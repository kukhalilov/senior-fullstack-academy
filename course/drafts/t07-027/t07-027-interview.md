# End-to-end browser navigation and web request lifecycle — Interview questions and reasoning

## Core questions

1. What happens from entering a URL to seeing a usable React page?
2. Does every browser request perform DNS, TCP, and TLS setup?
3. How do HTTP/2 and HTTP/3 differ at the transport layer?
4. What is the difference between CORS and authorization?
5. How would you trace a slow page when the API is fast?
6. How can a CDN, reverse proxy, and ASP.NET Core middleware each affect the response?
7. How do HTTP caching and service-worker CacheStorage differ?

## Concise interview answers

1. Browser intent and policy, cache/worker/connection reuse, name and transport setup if needed, HTTP through intermediaries and application, response handling, resource parsing, rendering, then hydration or client interaction.
2. No. DNS may be cached, a connection may be reused, or a cache/service worker may answer without network access.
3. HTTP/2 commonly runs over TCP; HTTP/3 runs over QUIC over UDP.
4. CORS controls whether browser script may read a cross-origin response. Authorization is a server decision about access to a resource.
5. Compare browser waterfalls, LCP resource dependencies, long tasks, and correlated server spans; optimize the measured bottleneck.
6. The CDN can answer/cache, proxy routes or terminates TLS, and middleware can transform or short-circuit the application request.
7. HTTP cache follows protocol freshness rules; CacheStorage is explicitly managed by app/service-worker code.

## Deep follow-up answers

A navigation path is conditional. Browser chrome may search or parse a URL; HSTS can upgrade it; a service worker or HTTP cache may answer; DNS and connection state may be reused. When networking occurs, address selection, TCP or QUIC, TLS, and protocol negotiation are distinct. HTTP then passes through CDN/proxy/load balancer and app middleware. Trust forwarded headers only from configured proxies. Authentication creates identity; authorization checks permission. Database work and downstream calls should have their own spans and timeout budgets.

CORS is a browser response-sharing policy. Preflight can prevent the actual request from being sent, while other cross-origin requests may be sent and only their response hidden from script. Inspect Network and server logs. Cookie credential behavior and CSRF protections are separate. A fast API response does not establish a fast page: parsing, CSS, script execution, LCP, hydration, and interaction responsiveness occur on different timelines.

## Scenario questions

1. The browser shows a CORS error; how do you determine whether the API received the request?
2. A warm page has no DNS/connect/TLS time; does this indicate a broken measurement?
3. The response arrives quickly but LCP is poor; what do you inspect next?
4. A new CDN cache rule serves one tenant’s data to another; which cache-key and authorization boundaries were missed?
5. A client disconnects after the database committed; what does cancellation mean for the side effect?

## Tradeoffs and alternatives

Use HTTP cache semantics for resources with clear server-defined freshness. Use CacheStorage when application-managed offline behavior is required. Favor server rendering or static output when it improves the product’s early content path and is compatible with its runtime; use client rendering where it fits the application. Choose HTTP/2 or HTTP/3 based on negotiated support and measured deployment behavior, not assumptions. Keep online-only flows when offline consistency and recovery are too costly for the data domain.

## Common weak answers

- Reciting “DNS, TCP, TLS, HTTP” as if every request starts from zero.
- Saying CORS protects the API from non-browser clients.
- Treating a console error as proof of what reached the server.
- Equating server latency with LCP or INP.
- Trusting `X-Forwarded-For` from any sender.
- Assuming CDN purge removes browser and service-worker caches.

## Self-check rubric

Score 0–2 in each area: (0) missing or conflated, (1) identifies components, (2) explains relationships, conditional paths, failure evidence, and ownership. Strong answers distinguish browser policy from server security, server duration from user-visible readiness, and cache freshness from storage durability.

### Sources

- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [RFC 9111: HTTP Caching](https://www.rfc-editor.org/rfc/rfc9111.html)
- [MDN: How browsers work](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work)
- [ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/?view=aspnetcore-11.0)

# Kestrel reverse proxies TLS networking and load balancing — Interview questions and reasoning

Sources: [Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-10.0), [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations), [ASP.NET Core proxy and load-balancer guidance](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0), [YARP configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [YARP health checks](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/dests-health-checks?view=aspnetcore-10.0), [YARP timeouts](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/timeouts), [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0), and [YARP release record](https://github.com/dotnet/yarp/releases).

## Core questions

**Version scope:** ASP.NET Core 11 is the current runtime target. YARP is independently versioned; this audit checked the official release list, where 2.3.0 is the latest stable version.

1. What role does Kestrel play in an ASP.NET Core deployment?
2. When would you run Kestrel at the edge versus behind a reverse proxy?
3. Trace TLS termination, forwarding, and scheme restoration through a proxy chain.
4. What problem do forwarded headers solve, and why are they security-sensitive?
5. How do `KnownProxies`, `KnownIPNetworks`, and `ForwardLimit` work together?
6. Why must forwarded-header middleware run before HTTPS redirection and host-dependent middleware?
7. Explain HTTP/1.1, HTTP/2, ALPN, HTTP/3, and QUIC at the endpoint boundary.
8. What are SNI and mTLS? How are certificate selection and validation different?
9. How does Kestrel choose listeners from `Listen`, `UseUrls`, and configuration?
10. What is a Kestrel request-body limit and how does a proxy affect it?
11. Describe YARP’s route, cluster, destination, and transform model.
12. How do YARP active and passive health checks differ?
13. Compare `PowerOfTwoChoices`, `RoundRobin`, `LeastRequests`, and affinity.
14. What is the distinction between YARP route `Timeout` and cluster `ActivityTimeout`?
15. Does YARP provide built-in automatic retries and a cluster circuit-breaker policy?
16. What changed in .NET 11 Kestrel TLS diagnostics and HTTP/3 request processing?
17. How do you observe a 502 across Kestrel, YARP, and destination services?
18. What is the relationship between load balancing, reverse proxying, and API gateway functions?
19. What .NET 11 Kestrel protocol-compliance changes can reveal an old gateway/client defect?

## Concise interview answers

1. Kestrel is ASP.NET Core’s cross-platform HTTP server and default server outside IIS; it can be exposed directly or placed behind an edge proxy.
2. Edge Kestrel is appropriate when the app/platform can own TLS, host validation, rate/resource limits, and perimeter operations. A reverse proxy helps centralize TLS, routing, WAF, and backend selection but adds a hop and trust/configuration boundary.
3. With edge termination, the edge validates the public certificate session and opens a new backend connection. The app receives trusted forwarded scheme/host/client metadata only from that configured proxy; middleware restores it before redirect/auth/URL decisions.
4. Backend TCP peer is the proxy, so headers carry earlier client context. They are ordinary forgeable HTTP headers and can affect IP authorization, redirects, secure cookies, audit records, host routing, and rate limiting.
5. `KnownProxies`/`KnownIPNetworks` identify which immediate peers may assert headers; `ForwardLimit` bounds how many trusted hops are consumed. Proxy sanitization and restricted network access complete the boundary.
6. Otherwise redirect/HSTS/URL/auth logic sees the backend scheme or host and can loop, generate incorrect URLs, or make unsafe decisions before context is restored.
7. HTTP/1.1 and HTTP/2 normally use TCP; HTTPS ALPN selects HTTP/2 or HTTP/1.1. HTTP/3 uses QUIC/UDP with TLS 1.3 and MsQuic/platform requirements.
8. SNI provides the server name during ClientHello so a server selects a certificate. mTLS asks the client for a certificate and validates it; server certificate selection does not authenticate the client.
9. Configure endpoints explicitly with `Listen`/named configuration when protocol/TLS settings matter. URL settings are simpler and can be overridden by host integration; verify effective listeners in logs/deployed hosting.
10. Kestrel can cap body size, but IIS, CDN, gateway, and YARP can reject earlier. Find the first layer issuing 413 and align bounded limits end to end.
11. Route matches a request and points to a cluster; cluster groups policy and destinations; destination is a backend address; transforms modify the proxied request/response.
12. Active checks send probes periodically; passive checks infer health from real proxied results. Both update eligibility but neither proves all business behavior works.
13. `PowerOfTwoChoices` samples two destinations and chooses fewer assigned requests; `RoundRobin` cycles; `LeastRequests` scans for the least assigned; affinity pins clients but can skew load and reduce failover flexibility.
14. Route `Timeout` is a total deadline; cluster `ActivityTimeout` bounds idle time between request/response progress. Both can cancel a request and may apply simultaneously.
15. YARP has health, routing, and timeout facilities, but non-idempotent retries and circuit breaking require explicit resilience design/integration; do not assume automatic replay is safe.
16. .NET 11 adds `UseTlsClientHelloListener` and `ITlsHandshakeFeature.Exception`; the old ClientHello callback is obsolete. Kestrel HTTP/3 can process requests before waiting for initial control-stream SETTINGS.
17. Correlate trace ID, route/cluster/destination, health state, proxy status/timing, outbound error, and backend trace/logs. Check whether the request reached Kestrel and whether a destination was selected.
18. Load balancing selects instances; reverse proxying forwards application-layer requests; an API gateway often adds API policy such as auth, quota, transformation, and version routing. Products may combine roles.
19. Kestrel 11 rejects additional connection-specific headers on HTTP/2/3 and closes HTTP/1.1 after ambiguous `Content-Length` plus `Transfer-Encoding`. Audit old translating proxies for stripping/framing; compliant clients are unaffected.

## Deep follow-up answers

### How do you prove forwarded client context is trustworthy?

I draw the actual network path, identify each proxy’s source range, and determine whether each hop overwrites or appends each header. The backend is unreachable to untrusted clients. ASP.NET Core processes only needed header families, lists explicit known proxies/networks, sets a correct hop limit and symmetry policy, and runs middleware early. I test direct forged headers and forged values arriving through the edge. An environment convenience switch that clears trust restrictions is audited and avoided on public edges.

### How do you design certificate rotation without downtime?

First identify every TLS termination and outbound TLS validation point. Provision the new private key/certificate with matching SAN/EKU and complete chain to each terminator, ensure the process can read it, and validate trust/expiry. Deploy it alongside the old certificate, trigger supported reload/restart, open a new TLS handshake to confirm the selected chain, monitor handshake failures, then retire the old key after clients/instances converge. Existing TLS sessions do not renegotiate their identity merely because a file changed.

### How do you choose a health endpoint?

It should be cheap and safe to call frequently, return a clear success/failure contract, and reflect the dependencies required for that destination to serve the routed workload. A liveness check should not fail simply because a noncritical dependency is unavailable; a readiness probe should include critical dependencies. Avoid expensive writes, external side effects, and an endpoint that always returns 200 while the service cannot fulfill real requests.

### How do timeouts interact with retries and cancellation?

A route total timeout limits overall duration; activity timeout bounds silence while streaming. When the client disconnects or timeout fires, the proxy should cancel outbound work, but the backend may already have committed a database write. Retry only operations with idempotent semantics or a deduplication key/status-reconciliation protocol. Set budgets across client, edge, YARP, and backend so inner work has time to complete before outer deadlines.

### What is .NET 11 Kestrel’s ClientHello listener for?

`UseTlsClientHelloListener` is connection middleware that inspects raw ClientHello bytes before TLS handshake begins, allowing specialized inspection/routing decisions. It must be registered before `UseHttps`; it is unnecessary for ordinary SNI certificate selection, which uses `ServerCertificateSelector`. Its timeout adds to `HandshakeTimeout`, so the combined setup budget should be bounded. `ITlsHandshakeFeature.Exception` provides richer failure diagnostics to middleware wrapping the HTTPS component.

## Scenario questions

1. **HTTPS redirect loop behind a TLS-terminating proxy:** Which values and middleware order do you inspect?
2. **A client forges `X-Forwarded-For` and bypasses an IP restriction:** What trust and network controls are missing?
3. **HTTP/3 requests fail only through a corporate firewall:** What transport and fallback evidence do you gather?
4. **YARP sends requests to one backend despite three configured destinations:** Which route, health, policy, affinity, and availability settings do you inspect?
5. **A destination is probe-healthy but `/payments` returns errors:** How do you explain the difference and respond?
6. **A proxy times out after forwarding a payment POST:** What should the caller and service do before any retry?
7. **One backend certificate is expired:** How do you repair trust without weakening certificate validation globally?
8. **A 100 MB upload gets 413 at 20 MB:** How do you find and correct the first rejecting layer?
9. **The team wants to use `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`: What risk does it create and how do you configure a narrower trust boundary?
10. **A .NET 11 service logs only generic TLS `IOException`s:** Which connection middleware/API can provide the handshake failure exception?

## Tradeoffs and alternatives

- **Direct Kestrel vs edge proxy:** fewer components and direct TLS ownership versus centralized controls, routing, and additional trust/availability dependencies.
- **Edge TLS termination vs pass-through:** centralized decryption/policy versus preserving end-to-end TLS and client certificate visibility at Kestrel.
- **HTTP/3 vs TCP-based HTTP versions:** QUIC stream/connection benefits versus UDP/platform/proxy compatibility; retain fallback.
- **Active vs passive health:** proactive detection versus real traffic evidence; combine carefully and select a workload-relevant readiness policy.
- **Round robin vs least requests vs PowerOfTwoChoices:** simple even selection versus request-count awareness versus reduced scan cost and sampling.
- **Affinity vs stateless services:** continuity to one instance versus load/failover flexibility; shared state usually simplifies scale-out.
- **Probe/retry/circuit breaker:** detection, replay, and suppression are different tools; retries need idempotency, and breakers need explicit thresholds/recovery.
- **Declarative YARP routes vs direct forwarding:** standard route/cluster policy management versus full custom selection responsibility.

## Common weak answers

- “Forwarded headers are safe because only our load balancer sets them.”
- “Put `UseForwardedHeaders` anywhere before the endpoint.”
- “HTTPS at the edge means the backend link is encrypted.”
- “HTTP/3 uses TCP plus ALPN just like HTTP/2.”
- “A healthy process is a healthy destination.”
- “Round robin is fair for all workload sizes.”
- “YARP will retry a request if its destination fails.”
- “A request timeout means the backend did not commit the operation.”
- “Disable certificate validation until the new cert is fixed.”
- “Raise the Kestrel upload size” without checking the earlier layers.
- “Allow all forwarded proxies and filter by client IP afterward.”
- “Use the obsolete ClientHello callback in .NET 11.”

## Self-check rubric

Score answers 0–2: **0** names a setting without its effect; **1** explains the main mechanism; **2** also identifies the trust/availability boundary, relevant evidence, tradeoff, and a verification step. A strong proxy design names every TLS hop, trusted peer range, header sanitization, route/destination policy, health contract, timeout budget, cancellation behavior, and retry safety. A strong incident response traces the first failing layer before modifying configuration.

# Kestrel endpoints TLS reverse proxies and IIS integration — Interview questions and reasoning

## Core questions

These questions assess whether you can reason about which network hop and process owns a request. [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

## Concise interview answers

Use these direct responses first, then expand with the deployment assumptions and failure modes.

## Deep follow-up answers

### 1. What does Kestrel do?

Kestrel is ASP.NET Core's cross-platform HTTP server. It binds endpoints, negotiates supported HTTP protocols, optionally terminates TLS, and feeds requests into ASP.NET Core. It can face clients directly or sit behind another edge. An upstream proxy/IIS can add routing and policy, but creates another network and trust boundary.

### 2. What is the difference between URL binding and `Listen`?

URL binding through `UseUrls`, `ASPNETCORE_URLS`, `--urls`, or the `urls` host setting is convenient for simple addresses. Explicit Kestrel `Listen` endpoints allow per-listener protocol, TLS, and socket configuration. Explicit listeners take precedence for actual Kestrel binding; avoid assuming both systems combine arbitrarily.

### 3. Where should TLS terminate?

It depends on certificate custody, network segmentation, edge policy, and whether the proxy-to-app hop also requires encryption. At Kestrel, Kestrel owns the TLS endpoint/certificate. At a proxy, the proxy owns public TLS and the app must trust forwarded scheme information from the proxy. Encrypt the internal hop too when the network threat model requires it.

### 4. Why are forwarded headers security-sensitive?

They influence client IP, host, scheme, path base, redirects, authentication callbacks, rate-limit keys, and generated links. A direct attacker can forge them unless the app accepts them only from known proxy peers. Use exact `KnownProxies` or narrow current `KnownIPNetworks`, an intentional `ForwardLimit`, host restrictions, and early middleware ordering.

### 5. How did forwarded-header defaults change?

Starting in ASP.NET Core 8.0.17 and 9.0.6, headers from unknown proxies are ignored unless explicitly trusted. In ASP.NET Core 10, `KnownNetworks` is obsolete in favor of `KnownIPNetworks` with `System.Net.IPNetwork`. `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` enables cloud-oriented processing but does not configure a proxy allowlist.

### 6. How do request-size and connection limits interact?

Kestrel's body, connection, timeout, and data-rate limits protect server resources. The proxy, IIS, MVC, and application can impose separate limits. The first smaller applicable body cap rejects. The ordinary concurrent-connection limit excludes upgraded connections such as WebSockets, so configure the separate upgraded limit. These are not user quotas or application concurrency controls.

### 7. Does setting `HttpProtocols.Http3` guarantee HTTP/3?

No. HTTP/3 uses QUIC over UDP and depends on platform/runtime support, certificate/TLS configuration, and the complete network path. Offer HTTP/1.1 and HTTP/2 alongside it when clients may not support UDP/QUIC or an intermediary blocks it.

## Scenario questions

### 8. An OAuth callback uses `http://internal:5000` although users connect with HTTPS. What do you check?

Check whether TLS terminates at a proxy, whether it forwards the public scheme and host, whether the app trusts only that proxy, and whether forwarded-header middleware runs before authentication and link generation. Also verify the proxy's external host and `AllowedHosts` policy.

### 9. A .NET app on IIS returns 502.5 after publish. What does that suggest?

For out-of-process hosting, it commonly indicates ANCM failed to start the backend process or the process did not listen on the assigned port. Check the Hosting Bundle, generated `web.config` process path/arguments/environment, runtime/bitness, startup logs, and permissions. A 500.30 is the in-process startup failure counterpart.

### 10. An app starts but large uploads fail despite a high Kestrel limit. What is your method?

Trace the full path from edge to application and inspect proxy, IIS, Kestrel, endpoint/MVC, and application limits. Identify which layer responds first. Then align bounded limits and use streaming/object storage for large data rather than unbounded buffering.

## Tradeoffs and alternatives

Direct Kestrel removes a proxy hop but makes the app own public edge exposure and often public TLS. A reverse proxy centralizes routing/TLS and may provide WAF/load balancing, but needs correct forwarding and health/timeout configuration. IIS in-process removes the Kestrel hop and uses IIS integration directly; out-of-process separates the app process but adds a reverse-proxy hop. Select by operational requirements and test failure behavior rather than by assuming one is universally faster or safer.

## Common weak answers

- “IIS always uses Kestrel.” In-process hosting uses `IISHttpServer`.
- “The app is HTTPS because the browser URL is HTTPS.” The app may see internal HTTP unless trusted scheme forwarding is configured.
- “Forwarded headers are safe because the proxy added them.” The app must verify the immediate peer and chain.
- “The environment switch knows my proxy.” It does not establish an explicit proxy allowlist.
- “Kestrel permits 30 MB so the upload must work.” An earlier proxy/IIS cap may reject it.
- “The ordinary connection limit includes WebSockets.” Upgraded connections use a separate limit.
- “HTTP/3 setting means clients use it.” UDP, QUIC, platform, and intermediary support determine availability.
- “Changing Kestrel port fixes an IIS in-process deployment.” In-process uses IISHttpServer, not Kestrel.

## Self-check rubric

Score each topic 0–2: **0** gives an incorrect universal claim; **1** names the right feature but omits its boundary; **2** identifies the owning layer/process, trust or protocol constraint, and what evidence to inspect. A strong answer scores 2 on forwarded-header trust, TLS termination, request-limit composition, HTTP/3 availability, and IIS hosting model.

## Sources

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) · [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options) · [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) · [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) · [KnownIPNetworks change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/ipnetwork-knownnetworks-obsolete)

# Kestrel endpoints TLS reverse proxies and IIS integration — Exercises and worked solutions

## Goals

Practice tracing requests through Kestrel, proxies, and IIS; diagnose scheme/host reconstruction failures; and configure limits at the correct layer. [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

## Worked example

A Linux app sits behind a TLS-terminating load balancer. The app keeps redirecting `/login` to HTTPS, but users see a redirect loop. The load balancer forwards HTTP to Kestrel and includes `X-Forwarded-Proto: https`; ASP.NET Core has not enabled trusted forwarded-header processing. Configure the actual proxy peer/network in `KnownProxies`/`KnownIPNetworks`, enable `XForwardedProto`, and run `UseForwardedHeaders` before `UseHttpsRedirection`. Confirm Kestrel is not publicly reachable by arbitrary clients and test that forged forwarding headers from an untrusted peer are ignored.

## Exercises

### Exercise 1: distinguish the hosting models

IIS serves an ASP.NET Core app. A developer changes `KestrelServerOptions.ListenAnyIP` to fix the port. The deployment uses `AspNetCoreHostingModel InProcess`. Why might no behavior change?

### Exercise 2: trace a redirect loop

Nginx terminates public TLS and sends HTTP to Kestrel. `UseHttpsRedirection` loops indefinitely. Give the likely missing configuration and the middleware order.

### Exercise 3: harden forwarded headers

An app sets `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, clears `KnownProxies` and `KnownIPNetworks`, and is reachable directly from the Internet. Identify the trust failure and a safe correction.

### Exercise 4: reconcile request-body limits

Kestrel allows a 30 MB body, MVC action limit is 25 MB, and the reverse proxy allows 8 MB. Users need to upload files up to 20 MB. Which layer rejects first, and what must change?

### Exercise 5: account for WebSockets

An operator caps `MaxConcurrentConnections` at 200 and assumes this means at most 200 live WebSockets. Explain the error and name the relevant Kestrel control.

### Exercise 6: validate an HTTP/3 rollout

`HttpProtocols.Http3` is configured on an HTTPS endpoint, but some clients still use HTTP/2. Is this evidence that Kestrel ignored configuration? What should operations verify?

### Exercise 7: diagnose IIS startup failure

An in-process deployment returns 500.30 after publish. An out-of-process deployment returns 502.5. Explain what each points to and how stdout logs should be used safely.

### Exercise 8: set a per-request limit

Middleware reads the first bytes of an upload, then tries to set `IHttpMaxRequestBodySizeFeature.MaxRequestBodySize`. Why can this fail, and what should the design do?

## Progressive hints

For each scenario, identify the component that receives the request first. Then trace which process or middleware owns the setting. Treat forwarded headers as untrusted until you identify the peer. For body size, the earliest rejecting layer wins. For IIS, name the actual server implementation before changing a listener.

## Complete solutions

1. **In-process hosting:** It uses `IISHttpServer` inside `w3wp`, not Kestrel. Change IIS/in-process configuration and limits; Kestrel listener changes do not control the listener.
2. **Redirect loop:** Kestrel sees the internal HTTP hop because it has not reconstructed the public scheme. Configure a trusted proxy, enable `XForwardedProto`, and call `UseForwardedHeaders` before `UseHttpsRedirection` (and HSTS/auth/link generation as needed).
3. **Forwarding trust:** Any direct caller can forge the host, scheme, or client address. Keep forwarded processing enabled only with a verified trusted proxy boundary; allowlist exact proxy IPs or a narrowly controlled `KnownIPNetworks` CIDR, set `ForwardLimit`, and block public direct access to the app port. The environment switch is not a proxy allowlist.
4. **Body limits:** The proxy's 8 MB cap rejects first, before Kestrel/MVC. Raise it to at least the intended 20 MB plus any required encoding overhead, then make Kestrel/MVC/app limits consistent and validate streaming/memory/storage behavior. Keep limits bounded.
5. **Upgraded connections:** `MaxConcurrentConnections` does not include upgraded connections. Configure `MaxConcurrentUpgradedConnections` for WebSockets and separately bound application work/fan-out.
6. **HTTP/3:** Not necessarily. HTTP/3 uses QUIC/UDP and depends on OS/runtime support and network/firewall/proxy paths. Verify UDP exposure, supported platform, TLS requirements, and that HTTP/1.1/HTTP/2 remain available for fallback.
7. **IIS diagnostics:** 500.30 indicates an in-process startup failure. 502.5 commonly means an out-of-process child failed to launch or listen on ANCM's assigned port. Temporarily enable ANCM stdout logging to a restricted non-public path, inspect it, then disable logging and protect/remove the files. Check Hosting Bundle, bitness, environment, process path, and startup dependencies.
8. **Read-only feature:** Once body consumption starts, Kestrel may mark the feature read-only, so its maximum cannot be changed. Select the limit before any middleware reads the body, or set endpoint/MVC metadata before execution; use streaming for large content.

## Tests and edge cases

Test direct requests with forged `X-Forwarded-Proto` and `X-Forwarded-Host`, requests from an untrusted peer, multiple proxies with `ForwardLimit`, IPv4-mapped IPv6 proxy addresses, and TLS-offloaded redirects. Test each HTTP version through the real firewall/proxy path, including UDP blocked for HTTP/3. Exercise body sizes just below and above every layer's limit, slow headers/bodies, WebSocket counts, app-pool recycle, cold starts, and graceful shutdown with open connections.

## Reflection questions

1. Which component owns each public and private TLS key?
2. Can untrusted traffic reach the Kestrel listener directly?
3. Which limit rejects an oversized request first in your deployment?
4. What evidence distinguishes a server binding issue from a proxy routing or ANCM startup issue?

## Sources

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) · [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) · [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) · [HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3)

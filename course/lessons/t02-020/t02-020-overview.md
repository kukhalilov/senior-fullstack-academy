# Kestrel endpoints TLS reverse proxies and IIS integration — Big-picture orientation and mental model

## Problem and purpose

An ASP.NET Core application needs a process that accepts network requests, establishes the request's transport security, and passes requests into the middleware pipeline. Kestrel is the cross-platform HTTP server used directly in most deployments and behind IIS in the out-of-process IIS model. A reverse proxy or IIS can sit in front to terminate public TLS, route traffic, enforce edge policy, or manage process hosting. Correct deployment depends on knowing which component owns each connection and which component supplied each piece of request metadata. ASP.NET Core 11 includes Kestrel updates for earlier HTTP/3 request processing and more diagnostic detail for failed TLS handshakes. [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Plain-language mental model

Think of the request as passing through a chain of boundaries. A browser connects to an edge proxy or directly to Kestrel. The edge may decrypt TLS and forward an HTTP request to the app. Kestrel binds sockets and serves HTTP when it is the selected server. ASP.NET Core middleware then sees a request. If a proxy terminated TLS, the request arriving at Kestrel may look like plain HTTP and have an internal host/address unless trusted forwarded headers reconstruct the original scheme, host, path base, and client address.

IIS has two hosting shapes. **In-process** runs ASP.NET Core inside the IIS worker process using `IISHttpServer`; it does not use Kestrel. **Out-of-process** runs the app in a separate process with Kestrel, while ANCM forwards IIS traffic to it. On Linux, Nginx/Apache/YARP-like proxies commonly forward to Kestrel, but IIS Integration's automatic forwarded-header setup does not apply. The same word “server” can refer to the public edge, the local HTTP listener, or the app process; identify which one before setting limits or debugging.

## How the parts fit together

| Boundary | Owns | Typical configuration responsibility |
|---|---|---|
| Client to public edge | Public DNS, edge TLS, public connection | Certificate, TLS policy, firewall, public hostname |
| Reverse proxy/load balancer | Routing and possibly TLS termination | Upgrades, timeouts, affinity, forwarded headers, host allowlist |
| Kestrel | App-side socket and HTTP protocol when selected | Listen endpoints, certificates, supported HTTP versions, server limits |
| IIS / ANCM | IIS process hosting and forwarding | In-process/out-of-process model, process launch, startup diagnostics |
| ASP.NET Core pipeline | Middleware and endpoint behavior | Forwarded-header trust, redirects, auth, application request limits |

These are separate controls. A Kestrel connection cap does not limit all work in a database or queue. A reverse-proxy body cap can reject a request before Kestrel sees it. An IIS limit and Kestrel limit may both apply in an out-of-process setup. TLS can terminate at the edge or at Kestrel; that choice changes where private keys live and which hop is encrypted.

## Concept map

```text
Public client
   │ HTTPS / HTTP/3 / WebSocket, as supported by edge
   ▼
Reverse proxy or IIS edge ── TLS termination, routing, forwarded metadata
   │ trusted private hop
   ├── direct to Kestrel (common Linux/container/Windows-service shape)
   ├── IIS → ANCM → Kestrel → app (IIS out-of-process)
   └── IIS → ANCM → IISHttpServer → app (IIS in-process)
                         │
                         ▼
              Forwarded headers middleware
                         │
                         ▼
              HTTPS redirects, auth, links, endpoints
```

Forwarded headers are claims made by a proxy, not authenticated facts by themselves. Trust only known proxy IPs or carefully scoped networks, set the number of hops intentionally, and run the middleware before HTTPS redirection, HSTS, authentication, and URL generation that depend on the original request. A permissive setting can enable spoofed client IPs, hosts, or schemes.

## End-to-end walkthrough

Suppose `https://app.example.com/orders/7` reaches a Linux load balancer, which terminates TLS and sends HTTP to Kestrel on a private network. The proxy sends `X-Forwarded-Proto: https`, `X-Forwarded-Host: app.example.com`, and a client address. Configure the app to process only the headers it needs and trust the load balancer's actual address or CIDR. Put `UseForwardedHeaders` early in the pipeline. Later middleware then sees the public HTTPS scheme and correct host, preventing redirect loops and incorrect OAuth callback URLs. The network must prevent arbitrary clients from reaching Kestrel and forging these headers.

For IIS, decide hosting model deliberately. In-process uses `IISHttpServer` and IIS's worker process; out-of-process uses ANCM as a reverse proxy to Kestrel. Install the matching Hosting Bundle, publish the generated `web.config`, and use stdout logging temporarily for startup diagnosis with restricted file permissions. Remove or disable stdout logs after diagnosis because they may contain sensitive startup data.

## When to use it and tradeoffs

Use Kestrel directly when its endpoint features and your edge/network design satisfy the deployment needs. Put a reverse proxy or managed edge in front when you need centralized public TLS, load balancing, WAF policy, or multi-app routing. Use IIS hosting when Windows/IIS operations, modules, or integration are required; choose in-process versus out-of-process based on operational isolation and server requirements. HTTP/3 requires QUIC/UDP reachability and platform support, so expose it alongside HTTP/1.1 and HTTP/2 when clients or network paths may not support it. Avoid assuming one deployment pattern is universal.

## What later lessons cover

The reference lessons enumerate Kestrel listener, TLS, HTTP protocol, request and connection limit APIs; forwarded-header fields and trusted-proxy controls; IIS ANCM hosting settings; and ASP.NET Core 11 HTTP/3/TLS changes. Practice applies these boundaries to common incidents. Broader IIS operations and reverse-proxy product configuration are intentionally handled in the infrastructure track.

## Sources

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) · [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options) · [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) · [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) · [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

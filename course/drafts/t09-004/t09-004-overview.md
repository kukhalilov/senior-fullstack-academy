# Kestrel reverse proxies TLS networking and load balancing — Big-picture orientation and mental model

Sources: [Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-10.0), [proxy and load-balancer configuration](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0), [YARP getting started](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/getting-started), [YARP configuration files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy), and [YARP release record](https://github.com/dotnet/yarp/releases).

## Problem and purpose

Kestrel is ASP.NET Core’s cross-platform HTTP server. It can face clients directly or run behind IIS, a load balancer, CDN, ingress, or another reverse proxy. That topology determines which component owns public TLS, host validation, client identity, request limits, and connection management. A proxy adds routing and resilience, but also creates a trust boundary: an application must not accept claims about the original client from arbitrary peers.

This module explains Kestrel listeners and HTTP protocols, TLS and certificates, forwarded request context, YARP route/cluster/destination configuration, and health/load-balancing behavior. It targets .NET 11 GA (released November 10, 2026). YARP is versioned independently: the latest stable release listed on its official roadmap is 2.3.0, which supports .NET 8 or later. Microsoft Learn’s versioned Kestrel pages may still use the 10.0 selector even though its current HTTP/3 article documents a .NET 11 behavior; where no 11.0 selector was verified, the lesson labels that limitation instead of inventing one.

## Plain-language mental model

Kestrel is the application’s front door. A reverse proxy is a receptionist in front of it: the proxy may terminate the public encrypted connection, choose a backend, and send a new request inward. Because the backend sees the proxy’s connection, it needs a trustworthy way to recover the original scheme, host, and client address. Forwarded headers are the receptionist’s note—but only a known receptionist’s note should be trusted.

YARP is a proxy toolkit inside an ASP.NET Core app. A route decides which incoming requests match; a cluster names a set of destinations and policy; a destination is one backend address. Health and load-balancing policies determine which configured destination is eligible for a request. Configuration presence alone does not mean a backend is ready.

## How the parts fit together

1. A client resolves a host and connects to a public listener. A firewall, cloud load balancer, or edge proxy may be earlier in the path.
2. TLS may terminate at that edge or at Kestrel. If TLS terminates earlier, the internal hop may be HTTP or TLS; the security of that hop depends on network isolation and threat model.
3. Kestrel binds configured endpoints and negotiates HTTP/1.1, HTTP/2, or HTTP/3 where the transport, TLS, client, and platform support it.
4. The app validates accepted hosts and runs middleware in the right order. Trusted forwarded-header middleware runs before HTTPS redirection, HSTS decisions, authentication, URL generation, or client-IP-based policies that depend on original request context.
5. With YARP, route matching selects a cluster, a destination policy selects a healthy backend, transforms adjust the proxied request/response, and the outbound HTTP client handles transport and certificates.
6. Timeouts, cancellation, connection limits, body limits, active/passive health, affinity, and logs bound resource use and make failures observable across both proxy hops.

## Concept map

| Concern | Decision owner | Important question |
|---|---|---|
| Listener and HTTP protocol | Kestrel endpoint or outer proxy | Which address, port, and protocols are bound? |
| Public TLS | Edge, load balancer, or Kestrel | Where is the certificate/private key and what does the next hop use? |
| Original request context | Trusted proxy + forwarded-header middleware | Which network peers may assert client IP, host, and scheme? |
| Host security | Edge and app host filtering | Which host names are valid for this app? |
| Backend routing | YARP route/cluster configuration | Which request maps to which backend service? |
| Destination eligibility | Health and availability policy | Which backends are healthy, unknown, draining, or unavailable? |
| Capacity and failure | Kestrel, YARP, edge and app | Where are queues, limits, timeouts, cancellation, and overload handled? |

TLS termination and TLS pass-through create different flows. With termination, the edge decrypts and usually creates a new backend connection; original scheme information must be forwarded through a trusted path. With pass-through, TLS remains encrypted to the backend, which owns the handshake and certificate. PROXY protocol carries connection metadata at the transport-proxy layer and is not the same as HTTP `X-Forwarded-*` headers.

## End-to-end walkthrough

Suppose `https://api.example.test/orders` reaches an edge proxy and then a YARP gateway. Public TLS ends at the edge. The edge accepts only configured hosts, and its private network identity is configured as trusted in the gateway. The gateway runs forwarded-header middleware before redirect/auth middleware, with explicit `KnownProxies` or `KnownIPNetworks` and a bounded `ForwardLimit`. The `AllowedHosts` configuration and host filtering restrict valid host names.

YARP matches `/orders/{**rest}` to an orders route, applies its request transforms, and selects a healthy destination from the orders cluster. The destination certificate is validated if the backend hop uses HTTPS; never set dangerous certificate acceptance in production. Active probes detect readiness on a dedicated path. Passive failure policy observes proxied transport outcomes. Request cancellation and a bounded timeout prevent a disconnected client from consuming backend work indefinitely. Logs include a correlation identifier and distinguish incoming requests from outbound destination failures.

If the browser receives a redirect loop, inspect the scheme as seen by the application and middleware order before changing the redirect rule. If all destinations are unhealthy, determine whether active checks fail, passive checks marked them unavailable, or a configuration reload removed them. Do not mask a trust or readiness issue by trusting every header or enabling panic routing without an explicit resilience decision.

## When to use it and tradeoffs

Run Kestrel at the edge when direct ownership of TLS, host validation, rate/connection limits, and perimeter protection is operationally sound. Place a reverse proxy in front when centralized TLS, multi-service routing, edge protection, or controlled backend selection is needed. A proxy improves composition but adds a hop, configuration surface, certificate lifecycle, observability needs, and a trust relationship.

Use YARP when an ASP.NET Core-hosted programmable proxy is useful and its routing/resilience features fit. A dedicated edge proxy or managed load balancer may better own global traffic, static content, WAF, or multi-region functions. A load balancer distributes connections/requests; a reverse proxy also terminates and forwards application-layer requests, but products often combine both roles.

## What later lessons cover

Reference lessons inventory listener configuration and limits; TLS/QUIC certificates and trust; proxy topologies and trusted forwarding; YARP routes, clusters, destinations and transforms; and destination health, balancing and diagnostics. Practice designs a trusted proxy topology and diagnoses outage scenarios. Interview questions test the request path, boundary decisions, and resilience tradeoffs.

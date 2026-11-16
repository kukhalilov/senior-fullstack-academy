# Kestrel reverse proxies TLS networking and load balancing — Core concepts and how they fit together

Sources: [Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-10.0), [Kestrel endpoint configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0), [Kestrel HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3), [proxy and load-balancer configuration](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0), [YARP configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [YARP health checks](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/dests-health-checks?view=aspnetcore-10.0), [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy), and [YARP release record](https://github.com/dotnet/yarp/releases).

## Learning objectives

Trace request and TLS termination across proxies; configure a Kestrel listener and protocol intentionally; explain certificates, ALPN, QUIC, and client-certificate validation; restore original request context only from trusted peers; describe YARP’s route/cluster/destination hierarchy and transforms; and reason about health, balancing, timeouts, and overload.

## Prerequisites

Know HTTP requests, DNS, TCP/IP, TLS certificates, ASP.NET Core middleware order, and basic reverse-proxy behavior. A proxy makes a separate connection on behalf of a client; the backend’s socket peer is typically the proxy, not the browser.

## Core concepts

### Kestrel listens on endpoints

Kestrel is configured by default for ASP.NET Core applications. An endpoint binds an address and port and can set HTTP protocols, TLS, and connection behavior. `ListenAnyIP` exposes a listener on available interfaces; `ListenLocalhost` is for loopback development/communication; Unix sockets are a local IPC transport commonly used behind a Linux proxy; named pipes are a Windows IPC transport. Choose bind scope deliberately—binding all interfaces can expose a service beyond the intended network.

Configuration can come from code, URLs, or configuration providers. Be aware of precedence and reload support: a URL-based setting is not a full replacement for named endpoint configuration with TLS/protocol details. In IIS integration, IIS owns the public endpoint and can override standalone endpoint assumptions. Verify the actual addresses in startup logs and deployed environment.

### HTTP versions have transport and negotiation constraints

HTTP/1.1 and HTTP/2 use TCP; HTTP/3 uses QUIC over UDP and TLS 1.3. When an HTTPS endpoint supports multiple TCP-based protocols, ALPN negotiates HTTP/2 versus HTTP/1.1 during TLS. HTTP/3 is generally advertised as an alternative service and requires compatible clients, network paths, and MsQuic platform support. Kestrel does not enable HTTP/3 by default. In .NET 11, Kestrel can process HTTP/3 requests without waiting for the QUIC control stream’s initial SETTINGS, reducing latency for the first request on a new connection; this does not remove platform prerequisites.

Kestrel limits protect resources at its layer: concurrent connections, request bodies, header wait, keep-alive, data rates, and HTTP/2/3 stream behavior. A reverse proxy or IIS may impose an earlier limit. The smallest limit in the path can reject the request; matching limits without a capacity/deadline model may merely move the queue. Body-size exceptions must be explicit and endpoint-specific.

### TLS terminates at one or more explicit boundaries

With TLS termination, a component decrypts the client’s connection. If it forwards over HTTP, the backend hop is plaintext and must be protected by network isolation or a deliberate secure tunnel. If it re-encrypts, it creates a new TLS session and validates the backend certificate. TLS pass-through instead preserves the encrypted session to the eventual server, reducing application-layer inspection at the proxy.

An X.509 server certificate must have an appropriate Server Authentication EKU, a usable private key at the terminating component, valid name/SAN, valid dates, and a trusted chain. SNI sends a server name during the TLS handshake to select a certificate/endpoint. mTLS asks the client for a certificate and validates its chain and identity; forwarding a client certificate as a header is safe only when the proxy strips client-supplied copies and the backend trusts only that proxy.

TLS versions and cipher suites are controlled by server/platform policy and endpoint configuration. Prefer modern supported TLS; do not select a cipher by name without confirming platform behavior. TLS handshake timeout and ClientHello limits protect resources before an HTTP request exists. Certificate rotation requires a staged deployment or reload strategy validated for the platform; successful reload should be observed, not assumed.

### Forwarded headers carry claims across a proxy boundary

The backend connection identifies the proxy. `X-Forwarded-For`, `Proto`, `Host`, and `Prefix` can carry the original client address and URL context, but they are ordinary headers and can be forged by a direct client. Configure which proxy addresses/networks are trusted, how many hops to process, and expected symmetry. Unknown proxies are ignored by default in supported servicing releases after a security change; do not clear trust lists to “make it work.”

Run forwarded-header middleware before HTTPS redirection, HSTS decisions, host-dependent URL generation, authentication, logging, and client-IP rate limiting. Validate hosts with `AllowedHosts`/host filtering. The proxy itself must overwrite or correctly append headers, strip untrusted inbound values, and prevent direct access that bypasses the trusted edge. If transport-level PROXY protocol is used, it requires a compatible listener and is not equivalent to HTTP headers.

### YARP has routes, clusters, and destinations

YARP’s route matches path, host, method, headers, query parameters, and order. A route points to a cluster. A cluster contains destination addresses and shared HTTP client, load-balancing, health, affinity, and metadata configuration. A destination is one backend endpoint with optional metadata/health address. `AddReverseProxy` registers services; `MapReverseProxy` maps the proxy pipeline. YARP 2.3.0 is the latest stable release listed in its official roadmap and supports .NET 8 or later, so it can run on .NET 11.

Transforms change the outgoing request or incoming response (for example remove a public path prefix or set forwarded headers). Validate the final URI/host/auth context; transform order and duplicate headers matter. Authorization policies are evaluated at the proxy route; backend authorization remains necessary where the backend is independently reachable.

### Health and load distribution are separate policies

Active health checks send periodic probes to a configured health path. Passive checks evaluate actual proxy outcomes. Neither proves every business path is healthy; choose a probe that measures serving readiness and avoid making it a costly load generator. Unknown, healthy, and unhealthy states determine destination eligibility according to an available-destinations policy.

Load balancing chooses among eligible destinations; session affinity may pin a client, which can reduce distribution and complicate failover. Draining should stop new work while in-flight requests complete. A circuit breaker, request timeout, connection limit, and cancellation policy operate at different scopes; none replaces application-level idempotency or a bulkhead for costly dependencies.

## Mechanisms and relationships

The effective client IP/scheme/host is the output of a chain of trust: a client reaches an edge; each trusted proxy sanitizes or appends metadata; Kestrel accepts traffic only from expected peers; forwarded-header middleware processes a bounded number of trusted hops; the app validates the resulting host and uses the restored scheme for redirects and secure-cookie logic. If any hop can be bypassed or arbitrary header values are trusted, IP allowlists, audit attribution, HTTPS checks, or redirect logic can be defeated.

The YARP decision chain is: route match → cluster selection → available-destination policy → load-balancing policy → session-affinity behavior → outbound HTTP handler/transport → transforms and response. Diagnose “wrong backend” by inspecting each stage rather than editing destination addresses first. Health state changes can remove a destination; a panic/fallback policy may intentionally route to unhealthy destinations when none are healthy, trading correctness/availability risk for a chance of recovery.

## Worked examples

**TLS at edge, private HTTP backend:** Edge validates the public certificate and host, overwrites forwarded headers, and connects to a private network address. The app trusts only the edge’s IP/network and processes forwarded headers early. Network controls prevent public clients from reaching Kestrel directly. The team documents that internal traffic is plaintext and decides whether network encryption is required by threat model or policy.

**HTTP/2 and HTTP/3 listener:** Configure supported protocols deliberately. HTTP/2 over TLS uses ALPN. HTTP/3 requires UDP reachability, TLS 1.3, MsQuic, and client/network support; retain HTTP/1.1/2 fallback for compatibility. Confirm Alt-Svc advertisement and actual negotiated protocol in telemetry.

**YARP path routing:** Route `/api/{**remainder}` to a cluster and remove `/api` only if the backend expects the remainder path. Set explicit host behavior and forwarded headers. Probe a backend readiness endpoint; when it is unhealthy, load balancing excludes it according to the cluster policy. Ensure route authorization and backend access controls remain correct if the backend is reachable through another path.

## Misconceptions and edge cases

- “Behind a proxy” does not make forwarded headers trustworthy; network peer identity and header sanitization do.
- TLS termination is not the same as TLS pass-through or backend re-encryption.
- mTLS authenticates a client certificate at a TLS terminator; a forwarded certificate header needs a separate trust contract.
- ALPN negotiates protocol inside TLS; HTTP/3 uses QUIC and is not negotiated over a TCP TLS connection in the same way.
- HTTP/3 support is not enabled by default and can fall back when platform/transport requirements are absent.
- A configured destination is not necessarily healthy or eligible.
- Health checks do not replace synthetic end-to-end monitoring or business correctness checks.
- Session affinity can cause uneven load and make unhealthy destinations harder to evacuate.
- `ForwardLimit=1` is correct only when the actual topology has one trusted hop to process.
- Kestrel limits cannot protect resources consumed before traffic reaches Kestrel; edge limits matter too.
- Unknown-proxy forwarded headers should not be made trusted by clearing proxy/network restrictions.
- YARP release version is independent of ASP.NET Core version.

## Knowledge checks with answers

1. **Who should the app trust for forwarded headers?** Only known proxy addresses/networks and the bounded number of hops in the documented topology.
2. **Where should forwarded-header middleware be placed?** Before middleware whose decisions depend on original scheme, host, or client address, especially HTTPS redirection and security/rate-limit logic.
3. **What does ALPN do?** Negotiates an application protocol such as HTTP/2 or HTTP/1.1 during TLS handshake where supported.
4. **What extra transport does HTTP/3 require?** QUIC over UDP, supported MsQuic/platform requirements, TLS 1.3, and compatible network/client paths.
5. **What is a YARP cluster?** A group of destination endpoints and related shared routing, health, balancing, affinity, and client configuration.
6. **Why not just raise request body limits globally?** It increases memory/bandwidth exposure; use measured, bounded, endpoint-specific requirements across every proxy layer.
7. **What does session affinity trade away?** More stable backend assignment for a client at the cost of load distribution flexibility and potentially less effective failover.

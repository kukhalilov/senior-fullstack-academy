# Kestrel reverse proxies TLS networking and load balancing — Reference: Listener endpoints, address binding, HTTP versions, and server limits

Sources: [Kestrel 11 protocol-compliance change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/kestrel-strict-protocol-compliance), [Kestrel web server](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-10.0), [Kestrel endpoint configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0), [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations?view=aspnetcore-10.0), [Kestrel HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Scope and version

Kestrel is the current ASP.NET Core HTTP server and this curriculum targets .NET 11 GA. Some versioned Learn pages still use the 10.0 selector; the current HTTP/3 article documents .NET 11 early-request processing, while protocol constraints remain as described below. Confirm the target runtime, OS, proxy/IIS integration, and endpoint configuration in the deployed environment.

### .NET 11 protocol-compliance change

Kestrel 11 applies stricter HTTP framing rules. HTTP/2 and HTTP/3 reject connection-specific request headers including `Proxy-Connection`, `Keep-Alive`, `Transfer-Encoding`, and `Upgrade` (and reject `TE` except `trailers`); HTTP/1.1 closes the connection after responding when a request contains both `Content-Length` and `Transfer-Encoding`. Audit legacy clients and protocol-translating gateways that forward such headers. Compliant clients are unaffected; the change helps prevent request-smuggling ambiguity. [Kestrel 11 breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/kestrel-strict-protocol-compliance)

## How this group fits the mental model

An endpoint is a listener configuration: address, port, allowed HTTP protocol, and optional TLS setup. Multiple endpoint sources may contribute settings; in-process IIS hosting is a different server arrangement, and out-of-process IIS assigns Kestrel a private endpoint. Limits apply at this server boundary, while a proxy or operating system may reject traffic earlier.

## Supplied names explained

- `Kestrel` — Cross-platform ASP.NET Core HTTP server, used by default outside IIS in the standard app hosting model. It can be public-facing or sit behind a trusted reverse proxy.
- `KestrelServerOptions` — Programmatic server-level configuration object supplied to `ConfigureKestrel`; use it for endpoint and limit setup before the host starts.
- `Listen endpoint` — A configured local address/port listener, optionally with protocols and TLS. Binding scope determines which network interfaces can reach the app.
- `ListenAnyIP` — Binds a TCP endpoint on all available IP interfaces (subject to platform semantics). It can expose the app externally; pair it with firewall/network policy and host validation.
- `ListenLocalhost` — Binds loopback addresses for local-only access. It is useful for development or private local proxy traffic, not for a service that must accept remote client connections.
- `ListenUnixSocket` — Listens on a Unix domain socket on supported systems. File permissions and socket lifecycle are part of access control; the socket file may require explicit cleanup after shutdown.
- `ListenNamedPipe` — Listens through a Windows named pipe using the Kestrel named-pipes transport. It is local inter-process communication; configure pipe security and do not treat it as a TCP endpoint.
- `Kestrel endpoint configuration` — Configuration under `Kestrel:Endpoints`, with per-endpoint URL, protocol, and HTTPS properties. Named endpoints make different listeners explicit.
- `Kestrel endpoint name` — Key beneath `Kestrel:Endpoints` identifying one endpoint configuration entry. It is a configuration label, not a DNS name or necessarily the endpoint’s host name.
- `Kestrel endpoint Defaults` — Shared endpoint settings configured through `Kestrel:EndpointDefaults`. A specific endpoint can override defaults; compare the effective setting from all providers.
- `Kestrel endpoint configuration reload` — Kestrel can respond to supported configuration reloads by applying endpoint changes. A failed reload does not guarantee the new endpoint is active; inspect logs and verify listening sockets after reload.
- `ASPNETCORE_URLS` — ASP.NET Core hosting URL setting that supplies one or more addresses for the server. It is convenient for simple binding; named endpoint configuration is needed for richer per-endpoint TLS/protocol behavior.
- `HTTP_PORTS` — Port-list setting for HTTP endpoints in modern ASP.NET Core hosting configuration. It is a shorthand for HTTP listeners, not a host/IP selector; the environment/configuration key may be prefixed (for example `ASPNETCORE_HTTP_PORTS`).
- `HTTPS_PORTS` — Port-list setting for HTTPS endpoints. A port alone does not provide a certificate; HTTPS certificate configuration must also be available.
- `UseUrls` — Generic host API to set server URLs in code. It is suitable for simple URL binding, but explicit `Listen` configuration is clearer when per-endpoint protocol, TLS, or transport settings are required.
- `ListenOptions` — Per-listener options object supplied to endpoint callbacks, including protocol and HTTPS configuration.
- `ListenOptions.Protocols` — Selects HTTP protocol(s) allowed on that endpoint using `HttpProtocols`. Mixing HTTP/1.1 and HTTP/2 over TLS relies on ALPN negotiation.
- `HttpProtocols.Http1` — Allows HTTP/1.1 on the endpoint; it can run with or without TLS.
- `HttpProtocols.Http2` — Allows HTTP/2. Cleartext HTTP/2 requires client prior knowledge; the common browser path negotiates HTTP/2 with TLS and ALPN.
- `HttpProtocols.Http3` — Allows HTTP/3 over QUIC. It requires TLS 1.3 and supported MsQuic/platform/network components; do not assume it is available everywhere.
- `HttpProtocols.Http1AndHttp2` — Permits both HTTP/1.1 and HTTP/2. For HTTPS, ALPN selects HTTP/2 when both sides support it; otherwise clients may use HTTP/1.1.
- `HTTP/2 ALPN negotiation` — TLS handshake extension selects an application protocol such as `h2` before HTTP requests are sent. ALPN is relevant to HTTP/2-over-TLS, not the QUIC transport negotiation used by HTTP/3.
- `HTTP/3 QUIC transport` — HTTP/3 uses QUIC over UDP, with TLS 1.3 integrated into QUIC. UDP reachability, MsQuic support, client behavior, and proxy forwarding must all work.
- `TLS endpoint` — Listener configured with HTTPS options/certificate. Keep private key access restricted to the process and plan certificate validation/rotation.
- `KestrelServerLimits` — Server limits object controlling connections, request body, header timing, keep-alive, data rates, and protocol-specific behavior. Set values from capacity/deadline requirements.
- `MaxConcurrentConnections` — Maximum simultaneous connections for the server or endpoint configuration. It is not the same as concurrent requests, especially with multiplexed HTTP/2/3.
- `MaxConcurrentUpgradedConnections` — Maximum upgraded connections such as WebSockets. A WebSocket can remain open a long time, so capacity differs from short HTTP request concurrency.
- `MaxRequestBodySize` — Maximum accepted request body size where the feature is enabled. Override only for routes that need larger uploads and account for earlier proxy limits and buffering.
- `IHttpMaxRequestBodySizeFeature` — Per-request feature used to inspect or change the request-body limit before reading starts. Once the body read begins, changing the limit is too late.
- `RequestHeadersTimeout` — Maximum time allowed for receiving request headers. It helps limit slow-header resource occupation; coordinate with proxies and legitimate client/network latency.
- `KeepAliveTimeout` — Idle connection time allowed between requests on a keep-alive connection. It is distinct from an individual request execution deadline.
- `MinRequestBodyDataRate` — Minimum body data rate enforcement after its grace period, helping defend against slow uploads. Set thoughtfully for mobile/slow links and upload endpoints.
- `MinResponseDataRate` — Minimum response write rate enforcement after grace period where supported. It can affect slow clients and should not be mistaken for application response timeouts.
- `Kestrel Http2 limits` — HTTP/2-specific resource settings such as concurrent streams, header size, and connection behavior. Multiplexed streams share a connection, so TCP connection counts alone do not bound request concurrency.
- `Kestrel Http3 limits` — HTTP/3/QUIC-specific limits for streams and header fields, in addition to QUIC transport limits. Review both Kestrel and MsQuic constraints.
- `Kestrel request body limit behind IIS` — Under IIS integration, IIS/ANCM can impose request-size behavior before or alongside Kestrel. Configure and test the effective end-to-end limit rather than assuming standalone Kestrel settings control it.
- `IIS endpoint binding override` — When IIS owns the public listener, app endpoint settings may not determine the public binding; IIS integration supplies/overrides the app-facing endpoint behavior. Configure external bindings in IIS and verify the actual Kestrel endpoint only for the hosting mode that uses it.

## Cross-item comparison

| Binding style | Exposure/use | Extra decisions |
|---|---|---|
| `ListenAnyIP` | All local interfaces | Firewall, host validation, TLS, proxy trust |
| `ListenLocalhost` | Local loopback | Caller identity and local process access |
| Unix socket | Local Unix processes | File permissions, directory, cleanup |
| Named pipe | Local Windows processes | Pipe ACL and naming |
| HTTP/1.1+2 endpoint | TCP | TLS/ALPN for normal browser HTTP/2 negotiation |
| HTTP/3 endpoint | QUIC/UDP | TLS 1.3, MsQuic, UDP path, fallback protocols |

HTTP/3 in .NET 11 processes a request without first waiting for the QUIC control stream’s SETTINGS frame, reducing first-request latency on a new HTTP/3 connection. This performance change does not enable HTTP/3 by default or remove QUIC’s platform requirements.

## Examples

A local development API may use `ListenLocalhost(5001)` with a development certificate. A containerized service behind a reverse proxy may bind `ListenAnyIP(8080)` on a private network and rely on network policy to prevent direct public access. A public HTTPS listener that allows HTTP/1.1 and HTTP/2 should configure its certificate and protocol list; an HTTP/3 listener additionally needs UDP reachability and supported QUIC dependencies.

If only an upload endpoint needs a larger body, use a scoped request feature or endpoint policy before reading, and ensure the edge proxy also permits that size. A Kestrel increase cannot override an earlier 413 from a gateway.

## Common mistakes

- Binding `ListenAnyIP` and assuming the service remains private.
- Setting an HTTPS port without configuring a certificate.
- Assuming HTTP/3 is enabled automatically when `HttpProtocols.Http3` is specified but MsQuic/UDP is unavailable.
- Forwarding connection-specific HTTP/1.1 headers into HTTP/2/3 through a legacy gateway; .NET 11 rejects these protocol-invalid requests.
- Confusing concurrent TCP connections with HTTP/2/3 concurrent streams or active requests.
- Raising body-size limits at Kestrel while an earlier proxy retains a smaller limit.
- Changing `IHttpMaxRequestBodySizeFeature` after reading has begun.
- Treating request-header, keep-alive, and application execution timeouts as the same timer.
- Assuming endpoint configuration reload succeeded without checking listener state and logs.
- Relying on a fixed Kestrel public port behind IIS/ANCM instead of the hosting integration’s assigned endpoint.

## Knowledge checks with answers

1. **What does a Kestrel endpoint describe?** A listener address/port and its connection protocol/TLS settings.
2. **Why can HTTP/2 and HTTP/1.1 share an HTTPS listener?** TLS ALPN negotiates the protocol supported by the client and server.
3. **What extra path does HTTP/3 use?** QUIC over UDP with TLS 1.3 and platform MsQuic support.
4. **Do maximum connections and maximum concurrent requests mean the same thing?** No; HTTP/2/3 multiplex several streams over one connection.
5. **When must a request body limit be set?** Before body reading begins, and it must be consistent with upstream limits.

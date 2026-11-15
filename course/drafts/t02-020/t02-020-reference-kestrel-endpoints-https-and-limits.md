# Kestrel endpoints TLS reverse proxies and IIS integration — Reference: Kestrel server registration endpoint binding HTTPS certificates and limits

## Scope and version

This lesson covers the Kestrel listener, HTTPS and certificate configuration, HTTP protocol selection, URL binding, and the named server/request limits. Exact defaults vary by framework version and deployment; check the current Kestrel reference for the target runtime instead of copying remembered values. HTTP/3 additionally depends on QUIC platform support and UDP reachability. [Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options) [HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3)

## How this group fits the mental model

Kestrel is the socket-owning HTTP server when the application is hosted directly or behind a reverse proxy. Configure addresses and protocols on endpoints, then apply TLS and limits at the layer that owns the traffic. An upstream proxy, IIS, and the ASP.NET Core request pipeline can enforce independent limits. The effective request must pass every layer.

## Supplied names explained

### Server registration and listeners

| Supplied name | Purpose and behavior |
|---|---|
| `Kestrel web server` | Cross-platform ASP.NET Core HTTP server; in IIS in-process mode `IISHttpServer` is used instead. |
| `KestrelServerOptions` | Configuration object for Kestrel listeners, endpoint defaults, HTTPS defaults, and limits. |
| `IWebHostBuilder.ConfigureKestrel` | Configures Kestrel when using the generic web-host builder API, including older Startup-style hosting. |
| `WebApplicationBuilder.WebHost.ConfigureKestrel` | Modern minimal-hosting entry point for configuring the Kestrel server options. |
| `KestrelServerOptions.Listen` | Binds an explicit endpoint and permits per-listener protocol/TLS configuration. Prefer explicit listeners when address, protocol, or certificate must be controlled. |
| `KestrelServerOptions.ListenLocalhost` | Binds a loopback endpoint for local-machine access; it is not an externally reachable interface. |
| `KestrelServerOptions.ListenAnyIP` | Binds all available interfaces on the selected port. Firewall and container exposure rules still determine who can reach it. |
| `KestrelServerOptions.ListenUnixSocket` | Binds a Unix domain socket on supported systems, often for a local reverse-proxy hop; socket path permissions are part of security. |
| `KestrelServerOptions.ConfigureEndpointDefaults` | Applies a configuration callback to endpoints added through `Listen`; use it for shared listener settings. |
| `KestrelServerOptions.Limits` | Accesses Kestrel server limits; those protect server resources, not application-level business quotas. |
| `KestrelServerOptions.AddServerHeader` | Controls emission of the `Server` response header. Hiding it reduces incidental disclosure but is not a security boundary. |
| `ListenOptions` | Per-endpoint options object used to choose protocols, TLS, and endpoint-level behavior. |

### HTTPS and certificates

| Supplied name | Purpose and behavior |
|---|---|
| `ListenOptions.UseHttps` | Enables TLS on a listener and selects certificate/options. A plain HTTP listener does not become HTTPS merely because the app uses HTTPS redirection. |
| `HttpsConnectionAdapterOptions` | HTTPS adapter configuration for certificate selection, client certificates, protocol versions, and authentication callbacks. |
| `HttpsConnectionAdapterOptions.ServerCertificate` | Supplies the certificate used for TLS on that listener. Protect its private key and ensure its name matches the public host. |
| `HttpsConnectionAdapterOptions.ServerCertificateSelector` | Selects a certificate dynamically from connection context, commonly for multiple hostnames; selection code must be safe and fast. |
| `HttpsConnectionAdapterOptions.ClientCertificateMode` | Controls whether a client certificate is not requested, optional, or required for mutual TLS. It does not itself authorize a certificate identity. |
| `ClientCertificateMode.NoCertificate` | Does not request a client certificate during TLS negotiation. |
| `ClientCertificateMode.AllowCertificate` | Requests a client certificate but allows the connection without one; validate any supplied certificate if it matters. |
| `ClientCertificateMode.RequireCertificate` | Requires the client to present a certificate; application validation and authorization still determine trust. |
| `HttpsConnectionAdapterOptions.SslProtocols` | Restricts TLS protocol versions accepted by the listener. Prefer current platform-supported secure defaults unless policy requires a narrower set. |
| `HttpsConnectionAdapterOptions.OnAuthenticate` | Callback to customize TLS authentication options for a connection; use carefully because it affects handshake security. |
| `KestrelServerOptions.ConfigureHttpsDefaults` | Applies shared HTTPS settings to secure endpoints that do not override them. |
| `Certificate loading from configuration and secret providers` | Loads certificate material from configured sources; production private keys belong in protected secret/certificate stores, not committed settings. |
| `TLS termination at Kestrel` | Kestrel owns the public or private TLS handshake and needs a certificate for that endpoint. |
| `TLS termination at reverse proxy` | The proxy decrypts client TLS and forwards to the app; securely configure the internal hop and trusted scheme forwarding. |

### Server and request limits

| Supplied name | Purpose and behavior |
|---|---|
| `KestrelServerLimits.MaxConcurrentConnections` | Caps concurrent non-upgraded connections when configured; it is not a per-user limit or a complete workload cap. |
| `KestrelServerLimits.MaxConcurrentUpgradedConnections` | Separately caps upgraded connections such as WebSockets. Do not assume the ordinary connection cap includes them. |
| `KestrelServerLimits.MaxRequestBodySize` | Sets a server-wide maximum request body size. An upstream proxy may impose a smaller cap. |
| `KestrelServerLimits.KeepAliveTimeout` | Limits how long an idle keep-alive connection remains open between requests; coordinate with proxy/client timeouts. |
| `KestrelServerLimits.RequestHeadersTimeout` | Limits time allowed to receive request headers, helping mitigate slow-header resource holding. |
| `KestrelServerLimits.MinRequestBodyDataRate` | Minimum body data rate after a grace period; slow clients can be disconnected. Treat configured rates carefully for mobile/unreliable networks. |
| `KestrelServerLimits.MinResponseDataRate` | Minimum response data rate after a grace period; affects slow response readers and large transfers. |
| `IHttpMaxRequestBodySizeFeature` | Per-request feature for reading or setting the effective Kestrel request-body cap where supported. |
| `IHttpMaxRequestBodySizeFeature.MaxRequestBodySize` | Gets or sets the body-size limit for the request before reading begins. |
| `IHttpMaxRequestBodySizeFeature.IsReadOnly` | Indicates that request-body reading has started or the server cannot change the limit; configure early. |
| `RequestSizeLimitAttribute` | MVC endpoint metadata/filter for a per-action request-body size policy; it cannot raise a smaller upstream proxy limit. |
| `DisableRequestSizeLimitAttribute` | Disables the MVC request-size cap for an action. Use only with other controls such as streaming, quotas, and storage limits. |
| `Max request body size must be configured before reading starts` | Once body consumption begins, changing the Kestrel limit is too late and the feature becomes read-only. |
| `Kestrel connection limits versus application concurrency limits` | Server limits bound sockets/connections; semaphores, queues, rate limiting, and worker pools bound application work. Use both as appropriate. |
| `MaxConcurrentConnections does not include upgraded connections` | Configure the separate upgraded-connection limit for WebSockets and other upgraded protocols. |

### HTTP protocol and endpoint configuration

| Supplied name | Purpose and behavior |
|---|---|
| `HTTP/1.1 HTTP/2 and HTTP/3 endpoint protocol configuration` | A listener selects supported HTTP versions; compatibility and TLS/ALPN/QUIC requirements affect negotiation. |
| `ListenOptions.Protocols` | Chooses which HTTP protocol versions a Kestrel endpoint accepts. |
| `HttpProtocols.Http1` | Enables HTTP/1.1 on the endpoint. |
| `HttpProtocols.Http2` | Enables HTTP/2; HTTPS endpoints negotiate with ALPN, while cleartext support has different client/proxy constraints. |
| `HttpProtocols.Http3` | Enables HTTP/3 over QUIC/UDP when the OS, runtime, and network support it. |
| `HttpProtocols.Http1AndHttp2` | Allows HTTP/1.1 and HTTP/2 on one endpoint, typically negotiated through HTTPS/ALPN. |
| `HttpProtocols.Http1AndHttp2AndHttp3` | Advertises HTTP/3 alongside HTTP/1.1 and HTTP/2, providing fallback paths when UDP/QUIC is unavailable. |
| `ALPN and HTTPS requirement for HTTP/2 negotiation` | Browser-facing HTTP/2 over TLS is negotiated using ALPN; use HTTPS for the common secure deployment. |
| `HTTP/3 UDP endpoint and QUIC hosting requirement` | HTTP/3 uses QUIC over UDP, so open the UDP path and verify platform support in addition to configuring TLS. |
| `UseUrls` | Sets hosting URL addresses through host configuration; explicit `Listen` endpoints take precedence for Kestrel binding. |
| `ASPNETCORE_URLS environment variable` | Supplies URL bindings through host configuration and can be overridden by higher-precedence configuration. |
| `--urls command-line argument` | Sets the `urls` host setting from the command line. |
| `urls host configuration key` | Address-list setting used by generic hosting when explicit Kestrel listeners are not configured. |
| `URL binding versus explicit Listen endpoints` | URL binding is convenient for simple address/port setup; `Listen` is needed for per-endpoint protocols, certificates, or socket options. |
| `Kestrel endpoint configuration from appsettings.json` | The Kestrel configuration section can define named endpoints and their URL/protocol/certificate configuration. |
| `Kestrel endpoint configuration reload behavior` | Some endpoint configuration can reload, but rebinding and certificate updates have constraints; verify current runtime behavior and test changes. |
| `Default HTTPS certificate and development certificate boundary` | The development certificate supports local development; it is not a production certificate source or deployment strategy. |
| `Production certificate rotation and key protection` | Protect private keys, monitor expiry, plan replacement, and verify how the host reloads new material. |

## Cross-item comparison

Use URL configuration for simple bindings and explicit `Listen` endpoints when a listener needs its own HTTP versions or TLS certificate. Use the ordinary and upgraded connection limits together because they protect different connection classes. Choose the TLS termination point based on key custody, network segmentation, proxy requirements, and whether the app must observe the original public scheme. Request-body limits must align across proxy, Kestrel, MVC, and application streaming/storage behavior.

## Examples

```csharp
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxConcurrentConnections = 500;
    options.Limits.MaxConcurrentUpgradedConnections = 100;
    options.ListenAnyIP(5001, listen =>
    {
        listen.Protocols = HttpProtocols.Http1AndHttp2;
        listen.UseHttps();
    });
});
```

This is a configuration shape, not a recommended universal capacity profile. Supply a production certificate through the host's protected configuration and benchmark limits against the real workload. If a reverse proxy terminates public TLS, this internal HTTPS listener is optional but protects the proxy-to-app hop.

## Common mistakes

- Exposing `ListenAnyIP` without a firewall or intended public TLS boundary.
- Assuming HTTPS redirection configures a certificate or encrypts the connection to Kestrel.
- Treating a development certificate as a production key-management solution.
- Increasing request-body size globally for one upload path; prefer scoped limits and streaming.
- Setting a Kestrel body limit after a middleware has already read the body.
- Treating `MaxConcurrentConnections` as including WebSockets or as a per-user concurrency cap.
- Enabling HTTP/3 without UDP reachability and platform/QUIC support.
- Assuming all Kestrel endpoint settings reload identically at runtime.
- Giving conflicting URL bindings and explicit `Listen` endpoints without understanding precedence.

## Knowledge checks with answers

1. **Which listener limit covers WebSockets?** The upgraded-connection limit, configured separately from ordinary concurrent connections.
2. **Can an action's request-size attribute permit a body rejected by Nginx first?** No; the proxy can reject before the request reaches the app.
3. **When is the per-request body limit too late to set?** After body reading has begun, when the feature is read-only.
4. **What else must work for HTTP/3?** UDP/QUIC and a supported platform, not just an HTTPS certificate and protocol enum.

## Sources

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) · [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options) · [HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3)

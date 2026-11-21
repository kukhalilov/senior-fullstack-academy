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
| `KestrelServerOptions.AllowAlternateSchemes` | Defaults to `false`; controls HTTP/2 and HTTP/3 `:scheme` validation. Enable only behind a trusted proxy that requires it, and validate the resulting `HttpRequest.Scheme` before security-sensitive use. |
| `KestrelServerOptions.AllowHostHeaderOverride` | Defaults to `false`; controls whether an absolute-form HTTP/1 request target can override a mismatching `Host` header. Keep the consistency check unless a known proxy setup requires otherwise. |
| `KestrelServerOptions.AllowResponseHeaderCompression` | Controls dynamic compression of response headers. Review HPACK compression side-channel risks when secrets and attacker-controlled values can be reflected together. |
| `KestrelServerOptions.AllowSynchronousIO` | Controls synchronous request/response I/O and defaults to disabled; enabling blocking I/O can cause thread-pool starvation. Prefer async APIs. |
| `KestrelServerOptions.ApplicationSchedulingMode` | Selects how Kestrel schedules application callbacks. Treat this as an advanced runtime tuning option and verify the enum/runtime behavior before changing it. |
| `KestrelServerOptions.ApplicationServices` | Makes the app service provider available to endpoint configuration callbacks; normally initialized by hosting integration. Avoid resolving scoped services during server startup callbacks. |
| `KestrelServerOptions.ConfigurationLoader` | Holds the Kestrel endpoint configuration loader; default is `null` until configuration is loaded. |
| `KestrelServerOptions.DisableStringReuse` | Controls whether materialized string values can be reused across requests. This is an allocation/performance behavior knob; change only with a measured reason and validate the target runtime semantics. |
| `KestrelServerOptions.EnableAltSvc (obsolete)` | Obsolete compatibility property for emitting `Alt-Svc` for HTTP/3. Use current HTTP/3 endpoint configuration and automatic advertisement behavior instead of building new code around this obsolete switch. |
| `KestrelServerOptions.RequestHeaderEncodingSelector` | Selects an encoding for a named request header; `null` uses the default UTF-8 encoding. Configure narrowly because non-UTF-8 header decoding can affect application interpretation. |
| `KestrelServerOptions.ResponseHeaderEncodingSelector` | Selects an encoding for a response header or trailer; `null` uses the default ASCII encoding. Header values still need to obey protocol and security requirements. |
| `KestrelServerOptions.Configure()` | Creates an endpoint configuration loader without immediately supplying a configuration section. |
| `KestrelServerOptions.Configure(IConfiguration)` | Creates a loader from the Kestrel configuration section; use the overload with the reload flag when dynamic endpoint binding updates are required. |
| `KestrelServerOptions.Configure(IConfiguration, Boolean)` | Creates a loader from the Kestrel configuration section and controls dynamic endpoint binding updates. Reloading/rebinding has operational constraints; validate changes before relying on hot updates. |
| `KestrelServerOptions.Listen overloads for EndPoint IPAddress and IPEndPoint` | Bind supported endpoint representations, optionally with a per-endpoint callback. The callback is where protocol and HTTPS settings are attached. |
| `KestrelServerOptions.ListenHandle` | Binds an existing socket handle/file descriptor; useful for socket activation and host integration, with ownership/lifetime managed according to the hosting contract. |
| `KestrelServerOptions.ListenNamedPipe` | Binds a Windows named pipe, optionally with endpoint configuration; this is an OS-specific local transport, not a TCP listener. |
| `KestrelServerOptions.ListenLocalhost dynamic port zero unsupported` | Dynamic port `0` is unsupported for localhost listeners; use an appropriate IP endpoint when an ephemeral port is needed. |
| `KestrelServerOptions.UseSystemd extension` | Integrates Kestrel with systemd socket activation and supplied listening file descriptors; it is a hosting integration, not a portable listener API. |
| `ListenOptions` | Per-endpoint options object used to choose protocols, TLS, and endpoint-level behavior. |

### HTTPS and certificates

| Supplied name | Purpose and behavior |
|---|---|
| `ListenOptions.UseHttps` | Enables TLS on a listener and selects certificate/options. A plain HTTP listener does not become HTTPS merely because the app uses HTTPS redirection. |
| `HttpsConnectionAdapterOptions` | HTTPS adapter configuration for certificate selection, client certificates, protocol versions, and authentication callbacks. |
| `HttpsConnectionAdapterOptions.ServerCertificate` | Supplies the certificate used for TLS on that listener. Protect its private key and ensure its name matches the public host. |
| `HttpsConnectionAdapterOptions.ServerCertificateChain` | Supplies the full certificate chain presented by the server; ensure it corresponds to the selected leaf certificate and deployment chain policy. |
| `HttpsConnectionAdapterOptions.ServerCertificateSelector` | Selects a certificate dynamically from connection context, commonly for multiple hostnames; selection code must be safe and fast. |
| `HttpsConnectionAdapterOptions.ServerCertificateSelector ConnectionContext is null for HTTP/3` | Don't dereference the context unconditionally in a selector shared by HTTP/2 and HTTP/3 listeners; handle its documented null case. |
| `HttpsConnectionAdapterOptions.ClientCertificateMode` | Controls whether a client certificate is not requested, optional, or required for mutual TLS. It does not itself authorize a certificate identity. |
| `ClientCertificateMode.NoCertificate` | Does not request a client certificate during TLS negotiation. |
| `ClientCertificateMode.AllowCertificate` | Requests a client certificate but allows the connection without one; validate any supplied certificate if it matters. |
| `ClientCertificateMode.RequireCertificate` | Requires the client to present a certificate; application validation and authorization still determine trust. |
| `HttpsConnectionAdapterOptions.SslProtocols` | Restricts TLS protocol versions accepted by the listener. Prefer current platform-supported secure defaults unless policy requires a narrower set. |
| `HttpsConnectionAdapterOptions.HandshakeTimeout` | Bounds how long TLS negotiation may take; the documented default is 10 seconds. Keep it aligned with network conditions without allowing slow handshakes to hold resources indefinitely. |
| `HttpsConnectionAdapterOptions.CheckCertificateRevocation` | Controls whether certificate revocation is checked during TLS authentication; the documented default is false. Enabling revocation checks can add latency or fail when revocation responders are unavailable. |
| `HttpsConnectionAdapterOptions.ClientCertificateValidation` | Adds custom validation for a presented client certificate. Preserve normal chain validation unless the application has a carefully designed alternative. |
| `HttpsConnectionAdapterOptions.AllowAnyClientCertificate()` | Explicitly bypasses client-certificate validation; only suitable for isolated development/testing and never a safe production shortcut. |
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
| `KestrelServerLimits.MaxRequestBufferSize` | Maximum Kestrel request-buffer size; controls server-side buffering and is distinct from the total body-size limit. |
| `KestrelServerLimits.MaxRequestHeaderCount` | Maximum number of request headers accepted; use it with total header-byte and request-line limits. |
| `KestrelServerLimits.MaxRequestHeadersTotalSize` | Maximum combined request-header size in bytes; protects parsing/buffering resources. |
| `KestrelServerLimits.MaxRequestLineSize` | Maximum request-line size, including method/target/version; oversized request lines are rejected before application middleware. |
| `KestrelServerLimits.MaxResponseBufferSize` | Maximum buffered response data before writes apply backpressure; it is a flow-control boundary, not an overall response-size limit. |
| `KestrelServerLimits.Http2` | Accesses limits specific to HTTP/2 connections, such as concurrent streams, frame/header sizes, flow-control windows, and keep-alive pings. |
| `KestrelServerLimits.Http3` | Accesses HTTP/3-specific limits; the current `Http3Limits` surface includes maximum request-header field size. |
| `IHttpMaxRequestBodySizeFeature` | Per-request feature for reading or setting the effective Kestrel request-body cap where supported. |
| `IHttpMaxRequestBodySizeFeature.MaxRequestBodySize` | Gets or sets the body-size limit for the request before reading begins. |
| `IHttpMaxRequestBodySizeFeature.IsReadOnly` | Indicates that request-body reading has started or the server cannot change the limit; configure early. |
| `RequestSizeLimitAttribute` | MVC endpoint metadata/filter for a per-action request-body size policy; it cannot raise a smaller upstream proxy limit. |
| `DisableRequestSizeLimitAttribute` | Disables the MVC request-size cap for an action. Use only with other controls such as streaming, quotas, and storage limits. |
| `Max request body size must be configured before reading starts` | Once body consumption begins, changing the Kestrel limit is too late and the feature becomes read-only. |
| `Kestrel connection limits versus application concurrency limits` | Server limits bound sockets/connections; semaphores, queues, rate limiting, and worker pools bound application work. Use both as appropriate. |
| `MaxConcurrentConnections does not include upgraded connections` | Configure the separate upgraded-connection limit for WebSockets and other upgraded protocols. |

### Protocol-specific limits and defaults

| Supplied name | Purpose and behavior |
|---|---|
| `Http2Limits.MaxStreamsPerConnection` | Limits concurrent HTTP/2 streams on one connection; the documented default is 100. |
| `Http2Limits.HeaderTableSize` | Controls the HTTP/2 HPACK dynamic table size; documented default 4,096 bytes. Reducing it trades compression efficiency for a smaller compression-state surface. |
| `Http2Limits.MaxFrameSize` | Sets the maximum HTTP/2 frame payload size; documented default 16,384 bytes and supported range 16 KiB–16 MiB. |
| `Http2Limits.MaxRequestHeaderFieldSize` | Limits an individual HTTP/2 header field; documented default is 32,768 bytes. |
| `Http2Limits.InitialConnectionWindowSize` | Sets the initial HTTP/2 connection-level flow-control window; documented default is 1 MiB. |
| `Http2Limits.InitialStreamWindowSize` | Sets the initial HTTP/2 per-stream flow-control window; documented default is 768 KiB. |
| `Http2Limits.KeepAlivePingDelay` | Configures HTTP/2 keep-alive ping cadence; the documented default is disabled (`TimeSpan.MaxValue`). |
| `Http2Limits.KeepAlivePingTimeout` | Sets how long Kestrel waits for a ping response before closing; the documented default is 20 seconds. |
| `Http3Limits.MaxRequestHeaderFieldSize` | Limits a single HTTP/3 request header field; the documented default is 32,768 bytes. Larger values consume more memory per connection/stream. |
| IWebHostBuilder.UseQuic and QuicTransportOptions | This preview-marked API configures transport settings such as QUIC stream and buffer limits. |
| `QuicTransportOptions.MaxBidirectionalStreamCount` | Maximum concurrent bidirectional QUIC streams per connection; documented default 100. |
| `QuicTransportOptions.MaxUnidirectionalStreamCount` | Maximum inbound unidirectional QUIC streams per connection; documented default 10. |
| `QuicTransportOptions.MaxReadBufferSize` | QUIC maximum read buffer; documented default 1 MiB. |
| `QuicTransportOptions.MaxWriteBufferSize` | QUIC maximum write buffer; documented default 64 KiB. |
| `QuicTransportOptions.Backlog` | Maximum pending QUIC connection queue length; documented default 512. |
| `QuicTransportOptions.DefaultStreamErrorCode` | Default QUIC stream abort error code; use only when configuring lower-level transport behavior deliberately. |
| `QuicTransportOptions.DefaultCloseErrorCode` | Default QUIC connection close error code when disposing an open connection. |
| `KestrelServerLimits documented common defaults` | Current docs list 30,000,000-byte request body, 30-second request-header timeout, 130-second keep-alive timeout, null/unlimited connection caps, and finite header/buffer limits. Verify the exact target runtime and IIS/proxy interaction. |

The current security/reference pages document these common Kestrel defaults: request body 30,000,000 bytes; request line 8,192 bytes; total headers 32,768 bytes; header count 100; request buffer 1 MiB; response buffer 64 KiB; request-header timeout 30 seconds; keep-alive timeout 130 seconds; request and response minimum data rates 240 bytes/second after a 5-second grace period; and both connection-count caps as unlimited (`null`). These values are snapshots, not universal deployment recommendations. In HTTP/2 and HTTP/3, separate protocol limits apply. In out-of-process IIS hosting, IIS owns the body-size limit and Kestrel's corresponding limit is disabled.

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

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel?view=aspnetcore-11.0) · [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options?view=aspnetcore-11.0) · [Kestrel security considerations and limits](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations?view=aspnetcore-11.0) · [KestrelServerLimits API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.core.kestrelserverlimits?view=net-11.0) · [HTTPS options API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.https.httpsconnectionadapteroptions?view=net-11.0) · [HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3?view=aspnetcore-11.0)

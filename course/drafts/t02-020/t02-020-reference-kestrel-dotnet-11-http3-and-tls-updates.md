# Kestrel endpoints TLS reverse proxies and IIS integration — Reference: ASP.NET Core 11 Kestrel HTTP/3 TLS diagnostics and trailer limits

## Scope and version

ASP.NET Core 11 includes a set of Kestrel changes for HTTP/3 startup latency, TLS handshake visibility, ClientHello inspection, HTTP trailer timeouts, and TLS channel-binding access. These are targeted changes, not a redesign of endpoint security. ClientHello bytes and handshake exceptions can expose information useful for diagnostics or routing and should be handled with bounded work and safe logs. [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11) [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations)

## How this group fits the mental model

HTTP/3 uses QUIC streams and connection-level control frames; Kestrel can now begin request processing without waiting for the control stream's initial SETTINGS frame. TLS is a connection handshake below HTTP, so a failed handshake may happen before ordinary request middleware sees an `HttpContext`. Kestrel connection middleware and TLS features provide earlier diagnostic hooks. Channel binding exposes TLS connection material for protocols that need to bind authentication to a specific connection; it is not a general-purpose token or an application secret.

## Supplied names explained

| Supplied name | Purpose and boundary |
|---|---|
| `ASP.NET Core 11 Kestrel HTTP/3 early request processing` | Kestrel can begin HTTP/3 request processing before receiving the QUIC control stream and its SETTINGS frame, reducing first-request latency on new connections. |
| `Kestrel HTTP/3 processes requests before control stream SETTINGS` | Describes the implementation ordering change; it does not remove QUIC control streams or SETTINGS from HTTP/3. |
| `ASP.NET Core 11 ITlsHandshakeFeature.Exception` | The feature exposes the exception from a failed TLS handshake, or `null` if the handshake succeeded or has not completed. Kestrel preserves feature data after the underlying stream is disposed. |
| `ASP.NET Core 11 ListenOptions.UseTlsClientHelloListener` | Adds connection middleware that reads raw ClientHello bytes before TLS negotiation. Call it before `UseHttps`; bound its timeout and processing cost. |
| `ASP.NET Core 11 HttpsConnectionAdapterOptions.TlsClientHelloBytesCallback obsolete` | The earlier callback property is obsolete in .NET 11; migrate ClientHello inspection to `UseTlsClientHelloListener`. Do not teach the old property as the preferred current API. |
| `ASP.NET Core 11 RequestHeadersTimeout applies to HTTP/2 and HTTP/3 trailer headers` | Kestrel applies the request-header timeout to incomplete fragmented trailer HEADERS as well as initial headers, preventing a peer from leaving a header block unfinished indefinitely. |
| `ASP.NET Core 11 ITlsConnectionFeature.TryGetChannelBindingBytes` | Retrieves TLS channel-binding bytes for a requested binding kind when the server and TLS connection expose them. Treat the bytes as connection-bound security material, not a reusable credential. |
| `ASP.NET Core 11 ChannelBindingKind.Endpoint` | Requests the endpoint channel-binding type, derived from the TLS server endpoint certificate; use only in a protocol designed to validate channel binding. |
| `HTTP/3 HttpsConnectionAdapterOptions.HandshakeTimeout and OnAuthenticate are no-op` | The HTTP/3 Kestrel endpoint does not honor these `HttpsConnectionAdapterOptions` values; don't depend on them for QUIC handshakes. |
| `HTTP/3 UseHttps callback overloads throw` | The `UseHttps` overloads taking `ServerOptionsSelectionCallback` or `TlsHandshakeCallbackOptions` throw for HTTP/3. Check the current Kestrel HTTP/3 limitations before sharing endpoint TLS configuration. |

## Cross-item comparison

`UseTlsClientHelloListener` examines the ClientHello before the TLS handshake; `ITlsHandshakeFeature.Exception` explains a failure after the handshake attempt. They address different moments in connection setup. The deprecated `TlsClientHelloBytesCallback` is the older customization shape and should not be selected for new .NET 11 code. `RequestHeadersTimeout` governs incomplete HTTP header blocks (now including applicable trailers); `UseTlsClientHelloListener` has its own timeout, which is additive to TLS handshake timeouts. Keep each stage bounded.

## Examples

### Observe failed TLS handshakes

```csharp
using Microsoft.AspNetCore.Connections.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;

builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5001, listen =>
    {
        // Place connection middleware before UseHttps so handshake failures pass through it.
        listen.Use(next => async connection =>
        {
            try
            {
                await next(connection);
            }
            finally
            {
                var feature = connection.Features.Get<ITlsHandshakeFeature>();
                if (feature?.Exception is { } error)
                {
                    logger.LogDebug("TLS handshake failed: {ErrorType}", error.GetType().Name);
                }
            }
        });

        listen.UseTlsClientHelloListener((connection, clientHelloBytes) =>
        {
            // Inspect only what is needed; avoid logging raw ClientHello bytes.
        });
        listen.UseHttps();
    });
});
```

This fragment shows order and feature access; it needs a logger in the enclosing scope and a certificate configuration appropriate to the deployment. The client-hello listener must be registered before `UseHttps`. Avoid recording raw handshake data or exception text that could contain sensitive operational details.

### Apply a trailer-header timeout

`options.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(10);` sets a bounded request-header wait. In ASP.NET Core 11 this also protects against incomplete HTTP/2 and HTTP/3 trailer header blocks. Choose the value from real network conditions and request behavior; a timeout should control resource holding without dropping valid slow clients indiscriminately.

### Read a channel-binding value

The ASP.NET Core 11 release example obtains `ITlsConnectionFeature` from the current request's features and calls `TryGetChannelBindingBytes(ChannelBindingKind.Endpoint, out ReadOnlyMemory<byte> binding)`. Use it only when the authentication protocol has a defined channel-binding verification step. Do not serialize it to a client, persist it as a secret, or compare it across connections.

## Common mistakes

- Believing HTTP/3 no longer needs the control stream or SETTINGS; Kestrel changes when it starts processing requests, not the HTTP/3 protocol.
- Registering `UseTlsClientHelloListener` after `UseHttps`, when the TLS middleware already consumed the handshake.
- Logging the entire ClientHello or sensitive TLS exception details without filtering.
- Assuming failed TLS connections reach ordinary HTTP middleware; use connection-level middleware around `UseHttps`.
- Using the obsolete `TlsClientHelloBytesCallback` in new .NET 11 code.
- Treating channel-binding bytes as a bearer token or a value reusable on another connection.
- Assuming `RequestHeadersTimeout` only applies to initial request headers in ASP.NET Core 11; incomplete HTTP/2 and HTTP/3 trailer blocks are covered too.
- Ignoring additive timeouts: ClientHello inspection, TLS handshake, and header processing can each consume time.

## Knowledge checks with answers

1. **Does early HTTP/3 request processing remove the control stream?** No. It permits processing before initial control SETTINGS arrive.
2. **Where must ClientHello listener middleware be placed?** Before `UseHttps`, so it runs before the TLS handshake.
3. **Can an HTTP-level middleware always diagnose a failed TLS handshake?** No. The handshake can fail before an HTTP request exists; inspect the connection-level TLS handshake feature.
4. **Is endpoint channel binding reusable across connections?** No. It binds a protocol exchange to a TLS connection and must be used only in an appropriate authentication design.

## Sources

[.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0) · [Kestrel HTTP/3](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/http3?view=aspnetcore-11.0) · [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations?view=aspnetcore-11.0)

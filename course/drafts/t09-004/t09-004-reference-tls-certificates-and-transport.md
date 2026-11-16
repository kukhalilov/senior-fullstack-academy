# Kestrel reverse proxies TLS networking and load balancing — Reference: HTTPS certificates, TLS versions, SNI, mTLS, ALPN, and trust

Sources: [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations), [Kestrel endpoints](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0), [HTTPS adapter options](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.server.kestrel.https.httpsconnectionadapteroptions?view=aspnetcore-10.0), [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Scope and version

Target runtime: ASP.NET Core/.NET 11 GA, released November 10, 2026. TLS features also depend on OS cryptographic libraries, certificates, clients, and network path. The ASP.NET Core 11 release adds Kestrel ClientHello inspection middleware and TLS-handshake exception exposure; the prior callback is obsolete in favor of the new listener. Prefer operating-system TLS defaults unless a policy requires an explicit restriction.

## How this group fits the mental model

TLS protects and authenticates a particular connection between two peers. A public edge-to-proxy session and a proxy-to-Kestrel session are separate sessions if the edge terminates TLS. The component terminating a session needs the server private key and must validate client certificates when mTLS is required. Every certificate and forwarded identity must be trusted at the specific hop where it is used.

## Supplied names explained

### Certificates and certificate selection

- `Transport Layer Security (TLS)` — Protocol family providing encryption, integrity, and peer authentication for a connection. It does not secure a different later connection automatically.
- `TLS termination` — Decrypting and ending a TLS session at a proxy or server. If the proxy opens a new backend connection, that connection has its own protection and certificate validation.
- `TLS pass-through` — Proxying encrypted transport without decrypting the HTTP payload, often by routing using IP/port or SNI. The final server handles the TLS certificate and HTTP content; HTTP forwarded headers cannot be inserted into opaque TLS.
- `HTTPS endpoint` — HTTP listener protected by TLS. It needs a usable certificate/private key and appropriate protocol configuration.
- `X.509 server certificate` — Signed identity document presented by the server during TLS. Its subject alternative names must match the client’s requested host, and dates/usage/chain must validate.
- `Server Authentication EKU` — Extended Key Usage OID allowing a certificate to authenticate a TLS server. A certificate used only for another purpose is not automatically a valid server certificate.
- `Certificate private key` — Secret key corresponding to the public certificate key. The terminating process must be able to use it; restrict file/store permissions and never commit it to source control.
- `Certificate chain` — Path from leaf certificate through intermediate CA certificates to a trust anchor. Send the required intermediates and ensure clients trust the root; sending a root is generally unnecessary.
- `Certificate trust validation` — Validation of issuer signatures, chain, dates, name, usage, revocation policy, and trust anchor. Encryption without validating the peer can still connect to an impostor.
- `ServerCertificate` — Static X.509 certificate configured for Kestrel HTTPS. It must have the Server Authentication usage and an accessible private key.
- `ServerCertificateSelector` — Per-connection callback for choosing a server certificate, commonly by SNI host name. Return a certificate whose names and chain are valid for that client.
- `ServerCertificateChain` — Collection of certificates Kestrel presents as the server chain for trust validation. Keep it aligned with the selected leaf certificate and current intermediate chain.
- `SNI (Server Name Indication)` — TLS ClientHello extension carrying the requested server name, enabling a listener to select a certificate before HTTP Host is available.
- `Dynamic certificate selection` — Selecting a certificate at connection time based on SNI or other configured connection context. Cache/look up certificates safely and ensure unknown hosts have an intentional rejection/default behavior.

### Client certificates, protocol versions, and ALPN

- `Mutual TLS (mTLS)` — TLS arrangement where the client also presents a certificate and the server validates it. It authenticates a connection identity; application authorization still decides what that identity may do.
- `Client certificate validation` — Chain and policy checks for the peer’s presented certificate, including allowed issuer/identity, validity, and any revocation policy. Accepting any certificate defeats client authentication.
- `Client certificate forwarding` — Passing client-certificate identity from a TLS terminator to a backend, often through a protected integration/header. The proxy must remove client-supplied forged copies and the backend must accept such metadata only from the trusted proxy.
- `ClientCertificateMode.NoCertificate` — Default mode that does not request a client certificate during the TLS handshake.
- `ClientCertificateMode.AllowCertificate` — Requests a certificate but permits a connection without one. Apps must distinguish absent from present-but-invalid/untrusted according to configured validation.
- `ClientCertificateMode.RequireCertificate` — Requires the client to present an acceptable certificate; clients without one fail the TLS handshake.
- `ClientCertificateMode.DelayCertificate` — Defers client certificate request until later authentication where the protocol/platform supports post-handshake certificate acquisition. Verify HTTP version and client interoperability before choosing it.
- `ClientCertificateValidation callback` — Custom callback for deciding whether a presented client certificate is acceptable. It replaces/extends default validation logic; preserve chain, name, revocation, and policy checks intentionally.
- `AllowAnyClientCertificate` — Convenience API that accepts every client certificate without validation. Development/testing only; never use as a production mTLS configuration.
- `TLS 1.2` — Supported modern TLS version used by many clients and protocol combinations. HTTP/2 over TLS requires TLS 1.2 or later under the documented Kestrel constraints.
- `TLS 1.3` — Newer TLS version with a streamlined handshake and required for HTTP/3’s TLS-over-QUIC. OS and certificate/client capabilities still constrain negotiation.
- `SslProtocols` — .NET flags controlling allowed TLS protocol versions on HTTPS options. `None` defers to OS defaults; explicit restrictions can age poorly if protocols change, so use policy and platform support.
- `Application-Layer Protocol Negotiation (ALPN)` — TLS extension used to negotiate an application protocol such as HTTP/2 (`h2`) or HTTP/1.1. It is not the mechanism that chooses a YARP route.
- `HTTP/2 over TLS` — HTTP/2 running on TLS-protected TCP, normally selected through ALPN. Protocol and TLS cipher restrictions must meet HTTP/2 requirements.
- `QUIC` — Secure transport used by HTTP/3 over UDP. It integrates TLS 1.3 and supports independent streams; MsQuic and network support are required.

### Rotation, timeouts, and .NET 11 TLS observation

- `Certificate file change reload` — Kestrel can monitor configured certificate files and reload when they change. Deploy replacement files atomically where possible, monitor reload logs, and validate a fresh handshake; existing TLS sessions keep their negotiated state.
- `Certificate rotation` — Replacing an expiring/compromised certificate and private key while keeping valid service. Plan overlap, chain/name correctness, secret distribution, reload/restart, and client trust before the old certificate expires.
- `HSTS` — HTTP response policy telling browsers to use HTTPS for a domain for a configured period. Enable only when HTTPS works across the domain/subdomains covered; HSTS does not encrypt or redirect the initial non-HTTPS request itself.
- `HTTP-to-HTTPS redirect` — Application or edge response directing a client from HTTP to HTTPS. Behind a TLS-terminating proxy, restore trusted original scheme before redirect logic or the app may loop.
- `TLS handshake timeout` — Maximum time allowed to complete TLS negotiation before closing a connection. It bounds unauthenticated connection resource use and is distinct from an HTTP request timeout.
- `ClientHello timeout` — Time allowed for Kestrel’s ClientHello inspection listener to receive enough bytes for inspection. In .NET 11 this timeout is additive to the TLS handshake timeout, so bound the total connection setup time.
- `Cipher-suite policy` — Platform/server policy determining permitted cryptographic algorithms for TLS. Prefer maintained OS defaults; an app should not enable obsolete suites merely to make an old client connect.
- `Certificate revocation checking` — Checking revocation status by CRL/OCSP where configured. It can add latency and fail when revocation endpoints are unreachable; decide based on threat model and operational availability.
- `TLS termination at edge proxy versus Kestrel` — Edge termination centralizes public certificates and inspection but creates a separate backend security hop and forwarded-context trust. Kestrel termination preserves app ownership of TLS/client certificates but requires direct certificate lifecycle and edge controls.
- `CheckCertificateRevocation` — HTTPS option controlling certificate revocation checking during client-certificate validation. It is not enabled by default in the cited Kestrel guidance; enabling it can make handshake success depend on CRL/OCSP availability.
- `HandshakeTimeout` — HTTPS option bounding TLS handshake completion (documented default 10 seconds in the current Kestrel security page). It protects pre-HTTP resources; coordinate it with ClientHello listener timeout.
- `AllowAlternateSchemes` — Kestrel parsing option controlling whether HTTP/2/3 `:scheme` can differ from the connection’s transport scheme. Keep the default false unless a trusted proxy topology needs a different scheme on the backend hop.
- `AllowHostHeaderOverride` — Kestrel control for accepting HTTP/1.1 Host values that override the host implied by the request target. Keep restrictive behavior unless a known proxy/client protocol requires otherwise; validate hosts at the edge and app.
- `AllowSynchronousIO` — Kestrel setting controlling synchronous request/response body I/O. It is disabled by default to avoid blocking thread-pool threads; use asynchronous APIs rather than enabling it to mask sync-over-async performance problems.
- `ListenOptions.UseTlsClientHelloListener` — .NET 11 connection middleware that inspects raw TLS ClientHello bytes before TLS handshake processing. Register before `UseHttps`; use only for a real protocol-routing/inspection need and cap its timeout.
- `TlsClientHelloBytesCallback (obsolete in .NET 11)` — Earlier callback property for reading ClientHello bytes through HTTPS callback options. In .NET 11 it is obsolete; use `ListenOptions.UseTlsClientHelloListener` for the new connection-middleware model.
- `ITlsHandshakeFeature.Exception` — .NET 11 connection feature exposing the exception from a failed TLS handshake, or null if successful/not completed. Read it in connection middleware that wraps `UseHttps`, registered before it, so failed handshakes can be logged with useful context.
- `DisableCertificateFileWatching AppContext switch` — `Microsoft.AspNetCore.Server.Kestrel.DisableCertificateFileWatching` switch that disables automatic certificate-file monitoring/reload. Use when file watching is unsuitable, and provide a deliberate rotation/restart process instead.
- `Kestrel HTTP/3 early request processing` — .NET 11 change allowing requests on a new QUIC connection to be processed without first waiting for the control stream’s initial SETTINGS frame. It reduces first-request latency but does not change HTTP/3 enablement or platform requirements.

## Cross-item comparison

| Design | Certificate owner | What backend sees | Main operational responsibility |
|---|---|---|---|
| TLS terminates at Kestrel | App host | Client’s decrypted HTTP request | Kestrel certificates, mTLS and TLS policy |
| TLS terminates at edge | Edge proxy | New backend request/connection | Secure backend hop and trusted forwarded context |
| TLS pass-through | Final TLS server | Original encrypted session after transport routing | Backend TLS; proxy cannot inspect HTTP or add HTTP headers |
| mTLS | TLS terminator | Validated client cert at terminator | Certificate identity mapping and authorization |

## Examples

For SNI, configure a certificate selector keyed by exact allowed host names; return no certificate or reject an unknown name instead of silently returning an unrelated certificate. For backend HTTPS, validate the backend’s chain and hostname using the normal handler trust policy. Do not use an “accept any certificate” callback to get past a staging certificate error.

To use the .NET 11 ClientHello listener, register the listener before HTTPS handling and keep its inspection timeout short enough that its additive delay plus `HandshakeTimeout` meets the connection deadline. If you only need normal SNI certificate selection, the certificate selector is simpler and usually preferable.

## Common mistakes

- Treating TLS termination at a proxy as encryption all the way to Kestrel.
- Sharing server private keys with every application when only the edge needs them.
- Accepting client certificates without validating issuer, identity, or policy.
- Trusting a forwarded certificate header that clients can send directly.
- Disabling revocation or trusting all certificates to bypass an infrastructure issue without a risk decision.
- Confusing ALPN with HTTP routing or HTTP/3 QUIC transport.
- Registering ClientHello middleware after `UseHttps`, so failed handshakes never reach it.
- Forgetting the ClientHello and TLS handshake timeouts add together.
- Depending on automatic certificate reload without verifying fresh handshakes and logs.
- Leaving HSTS enabled after moving to a host that does not correctly serve HTTPS.

## Knowledge checks with answers

1. **Where must a server private key be accessible?** At the component terminating that TLS connection, with tightly restricted access.
2. **Can a TLS pass-through proxy add `X-Forwarded-Proto`?** No; it cannot see or modify encrypted HTTP headers.
3. **Why does mTLS not replace application authorization?** It proves a certificate identity at the TLS boundary; it does not decide that identity’s allowed application actions.
4. **Which .NET 11 feature replaces the obsolete ClientHello callback?** `ListenOptions.UseTlsClientHelloListener`, registered before `UseHttps`.
5. **Why keep ALPN/protocol defaults aligned with clients?** An endpoint must negotiate a mutually supported protocol; incorrect TLS/protocol settings can make valid clients fail before HTTP routing.

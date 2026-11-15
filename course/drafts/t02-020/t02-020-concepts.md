# Kestrel endpoints TLS reverse proxies and IIS integration — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to trace a request from the public connection to ASP.NET Core middleware, select a hosting model, explain what forwarded headers can and cannot prove, and set transport/server limits without confusing them with application quotas. You should also recognize the .NET 8 and .NET 10 forwarded-header security changes.

## Prerequisites

Know what an HTTP request and response are, what TLS encrypts, and how middleware runs in an ASP.NET Core request pipeline. A reverse proxy accepts a request and forwards it to another server. A listening endpoint is an address/port and protocol configuration on which a server accepts connections.

## Core concepts

### Public edge and application server are different roles

Kestrel is the ASP.NET Core cross-platform web server. It can accept public connections itself or listen privately behind a proxy. A proxy may terminate TLS, rewrite the path, select a backend, and add headers describing the original request. The app must reconstruct those facts only from trusted peers. If Kestrel is reachable directly from the Internet, arbitrary clients can supply similarly named headers; enabling processing without a trust boundary converts attacker-controlled text into scheme, host, or IP facts used by redirects, authentication, and logging.

### TLS can terminate at different hops

With end-to-end TLS, the connection to Kestrel is HTTPS and Kestrel needs an appropriate certificate. With TLS offload, the public client-to-proxy hop is HTTPS while the proxy-to-app hop may be HTTP or separately encrypted HTTPS. `Request.IsHttps` reflects the app's current reconstructed request scheme, not an oracle about every network hop. A trusted `X-Forwarded-Proto` lets middleware restore the external scheme. The internal hop should still be protected by network isolation or TLS when its threat model requires it.

### Server limits are resource guards, not product quotas

Kestrel's limits constrain connections, request bodies, keep-alive duration, header wait, and minimum data rates. They do not cap total business operations across replicas, enforce user quotas, or replace reverse-proxy limits. A body limit can be set globally, per endpoint, or dynamically before reading starts, but only one layer's acceptance is not enough if upstream layers have smaller caps. Connection and upgraded-connection limits are separate because WebSockets and other upgrades hold different resources. Verify actual defaults against the target framework and protocol rather than hardcoding remembered values.

### Forwarded headers have a chain and a trust rule

The standard headers describe original client IP (`X-Forwarded-For`), host, scheme, and path prefix. Each proxy may append a value. Middleware consumes the chain right-to-left, matching the immediate peer against `KnownProxies` or `KnownIPNetworks` and stopping at `ForwardLimit`. `AllowedHosts` restricts forwarded host values and complements host filtering. In .NET 8.0.17/9.0.6, unknown proxies stopped being trusted by default. In .NET 10, `KnownNetworks` became obsolete in favor of `KnownIPNetworks` using `System.Net.IPNetwork`. The environment shortcut `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` enables processing with cloud-oriented settings but does not create a proxy allowlist; do not confuse “headers are processed” with “their sender is trusted.”

### Middleware ordering changes behavior

Run forwarded-header processing before middleware that needs the public scheme, host, path base, or client address. That normally means early in the pipeline, before HTTPS redirection/HSTS, authentication, link generation, rate-limit keys based on remote IP, and redirects. If it runs after `UseHttpsRedirection`, TLS-offloaded traffic can appear HTTP and loop. If it runs after auth, generated absolute URLs or callback URI checks may use internal values. Trust policy and ordering must be tested together.

### IIS hosting model determines the server process

ANCM integrates IIS with ASP.NET Core. In-process hosting uses `IISHttpServer` inside `w3wp.exe`; Kestrel is not used. Out-of-process hosting starts a separate ASP.NET Core process and ANCM reverse-proxies to its Kestrel server. `AspNetCoreHostingModel` selects the model. The Hosting Bundle installs the module and runtime integration needed on the IIS machine. Each model changes process boundaries, request limits, startup behavior, diagnostics, and shutdown behavior. Do not debug an in-process app as if ANCM were proxying it to Kestrel.

## Mechanisms and relationships

1. A client connects to an edge endpoint.
2. TLS is negotiated at the selected edge; HTTP version support is constrained by both protocol and platform/network.
3. A proxy forwards the request to Kestrel or ANCM/IIS and may append forwarding metadata.
4. The server accepts the request under its listener, protocol, and limits.
5. Trusted forwarded-header middleware updates request scheme/host/address/path base.
6. Remaining middleware, authentication, and endpoint logic operate on the reconstructed request.
7. Limits at proxy, server, IIS, and application layers compose; the tightest applicable limit can reject first.

HTTP/2 generally requires TLS for browser-facing negotiation through ALPN. HTTP/3 uses QUIC over UDP and requires HTTPS plus platform/runtime support; many networks block or proxy it differently. Configure HTTP/3 alongside HTTP/1.1 and HTTP/2 for fallback when appropriate. HTTP/3 availability is not guaranteed merely because `HttpProtocols.Http3` compiles.

In ASP.NET Core 11, Kestrel starts processing an HTTP/3 request before the control stream's initial SETTINGS frame arrives, reducing first-request latency on a new connection. The protocol control stream still exists. The release also makes failed TLS handshakes observable through `ITlsHandshakeFeature.Exception`, replaces the prior ClientHello callback shape with connection middleware, and applies `RequestHeadersTimeout` to incomplete HTTP/2 and HTTP/3 trailer headers. These changes improve startup and diagnostics while retaining the same need for secure TLS configuration, bounded parsing, and deployment-level testing. [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Worked examples

### TLS offload and redirect loop

The edge receives HTTPS and forwards HTTP, but the app redirects every HTTP request to HTTPS. Without trusted scheme forwarding, each internal request looks HTTP and redirects again. Configure a known proxy, enable `X-Forwarded-Proto`, and call forwarded-header middleware before redirection. Test that direct untrusted requests cannot spoof the scheme.

### Body limit mismatch

The app permits a 50 MB upload but the proxy permits 10 MB. The upload fails at the proxy before `IHttpMaxRequestBodySizeFeature` can matter. Either lower the app's contract to match the edge or deliberately raise the edge limit and validate the app's memory/streaming behavior. Set per-request Kestrel body limits before reading begins; `IsReadOnly` indicates when it is too late to change the limit.

### IIS model diagnosis

If the app is in-process, inspect IIS/ANCM and `w3wp` behavior; changing Kestrel listener configuration will not expose an in-process endpoint. If it is out-of-process, inspect ANCM startup and the child `dotnet` process/Kestrel endpoint. A 500.30 indicates in-process start failure; a 502.5 commonly indicates the out-of-process backend failed to launch or listen.

## Misconceptions and edge cases

- `ASPNETCORE_FORWARDEDHEADERS_ENABLED` does not configure a specific proxy allowlist.
- Clearing known-proxy lists accepts headers from any peer; it is only defensible if network controls independently prevent untrusted peers from reaching the app.
- `KnownNetworks` is obsolete beginning with ASP.NET Core 10; use `KnownIPNetworks` and `System.Net.IPNetwork` in current code.
- IIS in-process hosting does not use Kestrel; out-of-process IIS hosting does.
- Kestrel's connection limits are not per-user rate limits. `MaxConcurrentConnections` does not count upgraded connections; use the separate upgraded limit where relevant.
- A request-size limit must be established before body reading starts. Once the feature is read-only, changing it is too late.
- HTTP/3 requires UDP/QUIC and compatible platform support. Keep HTTP/1.1/2 available when the path may not support it.
- IIS, Kestrel, proxy, and application limits are separate. A successful setting at one layer does not override a smaller limit elsewhere.
- Forwarded host values influence redirects and generated links. Restrict host trust with `AllowedHosts` and appropriate host filtering.
- Development certificates are not production certificate management. Protect private keys, plan renewal/rotation, and avoid trusting dev certs from external clients.

## Knowledge checks with answers

1. **A Linux proxy forwards HTTPS traffic as HTTP. Why might the app redirect forever?** The app sees the internal HTTP scheme. Process trusted `X-Forwarded-Proto` before HTTPS redirection.
2. **Does adding a Redis/network-style CIDR to `KnownIPNetworks` mean all clients in that range are trusted proxies?** Yes; only include a narrow network containing controlled forwarding peers, not a broad client network.
3. **Does changing Kestrel `MaxRequestBodySize` raise a smaller proxy body cap?** No. Every upstream layer must permit the intended body size.
4. **Which IIS hosting mode uses Kestrel?** Out-of-process. In-process uses `IISHttpServer` in the IIS worker process.
5. **Does HTTP/3 require only an HTTPS certificate?** No; HTTP/3 uses QUIC/UDP and depends on platform support and network reachability.

## Sources

[Kestrel](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel) · [Kestrel options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/options) · [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) · [Unknown proxy breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies) · [KnownIPNetworks breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/ipnetwork-knownnetworks-obsolete) · [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

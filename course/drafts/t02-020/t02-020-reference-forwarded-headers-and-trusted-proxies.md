# Kestrel endpoints TLS reverse proxies and IIS integration — Reference: forwarded scheme host address proxy allowlists and middleware ordering

## Scope and version

Forwarded headers let an ASP.NET Core app recover request properties that a proxy observed before forwarding: original client address, host, scheme, and path prefix. They are security-sensitive input and must be accepted only from configured trusted proxies. In ASP.NET Core 8.0.17 and 9.0.6, unknown proxies are no longer trusted by default. ASP.NET Core 10 obsoletes `KnownNetworks` in favor of `KnownIPNetworks` and `System.Net.IPNetwork`. [Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) [Unknown proxy change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies) [KnownIPNetworks change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/ipnetwork-knownnetworks-obsolete)

## How this group fits the mental model

The TCP peer that connects to Kestrel is normally the proxy, not the original browser. The proxy writes forwarding headers, and middleware translates selected values into `HttpContext.Connection.RemoteIpAddress`, `Request.Host`, `Request.Scheme`, and `Request.PathBase`. Only the immediate trusted peer may be allowed to make those claims. In a chain, configure how many trusted hops to consume and verify the ordering at each deployment layer.

## Supplied names explained

| Supplied name | Purpose and behavior |
|---|---|
| `ForwardedHeadersMiddleware` | Reads configured forwarding headers from a trusted peer and updates the current request properties. |
| `ForwardedHeadersOptions` | Configuration for which headers to process, trusted peers, hop limits, and header names. |
| `ForwardedHeadersOptions.ForwardedHeaders` | Flags selecting which forwarded values are processed; defaults to none, so enable only needed fields. |
| `ForwardedHeadersOptions.ForwardLimit` | Maximum number of proxy entries consumed; default is one. `null` removes the cap and should only be used with trusted-proxy restrictions. |
| `ForwardedHeadersOptions.KnownProxies` | Exact IP allowlist for proxy peers whose forwarding headers may be trusted. |
| `ForwardedHeadersOptions.KnownNetworks (obsolete starting ASP.NET Core 10)` | Older CIDR-network allowlist property; migrate to `KnownIPNetworks`. |
| `ForwardedHeadersOptions.AllowedHosts` | Restricts host values accepted from forwarded host headers; also configure host filtering for unforwarded host input where appropriate. |
| `ForwardedHeadersOptions.ForwardedForHeaderName` | Changes the header name used for forwarded client IP, defaulting to `X-Forwarded-For`. |
| `ForwardedHeadersOptions.ForwardedHostHeaderName` | Changes the forwarded host header name, normally `X-Forwarded-Host`. |
| `ForwardedHeadersOptions.ForwardedProtoHeaderName` | Changes the forwarded scheme header name, normally `X-Forwarded-Proto`. |
| `ForwardedHeadersOptions.ForwardedPrefixHeaderName` | Changes the forwarded path-prefix header name, normally `X-Forwarded-Prefix`. |
| `ForwardedHeadersOptions.KnownIPNetworks` | Current CIDR allowlist using `System.Net.IPNetwork` for trusted forwarding peers. |
| `ForwardedHeadersOptions.OriginalForHeaderName` | Names the header where the prior remote IP value is preserved after processing. |
| `ForwardedHeadersOptions.OriginalHostHeaderName` | Names the header where the prior host is preserved. |
| `ForwardedHeadersOptions.OriginalProtoHeaderName` | Names the header where the prior scheme is preserved. |
| `ForwardedHeadersOptions.OriginalPrefixHeaderName` | Names the header where the prior path base is preserved. |
| `ForwardedHeadersOptions.RequireHeaderSymmetry` | Requires configured forwarded header collections to have matching entry counts; useful for rejecting malformed proxy chains. |
| `ForwardedHeaders.XForwardedFor` | Processes forwarded client IP information. |
| `ForwardedHeaders.XForwardedHost` | Processes forwarded public host information. Validate the accepted host to prevent poisoned redirects/links. |
| `ForwardedHeaders.XForwardedProto` | Processes forwarded scheme, such as `https`, needed when TLS terminates at a proxy. |
| `ForwardedHeaders.XForwardedPrefix` | Processes a proxy's path prefix so the app can reconstruct its public base path. |
| `ForwardedHeadersDefaults` | Supplies conventional default header names for the middleware. |
| `ForwardedHeadersDefaults.XForwardedForHeaderName` | Conventional name `X-Forwarded-For`. |
| `ForwardedHeadersDefaults.XForwardedHostHeaderName` | Conventional name `X-Forwarded-Host`. |
| `ForwardedHeadersDefaults.XForwardedProtoHeaderName` | Conventional name `X-Forwarded-Proto`. |
| `ForwardedHeadersDefaults.XForwardedPrefixHeaderName` | Conventional name `X-Forwarded-Prefix`. |
| `IApplicationBuilder.UseForwardedHeaders` | Adds forwarded-header middleware to the classic application builder pipeline. |
| `WebApplication.UseForwardedHeaders` | Adds the middleware to a modern `WebApplication` pipeline. |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | Environment switch enabling a cloud-oriented forwarded-header setup; it does not configure a proxy allowlist and should not be mistaken for a complete trust policy. |
| `Known proxy IP allowlist` | Restricts which immediate peers can assert forwarding metadata. Use actual proxy addresses, not client subnets. |
| `KnownIPNetworks allowlist using System.Net.IPNetwork CIDR` | Current way to trust a verified narrow proxy network, expressed as CIDR. |
| `Forwarded headers are untrusted unless sent by a known proxy` | The core trust rule that prevents a remote client from spoofing its IP, scheme, or host via headers. |
| `Forwarded header processing order and ForwardLimit` | Header values are consumed right-to-left, starting at the immediate peer; the limit controls processed hops. |
| `Forwarded headers middleware before HTTPS redirection and HSTS` | Ensures TLS-offloaded public HTTPS is recognized before redirect/security middleware makes decisions. |
| `Forwarded headers middleware before authentication and link generation` | Lets auth callbacks, redirects, absolute URLs, and origin-sensitive logic see public request values. |
| `Host header trust and AllowedHosts configuration` | Restricts which hostnames may influence request routing and generated URLs. |
| `Forwarded X-Forwarded-Host and host spoofing` | A malicious host can poison links or redirect targets if accepted from an untrusted source. |
| `Forwarded X-Forwarded-Proto and HTTPS redirect loops` | An app that sees internal HTTP may repeatedly redirect unless it trusts the proxy's external HTTPS scheme. |
| `Proxy chain and right-to-left forwarded header parsing` | Each proxy appends an entry; process the nearest peer first and only the configured trusted chain. |
| `IPv4-mapped IPv6 proxy addresses` | A dual-mode socket may expose an IPv4 peer in IPv4-mapped IPv6 form; compare against the address form actually reported by the connection. |
| `IIS integration configures forwarded headers automatically` | IIS Integration handles forwarded scheme/address/path information for IIS hosting; this is not automatically configured for arbitrary Linux proxies. |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED does not configure a proxy allowlist` | The switch can enable processing without enumerating trusted peers; network isolation must still prevent spoofed requests. |
| `Forwarded headers security advisory and trust boundary` | Improper host/proxy trust can enable spoofed IP policy decisions, poisoned URLs, or authentication/redirect confusion. |
| `Path base forwarding and PathBase request reconstruction` | `X-Forwarded-Prefix` can restore a public path prefix removed by a proxy. |
| `Reverse proxy TLS offload and original scheme reconstruction` | Configure trusted `X-Forwarded-Proto` processing so downstream app code sees the client's original HTTPS scheme. |

## Cross-item comparison

`KnownProxies` trusts exact peers; `KnownIPNetworks` trusts every peer in a configured CIDR. Choose the narrowest verified rule that matches the proxy topology. `ForwardLimit` controls chain depth but is not a substitute for a trusted-peer allowlist. `AllowedHosts` constrains forwarded host names; it does not make an untrusted proxy trusted. `X-Forwarded-Proto` restores scheme, while `X-Forwarded-For` restores client address; applications often need both, but should enable only what they use.

## Examples

```csharp
using System.Net;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor |
                               ForwardedHeaders.XForwardedProto |
                               ForwardedHeaders.XForwardedHost;
    options.KnownProxies.Add(IPAddress.Parse("10.20.0.5"));
    options.AllowedHosts.Add("app.example.com");
});

var app = builder.Build();
app.UseForwardedHeaders(); // before redirects, HSTS, authentication, and URL generation
app.UseHttpsRedirection();
app.UseHsts();
app.MapGet("/", (HttpContext context) => new
{
    context.Request.Scheme,
    Host = context.Request.Host.Value,
    Client = context.Connection.RemoteIpAddress?.ToString()
});
app.Run();
```

The example is only safe when `10.20.0.5` is the actual peer and direct untrusted access to the app is blocked or separately handled. For a verified CIDR in current ASP.NET Core, add a `System.Net.IPNetwork` to `KnownIPNetworks`. Do not clear the known-proxy collections merely to make headers start working.

## Common mistakes

- Enabling forwarding globally while leaving Kestrel directly reachable by arbitrary clients.
- Setting `ForwardLimit = null` without exact proxy/network trust.
- Trusting a large subnet that also contains user-controlled hosts.
- Processing forwarded headers after redirects, HSTS, authentication, or link generation.
- Assuming `AllowedHosts` or CORS authenticates the sender of forwarding headers.
- Copying `KnownNetworks` in ASP.NET Core 10+ code instead of `KnownIPNetworks`.
- Assuming the environment variable creates an allowlist; it does not.
- Ignoring IPv4-mapped IPv6 when the known-proxy entry does not match the peer representation.
- Forwarding a host header without restricting acceptable public hosts.

## Knowledge checks with answers

1. **Who should be listed in `KnownProxies`?** The immediate, controlled proxy peers that connect to the app, not end-user client networks.
2. **Why run the middleware before HTTPS redirection?** So the app sees the trusted external HTTPS scheme and does not redirect based on the internal HTTP hop.
3. **What replaces `KnownNetworks` in ASP.NET Core 10?** `KnownIPNetworks`, using `System.Net.IPNetwork`.
4. **Does enabling the environment switch make headers trustworthy?** No. The deployment still needs a restricted network/trust boundary.

## Sources

[Proxy and load balancer](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer) · [Unknown proxy change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies) · [KnownIPNetworks change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/ipnetwork-knownnetworks-obsolete)

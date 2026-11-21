# Kestrel reverse proxies TLS networking and load balancing — Reference: Proxy topologies, trusted forwarding, middleware order, and host protection

Sources: [ASP.NET Core proxy and load-balancer guidance](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0), [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations), [forwarded-header security change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/8/forwarded-headers-unknown-proxies?view=aspnetcore-10.0), [Kestrel endpoints](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0), and [ASP.NET Core 11 support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Scope and version

This lesson covers ASP.NET Core proxy context and trust boundaries for current .NET 11 GA. Servicing changes beginning with ASP.NET Core 8.0.17 and 9.0.6 ignore forwarded headers from unconfigured proxies by default; .NET 10 also obsoleted `KnownNetworks` in favor of `System.Net.IPNetwork` and `KnownIPNetworks`. Explicitly trust expected proxies/networks. Exact defaults and compatibility depend on target runtime and hosting integration, so verify effective configuration at deployment.

## How this group fits the mental model

A backend sees the proxy as its TCP peer. Forwarded metadata is a claim from that peer describing an earlier hop. Trust must be based on the peer network and a bounded hop count, with the proxy sanitizing client-supplied values. Middleware order matters because security, redirects, URLs, authentication, logs, and rate limiting may depend on restored context.

## Supplied names explained

### Proxy roles and connection topology

- `Reverse proxy` — Accepts a client-facing request and sends a separate request to an upstream application. It may terminate TLS, route, filter, authenticate, or balance traffic.
- `Forward proxy` — Represents clients making outbound requests to external servers, typically enforcing client egress policy. It is not the same role as an application reverse proxy.
- `Edge proxy` — Proxy at the network perimeter that first accepts public traffic and commonly owns TLS, host filtering, WAF, or rate controls.
- `Upstream proxy` — Ambiguous term: often a proxy closer to the destination or a parent proxy used by another proxy. Document direction explicitly because “upstream” is perspective-dependent.
- `Backend server` — Service receiving a proxied request. It sees a proxy connection unless the topology uses transparent/pass-through transport.
- `TLS-terminating reverse proxy` — Reverse proxy that decrypts client TLS and forwards an HTTP request over a new connection. Forwarded scheme/client information then requires a trusted contract.
- `TCP/TLS pass-through proxy` — Routes an encrypted transport stream without decrypting HTTP. It cannot read HTTP paths, add `X-Forwarded-*`, or apply HTTP-level transforms.
- `Proxy hop` — One proxy-to-next-component step in a chain. A request may cross several trusted/untrusted hops; configure an exact forwarding limit and sanitization behavior.
- `Backend HTTP over private network` — Plain HTTP on an isolated internal network after edge TLS termination. Private addressing reduces exposure but is not encryption; use backend TLS/tunnel where network threats or compliance require it.
- `Proxy TLS offload` — Edge decrypts client TLS to centralize certificates and computation. If the next hop is HTTP, assess that link separately and restore the original HTTPS scheme safely.
- `Load balancer versus reverse proxy` — A load balancer distributes traffic among instances; a reverse proxy accepts and forwards application-layer requests. Modern systems often perform both, but the roles have different protocol and policy scopes.

### Forwarded headers and trust controls

- `Forwarded Headers Middleware` — ASP.NET Core middleware that interprets configured forwarded headers and updates request connection/scheme/host context. Enable and configure it only for a known proxy topology.
- `ForwardedHeadersOptions` — Options object specifying which header families are processed, trusted proxies/networks, hop limit, and symmetry checks. Configure explicit trust rather than disabling restrictions globally.
- `ForwardedHeaders.XForwardedFor` — Enum flag enabling the `X-Forwarded-For` chain to restore client IP information. The values are untrusted unless appended/sanitized by trusted hops.
- `ForwardedHeaders.XForwardedProto` — Flag enabling original scheme restoration from `X-Forwarded-Proto`, commonly needed after TLS termination for HTTPS redirects and secure URL generation.
- `ForwardedHeaders.XForwardedHost` — Flag enabling restoration of the original host from the proxy header. Validate allowed hosts after processing to prevent host-header abuse.
- `ForwardedHeaders.XForwardedPrefix` — Flag enabling restoration of a path prefix removed by a proxy. Ensure the proxy and app agree on whether the prefix is present in the forwarded request path.
- `X-Forwarded-For` — Common header carrying one or more client/proxy IP addresses. Parse only the trusted rightmost chain according to configured peers and `ForwardLimit`; do not accept arbitrary values for authorization.
- `X-Forwarded-Proto` — Header describing the original external scheme (`http` or `https`). A client can forge it on a direct connection, so only trust values from configured proxies.
- `X-Forwarded-Host` — Header describing the original public host. Treat as input from a proxy and restrict it to intended host names.
- `X-Forwarded-Prefix` — Header describing an external path prefix removed before forwarding. Misconfiguration causes broken route generation or incorrect redirects.
- `X-Original-For` — Middleware-maintained header containing the pre-forwarded remote address when configured behavior preserves it. It is diagnostic context, not a signed identity token.
- `X-Original-Proto` — Header representing the original scheme before middleware applies forwarded values. Protect and interpret it according to the same trusted-proxy boundary.
- `X-Original-Host` — Header preserving the original host context before forwarded processing. Do not treat it as trustworthy if arbitrary clients can reach the backend.
- `X-Original-Prefix` — Header preserving the original path-base context before prefix transformation. Keep the proxy rewrite and app base-path contract consistent.
- `KnownProxies` — Explicit trusted proxy IP addresses in forwarded-header options. The secure default includes loopback rather than arbitrary network peers; add only actual proxy addresses.
- `KnownIPNetworks` — Trusted proxy IP ranges using `System.Net.IPNetwork`. This is the current API; `KnownNetworks` and the ASP.NET Core-specific `IPNetwork` became obsolete in .NET 10. Use the smallest stable range matching actual proxy egress. [Breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/10/ipnetwork-knownnetworks-obsolete?view=aspnetcore-10.0)
- `ForwardLimit` — Maximum number of forwarded values/hops middleware processes. Set it to the actual trusted proxy chain length; an unlimited/incorrect limit can let attacker-controlled entries influence identity.
- `AllowedHosts` — Host filtering configuration restricting accepted host names. Use explicit production domains; forwarded host processing does not replace host validation.
- `RequireHeaderSymmetry` — Option requiring related forwarded-header families to have corresponding value counts. It can reject malformed/inconsistent proxy chains; configure with the proxy’s actual header format.
- `ForwardedHeaders.None default` — The enum’s zero/default value processes no forwarded-header families. Middleware registration alone should not be mistaken for enabling every forwarded header.
- `Trusted proxy boundary` — Network and configuration rule defining which component may assert forwarded client context. Enforce it with restricted backend reachability, proxy header sanitization, known IPs/networks, and bounded hops.
- `Forwarded header spoofing` — Attacker supplies fake `X-Forwarded-*` values that an app uses as identity/scheme/host. Prevent by rejecting untrusted peers and having each trusted proxy remove or overwrite inbound values.
- `ASPNETCORE_FORWARDEDHEADERS_ENABLED` — Environment switch that enables forwarded-header handling for hosting integrations in supported configurations. When set to true, the framework’s documented behavior clears proxy restrictions; inspect environments and do not use it as a shortcut at an edge that receives direct client traffic.
- `DOTNET_FORWARDEDHEADERS_ENABLED` — Newer environment-variable name for enabling the same hosting behavior. It can be equally broad; pair it with a topology where only trusted proxies can connect or configure explicit restricted handling.
- `ForwardedHeaders_Enabled configuration key` — Configuration-key form of the environment enablement setting. Configuration binding uses underscore-to-colon conventions; understand its broad trust effect before enabling.
- `Forwarded header trust reset by environment configuration` — Enabling forwarded headers through the documented compatibility switch clears `KnownProxies` and `KnownIPNetworks`, effectively trusting every upstream peer. This is more permissive than API defaults and unsafe on a listener directly reachable by clients.

### Middleware and host validation

- `UseForwardedHeaders middleware ordering` — Register early, before code relying on client IP, host, path base, or scheme. It must run before HTTPS redirection, HSTS decisions, URL generation, auth policies, logging, and IP rate limits that need the public context.
- `Forwarded headers before HTTPS redirection` — If TLS ends at the proxy, the backend socket may be HTTP. Restore trusted `https` first or redirect middleware can loop because it believes every request is HTTP.
- `Forwarded headers before HSTS` — HSTS is a response policy for secure requests; process the trusted original scheme before middleware decides whether to emit it.
- `Host header validation` — Restrict `Host`/authority to names the app serves, at both proxy and backend where possible. Host influences absolute URLs, redirects, tenant selection, and security decisions.
- `AllowedHosts configuration` — ASP.NET Core host-filter list used to reject requests with unexpected host names. Configure actual domains and test legitimate health/proxy hostnames.
- `Host header spoofing` — Malicious or unexpected Host/authority value influences redirects, caches, password-reset URLs, or tenant routing. Validate at the edge and app; do not trust a forwarded host without proxy validation.
- `PROXY protocol` — Transport-level metadata preamble used by some load balancers to convey original peer information. It is not an HTTP header; Kestrel does not natively parse it as a general built-in transport feature, so use a supported compatible listener/proxy integration.
- `IIS integration forwarded headers` — IIS hosting integration can provide original scheme/client context through server variables and known hosting behavior. Avoid double-processing or overwriting values when combining IIS integration with custom proxy middleware.
- `Original client IP restoration` — Replacing the proxy remote address with a trusted earlier client address. Use only for telemetry/rate policy after trust filtering; IP alone is not user authentication and can be shared/NATed.

## Cross-item comparison

| Mechanism | Layer | Carries | Key limitation |
|---|---|---|---|
| `X-Forwarded-*` | HTTP header | Scheme, host, client IP, prefix | Forgeable unless peer/header chain is trusted |
| PROXY protocol | Transport preamble | Connection metadata | Requires listener support; not HTTP middleware |
| TLS pass-through | Encrypted transport | Original TLS session | Proxy cannot inspect HTTP or add forwarded headers |
| TLS termination | HTTP after decryption | New backend request | Requires backend-hop protection and trusted context |

By default forwarded-header families are not automatically processed just because a request has those headers. A compatibility environment switch can broaden trust dramatically. Prefer code/options with explicit `KnownProxies`, `KnownIPNetworks`, and `ForwardLimit`, and keep the backend unreachable from untrusted clients.

## Examples

For a single edge proxy at `10.20.0.10`, configure it as a known proxy, process only the required `X-Forwarded-For` and `X-Forwarded-Proto` values, and set a one-hop limit. The edge should overwrite client-provided versions of those headers. Register middleware before HTTPS redirection. Configure accepted external hosts and block public access to the backend listener.

For two proxies, document the actual order and which one appends or replaces each header. Set the hop limit to the number of trusted entries that should be consumed and add both proxy IPs/network ranges. Test a request with a forged leftmost header and verify the restored remote IP remains the real client as seen by the edge.

## Common mistakes

- Trusting every forwarded header because traffic “normally comes through a proxy.”
- Setting `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` on a public edge without restricting backend peers.
- Clearing known-proxy/network restrictions to stop forwarded headers being ignored.
- Using the full `X-Forwarded-For` string as authenticated user identity.
- Running HTTPS redirection before scheme restoration, causing loops.
- Trusting `X-Forwarded-Host` without host allowlisting.
- Miscounting hops because some proxy replaces headers while another appends.
- Treating TLS pass-through as able to inject HTTP header metadata.
- Confusing PROXY protocol with `X-Forwarded-For`.
- Processing forwarded headers twice through IIS plus custom middleware.

## Knowledge checks with answers

1. **What does the backend socket remote address usually identify?** The immediately connected proxy, not necessarily the browser/client.
2. **What stops a direct client from forging forwarded identity?** Prevent direct backend access and process headers only from explicitly trusted peers with a bounded hop count.
3. **Why should forwarded-header middleware run before HTTPS redirection?** It restores the externally observed HTTPS scheme before redirect logic evaluates the request.
4. **What danger comes with the environment enablement switch?** It can clear known-proxy/network restrictions and trust arbitrary upstream peers.
5. **Can TLS pass-through inject `X-Forwarded-Proto`?** No; it cannot decrypt or edit HTTP headers.
6. **What should `AllowedHosts` do?** Reject host names the app does not intend to serve, including values restored from a trusted proxy.

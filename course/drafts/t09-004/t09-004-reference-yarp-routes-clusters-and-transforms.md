# Kestrel reverse proxies TLS networking and load balancing — Reference: YARP route matching, cluster selection, destinations, and request/response transforms

Sources: [YARP getting started](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/getting-started), [YARP configuration files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [YARP transforms](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/transforms?view=aspnetcore-10.0), [YARP HTTPS and TLS](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/https-tls?view=aspnetcore-10.0), and [YARP release record](https://github.com/dotnet/yarp/releases).

## Scope and version

YARP is a .NET library versioned independently from ASP.NET Core. The latest stable release listed on the official YARP roadmap/release page checked November 16, 2026 is YARP 2.3.0, which supports .NET 8 or later and therefore can run on .NET 11. These lessons use the 2.3 configuration model; verify package/schema support when upgrading.

## How this group fits the mental model

YARP maps an incoming request through a hierarchy: a route matches request properties and points to a cluster; a cluster names destinations plus shared transport/health/balancing policy; a destination identifies a backend address. A transform changes request or response details at the proxy boundary. Authentication and authorization at the proxy do not eliminate backend protections if another path can reach the backend.

## Supplied names explained

### Package and route/cluster model

- `YARP (Yet Another Reverse Proxy)` — Microsoft’s extensible reverse-proxy library built on ASP.NET Core. It provides routing, forwarding, transforms, load balancing, affinity, health checks, and extension points.
- `YARP reverse proxy package` — NuGet package `Yarp.ReverseProxy` containing the proxy capabilities. Version it independently from the .NET runtime and review official release notes before adopting a new package.
- `AddReverseProxy` — Dependency-injection registration method that adds YARP services and returns a builder for config providers, transforms, and other customizations.
- `MapReverseProxy` — Endpoint-routing extension that maps proxy endpoints into the ASP.NET Core app. Its default pipeline includes YARP’s standard proxy middleware; custom pipeline composition must preserve required features.
- `RouteConfig` — Configuration model for a route ID, matching rules, cluster ID, order, authorization, transforms, and related options. A route must map to an existing cluster unless its handler is custom.
- `ClusterConfig` — Shared configuration for a backend cluster, including destinations, outbound HTTP client, load balancing, health checks, affinity, metadata, and timeouts.
- `DestinationConfig` — One backend target within a cluster, typically with an absolute `Address` and optional health-check address/metadata. Keep address scheme, path base, DNS, and TLS trust intentional.
- `Route match Path` — Path pattern matching against the incoming request path, commonly using ASP.NET route-pattern syntax including catch-all parameters. Path matching happens before transforms.
- `Route match Hosts` — Host-name constraints for a route. Validate incoming host at the edge and app as well; a route’s host match is not a substitute for global host protection.
- `Route match Methods` — Allowed request methods for a route. Unspecified methods may match broadly; restrict when route semantics require it.
- `Route match Headers` — Header predicates including supported match modes. Headers are client-controlled unless a trusted proxy overwrites them; avoid using them as authentication without validation.
- `Route match QueryParameters` — Query string matching conditions. Query values can contain sensitive/user-controlled input and should not be copied into logs indiscriminately.
- `Route order` — Explicit endpoint route precedence; lower numeric order takes precedence over higher order. Prefer nonoverlapping routes when possible and test ambiguous patterns.
- `Cluster destination selection` — After matching a route and cluster, YARP asks availability and load-balancing policies to choose an eligible destination. No healthy/available destination can mean the request cannot be forwarded.
- `Destination address` — Absolute backend base URI in the destination configuration. Its scheme controls TLS, and its path base/trailing slash combine with the transformed request path; validate DNS, host, and certificate name.
- `Destination metadata` — Per-destination key/value data available to custom policies/extensions. Treat it as configuration, validate expected keys, and do not store secrets in plain metadata.
- `Route transforms` — Per-route instructions applied to the outgoing request/response, such as path rewriting or header changes. They execute within the proxy flow and should be reviewed for security and backend contract effects.
- `Route authorization policy` — ASP.NET Core authorization policy applied to a route, commonly named policy, `Default`, or `Anonymous`. Proxy authorization is one layer, not a replacement for backend authorization where direct access exists.

### Transforms and pipeline extensibility

- `Request transform` — Transformation of the proxied outbound request (method, path, query, headers, or related request context) before it reaches a destination. Preserve security headers and avoid accidentally forwarding credentials to another origin.
- `Response transform` — Transformation of the backend response before it is returned to the client. It can alter headers/status behavior but must not corrupt content semantics or caching/security policy.
- `Response trailer transform` — Transformation of trailing headers sent after a response body, where the protocol and streaming response support trailers. Do not assume trailers work on every client/proxy hop.
- `PathRemovePrefix transform` — Removes a specified leading path prefix before forwarding. Use when a public prefix is only a gateway namespace; check path-boundary behavior and avoid removing a partial segment unexpectedly.
- `PathPrefix transform` — Prepends a path prefix to the outgoing request path. Ensure slashes are normalized and the backend route expects the resulting prefix.
- `PathPattern transform` — Reconstructs the outgoing path using a pattern and captured route values. Verify escaping/encoding, catch-all behavior, and whether the destination base path is also included.
- `QueryValueParameter transform` — Adds/sets a query parameter using route/request values. Treat it as user-influenced unless source values are validated; do not leak sensitive values across services.
- `RequestHeader transform` — Adds, sets, or removes outbound request headers. Remove externally supplied identity headers before setting trusted values, and avoid copying hop-by-hop headers.
- `ResponseHeader transform` — Adds, sets, or removes response headers on the way back. Use it for intentional edge policy and do not overwrite security/cache headers blindly.
- `X-Forwarded transform` — Standard transform for forwarded client context. Configure which original values are sent and ensure downstream services trust only the proxy that supplies them.
- `HttpRequest transform` — Programmatic request-transform callback/API for logic beyond declarative configuration. Keep it deterministic, fast, and aware that it runs on every proxied request.
- `HttpResponse transform` — Programmatic response-transform callback/API. Preserve streaming and cancellation behavior; buffering the full body can increase memory and latency.
- `IProxyConfigProvider` — YARP abstraction that supplies proxy configuration and change notifications. Implementations must provide consistent snapshots and notify consumers when a new config is ready.
- `IProxyConfig` — Snapshot of routes/clusters plus a change token signaling when configuration changes. Publish new immutable configuration safely rather than mutating active objects unpredictably.
- `YARP configuration file` — Commonly the `ReverseProxy` section of `appsettings.json`, loaded with `LoadFromConfig`. Validate IDs, route-to-cluster references, absolute destination addresses, and secrets.
- `Reloadable YARP configuration` — Configuration reload path that rebuilds route/cluster state when a provider signals changes. Verify both successful reload and rollback behavior; a file existing on disk does not prove the proxy accepted it.
- `YARP transform builder` — Extension point for adding transform providers/builders during service registration. Use it to define reusable transforms with clear configuration validation.
- `YARP proxy pipeline middleware` — Standard/custom middleware executed for matched proxy requests. Custom pipeline changes must retain needed destination selection, load balancing, affinity, and health middleware.
- `Direct forwarding` — Lower-level forwarding API (`IHttpForwarder`) that sends a request to a specified destination without YARP’s full route/cluster configuration model. It is useful for custom routing but requires the application to implement selection, retries/limits, and policy deliberately.
- `Proxy HttpClient configuration` — Cluster-level settings for YARP’s outbound `HttpMessageInvoker`/handler behavior, protocol version, TLS, connection pools, and limits. Do not disable certificate validation; tune per destination/security boundary.

## Cross-item comparison

| Object | Primary question | Example responsibility |
|---|---|---|
| Route | Which incoming requests match? | Path, host, method, headers, query, order |
| Cluster | Which backend service/policies are used? | Health, affinity, balancing, outbound HTTP |
| Destination | Which concrete backend address is eligible? | Address, health URL, destination metadata |
| Transform | What request/response details change? | Remove prefix, set trusted forwarded header |
| Proxy pipeline | Which components process a matched request? | Auth, affinity, balancing, health, forwarding |

Route transforms alter what the backend sees; they do not alter the external client’s original request. Authorization policies run in the app pipeline, while backend authorization remains important if clients can bypass YARP.

## Examples

Register YARP with `AddReverseProxy().LoadFromConfig(...)`, then map it with `MapReverseProxy()`. A route for `/catalog/{**remainder}` can select a `catalog` cluster; a `PathRemovePrefix` transform removes `/catalog` only if the destination app serves from `/`. Add a restrictive host/method match where appropriate. Define a cluster with absolute HTTPS destination addresses, validated certificates, health policy, and sensible outbound timeouts.

For live config changes, construct a new routes/clusters snapshot, validate all references and destinations, publish it through `IProxyConfigProvider`, and emit the change token. Observe that requests move to the intended configuration; preserve a prior known-good snapshot for recovery.

## Common mistakes

- Treating a route, cluster, and destination as interchangeable.
- Forgetting that route order changes which overlapping route wins.
- Removing a path prefix without checking segment boundaries, base paths, and URL encoding.
- Forwarding an untrusted client-supplied identity header as if YARP verified it.
- Disabling TLS certificate validation for a self-signed backend instead of installing a trusted certificate.
- Expecting a custom proxy pipeline to retain standard health, affinity, and load-balancing middleware automatically.
- Assuming a file reload has been applied without checking errors and actual destinations.
- Buffering whole responses in transforms on large/streaming endpoints.
- Assuming a YARP route authorization policy protects a backend reachable through another network path.

## Knowledge checks with answers

1. **What is the route’s job?** Match incoming request properties and select a cluster, with configured order/policies.
2. **What belongs in a cluster?** A set of destinations plus shared forwarding, transport, health, balancing, affinity, and metadata policy.
3. **When is direct forwarding useful?** When custom code already owns destination selection and policy; it gives less of the configured route/cluster framework.
4. **Why can a transform be security-sensitive?** It changes headers, hosts, paths, or values sent across a service boundary.
5. **What must a reloadable config provider do?** Publish a coherent snapshot and correctly signal changes, while handling invalid config and recovery.

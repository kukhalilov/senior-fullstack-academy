# Kestrel reverse proxies TLS networking and load balancing — Exercises and worked solutions

Sources: [Kestrel endpoints](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/endpoints?view=aspnetcore-10.0), [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations), [proxy and load-balancer configuration](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0), [YARP configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [YARP health checks](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/dests-health-checks?view=aspnetcore-10.0), [YARP request timeouts](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/timeouts), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Goals

Practice designing Kestrel listener exposure, TLS termination and validation, trusted forwarded context, YARP routing and health policy, timeouts/cancellation, and incident diagnosis across proxy layers.

## Worked example

**Scenario:** A public edge terminates TLS and forwards to a .NET 11 Kestrel app at `10.10.2.15:8080`. The app redirects every request to HTTPS indefinitely. It also logs the load balancer address as the client IP. The edge’s `X-Forwarded-Proto` and `X-Forwarded-For` headers are present.

**Reasoning:** The backend transport is HTTP, so the app sees `http` unless trusted forwarded-header middleware restores the external scheme. The loop suggests HTTPS redirection runs before that middleware or the proxy value is not trusted/processed. The remote IP remains the edge because forwarded-for is ignored or untrusted. Identify the edge’s stable source IP/network; configure only that peer in `KnownProxies`/`KnownIPNetworks`, set the correct `ForwardLimit`, and ensure the proxy overwrites client-supplied forwarded headers. Place forwarded-header middleware before HTTPS redirection, HSTS, auth/URL generation, and client-IP policy. Block direct public access to the backend. Reproduce through the edge and a denied direct-backend request; verify the effective scheme is HTTPS, redirect count is zero, and the recorded client IP equals the address asserted by the edge. Do not enable the broad forwarded-header environment switch as a shortcut.

## Exercises

1. **Listener exposure:** A container app must accept traffic only from a sidecar proxy in the same pod. Compare `ListenLocalhost` and `ListenAnyIP`; state when each is appropriate and what network policy must still enforce.
2. **Protocol negotiation:** Browser clients should use HTTP/2 where possible and HTTP/1.1 fallback. Explain endpoint configuration and ALPN. What changes if HTTP/3 is added?
3. **TLS pass-through:** A TCP load balancer routes TLS by SNI to Kestrel. The app team asks for `X-Forwarded-Proto` and client IP restoration. Explain which metadata is unavailable and name the transport-level option that may carry peer data.
4. **Certificate incident:** Backend HTTPS requests fail after a certificate rotation. List the verification order for destination address, certificate name, chain, validity, private key, and trust; explain why “accept all certificates” is not a fix.
5. **Forwarded-header attack:** A public client sends `X-Forwarded-For: 127.0.0.1` directly to Kestrel. An IP allowlist admits it. Explain the trust failure and give a repair sequence.
6. **Forwarded environment switch:** A deployment sets `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` to fix redirects. Explain the trust effect and what must be audited in Docker, CI, and the hosting platform.
7. **YARP route selection:** `/api/orders/{**rest}` and `/api/{**rest}` both map to different clusters. Explain how order can select a route, what lower order means, and how to avoid shadowing.
8. **Path transform:** Public `/catalog/items/3` should reach a backend as `/items/3`, but it reaches `/catalog/items/3`. Identify the relevant transform and checks for prefix boundary, destination base path, and encoding.
9. **All destinations unhealthy:** Active probes fail but user traffic to the destinations sometimes succeeds. Give an investigation plan and explain the risk of a panic/fallback availability policy.
10. **Timeouts and retries:** A route has a 30-second total timeout and cluster `ActivityTimeout` of 100 seconds. A streaming response sends data every 20 seconds but lasts 2 minutes. Predict behavior; then discuss a retry for `POST /payments` after a proxy timeout.
11. **Affinity and failover:** A session-affinity cookie pins clients to a destination that becomes unhealthy. What failure policy choices exist, and what architecture removes the need for pinning?
12. **Observability:** Users report intermittent 502s from a YARP gateway. Design the minimal logs, metrics, and trace correlation needed to distinguish route miss, unavailable cluster, TLS failure, destination timeout, and application 500.
13. **.NET 11 ClientHello diagnostics:** You need to inspect ClientHello bytes and log handshake exceptions. State middleware ordering, new APIs, timeout relationship, and sensitive-data precautions.
14. **Kestrel limits:** A 413 occurs for a 40 MB upload, while the app allows 100 MB. Identify every relevant layer and explain why raising the Kestrel limit alone may not help.

## Progressive hints

1. `ListenLocalhost` is loopback-only; `ListenAnyIP` binds all interfaces, then network rules constrain who can connect.
2. Use `Http1AndHttp2` with HTTPS; ALPN negotiates. HTTP/3 additionally uses QUIC/UDP, TLS 1.3, and MsQuic.
3. Opaque TLS cannot expose HTTP headers; client IP may be conveyed by PROXY protocol only if the listener supports it.
4. Verify the exact hostname/SAN, complete intermediate chain, expiry, key matching/access, and trust store used by the running process.
5. The backend trusted an untrusted peer’s header. Restrict network reachability, configure known proxies, bound hops, sanitize headers at the edge, then validate scheme and host.
6. The convenience switch may clear proxy restrictions and trust arbitrary upstreams. Search all deployment environment sources and remove it or isolate the listener to trusted peers with explicit config.
7. Lower numeric `Order` has higher precedence. Prefer disjoint patterns and add tests for overlap.
8. Use `PathRemovePrefix`; inspect destination base address/path and match exact segment boundaries.
9. Separate probe path behavior from real request behavior; inspect network, TLS, auth, path, cadence, timeout, policy threshold, and health-state transitions.
10. Activity resets the idle timeout, but route total timeout still cancels after 30 seconds. A timed-out POST may already have committed; idempotency is required before retry.
11. YARP can redistribute or fail with an error under affinity failure behavior. Externalize state so any healthy instance can serve the client.
12. Log trace ID, route/cluster/destination, status and timing, outbound exception category, and health state; use low-cardinality metrics.
13. Register `UseTlsClientHelloListener` before `UseHttps`; wrap `UseHttps` with connection logging that reads `ITlsHandshakeFeature.Exception`; bound additive timeouts.
14. Check CDN/WAF, cloud load balancer, ingress/edge proxy, IIS if present, Kestrel server limits, request feature, and application endpoint configuration.

## Complete solutions

1. For a sidecar on the same network namespace, loopback can be the narrowest bind if the sidecar shares that namespace and uses loopback. If the platform routes sidecar traffic over another interface, bind to the required pod interface (possibly AnyIP) and enforce pod/network policy and container port exposure. Neither binding authenticates the sidecar; use network isolation and, when needed, service identity/TLS.
2. Configure an HTTPS Kestrel endpoint with `HttpProtocols.Http1AndHttp2`. The TLS ALPN handshake selects `h2` when both peers support it; otherwise HTTP/1.1 is used. HTTP/3 requires an additional QUIC endpoint/protocol, UDP reachability, TLS 1.3, and platform MsQuic; retain HTTP/1.1/2 fallback because clients/networks may not support HTTP/3.
3. TLS pass-through proxy cannot decrypt the stream, so it cannot inject `X-Forwarded-Proto` or HTTP client headers. Kestrel terminates TLS and sees the proxy as the remote peer. A transport-level PROXY protocol can carry original address metadata only when a compatible listener/integration parses it; Kestrel does not natively consume it as ordinary HTTP forwarded headers.
4. Confirm the configured destination URI and DNS/SNI hostname first. Inspect certificate SAN/name match, validity interval, usage/EKU, complete intermediate chain, private-key availability at the actual TLS terminator, and the trust store/validation policy used by the running handler. Check whether the new certificate chain is deployed on all instances. Install the correct CA/intermediate or fix the name/chain; an accept-any callback removes peer authentication and enables interception.
5. Treat the header as attacker input because the client connected directly. Restrict Kestrel network reachability to the edge, ensure the edge deletes/overwrites inbound forwarded headers, configure exact `KnownProxies`/`KnownIPNetworks` and `ForwardLimit`, and process only the required fields. Run middleware before IP-dependent authorization and verify direct forged headers are ignored. Do not use IP as sole user identity.
6. The environment switch enables forwarded-header behavior and may clear known proxy/network restrictions, so any upstream can assert original scheme/client context. Search Dockerfile/Compose/Kubernetes manifests, CI/CD variables, Windows/IIS hosting settings, and cloud app-service configuration. Remove the broad switch, configure explicit trusted peers, prevent direct backend access, and test a forged header path.
7. Route order controls precedence when endpoint patterns overlap; lower numeric order wins. Assign the specific orders so `/api/orders/...` reaches the orders cluster before the catch-all. Better, remove overlap if practical and verify path/host/method combinations with route tests and proxy logs.
8. Apply `PathRemovePrefix` for `/catalog`. Verify it removes only the exact path segment, not `/catalogue`; check whether the destination `Address` already includes a path base; inspect escaped segments and trailing slash normalization. Test resulting backend URI for normal, empty remainder, encoded slash, and query string.
9. Check probe DNS/address, TLS certificate validation, path/query, auth, readiness implementation, response status, timeout and interval, network policy, and whether the destination serves real traffic on another endpoint. Inspect active-health events and passive state separately. A panic policy may send users to known-unhealthy destinations, increasing bad responses or corrupting writes; choose it only when best-effort availability is preferable to fail-fast and the operation is safe.
10. `ActivityTimeout` resets while data flows, so 20-second activity avoids its 100-second idle cutoff. The route’s 30-second total deadline still cancels the 2-minute response at 30 seconds. A payment POST may have committed before the timeout reached the proxy; do not retry blindly. Use an idempotency key and backend deduplication/status-query pattern, or return an ambiguous outcome for safe reconciliation.
11. Affinity failure policy can redistribute a client to another available destination or return 503 when its pinned target is unavailable. If the app externalizes session/state (database/cache/shared token design), any healthy destination can serve the client and affinity can often be disabled. If sticky local state remains necessary, accept uneven load and define failover behavior explicitly.
12. Record trace/request ID, time, route ID, cluster ID, selected destination (or none), health/availability state, incoming/outgoing status, duration, bytes/protocol, and classified transport/TLS/timeout error. Correlate YARP spans with backend trace context. Metrics should count low-cardinality route/cluster/status/error and latency, not raw host/path/user IDs. Keep secrets and full authorization headers out of logs.
13. Register `ListenOptions.UseTlsClientHelloListener` before `UseHttps` to inspect raw ClientHello. Middleware that reads `ITlsHandshakeFeature.Exception` must wrap the HTTPS middleware and execute in the correct `finally`/failure path. The ClientHello timeout adds to `HandshakeTimeout`, so tune both to a bounded connection setup budget. Log only necessary handshake metadata; ClientHello can include host/SNI and fingerprinting data.
14. A request can be rejected by CDN/WAF, cloud LB/ingress, edge proxy, IIS integration, Kestrel server limit, per-request `IHttpMaxRequestBodySizeFeature`, or application validation. Find the first component returning 413 in logs/traces and compare its actual configured cap. Raise only each required boundary, protect memory/disk, and ensure the endpoint streams large bodies instead of buffering without bounds.

## Tests and edge cases

- Test a direct request that forges every forwarded header, then test the same request through the trusted edge.
- Test wrong Host, unknown SNI, missing/expired certificate, incomplete chain, and an untrusted backend certificate.
- Exercise HTTP/1.1, HTTP/2, and HTTP/3 from clients/networks with UDP blocked; verify safe protocol fallback.
- Verify YARP route overlap, method/host constraints, path base, encoded segments, query preservation, and authorization.
- Make active probes fail while the main endpoint succeeds, then reverse the case; observe policy state and traffic behavior.
- Disconnect a client during a slow backend operation and confirm cancellation propagates without unsafe automatic replay.
- Test long-lived WebSocket/gRPC streaming against total and idle timeouts.
- Rotate a certificate and verify new handshakes use it while existing connections behave as expected.
- Run a configuration reload with a malformed route/unknown cluster and ensure failure is visible and last-known-good behavior is understood.
- Verify telemetry stays bounded in cardinality and does not leak tokens, sensitive query values, or certificate data.

## Reflection questions

- Which component is the authority for original client IP, and how is its assertion authenticated?
- What does your readiness probe prove that a liveness probe does not?
- Which operations are safe to retry when the proxy times out after sending a request?
- Which TLS connection(s) exist in your topology, and who validates each peer?
- How would you distinguish a Kestrel request limit from an earlier edge 413 in production?

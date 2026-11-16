# Kestrel reverse proxies TLS networking and load balancing — Reference: Destination eligibility, affinity, health policy, timeout, and diagnostics

Sources: [YARP health checks](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/dests-health-checks?view=aspnetcore-10.0), [YARP load balancing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/load-balancing?view=aspnetcore-10.0), [YARP request timeouts](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/timeouts), [YARP configuration files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/config-files), [YARP HTTPS and TLS](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/yarp/https-tls?view=aspnetcore-10.0), [Kestrel security considerations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/kestrel/security-considerations), and [YARP release record](https://github.com/dotnet/yarp/releases).

## Scope and version

YARP 2.3.0 is the latest stable version listed by the official project and supports .NET 8 or later; this scope therefore runs on .NET 11. The latest Learn references describe health, balancing, and timeout behavior for the YARP configuration model. Do not infer that every resilience pattern, such as a circuit breaker or automatic retry, is a built-in YARP cluster policy.

## How this group fits the mental model

YARP selects a destination from the cluster’s currently available set. Health policy changes destination state, load balancing chooses among eligible candidates, and affinity can constrain that choice. Timeouts and cancellation bound request work. Logs/metrics show whether failure occurred at Kestrel, proxy selection, outbound transport, or the backend.

## Supplied names explained

### Load distribution and affinity

- `YARP load balancing policy` — Cluster policy selecting a destination from the available healthy destinations for each request. The built-in policy name is configured on the cluster; it is not the same as health eligibility.
- `PowerOfTwoChoices load balancing` — Default built-in policy: choose two random available destinations, then select the one with fewer assigned requests. It reduces per-request scanning while avoiding some random-choice overload.
- `FirstAlphabetical load balancing` — Selects the alphabetically first available destination, useful for simple active/standby preference. It does not balance steady-state load across all destinations.
- `LeastRequests load balancing` — Selects the destination with the fewest assigned requests by examining available destinations. It costs more selection work as the pool grows and does not measure backend CPU or queue depth directly.
- `RoundRobin load balancing` — Cycles selection through available destinations. It distributes choices evenly in order, but does not account for different backend capacity or request cost.
- `Random load balancing` — Chooses a random available destination. It is simple but can select a busy destination repeatedly by chance.
- `Session affinity` — Attempts to route a client consistently to the same destination. It is useful only when the workload requires locality; externalizing session/state is usually more resilient.
- `Cookie-based session affinity` — YARP affinity cookie records the selected destination for future requests. Protect cookie scope/SameSite/Secure attributes and plan what happens when the destination is unavailable.

### Health state and destination eligibility

- `Destination health state` — YARP’s state for a destination, commonly Unknown, Healthy, or Unhealthy. It is evidence from configured checks/policies, not a guarantee that every endpoint or transaction will work.
- `Active health check` — Periodic probe request to a configured health URI. It can discover failure before user traffic but may create load and can be green while a business dependency is broken.
- `Passive health check` — Evaluates real proxied request outcomes to infer destination health. It uses real traffic as evidence but detects failures only after requests are affected.
- `Active health check policy` — Cluster policy interpreting probe results to update destination health state. Configure meaningful response criteria and a bounded interval/timeout.
- `TransportFailureRateHealthPolicy` — Built-in passive policy that evaluates the ratio of proxy transport failures over a sliding window, after a minimum request count, and can mark a destination unhealthy.
- `ConsecutiveFailuresHealthPolicy` — Built-in active policy counting consecutive failed probes and marking a destination unhealthy after its threshold; a successful probe resets the failure sequence.
- `Destination probing` — Probe request YARP sends to an active health endpoint. It may use a destination-specific health URI or the destination address plus configured path/query.
- `Health check interval` — Time between active probe attempts. Too short wastes resources/creates noisy flapping; too long delays detection.
- `Health check timeout` — Maximum wait for one probe. Keep it shorter than the interval and consistent with expected endpoint latency.
- `Health check path` — URL path used for active readiness/health probing. The endpoint should be cheap, safe, and representative of serving readiness rather than merely proving process liveness.
- `Health check policy selection` — Cluster configuration chooses active/passive health evaluators and their policy names. Verify the needed middleware is in the proxy pipeline when constructing a custom pipeline.
- `Destination unhealthy state` — State in which an availability policy normally excludes a destination from new selection. Passive-unhealthy destinations can later be reconsidered after reactivation policy/time.
- `Destination draining` — Operational transition that removes a destination from new selection while allowing active requests to finish when possible. YARP 2.3 has no universal “drain this server” health flag; update config/availability safely and coordinate backend shutdown grace.
- `YARP circuit breaker policy` — Circuit breakers are a resilience pattern, but YARP 2.3 does not expose a built-in cluster setting named `CircuitBreakerPolicy`. Implement via appropriate ASP.NET Core/HTTP resilience integration or custom policy/middleware with explicit scope and recovery behavior.
- `YARP request timeout policy` — Per-route total request deadline can use `Timeout` or a named ASP.NET Core `TimeoutPolicy`; cluster `ActivityTimeout` bounds idle periods. Both may apply simultaneously; setting both route properties is invalid.
- `YARP rate limiting integration` — ASP.NET Core rate-limiting middleware/policies can limit proxy route traffic. Apply limits at the correct client identity boundary; use trusted forwarded client IP only after proxy validation.
- `Proxy cluster resilience` — Combined plan for destination health, load balancing, request/activity timeouts, cancellation, overload/rate limits, TLS validation, and recovery. YARP does not make retries/circuit-breaking safe by default; avoid replaying non-idempotent requests without an idempotency contract.

### Streaming, transport, and diagnostics

- `Request cancellation propagation` — Incoming request cancellation/timeout should cancel outbound proxy work. Backend code must observe cancellation; cancellation does not undo a side effect already committed.
- `Proxy WebSocket forwarding` — YARP can proxy WebSocket upgrades, which become long-lived bidirectional streams. Configure keep-alives relative to cluster ActivityTimeout and account for affinity and connection capacity.
- `Proxy HTTP/2 forwarding` — Outbound proxy requests can use configured HTTP version/policy; the backend connection may negotiate a different protocol from the client-to-proxy connection.
- `Proxy TLS certificate validation` — Outbound HTTPS handler validates destination certificate chain and name by default. Install the correct trust chain or use a properly configured trust store; never accept arbitrary certificates in production.
- `Kestrel connection diagnostics` — Kestrel connection-level logs/metrics for accepted, active, rejected, upgraded connections and TLS negotiation. They show server transport behavior, not which YARP destination was chosen unless correlated.
- `Kestrel EventSource` — EventSource provider exposing Kestrel runtime events to .NET diagnostic tooling. Enable selectively; high-volume event collection has overhead and may contain operational details.
- `Kestrel logging category` — ILogger category hierarchy for Kestrel server/connection/protocol logs. Tune levels per category and environment rather than globally enabling verbose logs.
- `YARP telemetry` — Proxy metrics/activity data for routing, destination selection, and outbound request behavior where instrumented. Configure collection/exporters and privacy filtering; telemetry must include useful low-cardinality dimensions.
- `Proxy access log correlation` — Log incoming route/cluster/destination decision and outgoing result with a trace/request correlation ID. Avoid logging credentials, full sensitive query values, or unbounded per-user labels.
- `Load balancer versus reverse proxy` — A load balancer distributes work; a reverse proxy terminates/forwards requests and may add routing/transforms. One product can perform both roles, but use each layer’s metrics and health boundaries distinctly.

## Cross-item comparison

| Feature | What it measures/chooses | Limitation |
|---|---|---|
| Active health | Periodic probe result | Can be green while a real request fails |
| Passive health | Actual proxied request outcome | Users may experience failures before detection |
| Load balancing | Choice among eligible destinations | Does not itself establish health |
| Session affinity | Stable destination association | Can skew load and complicate failover |
| Route timeout | Maximum total request duration | Cancellation cannot reverse completed side effects |
| Activity timeout | Maximum inactivity between transfer progress | Does not cap continuously active total duration |
| Circuit breaker | Suppresses repeated calls after failure threshold | Not a built-in named YARP cluster policy in v2.3 |

With a custom `MapReverseProxy` pipeline, standard middleware such as load balancing, affinity, and passive health checks may need to be explicitly included. The simple parameterless mapping wires standard components for the usual configuration path.

## Examples

For two equal backends, `PowerOfTwoChoices` is a reasonable default when request assignment matters more than strict rotation. Add active probes with a readiness path and a short but non-flapping timeout. Passive checks can supplement them for transport failures. Use cookie affinity only if application state still requires it, and decide whether an unhealthy pinned destination redistributes or returns an error.

For long streaming responses, set route total timeout and cluster idle `ActivityTimeout` intentionally. A route deadline limits total duration; activity timeout resets when data flows. WebSockets have special behavior after the handshake, and keep-alives should be shorter than the inactivity limit. Test disconnect/cancellation while the backend is working.

## Common mistakes

- Believing a healthy probe guarantees every endpoint/business dependency is healthy.
- Using health checks on expensive endpoints that create a new load incident.
- Setting probe interval equal to a tiny timeout and causing state flapping.
- Confusing destination availability policy with the load-balancing algorithm.
- Expecting round robin to account for backend capacity or request cost.
- Enabling affinity without planning unhealthy pinned destinations and state externalization.
- Treating `ActivityTimeout` as a total request deadline or vice versa.
- Retrying non-idempotent proxied requests without idempotency semantics.
- Assuming a circuit breaker is automatically provided by YARP 2.3.
- Assuming custom proxy middleware includes standard health/affinity/balancing stages.
- Logging raw headers, tokens, or high-cardinality identifiers.

## Knowledge checks with answers

1. **What does `PowerOfTwoChoices` do?** Samples two random available destinations and picks the one with fewer assigned requests.
2. **What is the difference between active and passive health?** Active uses periodic probes; passive infers state from real proxied outcomes.
3. **What does destination draining mean operationally?** Stop selecting it for new requests while allowing existing work to complete before shutdown.
4. **Does YARP 2.3 include an automatic cluster circuit breaker policy?** No named built-in cluster policy; use an explicit resilience integration/custom design.
5. **How do route timeout and ActivityTimeout differ?** One is total duration; the other bounds inactivity. Both can cancel a request.
6. **Why can retries be dangerous at a proxy?** The backend may already have performed a non-idempotent side effect even if the proxy did not receive its response.

# system design foundations and infrastructure building blocks — Reference: AWS Application Load Balancer (ALB)

Sources: [AWS Application Load Balancer overview](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html), [ALB listeners and rules](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-listeners.html), [ALB target health checks](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html), [ALB target groups](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html), [ALB target group attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html).

## Scope and version

This lesson describes AWS Application Load Balancer (ALB), an AWS-managed Layer 7 load balancer. AWS capabilities and limits change; check the current service documentation and regional availability before design or deployment. It explains architectural behavior, not a complete list of quotas, listener attributes, or security policies.

## How this group fits the mental model

A load balancer is the traffic entry point that chooses an application target and monitors whether targets can serve traffic. ALB understands HTTP-family request structure, so it can route using host, path, headers, methods, query parameters, or source IP conditions. It can centralize TLS termination and route requests to target groups, but the application still owns authorization, correctness, and business-level health.

## Supplied names explained

- `AWS Application Load Balancer (ALB)` — A managed application-layer load balancer that evaluates listener rules and forwards requests to selected target groups, with health checking and target-selection behavior configured per group.

## Request path and configuration model

1. A client resolves and connects to the ALB endpoint.
2. A listener accepts traffic on a configured protocol and port (for example, HTTP or HTTPS) and applies its default action unless a higher-priority rule matches.
3. Listener rules inspect configured request conditions and select a forwarding action/target group or another supported action.
4. The target group defines the registered destination type, target port/protocol, health checks, and routing attributes.
5. ALB selects a target considered eligible under health state and target-group routing policy, then forwards the request.

This model separates listener/routing configuration from target registration. A target can be registered in multiple groups, and the same request route may have distinct policies in each group. Security groups, subnet/AZ configuration, target registration, listener rules, and application ports must all agree; a “healthy” instance that cannot be reached through network policy is not useful.

## Layer 7 routing and target choice

ALB supports content-based routing, including host and path patterns and other documented request conditions. This is useful for routing `/api` and `/static` to different services, or multiple hostnames to separate target groups. Rule order matters: the first matching rule by priority determines handling. Keep rules understandable and test precedence, default behavior, redirects, and unmatched requests.

AWS documents target-group routing algorithms including round robin (default), least outstanding requests, and weighted random. Algorithm availability and constraints vary with target-group attributes. Do not infer that the algorithm will produce equal request counts under heterogeneous request cost, keep-alive behavior, stickiness, or changing target health. Measure distribution and application load.

ALB supports HTTP/HTTPS and WebSocket connections; long-lived connections introduce draining, timeout, deployment, and capacity considerations. A load balancer routes connections/requests according to its service contract; it does not make an application stateless. Sticky sessions can preserve affinity, but can reduce balancing flexibility and complicate failover. Prefer shared/session-independent application state when practical.

## Health checks are an availability policy

ALB periodically sends configured health-check requests to registered targets. Health-check protocol, path, port, interval, timeout, thresholds, and success matcher influence when a target is marked healthy or unhealthy. Each target group has its own health status. Health checking does not prove that every user journey or dependency is healthy; a shallow endpoint may return success while critical functionality is broken, while a deep check may remove all targets during a shared dependency outage.

An important failure case: AWS documents that if a target group contains only unhealthy registered targets, ALB fails open and routes requests to all those targets regardless of health. Therefore health checks are not a hard isolation or circuit breaker guarantee. Design application behavior, alarms, dependency failure responses, and capacity for the all-unhealthy case. Make health endpoints reflect the intended traffic-acceptance policy and avoid a synchronized check that cascades during transient dependency failure.

ALB health checks do not support WebSockets. For a gRPC target group, health-check path/matcher semantics differ from HTTP status checks; follow the current target-group documentation. Use target health reason codes and health-check logs to diagnose mismatched codes, timeouts, network rules, and target state.

## Deployments, draining, and warm-up

During a rolling deployment, register new targets, wait for health checks, then drain and deregister old targets. Configure application shutdown to stop accepting new work and allow in-flight requests/streams to finish within a bounded grace period. Long-lived WebSocket or streaming sessions may outlast ordinary request draining; define reconnect/resume behavior and rollout limits.

Newly healthy targets can receive a full traffic share immediately by default. ALB target-group slow start can gradually increase requests for eligible newly healthy targets, helping caches/JIT/runtime pools warm up. It has configuration constraints and does not replace readiness checks or capacity planning. Test scale-out and deployment when target startup is slow and traffic is high.

## TLS, security, and observability

An HTTPS listener can use certificates managed through AWS certificate services; ALB terminates client TLS and establishes a configured target-side connection. Choose modern TLS policies, validate whether encryption is required between ALB and targets, and ensure the application trusts forwarded client metadata only from the load balancer. Do not use client-supplied `X-Forwarded-*` headers as trusted identity without overwriting/validating them at the trusted edge.

Use network rules that allow target traffic from the ALB’s security group and restrict direct public access to targets where intended. Add WAF or other controls when required; an ALB is not automatically an application firewall or authentication system. Log routing and target processing, monitor request counts, latency, target health, rejected/failed connections, and per-target load. Correlate ALB and application traces to distinguish edge delay from target processing.

## Cross-item comparison

| Choice | Useful when | Trade-off |
|---|---|---|
| ALB | HTTP-aware routing, TLS termination, target health, web/API workloads | AWS-specific configuration/cost/limits; health behavior and target semantics need careful design |
| Network Load Balancer | Transport-level routing, protocol/connection needs where L4 characteristics fit | Less HTTP-aware routing; application-layer routing remains elsewhere |
| API gateway | API product concerns such as auth policy, quotas, transformation, developer-facing API management | May add another hop/service boundary; overlaps should be deliberate |
| Reverse proxy in the application platform | Fine-grained custom behavior or portability | Team owns deployment, scaling, patching, and failure operations |

These components can be composed, but every hop adds routing, TLS, health, timeout, and observability behavior. Select based on required layer, protocols, failure modes, operating expertise, and tested traffic rather than product labels.

## Examples

A multi-service web application has `app.example.com/api/*` routed to API targets and `app.example.com/assets/*` routed to a static-serving target group. The default listener action returns a deliberate response rather than accidentally forwarding unknown paths. Health checks use an endpoint that confirms the target can accept the relevant class of work without requiring every optional dependency to be perfect. During deploy, the release waits for healthy targets, shifts traffic gradually, monitors errors/latency, then drains the old group.

An outage makes every API target fail health checks because a shared database is unavailable. ALB may fail open to those targets, so handlers must fail quickly and safely rather than assume the balancer removed them. Alerts should detect both target health and user-visible errors; recovery restores targets only after the service can accept traffic.

## Common mistakes

- Treating ALB health checks as a universal circuit breaker; all-unhealthy target groups can fail open.
- Assuming “healthy” means end-to-end business operations work.
- Misordering listener rules or leaving an unsafe default action.
- Trusting arbitrary client-supplied forwarded headers as authenticated client identity.
- Sending traffic directly to targets around the intended edge security policy.
- Assuming target registration means traffic immediately follows the desired warm-up curve.
- Ignoring long-lived connection draining and reconnect behavior.
- Assuming the configured algorithm equalizes CPU cost or request latency.
- Ignoring current quotas, feature constraints, regional support, and target protocol differences.

## Knowledge checks with answers

1. **What makes ALB Layer 7?** It can inspect HTTP request properties and apply listener rules to route to target groups.
2. **What happens if every registered target in a group is unhealthy?** AWS documents fail-open routing to all those targets; do not rely on health checks as a strict isolation barrier.
3. **Does a successful health check prove a user journey works?** No. The check tests its configured path/condition; service-level monitoring and realistic probes are still needed.
4. **Why use slow start?** To ramp traffic to eligible newly healthy targets instead of immediately assigning their full share, while accounting for its documented configuration constraints.
5. **What must an application do for long-lived streams during deploy?** Define drain deadlines, stop new work on old targets, and provide client reconnect/resume semantics where continuity matters.

## Practice

Design an ALB-based rollout for a stateful API with WebSocket clients and a database outage mode. Specify listener rules, target health policy, deployment sequence, connection draining, all-targets-unhealthy behavior, security, and observability.

**Suggested answer:** Use explicit host/path rules with a safe default and separate target groups where policies differ. Health checks should match the intended ability to accept traffic, while alarms separately monitor database and user-visible operations; account for ALB’s documented fail-open behavior if all targets are unhealthy. Limit target access to the load balancer, validate forwarded-header trust, and use deliberate TLS policies. During rollout, wait for healthy new targets, shift traffic gradually/monitor, stop new sessions on old targets, allow a bounded drain, and have WebSocket clients reconnect with session/resume tokens. Test database failure, target health failure, and regional/service limits before production.

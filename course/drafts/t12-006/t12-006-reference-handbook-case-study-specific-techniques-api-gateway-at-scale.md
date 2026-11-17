# end-to-end system design case studies — Reference: API Gateway at scale

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure Gateway Offloading pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-offloading), [Azure Throttling pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling), [AWS API Gateway request throttling](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html), [AWS API Gateway quotas](https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html).

## Scope and version

This is a vendor-neutral system-design case study. “API gateway” may refer to a managed API management product, an ingress/reverse-proxy layer, or custom gateway software; features and guarantees differ. AWS request-throttling behavior is cited as one concrete example, not a universal gateway contract. Verify the selected product’s current limits, failure modes, and protocol support before relying on it.

## How this group fits the mental model

An API gateway is a controlled entrance to backend APIs. It can centralize client-facing concerns such as routing, TLS termination, authentication integration, request-size checks, throttling, protocol translation, and telemetry. It does not make backend operations correct, replace service authorization, or remove the need for capacity controls inside the services. At scale, the gateway itself becomes a critical shared dependency and policy enforcement point.

Start from the client promise and the backend constraints. For instance, mobile clients may need stable routes across service changes, while a downstream payment provider can handle only a bounded request rate. The design must protect the dependency without turning one noisy client or one gateway failure into a platform-wide outage.

## Supplied names explained

- **API gateway:** the client-facing request entry point that applies selected shared API policies and routes requests to backend services.
- **Gateway offloading:** moving appropriate cross-cutting work, such as TLS termination or common token validation, to a gateway so each backend does not reimplement it. The service must still enforce authorization for its own resources and business actions.
- **Throttling:** limiting accepted work at a boundary to protect finite capacity. A single coarse global cap can unfairly affect unrelated users; useful limits may need dimensions such as tenant, user, operation, resource, and downstream dependency.
- **Admission control and backpressure:** refusing or delaying work before saturated components are overwhelmed. A gateway limit can be one guard, but backend and dependency limits remain necessary because traffic may bypass the gateway or exceed best-effort quotas.
- **Control plane vs data plane:** configuration and deployment operations manage policy; the data plane processes live requests. A configuration rollout, control-plane outage, or inconsistent policy propagation must not unexpectedly disable all traffic or create an unprotected route.

## Cross-item comparison

| Placement | Useful for | Failure or coupling to watch |
| --- | --- | --- |
| Edge/CDN or network ingress | Global routing, DDoS filtering, broad connection and request limits | May not know application identity or per-operation cost; policy and routing behavior can vary by point of presence |
| API gateway | Stable API surface, routing, shared authentication integration, request transformation, client or operation quotas, API telemetry | Shared bottleneck or failure domain; policy sprawl; request transformation can couple gateway configuration to backend releases |
| Service-level protection | Business authorization, tenant/resource semantics, idempotency, dependency-aware concurrency and rate limits | Repeated implementations can drift; if gateway is the only enforcement point, direct or internal calls may bypass it |
| Downstream-specific limit | Protecting a database, payment processor, or other scarce dependency according to its actual capacity | Limits applied too late can waste upstream work; retries can amplify load unless admission and retry behavior are coordinated |

These layers complement each other. Use the earliest inexpensive boundary for broad abuse and overload protection, then enforce precise business rules where the service knows the principal, operation, and resource. Keep a protective dependency-specific limit near the dependency as well.

## Examples

### Request path

1. A client resolves the public API address and establishes TLS to the edge or gateway.
2. The ingress rejects malformed or oversized requests and applies broad abuse controls.
3. The gateway authenticates or validates the presented credential according to the design, maps the route, applies an appropriate client/operation limit, and forwards only the required identity context over a protected backend connection.
4. The service authorizes the requested action against its own resource and tenant, validates business invariants, applies idempotency where a retry could duplicate an effect, and checks its own available capacity.
5. The service calls a dependency under a dependency-specific concurrency or rate limit. It returns a meaningful status and retry guidance; the gateway preserves the contract and records correlated telemetry.

If the downstream payment processor slows down, the service should stop admitting unlimited new payment work, apply bounded timeouts, and avoid retry storms. A queue may be appropriate for operations whose API contract permits asynchronous completion; it does not help a synchronous operation if the caller requires an immediate final result.

### Capacity and policy model

Estimate request rate and concurrency by route and tenant; include burst size, request/response bytes, TLS connection behavior, authentication cost, transformation cost, and the fan-out to backend calls. A gateway request that triggers five backend calls consumes more backend capacity than a cheap health read. Set safe budgets at the downstream boundary and reserve headroom for recovery traffic and administrative operations.

AWS documents its API Gateway throttles and usage-plan quotas as best-effort targets rather than guaranteed hard ceilings. That example illustrates why an application must not rely on a gateway quota alone to protect an invariant or scarce backend. Clients should handle throttling responses with bounded backoff and jitter where retry is safe; they should not immediately replay a non-idempotent operation blindly.

### Scaling and availability

Measure gateway CPU, memory, active connections, request queueing, TLS handshakes, policy evaluation, upstream latency, rejected requests, and per-route/tenant distribution. Scale out gateway data-plane capacity only after identifying the bottleneck; verify sticky state, shared rate-limit storage, and configuration propagation across instances. If globally distributed gateways enforce a shared quota, cross-region coordination can add latency or cause temporary divergence; local quotas are faster but may allow a larger global burst. State which property is required.

## Common mistakes

- Putting all authorization in a gateway while allowing internal callers or alternate routes to bypass it.
- Treating API keys as proof of user identity or sufficient authorization for sensitive actions.
- Assuming configured rate limits are exact hard caps across all instances, regions, or products.
- Retrying `429`, `503`, timeouts, or gateway errors without bounded backoff, jitter, retry budgets, and idempotency checks; this can magnify overload or duplicate effects.
- Returning a generic error for downstream throttling so clients retry aggressively instead of slowing down.
- Applying a single aggregate limit that lets one tenant consume all capacity, or a fine-grained policy so expensive that rejecting abuse itself saturates the gateway.
- Transforming schemas or embedding business workflow logic in a central gateway until every backend release depends on a coordinated gateway deployment.
- Logging authorization headers, tokens, or sensitive request bodies while adding request tracing.
- Treating the gateway as highly available while its configuration store, identity provider, certificate renewal, DNS, or global routing has a single failure point.

## Knowledge checks with answers

1. **Can a gateway quota alone guarantee a payment provider is never sent too many concurrent requests?** No. Product limits may be best-effort and may not capture all call paths; enforce bounded concurrency close to the dependency and monitor its response behavior.
2. **Where should tenant authorization live?** The service that owns the resource must enforce whether that principal may perform the business action. A gateway can authenticate and pass trusted identity context, but it cannot replace resource-aware authorization.
3. **A rate-limited request times out after being forwarded. Is it safe to retry?** The caller may not know whether the operation committed. Use an idempotency key or operation-status lookup and retry under a bounded policy appropriate to the operation.
4. **Why not put all rules in one central gateway?** Central policy improves consistency for shared concerns, but business rules at the gateway create service coupling, can drift from the data owner, and may become a common failure or release bottleneck.
5. **What would you test before launch?** Burst and sustained load, one noisy tenant, downstream slowdown, gateway instance/region loss, policy rollout, direct-route bypass, malformed/oversized requests, credential-provider outage, safe retry behavior, and recovery while traffic returns.

## Review status

The HLD Handbook provides the case-study context. Official Azure and AWS references support the gateway offloading and throttling cautions above. Exact product claims are limited to the cited product documentation; this lesson remains pending a full claim-by-claim audit and inventory omission check.

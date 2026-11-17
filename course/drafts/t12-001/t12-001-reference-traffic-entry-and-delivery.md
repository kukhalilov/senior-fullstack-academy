# system design foundations and infrastructure building blocks — Reference: Traffic entry, routing, and edge delivery

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc8446), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Layer 4 load balancing` — Distributes connections using transport-level data such as addresses and ports; it does not understand application routes.
- `Layer 7 load balancing` — Routes HTTP requests using application context such as host, path, or headers, adding protocol and policy responsibilities.
- `Reverse proxy` — Accepts client traffic and forwards it to an origin, often centralizing TLS, routing, buffering, and access policy.
- `API gateway` — An API-focused entry point for routing, authentication integration, quotas, and request/response policy; avoid turning it into a hidden business-logic monolith.
- `Content delivery network (CDN)` — Caches eligible responses or assets at geographically distributed edge locations; cache keys and origin directives determine correctness.
- `Service discovery` — Lets clients or proxies resolve service instances as they change; health, freshness, and failure behavior must be defined.
- `Backend for frontend (BFF)` — A client-specific server boundary that composes or shapes backend data for a UI; it can simplify clients but creates another service to operate.
- `Edge compute` — Runs selected logic close to users; locality can reduce round trips but introduces deployment, runtime, data-residency, and debugging constraints.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.
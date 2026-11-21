# system design foundations and infrastructure building blocks — Reference: Traffic entry, routing, and edge delivery

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc9846), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 7](https://hld.handbook.academy/curriculum/prerequisites/), [reference 8](https://hld.handbook.academy/curriculum/building-blocks/), [reference 9](https://man7.org/linux/man-pages/man7/epoll.7.html), [reference 10](https://man7.org/linux/man-pages/man7/io_uring.7.html), [reference 11](https://man.freebsd.org/cgi/man.cgi?query=kqueue).

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

These components solve different problems and can be layered, but each layer adds a health model, timeout, routing decision, and failure mode:

| Choice | Decision it answers | Useful when | Cost or limit |
|---|---|---|---|
| Layer 4 load balancer | Which target receives this network flow? | TCP/UDP or other transport-level traffic, or when HTTP inspection is not needed | Usually cannot route by URL or HTTP header; long-lived connections can stay on one target |
| Layer 7 load balancer / reverse proxy | Which origin receives this HTTP request? | Host/path/header routing, TLS termination, connection pooling, or HTTP-aware health policy | Must correctly parse protocols and forwarded metadata; proxy adds a hop and is itself capacity and availability infrastructure |
| API gateway | Which API policy and backend apply? | API authentication integration, quotas, version routing, or controlled request policy | Can become a bottleneck or business-logic dumping ground; gateway authentication does not replace authorization at the resource owner |
| CDN | Can this response be served near the user without consulting the origin? | Public/static or carefully keyed cacheable content | A wrong cache key can leak personalized data; invalidation and stale content behavior must be designed |
| Service discovery | Which instances currently offer a service? | Instances change dynamically across hosts or zones | Registry/DNS/client caches can be stale; clients need health-aware retry and bounded discovery refresh |
| BFF | What response shape best serves this client? | Web/mobile clients need different aggregation or compatibility behavior | Duplicates some composition logic and creates another deployable boundary |
| Edge compute | Which safe computation benefits from running near the user? | Request filtering, personalization from local data, or lightweight transformation | Runtime limits, data residency, cold starts, replication, and debugging can outweigh saved round trips |

Load-balancing algorithms also encode tradeoffs. Round robin is simple when targets have similar capacity and request cost; weighted round robin can represent known capacity differences where the implementation supports it; least-connections or least-outstanding-request approaches can help with variable-duration work but depend on accurate connection/request accounting; consistent hashing preserves affinity for selected keys but can create hot targets and uneven partitions. These are alternatives with implementation-specific availability (for example, AWS ALB offers round robin, least outstanding requests, and weighted random with distinct constraints). None of these algorithms fixes an overloaded downstream database. Health checks should answer whether a target should receive a class of traffic, while separate end-to-end telemetry answers whether users are succeeding. A shallow check can leave a broken service in rotation; a deep check against one shared dependency can eject every target at once.

## Examples

For a product page, a CDN can serve immutable images while a Layer 7 proxy routes `/api/products/*` to the API. The API still authorizes the customer and reads the authoritative product record. If recommendations are optional, the API can enforce a deadline and return the product without that section when its BFF-style composition call is slow. During a deploy, readiness should represent the target’s ability to accept work; draining must allow bounded in-flight work and tell long-lived clients how to reconnect. Verify that cache keys include every response-varying dimension and that forwarded client IP headers are accepted only from trusted proxy hops.

For a TCP service that does not use HTTP, a Layer 4 balancer may be the right entry point; adding an API gateway does not help if it cannot speak the application protocol. For a client-specific response that combines several services, a BFF can be useful even behind the same proxy. Decide whether each additional hop earns its latency, policy, or isolation cost.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.
- Treating Layer 4 and Layer 7 as interchangeable names for the same routing behavior.
- Assuming DNS/service discovery changes instantly at every client or that health checks instantly move existing connections.
- Caching an authenticated response without a complete cache key and an explicit private/shared-cache policy.

## Knowledge checks with answers

1. **What does a reverse proxy do?** Accepts client traffic and forwards or routes it; it may terminate TLS but does not grant application permissions.
2. **What must a CDN cache key include?** Every request dimension that changes a shareable representation, while excluding unnecessary high-cardinality values.
3. **Why configure trusted forwarded headers?** To prevent arbitrary clients from spoofing original scheme, host, or address metadata.

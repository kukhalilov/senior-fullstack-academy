# system design tradeoffs and decision methods — Reference: Load balancer vs reverse proxy vs API gateway

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Azure API gateway guidance](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/gateway), [NGINX reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy), [NGINX HTTP load balancing](https://docs.nginx.com/nginx/admin-guide/load-balancer/http-load-balancer/).

## Scope and version

These roles can be combined in one product, but they answer different questions: where to send traffic, how to proxy it, and what API-specific policies/products to apply.

## How this group fits the mental model

**Load balancer:** distributes connections/requests among healthy backends using a policy such as round robin or least connections. It may operate at L4 or L7. Health checks and draining help routing, but do not make the application stateless or guarantee backend correctness.

**Reverse proxy:** accepts client traffic and forwards it to upstream servers. It can terminate TLS, route by host/path, buffer, cache, or load-balance, depending on product/configuration. The client sees the proxy as its server.

**API gateway:** an API-facing policy/control layer for publishing APIs, authentication/authorization, quotas, transformation, versioning, analytics, and routing. Some gateways also proxy or balance, while others explicitly require a separate load balancer/reverse proxy.

## Supplied names explained

- `Load balancer vs reverse proxy vs API gateway` — A load balancer distributes traffic; a reverse proxy receives and forwards requests; an API gateway applies API-level routing and policy. Products may combine roles, so compare the responsibilities and failure domain rather than names alone.

## Cross-item comparison

For private service-to-service traffic, an L4/L7 load balancer may be enough. For a public API with per-consumer quotas, authentication, product plans, and version analytics, add an API gateway. A reverse proxy can perform both proxying and balancing, but feature overlap does not make their operational responsibilities disappear.

## Examples

Route GET /api/orders through a gateway that validates an access token and applies a consumer quota, then a regional load balancer selects a healthy ASP.NET Core replica. If the gateway is bypassable, a client can evade quota/auth policy; if a backend is unhealthy, health checking/draining reroutes new requests, but in-flight calls and retries still need timeout/idempotency rules.

## Common mistakes

- Treating load balancing, reverse proxying, and API management as synonyms.
- Assuming every API gateway performs load balancing.
- Trusting client-supplied forwarded headers or leaving a backend reachable around gateway policy.
- Putting authentication, retries, or body transformation at the gateway without defining failure and latency effects.

## Knowledge checks with answers

1. **Which role selects among healthy backend instances?** The load-balancing function.
2. **What does an API gateway add?** API-specific policy and lifecycle controls, depending on the product.
3. **Does every API gateway include a load balancer?** No; verify its capabilities and combine components where needed.

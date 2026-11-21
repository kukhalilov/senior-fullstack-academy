# system design technology landscape and selection — Reference: Proxies and service mesh

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [NGINX HTTP load balancing](https://nginx.org/en/docs/http/load_balancing.html), [Envoy overview](https://www.envoyproxy.io/docs/envoy/latest/intro/what_is_envoy.html), [HAProxy health checks](https://www.haproxy.com/documentation/haproxy-configuration-tutorials/reliability/health-checks/), [Kong Gateway concepts](https://developer.konghq.com/gateway/), [Istio overview](https://istio.io/latest/docs/overview/what-is-istio/), [Istio deployment models](https://istio.io/latest/docs/ops/deployment/deployment-models/), [Linkerd architecture](https://linkerd.io/2-edge/reference/architecture/).

## Scope and version

This lesson compares NGINX, Envoy, HAProxy, Kong, Istio, and Linkerd. Proxy and mesh capabilities change across versions, editions, and deployment modes. Treat product-specific feature lists as orientation and verify exact behavior and licensing in current documentation.

## How this group fits the mental model

A proxy intermediates a network connection. It may forward at layer 4 (TCP/UDP) or understand application protocols at layer 7 (such as HTTP), where it can route by host, path, headers, or method. A reverse proxy fronts servers; a load balancer selects among backends. An API gateway adds API-facing concerns such as authentication integration, quotas, transformations, and developer-facing policy. A service mesh applies a managed communication layer to service-to-service traffic, usually with data-plane proxies plus a control plane.

Each added hop adds latency, resource use, configuration, and a possible failure point. Proxies can centralize routing and security policy, but a proxy cannot infer business correctness. Retries may duplicate a non-idempotent request, and a circuit breaker can protect capacity while changing availability behavior.

## Supplied names explained

- **Nginx (NGINX)** — A web server and reverse proxy with HTTP load balancing and proxying support for several protocols. It can serve static assets, terminate TLS, proxy requests, and distribute traffic. Available behavior and active health-check options differ between open-source and commercial offerings; distinguish passive failure handling from active checks rather than assuming every edition has the same features.
- **Envoy** — An out-of-process L3/L4 and L7 proxy designed for service-oriented architectures. It uses listeners, filters, clusters, endpoints, and can receive dynamic configuration through xDS APIs. Envoy is a proxy building block, not by itself a complete service mesh: service identity, certificate lifecycle, control-plane management, and policy workflows must be supplied by surrounding components.
- **HAProxy** — A high-performance proxy/load balancer with TCP and HTTP routing, backend selection, and active/passive health-check capabilities. It is commonly used at ingress or between services. Health probes should model readiness carefully; a shallow TCP check can mark a process available while its dependencies are unusable.
- **Kong** — An API gateway platform built around proxying plus configuration and plugins for API policies. Typical concerns include authentication, rate limiting, request/response transformation, and observability. Plugin execution and control-plane/deployment model vary by edition and configuration. A gateway should enforce policy at the API boundary, not become an unbounded store of business logic.
- **Istio** — A service-mesh platform for traffic management, workload identity/security, policy, and telemetry. Its architecture separates a control plane from data-plane proxies. Current Istio supports sidecar mode and ambient mode: ambient uses per-node L4 ztunnel proxies and optional waypoint proxies for L7 features. The choice changes resource and feature behavior; verify the feature matrix for the selected mode.
- **Linkerd** — A service-mesh platform with a control plane and lightweight per-workload proxies in its documented sidecar architecture. The proxies provide transparent traffic handling, service discovery/load balancing, TLS, policy, and telemetry for supported traffic. Its proxy is purpose-built for mesh use and is not intended as a general-purpose internet-facing reverse proxy. Current injection/sidecar mechanics depend on Kubernetes and Linkerd release details.

## Cross-item comparison

| Need | Candidate | Why it fits | What remains yours to design |
|---|---|---|---|
| Web serving plus straightforward reverse proxy | NGINX | HTTP proxying, static content, TLS, load balancing | Safe routing, cache policy, health behavior, version/edition differences |
| Flexible programmable proxy/data plane | Envoy | Rich L4/L7 filters, clusters, dynamic configuration | Control plane, identity lifecycle, policy authoring, deployment operations |
| Dedicated load balancing at edge or internal tier | HAProxy | Mature TCP/HTTP routing and health-check controls | Correct probe semantics, capacity, failover and config rollout |
| Public API boundary and plugin policy | Kong | Gateway-centric API policies and extensibility | Keep domain logic out of plugins; secure plugin lifecycle and rate-limit state |
| Kubernetes service-to-service security/routing with broad policy | Istio | Mesh control plane, identity, traffic policy, multiple data-plane modes | Complexity, resource overhead, mode support, trust and upgrade operations |
| Kubernetes mesh with focused lightweight traffic layer | Linkerd | Purpose-built micro-proxy and mesh workflow | Feature fit, supported protocols, control-plane/upgrade ownership |

They overlap but are not equivalent categories. A typical system may use a CDN, external load balancer, ingress/API gateway, and service mesh, but each layer should solve a named requirement. Avoid stacking proxies by habit.

## Examples

### Edge/API request path

An edge proxy terminates public TLS and routes `api.example.com` to an API gateway. The gateway verifies credentials and applies a bounded rate limit, then forwards to a service load balancer. A mesh proxy secures service-to-service calls with workload identity and records telemetry. The application still enforces authorization and validates the request. If the gateway retries a POST after a timeout, the application needs an idempotency contract to prevent duplicate effects.

### Safe health checks

An instance may be alive but not ready to receive work because it has not loaded configuration or its database pool is exhausted. Liveness and readiness probes answer different questions. A load balancer should remove an instance only for a condition that should stop new traffic, and the service should avoid health endpoints that create cascading overload by probing every dependency too aggressively.

## Operational and security considerations

- Use end-to-end deadlines; per-hop timeouts must fit within the caller’s budget.
- Bound retries, avoid retrying unsafe methods without idempotency, and prevent retry amplification across layers.
- Define which hop terminates and re-establishes TLS and how original client identity is authenticated.
- Treat forwarded headers as untrusted unless a trusted proxy boundary sanitizes them.
- Manage proxy configuration as versioned, validated, observable releases with rollback.
- Measure proxy CPU/memory, connection pools, queueing, retries, resets, and tail latency.
- Mesh encryption does not replace application authorization, secret management, or secure ingress design.

## Common mistakes

- Calling Envoy itself a complete service mesh or Kong a substitute for business authorization.
- Assuming every NGINX distribution has identical health-check features.
- Enabling retries at client, gateway, mesh, and service layers without a total retry budget.
- Treating TCP connect success as application readiness.
- Assuming sidecar and ambient mesh modes support the same features or consume the same resources.
- Sending sensitive identifiers or credentials into proxy logs and trace attributes by default.

## Knowledge checks with answers

1. **How does an API gateway differ from a basic reverse proxy?** It adds API policy workflows such as authentication integration, quotas, and transformations, though exact capabilities depend on product and configuration.
2. **Why can proxy retries cause duplicate charges?** The original request may have completed while its response was lost; a retry repeats the operation unless the application deduplicates it.
3. **Is Envoy alone a service mesh?** No. It is a proxy/data-plane building block; a mesh also needs control-plane configuration, identity, policy, and lifecycle management.
4. **What differs between Istio sidecar and ambient modes?** Their data-plane placement and L4/L7 feature path differ; ambient uses per-node L4 proxies with optional waypoint proxies for L7 features.

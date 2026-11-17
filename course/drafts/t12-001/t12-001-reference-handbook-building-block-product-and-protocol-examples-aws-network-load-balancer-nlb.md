# system design foundations and infrastructure building blocks — Reference: AWS Network Load Balancer (NLB)

Sources: [AWS Network Load Balancer overview](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/), [NLB health checks](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/target-group-health-checks.html), [NLB target groups](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-target-groups.html), [NLB target group attributes](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/edit-target-group-attributes.html), [NLB client IP and target registration](https://docs.aws.amazon.com/elasticloadbalancing/latest/network/target-group-register-targets.html).

## Scope and version

This lesson describes AWS Network Load Balancer (NLB) using current AWS Elastic Load Balancing documentation checked on 2026-11-17. AWS features and limits can change; verify the target Region and current documentation. This is an architecture guide, not a complete protocol/attribute/quotas reference.

## How this group fits the mental model

An NLB distributes network flows to registered targets at the transport/network layer. Unlike an HTTP-aware load balancer, it generally does not choose targets using HTTP paths or headers. It is useful when protocols, connection behavior, static addressing, or high-performance network entry are the main requirements. The service still depends on correct target registration, health policy, network rules, and application behavior.

## Supplied names explained

- `AWS Network Load Balancer (NLB)` — A managed network-layer load balancer that exposes zonal network interfaces/static addresses and forwards supported flows to target groups using flow-based target selection and health checks.

## Request and flow model

Create listeners for supported protocols, select target groups, and register instances, IP addresses, or other supported target types. AWS documentation lists TCP, UDP, TCP_UDP, TLS, QUIC, and TCP_QUIC target-group protocols, subject to configuration/target constraints. Each enabled Availability Zone has an NLB network interface and address; clients may receive multiple DNS addresses, so clients and DNS caches must handle zonal address changes and failover appropriately.

For TCP, an individual connection is routed to one target for its lifetime. AWS describes target selection using a flow hash over packet/connection attributes including protocol and addressing/port information. For UDP, packets with the same flow tuple are consistently sent to one target during the flow state. QUIC routing uses connection-ID information after a server ID is established, with a flow hash for initial connection attempts. This is not application request-level balancing: many HTTP requests on one long-lived TCP connection remain on the same target.

NLB can use static IP addresses per Availability Zone and can support Elastic IP allocation for internet-facing deployments under documented configuration. That can help firewall allowlists or partner connectivity, but clients still need DNS handling, multi-AZ design, and an application reconnect strategy. Static addresses do not make a target or Availability Zone immortal.

## Health checks and fail-open behavior

NLB actively checks registered targets using configured protocol/path/port, interval, timeout, and thresholds. By default, each node routes to healthy targets in its Availability Zone; cross-zone load balancing changes the target pool and has data-transfer/capacity implications. Health state is a routing input, not a perfect measure of user-visible correctness.

If all targets are unhealthy (or a target group is empty), AWS documents fail-open behavior that can send traffic to all registered targets regardless of health. DNS zonal behavior also depends on target health and client DNS caching. Do not rely on NLB to suppress all traffic during a total health-check failure. Design targets to fail safely, use application-level overload protection, and monitor both healthy targets and user outcomes.

Health checks are distributed and may arrive more often than the configured interval suggests because load balancer nodes use consensus behavior. Make the endpoint lightweight and safe under repeated checks. HTTP health-check requests have NLB-specific host-header behavior; do not build virtual-host routing assumptions that reject the check unintentionally. Review health-check logs/reason codes and security rules for both listener and check ports.

## Client IP, proxy protocol, and target networking

Whether the target sees the original client IP depends on target type, protocol, address-family translation, and `preserve_client_ip.enabled`. AWS documents differing defaults and restrictions; do not assume preservation. When disabled, targets see the NLB address. Proxy Protocol v2 can convey connection metadata to a compatible backend, but the backend must parse it before application data and must only trust it on a path where untrusted clients cannot forge the preamble.

Client IP preservation can affect routing and topology. AWS documents that NAT loopback/hairpinning is unsupported in certain cases when preservation is enabled: a target calling its own NLB can be routed back to itself and time out. Cross-VPC/transit and PrivateLink conditions also impose restrictions. Validate the exact target-group mode and traffic path before using client IP for security decisions or rate limits.

## Connection lifecycle and deployments

TCP/TLS flows are connection-oriented. Deregistration delay, connection termination for unhealthy targets, stickiness, and cross-zone settings affect existing and new flows differently. During deploy, drain old targets and expect clients to reconnect when connections end; graceful application shutdown and retry behavior are necessary. For UDP, state is based on flows rather than a TCP connection, and idle-flow expiration/reuse must align with application protocols.

TLS listeners terminate TLS at the NLB and connect to targets under configured target protocol. If targets use TLS, validate certificates and supported protocol/security policies per AWS behavior; do not assume end-to-end client TLS passthrough when configuring TLS termination. If preserving end-to-end TLS identity is required, choose a documented design that meets the requirement.

## Cross-item comparison

| Choice | Main layer/strength | Main caveat |
|---|---|---|
| NLB | Flow/transport protocols, static zonal addresses, non-HTTP protocols | Does not route on HTTP path/header; existing flow stays assigned to a target |
| ALB | HTTP-aware routing and web target groups | Not a generic transport load balancer for every protocol |
| DNS routing | Coarse distribution/failover across endpoints or regions | Client DNS caching/TTL and connection reuse delay changes |
| Self-managed L4 proxy | Custom protocol behavior and portability | Team owns scaling, patching, failover, and operations |

Choose from the required protocol, client-IP semantics, static-address needs, connection lifetime, health/failover model, and operational costs. Stacking NLB and ALB is possible for specific integration needs, but adds hops, health policies, and client-address propagation that must be traced end to end.

## Examples

A partner firewall requires a small set of stable ingress IPs for a TCP service. An internet-facing multi-AZ NLB can provide configured zonal addresses; clients connect through DNS and reconnect across failures. Targets accept traffic only from the NLB path, health checks use a separate known port/path, and the application monitors connection count and target distribution. The service does not expect a single static IP to provide regional disaster recovery by itself.

A UDP telemetry service uses NLB flow hashing. A small number of very chatty clients may create skew because a flow remains assigned to one target. Measure bytes and flow counts per target, distribute clients or shard at the application layer if needed, and design for target loss/flow recreation. Adding targets does not necessarily rebalance an already-established flow.

## Common mistakes

- Expecting HTTP path or header routing from a Layer 4 NLB.
- Assuming each request is independently distributed when many requests share a connection.
- Assuming client IP is always preserved or is trustworthy for authorization.
- Using Proxy Protocol v2 without configuring backend parsing and a trusted network boundary.
- Treating all-unhealthy targets as guaranteed traffic isolation; NLB can fail open.
- Ignoring DNS caching, zonal addresses, cross-zone settings, and client reconnect behavior.
- Enabling client-IP preservation without analyzing hairpin/NAT-loopback paths.
- Assuming TLS listener behavior is transparent passthrough or identical to ALB.
- Sizing only by request count and ignoring long-lived flows, per-target skew, and connection limits.

## Knowledge checks with answers

1. **Does NLB route `/api` and `/images` to different targets?** No; that is application-layer routing. NLB primarily makes flow-level decisions.
2. **Will adding a target redistribute an established TCP connection?** No; an individual TCP connection remains routed to its selected target for its lifetime.
3. **Does a target always receive the original client address?** No. Preservation depends on target type, protocol, and configuration; verify current AWS rules.
4. **What does NLB do if every target is unhealthy?** AWS documents fail-open behavior that routes to all registered targets; health checks are not a strict traffic firewall.
5. **What does a static zonal address guarantee?** A stable address for that configured NLB zone/endpoint use case, not application availability, target health, or cross-region disaster recovery.

## Practice

Design an NLB ingress for a global TCP service whose clients must allowlist destination IPs and whose targets need the original client IP for audit. Explain multi-AZ addresses, target registration, client-IP preservation or Proxy Protocol, health checks, fail-open behavior, deployments, and regional failover.

**Suggested answer:** Configure an NLB across required Availability Zones and publish its zonal/static addresses to partners with DNS and client retry guidance. Select target type/protocol and explicitly verify whether preservation is supported; otherwise use Proxy Protocol v2 with trusted-path-only parsing and log the forwarded source. Restrict target access to the NLB path, configure separate lightweight health checks, and plan for fail-open when all targets fail. Drain targets and support reconnect during deployments. For global failover, use a separate regional strategy (such as DNS/global traffic management) and accept that clients may cache addresses; test the complete partner network and failure behavior.

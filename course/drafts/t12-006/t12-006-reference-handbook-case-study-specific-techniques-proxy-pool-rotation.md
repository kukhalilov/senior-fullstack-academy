# end-to-end system design case studies — Reference: Proxy-pool rotation

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 9110: HTTP CONNECT](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 1928: SOCKS Protocol Version 5](https://www.rfc-editor.org/rfc/rfc1928.html), [AWS NAT gateways](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html), [AWS NAT gateway basics](https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-basics.html), [OWASP Bot Management and Anti-Automation](https://cheatsheetseries.owasp.org/cheatsheets/Bot_Management_and_Anti-Automation_Cheat_Sheet.html).

## Scope and version

This lesson covers an authorized outbound egress proxy pool used for network isolation, controlled service egress, privacy boundaries, regional routing, or availability. It does not provide a way to evade a destination's access controls, rate limits, or anti-abuse systems. Proxy and cloud gateway behavior varies by product; the linked standards and docs were checked on 2026-11-21. Respect target authorization, service terms, law, and destination policies; rotate only within an approved egress policy.

## How this group fits the mental model

An application sends a request through an egress layer that selects a healthy proxy or NAT path, establishes a connection to an approved destination, and reports the result. A pool can spread legitimate workloads across capacity, isolate tenants, provide stable or region-specific egress, and fail over unhealthy infrastructure. The egress IP is part of operational identity and auditing; changing it does not make a request authorized or anonymous.

Rotation policy should match the workload. Use a stable egress identity for systems that require allowlisting, sticky sessions, or audit correlation. Select a different member for independent stateless requests when policy allows. Keep sessions pinned when cookies, source IP binding, or transaction state require continuity. Every pool member should enforce the same destination, port, authentication, and rate policy.

## Supplied names explained

- **Forward proxy:** intermediary selected by the client to make or tunnel outbound requests. HTTP `CONNECT` establishes a tunnel for a host and port; SOCKS5 provides a network-level proxy negotiation with CONNECT/BIND/UDP ASSOCIATE commands.
- **Egress gateway/NAT:** controlled network path translating private workload addresses to approved public egress addresses. It may not provide HTTP-level request inspection or per-user proxy authentication.
- **Proxy pool:** set of independently health-checked egress endpoints with configuration, region, capacity, and policy metadata.
- **Rotation unit:** decision boundary such as per request, per connection, per workload, per tenant, or per region. Never rotate mid-transaction unless the application protocol and destination policy allow it.
- **Session affinity:** pin related requests to one egress path when the destination or application relies on stable connection/session identity. Affinity has expiry and failure semantics.
- **Health check:** tests the proxy and permitted upstream path without exposing credentials or causing side effects. Separate local proxy liveness from destination-specific reachability.
- **Circuit breaker and cooldown:** remove failing/exhausted endpoints temporarily; use bounded retries and jitter to avoid retry storms.
- **Policy enforcement:** destination hostname/IP, port, protocol, tenant, region, request rate, and data-handling rules evaluated before connection. Resolve DNS safely and prevent access to prohibited internal/metadata ranges to mitigate SSRF.
- **Credential and secret handling:** client-to-proxy authentication, upstream credentials, and logs are sensitive. Rotate credentials, use least privilege, and avoid storing proxy passwords in client-visible code.
- **Egress observability:** record workload/tenant, selected pool member, destination class, result, latency, bytes, retry reason, and policy decision without logging sensitive payloads unnecessarily.

## Architecture and request flow

1. **Define approved use.** List workloads, permitted destinations/ports, geographies, stable-IP needs, privacy/data-handling rules, rate limits, and audit requirements. Deny by default for arbitrary CONNECT destinations.
2. **Authenticate the workload.** Use service identity, mTLS, short-lived credentials, or network identity to map a request to a tenant/workload policy. Do not rely only on source IP when workloads share a network.
3. **Select a route.** Filter pool members by allowed region, health, capacity, and stable-IP requirement. Choose a healthy endpoint using least-loaded or weighted selection. Record the selection reason; maintain affinity for the life of a session when required.
4. **Authorize the destination.** Validate hostname, port, resolved addresses, protocol, and redirect targets against policy. Prevent proxy access to loopback, link-local, private networks, cloud metadata, and other prohibited destinations unless explicitly needed and isolated.
5. **Establish the proxy connection.** Negotiate HTTP CONNECT or SOCKS as supported, authenticate, and tunnel onward. For HTTPS CONNECT, TLS normally remains end-to-end between client and origin unless a separate authorized TLS interception system is explicitly deployed.
6. **Apply quotas and retries.** Enforce per-workload and global concurrency/bytes/request limits. Retry only idempotent or safely repeatable operations after transient connection failures; once a tunnel/request may have reached the origin, the outcome can be unknown. Respect destination-provided backoff where applicable.
7. **Drain and rotate safely.** When an endpoint is scheduled for maintenance, stop new sessions, let existing connections drain to a deadline, then close or fail them according to policy. Do not switch an established TCP/TLS tunnel transparently to another proxy.
8. **Audit and reconcile.** Emit a durable connection/request record with policy decision and endpoint. Alert on repeated denials, unusual destination patterns, pool exhaustion, unexpected region, egress IP change, and resource usage. Keep logs useful for investigations while limiting payload and personal data retention.

## Cross-item comparison

| Design | Benefit | Limitation |
| --- | --- | --- |
| Fixed egress IP | Stable allowlists and audit correlation | Single endpoint/capacity dependency unless multiple fixed addresses are managed |
| Round-robin/weighted proxy pool | Spreads independent requests across capacity | Can break affinity and may be uneven under long-lived connections |
| Consistent-hash by tenant/session | Stable mapping and lower session churn | Hot tenants and membership changes can rebalance; does not guarantee capacity |
| Cloud NAT gateway | Managed network-level egress and address translation | Often lacks application-level destination/user policy; product IP/throughput limits apply |
| Explicit forward proxy | Host/port policy, proxy auth, logs, and application control | Additional service to operate; HTTPS CONNECT usually reveals tunnel metadata, not encrypted payload |
| Direct egress | Fewer hops and components | Weaker centralized policy, identity, and egress observability |

## Examples

### Allowlisted partner API

The partner permits two static egress addresses. Configure a pool of two fixed addresses and route only the authorized service workload to them. Keep retries within partner quotas and expose which address was used in logs. Rotating to arbitrary residential addresses would violate the designed identity contract and is not a failover strategy.

### Stateless public metadata fetch

An internal service retrieves public metadata from a documented set of providers. Requests can be distributed among regional proxies for capacity and availability. Apply per-origin rate limits, SSRF-safe destination checks, bounded response sizes, and a cooldown on unhealthy proxies. Do not use rotation to bypass a site's 429 response; honor its retry guidance and reduce request rate.

### Proxy failure during a long-lived tunnel

A proxy host fails while an HTTPS CONNECT tunnel carries a long-running stream. The TCP/TLS session cannot be moved to a new egress IP without a protocol-level reconnect. Mark the stream outcome uncertain, reconnect only if the application supports resume/idempotency, and report interruption. New sessions can select a healthy endpoint after health checks/cooldown.

## Common mistakes

- Treating IP rotation as authorization, anonymity, or permission to bypass rate limits and anti-bot controls.
- Rotating each request when a destination relies on stable source IP, cookies, or transaction affinity.
- Changing the proxy member mid-tunnel and expecting TCP/TLS state to survive.
- Allowing arbitrary CONNECT host/port targets, turning the proxy into an open relay or SSRF path.
- Checking hostname before DNS resolution but failing to block prohibited resolved IP ranges or redirects.
- Using one shared proxy credential for every workload, making access revocation and attribution difficult.
- Retrying non-idempotent requests after an ambiguous proxy timeout and duplicating a downstream side effect.
- Health-checking only the proxy process while the route, DNS, upstream, or region is broken.
- Logging sensitive credentials, full URLs with secrets, or request bodies without a justified need and retention policy.
- Ignoring bandwidth, connection, file descriptor, NAT port, and egress-IP capacity constraints.

## Knowledge checks with answers

1. **Does a new egress IP bypass a destination's rate limit?** It must not be used for that purpose; comply with destination policy and reduce or pause traffic.
2. **Can an existing HTTPS tunnel move to another proxy without reconnecting?** No general proxy pool can migrate TCP/TLS state; the application must reconnect with protocol-aware recovery.
3. **Why restrict CONNECT destinations?** Arbitrary host/port tunneling can expose internal services or turn the proxy into an abuse relay.
4. **When is stable egress better than rotation?** When allowlists, audit identity, session affinity, or contractual requirements depend on predictable source addresses.
5. **What does a proxy health check prove?** Only the tested path and condition; separately observe proxy liveness, DNS, destination reachability, capacity, and request results.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder content with an authorized egress-pool design and explicit anti-evasion boundaries. RFC 9110 defines CONNECT tunneling and warns proxies to restrict destination ports; RFC 1928 defines SOCKS5 operations; AWS docs ground NAT gateway as a separate network-level alternative; OWASP guidance bounds the anti-abuse context. No material omissions remain in the supplied topic scope.

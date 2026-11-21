# end-to-end system design case studies — Reference: Virtual waiting room

Sources: [Cloudflare Waiting Room concepts](https://developers.cloudflare.com/waiting-room/), [Cloudflare Waiting Room API](https://developers.cloudflare.com/api/resources/waiting_rooms/), [RFC 9110: HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110), [RFC 6585: Additional HTTP status codes](https://www.rfc-editor.org/rfc/rfc6585).

## Scope and version

A virtual waiting room controls admission to an overloaded or intentionally capacity-limited service. It is a queueing and admission-control pattern, not one universal protocol. Product-specific behavior such as cookies, queue position estimation, dynamic capacity, bypass rules, and APIs differs by provider. The design principles here apply whether admission is enforced at an edge service, reverse proxy, application gateway, or a custom queue.

## How this group fits the mental model

Separate **arrival rate**, **admission rate**, and **service capacity**. If requests arrive faster than the protected system can safely process them, the waiting room holds or rejects excess arrivals before they consume expensive origin resources. The admitted flow must remain below a capacity target that accounts for background traffic, resource variation, and recovery headroom.

A waiting room is not simply a page that says “please wait.” It needs a trustworthy way to remember a visitor’s place, decide whether the visitor may enter, and prevent clients from forging admission. The edge is usually the best enforcement point when it can see all traffic to the protected route. A queue in the browser alone is not authoritative.

## Core mechanisms

- **Admission threshold:** a configured or dynamically estimated maximum for concurrent users, requests per second, or a more meaningful workload unit. A concurrency limit alone can fail if individual requests have highly variable costs.
- **Queue identity:** an opaque signed cookie or server-side token representing a visitor or session. Decide whether identity is per browser, account, checkout, or order; each choice changes fairness and abuse resistance.
- **Queue ordering:** FIFO is intuitive but may be expensive to maintain globally. Approximate positions, cohorts, or per-region queues trade strict order for scalability. State the fairness guarantee honestly.
- **Controlled release:** release entrants at a rate the origin can sustain. Use a safety margin, account for users who abandon or refresh, and smooth bursts rather than releasing a large batch at each interval.
- **Admission proof:** a signed, short-lived token or server-side state prevents a user from editing a cookie to bypass the queue. Bind it to the relevant route/session as appropriate and protect against replay.
- **Waiting estimate:** derive from current backlog and recent service/admission rate, but label it as an estimate. Changes in capacity, abandonment, and traffic make it uncertain.
- **Bypass policy:** staff, health checks, bots, and trusted integrations may need distinct rules. Keep bypass credentials secret, scoped, expiring, and auditable; do not rely on an easily guessed query parameter.

## Supplied names explained

- **Virtual waiting room**: admission control that keeps excess visitors outside a protected service until capacity is available.
- **Admission rate**: the rate at which queued visitors are allowed to enter; it should remain below sustainable service capacity.
- **Queue token**: a signed or server-backed identifier used to preserve a visitor’s queue state and prove admission.
- **Fail-open / fail-closed**: policies for whether traffic bypasses admission or remains blocked when the queue controller is unavailable.

## Cross-item comparison

A waiting room smooths large bursts and can preserve a user-facing queue experience. A rate limiter rejects or delays requests according to a per-identity or global budget and is often better for ongoing abusive or excessive traffic. A load balancer distributes admitted requests but does not itself control the number of users admitted. Inventory reservation remains a separate transactional action.

## Examples

### Queueing and overload behavior

For a stable queue, long-run admission must not exceed sustainable completion capacity. If admitted arrival rate is `λ` and service rate is `μ`, operating near `λ = μ` leaves little room for burst variability; queue delay and tail latency can grow sharply. A practical controller targets below measured saturation and observes origin latency, error rate, queue depth, and resource saturation. Increase admissions gradually after recovery.

Capacity may be multidimensional. A checkout endpoint can be constrained by database writes or a payment provider even while web servers are idle. Prefer a capacity signal tied to the true bottleneck, or use conservative static admission when a reliable signal is unavailable. Avoid a fast controller that increases and decreases capacity based on noisy measurements; use smoothing, hysteresis, and a bounded step size.

When the queue service itself is unavailable, choose an explicit fail-open or fail-closed behavior. Fail-open protects access but may overload the origin. Fail-closed preserves the origin but blocks legitimate use. For high-impact launches, a degraded static rate limit or cached queue page may be safer than silently bypassing admission. Test this failure mode before a traffic event.

## Security and abuse considerations

Attackers may rotate IP addresses, clear cookies, create many accounts, or replay admission tokens. IP address is a weak sole identity due to shared NATs and privacy relays. Combine signals carefully, avoid collecting unnecessary personal data, and do not claim perfect bot detection. Queue tokens should be integrity-protected, short-lived, and validated at every protected path. Ensure cached responses cannot leak another visitor’s identity or position.

Protect the queue from resource exhaustion too: rate-limit token issuance and polling; use jitter or server push where appropriate; cache static content; and avoid requiring a poll every second from every visitor. A waiting-room outage should not amplify load through retry storms.

### Example

Suppose a ticket release is expected to create a brief 40,000-request-per-second burst while the purchase path safely handles 2,000 checkouts per second. Put the queue at the edge, issue signed visitor tokens, and release a controlled cohort at a rate below the demonstrated checkout capacity. Keep checkout inventory authoritative in a transactional store: queue order does not reserve a ticket. After payment or reservation succeeds, an idempotency key and inventory constraint prevent duplicate purchases. Monitor admitted request rate, checkout success, origin saturation, token replay, and abandonment; pause releases automatically if critical service health deteriorates.

## Common mistakes

- Treating the waiting-room queue as an inventory reservation.
- Releasing users based only on web-server CPU while the database or payment dependency is saturated.
- Assuming a cookie is secure because it is opaque; it must be signed or backed by server state.
- Claiming strict global FIFO when the implementation is partitioned or approximate.
- Providing an unbounded bypass or exposing a secret in client-side code.
- Letting every waiting client poll aggressively and overload the queue service.
- Failing open during queue-service failure without checking origin capacity.

## Knowledge checks with answers

1. **Does queue admission reserve the product?** No. Inventory or capacity must be reserved by the authoritative transaction when the user proceeds.
2. **Why release below the measured maximum?** Real workloads vary and dependencies can saturate before the nominal limit; headroom absorbs bursts and measurement error.
3. **What does a signed admission token protect?** It helps prevent tampering and forgery; it does not by itself prevent replay, account sharing, or all automated abuse.
4. **When should a waiting room fail closed?** When protecting service integrity outweighs immediate availability, and a deliberate degraded path exists; the choice depends on impact and recovery goals.

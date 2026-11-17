# end-to-end system design case studies — Reference: Two-tier local and global rate limit

Sources: [Envoy Gateway rate limiting](https://gateway.envoyproxy.io/docs/concepts/rate-limiting/), [Envoy local rate limiting](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/local_rate_limiting), [Envoy global rate limiting](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting), [RFC 6585, HTTP 429](https://www.rfc-editor.org/rfc/rfc6585).

## Scope and version

This lesson teaches the supplied concept at the system-design level. Product behavior and feature availability vary by version and deployment; verify the cited official documentation for the versions and platforms you operate.


## How this group fits the mental model

A local limiter protects one proxy or application instance with a fast decision and no shared counter on every request. A global limiter applies a quota across the fleet, often using a shared rate-limit service or coordinated state. Combining them can reject obvious excess locally while enforcing a customer, API key, or resource-wide budget globally. The tiers serve different purposes; two local limits do not become one global limit.

Suppose four Envoy instances each allow 100 requests per minute locally. Without shared coordination, the fleet can admit roughly 400 requests per minute if traffic is spread across all four. A global limit of 100 per minute shared across the instances constrains the total, while local limits can still protect individual proxies from bursts. Exact boundary behavior depends on algorithm, interval, synchronization, and configuration.

## Supplied names explained

Define the identity and cost unit before choosing a limiter: per user, API key, tenant, IP address, route, operation, or a weighted resource cost. A single global bucket may unfairly let one tenant consume all capacity; per-tenant limits improve isolation but create more keys and state. Account for NAT, shared addresses, key rotation, spoofable headers, and authenticated identity. An IP address is not a reliable user identity by itself.

Specify the policy as a measurable contract: allowed rate, burst capacity, window or refill behavior, scope, response, and reset behavior. Fixed windows are simple but can admit a boundary burst across adjacent windows. Token buckets allow a configured burst while bounding long-run rate. Sliding-window approaches can smooth boundaries but require more state or computation. A configured rate without a burst and clock policy is incomplete.

## Request path and failure behavior

1. The edge proxy applies a cheap local limit and can reject overload before it consumes shared-service or application capacity.
2. Requests that pass local checks ask the global policy service or shared counter for a fleet-wide decision.
3. The application performs business authorization and its own resource checks; a rate limit is not an authorization boundary.
4. Rejections use HTTP `429 Too Many Requests` where HTTP semantics fit. A `Retry-After` hint can communicate when to retry, but only when the system can give a meaningful value.

The global check adds a network dependency and latency. Decide whether to fail open or fail closed when that service is unavailable. Fail-open preserves availability but may exceed quotas and overload dependencies; fail-closed protects capacity but can reject valid traffic. Use a local emergency ceiling, timeouts, bounded retries, and metrics so the policy service itself does not become an unbounded retry amplifier.

## Cross-item comparison

Exact globally coordinated quotas require coordination and can add latency or reduce availability during partitions. Local counters are cheap and resilient but multiply the effective allowance by the number of active instances. Approximate approaches can allocate quota leases or token slices to instances; they reduce coordination but permit bounded overshoot and need lease-expiry/rebalance logic. State the allowed overshoot and measurement interval rather than promising an exact global rate when the design is approximate.

In Envoy Gateway, local rate limiting is independent per proxy instance; global rate limiting shares a policy across instances. Envoy supports using local limits with global limits to reduce pressure on the global rate-limit service. Treat those as Envoy product behaviors, not universal properties of every gateway.

## Examples

For a public search API, apply a per-instance local burst ceiling to protect each proxy. Then apply a global per-tenant sustained budget and a smaller global expensive-query budget. Derive tenant identity from verified authentication, not a caller-controlled header. Return 429 on policy rejection; include a retry hint only if the quota state provides a valid reset estimate. Independently cap query cost and concurrency because request count alone does not bound expensive work.

## Common mistakes

- Treating one vendor or protocol profile as universal behavior.
- Assuming the mechanism removes the need to design for retries, failure, security, and operations.
- Choosing a tool before stating the workload and correctness requirement.

## Knowledge checks with answers

1. **Why is a local limit not enough for a tenant-wide quota?** Each proxy maintains its own local allowance; spreading traffic across instances can multiply the aggregate allowance.
2. **What tradeoff does a global counter add?** It coordinates the fleet-wide budget but adds shared-service latency and an availability dependency. Failure-open and failure-closed choices have different overload and rejection risks.
3. **What should a quota define besides requests per minute?** Identity/keying, burst policy, counting interval, weighted cost if needed, response semantics, failure mode, and acceptable overshoot.

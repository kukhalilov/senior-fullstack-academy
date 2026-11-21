# system design tradeoffs and decision methods — Reference: Token bucket vs sliding-window rate limiting

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Redis rate-limiting algorithm guide](https://redis.io/learn/howtos/ratelimiting/), [ITU-T Y.1221 traffic control](https://www.itu.int/rec/T-REC-Y.1221-201006-I/en).

## Scope and version

Rate limiting controls admission to protect capacity, enforce quotas, or shape traffic. Define whether the limit is per user, key, IP, tenant, route, or global, and what the client sees when rejected.

## How this group fits the mental model

**Token bucket:** tokens refill at rate r up to capacity B; a request consuming c tokens is admitted when enough tokens exist. It limits long-run rate while allowing a burst up to stored capacity. Pick units (requests/bytes/cost), refill precision, initial tokens, and behavior for requests larger than B.

**Sliding window:** count events in the interval (now-W, now]. An exact log stores timestamps and is accurate but uses state proportional to events; a counter-based approximation uses less memory but can miscount near bucket boundaries. The algorithm name alone does not define exactness, distributed atomicity, or clock behavior.

## Supplied names explained

Distributed enforcement must keep per-key state shared or partitioned consistently. Local in-memory limiters multiply the effective quota across replicas unless budgets are allocated per instance. A central atomic counter adds network latency and becomes a dependency; approximate/local limits trade precision for availability. Define fail-open/fail-closed, eviction, clock, and configuration-change behavior.

## Cross-item comparison

Choose token bucket when controlled bursts are acceptable and a sustained rate is the main rule. Choose an exact sliding window when “no more than N requests in any rolling interval” is the literal contract and state cost is acceptable. Use a documented approximation when lower memory/latency matters and boundary error is tolerable. Consider leaky bucket/shaping when output must be smoothed rather than merely admitted.

## Examples

An API allows 60 requests/minute with a burst of 20. A token bucket with capacity 20 and refill 1 token/second admits a burst of 20, then averages at most 60/minute over time. A sliding-window rule of 60 per rolling minute rejects a 61st request even if it arrives just after a fixed clock-minute boundary. In a 3-instance API, decide whether a shared store enforces one quota or each instance receives a safe quota share.

## Common mistakes

- Confusing token bucket's burst allowance with a strict rolling-window maximum.
- Calling an approximate sliding counter exact.
- Enforcing independent per-process limits while promising a global quota.
- Failing to specify behavior when the limiter's state store is slow or unavailable.

## Knowledge checks with answers

1. **What does token-bucket capacity B control?** Maximum stored tokens and therefore the permitted burst.
2. **Why can a fixed-window counter violate a rolling-window rule?** Requests can cluster on both sides of a window boundary.
3. **What must be specified for a distributed limiter?** State scope/consistency, quota allocation, failure mode, and precision.

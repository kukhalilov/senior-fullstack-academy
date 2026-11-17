# system design foundations and infrastructure building blocks — Reference: Cache stampede prevention

Sources: [HLD Handbook](https://hld.handbook.academy/), [Redis cache-aside stampede protection](https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/), [RFC 5861: HTTP stale controls](https://httpwg.org/specs/rfc5861.html).

## Scope and version

A cache stampede (also called a thundering herd) occurs when many requests need the same missing or expired cache value and concurrently repeat expensive origin work. This case covers request coalescing, distributed refresh coordination, stale serving, expiration jitter, and origin protection. Redis and HTTP guidance were checked on 2026-11-17; these mechanisms have different guarantees and must be selected against data freshness and failure requirements.

## How this group fits the mental model

Imagine a popular product page cached for ten minutes. When its entry expires, hundreds of requests arrive together. If every request reads the database, computes the page, and writes the cache, the cache miss multiplies load exactly when the origin is most vulnerable. That surge may cause timeouts, more retries, and a larger outage.

The goal is not simply “add a lock.” First decide whether stale data is acceptable. Then make one request refresh while other requests wait briefly, receive an allowed stale value, or get a controlled fallback. Bound the refresh duration and the number of origin calls. Handle the case where the refresher crashes or the lock expires. Cache coordination protects the backing store; it does not make stale data correct or safe for every domain.

## Supplied names explained

- `Cache stampede prevention` — Coordinates or staggers refreshes so a synchronized wave of cache misses does not trigger equivalent expensive origin work for every request.

### Prevention techniques

**Request coalescing / single-flight.** Within one process, keep a map of in-flight refresh tasks keyed by cache key. The first caller starts the load; concurrent callers await the same result. Remove the in-flight entry on success, error, and cancellation. This avoids duplicate work on that process, but separate application instances each have their own map.

**Distributed lease or lock.** A worker atomically acquires a short-lived lock for the key; only the owner refreshes, while others wait, serve stale, or fail fast. In Redis, a pattern uses `SET key token NX PX lease` and verifies the token when releasing so one worker cannot delete another worker's lock. Choose a lease longer than typical refresh work but bounded, and define behavior if work outlasts it. A lease is not a correctness guarantee that only one worker can ever execute: the worker can pause beyond expiry, allowing a second worker to start. If duplicate writes could corrupt authoritative data, use fencing/version checks at the storage layer rather than trusting the lock alone.

**Serve stale while refreshing.** If the cached value remains safe to show, return it immediately while one worker revalidates in the background. RFC 5861 defines HTTP `stale-while-revalidate` and `stale-if-error` extensions: these permit stale response reuse under specified windows, but a cache must honor the applicable HTTP directives and policy. These controls are useful only when the producer marks the data and the consumer/cache supports them. For application caches, implement explicit fresh/stale deadlines and status.

**Expiration jitter.** Add random variation to TTLs across many different keys so a deployment-wide set of entries is less likely to expire at once. This reduces synchronized expiry waves across a key population. It does not solve one extremely hot key expiring while many requests are waiting; combine it with single-flight or stale serving for hot keys.

**Early or probabilistic refresh.** Refresh before expiry based on request rate, refresh cost, or a probability that increases near expiration. This can avoid a visible miss for hot values, but needs load budgets and careful treatment of unpopular values. A proactive refresher should not create a synchronized refresh wave of its own.

**Origin load shedding and fallback.** Use per-key and global concurrency limits, queue limits, circuit breakers, and bounded retries. If the origin is failing, serve a safe stale value, a partial response, or a clear error according to the product contract. Do not let every waiting client start another retry when the refresh fails.

## Cross-item comparison

This lesson contains one assigned mechanism group, so no within-group comparison applies. Process-local single-flight is simple and low-latency but coordinates only one process. A distributed lease coordinates across instances but introduces expiration, clock/lease, failover, and ownership problems. Stale-while-revalidate hides refresh latency when stale data is permitted, but does not guarantee freshness or always start proactive work. TTL jitter spreads expiration across many keys but does not coalesce concurrent requests for one hot key. Rate limiting protects the origin even when refresh coordination fails.

Combine mechanisms by requirement: for a catalog page, stale-while-revalidate plus per-process coalescing and TTL jitter may suffice. For inventory or authorization, stale data may be unsafe; use strict freshness, a strongly consistent source, and bounded queueing/failure behavior. Avoid a distributed lock if duplicate recomputation is cheap and safe; the lock's complexity may cost more than the work it prevents.

## Examples

### Hot key expires

At time T, product key `item:42` expires. Request A acquires the refresh lease, loads the source, and writes the new value. Requests B–Z find the refresh already in progress; they either await the shared task or receive the stale value within its allowed stale window. When the refresh completes, all later requests read the new entry. Metrics should show one origin load, not dozens.

### Refresher crashes

Worker A obtains a lease and pauses during a database call. Its lease expires. Worker B obtains a new lease and refreshes. A resumes and attempts to write an older value. Use version checks, a monotonically increasing fencing token, or compare-and-set semantics if stale completion could overwrite newer state. Otherwise, ensure refresh writes are idempotent and results are based on a source version that prevents regression.

### Origin is unavailable

The cache value is stale by 20 seconds, and the origin returns an error. If the product permits stale display for up to two minutes, serve the stale value and retry refresh with backoff. If the data is a payment authorization decision or access-control grant, fail according to the safety policy rather than extending stale use. Record stale age in telemetry so the service can alert before the maximum allowed window is exceeded.

## Common mistakes

- Assuming one in-process single-flight map coordinates every replica.
- Treating a TTL lock as an exactly-once guarantee after pauses, partitions, or lease expiry.
- Releasing a distributed lock without verifying ownership and deleting a successor's lock.
- Letting all waiters retry the origin when the one refresh fails.
- Using TTL jitter as the only defense for a single hot key.
- Serving stale values without a field-specific freshness and safety contract.
- Using unbounded wait queues that turn a stampede into memory exhaustion.
- Retrying refreshes aggressively during origin failure and worsening the outage.
- Allowing an expired lease holder to overwrite a newer refresh result.
- Forgetting negative caching for repeated misses or not-found results where appropriate.

## Knowledge checks with answers

1. **What causes a cache stampede?** Many requests concurrently recompute or fetch the same missing/expired value, overwhelming the origin.
2. **What does local single-flight guarantee?** It coalesces equivalent in-flight loads within one process, not across every replica.
3. **Does a distributed lease guarantee only one refresh forever?** No. A paused worker can outlive the lease; a later worker may acquire it. Protect writes with versions/fencing when stale writes matter.
4. **When can stale-while-revalidate help?** When the product permits serving a stale value for a bounded time while refresh runs asynchronously.
5. **Why doesn't TTL jitter solve a hot-key stampede?** It spreads expiration times among keys, but concurrent requests for the same popular key can still arrive together at its expiry.

## Practice

Design stampede protection for a product detail page and then for available concert-seat inventory. For each, define whether stale reads are allowed, choose single-flight/lease/jitter/stale serving, set wait and lease bounds, handle refresh errors and worker pauses, and list metrics. Explain why the two data types should not share the same stale policy.

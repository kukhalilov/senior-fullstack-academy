# retries backoff idempotency circuit breakers and rate limits — Reference: Concurrency caps, bulkheads, rate limits, and load shedding

Sources: [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead), [Rate Limiting pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern), and [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience).

## Scope and version

This lesson covers capacity isolation and admission control concepts. Distributed coordination and exact runtime API details are outside this topic.

## How this group fits the mental model

Limit how much work one caller/dependency can occupy. Rate limits shape arrivals over time; concurrency limits bound simultaneous work; bulkheads isolate pools; load shedding rejects excess work before systemic failure.

## Supplied names explained

### Bulkhead pattern

Partition resources so one failing workload cannot exhaust all capacity. Partitioning may be by dependency, tenant, or operation; unused isolated capacity is a tradeoff.

### Thread-pool bulkhead

Separate thread/task scheduling capacity for workloads. Dedicated pools can contain blocking work, but too many pools waste threads and complicate tuning.

### Semaphore bulkhead

A semaphore limits concurrent access to a dependency/resource. Define queue/wait behavior and release permits in all success/failure/cancellation paths.

### Connection-pool bulkhead

Separate connection capacity by dependency or workload to prevent one consumer exhausting a shared pool. Pool size must align with downstream limits and latency.

### Per-tenant bulkhead

Reserve/limit capacity per tenant to prevent noisy-neighbor starvation. Fairness, tenant count, and unused reservation costs must be considered.

### Concurrency limit

Maximum simultaneous in-flight operations. It protects sockets, threads, memory, and dependencies but may reject or queue work when saturated.

### Concurrency limiter

A component implementing an in-flight cap, sometimes with bounded queueing. Include queue length/timeout and cancellation behavior; unlimited waiting defeats the cap’s purpose.

### Rate limiting

Controls how many requests are admitted per time interval. It protects fairness and capacity, often returning a throttling response; it does not bound long-lived concurrency by itself.

### Token bucket algorithm

Tokens replenish at a configured rate up to a capacity. Each request consumes tokens, allowing controlled bursts while bounding long-term average.

### Leaky bucket algorithm

Smooths accepted work at a steady drain rate, often queueing within bounds. It can reduce bursts but adds queueing delay and needs overflow behavior.

### Fixed-window rate limiter

Counts requests in discrete time windows. It is simple but allows boundary bursts across adjacent windows.

### Sliding-window rate limiter

Counts over a rolling interval or approximates one with subwindows, smoothing boundary artifacts at additional state/compute cost.

### Queue-based rate limiter

Queues excess requests to be processed at a controlled rate. Bound queue capacity and wait; stale work or long queues can worsen user experience and memory pressure.

### Rate limit partition key

Identity used to apply quotas, such as tenant, user, IP, or API key. Trust boundaries and spoofing risk determine safe key selection.

### Request-rate quota

Maximum allowed request volume over a period. Communicate scope/window and reset/backoff behavior so clients can adapt.

### Concurrency quota

Maximum in-flight operations allowed for an identity/resource. It differs from a request-rate quota because long-running operations consume slots longer.

### Server-side throttling

Service rejects/slows requests when capacity or quota is exceeded. It should return a clear response and, when useful, `Retry-After` guidance.

### Client-side rate limiting

Client voluntarily meters its own requests to protect a dependency or honor a quota. It cannot enforce fairness among other clients and must handle coordination if many instances share one quota.

### HTTP 429 Too Many Requests

Status indicating request rate/usage was limited. Servers can include `Retry-After`; clients should use backoff and avoid immediate retry loops.

### Retry-After back-pressure

Server guidance to defer a request after throttling/temporary unavailability. Clamp to caller deadline and add jitter across clients where appropriate.

### Load shedding

Reject/drop selected work before system saturation spreads. Prioritize critical requests and return an explicit overloaded result; do not silently discard important business operations.

### Admission control

Decision at system entry whether to accept work based on capacity, quota, health, or priority. Early rejection prevents expensive downstream work.

### Queueing delay

Time work waits before service. Queueing increases latency and can cause timeouts/retries; measure age and bound waiting, not just queue length.

### Bounded queue capacity

Maximum number/bytes of buffered work. A finite limit gives overload a defined response (reject, shed, or dead-letter) and protects memory.

### Bulkhead exhaustion response

Outcome when an isolated pool has no capacity: reject, bounded wait, or fallback. Make it observable and distinguish it from a dependency timeout.

## Cross-item comparison

Rate limits bound arrivals over time; concurrency limits bound in-flight operations. Token/leaky buckets shape bursts; fixed/sliding windows count intervals. Bulkheads isolate resources; global pools maximize sharing but increase blast radius.

## Examples

For a public API, token bucket per tenant allows a short burst while enforcing steady request rate. A semaphore cap protects a slow downstream service. Separate pools keep batch exports from consuming all interactive capacity. When limits hit, return 429 or an overload response with clear retry guidance.

## Common mistakes

- Using a rate quota to control long-running concurrency.
- Queueing without a bound or maximum age.
- Keying quotas solely by untrusted client-supplied tenant ID.
- Setting concurrency above downstream capacity.
- Retrying 429 immediately despite Retry-After.

## Knowledge checks with answers

1. **Rate vs concurrency?** Requests per time vs simultaneous in-flight operations.
2. **What does token bucket allow?** Controlled bursts within a sustained rate.
3. **Why bound queues?** Prevent memory exhaustion and useless stale waiting.

### Exact terms covered

- `Bulkhead pattern`
- `Thread-pool bulkhead`
- `Semaphore bulkhead`
- `Connection-pool bulkhead`
- `Per-tenant bulkhead`
- `Concurrency limit`
- `Concurrency limiter`
- `Rate limiting`
- `Token bucket algorithm`
- `Leaky bucket algorithm`
- `Fixed-window rate limiter`
- `Sliding-window rate limiter`
- `Queue-based rate limiter`
- `Rate limit partition key`
- `Request-rate quota`
- `Concurrency quota`
- `Server-side throttling`
- `Client-side rate limiting`
- `HTTP 429 Too Many Requests`
- `Retry-After back-pressure`
- `Load shedding`
- `Admission control`
- `Queueing delay`
- `Bounded queue capacity`
- `Bulkhead exhaustion response`

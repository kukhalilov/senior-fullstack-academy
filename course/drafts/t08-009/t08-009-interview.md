# retries backoff idempotency circuit breakers and rate limits — Interview questions and reasoning

Sources: <https://learn.microsoft.com/en-us/azure/architecture/patterns/retry>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern>, <https://learn.microsoft.com/en-us/dotnet/core/resilience/>, <https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience>, <https://www.rfc-editor.org/rfc/rfc9110.html>.


## Core questions

1. Why are retries dangerous during an outage?
2. How do you decide whether an operation is safe to retry?
3. Distinguish an attempt timeout from an end-to-end deadline.
4. Explain closed, open, and half-open circuit-breaker states.
5. Compare rate limiting, concurrency limiting, and bulkheads.
6. What should a client do with HTTP 429 and `Retry-After`?
7. When is hedging preferable to retry?
8. What metrics and traces do you need to diagnose a retry storm?

## Concise interview answers

1. Retries increase offered load precisely when capacity is impaired; synchronized clients can amplify a small failure into a larger one.
2. Require plausibly transient failure plus repeatable semantics or durable deduplication. An ambiguous timeout is not proof that the first attempt had no effect.
3. An attempt timeout bounds one physical try; the deadline bounds all attempts, delays, and processing for the logical request.
4. Closed calls normally pass and are sampled; open calls fail fast; half-open permits limited probes to test recovery.
5. Rate limiting bounds arrivals per time, concurrency limiting caps in-flight work, and bulkheads isolate resource pools or workloads.
6. Honor the requested delay within the caller's remaining deadline, add appropriate jitter/co-ordination, and do not retry immediately. If no useful deadline remains, surface throttling or defer durably.
7. Hedging can reduce tail latency when a safe operation is slow but not yet failed. It deliberately adds concurrent load; ordinary retry waits for a failure.
8. Correlate logical calls and attempts; record attempt count, delay, timeout/cancellation reason, breaker state, rate rejections, dependency latency/errors, and saturation.

## Deep follow-up answers

### How do you prevent a retry storm?

Use bounded attempts and a total deadline, exponential backoff with jitter, a retry budget, server back-pressure, concurrency caps, and breaker/admission controls. Avoid retries at every layer and calculate the maximum physical attempts across client, service, proxy, and queue boundaries. Monitor attempts per logical operation and allow cancellation to stop future work.

### How do you make a payment retry safe?

Use a stable idempotency key scoped to the business operation, persist it before sending, and rely on the provider's documented deduplication semantics and retention window. The same key must be used on replay. If the outcome is unknown beyond that guarantee, reconcile/query rather than inventing a new key or reporting a definitive failure.

### How would you choose a breaker threshold?

Use a window, minimum sample, failure or slow-call threshold, and open duration that match traffic and recovery behavior. Avoid thresholds so low that normal variance trips them or so high that protection arrives too late. Treat per-dependency state as isolation, and test half-open probes under both recovery and continued failure.

### What changes when `Retry-After` exceeds the request deadline?

The synchronous request should not wait past its deadline. Return a contractually clear throttled/pending result, or enqueue durable work if asynchronous completion is supported. Do not violate the server's requested delay by retrying sooner.

### How do policy ordering and framework defaults affect design?

Ordering controls whether a breaker sees individual attempts or a final logical outcome and whether an open-circuit rejection is retried. Frameworks may wrap strategies in different orders and change defaults between package versions. Inspect the installed package's current stable docs and test observed attempt counts/deadlines rather than assuming a remembered default.

## Scenario questions

### A user sees intermittent checkout timeouts, but the provider dashboard shows successful charges

Treat this as an ambiguous outcome, not a failed charge. Correlate request/idempotency identifiers, inspect whether retries use the same key, reconcile provider state, and expose pending status while resolution runs. A timeout/retry policy cannot by itself guarantee exactly-once effects.

### A dependency returns 503 and every service retries three times

Map all layers and estimate the multiplier; three retries at multiple layers can produce a large fan-out. Assign retry ownership, budget attempts/deadline, jitter, protect the dependency with a breaker and concurrency cap, and watch offered load versus completion rate.

### One tenant exhausts the API's worker pool

Partition or fairly schedule capacity per tenant/priority, cap concurrency, bound queues, and shed excess work with a clear response. Preserve some shared capacity for critical operations while documenting any reserved-capacity tradeoff.

## Tradeoffs and alternatives

- Fail fast when recovery is unlikely; retry only when another attempt can plausibly help.
- A breaker improves containment, but can reject work during a transient false positive.
- Hedging lowers tail latency at increased load; replicas must be independent enough to make it useful.
- Queueing smooths bursts but adds latency and stale-work risk; reject early when the deadline cannot be met.
- Fallback improves availability only when the alternate result is truthful and safe for that operation.

## Common weak answers

- “Retry every 500 ms until it works.”
- “A timeout means the server did nothing.”
- “Circuit breakers and retries are the same thing.”
- “A 429 is transient, so retry immediately.”
- “Canceling a duplicate guarantees the write was undone.”
- Quoting one library's defaults without naming its package version or testing its order.

## Self-check rubric

- Can you calculate a bounded worst-case duration and maximum attempts across layers?
- Can you explain idempotency, deduplication windows, and ambiguous outcomes?
- Can you distinguish arrival rate from in-flight capacity and queueing?
- Can you explain breaker thresholds and recovery probing?
- Can you select a fallback without concealing failed business effects?
- Can you name the telemetry and failure-injection tests needed to validate the policy?

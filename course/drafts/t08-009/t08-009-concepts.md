# retries backoff idempotency circuit breakers and rate limits — Core concepts and how they fit together

Sources: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead), [Rate Limiting pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern), [.NET resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/), [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience), and [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Learning objectives

Classify failures; set nested and end-to-end timeouts; choose retry eligibility and backoff; explain idempotency; compare breaker states; distinguish rate from concurrency limits; compose policies without retry amplification; and test failure behavior.

## Prerequisites

Know HTTP status/retry semantics, cancellation, dependency calls, idempotent operations, and service-level objectives. Exact package defaults are intentionally not frozen.

## Core concepts

A **transient fault** may resolve shortly, such as a temporary connection reset or throttling response. A **permanent fault** requires correction, such as invalid input. A timeout can leave an **ambiguous operation outcome**: the remote side may have committed even though the client did not receive the response. Classify before retrying.

A **connection/attempt timeout** bounds one phase/attempt; a **request/overall timeout** bounds the end-to-end operation including retries/backoff. Propagate one deadline and cancellation down the call graph; do not give every nested call a fresh full timeout. Timeout amplification occurs when nested timeouts/retries consume more than the caller’s budget. Caller cancellation means the caller no longer needs the result; timeout means the time budget expired. Neither proves remote work stopped.

Retry only failures likely to be transient and operations safe to repeat or protected by an idempotency key/deduplication window. Use bounded attempts, capped exponential backoff, and jitter. HTTP defines `Retry-After` for 503 and redirection responses; a 429 response can also carry it under rate-limit conventions. A **retry budget** limits aggregate retry traffic; a deadline caps total waiting. Nested retry layers multiply requests and can create a retry storm. Durable queue redelivery is a separate retry boundary.

A circuit breaker observes classified outcomes over a sampling window. **Closed** allows calls; crossing thresholds opens the circuit; **open** fails fast for a break duration; **half-open** admits limited probes to test recovery. Minimum throughput avoids reacting to tiny samples. Slow-call thresholds can treat latency saturation as failure. Fallback must preserve product semantics, not hide data loss. A breaker is not a substitute for timeout or retry policy.

Bulkheads isolate resource pools/tenants so one dependency or workload cannot consume all capacity. Rate limiting controls requests admitted per time; concurrency limiting controls in-flight requests. Token bucket allows bounded bursts; leaky bucket smooths output; fixed/sliding windows count arrivals over intervals; queue-based limiters can wait but must bound queue length/delay. Load shedding rejects work before resource exhaustion. HTTP 429 and `Retry-After` communicate throttling/back-pressure.

Hedging sends a second attempt before the first finishes to reduce tail latency. It deliberately increases concurrent load; cancel losing attempts, restrict to idempotent operations, and use endpoint diversity only when the failure domains are independent. Fallback/degradation should be operation-criticality aware. Pipeline composition determines which policy sees each failure and whether attempt timeouts count toward breaker metrics.

## Mechanisms and relationships

```text
rate/admission control → total deadline → retry/backoff → breaker → attempt timeout
rate limit: arrivals per time; concurrency limit: simultaneous work
retry: repeat; breaker: stop likely failing calls; bulkhead: isolate capacity
idempotency key + atomic dedup record → safe repeated business effect
```

## Worked examples

For GET of a product, a bounded retry on a transient 503 may be safe. For POST that creates a payment, retry only when the provider accepts a stable idempotency key or the application can deduplicate. A 429 with `Retry-After` should not cause an immediate retry storm. Ensure all waits fit within the user deadline.

## Misconceptions and edge cases

- Timeout does not mean the remote side effect did not happen.
- Retry without jitter can synchronize clients into a thundering herd.
- Breakers need enough traffic to distinguish failures from noise.
- Rate limits and concurrency caps are different controls.
- Hedging improves latency only if spare capacity and independent endpoints exist.
- Stacking default resilience handlers can multiply retries/timeouts.

## Knowledge checks with answers

1. **What is the retry safety condition?** Transient failure plus repeatable/idempotent effect or deduplication.
2. **What does half-open do?** Allows limited probes to assess recovery.
3. **Rate versus concurrency limit?** Arrivals over time versus simultaneous in-flight work.
4. **Why use an overall deadline?** To bound all attempts and delays to caller budget.

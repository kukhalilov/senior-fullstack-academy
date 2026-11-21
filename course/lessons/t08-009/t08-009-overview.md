# retries backoff idempotency circuit breakers and rate limits — Big-picture orientation and mental model

Sources: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), [Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead), [Rate Limiting pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern), [.NET resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/), [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience), and [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Problem and purpose

Distributed dependencies fail, slow down, or become overloaded. Resilience strategies limit damage and control work, but each addresses a different failure behavior and can amplify harm when composed without a clear policy.

## Plain-language mental model

Set a deadline for waiting. Retry only plausibly transient failures when repeating the operation is safe. Back off and add jitter to spread retry traffic. Stop calling a dependency likely to fail with a circuit breaker. Isolate capacity with bulkheads; control admission with rate/concurrency limits. Degrade optional work deliberately.

## How the parts fit together

```text
admission / rate limit
  → overall deadline
      → bounded retry
          → circuit breaker
              → per-attempt timeout
                  → dependency call
```

Policy order changes behavior. The overall deadline must include attempts and delays; cancellation should propagate. Server `Retry-After` is back-pressure guidance. Hedging sends parallel attempts to reduce tail latency but consumes more capacity and requires idempotency.

## Concept map

Timeout bounds waiting, retry repeats, breaker suppresses likely failures, bulkhead isolates resource pools, and rate limiter controls arrivals over time. A concurrency limiter caps in-flight operations; a rate limiter caps admissions over a time interval. Idempotency/deduplication protects repeated side effects. None guarantees eventual success.

## End-to-end walkthrough

A service calls a payment provider. The caller has a two-second overall deadline and a shorter attempt timeout. It retries a safe idempotent request only on transient transport failures with capped exponential backoff/jitter, respecting `Retry-After`. A breaker opens after a meaningful failure window and periodically allows a probe. A per-provider semaphore prevents one dependency consuming all threads/connections. A token bucket limits tenant request rate. If unavailable, the product returns a clear pending/retryable result rather than charging twice.

## When to use it and tradeoffs

Add strategies from observed failure modes and explicit SLOs. Retries increase load; breakers can reject recoverable work; queues add delay; rate limits reject legitimate bursts; bulkheads leave some capacity idle. Keep timeouts/deadlines bounded and test the whole pipeline under failure.

## What later lessons cover

References explain failure/timeout boundaries, retry safety/backoff, breaker states, capacity isolation/limits, and policy composition/observability. Broker redelivery and outbox/saga recovery are covered elsewhere.

## Version notes

The strategy concepts are stable; exact `.NET 11` `Microsoft.Extensions.Http.Resilience` defaults depend on the stable package version. Current guidance includes standard and custom pipelines. Verify installed package defaults and ordering rather than copying historical numbers.

# retries backoff idempotency circuit breakers and rate limits — Exercises and worked solutions

Sources: <https://learn.microsoft.com/en-us/azure/architecture/patterns/retry>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead>, <https://learn.microsoft.com/en-us/azure/architecture/patterns/rate-limiting-pattern>, <https://learn.microsoft.com/en-us/dotnet/core/resilience/>, <https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience>, <https://www.rfc-editor.org/rfc/rfc9110.html>.


## Goals

- Design bounded resilience for an idempotent read and a non-idempotent write.
- Calculate an operation deadline and identify retry amplification.
- Choose overload behavior that protects both caller and dependency.
- Test recovery and observability, not just the happy path.

## Worked example

An order API calls a payment provider. The caller deadline is 2 seconds. A charge request times out after submission, so its outcome is ambiguous. Blind retry could charge twice. The service instead persists a stable idempotency key with the order, sends the same key for any safe replay, and queries/reconciles the provider when the result remains unknown. It applies a short per-attempt timeout within the remaining deadline, no retry for validation/authentication errors, bounded jittered retry for documented transient responses, and respects bounded `Retry-After`. A per-provider concurrency cap and breaker stop excess work. Exhaustion returns a pending/unknown state rather than claiming payment failed. Telemetry records the logical payment and each attempt without logging the key as a secret.

## Exercises

1. **Budget:** A read has a 1.2 s deadline, a 100 ms connection allowance, two attempts each capped at 350 ms, and one 150 ms backoff. Can this fit? What else needs budget?
2. **Retry safety:** Classify retry eligibility for a GET that receives 503, a POST charge that times out after sending, a POST with provider-supported idempotency key, and a 400 validation error.
3. **Overload:** A downstream service returns 429 with `Retry-After: 4`, while your caller deadline has 1.5 s left. Decide whether and when to retry.
4. **Composition:** Explain how a breaker outside a retry loop differs from a breaker inside it. State which signal you want each to count.
5. **Capacity:** Your service has 80 concurrent slots and one tenant generates 70 long-running exports. Propose isolation and admission behavior without promising that unused reserved capacity is free.
6. **Recovery test:** Specify a failure-injection sequence that proves a breaker opens, limits calls, probes recovery, and closes without a retry storm.
7. **Hedging:** A search read has a 300 ms tail-latency problem. Propose a safe hedge policy and list its load/cancellation risks.

## Progressive hints

1. Sum sequential upper bounds, then reserve time for parsing/response and scheduling uncertainty. Check whether attempts actually run sequentially.
2. Ask whether the operation can already have taken effect and whether the status is plausibly transient.
3. The server asks you to wait longer than the caller's remaining useful time.
4. Draw the nesting and identify the unit counted as a failure.
5. Separate interactive and export capacity, bound queues, and define rejection.
6. Observe state and call counts with a controllable dependency, then restore it and advance any clock/delay.
7. Use only a safe read, start a small bounded duplicate after a measured delay, cancel the loser, and monitor extra traffic.

## Complete solutions

1. The stated sequential caps total 100 + 350 + 150 + 350 = 950 ms, leaving 250 ms for response handling, scheduling, and return. It fits only if the caps are truly enforced and no hidden retries occur. A total timeout at 1.2 s and cancellation propagation enforce the ceiling; adjust attempt budget if additional overhead is material.
2. GET/503 is generally retryable within a bounded policy, provided the endpoint honors safe read semantics. A charge timeout after submission is ambiguous and unsafe to repeat blindly. A provider-supported stable idempotency key can make replay safe within its documented scope/window, but reconciliation may still be required. A 400 validation error is permanent until input changes and should not be retried.
3. Do not wait four seconds when only 1.5 seconds remain. Return a defined throttled/pending result or fail within the caller contract; a background durable workflow may retry later if that is part of the API. Never shorten server guidance into an immediate retry.
4. An outer breaker around retries sees one logical outcome after retry exhaustion; an inner breaker can observe each attempt and may open sooner. Select deliberately, exclude breaker-open rejections from retry, and verify actual library order.
5. Cap exports in a separate bulkhead (for example a small bounded worker pool) and maintain interactive admission capacity. Decide whether unused slots may be borrowed, and ensure borrowing can be revoked or bounded. Reject or queue only a small bounded amount with an age limit; return an explicit overload response.
6. Inject repeated transient failures until the configured sample/threshold opens the breaker; assert calls stop or are rejected locally. Advance through open duration, allow only bounded half-open probes, keep failures to ensure it reopens, then restore the dependency and assert a successful probe closes it. Track physical attempt counts and verify retries do not multiply probes.
7. Measure tail latency first. Hedge only idempotent reads, start at a quantile-derived delay, permit at most one extra attempt, cancel/ignore the loser, and keep total deadline and concurrency budget. Compare p95/p99 improvement against added request volume and downstream saturation.

## Tests and edge cases

- Ensure cancellation during backoff prevents another attempt.
- Ensure a server delay larger than the remaining deadline does not cause a shortened, premature retry.
- Ensure a timeout after side-effect submission remains an ambiguous state until deduplicated or reconciled.
- Ensure nested retry layers have a known maximum physical-attempt count.
- Ensure queue saturation and rate rejection produce bounded, observable responses.
- Ensure breaker recovery probes cannot stampede and fallback does not conceal a failed write.

## Reflection questions

- Which layer owns the end-to-end deadline, and how is remaining time propagated?
- Which failures can safely be replayed, and what evidence supports that claim?
- What telemetry would distinguish a downstream outage from local saturation?
- What is the exact maximum additional load your retry and hedge policy can create?

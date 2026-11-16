# retries backoff idempotency circuit breakers and rate limits — Reference: Resilience pipeline composition, hedging, fallback, and operational evidence

Sources: [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience), [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), and [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson covers composition and operational evidence for resilience policies. Current Microsoft guidance documents standard and custom `Microsoft.Extensions.Http.Resilience` pipelines; strategy order and defaults depend on the installed stable package version. The principles below are portable, while configuration APIs and defaults are not.

## How this group fits the mental model

Policies form a boundary around a remote operation. Their order determines which failures each policy sees, how many attempts occur, which deadline applies, and whether a rejection is retried. Telemetry must expose both the logical operation and its internal attempts.

## Supplied names explained

### Resilience strategy pipeline

An ordered composition of timeout, retry, breaker, limiter, fallback, or hedging strategies around an operation. Treat the logical call as one unit with a deadline, even if strategies create multiple attempts.

### Outer versus inner policy ordering

An outer strategy observes the whole execution of inner strategies. Moving a breaker outside retry may count one logical failure after retries; placing it inside may observe individual attempts. State intended semantics explicitly and verify the framework's actual nesting convention.

### Total request timeout around retries

The total timeout bounds the full operation, including retry delays and attempts. It should be consistent with the caller's deadline and leave time for response processing; otherwise the caller waits after it no longer needs the result.

### Attempt timeout inside retry

An attempt timeout bounds one try. On expiry, retry only if the operation is safe and budget remains. Each attempt's timeout plus delays must fit inside the total deadline.

### Retry then circuit breaker composition

With a breaker observing the retry-wrapped logical call, one final failure may count once after retries are exhausted. This can reduce breaker sensitivity to individual transient attempts; exact behavior depends on nesting.

### Circuit breaker then retry composition

When retry calls through a breaker, an open breaker can reject attempts quickly and may itself be treated as retryable unless explicitly excluded. Avoid loops that repeatedly retry a known-open circuit.

### Hedging strategy

Hedging starts a second attempt after a delay while the first is still running, then uses an acceptable result and cancels or ignores losers. It can reduce tail latency but increases load, so limit parallel attempts and apply only to safe operations.

### Hedged request cancellation

Cancel losing attempts promptly when a winner is selected, and propagate caller cancellation. Cancellation is cooperative; downstream work may continue, so hedging still consumes capacity and must be measured.

### Hedging idempotency requirement

Concurrent duplicates can perform side effects more than once. Hedge reads or operations protected by reliable idempotency/deduplication; merely canceling the loser does not prove it had no effect.

### Fallback strategy

Returns an alternative result after a defined failure. Fallback must preserve the contract and make degraded/stale data visible where relevant; it must not fabricate success for a failed write.

### Graceful degradation

Reduce optional functionality while preserving essential service, such as omitting recommendations when that dependency fails. Define degraded behavior, cache age, and recovery so it does not silently become permanent.

### Resilience policy by operation criticality

Choose deadlines, retry budget, and fallback according to user/business impact. A health probe, payment write, and optional analytics call should not inherit one generic policy without analysis.

### Resilience policy by dependency

Set behavior per dependency's latency, quota, idempotency, and failure contract. Keep isolated breaker/limiter state where one dependency's behavior should not affect another.

### Resilience telemetry event

Structured event for attempt start/end, retry, timeout, breaker transition, rejection, hedge, fallback, and final outcome. Include bounded-cardinality dependency/operation identifiers and correlation context.

### Retry count metric

Measure attempts and retries separately from logical request count. Track distributions and retry rate; high retries may indicate an incident even when final success remains high.

### Circuit state metric

Expose transitions/current state and rejected calls per dependency. Avoid high-cardinality labels such as user IDs, and pair state with request outcomes to avoid misreading an idle open breaker.

### Rate-limit rejection metric

Count rejected/queued work with reason and relevant quota scope. Distinguish local admission rejection from a downstream 429 so operators can identify which boundary is overloaded.

### Timeout and cancellation metric

Record timeout separately from caller cancellation and other failures. This distinction avoids retrying work the caller intentionally abandoned and helps locate the deadline boundary that fired.

### Dependency health signal

Use latency, error rate, saturation, and business-level signals; a successful TCP connection alone does not mean the dependency can serve useful requests. Avoid health checks that amplify an outage.

### Failure-injection test

Deliberately simulate delay, connection failure, 429/503, partial response, cancellation, and recovery. Assert bounded attempts, deadlines, side-effect safety, and recovery behavior rather than just asserting that a fallback exists.

### Retry and rate-limit coordination

Use bounded retries, jitter, quota-aware scheduling, and server `Retry-After` together. A retry policy that ignores throttling can amplify load and make an overload persist.

## Cross-item comparison

Total timeout bounds the logical call; attempt timeout bounds one execution. Retry is sequential; hedging is concurrent. Fallback supplies a defined alternate result, while graceful degradation is a broader product behavior. Metrics should separate logical requests, attempts, and local/downstream rejections.

## Examples

Suppose an idempotent catalog read has a 1.5-second caller deadline. Allocate an overall budget, permit at most two short attempts with jitter, honor a bounded server retry delay, and use a breaker to stop repeated calls during sustained failure. A stale cache can be a labeled fallback. Emit one logical-call trace with child spans for attempts; verify with injected latency, 503, 429, cancellation, and breaker recovery.

## Common mistakes

- Stacking framework defaults without checking their actual ordering or total worst-case duration.
- Multiplying retry counts across client, service, and proxy layers.
- Treating cancellation as a transient dependency error.
- Hedging side effects or assuming cancellation undoes them.
- Returning stale fallback data without exposing its age or degraded status.
- Using user identifiers as metric labels and creating unbounded cardinality.
- Testing only the first failure and never testing recovery or overload.

## Knowledge checks with answers

1. **Why does strategy order matter?** It changes what constitutes a failure, how many calls a breaker counts, and whether a rejection is retried.
2. **How do total and attempt timeouts differ?** One caps the complete logical operation, the other one attempt.
3. **Why isn't hedged cancellation enough for write safety?** A losing attempt may already have committed its side effect.
4. **What should telemetry distinguish?** Logical requests, physical attempts, local admission failures, downstream responses, timeouts, and caller cancellations.

### Exact terms covered

- `Resilience strategy pipeline`
- `Outer versus inner policy ordering`
- `Total request timeout around retries`
- `Attempt timeout inside retry`
- `Retry then circuit breaker composition`
- `Circuit breaker then retry composition`
- `Hedging strategy`
- `Hedged request cancellation`
- `Hedging idempotency requirement`
- `Fallback strategy`
- `Graceful degradation`
- `Resilience policy by operation criticality`
- `Resilience policy by dependency`
- `Resilience telemetry event`
- `Retry count metric`
- `Circuit state metric`
- `Rate-limit rejection metric`
- `Timeout and cancellation metric`
- `Dependency health signal`
- `Failure-injection test`
- `Retry and rate-limit coordination`

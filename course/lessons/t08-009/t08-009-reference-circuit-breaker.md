# retries backoff idempotency circuit breakers and rate limits — Reference: Circuit state, failure windows, recovery probing, and fallback

Sources: [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) and [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience).

## Scope and version

This lesson describes breaker behavior and tuning concepts. Exact library configuration and defaults are package-version-specific.

## How this group fits the mental model

A breaker uses recent dependency outcomes to decide whether new calls should proceed, fail fast, or probe recovery. It reduces waste and cascading load; it does not itself retry or repair the dependency.

## Supplied names explained

### Circuit breaker pattern

Tracks selected failures/slow calls and temporarily blocks requests after a threshold. It prevents repeated work against an impaired dependency and gives it room to recover.

### Closed circuit state

Calls flow to the dependency while outcomes are sampled. Enough failures/slow calls can open the circuit.

### Open circuit state

Calls fail fast or use a defined fallback without contacting the dependency for a configured break duration. This saves resources but can reject calls to a recovering service.

### Half-open circuit state

Allows a limited number of probes after the break duration. Success can close the breaker; failure reopens it. Avoid allowing many probes to stampede recovery.

### Failure-count threshold

Opens after a set number of failures within a relevant interval. It is sensitive to traffic volume and may misbehave with low throughput.

### Failure-ratio threshold

Opens when the failure proportion in a sample window exceeds a target. Pair with minimum throughput so one failure among one request does not define the dependency’s health.

### Minimum throughput threshold

Minimum call/sample count before evaluating ratios. Too high delays protection in low traffic; too low creates noisy state transitions.

### Sampling window

Time interval for measuring failures, slow calls, and throughput. Window size balances responsiveness with noise; choose from dependency recovery behavior and request volume.

### Open-state break duration

How long calls are blocked before half-open probes. Long duration reduces load but delays recovery detection; short duration may repeatedly overload an unhealthy service.

### Half-open probe request

A limited test call used to see whether the dependency recovered. It should be safe, representative, and constrained so probe traffic does not worsen load.

### Circuit-breaker reset

Transition from open/half-open back to closed after successful recovery criteria. Reset semantics and concurrency must be understood; do not manually reset repeatedly to hide instability.

### Circuit-breaker fallback

Alternative behavior when the circuit is open, such as cached/stale data or a clear temporary-unavailable result. It must not invent success or violate business invariants.

### Circuit-breaker exception

An exception/result indicating the circuit is open and the call was not attempted. Map it to an appropriate application outcome rather than retrying it immediately.

### Slow-call threshold

Latency criterion that can count a call as unhealthy even if it eventually succeeds. It can detect saturation before failures, but slow thresholds must match SLOs and avoid penalizing normal variability.

### Failure classification predicate

Rule deciding which results/exceptions count as breaker failures. Exclude caller cancellation and business rejections where appropriate; include only dependency-health signals.

### Circuit breaker versus retry

Retry repeats one operation after selected failures; breaker suppresses future calls based on a sample of outcomes. Combining them requires knowing which attempt results feed the breaker and avoiding retry loops against an open circuit.

### Circuit-breaker event telemetry

Signals for state transitions, rejected calls, sampled failures, and slow calls. Include dependency identity but avoid high-cardinality or sensitive request attributes.

### Per-dependency circuit isolation

Use separate breaker state for distinct dependencies/critical operations so one unhealthy service does not open circuits for unrelated work. Scope should match failure domain and traffic characteristics.

## Cross-item comparison

Closed allows calls; open blocks; half-open probes. Failure count suits volume-aware thresholds; failure ratio needs minimum throughput/window. Breaker fallback must preserve semantics and is separate from retry.

## Examples

An inventory dependency is slow. After enough slow calls in a sampled window, the breaker opens; checkout uses cached availability with an explicit stale indicator or fails safely. After a short break, a limited health/read probe determines whether to close. Payment calls use a separate breaker.

## Common mistakes

- Counting validation errors or caller cancellations as dependency failures.
- Opening on a tiny sample without minimum throughput.
- Retrying the breaker-open exception immediately.
- Using fallback that claims an unconfirmed transaction succeeded.
- Sharing one breaker across unrelated dependencies.

## Knowledge checks with answers

1. **What state admits limited recovery checks?** Half-open.
2. **Why minimum throughput?** Avoid decisions from tiny/noisy samples.
3. **What does the breaker not do?** It does not repair or guarantee retry success.

### Exact terms covered

- `Circuit breaker pattern`
- `Closed circuit state`
- `Open circuit state`
- `Half-open circuit state`
- `Failure-count threshold`
- `Failure-ratio threshold`
- `Minimum throughput threshold`
- `Sampling window`
- `Open-state break duration`
- `Half-open probe request`
- `Circuit-breaker reset`
- `Circuit-breaker fallback`
- `Circuit-breaker exception`
- `Slow-call threshold`
- `Failure classification predicate`
- `Circuit breaker versus retry`
- `Circuit breaker event telemetry`
- `Per-dependency circuit isolation`

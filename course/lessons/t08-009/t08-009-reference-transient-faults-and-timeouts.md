# retries backoff idempotency circuit breakers and rate limits — Reference: Failure classification, operation deadlines, and timeout boundaries

Sources: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), [Circuit Breaker pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker), [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience), and [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson covers fault classification and deadline boundaries. Runtime/package timeout defaults are version-specific and intentionally not prescribed.

## How this group fits the mental model

Classification determines whether to retry, fail immediately, or open a circuit. One end-to-end time budget must bound all waits and attempts, with cancellation propagated to reduce wasted work.

## Supplied names explained

### Transient fault

A temporary condition that may succeed later without changing input, such as brief network interruption or overload. It is a hypothesis; bounded attempts and telemetry are needed.

### Permanent fault

A condition unlikely to succeed through immediate repetition, such as invalid request or unsupported operation. Correct input/configuration rather than retrying.

### Ambiguous operation outcome

The caller cannot tell whether the remote operation completed, often because response/connection failed after the server acted. Treat writes as possibly committed and use idempotency or query status.

### Connection timeout

Maximum wait to establish a network connection/handshake. It is one phase budget, not a bound on full response time.

### Request timeout

Bound on a request’s total wait according to the client/runtime. Clarify whether retries are included or each attempt gets its own timeout.

### Attempt timeout

Maximum duration for one individual attempt. It should fit inside the overall deadline; retrying after an attempt timeout may duplicate a completed remote side effect.

### Overall operation timeout

End-to-end bound covering queueing, attempts, backoff, and response handling. It should align with the caller’s deadline and user experience.

### Deadline propagation

Pass the remaining time budget to downstream calls so they stop before the original caller budget expires. Do not restart a full timeout at every hop.

### Cancellation propagation

Forward cancellation tokens/signals through asynchronous work to stop unneeded local operations and, where supported, remote work. A cancellation request is cooperative and does not guarantee rollback.

### Timeout budget

The time allocated to each layer/attempt while remaining within the end-to-end target. Reserve time for serialization/response and downstream dependencies; avoid summing nested limits beyond the caller budget.

### Timeout amplification

Nested retries/timeouts can cause total wait and work to greatly exceed a request budget. Propagated deadlines and one coordinated retry owner prevent hidden multiplication.

### Slow dependency

A dependency whose response latency or resource use exceeds expectations. Slow calls can consume connection pools and concurrency even before hard failures occur.

### Failure detection delay

Time before a system decides a call/dependency has failed. Too short creates false failures; too long ties up resources and users. Timeouts and breaker windows help but are imperfect signals.

### Caller cancellation versus timeout

Caller cancellation indicates demand disappeared; timeout indicates a deadline elapsed. Both should stop unneeded work, but telemetry and retry policy may distinguish them. Do not retry work the caller canceled unless background completion is intentional.

### Timeout versus circuit breaker

Timeout bounds how long an individual operation waits. Circuit breaker uses a history of failures/slow calls to suppress future calls temporarily. Breaker needs outcome signals; timeout can generate one.

## Cross-item comparison

Connection timeout covers setup; attempt timeout covers one call; overall timeout includes the full policy pipeline. Cancellation can happen at any stage. A slow dependency may trigger timeout and then breaker thresholds, but each policy has a distinct scope.

## Examples

Caller budget is 900 ms; connection setup gets at most 150 ms, each call attempt at most 250 ms, and backoff/retry fits only if time remains. A second attempt should not start after the overall deadline. If a payment POST times out, query by idempotency key before treating it as failed.

## Common mistakes

- Assigning each nested service a fresh full timeout.
- Retrying caller cancellation.
- Treating a timeout as proof of no side effect.
- Setting attempt timeout greater than overall request timeout.
- Using identical timeout values for connection and response phases without evidence.

## Knowledge checks with answers

1. **Which timeout includes retries?** Overall operation timeout when designed end-to-end.
2. **What is ambiguous after a write timeout?** Whether the remote side committed.
3. **What does a breaker add beyond timeout?** It suppresses future calls based on observed failures.

### Exact terms covered

- `Transient fault`
- `Permanent fault`
- `Ambiguous operation outcome`
- `Connection timeout`
- `Request timeout`
- `Attempt timeout`
- `Overall operation timeout`
- `Deadline propagation`
- `Cancellation propagation`
- `Timeout budget`
- `Timeout amplification`
- `Slow dependency`
- `Failure detection delay`
- `Caller cancellation versus timeout`
- `Timeout versus circuit breaker`

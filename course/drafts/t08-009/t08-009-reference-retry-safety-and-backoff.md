# retries backoff idempotency circuit breakers and rate limits — Reference: Retry eligibility, bounded backoff, and overload feedback

Sources: [Retry pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry), [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience), and [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson teaches retry decisions and timing policy. Queue redelivery and broker retry features are separate. Exact resilience package defaults depend on the installed stable version.

## How this group fits the mental model

Retry is additional load. Classify the failure, prove repeat safety, bound the attempts and time, spread retries, and honor dependency back-pressure.

## Supplied names explained

### Retry pattern

Repeat a failed operation when the failure may be transient. It improves recovery from brief faults but increases latency and load and can duplicate effects.

### Retryable failure classification

Explicit criteria for failures worth repeating, such as selected network exceptions or 503 responses. Keep the predicate narrow and dependency-specific.

### Non-retryable failure classification

Failures such as validation/authentication errors that repeating unchanged will not fix. Fail fast and return a useful error.

### Retry safety for idempotent operation

Repeating the same intended operation yields no additional unintended state change. HTTP idempotence or application semantics support retry, but external side effects still require correct implementation.

### Retry safety for non-idempotent operation

A non-idempotent write may happen more than once if the first result is uncertain. Add a stable idempotency key and server-side deduplication or avoid automatic retry.

### Idempotency key

A client-supplied unique operation identity stored by the server with its result/effect. Scope by principal/operation, validate replayed payload consistency, and retain long enough for retries.

### Deduplication window

How long the server remembers processed keys/messages. A too-short window permits delayed duplicates; a long window costs storage and can interact with business key reuse.

### Bounded retry count

Maximum attempts/retries. Distinguish attempts from retries in user-facing/config values and include the initial attempt in total counts.

### Exponential backoff

Increase wait after each retry multiplicatively to reduce pressure during outages. Without a cap/jitter, delays can grow large or clients synchronize.

### Capped exponential backoff

Exponential delay stops increasing past a maximum. Combine with an overall deadline so the cap does not imply infinite retries.

### Fixed backoff

Same delay between retries. Simple but can synchronize clients and produce repeated load spikes.

### Random jitter

Random variation added to retry delays to spread clients’ attempts over time and reduce synchronized retry storms.

### Full jitter

Choose a random delay from zero to the current exponential cap. It spreads clients broadly but some retries occur very soon.

### Decorrelated jitter

Choose the next delay based on a randomized range relative to the prior delay. It smooths retry timing; select an algorithm with known bounds and test expected distribution.

### Retry budget

Limits aggregate retry traffic, often as a ratio/count relative to original requests. It preserves capacity for new work during partial outages.

### Retry deadline

Latest time by which another retry may begin/complete within the operation’s overall deadline. Do not launch an attempt that cannot usefully complete before cancellation.

### `Retry-After` response field

HTTP response field communicating when the client should try again, as a date or delay-seconds form per HTTP semantics. It is back-pressure guidance, not permission to ignore the caller deadline.

### Retry after rate-limit response

For HTTP 429 or similar quota rejection, honor server delay/limits and use bounded jitter. Immediate retries defeat admission control.

### Retry storm

Many clients retry simultaneously after a shared fault, overwhelming a recovering dependency. Jitter, budgets, backoff, breakers, and load shedding reduce the feedback loop.

### Retry amplification

Retries cause more downstream attempts than incoming operations. Measure attempts/request and account for each layer.

### Nested retry multiplication

Retries at several call layers multiply; three layers each with 3 attempts can create up to 27 downstream attempts. Choose one retry owner or coordinate budgets/deadlines.

### Client-side versus server-side retry

Client retries tolerate lost response/network failures but may be unsafe for side effects. Server-side retries keep policy near dependency knowledge but can hide latency and multiply work. Define one owner and expose attempt telemetry.

### Retry versus resubmit from a durable queue

An in-call retry repeats within the request deadline; queue redelivery persists work for later attempts with broker-specific acknowledgement/retention. They have different ordering, duplicate, and observability boundaries.

## Cross-item comparison

Exponential backoff reduces frequency; jitter de-synchronizes clients. Retry budget controls total extra load; retry count limits one operation. Client and server retries must share an overall budget. A durable queue retry survives request/worker boundaries.

## Examples

On 503, retry an idempotent GET at most twice with capped exponential delay plus jitter, stopping before the total deadline. On 429, honor `Retry-After`. Do not automatically retry a payment creation POST unless an idempotency key is enforced by the provider.

## Common mistakes

- Retrying permanent 4xx failures.
- Retrying unsafe writes after ambiguous outcomes.
- Ignoring Retry-After and immediately retrying 429.
- Configuring independent nested retries.
- Treating “three retries” as three total attempts without clarifying.

## Knowledge checks with answers

1. **Why jitter?** Reduce synchronized retry bursts.
2. **What does Retry-After mean?** Server guidance for when to retry.
3. **How many downstream calls can nested 3-attempt layers create?** Up to the product of attempts across layers.

### Exact terms covered

- `Retry pattern`
- `Retryable failure classification`
- `Non-retryable failure classification`
- `Retry safety for idempotent operation`
- `Retry safety for non-idempotent operation`
- `Idempotency key`
- `Deduplication window`
- `Bounded retry count`
- `Exponential backoff`
- `Capped exponential backoff`
- `Fixed backoff`
- `Random jitter`
- `Full jitter`
- `Decorrelated jitter`
- `Retry budget`
- `Retry deadline`
- `Retry-After response field`
- `Retry after rate-limit response`
- `Retry storm`
- `Retry amplification`
- `Nested retry multiplication`
- `Client-side versus server-side retry`
- `Retry versus resubmit from a durable queue`

# IHttpClientFactory resilience retries and timeouts — Exercises and worked solutions

## Goals

By the end, you can diagnose client/handler lifetime bugs, configure a bounded retry policy, distinguish timeout layers, and protect a downstream service without duplicating unsafe writes. These scenarios use only the topic's supplied HTTP client and resilience surface. [IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory) [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

## Worked example

### Scenario

An order service calls a catalog for reads and a payment provider for charges. The catalog occasionally returns 503 during deployments. A payment POST sometimes times out after the provider has accepted it. The app currently registers one standard resilience handler globally and another for each typed client. A typed client is injected into a singleton background worker.

### Reason through the design

1. **Remove duplicate handlers.** Inspect the final registration chain and keep one deliberate pipeline per client. Stacked retries multiply attempts and timeout layers obscure the deadline.
2. **Fix the singleton capture.** A factory-created typed client is intended to be short-lived. Have the singleton use `IHttpClientFactory` to create a client for each operation, or redesign the worker's lifetime; do not capture a typed client indefinitely and expect handler rotation to affect it.
3. **Separate clients by operation policy.** The catalog read can retry selected transient outcomes with bounded attempts/backoff. The charge client must disable unsafe-method retries unless the provider's durable idempotency contract is used.
4. **Set a total budget.** Choose caller, total-pipeline, and per-attempt deadlines so the nested budgets fit the job/request deadline. Propagate cancellation and leave time for response parsing and cleanup.
5. **Handle the uncertain payment result.** A timeout does not prove no charge occurred. Use a stable idempotency key generated for the logical payment, persist it with the operation, and reconcile using the provider's documented lookup/result contract.
6. **Observe the system.** Record bounded metrics for status, retries, timeouts, breaker state, and latency. Redact credentials and avoid high-cardinality user or URL labels.

The key is to make repeatability and deadline ownership explicit before enabling resilience. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience) [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)

## Exercises

### Exercise 1: count the attempts

An HTTP retry strategy has `MaxRetryAttempts = 3`. A job layer also retries the whole operation three times. What is the maximum number of requests to the downstream service if both layers exhaust their retries? Why is the result operationally risky?

### Exercise 2: choose a retry policy

For each operation, say whether the standard retry handler should retry by default, what you would configure, and what extra contract is needed:

1. `GET /products/42` returns 503.
2. `POST /payments` times out after sending its body.
3. `PUT /profile/42` returns 429 with `Retry-After`.
4. `GET /reports/large` sends a consumed, non-seekable stream as a request body and then times out.

### Exercise 3: calculate a timeout hierarchy

The incoming request deadline is 8 seconds. The standard pipeline's total timeout is 20 seconds, each attempt timeout is 5 seconds, and it allows three retries with delay. What bounds the caller-visible duration? What should be changed, and what work must receive the caller token?

### Exercise 4: typed client and DNS

A singleton hosted service receives `CatalogClient` through constructor injection. The factory handler lifetime is two minutes. Explain why the singleton can still use an old handler after that lifetime expires. Give two viable designs for the worker and describe DNS refresh in the long-lived-client option.

### Exercise 5: breaker or limiter?

The inventory service is healthy but receives a burst that exceeds its capacity. A separate payment service is failing persistently. Which strategy best addresses each condition? Explain why they are not interchangeable.

### Exercise 6: inspect handler scope

A custom `DelegatingHandler` constructor injects an incoming-request scoped `CurrentUser` and stores its tenant ID in a field. The handler is factory-pooled. Identify the leak/race and propose a safer path for request-specific information.

### Exercise 7: streaming and ownership

An endpoint downloads a 2 GB archive using `ResponseHeadersRead`. The code returns the stream but disposes `HttpResponseMessage` before the caller copies it. Explain the bug and outline a correct ownership contract.

### Exercise 8: retry ordering and callbacks

An outer logging handler logs one request, while a resilience handler retries four times. What should the logs/metrics distinguish? How can registration order affect whether the logging handler sees one operation or each attempt?

## Progressive hints

1. Count the initial request at each layer, then multiply the maximum nested attempt counts.
2. A 503/429 may be transient, but a timeout on a write leaves the result uncertain. A body must be reproducible for another attempt.
3. The earliest cancellation wins. A pipeline cannot extend the inbound deadline; send the token through HTTP, body reads, and downstream work.
4. Rotation affects newly created clients/handler pipelines; it cannot replace the handler already held by a captured client. A long-lived client needs connection lifetime management.
5. One strategy rejects excess concurrent admission; the other stops calls after observed failures.
6. Factory handler scope is not the ASP.NET request scope. Put values on `HttpRequestMessage.Options` or use a per-request wrapper; do not retain them on a shared handler.
7. A response owns its content stream. Keep it alive until the copy completes, then dispose it.
8. Decide whether telemetry describes logical operations or individual attempts, then position instrumentation accordingly and avoid double counting.

## Complete solutions

### Solution 1

Each layer makes one initial call plus three retries: four attempts at each layer. If the outer layer repeats the entire inner operation four times, the downstream can receive up to `4 × 4 = 16` attempts. This consumes capacity during failure, increases latency and cost, and can duplicate side effects. Assign retry ownership and a combined deadline rather than reasoning about each layer in isolation.

### Solution 2

1. A catalog GET returning 503 is a plausible transient failure. A bounded retry with exponential backoff/jitter and an overall timeout is reasonable, provided the endpoint is read-only by contract.
2. The standard HTTP handler retries unsafe methods unless configured otherwise. Disable POST retries, or use the provider's durable idempotency-key contract and ensure each attempt can recreate the request body. A timeout leaves the charge outcome unknown.
3. A 429 may be transient and `Retry-After` expresses server guidance. Configure the selected policy to handle that outcome and respect supported server delay semantics, while clamping it to the caller's total budget. Confirm PUT is truly idempotent for this endpoint and its side effects.
4. Do not retry a consumed, non-seekable request body unless the application can create a fresh equivalent body per attempt. A GET with a body is unusual and has inconsistent intermediary behavior; verify the API contract before choosing a policy.

### Solution 3

The caller's 8-second deadline bounds the local operation even though the pipeline total timeout is 20 seconds. Configure the pipeline total timeout at or below the remaining caller budget, accounting for parsing/cleanup; keep each attempt timeout shorter than the total. Pass the caller token through `SendAsync`, content/stream reads and deserialization, and any downstream work. Do not assume cancellation stops server-side processing.

### Solution 4

The singleton holds one typed client and its `HttpClient` for its entire lifetime. When the factory rotates a handler, that existing client is not rewritten to use the new pipeline; it can therefore keep the old handler and DNS/connection behavior. One design is to inject `IHttpClientFactory` and create a named client per worker operation. Another is a deliberately long-lived client backed by `SocketsHttpHandler` with `PooledConnectionLifetime`. In the latter, DNS is resolved for new connections after old pooled connections age out; active connections are not forcibly replaced at the instant the lifetime passes. [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting) [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

### Solution 5

Use a concurrency limiter (and possibly a rate limiter at the appropriate boundary) to bound the healthy inventory service's admitted work. Use a circuit breaker for persistent payment failures so repeated calls stop temporarily and allow recovery probes. The limiter protects capacity regardless of failure; the breaker responds to observed failure and does not impose a general concurrency cap.

### Solution 6

The factory creates handler DI scopes separate from incoming request scopes and pools handlers. The stored tenant can be stale or shared across unrelated requests, causing data leakage or cross-tenant calls. Put per-call metadata on that `HttpRequestMessage` using `Options` and read it during `SendAsync`, or move request-specific token selection into a per-request component. Keep only immutable client-wide configuration in a pooled handler.

### Solution 7

Disposing the response disposes its content and underlying stream; the caller may receive a closed stream. Keep the response in scope until copying finishes, pass cancellation to reads/copies, and dispose the response after the copy. Alternatively expose an API that owns the full download operation and returns a completed file/result rather than a detached stream with ambiguous lifetime.

### Solution 8

Track logical operation count/latency separately from attempt count/status and retry-delay metrics. If logging wraps resilience, it may observe one logical call and final outcome; if it is inside the retry handler, it may see each attempt. Verify actual handler nesting with tests or diagnostics. Avoid logging secrets or counting every retry as an independent user operation.

## Tests and edge cases

- A 429's recommended delay exceeds the remaining caller deadline: do not sleep past the deadline; return/cancel within the operation budget.
- First POST reaches server and commits, but the response is lost: reconcile with the same idempotency key; never generate a new key for the retry of the same logical operation.
- A response body read fails after headers arrive: decide whether restarting the entire GET is safe and whether the body can be consumed again.
- A breaker has low traffic and never reaches minimum throughput: its lack of trips is not evidence the dependency is healthy.
- Two retries at one client and two at a gateway: calculate and observe the combined attempt count.
- A tenant token rotates during a request: ensure per-request auth data is not cached in a pooled handler or shared default header.
- Hedging selects two endpoints that are replicas but have inconsistent state: only use it if duplicate execution and result selection match the operation contract.

## Reflection questions

1. Which layer owns retries for each outbound dependency in your design, and how did you calculate its worst-case attempts?
2. What exact server behavior makes a retried write idempotent, and how is an uncertain timeout reconciled?
3. How do your caller, pipeline, and attempt timeouts fit inside the user-visible deadline?
4. Which telemetry distinguishes a logical operation from attempts without exposing sensitive or high-cardinality values?
5. What connection-lifetime policy lets a long-running worker observe DNS changes without creating handlers per request?

## Sources

- [Build resilient HTTP apps](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [Use IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
- [IHttpClientFactory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)
- [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

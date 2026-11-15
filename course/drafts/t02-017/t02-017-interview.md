# IHttpClientFactory resilience retries and timeouts — Interview questions and reasoning

## Core questions

1. What does `IHttpClientFactory` pool, and how does that differ from the lifetime of a factory-created `HttpClient`?
2. Compare named and typed clients. What lifetime bug can occur when a typed client is captured in a singleton?
3. How do DNS changes become visible to a long-lived client?
4. Why is a factory-created `DelegatingHandler` scope different from an incoming ASP.NET request scope?
5. Explain attempt timeout, total request timeout, `HttpClient.Timeout`, and a caller deadline.
6. What does the standard HTTP resilience handler retry by default, and what safety issue follows?
7. Compare retry, hedging, circuit breaker, and concurrency limiting.
8. Why can a timeout on a payment POST leave an ambiguous result?
9. When should code choose `ResponseHeadersRead`, and who owns the response stream?
10. What problems arise when resilience is registered in both `ConfigureHttpClientDefaults` and a typed-client registration?

## Concise interview answers

1. The factory caches/pools message handlers and their connection pools. It creates `HttpClient` objects whose disposal does not immediately dispose the pooled handler.
2. A named client selects configuration by string; a typed client wraps a configured client behind an application API. A singleton-held typed client can keep using its captured handler/client beyond handler rotation.
3. DNS is resolved as connections are created. Use handler rotation or `SocketsHttpHandler.PooledConnectionLifetime` so new connections can use updated DNS; existing active connections are not instantly replaced.
4. The factory uses handler scopes that may outlive and serve multiple incoming requests. Do not store request/user state in pooled handler fields.
5. Attempt timeout bounds one try; total timeout bounds the full resilience operation; `HttpClient.Timeout` adds another client-level bound; caller cancellation can end the larger application operation first. Align them to one budget and propagate cancellation.
6. Current standard HTTP retries include all methods unless configured otherwise. Unsafe writes can therefore execute more than once; disable their retries or rely on a server-backed idempotency contract.
7. Retry repeats sequentially after selected failures; hedging duplicates attempts concurrently; a breaker rejects/short-circuits after sustained failures; a limiter caps admitted concurrency or rate. Each addresses a different failure/load pattern.
8. The server may commit the write and lose/delay the response. The caller's cancellation cannot roll back remote work, so reconcile with an operation ID or idempotency key.
9. Use it to process large bodies incrementally after headers. Keep the `HttpResponseMessage` alive and dispose the response/stream after processing.
10. Multiple resilience handlers can multiply retries and timeout layers, creating unexpected load and elapsed time. Inspect the final chain and register one deliberate standard handler or a custom pipeline.

## Deep follow-up answers

### Why are both factory clients and long-lived clients valid?

The factory pattern makes client objects cheap and short-lived while handler pools preserve connection reuse and provide centralized configuration. A long-lived client can also reuse connections efficiently if its handler has a deliberate `PooledConnectionLifetime`. The failure modes differ: per-request construction with newly owned handlers churns sockets; an indefinitely retained client/connection can miss DNS changes; a captured typed client can outlive factory handler rotation. Choose one lifecycle deliberately and verify how it behaves under DNS changes and deployment recycling. [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines) [Factory guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)

### How should retries be made safe?

First classify the failure as plausibly transient. Then establish whether the logical operation can be repeated and whether the request body can be recreated. For writes, a provider-supported idempotency key must have a defined server-side deduplication and result-retrieval contract; merely adding a header does nothing by itself. Bound retries, backoff, and total elapsed time, respect applicable `Retry-After`, and avoid independent retry loops in multiple layers. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

### What does a resilience pipeline's ordering change?

An outer total timeout can include the retry delays and all attempts. A per-attempt timeout bounds the inner send. A breaker outside/inside a retry strategy sees different outcome granularity: it may observe the final retried outcome or individual failed attempts depending on placement. A concurrency limiter outside retries can count one logical operation while an inner limiter can count attempts. State the intended accounting, order strategies accordingly, and instrument logical operations separately from attempts.

### How do handler scopes and handler order affect correctness?

Factory handlers are pooled and created in their own DI scopes. Their dependencies are not the current ASP.NET request scope, and a pooled instance may process later calls from another request. Pass per-call data via the request message (for example typed `HttpRequestMessage.Options`) and avoid mutable handler fields. Handler order also determines whether authentication, logging, tracing, and resilience wrap the logical request or each attempt; test the actual nesting rather than inferring it from separate registration calls. [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)

## Scenario questions

### Scenario 1: a singleton worker captures a typed client

The worker runs for days and uses a typed client created at startup. The deployment changes DNS while the worker remains alive. Explain the risk and offer two fixes.

**Reasoning:** The captured client can remain bound to a handler/connection behavior that is not replaced when the factory rotates handlers. Use `IHttpClientFactory` to create a fresh named/typed client per operation, or use one intentionally long-lived client with a configured `SocketsHttpHandler.PooledConnectionLifetime`. Validate the selected lifecycle against deployment/network behavior.

### Scenario 2: payment timeout and retry

A charge POST times out after 15 seconds. The caller sees an `OperationCanceledException`; logs show no response. Should the caller retry with a new idempotency key?

**Reasoning:** No. The provider may have committed the charge. Reuse the stable key for the same logical operation and query/reconcile through the provider's contract. If the provider has no deduplication or lookup mechanism, automatic retry can double-charge and requires a domain-level recovery decision.

### Scenario 3: standard resilience plus hedging

A team adds standard resilience and then standard hedging to the same client to “get both safety and speed.” What should be reviewed?

**Reasoning:** Verify the package's supported composition and final handler chain; avoid duplicate standard resilience handlers. Clarify whether retries wrap hedged attempts or vice versa, how breaker state is selected per authority, whether endpoints are interchangeable, and the worst-case concurrency/attempt count. Hedging can multiply load even when the first attempt would have succeeded.

### Scenario 4: `ResponseHeadersRead` returns a stream

A service returns a stream from inside a `using` block that disposes its response before returning. What is wrong?

**Reasoning:** The response owns its content stream. Disposing the response can close the returned stream. Keep response ownership with the component that consumes it, or expose a callback/operation that completes copying before the response is disposed.

## Tradeoffs and alternatives

- **Factory client versus long-lived client:** centralized named/typed configuration and handler rotation versus explicit handler/connection management. Both need a deliberate DNS/connection lifecycle.
- **Retry versus hedging:** sequential recovery with added delay versus overlapping work with lower tail latency potential and higher concurrency cost.
- **Breaker versus limiter:** respond to sustained failure versus cap load independent of health.
- **`ResponseContentRead` versus `ResponseHeadersRead`:** convenient buffered body versus streaming and longer-lived connection/response ownership.
- **Standard versus custom pipeline:** documented integrated defaults versus precise strategy composition and the extra responsibility to validate ordering/defaults.
- **Current resilience integration versus legacy `Microsoft.Extensions.Http.Polly`:** current standard handler APIs versus a separate migration surface that may still exist in older applications.

## Common weak answers

- “The factory makes `HttpClient` a singleton.” It pools handlers; client instances can be short-lived.
- “A new client always refreshes DNS.” A new factory client may use a cached handler; DNS updates are relevant when a new connection is created.
- “Retries are only for GET.” The standard handler retries all methods unless unsafe methods are excluded.
- “PUT is always safe to retry.” HTTP semantics help, but endpoint side effects and body replayability still matter.
- “Timeout means the server cancelled.” The caller stopped waiting; remote work may continue or have committed.
- “The limiter protects against outages.” It limits admission/concurrency; the breaker responds to failure signals.
- “Hedging is just a quicker retry.” It creates concurrent duplicate work and may amplify load.
- “Handler dependencies are scoped to the incoming request.” Factory handler scopes are separate and pooled.
- “The breaker opens after any one failure.” Its behavior depends on sampling, throughput, ratio, and configured thresholds.
- “An idempotency header makes the request safe.” Only a server implementation with a documented durable deduplication contract provides that property.

## Self-check rubric

Score each answer from 0 to 2: **0** misses the distinction or makes an unsafe claim; **1** states the core idea but omits an important condition; **2** explains mechanism, tradeoff, and edge case accurately.

1. Factory handler pooling, short-lived client disposal, and the valid long-lived alternative.
2. DNS/connection refresh and singleton typed-client capture.
3. Handler-scope separation and safe per-request state transport.
4. Retry defaults, unsafe methods, idempotency, and replayable request bodies.
5. Caller/total/attempt deadlines and remote completion uncertainty.
6. Retry/hedging/breaker/limiter purpose and load effect.
7. Response status, streaming ownership, cancellation, and disposal.
8. Strategy/handler ordering, duplicate registration, observability, and redaction.

A strong answer scores at least 13/16 and has no zero for retry safety, deadline semantics, or handler-scope isolation. Revisit the reference and practice lessons for any zero before relying on the design in production.

## Sources

- [Build resilient HTTP apps](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [Use IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
- [IHttpClientFactory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)
- [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

# IHttpClientFactory resilience retries and timeouts — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to choose between factory-created short-lived clients and long-lived clients with connection lifetime management, explain handler pooling and DI-scope separation, propagate cancellation through HTTP/JSON/stream operations, and design retry/timeout/circuit-breaker behavior around operation semantics.

## Prerequisites

You should know asynchronous C#, dependency injection lifetimes, HTTP status codes, DNS, TCP connections, and cancellation tokens. This lesson assumes the application distinguishes a caller deadline from the remote service's processing outcome.

## Core concepts

### A client is configuration plus a connection pool

Each `HttpClient` instance applies base address, headers, and other settings to requests; each instance uses a handler and connection pool. Repeatedly creating and disposing clients with newly created handlers can churn connections and exhaust ports under load. A single long-lived client can preserve connections and miss DNS updates if connections are never recycled.

Two supported lifetime patterns are common:

1. **Factory clients:** `IHttpClientFactory` creates short-lived `HttpClient` objects and pools underlying `HttpMessageHandler` instances. Disposing a factory-created client does not immediately dispose the pooled handler/connection pool. The handler lifetime controls handler rotation, and callers should request fresh clients in a timely manner.
2. **Long-lived client:** Keep a client/handler alive and set `SocketsHttpHandler.PooledConnectionLifetime` so connections are periodically recreated and can observe DNS/network changes.

The important DNS fact is that resolution happens when a connection is created; `HttpClient` does not continuously re-query DNS TTLs for an existing connection. Pick the pattern that fits the app and configure the relevant handler/connection lifetime rather than constructing a new client per request. [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines) [Factory docs](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)

### Named/typed clients and handler pooling

A named client centralizes configuration under a logical name and is useful when several independent configurations are needed. A typed client injects a configured `HttpClient` into an application-specific service, which gives call sites a focused API. Both use the factory's handler management. Typed clients are intended to be short-lived too; capturing one in a singleton can prevent handler rotation from affecting the active client.

The factory creates a separate DI scope for each pooled handler. That handler scope is distinct from an incoming ASP.NET request scope and can outlive it. A pooled handler and its scoped dependencies may be reused across several requests. Do not capture `HttpContext`, request-scoped user state, or mutable per-request data in a pooled handler. Pass request-specific data through `HttpRequestMessage` or use a deliberately per-request wrapper around the factory-created handler. Factory pooling also means a handler's `CookieContainer` may be shared across clients and cleared when the handler rotates; avoid this pattern when cookie isolation is required. [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)

### Outgoing handlers and request/response ownership

`DelegatingHandler` forms an outgoing middleware chain around a primary handler. Handlers can add trusted headers, log safe metadata, instrument tracing, or apply transformations. Because handlers are pooled, treat them as reusable infrastructure: no mutable state tied to one caller, no retained request body, and no dependency on a particular incoming scope.

Use the `System.Net.Http.Json` helpers for common JSON requests, but select APIs according to response ownership. `GetFromJsonAsync` sends the request and deserializes the response; `PostAsJsonAsync` sends a JSON body and returns an `HttpResponseMessage` that the caller must inspect and dispose. `HttpResponseMessage` owns response content; stream-returning methods often leave the response/stream lifetime with the caller. Always pass cancellation tokens into network and deserialization operations where supported. Use `EnsureSuccessStatusCode` only when throwing on every non-success status is the desired contract; many APIs need to inspect 400/404/409/429 responses as domain results.

Streaming avoids buffering an entire large body but extends socket/connection occupancy until consumption/disposal completes. Dispose response/content/streams correctly and do not abandon a stream without releasing its response. [System.Net.Http.Json API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.json.httpclientjsonextensions)

### Timeouts, cancellation, retries, and idempotency

Cancellation can arise from an explicit operation deadline, an incoming ASP.NET request disconnect, application shutdown, or a resilience timeout. Propagate the token through the whole call chain. A timeout means the caller stopped waiting or cancelled local work; it does **not** prove the remote server did not receive or commit the request.

The standard resilience handler in `Microsoft.Extensions.Http.Resilience` uses a layered pipeline. Current documented defaults include a concurrency limiter, total timeout, retry, circuit breaker, and per-attempt timeout. It retries transient server errors (including 5xx, 408, and 429) and selected transport/timeout exceptions. It retries all HTTP methods by default. Configure unsafe methods out of retry or make retries safe using an idempotency key and a server-side deduplication contract. A read can also have side effects in a poorly designed API, so method name alone is not a complete semantic guarantee.

Bound retries and total time. If the caller deadline is shorter than the pipeline's total timeout, the caller cancellation wins. If every layer retries independently, attempts multiply: for example, 3 retries at two layers can cause up to 16 downstream attempts (each layer's initial attempt plus its retries). Respect a provider's `Retry-After` guidance for throttling where the chosen strategy supports it. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

### Breakers, limits, hedging, and diagnostics

A **retry** assumes a failure may be transient and attempts again. A **circuit breaker** observes outcomes and temporarily stops calls after sustained failure so the client does not keep adding pressure. A **concurrency limiter** restricts outstanding operations; a **rate limiter** controls admission over time. A **timeout** bounds waiting. **Hedging** sends parallel attempts to reduce tail latency and can amplify traffic; use it only with idempotent operations and sufficient capacity/independent endpoints.

Add only one resilience handler to a client unless a deliberate custom pipeline composes the strategies. Standard defaults have an order: outer rate/concurrency limit and total timeout, then retry, circuit breaker, and per-attempt timeout. Ordering determines whether the total deadline includes retries and how failures are observed. Use `AddResilienceHandler` for an intentional custom strategy chain, and avoid adding a standard handler on top of an existing standard/hedging handler. Built-in HTTP diagnostics/distributed tracing can correlate outbound calls; redact authorization headers, cookies, and sensitive bodies from logs. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience) [Distributed tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)

## Mechanisms and relationships

| Concern | Relevant control | What it does not guarantee |
|---|---|---|
| Socket reuse | Handler connection pool | DNS refresh until a connection is recreated |
| DNS change | Handler rotation or `PooledConnectionLifetime` | Immediate cutover while an existing request/connection is active |
| Caller patience | Cancellation/deadline and timeout | Remote work was rolled back |
| Transient failure | Bounded retry with backoff/jitter | Repeating a non-idempotent write is safe |
| Persistent dependency failure | Circuit breaker | Dependency has recovered or caller request should be discarded |
| Downstream concurrency | Limiter | A total requests-per-minute quota |
| Tail latency | Hedging to independent endpoints | Lower load; hedging increases concurrent attempts |

## Worked examples

### Example 1: a typed read client

Register a typed client for a read-only catalog API, set its base address/timeouts intentionally, and pass the caller's cancellation token through `GetFromJsonAsync`. Add a single standard resilience handler only after confirming its retry behavior fits the operation. Dispose the response automatically through the helper's operation; handle a null/empty response according to the API contract.

### Example 2: a payment write

A payment `POST` can commit even when the response is lost. Retrying after a timeout may create a second charge. Either disable retries for the method or send a provider-supported idempotency key whose server-side semantics guarantee deduplication. Store the operation result/identifier so the application can reconcile an uncertain outcome rather than assume failure.

### Example 3: a long-lived client and DNS rotation

A worker with one long-lived client can use `SocketsHttpHandler.PooledConnectionLifetime` to age connections and allow new DNS resolution. The value should reflect expected DNS/network changes and traffic patterns; it is not a DNS TTL setting. Existing active connections are not forcibly terminated just because the lifetime elapsed.

## Misconceptions and edge cases

- **“Dispose every `HttpClient` and create a new one per request.”** With manually owned handlers this creates connection churn; factory-created clients are different because handlers are pooled.
- **“A singleton client is always wrong.”** Long-lived clients can work with deliberate `PooledConnectionLifetime`; the factory short-lived-client pattern is another supported choice.
- **“A new `HttpClient` always refreshes DNS.”** With factory clients, a client can still be tied to an unexpired cached handler; handler/connection lifecycle controls DNS refresh.
- **“Typed clients are safe to inject into singleton services.”** Capturing a typed client retains its `HttpClient` and handler past rotation; avoid captive typed clients.
- **“Handler-scoped services are request-scoped.”** Factory handler scopes differ and may be reused across incoming requests.
- **“The standard handler retries only GET.”** Current standard resilience defaults retry all methods unless configured otherwise.
- **“Timeout means the server did not commit.”** The server may complete after the caller cancels or loses the response.
- **“Retries are always safe for PUT/DELETE because they are idempotent by definition.”** HTTP semantics may be idempotent, but real server implementation, conditional state, and side effects must be verified.
- **“More retry layers improve reliability.”** Layers can multiply attempts and make overload worse.
- **“Hedging is just a faster retry.”** It sends parallel work and can amplify load substantially.
- **“Calling `EnsureSuccessStatusCode` handles every API result.”** It turns non-success into exceptions; some statuses should be handled as expected domain outcomes.

## Knowledge checks with answers

1. **Why does the factory pool handlers rather than one `HttpClient`?** It creates configured short-lived clients while reusing expensive handler/connection-pool infrastructure.
2. **What setting can refresh connections for a long-lived handler?** `SocketsHttpHandler.PooledConnectionLifetime`, chosen according to DNS/network change expectations.
3. **Why should a pooled handler avoid `HttpContext`?** Its DI scope is distinct from incoming request scope and can outlive/reuse dependencies across requests.
4. **What is the risk of standard resilience defaults on POST?** It retries all methods by default; an ambiguous timeout may repeat a write and duplicate side effects.
5. **Does a timeout prove remote cancellation?** No. It bounds local waiting/work; remote processing may have completed.
6. **What is the difference between breaker and limiter?** A breaker stops calls after observed failure; a limiter controls concurrent/admitted work regardless of whether the dependency is failing.
7. **What does hedging trade?** Lower tail latency in some cases for parallel duplicate load and more complex consistency behavior.

## Sources

- [IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
- [IHttpClientFactory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)
- [Build resilient HTTP apps](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)
- [System.Net.Http.Json API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.json.httpclientjsonextensions)

# IHttpClientFactory resilience retries and timeouts — Big-picture orientation and mental model

## Problem and purpose

An outbound HTTP request crosses a network and process boundary. DNS can change, servers can return transient failures or throttling responses, connections can stall, and downstream capacity can be exhausted. The application must decide how to construct clients and connections, how long an operation may run, which failures can be retried, and when to stop sending work to an unhealthy dependency.

`IHttpClientFactory`, named/typed clients, handler pipelines, and the current `Microsoft.Extensions.Http.Resilience` package provide reusable building blocks. They do not know whether a specific operation is safe to repeat. [IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory) [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

## Plain-language mental model

Think of outbound HTTP like calling a repair service. `HttpClient` is the front desk for requests; its underlying handler owns the phone lines/connection pool. Reusing handler-managed connections avoids repeatedly opening new sockets. `IHttpClientFactory` creates configured front-desk objects while pooling and rotating the handler infrastructure underneath them. A delegating handler is middleware in the call path: it can add headers, trace the call, transform requests, or apply resilience behavior.

Retries are a request to “try that operation again.” That is safe for a read more often than a write, but only if the operation semantics and server support make it safe. A timeout bounds how long the caller waits; cancellation does not prove the remote server stopped or did not commit. A circuit breaker temporarily stops calls after sustained failure. A concurrency limiter caps simultaneous dependency work. Hedging makes parallel attempts to reduce tail latency and can multiply load.

## How the parts fit together

| Part | Responsibility | Main design question |
|---|---|---|
| `HttpClient` | Sends requests and receives responses using its configured handler/connection pool | How is its lifetime managed? |
| `SocketsHttpHandler` | Owns lower-level connection pooling, DNS reuse, and connection lifetime settings | When should pooled connections be recycled? |
| `IHttpClientFactory` | Creates configured named/typed clients and pools underlying handlers | Which logical service configuration does this operation need? |
| Named client | Configuration selected by a logical string name | Are callers resolving the correct client name? |
| Typed client | Application-specific API wrapping an injected `HttpClient` | Is its lifetime compatible with the consuming service? |
| `DelegatingHandler` | Outgoing middleware around a primary handler | Is state safe to pool across requests/scopes? |
| Resilience pipeline | Applies timeout/retry/breaker/limiter strategies to an operation | Are failures transient and is repeating safe? |
| Cancellation/deadline | Stops caller-side work after a deadline or request cancellation | Will cancellation propagate through every operation? |

The factory pools handlers, not one singleton `HttpClient`. Factory-created clients are intended to be short-lived and are safe to dispose; the factory tracks handler lifetime. Since .NET 9, the factory's default `SocketsHttpHandler` also aligns pooled connection lifetime with handler lifetime on supported platforms. A long-lived client can still be valid when its handler connection lifetime is deliberately managed. Repeatedly constructing clients with newly owned handlers can create socket pressure. Capturing a factory-created typed or keyed client in a singleton can keep using an expired handler and miss handler rotation. Current .NET docs also cover injecting named factory clients through keyed DI with `AddAsKeyed`. [HTTP client guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines) [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting) [Keyed DI](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-keyed-di)

## Concept map

```text
application operation / inbound cancellation / deadline
        │
        ▼
typed or named HttpClient ── DelegatingHandler pipeline ── resilience strategy chain
        │                                                     ├─ concurrency limiter
        │                                                     ├─ total timeout
        │                                                     ├─ retry/backoff
        │                                                     ├─ circuit breaker
        │                                                     └─ per-attempt timeout
        ▼
SocketsHttpHandler / connection pool ── DNS + TCP/TLS ── remote service
```

The current standard resilience handler composes rate/concurrency limiting, total timeout, retries, circuit breaking, and attempt timeout. Its default retries apply to all HTTP methods unless configured otherwise. Therefore a POST can be repeated. Disable retries for unsafe methods or use server-supported idempotency keys and an application-specific retry policy. Do not add several overlapping standard resilience handlers; strategy stacking can multiply attempts and deadlines. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

## End-to-end walkthrough

Suppose a typed client calls a payment provider to create a charge.

1. The application starts the operation with a cancellation token tied to its request/job deadline.
2. The typed client uses its configured named `HttpClient` and request-specific data.
3. The handler pipeline applies tracing/logging and any configured timeout/limiter policy.
4. The request reaches the connection pool. `SocketsHttpHandler` reuses a connection where possible; `PooledConnectionLifetime` or handler rotation allows DNS changes to be observed when a new connection is created.
5. The provider may process the charge but the response could be lost or time out. Blindly retrying POST may create a second charge unless the provider supports an idempotency key and deduplication contract.
6. The caller interprets status/body, disposes the response, and propagates cancellation. It must not assume a timeout means the provider did not complete the operation.

This is why resilience is an operation-level policy, not a universal “retry every HTTP call” switch. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

## When to use it and tradeoffs

- Use `IHttpClientFactory` when you want centralized named/typed configurations, pooled handlers, diagnostics, and outgoing handler composition.
- Use short-lived factory clients and avoid capturing typed clients in singleton services. For long-lived client patterns, configure `PooledConnectionLifetime` on `SocketsHttpHandler` according to network/DNS expectations.
- Avoid factory handler cookie sharing when the app requires isolated `CookieContainer` state; pooled handlers can share cookies between logically separate clients and handler rotation clears stored cookies.
- Retry only transient failures when the operation is repeatable or protected by idempotency. Bound attempts and total time, respect `Retry-After` where applicable, and avoid retry multiplication across client, service, proxy, and job layers.
- Use a circuit breaker for sustained failure and a concurrency/rate limit for overload protection. A breaker does not create extra capacity; a limiter sheds work.
- Use hedging only where parallel duplicate requests are safe, downstream capacity can handle it, and alternate endpoints have independent failure domains.

## What later lessons cover

The concepts lesson explains client/handler lifetimes, outgoing pipeline scopes, JSON/stream response ownership, cancellation, idempotency, retries, and layered deadlines. References cover factory registration and socket/DNS behavior; delegating handlers and response processing; and current resilience strategies, defaults, and retry-safety controls. Practice diagnoses typed-client capture, unsafe retries, and timeout layering. Interview lessons focus on DNS, handler scopes, idempotency, and failure amplification.

## Sources

- [Use IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
- [IHttpClientFactory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)
- [Build resilient HTTP apps](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

# IHttpClientFactory resilience retries and timeouts — Reference: Polly strategies standard handler options retry safety and outbound deadlines

## Scope and version

This reference covers the supplied .NET HTTP resilience API names and the operational rules needed to use them. The HTTP integration packages are independently versioned from the runtime: pin compatible `Microsoft.Extensions.Http.Resilience` and `Microsoft.Extensions.Resilience` versions and check their package documentation at upgrade time. The standard APIs compose Polly resilience strategies; do not confuse the current integration with the separate legacy `Microsoft.Extensions.Http.Polly` package. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience) [Factory guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)

## How this group fits the mental model

The handler applies a bounded policy around one outbound operation. Think of the operation as a caller deadline enclosing a total pipeline deadline, which encloses retries and individual attempts. Cancellation flows inward; the response or exception flows outward. A retry or hedge repeats work, so correctness depends on idempotency, body replayability, downstream capacity, and the server's contract. The names below identify the supplied integration surface; runtime defaults are package-version-sensitive and should be rechecked when upgrading. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

## Supplied names explained

### Packages, registration, and standard pipeline

| Supplied name | Purpose and behavior |
|---|---|
| Microsoft.Extensions.Http.Resilience package | Provides HTTP client integration and standard/custom resilience handler registration. Pin a package version compatible with the target framework. |
| Microsoft.Extensions.Resilience package | Provides shared resilience abstractions and integration support used by the HTTP package; its version is independently managed. |
| `Polly core resilience pipeline integration` | The integration uses Polly resilience pipelines/strategies. Learn the HTTP builder surface here; the complete Polly API catalog is outside this topic. |
| `IHttpClientBuilder.AddStandardResilienceHandler` | Adds the documented standard HTTP resilience pipeline to a client builder. Normally configure one standard or hedging handler, not multiple overlapping standard handlers. |
| `IHttpClientBuilder.AddStandardResilienceHandler(Action<HttpStandardResilienceOptions>)` | Adds the standard pipeline while allowing its options to be changed. Set options deliberately and retain explicit bounds on attempts and elapsed time. |
| `HttpStandardResilienceOptions` | Root options object for the standard handler's limiter, total timeout, retry, breaker, and attempt timeout. |
| `HttpStandardResilienceOptions.RateLimiter` | Configures admission/concurrency limiting for operations entering the pipeline. A concurrency limiter limits simultaneous work, not a universal requests-per-minute quota. |
| `HttpStandardResilienceOptions.TotalRequestTimeout` | Bounds the entire resilience operation, including retries and delays. A shorter caller deadline can cancel first. |
| `HttpStandardResilienceOptions.Retry` | Configures retry count, delays, and which outcomes qualify. Review method safety and request body replayability before enabling retries. |
| `HttpStandardResilienceOptions.CircuitBreaker` | Configures how repeated failures open the breaker and how long it remains open. It protects a failing dependency by rejecting work temporarily. |
| `HttpStandardResilienceOptions.AttemptTimeout` | Bounds an individual attempt. It is distinct from total timeout, which includes all attempts and retry delays. |

### Retry and circuit-breaker options

| Supplied name | Purpose and behavior |
|---|---|
| `HttpRetryStrategyOptions` | HTTP-specific retry settings, including handled response/exception outcomes and retry timing. |
| `HttpRetryStrategyOptions.MaxRetryAttempts` | Number of retries after the initial attempt, not total attempts. A value of three can mean up to four attempts. |
| `HttpRetryStrategyOptions.Delay` | Base delay between retry attempts. Ensure the total elapsed budget remains compatible with the caller deadline. |
| `HttpRetryStrategyOptions.BackoffType` | Selects the delay growth pattern, such as constant or exponential. Exponential delays should remain bounded. |
| `HttpRetryStrategyOptions.UseJitter` | Adds randomness to delays to reduce synchronized retry bursts from many clients. |
| `HttpRetryStrategyOptions.ShouldHandle` | Configures which result/exception outcomes the retry strategy considers retryable. Narrow this to failures that are plausibly transient and safe to repeat. |
| `HttpRetryStrategyOptionsExtensions.DisableForUnsafeHttpMethods` | Excludes unsafe HTTP methods from retry handling. This is an important default correction because the documented standard retry behavior otherwise includes all methods. |
| `HttpRetryStrategyOptionsExtensions.DisableFor` | Excludes the specified HTTP methods from retry handling. Use it to express the API's actual repeatability policy. |
| `HttpCircuitBreakerStrategyOptions` | HTTP-specific breaker configuration. Evaluate its thresholds against actual traffic volume and dependency failure patterns. |
| `HttpCircuitBreakerStrategyOptions.FailureRatio` | Failure proportion that can trip the breaker after the minimum sample requirements are satisfied. |
| `HttpCircuitBreakerStrategyOptions.SamplingDuration` | Time window over which outcomes are sampled. A window too short or too long can misrepresent the dependency. |
| `HttpCircuitBreakerStrategyOptions.MinimumThroughput` | Minimum observed operations required before the failure ratio can open the breaker. Low-volume services may not reach it quickly. |
| `HttpCircuitBreakerStrategyOptions.BreakDuration` | Time the breaker remains open before allowing probe behavior. It is not a health-check guarantee. |

### Limiting, timeout, and hedging options

| Supplied name | Purpose and behavior |
|---|---|
| `HttpRateLimiterStrategyOptions` | HTTP integration options for request admission/concurrency control. Understand queueing/rejection behavior and set a meaningful capacity. |
| `HttpRateLimiterStrategyOptions.DefaultRateLimiterOptions` | Default limiter configuration object used by the HTTP options. Check the current package's defaults rather than assuming a fixed limit across versions. |
| `HttpTimeoutStrategyOptions.Timeout` | Duration bound for the corresponding timeout strategy. The effect depends on its position in the pipeline. |
| `IHttpClientBuilder.AddStandardHedgingHandler` | Adds the standard hedging pipeline, which can send parallel attempts. Use only when duplicates are safe and target endpoints can serve equivalent results. |
| `IHttpClientBuilder.AddStandardHedgingHandler(Action<IRoutingStrategyBuilder>)` | Adds standard hedging and configures its endpoint routing strategy. Routing determines which endpoint receives an attempt. |
| `IRoutingStrategyBuilder.ConfigureWeightedGroups` | Configures endpoint groups and their relative weights for routing. Weight is a selection policy, not a capacity guarantee. |
| `IRoutingStrategyBuilder.ConfigureOrderedGroups` | Configures ordered groups for endpoint selection. Verify fallback ordering and failure behavior explicitly. |
| `WeightedUriEndpointGroup` | Represents a weighted group of URI endpoints used by standard hedging routing. |
| `WeightedGroupSelectionMode` | Selects how a weighted group is chosen during hedged attempts. |
| `WeightedGroupSelectionMode.EveryAttempt` | Selects according to the weighted policy for every attempt. This may direct related attempts to different endpoints. |
| `StandardHedgingHandlerBuilderExtensions.SelectPipelineByAuthority` | Chooses a hedging pipeline based on URI authority (scheme/host/port). This helps isolate breaker state by destination authority. |
| `StandardHedgingHandlerBuilderExtensions.SelectPipelineBy` | Provides a custom key selector for choosing a hedging resilience pipeline. Ensure key cardinality is bounded and keys correspond to meaningful failure domains. |
| `UriEndpointGroup` | Represents a group of URI endpoints used as routing targets. The endpoints should be suitable substitutes for the same operation. |
| `WeightedEndpointGroup` | Represents endpoint grouping with weights for routing selection. |
| `IHttpClientBuilder.RemoveAllResilienceHandlers` | Removes registered resilience handlers from a client builder. Useful when configuring a deliberate replacement pipeline; ordering of service configuration still matters. |

### Custom pipeline surface and strategy choices

| Supplied name | Purpose and behavior |
|---|---|
| `AddResilienceHandler custom pipeline` | Registers a custom resilience handler/pipeline when standard defaults do not fit. Compose strategies intentionally and define which outcomes each handles. |
| `ResilienceHandlerContext` | Context supplied while constructing an HTTP resilience pipeline, including access to services and reload configuration behavior. |
| `ResilienceHandlerContext.EnableReloads` | Enables pipeline reload behavior when configuration changes, where supported by the integration. Do not assume every captured object or callback is recreated safely. |
| `ResiliencePipelineBuilder<T>` | Polly builder for composing strategies over an operation/result type `T`. Strategy order affects which outcomes each layer sees. |
| `RetryStrategyOptions<T>` | Generic retry configuration for a pipeline over `T`; define predicate, attempt count, and delay policy. |
| `TimeoutStrategyOptions<T>` | Generic timeout configuration for a pipeline over `T`. Cancellation must be honored by the operation delegate for the timeout to stop local work. |
| `CircuitBreakerStrategyOptions<T>` | Generic breaker configuration for outcomes of type `T`, including failure predicates and thresholds. |
| `RateLimiterStrategyOptions<T>` | Generic limiter configuration for pipeline operations. A rejection/queue policy is part of the API behavior and should be surfaced intentionally. |
| `Retry versus hedging` | Retry is sequential and adds delay; hedging starts overlapping attempts. Both can duplicate work, but hedging spends concurrency sooner. |
| `Retry attempt timeout versus total request timeout` | Attempt timeout bounds one execution; total timeout bounds all attempts, delays, and other inner pipeline work. |
| `Timeout hierarchy across caller, HttpClient, resilience pipeline, and server` | The effective local wait is bounded by the earliest applicable cancellation/deadline. The server may continue after the client gives up. Avoid competing unrelated timeout values. |
| `CancellationToken as end-to-end deadline signal` | Pass the caller's token through send, body processing, and downstream application operations. Cancellation is cooperative and does not guarantee remote rollback. |
| `Retry-After response header and server backoff` | A server can recommend when to retry after throttling/unavailability. Configure the applicable retry strategy to respect supported delay semantics and retain a bounded overall deadline. |
| `Retry transient transport failures and selected status codes` | Retry only selected transient outcomes such as appropriate 5xx, 408, 429, or transport failures. Permanent validation/auth failures generally need a different response. |
| `Do not retry non-idempotent operations without a safe replay contract` | A lost response leaves outcome uncertain. Repeating a write can duplicate effects unless the service supports deduplication or the operation is otherwise safe. |
| `Idempotent HTTP method semantics and application-level exceptions` | HTTP defines method semantics, but real endpoints can violate expectations or have secondary effects. Confirm the concrete API contract. |
| `Idempotency key for retried writes` | A server-supported key can let repeated attempts map to one logical operation. It needs a defined scope, retention period, payload matching rule, and durable deduplication behavior. |
| `Retry amplification across nested services` | Independent retrying layers multiply attempts and load. Assign retry ownership, bound the total budget, and avoid retry storms. |
| `Circuit breaker open half-open and closed states` | Closed observes calls; open rejects calls; half-open permits limited probes to assess recovery. State transition details depend on the selected strategy. |
| `Circuit breaker sampling window and minimum throughput` | The ratio is meaningful only with enough recent samples. Tune both values for traffic volume and failure detection goals. |
| `Concurrency limiter and queue behavior` | A limiter caps active operations and may queue or reject excess work. Queueing consumes time and memory; zero queue favors fast load shedding. |
| `Bulkhead isolation versus concurrency limiting` | Bulkhead isolation separates capacity among dependencies/workloads; a concurrency limiter caps one pipeline's simultaneous work. Both may be used when their scopes are clear. |
| `Hedging duplicate concurrent work and load amplification` | A hedge starts another attempt before the first finishes, increasing concurrent downstream work. Bound attempts and cancel/observe losing attempts correctly. |
| `Hedging requires interchangeable endpoints or a routing policy` | A hedge is correct only when alternate destinations can satisfy the same request semantics and consistency expectations. |
| `Resilience callback telemetry and logging hooks` | Strategy callbacks/telemetry can record retry, timeout, breaker, and rejection events. Avoid secrets, unbounded labels, and high-cardinality user identifiers. |
| `Resilience handler ordering and interaction with custom DelegatingHandler` | Handler nesting determines whether logging sees each attempt or the overall operation and whether authentication/signing occurs once or per attempt. Trace registration order and test it. |
| `Avoid duplicate resilience handlers in ConfigureHttpClientDefaults` | Defaults and per-client registration can both add handlers. Inspect the final chain and remove/replace handlers intentionally to avoid multiplied retries/timeouts. |
| `Fallback as a domain decision rather than fabricated success` | Fallback is appropriate only when a valid degraded result exists. Do not convert unknown failure into false success or stale data without an explicit contract. |
| `Retry and circuit breaker interaction` | The breaker observes outcomes at its pipeline position; retries can hide individual failures or present only the final outcome. Ordering changes thresholds and telemetry interpretation. |
| `Local timeout does not prove remote operation was cancelled` | Cancellation can end the local wait while the remote service has already committed or continues processing. Reconcile uncertain writes using operation identifiers/idempotency. |
| `Legacy Microsoft.Extensions.Http.Polly package and AddPolicyHandler migration boundary` | The older integration exposes policy-based registration such as `AddPolicyHandler`; it is separate from current standard resilience APIs. Treat it as migration context and avoid mixing surfaces casually. |

## Cross-item comparison

| Decision | Sequential retry | Hedging | Circuit breaker | Limiter |
|---|---|---|---|---|
| Starts duplicate work? | Sequentially, after a failure/handled outcome | Yes, concurrently | No; rejects/short-circuits after threshold | No; queues or rejects excess work |
| Primary purpose | Recover from transient failures | Reduce tail latency | Stop repeated calls during sustained failure | Protect bounded capacity |
| Main risk | Duplicate effects and latency amplification | Load amplification and conflicting responses | False trips or delayed recovery | Rejection/queue delays |

Timeouts form a separate axis: attempt timeout bounds one try; total timeout bounds the strategy operation; caller cancellation bounds the larger application operation. No within-group comparison applies to unrelated API names beyond these strategy relationships.

## Examples

### Safe read client with unsafe methods excluded

```csharp
using Microsoft.Extensions.Http.Resilience;

builder.Services.AddHttpClient<CatalogClient>(client =>
    client.BaseAddress = new Uri("https://catalog.example/api/"))
    .AddStandardResilienceHandler(options =>
    {
        options.Retry.DisableForUnsafeHttpMethods();
        options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(20);
        options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(5);
    });
```

This keeps retry behavior away from unsafe methods while retaining bounded time. Validate actual package API signatures and options for the pinned package version. The timeout values are illustrative; choose them from the caller's end-to-end budget and downstream SLO. [HTTP resilience](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)

### Write with server-backed idempotency

```csharp
using var request = new HttpRequestMessage(HttpMethod.Post, "payments")
{
    Content = JsonContent.Create(command)
};
request.Headers.Add("Idempotency-Key", operationId);
using var response = await client.SendAsync(request, cancellationToken);
```

This request header alone does not make retries safe. The server must durably deduplicate the key, define behavior for a repeated key with a different payload, and return a result that lets the caller reconcile an uncertain timeout. Recreate request/content for each attempt if the configured resilience layer can replay it.

### Why retry layers multiply

If an outer layer makes up to four calls and each inner client call makes up to four attempts, the dependency can receive up to sixteen attempts. Count the initial attempt at each layer, then cap the combined elapsed budget and designate one retry owner where practical.

## Common mistakes

- Assuming the default standard HTTP retry strategy only retries GET; it can retry unsafe methods too.
- Treating `MaxRetryAttempts` as total attempts rather than retries after the first attempt.
- Setting attempt timeout without a total timeout or caller deadline.
- Retrying every exception/status indiscriminately, including permanent 4xx responses.
- Retrying a write when a timeout leaves the remote outcome unknown and no deduplication contract exists.
- Retrying a request with consumed, non-replayable content.
- Registering multiple standard handlers through defaults and per-client configuration.
- Using hedging as “faster retry” without accounting for simultaneous load or endpoint consistency.
- Treating a concurrency limiter as a rate-per-minute quota.
- Assuming the breaker proves dependency health or immediately probes recovery.
- Logging full request/response bodies, credentials, tenant identifiers, or unbounded URL values in callbacks.
- Assuming a resilience timeout can forcibly stop a remote operation.
- Using old `AddPolicyHandler` registration and new standard handler APIs interchangeably without checking which package is installed.

## Knowledge checks with answers

1. **Does three mean three total attempts?** No. `MaxRetryAttempts` is retries after the initial attempt, so three retries can produce four attempts.
2. **Why disable unsafe methods in the standard retry handler?** The standard HTTP retry behavior includes all methods unless configured; retrying POST after a lost response can duplicate a committed operation.
3. **What does total timeout include?** The complete pipeline operation, including attempts and retry delays; an outer caller deadline may still cancel earlier.
4. **When choose hedging over retry?** When reducing tail latency justifies parallel duplicate work, alternate endpoints are interchangeable, and capacity and idempotency support it.
5. **What does a timeout tell you about a remote write?** Only that the local operation stopped waiting/cancelled; it does not tell whether the server committed.
6. **Why can layering retries be dangerous?** Attempts multiply across layers, raising load and latency while making deadlines harder to reason about.
7. **What differs between current resilience integration and legacy Polly HTTP integration?** They are separate packages/API surfaces; current standard APIs use `AddStandardResilienceHandler`/hedging registration, while legacy migration code may use `AddPolicyHandler`.

## Sources

- [Build resilient HTTP apps](https://learn.microsoft.com/en-us/dotnet/core/resilience/http-resilience)
- [Use IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)

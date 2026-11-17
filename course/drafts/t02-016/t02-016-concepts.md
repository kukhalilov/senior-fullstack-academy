# health checks diagnostics metrics tracing and OpenTelemetry — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to define a useful health probe, distinguish health status from HTTP status, choose metric instruments, create meaningful distributed spans, explain context propagation and sampling, and trace telemetry from .NET code through an OpenTelemetry SDK and exporter.

## Prerequisites

Know the ASP.NET Core request pipeline, dependency injection, HTTP status codes, async cancellation, and basic production deployment concepts. Familiarity with a database-backed API is useful.

## Core concepts

### Health is a decision tied to a probe

“Healthy” has no universal meaning. A **liveness** check asks whether restarting a process could help when it cannot make progress. A **readiness** check asks whether this instance should receive new work. A **startup** probe gives initialization a bounded grace period before liveness checks become relevant. Container orchestrators and load balancers use the returned probe result according to their own policies; ASP.NET Core does not restart or remove an instance merely because `HealthStatus` changed.

Include only dependencies that affect the purpose of a probe. If a shared database outage makes every instance fail liveness, an orchestrator can restart all instances and amplify the outage. Readiness may include a database check when new requests cannot be served without it, but even that can reduce capacity during a transient incident. A check should have a timeout, cancellation path, and meaningful failure status. A timeout requests cancellation; it cannot forcibly stop an implementation that ignores its token.

The overall `HealthReport.Status` is the worst selected entry. `Degraded` is distinct from `Unhealthy`; the default endpoint mapping can return HTTP 200 for `Degraded`. Health status is therefore not identical to the HTTP status. Configure the mapping and the orchestrator's success criteria together.

### A health endpoint is not an observability dashboard

An endpoint probe runs selected checks when called. It is not scheduled by default. A registered `IHealthCheckPublisher` enables push-style periodic execution and calls publisher implementations with a report. The publisher is useful when a monitoring system expects the app to report outward; it is not the same as a load balancer polling an HTTP endpoint. Endpoint checks should be fast enough for probe frequency and concurrency.

Return only information the probe consumer needs. A public response containing exception text, internal hostnames, SQL server names, health-check data, or stack traces can disclose topology and implementation details. `HealthReport` is rich internal evidence; a custom response writer should project a safe subset. Health endpoints still need deliberate routing, authentication/host restrictions where appropriate, and no-store behavior.

### Metrics, traces, and logs answer different questions

- **Metrics** aggregate numeric observations over time. A counter records events, an up/down counter records a current quantity that rises and falls, and a histogram records a distribution (for example request durations). Observable instruments read a value from a callback when collection occurs; callbacks should be quick, thread-safe, and side-effect free.
- **Traces** model causally related operations as activities/spans. An inbound server activity can contain database and outbound HTTP child activities; trace and span IDs make the relationship visible across process boundaries.
- **Logs** retain event messages and structured context. Correlation IDs make logs useful alongside traces, but logging every measurement as a message is expensive and awkward to aggregate.

`System.Diagnostics.Metrics` and `System.Diagnostics.ActivitySource` let framework and library authors publish vendor-neutral signals without depending on a storage product. A `MeterListener` or SDK subscribes to meters; an `ActivityListener` or tracing SDK listens to sources. A call to `ActivitySource.StartActivity` can return `null` when no listener records it, so library instrumentation must be null-safe.

### Names and dimensions determine usefulness and cost

Give instruments stable names and appropriate units. Use UCUM units for measurements. Attributes/tags describe dimensions, such as method, route template, or status class. Every unique dimension combination can create a time series; user IDs, raw URLs, query strings, exception messages, and arbitrary tenant values create unbounded cardinality and may leak sensitive information. Keep route attributes templated, normalize values, and set a cardinality budget.

For traces, attributes should describe the operation rather than copy an entire request or object graph. Events represent timestamped occurrences within an activity; status conveys whether the operation failed. Baggage is propagated contextual data, potentially across trust boundaries. Treat baggage as untrusted input: allowlist keys, limit size, and never carry credentials or personal data by default.

### OpenTelemetry is an interoperable pipeline

The **API/instrumentation** creates measurements and activities. The **SDK** configures resources, readers, views, processors, and samplers. An **exporter** encodes and sends selected data. An optional **Collector** receives, processes, and routes telemetry; a **backend** stores and queries it. These are separate roles and can be combined or distributed in different ways.

Resources identify the entity producing telemetry. Set a stable `service.name`; add namespace, version, and deployment environment deliberately. Do not use a pod or process ID as the service identity. With OTLP, choose gRPC or HTTP/protobuf consistently with the endpoint. Environment-variable configuration can simplify deployment, but verify signal-specific endpoint precedence, protocol, credentials, and defaults rather than assuming every environment variable has the same scope.

Head sampling decides near trace start whether a trace is kept. A parent-based sampler respects a remote or local parent decision and delegates root sampling to a configured sampler. Tail sampling considers a complete trace at a Collector and can retain traces matching later errors/latency, but requires state and all relevant spans to reach the same decision point. Neither sampling strategy is lossless by default; instrument and sample with operational goals and cost limits in mind.

### Current ASP.NET Core instrumentation boundary

In .NET 11, built-in HTTP server metrics and request activities emit the required parts of OpenTelemetry HTTP semantic conventions by default. The hosting meter includes `http.server.request.duration` and `http.server.active_requests`; server activities carry standard HTTP attributes, including a resolved route value. The duration metric adds an `error.type` dimension for 5xx responses, which can affect cardinality. Direct SDK subscriptions can collect these framework signals without also adding duplicate ASP.NET Core instrumentation for the same server spans. The .NET 11 change is not retroactive to .NET 10 defaults. [Built-in HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http) [Breaking change and migration guidance](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

ASP.NET Core also has meters for routing, diagnostics, rate limiting, header parsing, Kestrel, SignalR, Blazor, authentication, and authorization. Blazor and authentication/authorization metrics were introduced in ASP.NET Core 10. Inspect the current metric reference for each instrument's type, unit, attributes, and presence conditions; similar names do not imply identical aggregation semantics. [Built-in metrics index](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore)

## Mechanisms and relationships

### Health result flow

```text
health-check registration
        │ selected by tag/predicate
        ▼
IHealthCheck.CheckHealthAsync(context, cancellationToken)
        │ returns result or throws
        ▼
HealthReport entries ── worst status ──► endpoint status/writer OR publisher
```

An exception is mapped using the registration's failure status and retained in the report entry. A returned `HealthCheckResult.Unhealthy` remains unhealthy; `FailureStatus` does not override an explicit returned status. Result `Data` is useful to internal aggregators but should not automatically become public JSON.

### Metric instrument selection

| Question | Instrument | Important property |
|---|---|---|
| How many completed events occurred? | Counter | Monotonic sum; record positive increments |
| How much work is currently in flight? | UpDownCounter | Add and subtract around state changes; balance on all paths |
| What is the distribution of request or job duration? | Histogram | Preserves buckets/distribution for percentile and tail analysis |
| What is a current value read at collection time? | Observable gauge/counter/up-down counter | Callback samples a value; do not emit side effects on collection |

A counter total often resets when a process restarts; aggregators compute rates over intervals. A histogram's mean does not reveal the tail. Do not calculate percentiles by averaging per-instance percentiles; aggregate histogram buckets or use an appropriate distribution representation.

### Trace context flow

`Activity.Current` carries the current activity in async execution. W3C Trace Context uses `traceparent` and optional `tracestate` headers to propagate a trace relationship across services. A trace ID identifies the trace; a span/activity ID identifies one operation. A child activity inherits the parent context; an `ActivityLink` represents causal context that is not a simple parent/child relationship, such as a batch consuming messages from multiple traces. Propagation transports context, not proof of identity or authorization.

## Worked examples

### Choose health probes for a web service

A web API has process-local routing, a required SQL database, and an optional recommendation service. Use a cheap process liveness check. Readiness can require SQL availability if requests cannot be safely processed without it, but decide whether recommendation failure should yield `Degraded` while the API remains routable. A startup check or platform startup probe should accommodate warm-up. Do not include remote SQL in liveness unless restart is an effective recovery action. Confirm the platform's interpretation of status codes: if it treats only 200 as success, explicitly map `Degraded` accordingly.

### Instrument a checkout operation

Create one `Meter` and `ActivitySource` per library/component, with stable names and an instrumentation version. Increment `checkout.completed` after a successful domain outcome. Record `checkout.duration` in a histogram with bounded tags such as payment outcome and route template. Start an activity around payment authorization and set a low-cardinality operation attribute. Do not tag with card number, user ID, raw URL, or exception message. Export traces with sampling and metrics with an appropriate reader.

### Avoid duplicate server spans in .NET 11

Subscribe to `Microsoft.AspNetCore.Hosting` for built-in server metrics and `Microsoft.AspNetCore` for built-in request activities. Before adding `AddAspNetCoreInstrumentation`, check whether it creates overlapping server spans or attributes in the deployed package/runtime combination. Keep the package only for extra capabilities you need, and verify trace counts and instrumentation scopes in an integration environment. In .NET 10, the defaults differ; use the migration guidance for the target runtime.

## Misconceptions and edge cases

- A healthy liveness response does not mean the service is ready for every request.
- A failed dependency probe should not automatically trigger process restarts.
- A timeout is cooperative cancellation; the check must observe its token and every I/O operation needs a bounded timeout.
- A health publisher and an HTTP endpoint are separate execution mechanisms.
- `HealthStatus.Degraded` may still map to HTTP 200 by default.
- An in-process metric listener does not persist or display data. Export and backend retention are separate.
- Instrument names alone do not tell you unit, temporality, dimensions, or availability conditions.
- `Activity.Current` can be absent; instrumentation must not assume a listener exists.
- A Collector is optional. It adds a processing hop and operational responsibility.
- Tail sampling requires trace assembly and buffering; it is not a cheaper synonym for head sampling.
- Semantic-convention updates can alter attributes, route cardinality, and dashboards. Treat telemetry schema as a versioned contract.
- Logs, traces, and health output can contain secrets even when the metric names appear harmless.

## Knowledge checks with answers

1. **Why keep a shared database check out of liveness?** A database outage may be external and not fixed by restarting the process; failing liveness on every replica can create a restart cascade. Readiness may still reflect the dependency if requests cannot be served.
2. **Does `FailureStatus` override an explicitly returned `HealthCheckResult.Unhealthy`?** No. It applies to thrown exceptions and results based on the registration's failure status.
3. **Which metric records request-duration distribution?** A histogram, because it preserves a distribution/buckets suitable for tail analysis.
4. **What if no listener subscribes to an `ActivitySource`?** `StartActivity` may return null; use null-safe instrumentation.
5. **Why is user ID a poor metric attribute?** It creates potentially unbounded cardinality and can expose personal data.
6. **What changed in ASP.NET Core 11?** Built-in HTTP server metrics and request activities emit required HTTP semantic-convention data by default; direct meter/source subscription can avoid duplicate instrumentation.
7. **Does OTLP store telemetry?** No. It is a protocol/export path. Storage and query behavior belong to a Collector/backend.

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [ASP.NET Core metrics overview](https://learn.microsoft.com/en-us/aspnet/core/metrics/overview)
- [Built-in ASP.NET Core metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore)
- [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [.NET metrics instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)
- [.NET distributed tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)
- [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/)


## System-design tracing across the .NET request path

Instrument an inbound request, database operation, and outbound dependency as one causal path. When work crosses a broker, propagate trace context in message metadata and start a consumer activity on receipt; a queue boundary is not automatically a child span in another process. Use a stable service identity and low-cardinality route/operation attributes. Track request outcomes and duration as metrics, use traces to localize a slow span, and keep sensitive user data and credentials out of baggage and telemetry. Sampling changes which traces are retained, so preserve aggregate metrics for population-wide SLOs. [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/) · [distributed tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs).

# health checks diagnostics metrics tracing and OpenTelemetry — Reference: System.Diagnostics APIs built-in ASP.NET signals custom instrumentation and correlation

## Scope and version

This reference covers the .NET signal APIs, ASP.NET Core built-in diagnostic surfaces, and local diagnostic CLI tools. It does not cover full logger configuration or vendor backends. ASP.NET Core 11 changes default HTTP activity enrichment and built-in metric semantics; check the target runtime and migration notes before assuming the same attributes exist on .NET 10. [Metrics instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation) [Tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs) [ASP.NET Core 11 change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

## How this group fits the mental model

`Meter` and instruments publish numeric observations; `ActivitySource` publishes spans and causal context; listeners or an SDK collect signals. Built-in ASP.NET meters cover framework work. Custom instruments should add domain meaning that framework metrics cannot infer. CLI diagnostics inspect a running process without being the same thing as application-level telemetry export.

## Supplied names explained

### Metric instruments and listener APIs

| Supplied name | Purpose and behavior |
|---|---|
| `System.Diagnostics.Metrics.Meter` | Namespace/type used to group instrument definitions under a stable instrumentation name and optional version. Create it once, commonly per library component. |
| `Meter.CreateCounter<T>` | Creates a monotonic cumulative counter for events or totals. Record positive increments with `Counter<T>.Add`; do not decrement it. |
| `Meter.CreateUpDownCounter<T>` | Creates a sum that can increase or decrease, useful for active work or queue depth when updates are balanced. |
| `Meter.CreateHistogram<T>` | Creates an instrument for a distribution such as duration or payload size; aggregators can retain bucket/distribution data rather than only a mean. |
| `Meter.CreateObservableCounter<T>` | Creates a counter sampled from a callback at collection time. Return cumulative values and keep the callback quick and side-effect free. |
| `Meter.CreateObservableUpDownCounter<T>` | Samples a current cumulative quantity that can rise or fall, such as current queue size. |
| `Meter.CreateObservableGauge<T>` | Samples a current point-in-time value, such as current temperature or memory state; it is not a cumulative event count. |
| `Counter<T>.Add` | Adds a nonnegative amount to a counter, with optional attributes/tags. Negative values violate counter semantics. |
| `UpDownCounter<T>.Add` | Adds a positive or negative delta; ensure every increment has a corresponding decrement even on cancellation/failure paths. |
| `Histogram<T>.Record` | Records one observation with optional dimensions, such as a request duration. Never attach unbounded/raw input values as tags. |
| `Measurement<T>` | A typed value plus optional tags yielded by observable instrument callbacks. Use it to report the sampled value and bounded dimensions. |
| `TagList` | A tag collection optimized for efficient measurement recording; it does not make high-cardinality tags safe. |
| `MeterListener` | Low-level listener for .NET metric instruments; useful in custom collectors/tests, while production apps often use an OpenTelemetry SDK. |
| `MeterListener.SetMeasurementEventCallback<T>` | Registers a typed callback for measurements of an instrument type. Callback work should be minimal and concurrency-safe. |
| `MeterListener.Start` | Begins listening and invokes instrument-published callbacks for the meters/instruments it enables. |
| `IMeterFactory` | DI abstraction for creating meters with factory-managed lifecycle; prefer it in DI-managed instrumentation services over global ad-hoc instances where supported. |
| `IMeterFactory.Create` | Creates/gets a meter through the service provider's meter factory, using stable name/version identity. |
| `IServiceCollection.AddMetrics` | Registers .NET metrics services such as `IMeterFactory` in dependency injection. It does not configure a vendor exporter. |
| `Metric instrument naming and UCUM units` | Use stable dot-separated names and standard UCUM units (for example `s` for seconds); name the measured quantity, not a backend-specific dashboard. |
| `Metric dimensions and cardinality` | Tags partition measurements into time series. Bound the possible values; user IDs, raw URLs, request IDs, or exception messages can create unbounded series and leak data. |
| `Counter versus up-down counter versus histogram versus gauge` | Counter tracks events, up/down counter a changing sum, histogram a population distribution, and gauge a current sampled value. Select based on the real mathematical question. |
| `Observable instrument callback lifecycle` | The callback runs during collection, potentially concurrently and more than once. Avoid I/O, mutation, blocking, and expensive enumeration in it. |

### Tracing APIs and context

| Supplied name | Purpose and behavior |
|---|---|
| `System.Diagnostics.ActivitySource` | Creates activities (spans) for named instrumentation. Give each library/component a stable, unique source name and optional instrumentation version. |
| `ActivitySource.StartActivity` | Starts an activity if a listener is interested; returns null when no listener records it. Use `using`/`Dispose` to stop and null-safe enrichment. |
| `ActivitySource.HasListeners` | Indicates whether any listener is attached to the source. It can avoid costly enrichment, but listener state may change; keep correctness independent of it. |
| `Activity` | .NET representation of a span, with timing, parent context, tags, events, status, and trace/span identifiers. |
| `Activity.Current` | Ambient current activity across async execution. It may be null and should not be used as an authorization or tenant identity. |
| `ActivityKind` | Classifies activity relationships such as Internal, Server, Client, Producer, or Consumer. Choose the kind that reflects the operation boundary. |
| `ActivityStatusCode` | Unset/Ok/Error status describing operation outcome. A successful status is not automatically proof that all downstream work succeeded. |
| `Activity.SetTag` | Adds or replaces an attribute on an activity. Prefer semantic-convention keys and safe, bounded values. |
| `Activity.SetStatus` | Sets the activity outcome and optional description. Avoid exception text in descriptions; record exceptions using appropriate event conventions. |
| `Activity.AddEvent` | Adds a timestamped event within an activity. Events are useful for sparse milestones, not high-frequency debug logging. |
| `ActivityContext` | Trace ID, span ID, flags, and trace state used to represent a parent context for propagation/creation. It is correlation context, not trust evidence. |
| `ActivityLink` | Links an activity to another context when there is causal association without one parent, such as processing a batch from several traces. |
| `ActivitySource.StartActivity overloads with parent context and links` | Overloads support explicit parent contexts, kind, tags, links, and start time. Use explicit context for message processing or nonambient relationships. |
| `ActivityListener` | Low-level listener controlling which sources and activities are observed; usually unnecessary when an SDK owns listener lifecycle. |
| `ActivityListener.ShouldListenTo` | Chooses an `ActivitySource` by name. Keep the predicate narrow to avoid recording unrelated instrumentation. |
| `ActivityListener.Sample` | Sampling callback receiving structured parent context, kind, and tags. Its result determines whether and how activity data is recorded. |
| `ActivityListener.SampleUsingParentId` | Legacy parent-ID sampling callback for string parent IDs; structured-context sampling is preferred when possible. |
| `Activity sampling and propagation` | Sampling decides recording volume; propagation carries context to child processes. Propagated context does not imply the parent span was retained or trusted. |
| `TraceId and SpanId correlation` | Trace ID groups related spans; span ID identifies one activity and its parent relation. Use these identifiers to correlate logs/traces, not as business keys. |
| `W3C Trace Context propagation` | Standard `traceparent` and optional `tracestate` headers transport trace context across services. Treat inbound values as untrusted and avoid using them for security decisions. |
| `Baggage propagation and data minimization` | Baggage carries key/value context across process boundaries. Allowlist keys, cap size, and omit secrets/PII because downstream services may record it. |
| `DiagnosticListener and DiagnosticSource legacy diagnostic events` | Older event-based diagnostics surface that can publish arbitrary payloads and activities. It remains relevant for existing instrumentation but differs from `Meter` and `ActivitySource`. |
| `EventCounters and dotnet-counters` | Legacy counter mechanism and CLI view/collection tool. Use when a runtime/library exposes EventCounters; do not assume every counter is a modern `Meter` instrument. |
| `ILogger scopes and trace correlation` | Structured log scopes add ambient properties; logging providers can include current trace/span IDs to correlate logs with activities. Avoid duplicating high-frequency metric observations as logs. |

### ASP.NET Core built-in meters and metric names

| Supplied name | What it covers |
|---|---|
| `Microsoft.AspNetCore.Hosting meter` | Hosting-level HTTP request and duration/activity signals. In .NET 11 it is the primary built-in HTTP server semantic-convention implementation. |
| `Microsoft.AspNetCore.Server.Kestrel meter` | Kestrel connection/server behavior. Its metrics complement request-level hosting measurements. |
| `Microsoft.AspNetCore.Routing meter` | Endpoint routing match attempts and related routing outcomes. Use route templates rather than literal request paths. |
| `Microsoft.AspNetCore.Diagnostics meter` | Diagnostics/error-handling middleware activity, including handled/unhandled exception counts. |
| `Microsoft.AspNetCore.RateLimiting meter` | Rate-limiter outcomes and permit behavior; interpret alongside limiter policy/partition configuration. |
| `Microsoft.AspNetCore.HeaderParsing meter` | HTTP header parsing outcomes, useful for diagnosing malformed/request-header load patterns. |
| `Microsoft.AspNetCore.Http.Connections SignalR meter` | SignalR server connection and transport metrics. This is connection-level behavior, not ordinary HTTP request count. |
| `Microsoft.AspNetCore.Components meter` | Blazor component navigation/render behavior; available in ASP.NET Core 10 and later. |
| `Microsoft.AspNetCore.Components.Lifecycle meter` | Blazor lifecycle measurements in ASP.NET Core 10 and later. |
| `Microsoft.AspNetCore.Components.Server.Circuits meter` | Server-side Blazor circuit counts/state measurements in ASP.NET Core 10 and later. |
| `Microsoft.AspNetCore.Authentication meter` | Authentication activity metrics, including challenges; available in ASP.NET Core 10 and later. |
| `Microsoft.AspNetCore.Authorization meter` | Authorization attempt metrics; available in ASP.NET Core 10 and later. |
| `http.server.request.duration` | Histogram of server request duration in seconds. In .NET 11 its attributes follow required HTTP metric conventions, including `error.type` on 5xx outcomes. |
| `aspnetcore.diagnostics.exceptions` | Counter of exceptions observed by ASP.NET Core diagnostics/error-handling middleware; it is not necessarily a count of every thrown exception in process code. |
| `aspnetcore.authorization.attempts` | Counter for authorization attempts/outcomes. Consult the versioned metric reference for its precise attributes and presence conditions. |
| `aspnetcore.authentication.challenges` | Counter for authentication challenge events, not a count of successful sign-ins. |
| `kestrel.active_connections` | Up/down counter representing active Kestrel connections, which can outlive multiple HTTP requests. |
| `signalr.server.active_connections` | Up/down counter for currently active SignalR server connections. It is not a measure of currently executing hub methods. |
| `HTTP server metric attribute cardinality and route-template guidance` | Framework metrics generally use bounded method/status/route dimensions; raw URLs and identifiers would explode cardinality. Review the official reference when adding filters/views. |
| `ASP.NET Core built-in request ActivitySource Microsoft.AspNetCore` | Built-in request activity source name to subscribe to for ASP.NET Core server request traces in the supported runtime. |
| `ASP.NET Core request trace semantic-convention attributes` | .NET 11 adds required HTTP span attributes such as method, status, route, network protocol, URL scheme, server address/port, and user agent. Exact optionality follows the semantic convention. |
| `ASP.NET Core request Activity enrichment and suppression switch` | `Microsoft.AspNetCore.Hosting.SuppressActivityOpenTelemetryData` controls built-in convention enrichment; in .NET 11 it defaults to `false`. Change it only with a clear need and migration plan. |
| `Built-in diagnostics versus OpenTelemetry instrumentation package duplication` | .NET 11 built-ins cover required server HTTP signals; adding ASP.NET instrumentation can overlap. Compare sources/scopes and retain the package only for additional features actually needed. |

### Runtime diagnostic commands

| Supplied name | Purpose and safe use |
|---|---|
| `dotnet-counters monitor` | Live view of selected `Meter` instruments and legacy counters for a process; useful for quick triage, not durable monitoring. |
| `dotnet-counters collect` | Captures counter data to a file over an interval for later inspection. Bound duration and output handling on production systems. |
| `dotnet-trace collect` | Collects EventPipe trace data from a running process. Trace files can contain sensitive details and should be access-controlled. |
| `dotnet-dump collect` | Captures a process dump for memory/thread investigation; dumps may contain credentials and user data, so protect and dispose of them securely. |
| `dotnet-monitor diagnostic tools` | Sidecar/service tool that exposes .NET diagnostics endpoints and can collect traces, dumps, counters, and logs under configured access controls. Treat its endpoint as privileged. |

## Cross-item comparison

| Surface | Data model | Preferred use |
|---|---|---|
| `Meter` / `Counter<T>` / `Histogram<T>` | Numeric aggregate observations | Trends, rates, error ratios, latency distributions |
| `ActivitySource` / `Activity` | Timed causal spans/events | One operation across in-process and remote boundaries |
| `DiagnosticSource` / `EventCounters` | Legacy event/counter mechanisms | Existing framework/library diagnostics and compatibility tools |
| `dotnet-counters` / `dotnet-trace` / `dotnet-dump` | Process-level diagnostic collection | Live incident investigation and local capture |

## Examples

### Record a bounded metric and span

```csharp
private static readonly Meter Meter = new("Shop.Checkout", "1.0.0");
private static readonly Counter<long> Completed = Meter.CreateCounter<long>("checkout.completed", "{operation}");
private static readonly Histogram<double> Duration = Meter.CreateHistogram<double>("checkout.duration", "s");
private static readonly ActivitySource Source = new("Shop.Checkout", "1.0.0");

using var activity = Source.StartActivity("checkout.authorize", ActivityKind.Internal);
var started = Stopwatch.GetTimestamp();
try
{
    await AuthorizeAsync(cancellationToken);
    Completed.Add(1, new KeyValuePair<string, object?>("outcome", "success"));
}
catch (Exception ex)
{
    activity?.SetStatus(ActivityStatusCode.Error);
    activity?.AddEvent(new ActivityEvent("authorization failed"));
    throw;
}
finally
{
    Duration.Record(Stopwatch.GetElapsedTime(started).TotalSeconds);
}
```

Do not add `ex.Message`, card details, or user identifiers as tags. In production, use a stable, low-cardinality outcome vocabulary and decide whether exception recording is owned by automatic instrumentation to avoid duplicates.

### Subscribe to built-in server signals in .NET 11

```csharp
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics.AddMeter("Microsoft.AspNetCore.Hosting"))
    .WithTracing(tracing => tracing.AddSource("Microsoft.AspNetCore"));
```

The example subscribes to built-in sources; it does not configure export, sampling, service identity, or a backend. Add other meters/sources only when they are needed. In .NET 11, verify whether ASP.NET instrumentation duplicates these server activities before registering it too. [ASP.NET Core HTTP metric reference](https://learn.microsoft.com/en-us/aspnet/core/metrics/http) [.NET 11 change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

## Common mistakes

- Treating an up/down counter as a monotonic event total.
- Recording an `ObservableGauge` callback that blocks on a database or mutates state.
- Assuming `StartActivity` always returns a non-null object.
- Adding user IDs, raw paths, or request IDs to metric attributes.
- Treating trace context or baggage as trusted identity.
- Using `DiagnosticSource` and `ActivitySource` interchangeably.
- Expecting `dotnet-counters` to produce durable dashboards or alerts.
- Adding both built-in .NET 11 server tracing and overlapping instrumentation without checking duplicate spans.
- Sharing memory dumps outside the incident response access boundary.

## Knowledge checks with answers

1. **Which instrument is suited to latency distributions?** A histogram; counters cannot retain an observation distribution.
2. **Can `ActivitySource.StartActivity` return null?** Yes, when no listener records it. Use null-safe code.
3. **Why is a route template safer than a raw URL dimension?** Route templates bound the value set and avoid embedding arbitrary user input.
4. **What is a trace ID?** A correlation identifier for related spans, not an authorization credential or business identifier.
5. **What is the .NET 11 source name for built-in request activities?** `Microsoft.AspNetCore`; subscribe explicitly when configuring a provider.
6. **What do `dotnet-dump collect` artifacts require?** Restricted storage and retention because process memory may contain secrets and personal data.

## Sources

- [.NET metrics instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)
- [.NET tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)
- [ASP.NET Core built-in metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore)
- [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters)
- [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
- [dotnet-dump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-dump)
- [.NET OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/)

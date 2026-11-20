# health checks diagnostics metrics tracing and OpenTelemetry — Reference: OpenTelemetry SDK hosting registration resource processors samplers readers and exporters

## Scope and version

This reference covers OpenTelemetry .NET package roles and SDK configuration. OpenTelemetry package release numbers evolve independently from .NET. Keep related package versions compatible using the current official package guidance and target framework matrix; do not copy a one-time version number into a long-lived lesson. Configure metrics, traces, and logs as distinct signal pipelines even when one host builder registers them together. [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/) [OpenTelemetry .NET metrics](https://opentelemetry.io/docs/languages/dotnet/metrics/) [OpenTelemetry .NET traces](https://opentelemetry.io/docs/languages/dotnet/traces/)

## How this group fits the mental model

An instrumentation library emits framework or application signals; a provider subscribes to selected meters/sources and applies SDK policy; a reader/exporter turns collected measurements or spans into an export format; OTLP can deliver them directly to a backend or through a Collector. Resources identify the producing service. Processors and samplers shape trace flow; metric views/readers shape metric flow. Keep the app's availability decoupled from exporter availability with bounded queues/timeouts and a clear shutdown budget.

## Supplied names explained

### Packages and registration

| Supplied name | Purpose and behavior |
|---|---|
| `OpenTelemetry .NET SDK package family` | NuGet packages implementing the OpenTelemetry API, SDK, integrations, and exporters. Select only the required packages and keep compatible versions. |
| `OpenTelemetry.Extensions.Hosting package` | Integrates provider lifecycle with .NET hosting and exposes dependency-injection registration helpers. |
| `OpenTelemetry.Instrumentation.AspNetCore package` | Instrumentation library for ASP.NET Core requests and middleware. In .NET 11, built-ins already emit required server HTTP signals. Current package versions can detect framework tags and skip adding the same tags; verify target versions and retain the package when its additional features are needed. |
| `OpenTelemetry.Instrumentation.Http package` | Instruments outgoing `HttpClient` operations. Register only if outbound HTTP spans/metrics are needed and not already produced by another instrumentation layer. |
| `OpenTelemetry.Instrumentation.Runtime package` | Adds runtime/process measurements such as GC, thread-pool, and allocation metrics, depending on package version. It is not a replacement for app-specific measurements. |
| `OpenTelemetry.Exporter.OpenTelemetryProtocol package` | Exports supported OpenTelemetry signals through OTLP using configured protocol/endpoint. |
| `OpenTelemetry.Exporter.Console package` | Development/demo exporter that writes telemetry to console output. Avoid high-volume production use. |
| `IServiceCollection.AddOpenTelemetry` | Registers OpenTelemetry builder/provider services with dependency injection and hosting lifecycle integration. |
| `OpenTelemetryBuilder.WithMetrics` | Configures the metric provider pipeline, including meter subscriptions, views, readers, and exporters. |
| `OpenTelemetryBuilder.WithTracing` | Configures the tracer provider pipeline, including source subscriptions, sampling, processors, and exporters. |

### Provider configuration, resources, and environment

| Supplied name | Purpose and behavior |
|---|---|
| `MeterProviderBuilder.AddMeter` | Subscribes the metrics provider to named .NET meters. A meter that is not subscribed may produce no exported data. |
| `TracerProviderBuilder.AddSource` | Subscribes the tracing provider to named `ActivitySource` instances. Use exact names and avoid subscribing to every source accidentally. |
| `MeterProviderBuilder.AddView` | Changes metric aggregation, name, or attribute projection for selected instruments. Views can limit dimensions and control histogram aggregation. |
| `MeterProviderBuilder.AddReader` | Adds a metric reader that collects/exports data according to its temporality, aggregation, and schedule. |
| `TracerProviderBuilder.AddProcessor` | Adds a span processor such as batching, filtering, enrichment, or export coordination. Order and behavior depend on the processor chain. |
| `TracerProviderBuilder.SetSampler` | Selects spans for recording at trace start. Sampling affects cost and visibility; parent decisions and service-wide strategy must be understood. |
| `ResourceBuilder.AddService` | Adds standard service identity attributes such as service name, namespace, version, and instance identity to the provider resource. Use stable identity values. |
| `ResourceBuilder.AddAttributes` | Adds resource-level key/value attributes shared by emitted telemetry. Do not put per-request or secret values on a resource. |
| `service.name resource attribute` | Required identifying service name; use a stable logical service name such as `orders-api`, not a unique pod name. |
| `service.namespace resource attribute` | Optional grouping for related services, such as `commerce`; use consistent naming across deployments. |
| `service.version resource attribute` | Identifies the deployed service version/build when operationally useful. Keep it low-cardinality over retention windows. |
| `deployment.environment.name resource attribute` | Identifies environment such as production or staging. Use the current semantic-convention key and consistent values. |
| `OTEL_SERVICE_NAME environment variable` | Environment-based way to configure `service.name`; explicit SDK resource settings may take precedence depending on configuration order. |
| `OTEL_RESOURCE_ATTRIBUTES environment variable` | Adds comma-separated resource attributes. Parse carefully and avoid placing secrets or uncontrolled values in environment configuration. |
| `OTLP exporter protocol selection` | Selects OTLP transport encoding (commonly gRPC or HTTP/protobuf). The collector/backend endpoint must accept the selected transport. |
| `OTLP gRPC endpoint configuration` | Configures an OTLP gRPC receiver endpoint, commonly using the collector's gRPC port. TLS, authentication, and network policy remain deployment responsibilities. |
| `OTLP HTTP/protobuf endpoint configuration` | Configures OTLP over HTTP using protobuf payloads; path and endpoint conventions may differ from gRPC. Confirm signal-specific endpoint behavior. |
| `OTEL_EXPORTER_OTLP_ENDPOINT environment variable` | Sets the common OTLP endpoint. Signal-specific endpoint variables can override it; endpoint path composition depends on protocol and exporter configuration. |
| `OTEL_EXPORTER_OTLP_PROTOCOL environment variable` | Selects the environment-configured OTLP protocol. Ensure SDK/exporter versions support the selected value and receiver. |
| `OpenTelemetry SDK environment-variable configuration` | Standard environment variables can configure resource identity, protocol, endpoint, headers, and sampling in supported SDK features. Validate precedence and secret handling for the exact SDK version. |
| `OpenTelemetry SDK package version alignment` | Instrumentation, exporter, API, and SDK packages have compatibility ranges. Upgrade them as a compatible set and inspect transitive package constraints. |

### Metrics and traces pipeline components

| Supplied name | Purpose and behavior |
|---|---|
| `PeriodicExportingMetricReader` | Collects metrics on an interval and exports them through its exporter. Configure interval/timeout with data freshness and shutdown constraints in mind. |
| `MetricReader temporality and aggregation configuration` | Temporality controls whether sums are delta or cumulative; aggregation controls representation such as histogram buckets. Backend expectations must match. |
| `BatchActivityExportProcessor` | Buffers spans and exports batches for throughput efficiency. Queue limits, export timeouts, and shutdown flushing affect loss and latency. |
| `SimpleActivityExportProcessor` | Exports each ended activity synchronously through the configured exporter path; useful for debugging, generally costly for production request paths. |
| `ParentBasedSampler` | Follows the parent sampled decision for child spans and delegates root decisions to a configured sampler. Important for keeping distributed traces coherent. |
| `TraceIdRatioBasedSampler` | Samples root traces according to a configured probability based on trace ID. It is not a guaranteed exact percentage per short interval. |
| `AlwaysOnSampler` | Records every eligible trace. Simple for development but can be expensive and expose more data in production. |
| `AlwaysOffSampler` | Drops trace recording. Use only when traces are intentionally disabled; metrics/logs remain separate signals. |
| `ASP.NET Core instrumentation AddAspNetCoreInstrumentation` | Registers ASP.NET Core instrumentation and options such as filtering/enrichment. In .NET 11, built-in HTTP metrics are primary; current tracing package versions can detect built-in tags and skip duplicates. Check the exact runtime/package combination before deciding whether the package's additional features are needed. |
| `HTTP client instrumentation AddHttpClientInstrumentation` | Registers outbound `HttpClient` instrumentation and supports request filtering/enrichment. Avoid recording sensitive URLs, headers, or bodies. |
| `Runtime instrumentation AddRuntimeInstrumentation` | Adds runtime metric collection. Select meters/instruments and export budgets deliberately; metric names and supported set can change by package version. |
| `ASP.NET Core request filter and enrichment options` | Filters or enriches inbound server telemetry. Filtering can reduce noise; enrichment must remain low-cardinality and privacy-safe. |
| `HTTP client request filter and enrichment options` | Filters/enriches outgoing request telemetry. Strip credentials and sensitive query values; avoid unbounded destination tags. |
| `OpenTelemetry logging integration versus ILogger providers` | Logging can use a dedicated OTel logger provider or an existing logging provider/export path. Avoid unintentionally exporting each log twice. |
| `OpenTelemetry logger provider AddOpenTelemetry` | Adds the OpenTelemetry logging provider to `ILoggingBuilder` in supported package versions. Configure processors/exporters and scopes explicitly. |
| `Metrics exporter versus tracing exporter` | Exporters are signal-specific: metric readers/exporters collect aggregates, while span processors/exporters send ended spans. One OTLP package can support multiple signals but the pipelines are distinct. |

### Architecture, sampling, and data governance

| Supplied name | Purpose and behavior |
|---|---|
| `Instrumentation library versus SDK versus exporter versus backend` | Instrumentation emits data; SDK subscribes/configures; exporter transmits; backend stores/query data. A library can depend on API abstractions without choosing an exporter/backend. |
| `OpenTelemetry Collector receiver processor exporter pipeline` | A Collector accepts signals via receivers, applies processors, and sends via exporters. Processors can batch, filter, transform, or sample before the backend. |
| `Collector versus in-process exporter topology` | Direct export is simpler; Collector adds centralized routing, processing, credentials, and fan-out at the cost of another component and hop. |
| `OTLP retry queue and exporter shutdown behavior` | Export pipelines may buffer/retry within configured limits. Network outage, full queue, timeout, or process termination can still lose telemetry; never assume infinite delivery. |
| `Flush and graceful shutdown via ForceFlush and Shutdown` | Providers/processors expose flush/shutdown behavior so buffered telemetry can drain. Bound the shutdown deadline and do not block host stop indefinitely. |
| `OpenTelemetry semantic conventions versioning` | Standard attribute names and meanings evolve; pin the convention expectation in dashboards and migration notes when upgrades change emitted fields. |
| `Sampling tradeoffs and tail-sampling collector boundary` | Head sampling is cheap at the service but decides before outcome; tail sampling can use complete trace outcome at a Collector but needs buffering, routing, and trace assembly. |
| `Trace baggage and PII security risk` | Baggage propagates broadly and may be copied into telemetry. Allowlist and bound it; never put credentials, tokens, or personal data in it by default. |
| `Metric label cardinality cost` | Every unique dimension set can create a time series, increasing memory/storage/query cost. Use bounded dimensions and metric views to drop unsafe attributes. |
| `Avoid duplicate ASP.NET Core instrumentation in .NET 11` | Built-in .NET 11 HTTP meters and activities provide required semantic-convention signals. The current instrumentation package can detect built-in tags and skip re-adding them, but behavior depends on package/runtime versions and other package features may still be useful. Verify actual emitted spans and measurements rather than assuming duplication or assuming no overlap. |
| `Avoid recording secrets and request body data in telemetry` | Request/response bodies, cookies, authorization headers, query values, exception text, and user-controlled values may contain secrets/PII. Collect only explicitly justified, redacted data. |
| `Telemetry exporter failure and application availability tradeoff` | Exporter latency or outage should generally degrade telemetry delivery, not business requests. Use bounded queues, timeouts, retry budgets, and operational alerts for dropped data. |

## Cross-item comparison

| Architecture choice | Advantages | Costs and failure mode |
|---|---|---|
| Direct OTLP export | Few moving parts and simple topology | App owns credentials, endpoint changes, retries, and fan-out; destination outage can fill local queues |
| OpenTelemetry Collector | Central filtering, batching, routing, redaction, and backend decoupling | Another service to secure, scale, monitor, and keep available |
| Parent-based head sampling | Low overhead and trace tree consistency | Cannot choose based on a later error or total duration not yet known |
| Tail sampling | Can retain traces based on whole-trace outcome | Requires complete trace routing, memory/buffering, and a centralized decision point |

## Examples

### Configure separate metric and trace pipelines

```csharp
builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService(serviceName: "orders-api", serviceVersion: "2.4.0"))
    .WithMetrics(metrics => metrics
        .AddMeter("Microsoft.AspNetCore.Hosting", "Orders.Api")
        .AddOtlpExporter())
    .WithTracing(tracing => tracing
        .AddSource("Microsoft.AspNetCore", "Orders.Api")
        .SetSampler(new ParentBasedSampler(new TraceIdRatioBasedSampler(0.10)))
        .AddOtlpExporter());
```

This is a structural example: install the hosting, SDK, and OTLP exporter packages compatible with the target runtime; configure OTLP endpoint/protocol/credentials; and verify the .NET 11 built-in HTTP instrumentation and instrumentation package cooperate as expected. Current package versions can skip adding tags already supplied by the framework. Ten percent root sampling is only illustrative and should follow service goals and retention cost. [OpenTelemetry .NET getting started](https://opentelemetry.io/docs/languages/dotnet/) [ASP.NET Core .NET 11 migration guidance](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

### Limit sensitive metric attributes with a view

Use a metric view to retain only bounded attributes such as method, route template, and status class. Confirm the exact attribute filtering builder syntax against the chosen OpenTelemetry .NET release; the design goal is to drop user IDs and raw URLs before export, not to rely on backend dashboards to hide them later.

### Export through a Collector

Configure the app's OTLP endpoint to a trusted Collector. The Collector can receive OTLP, batch data, apply filtering/redaction, and export to one or more backends. Secure its receiver, limit network access, protect exporter credentials, and monitor dropped/queued telemetry. [OTLP specification](https://opentelemetry.io/docs/specs/otlp/)

## Common mistakes

- Installing only exporters while subscribing to no source/meter.
- Treating a resource attribute as a per-request tag.
- Setting a unique `service.name` on every replica and losing service aggregation.
- Assuming `OTEL_EXPORTER_OTLP_ENDPOINT` and signal-specific endpoint variables combine identically for every protocol.
- Using synchronous/simple processors on hot request paths in production.
- Retrying telemetry indefinitely or with unbounded memory.
- Sampling children independently and breaking parent/trace coherence.
- Assuming tail sampling works when spans for one trace are spread across independent Collectors.
- Assuming every ASP.NET Core instrumentation package version either duplicates or automatically suppresses all built-in telemetry; verify the deployed combination and emitted signals.
- Exporting secrets in logs, URLs, baggage, tags, or health details.
- Blocking host shutdown on an exporter beyond the deployment termination grace period.

## Knowledge checks with answers

1. **What is the difference between instrumentation and an exporter?** Instrumentation emits measurements/spans; an exporter transmits collected telemetry in a supported format.
2. **Why set `service.name` consistently?** It groups telemetry from replicas as one logical service; unique instance names fragment service-level views.
3. **When can tail sampling retain an error trace that head sampling dropped?** When the Collector receives the full trace and evaluates it after spans reveal the error.
4. **Why use a metric view?** To control aggregation/dimensions before export, including dropping high-cardinality attributes.
5. **Does OTLP retry guarantee delivery?** No. Queues, retries, timeouts, process loss, and destination limits can all result in drops.
6. **How should exporter outage affect application handling?** Prefer bounded degradation and observable drops rather than making request success depend on telemetry export.

## Sources

- [.NET OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/)
- [.NET OpenTelemetry metrics](https://opentelemetry.io/docs/languages/dotnet/metrics/)
- [.NET OpenTelemetry traces](https://opentelemetry.io/docs/languages/dotnet/traces/)
- [OTLP specification](https://opentelemetry.io/docs/specs/otlp/)
- [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

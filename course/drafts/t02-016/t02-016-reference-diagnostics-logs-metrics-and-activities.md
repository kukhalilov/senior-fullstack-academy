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
| `Meter.CreateHistogram<T> advice parameter` | Optional advice supplies recommended histogram bucket boundaries to compatible collection tools; it cannot force every SDK or backend to use those boundaries. |
| `Meter.CreateObservableCounter<T>` | Creates a counter sampled from a callback at collection time. Return cumulative values and keep the callback quick and side-effect free. |
| `Meter.CreateObservableUpDownCounter<T>` | Samples a current cumulative quantity that can rise or fall, such as current queue size. |
| `Meter.CreateObservableGauge<T>` | Samples a current point-in-time value, such as current temperature or memory state; it is not a cumulative event count. |
| `Meter.CreateGauge<T>` | Creates a synchronous, non-additive gauge whose current observations are recorded by the application when values change; available in the .NET 11 target API. |
| `Gauge<T>` | Strongly typed instrument created by `Meter.CreateGauge<T>`; unlike an observable gauge it has no collection-time callback. |
| `Gauge<T>.Record` | Reports the current non-additive value, optionally with tags. Use bounded dimensions and report a new observation when the value changes. |
| `Counter<T>.Add` | Adds a nonnegative amount to a counter, with optional attributes/tags. Negative values violate counter semantics. |
| `UpDownCounter<T>.Add` | Adds a positive or negative delta; ensure every increment has a corresponding decrement even on cancellation/failure paths. |
| `Histogram<T>.Record` | Records one observation with optional dimensions, such as a request duration. Never attach unbounded/raw input values as tags. |
| `InstrumentAdvice<T>` | Optional instrument metadata used to guide collection behavior; it is advice rather than a guarantee about exporter aggregation. |
| `InstrumentAdvice<T>.HistogramBucketBoundaries` | Supplies recommended explicit boundaries for histogram aggregation. Choose boundaries for the question and units; inspect the configured SDK/exporter because support can differ. |
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
| `Counter versus up-down counter versus histogram versus synchronous gauge versus observable gauge` | Counter tracks events, up/down counter a changing sum, histogram a population distribution, synchronous gauge records point-in-time updates, and observable gauge samples at collection time. Select the instrument that matches the value's semantics. |
| `Histogram advice bucket boundaries are hints to compatible collection tools` | Explicit boundaries can improve useful histogram buckets, but APIs label them advice; exporters and backends may ignore or transform them. |
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
| `Microsoft.Extensions.Diagnostics.HealthChecks meter` | Meter for opt-in .NET health-check publisher counters; the publisher is enabled with `AddTelemetryHealthCheckPublisher` and the metrics are push-only. |
| `dotnet.health_check.reports` | Counter of health reports by `dotnet.health_check.status`; available starting in .NET 8 when the telemetry publisher is configured. |
| `dotnet.health_check.unhealthy_checks` | Counter of checks reporting Degraded or Unhealthy, tagged by check name and status; despite its name it includes Degraded. Available starting in .NET 8 with the publisher. |
| `http.server.request.duration` | Histogram of server request duration in seconds. In .NET 11 its attributes follow required HTTP metric conventions, including `error.type` on 5xx outcomes. |
| `aspnetcore.diagnostics.exceptions` | Counter of exceptions observed by ASP.NET Core diagnostics/error-handling middleware; it is not necessarily a count of every thrown exception in process code. |
| `aspnetcore.diagnostics.exception.result attribute` | Result dimension for exception-handler middleware, with values such as handled and unhandled. |
| `aspnetcore.diagnostics.handler.type attribute` | Full type name of an `IExceptionHandler` that handled the exception, present only when that handler handles it. Avoid assuming it is present for unhandled exceptions. |
| `exception.type attribute` | Exception type dimension on diagnostics/authentication/authorization and Blazor exception-related measurements where documented. A type name is more bounded than exception text, but can still vary with dynamically generated/plugin types. |
| `aspnetcore.authorization.attempts` | Counter for authorization attempts/outcomes. Consult the versioned metric reference for its precise attributes and presence conditions. |
| `aspnetcore.authentication.challenges` | Counter for authentication challenge events, not a count of successful sign-ins. |
| `aspnetcore.authentication.authenticate.duration` | Histogram of authentication time per request; reports result and scheme on non-error outcomes and error type on failure/error paths. |
| `aspnetcore.authentication.forbids` | Counter of forbid operations, meaning an authenticated principal was denied access; not interchangeable with unauthenticated challenges. |
| `aspnetcore.authentication.sign_ins` | Counter of principal sign-ins by authentication scheme. |
| `aspnetcore.authentication.sign_outs` | Counter of principal sign-outs by authentication scheme. |
| `user.is_authenticated attribute` | Boolean dimension on authorization attempts; it is not a user identifier. |
| `aspnetcore.authorization.policy attribute` | Policy name where an authorization policy was used. Policy names should remain a controlled, bounded set. |
| `aspnetcore.authorization.result attribute` | Success/failure outcome when authorization finishes without an exception. |
| `aspnetcore.authentication.result attribute` | Authentication result such as success, failure, none, or `_OTHER` when available. |
| `aspnetcore.authentication.scheme attribute` | Authentication scheme name where applicable; scheme is configuration identity, not the authenticated user's identity. |
| `aspnetcore.components.navigate` | Blazor route-change counter, tagged with component type and route; available in ASP.NET Core 10 and later. Route values should be inspected for cardinality and user data. |
| `aspnetcore.components.handle_event.duration` | Blazor browser-event handler duration histogram, including component business logic but excluding child-component event handling; tags include component type, C# handler name, and component attribute. |
| `aspnetcore.components.update_parameters.duration` | Histogram of component parameter processing, including component business logic; tagged by component type. |
| `aspnetcore.components.render_diff.duration` | Histogram for rendering a component tree and producing the HTML diff, including changed-component logic. |
| `aspnetcore.components.render_diff.size` | Histogram of HTML elements changed in a rendering batch; large diffs can increase DOM/network work. |
| `aspnetcore.components.circuit.active` | Up/down counter of server-side Blazor circuits currently held in memory. It is a state/memory-capacity signal. |
| `aspnetcore.components.circuit.connected` | Up/down counter of server-side Blazor circuits connected to clients; circuit count and SignalR transport connection count are related but not identical. |
| `aspnetcore.components.circuit.duration` | Histogram of server-side Blazor circuit lifetime; it can estimate total circuit count and session/tab duration. |
| `aspnetcore.components.type attribute` | Component type name on navigation and event-handler metrics. |
| `aspnetcore.components.route attribute` | The route for the navigated-to component; inspect route patterns for unbounded values or sensitive values. |
| `code.function.name attribute` | C# handler method name on Blazor event-duration metrics. |
| `aspnetcore.components.attribute.name attribute` | Component attribute name handling the browser event, such as `onclick`. |
| `ASP.NET Core authentication and authorization metric availability` | Built-in authentication and authorization metrics are available in ASP.NET Core 10 and later. Metric instrument types, attribute presence conditions, and error dimensions are documented individually. |
| `ASP.NET Core Blazor metric availability` | Built-in Blazor component, lifecycle, and server-circuit metrics are available in ASP.NET Core 10 and later; they describe component and circuit work, not a complete browser performance trace. |
| `ASP.NET Core metric instrumentation availability by runtime version` | HTTP/diagnostics metrics and modern .NET health-check metrics have different introduction versions. Blazor and authentication/authorization metrics require ASP.NET Core 10 or later; ASP.NET Core 11 adds HTTP semantic-convention enrichment to built-in HTTP server telemetry. Check the version selector when targeting older runtimes. |
| `aspnetcore.diagnostics.exceptions instrument type Counter unit {exception}` | The diagnostics exception instrument is a counter with UCUM unit `{exception}`; it counts exceptions caught by ASP.NET Core exception-handling middleware. |
| `aspnetcore.components.navigate instrument type Counter unit {route}` | The Blazor navigation instrument is a counter of route changes with unit `{route}`. |
| `aspnetcore.components.handle_event.duration instrument type Histogram unit s` | Browser-event handler duration histogram, measured in seconds. |
| `aspnetcore.components.update_parameters.duration instrument type Histogram unit s` | Component parameter processing histogram, measured in seconds. |
| `aspnetcore.components.render_diff.duration instrument type Histogram unit s` | Component render-diff duration histogram, measured in seconds. |
| `aspnetcore.components.render_diff.size instrument type Histogram unit {elements}` | Render-diff size histogram measured in changed HTML elements. |
| `aspnetcore.components.circuit.active instrument type UpDownCounter unit {circuit}` | Number of in-memory server-side Blazor circuits as a changing quantity. |
| `aspnetcore.components.circuit.connected instrument type UpDownCounter unit {circuit}` | Number of server-side Blazor circuits connected to clients as a changing quantity. |
| `aspnetcore.components.circuit.duration instrument type Histogram unit s` | Circuit lifetime histogram measured in seconds. |
| `aspnetcore.authorization.attempts instrument type Counter unit {request}` | Counter of requests where authorization was attempted. |
| `aspnetcore.authentication.authenticate.duration instrument type Histogram unit s` | Authentication processing duration per request, measured in seconds. |
| `aspnetcore.authentication.challenges instrument type Counter unit {request}` | Counter of authentication challenge operations. |
| `aspnetcore.authentication.forbids instrument type Counter unit {request}` | Counter of forbid operations. |
| `aspnetcore.authentication.sign_ins instrument type Counter unit {request}` | Counter of sign-in operations. |
| `aspnetcore.authentication.sign_outs instrument type Counter unit {request}` | Counter of sign-out operations. |
| `error.type attribute presence conditions on built-in ASP.NET Core metrics` | Many built-in metrics emit `error.type` only on documented error paths; inspect per-instrument presence rules. Exception type strings can create a wider dimension set than a small fixed result enum. |
| `Health-check metrics push collection limitation` | The built-in `AddTelemetryHealthCheckPublisher` health counters are push-only and unavailable through pull-based metrics collection. Use a compatible push pipeline or define another signal for a scrape-only backend. |
| `Microsoft.Extensions.Diagnostics.HealthChecks.Common package` | Supplies `AddTelemetryHealthCheckPublisher` for the supported .NET versions. This package-provided API is separate from ASP.NET Core's HTTP health-check endpoint middleware. |
| `kestrel.active_connections` | Up/down counter representing active Kestrel connections, which can outlive multiple HTTP requests. |
| `signalr.server.active_connections` | Up/down counter for currently active SignalR server connections. It is not a measure of currently executing hub methods. |
| `http.server.active_requests` | Up/down counter for inbound HTTP requests currently in flight; it is distinct from active network connections, and reports method and scheme dimensions. |
| `aspnetcore.routing.match_attempts` | Counter of endpoint-routing match attempts, tagged with match status and fallback-route state; `http.route` is present when a route matched. |
| `aspnetcore.routing.match_status attribute` | The routing-match result, such as success or failure. |
| `aspnetcore.routing.is_fallback_route attribute` | Boolean present when a route matched, identifying fallback-route matches. |
| `aspnetcore.rate_limiting.active_request_leases` | Up/down counter of active requests holding rate-limit leases; includes the limiter policy when the endpoint has one. |
| `aspnetcore.rate_limiting.request_lease.duration` | Histogram of how long requests hold rate-limit leases, tagged by policy when available. |
| `aspnetcore.rate_limiting.queued_requests` | Up/down counter of requests waiting for a rate-limit lease, tagged by policy when available. |
| `aspnetcore.rate_limiting.request.time_in_queue` | Histogram of wait duration for a lease; has policy when available and a result dimension such as acquired or canceled. |
| `aspnetcore.rate_limiting.requests` | Counter of lease acquisition attempts, tagged by policy when available and acquisition/rejection/cancellation result. |
| `aspnetcore.header_parsing.parse_errors` | Counter of request-header parse errors, tagged by header name and an error-type value. Error values may be more variable than a small enum, so review cardinality before long retention. |
| `aspnetcore.header_parsing.cache_accesses` | Counter of parsed-header cache accesses tagged by header name and hit/miss. It is emitted only by request-header parsers that support caching. |
| `kestrel.connection.duration` | Histogram of server connection lifetime; unlike request duration, one keep-alive connection can span many requests. It includes protocol, transport, server endpoint, TLS version when applicable, and a known `error.type` when the connection ends with a recognized error. |
| `kestrel.rejected_connections` | Counter of connections rejected after the configured active-connection limit is exceeded; includes server and transport dimensions. |
| `kestrel.queued_connections` | Up/down counter of connections waiting to start, with server/transport dimensions. |
| `kestrel.queued_requests` | Up/down counter of multiplexed HTTP/2 and HTTP/3 requests waiting to start; includes protocol/server dimensions. |
| `kestrel.upgraded_connections` | Up/down counter of upgraded WebSocket connections; the instrument tracks HTTP/1.1 connections only. |
| `kestrel.tls_handshake.duration` | Histogram of TLS handshake duration with TLS version when applicable and exception type when an exception occurs. |
| `kestrel.active_tls_handshakes` | Up/down counter of TLS handshakes currently in progress, with server/transport dimensions. |
| `signalr.server.connection.duration` | Histogram of SignalR HTTP connection lifetime, tagged by closure status and transport (`server_sent_events`, `long_polling`, or `web_sockets`). Use longer histogram buckets for durable connections than for ordinary requests. |
| `ASP.NET Core built-in HTTP metric type unit and attribute reference for each instrument` | The official reference specifies each instrument's type, UCUM unit, dimensions, conditional presence, and measurement semantics. Names alone are insufficient; use the target runtime's versioned reference when configuring views or dashboards. |
| `ASP.NET Core HTTP metric measurement windows and histogram bucket guidance` | Hosting request duration ends after the pipeline finishes and response data is sent; connection duration can be much longer. Histogram bucket choices must fit the observation window and expected tail. |
| `Header parsing cache-access metric is emitted only for parsers that support caching` | Do not interpret a missing `cache_accesses` instrument or zero values as proof that no headers were parsed; only caching-capable parser implementations emit it. |
| `Kestrel upgraded_connections tracks HTTP/1.1 connections only` | Do not treat this metric as a count of every WebSocket over every HTTP version. |
| `Kestrel queued_requests tracks HTTP/2 and HTTP/3 multiplexed requests waiting to start` | This is distinct from queued TCP connections and is relevant to multiplexed protocol request scheduling. |
| `Rate-limiting metrics expose policy and acquisition result attributes` | The policy is conditional on endpoint metadata; request and queue-time instruments report outcomes such as acquired and canceled/rejected, so interpret the exact instrument's attribute-presence rules. |
| `SignalR connection duration and active connection dimensions` | SignalR connection metrics describe transport lifetime and active connections, not hub method execution latency. |
| `HTTP server metric attribute cardinality and route-template guidance` | Framework metrics generally use bounded method/status/route dimensions; raw URLs and identifiers would explode cardinality. Review the official reference when adding filters/views. |
| `ASP.NET Core built-in request ActivitySource Microsoft.AspNetCore` | Built-in request activity source name to subscribe to for ASP.NET Core server request traces in the supported runtime. |
| `ASP.NET Core request trace semantic-convention attributes` | .NET 11 adds required HTTP span attributes such as method, status, route, network protocol, URL scheme, server address/port, and user agent. Exact optionality follows the semantic convention. |
| `ASP.NET Core request Activity enrichment and suppression switch` | `Microsoft.AspNetCore.Hosting.SuppressActivityOpenTelemetryData` controls built-in convention enrichment; in .NET 11 it defaults to `false`. Change it only with a clear need and migration plan. |
| `ASP.NET Core 11 request exception event attributes exception.type exception.message exception.stacktrace` | When an unhandled exception escapes the request pipeline, .NET 11 records an Activity event with the exception type, message, and stack trace attributes. These values can expose user input, secrets, file paths, or internal topology; apply trace access, filtering, and retention controls. The framework no longer puts the message in `Activity.StatusDescription`. |
| `Built-in diagnostics versus OpenTelemetry instrumentation package duplication` | .NET 11 built-ins cover required server HTTP signals; adding ASP.NET instrumentation can overlap. Current package versions can detect built-in tags and skip adding them; verify the exact package/runtime behavior and retain the package only for additional features actually needed. |

### .NET resource-monitoring extension metrics

These metrics come from the optional `Microsoft.Extensions.Diagnostics.ResourceMonitoring` NuGet package, not from ASP.NET Core's built-in HTTP meter. Add the package and register `services.AddResourceMonitoring()`; then subscribe to `Microsoft.Extensions.Diagnostics.ResourceMonitoring` in the metrics pipeline. A logging provider is also required by the package, or resource-monitoring registration can throw. Prefer the metric instruments: `IResourceMonitor` is deprecated. [Resource monitoring](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-resource-monitoring) [.NET extensions metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-diagnostics)

The **Resource-monitoring logging provider prerequisite** is a runtime constraint: register logging providers before calling `AddResourceMonitoring`. **Resource-monitoring metrics include CPU, memory, process and network signals**; they are package-generated instruments, not values inferred from ASP.NET request metrics. In Kubernetes, `AddKubernetesResourceMonitoring` can read resource quota/limit information exposed through the configured Downward API; `KubernetesResourceQuotaServiceCollectionExtensions.AddKubernetesResourceMonitoring` takes an optional environment-variable prefix. It reads `<PREFIX>LIMITS_CPU` (millicores) and `<PREFIX>LIMITS_MEMORY` (bytes); `<PREFIX>REQUESTS_CPU` and `<PREFIX>REQUESTS_MEMORY` are optional and default to the corresponding limit values when absent or zero. Set the Downward API env names and prefix together. This Kubernetes helper includes the base resource-monitoring setup; calling it alongside `AddResourceMonitoring` can create conflicting registrations. [Resource monitoring](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/diagnostic-resource-monitoring) [Kubernetes resource monitoring API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.kubernetesresourcequotaservicecollectionextensions.addkubernetesresourcemonitoring?view=net-11.0-pp)

**AddKubernetesResourceMonitoring reads Downward API resource quota variables**; **Kubernetes resource quota environment variable prefix** must match the prefix used for those environment variables. **AddResourceMonitoring and AddKubernetesResourceMonitoring duplicate registration conflict** is why an app should choose the appropriate registration once.

| Supplied name | What it measures and important caveat |
|---|---|
| `Microsoft.Extensions.Diagnostics.ResourceMonitoring package` | Optional .NET extensions package for host/container/process resource metrics. Package and platform support determine which instruments are available. |
| `Microsoft.Extensions.Diagnostics.ResourceMonitoring meter` | Meter name to subscribe to after registering resource-monitoring services. |
| `AddResourceMonitoring` | Adds resource-monitoring services to `IServiceCollection`. The package requires an `ILogger` provider registration. |
| `container.cpu.limit.utilization` | Observable gauge of container CPU use relative to its configured limit. Availability requires container execution; its default is 0–1 on Linux and 0–100 on Windows unless normalized. |
| `container.cpu.request.utilization` | Observable gauge of CPU use relative to its configured request; meaningful only when the environment supplies a request/quota. Default ranges are 0–1 on Linux and 0–100 on Windows unless normalized. |
| `container.cpu.time` | Observable counter of total container CPU time in seconds; includes a CPU mode dimension such as user/system. |
| `container.memory.limit.utilization` | Observable gauge of container memory use relative to its configured limit; its default is 0–1 on Linux and 0–100 on Windows unless normalized. |
| `container.memory.request.utilization` | Observable gauge of container memory use relative to its configured request; check the scheduler/runtime inputs used by the package. Default ranges are 0–1 on Linux and 0–100 on Windows unless normalized. |
| `container.memory.usage` | Observable up/down counter of current container memory use in bytes. |
| `process.cpu.utilization` | Observable gauge of process CPU utilization. Interpretation and range depend on platform and package options. |
| `dotnet.process.memory.virtual.utilization` | Observable gauge of process memory use relative to the applicable limit; it is not the same unit/meaning as bytes of managed heap. |
| `system.network.connections` | Observable up/down counter of connections by network type and state, such as IPv4/IPv6 and listen/close. Platform and permission limits apply. |
| `IResourceMonitor obsolete in current resource-monitoring API` | The direct `IResourceMonitor` interface is deprecated; migrate consumers toward resource-monitoring observable instruments and metric collection. |
| `ResourceMonitoringOptions.UseZeroToOneRangeForMetrics` | Controls normalization of utilization values to a 0–1 ratio where supported. Align dashboards and alerts with the configured range. |
| `ResourceMonitoringOptions.UseZeroToOneRangeForLinuxMetrics` | Linux-specific range behavior option. Verify the exact package version and avoid mixing 0–1 with percentage values. |
| `ResourceMonitoringOptions.EnableSystemDiskIoMetrics` | Option concerning system disk-I/O metrics; some resource-monitoring instruments/options are experimental, so check current package documentation before depending on them. |
| `ResourceMonitoringOptions.UseLinuxCalculationV2` | Linux resource-calculation option; pin behavior to the package/runtime version when interpreting historical utilization series. |
| `Resource-monitoring metrics vary by operating system and container runtime` | Host APIs, cgroup versions, container quotas and permissions change instrument availability and values. Test the actual deployment image and runtime. |
| `CPU utilization ratio ranges differ on Windows and Linux without normalization` | Resource-utilization gauges default to 0–1 ratios on Linux and 0–100 percentages on Windows. Configure normalization or make dashboards/rules platform-aware. |

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
- Adding built-in .NET 11 server tracing and an overlapping instrumentation package without checking whether the deployed package detects and skips framework tags.
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
- [ASP.NET Core diagnostics metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/diagnostics?view=aspnetcore-10.0)
- [ASP.NET Core Blazor metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/blazor?view=aspnetcore-10.0)
- [ASP.NET Core authentication and authorization metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/security?view=aspnetcore-10.0)
- [.NET extensions health-check metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-diagnostics)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters)
- [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
- [dotnet-dump](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-dump)
- [.NET OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/)

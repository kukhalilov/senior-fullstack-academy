# health checks diagnostics metrics tracing and OpenTelemetry — Exercises and worked solutions

## Goals

Practice turning operational questions into safe probes and useful signals. You will choose check scope and status policy, instrument a workload without unbounded dimensions, avoid duplicate .NET 11 server telemetry, and reason about collection/export failure.

## Worked example

### Scenario

An order API runs four replicas behind a load balancer. It requires SQL Server to place orders, has an optional fraud-scoring provider, uses a message broker for post-order work, and calls a payment provider through `HttpClient`. During an incident, SQL connections become slow and a fraction of payment calls time out. The load balancer should stop sending traffic to instances that cannot place orders; the orchestrator should restart only processes that are stuck. Operators need latency, error, and dependency-span evidence without storing payment data.

### Design

1. Map a cheap liveness probe that checks process progress only. Do not put SQL, broker, or payment-provider reachability into liveness; restarting all four replicas will not repair a shared outage.
2. Map a readiness probe that includes a short SQL check because order placement cannot succeed without SQL. Decide whether fraud scoring is a hard requirement or a degraded mode. Do not include the broker if order commit can safely complete through an outbox and background delivery.
3. Tag registrations and select them per endpoint. Use bounded check timeouts, propagate cancellation into the driver, and set HTTP result mappings that match load-balancer success criteria. Expose only an overall status externally; retain detailed report entries for a secured operator surface.
4. Record request durations with histograms and completion/error counts with counters. Use bounded dimensions such as route template, HTTP method, and outcome; never add user ID, payment token, raw URL, SQL, or exception message as a metric tag.
5. Create an activity for the order operation and preserve the outbound `HttpClient` child span for the payment call. Add only safe operation attributes. Let exception handling/automatic instrumentation record the exception consistently rather than duplicating full stack traces in custom span events.
6. In .NET 11, collect built-in `Microsoft.AspNetCore.Hosting` metrics and `Microsoft.AspNetCore` request activities. Verify that adding ASP.NET Core instrumentation does not produce duplicate server spans. Subscribe to runtime and application meters only when needed.
7. Configure stable service resource identity, sampling, bounded export queues, and OTLP to a Collector. Exporter failures should produce telemetry loss/alerts under a bounded retry policy, not fail order requests.

This design separates the immediate traffic decision from explanatory telemetry and keeps the database's health from triggering a restart storm. [Health checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks) [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http) [.NET 11 instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

## Exercises

### Exercise 1: Split one ambiguous health endpoint

An app exposes `/health`. It checks process state, SQL, Redis cache, and a mail provider. Kubernetes uses the same route for readiness and liveness. During a mail outage, every container restarts. Redesign the probes and explain what should happen for each dependency.

### Exercise 2: Status mapping mismatch

The check service returns `HealthStatus.Degraded`, but the report endpoint returns HTTP 200. The team says the framework is ignoring failure. Explain the default mapping, distinguish health status from HTTP status, and give two valid policy choices for the platform.

### Exercise 3: Fix metric cardinality

An engineer records `http.request.duration` with tags `user.id`, `request.path`, `exception.message`, and `tenant.id`. Estimate which values are unbounded or sensitive and propose a bounded alternative. Explain why a histogram is a better instrument for latency than a counter.

### Exercise 4: Diagnose duplicate request spans

After upgrading to .NET 11, trace volume nearly doubles. The app subscribes to the built-in `Microsoft.AspNetCore` source and also calls `AddAspNetCoreInstrumentation`. Describe a verification plan and options that avoid duplicate server spans while retaining any extra feature the package supplies.

### Exercise 5: Pick head or tail sampling

The service wants to retain all error traces but sample only 5% of successful requests. Compare a root `TraceIdRatioBasedSampler` under `ParentBasedSampler` with Collector tail sampling. State what infrastructure tail sampling requires and what it costs.

### Exercise 6: Health metrics are missing from a scrape

The team has registered health checks and sees `/health/ready` responses, but its pull-based metrics scraper has no health-check counters. Name the built-in publisher and instruments, explain why the scraper does not see them, and propose a compatible push-based collection path or an alternate instrumentation design.

### Exercise 7: Exporter outage

An OTLP endpoint becomes unavailable for 40 minutes. The app has unbounded retry buffering and blocks host shutdown waiting for all telemetry to export. Identify the operational failure modes and propose bounded behavior.

### Exercise 8: Health data leak

A public endpoint returns each entry's exception, description, tags, and data dictionary as JSON. Give a safe projection and explain what a trusted internal diagnostics consumer can receive that the public probe should not.

## Progressive hints

1. Ask what action each probe failure triggers. A mail outage is unlikely to be fixed by restarting every API process.
2. Look at `HealthCheckOptions.ResultStatusCodes` independently of `HealthReport.Status`; the platform also has a success-code policy.
3. Think of distinct tag combinations as separately stored time series. Keep only dimensions with a bounded domain and operational value.
4. Compare exported activity names, source/instrumentation scope, and trace IDs before and after disabling one producer at a time in staging.
5. A head sampler decides before the request outcome is known. Tail sampling needs complete traces at a decision point.
6. The .NET telemetry health-check publisher is registered with `AddTelemetryHealthCheckPublisher`; it emits `dotnet.health_check.reports` and `dotnet.health_check.unhealthy_checks`. Those built-in health-check metrics are push-only, so a pull scraper won't see them. Select a push-capable path or define a separate metric design compatible with the collector.
7. Bound queue size, retry time, and flush/shutdown deadlines. Decide whether telemetry loss or user request failure is the acceptable failure mode.
8. Public probe consumers need a minimal traffic/recovery signal, not stack traces and dependency topology.

## Complete solutions

### Solution 1

Create `/health/live` with only a cheap process-progress check and `/health/ready` with a bounded SQL check plus any other dependency required to accept new orders. Mail should not be in liveness or readiness when it is optional; use an outbox or queue and report the mail subsystem through internal telemetry. Cache can be a degraded condition if the app can fall back safely. If Redis is mandatory for correctness, include it in readiness and remove traffic during its outage, but do not restart processes solely because it is unavailable. Configure Kubernetes startup, liveness, and readiness separately.

### Solution 2

The framework's default result mapping is Healthy→200, Degraded→200, Unhealthy→503. The check result expresses application health; the writer/status map expresses HTTP behavior. Choice A: keep 200 for Degraded and teach the platform it is still routable, while dashboards expose degraded state separately. Choice B: map Degraded to 503 on a readiness-only endpoint if the platform should stop routing to it. Do not change liveness semantics by reusing that endpoint. [Health check options](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)

### Solution 3

`user.id` and `tenant.id` can have large or attacker-controlled cardinality and can be personal/business-sensitive. `request.path` is unbounded when it contains identifiers or arbitrary segments; use the resolved route template. `exception.message` can contain unique text, request data, and secrets; use a small outcome/error class or record a protected event in the trace/log pipeline. Use a histogram for duration because it records a distribution; a counter can only say how many observations occurred or sum an amount.

### Solution 4

In a staging workload, inspect activity source/instrumentation scope, names, parent relationships, attributes, and counts for one inbound request with one outbound dependency call. Disable the ASP.NET Core instrumentation package while keeping the built-in source subscription, then reverse the test. If the built-in data supplies required attributes, keep direct subscription and remove overlapping instrumentation. Keep the package only for a clearly needed additional feature, filtering/enrichment behavior, or target runtimes that do not provide the same built-in contract. Document the runtime-specific configuration; .NET 10 defaults differ from .NET 11. [Migration guidance](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

### Solution 5

`ParentBasedSampler` with a 5% root ratio gives an inexpensive decision near request start and generally follows a remote parent decision. It cannot decide to keep a trace solely because a later span failed if the root trace was dropped. Collector tail sampling can inspect completed trace outcomes and retain all errors plus a smaller success share, but every span in a trace must reach the same sampling decision point, which needs buffering, routing affinity/trace-aware load balancing, memory, and processing capacity. Tail sampling adds latency and failure modes; it is not free or guaranteed lossless.

### Solution 6

Register `builder.Services.AddTelemetryHealthCheckPublisher()` and subscribe/collect its published health metrics using a supported push-based metrics path. The instruments are `dotnet.health_check.reports` (report status) and `dotnet.health_check.unhealthy_checks` (degraded or unhealthy outcomes by check name and status). The built-in health-check metrics are not available through pull-based metrics collection. If the platform only scrapes, implement a separately designed scrape-compatible signal rather than assuming these publisher metrics will appear. [Built-in .NET extensions metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-diagnostics)

### Solution 7

Unbounded buffering can exhaust memory/disk; indefinite retries can create a recovery burst; waiting during shutdown can exceed the container termination grace period and lose the process anyway. Use a bounded queue, finite retry/backoff and export timeout, drop/overflow policy, and metrics/alerts for dropped data. Keep business requests independent of export success. Attempt bounded `ForceFlush`/shutdown within the host stop budget, then exit.

### Solution 8

Return only an overall status, or an allowlisted name/status pair if the endpoint is authenticated/internal. Omit exception, description, arbitrary data, internal hostnames, connection details, and stack traces. A protected operator channel can expose sanitized per-check timing and controlled diagnostics with access checks, retention, and redaction. It should still avoid secrets and user content. Configure no-store behavior and verify intermediary caches.

## Tests and edge cases

- A check that ignores cancellation can keep running after timeout; test the dependency timeout and cancellation path.
- Duplicate health-check names can collide in report construction; validate registrations at startup.
- `Degraded` may be HTTP 200 and therefore count as a successful probe; assert the exact `ResultStatusCodes` and platform success criteria.
- An endpoint predicate that matches no checks can look healthy; add a startup/configuration assertion for each probe's selected count.
- `ActivitySource.StartActivity` can return null; run a test without a listener.
- One unbounded tag can create enormous metric series; test with adversarial paths and tenant values.
- An exporter can stall or reject data; test queue overflow, timeout, shutdown, and recovery behavior.
- Adding instrumentation can duplicate spans; compare counts and source names under .NET 10 and .NET 11 separately.

## Reflection questions

1. Which failures can a process restart plausibly recover from in your service?
2. Which metric dimensions have a finite bound, and what is their maximum product cardinality?
3. Which activities will carry trace context across your queue and HTTP boundaries?
4. What telemetry may be dropped during a backend outage, and how will operators know?
5. Which health detail is public, internal, or restricted to incident responders?

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)
- [ASP.NET Core .NET 11 instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [.NET extensions health-check metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-diagnostics)
- [AddTelemetryHealthCheckPublisher API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.commonhealthchecksextensions.addtelemetryhealthcheckpublisher?view=net-11.0-pp)
- [.NET OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/)
- [OTLP specification](https://opentelemetry.io/docs/specs/otlp/)

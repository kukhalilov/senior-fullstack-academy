# health checks diagnostics metrics tracing and OpenTelemetry — Big-picture orientation and mental model

## Problem and purpose

A service can return a successful HTTP response while its database is unavailable, be ready for traffic while one optional feature is degraded, or appear healthy while requests are timing out. Operations teams need several kinds of evidence: probes for a specific operational decision, metrics for numeric trends, traces for the path of one request, and logs for contextual events. ASP.NET Core and .NET provide APIs to produce these signals, but a backend, dashboards, alert rules, and the meaning of “healthy” remain deployment and product decisions. [ASP.NET Core health checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks) [.NET metrics instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)

## Plain-language mental model

Think of a service as a hospital ward. A **liveness probe** asks whether the process can keep running. **Readiness** asks whether this instance should receive work now. A **startup probe** gives slow initialization time before liveness decisions begin. Metrics are the ward's trend charts (request duration, active work, failures); traces are one patient's path through registration, lab, and pharmacy; logs are the detailed notes about particular events. OpenTelemetry provides shared conventions and SDK components to collect and export signals. It is not the dashboard or durable storage system.

A probe is not a diagnosis dump. It should answer a defined question with bounded work. Metrics should summarize populations without creating a time series for every user or URL. Traces should connect meaningful operations and preserve cross-service context without recording secrets. Logs can retain context, but are still subject to privacy, retention, and cost controls.

## How the parts fit together

| Signal or mechanism | Main question | Typical producer and consumer | What it cannot prove by itself |
|---|---|---|---|
| Health check | Should this instance receive traffic, or should this process be restarted? | ASP.NET Core checks and an orchestrator/load balancer | Correctness of every feature or future availability |
| Metric | How often, how long, and how much? | `System.Diagnostics.Metrics` instruments; collector or OpenTelemetry SDK | Which exact request path caused one observation |
| Trace | Which operations formed this request, and where was time spent? | `ActivitySource` and `Activity`; trace processor/exporter | Population-wide rate without aggregation |
| Log | What event and contextual details were recorded? | `ILogger`; provider or OpenTelemetry log pipeline | A reliable transaction history unless deliberately designed as one |
| OpenTelemetry | How are signals named, enriched, sampled, and exported consistently? | SDK, instrumentation, exporters, optional Collector | A backend, alert policy, or proof that a service meets its SLO |

The data path is: code emits instruments or activities; a listener/SDK subscribes to named sources; processors, samplers, and views shape data; exporters send it, often using OTLP, directly to a backend or through a Collector. Health endpoints are a separate request path that usually returns a small status for a probe. A health publisher is a separate push-oriented mechanism and can run checks periodically. [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/) [ASP.NET Core metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/overview)

## Concept map

```text
deployment probe ──► health endpoint ──► selected bounded checks ──► status + safe response
                                                                                 │
application code ──► Meter / ActivitySource / ILogger ──► SDK collection ──► exporter ──► Collector/backend
                         │                                    │
                         └─ names, attributes, context       └─ filters, views, sampling, batching

Health decides an operational action; telemetry explains behavior over time and across boundaries.
```

## End-to-end walkthrough

Suppose a web API instance starts, serves checkout requests, and loses database connectivity.

1. The process registers a cheap liveness check and a readiness endpoint that includes a bounded database connectivity check. The database is not included in liveness, so a database outage does not cause every instance to restart in a loop.
2. The orchestrator calls readiness and stops routing new traffic when that selected check is unhealthy. It calls liveness for process recovery and can use a startup probe while warm-up completes.
3. A health check execution returns a `HealthReport`; the endpoint maps its status to an HTTP status and writes only approved details. Exceptions, connection strings, and internal topology are not serialized publicly.
4. ASP.NET Core emits request duration and server activities. Application code adds a low-cardinality checkout counter and a trace activity around payment-provider work. Trace context flows across the outbound HTTP call.
5. The OpenTelemetry SDK subscribes to the required meters and activity sources, sets a stable service resource, samples traces, and exports OTLP to a Collector. The Collector may enrich/filter/route signals to a backend.
6. An operator correlates rising request latency, downstream spans, and structured logs. The health probe reports the immediate traffic decision; telemetry helps locate why the service degraded.

In ASP.NET Core 11, built-in HTTP server metrics and request activities include the required parts of OpenTelemetry HTTP semantic conventions by default. Register the framework meter/source directly when using those built-in signals; adding `OpenTelemetry.Instrumentation.AspNetCore` for the same server spans can duplicate data. The package can still be useful for features beyond built-in signals, and .NET 10 applications have different defaults. [ASP.NET Core .NET 11 instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv) [Built-in HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)

## When to use it and tradeoffs

- Use health checks when a named external component must make a traffic or recovery decision. Keep readiness and liveness predicates distinct and checks bounded.
- Use counters for cumulative events, up/down counters for changing quantities, and histograms for distributions such as duration. A histogram supports quantiles/buckets; an average alone can hide tail latency.
- Use activities for spans that explain work and cross process boundaries. Sampling reduces cost but means a trace may not exist for every request.
- Use logs for event detail; correlate them with trace/span IDs, but avoid using a log stream as an unbounded metrics substitute.
- Keep attribute dimensions bounded. A user ID, full URL, email address, exception message, or arbitrary request value can create excessive cardinality or expose sensitive data.
- Export through a Collector when central policy, fan-out, filtering, or backend isolation is valuable. Direct export has fewer components but couples app deployment to destination configuration and availability.
- Telemetry export failure should not normally take down request handling. Choose bounded queues, timeouts, retry budgets, and shutdown flushing deliberately.

## What later lessons cover

The concepts lesson explains probe policy, metrics versus traces versus logs, cardinality, context propagation, and export architecture. The reference lessons cover the complete health-check contract and endpoint surface, `System.Diagnostics` instruments and activities, ASP.NET Core built-in signals and diagnostic tools, and OpenTelemetry .NET configuration/export. Practice applies these controls to an outage scenario, and the interview lesson tests operational decisions and semantic boundaries.

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [ASP.NET Core metrics overview](https://learn.microsoft.com/en-us/aspnet/core/metrics/overview)
- [Built-in ASP.NET Core metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [.NET distributed tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)
- [.NET OpenTelemetry documentation](https://opentelemetry.io/docs/languages/dotnet/)

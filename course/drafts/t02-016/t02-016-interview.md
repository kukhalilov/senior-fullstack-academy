# health checks diagnostics metrics tracing and OpenTelemetry — Interview questions and reasoning

## Core questions

1. How do liveness, readiness, and startup probes differ?
2. Why is health status distinct from an endpoint's HTTP status?
3. When is a health-check publisher appropriate?
4. When do you choose a counter, up/down counter, histogram, or observable gauge?
5. What are `Meter`, `ActivitySource`, and `Activity` responsible for?
6. How do trace context and baggage differ from authentication identity?
7. What roles do an OpenTelemetry SDK, exporter, Collector, and backend play?
8. What changed for ASP.NET Core HTTP telemetry in .NET 11?
9. What causes metric cardinality to grow, and how do you limit it?
10. How should an app behave when its telemetry destination is unavailable?

## Concise interview answers

1. Liveness asks whether restarting can recover a stuck process; readiness asks whether an instance should receive work; startup allows initialization before other probe policies apply.
2. `HealthStatus` is the domain result; `HealthCheckOptions.ResultStatusCodes` maps it to HTTP. For example, Degraded maps to 200 by default.
3. Use a publisher when the application should periodically push reports to a monitoring destination. HTTP probes are pull-based and run checks when requested.
4. Use a counter for cumulative events, an up/down counter for a changing sum, a histogram for distributions, and an observable gauge for a point-in-time value.
5. A `Meter` groups metric instruments; an `ActivitySource` creates activities, and an `Activity` is one timed span with context and attributes.
6. Trace context correlates causal work. Baggage propagates user-defined context and can leak; neither is proof of who the caller is or what they may do.
7. Instrumentation emits signals; SDK configures collection/policy; exporter transmits; Collector optionally processes/routes; backend stores and queries.
8. .NET 11 built-in HTTP server metrics and request activities carry required semantic-convention data by default; direct subscription can replace overlapping server instrumentation.
9. Every unique attribute combination may create a new time series. Prefer bounded route templates/status/method dimensions; omit user IDs, raw paths, request IDs, and sensitive values.
10. Export with bounded retries/queues and timeouts; surface dropped telemetry operationally, but normally do not fail user requests or block shutdown indefinitely.

## Deep follow-up answers

### How do you design a readiness policy without causing a fleet-wide outage?

First name the decision: whether this instance can accept a new unit of work. Include only dependencies required for that work and run bounded checks. A database failure may legitimately remove an instance from readiness, but if every replica shares the same database outage, the fleet can have zero ready instances. Confirm that the traffic-removal action is useful, provide deployment-level failure behavior, and avoid putting the dependency in liveness where a restart cannot fix it. For optional capabilities, prefer degraded status or feature-level fallback. Probe frequency, registration concurrency, and dependency connection limits must be budgeted together.

### Why is a histogram necessary for latency analysis?

A counter can count requests and a sum can accumulate elapsed time, but the mean hides tail behavior. A histogram retains a distribution that can be aggregated into buckets or another supported representation. Percentile accuracy depends on aggregation and bucket/reservoir semantics. Never average per-instance p99 values as if the result were the fleet p99; combine distributions correctly and keep latency labels bounded.

### What is the right trace instrumentation boundary?

Instrument meaningful operations, not every helper call. A server activity should parent application/database/outbound spans; use `ActivityKind.Client` for client calls and the right producer/consumer relationship for messaging. Preserve W3C context across supported boundaries, use links for batched work with multiple parents, and add only attributes that are stable and safe. Sampling, listener presence, and exporter configuration can mean `StartActivity` returns null or no activity reaches a backend, so correctness must not depend on telemetry.

### How do you prevent telemetry export from becoming a second outage?

Use bounded queues and export timeouts; cap retry duration/rate; monitor queue occupancy, export errors, and dropped spans/measurements. Decide whether to drop oldest/newest data or block the producer only where the SDK permits that policy and the application can afford it. Do not buffer unlimited telemetry in request memory. Give flush/shutdown a deadline smaller than the orchestrator termination budget. Keep telemetry exporters isolated from application business transactions so backend unavailability degrades observability, not core service behavior.

### How should a team migrate to .NET 11 built-in HTTP semantic conventions?

Inventory current source subscriptions, package instrumentation, filters/enrichers, dashboard keys, sampling, and span counts. Run one request through the old and new runtime in a controlled environment. Compare `http.route`, status, exception events, `error.type`, and activity source/scope to find duplicate spans or changed cardinality. Remove redundant instrumentation only after confirming that any required filtering/enrichment feature remains. Keep a migration note because .NET 10 defaults differ. [Breaking-change guidance](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)

## Scenario questions

### Scenario 1: All pods become unready when an optional cache is slow

What policy change would you make, and which telemetry would confirm that the fallback is working?

### Scenario 2: A metric dashboard has millions of series after adding request paths

Which dimension should replace the raw path? What other attributes could still create high cardinality?

### Scenario 3: Two server spans appear for every incoming request after a runtime upgrade

What sources, packages, and activity scopes do you inspect? What staged changes would prove which instrumentation is duplicated?

### Scenario 4: Error traces are missing even though the service records exceptions

Could head sampling have made the decision before the error? How could a Collector tail-sampling policy help, and what routing/buffering requirements would it add?

### Scenario 5: An operator asks to include full `HealthReport` JSON on a public probe

Which fields are inappropriate, what minimal result can the orchestrator consume, and where should detailed health diagnostics be exposed?

## Tradeoffs and alternatives

- **Probe frequency:** shorter periods detect failures sooner but can increase dependency load and synchronized request spikes. Add timeout and jitter/consumer controls where possible.
- **Readiness dependency scope:** more checks prevent futile traffic but can remove too much capacity. Base it on useful-work requirements and fallback behavior.
- **Head vs tail sampling:** head sampling is cheap and local; tail sampling can select on complete outcomes but needs trace-aware routing and state.
- **Direct export vs Collector:** direct export reduces infrastructure; Collector improves central policy/routing but adds another component to operate.
- **Metric detail vs cost:** more dimensions support slicing but multiply time series. Prefer a small bounded set and use traces/logs for individual cases.
- **Verbose health vs privacy:** detail aids diagnosis but reveals topology and failures. Separate public status from authenticated operator diagnostics.
- **Automatic instrumentation vs manual instrumentation:** automatic packages cover framework boundaries quickly; manual instruments add domain meaning. Combining them requires duplicate and semantic checks.

## Common weak answers

- “If the database is down, restart every app instance.” This ignores shared-dependency failure and can create a restart storm.
- “CORS and health checks make the app observable.” A probe reports a configured decision; it does not explain trends or request paths.
- “A counter gives me p95 latency.” Counters do not preserve distributions; use a histogram with appropriate aggregation.
- “Every request needs a span and every field should be tagged.” This ignores sampling, performance, cardinality, privacy, and null listeners.
- “OpenTelemetry sends data to Prometheus/Grafana.” OpenTelemetry instruments/collects/exports; backend storage/query behavior is separate.
- “Retries mean telemetry cannot be lost.” Queues are finite and processes can stop; bounded systems can drop data.
- “Baggage is safe because it is trace metadata.” It crosses trust boundaries and may be recorded by downstream systems.
- “.NET 11 still needs the ASP.NET Core instrumentation package for basic HTTP tags.” The runtime now supplies required built-in server signals; the package may still add other capabilities.

## Self-check rubric

Score each from 0 to 2: **0** = missing/incorrect, **1** = partial, **2** = precise and operational.

1. Separates liveness, readiness, startup, and their triggering actions.
2. Distinguishes `HealthStatus` from HTTP status and platform success criteria.
3. Selects metric instruments from mathematical meaning and bounds attribute cardinality.
4. Explains `ActivitySource`, `Activity`, context propagation, sampling, and null activities.
5. Separates instrumentation, SDK, exporter, Collector, and backend.
6. Identifies .NET 11 instrumentation changes and duplicate-source risk.
7. Protects health/telemetry data and defines export-outage behavior.

12–14: ready to reason through a production design; 8–11: revisit the matching references; 0–7: redraw the signal and probe boundaries before proposing APIs.

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [ASP.NET Core HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http)
- [ASP.NET Core built-in metrics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/built-in-metrics-aspnetcore)
- [ASP.NET Core .NET 11 HTTP instrumentation change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/http-activity-otel-semconv)
- [.NET metrics instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/metrics-instrumentation)
- [.NET distributed tracing instrumentation](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-instrumentation-walkthroughs)
- [.NET OpenTelemetry](https://opentelemetry.io/docs/languages/dotnet/)


## System-design scenario: trace a request through HTTP, SQL, and a worker

A good response distinguishes aggregate signals from request-level evidence. Start with the user-facing SLI, inspect trace sampling and service/resource identity, follow the request span into database and outbound HTTP spans, then trace queued work using propagated context or a causal link. Check duration, errors, saturation, and queue age. Avoid adding customer IDs as metric dimensions; use access-controlled trace/log correlation when individual diagnosis is necessary. Health probes answer readiness/liveness questions and do not replace these signals. [OpenTelemetry .NET](https://opentelemetry.io/docs/languages/dotnet/).

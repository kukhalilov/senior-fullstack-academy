# ASP.NET Core startup host builder and application lifetime — Reference: Startup ordering, lifetime, options validation, and shutdown behavior

## Scope and version

Sources: Microsoft [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), [hosted lifecycle API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice), [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), and [.NET 11 overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new). .NET 11 GA shipped 2026-11-10. Startup/environment precedence and lifecycle defaults can differ by builder/version; test the actual target.

## How this group fits the mental model

These names describe when configuration becomes available, when dependencies are created, when background work starts, and how the process responds to shutdown. Correct ordering protects readiness, scope ownership, and persisted work.

## Supplied names explained

- `Program.cs top-level statements` — current C# entry-point style commonly used in templates to create/configure/run the host without an explicit `Main` declaration.
- `Main method hosting entry point` — explicit synchronous or async entry point that creates and runs the host; it may be used instead of top-level statements.
- `Create builder phase` — create a host/web builder with arguments and establish bootstrap/default configuration before registering services.
- `Service registration phase` — register services/options/server integration while the builder is mutable and before provider construction.
- `Build phase` — create the built application/host and service provider; some validation and model construction happens here or at first resolution depending on configuration.
- `Pipeline configuration phase` — add middleware and endpoints to the built web application before starting it; service registrations still belong before build.
- `Host start phase` — start host services and server; failures should prevent the application from claiming readiness.
- `Host shutdown phase` — signal stopping, cancel work, stop server/services, and dispose resources within configured deadlines.
- `Configuration bootstrap` — early values used to determine environment, configuration sources, and host setup. These values may need to exist before application configuration is fully loaded.
- `Command-line configuration` — key/value arguments can override or supply host/app settings according to registered provider precedence; avoid putting secrets in shell history/process listings.
- `Environment variable configuration` — environment variables are commonly used for deployment settings/secrets references; names and precedence depend on providers and host model.
- `JSON configuration provider` — provider loads JSON settings files such as base and environment-specific appsettings; reload behavior is configurable and files should not contain committed production secrets.
- `User secrets configuration` — development-only Secret Manager source for local secrets; it is not an encrypted production vault and should not be deployed as the production secret system.
- `Key-per-file configuration` — provider reads one configuration value per file, useful for mounted secret/config files in containers; file permissions and reload expectations matter.
- `IConfiguration` — hierarchical key/value configuration abstraction consumed by application and host services. Avoid logging full configuration because it may contain credentials.
- `IHostApplicationLifetime.ApplicationStarted` — cancellation token signaled once host startup completes; use for post-start coordination, not as the sole proof that external dependencies and user journeys are ready.
- `IHostApplicationLifetime.ApplicationStopping` — cancellation token signaled when host shutdown begins; stop accepting new work and begin bounded cleanup.
- `IHostApplicationLifetime.ApplicationStopped` — token signaled after shutdown completes; appropriate for final notifications that do not need long-running cleanup.
- `IHostLifetime.WaitForStartAsync` — lifetime-provider hook awaited by the host before hosted-service startup, allowing a lifetime integration to coordinate when startup begins.
- `IHostedService.StartAsync` — host callback to initialize/start a hosted component. Keep it short; long work can delay all app startup and readiness.
- `IHostedService.StopAsync` — host callback for cooperative cleanup during graceful shutdown; respect the token/deadline and persist critical work incrementally.
- `BackgroundService.ExecuteAsync` — asynchronous execution loop for a `BackgroundService`, normally completing when the stopping token is signaled or faulting on an unhandled error. Starting in .NET 10, the entire method runs on a background thread, so its synchronous prefix no longer blocks other hosted services from starting. Put startup-critical work in `StartAsync` or an appropriate lifecycle callback.
- `BackgroundService stopping token` — cancellation token passed to `ExecuteAsync` that signals shutdown; propagate it to waits and downstream operations and do not swallow cancellation as an ordinary failure. The host's shutdown deadline can still terminate a process that ignores cancellation.
- `IHostedLifecycleService.StartingAsync` — callback before `IHostedService.StartAsync`, useful for explicit pre-start coordination.
- `IHostedLifecycleService.StartedAsync` — callback after `StartAsync` completes for that lifecycle stage; it is still part of host startup sequencing.
- `IHostedLifecycleService.StoppingAsync` — callback before ordinary `StopAsync` during graceful shutdown.
- `IHostedLifecycleService.StoppedAsync` — callback after ordinary stop completes; keep final work bounded.
- `ValidateOnStart` — options-builder extension that forces options validation during host startup rather than waiting until first request/use.
- `IValidateOptions<TOptions>` — validation contract for a bound/configured options type; return validation failures without exposing secret values.
- `Options validation` — verify required values, ranges, cross-field conditions, and deployment assumptions at startup or bind time. Do not confuse configuration validity with external service readiness.
- `Host startup exception` — unhandled startup/configuration/service-start failure should fail host startup and be visible to deployment/operations; avoid swallowing it and marking the process healthy.
- `BackgroundServiceExceptionBehavior.StopHost` — policy to stop the host when a background service faults; appropriate when that worker is essential to service correctness.
- `BackgroundServiceExceptionBehavior.Ignore` — policy that logs/ignores a background-service fault while host continues. It may leave the app degraded; add explicit health/readiness handling and alerting if chosen.
- `Graceful shutdown` — orderly transition that stops accepting/starting new work, signals cancellation, and allows in-flight work/services to finish before the deadline.
- `Shutdown timeout` — bounded time for host stop; once expired, cancellation/termination may occur. It is not a hard guarantee that all work will finish.
- `SIGTERM host shutdown` — common Unix/container termination signal that host lifetime translates into graceful shutdown. Test the actual orchestrator grace period and ensure it exceeds realistic drain needs.
- `Windows service lifetime` — host integration that connects service-control start/stop events to the Generic Host lifetime.
- `systemd service lifetime` — host integration that coordinates host startup/shutdown and readiness/status with systemd service management.
- `ApplicationStarted readiness boundary` — lifecycle completion boundary for host startup, which may not include application-specific dependency warm-up; expose readiness separately when required.
- `Startup task dependency ordering` — ensure startup operation B does not use resource A before A is initialized. Prefer explicit orchestration or one coordinator instead of relying on incidental registration order; concurrent-start settings make assumptions unsafe.
- `Dependency injection scope validation` — detect invalid scope usage, such as a singleton capturing a scoped service. Enable in development/test and fix ownership rather than suppressing the diagnostic.
- `Build-time service provider validation` — validate registrations/lifetimes while constructing the service provider. It catches some dependency graph errors but cannot prove runtime configuration/external service availability.

## Cross-item comparison

`ValidateOnStart` and `IValidateOptions<TOptions>` validate local configuration during host startup; readiness probes answer whether the running app should receive traffic. `IHostedService` has start/stop callbacks; `BackgroundService` adds a long-running loop; `IHostedLifecycleService` adds surrounding phases. Since .NET 10, `BackgroundService.ExecuteAsync` no longer blocks other service startup while its synchronous prefix runs. `ApplicationStarted` is a lifecycle signal; dependency warm-up or downstream availability may require a separate readiness condition. `StopAsync` is cooperative and time-bounded.

## Examples

A worker must call a downstream service and database before serving writes. Validate local URLs/options with `ValidateOnStart`, perform bounded warm-up, and expose readiness only after both required dependencies are usable. Its processing loop creates a scoped context per batch and observes the stopping token. On SIGTERM, stop claiming new messages, finish/checkpoint in-flight work if the deadline permits, then exit. If the work cannot finish reliably in the grace period, persist enough state to resume rather than relying on a long shutdown callback.

## Common mistakes

- Performing long unbounded work in `StartAsync`, delaying server startup without useful readiness reporting.
- Assuming `ApplicationStarted` proves all dependencies work.
- Capturing scoped services in a singleton hosted service.
- Treating `BackgroundServiceExceptionBehavior.Ignore` as recovery.
- Logging configuration values while diagnosing missing settings.
- Relying on shutdown for durable work with no checkpoint or lease semantics.
- Assuming process SIGTERM grace time equals `HostOptions.ShutdownTimeout` or vice versa; both deployment and host deadlines matter.

## Knowledge checks with answers

1. **What does `ValidateOnStart` guarantee?** Local options validation runs during startup; it does not guarantee a database or remote service remains available.
2. **How should a worker stop?** Observe cancellation, stop starting new units, finish/checkpoint within a finite window, and allow process termination after the deadline.
3. **Should `ApplicationStarted` alone drive readiness?** Only if host completion is sufficient for the app's serving contract; otherwise include dependency/warm-up state.
4. **What catches a singleton capturing a scoped context?** Scope/build provider validation can detect this graph error; proper scope ownership must still be designed.

# ASP.NET Core startup host builder and application lifetime — Reference: Generic Host integration and supported legacy hosting forms

## Scope and version

Sources: Microsoft's [Generic Host documentation](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [legacy web host](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/web-host), and [.NET 11 hosted lifecycle API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice). Current minimal hosting is recommended for new web apps; legacy host APIs remain relevant for supported existing applications and integrations.

## How this group fits the mental model

Host abstractions own process startup and lifetime; web-host abstractions add HTTP server and web environment integration. Newer builder APIs simplify composition while older callback-based APIs remain useful for migration/compatibility.

## Supplied names explained

- `IHost` — built Generic Host that starts, runs, stops, and disposes registered application resources.
- `IHostBuilder` — callback-oriented builder abstraction for configuring host configuration, app configuration, logging, services, and container before building.
- `IHostApplicationBuilder` — property-oriented builder abstraction exposing services, configuration, environment, and logging; used by current generic builder patterns.
- `IHostEnvironment` — environment/application/content-root metadata for a Generic Host.
- `IWebHostEnvironment` — web-specific environment abstraction extending host environment with web-root information.
- `IWebHostBuilder` — legacy web-host builder for configuring server, web environment, and web services before building an `IWebHost`.
- `IWebHost` — legacy web host controlling the web server/application lifetime; retained for compatibility.
- `IStartup` — legacy startup contract for separating web service registration and pipeline configuration into a startup class.
- `Startup.ConfigureServices` — legacy method called to register application services before the host is built.
- `Startup.Configure` — legacy method called to configure the HTTP middleware pipeline after service registration.
- `ConfigureWebHostDefaults` — `IHostBuilder` extension that applies documented ASP.NET Core web-host defaults, including server integration and configuration behavior; defaults are versioned.
- `ConfigureDefaults` — generic host builder extension applying conventional configuration, logging, and service defaults for that host model.
- `UseStartup<TStartup>` — selects a startup class type for the legacy web-host startup pattern.
- `UseStartup(Type)` — non-generic startup-type form for the legacy web host; less compile-time-safe than the generic type form.
- `WebHost.CreateDefaultBuilder` — legacy web builder factory applying web-host defaults; retained for older applications, while new templates use `WebApplicationBuilder`.
- `WebHost.CreateSlimBuilder` — legacy web-host slim builder path with fewer defaults; verify exactly which services/configuration must be added in the target runtime.
- `Host.CreateApplicationBuilder` — creates the modern property-based `HostApplicationBuilder` with generic-host defaults.
- `Host.CreateDefaultBuilder` — creates an `IHostBuilder` with conventional generic-host defaults and callback configuration.
- `HostApplicationBuilder` — concrete property-based generic builder exposing services/config/logging/environment before build.
- `HostApplicationBuilder.Build` — constructs the `IHost` and service provider from current registrations/configuration.
- `IHostBuilder.Build` — builds the configured Generic Host and service provider from the callback-based builder. The build operation belongs to a builder, not to an already-built `IHost` instance.
- `IHost.Run` — synchronous extension that starts the host and blocks until shutdown.
- `IHost.RunAsync` — asynchronous extension that starts the host and waits until shutdown/cancellation.
- `IHost.StartAsync` — asynchronously starts hosted services and host components without waiting for lifetime termination.
- `IHost.WaitForShutdownAsync` — waits for a shutdown signal and then coordinates host shutdown; useful in custom hosting flows.
- `IHost.StopAsync` — requests graceful stop and waits within the configured/cancellation deadline.
- `IHostLifetime` — integration abstraction coordinating host start/stop with an external lifetime system such as console, Windows service, or systemd.
- `ConsoleLifetime` — default console lifetime implementation that handles console shutdown signals such as Ctrl+C/SIGTERM and requests host stop.
- `IHostedService` — start/stop contract invoked by the host for registered background/lifetime services.
- `BackgroundService` — base implementation of `IHostedService` for long-running asynchronous work through `ExecuteAsync`.
- `IHostedLifecycleService` — extends hosted service lifecycle with callbacks before/after start and stop phases.
- `IHostApplicationLifetime` — exposes cancellation tokens for started, stopping, and stopped and allows requesting application stop.
- `ApplicationStarted` — lifetime cancellation token signaling host startup has completed; not a universal readiness check for every external dependency.
- `ApplicationStopping` — token signaled when graceful shutdown begins; use it to stop accepting work/cancel loops.
- `ApplicationStopped` — token signaled after host shutdown has completed.
- `HostOptions` — options configuring host start/stop behavior, shutdown timeouts, concurrency, and background-service exception policy.
- `HostOptions.ShutdownTimeout` — maximum graceful shutdown duration; it is a deadline, not a guarantee that work completes if cancellation is ignored.
- `HostOptions.ServicesStartConcurrently` — controls concurrent start invocation for hosted services where supported; if enabled, do not rely on one service being fully started before another.
- `HostOptions.ServicesStopConcurrently` — controls concurrent hosted-service stopping; shared teardown dependencies need explicit coordination.
- `HostOptions.BackgroundServiceExceptionBehavior` — policy controlling host response when a `BackgroundService` faults, such as stop host or ignore according to the supported enum.
- `WebHostOptions` — options used by web-host configuration for web root, content root, startup assembly, and other legacy web-host behavior.
- `WebHostDefaults` — constants/default setting keys used by legacy web-host configuration.
- `ConfigureWebHost` — host-builder extension point to configure the embedded web host/server while retaining Generic Host ownership.
- `UseKestrel` — web-host configuration extension to use Kestrel; modern builder defaults generally register it already.
- `UseIIS` — configures IIS in-process hosting integration when running under IIS.
- `UseIISIntegration` — configures out-of-process IIS integration/proxy behavior for the ASP.NET Core app.
- `UseUrls` — configures one or more server URL bindings through web-host settings; production endpoint/TLS details should use supported server configuration and deployment controls.
- `ASPNETCORE_URLS` — environment variable used by ASP.NET Core hosting to configure URL bindings in applicable hosting models; verify precedence against explicit server endpoints.
- `ASPNETCORE_ENVIRONMENT` — common ASP.NET Core environment-name variable. Its precedence relative to `DOTNET_ENVIRONMENT` depends on the host/builder model and version; test the actual path.
- `DOTNET_ENVIRONMENT` — Generic Host environment-name variable used by generic hosting. Do not assume precedence is identical across all web host models.
- `WebApplicationFactory<TEntryPoint> hosting integration` — ASP.NET Core integration-test factory that boots an app entry point with test host customization, often backed by TestServer; it does not exercise real sockets/proxy/TLS deployment behavior.

## Cross-item comparison

`IHostApplicationBuilder`/`HostApplicationBuilder` use a property-based modern configuration style; `IHostBuilder` is callback-based and remains supported. `WebApplicationBuilder` adds web-specific defaults; Generic Host can also run worker/console processes. `IHostedService` has basic start/stop; `BackgroundService` supplies an async execution loop; `IHostedLifecycleService` adds before/after hooks. `ASPNETCORE_ENVIRONMENT` and `DOTNET_ENVIRONMENT` are both environment inputs but precedence is host/version-sensitive. `ApplicationStarted` signals lifecycle, while readiness must reflect application serviceability.

## Examples

Use modern `WebApplicationBuilder` for a new web app. For an existing `Startup` application, `UseStartup<TStartup>` can remain the compatibility path while migration is planned. For a custom generic worker, `Host.CreateApplicationBuilder(args)`, service registrations, `Build`, and `RunAsync` form the ordinary sequence. If a test uses `WebApplicationFactory<TEntryPoint>`, separately run an end-to-end test for real TLS/proxy behavior.

## Common mistakes

- Assuming `Build` belongs to an already-built `IHost`; it belongs to a builder.
- Depending on registration order with concurrent hosted-service startup.
- Capturing scoped dependencies inside a singleton hosted service.
- Assuming one environment variable always overrides the other in every hosting API.
- Treating `ApplicationStarted` as a complete readiness contract.
- Expecting `WebApplicationFactory` to emulate deployment sockets and reverse proxies.

## Knowledge checks with answers

1. **Which host builder is a modern property-based API?** `IHostApplicationBuilder`/`HostApplicationBuilder`.
2. **What does `IHostedLifecycleService` add?** Hooks before and after ordinary start and stop callbacks.
3. **Can shutdown timeout guarantee worker completion?** No; cancellation and host/platform deadlines can terminate the process.
4. **What does `UseStartup` indicate?** A legacy `Startup` class pattern, useful for compatibility/migration rather than a default requirement for new code.

# ASP.NET Core startup host builder and application lifetime — Core concepts and how they fit together

Sources: Microsoft's [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), [minimal hosting](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/webapplication?view=aspnetcore-11.0), [hosted lifecycle API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice), and [.NET 11 overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new). .NET 11 GA shipped 2026-11-10; verify API target framework and host defaults for the deployed version.

## Learning objectives

Trace the builder/build/run sequence; identify defaults and intentional omissions; explain hosted-service startup/shutdown ordering, readiness, options validation, and environment variables; and design safe asynchronous startup/background work.

## Prerequisites

Understand DI registrations/lifetimes, configuration providers, middleware order, hosted services, and deployment health checks. Deep DI and configuration API inventories appear in t02-007 and t02-008.

## Core concepts

### Construction, build, and run are different phases

The program entry point creates a builder with arguments and host/web defaults. During construction, code configures configuration sources, logging, services, options, server, and host settings. `Build` creates the service provider and application/host graph. Middleware and endpoint composition describe HTTP behavior. Starting begins hosted lifecycle and server listen; running waits for termination. `Run` combines start and wait; explicit start/stop methods suit controlled hosting/tests. Do not mutate service registrations after build and expect the existing provider to change.

Current templates use top-level statements in `Program.cs`; the compiler supplies an entry point. A conventional explicit `Main` is still a valid equivalent host entry. Keep startup code focused on composition and make failures observable. Synchronous blocking of async startup work can deadlock or delay readiness; prefer async lifecycle methods and bounded cancellation.

### Default builder versus slim builder

`WebApplication.CreateBuilder` applies web-oriented defaults, including configuration, logging, DI, host environment, content root, and Kestrel integration. The exact defaults are framework-versioned, and some middleware may be automatically added or analyzed. `CreateSlimBuilder` intentionally reduces selected web-hosting defaults, but current versions still include appsettings JSON, Development user secrets, console logging, and logging configuration. Other providers/features may be omitted. Smaller startup code is not proof of correct production configuration; compare the target version's documented defaults and effective registrations.

Use `WebApplicationBuilder.Services`, `.Configuration`, `.Logging`, `.Environment`, `.WebHost`, and `.Host` during configuration. After build, `WebApplication` exposes corresponding runtime services/config/environment plus mapping and lifecycle methods. The builder is for composition; the app is for request pipeline/endpoints and host execution.

### Host models and compatibility

The Generic Host combines DI, configuration, logging, lifetime, and hosted services for web, worker, and console processes. Current `IHostApplicationBuilder`/`HostApplicationBuilder` style is property-based; `IHostBuilder` is callback-based and remains supported. ASP.NET Core's `WebApplicationBuilder` adds web defaults to host composition. Legacy `IWebHostBuilder`, `IWebHost`, and `Startup.ConfigureServices`/`Startup.Configure` remain relevant when maintaining older apps or integrating libraries; understand them without defaulting new apps to the old pattern. `ConfigureWebHostDefaults` and `ConfigureDefaults` attach documented defaults in their builder model.

Environment variables `DOTNET_ENVIRONMENT` and `ASPNETCORE_ENVIRONMENT` interact differently by host. In current `WebApplication` minimal hosting, `DOTNET_ENVIRONMENT` takes precedence; in legacy `WebHost`, `ASPNETCORE_ENVIRONMENT` takes precedence. When both are configured, confirm the actual hosting model and configuration source. Environment name is deployment configuration, never a user-controlled request value.

### Hosted-service lifecycle and startup dependency ordering

The host invokes registered `IHostedService.StartAsync` methods during startup and `StopAsync` during graceful shutdown. `BackgroundService` is a hosted service whose `ExecuteAsync` represents long-running work; its stopping token must be observed. Since .NET 10, the entire `ExecuteAsync` method runs in the background, so synchronous setup there no longer blocks other services from starting. Put startup-critical work in `StartAsync` or an `IHostedLifecycleService` callback. `IHostedLifecycleService` adds `StartingAsync`, `StartedAsync`, `StoppingAsync`, and `StoppedAsync` around the core callbacks. Application lifetime tokens signal started/stopping/stopped; `StopApplication` requests host shutdown.

Hosted services are generally singleton-lifetime. To use scoped services safely, create a DI scope for each work iteration, resolve the scoped dependency inside that scope, await the work, then dispose the scope. Do not hold a request scope or scoped DbContext for the entire worker lifetime. Multiple service startup ordering should be explicit when services depend on one another; do not rely on incidental registration order, especially when concurrent starts are enabled.

`ApplicationStarted` means host startup completed, but it does not automatically mean every downstream dependency is healthy or a domain-specific warm-up completed. Readiness should be tied to the actual ability to serve. Liveness answers whether the process is functioning; readiness answers whether it should receive traffic. Keep startup probes bounded and avoid a circular dependency where startup waits for traffic that readiness prevents.

### Validation, errors, and shutdown

Use `ValidateOnStart` with `IValidateOptions<TOptions>` to fail early for invalid required configuration instead of discovering it on a request. Validation should avoid printing secrets. Build-time service-provider validation can catch lifetime/captive dependency mistakes, especially in development/test. A startup exception should fail deployment clearly; swallowing it and advertising readiness creates harder incidents.

Host options control shutdown timeout and behavior for background-service exceptions, and may allow concurrent service starts/stops in current runtimes. Concurrency changes ordering assumptions: shared resources need synchronization and one component should own teardown. A background-service exception may stop the host or be ignored depending on policy; ignoring it can leave a degraded process running. Shutdown is cooperative: SIGTERM begins a bounded grace period, cancellation should stop new work, and in-flight operations should finish or persist checkpoints. The process can still be killed when the deadline expires.

Windows service and systemd lifetimes integrate operating-system stop/start signals with host lifetime. Local Ctrl+C behavior is not a substitute for validating service-manager termination and container SIGTERM behavior.

### Configuration and hosting extension points

Bootstrap settings that decide where configuration is loaded from must be available early. `ConfigureAppConfiguration`, `ConfigureLogging`, and `ConfigureServices` add/alter sources and services before build. Server setup such as Kestrel endpoint configuration belongs to host/web-host configuration. Reloading an `IConfigurationRoot` can update providers that support reload, but consumers/options may need reload-aware patterns. Keep AllowedHosts/host filtering and proxy trust aligned with deployment.

Replacing the DI container through `IServiceProviderFactory<TContainerBuilder>` changes scope/disposal integration and should be a deliberate compatibility choice. `WebApplicationFactory<TEntryPoint>` and TestServer provide in-memory test hosting for application-pipeline behavior; they do not exercise sockets, real TLS, proxies, or production deployment topology.

## Mechanisms and relationships

Startup path: entry point → builder/default providers → services/options/server → Build/provider validation → pipeline/endpoints → host start → hosted services and server → readiness. Shutdown path: signal → application stopping token → stop accepting/new work → hosted-service stop callbacks → server/host cleanup → stopped. Configuration values must be available before the component requiring them is constructed. Request scopes live for requests; workers create their own scopes.

## Worked examples

Suppose a worker polls a queue using a scoped processor and database context. Register one hosted worker. Its loop waits with the provided stopping token, creates an async scope for each batch, resolves the processor, processes and checkpoints, disposes the scope, then delays cancellably. This prevents a singleton worker from capturing a scoped context and bounds the unit of work.

Suppose a required endpoint URL is missing. Bind options, validate that the URI and credential reference are present at host start, fail startup with a safe error, and emit detailed diagnostics without exposing the secret. Deployment readiness remains false because the process never starts successfully.

## Misconceptions and edge cases

- `Build` does not start the server; build and start are separate lifecycle phases.
- Adding middleware/endpoints after service-provider construction does not retroactively add services.
- `CreateSlimBuilder` does not mean all normal defaults remain present.
- `ApplicationStarted` is not automatically domain readiness.
- A hosted service singleton must not capture scoped dependencies or request state.
- `StopAsync` has a bounded cancellation window; do not rely on unbounded cleanup.
- Ignoring background-service exceptions may leave an unhealthy host alive.
- `WebApplicationFactory`/TestServer does not prove network, reverse-proxy, TLS, or container behavior.

## Knowledge checks with answers

1. **When must services be registered?** Before `Build`, while the builder owns the service collection.
2. **How should a singleton worker use a scoped processor?** Create a scope around each unit of work and dispose it afterward.
3. **What is the difference between started and ready?** Started means host lifecycle reached that phase; ready is an application/deployment decision based on serving capability.
4. **What must shutdown code expect?** Cooperative cancellation and a finite host/deployment deadline; the process can be terminated after the grace period.
5. **What does TestServer omit?** Real sockets, TLS, proxy and hosting topology, and production network behavior.

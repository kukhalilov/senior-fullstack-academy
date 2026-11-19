# ASP.NET Core startup host builder and application lifetime — Reference: Builder creation, service registration, build, run, and slim defaults

## Scope and version

Sources: Microsoft's [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [minimal hosting](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/webapplication?view=aspnetcore-11.0), [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), and [CreateSlimBuilder API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.builder.webapplication.createslimbuilder?view=aspnetcore-11.0). API shapes should be compiled against the chosen target framework; .NET 11 GA shipped 2026-11-10.

## How this group fits the mental model

Builder APIs configure the process; app APIs compose request handling and control host execution. The options overloads make bootstrap inputs explicit, and the slim builder trades defaults for deliberate configuration.

## Supplied names explained

- `WebApplication.CreateBuilder` — creates the recommended web builder with common ASP.NET Core host, configuration, logging, DI, and server defaults using the supplied/default arguments/options.
- `WebApplication.CreateSlimBuilder` — creates a builder with fewer web-hosting features for smaller/AOT-oriented applications. It still includes appsettings JSON and user-secrets configuration, console logging, and logging configuration. Compared with `CreateBuilder`, documented omissions include hosting startup assemblies, `UseStartup`, Windows EventLog/Debug/EventSource logging providers, static web assets, IIS integration, Kestrel HTTPS and QUIC (HTTP/3) configuration, and regex/alpha route constraints. Add only omitted features the app needs and verify compatibility with the target runtime.
- `WebApplicationBuilder` — mutable composition object exposing service registrations, configuration, logging, environment, and host/web-host customization before build.
- `WebApplicationBuilder.Services` — `IServiceCollection` used to register application/framework services before `Build`.
- `WebApplicationBuilder.Configuration` — configuration view assembled during host construction; read/modify providers as permitted before build, and avoid storing secret values in source.
- `WebApplicationBuilder.Logging` — logging builder for configuring providers and filters before the service provider is built.
- `WebApplicationBuilder.Environment` — host environment information such as name, application name, and content root used to select environment-specific behavior.
- `WebApplicationBuilder.WebHost` — web-host customization surface for server/web hosting settings.
- `WebApplicationBuilder.Host` — Generic Host customization surface for host-level configuration, services, logging, and lifetime-related options.
- `WebApplicationBuilder.Build` — builds the configured service provider and `WebApplication`; registrations made afterward do not alter that built provider.
- `WebApplication` — built ASP.NET Core app/host facade that composes middleware/endpoints and starts/stops the host.
- `WebApplication.Services` — built root `IServiceProvider`; resolving scoped services directly from it can create incorrect lifetimes. Prefer request scopes or explicit scopes.
- `WebApplication.Configuration` — built configuration view used at runtime; reload behavior depends on registered providers and consumer pattern.
- `WebApplication.Environment` — runtime environment metadata for branching/configuration. Never derive it from request input.
- `WebApplication.Lifetime` — host lifetime abstraction exposing started/stopping/stopped signals and a stop request mechanism.
- `WebApplication.Use` — adds middleware to the request pipeline; order determines request/response behavior and short-circuiting.
- `WebApplication.Run` — synchronously starts the app and waits until shutdown; suitable for simple `Main` entry points.
- `WebApplication.RunAsync` — asynchronously runs the app until shutdown; allows async entry-point composition.
- `WebApplication.Start` — synchronously starts the host/server without blocking until shutdown; the caller must later stop/dispose it.
- `WebApplication.StartAsync` — asynchronously starts the host/server and completes after startup; can accept a cancellation token.
- `WebApplication.StopAsync` — requests orderly asynchronous host shutdown, subject to cancellation/shutdown timeout.
- `WebApplication.Map` — maps a branch of the middleware pipeline based on a path predicate; distinguish branch mapping from endpoint route mapping.
- `WebApplication.MapGet` — maps an HTTP GET endpoint to a handler.
- `WebApplication.MapPost` — maps an HTTP POST endpoint to a handler.
- `WebApplication.MapPut` — maps an HTTP PUT endpoint to a handler.
- `WebApplication.MapDelete` — maps an HTTP DELETE endpoint to a handler.
- `WebApplication.MapPatch` — maps an HTTP PATCH endpoint to a handler; handler must implement partial-update semantics safely.
- `WebApplication.MapGroup` — creates a route group so common prefixes and endpoint conventions/metadata can be applied to related endpoints.
- `WebApplication.MapControllers` — adds controller endpoints to endpoint routing after controller services are registered.
- `WebApplication.MapRazorPages` — adds Razor Pages endpoints after the corresponding services are registered.
- `WebApplication.MapHealthChecks` — maps health-check execution to a route; readiness/liveness semantics and access exposure must be configured intentionally.
- `WebApplication.MapFallback` — maps a fallback endpoint when no more-specific endpoint matches, commonly for client-side app routes; order/constraints must avoid swallowing API paths.
- `WebApplicationOptions` — options object passed to builder creation for arguments, application name, content root, web root, and environment name.
- `Args` — command-line arguments supplied to builder creation; default configuration can interpret them as host/app settings.
- `ApplicationName` — assembly/application identity used for host defaults and content/configuration behavior; set it explicitly when entry assembly discovery is not correct.
- `ContentRootPath` — base directory for application content and default configuration file lookup; it is not necessarily the process current directory in every deployment.
- `WebRootPath` — path for public static web assets; keep secrets and private files outside it.
- `EnvironmentName` — configured host environment label such as Development, Staging, or Production; it selects environment behavior but is not a security boundary by itself.
- `Slim builder default services` — reduced builder does not enable every full-builder hosting feature; add framework services and integrations the app actually needs, after checking the documented comparison for the target runtime.
- `Slim builder JSON configuration` — `CreateSlimBuilder` includes `appsettings.json`, environment-specific appsettings files, and User Secrets in Development. Check the current builder docs before adding duplicate providers; custom sources can still be registered explicitly.
- `Slim builder logging providers` — slim defaults include console logging and logging configuration but omit providers such as Debug, EventSource, and Windows EventLog. Add the destinations the deployment actually needs.
- `Slim builder HTTP JSON defaults` — the builder supports Minimal API HTTP JSON, but Native AOT apps must register generated serializer metadata for request/response types. Configure JSON behavior deliberately and test the wire contract.
- `Slim builder dependency injection validation` — current `CreateSlimBuilder` retains the default service-provider scope/build validation in Development. Do not assume the same validation is active in Staging/Production; explicitly configure validation when those environments need it.

## Cross-item comparison

`WebApplication.CreateBuilder` favors common web defaults, while `WebApplication.CreateSlimBuilder` reduces defaults and requires deliberate additions. `WebApplicationBuilder` is the pre-build composition surface; `WebApplication` is the built application/runtime surface. `WebApplication.Map` branches middleware by path, while `MapGet`/`MapPost` and related HTTP methods register endpoints. `StartAsync` returns after startup; `RunAsync` also waits for shutdown.

## Examples

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHealthChecks();
var app = builder.Build();
app.MapHealthChecks("/health/ready");
await app.RunAsync();
```

This example uses the full web builder's common defaults. A slim builder already includes appsettings JSON and console logging, but may need deliberate setup for omitted hosting features, logging destinations, or Native AOT JSON source-generated metadata. A production readiness endpoint should reflect actual ability to receive traffic, not merely return success because the process started.

## Common mistakes

- Registering services after `Build` and expecting them in the existing container.
- Resolving scoped services from the root `Services` provider.
- Assuming `CreateSlimBuilder` is a transparent size-only switch.
- Confusing a path-based middleware branch (`Map`) with a route endpoint (`MapGet`).
- Mapping a health endpoint without deciding readiness, authentication, or network exposure.
- Setting content/web roots based on a developer's current working directory assumption.

## Knowledge checks with answers

1. **Where are services added?** To `WebApplicationBuilder.Services` before calling `Build`.
2. **What does `RunAsync` do beyond `StartAsync`?** It waits for the app lifetime/shutdown after starting.
3. **What changes with a slim builder?** Some defaults are intentionally omitted and must be configured if required.
4. **Where should private upload files be stored?** Outside `WebRootPath` unless they are intentionally public.

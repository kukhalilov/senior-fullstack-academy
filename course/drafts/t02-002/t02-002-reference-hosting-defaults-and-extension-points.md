# ASP.NET Core startup host builder and application lifetime — Reference: Default service registration, environment, server configuration, and customization

## Scope and version

Sources: Microsoft [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), and [legacy web-host guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/web-host). Defaults and extension availability can change by target framework; inspect the effective builder in the deployed version.

## How this group fits the mental model

Defaults accelerate common applications but are not invisible guarantees. Extension points let a host customize configuration, logging, services, server, and DI container before build. Tests and production must use equivalent composition where the behavior under test depends on it.

## Supplied names explained

- `WebApplication.CreateBuilder default configuration providers` — common web builder sources include JSON, environment-specific JSON, user secrets in Development, environment variables, and command-line arguments, with host configuration inputs as well. Exact precedence/order is versioned.
- `Default logging providers` — builder defaults register common logging destinations/providers. Production deployments may replace/add providers, filters, and redaction; verify logs actually reach the platform.
- `Default dependency injection container` — the built-in Microsoft DI service collection/provider is the normal container for ASP.NET Core registrations.
- `Default Kestrel server registration` — web defaults configure Kestrel/server integration unless hosting environment/settings select another supported server model.
- `Default content root` — builder chooses an application content base, commonly related to current directory or application options. Set explicitly in unusual service/container layouts and test file lookup.
- `Default web root` — conventional static web asset root, commonly `wwwroot`; explicit static-asset hosting can change how it is used.
- `Development environment defaults` — development configuration can enable scope validation and user secrets and uses developer-oriented exception behavior. Do not expose Development behavior publicly.
- `Production exception behavior` — production should return safe error responses and log diagnostic details server-side; do not reveal stack traces or secrets to clients.
- `WebApplication automatic middleware` — some current `WebApplication` behavior may automatically insert or analyze middleware under specific conditions. Know the target-version defaults; explicitly configure security-sensitive order and avoid relying on accidental insertion.
- `WebApplication route analysis` — endpoint-aware middleware analysis can detect/order certain middleware relative to mapped endpoints. It is not a replacement for understanding middleware ordering or verifying runtime behavior.
- `ConfigureAppConfiguration` — builder callback/extension for adding or customizing application configuration sources before build.
- `ConfigureLogging` — host builder callback for configuring logging providers/filters before service provider construction.
- `ConfigureServices` — builder callback for registering application and framework services.
- `ConfigureHostOptions` — configure lifecycle options such as shutdown timeout or hosted-service behavior through the host builder.
- `IWebHostBuilder.UseSetting` — legacy web-host key/value setting configuration method; current web builder APIs often expose typed properties/extensions instead.
- `IWebHostBuilder.ConfigureAppConfiguration` — legacy builder extension to add app configuration sources.
- `IWebHostBuilder.ConfigureServices` — legacy builder extension to register services in its service collection.
- `IWebHostBuilder.ConfigureLogging` — legacy builder extension to customize logging registration.
- `KestrelServerOptions` — Kestrel options object for listeners, protocols, limits, certificates, and server behavior; use secure endpoint configuration and current server docs.
- `ConfigureKestrel` — web-host builder extension for configuring Kestrel server options.
- `WebHost.UseKestrel` — legacy web-host extension selecting/configuring Kestrel; standard modern web templates generally register it by default.
- `IConfigurationRoot.Reload` — requests a reload of configuration providers that support reload. Not every source reloads, and consumers must use reload-aware options or reread values.
- `Host filtering` — restrict accepted host names to reduce Host-header-based attacks/misrouting; configure allowed values for the actual public hostnames and proxy topology.
- `AllowedHosts configuration` — configuration setting for allowed host names consumed by host filtering when enabled. It does not configure DNS, TLS certificates, or reverse-proxy trust.
- `Dependency injection container replacement` — replace the built-in provider with another DI implementation only when capabilities/integration justify the added lifecycle/disposal/diagnostic responsibility.
- `IServiceProviderFactory<TContainerBuilder>` — adapter contract that creates a container builder from service registrations and builds the final `IServiceProvider` for a replacement DI container.
- `IHostBuilder.UseServiceProviderFactory` — selects an `IServiceProviderFactory` for the Generic Host's service provider construction.
- `IHostBuilder.ConfigureContainer` — configure the replacement container builder after service registrations have been collected.
- `WebApplicationFactory.ConfigureWebHost` — test integration hook to customize the test host before app startup, for example replacing configuration or test services.
- `TestServer` — in-memory ASP.NET Core server for application pipeline tests without real network sockets; it does not validate TLS, proxy, OS hosting, or network behavior.
- `In-memory test host` — testing setup using TestServer or an equivalent host to execute the application pipeline in process; test fidelity is limited to what that test server models.

## Cross-item comparison

`ConfigureAppConfiguration`, `ConfigureLogging`, `ConfigureServices`, and `ConfigureHostOptions` affect different host subsystems but all act before the final provider/app is built. `WebApplication automatic middleware` and `WebApplication route analysis` are framework behaviors, not replacements for correct explicit security ordering. `TestServer` exercises the pipeline; a real server/proxy test is needed for sockets, TLS, forwarding, and deployment topology. Replacing DI changes more than registration syntax: scope, disposal, validation, and framework integration must be verified.

## Examples

For a test, use `WebApplicationFactory.ConfigureWebHost` to inject a test connection string and replace an external client; keep production behavior for the middleware being tested. Separately validate host filtering and forwarded headers in a real reverse-proxy deployment test. For a custom container, configure its factory before build and run scope/disposal integration tests for framework-owned services.

## Common mistakes

- Assuming default configuration precedence without checking the exact builder and target version.
- Using `AllowedHosts` as a substitute for TLS, proxy trust, or authentication.
- Assuming `TestServer` tests Kestrel listener/TLS behavior.
- Replacing DI and missing disposal/scope integration differences.
- Treating configuration reload as instantaneous across all providers and options consumers.
- Depending on automatic middleware insertion for a security guarantee without a test.

## Knowledge checks with answers

1. **When must builder extension callbacks run?** Before build, while the host composition is still being assembled.
2. **What does `AllowedHosts` control?** Host-header filtering for configured host names, not DNS or TLS.
3. **What does TestServer not exercise?** Actual network sockets, TLS termination, reverse proxy behavior, and deployment OS integration.
4. **What changes when replacing DI?** Provider creation/disposal/scope/validation and integration responsibility, not only registration calls.

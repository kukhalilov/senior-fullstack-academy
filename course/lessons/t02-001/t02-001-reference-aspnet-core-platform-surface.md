# ASP.NET Core platform model and framework choices — Reference: Framework identity, hosting model, HTTP server, and app styles

## Scope and version

Based on Microsoft's [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core), [fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [server documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/), [hosting/deployment](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core). .NET 11 GA shipped on 2026-11-10; .NET 11 is STS and .NET 10 is LTS according to the checked policy. Server and hosting support depends on operating system and target.

## How this group fits the mental model

This inventory maps the pieces around one HTTP request: framework and host compose services/lifetime; server accepts HTTP; middleware and routing dispatch; app styles implement endpoints; deployment controls runtime availability and assets.

## Supplied names explained

- `ASP.NET Core` — cross-platform .NET web framework providing hosting integration, HTTP abstractions, middleware, routing, DI/configuration/logging integration, and application styles.
- `ASP.NET Core shared framework` — runtime-provided framework assembly set that applications can reference rather than copying every framework assembly into output. The compatible shared framework must be installed for framework-dependent deployment.
- `Microsoft.AspNetCore.App` — framework reference identifying the shared ASP.NET Core framework for a .NET application; the target framework/runtime determines the installed implementation.
- `ASP.NET Core WebApplication` — modern application abstraction built from the minimal hosting model; it combines host and web-app conveniences and runs the configured request pipeline.
- `ASP.NET Core WebApplicationBuilder` — builder used to configure services, configuration, logging, environment, and web-host settings before building the app.
- `Minimal Host` — streamlined host configuration model underlying `WebApplication`; it preserves Generic Host capabilities while reducing setup ceremony.
- `ASP.NET Core Generic Host integration` — integration with the .NET Generic Host for DI, configuration, logging, hosted services, and application lifetime. It is available to different web endpoint styles.
- `ASP.NET Core Web Host (legacy compatibility host)` — older ASP.NET Core web-hosting abstraction retained for compatibility/migration scenarios. New applications generally use the current minimal hosting path unless requirements dictate otherwise.
- `Kestrel` — default cross-platform ASP.NET Core HTTP server. It can listen directly as an edge server or receive forwarded traffic from a reverse proxy.
- `HTTP.sys server` — Windows-only HTTP server based on the Windows HTTP Server API/kernel driver; it exposes capabilities such as port sharing or kernel-mode authentication that may matter for specific deployments.
- `IIS in-process hosting` — application runs in the IIS worker process using the IIS HTTP Server implementation; it avoids a loopback proxy hop and relies on IIS/WAS process management.
- `IIS out-of-process hosting` — IIS/ANCM proxies requests to a separate ASP.NET Core process running Kestrel. This adds a process boundary; isolate applications with separate app pools as recommended by Microsoft. In-process hosting requires a separate app pool per app.
- `ASP.NET Core Module (ANCM)` — native IIS module that integrates IIS with ASP.NET Core, forwards requests to the chosen hosting model, and manages app startup/restart as configured.
- `HTTP request pipeline` — ordered middleware chain that processes each request and may continue, alter, short-circuit, or handle it before endpoint execution.
- `Middleware` — component that receives `HttpContext` and a next delegate, enabling cross-cutting request/response behavior such as diagnostics or security.
- `Endpoint routing` — mechanism that matches an incoming request to an endpoint and dispatches it after route selection. Endpoint metadata can also inform middleware decisions.
- `Minimal APIs` — route-handler style for defining HTTP endpoints with compact code and built-in binding/DI integration; it uses the same host/server/pipeline fundamentals.
- `Controller-based Web API` — API style using controllers/actions, model binding, filters, and result conventions to implement HTTP contracts.
- `ASP.NET Core MVC` — model-view-controller framework for web APIs and view-rendered applications using controllers, actions, and related conventions.
- `Razor Pages` — page-focused server-rendered UI model in which a page and its handler logic form a unit.
- `Blazor Web App` — ASP.NET Core application style built with Razor components and configurable server-side, WebAssembly, or static rendering/interactivity modes, subject to the chosen hosting setup.
- `SignalR` — real-time communication framework that manages hubs/connections and negotiates supported transports; it is distinct from ordinary request/response endpoints.
- `gRPC service` — RPC service hosted by ASP.NET Core using generated contracts and HTTP/2-based transport requirements; proxy and hosting configuration must preserve protocol support.
- `Static file hosting` — serving files such as CSS, JavaScript, and images from configured web-root or static-asset sources. It is not a dynamic endpoint or authorization boundary by default.
- `Cross-platform hosting` — ASP.NET Core can run on supported Windows and Linux deployment targets, with platform-specific server/hosting and feature differences.
- `Dependency injection container` — service provider used to construct application services with configured lifetimes; ASP.NET Core integrates this into host startup and request scopes.
- `Configuration providers` — layered sources such as JSON files, environment variables, command-line arguments, and secret/configuration services. Precedence is provider-specific and must be inspected for the actual host setup.
- `Logging providers` — destinations/adapters receiving framework and application log records, configured by the host. Provider filtering, redaction, and deployment capture matter operationally.
- `Environment-specific configuration` — settings that differ by deployment environment through provider sources and environment name. Do not store production secrets in committed environment files.
- `Development environment` — conventional development environment name enabling local developer behavior. It must not be selected by untrusted request input or accidentally used for public production.
- `Staging environment` — conventional preproduction name used for production-like validation. It has no special security guarantee unless deployment configuration enforces it.
- `Production environment` — conventional live environment name for production behavior such as safe error handling and production observability.
- `Content root` — base path used by the host for application content/configuration files; it is distinct from the public static-file root.
- `Web root` — conventional root for publicly served static files. Files placed there should be treated as potentially accessible to clients.
- `Application lifetime` — host signals for started/stopping/stopped states and coordination with graceful shutdown; cleanup must respect shutdown timeouts.
- `Graceful shutdown` — stop accepting new work and allow in-flight operations/hosted services to finish within configured deadlines before process termination.
- `Request scope` — DI scope associated with an HTTP request, commonly used for scoped services such as DbContext. Do not retain request-scoped services beyond their lifetime.
- `HTTP context` — per-request object carrying request, response, connection, user, and feature information. It is request-specific and should not be stored for later/background work.
- `Server feature interface` — optional server capability exposed through the request feature collection. Check availability and avoid coupling application logic to a feature unsupported by another server.
- `ASP.NET Core diagnostics` — framework instrumentation and diagnostic events/metrics used to observe hosting, HTTP, routing, and application behavior; configure collection and sensitive-data policy deliberately.
- `ASP.NET Core shared framework deployment` — deployment that references framework assemblies supplied by a compatible installed ASP.NET Core shared framework, rather than bundling them in the app output.
- `Framework-dependent deployment` — publish mode requiring a compatible .NET runtime/shared framework on the target. It can reduce artifact size and centralize runtime servicing but couples operation to target runtime availability.
- `Self-contained deployment` — publish mode that includes the .NET runtime for a target RID. The artifact is larger and the application owner must publish refreshed runtime patches.
- `Native AOT web application support` — ahead-of-time compiled web app mode with feature/provider constraints from trimming and dynamic-code limitations. Validate framework features, reflection, serializers, and package compatibility before selecting it.

## Cross-item comparison

`ASP.NET Core WebApplication` is the modern web application entry point integrated with host features; `ASP.NET Core Generic Host integration` describes shared hosting services; `ASP.NET Core Web Host (legacy compatibility host)` is primarily an older compatibility model. `Kestrel` is cross-platform; `HTTP.sys server` is Windows-only with specialized capabilities. IIS can host in process or proxy out of process to Kestrel. Framework-dependent deployment uses target-installed runtime; self-contained deployment bundles it; Native AOT adds a separate compatibility constraint.

## Examples

A Linux container commonly runs Kestrel directly or behind the cluster ingress. An IIS Windows deployment may use in-process or out-of-process hosting depending on compatibility/topology. Both can expose the same controller or Minimal API endpoints; the server hosting choice does not define application routing style. A public static asset belongs under the configured public root only if exposure is intended.

## Common mistakes

- Treating IIS as the only way to host ASP.NET Core or Kestrel as only an internal server.
- Assuming all optional server features exist on every implementation.
- Holding `HttpContext` or request-scoped services after the request completes.
- Exposing secrets by placing them under the web root.
- Assuming a self-contained artifact receives runtime patch updates automatically.
- Claiming Native AOT supports every dynamic/reflection-dependent package without changes.

## Knowledge checks with answers

1. **What is the sequence before an endpoint runs?** Host startup configures server and pipeline; server creates request context; middleware runs; routing dispatches the endpoint.
2. **What differs between IIS hosting modes?** In-process uses IIS HTTP Server in the worker process; out-of-process proxies to a separate Kestrel process.
3. **Which deployment bundles the runtime?** Self-contained; it shifts runtime servicing to the artifact owner.
4. **Is web root automatically a secure file store?** No; it is the public static-file area and should contain only intentionally public content.

# ASP.NET Core platform model and framework choices — Core concepts and how they fit together

Sources: Microsoft's [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core), [fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [server implementations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/), [hosting and deployment](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/), [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), plus the official [Express](https://expressjs.com/en/), [Spring Boot](https://docs.spring.io/spring-boot/index.html), and [Django](https://docs.djangoproject.com/en/stable/) documentation. As of 2026-11-16, .NET 11 is STS and .NET 10 is LTS; Microsoft lists two and three years of support respectively. [Support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core).

## Learning objectives

Explain how ASP.NET Core receives and handles a request; distinguish host, server, middleware, routing, endpoint, and application style; compare hosting and deployment models; and select a framework from workload and lifecycle requirements.

## Prerequisites

Know basic HTTP request/response concepts, processes, dependency injection, and the difference between a web server and application code. Detailed middleware, routing, authentication, and deployment APIs belong to later topics.

## Core concepts

### The application process and host

An application process starts and configures a host. The current `WebApplication` and `WebApplicationBuilder` path is the default for new applications; it integrates with the Generic Host capabilities such as service registration, configuration, logging, and application lifetime. `Minimal Host` names this streamlined hosting model. The older Generic Host and Web Host terms describe related but distinct host abstractions; Web Host is primarily a compatibility model for older applications. Do not infer that minimal APIs require a minimal host or that controller/MVC applications require the legacy Web Host.

The host builds a dependency-injection service provider, obtains configuration from providers, sets up logging, composes the HTTP pipeline, starts the server, and coordinates graceful shutdown. Environment-specific settings affect configuration and behavior, but environment names are conventions selected by deployment, not separate application binaries. Content root identifies application content/configuration context; web root is the conventional public static-asset directory. Neither should be confused with the process working directory.

### Server, request context, and pipeline

An in-process server implementation accepts HTTP and exposes request features through `HttpContext`. Kestrel is the default cross-platform server and can be an edge server or sit behind a reverse proxy. HTTP.sys is Windows-only and supplies capabilities that may fit specific requirements. Under IIS, in-process hosting uses the IIS HTTP server within the IIS worker process; out-of-process hosting proxies to Kestrel. ANCM integrates IIS requests and ASP.NET Core process management. Select a server/hosting model based on required platform features and topology rather than assuming one is mandatory everywhere.

The HTTP request pipeline is an ordered chain of middleware. Each component can inspect/change the request, call the next component, handle a response, or short-circuit. Endpoint routing matches a request and dispatches to a handler. Middleware order is observable behavior: security, error handling, routing, authentication/authorization, and endpoint execution must be composed intentionally. `Server feature interface` exposes server capabilities through request features, but application logic should not assume every server implements every optional capability.

### Application styles share infrastructure

Minimal APIs map route handlers with compact syntax. Controller-based Web API uses controllers/actions and associated conventions. ASP.NET Core MVC can render views and handle controller workflows; Razor Pages organizes page-focused server-rendered UI. Blazor Web App combines Razor components and selectable render/interactivity modes. SignalR supports real-time hub communication, while gRPC service exposes RPC contracts over HTTP/2/HTTP/3 capabilities according to deployment/provider constraints. Static file hosting serves assets; it is not the same as dynamic endpoint execution. These styles can coexist where useful, but combining them creates more conventions and deployment/testing surfaces.

### Shared framework and deployment choices

`Microsoft.AspNetCore.App` is the shared framework containing ASP.NET Core assemblies for runtime deployments. A framework-dependent artifact expects the target machine/container to have a compatible .NET runtime/shared framework installed and patched. A self-contained artifact includes the runtime for a target runtime identifier, increasing artifact size and placing runtime patch refresh responsibility on the app deployment. Native AOT web app support is workload/framework/provider constrained; verify feature compatibility and startup/memory goals before choosing it. All deployment shapes need correct platform/runtime targeting, configuration, health, logging, and security updates.

### Choose frameworks with explicit requirements

ASP.NET Core, Express, Spring Boot, and Django can all build web services, but differ in language/runtime, framework conventions, ecosystem, deployment, and operational ownership. A serverless function host is a deployment/execution model with event/request triggers and provider-managed limits; it can host HTTP endpoints but differs in lifecycle and operational constraints from an always-running web process. A JavaScript full-stack framework may combine frontend routing/rendering and server functions; do not compare it to only one ASP.NET component without matching the product boundary.

List constraints first: required languages and team capability, hosting OS/cloud/on-premises, ecosystem integrations, I/O versus CPU workload, concurrency pattern, startup/memory budget, identity/security needs, observability, scaling and operations, support horizon, migration/interoperability, and total ownership cost. Popularity and vendor claims are inputs, not decision rules. Benchmarks must match workload, hardware, configuration, data, latency, and measurement method; a framework-specific result is not universal evidence.

### Release lifecycle is part of the decision

LTS and STS are supported release tracks, not quality rankings. The official policy as checked on 2026-11-16 lists .NET 10 as active LTS through 2028-11-14 and .NET 11 as active STS through 2028-11-14. Both require current patches. Choose from lifecycle, target support, required features, and the organization's upgrade capacity. A release candidate is a pre-release go-live build with a bounded support window; production selection should normally use a supported stable release unless a deliberate preview validation program says otherwise.

## Mechanisms and relationships

The request path is process → host → server → `HttpContext` → middleware → routing → endpoint/application logic → response. Hosting integration may put a reverse proxy in front of the server or run the server inside IIS. The application's architecture is independent of whether an endpoint was written as a Minimal API, MVC controller, Razor Page, Blazor component, SignalR hub, or gRPC service. The chosen deployment package and runtime lifecycle constrain where that same process can run.

## Worked examples

For a small internal CRUD API on Linux containers, a .NET team may select ASP.NET Core Minimal APIs or controllers based on contract complexity and team conventions, run Kestrel behind the platform ingress, use a framework-dependent container if the base image owns patched runtime updates, and monitor health/latency. The decision should account for container patch cadence and process shutdown behavior.

For a Windows-only application requiring kernel-mode HTTP.sys capabilities, compare HTTP.sys with Kestrel/IIS against those exact needs. If no unique HTTP.sys feature is required, the default cross-platform Kestrel path may reduce OS coupling. This is a requirement tradeoff, not a universal performance ranking.

## Misconceptions and edge cases

- A web framework is not the HTTP server. ASP.NET Core uses server implementations such as Kestrel and HTTP.sys.
- Minimal APIs are an endpoint programming style, not a requirement to omit MVC/Blazor or the Generic Host capabilities.
- IIS out-of-process uses Kestrel behind IIS; in-process uses the IIS HTTP server. The choice changes request topology and process behavior.
- Framework-dependent deployments are smaller but depend on an installed compatible runtime; self-contained deployments shift runtime patch responsibility to the artifact publisher.
- Native AOT support is not equivalent to every ASP.NET Core feature being supported without limits.
- “Cross-platform” does not mean every deployment feature behaves identically across operating systems.
- The support policy dates can change; choose using the policy at the time of release planning and keep patch versions current.
- A benchmark ranking without matching workload and deployment assumptions cannot determine framework fit.

## Knowledge checks with answers

1. **What handles the socket/request before middleware?** The configured in-process server accepts HTTP and creates the request context/features surfaced to the app.
2. **What is the difference between host and server?** The host configures services, app lifecycle, and pipeline; the server listens for HTTP and adapts it to the app's request model.
3. **Does `FromSql` or MVC style determine hosting?** No; application style and hosting/server topology are separate choices.
4. **Who patches runtime in a framework-dependent deployment?** The environment/runtime owner; in a self-contained artifact, the application publisher must refresh the bundled runtime.
5. **How do LTS and STS differ?** Support duration and lifecycle, not release quality; check the current policy and patch requirements.

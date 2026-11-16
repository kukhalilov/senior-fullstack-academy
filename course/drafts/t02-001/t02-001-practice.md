# ASP.NET Core platform model and framework choices — Exercises and worked solutions

Sources: Microsoft's [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core), [server options](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/), [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), and official [Express](https://expressjs.com/en/), [Spring Boot](https://docs.spring.io/spring-boot/index.html), and [Django](https://docs.djangoproject.com/en/stable/) documentation. Version facts below were checked 2026-11-16.

## Goals

Trace a request through the ASP.NET Core process; distinguish hosting and endpoint styles; and make a framework/runtime choice from explicit workload, team, and support constraints.

## Worked example

A team needs an internal API and admin interface. It has .NET experience, must run on Linux containers, uses a corporate identity system and SQL Server, and can upgrade annually. A reasonable design is ASP.NET Core on the supported .NET 10 LTS release if a three-year servicing line is desired, with Kestrel behind the container ingress. Use controllers or Minimal APIs based on contract/convention needs and a server-rendered UI only if the admin product benefits from it. Define health, graceful shutdown, logs, traces, and runtime patch ownership. Revisit .NET 11 STS if newer features justify its two-year servicing horizon and the team's upgrade cadence. This is a requirements fit, not a generic benchmark verdict.

## Exercises

1. Trace a request from network arrival to a Minimal API handler and back to the client. Name where middleware and routing participate.
2. A Windows deployment needs kernel-mode Windows authentication and port sharing. Compare Kestrel, HTTP.sys, and IIS hosting based on these constraints.
3. A container image should be small and the platform team patches the runtime base image. Compare framework-dependent and self-contained deployment.
4. Choose between ASP.NET Core, Express, Spring Boot, Django, and serverless functions for: a long-running .NET line-of-business API; a Python data team deploying a conventional CRUD product; and a short event-triggered worker with provider-specific triggers.
5. A benchmark says one framework is 30% faster. List evidence needed before using this to choose a production stack.

## Progressive hints

1. The host configures; the server accepts HTTP; the request context exposes features; middleware runs; routing dispatches.
2. Compare required capabilities rather than general performance claims.
3. Runtime patch responsibility moves with the deployment model.
4. Include team language expertise, lifecycle, ecosystem, operations, and application execution shape.
5. Benchmarks are workload/configuration-specific.

## Complete solutions

1. The process starts its host, which configures services/configuration/logging and builds the pipeline. Kestrel or another server receives HTTP and creates request features/`HttpContext`. Middleware executes in registration order and may short-circuit. Endpoint routing selects and invokes the Minimal API handler. The handler returns a result; response processing unwinds through middleware and the server sends it over the connection, possibly through a reverse proxy.
2. HTTP.sys is Windows-only and has kernel-mode authentication and port-sharing features. Kestrel is cross-platform and supports user-mode authentication but not those exact kernel-mode capabilities. IIS can provide process management/integration; an IIS in-process model differs from out-of-process proxying to Kestrel. Choose a supported topology that meets the required feature, then validate identity and operations.
3. Framework-dependent output can be smaller and uses the compatible runtime/shared framework installed in the image; the platform team must patch the base image and runtime promptly. Self-contained output bundles runtime bits, increases size, and means the application publisher must rebuild/redeploy for runtime patches. Compare actual image and patch ownership.
4. For the .NET long-running API, ASP.NET Core is a strong fit if .NET libraries and team support match. For the Python team/product, Django may lower ramp-up and provide conventional integrated web features if ecosystem/operations fit. For short event-triggered work, a serverless function host may better match lifecycle and scaling, provided its duration, cold-start, networking, and provider limits fit. Express or Spring Boot remain valid if their language/team/ecosystem requirements fit; there is no universal winner.
5. Require benchmark source, version/build, hardware/OS, deployment topology, equivalent features/security, workload/data distribution, concurrency, warm-up/cold-start handling, latency percentiles, throughput, resource use, repeated trials, and correctness checks. Reproduce the result in a representative environment and separately test DB/network/operational bottlenecks.

## Tests and edge cases

- Validate actual proxy/TLS/forwarded-header topology, not only localhost.
- Check graceful shutdown with in-flight requests and background work.
- Confirm public static content placement does not expose configuration/secrets.
- Verify the selected release is currently supported and patched; dates change.
- Compare workload results with the same database, cache, serialization, and observability configuration.

## Reflection questions

1. Which constraint was decisive in your framework choice?
2. Which deployment team owns runtime security patches?
3. Which server feature does the application truly require?
4. What benchmark result would change your decision, and what evidence would make it trustworthy?

# ASP.NET Core platform model and framework choices — Big-picture orientation and mental model

Sources: Microsoft's [ASP.NET Core overview](https://learn.microsoft.com/en-us/aspnet/core/introduction-to-aspnet-core), [fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [servers](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/servers/), [hosting and deployment](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core). As checked on 2026-11-16, .NET 11 is the current STS release and .NET 10 is the current LTS release; they have the same quality and different support durations.

## Problem and purpose

ASP.NET Core provides the server-side foundation for web applications and APIs on .NET. Understanding the process, host, server, middleware, endpoint, and supported app styles makes it easier to reason about request handling, deployment, testing, and framework choices. Framework selection is a requirements decision, not a popularity contest or a benchmark leaderboard.

## Plain-language mental model

An ASP.NET Core application is a process that starts a host, configures services and a request pipeline, then listens through an HTTP server such as Kestrel. The server turns incoming network traffic into an `HttpContext`; middleware handles cross-cutting work and endpoint routing selects the application handler. That handler may be a Minimal API, controller, Razor Page, Blazor component, SignalR hub, or gRPC service. The host supplies configuration, dependency injection, logging, and shutdown behavior around that request path.

## How the parts fit together

The framework provides abstractions and integration points; the server handles HTTP; hosting coordinates startup/lifetime; middleware forms the pipeline; routing selects endpoints; application services implement behavior. IIS can host in-process or proxy to Kestrel; Kestrel can also run directly or behind another reverse proxy. The shared framework supplies runtime components in framework-dependent deployments, while self-contained deployments include the runtime. Frontend technology and backend framework are separate choices connected through HTTP or other protocols.

## Concept map

```text
process → host/configuration/DI/logging/lifetime
        → HTTP server → HttpContext/features
        → middleware pipeline → endpoint routing → handler/app style
        → response through server/proxy to client

selection → workload + team + ecosystem + deployment + lifecycle + cost
```

## End-to-end walkthrough

For a JSON API, `WebApplication.CreateBuilder` sets up the modern minimal host and defaults. Register services, build the app, configure middleware in order, map API endpoints, then run. Kestrel accepts HTTP requests. If IIS is in front, ANCM provides the appropriate hosting integration. For a server-rendered UI or real-time app, select the relevant ASP.NET Core app style while retaining the same underlying host/server fundamentals. At deployment, choose framework-dependent or self-contained publish based on runtime management and platform requirements, then observe readiness and graceful shutdown.

## When to use it and tradeoffs

Choose ASP.NET Core when the .NET language/runtime, libraries, hosting options, team skills, and support lifecycle fit the workload. Compare alternatives using the same requirements: language/runtime fit, ecosystem, concurrency model, deployment target, observability, identity, security servicing, migration risk, and total operating cost. A framework's headline benchmark does not predict your application. Use LTS for a longer support horizon where that is the priority; use STS when its newer capabilities and two-year servicing horizon fit the upgrade plan. Keep patch levels current.

## What later lessons cover

The concepts lesson explains the request-process model and selection method. One reference inventories platform and hosting elements; another provides a bounded comparison framework. The exercises and interview lesson make a choice from explicit requirements rather than unsupported rankings.

# ASP.NET Core startup host builder and application lifetime — Big-picture orientation and mental model

Sources: Microsoft's [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), [minimal hosting model](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/webapplication?view=aspnetcore-11.0), and [hosted lifecycle API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice). The .NET 11 GA hosting API surface was checked 2026-11-16.

## Problem and purpose

Startup is where the process assembles configuration, services, server, middleware, endpoints, and hosted work. Application lifetime determines when these pieces start, become ready, receive shutdown signals, and release resources. Mistakes here show up as deployment failures, leaked scopes, premature readiness, hung shutdowns, or environment-dependent behavior.

## Plain-language mental model

The builder phase is the construction site: read bootstrap settings, register services, configure host/server behavior, and validate required options. `Build` freezes that composition into an application/host. The run phase starts hosted services and the server, then waits for shutdown. The web application adds its middleware/endpoints to host lifecycle. Startup work should be bounded and failure should be visible; request work belongs in the request pipeline, not in a long blocking startup callback.

## How the parts fit together

`WebApplication.CreateBuilder` provides web defaults; `CreateSlimBuilder` deliberately omits some defaults for a smaller setup. Register dependencies and configuration before `Build`. Configure middleware and map endpoints on the built application. The Generic Host provides common configuration, DI, logging, hosted services, and lifetime behavior for web and worker processes. `IHostedService` participates in start/stop; `BackgroundService` offers an execution loop; `IHostedLifecycleService` adds hooks before and after ordinary start/stop. Readiness must reflect whether required startup dependencies are ready, not merely whether the process exists.

## Concept map

```text
args/environment → builder defaults and configuration
                 → register services/options/server
                 → Build (validate and compose)
                 → hosted-service start sequence
                 → app/server readiness → serve requests
signal/StopAsync → stopping callbacks → drain → stopped/dispose
```

## End-to-end walkthrough

At process start, parse command-line/environment bootstrap values and create the builder. Add services, validate options at host start, configure the server, build, configure middleware/routes, then start. A startup service that warms a required cache should use bounded async work and fail startup if the application cannot safely serve without it. When the platform sends SIGTERM, the host marks stopping, stops accepting work according to the host/server integration, signals cancellation, gives services a bounded shutdown window, and exits. If shutdown exceeds the configured deadline, the process may be terminated; durability must not depend on a callback that can run forever.

## When to use it and tradeoffs

Use the default minimal host for new web apps unless compatibility requires another model. Use the slim builder only after understanding which defaults it omits and adding required services/configuration deliberately. Validate configuration early; keep request-specific validation in request handling. Hosted services should not capture scoped dependencies for their entire singleton lifetime; create a scope per unit of work. Keep startup and shutdown work bounded and observable.

## What later lessons cover

The concepts lesson explains ordering and lifetime semantics. References cover current web builder APIs, Generic Host and legacy forms, lifecycle/options validation, and hosting defaults/extension points. Practice and interview units reason through startup failure, readiness, worker scope, and graceful shutdown.

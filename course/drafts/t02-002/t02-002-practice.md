# ASP.NET Core startup host builder and application lifetime — Exercises and worked solutions

Sources: Microsoft [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), [IHostedLifecycleService API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice), and [WebApplication hosting](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/webapplication?view=aspnetcore-11.0).

## Goals

Design startup and shutdown behavior, safely use scoped services in hosted work, validate configuration before serving, and distinguish host-started from application-ready.

## Worked example

A message-processing web API depends on a required queue endpoint, SQL database, and one warm lookup cache. Bind/validate local options at host start. Register a hosted warm-up/consumer service that uses an async DI scope per batch and observes cancellation. Keep readiness false until essential dependencies are usable. On SIGTERM, stop taking new messages, finish/checkpoint the active item within the orchestrator/host deadline, then exit. If the worker fails and the API cannot remain correct without it, select a host policy that stops the process or mark it unready and alert; do not silently ignore the fault.

## Exercises

1. A `BackgroundService` constructor receives a scoped `DbContext`. Explain the lifetime problem and redesign the worker.
2. A container is marked ready immediately after `ApplicationStarted`, but cache warm-up continues for 90 seconds. How should readiness behave?
3. A missing required endpoint URL causes the first user request to fail. Move the failure earlier without printing secrets.
4. Two hosted services depend on shared state, while `ServicesStartConcurrently` is enabled. What design should replace reliance on registration order?
5. The worker's `StopAsync` waits indefinitely for a remote call. Explain why this is unsafe and what to change.
6. `CreateSlimBuilder` produces an app without expected JSON settings and console logs. What is the correct response?
7. A test using TestServer passes, but production TLS and proxy routing fail. Identify the missing test boundary.

## Progressive hints

1. Hosted services are effectively singleton components. Scope per unit of work.
2. Host lifecycle completion and business readiness are different signals.
3. Use options binding/validation at startup.
4. Make dependency orchestration explicit or make the shared state independently safe.
5. Host and orchestrator both have finite shutdown windows.
6. Slim builder intentionally omits some defaults.
7. TestServer is in-process and does not open real sockets or configure a reverse proxy.

## Complete solutions

1. A singleton worker cannot capture a scoped context for process lifetime. Inject `IServiceScopeFactory` or an appropriate context factory; create and dispose a scope/context for each batch, await all work, and do not overlap operations on one context.
2. Keep readiness false until the cache is populated and the endpoint can serve its contract. Liveness can still report the process is alive. Bound warm-up, expose state/diagnostics safely, and allow deployment to restart or fail the rollout if it never becomes ready.
3. Bind a typed options object and validate URL/required fields with `IValidateOptions<TOptions>` and `ValidateOnStart`. Fail host startup with a safe message identifying the setting name, while logging no credential value. This validates local configuration, not current remote availability; dependency readiness is a separate check.
4. Avoid incidental registration-order coupling. Use a coordinator that starts required components sequentially, make the shared resource independently initialized and awaitable, or disable concurrent starts if ordered start is a real invariant. Use synchronization for shared mutable state and test shutdown dependencies too.
5. `StopAsync` has a cancellation/deadline, and the container may kill the process when its grace period expires. Propagate cancellation to network calls, stop claiming work, use bounded timeouts, persist checkpoints/leases, and make processing resumable/idempotent. Do not swallow cancellation.
6. Read the exact slim-builder defaults for the target runtime and explicitly add the JSON configuration provider, logging providers, HTTP JSON settings, and validation the application needs. Add tests for the effective configuration and logs; do not revert blindly without identifying needed defaults.
7. Add an end-to-end test using the real Kestrel/IIS/reverse-proxy/TLS topology (or a production-like container/proxy) to verify sockets, certificates, forwarding, route behavior, and trust configuration. Keep TestServer for fast pipeline tests.

## Tests and edge cases

- Validate options with missing, malformed, and valid values; assert safe diagnostics.
- Test startup dependency failure prevents readiness.
- Send the platform's termination signal while a batch is in progress and verify bounded checkpoint/cleanup.
- Test background-service exceptions under configured stop/ignore policy.
- Configure conflicting environment variables and assert expected environment under the exact builder.
- Ensure a failure in a background worker triggers readiness/alert behavior rather than a silently degraded app.

## Reflection questions

1. What exactly does your readiness endpoint promise?
2. Which services are scoped, and where are scopes created for background work?
3. What is the shortest shutdown deadline across host, container, and orchestrator?
4. Which startup errors should fail the process versus mark it unready?
5. Which deployment behaviors require real-socket tests rather than TestServer?

# hosted services background tasks and scheduling — Reference: host construction registration start stop lifecycle and failure policies

## Scope and version

This lesson explains the supplied Generic Host and ASP.NET Core hosted-service lifecycle names, ordering controls, cancellation, and failure settings. The notes reflect .NET 11 GA documentation checked 2026-11-14. The hosting abstractions are package-provided; verify the specific package version and target framework when migrating. .NET 10 changed `BackgroundService.ExecuteAsync` startup scheduling and added concurrent service start/stop controls; .NET 11 changed failure propagation from host run/stop tasks. [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers) [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

## How this group fits the mental model

The host owns process-level start/stop and invokes every registered hosted service. Lifecycle callbacks are ordered phases, not a durable job queue. Keep startup bounded, propagate shutdown cancellation, and treat a worker crash according to an explicit host/process policy. Sequential ordering is the default; concurrent service lifecycle is an option that removes ordering assumptions. [Host lifecycle](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)

## Supplied names explained

### Hosted service and host lifecycle APIs

| Supplied name | Meaning and use |
|---|---|
| `IHostedService` | Host-managed service contract with startup and shutdown hooks. Its implementation is started once for that host instance. |
| `IHostedService.StartAsync` | Called as the host starts services. Keep it short because sequential startup waits for it; use it only for bounded initialization needed before later startup proceeds. |
| `IHostedService.StopAsync` | Called during graceful host shutdown with a token that bounds the shutdown wait. Stop accepting work and complete/cancel in-flight work according to policy. |
| `IHostedLifecycleService` | Extends hosted-service lifecycle with callbacks before/after ordinary start and stop stages. Useful when precise host phases matter. |
| `IHostedLifecycleService.StartingAsync` | Runs before ordinary `StartAsync` callbacks in the lifecycle. Keep dependencies/order explicit. |
| `IHostedLifecycleService.StartedAsync` | Runs after services have completed startup and the host is started; it is not an HTTP readiness guarantee by itself. |
| `IHostedLifecycleService.StoppingAsync` | Runs before ordinary `StopAsync` callbacks during shutdown. Stop admission/production here only if that ordering is required. |
| `IHostedLifecycleService.StoppedAsync` | Runs after ordinary stop callbacks complete. Do not rely on it for durable cleanup if shutdown can be forced. |
| `IHost.StartAsync` | Starts the host and its hosted services. Pass cancellation to bound startup. |
| `IHost.StopAsync` | Requests host shutdown and waits for graceful stopping within configured/caller cancellation limits. |
| `IHost.RunAsync` | Starts the host, waits for shutdown, and stops it. In .NET 11 it propagates an unhandled background-service failure when `StopHost` behavior is active. |
| `IHost.WaitForShutdownAsync` | Waits for an application shutdown signal and then coordinates stopping. It does not itself create durable worker semantics. |
| `IHostApplicationLifetime` | Provides application start/stopping/stopped notifications and a method to request host shutdown. |
| `IHostApplicationLifetime.ApplicationStarted` | Cancellation token notified after the host has started. Use for observation/readiness coordination, not long blocking initialization. |
| `IHostApplicationLifetime.ApplicationStopping` | Cancellation token signaled when host shutdown begins. Stop accepting work and propagate it into operations. |
| `IHostApplicationLifetime.ApplicationStopped` | Cancellation token signaled after host shutdown completes. Cleanup should generally be performed earlier and bounded. |
| `IHostApplicationLifetime.StopApplication` | Requests graceful application shutdown; it does not terminate the process immediately. |
| `IHostLifetime` | Integrates host start/stop with an environment-specific lifetime such as console, Windows Service, or systemd. |

### Registration and host options

| Supplied name | Meaning and use |
|---|---|
| `IServiceCollection.AddHostedService<TService>` | Registers a hosted service type for host-managed startup/shutdown. It is not a per-request activation. |
| `IServiceCollection.AddHostedService(Func<IServiceProvider,TService>)` | Factory registration overload for hosted service creation from the container. Check target package overloads and avoid registering the same worker multiple times accidentally. |
| `IServiceCollection.Configure<HostOptions>` | Configures host-wide service lifecycle and timeout behavior through options. |
| `HostOptions` | Holds host startup/shutdown timeouts, service concurrency flags, and background-service exception behavior. |
| `HostOptions.StartupTimeout` | Bounds host startup. It should align with platform startup/readiness limits. |
| `HostOptions.ShutdownTimeout` | Bounds graceful host shutdown waiting. A container orchestrator can impose a separate, shorter termination grace period. |
| `HostOptions.ServicesStartConcurrently` | Allows hosted services to start concurrently. Default behavior is sequential; enabling concurrency means registration order no longer provides a dependency sequence. |
| `HostOptions.ServicesStopConcurrently` | Allows hosted services to stop concurrently. Default behavior is sequential/reverse registration; concurrent stop requires independent shutdown logic. |
| `HostOptions.BackgroundServiceExceptionBehavior` | Chooses host response to an unhandled `BackgroundService` exception. It does not supply restart/retry logic. |
| `BackgroundServiceExceptionBehavior.StopHost` | Stops the host when a background worker throws unhandled; in .NET 11 the awaited host run/stop task also fails. |
| `BackgroundServiceExceptionBehavior.Ignore` | Leaves the host running after a worker failure. The faulted worker is not restarted automatically, so monitor and recover explicitly. |

### Ordering, cancellation, and operational changes

| Supplied name | Meaning and use |
|---|---|
| `Hosted service registration order` | Determines default sequential start order and reverse sequential stop order. Avoid hidden ordering dependencies where possible. |
| `Sequential hosted-service startup` | Starts services one at a time and waits for each start operation before the next. It can lengthen startup but preserves the documented order. |
| `Concurrent hosted-service startup` | Starts services without waiting for each previous service to finish. Introduced as an option in .NET 10; use only if dependencies are safe without sequencing. |
| `Reverse registration order during sequential shutdown` | Sequential stop generally proceeds opposite registration order, allowing later-registered dependents to stop first. Verify required ordering for the chosen host/framework. |
| `Concurrent hosted-service shutdown` | Allows stop operations to overlap. This can reduce shutdown time but removes reverse-order completion assumptions. |
| `IHostedLifecycleService callback order` | Lifecycle callbacks wrap the ordinary start/stop phases: starting before service starts, started after; stopping before stop callbacks, stopped after. Exact ordering across services follows configured sequential/concurrent host options. |
| `Host startup and shutdown cancellation tokens` | Tokens bound start/stop operations. Observe them and avoid blocking work that cannot be cancelled before the host/platform deadline. |
| `HostOptions timeout versus application-specific operation timeout` | Host timeout bounds process lifecycle waiting; a job's own timeout bounds one business operation. Set each intentionally and ensure operation time fits the available shutdown budget. |
| `Generic Host versus WebApplication hosted-service lifecycle` | Both use Generic Host lifecycle for registered hosted services. `WebApplication` adds web server/pipeline concerns; do not assume a worker is tied to an HTTP request. |
| `IHostApplicationLifetime callbacks versus hosted lifecycle callbacks` | Lifetime tokens notify broad application state; `IHostedLifecycleService` methods participate in ordered service startup/shutdown phases. Choose the one matching the needed coordination. |
| `BackgroundService unhandled exception policy` | `HostOptions.BackgroundServiceExceptionBehavior` determines whether an unhandled worker exception stops the host or is ignored. Logging alone does not restart work. |
| `BackgroundService failure and host exit code` | With `StopHost`, .NET 11 propagates worker failure from `RunAsync`/related tasks so process hosts can exit unsuccessfully. Ensure top-level hosting code does not swallow that exception inadvertently. |

## Cross-item comparison

| Concern | `IHostApplicationLifetime` | `IHostedLifecycleService` |
|---|---|---|
| Scope | Application-wide notification tokens and stop request | Per-service ordered lifecycle phases |
| Good use | Observe started/stopping/stopped; request host shutdown | Run bounded work at a specific service lifecycle phase |
| Does not provide | A callback ordering contract among arbitrary services | Durable job execution or readiness semantics by itself |

Sequential startup/shutdown preserves ordering but can lengthen total time. Concurrent lifecycle can reduce elapsed time while exposing races and hidden dependencies. `BackgroundServiceExceptionBehavior.Ignore` preserves host availability but requires explicit detection/recovery of the failed task; `StopHost` lets process supervision restart the application but may interrupt other local work.

## Examples

### Configure explicit host behavior

```csharp
builder.Services.Configure<HostOptions>(options =>
{
    options.StartupTimeout = TimeSpan.FromSeconds(30);
    options.ShutdownTimeout = TimeSpan.FromSeconds(25);
    options.ServicesStartConcurrently = false;
    options.ServicesStopConcurrently = false;
    options.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.StopHost;
});
```

These durations are examples, not recommended universal values. Ensure container/orchestrator termination grace exceeds the application's graceful shutdown budget with margin for process exit. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

### Request a graceful stop

```csharp
public sealed class FatalWorkerMonitor(IHostApplicationLifetime lifetime)
{
    public void OnUnrecoverableState(string reason)
    {
        // Record the reason before requesting shutdown.
        lifetime.StopApplication();
    }
}
```

`StopApplication` requests lifecycle shutdown; it does not synchronously terminate the process. The host then invokes its stop path, and background work must observe its stopping token.

## Common mistakes

- Performing a long network/database bootstrap inside sequential `StartAsync` and delaying the whole application.
- Assuming `ApplicationStarted` means every external dependency is healthy or the service is ready to receive all work.
- Enabling concurrent service start while one service implicitly depends on another's initialization.
- Assuming reverse stop order applies when concurrent stop is enabled.
- Treating `ShutdownTimeout` as protection from a shorter container termination grace period.
- Swallowing .NET 11's propagated failure at the top-level `RunAsync` call and unintentionally returning success.
- Setting `BackgroundServiceExceptionBehavior.Ignore` and assuming the worker restarts.
- Registering the same hosted service more than once through direct and factory registrations.
- Putting per-work-item scopes around the entire hosted-service lifetime.
- Using lifecycle callbacks as a durable scheduler or exact-once guarantee.

## Knowledge checks with answers

1. **What does the host start by default?** Registered hosted services sequentially in registration order; stop is sequential in reverse order unless concurrency options change this.
2. **When is concurrent start appropriate?** When services are independent or coordinate safely without registration-order initialization.
3. **What does `StopApplication` do?** Requests graceful shutdown through the host; the worker must still stop cooperatively.
4. **What changed in .NET 10?** `BackgroundService.ExecuteAsync` runs fully on a background thread; its synchronous prefix no longer blocks other services from starting.
5. **What changed in .NET 11 for `StopHost` worker failures?** Awaited `RunAsync`, `StopAsync`, and shutdown-wait tasks propagate the failure, typically yielding nonzero process exit.
6. **Does `Ignore` recover a faulted worker?** No; it leaves the host up but requires explicit recovery or monitoring.

## Sources

- [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [HostOptions API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.hostoptions)
- [IHostedLifecycleService API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice)
- [BackgroundService startup change in .NET 10](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)
- [BackgroundService failure propagation in .NET 11](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

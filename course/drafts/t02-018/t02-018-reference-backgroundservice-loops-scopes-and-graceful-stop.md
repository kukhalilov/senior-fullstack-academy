# hosted services background tasks and scheduling — Reference: BackgroundService ExecuteAsync periodic loops cancellation scopes and shutdown

## Scope and version

This reference covers the supplied `BackgroundService`, DI-scope, timer, cancellation, and shutdown names. It reflects .NET 11 GA; note the .NET 10 change that moved the entire `ExecuteAsync` body to background execution. The hosting APIs are stable concepts, but verify overloads against the target package. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services) [.NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)

## How this group fits the mental model

`BackgroundService` represents a process-long asynchronous operation. Its stopping token defines the request to cease; one DI scope defines the lifetime of scoped dependencies for a work item; timer waits and I/O should observe that token. Keep startup synchronous work out of `ExecuteAsync` when it must gate other services on .NET 10+, and ensure in-flight work can finish within both host and orchestrator shutdown budgets.

## Supplied names explained

### Worker base class and its lifecycle

| Supplied name | Meaning and use |
|---|---|
| `BackgroundService` | Base class implementing `IHostedService` for long-running work. Register it once with the host and keep per-item state local. |
| `BackgroundService.ExecuteAsync` | Override returning the task for the worker's full lifetime. Await the loop and propagate shutdown cancellation; don't start detached fire-and-forget tasks that the host cannot observe. |
| `BackgroundService.StartAsync` | Base startup method starts `ExecuteAsync`; override only when a bounded synchronous startup phase is truly required, and call the base implementation appropriately. |
| `BackgroundService.StopAsync` | Signals cancellation and waits for the worker task subject to the stop token/host deadline. Do not block indefinitely or swallow failure without observability. |
| `BackgroundService.Dispose` | Releases base resources. Dispose worker-owned resources too; do not rely on `StopAsync` always running after a forced process termination. |
| `ExecuteAsync task represents full worker lifetime` | The returned task should remain active for the running loop and complete only when stopping or when a fatal failure occurs. |
| `Long synchronous work in ExecuteAsync` | In .NET 10+, it runs on a background thread and does not block other service startup, but still delays this worker's own loop/cancellation. Keep it bounded and asynchronous where possible. |
| `StartAsync should be short-running` | Host startup waits for service start callbacks; long I/O here delays readiness/start of other services, especially under sequential startup. |
| `BackgroundService ExecuteAsync behavior before .NET 10` | Before .NET 10, the synchronous prefix before the first incomplete await could block subsequent hosted-service startup. |
| `BackgroundService ExecuteAsync runs on background thread starting .NET 10` | Starting in .NET 10, the full override is scheduled in the background; do not use its synchronous prefix as a startup barrier. |
| `Override StartAsync for synchronous startup work before .NET 10 behavior changes` | For a bounded prerequisite that must block startup, override `StartAsync` before calling base, or use lifecycle callbacks; document this behavior because it ties up host startup. |
| `Use IHostedLifecycleService for precise startup and shutdown phases` | Use lifecycle callbacks when work belongs at a defined host phase rather than relying on incidental `ExecuteAsync` scheduling. |
| `BackgroundService StartAndStopAsync testing helper` | Framework extension that starts and immediately stops an `IHostedService`, useful for focused lifecycle tests; it does not replace testing the running loop/cancellation behavior. |
| `Hosted service readiness health check coordination` | Readiness should reflect whether required startup has completed. Expose/coordinate a readiness signal rather than assuming service registration means work is ready. |
| `Avoid blocking startup while performing remote initialization` | Remote calls can hang or fail and block all app startup. Use bounded async initialization, explicit readiness, and an appropriate retry/fail-fast policy. |

### DI scopes and dependencies

| Supplied name | Meaning and use |
|---|---|
| `IServiceScopeFactory.CreateScope` | Creates a synchronous DI scope for bounded resolution of scoped services. |
| `IServiceScopeFactory.CreateAsyncScope` | Creates an async-disposable scope; prefer when resolved services may implement `IAsyncDisposable`. |
| `IServiceScope.ServiceProvider` | Resolves scoped services inside the created scope. Resolve and use them before disposing that scope. |
| `AsyncServiceScope.DisposeAsync` | Asynchronously disposes the scope and its contained services. Use `await using` to dispose on success, cancellation, or exception. |
| `IServiceProvider.CreateAsyncScope` | Extension that creates an `AsyncServiceScope` from a provider; convenient within a worker. |
| `IServiceProvider.GetRequiredService<T>` | Resolves a required service or throws if not registered. Call through the per-work-item scoped provider for scoped dependencies. |
| `Scoped dependency resolution in a background service` | A worker is a singleton-like hosted service; create a scope for each operation/iteration that needs `DbContext` or other scoped services. |
| `Create one DI scope per queued work item` | Binds service state and disposal to one item, preventing a database context or request-specific state from leaking across items. |
| `BackgroundService registered as singleton` | The host owns one worker instance for that host. Don't place mutable per-item state in singleton fields without synchronization and explicit reset. |
| `Do not inject scoped dependencies directly into a hosted singleton` | Direct constructor injection can capture a scoped service for the worker's entire lifetime and violate intended scope/disposal semantics. Inject `IServiceScopeFactory` instead. |

### Timers, cancellation, and graceful stop

| Supplied name | Meaning and use |
|---|---|
| `PeriodicTimer` | Async timer designed for one consumer waiting on ticks. It coalesces missed ticks rather than accumulating an unbounded number of callbacks. |
| `PeriodicTimer.WaitForNextTickAsync` | Waits asynchronously for a tick or cancellation; returns false when the timer is stopped. The single-consumer contract matters. |
| `PeriodicTimer.Dispose` | Stops the timer and completes a pending wait. Dispose it when the loop ends. |
| `Task.Delay with CancellationToken` | Simple cancellable pause, often used for fixed-delay polling. Each next wait begins after current work completes. |
| `CancellationToken.ThrowIfCancellationRequested` | Throws `OperationCanceledException` when cancellation was requested; useful at explicit boundaries in CPU-bound work. |
| `CancellationToken cooperative cancellation` | Signals intent; operations must observe the token. It cannot forcibly stop arbitrary blocking code or roll back a remote side effect. |
| `CancellationTokenSource.CreateLinkedTokenSource` | Combines cancellation sources, such as host shutdown and a per-item deadline. Dispose the linked source after its operation. |
| `CancellationTokenSource.CancelAfter` | Requests cancellation after a duration. It bounds local work only if that work observes the linked token. |
| `CancellationToken.None versus host stopping token` | `None` ignores host shutdown and can keep work alive until forced termination. Prefer the stopping token or a deliberate linked deadline for worker operations. |
| `Graceful shutdown and bounded in-flight work draining` | Stop accepting new work, then finish or cancel current work within a finite budget. Unbounded drain conflicts with a finite host/container shutdown deadline. |
| `StopAsync cancellation and forced shutdown deadline` | The stop token indicates the graceful-stop window has expired. At that point work may be abandoned by process termination; design recovery/idempotency accordingly. |
| `BackgroundService exception observation and logging` | Await work so faults reach the host, classify item versus worker failures, and log with stable identifiers. A catch-all that continues must still expose failure and recovery behavior. |

## Cross-item comparison

| Pattern | Cadence/overlap | Use when |
|---|---|---|
| `PeriodicTimer` loop | One consumer; waits for ticks; slow work does not create parallel callbacks | Simple periodic operation with no need to catch up every missed tick |
| `Task.Delay` loop | Fixed delay begins after work finishes | Polling where interval-after-completion is acceptable |
| Fixed-rate scheduler | Calendar or wall-clock alignment and missed-run policy required | Use a separate scheduler when timing must persist or coordinate across replicas |

Synchronous `CreateScope` is enough when all services dispose synchronously; `CreateAsyncScope` handles async disposal. A scope per worker lifetime is not a per-item scope. The linked cancellation source combines signals; it does not make uncancellable operations cancellable.

## Examples

### Scoped periodic processor

```csharp
public sealed class CleanupWorker(
    IServiceScopeFactory scopeFactory,
    ILogger<CleanupWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var processor = scope.ServiceProvider.GetRequiredService<ICleanupProcessor>();
                await processor.RunOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Cleanup iteration failed");
                // Decide whether to continue next tick or fail the worker.
            }
        }
    }
}
```

The cancellation catch is limited to host shutdown. If `RunOnceAsync` uses an internal timeout, handle it separately from the host stopping signal. The example deliberately logs and continues for this job; another worker may need to fail fast or persist a retry record. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

### Work item deadline linked to shutdown

```csharp
using var itemDeadline = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);
itemDeadline.CancelAfter(TimeSpan.FromSeconds(20));
await processor.ProcessAsync(item, itemDeadline.Token);
```

This gives one item a local deadline while still observing host shutdown. If cancellation occurs, determine whether the item may already have had side effects; use an idempotent operation or reconciliation path.

## Common mistakes

- Resolving `DbContext` once in the worker constructor and reusing it forever.
- Creating a scope but failing to dispose it after exceptions or cancellation.
- Calling `CancellationToken.None` for database, HTTP, or delay operations in the worker loop.
- Spawning untracked tasks that outlive `ExecuteAsync` and are invisible to host shutdown.
- Assuming cancellation rolls back a remote operation.
- Returning a completed task immediately from `ExecuteAsync` when a persistent loop is intended.
- Catching every exception and continuing in a tight retry loop without backoff, counters, or poison-item policy.
- Assuming `PeriodicTimer` queues every missed tick or runs multiple callbacks concurrently.
- Placing required startup blocking work in the synchronous prefix of `ExecuteAsync` under .NET 10+.
- Disposing the timer/scope only on success instead of with `using`/`await using`.
- Draining indefinitely even though `ShutdownTimeout` and the platform grace period are finite.

## Knowledge checks with answers

1. **What does `ExecuteAsync`'s returned task represent?** The long-running worker's lifetime and faults.
2. **Why scope each item?** It bounds scoped services, state, and disposal to one operation.
3. **When is `PeriodicTimer` a good fit?** A simple single-consumer periodic loop where slow work should not create overlapping iterations.
4. **What changed to startup behavior in .NET 10?** The entire `ExecuteAsync` runs in the background; its synchronous prefix no longer blocks later service starts.
5. **What happens if shutdown expires mid-item?** The host may proceed to forced termination; recover from a possible partial side effect through idempotency/reconciliation.
6. **Why use a linked token source?** To combine host shutdown with a narrower per-item deadline while preserving cancellation from either source.

## Sources

- [Background tasks with hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [BackgroundService API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.backgroundservice)
- [PeriodicTimer API](https://learn.microsoft.com/en-us/dotnet/api/system.threading.periodictimer)
- [IHostedLifecycleService API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice)
- [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)

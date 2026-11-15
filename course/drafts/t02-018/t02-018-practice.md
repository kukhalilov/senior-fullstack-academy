# hosted services background tasks and scheduling — Exercises and worked solutions

## Goals

Practice choosing a hosted-service lifecycle, handling scoped dependencies, propagating cancellation, applying channel backpressure, and deciding whether work must be durable or coordinated across replicas. The exercises emphasize failure and shutdown behavior because worker code often runs without an interactive caller watching it. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services) [Worker services](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)

## Worked example

### Scenario

An ASP.NET Core API accepts invoice-export jobs. The current endpoint places a delegate in an unbounded `Channel<Func<Task>>` and immediately returns 202. A single `BackgroundService` injects `ExportDbContext` directly and processes the delegate. Production has four web replicas. During deployment, one replica exits while jobs are queued.

### Design the work contract

1. **Clarify the promise.** If 202 means “accepted and will eventually be processed,” an in-memory channel is insufficient. Persist the job or publish to a durable broker before returning 202.
2. **Bound capacity.** If a local channel remains as an optimization, give it a capacity and define whether full means wait/reject/drop. For required invoice exports, silent drop modes are inappropriate.
3. **Queue data, not captured request delegates.** Store a small immutable job identifier/payload. Do not capture `HttpContext`, request-scoped objects, `DbContext`, or a large object graph.
4. **Create a scope per job.** Inject `IServiceScopeFactory`, create an async scope for each consumed item, resolve the scoped processor/`DbContext`, and dispose the scope in `await using` even on failure.
5. **Make processing idempotent.** The worker can crash after writing an export but before acknowledging the job. Persist a stable job ID and make duplicate execution return/reconcile the same result.
6. **Set failure and retry policy.** Record attempt count and next attempt time, use bounded backoff, and route terminal/poison jobs to a durable failed state/dead-letter queue. Avoid a hot loop.
7. **Plan shutdown.** Stop accepting new local work, signal cancellation, and drain only work that fits within host and orchestrator deadlines. Unfinished durable jobs remain available for another process; unfinished channel items may be lost.
8. **Coordinate replicas.** Four worker instances are expected. A broker distributes work or an external lease/scheduler coordinates globally; singleton DI registration does not.

The critical distinction is between accepting an item into one process and durably accepting a job for the system. [Hosted-service queue guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

## Exercises

### Exercise 1: find the lifetime errors

Review this pseudocode:

```csharp
public sealed class CleanupWorker(AppDbContext db) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (true)
        {
            await db.DeleteExpiredAsync(CancellationToken.None);
            await Task.Delay(TimeSpan.FromMinutes(1));
        }
    }
}
```

Identify at least four correctness/lifecycle problems and outline a repaired design.

### Exercise 2: choose a channel full mode

For each scenario, choose `Wait`, `DropWrite`, `DropNewest`, or `DropOldest`; explain which item can be lost and whether an in-memory channel is appropriate:

1. Required invoice generation accepted to the customer.
2. Best-effort UI progress snapshots where the newest state matters.
3. Telemetry samples where retaining older queued measurements is more valuable than the current sample.
4. An HTTP request producer should receive backpressure instead of silent loss, but its request deadline is 200 ms.

### Exercise 3: survive deployment

An endpoint writes a message to a bounded channel, returns 202, and the container is terminated five seconds later with 20 items remaining. What can the service promise? What architecture change is needed for durable acceptance? Describe the crash window after processing a durable message but before acknowledging it.

### Exercise 4: host lifecycle ordering

Service A warms a local cache and Service B consumes from it. Startup currently works only because A was registered first. A team enables `ServicesStartConcurrently = true` to reduce startup time. What race is introduced? Give two better designs.

### Exercise 5: .NET version behavior

An engineer places a synchronous database warm-up before the first `await` in `BackgroundService.ExecuteAsync` and expects it to block other hosted services. Explain what happens before .NET 10 and in .NET 10+. Where should a required startup phase live?

### Exercise 6: multiple replicas

A cleanup worker is registered once with `AddHostedService` and the web app has three replicas. The same cleanup runs three times. Why is DI `Singleton` not enough? Name the properties required of a distributed lease if you choose one.

### Exercise 7: exception policy

A `BackgroundService` throws after a database outage. Compare `BackgroundServiceExceptionBehavior.StopHost` and `Ignore`. Explain the .NET 11 change to the task returned from host run/shutdown methods.

### Exercise 8: shutdown budget

The container sends termination and kills the process after 30 seconds. `HostOptions.ShutdownTimeout` is 45 seconds, and an item can take up to 40 seconds. Which settings and item design must change? Include active-work cancellation and accepted queue items.

## Progressive hints

1. Check DI lifetime, loop condition, delay token, operation token, and task observability.
2. Write the victim item down for every drop mode. Required work cannot silently use a lossy policy.
3. A channel buffers memory only. Durable queues still can redeliver after uncertain acknowledgement.
4. Concurrent start removes the registration-order dependency; express readiness or remove the dependency.
5. The startup behavior changed in .NET 10; `StartAsync` and lifecycle callbacks remain appropriate for bounded phase work.
6. Each process has its own singleton. A lease needs atomic acquire/renew/release, expiry, ownership/fencing, and duplicate-safe operations.
7. `Ignore` means keep host running; it does not restart the faulted task. In .NET 11, `StopHost` failures propagate through awaited host tasks.
8. The outer process grace period wins. Shrink work, checkpoint/resume, or make the operation safely restartable.

## Complete solutions

### Solution 1

Problems include: `AppDbContext` is scoped but captured by a long-lived hosted service; `while (true)` ignores shutdown; both the database operation and delay ignore cancellation; a database context is reused forever and may accumulate stale/tracked state; exceptions fault the worker without an explicit policy; and no iteration-level log/metric identifies failures. Inject `IServiceScopeFactory`, use a `PeriodicTimer`/cancellable delay and `stoppingToken`, create an async scope per iteration, resolve an operation-scoped processor, catch only failures that should allow the loop to continue, and log/measure them. If failure is fatal, let it escape under an intentional host policy.

### Solution 2

1. Required invoice generation: none of the in-memory modes provides durability. Persist/publish durably before accepting. If a channel is only a local staging layer, `Wait` can avoid silent drops while the durable enqueue succeeds.
2. Newest UI state matters: `DropOldest` discards the oldest queued snapshot so newer state replaces stale state; document and count drops.
3. Preserve older samples and discard the incoming sample when full: `DropWrite` fits that stated policy. If telemetry completeness is contractual, persist/batch elsewhere instead.
4. `Wait` provides backpressure, but a 200 ms request deadline means the enqueue may be cancelled/rejected. Return an explicit overload response or durably accept before acknowledging; do not hold arbitrary requests indefinitely.

`DropNewest` discards the newest item already buffered to make room for the new write; it differs from dropping the incoming write. Validate the selected channel API semantics and test the intended victim.

### Solution 3

The current promise is only best-effort in-process acceptance; shutdown can discard the 20 buffered items. To promise durable acceptance, persist the job or broker message before returning 202 and return a stable job identifier. With a durable message, a crash after doing the work but before acknowledgement may cause redelivery. Make the operation idempotent or record completion atomically with its side effect where possible; do not claim exactly once from broker acknowledgement alone.

### Solution 4

Concurrent startup can let B consume before A has warmed the cache. Better choices include: remove the hidden dependency by making B wait on an explicit readiness task/state with timeout; or keep sequential startup if the order is a real host dependency. Another option is to combine the coordinated initialization into one service with an explicit lifecycle. Do not rely on DI registration order after enabling concurrency.

### Solution 5

Before .NET 10, the synchronous prefix of `ExecuteAsync` could execute during startup and block subsequent hosted-service starts until the first incomplete await. In .NET 10+, the entire method runs on a background thread, so the prefix no longer acts as a startup barrier. Put short required blocking startup work in `StartAsync` or an appropriate `IHostedLifecycleService` phase, and bound it. Long remote warm-up should generally use explicit readiness rather than blocking all host startup. [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)

### Solution 6

Each replica constructs its own singleton and starts its own hosted service. A distributed lease needs atomic ownership acquisition, renewal/expiry, safe release, a unique owner token, and ideally fencing so an expired former owner cannot continue writing. The job itself should remain idempotent because partitions, lease expiry, or process pauses can still create duplicate work.

### Solution 7

`StopHost` stops the host after an unhandled worker failure and lets a process supervisor restart the process if configured. `Ignore` keeps the host running but does not restart the faulted `ExecuteAsync` task, so monitoring/recovery must detect that the worker is dead. In .NET 11, when `StopHost` is active, awaited `RunAsync`, `StopAsync`, and `WaitForShutdownAsync` tasks propagate the background-service exception instead of completing successfully; top-level code should preserve that failing exit status. [Failure propagation change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

### Solution 8

The container's 30-second deadline is authoritative; a 45-second host timeout cannot force the container to wait longer. Reduce `ShutdownTimeout` below the platform grace period with margin. Keep an item cancellable and/or checkpoint it so it can finish or resume safely within the budget. Stop accepting new work, drain only what can finish in the remaining time, and retain accepted work durably so process termination does not lose it. If one non-interruptible 40-second operation exists, redesign it or extend the external termination grace period consistently.

## Tests and edge cases

- A producer awaiting `WriteAsync` is cancelled when the bounded queue is full: verify the caller receives cancellation and does not mistake it for successful acceptance.
- The host begins stop while the consumer is blocked on `ReadAsync`: verify it exits promptly and does not log normal shutdown as an application error.
- The operation commits, then throws before the queue item is marked complete: verify retry is safe and duplicate effects are prevented.
- `DropOldest` is selected: assert the oldest buffered item is the one lost and that drop telemetry increments.
- Two readers process items of different durations: verify whether completion order matters to the business contract.
- A worker fails under `Ignore`: alert on the faulted worker task; host liveness alone will not reveal lost processing.
- A recurring timer task overruns: decide whether to skip/coalesce a tick, run immediately, or use a scheduler with a persisted misfire policy.
- Three replicas acquire the same job lease during a pause/partition: ensure fencing/ownership checks prevent a stale owner from committing.

## Reflection questions

1. Which accepted work in your application can be lost on process exit, and does the API promise more than the implementation provides?
2. What is your channel full policy and exactly which item does it lose (if any)?
3. Where does each queued work item's DI scope start and end?
4. How does every active operation observe both a job deadline and host shutdown?
5. What makes a retried job idempotent after an uncertain commit/acknowledgement boundary?
6. Do your replicas intentionally all run the worker, or is a distributed owner required?
7. Are container/service-manager and host shutdown timeouts aligned?

## Sources

- [Background tasks with hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Worker services in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)
- [Host failure propagation in .NET 11](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

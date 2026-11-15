# hosted services background tasks and scheduling — Core concepts and how they fit together

## Learning objectives

After this lesson, you can explain host-owned lifecycle and shutdown, implement a cancellable worker loop, create scopes for scoped dependencies, select a bounded queue policy, distinguish in-memory work from durable delivery, and explain current .NET startup/failure behavior.

## Prerequisites

Know asynchronous C#, dependency-injection lifetimes, cancellation tokens, tasks, and basic process/container lifecycle. For queue scenarios, understand that an HTTP acknowledgement and a durable write are different guarantees.

## Core concepts

### Host lifetime is process lifetime

`IHostedService` participates in host startup and shutdown. `BackgroundService` is a base class whose `ExecuteAsync` task represents the worker's lifetime. The host cancels the stopping token during shutdown and waits up to its configured timeout. The worker must propagate cancellation through delays, I/O, and downstream service calls; cancellation is cooperative, not forced rollback. A host shutdown timeout is a bound on graceful waiting, not a guarantee that all work finishes.

Hosted services are registered with the host, typically through `AddHostedService<T>`, and behave as singleton services. They do not receive a fresh ASP.NET request scope for each iteration. If a worker uses a scoped service, create a scope (prefer `CreateAsyncScope` when async disposal may matter) per unit of work, resolve the service within that scope, and dispose it even when processing fails. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

### Startup and shutdown ordering

By default, hosted services start sequentially in registration order and stop sequentially in reverse order. Long synchronous startup delays can hold application startup; keep `StartAsync` short. `IHostedLifecycleService` adds callbacks before/after the ordinary start and stop stages. `IHostApplicationLifetime` exposes application-started/stopping/stopped notifications and a stop request, which are lifecycle notifications rather than substitutes for each service's lifecycle methods.

In .NET 10, all of `BackgroundService.ExecuteAsync` runs on a background thread; synchronous code before the first `await` no longer blocks subsequent services from starting. Startup that must complete before the host continues belongs in `StartAsync` or a suitable lifecycle callback. `ServicesStartConcurrently` and `ServicesStopConcurrently` allow concurrent service work in current host options; enable only when service dependencies and shared resources do not depend on registration order. [Host lifecycle](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers) [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)

### Worker loops, scopes, and time

A loop should have an explicit cadence and shutdown behavior. `PeriodicTimer` is convenient for waiting between ticks without overlapping the same loop body; if work takes longer than the interval, the timer does not make the operation magically parallel. `Task.Delay` with a cancellation token is a simple fixed-delay loop. Fixed-delay means wait after work completes and therefore accumulates processing time; fixed-rate scheduling attempts to align with wall-clock intervals and needs a missed-tick policy. Neither is a persisted cron schedule.

Create the scope around one item, not around the entire lifetime of the singleton worker. This gives each operation fresh scoped state and makes disposal/retry boundaries clear. Limit parallel consumers and downstream concurrency deliberately; otherwise a queue can move overload from producers to the database or remote service.

### Queues and delivery guarantees

`Channel<T>` provides asynchronous in-process producer/consumer coordination. A bounded channel has finite capacity and a full-mode policy. `Wait` applies backpressure to writers; drop modes intentionally discard a new or buffered item. An unbounded channel avoids producer blocking but can consume unbounded memory. `SingleReader` and `SingleWriter` are promises that may enable optimized behavior; set them only if the application actually satisfies them.

An in-memory channel does not survive process termination. If the process stops after accepting an item but before completing it, that item may be lost. A broker or persistent job store adds durable storage and delivery behavior but still requires idempotent consumers: many systems can redeliver after a crash or lost acknowledgement. “Exactly once” is not implied by using a queue or hosted service. [Hosted service queues](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)

### Failures, retries, and process exit

Choose whether a work-item exception should be retried, recorded for later, dropped, or fail the worker. Make failures observable and avoid a tight loop on repeatedly failing work. Retrying can duplicate side effects; use idempotency, transactions/outbox, or deduplication appropriate to the operation. The queue itself does not define the business retry policy.

Current `BackgroundServiceExceptionBehavior` values are `StopHost` and `Ignore`. With `StopHost`, an unhandled exception stops the host. Starting in .NET 11, `RunAsync`, `StopAsync`, and `WaitForShutdownAsync` tasks propagate that worker exception, normally producing a nonzero process exit. `Ignore` means the host does not stop for that exception; it does not restart the failed worker or guarantee future work will be processed. [Host failure .NET 11 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

### Scheduling and deployment boundaries

`PeriodicTimer` or a delayed loop is adequate for simple process-local periodic work. Cron calendars, persisted schedules, misfire handling, distributed locks, and cluster-wide singleton jobs need a scheduler/coordination mechanism. Worker restart policies can recover a crashed process but do not by themselves prevent duplicate scheduled work across replicas. Container termination grace must be at least long enough for the host's graceful stop budget plus surrounding platform needs; if it is shorter, the process can be killed mid-operation.

## Mechanisms and relationships

| Mechanism | Provides | Does not provide |
|---|---|---|
| `BackgroundService` | Host-managed loop and cancellation signal | Durable queue or automatic job retry |
| Async DI scope per item | Isolated scoped dependencies and disposal | Transaction across external services |
| Bounded `Channel<T>` | In-process capacity bound and backpressure/drop policy | Persistence across process restart |
| Broker/job store | Durable or distributed delivery features, depending on product/configuration | Exactly-once side effects without application idempotency |
| `PeriodicTimer` | Simple periodic wait for one loop | Cron semantics, persisted schedule, leader election |
| Shutdown timeout | Bound on host's graceful wait | Forced completion or rollback of remote/database work |

## Worked examples

### Example 1: one scoped database operation per tick

An `ExecuteAsync` loop waits on `PeriodicTimer`, creates an async scope for each tick, resolves a scoped processor, and passes `stoppingToken`. The scope is disposed after the operation. If one tick fails, log the failure with stable identifiers and choose whether the next tick proceeds; do not reuse a potentially invalid scoped `DbContext` forever.

### Example 2: bounded queue for optional notifications

A process has a capacity-limited channel with `Wait` mode. Producers await `WriteAsync`; when the queue is full, backpressure propagates to the producer. If notifications are explicitly best-effort, a drop mode may be acceptable, but count drops and document which item is discarded. If users were promised delivery, persist/enqueue durably before acknowledging.

### Example 3: three replicas and a periodic cleanup

Registering the same hosted worker in three replicas runs it three times. If cleanup is idempotent and partitioned, that may be fine; otherwise use an external lease/scheduler or partition ownership. A local `lock` or singleton service only coordinates threads in one process.

## Misconceptions and edge cases

- **“A hosted service makes background work durable.”** It only ties service lifetime to the process.
- **“Injecting `DbContext` into `BackgroundService` is fine because the worker is long-lived.”** This captures a scoped service in a singleton lifetime; create a scope per item/iteration.
- **“The host token cancels remote work.”** It signals local cancellation; a remote service may already have committed.
- **“`PeriodicTimer` runs overlapping ticks.”** A single loop awaits ticks sequentially; add controlled parallelism only if desired.
- **“A bounded channel with `Wait` never loses work.”** It limits loss while the process is alive; termination can still discard buffered items.
- **“Drop modes are equivalent.”** `DropWrite`, `DropNewest`, and `DropOldest` choose different victims; verify the current channel API's precise full-mode semantics.
- **“`Ignore` restarts a crashed worker.”** It suppresses host shutdown; the service task is still faulted.
- **“Concurrent startup is always faster and safe.”** Dependencies, shared initialization, and ordering may be broken.
- **“A host shutdown timeout guarantees a graceful shutdown.”** It limits waiting; the platform can force termination when its own grace expires.
- **“.NET 10 still blocks other services before the first `await` in `ExecuteAsync`.”** That was prior behavior; .NET 10 schedules the whole method in the background.
- **“One hosted service means one job across the deployment.”** Each process/replica starts its own instance.

## Knowledge checks with answers

1. **Why create a scope inside a background worker?** Hosted workers are singleton-like; a scope provides correctly bounded scoped dependencies per work unit.
2. **What guarantee does a bounded channel add?** A finite in-memory capacity with a selected wait/drop policy, not durability.
3. **When does a three-replica web app run a hosted worker?** Once in each process unless external coordination makes execution singleton/partitioned.
4. **Where put required startup readiness work in .NET 10?** In a bounded `StartAsync` or the appropriate `IHostedLifecycleService` phase, rather than relying on the synchronous prefix of `ExecuteAsync`.
5. **What does `BackgroundServiceExceptionBehavior.Ignore` do?** The host continues instead of stopping on the unhandled failure; it does not recreate the worker task.
6. **How should an accepted job survive process loss?** Persist/publish it durably before acknowledging and make processing idempotent because redelivery can occur.
7. **What does `PeriodicTimer` not solve?** Calendar scheduling, persistence, missed-run handling, and cross-replica coordination.

## Sources

- [Background tasks with hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Worker services in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [BackgroundService .NET 10 behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)
- [BackgroundService failure propagation in .NET 11](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

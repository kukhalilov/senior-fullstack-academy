# hosted services background tasks and scheduling — Big-picture orientation and mental model

## Problem and purpose

Web applications and worker processes often need work that is not tied to one request: consume a queue, poll a remote source, refresh data, or perform periodic maintenance. A hosted service lets the host own that work's startup, cancellation, and shutdown. The host can ask work to stop gracefully, but an in-process service is still part of one process: a crash, redeploy, or forced termination can lose work that exists only in memory. [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services) [Worker services](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)

## Plain-language mental model

Think of the host as a building manager. It opens the building, starts registered services in an agreed order, signals closing, waits for a limited time, and then ends the process. `IHostedService` supplies start/stop hooks; `BackgroundService` is a convenient base for a task that runs until cancellation. A channel is an in-memory tray between producers and consumers. It can provide backpressure, but it is not a warehouse: if the building loses power, queued work in that tray disappears.

A hosted service belongs to application lifetime, not request lifetime. Treat each work item as a small operation with its own dependency-injection scope, cancellation, error handling, idempotency, and telemetry. If delivery must survive restarts, persist it in a broker or job system rather than relying on a hosted service alone.

## How the parts fit together

| Part | Responsibility | Key design question |
|---|---|---|
| Generic Host / `WebApplication` | Owns service registration, lifetime, and shutdown | Which process controls the worker? |
| `IHostedService` | Start and stop hooks | Is this startup work short and bounded? |
| `IHostedLifecycleService` | More precise phases around startup/shutdown | Which phase must complete before another begins? |
| `BackgroundService` | Runs a long-lived `ExecuteAsync` task | Does the loop observe cancellation and finish promptly? |
| DI scope factory | Creates scoped services for one operation | Is each work item isolated from the previous one? |
| `Channel<T>` | Transfers work within one process | What happens when the bounded queue fills or the process exits? |
| Scheduler / broker | Durable scheduling or cross-process delivery | Must work survive restart or coordinate multiple replicas? |

In .NET 10, the full `BackgroundService.ExecuteAsync` method runs on a background thread; the synchronous prefix no longer blocks other hosted services from starting. Use `StartAsync` or `IHostedLifecycleService` when you truly need a startup phase to block. .NET 10 also adds concurrent start/stop options, while defaults remain sequential. In .NET 11, an unhandled worker failure with `StopHost` makes host run/stop tasks fail, normally producing a failing process exit code. [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task) [Host failure .NET 11 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

## Concept map

```text
host starts
  ├─ registered IHostedService / IHostedLifecycleService phases
  ├─ BackgroundService.ExecuteAsync(token)
  │    ├─ periodic poll or channel reader
  │    ├─ create scope per work item
  │    ├─ perform bounded, cancellable, idempotent work
  │    └─ log/measure outcome; retry only by explicit policy
  └─ host receives shutdown
       ├─ stop accepting new work
       ├─ complete/drain or abandon queue by documented policy
       └─ finish before host/container deadline or be terminated
```

## End-to-end walkthrough

Suppose an API accepts report-generation requests and a background worker processes them.

1. The endpoint validates and persists a job record or publishes a durable message before acknowledging acceptance if losing work is unacceptable.
2. For lightweight same-process work, the endpoint can write to a bounded `Channel<T>`. `BoundedChannelFullMode.Wait` makes a full queue apply backpressure; a drop mode deliberately loses an item and is only suitable when that is part of the product contract.
3. A registered `BackgroundService` reads one item at a time. It creates an async DI scope, resolves the scoped processor/`DbContext`, passes the host stopping token, and disposes the scope after the item.
4. The worker records success or failure. It does not silently swallow exceptions without metrics or an explicit retry/dead-letter policy.
5. At shutdown, the host requests cancellation and waits within `HostOptions.ShutdownTimeout`. The worker stops reading, then finishes or cancels current work according to its policy. The container's termination grace period must be long enough for this host-level shutdown.
6. A multi-replica deployment may run one copy of this worker per replica. A local hosted service does not elect a leader or guarantee singleton execution; distributed coordination requires an external lease/lock or scheduler.

## When to use it and tradeoffs

- Use a hosted service for process-lifetime consumers, polling, or maintenance that can be stopped and resumed safely.
- Use a bounded in-memory channel for local producer/consumer coordination when process-loss semantics are acceptable and capacity/backpressure are explicit.
- Use a broker or persistent job system when accepted work must survive restart, be retried across process failure, or be distributed among replicas.
- Use a scheduler when calendar/cron recurrence, misfire handling, persisted job state, or cross-node coordination is required. A `PeriodicTimer` loop is not a cron scheduler.
- Keep startup and shutdown bounded. Long remote initialization in `StartAsync` delays application readiness; unbounded draining can exceed the orchestrator's kill deadline.
- Scope each unit of work. Hosted services are singleton-like and receive no implicit request scope.

## What later lessons cover

The concepts lesson explains host lifecycle, failure handling, worker loops, DI scopes, backpressure, durability, and scheduling boundaries. References enumerate lifecycle and host options; `BackgroundService`, cancellation and scopes; channel APIs and queue semantics; and Worker templates/integrations. Practice covers shutdown, queue pressure, multi-replica execution, and failure recovery. Interview lessons focus on cancellation, durability, host startup changes, and operational semantics.

## Sources

- [Background tasks with hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Worker services in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [BackgroundService behavior in .NET 10](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)
- [Host failure propagation in .NET 11](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

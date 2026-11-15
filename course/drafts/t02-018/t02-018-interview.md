# hosted services background tasks and scheduling — Interview questions and reasoning

## Core questions

1. What are `IHostedService` and `BackgroundService`, and when would you implement the former directly?
2. How do hosted-service start and stop ordering work by default? What changes when concurrent lifecycle options are enabled?
3. Why must a worker create a DI scope to use `DbContext` or another scoped dependency?
4. What does the `ExecuteAsync` task represent, and what should happen when it faults?
5. What changed to `BackgroundService.ExecuteAsync` startup behavior in .NET 10?
6. What changed to worker failure propagation in .NET 11?
7. Compare an unbounded channel, bounded `Wait`, and bounded drop modes.
8. What delivery guarantee does an in-memory `Channel<T>` provide across process termination?
9. Compare `PeriodicTimer`, fixed-delay polling, and an external scheduler.
10. Does `AddHostedService` guarantee one instance across a multi-replica deployment?
11. How do host shutdown timeout and container termination grace period interact?
12. What does `BackgroundServiceExceptionBehavior.Ignore` mean operationally?

## Concise interview answers

1. `IHostedService` provides explicit start/stop callbacks; `BackgroundService` supplies a long-lived `ExecuteAsync` task. Direct implementation fits bounded lifecycle work or a custom task model.
2. Default sequential startup follows registration order; sequential shutdown generally reverses it. Concurrent options remove those ordering guarantees and should only be enabled when dependencies are independent or explicitly coordinated.
3. The hosted worker is a singleton-like process service, while `DbContext` is scoped. A per-item scope bounds state and disposal to one operation.
4. It represents the worker's full lifetime. Await it, observe failures, and choose whether a fault should stop the host or be handled with explicit retry/recovery.
5. In .NET 10 the entire `ExecuteAsync` runs on a background thread, so a synchronous prefix no longer blocks later hosted services from starting. Use `StartAsync`/lifecycle phases for required startup work.
6. Under `StopHost`, .NET 11 makes awaited `RunAsync`, `StopAsync`, and shutdown-wait tasks fail with the worker exception, normally producing a nonzero process exit.
7. Unbounded can grow memory without limit; bounded `Wait` backpressures producers; drop modes preserve writes by deliberately discarding a selected item.
8. None beyond the lifetime of that process. Buffered work can be lost on crash or deployment termination.
9. `PeriodicTimer` and fixed delay support simple in-process loops; fixed delay drifts with work duration. External schedulers can provide persisted calendar schedules/misfire/cluster behavior depending on product and configuration.
10. No. Each replica has its own process-local hosted-service instance.
11. The shorter external kill grace wins. Host stop budget must fit inside it with margin for cleanup/process exit.
12. The host remains running after the exception, but the failed worker task is not automatically restarted; health/telemetry and recovery are necessary.

## Deep follow-up answers

### How would you accept work reliably from an HTTP endpoint?

Define what a success response means. If it promises eventual processing, write a job record or durable message before returning acceptance, and return a stable job identifier. A local channel can provide fast handoff/backpressure but is lost on process failure. Durable queues often redeliver after uncertain acknowledgements, so consumers need idempotency and an explicit retry/dead-letter policy. A transaction/outbox can close a database-plus-message dual-write gap when both sides participate in the design; a plain channel cannot.

### How do you implement safe worker cancellation?

Pass the host stopping token into timer waits, queue reads, database/HTTP operations, and item processing. If an item also has a deadline, link that token with the host token and dispose the linked source. Stop accepting work before drain; decide whether in-flight work finishes, checkpoints, or cancels. Cancellation only signals local operations that observe it and cannot prove a remote side effect was rolled back. Make interrupted work safe to resume or reconcile.

### Why use one scope per work item?

Hosted services are process-lifetime registrations and have no automatic request scope per loop iteration. A `DbContext` or other scoped service injected into the worker can be captured far beyond its intended lifetime and reused across unrelated items. Create and dispose a scope for each item (or bounded batch), resolve the processor from that scope, and keep item state out of singleton fields. This also gives a clear place for transaction boundaries and disposal.

### What exactly changes when service lifecycle is concurrent?

With sequential defaults, registration order can act as startup ordering and reverse order can act as shutdown ordering. Enabling concurrency removes the assumption that one service's startup or stop completes before another's. Services must coordinate readiness explicitly or be independent. Concurrency reduces some wall-clock waiting but introduces races; it is not automatically a performance win if dependencies serialize the same work elsewhere.

### Why is an in-memory channel not “at least once” or “exactly once”?

The queue data lives in process memory, so a process crash can erase accepted but unfinished items. If a durable system redelivers after a consumer crash, side effects may already have committed before acknowledgement; repeated delivery is possible. Exact-once effects require a deduplication/idempotency mechanism or an atomic transaction covering both effect and completion, not just a queue method call.

## Scenario questions

### Scenario 1: slow startup warm-up

A worker performs a remote 90-second download in `StartAsync`. The web server is not available until it returns. What would you change?

**Reasoning:** Long `StartAsync` blocks host startup, especially under sequential order. Move long initialization to an observed background phase with readiness unavailable until complete, or use lifecycle work only if it is truly a bounded startup prerequisite. Apply a timeout/failure policy and avoid presenting the app as ready while dependent work is unavailable.

### Scenario 2: full queue under load

A bounded queue is full while an HTTP endpoint uses `WriteAsync`. Should the endpoint wait?

**Reasoning:** Only if the request's deadline/latency contract allows it and backpressure is desired. Otherwise reject explicitly (for example overload response) or durably persist then return an identifier. Do not silently drop accepted work. Monitor queue depth/age and producer wait duration.

### Scenario 3: recurring work in four replicas

Every replica runs a midnight cleanup that must execute once globally. What do you propose?

**Reasoning:** Use a cluster-aware scheduler or external lease/lock with ownership expiry and fencing. Design the cleanup to be idempotent because lease transitions and process pauses can still cause overlapping attempts. A process-local singleton or static mutex cannot coordinate replicas.

### Scenario 4: worker exception with `Ignore`

The host is healthy according to liveness, but one worker threw and never processed another queue item. What is missing?

**Reasoning:** Liveness only says the process responds; it does not assert each worker task is running. Expose worker health/readiness or a faulted-task metric, alert on stalled queue age, and define supervised restart/recovery. `Ignore` alone leaves the task faulted.

### Scenario 5: deploy with a 20-second stop grace

The app's `ShutdownTimeout` is 60 seconds and it drains a queue to empty. Why will this fail?

**Reasoning:** The orchestrator can kill the process after 20 seconds, before host shutdown expires or the queue empties. Stop admission, drain only bounded in-flight work, persist remaining work, and set host timeout below external grace with margin.

## Tradeoffs and alternatives

- `IHostedService` gives exact lifecycle control; `BackgroundService` reduces boilerplate for a persistent task.
- Sequential startup preserves ordering; concurrent start can reduce startup duration but requires explicit readiness/dependency coordination.
- Bounded `Wait` applies backpressure; drop modes favor producer progress and lose a selected item; durable persistence addresses restart loss but adds infrastructure.
- A channel is suited to local asynchronous coordination; a broker distributes/persists according to its configured delivery contract.
- `PeriodicTimer` is a simple fixed cadence; `Task.Delay` after work is fixed delay; scheduler products handle richer persisted calendars and cluster semantics.
- `StopHost` exposes worker failure to process supervision; `Ignore` preserves host availability but needs worker-level monitoring/restart behavior.

## Common weak answers

- “`AddHostedService` creates a durable background job.” It registers process-lifetime work only.
- “Singleton means one instance in my deployment.” DI singleton is one per service provider/process.
- “A channel write succeeded, so the job cannot be lost.” The channel is in memory and can vanish on exit.
- “The worker can inject `DbContext` because it is long-running.” That captures scoped state in a singleton lifetime.
- “Cancellation guarantees the database or remote service rolled back.” It only signals cooperating local operations.
- “`PeriodicTimer` gives cron semantics.” It does not persist schedules, handle calendar rules, or coordinate replicas.
- “`Ignore` restarts the worker.” It leaves the host up while the worker's task can remain faulted.
- “Concurrent startup just makes everything faster.” It removes ordering guarantees and can introduce races.
- “We drain until empty on shutdown.” A finite external deadline may kill the process first; durable pending work must be recoverable.
- “The process restart policy makes processing exactly once.” Restart can repeat work after a side effect and before acknowledgement.

## Self-check rubric

Score each dimension 0 (incorrect/unsafe), 1 (core idea only), or 2 (mechanism, tradeoff, and failure case are clear):

1. Host lifecycle, order, and concurrency.
2. Scope per work item and scoped-service disposal.
3. .NET 10 startup and .NET 11 failure changes.
4. Cancellation, deadlines, and uncertain remote outcomes.
5. Bounded queue modes, backpressure, and dropped-item semantics.
6. In-memory versus durable delivery and duplicate handling.
7. Timers versus persisted scheduling and replica coordination.
8. Shutdown budget, worker health, and process supervision.

A strong answer scores at least 13/16 and has no zero for durability, scope, or cancellation. Revisit the corresponding references/practice if a zero appears.

## Sources

- [Background tasks with hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Worker services in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [BackgroundService .NET 10 change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/backgroundservice-executeasync-task)
- [BackgroundService failure propagation in .NET 11](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/ihost-runasync-stopasync-throw-backgroundservice-failure)

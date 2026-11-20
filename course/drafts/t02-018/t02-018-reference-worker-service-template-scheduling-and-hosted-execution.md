# hosted services background tasks and scheduling — Reference: Worker SDK templates periodic scheduling deployment and operational constraints

## Scope and version

This lesson covers the supplied Worker Service template, Generic Host builder, basic periodic execution, and operating-system/container integration names. The Worker template uses the Worker SDK and hosting packages; service-manager integrations are separate packages. .NET 11 is the current runtime snapshot in this curriculum. [Worker services](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers) [Windows Service hosting](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.windowsservicelifetimehostbuilderextensions.addwindowsservice) [systemd hosting](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.systemdhostbuilderextensions.addsystemd)

## How this group fits the mental model

The Worker template gives a process a Generic Host and a place to register hosted work. The host's lifetime is still one process instance. A timer loop can perform simple recurring work, but it does not persist a calendar schedule or coordinate replica ownership. The deployment environment signals shutdown and eventually enforces a kill deadline; local host timeout and external grace period must agree.

## Supplied names explained

### Worker template and host construction

| Supplied name | Meaning and use |
|---|---|
| Microsoft.NET.Sdk.Worker | SDK selected by the Worker Service project template. It enables Worker-oriented build defaults; it does not itself implement durable jobs. |
| Worker Service template | Project template for a long-running hosted process with Generic Host, dependency injection, configuration, logging, and a default worker. |
| dotnet new worker | CLI command that creates the Worker Service project from the installed template. Specify framework/target options deliberately and inspect the generated project for the installed SDK/template version. |
| Host.CreateApplicationBuilder | Modern builder API for creating a Generic Host application with default configuration and logging. It is the recommended linear style in current templates. |
| HostApplicationBuilder.Services | `IServiceCollection` for adding hosted services, scoped processors, and other dependencies before build. |
| HostApplicationBuilder.Build | Builds the configured builder into an `IHost` ready to run. Host services are started by the run/start operation, not merely by constructing registrations. |
| IHostedService implementation without BackgroundService | Direct lifecycle implementation for finite startup/stop work or a custom task model. It must manage its own background task and ensure exceptions/cleanup are observed. |
| BackgroundService polling loop versus event-driven channel reader | Polling asks periodically whether work exists; a channel reader waits for producer signals. Polling can add latency/load; a channel remains in-process and non-durable. |
| One-shot Worker must call IHostApplicationLifetime.StopApplication after completion | A `BackgroundService` finishing its `ExecuteAsync` task does not by itself mean the host should exit. A finite Worker should request application shutdown after its one job completes, while still surfacing failures through the normal host policy. |
| One-shot job use Generic Host without Worker template | For a finite command/job that should run once and then exit, build a Generic Host for DI, configuration, and logging, invoke an ordinary runner, then return. A perpetual Worker template is unnecessary unless hosted lifecycle behavior is useful. |
| Worker Service template ServerGarbageCollection disabled by default | The Worker template does not enable server GC by default. Choose workstation/server GC deliberately from the deployment and measured workload; a worker process is not automatically configured for server GC. |

### Scheduling and deployment behavior

| Supplied name | Meaning and use |
|---|---|
| PeriodicTimer versus fixed-delay Task.Delay loop | Both support simple one-loop repetition. `PeriodicTimer` is tick-based; a `Task.Delay` after work completion yields fixed-delay cadence. Choose based on missed-tick/drift behavior. |
| Fixed-delay versus fixed-rate scheduling drift | Fixed-delay adds the processing duration to each interval. Fixed-rate aims at wall-clock intervals and requires a policy for overrun/missed work; neither is a persisted calendar scheduler. |
| Cron scheduling as a separate scheduler concern | Cron expresses calendar recurrence (including timezone/DST and missed-run semantics) that a simple timer loop does not provide. |
| Quartz.NET and Hangfire as external job scheduler examples | Examples of independently versioned scheduler products with persistent scheduling/management features depending on configuration. Their APIs and guarantees are outside this manifest. |
| No durable or exactly-once scheduling guarantee from hosted services | A local service starts with every process and can be interrupted; it cannot persist a schedule or guarantee one global execution across replicas. |
| Worker process graceful shutdown signals | Console/service-manager/container lifetime integration translates process signals into host stopping. Worker code must observe cancellation and bound stop work. |
| Container stop grace period versus HostOptions.ShutdownTimeout | The platform may kill the process before the host's configured timeout. Set the orchestrator grace period to cover host shutdown plus needed cleanup margin. |
| Windows Service integration via Microsoft.Extensions.Hosting.WindowsServices | Adds Windows Service lifetime integration as a separate hosting package. It does not change application work durability or retry guarantees. |
| IServiceCollection.AddWindowsService | Current `HostApplicationBuilder`-style registration that configures Windows Service lifetime and event-log integration when the process is detected as a Windows Service. Requires the Windows Services hosting package. |
| IServiceCollection.AddWindowsService(Action<WindowsServiceLifetimeOptions>) | Configures the same integration with a callback for Windows Service lifetime options, such as service naming. |
| UseWindowsService hosting extension | Earlier `IHostBuilder` extension for Windows Service lifetime integration. Use it when maintaining the callback-based host builder; current application-builder code can use `AddWindowsService`. |
| Linux systemd integration via Microsoft.Extensions.Hosting.Systemd | Adds systemd lifetime/notification integration as a separate package. Configure the systemd unit's stop timeout to match host shutdown needs. |
| IServiceCollection.AddSystemd | Current services-collection registration for systemd lifetime, status notifications, and systemd console logging when the host detects a systemd environment. Requires the systemd hosting package and appropriate unit configuration. |
| UseSystemd hosting extension | Earlier `IHostBuilder` extension for systemd lifetime integration. Use it when maintaining the callback-based host builder; current application-builder code can use `AddSystemd`. |
| Container health and readiness for worker processes | Liveness indicates process responsiveness; readiness should express whether useful work can be accepted/performed. A worker may need health checks even without HTTP endpoints. |
| Worker restart policy versus in-process retry loop | Process supervision restarts a process after exit; it does not replace bounded operation-level retries or prevent duplicate work after a crash. |
| Background worker concurrency and downstream capacity | Parallel workers increase throughput and also raise in-flight load. Set concurrency based on downstream limits and make work ordering/duplicate semantics explicit. |
| Distributed singleton job execution requires external coordination | A singleton registration is singleton only inside one process. Use a lease, scheduler cluster, or other distributed coordination when one global owner is required. |
| Leader election and lease ownership are not provided by BackgroundService | The base class offers no cross-process leadership, lock renewal, fencing, or split-brain protection. Those require a coordination mechanism. |
| Cancellation and idempotency for scheduled work | Shutdown or restart may interrupt a run at an uncertain side-effect boundary. Propagate cancellation and make reruns safe/reconcilable. |
| Worker Service telemetry and health checks integration | Workers can use standard logging, metrics, tracing, and health-check services. Instrument queue age, processed/failure counts, duration, and readiness explicitly. |

## Cross-item comparison

| Option | Trigger model | Persistence / coordination |
|---|---|---|
| Polling loop with `PeriodicTimer` | Wake at an interval and query work source | No persisted schedule; each replica polls unless coordinated |
| Event-driven channel reader | Wait for local producer to enqueue | In-memory only; process-local |
| External scheduler | Calendar/time trigger with product-defined persistence/misfire behavior | Can persist/coordinate depending on product and configuration |
| Worker process restart policy | Runs process again after exit | No operation-level deduplication or exactly-once execution |

Windows Service, systemd, and container hosting integrate process signals; they do not change worker business semantics. Align service manager timeouts, host timeout, and the longest safe work duration.

## Examples

### Minimal Worker registration

```csharp
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<Worker>();

using var host = builder.Build();
await host.RunAsync();
```

The host starts the registered worker and waits for shutdown. The worker still needs cancellation, error handling, and telemetry. `using` ensures host disposal when the run task completes or fails. [Worker services](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)

### Fixed-delay loop

```csharp
protected override async Task ExecuteAsync(CancellationToken stoppingToken)
{
    while (!stoppingToken.IsCancellationRequested)
    {
        await DoOnePassAsync(stoppingToken);
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
    }
}
```

The next delay starts after `DoOnePassAsync` completes, so a one-minute delay plus 20 seconds of work yields roughly 80 seconds between starts. If a missed tick should be skipped/coalesced, consider `PeriodicTimer`; if a calendar time must be honored across restarts, use a scheduler.

### Integrate with Windows Service hosting

```csharp
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddWindowsService(options => options.ServiceName = "Report Worker");
builder.Services.AddHostedService<Worker>();
await builder.Build().RunAsync();
```

This requires the `Microsoft.Extensions.Hosting.WindowsServices` package and targets a supported Windows hosting setup. The host integration handles service lifetime; it does not make queued reports durable. [Windows Service hosting](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.windowsservices.windowsservicelifetimehostbuilderextensions.usewindowsservice)

## Common mistakes

- Assuming the SDK template decides target framework, installed runtime, or deployment model without inspecting the project.
- Treating a worker's singleton registration as one instance across multiple replicas.
- Using a timer loop for a calendar schedule without deciding timezone, missed ticks, or overlap semantics.
- Assuming process restart policy prevents duplicate work after a crash.
- Setting host shutdown timeout longer than the container/service manager's kill grace period.
- Running a long polling loop without cancellation or an explicit interval/backoff.
- Increasing worker parallelism without respecting downstream/database capacity.
- Using local locks for cluster-wide singleton job ownership.
- Assuming health check availability equals worker readiness or queue health.
- Treating a Windows Service/systemd package as durable scheduling or broker functionality.

## Knowledge checks with answers

1. **What does the Worker template provide?** A Generic Host-oriented process scaffold and hosting integration point, not durable job semantics.
2. **How does fixed-delay drift arise?** Each wait begins after work finishes, so elapsed work time is added to the configured delay.
3. **Does process supervision make a scheduled job exactly once?** No; a crash can occur before/after a side effect, and restart can repeat it.
4. **What coordinates a singleton job across three replicas?** External coordination such as a lease/cluster-aware scheduler; a local hosted service is per process.
5. **Which shutdown values need alignment?** The host timeout, container/service-manager termination grace period, and the work's own safe cancellation/drain budget.
6. **When should cron use a separate scheduler?** When calendar recurrence, persisted schedule state, missed-run policy, or distributed ownership matters.

## Sources

- [Worker services in .NET](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)
- [Hosted services](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/host/hosted-services)
- [Generic Host overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host)
- [Garbage collector runtime configuration](https://learn.microsoft.com/en-us/dotnet/core/runtime-config/garbage-collector)
- [Windows Service hosting API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.windowsservices.windowsservicelifetimehostbuilderextensions.usewindowsservice)
- [systemd hosting API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.systemdhostbuilderextensions.addsystemd)
- [Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/workers)

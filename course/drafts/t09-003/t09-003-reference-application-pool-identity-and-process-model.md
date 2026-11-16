# Windows IIS application pools hosting and troubleshooting — Reference: Worker-process isolation, identity, lifecycle, health, and recycling controls

Sources: [IIS application pools](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/), [IIS process model settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/processmodel), [IIS failure settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/failure), and [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0).

## Scope and version

IIS pool configuration is server-level Windows behavior, not tied to a .NET API release. ASP.NET Core 11 is the current GA target in this curriculum (released November 10, 2026). Pool settings discussed here are illustrative; confirm names, defaults, and supported actions against the installed IIS/Windows version before applying a production change.

## How this group fits the mental model

An application pool associates applications with a worker-process lifecycle policy and security identity. WAS starts and monitors `w3wp.exe`; the process token controls filesystem, registry, network, and other Windows access. Pool settings can affect cold start, fault containment, throughput, deployment overlap, and state behavior.

## Supplied names explained

### Pool and identity

- `IIS application pool` — Configuration boundary grouping IIS applications that share a worker-process identity and lifecycle settings. Separate pools improve fault/permission isolation but use more processes and resources.
- `Worker process (w3wp.exe)` — User-mode IIS process executing application-pool work. One pool can have multiple worker processes when configured as a web garden; each has separate memory and process-local cache.
- `ApplicationPoolIdentity` — Built-in virtual identity type assigned per pool. It avoids provisioning a shared local user; grant the pool’s virtual account only required ACL rights.
- `IIS AppPool\<PoolName> identity` — Windows principal name for a pool’s virtual identity, usable in filesystem ACLs (for example `IIS AppPool\ShopPool`). The literal placeholder `<PoolName>` must be replaced with the actual pool name.
- `NetworkService identity` — Built-in low-privilege service account whose network access commonly uses the computer account. It is broader/shared compared with a pool-specific virtual identity.
- `LocalService identity` — Built-in low-privilege local service account with limited local privileges and typically anonymous network credentials. It is not a substitute for a designed domain service identity when authenticated remote access is required.
- `LocalSystem identity` — Highly privileged local account with broad machine access and machine credentials on the network. Avoid for web application pools because application compromise can become machine-level compromise.
- `SpecificUser identity` — Configured account (local or domain) used by the pool. It may be necessary for resource access but requires secret storage, rotation, rights review, and operational ownership.
- `Least-privilege application-pool ACL` — ACL granting the pool identity only needed rights: typically read/execute for published code, and narrowly scoped write/modify on explicit data or log directories. Do not grant broad write access to executable files.

### Runtime, pipeline, and process count

- `Managed runtime version (No Managed Code)` — IIS pool setting controlling the classic ASP.NET CLR loaded by IIS. ASP.NET Core runs under its .NET runtime via ANCM, so selecting “No Managed Code” is normal and does not remove the app’s runtime dependency.
- `Integrated managed pipeline mode` — IIS pipeline mode integrating legacy ASP.NET managed modules with IIS stages. This is independent of ANCM in-process/out-of-process hosting.
- `Classic managed pipeline mode` — Compatibility behavior for legacy ASP.NET apps that expect the older pipeline. It is not a performance toggle for ASP.NET Core.
- `Maximum worker processes` — Pool setting limiting worker processes per pool. One is the usual web-farm instance; greater than one creates multiple workers and their independent memory/state.
- `Web garden` — A pool configuration with multiple worker processes on one server. Requests may reach different process-local caches/sessions; sticky routing is not a safe substitute for shared state and correct concurrency design.
- `NUMA worker process configuration` — IIS option controlling worker process assignment with Non-Uniform Memory Access (NUMA) hardware. Tune only after measuring the actual server topology and workload; wrong assumptions can hurt scheduling/locality.

### Activation, warm-up, and idle behavior

- `Application pool startMode` — Controls whether the pool starts on demand or is prestarted according to IIS configuration. Pool prestart alone does not prove that the application has completed useful initialization.
- `AlwaysRunning start mode` — Requests IIS/WAS to start the pool proactively. Pair it with correct site/application preload and health verification if cold-start avoidance is the goal.
- `OnDemand start mode` — Starts the pool when a request requires it. It saves idle resources but the first request may experience startup latency or expose a startup failure.
- `Application preloadEnabled` — Per-application flag used with IIS Application Initialization and an AlwaysRunning pool to initiate app startup before the first user request. Correct configuration at both levels matters.
- `Application Initialization module` — IIS module that can issue configured initialization requests during startup/recycle. A successful initialization URL should exercise the readiness conditions that matter, not only serve a static response.
- `Idle timeout` — Period without activity after which IIS may take the configured idle action. This can create cold starts in low-traffic services; it is separate from scheduled or memory-triggered recycling.
- `Idle timeout action Terminate` — Ends the idle worker process, releasing resources. The next request must activate and initialize a replacement process.
- `Idle timeout action Suspend` — Suspends the idle process on IIS versions/configurations that support it, reducing some resource use while retaining process state. Verify support and operational consequences on the actual server; it is not a recycle.

### Health and lifecycle limits

- `Worker process ping` — WAS periodically checks whether a worker responds to health pings. A hung process can be considered unhealthy; this is process responsiveness, not an application-specific readiness probe.
- `Ping interval` — Time between health pings. Shorter intervals can detect a nonresponsive worker sooner but should be tuned with response thresholds and workload.
- `Ping response time` — Maximum permitted time for a worker to respond to a ping before IIS treats it as unhealthy. A too-short value can misclassify a severely busy but functioning process.
- `Startup time limit` — Maximum time IIS permits a worker/application to start before startup is treated as failed. Increase only with evidence; also reduce unnecessary work before readiness.
- `Shutdown time limit` — Time granted for worker shutdown/drain before IIS terminates it. It must reflect request/background-work shutdown design; it cannot guarantee completion of unbounded work.
- `Application pool recycling` — Replacing a worker process based on configured triggers. Recycling can release accumulated process resources but can also cause cold start, overlap, or state loss; investigate leaks instead of relying on frequent recycle as a cure.
- `Periodic recycling` — Time/interval-based worker replacement. Avoid synchronized recycle schedules across a fleet, which can cause simultaneous cold capacity loss.
- `Scheduled recycling` — Recycle at configured clock times, often chosen for low-traffic windows. Check time zone, daylight-saving behavior, and deployment overlap.
- `Private-memory recycling threshold` — Recycle trigger based on private bytes attributed to a worker. It is an operational guard, not a memory limit or diagnosis; monitor trends and verify the measured process.
- `Request-count recycling threshold` — Recycle after a configured request count. Request volume does not necessarily correlate with leaks or unhealthy state, so this is rarely a substitute for telemetry.
- `Overlapped recycling` — Starts a replacement worker before shutting down the old one, allowing time to drain requests. Both processes may briefly coexist and consume resources; applications must tolerate overlap and avoid single-process assumptions.

### Failure protection, queues, and process environment

- `Rapid-fail protection` — Disables a pool after repeated worker failures in a time window. It contains a crash loop and protects the server; diagnose the crash cause before restarting repeatedly.
- `rapidFailProtectionInterval` — Time window over which IIS counts worker failures for rapid-fail decisions. The effective unit/format is defined by IIS schema and tooling; inspect the installed configuration schema when changing it.
- `rapidFailProtectionMaxCrashes` — Failure count threshold in the configured rapid-fail interval. Raising it can delay containment and increase restart churn; it does not repair an exception or bad dependency.
- `Application pool disabled state` — Pool state after explicit disablement or protective failure action. Requests may receive 503 until the cause is fixed and the pool is safely restarted.
- `Application pool queueLength` — Maximum number of requests queued for a pool as configured in IIS. A larger queue can increase latency and memory pressure; measure queue wait and app throughput before changing it.
- `503 due to application pool queue overflow` — Response when work cannot be accepted because the destination queue is full or unavailable. Distinguish it from a 503 caused by a disabled/stopped pool using IIS/HTTPERR evidence and pool state.
- `Application pool environmentVariables` — Pool-level environment settings passed to worker processes, supported by applicable IIS versions/configuration. They can affect every app in that pool and may expose secrets if stored or logged carelessly.
- `Enable 32-bit applications` — Pool option allowing a 32-bit worker on 64-bit Windows. Enable only when required dependencies are x86; it affects process architecture and native DLL loading.
- `Worker process bitness` — Whether `w3wp.exe` runs 32-bit or 64-bit. It must be compatible with the application’s native dependencies and hosting components; inspect the process, not only project target settings.

## Cross-item comparison

| Setting | Primary purpose | Typical hidden cost |
|---|---|---|
| AlwaysRunning + preload | Reduce first-request cold start | Idle resource use; initialization still needs a real readiness check |
| Idle timeout | Release inactive workers | Cold start on later traffic |
| Recycling | Replace a process after a trigger | Startup and overlap; process-local state disappears |
| Rapid-fail protection | Contain repeated crashes | Pool becomes unavailable until investigated/restarted |
| Web garden | Multiple worker processes in one pool | Non-shared memory and duplicated resource pressure |
| Queue length | Bound waiting requests | More waiting can worsen tail latency without adding capacity |

## Examples

For a site that reads published files and writes uploaded images, use a dedicated pool with `ApplicationPoolIdentity`. Grant `IIS AppPool\\CatalogPool` read/execute on the release directory and modify rights only on the upload directory. Store secrets in an appropriate secret mechanism rather than a broadly readable `web.config` or pool variable.

If startup takes 20 seconds and low-traffic users see a slow first request, first profile initialization. If prestarting is appropriate, set AlwaysRunning and application preload consistently, configure an initialization URL, and measure when the app is truly ready. Do not simply increase startup time and assert availability.

If the pool disables itself after three crashes, preserve Event Log and crash evidence before restarting. Identify whether the failure is a bad deployment, missing runtime/native library, unhandled startup exception, or resource exhaustion. A larger rapid-fail threshold only prolongs the loop.

## Common mistakes

- Using `LocalSystem` because an ACL issue disappears when permissions are broad.
- Granting modify rights over executable deployment files to the runtime identity.
- Treating application pool ping as a substitute for HTTP readiness checks.
- Enabling a web garden without removing process-local state assumptions.
- Raising queue length to hide a throughput bottleneck, increasing latency instead.
- Scheduling identical recycle times on all production instances.
- Assuming overlapped recycle makes non-idempotent startup jobs safe to run twice.
- Changing 32-bit mode without checking all native dependencies and ANCM architecture.

## Knowledge checks with answers

1. **Why is ApplicationPoolIdentity usually preferable to LocalSystem?** It gives the application a pool-specific virtual principal that can receive narrow permissions instead of exposing the machine to a highly privileged process.
2. **What changes when maximum worker processes is greater than one?** A web garden starts multiple independent workers; process-local state is no longer shared and resources are multiplied.
3. **How do ping and readiness differ?** Ping checks worker responsiveness to WAS; readiness checks whether the application can safely serve the required traffic and dependencies.
4. **Why is a longer queue not a throughput fix?** It permits more requests to wait but does not make the app or dependency process faster, and can worsen memory use and tail latency.
5. **What does rapid-fail protection mean?** Repeated worker failures crossed a threshold and the pool was disabled to contain the crash loop; the root cause is still unresolved.

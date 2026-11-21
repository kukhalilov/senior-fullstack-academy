# Windows IIS application pools hosting and troubleshooting — Interview questions and reasoning

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core startup troubleshooting status mappings](https://learn.microsoft.com/en-us/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-10.0), [IIS process model](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/processmodel), and [IIS failure settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/failure).

## Core questions

1. Trace an HTTPS request through IIS to an ASP.NET Core endpoint.
2. What is the difference between an IIS site, application, virtual directory, and application pool?
3. What does an application pool isolate, and what does it not isolate?
4. Explain `ApplicationPoolIdentity` and how you grant it file access.
5. Compare in-process and out-of-process ASP.NET Core hosting.
6. What does the .NET Hosting Bundle install, and when might it need repair?
7. Explain framework-dependent versus self-contained publish and why both still need ANCM under IIS.
8. What is the relationship between `w3wp.exe`, WAS, HTTP.sys, IIS, and Kestrel?
9. What is the difference between AlwaysRunning/preload, idle timeout, and recycling?
10. What does rapid-fail protection do? How would you respond when it disables a pool?
11. Which logs help distinguish HTTP.sys rejection, IIS routing, ANCM startup, and application exceptions?
12. How should ANCM stdout logging be enabled and disabled safely?
13. How do app-pool architecture and native dependency architecture interact?
14. How do you deploy safely when replacing files in a single IIS instance?
15. Why might a site work in IIS Express and fail in full IIS?

## Concise interview answers

1. The client reaches HTTP.sys at an IP/port; IIS matches the binding to a site, URL path to an application, and application to a pool. WAS starts a worker under its identity. IIS handler mapping invokes ANCM, which hosts in-process via IISHttpServer or starts/forwards to an out-of-process app, usually Kestrel.
2. A site owns bindings and applications; an application defines a URL/configuration/pool boundary; a virtual directory maps a URL path to files without necessarily creating an application boundary; a pool groups applications under process and identity policy.
3. It isolates process lifecycle, identity, and many failures/resources. It does not isolate shared machine kernel, disk, network, database, or resources granted by ACLs. In-process apps in the same pool share one worker process.
4. It is a pool-specific virtual principal such as `IIS AppPool\StorePool`. Grant read/execute on release files and narrow write rights on explicit data/log directories; do not grant broad administrator rights.
5. In-process loads the app inside `w3wp.exe` with `IISHttpServer` and no extra Kestrel hop. Out-of-process starts a child app process, commonly Kestrel, and ANCM forwards requests. Isolation and compatibility differ; verify current runtime and module constraints.
6. It installs ANCM/IIS integration and .NET hosting components needed for the chosen deployment. Repair/reinstall may be necessary if IIS was installed later or module files/registration are damaged; restart IIS as directed.
7. Framework-dependent publish uses a compatible server shared runtime. Self-contained includes runtime files for a RID. Both still need IIS and ANCM, and either may require native OS dependencies and matching architecture.
8. HTTP.sys accepts/queues requests; IIS/WAS selects and activates a site/pool worker; `w3wp.exe` runs IIS and an in-process app or supervises ANCM; out-of-process ANCM forwards to the app server Kestrel.
9. AlwaysRunning starts a pool proactively; preload/Application Initialization requests app startup; idle timeout acts after inactivity; recycle replaces a worker due to time/resource/configuration triggers. Each has different availability and resource effects.
10. It disables a repeatedly crashing pool to contain a failure loop. Preserve Event Log/crash evidence, identify startup/runtime/config/dependency/resource cause, fix it, then restart and verify readiness.
11. HTTPERR for HTTP.sys, IIS access logs/FREB for site pipeline, Windows Application Event Log and temporary stdout for ANCM startup, and application logs/traces for delivered requests. Correlate timestamps and request IDs.
12. Use only as temporary startup diagnostics, grant the pool identity write access to a dedicated protected directory, reproduce and collect the evidence, then disable it and remove/rotate files. It does not rotate automatically.
13. The actual worker/process bitness must load all native dependencies. A 32-bit worker cannot load a 64-bit native DLL; align worker and publish architecture or republish compatible dependencies.
14. Back up/version the artifact, request shutdown with `app_offline.htm`, publish and verify complete files/configuration/ACLs, remove the file, wait for a dependency-aware readiness check, and restore traffic. It has downtime and is not an atomic release.
15. IIS Express has different installation, identity, bindings, and local developer context. Full IIS uses the configured pool token, server ANCM/runtime, published `web.config`, ACLs, and real binding.

## Deep follow-up answers

### How do you locate the failure layer under time pressure?

I record exact status/substatus, UTC timestamp, host/path, request or correlation ID, release revision, and pool/hosting model. I check whether the request reached IIS logs. If not, inspect DNS/network/TLS, bindings and HTTPERR. If IIS received it, determine whether ANCM failed to load/start/forward; inspect Event Log, module/runtime/architecture, and only temporarily enable stdout. If the application handled it, follow the request into application traces and dependency telemetry. I make one evidence-driven change at a time and preserve before/after evidence.

### What is the tradeoff in-process versus out-of-process?

In-process avoids an extra process and forwarding hop and uses IISHttpServer, but application code shares the worker process’s memory, lifetime, and failure boundary. Out-of-process retains Kestrel as the app server and a separate process boundary, but introduces a local proxy hop, another process to supervise, and forwarding/timeout configuration. Performance alone does not choose correctly: compatibility, isolation, diagnostics, process architecture, and operational requirements matter.

### How do you approach an ANCM 500.30 or 500.31?

I treat the status as a clue, not a root-cause diagnosis. For 500.30 I inspect in-process startup events, deployed configuration, runtime/framework, app startup exceptions, native dependencies, and pool ACLs. For 500.31 I inspect the detailed message, required native/framework dependencies, publish output, architecture, and installed runtime. The cited Microsoft troubleshooting mapping is still the ASP.NET Core 10 edition even though this course targets .NET 11; I verify installed ANCM version and current target-version documentation rather than assuming every code mapping is unchanged.

### How should an application-pool identity be designed?

Use a per-pool identity where practical. Grant only file and resource permissions needed to run: read/execute binaries, narrowly scoped writes, and explicit network resource credentials where required. Do not run as LocalSystem to bypass an ACL error. Keep secrets out of command lines and logs, limit who can modify pool/configuration settings, and audit identity permissions during deployment.

### What makes recycling safe?

Workers should stop accepting new work, drain in-flight requests within bounded time, and stop background work cooperatively. Overlapped recycle means old and new workers may run simultaneously, so startup jobs must be idempotent and shared state must not assume one process. Readiness should be checked before traffic goes to a replacement. Stagger recycles across instances; investigate leaks and startup time rather than relying on a short recycle interval.

## Scenario questions

1. **You receive HTTP 503 after a deployment.** The pool is disabled and Event Log shows repeated startup crashes. What do you preserve, and what sequence do you follow before enabling it again?
2. **Users see a first-request delay each morning.** How do you determine whether idle timeout, initialization, deployment, or a dependency causes it? What would you measure before AlwaysRunning/preload?
3. **A new app fails only on one server with 500.32.** Its project builds for AnyCPU, but it uses a native image library. What evidence and checks distinguish app architecture from worker architecture?
4. **A deployment intermittently serves both old and new behavior.** How could overlapped recycling explain this, and what assumptions should be removed?
5. **The upload code gets access denied.** Why is running as LocalSystem a poor fix? Describe a verifiable least-privilege change.
6. **A team proposes doubling `queueLength` during a database incident.** What latency/availability risks would you discuss, and how would you bound overload?
7. **Stdout logs solved the incident but grew to many gigabytes.** What process change prevents recurrence, and what retention/secret handling applies to existing logs?
8. **The same app works in IIS Express but not after production publish.** What artifact and server differences do you inspect in order?

## Tradeoffs and alternatives

- **Separate pools vs shared pool:** separate pools improve identity, recycle, and fault boundaries but consume more memory/process capacity and complicate management.
- **In-process vs out-of-process:** lower hop/cost versus process separation and Kestrel; select from measured and compatibility requirements.
- **Always-running vs on-demand:** lower cold-start latency versus idle cost; pair preloading with meaningful readiness.
- **Recycle thresholds vs diagnosis:** guard against stuck/leaking workers while preserving evidence and fixing the underlying issue.
- **Single-server file replacement vs multi-instance deployment:** operational simplicity with planned downtime versus more infrastructure and a safer traffic switch. Data migrations still need compatibility planning.
- **Longer queue vs backpressure:** tolerate brief bursts only when deadlines allow; otherwise fast rejection/load shedding can protect system recovery.

## Common weak answers

- “IIS hosts the app, so I would restart IIS” without tracing which layer failed.
- “No Managed Code means .NET is not installed.”
- “Self-contained means no IIS components are needed.”
- “500 means an app bug” or “503 means the server is down” without status/substatus and logs.
- “Give the pool administrator rights” instead of fixing the precise ACL/resource permission.
- “Increase queue size to handle load” without measuring latency and downstream capacity.
- “Recycling is seamless” without discussing cold starts, overlapping workers, state, and drain.
- “IIS Express is the same as production IIS.”
- “Leave stdout logging enabled so the next incident is easier.”

## Self-check rubric

For each answer, score yourself 0–2: **0** names a setting without explaining it; **1** explains the main behavior; **2** traces the process/request boundary, states a tradeoff, names evidence or a validation step, and avoids unsupported assumptions. A strong troubleshooting answer identifies the last successful boundary, preserves evidence, tests a narrow fix, and verifies readiness. A strong architecture answer addresses identity, process model, artifact/runtime, and deployment overlap—not only HTTP performance.

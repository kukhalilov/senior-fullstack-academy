# Windows IIS application pools hosting and troubleshooting — Exercises and worked solutions

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core startup troubleshooting status mappings](https://learn.microsoft.com/en-us/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-10.0), [IIS process model](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/processmodel), and [IIS failure settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/failure).

## Goals

Practice tracing the request path, separating IIS/ANCM/application failures, reasoning about identities and architecture, and planning a deployment that includes readiness and rollback. The error-code mappings below are from the latest published Microsoft troubleshooting page, currently the ASP.NET Core 10 edition; verify against installed ANCM and the target-version documentation.

## Worked example

**Scenario:** A newly published framework-dependent ASP.NET Core app returns HTTP 500.31 on full IIS. It works in IIS Express on a developer laptop. The site access log confirms requests arrive; the application pool is running; the Application Event Log identifies a missing `Microsoft.AspNetCore.App` framework version. The server has an older shared runtime. The app is deployed as out-of-process, and the pool identity has read access to the release directory.

**Reasoning:** Routing reaches the intended app and ANCM. 500.31 is the latest documented “failed to find native dependencies” startup category, and the event details make a missing shared framework the evidence-backed cause here. IIS Express uses a different machine/runtime context and does not prove server runtime availability. Check `dotnet --list-runtimes` on the server and inspect `.runtimeconfig.json` to see requested frameworks. The immediate choices are to install a supported runtime/Hosting Bundle compatible with the app, or deliberately republish self-contained for the server RID while retaining ANCM and native prerequisites. Then verify startup and readiness. Do not change pool identity or add broad ACLs because the evidence does not indicate an access-denied failure.

## Exercises

1. **Binding or app?** A client receives connection refused. No IIS access-log entry exists, and HTTPERR has no matching line. List the first five checks, in order, before changing app code.
2. **Pool identity:** The app returns 500 when writing `/var/app/uploads`—on Windows IIS the equivalent physical directory is `D:\sites\catalog\uploads`. It succeeds when the pool is temporarily set to LocalSystem. Propose a secure fix and two checks that prove it works.
3. **Architecture mismatch:** A self-contained app returns 500.32 after publish. The pool has 32-bit applications enabled, while the artifact’s native dependency is x64. Identify the mismatch and give two valid remediation paths.
4. **Queue saturation:** During a downstream database outage, clients begin receiving 503. The pool remains started, CPU is low, queue depth rises, and database calls time out. Should queueLength be increased? Explain a bounded response plan.
5. **In-process isolation:** Two IIS child applications share one pool. One is in-process and one is out-of-process; the error page reports 500.34. Explain why this is not repaired by changing the CLR pool setting, and propose the configuration change.
6. **Temporary logging:** ANCM startup fails and Event Log lacks useful app output. Describe a safe diagnostic sequence for stdout logging, including the ACL and cleanup requirements.
7. **Safe deployment:** A single IIS server must replace files with brief planned downtime. Design the deployment sequence using `app_offline.htm`; state what it does not guarantee and how readiness is checked.
8. **Recycle incident:** A scheduled recycle caused a slow first request and a short 503 window. Give three configuration/architecture checks before disabling all recycling.
9. **Observability:** A 500 appears in the IIS log. Provide a minimal evidence record and a decision tree for determining whether to inspect HTTP.sys, ANCM, or application telemetry next.
10. **Cold-start mitigation:** A low-traffic app has 25-second initialization. Compare on-demand activation with AlwaysRunning plus preload, and specify a meaningful warm-up/readiness endpoint.

## Progressive hints

1. Work from network listener toward app; identify whether HTTP.sys registered the endpoint and whether the binding is exact.
2. The runtime token, not the administrator’s token, performs writes. Apply a directory-specific Modify ACL to the pool virtual identity.
3. The actual worker bitness must match native binaries. Either align the pool to x64 or republish all relevant native dependencies for x86.
4. More waiting is not more throughput. Protect the dependency, shed load or reject promptly, and restore capacity when it recovers.
5. The conflict is worker-process hosting model coexistence; separate the applications into pools.
6. Enable only long enough to reproduce startup, make the target directory writable only to the pool identity, collect logs, disable, and remove sensitive files.
7. `app_offline.htm` requests shutdown for file replacement, but it is not an atomic traffic switch or blue-green strategy.
8. Inspect overlap, warm-up, readiness, pool queues, dependency latency, recycle synchronization, and resource pressure.
9. Record timestamp with time zone, site/path, deployment revision, status/substatus, request/correlation ID, and relevant pool/ANCM state.
10. Preload needs both pool/application coordination and a request that exercises required startup dependencies; do not route traffic until readiness passes.

## Complete solutions

1. Verify the destination IP and port are reachable/listening; confirm firewall and TLS if applicable; confirm HTTP.sys URL/port registration and HTTPERR; compare the request host and protocol with site bindings including host/SNI; confirm W3SVC/WAS/site state. If no request reaches IIS, app code is downstream of the failure.
2. Restore a dedicated `ApplicationPoolIdentity` (or a deliberately provisioned specific identity). Grant `IIS AppPool\CatalogPool` Modify only on `D:\sites\catalog\uploads`, and Read/Execute on application binaries. Verify effective ACLs and test a write while running under the application identity; verify executable files remain non-writable. Remove temporary LocalSystem configuration and audit any files created under it.
3. The x86 worker cannot load the x64 native dependency. Either disable “Enable 32-bit applications” and run the app as x64, after checking all components, or republish for win-x86 with x86-compatible native packages and a matching worker. Recycle and inspect Event Log/ANCM evidence after the change.
4. Do not blindly raise queueLength. Bound request timeouts, fail fast or shed load when the database is unavailable, use circuit-breaker/backpressure behavior at the application boundary, preserve capacity for health/administrative traffic, and restore database capacity. Increase the queue only if measured short bursts can be served before client deadlines and memory/latency remain bounded.
5. 500.34 is a hosting-model conflict within one worker process. Assign them to separate pools so each process has a compatible model. “No Managed Code” concerns the classic ASP.NET CLR and does not select ANCM mode.
6. Enable `stdoutLogEnabled` temporarily and select a dedicated, non-public diagnostic directory. Grant the pool identity only create/write rights there; reproduce once and collect timestamped output. Protect it because logs can contain sensitive details. Disable stdout capture, remove or securely archive the files, and correct the diagnosed startup issue. Never leave it enabled as normal production logging.
7. Record the release and backup; place `app_offline.htm`; wait for shutdown; publish the complete release and verify file ownership, ACLs, `web.config`, runtime, and native dependencies; remove the offline file; wait for a dependency-aware readiness check; then restore normal traffic/announce availability. This causes an offline period and does not guarantee atomic replacement, zero downtime, or reversible database changes.
8. Check whether overlapped recycling allowed both workers to compete for resources; verify warm-up/preload and a readiness gate; see if all instances recycled together; inspect queue depth and startup/dependency latency; confirm shutdown/drain limits and that shared state is externalized. Keep protective recycling while correcting the proven cause.
9. Capture UTC timestamp, site, host/path, client/request ID, status/substatus, time-taken, release commit, pool state, hosting model, and correlated app trace. If no IIS entry, inspect HTTP.sys/HTTPERR and bindings. For ANCM startup status or worker failure, inspect Event Log and temporary ANCM diagnostics. If ANCM delivered the request, follow correlation ID into application logs/traces and dependencies.
10. On-demand uses fewer idle resources but first request pays initialization and can fail on demand. AlwaysRunning with application preload and Application Initialization can warm early, but costs resources and is not by itself a health guarantee. Configure an authenticated/internal readiness URL that validates required startup configuration and critical dependency availability without mutating data; wait for success and acceptable latency before traffic.

## Tests and edge cases

- Confirm the exact status and substatus; do not infer root cause from the top-level HTTP status alone.
- Test the deployed artifact under full IIS and its actual pool identity, not only under IIS Express or an administrator shell.
- Test missing runtime, wrong architecture, malformed `web.config`, missing ACL, and dependency outage in a nonproduction environment.
- Exercise recycle during representative in-flight requests and verify graceful drain, duplicate startup side effects, and shared-state behavior.
- Verify readiness checks fail when a required dependency is unavailable and recover after it returns.
- Confirm stdout logging is disabled after a diagnostic exercise and disk usage is bounded.

## Reflection questions

- Which evidence lets you locate the last successful boundary without guessing?
- Which operations are safe to retry after worker restart, and which might duplicate side effects?
- What does your readiness endpoint prove, and what important condition might it miss?
- Which deployment changes can be rolled back independently of a database migration?
- What is your procedure for verifying an IIS configuration change and restoring the previous configuration?

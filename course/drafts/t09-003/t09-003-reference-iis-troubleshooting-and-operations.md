# Windows IIS application pools hosting and troubleshooting — Reference: Failure status boundaries, log sources, permissions, warm-up, and safe deployment

Sources: [ASP.NET Core startup troubleshooting status mappings (latest published page)](https://learn.microsoft.com/en-us/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-10.0), [ASP.NET Core Module for IIS](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [IIS process model](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/processmodel), [IIS failure settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/failure), and [IIS application pools](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/).

## Scope and version

This lesson targets IIS-hosted ASP.NET Core 11 GA (released November 10, 2026). Microsoft’s current startup troubleshooting status-code article still resolves to ASP.NET Core 10. The codes below are the latest published mapping checked November 20, 2026, not a guarantee that every detail is unchanged in every ANCM build. Compare the exact message, installed ANCM/Hosting Bundle, Event Log, and target-version documentation. IIS service configuration names and AppCmd behavior also depend on installed Windows/IIS version.

## How this group fits the mental model

Troubleshooting asks: what is the last boundary known to have succeeded? Start at endpoint/HTTP.sys, proceed through site/application/pool, then ANCM, runtime/dependencies, and application. Preserve the timestamp, status/substatus, deployment identity, and logs before restarting or changing configuration. Use narrow temporary diagnostics and remove them after evidence is captured.

## Supplied names explained

### ANCM startup code families

- `HTTP 500.0 ANCM handler load failure` — IIS/ANCM handler could not load or initialize the required request handler. Check ANCM native module/handler installation and the corresponding Event Log details; a generic 500.0 does not prove application code ran.
- `HTTP 500.30 in-process startup failure` — In-process worker failed while starting the ASP.NET Core app/runtime. Examine Application Event Log and ANCM startup output for framework, configuration, app initialization, permissions, or dependency failures.
- `HTTP 500.31 ANCM failed to find native dependencies` — ANCM could not find required dependencies for startup. Inspect detailed startup message, shared framework/runtime installation when applicable, publish files, native libraries, and process architecture; do not assume “native” means only a NuGet package.
- `HTTP 500.32 ANCM failed to load DLL` — A DLL needed by the hosting path could not be loaded. Processor-architecture mismatch is a common cause; inspect x86/x64 worker settings, publish RID, actual native DLLs, and transitive native prerequisites.
- `HTTP 500.33 ANCM request handler load failure` — The app does not target/reference the ASP.NET Core shared framework expected by ANCM’s request handler. The latest published guide advises checking the framework target in the app’s `.runtimeconfig.json` and using a supported ASP.NET Core app target.
- `HTTP 500.34 ANCM mixed hosting models not supported` — In-process and out-of-process applications cannot run together in the same worker process. Place them in separate application pools/process boundaries.
- `HTTP 500.35 ANCM multiple in-process applications in same process` — More than one in-process app was assigned to the same worker process where that arrangement is unsupported. Assign the applications to separate pools.
- `HTTP 500.36 ANCM out-of-process handler load failure` — The out-of-process request-handler component failed to load; the published troubleshooting page associates this with a missing/corrupt module installation and recommends repairing the Hosting Bundle (or IIS Express components for IIS Express).
- `HTTP 500.37 ANCM startup time limit exceeded` — App startup did not complete within ANCM’s configured startup window. Investigate startup work, resource contention, dependency delays, and simultaneous app starts before raising the timeout.
- `HTTP 500.38 ANCM application DLL not found` — ANCM could not locate the application DLL beside the executable as required by the configured hosting path. The cited mapping highlights single-file publishing with in-process hosting as unsupported; disable single-file or select a compatible out-of-process model after checking current guidance.
- `HTTP 502.5 out-of-process process failure` — The out-of-process app failed to start or remain available for ANCM forwarding. Check process path/arguments, runtime, startup exception, working directory, environment, and child-process output.
- `HTTP 503 application pool unavailable` — IIS cannot serve the request because the target pool is stopped, disabled, unavailable, or unable to accept work. Distinguish protective disablement, intentional stop, and request-queue saturation from application-generated responses.

### Logs and targeted diagnostics

- `Windows Application Event Log` — Event Viewer’s Application log contains ANCM/runtime/application startup events. Correlate provider, event details, process, and timestamp with the request/deployment; an event may describe startup rather than the exact failing request.
- `ASP.NET Core Module stdout log` — Captures process stdout/stderr for ANCM startup diagnosis when enabled. It is useful when app startup writes diagnostic output, but may contain secrets and is not a durable logging system.
- `IIS stdout log folder write ACL` — Filesystem permission allowing the pool identity to create ANCM log files in a dedicated folder. Grant only necessary rights on that folder; do not make the whole app tree writable.
- `Temporary stdout logging` — Short diagnostic window: enable, reproduce, collect evidence, disable, then clean/secure the files. The logs do not automatically rotate and can fill disk.
- `Disable stdout logging after diagnosis` — Return `stdoutLogEnabled` to false after collecting evidence. Confirm deployment config no longer enables it and check for stale files and disk use.
- `IIS Failed Request Tracing rule` — Narrow FREB rule for a path/status/verb that records IIS pipeline events. Limit scope and duration, and secure traces because request/response metadata can be sensitive.
- `ANCM startup error page` — Module-generated diagnostic response when startup fails. Read its status and error details as a boundary clue, then inspect server-side logs; do not expose verbose diagnostics publicly longer than needed.

### Common cause isolation

- `Missing Hosting Bundle diagnosis` — Verify ANCM module files/registration and installed runtimes, compare with the target deployment, and inspect event details. Repair/install the correct bundle if evidence shows missing/corrupt components; installation alone does not fix app configuration or ACL errors.
- `Missing shared runtime diagnosis` — For framework-dependent deployment, compare the required frameworks in `.runtimeconfig.json` with `dotnet --list-runtimes` on the server and install a supported compatible runtime/Hosting Bundle or deliberately republish self-contained.
- `Native dependency architecture mismatch` — Compare process bitness, publish RID, native library bitness, and all transitive native dependencies. Align them; AnyCPU managed assemblies do not make a native dependency architecture-neutral.
- `web.config malformed configuration` — Validate XML structure and ANCM/IIS section placement, inspect deployment output and IIS configuration error details, and restore a known-good file. A malformed configuration may prevent handler startup before app code runs.
- `Application pool identity filesystem permission` — Check the effective ACL for the actual pool principal on binaries, configuration, and required writable directories. Grant narrow, explicit rights; never use broad elevation as a diagnostic shortcut.
- `IIS environment variable scope` — Environment variables can be defined at machine, pool, or ANCM application process scope, with different inheritance and restart behavior. Inspect effective values while avoiding secret disclosure, and recycle/restart the correct process after a change.

### Availability, rollout, and command evidence

- `IIS startup warm-up request` — Initialization request sent before normal traffic to make startup work happen early. Choose an endpoint that exercises required readiness and does not create side effects; a successful static file is weak evidence.
- `Preload and AlwaysRunning coordination` — Application preload is effective only when application initialization and pool startup settings are compatible. Verify both pool and application settings, and observe a completed readiness check.
- `Application pool recycle overlap` — Old and replacement workers coexist while requests drain. This avoids an abrupt stop in some cases but increases resource use and may execute startup logic twice; use idempotent initialization and shared state.
- `Graceful shutdown and request drain` — App receives bounded time to stop accepting work, finish in-flight requests, and stop background tasks before termination. Long/unbounded tasks can still be terminated; use durable queues for work that must survive process restart.
- `IIS configuration backup` — Captured IIS server configuration that supports review and recovery from a change. Back up before material changes, store it securely, document the matching app artifact, and rehearse restoration.
- `appcmd list apppool` — Read-oriented AppCmd query showing configured pools and their state/settings. Use the server’s AppCmd path/context and confirm the correct pool before any follow-up change.
- `appcmd list site` — Lists IIS sites and their configuration/state, useful for verifying bindings/site identity when routing is suspect.
- `appcmd list wp` — Lists IIS worker processes and associated pools, helping correlate pool state with `w3wp.exe` process IDs. A process listing does not by itself prove app readiness.
- `IIS log time zone and UTC interpretation` — IIS W3C log timestamps are generally UTC; confirm the `#Date`/log format and convert deliberately when correlating with local Event Viewer time. Include offset and clock-skew considerations in incident notes.

## Cross-item comparison

| Evidence | What it can establish | What it cannot establish alone |
|---|---|---|
| HTTPERR | HTTP.sys rejected/failed a connection or queue action | That application code executed |
| IIS access log | IIS processed/logged a request and status/substatus | The full internal app exception or dependency cause |
| Event Log | Runtime/ANCM/app startup event details | That the same event corresponds to a particular user request without correlation |
| ANCM stdout | Process startup stdout/stderr during enabled capture | Long-term, rotated production telemetry |
| Application trace | App-level execution and dependency spans | Why a request never reached the application |

The status code is a routing clue. For example, the 500.34/500.35 distinction is hosting-model coexistence versus multiple in-process apps in one worker. Both point toward process isolation, but the exact failing composition differs. A queue-overflow 503 indicates pressure at an IIS queue; a disabled-pool 503 indicates pool availability; gather pool state and logs before tuning queue limits.

## Examples

**500.32 after a 32-bit setting change:** Confirm the actual `w3wp.exe` bitness, app publish RID, and native dependency architecture. Restore an aligned configuration, recycle the affected pool, and verify a health request. Do not infer architecture solely from the managed project’s AnyCPU setting.

**No requests in IIS access logs:** Check client DNS/address, firewall, TLS handshake, HTTP.sys listener registration and HTTPERR, then site IP/port/host/SNI binding and service state. Application logs are not the first place to look because the request may not have reached IIS.

**A rollout creates duplicate scheduled jobs:** Overlapped recycle may run both versions simultaneously. Move durable work to a queue/worker with explicit singleton/lease/idempotency rules; do not rely on one IIS process being alive.

## Common mistakes

- Treating a status code as a complete root-cause diagnosis.
- Confusing ANCM’s rapid restart limit with IIS application-pool rapid-fail protection.
- Enabling stdout logging without checking write ACL, disk capacity, and sensitive output.
- Leaving stdout enabled after collecting the one reproduction.
- Changing queueLength before examining saturation and downstream behavior.
- Assuming a warm-up request has passed readiness because it returned any 2xx.
- Correlating UTC IIS logs with local Event Log timestamps without conversion.
- Restarting the whole IIS service before preserving relevant event, process, and log evidence.

## Knowledge checks with answers

1. **What do you check first when there is no IIS access-log line?** Network/TLS, endpoint registration, HTTPERR, site binding, and IIS service state; the app may never have received a request.
2. **How do you diagnose 500.32?** Verify actual process bitness against the publish and every native dependency, then inspect detailed module/runtime events.
3. **Why is stdout a temporary tool?** It does not rotate automatically, can exhaust disk, and can expose sensitive startup output.
4. **How do you distinguish pool rapid-fail from ANCM `rapidFailsPerMinute`?** The former disables the IIS worker pool after worker crashes; the latter limits ANCM out-of-process app restarts per minute. Inspect which process and event reached its threshold.
5. **What makes a warm-up probe meaningful?** It checks conditions necessary to serve real requests and is observed before routing user traffic; it is bounded, safe, and does not mutate business state.
6. **How should IIS and Event Log timestamps be correlated?** Confirm each time basis and convert W3C UTC/local event times with the correct offset and clock context.

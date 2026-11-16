# Windows IIS application pools hosting and troubleshooting — Big-picture orientation and mental model

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [IIS application pools](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Problem and purpose

IIS is both an HTTP server and a Windows process-activation and isolation system. Hosting an ASP.NET Core application therefore means understanding two connected systems: how IIS selects a site and application for a request, and how the ASP.NET Core Module (ANCM) starts and supervises the .NET application. A failure at one boundary can look like a generic browser error unless we identify which component received the request and which process failed.

This module covers current IIS hosting with ASP.NET Core 11, released November 10, 2026. IIS concepts such as sites, bindings, application pools, worker processes, and configuration also apply to other IIS applications. ASP.NET Core adds ANCM, Kestrel or IISHttpServer, deployment output, and .NET runtime dependencies.

## Plain-language mental model

Think of a request as passing through a guarded building. HTTP.sys is the public entrance and queue. IIS matches the address to a site and application. WAS is the facilities manager that starts the correct worker process under an assigned identity. ANCM is the adapter between IIS and the ASP.NET Core application. The application then runs either inside the IIS worker process or in a separate process behind IIS.

Each boundary has its own configuration, identity, logs, health checks, and failure modes. An IIS 503, an ANCM 500.30, and an application-generated 500 may all appear to a user as “the site is broken,” but they point to different evidence and remedies.

## How the parts fit together

1. A client connects to an IP address and port, optionally using TLS and a host name. HTTP.sys accepts the connection and queues the request.
2. IIS site bindings select a site. The URL path selects an application, which is assigned to an application pool.
3. WAS manages the pool. If needed, it starts a `w3wp.exe` worker process with the configured pool identity and health/recycling rules.
4. IIS modules and handler mappings route the request. ANCM’s `AspNetCoreModuleV2` handler recognizes the ASP.NET Core application configuration.
5. In-process hosting loads the app into `w3wp.exe` and uses `IISHttpServer`. Out-of-process hosting starts the app as a separate process, normally using Kestrel, and ANCM forwards requests to it.
6. The app depends on published files, architecture-compatible native dependencies, configuration, filesystem permissions, and (for framework-dependent deployment) an installed shared .NET runtime.
7. Logs and status codes reveal the last boundary known to have succeeded. Operators correlate IIS access logs, HTTPERR, Windows Event Log, ANCM diagnostics, and application telemetry rather than turning on every log indefinitely.

## Concept map

| Boundary | Main decision | Evidence when it fails |
|---|---|---|
| Network and HTTP.sys | Can this address, port, and protocol be accepted and queued? | Connection failure, HTTPERR, listener/binding state |
| IIS site and application | Which site, path, and application pool own this request? | IIS access log, binding and configuration inspection |
| WAS and worker process | Can the pool start, remain healthy, and run as its identity? | Pool state, Event Log, `w3wp.exe`, rapid-fail events |
| ANCM and deployment | Can the module load and launch the app with the requested hosting model? | ANCM status code, Event Log, temporary stdout log |
| .NET app | Does startup and request handling succeed? | Application logs, traces, health and dependency signals |
| Operations | Can warm-up, recycle, deployment, and recovery preserve service? | Readiness probes, deployment record, latency/error signals |

The site, application, virtual directory, and pool are separate objects: a virtual directory maps a path to files, while an application defines an application boundary and pool assignment. A pool can host more than one application, but in-process ASP.NET Core imposes an important isolation constraint: applications needing different in-process hosting configurations should not share one worker process/pool. A separate pool is the safer boundary.

## End-to-end walkthrough

Suppose `https://shop.example.test/orders/42` returns HTTP 500.30 after a deployment. First confirm DNS, TLS, port, and binding reach the intended IIS site. Check the IIS access log to verify the request arrived and its status/substatus; inspect HTTPERR if it never reached normal IIS request logging. Confirm the `/orders` application and pool assignment, then inspect whether the pool is started and whether rapid-fail protection disabled it.

For 500.30, focus on in-process application startup: inspect the Windows Application Event Log, verify the deployed `web.config` hosting model and process path, check the published app and runtime/native dependencies, and confirm the pool identity can read the deployment and write only to required data/log locations. Enable ANCM stdout logging briefly only if necessary, grant its directory write access to that identity, reproduce once, collect the log, then disable it and remove or rotate the diagnostic files. Fix the underlying error and redeploy a known artifact; do not “solve” a startup failure by granting the pool broad administrator rights.

For availability, deploy with a controlled shutdown (for example, `app_offline.htm` where appropriate), allow in-flight requests to drain, start the new version, send a warm-up/readiness request, and only then route normal traffic. Recycling and deployment overlap can briefly run old and new processes together, so app state, file replacement, database migrations, and external side effects must tolerate that overlap.

## When to use it and tradeoffs

Use a dedicated IIS application pool to create a clear identity, process lifecycle, and operational boundary. `ApplicationPoolIdentity` is normally a good least-privilege default. In-process hosting avoids the extra proxy hop and is commonly efficient, but couples application lifetime and compatibility to the IIS worker process. Out-of-process hosting preserves Kestrel as a separate server process and can ease some isolation/debugging choices, at the cost of process supervision and forwarding complexity.

Always-running and preload reduce cold-start latency but consume resources and do not replace readiness checks. Recycling can recover from leaks and apply configuration, but frequent or synchronized recycling can create cold starts and capacity dips. More logging improves diagnosis temporarily but consumes disk and may expose sensitive details. Choose the smallest configuration that meets availability and isolation needs, then validate it with realistic deployment and failure exercises.

## What later lessons cover

The concepts lesson builds the request and process model. Reference lessons explain routing/configuration, pool identity and lifecycle, ANCM and deployment modes, and exact troubleshooting evidence and status codes. Practice walks through diagnosis and a safe deployment; interview preparation focuses on explaining boundaries, tradeoffs, and recovery decisions.

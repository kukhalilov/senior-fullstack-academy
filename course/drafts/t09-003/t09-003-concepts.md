# Windows IIS application pools hosting and troubleshooting — Core concepts and how they fit together

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core Module](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [IIS application pools](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/), [process model settings](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/applicationpools/add/processmodel), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Learning objectives

After this lesson, you should be able to trace a request from its network endpoint to an ASP.NET Core handler; distinguish IIS objects and process boundaries; choose and explain a hosting model and pool identity; diagnose a startup failure using evidence from the correct layer; and describe safe warm-up, recycle, and deployment behavior.

## Prerequisites

You should know what an HTTP request, DNS name, TLS connection, operating-system process, filesystem ACL, and web application are. A process is a running program with its own memory and security token. An ACL (access-control list) says which identities can perform actions such as reading a file or writing to a directory.

## Core concepts

### Request routing is a sequence of ownership decisions

HTTP.sys receives Windows HTTP traffic and maintains request queues. IIS uses a site binding (protocol, IP, port, and optional host name/SNI details) to select a site. Within that site, a URL path maps to an IIS application or virtual directory. The application is assigned to a pool. These are distinct configuration objects; changing the physical directory does not by itself change the binding or pool identity.

`ApplicationHost.config` holds server-level IIS configuration. `web.config` carries application-level settings and may inherit from parent configuration. Inheritance can make an apparently local handler or authorization rule originate in a parent. Inspect effective configuration and its location when behavior differs from the file you edited.

### WAS controls worker processes; a pool is a policy boundary

Windows Process Activation Service (WAS) manages application-pool lifecycle and worker-process activation. A pool can have one or more `w3wp.exe` processes. By default, one process is used; a web garden (maximum worker processes greater than one) changes the model to multiple processes and makes in-memory session/cache state non-shared. Do not turn it on as a generic performance setting.

`ApplicationPoolIdentity` gives each pool a virtual account such as `IIS AppPool\ShopPool`. Grant that identity only the required read access to deployment files and specific write access to data or diagnostic folders. `LocalSystem` is highly privileged; `NetworkService` and `LocalService` have different local and network credentials; a specific account needs deliberate credential rotation. Pool identity is not the same as the Windows user logged into IIS Manager.

IIS “No Managed Code” means IIS itself does not load the classic ASP.NET Framework CLR for the pool. ASP.NET Core still runs on .NET through ANCM. Integrated and Classic pipeline modes describe legacy ASP.NET/IIS pipeline integration and do not select ASP.NET Core’s in-process versus out-of-process hosting model.

### ANCM connects IIS to ASP.NET Core

The .NET Hosting Bundle installs the ASP.NET Core Module and runtime components needed for IIS integration. After installing or repairing it, restart IIS as directed so the native module registration is available. The module is normally named `AspNetCoreModuleV2`.

In-process hosting loads the ASP.NET Core app into the IIS worker process and uses `IISHttpServer`; it avoids a loopback proxy hop. Out-of-process hosting starts the app as a separate process (commonly via `dotnet app.dll` for framework-dependent publish or the app executable for self-contained publish), with Kestrel receiving forwarded requests from ANCM. The module supplies/protects the forwarding boundary; do not expose or trust arbitrary direct Kestrel traffic as if it came through IIS.

There are independent architecture choices: app build architecture (x86/x64/arm64), app-pool enable-32-bit setting, installed native dependencies, and runtime architecture must line up. A process failing to load a native DLL can be an architecture mismatch even when the managed application compiled successfully.

### Deployment mode and hosting model are different choices

Framework-dependent publish contains the app but uses a compatible shared .NET runtime installed on the server. Self-contained publish includes the .NET runtime files for its target runtime identifier, but IIS still needs ANCM and native prerequisites; self-contained does not mean “no server configuration.” `web.config` generated during publish sets ANCM handler and process configuration. Inspect the deployed file, not just the source project.

For .NET 11, the current IIS guide documents in-process hosting behavior and opt-in compatibility for existing applications; templates use in-process hosting. The emitted `web.config` and the deployed application type are authoritative for the actual process path. The hosting-model setting cannot be changed in a way that makes already-built process assumptions valid without republishing and verifying the result.

### Diagnose by the last successful boundary

Start with the exact status, substatus, timestamp, site, path, and deployment revision. A network/binding problem precedes IIS routing. HTTPERR can show HTTP.sys-level rejection; IIS access logs show requests IIS processed. A 503 can indicate unavailable/disabled pool or queue pressure. ANCM codes distinguish module/startup/dependency/handler failures. If ANCM started the app and the application returned an error, investigate application logs and dependencies instead of repeatedly changing IIS.

A 500.30 points to an in-process startup failure. A 500.31 commonly means required native dependencies were not found. A 500.32 concerns loading a DLL, often architecture or dependency related. A 502.5 indicates out-of-process startup/process failure in the latest published status-code mapping. These exact mappings are from Microsoft’s troubleshooting page, which still resolves to its ASP.NET Core 10 edition; confirm messages against the installed ANCM and current documentation for the target release.

### Lifecycle controls are availability controls

On-demand start saves resources but can introduce cold start. Always-running plus preload can warm the application, but only if site/application settings and the Application Initialization module are configured consistently. An idle timeout can terminate or, on supported IIS configurations, suspend a worker; neither setting is equivalent to a periodic recycle.

Recycling starts a replacement worker according to configured conditions. Overlapped recycling lets the old process finish requests while the new process starts, but temporarily increases resource use and means two versions may coexist. Graceful shutdown and request-drain timeouts must be long enough for expected work; background jobs should use a suitable hosted service/queue model and shutdown behavior. Rapid-fail protection disables a pool after repeated crashes in its interval; it is a containment mechanism, not the fix for the crash.

## Mechanisms and relationships

The causal chain is: binding and path select an application; application assignment selects a pool; WAS starts a worker with a token; IIS handler mapping selects ANCM; ANCM loads in-process or starts/forwards to out-of-process; .NET startup resolves runtime, configuration, and native dependencies; app code handles the request. Every link has prerequisites and evidence. Good diagnosis follows the chain in order and changes one variable at a time.

Permissions are evaluated at the process identity, not the deployment operator’s account. The pool usually needs read/execute access to published files, but write access should be limited to explicit writable locations. ANCM stdout logging requires the identity to create files in the target directory. Granting the entire application tree write access to make logging work can hide an ACL mistake and increase impact if the process is compromised.

During deployment, `app_offline.htm` asks ANCM to shut the application down while files are replaced. Remove it only after publishing completes. This is not atomic blue-green deployment: it can produce downtime. A rolling or slot-based approach requires distinct deployable instances and compatible data changes. Warm-up should invoke a readiness endpoint that verifies dependencies required for serving traffic, rather than merely fetching a static file.

## Worked examples

**The site returns 500.30 immediately after publishing.** Confirm the selected site/application and pool. Check Windows Application Event Log and ANCM startup details. Compare deployed `web.config` with the chosen model, then verify runtime availability for framework-dependent deployment, files, native dependencies, architecture, and identity ACLs. Enable stdout logging briefly only when event data is insufficient. Reproduce, collect the file, turn logging off, and fix the evidence-backed cause.

**The pool is running but requests return 503 during a traffic spike.** Check whether the pool is disabled by rapid-fail protection, whether the request queue is full, and whether CPU or worker capacity is constrained. Compare HTTP.sys and IIS logs and inspect active worker processes with AppCmd. A larger queue may delay failure but does not create throughput; find the saturated dependency or reduce load safely.

**An app works in IIS Express but fails in full IIS.** IIS Express runs with developer context and local tooling; full IIS uses configured bindings, published `web.config`, ANCM installation, pool identity, and server ACLs. Reproduce using full IIS and inspect its actual process identity and deployment output rather than assuming the two environments are equivalent.

## Misconceptions and edge cases

- “No Managed Code” does not mean ASP.NET Core has no .NET runtime; it means IIS is not hosting the legacy managed pipeline for the pool.
- A site is not an application, and a virtual directory is not automatically an application boundary.
- In-process and Integrated pipeline are unrelated choices with similar-sounding “in” terminology.
- A self-contained publish still requires IIS/ANCM and may require native OS dependencies.
- A running pool does not prove the application is healthy; a started process may fail on every request.
- A recycle is not necessarily seamless: old and new workers can overlap, and in-memory state is process-local.
- Stdout logs do not rotate automatically; leaving them enabled can fill the disk.
- A successful HTTP response from the home page does not prove readiness for a dependency-dependent workload.
- Error-code mappings may evolve with ANCM; verify the installed module version when docs and runtime differ.

## Knowledge checks with answers

1. **What selects the application pool?** The IIS application configuration associates an application with a pool; the site binding selects the site first, then the URL path selects the application.
2. **What is the key process difference between hosting models?** In-process runs the app inside `w3wp.exe` using `IISHttpServer`; out-of-process runs a separate app process, usually Kestrel, to which ANCM forwards requests.
3. **Why can “No Managed Code” still run an ASP.NET Core app?** ANCM starts/loads the .NET application; the pool’s classic ASP.NET CLR setting is not the ASP.NET Core runtime selection.
4. **What does rapid-fail protection tell you?** The worker has repeatedly failed within a configured interval and IIS disabled the pool as containment; inspect crash/startup evidence.
5. **Why disable stdout logging after diagnosis?** It is intended as temporary startup troubleshooting, lacks automatic rotation, and can consume disk or expose sensitive diagnostic detail.
6. **What is the safest first step for an unexplained 500?** Identify exact status/substatus, timestamp, path, and last successful boundary, then inspect evidence from that layer before changing settings.

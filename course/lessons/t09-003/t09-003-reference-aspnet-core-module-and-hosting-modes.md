# Windows IIS application pools hosting and troubleshooting — Reference: ANCM, in-process/out-of-process request paths, deployment, and configuration

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core Module for IIS](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module?preserve-view=true&view=aspnetcore-11.0), [ASP.NET Core 10 startup troubleshooting mappings (latest published status-code edition)](https://learn.microsoft.com/en-us/aspnet/core/test/troubleshoot-azure-iis?view=aspnetcore-10.0), and [.NET support policy](https://dotnet.microsoft.com/en-us/platform/support/policy).

## Scope and version

The current stable target is ASP.NET Core 11 GA, released November 10, 2026. This lesson distinguishes .NET 11 hosting behavior from the latest published ANCM startup-code mapping, whose troubleshooting article remains the ASP.NET Core 10 edition at the time checked (November 20, 2026). Verify deployed `web.config`, installed Hosting Bundle/module version, architecture, and the target-version documentation on the actual server. The manifest records the exact current source snapshot.

## How this group fits the mental model

IIS routes a selected application to ANCM. The module then loads the app into the worker or starts a child application process and forwards requests. The process model determines which HTTP server handles requests, where configuration and startup failures appear, and how isolation and deployment work. Publishing mode (framework-dependent or self-contained) is a separate axis from hosting mode (in-process or out-of-process).

## Supplied names explained

### Module installation and server integration

- `ASP.NET Core Module (ANCM)` — Native IIS module that bootstraps and manages ASP.NET Core apps. It handles process start/restart, request routing, and shutdown according to the hosting model.
- `AspNetCoreModuleV2` — Current ANCM IIS module/handler name used in generated configuration. A missing or corrupt native module/handler often points to an absent or damaged Hosting Bundle installation.
- `.NET Hosting Bundle` — Installer package for hosting ASP.NET Core on IIS; includes the .NET runtime components and IIS module required by the selected installation options. Repair/reinstall after IIS is added if module registration was missed, then restart IIS as instructed.
- `IIS Integration` — ASP.NET Core hosting integration that adapts request processing, server features, authentication forwarding, and ANCM cooperation to IIS. It does not mean the old `System.Web` stack is in use.
- `IISHttpServer` — ASP.NET Core server implementation used by in-process IIS hosting. IIS and the application share `w3wp.exe`; Kestrel is not the HTTP server in this mode.

### Hosting modes and request path

- `In-process hosting model` — ANCM loads the ASP.NET Core app into the IIS worker process. Requests pass through IIS/ANCM to `IISHttpServer` without an extra loopback Kestrel hop. App failures and resource use share the worker boundary.
- `Out-of-process hosting model` — ANCM starts the application in a separate process, usually a Kestrel-hosted app, and forwards requests to it over a local endpoint. This creates a second process and hop, but preserves Kestrel as the app server.
- `Kestrel behind IIS` — Out-of-process arrangement where IIS remains the public-facing reverse proxy and Kestrel listens on an ANCM-provided local endpoint. Configure forwarded headers/trust according to the hosting integration; never accept arbitrary client-supplied forwarded headers as trusted merely because Kestrel is present.
- `ANCM process management` — Module responsibilities for launching, monitoring, restarting, and shutting down the app process. Startup and shutdown timeouts, crash behavior, and logs are observable operational controls, not app-level health guarantees.
- `ANCM request forwarding` — Out-of-process request transfer from IIS to the child app. The local backend endpoint and forwarded metadata are controlled by the hosting integration; app code should use the supported ASP.NET Core integration rather than hardcoding ANCM ports.
- `ASPNETCORE_HOSTINGSTARTUPASSEMBLIES` — Environment variable listing hosting-startup assemblies to load at startup. It can extend startup behavior and is security-sensitive because loading an unexpected assembly executes code in the app process.
- `<AspNetCoreHostingModel>` — Project/MSBuild property selecting in-process or out-of-process behavior at publish/build time. Inspect the generated `web.config`, since publish configuration and deployment artifact determine what IIS will run.
- `hostingModel web.config attribute` — `hostingModel` setting on the `aspNetCore` element, commonly `inprocess` or `outofprocess`. It needs to match the published app and IIS/ANCM support; editing the value without republishing does not transform the compiled app’s compatibility.

### `web.config` process and environment settings

- `processPath web.config attribute` — Executable ANCM launches: commonly `dotnet` for framework-dependent output or the app executable for self-contained output. A wrong path or missing executable prevents startup.
- `arguments web.config attribute` — Arguments passed to the launched process, often the application DLL for `dotnet`. Quote/escape paths correctly and avoid putting secrets in command-line arguments.
- `stdoutLogEnabled web.config attribute` — Turns on ANCM stdout/stderr capture for startup troubleshooting. It is generally disabled in production; files do not automatically rotate and may contain sensitive diagnostics.
- `stdoutLogFile web.config attribute` — Base path/pattern for ANCM stdout log files. The pool identity must be able to create files in the directory; keep the directory narrow, collect the failure evidence, then disable logging and clean up safely.
- `requestTimeout web.config attribute` — ANCM timeout configuration for a request in applicable out-of-process hosting. It is not a general application timeout or a reliable fix for a slow dependency; confirm current version support and avoid setting it to mask stalled requests.
- `rapidFailsPerMinute web.config attribute` — ANCM limit for how many out-of-process process failures are tolerated in a minute before the module stops trying to restart the app. It is distinct from IIS application-pool rapid-fail protection.
- `forwardWindowsAuthToken web.config attribute` — Controls forwarding a Windows authentication token to the out-of-process app when applicable. Forwarding a token grants sensitive delegated authority; enable only for an intentional Windows-auth design.
- `ANCM environmentVariables element` — Child configuration element adding environment variables for the managed app process. Use for nonsecret process configuration where suitable; restrict configuration read access and use a secret store for credentials.

### Isolation, deployment, and developer-server boundaries

- `In-process app-pool isolation requirement` — In-process apps execute inside the same `w3wp.exe` for the pool. Do not mix apps requiring incompatible hosting models or multiple in-process apps in one worker; use separate IIS applications assigned to separate pools as appropriate.
- `Single-file publish compatibility with in-process IIS` — In-process ANCM needs the app assembly in a form it can load; a single-file app is incompatible with the in-process model described by the published status-code guide. Disable single-file publishing or use out-of-process hosting after checking the target .NET/ANCM documentation.
- `Framework-dependent deployment` — Publish output relies on a compatible .NET shared framework installed on the server. It usually reduces package size and centralizes runtime patching, but deployment fails when the required runtime is absent/incompatible.
- `Self-contained deployment` — Publish includes the .NET runtime for a chosen RID (runtime identifier). It reduces shared-runtime dependency, but still requires ANCM for IIS and OS/native prerequisites, increases artifact size, and needs republishing for runtime security updates.
- `Runtime-dependent app startup` — Startup resolution of framework/runtime versions and dependencies for an app process. For framework-dependent apps, inspect installed shared runtimes with `dotnet --list-runtimes` under the server environment; the interactive admin shell may not mirror the process environment.
- `.NET shared framework` — Reusable installed runtime/framework (for example `Microsoft.AspNetCore.App`) that framework-dependent apps resolve at startup. The requested framework/version must be available or allowed roll-forward behavior must match policy.
- `Application architecture versus app-pool architecture` — App/native dependency target (x86/x64/arm64) must match the actual worker or child process architecture and native libraries. The app-pool 32-bit option changes worker bitness on 64-bit Windows; verify actual process and publish RID.
- `web.config publish output` — Generated IIS/ANCM file emitted by the Web SDK during publish. Treat it as part of the release artifact; inspect actual deployed values, permissions, handler mapping, hosting model, process path, and environment settings.
- `app_offline.htm deployment shutdown` — Special file recognized by ANCM that requests app shutdown while files are replaced. Remove it after publish completes; this produces an offline interval and is not an atomic/zero-downtime deployment strategy.
- `IIS Express versus full IIS` — IIS Express is a developer-oriented, lightweight local server with different configuration and often different identity/context. Full IIS adds server services, real pool identities, deployment ACLs, and machine-level ANCM configuration; success in Express does not validate production IIS.

## Cross-item comparison

| Axis | Option A | Option B | What remains independent |
|---|---|---|---|
| Hosting | In-process with `IISHttpServer` | Out-of-process with Kestrel | Framework-dependent vs self-contained publish |
| Runtime packaging | Framework-dependent | Self-contained | ANCM and IIS are still required |
| Developer server | IIS Express | Full IIS | Deployed identity/configuration still needs validation |
| Process boundary | Shared `w3wp.exe` | Child app process | Application-level readiness and dependency health |

ASP.NET Core 11 is a major stable release; always check the official support policy and versioned hosting docs before upgrading a server. Do not infer a changed ANCM status-code meaning merely from a new .NET release number. The current troubleshooting page cited here remains ASP.NET Core 10 and is labeled as such.

## Examples

Framework-dependent, out-of-process publish might emit `processPath="dotnet"`, `arguments=".\\Store.Web.dll"`, and `hostingModel="outofprocess"`. Verify the installed `Microsoft.AspNetCore.App` runtime, app-pool ACLs, child process architecture, and ANCM logs. A self-contained publish uses its app executable, but still requires ANCM and native dependencies appropriate to the target RID.

An app using in-process hosting should be isolated in an appropriate pool. For controlled file replacement, place `app_offline.htm`, wait for shutdown, publish the full release, verify files and configuration, remove the file, then wait for readiness before directing normal traffic. If downtime is unacceptable, use multiple instances and a traffic-switching deployment design rather than treating this file as blue-green deployment.

## Common mistakes

- Confusing hosting model with deployment/runtime packaging.
- Believing self-contained means IIS does not need ANCM or the app does not need native OS dependencies.
- Assuming the source project property is proof of deployed `web.config` values.
- Setting a fixed Kestrel port instead of allowing ANCM integration to configure the backend endpoint.
- Enabling stdout logs permanently or granting broad write permissions to make them work.
- Assuming `rapidFailsPerMinute` and IIS pool rapid-fail protection are the same control.
- Exposing or logging Windows tokens, credentials, or environment secrets.
- Treating `app_offline.htm` as zero-downtime or transactionally safe deployment.
- Assuming IIS Express proves the production pool identity and runtime installation are correct.

## Knowledge checks with answers

1. **What receives requests in-process?** IIS/ANCM invokes `IISHttpServer` inside the IIS worker process; Kestrel is not the in-process server.
2. **What does framework-dependent publish require?** A compatible shared .NET runtime on the target in addition to the IIS Hosting Bundle/ANCM.
3. **Why inspect deployed `web.config`?** It is the actual IIS/ANCM process and handler configuration produced by publish and may differ from assumptions based on source settings.
4. **What must remain true for self-contained IIS hosting?** ANCM and compatible OS/native dependencies are still needed, and the app artifact must match the target architecture.
5. **Which status-code source boundary applies here?** The cited exact mappings come from Microsoft’s latest published ASP.NET Core 10 troubleshooting edition, so verify a .NET 11 deployment against updated documentation and installed ANCM evidence.

# Kestrel endpoints TLS reverse proxies and IIS integration — Reference: ASP.NET Core Module in-process and out-of-process hosting integration boundary

## Scope and version

The ASP.NET Core Module (ANCM) connects IIS to an ASP.NET Core application and supports two materially different hosting models. In-process runs the app in the IIS worker process using `IISHttpServer`; out-of-process launches a separate app process using Kestrel and forwards requests to it. Hosting Bundle and module details are versioned with supported .NET releases. The full IIS administration workflow is outside this lesson. [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) [In-process hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/in-process-hosting)

## How this group fits the mental model

ANCM is the IIS integration boundary: it loads the in-process server or starts/monitors a child process and proxies to it. The `AspNetCoreHostingModel` project setting determines the model emitted for deployment; the resulting `web.config` describes process startup. Limits and diagnostics depend on which process receives the request. Do not apply Kestrel listener advice to an in-process application, where Kestrel is not active.

## Supplied names explained

| Supplied name | Purpose and behavior |
|---|---|
| `ASP.NET Core Module (ANCM)` | IIS module that hosts ASP.NET Core in-process or forwards requests to an out-of-process ASP.NET Core server. |
| `AspNetCoreModuleV2` | Current ANCM module handler name written in the IIS `web.config` handler mapping. |
| `Microsoft.AspNetCore.Server.IIS package` | Provides the IIS in-process server implementation and integration. |
| `Microsoft.AspNetCore.Server.IISIntegration package` | Provides IIS Integration support, including the out-of-process IIS integration boundary. |
| `AspNetCoreHostingModel project property` | MSBuild property selecting `InProcess` or `OutOfProcess` hosting for publish output. |
| `AspNetCoreHostingModel InProcess` | Runs the app inside IIS worker process `w3wp.exe` using `IISHttpServer`; Kestrel is not used. |
| `AspNetCoreHostingModel OutOfProcess` | Runs the app in a separate process using Kestrel; ANCM reverse-proxies requests from IIS. |
| `IIS in-process hosting with IISHttpServer` | Uses IIS's ASP.NET Core server inside the IIS worker, avoiding a separate Kestrel process/hop. |
| `IIS out-of-process hosting with Kestrel` | Uses a child process listening on an ANCM-provided port and Kestrel to serve forwarded requests. |
| `UseIIS` | Hosting integration that configures the in-process IIS server when running with IIS. |
| `UseIISIntegration` | Configures the out-of-process integration, including the port/base path and startup error capture for ANCM. |
| `IISHttpServer` | ASP.NET Core server implementation used by in-process IIS hosting. |
| `ANCM processPath` | Executable path the module starts, such as `dotnet` for framework-dependent deployment or the app executable for self-contained deployment. |
| `ANCM arguments` | Arguments passed to `processPath`, commonly the application DLL for `dotnet`. |
| `ANCM hostingModel web.config attribute` | `hostingModel` value in the generated `<aspNetCore>` element, such as `inprocess` or `outofprocess`. |
| `ANCM stdoutLogEnabled and stdoutLogFile startup diagnostics` | Temporarily redirects process stdout/stderr to files for startup diagnosis; logs can expose sensitive data and need restricted access/cleanup. |
| `ANCM startupTimeLimit` | Bounds how long the module waits for the app process to start and listen. Timeout behavior differs by hosting model; zero is not infinite. |
| `ANCM requestTimeout` | Out-of-process timeout for waiting on the backend response; not an equivalent Kestrel/application timeout and does not apply the same way in-process. |
| `ANCM forwardWindowsAuthToken` | Controls forwarding the Windows authentication token to an out-of-process app; it is not a general bearer-token mechanism. |
| `ANCM environmentVariables configuration` | Sets process environment variables from the `<environmentVariables>` child of the `aspNetCore` web.config element. |
| `IIS application pool and worker process boundary` | IIS worker identity, bitness, recycle, and isolation context affect the app and file permissions. |
| `In-process w3wp process versus out-of-process dotnet process` | Process names and ownership help identify which server and diagnostics apply. |
| `IIS out-of-process reverse proxy to Kestrel` | IIS receives public requests and ANCM forwards them to the app's Kestrel listener. |
| `In-process hosting does not use Kestrel` | Kestrel endpoints, Kestrel server limits, and Kestrel certificates do not configure the in-process IIS listener. |
| `IIS Express versus full IIS hosting` | IIS Express is a development server integrated with Visual Studio; production/full IIS has separate installation and operations. |
| `IIS integration versus Linux reverse-proxy hosting` | IIS Integration behavior is specific to IIS; Nginx/Apache deployments need explicit proxy and forwarded-header configuration. |
| `IIS hosting bundle installation prerequisite` | The Hosting Bundle installs the ASP.NET Core Module and runtime components required by IIS deployment; install/update it on the server and restart IIS as directed. |
| `IIS ANCM startup errors and stdout log security` | Startup status codes and temporary stdout logs help diagnose launch failures; logs must not be publicly served or left enabled indefinitely. |
| `IIS and Kestrel request limits are separate layers` | In out-of-process hosting, IIS/ANCM and Kestrel may each reject a request; configure consistent but appropriately bounded values. |
| `Full IIS operations, application pools, and web.config troubleshooting are covered by infrastructure topic t09-003` | Scope boundary directing detailed IIS administration to the operations curriculum. |
| `Kestrel operations, reverse-proxy products, load balancing, and TLS deployment are covered by infrastructure topic t09-004` | Scope boundary directing server/proxy deployment operations to the infrastructure curriculum. |

## Cross-item comparison

In-process has fewer hops and uses `IISHttpServer` inside `w3wp`; out-of-process provides a separate app/Kestrel process behind ANCM. Both run under IIS integration, but only the latter uses Kestrel. `UseIIS` and `UseIISIntegration` are related hosting hooks for different models; neither should be manually added as a substitute for correct publish/runtime configuration. The Hosting Bundle/module, process model, app-pool identity, request limits, startup status, and logging all need to match the selected model.

## Examples

### Project setting

```xml
<PropertyGroup>
  <AspNetCoreHostingModel>OutOfProcess</AspNetCoreHostingModel>
</PropertyGroup>
```

Publish output contains a `web.config` with the hosting model and process-launch details. For framework-dependent deployment, a typical shape is `processPath="dotnet"` and `arguments=".\MyApp.dll"`; self-contained publishing uses the app executable. The deployment system generates important values, so inspect its produced configuration rather than hand-copying a sample blindly.

### Temporary startup diagnostics

When the app fails to start, enable `stdoutLogEnabled` briefly and set `stdoutLogFile` to a location writable by the app-pool identity but not publicly served. Reproduce the start, inspect the log and the IIS/ANCM status, then disable stdout logging and remove or securely archive the diagnostic files. Prefer normal structured application logging for steady-state operation.

## Common mistakes

- Assuming both hosting models use Kestrel.
- Changing Kestrel endpoints to fix an in-process `IISHttpServer` binding issue.
- Publishing without installing the supported Hosting Bundle/ANCM on the target IIS server.
- Diagnosing 500.30 as an out-of-process backend failure; 500.30 indicates in-process startup failure, while 502.5 commonly indicates out-of-process process/listener failure.
- Leaving stdout logging enabled or placing logs in a public directory.
- Treating ANCM `requestTimeout`, IIS request filtering, Kestrel body limits, and application timeouts as one setting.
- Sharing an app pool among in-process apps where the hosting model doesn't support it.
- Confusing IIS Express development behavior with a full IIS production deployment.
- Assuming IIS automatically configures forwarded headers for a Linux reverse proxy.

## Knowledge checks with answers

1. **Which model uses Kestrel under IIS?** Out-of-process; ANCM proxies to the separate Kestrel app process.
2. **What server handles in-process requests?** `IISHttpServer` inside the IIS worker process.
3. **What does a 502.5 normally indicate?** The out-of-process backend failed to launch or listen on its ANCM-provided port.
4. **Should stdout logging remain enabled in production?** No. Enable briefly with restricted filesystem access, collect the needed evidence, then disable and protect/remove the files.

## Sources

[ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module) · [In-process hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/in-process-hosting)

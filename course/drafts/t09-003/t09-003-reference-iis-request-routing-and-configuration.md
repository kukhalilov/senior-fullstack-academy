# Windows IIS application pools hosting and troubleshooting — Reference: HTTP.sys, sites, bindings, applications, paths, modules, and handlers

Sources: [ASP.NET Core 11 IIS hosting](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/iis/?preserve-view=true&view=aspnetcore-11.0), [IIS site configuration](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/), [IIS application configuration](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/application/), and [IIS binding configuration](https://learn.microsoft.com/en-us/iis/configuration/system.applicationhost/sites/site/bindings/binding).

## Scope and version

This reference describes current IIS routing and configuration concepts as used with ASP.NET Core 11 (GA November 2026). IIS site, binding, path, and configuration concepts are server features rather than .NET-versioned APIs. The ASP.NET Core handler is `AspNetCoreModuleV2`; confirm the installed Hosting Bundle/module registration on the target server.

## How this group fits the mental model

This group explains the front half of the request path: Windows accepts HTTP, IIS matches the endpoint to a site, the URL path identifies an application, and effective configuration selects a module/handler. The pool assignment is where the application’s process and identity policy begins. Logs are split by boundary: HTTPERR often describes failures before normal IIS processing; IIS access logs record processed requests.

## Supplied names explained

### Windows services and request path

- `Internet Information Services (IIS)` — Windows web-server platform that configures sites, applications, pools, modules, handlers, authentication, filtering, and logging. It coordinates with HTTP.sys and WAS rather than being one monolithic request process.
- `Windows Process Activation Service (WAS)` — Activates and manages application pools and worker processes. Its lifecycle decisions determine when a `w3wp.exe` process starts, stops, or is considered unhealthy.
- `World Wide Web Publishing Service (W3SVC)` — IIS service that configures HTTP functionality and works with WAS/HTTP.sys. A stopped or unhealthy service can affect web sites even if application files are intact.
- `HTTP.sys` — Kernel-mode Windows HTTP listener and request queue manager. It handles HTTP.sys-managed endpoint registration and can reject or queue a request before an application worker sees it.
- `HTTP.sys request queue` — Queue associated with an application pool’s HTTP processing. A full queue or unavailable destination can surface as a 503; raising the limit alone only permits more waiting and does not increase app throughput.

### Sites, bindings, and path boundaries

- `IIS site` — Top-level IIS object with one or more bindings and applications. Two sites may share an IP/port when host-name/TLS selection makes the endpoint unambiguous.
- `IIS site binding` — Endpoint rule identifying protocol and address/port, with optional host name and TLS certificate selection. A wrong binding can route a valid application to the wrong site or no site.
- `Binding protocol` — Usually `http` or `https`; HTTPS requires TLS configuration and a certificate binding. It is not an application hosting model.
- `Binding IP address` — Local address on which the site listens, or an all-unassigned choice. A binding to a specific address will not match traffic arriving only on another address.
- `Binding port` — TCP port for the endpoint, commonly 80 for HTTP and 443 for HTTPS. Firewall and listener availability must agree with this value.
- `Host header binding` — Host-name condition used to distinguish sites on a shared IP/port for HTTP routing. DNS must direct the name to the server; the header does not create DNS records.
- `Server Name Indication (SNI) binding` — TLS extension that supplies a host name during the TLS handshake so a server can select a certificate before HTTP headers exist. It is distinct from ordinary post-handshake host-header matching.
- `IIS application` — URL-path boundary that has application configuration and an application-pool assignment. A child application can have a different pool from its parent site/root application.
- `IIS root application` — Application at the site root path `/`. Site-level content without an explicitly created child application commonly belongs to this application.
- `IIS virtual directory` — URL path mapped to a physical directory. It is not automatically a separately activated application or process boundary; convert/configure it as an application when that boundary is required.
- `Physical path` — Filesystem directory to which an IIS object maps. Its ACLs are evaluated against the worker’s security identity, not the account that created the site.
- `Application path` — URL-relative path that identifies an IIS application, such as `/orders`. It is not the physical filesystem path, although IIS configuration maps between them.
- `Application pool assignment` — Association between an IIS application and a pool. This determines the worker-process policy/identity used for the application and matters for in-process ASP.NET Core isolation.

### Configuration and request selection

- `ApplicationHost.config` — IIS server-level configuration store, commonly under `%windir%\System32\inetsrv\config`. It defines sites, pools, and server settings; use IIS tooling/backup rather than editing it casually while services are active.
- `web.config` — XML configuration associated with an application/content directory. ASP.NET Core publish output normally places ANCM handler and process settings here; malformed XML or incorrect deployed values can prevent startup.
- `IIS configuration inheritance` — Child configuration inherits applicable parent/server settings unless overridden or locked. An effective setting can therefore differ from the nearest visible file.
- `<location> element` — IIS configuration container that scopes settings to a path or object and can control inheritance/override behavior. The path target and section delegation determine where it applies.
- `inheritInChildApplications` — Configuration attribute controlling whether settings in a location section flow into child applications. It can prevent a root app’s handler/configuration from accidentally affecting child apps.
- `IIS module` — Component in the IIS request pipeline that can inspect or modify requests/responses, authenticate, filter, rewrite, log, or hand off processing. Module order and scope can affect behavior.
- `IIS handler mapping` — Rule that maps a request/path/verb/resource to a handler. ASP.NET Core applications rely on the ANCM handler mapping emitted in their published configuration.
- `AspNetCoreModuleV2 handler` — Native IIS handler registered by the ASP.NET Core Module V2. It bootstraps in-process apps or starts/forwards to out-of-process apps according to ANCM configuration.
- `IIS Integrated pipeline mode` — IIS managed-pipeline mode that integrates classic ASP.NET modules with IIS request stages. It is separate from ASP.NET Core’s in-process/out-of-process hosting choice.
- `IIS Classic pipeline mode` — Compatibility pipeline mode for legacy ASP.NET applications. It should not be selected as a way to control ASP.NET Core hosting; ASP.NET Core uses ANCM.
- `IIS request filtering` — IIS feature for rejecting requests based on configured URL, extension, verb, header, or size rules. A rejection may occur before application code and should be diagnosed from IIS logs/configuration.
- `IIS URL Rewrite module` — Optional IIS extension that applies inbound/outbound URL rewrite or redirect rules. Rewrite rules can alter routing before ANCM; distinguish an internal rewrite from a client-visible redirect.

### Diagnostics and administration

- `IIS Failed Request Tracing (FREB)` — Trace facility that records selected failed requests and pipeline events. Configure narrow status/time/path rules and protect the resulting files, which may contain sensitive request data.
- `IIS access log` — Per-site W3C-style request log with status, substatus, time-taken, client, and other selected fields. Log fields and local/UTC interpretation must be checked before correlating timestamps.
- `HTTPERR log` — HTTP.sys error log, commonly under `%SystemRoot%\System32\LogFiles\HTTPERR`. It helps investigate rejected/queued requests that may never appear as normal site access-log entries.
- `IIS Manager` — Graphical management console for IIS configuration. It is convenient for inspection, but repeatable server configuration should be documented and automated where practical.
- `AppCmd.exe` — IIS command-line administration tool, commonly `%windir%\system32\inetsrv\appcmd.exe`. Useful commands include `list site`, `list apppool`, and `list wp`; verify the target server and command output before changing configuration.
- `Microsoft.Web.Administration.ServerManager` — .NET API for reading and modifying IIS configuration programmatically. Dispose the `ServerManager` object and commit changes deliberately; it operates on IIS configuration, not on application runtime state.

## Cross-item comparison

| Object | Identifies | Does not identify |
|---|---|---|
| Site binding | Network endpoint/site selection conditions | Application pool or filesystem directory |
| Application path | URL path boundary and app configuration | Physical directory by itself |
| Virtual directory | URL-to-directory mapping | Independent app/process boundary unless made an application |
| Application pool | Process policy and identity association | DNS name, URL path, or deployment artifact |
| HTTP.sys queue | Kernel HTTP request waiting/dispatch | Application-level queue or business work queue |

`HTTPERR` and IIS access logs answer different questions. If a request is absent from the site log, inspect listener registration, HTTP.sys errors, firewall, bindings, and routing first. If it is present, use its site/status/substatus and timestamp to continue through handler, ANCM, and application evidence.

## Examples

An HTTPS site for `api.example.test` uses a binding on port 443 with SNI and the matching certificate. A child `/admin` application is assigned to a separate pool; `/static` can instead be a virtual directory mapping to a shared content folder. The app pool identity receives read access to app binaries and narrowly scoped write access to uploaded files. A rewrite rule can redirect `/v1` to `/api/v1`, but it must not accidentally rewrite ANCM’s handler or a health-check path.

To inspect state without changing it, use commands such as `appcmd list site`, `appcmd list apppool`, and `appcmd list wp`. Then correlate the intended binding and path with IIS log fields. Prefer an IIS configuration backup and a reviewed, repeatable change for edits.

## Common mistakes

- Treating a site, application, virtual directory, and pool as synonyms.
- Assuming a correct DNS record guarantees IIS has a matching host/SNI binding.
- Granting filesystem rights to the deployment user instead of the runtime pool identity.
- Editing a parent `web.config` and overlooking inheritance into child applications.
- Using Integrated/Classic mode to choose ASP.NET Core hosting model.
- Assuming all errors appear in the IIS site log; HTTP.sys can reject earlier.
- Assuming rewrite rules run after ANCM or cannot affect handler selection.
- Making direct production configuration edits without capturing the effective state and backup.

## Knowledge checks with answers

1. **When is a virtual directory not enough?** When a separately configured application boundary, including its own pool assignment, is needed; create an IIS application for that path.
2. **Why can IIS access logs be empty for a failed connection?** HTTP.sys, TLS, firewall, or binding selection may reject traffic before normal site logging.
3. **What selects an SNI certificate?** The TLS client-supplied server name during the handshake, in conjunction with the HTTPS binding/certificate configuration.
4. **Does Integrated pipeline mean in-process ASP.NET Core?** No. Integrated/Classic are legacy IIS managed-pipeline modes; ANCM hosting model is a separate decision.
5. **Where should a rewrite-caused routing failure be investigated?** Inspect the effective rewrite configuration and FREB/pipeline evidence together with the resulting IIS access-log path/status.

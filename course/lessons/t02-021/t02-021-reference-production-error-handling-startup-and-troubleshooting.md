# deployment settings environments troubleshooting and performance — Reference: exception middleware safe error pages startup failures and diagnostics

## Scope and version

This lesson covers ASP.NET Core request exception handling and the operational evidence needed for startup troubleshooting. Production responses should be safe and stable while logs retain useful, access-controlled details. `IExceptionHandler` implementations are singleton services; they must be thread-safe and cannot capture scoped dependencies. The handler chain runs only when `UseExceptionHandler` is in the pipeline. [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) [API error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api) [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

## How this group fits the mental model

An exception can occur during host startup, in request middleware, or in endpoint/dependency code. Startup exceptions occur before a request exists and require process/host diagnostics. Request exceptions can be translated by exception middleware. A production client response should avoid sensitive internals; an operator needs correlation, logs, and diagnostics. These are separate outputs with different audiences.

## Supplied names explained

### Request exception handling

| Supplied name | Explanation |
|---|---|
| `UseExceptionHandler` | Adds exception-handling middleware. It can use an error path, a fallback pipeline, or registered `IExceptionHandler` services with an appropriate fallback configuration. |
| `ExceptionHandlerOptions` | Settings for the error path/handler and whether a 404 result is accepted from the handler. |
| `ExceptionHandlerOptions.ExceptionHandlingPath` | Path to re-execute when handling an exception; endpoint behavior at that path must produce the intended response. |
| `ExceptionHandlerOptions.ExceptionHandler` | Alternate callback pipeline for writing the error response. |
| `ExceptionHandlerOptions.AllowStatusCode404Response` | Allows a 404 response from the exception handler when that status is intentional; otherwise a 404 can be treated as a misconfigured handler response. |
| `ExceptionHandlerOptions.StatusCodeSelector` | Maps an unhandled exception to an HTTP status code before the configured error handler runs; use a deliberate allowlist of mappings and avoid exposing exception details. |
| `ExceptionHandlerOptions.CreateScopeForErrors` | Controls creating a separate DI scope when the middleware re-executes an error pipeline. Review it when error handling resolves scoped dependencies. |
| `ExceptionHandlerOptions.SuppressDiagnosticsCallback` | Since ASP.NET Core 10, controls suppression of diagnostics for exceptions handled by `IExceptionHandler`; default behavior suppresses handled-exception logs/event/metric tags. Set it deliberately if telemetry policy requires recording handled exceptions. |
| `ASP.NET Core 10 handled exception diagnostics suppression default` | ASP.NET Core 8 and 9 emitted diagnostics even for handled exceptions; ASP.NET Core 10 suppresses them by default when a registered handler returns `true`. This affects telemetry, not the response. |
| `SuppressDiagnosticsCallback` default changed in ASP.NET Core 10 | In ASP.NET Core 8 and 9, diagnostics were emitted for handled exceptions; ASP.NET Core 10 suppresses them by default when a registered handler returns true. This changes telemetry counts, not the client response. |
| `IExceptionHandler` | Contract for centrally handling selected exceptions and indicating whether the exception was handled. |
| `IExceptionHandler.TryHandleAsync` | Receives `HttpContext`, exception, and cancellation; return true only after writing the complete response. Return false to let later handlers/fallback process it. |
| `IServiceCollection.AddExceptionHandler<TExceptionHandler>` | Registers a handler implementation for the middleware's ordered chain. |
| `IExceptionHandler registration order` | Multiple registered handlers run in registration order until one returns true. Keep handlers narrow and nonoverlapping. |
| `IExceptionHandler singleton lifetime` | Handler instances are singleton; make state thread-safe and do not constructor-inject scoped services such as a request `DbContext`. |
| `ExceptionHandlerMiddleware handler chain and fallback behavior` | Runs registered handlers first; if none handles, the configured error path, Problem Details, or callback fallback handles the exception. |
| `AddProblemDetails and IProblemDetailsService` | Registers standardized Problem Details writing for supported middleware error paths when no custom response is written and the request accepts a supported format. It doesn't guarantee every failure receives a body. |
| `SuppressDiagnosticsCallback does not suppress unhandled or post-response-start exceptions` | The callback only applies when middleware handles the exception; unhandled exceptions and failures after response start are still logged. |
| `AddProblemDetails` and `IProblemDetailsService` | Registers Problem Details response support for exception/status-code middleware where no custom response exists and the request accepts a supported media type; it does not guarantee every error path receives a body. |
| `ExceptionHandlerOptions.SuppressDiagnosticsCallback` diagnostics boundary | The callback only governs middleware diagnostics for handled exceptions; unhandled exceptions and exceptions after response start continue to be logged. |
| `UseDeveloperExceptionPage` | Adds detailed developer diagnostics for local debugging. Never expose it publicly in Production. |
| `DeveloperExceptionPageMiddleware` | Renders exception diagnostics including stack/context data, which may disclose secrets, filesystem paths, and request values. |
| `Developer exception page is for Development only` | Restricts detailed failure output to a controlled development environment. Do not trust a client-supplied environment label. |
| `ExceptionHandlerOptions versus DeveloperExceptionPageOptions` | Exception-handler options define production/fallback response handling; developer-page options tune a diagnostic page and do not replace safe production handling. |
| `Production exception response and safe error detail` | Return a generic message/problem response with status and correlation identifier, not stack traces, SQL, paths, or credentials. |
| `Correlation ID in error responses and logs` | Provides a safe lookup key connecting a client report to protected structured logs/traces. Use a server-controlled or validated identifier. |
| `Exception logging duplication with IExceptionHandler` | Middleware may log unhandled exceptions; if a custom handler also logs every exception, duplicate records can result. Assign one primary logging owner or mark handling clearly. |

### Startup and diagnostics

| Supplied name | Explanation |
|---|---|
| `Startup exceptions versus request-time exceptions` | Startup failures occur before endpoints can serve a request; request exception middleware cannot catch all host-construction/startup failures. |
| `Application startup lifetime logs` | Startup/shutdown log events reveal whether the host reached started/stopping/stopped states. |
| `Microsoft.Hosting.Lifetime log category` | Framework log category for host lifetime events such as environment, listening addresses, and shutdown. |
| `Enable detailed diagnostics temporarily and restrict access` | Turn on high-detail diagnostics only long enough to investigate and protect the output/source from public access. |
| `ASP.NET Core Module startup stdout logs are not application logging` | ANCM stdout/stderr redirection is an emergency startup diagnostic, not a structured steady-state logger. |
| `ANCM stdout logging storage and sensitive-data cleanup` | Ensure app-pool write access without public serving, restrict permissions/retention, and disable/clean logs after diagnosis. |
| `Process exit code and host shutdown failure reporting` | Container/IIS/service managers use process exit information; inspect exit code, signals, and graceful-shutdown timeouts to distinguish app error from forced termination. |
| `Configuration binding failures during startup` | Missing or malformed deployment configuration can throw before the app is ready; validate and log the failing key/rule without its value. |
| `Required configuration validation and fail-fast startup` | Reject impossible/missing essential settings at startup rather than failing unpredictably on first production request. |
| `Database or downstream dependency failure policy at startup` | Decide whether a missing dependency blocks readiness or startup; avoid turning transient failures into restart loops. |
| `Readiness probe during initialization` | Keep the instance out of traffic until initialization requirements are met; readiness is distinct from liveness. |
| `Logging exception details without returning them to clients` | Store stack/details in protected logs and expose only safe error context externally. |
| `Do not expose stack traces, file paths, or secrets in Production` | Prevent error responses and diagnostics pages from disclosing implementation or credentials. |
| `Troubleshooting order: process, host, configuration, endpoint, dependency, request` | Follow the startup and request path in dependency order to isolate the earliest failing boundary. |
| `ASP.NET Core runtime and hosting bundle compatibility check` | Verify installed shared framework and IIS Hosting Bundle/ANCM match the published app's target and deployment mode. |
| `Current working directory and content-root mismatch diagnosis` | Compare process working directory, content root, publish layout, and relative file assumptions. |
| `File permissions and process identity diagnosis` | Check which identity runs the app and whether it can read configuration/certificates and write only intended locations. |
| `Port binding and address-in-use diagnosis` | Inspect effective URLs/listeners and identify another process or container mapping that owns the port. |
| `Proxy and forwarded-header redirect loop diagnosis` | Verify trusted forwarded scheme and middleware order when TLS terminates upstream. |
| `Startup diagnostics tools in infrastructure topic t09-013` | Scope boundary: deep runtime/process diagnostic tooling is taught in the operations track. |

## Cross-item comparison

`IExceptionHandler` handles request-time exceptions inside `UseExceptionHandler`; startup failures require host/process evidence. The Developer Exception Page is a diagnostic UI; exception middleware is a safe response policy. Readiness answers whether this instance should receive traffic, while liveness asks whether the process needs restarting. ANCM stdout logs can reveal pre-logger startup output but should be temporary; structured application logging is for ongoing observability.

## Examples

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<SafeExceptionHandler>();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler();
    app.UseHsts();
}
```

The handler service must write a complete safe response when it returns `true`; otherwise configure a valid fallback such as Problem Details. Keep exception details in protected logs, and ensure detailed development middleware cannot be enabled from untrusted deployment input.

Troubleshoot in order: confirm the process exists and its exit code; inspect host lifetime and selected environment; validate effective configuration and content root; verify binding/port and reverse proxy; check dependency readiness and identity permissions; then inspect request handling, logs, metrics, and traces. Change one layer at a time so the evidence remains interpretable.

## Common mistakes

- Registering `IExceptionHandler` but forgetting `UseExceptionHandler`.
- Returning `true` without setting the status and writing the complete response.
- Configuring a handler that returns a 404 without considering `AllowStatusCode404Response`.
- Injecting scoped dependencies into the singleton handler constructor.
- Logging the same exception in handler and middleware without a duplication policy.
- Using the Developer Exception Page in Production or trusting environment configuration from an uncontrolled source.
- Assuming exception middleware catches host startup failures.
- Leaving ANCM stdout logs enabled or inside a public directory.
- Failing readiness while a required dependency is temporarily unavailable in a way that causes restart storms, or marking ready before required initialization.
- Printing configuration values while diagnosing binding failures.

## Knowledge checks with answers

1. **Does registering `IExceptionHandler` activate it by itself?** No. Add `UseExceptionHandler` to invoke registered handlers.
2. **What does `TryHandleAsync` returning true promise?** The exception is handled; the handler must have written the complete response.
3. **Can a request exception middleware explain why the process failed before startup?** No. Inspect host, runtime, process, and hosting-module diagnostics.
4. **What should a client receive when an unexpected Production exception occurs?** A safe error/status and correlation identifier; operators can retrieve details from protected telemetry.

## Sources

[Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) · [API error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling-api) · [ANCM](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/aspnet-core-module)

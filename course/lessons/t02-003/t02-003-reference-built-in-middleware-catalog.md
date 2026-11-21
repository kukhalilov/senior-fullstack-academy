# ASP.NET Core middleware pipeline order and branching — Reference: Built-in middleware families and their exact registration extension names

## Scope and version

This is a selected API catalog, not a complete list of ASP.NET Core middleware. Method overloads and framework behavior should be compiled/tested against the target framework. Sources: [built-in middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/built-in?view=aspnetcore-11.0), [error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-11.0), [middleware ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0), and [static files](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/static-files?view=aspnetcore-11.0).

## How this group fits the mental model

Exception middleware translates thrown failures; status-code pages fill bodies for eligible error statuses; file and path helpers can rewrite or end a request; branch helpers select a pipeline; endpoint helpers map a handler. Choose by the event to handle, then place the component where it can observe that event.

## Supplied names explained

### Exception and status-code helpers

- **`UseDeveloperExceptionPage`** — Adds a developer diagnostic page for unhandled exceptions. Use only in Development; it can reveal stack traces, request details, and sensitive data. In current minimal hosting it is added automatically in Development unless the app changes the pipeline.
- **`UseExceptionHandler(IApplicationBuilder, Action<IApplicationBuilder>)`** — Creates an alternate exception-handling sub-pipeline, commonly ending in a safe Problem Details or plain error response. It must be early enough to wrap the components whose exceptions it should handle.
- **`UseExceptionHandler(RequestDelegate)`** — Configures a direct delegate to handle exceptions rather than an error path. The handler must write a complete safe response and cannot replace one after headers have been committed.
- **`UseExceptionHandler(string)`** — Re-executes the pipeline at a configured error path for unhandled exceptions. The handler path must be configured, safe from recursive failure, and mapped to a suitable endpoint/page.
- **`UseExceptionHandler(ExceptionHandlerOptions)`** — Uses options to configure the exception handler pipeline/path, status-code selection, and current diagnostics behavior. `StatusCodeSelector` can map exception types to statuses; avoid exposing exception details to clients.
- **`UseStatusCodePages(StatusCodePagesOptions)`** — Writes a body for eligible error responses that otherwise have an empty body. It does not catch exceptions, change successful responses, or replace a body already written.
- **`UseStatusCodePages(Func<StatusCodeContext, Task>)`** — Supplies custom asynchronous body generation for an eligible status code. The callback sees the status/context; it must avoid overwriting an existing response body and should honor content negotiation/application format.
- **`UseStatusCodePagesWithRedirects(string)`** — Sends a redirect to another URL, often with `{0}` replaced by the status. The browser address changes and the redirect response is not the original error payload; use only when that user experience is intended.
- **`UseStatusCodePagesWithReExecute(string, string?)`** — Re-runs the downstream pipeline at an alternate path without a client redirect, typically retaining the original status unless the re-executed endpoint changes it. The optional second argument is a query-string format. Downstream middleware may run a second time, so code must tolerate reentrancy and cached request-body/state work.

**Do not conflate the two families.** Exception middleware handles thrown exceptions. Status-code pages decorate selected empty 4xx/5xx responses. A 404 can be returned without throwing; a thrown exception may become a 500 or another mapped status. Put both early enough to wrap the components whose results they should handle.

### File and path helpers

- **`UseFileServer`** — Combines default-file discovery and static-file serving, and can optionally enable directory browsing. It may short-circuit the pipeline when it serves a matching file. Files exposed from a web root are public; enabling directory browsing can reveal names and structure.
- **`UsePathBase`** — Extracts a configured leading path segment from `Request.Path` and appends it to `Request.PathBase` when matched, then calls downstream middleware. Use when the app is mounted under a known prefix; coordinate with proxy rewriting to avoid double prefixes.
- **`UseCookiePolicy`** — Applies cookie-policy behavior to cookie operations, such as consent requirements and cookie attribute policy. Configure `CookiePolicyOptions` through options/service configuration and generally run this middleware before authentication/session components that write cookies.

### Branching and endpoint helpers in this catalog

- **`UseWhen`** — Builds a predicate-selected branch that normally rejoins the main pipeline when its branch delegates onward. Use for conditional cross-cutting behavior.
- **`MapWhen`** — Diverts matching requests to a predicate branch without automatic rejoining. Make the branch complete or explicitly compose any further work it needs.
- **`MapHealthChecks`** — Maps health-check execution to an endpoint route. Configure checks and decide separately whether the endpoint means liveness, readiness, or both; protect detailed health information and control exposure.

These helpers are not interchangeable. `UseFileServer` serves files; `UsePathBase` adjusts path state; `UseWhen`/`MapWhen` select middleware chains; `MapHealthChecks` registers an endpoint.

## Cross-item comparison

| Supplied overload | What the caller provides | Practical choice |
|---|---|---|
| `UseExceptionHandler(IApplicationBuilder, Action<IApplicationBuilder>)` | A configuration callback for an alternate error pipeline | Use when writing a custom fallback pipeline or Problem Details response. |
| `UseExceptionHandler(RequestDelegate)` | A direct async handler delegate | Use when a delegate can produce the full response without a separate route. |
| `UseExceptionHandler(string)` | An error path | Use when an existing error endpoint/page should handle re-execution. |
| `UseExceptionHandler(ExceptionHandlerOptions)` | Explicit handler options | Use for options such as `StatusCodeSelector` or diagnostics customization. |
| `UseStatusCodePages(StatusCodePagesOptions)` | Status-code page options | Use to configure the built-in status page behavior. |
| `UseStatusCodePages(Func<StatusCodeContext, Task>)` | Async response callback | Use for application-specific body generation from status/context. |
| `UseStatusCodePagesWithReExecute(string, string?)` | Path template and optional query-string template | Keep the original URL while re-executing the relevant downstream pipeline. |
| `UseStatusCodePagesWithRedirects(string)` | Redirect URL template | Use when navigation to a separate page is intended and client URL change is acceptable. |

## Examples

```csharp
app.UseExceptionHandler(errorApp => errorApp.Run(async context =>
{
    context.Response.StatusCode = StatusCodes.Status500InternalServerError;
    await Results.Problem(statusCode: StatusCodes.Status500InternalServerError)
        .ExecuteAsync(context);
}));

app.UseStatusCodePagesWithReExecute("/status/{0}");
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapHealthChecks("/health/ready");
```

The exception branch handles thrown failures; status-code re-execution handles eligible empty error statuses. Default-file middleware rewrites directory requests before static-file middleware serves the selected file. Only intentionally public files belong in the static root. The health endpoint should expose the minimum information appropriate to its audience.

## Common mistakes

- Registering status-code pages and expecting them to catch exceptions.
- Putting exception handling after the components it should wrap.
- Serving private files from a public static-file root.
- Enabling directory listings without considering information disclosure.
- Adding cookie policy after middleware that has already written cookies.
- Exposing detailed health results publicly.

## Knowledge checks with answers

1. **Does `UseStatusCodePages` catch exceptions?** No. It handles eligible error statuses whose response has no body.
2. **Redirects or re-execution?** Redirects change the client URL and issue a redirect; re-execution keeps the original URL and runs downstream handling again.
3. **Can later authorization protect a file served by earlier static-file middleware?** No. The file response can short-circuit before that authorization middleware.
4. **Why can an error handler fail after an endpoint starts streaming?** The response status/headers are already committed and cannot be replaced with a fresh error response.

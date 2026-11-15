# ASP.NET Core middleware pipeline order and branching — Reference: Built-in middleware families and their exact registration extension names

## Scope and version

These exact extension names cover only this supplied catalog. Their overloads may accept path, options, delegates, or branch builders; choose the documented overload for the required behavior. File, error, and status-code middleware solve different problems. [Built-in middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Errors](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-11.0)

## How this group fits the mental model

Classify each registration by its job: observe all requests, inspect matched endpoint metadata, serve a resource, branch to another chain, or terminate. Then determine which later stages it can skip and what response work runs on unwind.

## Supplied names explained

- `UseDeveloperExceptionPage` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePagesWithRedirects` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePagesWithReExecute` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseFileServer` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `UseWhen` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `MapWhen` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapHealthChecks` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `UsePathBase` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseCookiePolicy` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseExceptionHandler(IApplicationBuilder, Action<IApplicationBuilder>)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseExceptionHandler(RequestDelegate)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseExceptionHandler(string)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseExceptionHandler(ExceptionHandlerOptions)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePages(StatusCodePagesOptions)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePages(Func<StatusCodeContext, Task>)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePagesWithReExecute(string, string?)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePagesWithRedirects(string)` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.

## Cross-item comparison

This group contains related names, not interchangeable options. Compare the supplied items by matching condition, endpoint awareness, whether they invoke downstream work, whether they rejoin, and whether they can short-circuit. Static files and endpoint handlers have different authorization boundaries. Exception handling and status-code pages handle different failure shapes.

## Examples

```csharp
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Request-Id"] = context.TraceIdentifier;
        return Task.CompletedTask;
    });
    await next(context);
});
```

The callback is registered before the downstream chain and runs just before headers commit. For a branch, test both the condition match and fall-through. For endpoint-aware policy, ensure routing has selected metadata. For request-body inspection, avoid reading when possible; otherwise buffer within a strict limit, rewind, and redact sensitive data.

## Common mistakes

- Omitting `next` accidentally and silently skipping downstream middleware.
- Confusing exception handling with empty-status response handling.
- Assuming a file served directly is protected by later authorization.
- Treating automatic host insertion as proof of a desired order.
- Trusting client-supplied proxy headers or branch conditions as identity.
- Assuming a response can be replaced after it has started.

## Knowledge checks with answers

1. What should be checked first when endpoint metadata is needed? Routing must have selected the endpoint.
2. What ends the current path? A middleware return without invoking the remaining delegate, or terminal work.
3. What two cases should every branch test? A matching request and a request that falls through.

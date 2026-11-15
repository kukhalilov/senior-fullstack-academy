# ASP.NET Core middleware pipeline order and branching — Reference: Request delegates, next, short-circuiting, response unwind, and custom middleware

## Scope and version

This group is about the delegate contract and request/response lifecycle. Middleware is composed at startup and runs per request. Keep request data in the context/local stack, not fields on a reused instance. [Pipeline](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Custom middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-11.0)

## How this group fits the mental model

Classify each registration by its job: observe all requests, inspect matched endpoint metadata, serve a resource, branch to another chain, or terminate. Then determine which later stages it can skip and what response work runs on unwind.

## Supplied names explained

- `Middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Request delegate` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `RequestDelegate` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `HttpContext` — Represents per-request state, incoming request data, outgoing response state, or path boundaries. Do not retain request state after completion.
- `HttpRequest` — Represents per-request state, incoming request data, outgoing response state, or path boundaries. Do not retain request state after completion.
- `HttpResponse` — Represents per-request state, incoming request data, outgoing response state, or path boundaries. Do not retain request state after completion.
- `IApplicationBuilder` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `WebApplication.Use` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `IApplicationBuilder.Use` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `IApplicationBuilder.Run` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `IApplicationBuilder.Map` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `IApplicationBuilder.MapWhen` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `IApplicationBuilder.UseWhen` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `UseMiddleware<TMiddleware>` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `IMiddleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `IMiddlewareFactory` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware constructor activation` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Conventional middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Factory-based middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware Invoke method` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware InvokeAsync method` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `next RequestDelegate` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `Short-circuit middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Terminal middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Response unwind` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `Pipeline branch` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `PathBase in mapped branch` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Request body buffering` — Request bodies are normally forward-only. Buffer only for a necessary second read, cap resource use, rewind before delegation, and protect sensitive content.
- `EnableBuffering` — Request bodies are normally forward-only. Buffer only for a necessary second read, cap resource use, rewind before delegation, and protect sensitive content.
- `RequestAborted cancellation token` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `OnStarting callback` — Runs immediately before response headers are committed; register before downstream execution if headers need modification.
- `OnCompleted callback` — Runs after server-side response completion; it does not prove that a remote client consumed every byte.
- `HttpContext.Items` — Represents per-request state, incoming request data, outgoing response state, or path boundaries. Do not retain request state after completion.
- `HttpContext.Features` — Represents per-request state, incoming request data, outgoing response state, or path boundaries. Do not retain request state after completion.
- `Use overload with two arguments` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Use overload with three arguments` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware ordering` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware exception propagation` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Scoped dependency in conventional middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `IMiddleware scoped activation` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Middleware per-request allocation` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `ApplicationBuilder.Build` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `ApplicationBuilder.New` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `ApplicationBuilder.Properties` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.
- `IApplicationBuilder.ApplicationServices` — Names a pipeline concept in this bounded group. Determine whether it establishes context, selects a branch, applies policy, delegates, or ends processing; then verify its placement and behavior.

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

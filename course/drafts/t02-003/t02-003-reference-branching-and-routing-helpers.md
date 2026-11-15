# ASP.NET Core middleware pipeline order and branching — Reference: Path mapping, predicate branches, rejoining, and terminal delegates

## Scope and version

A branch composes another delegate path; endpoint mapping registers route handlers. `Map` is path-prefix based; `MapWhen` diverts by predicate; `UseWhen` normally rejoins. `MapGroup` organizes endpoint conventions, not middleware. [Branching](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0)

## How this group fits the mental model

Classify each registration by its job: observe all requests, inspect matched endpoint metadata, serve a resource, branch to another chain, or terminate. Then determine which later stages it can skip and what response work runs on unwind.

## Supplied names explained

- `Map branch extension` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Map path-prefix matching` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapWhen predicate branch` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `UseWhen predicate branch` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseWhen branch rejoin` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Map branch path trimming` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapWhen non-rejoining branch` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Branch application builder` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `PathString` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `PathBase` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Request.Path` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapGet endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapPost endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapPut endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapDelete endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapPatch endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapMethods endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapGroup endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapFallback endpoint mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapWhen versus UseWhen` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Map versus endpoint route mapping` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Run terminal delegate` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Run extension convention` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Use terminal branch` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Branch-specific middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Branch-specific services` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Branching on request path` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Branching on request header` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Branching on request query` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Branching by endpoint metadata` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.

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

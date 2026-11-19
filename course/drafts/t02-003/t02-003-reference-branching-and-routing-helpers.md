# ASP.NET Core middleware pipeline order and branching — Reference: Path mapping, predicate branches, rejoining, and terminal delegates

## Scope and version

This is about branching the middleware delegate chain. Endpoint route mapping (`MapGet`, controllers, Razor Pages) selects a handler through endpoint routing; it does not create an `IApplicationBuilder` branch. API behavior is checked against [middleware branching](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) and [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0).

## How this group fits the mental model

Use a branch when a subset of requests needs a different cross-cutting pipeline—for example, a diagnostics path or a legacy subtree. Decide four things before choosing an API: how the branch matches, which path values it sees, whether it rejoins, and whether it can reach normal endpoint routing. Never branch on client-supplied headers as an authorization boundary.

## Supplied names explained

- **`Map branch extension` / `Map path-prefix matching`** — `IApplicationBuilder.Map` selects a branch when the request path begins with the configured path segment. Matching is segment-aware (`/admin` should not accidentally mean `/administrator`). The matched prefix is removed from `Request.Path` and appended to `Request.PathBase` while the branch runs; ASP.NET Core restores path state afterward.
- **`Map branch path trimming` / `PathBase in mapped branch`** — The path adjustment above lets branch middleware/endpoints operate relative to the branch root. If the original path was `/admin/users`, inside the `/admin` branch it is typically `PathBase=/admin`, `Path=/users`.
- **`MapWhen predicate branch`** — `IApplicationBuilder.MapWhen` evaluates a predicate over `HttpContext` and sends matching requests into a separate branch. The predicate branch does not automatically rejoin the main pipeline after it completes; if the branch wants ordinary processing, compose that continuation explicitly in the branch.
- **`MapWhen non-rejoining branch`** — A matching request runs only the branch delegate; the original main-chain continuation is not automatically appended. A non-match continues down the main chain.
- **`UseWhen predicate branch`** — `IApplicationBuilder.UseWhen` builds a conditional branch for requests whose predicate is true, with the remaining main pipeline attached after the branch.
- **`UseWhen branch rejoin`** — If middleware inside the selected branch calls through its continuation and completes, execution continues in the main pipeline after the `UseWhen` registration. If branch middleware terminates or throws, normal rejoining does not occur.
- **`Branch application builder`** — `Map`, `MapWhen`, and `UseWhen` compose a child `IApplicationBuilder`; it shares the app's service provider/properties but has its own registration sequence.
- **`PathString`** — ASP.NET Core path value type with path-aware comparison/combination behavior. Prefer it to ad hoc substring checks when matching request paths.
- **`PathBase` / `Request.Path`** — `PathBase` is the app/mount prefix already consumed by upstream hosting/branches; `Path` is the remaining path. Reverse proxies and nested `Map` branches can affect both, so do not assume the browser URL equals `Request.Path`.
- **`Branching on request path`** — Prefer `Map` for a stable path-prefix boundary. It makes the branch's relative path explicit and avoids a hand-written string predicate.
- **`Branching on request header` / `Branching on request query`** — `MapWhen` or `UseWhen` can inspect such values, but they are untrusted request input. Do not use them alone to bypass authentication, authorization, rate limits, or other security controls.
- **`Branching by endpoint metadata`** — A predicate can inspect `HttpContext.GetEndpoint()` only after routing has selected an endpoint. Place such branching after routing, and remember that not-found requests have no selected endpoint.

## Endpoint route helpers are different

- **`MapGet endpoint mapping`, `MapPost endpoint mapping`, `MapPut endpoint mapping`, `MapDelete endpoint mapping`, `MapPatch endpoint mapping`** — These methods register endpoints selected by route pattern and HTTP method. They do not trim `Request.Path`, build a child middleware pipeline, or behave like `IApplicationBuilder.Map`.
- **`MapMethods endpoint mapping`** — Registers a route handler for an explicit set of HTTP methods. Use it when the supported method set is intentional; ordinary verb-specific methods communicate the common cases more clearly.
- **`MapGroup endpoint mapping`** — Creates a group of route endpoints that share a prefix and can receive conventions/metadata such as authorization, tags, or filters. It is an endpoint organization feature, not a path middleware branch.
- **`MapFallback endpoint mapping`** — Registers a low-priority fallback endpoint, commonly for client-side application navigation. Constrain its route and ordering so it does not capture unmatched API routes unintentionally.
- **`MapWhen versus UseWhen`** — Both select by a predicate; `MapWhen` does not automatically attach the main continuation, while `UseWhen` normally rejoins when its branch calls next.
- **`Map versus endpoint route mapping`** — `app.Map("/x", ...)` composes a middleware branch and adjusts path state; `app.MapGet("/x", ...)` registers an HTTP endpoint selected by routing. The overload/context determines which meaning applies.

## Termination and continuation

- **`Run terminal delegate` / `Run extension convention`** — `Run` appends terminal work without a `next` delegate. It is suitable at the end of a branch or app pipeline.
- **`Use terminal branch`** — A `Use` component can also terminate by not invoking its continuation. This is conditional and can be useful for a deliberate rejection; accidental omission silently hides later handlers.
- **`Branch-specific middleware`** — Register only behavior needed inside the branch, after branch selection. Middleware outside the branch wraps both matched and unmatched requests; middleware inside it sees only matching requests.
- **`Branch-specific services`** — A branch shares the application's service provider; `IApplicationBuilder.New()` does not create an isolated DI container. Use route groups/endpoints, keyed services, or explicit service design if behavior must vary by endpoint/tenant. Avoid implying a pipeline branch provides a security or DI boundary.

## Cross-item comparison

| API | Match | Path adjustment | Does selected work rejoin main chain? | Typical use |
|---|---|---|---|---|
| `Map` | Path prefix | Moves matched prefix from `Path` into `PathBase` | Branch has its own composed path; no automatic continuation into post-Map registrations | A subtree such as `/health-ui` or `/legacy` |
| `MapWhen` | Arbitrary predicate | None by itself | No automatic rejoin after branch | Predicate-based alternative pipeline |
| `UseWhen` | Arbitrary predicate | None | Yes, if branch calls its continuation and completes | Conditional middleware that should still flow into normal endpoint handling |
| `MapGroup` / `MapGet` | Endpoint route matching | No branch trimming | Endpoint execution is governed by routing | Related HTTP handlers and metadata |

## Examples

```csharp
app.UseWhen(
    context => context.Request.Headers.ContainsKey("X-Debug-Trace"),
    branch => branch.Use(async (context, next) =>
    {
        context.Items["debugTrace"] = true;
        await next(context);
    }));

app.Map("/legacy", legacy =>
{
    legacy.Use((context, next) =>
    {
        context.Response.Headers["X-Legacy-Branch"] = "true";
        return next(context);
    });
    legacy.Run(async context => await context.Response.WriteAsync(context.Request.Path));
});
```

The `UseWhen` branch rejoins normal routing because its middleware calls next. The header is used only to select harmless diagnostics behavior. The `/legacy` branch receives a path relative to `/legacy` and terminates at its `Run` delegate. Do not treat either branch as an authorization boundary.

## Common mistakes

- Confusing `Map` with `MapGet` because they share a name.
- Assuming `MapWhen` rejoins automatically like `UseWhen`.
- Testing `/admin` but not `/administrator` or a nested mount where `PathBase` is already set.
- Branching on an endpoint before `UseRouting` has populated endpoint metadata.
- Using query/header branch predicates to skip security middleware.
- Expecting a branch builder to own a separate DI container.

## Knowledge checks with answers

1. **Which branch API normally rejoins?** `UseWhen`, if the branch invokes its next delegate and completes.
2. **What changes inside `Map("/admin", ...)`?** The matched prefix is represented in `PathBase` and removed from the branch's `Path`.
3. **How do `MapWhen` and `UseWhen` differ?** Both select by predicate, but `UseWhen` attaches the remaining pipeline for rejoining; `MapWhen` does not do so automatically.
4. **Does `MapGroup` create middleware branch semantics?** No. It organizes endpoint routes and shared metadata/conventions.

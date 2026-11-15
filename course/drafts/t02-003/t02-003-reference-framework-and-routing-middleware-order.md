# ASP.NET Core middleware pipeline order and branching — Reference: Framework defaults, routing, endpoint execution, and ordering constraints

## Scope and version

`WebApplication` may insert routing, endpoint execution, and configured authentication/authorization. Those defaults do not guarantee every app-specific placement. Ask whether routing has selected metadata and whether the component must surround endpoint execution. [Ordering](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0) [Routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0)

## How this group fits the mental model

Classify each registration by its job: observe all requests, inspect matched endpoint metadata, serve a resource, branch to another chain, or terminate. Then determine which later stages it can skip and what response work runs on unwind.

## Supplied names explained

- `WebApplication automatic middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Developer exception page middleware` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Exception handler middleware` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Status code pages middleware` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `HTTPS redirection middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `HSTS middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Static file middleware` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `Default files middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Directory browsing middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Routing middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Endpoint middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseRouting` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseEndpoints` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `WebApplication.Map endpoint execution` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `UseAuthentication` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `UseAuthorization` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `UseCors` — Applies browser cross-origin policy. Place it where routing metadata and preflight handling are available; it is not server-side authorization.
- `UseRateLimiter` — Applies global or endpoint-specific limits. Endpoint metadata based selection requires routing first; rejection status and retry information need deliberate handling.
- `UseResponseCaching` — Controls response reuse or representation encoding. Choose order and variation so shared caches do not mix users, origins, or encodings.
- `UseResponseCompression` — Controls response reuse or representation encoding. Choose order and variation so shared caches do not mix users, origins, or encodings.
- `UseOutputCache` — Controls response reuse or representation encoding. Choose order and variation so shared caches do not mix users, origins, or encodings.
- `UseSession` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseRequestLocalization` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseAntiforgery` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseForwardedHeaders` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `UseHostFiltering` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseWebSockets` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseHttpLogging` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Use(next) middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseExceptionHandler` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseStatusCodePages` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `UseHttpsRedirection` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseHsts` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `UseStaticFiles` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `UseDefaultFiles` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `UseDirectoryBrowser` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `MapControllers endpoint execution` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapRazorPages endpoint execution` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `MapFallback endpoint execution` — Selects or describes a pipeline branch or endpoint. Distinguish path-prefix branches from predicate branches and endpoint route mapping; test both matching and fall-through behavior.
- `Authentication before authorization` — Establishes the request principal or evaluates its policy. Authentication must precede authorization, and endpoint metadata must be available when policy execution needs it.
- `CORS relative to endpoint routing` — Applies browser cross-origin policy. Place it where routing metadata and preflight handling are available; it is not server-side authorization.
- `Endpoint-aware rate limiting after routing` — Applies global or endpoint-specific limits. Endpoint metadata based selection requires routing first; rejection status and retry information need deliberate handling.
- `Request localization before culture-sensitive middleware` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.
- `Forwarded headers before HTTPS and remote IP consumers` — Processes proxy-supplied scheme/address information. Restrict accepted hops to trusted proxies/networks and run before consumers of scheme or client IP.
- `Exception handler near pipeline start` — Handles a thrown failure or an existing error status, depending on the specific API. Exception boundaries and status-code pages are different mechanisms; response commitment limits recovery.
- `Static files bypass downstream authorization by default` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `Static file authorization endpoint pattern` — Serves or exposes files and may short-circuit before endpoint policies. Treat web-root content as public; private delivery needs an explicit authorization check.
- `Middleware order and reverse response order` — A request-pipeline component or registration. Determine whether it delegates, branches, or terminates; its position controls what it sees and which work can run afterward.

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

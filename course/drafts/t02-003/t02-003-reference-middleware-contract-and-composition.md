# ASP.NET Core middleware pipeline order and branching — Reference: Request delegates, next, short-circuiting, response unwind, and custom middleware

## Scope and version

This reference explains the ASP.NET Core request-delegate contract and custom middleware activation. It does not replace the ordering catalog or endpoint-routing reference. Current API behavior is checked against [middleware fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware?view=aspnetcore-11.0), [custom middleware guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-11.0), [factory-based activation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/extensibility?view=aspnetcore-11.0), and [request/response operations](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/request-response?view=aspnetcore-11.0).

## How this group fits the mental model

At application startup, registrations are composed into delegates. At request time, the server creates an `HttpContext` and invokes the first delegate. Each middleware can do work, await the next delegate, then do response-side work. That creates a nested call stack: request-side execution moves forward; post-`next` execution unwinds in reverse. Returning without invoking `next` short-circuits the rest of that path. An exception similarly skips ordinary post-next work while it propagates outward, unless middleware catches it.

## Supplied names explained

### Delegate contract and pipeline construction

- **Middleware** — A component in the HTTP request/response chain. It can inspect or mutate context, call downstream middleware, branch to another chain, or finish the response.
- **Request delegate / `RequestDelegate`** — A delegate that accepts an `HttpContext` and returns a `Task`. Calling it hands control to the rest of the composed pipeline; awaiting it observes downstream completion and exceptions.
- **`HttpContext`** — Per-request container for request, response, user, selected endpoint, features, cancellation, and other request state. Do not retain it or its request-scoped objects beyond request completion.
- **`HttpRequest` / `HttpResponse`** — The incoming request and outgoing response surfaces. Request body reads consume a stream; response headers/status become immutable once the response starts.
- **`IApplicationBuilder`** — Startup-time composition API exposing services, properties, server features, and methods that add middleware. It builds a request delegate; it is not the runtime request context.
- **IApplicationBuilder.Map** — Path-prefix middleware-branch API; it is distinct from endpoint route mapping.
- **IApplicationBuilder.MapWhen** — Predicate branch API that does not automatically rejoin the main pipeline.
- **IApplicationBuilder.UseWhen** — Predicate branch API that normally rejoins when its branch delegates onward.
- **`WebApplication.Use` / `IApplicationBuilder.Use`** — Add a component that receives the current context and a continuation. Use it when work must run before and/or after downstream processing.
- **`IApplicationBuilder.Run` / `Run` extension convention** — Append terminal request handling with no `next` continuation. A terminal delegate handles the request reaching it, so registrations after it are unreachable on that path.
- **`UseMiddleware<TMiddleware>`** — Adds a middleware type. For conventional middleware, ASP.NET Core creates the component during pipeline construction and invokes its `Invoke`/`InvokeAsync` per request. If the type implements `IMiddleware`, activation goes through `IMiddlewareFactory` instead.
- **`ApplicationBuilder.Build`** — Completes composition into a `RequestDelegate`; adding registrations afterward does not alter the already-built delegate.
- **`ApplicationBuilder.New`** — Creates a new builder branch that inherits the application's service provider and properties while composing a separate pipeline.
- **`ApplicationBuilder.Properties`** — Startup-time string/object property bag shared with related application builders; it is not a safe place for request-specific values.
- **`IApplicationBuilder.ApplicationServices`** — Root service provider available during pipeline construction. Resolving scoped dependencies from this root does not create a per-request scope.

### Inline middleware, continuation, and control flow

- **`next RequestDelegate`** — The continuation representing all downstream middleware. Invoke/await it once for ordinary pass-through behavior; omitting the call intentionally short-circuits. Do not invoke it multiple times unless the entire downstream chain is explicitly safe to execute repeatedly.
- **Use overload with two arguments** — The `Func<HttpContext, Func<Task>, Task>` shape uses a zero-argument continuation. It is convenient for inline middleware; call `next()` to continue.
- **Use overload with three arguments** — The `Func<HttpContext, RequestDelegate, Task>` shape passes the downstream delegate explicitly and avoids the small adapter used by the two-argument form. Call `next(context)` to continue.
- **Short-circuit middleware** — Produces a response or otherwise ends this branch without calling downstream middleware. Examples include rejecting a request or serving a matching static file.
- **Terminal middleware** — A component with no continuation, or a component that deliberately ends processing. `Run` is the common registration form; a branch can also terminate locally.
- **Middleware ordering** — Determines which request mutations, endpoint metadata, exceptions, and responses each component can observe. A component only wraps registrations composed after it.
- **Middleware exception propagation** — An awaited downstream exception bubbles to earlier middleware. An outer exception boundary can translate it only if the response has not already started; a normal status code is not itself an exception.
- **Response unwind** — Work after `await next(...)` runs after downstream completion in reverse order. The response may already be committed, so late changes to status or headers can fail.
- **Pipeline branch** — A separately composed delegate selected by path or predicate. Its fall-through/rejoin behavior depends on the branch API, not simply on its name.

### Conventional versus factory-based middleware

- **Conventional middleware / Middleware constructor activation** — A class with a constructor accepting `RequestDelegate` (often as its first parameter) and a `Task`-returning `Invoke` or `InvokeAsync(HttpContext, ...)` method. `UseMiddleware` creates it at application setup; constructor dependencies must be safe for application lifetime.
- **`Middleware Invoke method` / `Middleware InvokeAsync method`** — Per-request method called by the pipeline. It must accept `HttpContext` first and return `Task` (or an accepted compatible task type). Additional method parameters can be resolved from request services by `UseMiddleware`.
- **Scoped dependency in conventional middleware** — Do not inject a request-scoped service into a conventional middleware constructor because that middleware instance is reused. Inject it into `InvokeAsync` parameters or choose factory-based activation.
- **`IMiddleware`** — Factory-based middleware contract with `Task InvokeAsync(HttpContext, RequestDelegate)`. Register the implementation with DI, commonly scoped or transient, so the factory can create it per request.
- **`IMiddlewareFactory` / factory-based middleware** — DI-backed activation path used by `UseMiddleware` when the middleware type implements `IMiddleware`. The default factory resolves it from request services and releases it after invocation.
- **IMiddleware scoped activation** — Allows constructor injection of scoped services because activation occurs from the request service provider. The middleware still must not retain request state in static/shared state.
- **Middleware per-request allocation** — Conventional middleware usually avoids constructing a class for every request; `IMiddleware` favors request-scoped constructor dependencies but may allocate/resolve per request. Choose based on lifetime needs and measure before optimizing.

### Request data, callbacks, and buffering

- **RequestAborted cancellation token** — Signals that the client connection/request was aborted or the server is stopping the request. Pass it to cancellable I/O and avoid treating expected cancellation as an application fault.
- **`HttpContext.Items`** — Per-request key/value storage for cooperating middleware and handlers. Prefer typed features or explicit services when ownership and contracts need to be clearer.
- **`HttpContext.Features`** — Collection of server/framework feature interfaces for the current request, sometimes replaceable by middleware. Feature availability can vary by server and pipeline stage.
- **OnStarting callback** — Registers work to run immediately before response headers are committed. Register before calling downstream middleware if it must set headers for an endpoint response. Callbacks run in reverse registration order.
- **OnCompleted callback** — Registers server-side work after response processing completes. It is suitable for cleanup/metrics, but does not prove that the remote client received or processed every byte.
- **PathBase in mapped branch** — When IApplicationBuilder.Map matches a path prefix, that prefix appears in `PathBase` and is removed from the branch's `Request.Path`.
- **Request body buffering / `EnableBuffering`** — Request bodies are normally forward-only. `EnableBuffering` permits rereading by buffering in memory and, for larger content, potentially temporary storage; configure limits, rewind the body before downstream binding, and account for sensitive-data retention and disk pressure.

## Cross-item comparison

| Need | API/pattern | Key consequence |
|---|---|---|
| Inline before/after behavior | `Use` | Calls continuation explicitly; omission ends the branch. |
| Class middleware with shared dependencies | Conventional `UseMiddleware<T>` | Constructed at startup; scoped services belong in `InvokeAsync` parameters. |
| Class middleware needing scoped constructor dependencies | `IMiddleware` + DI/`IMiddlewareFactory` | Factory activates it from request services; typically one instance per request. |
| End this chain | `Run` or no continuation call | Later middleware on this path does not execute. |
| Read the body again | `EnableBuffering` then rewind | Costs resources and can expose sensitive payloads; use bounded, narrowly scoped inspection. |

## Examples

```csharp
public sealed class TimingMiddleware(RequestDelegate next, ILogger<TimingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context, IRequestAudit audit)
    {
        var started = Stopwatch.GetTimestamp();
        try
        {
            await next(context);
        }
        finally
        {
            await audit.RecordAsync(context.TraceIdentifier, context.Response.StatusCode,
                Stopwatch.GetElapsedTime(started), context.RequestAborted);
            logger.LogDebug("Request {TraceId} completed", context.TraceIdentifier);
        }
    }
}
```

Here `IRequestAudit` is resolved per request because it is a method parameter; the reusable middleware instance stores only application-lifetime dependencies. Production telemetry must also decide how to handle an audit-write failure without hiding the original request exception.

## Common mistakes

- Calling `next` twice can execute endpoint side effects twice.
- Failing to await `next` can let response work race with downstream execution.
- Throwing after response start cannot reliably replace the response with a clean error document.
- Reading a body before model binding without buffering and rewinding leaves downstream code at end-of-stream.
- Buffering unbounded bodies can exhaust memory or temporary storage.
- Constructor-injecting scoped dependencies into conventional middleware captures the wrong lifetime.
- Storing `HttpContext`, user data, or mutable per-request state in middleware fields leaks data across concurrent requests.

## Knowledge checks with answers

1. **What does `next` represent?** The remainder of the pipeline; awaiting it gives downstream completion and lets this middleware run response-side work.
2. **Why can conventional middleware not constructor-inject a scoped `DbContext`?** Its instance is application-lifetime; inject the service into `InvokeAsync` or use `IMiddleware` activated per request.
3. **When can response headers still be changed?** Before the response starts; `OnStarting` is the hook immediately before headers commit.
4. **What must happen after buffered body inspection?** Reset `Request.Body.Position` to the beginning before downstream processing and enforce buffering limits.

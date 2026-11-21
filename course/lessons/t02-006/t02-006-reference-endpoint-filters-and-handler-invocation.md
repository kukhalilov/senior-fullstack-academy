# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Reference: Filter interfaces, invocation context, factories, and short-circuit results

Sources: Microsoft's [Minimal API filter guide](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-11.0), [Minimal APIs overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), and [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0).

## Scope and version

This reference covers filters that wrap Minimal API route-handler invocation. It excludes MVC action filters and general middleware behavior except for comparison.

## Invocation model

`IEndpointFilter.InvokeAsync` receives an `EndpointFilterInvocationContext` and an `EndpointFilterDelegate`. The context exposes `HttpContext`, the mutable argument list, and `GetArgument<T>(index)` for typed access. A filter can inspect/replace an argument, await the next delegate, inspect/transform the returned object, or return early. The delegate represents the remainder of the filter chain plus handler. Call it at most once; omitting it short-circuits. Ensure returned values are supported handler result/value types.

Filters are composed in registration order with nested before/after execution. Group filters apply to endpoints in the group; endpoint filters apply to one endpoint. `AddEndpointFilter` adds an instance or callback; `AddEndpointFilter<TFilter>` resolves a filter implementation through DI according to its activation model. `AddEndpointFilterFactory` provides endpoint-aware construction. `IEndpointFilterFactory.CreateInstance` receives `EndpointFilterFactoryContext` (including handler method metadata) and a next filter, and creates a delegate once while building the endpoint. Use this to inspect the handler signature and build a typed adapter instead of repeatedly discovering parameter information per request.

`EndpointFilterAttribute` attaches filter metadata/declaration to handler methods in supported scenarios. `EndpointFilterFactoryContext.MethodInfo` exposes reflection metadata; avoid making fragile assumptions about compiler-generated lambda method shapes. `IEndpointFilterFactory` and factory delegates can capture endpoint-stable metadata; request-specific data belongs in each invocation context. Understand service lifetimes: endpoint construction can occur once, while a filter instance may serve concurrent requests. Do not store request state in fields. “Minimal API route-handler filter model” is a descriptive label for these endpoint filters, not the name of a public `RouteHandlerFilter` class.

## What filters can and cannot do

Filters are useful for endpoint-local argument validation, timing, result transformation, and shared handler behavior. They can inspect `HttpContext`, but their existence does not enforce authorization unless an authorization policy is also attached and processed by authorization middleware. They do not wrap pre-routing middleware or all request processing. Use middleware for broad correlation, exception handling, and behavior that must apply to non-Minimal endpoints. Use MVC filters for controller-action-specific contexts.

In ASP.NET Core 11, a configured filter pipeline also runs after supported parameter-check failures such as invalid route/query/header parsing. The response status is 400 and the handler is skipped; in Development, set `RouteHandlerOptions.ThrowOnBadRequest = false` so the filter observes the 400 rather than a developer exception. This does not cover body deserialization failures or exceptions thrown by custom binding. Exception handling is otherwise endpoint-local: a filter can catch exceptions from the inner handler delegate if it wraps that await in `try/catch`, but it does not catch failures before the filter runs, outer middleware, or result execution after it returns. Use exception-handling middleware for consistent application-wide error mapping.

Result transformation is type-sensitive. `IResult` implementations may expose metadata interfaces such as `IStatusCodeHttpResult`, `IValueHttpResult<T>`, `IContentTypeHttpResult`, or `IFileHttpResult`; check the relevant interface before casting. A transformed value still needs to be a valid endpoint result and may alter OpenAPI/runtime expectations. Keep declared metadata aligned with actual transformed response.

## Example: validate and time a handler

```csharp
app.MapGet("/items/{id:int}", GetItem)
   .AddEndpointFilter(async (context, next) =>
   {
       var id = context.GetArgument<int>(0);
       if (id <= 0)
           return TypedResults.BadRequest(new { error = "id must be positive" });

       var started = Stopwatch.GetTimestamp();
       try { return await next(context); }
       finally { metrics.Record(Stopwatch.GetElapsedTime(started)); }
   });
```

The example illustrates a handler-level guard and timing. A production implementation must verify argument index/type when generic filter reuse is intended, avoid leaking details, use an injected metric service with a safe lifetime, and keep domain invariants in the application service. Prefer the built-in request validation model for ordinary DTO/DataAnnotations cases.

## Cross-item comparison

Middleware wraps a broader HTTP pipeline and can cover static or non-Minimal requests. Endpoint filters wrap one Minimal handler and can inspect bound arguments. MVC action filters wrap MVC action invocation and use MVC contexts. A route-group filter shares behavior across related handlers; a single-endpoint filter localizes it.

## Common mistakes

Calling the continuation more than once; assuming argument indexes without checking handler signatures; doing heavy reflection per request; capturing scoped services in a long-lived factory/filter; storing `HttpContext` or mutable request state; assuming filters execute authorization; catching all exceptions locally; and changing result shapes without matching response metadata.

## Knowledge checks with answers

1. **What does `next(context)` represent?** The remaining filter chain and handler invocation.
2. **How does a filter short-circuit?** Return a supported result without invoking the continuation.
3. **Why is filter instance state risky?** Endpoint/filter instances can be reused concurrently across requests.
4. **When is middleware preferable?** When behavior must cover broader pipeline stages or endpoint types.

## Exact terms covered

### Exact terms covered

- `IEndpointFilter`
- `IEndpointFilter.InvokeAsync`
- `EndpointFilterInvocationContext`
- `EndpointFilterDelegate`
- `EndpointFilterFactoryContext`
- `IEndpointFilterFactory`
- `IEndpointFilterFactory.CreateInstance`
- `AddEndpointFilter`
- `AddEndpointFilter<TFilter>`
- `AddEndpointFilterFactory`
- `EndpointFilterAttribute`
- `EndpointFilterFactoryContext.MethodInfo`
- `EndpointFilterInvocationContext.HttpContext`
- `EndpointFilterInvocationContext.Arguments`
- `EndpointFilterInvocationContext.GetArgument<T>`
- `EndpointFilterDelegate invocation`
- `Endpoint filter order`
- `Endpoint filter short-circuit`
- `Endpoint filter result transformation`
- `Endpoint filter exception handling`
- `Endpoint filter argument validation`
- `Endpoint filter dependency injection`
- `Endpoint filter on route group`
- `Endpoint filter on single endpoint`
- `Endpoint filter versus MVC action filter`
- `Endpoint filter versus middleware`
- `Endpoint filter metadata`
- `Endpoint filter factory activation`
- `Minimal API route-handler filter model`
- `IEndpointFilterFactory service lifetime`
- `Endpoint filter invocation allocation`
- `Endpoint filter HTTP context access`
- `Endpoint filter before and after handler`
- `Filter result serialization`
- `Endpoint filters observe parameter-binding failures in ASP.NET Core 11`

## How this group fits the mental model
A filter is a nested invocation wrapper between binding and the handler result; it is endpoint-scoped rather than application-wide.

## Supplied names explained
The preceding material explains every declared interface, context, delegate, attribute, factory, activation, order, lifetime, short-circuit, result, exception, and middleware comparison.

## Examples
See the async validation/timing example above; it demonstrates argument inspection, early return, continuation, and finally-based after behavior.

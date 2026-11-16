# ASP.NET Core MVC controllers actions filters conventions and results — Reference: Filter stages, scope/order, synchronous and asynchronous filter interfaces

Sources: Microsoft's [filters guide](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0).

## Position in the request pipeline

Middleware composes the application-wide request pipeline and can run before endpoint selection, across endpoint types, and after an endpoint returns. MVC filters are invoked only for MVC action execution, after routing has selected an MVC endpoint. Use middleware for broad exception handling, correlation, transport concerns, or behavior shared with Minimal APIs. Use a filter when it needs MVC action context, arguments, action results, or result-execution hooks.

The usual filter stages are authorization, resource, action, exception, and result. Authorization filters run first in MVC. Resource filters run around most of MVC, including model binding, and may short-circuit expensive work. Action filters surround action invocation. Exception filters handle exceptions from action execution or result creation in a defined, narrower boundary; they do not catch failures in middleware before MVC or serve as a universal exception handler. Result filters surround execution of an action result. Always-run result filters also run in cases where ordinary result filters may be skipped by an earlier short circuit. Exact flow should be verified for the filter type and the result/exception path in question.

## Sync and async contracts

Synchronous interfaces expose before/after callbacks. Asynchronous interfaces receive a continuation delegate and typically call it exactly once; code before the `await next()` is before the inner pipeline and code afterward is after it. If an async filter chooses not to call the delegate, it short-circuits and must set the appropriate result/handled state. Prefer async filters for asynchronous work; blocking on asynchronous operations harms scalability. Implement one path for a given concern. `ActionFilterAttribute` implements both sync and async patterns, so overriding both can cause surprising dispatch behavior; follow the framework contract and test the selected path.

The contexts expose stage-specific data: action contexts contain action arguments/result and action-executed information; resource contexts surround resource execution; exception context reports the exception and whether it was handled; result contexts allow result execution to be observed or canceled. “After” callbacks run during unwinding, so their behavior when inner code throws or short-circuits differs from a simple linear sequence. Async delegates (`ActionExecutionDelegate`, `ResourceExecutionDelegate`, `ResultExecutionDelegate`) communicate continuation and completion.

## Scope, order, and activation

Filters may be registered globally, on a controller, or on an action. Scope determines nesting; global, controller, and action scopes are represented by `FilterScope` values. `IOrderedFilter.Order` provides explicit ordering across applicable filters. Read the documented ordering rules and test order-sensitive behavior instead of inferring it from source-code appearance. A filter that short-circuits can prevent inner filters and the action from running.

Global filters can be added to MVC options. Attribute filters are represented as descriptors/items and are materialized through filter providers/factories. `ServiceFilterAttribute` resolves an existing filter from the service provider (so it must be registered); `TypeFilterAttribute` creates its implementation type and uses DI for constructor dependencies, with optional explicit arguments. `IFilterFactory` and `FilterFactory` participate in filter creation; `FilterItem` and `FilterDescriptor` carry metadata through the pipeline. `IsReusable` signals possible reuse but does not promise a singleton lifetime or make captured request state safe. Filters should be stateless where possible and should not retain `HttpContext`, action arguments, or scoped services after the request.

## Exceptions and short-circuit details

An authorization filter may set a result to prevent later MVC stages. A resource filter can return a cached result before model binding/action execution. An action filter can replace the action result or skip invocation. Exception filters can mark an exception handled and provide a result, but handling is scoped to their stage; exceptions thrown while executing an error result still need appropriate outer handling. Result filters can cancel result execution, but doing so means headers/body may not be written. Always-run variants cover additional short-circuited-result cases. Prefer centralized exception middleware for consistent problem responses across MVC, Minimal APIs, and middleware failures.

## Complete declared API and concept inventory

The following index is the manifest's complete declared inventory for this reference. It is a coverage checklist; the stage, lifetime, and control-flow semantics are explained above.

### Exact terms covered

- `MVC filter pipeline`
- `Authorization filter`
- `Resource filter`
- `Action filter`
- `Exception filter`
- `Result filter`
- `IAsyncAuthorizationFilter`
- `IAuthorizationFilter`
- `IAsyncResourceFilter`
- `IResourceFilter`
- `IAsyncActionFilter`
- `IActionFilter`
- `IAsyncExceptionFilter`
- `IExceptionFilter`
- `IAsyncResultFilter`
- `IResultFilter`
- `IAlwaysRunResultFilter`
- `IAsyncAlwaysRunResultFilter`
- `ActionFilterAttribute`
- `ExceptionFilterAttribute`
- `ResultFilterAttribute`
- `ServiceFilterAttribute.IsReusable`
- `TypeFilterAttribute.ImplementationType`
- `TypeFilterAttribute.Arguments`
- `TypeFilterAttribute.IsReusable`
- `IFilterFactory`
- `FilterFactory`
- `FilterItem`
- `FilterDescriptor`
- `FilterScope.Global`
- `FilterScope.Controller`
- `FilterScope.Action`
- `IOrderedFilter`
- `IOrderedFilter.Order`
- `Filter order`
- `Filter scope`
- `Global filter registration`
- `Controller filter attribute`
- `Action filter attribute`
- `Filter before code`
- `Filter after code`
- `Filter short-circuit`
- `Resource filter short-circuit`
- `ActionExecutingContext`
- `ActionExecutedContext`
- `ResourceExecutingContext`
- `ResourceExecutedContext`
- `ExceptionContext`
- `ResultExecutingContext`
- `ResultExecutedContext`
- `ActionExecutionDelegate`
- `ResourceExecutionDelegate`
- `ResultExecutionDelegate`
- `ExceptionHandled`
- `ExceptionFilterAttribute.ExceptionHandled`
- `Filter dependency injection`
- `TypeFilter versus ServiceFilter`
- `Filter versus middleware`
- `Filter exception handling boundary`
- `Exception filter does not catch middleware exceptions before MVC`
- `IAsyncActionFilter.OnActionExecutionAsync`
- `IActionFilter.OnActionExecuting`
- `IActionFilter.OnActionExecuted`
- `IAsyncResourceFilter.OnResourceExecutionAsync`
- `IResourceFilter.OnResourceExecuting`
- `IResourceFilter.OnResourceExecuted`
- `IAsyncResultFilter.OnResultExecutionAsync`
- `IResultFilter.OnResultExecuting`
- `IResultFilter.OnResultExecuted`
## Scope and version
Targets ASP.NET Core 11 MVC filter APIs. Middleware and endpoint filters for Minimal APIs are distinct mechanisms.

## How this group fits the mental model
Filters are nested callbacks around stages after routing selected an MVC endpoint and before/while MVC executes its result.

## Supplied names explained
The preceding sections explain the full declared set: stages, sync/async interfaces, attribute base classes, contexts, continuation delegates, descriptors/factories/providers, scopes/order, short-circuit/handled state, activation, and middleware comparison.

## Cross-item comparison
Async filters can await I/O; sync filters cannot. A resource filter runs earlier and can avoid model binding; an action filter sees action arguments; a result filter sees execution of the selected result. Middleware covers more endpoint types.

## Examples
A resource filter can return a cache hit without invoking the inner delegate. An async action filter can record timing around the awaited continuation. An exception middleware can normalize errors from MVC and non-MVC requests.

## Common mistakes
Do not block on async calls; do not call a continuation twice; do not retain request state in a reusable instance; do not expect an MVC exception filter to handle an exception thrown before MVC.

## Knowledge checks with answers
1. **Which stage can run before binding?** Resource filters.
2. **What does omitting `next` do?** It short-circuits the inner MVC pipeline, subject to that interface's contract.
3. **What is broadest for all endpoint styles?** Middleware.


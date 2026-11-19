# ASP.NET Core MVC controllers actions filters conventions and results — Core concepts and how they fit together

Sources: Microsoft's [controllers and actions](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [application model](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0), [action return types](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-11.0), and [Web API behavior](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-11.0).

## 1. MVC builds endpoint metadata before handling requests

Application parts and feature providers identify candidate controllers. MVC then builds an application model containing controller, action, and parameter models. Attributes provide local metadata; conventions can change models systematically. The result is action descriptors and endpoint metadata consumed by routing and API explorer. This is why discovery errors often appear at startup or as missing endpoints rather than as action-body bugs.

A public method is not automatically an action in every circumstance. Controller eligibility, `[NonController]`, `[NonAction]`, route/HTTP-method attributes, action-name rules, and application conventions all matter. `[ApiController]` adds API conventions such as binding-source inference and automatic invalid-model-state responses unless configured otherwise. It does not replace domain validation or authorization.

## 2. Endpoint selection and action invocation are separate

Endpoint routing selects the endpoint using HTTP method, route pattern, constraints, and metadata (covered in t02-004). MVC then invokes the selected action. Binding obtains values and conversion/validation results; action code should still enforce domain rules and call application services rather than owning infrastructure concerns. An `ActionDescriptor` describes an action, while `ControllerActionDescriptor` adds MVC-specific controller and method details.

## 3. Filters wrap MVC stages

Filters run after endpoint selection, inside MVC. They are not an alternative routing system. The typical nesting is:

```text
authorization → resource (around most MVC work, including binding)
  → action (around action invocation)
    → exception filters handle eligible failures before result execution
    → result (around execution of the selected result)
```

Exact control flow depends on short-circuiting and exceptions. Authorization filters execute first. A resource filter can short-circuit before model binding. An action filter can inspect arguments and action results. An exception filter handles a subset of MVC exceptions, not failures earlier in middleware and not a universal replacement for exception-handling middleware. A result filter can inspect or suppress result execution; always-run result filters cover additional short-circuit cases. Async interfaces receive a delegate that continues the pipeline; code before and after that delegate corresponds to “before” and “after.”

Filters can be global, controller-scoped, or action-scoped. For filters at a given stage, lower `IOrderedFilter.Order` runs first; scope breaks ties (global, controller, then action), and after callbacks unwind in reverse. Do not assume attribute source order fully describes execution. Prefer one of the sync or async interface paths for a concern. `ActionFilterAttribute` supplies both patterns; overriding both can create confusing behavior. `ServiceFilterAttribute` resolves a registered filter service; `TypeFilterAttribute` creates the implementation and resolves constructor dependencies, optionally passing explicit arguments. `IsReusable` is an optimization hint, not a guarantee that request state is safe to retain.

## 4. An action result is an executable response description

`IActionResult` represents many possible response behaviors. `ActionResult<T>` combines a success value of `T` with an alternate action result and can improve API description. Result helpers such as `Ok`, `NotFound`, `CreatedAtAction`, `File`, `Challenge`, and `Forbid` create result objects; MVC executes them later. `ObjectResult` carries an object, optional declared type/status, and content types for formatter selection. `JsonResult` explicitly requests JSON behavior; `ContentResult` produces text; redirects, files, views, and authentication results have specialized semantics.

Content negotiation is a runtime decision involving available output formatters, the result's value and metadata, configured options, and request headers. MVC controller actions can also return `HttpResults` implementing `IResult`; those execute through `IResult.ExecuteAsync`, bypass MVC output formatters/content negotiation, and choose their own content type. A `Produces` annotation documents or constrains metadata in certain paths; it does not by itself prove a particular serialization outcome. `ReturnHttpNotAcceptable` controls whether an unacceptable `Accept` request yields 406 instead of falling back. Tests should assert status, headers, and representative serialized payloads, not only the C# object returned by an action.

## 5. Services, activation, and conventions

`AddControllers`, `AddControllersWithViews`, `AddMvc`, and `AddMvcCore` are different service-graph entry points. Prefer the registration matching the app's needs instead of assuming all are equivalent. `MvcOptions` configures formatters, binders, conventions, filters, and behavior. `IControllerActivator` and `IControllerFactory` control creation and release; the default activation model is request-scoped controller instances, not shared mutable singleton controllers. If controllers are registered as services, their DI lifetime still matters.

Conventions and custom application-model providers are powerful but amplify mistakes across many endpoints. Keep them small, deterministic, and tested. Inspect endpoint metadata or action descriptors when diagnosing a convention. Use local attributes for exceptional/local behavior and conventions for consistent cross-cutting API rules.

## Mental checklist

1. Did MVC discover the expected controller/action?
2. Did routing select that action?
3. What inputs were bound, from which sources, and what validation ran?
4. Which filters surround the action and in what scope/order?
5. Which result type was produced, and how will MVC execute and format it?
6. Do service registration, options, and conventions match the intended API contract?
## Learning objectives
Trace discovery through response execution; select controller/result/filter abstractions; explain ordering and lifetime; diagnose endpoint, binding, filter, and formatter failures.

## Prerequisites
Know HTTP methods/statuses, dependency injection, middleware, routing, C# async methods, and basic model binding from t02-004.

## Core concepts
MVC metadata is built from application parts, types, methods, attributes, providers, and conventions. A selected action is invoked after routing. Filters are nested MVC hooks. Results are executed after the method returns.

## Mechanisms and relationships
An endpoint descriptor joins discovery to routing. A filter context exposes stage-specific request/action data. A result executor joins an action result to formatter and HTTP response behavior. Options and conventions configure this graph.

## Worked examples
An `ActionResult<OrderDto>` can return a DTO on success and `NotFound()` when missing. The framework later executes the selected result, so a test of the action return alone does not prove the final content type or JSON body.

## Misconceptions and edge cases
A public method is not always an action; an action result is not already serialized bytes; filters do not run for Minimal APIs; exception filters do not catch all application errors; response attributes do not enforce runtime behavior.

## Knowledge checks with answers
1. **What runs before the request?** Discovery and application-model conventions build action metadata at startup.
2. **Where does MVC filtering happen?** After endpoint selection, inside action invocation.
3. **Who writes a returned `ObjectResult`?** MVC's result execution infrastructure and a selected output formatter.

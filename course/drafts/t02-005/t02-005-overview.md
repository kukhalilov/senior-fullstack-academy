# ASP.NET Core MVC controllers actions filters conventions and results — Big-picture orientation and mental model

Sources: Microsoft's [controllers and actions](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0), [action return types](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-11.0), and [ControllerBase API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase?view=aspnetcore-11.0). These lessons target ASP.NET Core 11 / .NET 11. Controller/filter fundamentals remain stable; release-specific ASP.NET Core 11 highlights belong to the focused Identity and OpenAPI topics.

## Why this topic matters

Controllers are one way to turn selected HTTP requests into application operations. The useful mental model is not “a class that receives a URL,” but a pipeline: MVC discovers controller/action metadata at startup, endpoint routing selects an action for a request, model binding supplies inputs, filters surround parts of MVC invocation, the action produces a result description, and an executor writes the HTTP response. Understanding those boundaries makes debugging, API design, and cross-cutting behavior much more predictable.

## Mental model

```text
startup: application parts → controller/action models → endpoint metadata
request: middleware → endpoint routing selects action → MVC binds/validates inputs
        → authorization/resource/action/exception/result filters → action
        → IActionResult execution/formatting → response
```

The action does not itself necessarily serialize or write the response. It may return a typed value, an `IActionResult`, or `ActionResult<T>`; MVC executes that result using the configured services and formatters. An `IActionResult` is therefore a response plan, not the response bytes. `ActionResult<T>` makes a common API contract explicit: a typed success body or an alternate action result such as 404.

## The central decisions

Choose `ControllerBase` for HTTP APIs; it supplies API-oriented helpers without view support. Choose `Controller` when MVC views are part of the application. Declare routes and HTTP methods clearly, use `[ApiController]` deliberately for its API conventions, and make status/body behavior visible in return types and API metadata. Use filters for MVC-specific hooks around action invocation; use middleware for behavior that must apply broadly before MVC or across endpoint types. Avoid hiding important contracts in a large set of global conventions.

Controller discovery and action discovery are metadata-driven. Application parts expose candidate types; controller/action attributes and conventions refine which types and methods become endpoints and what metadata they carry. This happens independently of a specific request. Routing and route-template semantics are covered in the preceding routing lesson; this topic concerns how MVC contributes action endpoints and what happens after one is selected.

Filters have distinct stages and boundaries. Authorization filters run first inside MVC; resource filters can wrap most MVC work including model binding; action filters wrap the action; exception filters handle a narrower MVC exception boundary; result filters wrap result execution. Middleware wraps a much broader path. Filter order is affected by scope and explicit order, and async filters have continuation/delegate semantics that make short-circuit behavior observable.

## A concrete request

For `GET /api/orders/42`, routing selects an action descriptor. MVC binds `42`, runs the selected filter pipeline, and calls the action. The action can load the order and return `NotFound()` when absent or `Ok(order)` when present. MVC executes the chosen result, selects an output formatter based on the result, content types, and request negotiation policy, then writes status, headers, and body. A filter may observe or short-circuit one of those stages, but a middleware exception occurring before MVC is not caught by an MVC exception filter.

## Common design errors

- Treating a route match, a successful model bind, and valid domain input as the same thing.
- Using filters as a substitute for authentication/authorization middleware or putting every concern into global filters.
- Returning a body for statuses whose semantics prohibit one, or assuming a typed C# return type alone fully describes the wire contract.
- Treating `IResult` and `IActionResult` as interchangeable: they belong to different endpoint/result execution models.
- Registering a reusable filter that captures request-specific mutable state, or implementing both sync and async variants without understanding which path MVC selects.
- Relying on implicit discovery or conventions without tests that inspect the resulting endpoints and responses.

## Learning path

First learn discovery and the application model, then follow the filter pipeline stage by stage, then study result types and content negotiation, and finally learn service registration, activation, options, and conventions. Practice and interview lessons connect these pieces into endpoint diagnosis and API design. Each reference lesson includes the exact API and attribute inventory required for this topic, with explanations and examples rather than an unexplained glossary.
## Problem and purpose
MVC organizes HTTP operations around discoverable controller actions and an executable result pipeline. This structure is valuable when an application needs action-oriented conventions, API metadata, filters, or views.

## Plain-language mental model
Think of MVC as startup-built action metadata plus a per-request invocation pipeline. The action chooses a response description; MVC performs the response work.

## How the parts fit together
Discovery builds descriptors; routing selects an endpoint; binding and validation prepare arguments; filters surround MVC stages; the action produces a result; executors and formatters write the response.

## Concept map
```text
application parts → model/conventions → descriptors/endpoints
request → route selection → binding → filters/action → result executor/formatter → HTTP response
```

## End-to-end walkthrough
A request for an order is matched to its action, binds the identifier, passes through applicable MVC filters, and returns either a not-found result or a typed order result. MVC sets status and serializes the value.

## When to use it and tradeoffs
MVC is a good fit for controller-oriented APIs, action filters, conventions, and view-backed apps. It introduces a richer invocation model than a small Minimal API endpoint, so use the style consistently and understand its boundaries.

## What later lessons cover
The next lessons explain discovery, filters, results/negotiation, registration/conventions, then apply them in worked diagnosis and interview scenarios.

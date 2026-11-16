# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Core concepts and how they fit together

Sources: Microsoft's [Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [parameter binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-11.0), [responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), and [validation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/validation?view=aspnetcore-11.0).

## Learning objectives

Explain mapping and grouping; identify how handler parameter types and attributes select binding sources; use endpoint filters safely; distinguish `Results` from `TypedResults`; configure and test automatic validation; and understand how endpoint metadata feeds OpenAPI.

## Prerequisites

Know HTTP methods and status codes, middleware and DI, routing and general binding from t02-004, C# delegates/generics/async, JSON serialization, and basic validation concepts.

## Core concepts

Mapping methods create endpoints and return builders for metadata/conventions. A route group creates a shared prefix and can apply metadata and filters to nested endpoints. Handler parameters bind from explicit attributes, route/query/header/form/body, special framework types, or registered services. Inference is convenient but can be affected by route shape and service registration; make security-sensitive or ambiguous sources explicit.

The request body is one stream and normally has one body-bound handler parameter. Multiple body parameters are unsupported unless an application explicitly implements a different reading strategy. `Stream` and `PipeReader` allow lower-level access but shift parsing/lifetime responsibility to the handler. Binding failure occurs before invocation; do not mix it with domain rejection.

Endpoint filters implement `IEndpointFilter` or a factory. They receive an invocation context containing arguments and `HttpContext`, then invoke a continuation or short-circuit. They can validate/transform handler arguments or results. Middleware wraps broader request processing; MVC filters apply to MVC actions. Authorization policies must still be configured independently.

Minimal API handlers may return strings, serializable values, `IResult`, or typed HTTP result values. Strings are written as text; ordinary values are JSON serialized; `IResult.ExecuteAsync` delegates response behavior to the result implementation. `Results` helpers commonly expose `IResult`, making mixed branches easy to infer. `TypedResults` return concrete types, improving type checking and response metadata; when branches differ, use an explicit `Results<T1,T2,...>` union return type. A method-group overload can accidentally bind as `RequestDelegate` and discard a result; heed analyzer diagnostics and use an explicit `Delegate` or lambda.

ASP.NET Core 10 added built-in validation using `Microsoft.Extensions.Validation` and `AddValidation`. Its validation source generator supplies metadata; if required metadata is missing, validation might not run. It validates supported DataAnnotations rules before handler invocation, not unknown JSON properties by default and not application/domain invariants. In .NET 11, async DataAnnotations validation is supported end-to-end for Minimal APIs. Async validators may execute concurrently, so they must not depend on a specific execution order or mutate shared state unsafely.

JSON uses HTTP JSON options and `System.Text.Json`; configure endpoint JSON options deliberately and recognize that request deserialization and response serialization are distinct paths. `JsonTypeInfo<T>` supports metadata-based serialization scenarios. Enum representation, nullability, unmapped JSON members, and source-generated metadata should be tested as API contract decisions.

## Mechanisms and relationships

```text
RouteHandlerBuilder / RouteGroupBuilder → metadata + conventions
handler signature + attributes + route/service metadata → parameter binding
AddValidation + generated metadata → validation before handler
IEndpointFilter → wraps handler delegate
Results/TypedResults → response executor; typed unions retain declared variants
metadata + OpenAPI generator/transformers → API description document
```

Metadata is descriptive/configurational. For example, `.Produces<T>()` contributes response metadata but does not serialize a body or enforce authorization. The runtime result and configured services determine the actual response.

## Worked examples

```csharp
app.MapGroup("/api/orders")
   .RequireAuthorization()
   .WithTags("Orders")
   .MapPost("", async Task<Results<Created<OrderDto>, ValidationProblem>>
       (CreateOrder request, IOrderService orders, CancellationToken ct) =>
   {
       var created = await orders.CreateAsync(request, ct);
       return TypedResults.Created($"/api/orders/{created.Id}", created);
   });
```

The group prefix and metadata apply to the mapped endpoint; authorization policy is enforced by ASP.NET Core's authorization system. A bound/validated DTO is not proof that the requested operation is allowed or satisfies domain rules. A typed union explicitly states possible result variants. In a production endpoint, ensure the declared error branch is genuinely reachable and generated OpenAPI metadata matches actual statuses.

## Misconceptions and edge cases

- Minimal APIs still use middleware, DI, endpoint routing, and ASP.NET Core services.
- Endpoint filters do not replace authorization policies, exception middleware, or domain validation.
- A registered complex type may be inferred as a service; changing DI registrations can change binding. Explicit attributes stabilize the public contract.
- A single request body cannot be independently consumed by multiple inferred parameters.
- Registering validation alone is insufficient if generated metadata does not include the type.
- Async validation is not an excuse to put remote I/O into every attribute; use it for appropriate request-level validation and preserve domain checks.
- `Results` and `TypedResults` have different static return types and metadata behavior.
- OpenAPI endpoint metadata is consumed by a document generator; mapping an endpoint does not automatically publish a spec unless configured.

## Knowledge checks with answers

1. **Where should shared route prefix and tags live?** On a route group or its conventions.
2. **Why make `[FromServices]`/`[FromBody]` explicit?** To stabilize ambiguous or security-sensitive source choices.
3. **What does `AddValidation` do?** Enables supported pre-handler model validation when generated metadata is available; it does not enforce domain invariants.
4. **Why use a `Results<T1,T2>` return?** It declares allowed typed-result branches and carries response metadata.
5. **What does `.Produces<T>()` do?** Adds endpoint response metadata for API description; it does not create or serialize the response.


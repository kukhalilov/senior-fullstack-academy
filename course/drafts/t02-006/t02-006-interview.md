# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Interview questions and reasoning

Sources: Microsoft's [Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/min-api-filters?view=aspnetcore-11.0), [responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), [ASP.NET Core validation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/validation?view=aspnetcore-11.0), and [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0).

## Core questions

1. What does “Minimal API” mean and what services does it still use?
2. How do route groups compose prefixes and metadata?
3. How does parameter-source inference work, and when do you make it explicit?
4. Why are multiple body parameters unsupported?
5. Compare middleware, endpoint filters, and MVC action filters.
6. What does an endpoint filter continuation represent?
7. Compare `Results`, `TypedResults`, and typed result unions.
8. How does ASP.NET Core 10 validation work, and what can make it not run?
9. What changed for validation in .NET 11?
10. What is the difference between request validation and domain invariants?
11. How does OpenAPI metadata relate to runtime behavior?
12. Why can a method-group handler return an empty response?
13. How would you stream a large file and describe it in OpenAPI?
14. What serializer configuration affects Minimal API input/output?
15. Which ASP.NET Core 11 changes affect Minimal API filters, JSON bodies, and OpenAPI documents?

## Concise interview answers

1. Minimal APIs define HTTP handlers with route mapping; they still use ASP.NET Core hosting, routing, middleware, DI, and HTTP abstractions.
2. Nested groups compose route prefixes and share conventions/metadata; inspect final endpoints when overrides matter.
3. Inference uses route/signature/type/service information and framework special types. Use attributes when the public contract is ambiguous or security-sensitive.
4. The request body is one stream with one normal deserialization path; combine body fields into one DTO.
5. Middleware covers broad pipeline stages/types; endpoint filters wrap Minimal API handler invocation; MVC filters wrap controller action stages.
6. It invokes the remaining filter chain and handler. Call at most once; return without calling it to short-circuit.
7. `Results` commonly returns `IResult`; `TypedResults` returns concrete results and metadata; a `Results<T...>` union declares multiple possible concrete branches.
8. .NET 10 added `Microsoft.Extensions.Validation` and `AddValidation`. Automatic validation relies on generated metadata; missing metadata can result in no automatic validation.
9. .NET 11 adds async DataAnnotations validation and end-to-end async validation in Minimal APIs.
10. Request validation checks input shape/constraints; application/domain layers enforce authorization and stateful invariants, often transactionally.
11. Metadata feeds generated API descriptions but does not force handler behavior or execute serialization.
12. Overload resolution can choose `RequestDelegate`, which discards a return value; use a lambda or cast to `Delegate` and heed analyzer ASP0016.
13. Return a stream-based file result, set content type/range/caching as intended, authorize it, and provide explicit binary response metadata.
14. `ConfigureHttpJsonOptions` affects HTTP JSON behavior; test request deserialization and response serialization separately.
15. Configured endpoint filters can observe supported parameter-check failures when `ThrowOnBadRequest` is false in Development; C# union types work for `System.Text.Json` JSON bodies; generated OpenAPI documents default to 3.2.0 in ASP.NET Core 11, compared with 3.1.0 in ASP.NET Core 10.

## Deep follow-up answers

### Why can DI changes alter a handler contract?

Complex parameter inference can treat registered types as services. Adding a registration can therefore change a parameter's inferred source. Explicit `[FromBody]` and `[FromServices]` attributes, plus contract-level HTTP tests, protect the endpoint from accidental startup wiring changes.

### What are the safety limits of an endpoint filter?

It operates around one endpoint handler and can inspect `HttpContext` and bound arguments. It does not automatically enforce authorization policies, cover failures before it runs, or catch result-execution errors after it returns. Use authorization middleware/policies for access control and exception middleware for global error mapping.

### Why use a typed union if `IResult` is simpler?

An `IResult` signature makes branches easy but erases concrete return type information from static analysis. A typed union constrains allowed branches and makes response metadata more self-describing. The tradeoff is more explicit return syntax and maintaining the declared union when branches evolve.

### Does AddValidation validate unknown JSON properties?

No. It runs supported DataAnnotations validation over generated model metadata. System.Text.Json skips unmapped properties by default; set `UnmappedMemberHandling` to disallow them when strict payload contracts require rejection. Validation also does not replace domain invariants.

## Scenario questions

1. **A complex DTO is suddenly resolved from DI instead of JSON.** Inspect inference and service registrations; pin the source explicitly and test body binding.
2. **An endpoint filter denies a user but another route has no filter.** Attach authorization policies consistently through groups/metadata and ensure authorization middleware is active; do not treat one endpoint filter as an app security boundary.
3. **Invalid DTO reaches handler despite `[Required]`.** Verify `AddValidation`, generated metadata discovery/assembly, parameter binding source, and framework version; add an HTTP regression test.
4. **OpenAPI says 200 JSON, runtime streams a PDF.** Add correct file response metadata and test generated schema and actual content type.
5. **A filter returns transformed result but docs are stale.** Align typed return/Produces metadata with all runtime branches and inspect generated document.
6. **Reservation availability check passes twice concurrently.** Keep validation for useful early feedback, but enforce reservation atomically in application/database logic.

## Tradeoffs and alternatives

Choose endpoint filters for handler-level context, middleware for cross-application request concerns, and MVC filters for controller-specific hooks. Choose inferred binding for simple internal handlers and explicit source attributes for stable public contracts. Choose typed results where compile-time/documentation value justifies the explicit union.

## Common weak answers

Avoid saying Minimal APIs lack middleware/DI, route-group metadata is authorization by itself, filters are middleware, all complex parameters are bodies, `AddValidation` guarantees every model is validated, async validators run in a fixed order, or `.Produces` changes runtime responses.

## Self-check rubric

A strong answer names the endpoint stage, distinguishes framework mechanics from policy, identifies version/configuration sensitivity, and proposes a real HTTP test. Give yourself one point for each; revisit answers that omit any of these.


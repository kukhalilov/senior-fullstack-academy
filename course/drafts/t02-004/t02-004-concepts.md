# ASP.NET Core endpoint routing route patterns constraints and binding — Core concepts and how they fit together

Sources: Microsoft's [routing](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [MVC routes](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/routing?view=aspnetcore-11.0), [MVC model binding](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-11.0), [Minimal API binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), and [.NET API docs for RoutePattern](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.routepattern?view=aspnetcore-11.0). Verify implementation and inference against the target ASP.NET Core release.

## Learning objectives

Explain endpoint selection; design route templates and constraints; distinguish matching from binding and validation; compare MVC and Minimal API binding; and diagnose inbound matching versus outbound link generation.

## Prerequisites

Understand HTTP methods, URLs, middleware, endpoint styles, C# types/nullability, and basic request data sources. MVC action conventions and Minimal API route-mapping catalogs are handled in neighboring topics.

## Core concepts

### Endpoint routing selects from candidates

Endpoint routing gathers endpoints from data sources, then processes a request against a compiled matcher. Matching evaluates HTTP method/route pattern and candidate policies/constraints. Selection uses endpoint metadata, order and precedence rules; it does not generally invoke whichever mapping was written first. Equal candidates can produce `AmbiguousMatchException`. MVC conventional route generation has documented ordering conventions, but do not generalize declaration order to all endpoint routing.

After selection, middleware/endpoint execution proceeds. `HttpContext.GetEndpoint()` can inspect the selected endpoint after routing has run. Endpoint metadata may carry names, filters, authorization, binding, or other conventions. This metadata informs behavior but does not execute or validate itself.

### Route templates describe URL shape

Templates combine literal segments and named parameters. Parameters can be required, optional, or defaulted; catch-alls capture remaining segments. Constraints/policies can require a parameter to parse/fit a value class, while transformers alter generated route text. Multiple parameters may share a segment. Literal/parameter specificity contributes to precedence, but ambiguous equivalent candidates should be redesigned explicitly. Path matching, percent-encoding, slash decoding, trailing-slash behavior, case behavior, and periods require careful tests across proxy/server boundaries.

Constraints are for endpoint disambiguation/shape, not semantic input validation. If `/orders/{id:int}` excludes non-integers, a malformed ID may fail to match and return 404 rather than a 400 validation response. For a valid route with an invalid business value (e.g., negative quantity), bind it and return a clear validation result. A constraint can also hide endpoint existence; design response policy intentionally.

### Matching and binding are separate

The route matcher stores route values as strings. Binding chooses sources and converts values to handler/action parameter types. MVC model binding uses value providers, model binders, metadata, ModelState and input formatters. Binding source attributes clarify route/query/header/form/body/services. A complex body commonly uses an input formatter such as System.Text.Json. MVC can use prefixes and collection/dictionary binding conventions; ModelState records binding/validation errors, and `[ApiController]` conventions may automatically turn invalid model state into a response (covered elsewhere).

Minimal API binding infers sources from type/registration and handler context: route/query/header, JSON body, forms, DI services, special framework types, or custom binders. Explicit attributes can override or document the source. GET/HEAD/OPTIONS/DELETE do not implicitly bind body parameters; use explicit body binding or read the request. Multiple inferred body parameters are invalid because the request body is a single forward-only stream. A `Stream` or `PipeReader` gives direct body access and must be consumed within the request lifetime. Optionality/nullability/default values change missing-value behavior; malformed supplied values still fail binding.

### Constraints, parsing, and validation have different jobs

A route constraint narrows candidates at matching time. `TryParse`, `IParsable<T>`, `BindAsync`, and `IBindableFromHttpContext<TSelf>` participate in converting or binding handler values. MVC custom binders/providers change MVC model binding. Data/business validation checks whether a successfully bound value is acceptable. A missing route can produce 404; a binding conversion failure can produce ModelState errors or a Minimal API binding exception/bad-request result; a domain rule may produce 400 or a domain-specific response. Choose and test the API contract instead of relying on incidental defaults.

### Inbound matching and outbound URL generation are distinct

Matching asks which endpoint accepts a request. URL generation asks which endpoint/address and route values can form a path/URI. `LinkGenerator` is DI-friendly and endpoint-based; `IUrlHelper` is MVC-oriented and uses action context. Named endpoints give stable link targets. Required values, ambient route values, constraints, suppressed-link metadata, host/scheme, and path base can affect output. A link-generation failure is not the same as an inbound route failure.

Attribute routing declares route metadata near controllers/actions. Conventional MVC routing maps patterns and uses MVC's action/controller values and ordering conventions. Both use endpoint routing infrastructure but their token substitution and URL generation conventions differ. Test generated links after route changes.

## Mechanisms and relationships

Diagnostic sequence: inspect request method/decoded path/host; confirm endpoint data sources and route template; determine candidate set and constraint/policy rejection; inspect selected endpoint and metadata; then inspect binding source, raw value, conversion, ModelState/result; finally test link generation separately. Use endpoint-routing diagnostics and safe logging without exposing body/secrets.

## Worked examples

Consider `/products/{id:int}` with handler `(int id, int page)`. `id` is a route value, and `page` is typically query-bound for a Minimal API handler. `/products/42?page=3` can bind both. `/products/abc` fails the route constraint and may not match. `/products/42?page=next` has a matching route but an invalid query conversion; that is a binding failure. These are different stages and may have different response codes.

For `/{locale?}/products/{slug}`, an optional parameter before a literal changes URL shapes and may be ambiguous with other endpoints. Prefer an explicit prefix or separate routes if that makes matching/link generation clearer. Generate URLs by endpoint name and test both inbound and outbound behavior.

## Misconceptions and edge cases

- Route declaration order is not a universal tie-breaker.
- A route constraint is not a user-input validation mechanism.
- Route values are initially strings; typed handler/action binding is a later stage.
- The route and query can have the same parameter name; explicit source attributes avoid ambiguity.
- MVC and Minimal API binding rules are not identical.
- The body is generally consumed once; multiple body parameters or rereading a stream need deliberate buffering/formatting.
- A URL that routes inbound may not be generated outbound from missing/ambient values.
- Encoded slash, period segments, trailing slashes, and reverse proxies can alter path matching assumptions.

## Knowledge checks with answers

1. **When does route constraint evaluation occur?** During endpoint candidate matching, before handler parameter binding.
2. **What is the difference between route value and bound parameter?** Route value is matched text; binding converts/selects it into a typed parameter.
3. **Why can't two parameters both implicitly read arbitrary JSON bodies?** The request body is a single stream and has one body binding/formatter path.
4. **Why can URL generation fail when a route matches inbound?** Outbound generation needs an address/endpoint and sufficient compatible values/metadata; it is a separate operation.

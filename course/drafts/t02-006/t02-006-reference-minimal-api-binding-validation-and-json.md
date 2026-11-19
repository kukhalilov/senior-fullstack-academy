# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Reference: Parameter sources, special types, custom binding, validation, and JSON options

Sources: Microsoft's [parameter binding](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), [validation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/validation?view=aspnetcore-11.0), [Minimal API quick reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), [.NET 11 async validation APIs](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview), and [`FromBodyAttribute` API reference](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.frombodyattribute?view=aspnetcore-11.0).

## Scope and version

Targets ASP.NET Core 11 Minimal API binding and JSON behavior. Route matching, route constraints, and general MVC model binding are covered in t02-004. Validation is request-boundary validation, not domain validation.

## Parameter source selection

Minimal API parameter binding uses handler parameter types, route metadata, service registration, special types, and explicit attributes. `[FromRoute]`, `[FromQuery]`, `[FromHeader]`, `[FromBody]`, `[FromForm]`, and `[FromServices]` state source directly. `[AsParameters]` decomposes a parameter object into supported members, which can make a handler signature manageable but should be reviewed for unexpected binding/exposure. Inference is convenient but can change when a type is registered in DI or route parameters change; explicit attributes are safest for public contracts and security-sensitive values.

Special types such as `HttpContext`, `HttpRequest`, `HttpResponse`, `ClaimsPrincipal`, `CancellationToken`, and `IServiceProvider` have framework-defined sources. `Stream` and `PipeReader` provide direct request body access. Form APIs (`IFormFile`, `IFormFileCollection`, `IFormCollection`) require form parsing and antiforgery considerations for applicable endpoints. Do not bind arbitrary uploaded filenames to storage paths.

Route values, query, and headers have distinct parsing/encoding semantics. `TryParse` and `IParsable<TSelf>` support simple conversion from string-like values. `BindAsync` can implement richer async binding using request context; `IBindableFromHttpContext<TSelf>` offers a static-abstract pattern. Custom binding must distinguish absent, malformed, and invalid values intentionally and should avoid leaking low-level exception details.

Body binding ordinarily deserializes one JSON body DTO. Multiple body parameters are unsupported because a request body is a single stream. Use a composed request type rather than attempting to read it independently multiple times. `DisableInferBodyFromParameters` can turn off inferred-body behavior. `[FromBody]` exposes `EmptyBodyBehavior`; through the `IFromBodyMetadata` interface it also exposes the `AllowEmpty` metadata value. Set `EmptyBodyBehavior` deliberately when an empty request body is part of the contract. Nullability and optional/default values influence missing-value behavior, but nullable reference annotations are not a substitute for explicit validation constraints or domain rules. Route-handler binding failures produce framework bad-request behavior; distinguish these from automatic validation responses and domain errors.

## Validation registration and execution

ASP.NET Core 10 introduced built-in Minimal API validation with `Microsoft.Extensions.Validation`; call `AddValidation`. It uses generated validation metadata for supported model types and validates supported parameter sources before handler execution. If metadata was not generated for a type/assembly, validation may silently not run; check the source-generator setup and diagnostics. Nested objects/collections rely on generated metadata. Unmapped JSON properties are skipped by default; configure `JsonSerializerOptions.UnmappedMemberHandling = Disallow` if the contract requires rejecting them.

`ValidationAttribute` and `IValidatableObject` support synchronous DataAnnotations checks. Validation is not authorization, uniqueness guarantees under concurrency, or a replacement for domain invariants. A database uniqueness check in validation can race; enforce the invariant transactionally too. `ValidationOptions.MaxErrors` bounds response/error accumulation; `LocalizerProvider` configures localization lookup for validation messages.

In .NET 11, `AsyncValidationAttribute` and `IAsyncValidatableObject` run through the asynchronous Minimal API validation path. Implement required synchronous and async interface members; Minimal API validation calls the async path. Validators can run concurrently and order is not guaranteed; they must be independent and thread-safe. Use async validation for suitable I/O-dependent request checks, propagate cancellation, and keep authoritative invariants in application/domain/persistence layers. `Validator.ValidateObjectAsync` is a .NET library API for general use; do not confuse manual validation calls with the automatic endpoint integration.

Validation errors are returned as a client error with problem-style details by default; `IProblemDetailsService` can customize the response. Verify exact envelope and status through an HTTP test. Use `ValidationException` only within the appropriate validation flow, not as a general business error mechanism.

## JSON options and serialization

`ConfigureHttpJsonOptions` configures endpoint HTTP JSON behavior; `HttpJsonOptions` wraps `JsonSerializerOptions` used by Minimal APIs. `JsonSerializerOptions.Web` describes the web defaults. `IOptions<Microsoft.AspNetCore.Http.Json.JsonOptions>` exposes configured options through DI. Endpoint JSON serializer options affect request body deserialization and response JSON serialization for endpoints using the corresponding HTTP JSON APIs. `JsonTypeInfo<T>` supports metadata-based serialization and source-generated contexts, important for trimming/AOT and explicit serializer metadata. In .NET 11, C# union types are supported for JSON request and response bodies processed by `System.Text.Json`; they are not a route/query/header/form parsing mechanism and are distinct from `Results<T1,T2>` typed HTTP result unions.

Request deserialization and response serialization are separate directions. Decide enum representation, case behavior, null handling, unmapped members, converters, and source generation intentionally. A string return is plain text; ordinary object returns are JSON; `Results.Json` uses JSON result semantics. Integration tests should check bytes/content type and error cases, not merely the bound CLR object.

## Comparison and examples

```csharp
builder.Services.AddValidation();
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow);

app.MapPost("/orders", ([FromBody] CreateOrder request,
    [FromServices] IOrderService service, CancellationToken cancellationToken) =>
    service.CreateAsync(request, cancellationToken));
```

Attributes make source intent explicit. The DTO validation checks shape/constraints; the service still checks authorization, current state, and transactional invariants. Rejecting unmapped properties is a separate strict-deserialization policy.

## Common mistakes

Assuming registration alone guarantees generated metadata; confusing invalid JSON/binding with validation/domain errors; relying on nullability for all validation; binding several bodies; putting race-prone uniqueness solely in a validator; assuming async validator order; and changing JSON settings without compatibility tests.

## Knowledge checks with answers

1. **Why is only one body parameter supported?** The HTTP request body is one stream and has one normal deserialization path.
2. **What enables automatic Minimal API validation?** `AddValidation` plus required generated metadata for supported types.
3. **What is new in .NET 11 here?** Async DataAnnotations APIs and end-to-end asynchronous Minimal API validation.
4. **Does validation enforce authorization or transaction invariants?** No.
5. **What rejects unknown JSON members?** Configure unmapped-member handling to disallow them; validation does not do this automatically.

## Exact terms covered

### Exact terms covered

- `Minimal API parameter binding`
- `FromRouteAttribute`
- `FromQueryAttribute`
- `FromHeaderAttribute`
- `FromBodyAttribute`
- `FromFormAttribute`
- `FromServicesAttribute`
- `AsParametersAttribute`
- `BindAsync method pattern`
- `IBindableFromHttpContext<TSelf>`
- `IParsable<TSelf>`
- `TryParse parameter-binding pattern`
- `Special parameter type inference`
- `HttpContext parameter`
- `HttpRequest parameter`
- `HttpResponse parameter`
- `ClaimsPrincipal parameter`
- `CancellationToken parameter`
- `IServiceProvider parameter`
- `Stream body parameter`
- `PipeReader body parameter`
- `IFormFile parameter`
- `IFormFileCollection parameter`
- `IFormCollection parameter`
- `Route handler body binding`
- `Route handler service inference`
- `Route handler route value binding`
- `Route handler query binding`
- `Route handler header binding`
- `Route handler form binding`
- `Multiple body parameters are unsupported`
- `DisableInferBodyFromParameters`
- `EmptyBodyBehavior`
- `FromBodyAttribute.EmptyBodyBehavior`
- `IFromBodyMetadata.AllowEmpty`
- `Route handler nullability metadata`
- `Minimal API binding failure response`
- `Minimal API validation`
- `AddValidation`
- `IValidatableObject validation`
- `ValidationAttribute validation`
- `Microsoft.Extensions.Validation`
- `ValidationOptions`
- `ValidationOptions.MaxErrors`
- `ValidationOptions.LocalizerProvider`
- `ProblemDetails validation response`
- `ConfigureHttpJsonOptions`
- `HttpJsonOptions`
- `JsonSerializerOptions.Web`
- `IOptions<Microsoft.AspNetCore.Http.Json.JsonOptions>`
- `Endpoint JSON serializer options`
- `JsonTypeInfo<T> metadata`
- `Request body JSON deserialization`
- `Response body JSON serialization`
- `JSON enum serialization`
- `C# union types in Minimal API JSON bodies`
- `Nullable reference validation behavior`
- `Asynchronous validation in .NET 11`
- `AsyncValidationAttribute`
- `IAsyncValidatableObject`
- `Validator.ValidateObjectAsync`
- `IAsyncStartupValidator`
- `IAsyncValidatableObject.ValidateAsync`
- `ValidationException`

## How this group fits the mental model
Binding and validation transform request data into handler arguments before filter/handler execution; JSON settings govern the wire-to-object and object-to-wire steps.

## Supplied names explained
The full inventory index below includes all supplied parameter source attributes, special types, binding patterns, validation APIs, options, JSON metadata, and failure concepts. The sections above explain their behavior and boundaries.

## Cross-item comparison
Explicit source attributes stabilize contracts while inference reduces boilerplate; `TryParse` handles simple textual conversion while `BindAsync` supports broader asynchronous context; validation checks declared input rules while application logic protects domain invariants.

## Examples
See the binding and serializer configuration example above; it pins sources, registers validation, and explicitly rejects unmapped payload members.

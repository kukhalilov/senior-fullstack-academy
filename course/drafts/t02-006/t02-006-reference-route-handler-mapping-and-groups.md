# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Reference: Minimal route registration, HTTP verbs, route groups, metadata, and conventions

Sources: Microsoft's [Minimal APIs overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0), [route handlers](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/route-handlers?view=aspnetcore-11.0), and [OpenAPI overview](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis?view=aspnetcore-11.0).

## Scope and version

Targets ASP.NET Core 11 endpoint mapping and route-handler metadata. Route-template grammar and matching precedence are covered in t02-004; OpenAPI customization and API versioning are covered in t02-013.

## Mapping and builder roles

`IEndpointRouteBuilder` is the abstraction that maps endpoint routes. `MapGet`, `MapPost`, `MapPut`, `MapPatch`, `MapDelete`, `MapMethods`, and `Map` create handler endpoints for common verbs, explicit method sets, or broad matching. `MapFallback` defines a fallback endpoint and must be used intentionally because it can catch requests that otherwise would not match. `MapHealthChecks` maps health-check middleware into endpoint routing. Handler overloads accept lambdas/delegates and may involve overload resolution: a method group taking only `HttpContext` can be interpreted as `RequestDelegate`, whose return value is ignored. Use a lambda or cast to `Delegate` when necessary and heed ASP analyzers.

Mapping returns a convention builder. `IEndpointConventionBuilder` represents metadata/convention configuration; `RouteHandlerBuilder` adds route-handler-specific configuration; `RouteGroupBuilder` combines route mapping and shared conventions for a group. Group prefixes compose when nested. Group metadata is inherited by endpoints and may be combined with endpoint metadata. Define behavior once at a group boundary when all children share it; test exceptions/overrides explicitly.

## Metadata and conventions

`WithName` gives an endpoint a stable name useful for links and API metadata; names should be unique. `WithDisplayName`, `WithTags`, `WithSummary`, and `WithDescription` supply diagnostic or documentation metadata. `WithOrder` influences endpoint selection ordering and should not mask ambiguous route designs. `WithMetadata` adds arbitrary endpoint metadata. `Produces`, `Produces<TResponse>`, `ProducesProblem`, `ProducesValidationProblem`, and `Accepts<TRequest>` document response/request shapes and content types; they do not themselves validate or serialize. `ExcludeFromDescription` omits endpoint metadata from generated API descriptions.

`DisableAntiforgery` changes antiforgery metadata/behavior for applicable form endpoints; do not apply it as a generic workaround. `RequireHost`, `RequireAuthorization`, and `AllowAnonymous` contribute endpoint metadata consumed by corresponding middleware/services. `RequireRateLimiting` and `DisableRateLimiting`, `RequireCors`, `WithRequestTimeout`, and `DisableRequestTimeout` integrate endpoint-specific policies. `WithStaticAssets` adds static-asset endpoint behavior for supported mappings; it is not a substitute for understanding static-file middleware or secure asset delivery.

`AddEndpointsApiExplorer` registers endpoint metadata exploration; a document generator such as `AddOpenApi` is a separate service. ASP.NET Core 11's OpenAPI integration supports OpenAPI 3.2.0. `WithOpenApi` is a legacy extension deprecated in .NET 10; use the current OpenAPI integration and operation transformers for customization.

## Handler contract and service registration

A route-handler delegate may return a string, a serializable value, an `IResult`, or a typed result. Its parameter signature participates in binding and overload selection. Services can be registered in DI and inferred for supported parameter types, but explicit `[FromServices]` can make intent clear. Be aware that adding a DI registration can alter inference for a complex parameter. For public API handlers, explicit source attributes reduce accidental contract changes.

Endpoint names are exposed through `EndpointNameMetadata` and `IEndpointNameMetadata`. Response and documentation tooling reads metadata interfaces such as `IProducesResponseTypeMetadata`, `ITagsMetadata`, `IEndpointSummaryMetadata`, and `IEndpointDescriptionMetadata`. `AddOpenApiOperationTransformer` applies document-time transformations; it changes the generated document, not endpoint runtime behavior.

## Practical group example

```csharp
var api = app.MapGroup("/api/v1/catalog")
    .WithTags("Catalog")
    .RequireAuthorization("catalog.read");

api.MapGet("/items/{id:int}", GetItem)
   .WithName("GetCatalogItem")
   .WithSummary("Gets a catalog item")
   .Produces<ItemDto>()
   .ProducesProblem(StatusCodes.Status404NotFound);
```

The group prefix composes with the child route. The name is a link/API identifier; authorization metadata requires the authorization middleware/services to enforce it; response metadata is documentation. An endpoint-specific anonymous override, if used, should be a deliberate documented exception.

## Cross-item comparison

`RouteHandlerBuilder` configures one endpoint; `RouteGroupBuilder` configures related endpoints and can map children. `WithMetadata` attaches data; `RequireAuthorization` attaches policy metadata interpreted by authorization services. `Produces` documents response shape; `TypedResults` can carry runtime result metadata from the actual return type. `AddEndpointsApiExplorer` exposes metadata; `AddOpenApi` generates a document.

## Examples

Map a read endpoint with `MapGet`, a create operation with `MapPost`, and a fallback only for a deliberate catch-all. Use `MapMethods` when a protocol requires a less common method. Keep route groups aligned to stable resource/API boundaries rather than creating deeply nested groups whose prefixes and metadata are difficult to calculate.

## Common mistakes

Do not think declaration order universally selects endpoints; do not duplicate names; do not treat OpenAPI annotations as runtime checks; do not assume group metadata replaces middleware/services; and do not use a broad `Map`/fallback route to hide a route-design bug.

## Knowledge checks with answers

1. **What does a route group contribute?** Shared prefix and endpoint conventions/metadata for mapped child routes.
2. **Does `.Produces<T>()` serialize an object?** No; it contributes API-description metadata.
3. **What does `RequireAuthorization` need?** Authorization services and middleware to enforce the attached policy.
4. **What is `WithOpenApi`'s current status?** Legacy and deprecated starting in .NET 10; use OpenAPI operation transformers.

## Exact terms covered

### Exact terms covered

- `MapGet`
- `MapPost`
- `MapPut`
- `MapPatch`
- `MapDelete`
- `MapMethods`
- `Map`
- `MapGroup`
- `MapFallback`
- `MapHealthChecks`
- `IEndpointRouteBuilder`
- `IEndpointConventionBuilder`
- `RouteHandlerBuilder`
- `RouteGroupBuilder`
- `RouteGroupBuilder.MapGet`
- `RouteGroupBuilder.MapPost`
- `RouteGroupBuilder.MapPut`
- `RouteGroupBuilder.MapPatch`
- `RouteGroupBuilder.MapDelete`
- `RouteGroupBuilder.MapMethods`
- `RouteGroupBuilder.MapGroup`
- `RouteGroupBuilder.WithMetadata`
- `RouteGroupBuilder.AddEndpointFilter`
- `RouteGroupBuilder.AddEndpointFilterFactory`
- `WithName`
- `WithDisplayName`
- `WithTags`
- `WithSummary`
- `WithDescription`
- `WithOrder`
- `WithMetadata`
- `WithOpenApi (legacy API description extension)`
- `Produces`
- `Produces<TResponse>`
- `ProducesProblem`
- `ProducesValidationProblem`
- `Accepts<TRequest>`
- `ExcludeFromDescription`
- `DisableAntiforgery`
- `RequireHost`
- `RequireAuthorization`
- `AllowAnonymous`
- `RequireRateLimiting`
- `DisableRateLimiting`
- `RequireCors`
- `WithRequestTimeout`
- `DisableRequestTimeout`
- `WithStaticAssets`
- `Route handler delegate`
- `Route handler return type`
- `Route handler overload resolution`
- `Route handler endpoint name`
- `Route group prefix`
- `Route group nested prefix`
- `Route group endpoint metadata`
- `Route group convention`
- `Route handler service registration`
- `AddEndpointsApiExplorer`
- `EndpointNameMetadata`
- `IEndpointNameMetadata`
- `IProducesResponseTypeMetadata`
- `ITagsMetadata`
- `IEndpointSummaryMetadata`
- `IEndpointDescriptionMetadata`
- `AddOpenApiOperationTransformer`

## How this group fits the mental model
Mapping creates endpoint metadata that routing uses later; builders and groups are the configuration surface before requests arrive.

## Supplied names explained
The explanation above covers every declared mapping method, builder, group member, metadata helper, policy extension, API explorer/OpenAPI hook, and handler contract. The exact index below preserves the supplied names for completeness.

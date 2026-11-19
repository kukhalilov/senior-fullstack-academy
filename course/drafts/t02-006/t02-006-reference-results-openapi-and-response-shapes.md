# ASP.NET Core Minimal APIs route handlers endpoint filters validation and results — Reference: Results, typed result contracts, file responses, and API descriptions

Sources: Microsoft's [Minimal API responses](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses?view=aspnetcore-11.0), [OpenAPI document generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/openapi?view=aspnetcore-11.0), [OpenAPI customization](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi?view=aspnetcore-11.0), and [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11?view=aspnetcore-11.0).

## Scope and version

Targets ASP.NET Core 11 Minimal API result contracts and API descriptions. ASP.NET Core 11 generates OpenAPI 3.2.0 by default (ASP.NET Core 10 defaults to 3.1.0); `OpenApiOptions.OpenApiVersion` can select the document version. File response description improvements are version-specific. OpenAPI customization and API versioning are treated in t02-013.

## Return shapes

Handlers can return `string`, a serializable value, `IResult`, or concrete typed results, including awaitable forms. A string is written as `text/plain`; ordinary objects are JSON serialized; `IResult.ExecuteAsync` controls its own response behavior. A handler returning `IResult` can easily choose among different `Results.*` helpers because they share the interface.

`TypedResults` helpers return concrete result types and contribute response metadata. When an endpoint returns multiple distinct typed results, declare `Results<T1,T2,...>` (or an awaited equivalent) so the compiler can check branches and OpenAPI metadata can describe them. `Results` versus `TypedResults` is a static contract and testing/metadata tradeoff, not a runtime serialization-quality ranking. Explicit `.Produces` metadata can describe variants where non-typed results are returned.

`IActionResult` is the MVC contract and `IResult` is the HTTP endpoint result contract used by Minimal APIs. They are not interchangeable; MVC uses action result executors and controller context, while Minimal API results execute against `HttpContext`.

## Status/result families

Use `Ok<TValue>`/`Results.Ok`/`TypedResults.Ok` for representations; `Created<TValue>` or `CreatedAtRoute` for created resources; `Accepted<TValue>` and `AcceptedAtRoute` for accepted asynchronous work; `NoContent` for successful no-body responses; `BadRequest<TValue>`, `NotFound<TValue>`, `Conflict<TValue>`, and `UnprocessableEntity<TValue>` where their semantics fit. Problem and validation-problem results provide structured errors (`ProblemHttpResult`, `HttpValidationProblemDetails`). `StatusCodeHttpResult` allows a custom status but should not replace semantically richer results when they apply.

`Results.Text`, `Results.Content`, and `Results.Json` express explicit text/content/JSON responses. Redirect and local-redirect results have different safety properties; use local redirects when destination input may be untrusted. Challenge/forbid delegate to authentication schemes; sign-in/sign-out require the configured authentication scheme and should be applied with care. These are not generic substitutes for endpoint authorization metadata.

File results can write bytes, streams, or file-backed content and support content type/download name, conditional requests, and ranges through the appropriate result APIs. Prefer streaming for large content, set metadata accurately, dispose streams correctly, authorize access, and never derive an unrestricted path from untrusted input. In ASP.NET Core 11, OpenAPI binary file schemas require suitable response metadata; `.Produces<Stream>(contentType: ...)` is a documented way to describe binary content. `IFormFile` is an upload/binding type, not a response result.

Result metadata interfaces (`IContentTypeHttpResult`, `IStatusCodeHttpResult`, `IValueHttpResult`, `IValueHttpResult<TValue>`, `IFileHttpResult`) let filters and tests inspect result shape without brittle concrete-type assumptions. `IResult` test assertions can test common result implementations, but HTTP integration tests are needed to prove serialization, headers, and body.

## OpenAPI metadata is a separate output

`OpenApiDocument` describes an API; `OpenApiOperation` describes an operation. `AddOpenApi` registers the built-in document services and `MapOpenApi` exposes generated documents when mapped/configured. Endpoint metadata supplies names, tags, parameter and response descriptions. `ProducesResponseTypeMetadata`, `ProducesParameterMetadata`, and route builder `.Produces` metadata inform documentation. They do not validate requests or force the runtime handler to return the described result. Verify generated docs and actual HTTP behavior together.

`WithOpenApi` is deprecated as of .NET 10. Use the current OpenAPI document pipeline and operation transformers for document customization. Keep generated document version and tooling aligned to supported ASP.NET Core release behavior. ASP.NET Core 11 supports OpenAPI 3.2.0; do not assume every third-party consumer supports that dialect without checking compatibility.

## Comparison and example

```csharp
app.MapGet("/orders/{id:int}", async Task<Results<Ok<OrderDto>, NotFound>>
    (int id, IOrderService service, CancellationToken ct) =>
{
    var order = await service.FindAsync(id, ct);
    return order is null ? TypedResults.NotFound() : TypedResults.Ok(order);
})
.WithName("GetOrder")
.ProducesProblem(StatusCodes.Status500InternalServerError);
```

The union declares the two ordinary branches and typed helpers supply metadata. The additional `.ProducesProblem` is documentation only; if the application promises a mapped 500 body, configure the corresponding exception handling. Integration tests should verify both response branches and generated OpenAPI output.

## Common mistakes

Returning `Results` and expecting concrete typed metadata; using mixed `TypedResults` branches without an explicit union; assuming `.Produces` changes runtime execution; confusing `IResult` and `IActionResult`; treating file result metadata as automatic OpenAPI documentation; and asserting result type without testing serialized HTTP output.

## Knowledge checks with answers

1. **Why use typed unions?** They constrain legal result branches and preserve response metadata.
2. **Does `Produces<T>` execute a serializer?** No; the returned result does.
3. **What does `IResult.ExecuteAsync` do?** Writes the result's HTTP response against the current context.
4. **What is needed to publish OpenAPI?** Configure a document generator and map/serve its document endpoint.
5. **How do you describe binary file output?** Supply matching response metadata, commonly with `Stream` and the actual content type.

## Exact terms covered

### Exact terms covered

- `IResult`
- `TypedResults`
- `Results`
- `Results.Ok`
- `TypedResults.Ok`
- `Ok<TValue>`
- `Results.Created`
- `TypedResults.Created`
- `Created<TValue>`
- `Results.CreatedAtRoute`
- `TypedResults.CreatedAtRoute`
- `Results.Accepted`
- `TypedResults.Accepted`
- `Accepted<TValue>`
- `Results.AcceptedAtRoute`
- `TypedResults.AcceptedAtRoute`
- `Results.NoContent`
- `TypedResults.NoContent`
- `NoContent`
- `Results.BadRequest`
- `TypedResults.BadRequest`
- `BadRequest<TValue>`
- `Results.NotFound`
- `TypedResults.NotFound`
- `NotFound<TValue>`
- `Results.Conflict`
- `TypedResults.Conflict`
- `Conflict<TValue>`
- `Results.UnprocessableEntity`
- `TypedResults.UnprocessableEntity`
- `UnprocessableEntity<TValue>`
- `Results.Problem`
- `TypedResults.Problem`
- `ProblemHttpResult`
- `Results.ValidationProblem`
- `TypedResults.ValidationProblem`
- `HttpValidationProblemDetails`
- `Results.StatusCode`
- `TypedResults.StatusCode`
- `StatusCodeHttpResult`
- `Results.Text`
- `TypedResults.Text`
- `Results.Json`
- `TypedResults.Json`
- `Results.File`
- `TypedResults.File`
- `Results.Stream`
- `TypedResults.Stream`
- `Results.Content`
- `TypedResults.Content`
- `Results.Redirect`
- `TypedResults.Redirect`
- `Results.LocalRedirect`
- `TypedResults.LocalRedirect`
- `Results.Challenge`
- `TypedResults.Challenge`
- `Results.Forbid`
- `TypedResults.Forbid`
- `Results.SignIn`
- `Results.SignOut`
- `IResult.ExecuteAsync`
- `IContentTypeHttpResult`
- `IStatusCodeHttpResult`
- `IValueHttpResult`
- `IValueHttpResult<TValue>`
- `IFileHttpResult`
- `IFormFile`
- `OpenApiOperation`
- `OpenApiDocument`
- `AddOpenApi`
- `MapOpenApi`
- `WithOpenApi obsolete status`
- `OpenAPI 3.2.0 support in ASP.NET Core 11`
- `OpenAPI operation file-response description`
- `OpenAPI endpoint metadata`
- `ProducesResponseTypeMetadata`
- `ProducesParameterMetadata`
- `RouteHandlerBuilder.Produces`
- `TypedResults compile-time response union`
- `Results versus TypedResults`
- `IResult test assertions`
- `Response content type metadata`
- `Response status code metadata`
- `Response body serialization selection`

## How this group fits the mental model
The handler return is transformed by a result implementation into an HTTP response; endpoint metadata is separately consumed by API description tooling.

## Supplied names explained
The exact index below includes every declared result helper, result contract, metadata interface, status family, file behavior, and OpenAPI member. Explanations above group these names by wire behavior.

## Cross-item comparison
`IResult` provides a common runtime contract; concrete typed results provide compile-time branch and metadata detail; OpenAPI document metadata describes an endpoint without executing it.

## Examples
See the typed-union example above, which demonstrates the response branches and the separate documentation-only metadata extension.

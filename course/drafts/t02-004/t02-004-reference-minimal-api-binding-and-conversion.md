# ASP.NET Core endpoint routing route patterns constraints and binding — Reference: Minimal API parameter-source inference, body rules, and custom binding

## Scope and version

Sources: Microsoft's [Minimal API parameter binding guide](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0), [routing guide](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), and [Minimal API binding API reference](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding?view=aspnetcore-11.0). The inventory reflects ASP.NET Core 11-era behavior. Parameter-source inference is framework-version-sensitive; verify generated metadata/OpenAPI and runtime behavior for the target.

## How this group fits the mental model

Minimal API route handlers use parameter types, registration, route templates, and attributes to infer sources. Binding runs after endpoint selection and before the delegate. Explicit source declarations improve clarity and guard against inference changes.

## Supplied names explained

- `Minimal API parameter binding` — process that obtains and converts route/query/header/form/body/service/custom data for a route handler's declared parameters.
- `Route handler parameter` — delegate parameter representing an input or special framework value required by an endpoint handler.
- `Route handler binding precedence` — rules used to infer source based on explicit attributes, special types, route pattern values, service registration, and bind/parse support. Consult the current version rather than assuming a universal one-line precedence list.
- `Route handler route value` — value captured from a matching route pattern and converted to the target parameter type.
- `Route handler query value` — query-string value bound by key/name or explicit query attribute.
- `Route handler header value` — HTTP header value bound explicitly or through supported inference/metadata.
- `Route handler JSON body` — complex parameter inferred/declared as a JSON request-body model for supported HTTP methods/content types.
- `Route handler service parameter` — registered DI service supplied to the handler rather than read from request data.
- `Route handler special type parameter` — framework type such as `HttpContext`, `HttpRequest`, `HttpResponse`, `ClaimsPrincipal`, or cancellation token supplied from request/host state.
- `HttpContext parameter binding` — injects the current request context directly into the handler; do not retain it beyond the request.
- `HttpRequest parameter binding` — supplies the current request object, including route/query/header/body access.
- `ClaimsPrincipal parameter binding` — supplies the authenticated principal associated with the current request; authentication middleware/handler must have populated it.
- `CancellationToken parameter binding` — supplies the request-aborted token; propagate it to downstream I/O and do not treat cancellation as proof a write did not commit.
- `Stream body binding` — exposes the request body stream for incremental/custom processing. It is forward-only/unbuffered by default, must be consumed within request lifetime, and requires size/backpressure limits.
- `PipeReader body binding` — exposes the request body through pipelines for efficient incremental parsing; obey buffer advancement/ownership and do not retain underlying memory past its lifetime.
- `IFormFile parameter binding` — binds an uploaded file from multipart form data; enforce size/type/content checks, safe filenames, storage outside public roots, and antiforgery for cookie-authenticated browser flows.
- `IFormFileCollection parameter binding` — binds multiple uploaded files from a multipart form collection; apply aggregate/count/size limits.
- `IFormCollection parameter binding` — binds parsed form fields/files as a collection; requires form-encoded/multipart request content and suitable antiforgery/security handling.
- `AsParametersAttribute` — instructs Minimal APIs to bind a parameter aggregate from its component members rather than treat the whole object as one body parameter, subject to supported member sources.
- `AsParameters parameter aggregation` — groups related route/query/header/form/service inputs into a type for handler signature clarity; avoid using it to obscure a complicated public contract.
- `BindAsync method pattern` — custom handler binding pattern allowing a type to create itself asynchronously from HTTP context/parameter metadata and indicate binding failure/null according to supported signature.
- `IBindableFromHttpContext<TSelf>` — static-abstract interface pattern for a type that can bind itself from `HttpContext` and parameter information on supported target frameworks.
- `IParsable<TSelf>` — .NET parsing interface used by Minimal API binding for supported simple types, allowing static parsing from string/culture.
- `IFormattable model parsing` — string formatting interface only; it does not itself define a reliable inbound parse contract. Prefer `IParsable<TSelf>`, `TryParse`, or custom binding for conversion.
- `TryParse parameter-binding pattern` — recognized static parsing pattern used to convert a single string-like route/query/header value to a typed parameter; return false for invalid text and define culture/format semantics.
- `IServiceProviderIsService service inference` — service-provider capability used by Minimal API to determine whether a parameter type is registered as a service; registration can affect whether a complex parameter is inferred from DI or body.
- `FromBodyAttribute in Minimal APIs` — explicitly declares a handler parameter should be read from the request body using JSON/body binding rules.
- `FromServicesAttribute in Minimal APIs` — explicitly resolves a parameter from dependency injection.
- `FromRouteAttribute in Minimal APIs` — explicitly selects route values and can name a route key.
- `FromQueryAttribute in Minimal APIs` — explicitly selects query string and can name a query key.
- `FromHeaderAttribute in Minimal APIs` — explicitly selects an HTTP header and can specify its external header name.
- `FromFormAttribute in Minimal APIs` — explicitly binds form fields/files; requires suitable form content and may involve antiforgery behavior.
- `Route handler complex type body inference` — an unregistered complex parameter may be inferred as a JSON body on supported methods; registered types may be inferred as services. Use attributes when the source should be unambiguous.
- `Multiple body parameter error` — multiple parameters inferred/marked from the same request body cannot each independently consume it; aggregate them into one body DTO or read the stream once.
- `Body parameter on GET` — GET/HEAD/OPTIONS/DELETE do not implicitly infer body binding in current guidance; explicit `[FromBody]` or manual request-body reading is possible but often poorly interoperable and should be avoided unless contract demands it.
- `Empty body behavior` — missing/empty body for a required non-nullable body parameter can fail request binding; nullable/optional/default settings affect behavior. Specify empty-body policy and test exact framework behavior.
- `Optional body parameter` — a nullable/defaulted parameter can permit an absent body value for supported binding shape; nullable does not make malformed supplied JSON valid.
- `DisableInferBodyFromParameters` — route-handler option that disables implicit complex-type body inference, requiring explicit body source declarations where applicable and reducing accidental body-contract changes.
- `Route handler parameter nullability` — nullable annotations/default values influence missing-source behavior and generated metadata, but do not bypass conversion failures or business validation.
- `Route handler binding exception` — exception/result generated when a required parameter cannot be supplied or converted; framework behavior and response details depend on binding source and version.
- `Route handler binding diagnostics` — startup/runtime diagnostics, exceptions, metadata, and logs used to identify inferred source or conversion failures; avoid logging sensitive request bodies.
- `Route handler binding source metadata` — endpoint metadata describing inferred/explicit parameter source and types, usable by tooling such as API description generation.
- `Endpoint filters on parameter-binding failures` — in ASP.NET Core 11, a configured Minimal API filter pipeline also runs after supported parameter-check failures (such as invalid route/query/header parsing), with the response status set to 400 and the handler skipped. In Development, set `RouteHandlerOptions.ThrowOnBadRequest = false` for the filter to observe the response instead of the developer exception behavior; this does not make filters handle body deserialization failures or arbitrary binding exceptions.
- `C# union types in Minimal API JSON binding` — .NET 11 union types can be serialized/deserialized anywhere `System.Text.Json` is used, including Minimal API JSON request and response bodies. They are not supported for route, query, header, or form binding sources.

## Cross-item comparison

`FromRouteAttribute`, `FromQueryAttribute`, `FromHeaderAttribute`, `FromFormAttribute`, and `FromBodyAttribute` make request sources explicit; a service parameter comes from DI. `IParsable<TSelf>`/`TryParse` handle string-to-type conversion; `BindAsync`/`IBindableFromHttpContext<TSelf>` can inspect broader request context. `AsParameters` aggregates member sources; it is not the same as a JSON body DTO. `IFormFile` binds multipart data; `Stream`/`PipeReader` access the raw body. ASP.NET Core 11 filters may observe parameter-check failures, but body deserialization failures and binding exceptions do not pass through that filter path; JSON union types apply only to JSON serialization-based sources.

## Examples

```csharp
app.MapGet("/products/{id:int}",
    ([FromRoute] int id, [FromQuery] int page, CatalogService catalog,
     CancellationToken cancellationToken) =>
        catalog.GetPageAsync(id, page, cancellationToken));

app.MapPost("/products", ([FromBody] CreateProduct request) =>
    Results.Created("/products/1", request));
```

The registered service is inferred from DI; explicit route/query/body attributes make request sources clear. Add authorization, validation, and safe result/link behavior independently. For large uploads, bind `Stream` or `PipeReader`, enforce a byte limit while consuming, and do not keep the request reader after the handler returns.

## Common mistakes

- Assuming every complex type is a body even when DI has a matching service registration.
- Using two body-bound parameters.
- Assuming GET body semantics interoperate with proxies/caches/client libraries.
- Treating nullable binding as permission to accept malformed data.
- Buffering unbounded uploads into memory or trusting `IFormFile.FileName` as a safe path.
- Using `IFormattable` alone as a parsing contract.
- Depending on inferred sources for a public API without tests/OpenAPI review.

## Knowledge checks with answers

1. **What is the safest way to remove source ambiguity?** Declare the source explicitly with the appropriate binding attribute.
2. **How do two model objects enter one JSON body?** Put them into one request DTO; the body is consumed through one binding path.
3. **What must a streaming body handler do?** Read incrementally with size limits, propagate cancellation, and finish before request resources expire.
4. **Does `AsParameters` mean JSON body?** No; it aggregates member binding sources.

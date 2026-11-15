# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Reference: Built-in OpenAPI generation, document routes, schema descriptions, transformers, and build output

## Scope and version

This reference covers ASP.NET Core's `Microsoft.AspNetCore.OpenApi` generator and its API surface in ASP.NET Core 11. .NET 10 generates OpenAPI 3.1 by default; .NET 11 defaults to 3.2 and depends on Microsoft.OpenApi 3.x. Pin an older document version explicitly when downstream tooling needs it. API versioning, API UI rendering, and client generation are separate concerns. [Generate OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi) [Customize OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi) [ASP.NET Core 11 OpenAPI changes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## How this group fits the mental model

The generator inspects endpoint/API Explorer metadata, response declarations, and System.Text.Json metadata to build an OpenAPI document. Runtime `MapOpenApi` exposes that generated JSON/YAML through a route. Build-time generation launches the app entrypoint with a mock server; it is not static analysis. Transformers customize the document at schema, operation, or whole-document scope. An OpenAPI document is a published contract artifact: it does not enforce implementation behavior and is not itself a browser UI. [OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

## Supplied names explained

| Supplied name | Meaning and use |
|---|---|
| `Microsoft.AspNetCore.OpenApi package` | ASP.NET Core package that generates OpenAPI documents from API metadata. It is not Swagger UI or an API-versioning library. |
| `AddOpenApi` | Registers OpenAPI generation services for the default named document (`v1`). |
| `AddOpenApi(String)` | Registers a document under a supplied name, allowing separate internal/public or version-oriented descriptions. |
| `AddOpenApi(Action<OpenApiOptions>)` | Registers a document and configures generation options such as version, inclusion, and transformers. |
| `OpenApiOptions` | Options controlling a generated document and transformer pipeline. Configure at service registration. |
| `OpenApiOptions.DocumentName` | Name associated with the document; it also determines the default `MapOpenApi` route parameter. |
| `OpenApiOptions.OpenApiVersion` | Specification version emitted. .NET 11 defaults to 3.2; select 3.1/3.0 for a constrained downstream toolchain. |
| `OpenApiOptions.ShouldInclude` | Predicate controlling whether an API description is included in a particular document. Use it to separate document audiences deliberately. |
| `MapOpenApi` | Maps the default OpenAPI JSON endpoint, normally `/openapi/{documentName}.json`. It has no authorization by default. |
| `MapOpenApi(String)` | Maps the document at a custom route, which can include `{documentName}` and `.yaml`/`.yml` for YAML output. Removing the name from route/query can produce ambiguous resolution. |
| `IOpenApiDocumentTransformer` | Interface for final, whole-document customization after schemas and operations are present. Good for document-wide info, servers, or security configuration. |
| `IOpenApiOperationTransformer` | Interface for per-operation customization using its API description/endpoint metadata. Use when behavior differs by route or endpoint metadata. |
| `IOpenApiSchemaTransformer` | Interface for schema-level changes informed by JSON type metadata. Use for type-specific formats, descriptions, or constraints. |
| `OpenApiOptions.AddDocumentTransformer` | Registers a document transformer by delegate, instance, or DI-activated type. Multiple transformers execute in registration order. |
| `OpenApiOptions.AddOperationTransformer` | Registers an operation transformer by delegate, instance, or DI type; executes in registration order for operations. |
| `OpenApiOptions.AddSchemaTransformer` | Registers a schema transformer by delegate, instance, or DI type; executes when schemas are registered and before operations/document pass. |
| `OpenApiDocumentTransformerContext` | Context for a document transformer, including document name, associated API descriptions, and services used during generation. |
| `OpenApiOperationTransformerContext` | Context for an operation transformer, including document name, the `ApiDescription`, and generation services. |
| `OpenApiSchemaTransformerContext` | Context for schema customization, including document name, JSON type information, and generation services. |
| `OpenApiGenerateDocuments` | MSBuild target used to generate OpenAPI documents at build time when the API-description server package is configured. It runs application startup under a mock server. |
| `OpenApiGenerateDocumentsOptions` | MSBuild item carrying generation arguments, including the target OpenAPI version. |
| `--openapi-version` | Build-time generation argument selecting a document spec version, for example `OpenApi3_1`. |
| `OpenAPI document generation at build time` | Uses `Microsoft.Extensions.ApiDescription.Server` to invoke the entrypoint with mock server behavior and emit an artifact during build. Startup/configuration executes, so isolate production-only dependencies and secrets. |
| `OpenAPI document generation at runtime` | `AddOpenApi` plus `MapOpenApi` creates a document endpoint. It regenerates per request unless configured to cache; decide exposure and authorization deliberately. |
| `OpenAPI named documents` | Multiple `AddOpenApi(name, ...)` registrations can produce documents with distinct endpoint groups or transformer configuration. Ensure each document intentionally includes the right endpoints. |
| `OpenAPI endpoint authorization` | The mapped document endpoint is not protected by default. Apply endpoint authorization or map it only in approved environments if schemas reveal sensitive routes/models. |
| `OpenAPI document caching` | Avoids repeating document generation for every runtime request when document output is stable. Dynamic context-dependent transformers may make caching incorrect. |
| `OpenAPI schema generation from System.Text.Json` | Schema shape follows serializer metadata/conventions and may be affected by JSON options/converters. Verify the document against actual serialization and deserialization. |
| `OpenAPI document transformer ordering` | Schema transformers run as schemas are registered, operation transformers as operations are added, and document transformers after all content; within each stage registration order applies. |
| `ApiExplorer response metadata` | API Explorer metadata describes endpoint inputs/responses for generation. Incomplete declarations lead to incomplete OpenAPI even when runtime behavior exists. |
| `ProducesResponseTypeAttribute` | MVC metadata declaring a response status/type; multiple declared response types can describe alternatives and ASP.NET Core 11 preserves response metadata more faithfully. |
| `ProducesAttribute` | Declares supported response content types for endpoint/controller metadata. Keep it aligned with actual formatter/result behavior. |
| `AcceptsAttribute` | Declares accepted request content types for an endpoint, informing API Explorer and generated request-body metadata. |
| `WithSummary` | Minimal API endpoint metadata for concise operation summary. |
| `WithDescription` | Minimal API endpoint metadata for fuller operation documentation. |
| `WithName` | Assigns endpoint name metadata, also used by routing/link generation; names should be stable and unique where required. |
| `WithTags` | Assigns OpenAPI tags that group related operations for readers/tools. |
| `WithGroupName` | Assigns an API Explorer group/document membership name; it can be used to divide named documents. |
| `WithOpenApi deprecated in ASP.NET Core 10` | Legacy Minimal API customization hook marked deprecated beginning in ASP.NET Core 10. Prefer built-in endpoint metadata (`WithSummary`, `WithDescription`, response metadata) and transformer APIs for document customization. |
| `Microsoft.OpenApi 3.x object model` | ASP.NET Core 11's dependency upgrade changes model members/collections and can break source written against 2.x. Transformer interfaces remain, but audit custom transformer code and namespaces/types. |
| `OpenAPI 3.0 document` | Earlier specification option for compatible tooling. It lacks later 3.1/3.2 capabilities; select deliberately instead of assuming the latest generator can express them. |
| `OpenAPI 3.1 document` | .NET 10 default; aligns schema dialect behavior with JSON Schema 2020-12 capabilities. Can be explicitly selected in ASP.NET Core 11. |
| `OpenAPI 3.2 document` | .NET 11 default. Supports newer constructs such as native `query` path-item operations and richer binary/SSE descriptions; toolchain support must be checked. |
| `JSON Schema draft 2020-12` | Schema dialect supported by the generator. Consumers that assume older OpenAPI/JSON Schema subsets may need upgrades or a pinned document version. |
| `OpenAPI binary response schema` | ASP.NET Core 11 can describe binary file responses using current OpenAPI schema conventions. Validate generated output and downstream code-generation handling. |
| `OpenAPI multiple content response schemas` | ASP.NET Core 11 API Explorer retains multiple declared response types: different media types become separate content entries; same-content alternatives can be represented with `anyOf`. |
| `OpenAPI Server-Sent Events itemSchema` | OpenAPI 3.2 supports the SSE media type's stream item schema description; do not claim that a 3.1 document carries this same standardized field. |
| `HTTP QUERY method RFC 10008` | Standardized HTTP method for sending a query representation as request content when URI query parameters are insufficient. The target resource defines how it processes the query. |
| `HTTP QUERY is safe and idempotent with request content` | RFC 10008 defines QUERY as safe and idempotent, unlike arbitrary POST-based query conventions. A QUERY request requires a Content-Type describing its content; clients and intermediaries still need end-to-end support. |
| `Accept-Query response header supported query media types` | Response field that advertises media types the resource accepts as QUERY content, such as JSON-based or form query formats. It is distinct from `Accept`, which negotiates response representations. |
| `OpenAPI 3.2 query field for QUERY operations` | OpenAPI 3.2 has a native `query` operation field on a path item so the body-bearing QUERY method can be described directly. ASP.NET Core's `MapMethods` can map the method; document generation does not ensure every proxy/client supports it. |
| `OpenAPI 3.0 and 3.1 QUERY extension representation` | These versions lack the OpenAPI 3.2 native `query` field; ASP.NET Core emits QUERY under `x-oai-additionalOperations`. Consumers must understand the extension to discover the operation. |

## Cross-item comparison

| Choice | Good for | Tradeoff or boundary |
|---|---|---|
| Runtime generation | Current document from live application metadata | App startup/runtime route exposure and per-request generation cost |
| Build-time generation | Versioned artifact for review, codegen, or release | Executes startup and may differ by environment/configuration |
| Document transformer | Global document metadata/security/servers | Runs after operations; too broad for route-specific conditions |
| Operation transformer | Route-specific policy/response/security metadata | Must inspect endpoint metadata correctly and avoid false global assumptions |
| Schema transformer | JSON type-based schema conventions | Does not change actual serializer behavior |
| OpenAPI 3.2 | Latest ASP.NET Core 11 representation | Older tools may not parse new constructs; pin 3.1 when required |

## Examples

### Generate and protect a runtime document

```csharp
builder.Services.AddAuthorization(options =>
    options.AddPolicy("ApiSchemaReaders", policy => policy.RequireRole("api-schema-reader")));
builder.Services.AddOpenApi("internal");

var app = builder.Build();
app.MapOpenApi("/openapi/{documentName}.json")
   .RequireAuthorization("ApiSchemaReaders");
```

The authorization policy is an application decision; a generated document route does not acquire a policy automatically. Use a separate public document if some paths or schemas must remain undisclosed. [OpenAPI endpoint authorization](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

### Pin a version for a downstream generator

```csharp
builder.Services.AddOpenApi(options =>
{
    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_1;
});
```

This preserves 3.1 output when consumers have not adopted 3.2. At build time, configure `OpenApiGenerateDocumentsOptions` with `--openapi-version OpenApi3_1`. [Version selection](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/openapi-version-default-3-2)

### Register a narrow transformer

```csharp
builder.Services.AddOpenApi(options =>
{
    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        if (context.Description.RelativePath == "health")
        {
            operation.Summary = "Health status";
        }

        return Task.CompletedTask;
    });
});
```

The exact model types vary with the referenced Microsoft.OpenApi major version. Compile transformer code against the framework package in the target project and verify output, rather than copying old `Microsoft.OpenApi.Models` examples into ASP.NET Core 11 unchanged. [Transformer customization](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi)

### Describe a large, safe query payload

```csharp
app.MapMethods("/search", ["QUERY"], (SearchRequest request) =>
    SearchService.Run(request));
```

HTTP QUERY is now standardized by RFC 10008 as a safe, idempotent request with query content and a required media type. OpenAPI 3.2 represents it natively; a pinned 3.0/3.1 document uses the framework's `x-oai-additionalOperations` extension. This does not guarantee that a browser, CORS policy, proxy, gateway, cache, or generated client supports QUERY. Test the full path, and keep GET when a URI is suitable. [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) [OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

## Common mistakes

- Assuming the generated document is a Swagger UI, client, validator, or runtime enforcement mechanism.
- Publishing a runtime OpenAPI route publicly without reviewing endpoint/schema exposure.
- Assuming `MapOpenApi` requires authorization by default.
- Treating build-time generation as static analysis; application startup executes with a mock server.
- Using dynamic transformers and caching their output without accounting for request/configuration-dependent output.
- Assuming ASP.NET Core 11 still emits 3.1 by default or that all .NET 10-era Microsoft.OpenApi 2.x transformer code compiles unchanged.
- Describing OpenAPI 3.2 features in a pinned 3.0/3.1 artifact as if standardized there.
- Assuming API Explorer can infer responses that the app never declares.
- Using deprecated `WithOpenApi` customization when endpoint metadata/transformers are the current approach.

## Knowledge checks with answers

1. **Which component generates the document?** The `Microsoft.AspNetCore.OpenApi` package; a UI such as Swagger UI is a separate renderer.
2. **What is the .NET 11 default spec?** OpenAPI 3.2; explicitly select 3.1 if consumers require it.
3. **Does `MapOpenApi` protect its endpoint?** No. Apply authorization or restrict mapping by environment as appropriate.
4. **In what order do transformers run?** Schema registration stage, operation stage, then final document stage; registration order applies within each stage.
5. **Does build-time generation avoid application startup?** No. It launches the entrypoint with a mock server, so startup dependencies/configuration matter.
6. **Does an OpenAPI document prove the implementation matches?** No. Tests and contract review compare the declared contract with actual behavior.

## Sources

- [Generate OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [Customize OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi)
- [OpenAPI 3.2 default breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/openapi-version-default-3-2)
- [Microsoft.OpenApi 3.x breaking change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/microsoft-openapi-3x)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

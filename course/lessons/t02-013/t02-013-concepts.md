# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to explain how OpenAPI relates to runtime behavior; select a versioning strategy and distinguish ASP.NET Core APIs from the `Asp.Versioning` library; shape safe, consistent errors; choose offset or cursor pagination; and design retry/idempotency and concurrency behavior without claiming exactly-once delivery.

## Prerequisites

Know basic HTTP methods, status codes, JSON request/response bodies, routing, and dependency injection. Understand that ASP.NET Core is the server framework, OpenAPI is a specification/document format, and an API versioning package supplies version negotiation and metadata APIs.

## Core concepts

### Contract versus implementation

An API contract describes observable behavior: paths, methods, parameters, schemas, status codes, authentication requirements, errors, ordering and retry guarantees. OpenAPI can represent much of this, but metadata can be incomplete or stale. Generated documents still need review and contract/integration tests. A documentation renderer such as Swagger UI consumes a document and displays it; it is a separate tool from `Microsoft.AspNetCore.OpenApi` generation.

### OpenAPI generation and version boundaries

`Microsoft.AspNetCore.OpenApi` generates a document from endpoint/API Explorer metadata and System.Text.Json schema information. It can generate at runtime or build time, generate named documents, and apply schema/operation/document transformers. In ASP.NET Core 10 the default document version is OpenAPI 3.1; ASP.NET Core 11 changes the default to 3.2 and upgrades the Microsoft.OpenApi model to 3.x. Pin 3.1 explicitly if a downstream generator cannot consume 3.2. `QUERY` request-body representation, binary responses, SSE item schemas, and 2020-12 JSON Schema support must be described only within their specification/version constraints. [OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi) [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

The HTTP `QUERY` method is standardized by RFC 10008 (June 2026), so references that call it merely proposed are stale. QUERY is safe/idempotent and carries query content with a required content type; `Accept-Query` can advertise supported query formats. In OpenAPI 3.2 it has a native path-item operation; ASP.NET Core's 3.0/3.1 output uses `x-oai-additionalOperations`. Standardization does not guarantee that every browser, gateway, proxy, cache, or client library supports it. [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) [OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)

Build-time generation launches the app entrypoint with a mock server; startup code executes and may read configuration or resolve services. It is not static analysis. Keep generation deterministic and avoid requiring production-only services/secrets at startup. Runtime OpenAPI endpoints regenerate documents when requested unless cached and have no authorization by default; map them conditionally or protect them when the schema is sensitive.

Transformers have different scopes and run in order: schema transformers run when schemas are registered; operation transformers run when operations are added; document transformers run after operations/schemas in a final document pass. Choose the narrowest scope and ensure each pass does not accidentally duplicate metadata. Runtime transformer objects can use DI, while build-time generation needs configuration that works in the generation environment.

### API versioning is separate from ASP.NET Core

`Asp.Versioning` is a separate community package family. Choose the `Http` package for Minimal APIs and `Mvc` for controllers; add API Explorer integration when version-specific descriptions/documents are needed. The old `Microsoft.AspNetCore.Mvc.Versioning` packages are deprecated. A requested version is read from a query string, URL segment, header, or media type. Readers can be combined, but supporting multiple locations increases client and ambiguity rules; document precedence and unsupported/missing-version behavior.

Version metadata belongs to endpoints/controllers, while API version sets group Minimal API endpoints. A versioned explorer can group endpoint descriptions into OpenAPI documents. Version-neutral endpoints deliberately operate independently from versioned contracts. Reporting supported/deprecated versions helps clients migrate but does not replace a retirement schedule, telemetry, or compatibility testing. Version only when needed; an additive response field may still break strict deserializers.

### Errors: transport shape and domain meaning

Problem Details (RFC 9457) standardizes a JSON object describing an HTTP problem, commonly served as `application/problem+json`. Its `type` identifies problem category, `title` summarizes it, `status` reflects HTTP status, `detail` gives safe occurrence-specific explanation, `instance` identifies the occurrence, and extensions carry additional members. Do not expose exception messages, stack traces, credentials, or internal identifiers to production clients.

`AddProblemDetails` registers `IProblemDetailsService`. `UseExceptionHandler` handles unhandled exceptions; `UseStatusCodePages` can fill bodyless error responses. Neither turns every domain outcome into the same error. A validation error, missing resource, conflict, throttling decision, and unexpected exception have different semantics and statuses. Content negotiation matters: if no registered writer supports the request's `Accept`, the service may not write a response. A Problem Details body must agree with the actual HTTP status.

MVC `[ApiController]` can automatically return 400 with validation problem details for invalid model state. Minimal API binding failures have `RouteHandlerOptions.ThrowOnBadRequest` behavior that differs between Development and other environments: thrown failures flow through exception handlers, while direct 400/415 responses can bypass them. ASP.NET Core 11 preserves `BadHttpRequestException.StatusCode` by default through `UseExceptionHandler`; custom handlers remain responsible for preserving intended client-error statuses.

### Pagination is a resource contract

Offset pagination (`page`/`pageSize` or `limit`/`offset`) is easy to understand but needs a hard maximum and deterministic ordering. Deep offsets can require reading/skipping many rows, and inserts/deletes before an offset can shift results between calls. Cursor/keyset pagination encodes a continuation position based on a stable total order (often a composite key such as `(createdAt, id)`). The token should be opaque to clients and integrity-protected if changing it could bypass filters or expose data. Reapply filters and sorting before paging; decide expiration and snapshot consistency. A total count can be expensive and may describe a different database snapshot than the page.

RFC 8288 `Link` relations can advertise a `next` page; an envelope may instead return items and continuation metadata. Neither format is universal. A next link/token must preserve relevant filters/order and avoid leaking secrets. Offset and cursor are not synonyms; use an approach consistent with data scale, ordering, consistency, and client needs.

### Idempotency, retry, and concurrency

HTTP defines safe and idempotent method semantics. GET and HEAD are safe and idempotent; PUT and DELETE are idempotent in intended effect; POST is not inherently idempotent; PATCH depends on the patch semantics. Idempotency is about the intended effect after repeating a request, not whether the exact same response bytes or status are returned. A request can be idempotent while still producing logs or other incidental observations.

An `Idempotency-Key` header convention can deduplicate application operations, but requires durable state. Define its scope (user/client/operation), expiry, request fingerprint, atomic reservation under concurrent duplicates, handling of same-key/different-payload requests, and replayed status/headers/body. Persist enough to recover after crashes between performing the effect and recording its result; coordinate external side effects with transactional outbox/provider idempotency where possible. This can provide at-most-once effect within the designed boundary, not a universal exactly-once guarantee.

ETag plus `If-Match` provides conditional update behavior. The server compares the client's validator with the current representation and rejects stale updates rather than silently overwriting. `428 Precondition Required` can tell a client a precondition is mandatory; `412 Precondition Failed` is the standard failed conditional request response; `409 Conflict` communicates a domain conflict. `429 Too Many Requests` may include `Retry-After`. Clients should retry only when the method/contract and response make it safe.

## Mechanisms and relationships

| Mechanism | Answers | Does not answer |
|---|---|---|
| OpenAPI document | What contract is described? | Whether runtime code conforms |
| API version reader | Which contract version did this request select? | Whether old clients remain compatible |
| Problem Details | How can the error be expressed consistently? | What domain rule should the API apply |
| Cursor | Where should collection traversal continue? | Whether the underlying data is a frozen snapshot |
| Idempotency record | Has this scoped operation/key already been processed? | Global exactly-once delivery across unrelated systems |
| ETag/If-Match | Has the resource changed since the client read it? | Whether the caller is authorized to update it |

## Worked examples

### Produce a compatible document

```csharp
builder.Services.AddOpenApi(options =>
{
    // Keep this explicit while a downstream toolchain still requires 3.1.
    options.OpenApiVersion = Microsoft.OpenApi.OpenApiSpecVersion.OpenApi3_1;
});
```

For .NET 11, 3.2 is the default. Removing the explicit setting later is a compatibility decision for code generators and consumers, not merely a framework cleanup. [OpenAPI 3.2 default change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/openapi-version-default-3-2)

### Return Problem Details for bodyless errors

```csharp
builder.Services.AddProblemDetails();
var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
```

Register production exception handling before endpoints and provide a safe fallback for unsupported `Accept` values or custom writers. Validate that the response status matches `ProblemDetails.Status`; log rich diagnostics on the server with a correlation identifier instead of exposing stack traces.

### Design a retry record

For `POST /payments`, scope an idempotency key to the authenticated customer and operation. Store a canonical request fingerprint and an in-progress/completed state under a unique constraint. A same-key, same-fingerprint completed request replays its original outcome; a different fingerprint is rejected; a concurrent duplicate waits or receives a documented conflict/retry response. Retain the record long enough to cover client retries, and coordinate external payment-provider idempotency and local persistence so a crash cannot charge twice.

## Misconceptions and edge cases

- OpenAPI generation does not create Swagger UI or prove that the runtime matches the description.
- `Asp.Versioning` is not a built-in ASP.NET Core framework namespace; pin compatible package versions and use current package names.
- A version header or query parameter is not authorization; version selection does not establish caller permissions.
- Problem Details `status` and the HTTP response status must not disagree.
- Error middleware cannot convert unsupported media-type errors when the app never routes them through that middleware path.
- Stable page ordering needs a unique tie-breaker; ordering only by a non-unique timestamp can still skip/duplicate rows.
- A cursor is not automatically secret, tamper-proof, or snapshot-consistent.
- A durable idempotency record does not guarantee exactly-once effects if the database and external side effect cannot be coordinated.
- PUT can be idempotent in final intended effect even if repeated requests return different response metadata.
- An additive response property can break strict clients and still needs compatibility review.

## Knowledge checks with answers

1. **What changed in the ASP.NET Core OpenAPI default for .NET 11?** Generated documents default to OpenAPI 3.2 rather than 3.1; set the version explicitly for older downstream tooling.
2. **Does ASP.NET Core's OpenAPI generator render an interactive API UI?** No. It generates a description; a UI such as Swagger UI is a separate consumer/tool.
3. **Is API versioning built into ASP.NET Core?** No. `Asp.Versioning` is a separate package family.
4. **Does `AddProblemDetails` guarantee every error has a JSON body?** No. Middleware path, preexisting body, and negotiated writer/content type affect whether a response is written.
5. **Why does cursor pagination need a total order?** A stable unique ordering defines an unambiguous continuation position and avoids duplicate/omitted rows from ties.
6. **Does an idempotency key mean the operation happens exactly once globally?** No. It can deduplicate within a designed durable boundary; external effects and crash windows require coordination.
7. **How does `If-Match` help updates?** The server applies the mutation only if the client's validator still matches the current representation, preventing silent lost updates.

## Sources

- [ASP.NET Core OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [Customize OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi)
- [Asp.Versioning documentation](https://dotnet.github.io/aspnet-api-versioning/)
- [API error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)

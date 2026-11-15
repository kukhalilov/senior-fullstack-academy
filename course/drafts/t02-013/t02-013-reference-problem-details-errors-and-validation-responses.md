# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Reference: RFC Problem Details, validation payloads, writers, exception handling, and API errors

## Scope and version

Problem Details for HTTP APIs is standardized by RFC 9457, with ASP.NET Core services and middleware for generating responses. The shape does not dictate application-specific error semantics: choose a status and stable problem type appropriate to the failure, then emit only safe detail. MVC and Minimal API paths differ in automatic validation and bad-request handling. ASP.NET Core 11 also changes the default handling of `BadHttpRequestException.StatusCode` through `UseExceptionHandler`. [ASP.NET Core error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors) [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html)

## How this group fits the mental model

An exception/status handler selects the HTTP outcome. A Problem Details service/writer can serialize a standard shape when the response has no body and content negotiation permits it. MVC validation may generate a `ValidationProblemDetails` response automatically; Minimal API binding failures follow route-handler and middleware settings. Domain validation and conflicts remain explicit application decisions. Always align the HTTP status with the document's optional `status` member and avoid exposing implementation details.

## Supplied names explained

| Supplied name | Meaning and use |
|---|---|
| `ProblemDetails` | Standard-shaped description of an HTTP problem occurrence, commonly JSON with `application/problem+json`. It describes the HTTP interface, not an exception dump. |
| `ProblemDetails.Type` | URI reference identifying the problem type; use a stable URI/identifier and document its semantics. `about:blank` conveys no semantics beyond the HTTP status. |
| `ProblemDetails.Title` | Short human-readable summary of the problem type, ideally stable for that type and not an occurrence-specific diagnostic. |
| `ProblemDetails.Status` | Optional HTTP status code associated with this occurrence. If present, it should agree with the actual response status. |
| `ProblemDetails.Detail` | Occurrence-specific human-readable explanation safe for the client. Do not include stack traces, SQL, secrets, or raw exception messages. |
| `ProblemDetails.Instance` | URI reference identifying this particular occurrence, such as a safe request path or opaque problem instance ID. Avoid leaking sensitive path/query data. |
| `ProblemDetails.Extensions` | Additional members for problem-specific structured data. Define stable names/types and ensure extensions do not expose sensitive information. |
| `ValidationProblemDetails` | ASP.NET Core validation-oriented Problem Details type that associates field names with one or more validation messages. |
| `ValidationProblemDetails.Errors` | Mapping from field keys to message arrays. Keep keys consistent with the public JSON contract and do not include rejected secret values. |
| `HttpValidationProblemDetails` | HTTP-layer validation error model used by ASP.NET Core APIs, including Minimal API validation responses in supported versions. |
| `AddProblemDetails` | Registers the default Problem Details service and supporting configuration in DI. Middleware still needs to handle exceptions/status-only responses. |
| `ProblemDetailsOptions` | Options for customizing Problem Details generation, including occurrence customization. |
| `ProblemDetailsOptions.CustomizeProblemDetails` | Callback that can set safe fields/extensions from the current `HttpContext`, such as a correlation ID or environment-safe metadata. Avoid overwriting status incorrectly. |
| `IProblemDetailsService` | Service abstraction used to write a Problem Details response, respecting registered writers/content negotiation. |
| `IProblemDetailsService.WriteAsync` | Attempts to write a Problem Details response using the current context/details; callers must provide an appropriate status/body state. |
| `IProblemDetailsService.TryWriteAsync` | Tries to write when a suitable writer exists and reports success/failure, enabling the caller to provide a fallback response. |
| `IProblemDetailsWriter` | Pluggable writer that decides whether it supports a context and serializes the details. |
| `IProblemDetailsWriter.CanWrite` | Determines whether the writer can produce the response for the supplied Problem Details context, including relevant negotiation conditions. |
| `IProblemDetailsWriter.WriteAsync` | Writes the actual response for a context accepted by `CanWrite`. Preserve status and content type and avoid writing a second body. |
| `DefaultProblemDetailsWriter` | Framework writer used by default when registered service/writer conditions allow it. Its supported media types and defaults can vary by framework release/configuration. |
| `Results.Problem` | Minimal API result factory for a Problem Details response. Supply the intended status/type/title/detail deliberately. |
| `Results.ValidationProblem` | Minimal API result factory for a validation-oriented error dictionary and status. |
| `ControllerBase.Problem` | MVC controller helper for producing a Problem Details response with controller/request context. |
| `ControllerBase.ValidationProblem` | MVC helper for returning validation errors as a validation Problem Details document. |
| `ProblemDetailsFactory` | MVC abstraction for creating Problem Details and validation details with application customization. |
| `ProblemDetailsFactory.CreateProblemDetails` | Creates a problem document for a given HTTP context/status and optional occurrence details. |
| `ProblemDetailsFactory.CreateValidationProblemDetails` | Creates validation details from a model-state dictionary and HTTP context. |
| `IProblemDetailsService content negotiation` | Writer selection depends on request `Accept` and supported media types. A call can fail to write when no registered writer can satisfy the request. |
| `Problem Details content type application/problem+json` | Standard JSON media type for a Problem Details representation. Do not force it when returning another negotiated representation. |
| `Problem Details extension members` | Application-defined JSON members beyond the standard core fields. Keep names documented, stable, bounded, and non-sensitive. |
| `UseExceptionHandler` | Middleware that catches unhandled exceptions from later pipeline components and produces a configured safe error response. Register for production handling and log diagnostics server-side. |
| `UseExceptionHandler(Action<IApplicationBuilder>)` | Overload to configure an alternate error-handling pipeline. Ensure it does not recurse and that custom response status/content type are set correctly. |
| `IExceptionHandler` | ASP.NET Core abstraction for an ordered exception handler registered with the exception-handler middleware. |
| `IExceptionHandler.TryHandleAsync` | Attempts to handle an exception and returns whether it handled it; if false, later handlers/normal exception behavior may continue. |
| `AddExceptionHandler<TExceptionHandler>` | Registers an `IExceptionHandler` implementation in DI for exception middleware. Handler order and fallback behavior should be tested. |
| `ExceptionHandlerOptions` | Configuration for exception handling, including handler path/callback, status code behavior, and diagnostics options. |
| `ExceptionHandlerOptions.StatusCodeSelector` | Selects an HTTP status for an exception. Map only known, safe failure categories; unknown exceptions should remain server errors. |
| `ExceptionHandlerOptions.ExceptionHandler` | Callback/alternate pipeline configuration used to handle an exception and write the response. |
| `UseStatusCodePages` | Middleware that can add a body to error responses that otherwise have no body; it does not replace exception handling. |
| `StatusCodePagesOptions` | Options for status-code page behavior, including a response callback or alternate path. |
| `StatusCodePagesMiddleware` | Middleware that detects eligible bodyless error status responses and invokes configured status-page behavior. Existing bodies are generally left alone. |
| `DeveloperExceptionPageMiddleware` | Development diagnostic middleware that can include detailed request/exception data. Never expose that diagnostic output in production. |
| `RouteHandlerOptions.ThrowOnBadRequest` | Controls whether Minimal API binding errors throw `BadHttpRequestException` or directly write a client-error status; defaults differ between Development and other environments. |
| `BadHttpRequestException.StatusCode preservation in ASP.NET Core 11` | In .NET 11, `UseExceptionHandler` preserves this exception's client status in Problem Details by default. Custom handlers must still preserve the intended status themselves. |
| `Automatic API controller model-state 400 response` | `[ApiController]` MVC behavior automatically returns 400 when model binding/validation leaves ModelState invalid, without entering the action. |
| `ApiBehaviorOptions.InvalidModelStateResponseFactory` | Custom factory for the automatic invalid-model-state response. Preserve a documented validation schema and avoid leaking attempted values. |
| `ValidationProblemDetails from ModelState` | Standard validation response created from MVC ModelState errors, generally containing field-keyed messages and a 400 status. |
| `Error response status consistency` | The actual HTTP status, `ProblemDetails.Status`, content type, and documented error category must tell the same story. |
| `Do not expose exception internals in production errors` | Keep stack traces, file paths, SQL, secret values, and internal messages in protected server logs; return safe detail plus a correlation reference. |
| `Accept header and supported Problem Details writer behavior` | If no writer supports the request's negotiated content type, `TryWriteAsync` may return false and middleware may produce no body; define/test a safe fallback. |
| `Problem Details is not a replacement for domain error semantics` | A shared document shape does not decide whether a condition is 400, 404, 409, 412, 429, or 5xx; map domain outcomes intentionally. |

## Cross-item comparison

| Response path | Typical use | Important behavior |
|---|---|---|
| `Results.Problem` / `ControllerBase.Problem` | Explicit known HTTP/domain problem | Caller chooses status/type and safe detail |
| Validation Problem Details | Invalid request fields/model | Field-keyed messages; avoid echoing secrets |
| `UseExceptionHandler` | Unexpected exception | Prevents framework details leaking; logs diagnostic context |
| `UseStatusCodePages` | Bodyless 4xx/5xx response | Adds representation; does not determine the right status |
| Developer exception page | Local development diagnostics | Detailed output is sensitive and must not run publicly |

Use middleware for infrastructure-level handling and explicit result types for expected domain outcomes. Validation errors are not server exceptions. A conflict may be a business rule even when no exception occurred. Set a stable problem `type` URI for important cases and let clients branch on documented machine-readable fields, not on parsing the English title.

## Examples

### Configure consistent API error responses

```csharp
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        context.ProblemDetails.Extensions["traceId"] =
            context.HttpContext.TraceIdentifier;
    };
});

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
```

Do not add raw exception data to the extension. The response needs a supported writer for the request's `Accept`; provide and test fallback behavior when `TryWriteAsync` cannot write.

### Return a known conflict without throwing

```csharp
return Results.Problem(
    type: "https://api.example.com/problems/order-state-conflict",
    title: "The order cannot be changed in its current state.",
    statusCode: StatusCodes.Status409Conflict);
```

The problem URI and title should remain stable/documented. Keep internal rule details in logs, and do not claim that the generic Problem Details type itself defines the order-state policy.

## Common mistakes

- Returning HTTP 500 while placing `"status": 400` in the Problem Details body.
- Treating `Detail` as a safe place to serialize exception messages or rejected credentials.
- Assuming `AddProblemDetails` automatically creates bodies for every error path regardless of middleware or `Accept`.
- Registering a custom writer that writes twice, fails to set the status, or handles an unsupported media type.
- Using `UseStatusCodePages` as a replacement for `UseExceptionHandler`.
- Exposing the Developer Exception Page outside development.
- Assuming Minimal API bad-request binding failures always throw in production.
- Mapping every exception to 400 or every domain conflict to 500.
- Using Problem Details as an excuse to return vague or unstable domain errors.

## Knowledge checks with answers

1. **What is the standardized Problem Details media type for JSON?** `application/problem+json`.
2. **Must `ProblemDetails.Status` agree with the HTTP response?** Yes, when present; clients can observe both.
3. **Does `AddProblemDetails` make exception handling middleware unnecessary?** No. Configure exception/status middleware and a suitable writer/content-negotiation path.
4. **Why might `TryWriteAsync` return false?** No registered writer supports the current request/context, including its `Accept` media types.
5. **How does Minimal API `ThrowOnBadRequest` affect middleware?** Throwing errors enter exception handling; direct status writes may bypass exception handlers.
6. **What changed for `BadHttpRequestException` in .NET 11?** `UseExceptionHandler` preserves its status code by default; custom handlers must preserve it too.
7. **Should domain errors all become exceptions?** No. Expected outcomes can be explicit HTTP results; exception middleware handles unexpected failures.

## Sources

- [Handle errors in ASP.NET Core APIs](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
- [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

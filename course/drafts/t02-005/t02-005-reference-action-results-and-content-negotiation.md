# ASP.NET Core MVC controllers actions filters conventions and results — Reference: Action result contracts, status codes, serialization, redirects, and files

Sources: Microsoft's [action return types](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-11.0), [Web API guidance](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-11.0), [ControllerBase API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.controllerbase?view=aspnetcore-11.0), and [ActionResult<T> API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.mvc.actionresult-1?view=aspnetcore-11.0).

## Contract choices

Use a concrete typed return when every successful path returns the same representation and error handling is expressed elsewhere. Use `IActionResult` when the action legitimately chooses among result kinds. Use `ActionResult<TValue>` when the API has a primary typed body plus alternate HTTP outcomes. `ActionResult<TValue>.Value` carries the typed value; `.Result` carries an explicit result. The implicit conversion supports returning a `TValue` directly, but conversion is not available for every arbitrary interface or shape. Keep the declared contract aligned with actual statuses and payloads. `IResult` belongs primarily to Minimal APIs; it is not interchangeable with MVC's `IActionResult` pipeline.

## Result execution and formatting

An action result is executed by MVC after action/filter invocation. `IActionResultExecutor<TActionResult>` and MVC's registered executors implement type-specific response writing. `ObjectResult` holds a value plus optional status, declared type, and content types; it participates in output formatter selection. `IStatusCodeActionResult` exposes status metadata and `IConvertToActionResult` adapts compatible values into action results. `OkObjectResult`, `CreatedResult`, and other helpers build concrete results rather than writing the body immediately.

Content negotiation uses configured output formatters (`IOutputFormatter`) and request/endpoint/result metadata. The built-in `SystemTextJsonOutputFormatter` is the normal JSON formatter; XML requires appropriate registration. `Accept` headers, declared/content types, formatter capability, and `MvcOptions` (including `RespectBrowserAcceptHeader` and `ReturnHttpNotAcceptable`) affect behavior. If no formatter can write a selected representation, behavior depends on result and options; test an actual HTTP response. `JsonResult` is an explicit JSON-oriented result, unlike a general `ObjectResult` that participates in negotiation. `ContentResult` writes text with a content type. API description annotations such as `[ProducesResponseType]` describe possible responses but do not prove runtime output.

## Choose status and payload semantics

Use `Ok` for a successful representation, `NoContent` for success without a body, `Created` or `CreatedAtAction/Route` for creation (including a useful location when appropriate), `Accepted` variants for work accepted but not completed, `BadRequest` for malformed/invalid request input, `NotFound` for absent resources, `Conflict` for state conflicts, and `UnprocessableEntity` only when it matches the API's chosen semantics. A status-only result and an object result differ in whether a body is sent. Do not blindly return framework exception details. Problem Details and Validation Problem Details provide structured error payloads when configured/used; make error shape stable and avoid leaking internal data.

Redirect results select a destination. Prefer local redirects for untrusted/user-influenced paths to avoid open redirects. Permanent redirects are cacheable protocol decisions and should not be used casually for temporary navigation. `ViewResult`, `PartialViewResult`, and `ViewComponentResult` belong to view-producing MVC applications; they are not normally API response choices. `ChallengeResult`, `ForbidResult`, `SignInResult`, and `SignOutResult` delegate to authentication schemes and should be chosen with the configured scheme/policy behavior in mind.

## File results

`FileContentResult` writes byte content, `FileStreamResult` streams from a readable stream, and physical/virtual file results locate files through their respective providers. Select a stream/file result based on ownership, size, and storage; dispose resources correctly and avoid loading large files fully into memory. `FileResult.FileDownloadName` controls the suggested download name. Range processing, entity tags, and last-modified metadata support conditional/range requests when enabled and correctly supplied. Never construct an arbitrary physical path from untrusted input. Verify content type, cache policy, range behavior, and authorization for protected downloads.

## Tests and API descriptions

Unit tests that inspect `IActionResult` can verify branch selection, but they do not execute formatters or prove HTTP headers/body. Integration tests should exercise routing, negotiation, status, headers, and serialized payload. `ProducesResponseTypeAttribute.Type` and `.StatusCode` contribute response metadata for API exploration/OpenAPI, but keep them synchronized with actual paths. Test error contracts as carefully as success contracts.

## Complete declared API and concept inventory

The following index is the manifest's complete declared inventory for this reference. It is a coverage checklist; contracts and response behavior are explained above.

### Exact terms covered

- `IActionResult`
- `ActionResult`
- `ActionResult<TValue>`
- `ActionResult<TValue>.Result`
- `ActionResult<TValue>.Value`
- `ActionResult<TValue> implicit conversion`
- `IResult versus IActionResult`
- `IStatusCodeActionResult`
- `IConvertToActionResult`
- `ObjectResult`
- `ObjectResult.Value`
- `ObjectResult.StatusCode`
- `ObjectResult.DeclaredType`
- `ObjectResult.ContentTypes`
- `OkResult`
- `OkObjectResult`
- `CreatedResult`
- `CreatedAtActionResult`
- `CreatedAtRouteResult`
- `NoContentResult`
- `BadRequestResult`
- `BadRequestObjectResult`
- `NotFoundResult`
- `NotFoundObjectResult`
- `ConflictResult`
- `ConflictObjectResult`
- `AcceptedResult`
- `AcceptedAtActionResult`
- `AcceptedAtRouteResult`
- `UnprocessableEntityResult`
- `UnprocessableEntityObjectResult`
- `StatusCodeResult`
- `StatusCode(int) action result helper`
- `JsonResult`
- `ContentResult`
- `EmptyResult`
- `RedirectResult`
- `LocalRedirectResult`
- `RedirectToActionResult`
- `RedirectToRouteResult`
- `RedirectPermanentResult`
- `RedirectToActionPermanentResult`
- `RedirectToRoutePermanentResult`
- `FileResult`
- `FileContentResult`
- `FileStreamResult`
- `PhysicalFileResult`
- `VirtualFileResult`
- `FileResult.EnableRangeProcessing`
- `FileResult.EntityTag`
- `FileResult.LastModified`
- `FileResult.FileDownloadName`
- `FileStreamResult.FileStream`
- `ViewResult`
- `PartialViewResult`
- `ViewComponentResult`
- `ChallengeResult`
- `ForbidResult`
- `SignInResult`
- `SignOutResult`
- `Action result execution`
- `IActionResultExecutor<TActionResult>`
- `Content negotiation`
- `Output formatter selection`
- `IOutputFormatter`
- `SystemTextJsonOutputFormatter`
- `XmlSerializerOutputFormatter`
- `Return type convention`
- `ActionResult<T> API description`
- `ProducesResponseTypeAttribute.Type`
- `ProducesResponseTypeAttribute.StatusCode`
- `IActionResult test assertion`
- `ProblemDetails result helper`
- `ValidationProblemDetails result helper`
## Scope and version
Targets ASP.NET Core 11 MVC action results and API return conventions. Minimal API `IResult` execution is separate.

## How this group fits the mental model
The action returns a typed value or response description; MVC result execution selects an executor/formatter and writes the response.

## Supplied names explained
The preceding sections explain the complete declared set by contract, status, formatter, content, redirect, file, view, authentication, metadata, and test roles.

## Cross-item comparison
`ObjectResult` negotiates through formatters; `JsonResult` is JSON-oriented; `ContentResult` writes text. `ActionResult<T>` combines a typed value and alternate MVC result. `FileStreamResult` streams, while `FileContentResult` holds bytes.

## Examples
Return `CreatedAtAction` after creation when the location points to a stable retrieval endpoint; return `AcceptedAtAction` when processing continues asynchronously and a status endpoint exists.

## Common mistakes
Avoid open redirects, unbounded file buffering, undocumented response branches, assuming metadata attributes serialize a value, or confusing controller unit tests with HTTP formatter tests.

## Knowledge checks with answers
1. **What chooses JSON/XML for an ObjectResult?** Applicable registered output formatters and content negotiation metadata.
2. **What does `NoContentResult` promise?** A successful response with no response body.
3. **How do you prove a 406 contract?** Send a real unsupported Accept header and assert status/headers/body.

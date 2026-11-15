# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Exercises and worked solutions

## Goals

Choose contract-generation/versioning approaches, define safe error responses, reason about pagination drift, and design retry/concurrency behavior. You will also account for current OpenAPI 3.2 and standardized HTTP QUERY changes. [ASP.NET Core OpenAPI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi) [Asp.Versioning](https://dotnet.github.io/aspnet-api-versioning/) [Error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors) [HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html)

## Worked example

A reporting API serves millions of records. Clients filter by a structured search expression too large for a URL, retrieve results across many pages while new records arrive, and occasionally retry a report-submission POST after a connection timeout. The team must preserve v1 for existing clients while rolling out a changed response shape as v2.

**Design:** Publish separate versioned OpenAPI descriptions using the `Asp.Versioning` package family and API Explorer grouping. Keep the v1 contract stable while v2 adds the changed shape. Use RFC 10008 `QUERY` with a documented request media type for the large safe/idempotent search payload only where the client, browser, CORS preflight, gateway, and proxies support it; otherwise retain a POST search contract with explicit safe semantics or simplify the query. For long traversal, use a stable keyset cursor `(createdAt, id)`, protect the cursor, and reapply authorization and filters. For report submission, scope a durable idempotency key to the client/account and operation, fingerprint the request, reserve atomically, store the result, and replay same-key/same-payload results. Avoid promising exactly once across the report store and external notification provider; coordinate using provider idempotency/outbox. [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html) [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)

## Exercises

### Exercise 1: OpenAPI version mismatch

After upgrading from ASP.NET Core 10 to 11, downstream client generation fails parsing the document. Determine the likely version change, name two options, and explain why transformer code may also need edits.

### Exercise 2: distinguish framework and community API

A new Minimal API uses `AddApiVersioning().AddMvc()` copied from an old controller tutorial. Identify the package boundary and correct the integration choice. What additional package/service is needed for per-version API Explorer descriptions?

### Exercise 3: HTTP QUERY support

A search filter is too large for a URI. A developer says, “QUERY is standardized now, so every proxy and browser will accept it.” Correct the statement and propose a rollout checklist. When is GET still preferable?

### Exercise 4: Problem Details writer mismatch

An exception handler calls `TryWriteAsync`, which returns false for a client request with `Accept: text/html`. The response has a 500 status and no body. Explain why and how to define safe fallback behavior without returning stack traces.

### Exercise 5: version negotiation and compatibility

An API has `/orders` v1 and `/orders` v2 controllers. Requests without a version route to v1 accidentally. Explain version metadata, missing-version behavior, and how to report/deprecate versions. State whether adding a response property is always compatible.

### Exercise 6: offset pagination drift

A client reads page 1 with 50 items, then new rows are inserted before it requests `offset=50`. Explain the possible result and design a cursor ordering for events sorted by `createdAt`.

### Exercise 7: idempotency under concurrency and crash

Two identical payment POST requests with the same key arrive concurrently. The payment provider charges successfully, but the app crashes before saving its local result. Describe the required record/locking behavior and a cross-system recovery strategy. Why is exactly-once an unsafe claim?

### Exercise 8: preconditions, conflict, and throttling

Choose a status and client action for each: an `If-Match` condition is stale; a required condition is missing; the requested domain transition is invalid; a rate limit is exceeded and retry is allowed after 30 seconds.

### Exercise 9: deprecation and sunset

An API team announces that v1 is no longer recommended but remains operational for six months, after which it expects to remove it. Explain how `Deprecation` and `Sunset` should differ and what additional documentation/telemetry is required.

## Progressive hints

1. Find the framework's changed default, then decide whether to pin the document format; model APIs changed with Microsoft.OpenApi 3.x.
2. The library packages separate HTTP/Minimal API and MVC integrations; explorer is distinct from the base runtime integration.
3. A standard does not ensure end-to-end deployment support; QUERY's content type and CORS/proxy handling matter.
4. A writer is selected through content negotiation; `TryWriteAsync` signals that fallback is needed.
5. Request version selection is not just route text; declare supported versions and decide behavior for omitted/unsupported requests.
6. Offset counts from the beginning; use a stable unique ordering boundary rather than a moving count.
7. Reserve the key atomically before the external side effect and use the provider's own deduplication/reconciliation where possible.
8. Separate failed conditional request, missing precondition, business conflict, and throttle response.
9. Deprecation marks lifecycle status; Sunset communicates an expected unavailability date.

## Complete solutions

### Solution 1

ASP.NET Core 10 generated OpenAPI 3.1 by default; ASP.NET Core 11 defaults to 3.2. Explicitly set `OpenApiOptions.OpenApiVersion` to 3.1 or configure build-time `OpenApiGenerateDocumentsOptions` with `--openapi-version OpenApi3_1` while consumers catch up. ASP.NET Core 11 also depends on Microsoft.OpenApi 3.x, so transformer code written against 2.x can require model/namespace/collection changes. Test the emitted artifact with the exact code generator used by clients. [OpenAPI 3.2 change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/openapi-version-default-3-2) [Microsoft.OpenApi 3.x change](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/microsoft-openapi-3x)

### Solution 2

`AddApiVersioning` is from the separate `Asp.Versioning` library, not ASP.NET Core. For Minimal APIs, use `Asp.Versioning.Http`; `.AddMvc()` adds MVC integration and is unnecessary if the app has no controllers. Add `Asp.Versioning.Mvc.ApiExplorer` and configure the versioned explorer/grouping when generating per-version descriptions. The package's versioned OpenAPI integration and exact extension APIs should match the pinned package set. [Configuration](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/config/overview.html)

### Solution 3

RFC 10008 standardizes QUERY as safe/idempotent with request content, but intermediaries, CORS configuration, browser APIs, client libraries, caches, and service frameworks may not support it. Require a `Content-Type`, choose a documented query representation, test CORS preflight/gateway/proxy/cache behavior and OpenAPI 3.2 consumers, and offer a compatible fallback. `Accept-Query` may advertise supported request formats. GET remains preferable when the query fits a URI and its parameters are appropriate for URL/cache/link semantics; don't put sensitive data in URIs just because GET is familiar. [RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)

### Solution 4

`IProblemDetailsService.TryWriteAsync` can return false when no registered writer supports the request's negotiated media type. Define behavior for `Accept: text/html`: either a deliberately registered writer, an empty status response, or a safe generic fallback with the correct status/content type. Do not write a second body after a writer succeeds. Log the exception with a correlation/trace ID server-side and return a safe Problem Details or generic error representation only when negotiation supports it. [Error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)

### Solution 5

Declare versions on the API/controller/actions and configure a request reader. If explicit selection is required, do not assume missing version will select v1; configure `AssumeDefaultVersionWhenUnspecified` only as a deliberate compatibility policy. Define malformed/unsupported response behavior, enable `ReportApiVersions` if useful, and use versioned API Explorer to publish separate documents. A response property is often additive but can break strict decoders, schema validators, signatures, or clients with closed-world assumptions; test actual consumers.

### Solution 6

If rows are inserted before offset 50, the next request may repeat rows already seen or skip rows because the numeric boundary shifted. Use a total order, for example descending `(createdAt, eventId)`, with a cursor holding the last returned pair. The next page seeks strictly after that pair in the same sort order. Protect the cursor, bind it to filters/tenant/order, and document that concurrent changes may still affect the observed dataset unless a snapshot is provided.

### Solution 7

Use a unique durable key scoped to account + payment operation. Atomically reserve it with a request fingerprint so concurrent requests cannot both charge. Store in-progress/completed state and replay the same completed response for matching payloads; reject a mismatched payload. Because a provider may charge before the local result commits, use the provider's idempotency facility with the same stable logical key, transactional outbox/workflow, and reconciliation after crashes. Exactly-once across independent systems cannot be assumed; define the actual at-most-once/deduplication boundary and recovery states.

### Solution 8

- Stale `If-Match`: return `412 Precondition Failed`; client fetches current state and resolves/retries with a new validator.
- Required precondition missing: `428 Precondition Required`; explain how to obtain/send the validator.
- Invalid domain transition: `409 Conflict` (or another precisely documented domain status); return safe Problem Details.
- Rate limit exceeded: `429 Too Many Requests` with `Retry-After: 30`; client waits and retries only if the operation's retry contract is safe.

### Solution 9

Emit a `Deprecation` response header to signal lifecycle status while v1 remains available, and link to migration instructions/policy. Emit `Sunset` only with a planned date when the resource is expected to become unresponsive; RFC 9745 requires it not to predate the deprecation date. Publish replacement examples, measure version usage, notify clients, and define a support/retirement window. Neither header alone changes the response contract or guarantees the service will shut off exactly on the date. [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)

## Tests and edge cases

- Generate OpenAPI under .NET 11 and verify document version plus QUERY/binary/SSE feature representation expected by consumers.
- Test build-time document generation with a clean environment and no production credentials/services.
- Send missing, malformed, supported, deprecated, and unsupported API versions through every configured reader.
- Test `Accept` values that match and do not match Problem Details writers; assert HTTP/body status consistency.
- Use equal timestamps and insert/delete records between cursor requests; assert unique ordering and documented consistency behavior.
- Send same idempotency key/payload concurrently; assert one business effect and repeatable outcome.
- Reuse the same key with different content; assert a deterministic rejection.
- Simulate a crash after provider success but before local completion; reconcile without double charging.
- Test stale and missing `If-Match`, domain conflict, and 429 with `Retry-After` as distinct outcomes.
- Assert deprecation/sunset headers reflect published dates and provide reachable migration guidance.

## Reflection questions

1. How does each released OpenAPI artifact get tested against the runtime and a real client generator?
2. What exactly does a missing version do in production, and how will clients learn that behavior?
3. Does the cursor preserve authorization and filter boundaries without claiming a snapshot?
4. Which side effect can escape the idempotency transaction, and how is it reconciled?
5. What support commitment and telemetry justify the API's deprecation and sunset dates?

## Sources

- [ASP.NET Core OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [ASP.NET Core API versioning](https://dotnet.github.io/aspnet-api-versioning/)
- [ASP.NET Core error handling](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [HTTP QUERY, RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)
- [Deprecation, RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html)
- [Sunset, RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)

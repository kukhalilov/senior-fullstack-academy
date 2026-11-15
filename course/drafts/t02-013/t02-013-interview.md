# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Interview questions and reasoning

## Core questions

### 1. What does an OpenAPI document guarantee?

It describes an API contract in a machine-readable form. It does not make runtime behavior conform, enforce authorization, generate a UI by itself, or prove backward compatibility. Generated metadata should be compared with integration behavior and consumer expectations.

### 2. What changed in ASP.NET Core 11 OpenAPI?

Generated documents default to OpenAPI 3.2 instead of .NET 10's 3.1, and the `Microsoft.OpenApi` object model moves to 3.x. Pin the document version for older tools and update/compile custom transformers. The 3.2 document can represent QUERY operations, binary responses, and SSE item schemas using newer schema vocabulary.

### 3. Is API versioning built into ASP.NET Core?

No. `Asp.Versioning` is a separate package family. Minimal APIs use `Asp.Versioning.Http`; controller APIs use MVC integration; API Explorer support is added for versioned descriptions/documents. Keep third-party package versions and APIs labeled distinctly from framework features.

### 4. How do you choose a version reader?

Choose URL segment, query, header, or media type based on discoverability, routing, cache behavior, client support, and deployment constraints. Document the location and behavior for missing/conflicting versions. Combining readers can ease migration but increases ambiguity and contract complexity.

### 5. What is Problem Details for?

It gives HTTP errors a common machine-readable envelope. It does not choose the correct domain outcome or make every failure an exception. Keep transport status and `ProblemDetails.Status` aligned; use stable type identifiers and safe detail; don't expose internal exception data.

### 6. Why might `IProblemDetailsService.TryWriteAsync` fail to write?

No registered writer may support the request/content negotiation, such as an unsupported `Accept` media type. The caller/middleware needs an explicit safe fallback and must not write a duplicate body after success.

### 7. How does cursor pagination differ from offset pagination?

Offset asks the store to skip a count and may drift under inserts/deletes or cost more at deep positions. A cursor/keyset continues from an ordered key and is often more stable for large data, but requires a total ordering, integrity protection, expiry policy, and clear snapshot semantics.

### 8. What does HTTP idempotency mean?

Repeating a request has the same intended effect as applying it once. It does not require identical response bytes or exactly one execution of logging/observability side effects. GET/HEAD are safe and idempotent; PUT/DELETE are idempotent; POST is not inherently idempotent; PATCH depends on semantics.

### 9. What does an idempotency key add?

It lets an application deduplicate retries of an operation when it maintains a durable key record, request fingerprint, atomic reservation, concurrency behavior, retention window, and replay policy. A header by itself does not perform deduplication and does not make a distributed workflow exactly once.

### 10. How do `If-Match`, 412, 428, and 409 relate?

`If-Match` makes a request conditional on a current ETag. A false condition commonly returns 412. A server requiring a missing condition may use 428. A domain-state conflict is commonly 409. They represent different failure classes and should give clients different recovery instructions.

### 11. What is the difference between `Deprecation` and `Sunset`?

`Deprecation` reports lifecycle status without itself changing resource behavior. `Sunset` announces an expected date when a resource may become unresponsive. Provide a migration link and usage-driven retirement plan; neither header alone guarantees a date or migration.

### 12. What is HTTP QUERY and when would you use it?

RFC 10008 standardized QUERY as a safe and idempotent HTTP method carrying query content, useful when a search payload is too large/structured for a URI. It needs a Content-Type; `Accept-Query` can advertise formats. Use it only when the entire browser/CORS/proxy/gateway/cache/client path supports it. OpenAPI 3.2 has a native operation field; 3.0/3.1 use the ASP.NET Core generator's extension representation.

## Concise interview answers

- **Does `MapOpenApi` require auth by default?** No. Restrict the environment or add authorization deliberately.
- **Is build-time OpenAPI generation static analysis?** No. It invokes the application entrypoint with a mock server, so startup executes.
- **When do transformers run?** Schemas during schema registration, operations during operation addition, document transformers last; registration order applies within each stage.
- **Can an additive response field break clients?** Yes. Strict decoders, schema validators, signatures, or assumptions can make it breaking.
- **Does API version selection grant access?** No. Authentication/authorization are separate.
- **Does `AddProblemDetails` ensure a body for every status?** No. Middleware, existing response content, writer support, and `Accept` matter.
- **Does cursor pagination guarantee a snapshot?** No. It defines continuation; snapshot isolation is a separate consistency choice.
- **Is POST always unsafe?** HTTP defines POST semantics by the target resource; it is not inherently safe or idempotent. A specific POST contract can be designed as retry-safe.
- **Can a server retry a timed-out payment POST without an idempotency design?** It cannot know whether the first attempt took effect; blind retry can double-charge.
- **Does a 429 mean retry immediately?** No. Use `Retry-After` and the operation's retry-safety contract.

## Deep follow-up answers

### How would you publish and verify an API contract?

Generate a document from declared endpoint/controller metadata, restrict access if it exposes sensitive internal API shapes, version the artifact, and compare it against endpoint integration tests and representative consumer tooling. Run build-time generation in a deterministic environment because application startup executes. Validate response content types, status codes, validation/errors, auth metadata, version grouping, and serialization against the generated schemas. Use consumer-driven contract tests for consumer-specific assumptions that OpenAPI does not express.

### How would you version a service without creating a version explosion?

First classify whether the change is genuinely incompatible. Additive output can still break strict clients, so use compatibility tests/telemetry. Keep compatible behavior in the current version where possible; create a new contract for incompatible semantics, publish per-version descriptions, report supported/deprecated versions, provide migration guidance, monitor version use, and retire only under the announced policy. A version-neutral endpoint is appropriate only if its contract truly does not vary.

### How do you guarantee pagination does not duplicate/skip due to ties?

Choose a total order, such as `(createdAt, uniqueId)`, with the same direction and filters on every page. A cursor encodes the last key and query contract; protect it against tampering, bind it to tenant/filter/order, cap page size, and handle expiration. Keyset seeking reduces offset drift, but a live dataset can still change; promise snapshot consistency only if implemented.

### How do you recover idempotent operations after a crash?

Atomically insert a key record with a canonical request fingerprint and in-progress state before side effects. Concurrent duplicates observe that record and follow a documented wait/poll/conflict behavior. Persist the result for replay. For external side effects, pass a stable key to the provider and/or use an outbox/workflow and reconciliation. Consider the crash window after the provider commits but before local completion. State the deduplication boundary and recovery path instead of claiming distributed exactly-once execution.

### When would you use QUERY rather than GET or POST?

GET is still simplest when parameters fit a URI and URL/cache/link semantics suit the query. QUERY carries a body while explicitly being safe/idempotent, so it can represent complex searches without putting all inputs in the URI. POST remains a compatibility option but does not inherently communicate safe query semantics. QUERY requires a media type, ecosystem support, correct cache keys, and CORS preflight; it is not automatically usable just because the RFC exists.

### How do you standardize error behavior without hiding useful domain information?

Map expected failures to deliberate statuses and stable problem types. Validation returns field-keyed errors; missing resources, stale conditions, state conflicts, throttling, and server failures differ. Use a shared writer/middleware for common shape, add safe trace/correlation IDs, preserve status codes, and log diagnostic detail server-side. Test content negotiation and unsupported writers. Domain-specific responses should still tell clients what action is possible.

## Scenario questions

1. A client generator fails immediately after a .NET 11 upgrade; how do you isolate the document-version versus OpenApi-model issue?
2. A versioned API returns v1 when a client omitted the version; how do you determine whether that is intentional and change it safely?
3. A cursor request returns duplicates after a deployment changed sort order; what must be versioned or encoded in the cursor?
4. A server returns a 500 body with `ProblemDetails.Status` set to 400; what client and monitoring problems does that create?
5. A payment POST times out after an external charge but before local persistence; how does the key record and reconciliation process resolve it?
6. A gateway rejects QUERY although the application maps it; what does this reveal about API rollout and OpenAPI contract claims?
7. A deprecated API returns `Sunset` but no migration link; what is missing from the lifecycle contract?

## Tradeoffs and alternatives

| Decision | Favor this when | Costs/risks |
|---|---|---|
| OpenAPI 3.2 | Toolchain supports the latest representation | Older validators/code generators may fail |
| OpenAPI 3.1 pin | Consumers require compatibility | New 3.2 features are represented only through extensions or unavailable |
| Query/segment/header/media versioning | One strategy fits clients/proxies/cache/docs | Each introduces visibility, route, or negotiation tradeoffs |
| Offset pagination | Small, mostly stable collections and numbered navigation | Deep scan and concurrent-write drift |
| Cursor/keyset pagination | Large ordered datasets and forward traversal | Cursor integrity, expiration and consistency complexity |
| Idempotency-key record | High-value retriable writes | Durable state, concurrency, retention, replay and external-effect coordination |
| Consumer-driven tests | Different clients rely on specific interactions | Test maintenance and provider/consumer coordination |

## Common weak answers

- “The generated OpenAPI document is the source of truth.” It is a generated contract that may omit metadata or diverge from runtime behavior.
- “API versioning is built in.” It is a separate package family.
- “OpenAPI 3.2 is always better.” Compatibility with downstream tools can justify pinning 3.1.
- “Problem Details means every error should be 400.” Status must reflect the actual failure.
- “Cursor tokens are safe because they're opaque.” They may be altered/replayed and still require authorization and integrity checks.
- “Idempotency keys guarantee exactly once.” They only deduplicate within a deliberately designed boundary.
- “If the request timed out, it failed.” The server/provider may have committed before the connection broke.
- “Sunset and deprecation mean the same thing.” One marks lifecycle status; the other forecasts unavailability.
- “QUERY is standard, so the browser supports it.” End-to-end support must be tested across clients, CORS, proxies, and caches.

## Self-check rubric

Score each area 0–2: **0** incorrect or missing, **1** partly correct, **2** precise with consequence/tradeoff.

1. Separates document generation, API UI, runtime enforcement, and contract verification.
2. Identifies .NET 11 OpenAPI 3.2 default and Microsoft.OpenApi 3.x changes.
3. Distinguishes built-in framework APIs from `Asp.Versioning` packages and configures readers/metadata/explorer deliberately.
4. Explains Problem Details writer negotiation, correct statuses, and safe production errors.
5. Selects pagination with stable ordering and accurately states consistency limits.
6. Designs durable key reservation, payload fingerprint, replay, concurrency, and crash recovery without exactly-once claims.
7. Separates HTTP method semantics, ETag preconditions, conflict, throttling, and retry safety.
8. Correctly explains HTTP QUERY and its ecosystem support boundary.
9. Distinguishes Deprecation from Sunset and includes client migration policy.

**Interpretation:** 15–18 is interview-ready; 10–14 needs targeted review; below 10 revisit references and practice the failure scenarios without notes.

## Sources

- [ASP.NET Core OpenAPI generation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi)
- [Customize OpenAPI](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/customize-openapi)
- [Asp.Versioning](https://dotnet.github.io/aspnet-api-versioning/)
- [Problem Details and API errors](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors)
- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [HTTP QUERY, RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html)
- [Deprecation, RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html)
- [Sunset, RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)

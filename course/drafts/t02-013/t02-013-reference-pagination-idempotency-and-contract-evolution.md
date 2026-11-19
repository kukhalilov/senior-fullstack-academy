# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Reference: Pagination contracts, stable cursors, HTTP idempotency, safe retries, and compatibility

## Scope and version

Pagination and idempotency-key processing are application contracts and implementation patterns; ASP.NET Core does not impose one universal pagination API or idempotency middleware. HTTP method properties such as safety and idempotency are defined by HTTP semantics. `Idempotency-Key` is a widely used request-header convention, so specify its behavior rather than implying that the header alone provides deduplication. `Deprecation` and `Sunset` are standardized response headers with distinct meanings. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) [RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) [RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html) [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)

## How this group fits the mental model

A collection endpoint promises which items appear and where traversal resumes. The ordering must be stable and the requested page bounded. A retryable write needs a rule for recognizing duplicates and recovering the result after partial failure. Conditional requests protect a client from overwriting a representation that changed since it was read. API compatibility/deprecation tells clients how a contract evolves; it does not alter request semantics until the service actually changes behavior.

## Supplied names explained

### Pagination

| Supplied name | Meaning and use |
|---|---|
| `Offset pagination` | Selects a window by skipping a count of ordered rows. Simple for numbered pages, but deep offsets cost more and intervening writes can shift boundaries. |
| `Page number and page size` | Client-facing page-index/count convention. Validate positive values and cap page size to bound work and response size. |
| `Limit and offset` | Direct count/skip parameters. Reject negative/overflowing values and apply deterministic ordering before offset. |
| `Page-size maximum` | Server-enforced cap independent of a client's requested size. Prevents unbounded memory, query, and serialization work. |
| `Stable ordering requirement` | Pagination requires a deterministic total order, commonly including a unique tie-breaker. Without it, rows can move between pages even without writes. |
| `Non-deterministic ordering pagination failure` | Missing/partial ordering can cause duplicate or omitted rows when ties resolve differently between calls. Add a stable unique key. |
| `Offset drift under concurrent writes` | Insertions/deletions before the next offset shift results, potentially duplicating or skipping items during traversal. |
| `Deep offset query cost` | Large offsets may force a database to scan/read and discard many rows. Measure and use keyset seeking for deep traversal where appropriate. |
| `Keyset pagination` | Uses the last observed ordered key as a seek boundary rather than counting/skipping prior rows. Requires a matching index/order and careful filter behavior. |
| `Cursor pagination` | Client-facing continuation token that represents a server-defined position (often keyset values plus contract state). A cursor can be opaque but must be validated. |
| `Opaque continuation token` | Encoded token whose internal fields are not part of the public contract. Opacity alone does not provide secrecy, integrity, or authorization. |
| `Composite cursor key` | Cursor containing multiple ordered values, such as `(createdAt, id)`, to break ties and uniquely locate the next position. |
| `Cursor integrity protection` | Signature/MAC or server-side state prevents a client from altering cursor values to skip filters, access another tenant, or change the sort boundary. Reapply authorization regardless. |
| `Next-page link` | URI returned to continue traversal. Preserve applicable filters/order and avoid embedding sensitive or unbounded data in the URL. |
| `Link response header relation next` | RFC 8288 `Link` header relation (`rel="next"`) for advertising a next-page URI. Parse relation parameters rather than assuming a single fixed header shape. |
| `RFC 8288 Web Linking` | Standard defining the HTTP `Link` field and relation types used to connect a response to related resources. |
| `Pagination metadata envelope` | Response-body contract that may include items, continuation, and optional totals. Keep shape/version stable and don't make clients depend on an expensive count unless needed. |
| `Total-count cost tradeoff` | Exact total count can require extra query work or a consistent snapshot. Offer only when the product/client needs it; clarify whether it is exact or estimated. |
| `Filtering before pagination` | Apply the authorized filter predicate before selecting page boundaries. Filtering an already paged subset produces incorrect results and can leak data. |
| `Sorting before pagination` | Establish the documented deterministic order before calculating offset or cursor. Cursor encoding must match the sort fields and directions. |
| `Seek method query` | Database query predicate that locates rows after the cursor key (for example lexicographic `createdAt/id` comparison) instead of using a deep offset. |
| `Continuation token expiration` | Limits how long a cursor can be replayed as query/schema/security policy evolves. Return a documented client error and restart guidance when expired. |
| `Snapshot consistency and pagination` | Defines whether pages reflect a fixed snapshot or changing data. Keyset pagination reduces offset drift but does not by itself provide snapshot isolation. |

### HTTP idempotency, retry, and concurrency

| Supplied name | Meaning and use |
|---|---|
| `Idempotent HTTP method semantics` | Repeating a request has the same intended effect as applying it once. Incidental effects such as access logging can still occur per request. |
| `Safe method semantics` | Method semantics are read-only from the client's requested perspective; servers can still log or observe requests. Safe does not mean authorization-free or risk-free. |
| `GET is safe and idempotent` | GET requests current selected representation and is safe/idempotent by HTTP semantics. Do not implement state-changing actions behind GET. |
| `HEAD is safe and idempotent` | Semantically like GET without response content; intended effect is safe/idempotent. |
| `PUT is idempotent` | Replacing/creating the target resource with the same requested representation has the same intended effect when repeated, though response metadata may differ. |
| `DELETE is idempotent` | Repeated deletion has the same intended effect on the target's state, even if later responses differ (for example, 204 then 404). |
| `POST is not inherently idempotent` | POST processing is resource-defined and can create repeated effects. Retry only when the API has a documented idempotent semantic or deduplication mechanism. |
| `PATCH idempotency depends on patch operation` | Some patches (set field to value) can be idempotent; others (increment/append) are not. Analyze the operation, not just the method name. |
| `Idempotency-Key request header convention` | Client-provided identifier for one logical operation. The header alone does nothing: server storage and concurrency rules implement deduplication. |
| `Idempotency-Key current IETF status` | As of 2026-11-20, draft `draft-ietf-httpapi-idempotency-key-header-08` is an active HTTPAPI Internet-Draft, not a published RFC. It specifies a Structured Fields string value (quoted on the wire) and continues to evolve; label the header as an API convention and pin a draft version only if the API intentionally adopts its details. |
| `Idempotency key scope` | Defines where a key is unique, such as authenticated account + operation/route. Avoid cross-tenant collisions or allowing a key to expose another principal's result. |
| `Request fingerprint` | Canonical digest of relevant request semantics (method, target, body and possibly selected headers) stored with the key to detect accidental/malicious payload changes. |
| `Durable idempotency record` | Persistent record of key, fingerprint, processing state, and completed outcome. Retention and recovery must outlive expected retries and survive process restarts. |
| `Concurrent duplicate request locking` | Atomic unique-key reservation/transaction prevents two requests with the same key from both performing the side effect. Define whether duplicates wait, receive 202/409, or poll. |
| `Replay original status and response` | Completed duplicate can receive the stored outcome, often preserving status/body and selected headers. Redact secrets and avoid replaying hop-by-hop or stale headers. |
| `Idempotency key expiration` | Retention boundary after which reuse might perform a new operation. Document it and choose a duration based on client retry windows and business risk. |
| `Same key with different request payload` | Fingerprint mismatch must be rejected or handled by a documented policy; never silently treat changed input as the original completed operation. |
| `At-most-once effect versus exactly-once claim` | Deduplication can bound repeated effects within a system boundary. Distributed failures across databases/providers mean universal exactly-once execution cannot be assumed. |
| `Retry safety contract` | States which failures may be retried, whether the same key is required, and how backoff/Retry-After and response replay work. |
| `Idempotent consumer pattern` | Consumer records processed message IDs and makes handling duplicate delivery safe, usually with durable state/transaction coordination. It does not prevent broker redelivery. |
| `Conditional request If-Match` | Client sends an entity tag validator; server performs the operation only if the current representation matches, preventing stale overwrite. |
| `ETag optimistic concurrency` | Validator representing a selected resource state; clients send it in `If-Match` for conditional mutation. Weak validators are not suitable for strong lost-update checks. |
| `428 Precondition Required` | RFC 6585 status for a server requiring a conditional request; explain which precondition (typically `If-Match`) lets the client retry. |
| `409 Conflict` | Indicates a conflict with current resource/domain state. It is not interchangeable with a failed HTTP conditional validator (commonly 412). |
| `429 Too Many Requests` | Indicates rate limiting; response may include retry guidance. Clients should honor `Retry-After` where supplied. |
| `Retry-After header` | Indicates how long the user agent should wait before a follow-up request, as supported by applicable status semantics. It is a hint/policy contract, not proof a retry is safe. |

### Compatibility and deprecation

| Supplied name | Meaning and use |
|---|---|
| `API backward compatibility` | Existing clients continue to work as promised after a change. Test real consumer assumptions; source/schema additivity alone is not enough. |
| `Additive response property compatibility` | Adding a response field is often compatible for tolerant clients, but strict schema validators/deserializers or signature-based consumers may fail. |
| `Breaking request contract change` | Changing/removing accepted fields, validation, meaning, status, or required inputs can break clients even if the route stays the same. Version or provide a migration path. |
| `API deprecation policy` | Published lifecycle for marking a feature/version deprecated, communicating replacements and dates, measuring usage, and removing only after the announced process. |
| `Sunset response header` | RFC 8594 field signals when a resource is expected to become unresponsive. It represents planned end-of-life, not simply that a replacement is preferred. |
| `Deprecation response header` | RFC 9745 field signals that a resource has been or will be deprecated. Deprecation itself does not change resource behavior; link migration documentation and optionally announce a later Sunset. |
| `Consumer-driven contract testing` | Tests authored from consumer expectations verify provider behavior for interactions important to clients. It complements OpenAPI validation and provider integration tests, not replaces them. |

## Cross-item comparison

| Concern | Offset | Keyset/cursor |
|---|---|---|
| Page navigation | Natural numbered page | Continue from last ordered key |
| Large collection cost | Can grow with deep offset | Usually stable when indexed to seek predicate |
| Concurrent inserts/deletes | Can shift page boundaries | More stable for forward traversal, but not a snapshot |
| Contract complexity | Low | Cursor encoding, integrity, expiry and consistency choices |

| Guarantee | Mechanism | Limit |
|---|---|---|
| Repeat request has same intended effect | HTTP idempotent method semantics | Does not promise identical response or one execution of incidental side effects |
| Avoid duplicate operation for retry | Durable idempotency key record | Needs atomicity, scope, retention, fingerprint and external-effect coordination |
| Avoid stale overwrite | ETag + `If-Match` | Authorization and domain validation still apply |

`Deprecation` and `Sunset` are different: deprecation announces lifecycle status while the resource still functions; sunset indicates an expected date after which it may become unresponsive. RFC 9745 explicitly permits combining them, with the Sunset date not earlier than the deprecation date. [Deprecation header, RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html) [Sunset header, RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)

## Examples

### Keyset cursor with a tie-breaker

For descending `(createdAt, id)` ordering, encode the last returned pair in a protected cursor. The next query uses the lexicographic predicate `createdAt < cursor.createdAt OR (createdAt = cursor.createdAt AND id < cursor.id)`, after tenant authorization, filters, and the same order are applied. Include the filter/order version in the protected token if changing them would invalidate continuation. Return a next link or opaque token; do not assume keyset traversal is a database snapshot.

### Idempotent payment creation

1. Scope `Idempotency-Key` to the authenticated customer and payment operation.
2. Canonicalize the request and calculate its fingerprint.
3. Atomically insert an in-progress record with a unique scoped key.
4. If the key already exists, reject a different fingerprint; otherwise wait/replay the completed result or return the documented in-progress response.
5. Coordinate the provider's own idempotency key and local durable result. Use an outbox/workflow when a crash can occur between external charge and local commit.
6. Persist response status/body and only safe replay headers; retain through the retry window.

This gives bounded deduplication within the designed business boundary. It does not promise exactly-once execution across arbitrary networks and systems. [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)

### Require a current representation

The client retrieves a representation with an `ETag`, then sends `If-Match` when updating it. If the tag no longer matches, return the documented precondition failure without applying the update. If the request omitted a required condition, an API may return `428 Precondition Required`; if the condition fails, `412 Precondition Failed` is the conditional-request response. A business rule conflict may instead be `409 Conflict`. [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) [RFC 6585](https://www.rfc-editor.org/rfc/rfc6585.html)

### Deprecate with a migration path

Keep a deprecated endpoint functional under the announced policy, return `Deprecation` plus a `Link` to migration documentation, and add `Sunset` only when a planned date for likely unavailability is known. Monitor actual usage and provide a replacement contract. A header does not force clients to migrate or guarantee that the resource shuts down on the stated date.

## Common mistakes

- Paginating without an explicit stable order or unique tie-breaker.
- Assuming a signed/opaque cursor automatically enforces tenant authorization or snapshot consistency.
- Applying page boundaries before filtering or sorting.
- Returning huge client-requested page sizes or computing expensive total counts without a product need.
- Retrying POST merely because no response arrived; the operation may already have succeeded.
- Adding an idempotency key without a unique durable reservation, request fingerprint, or concurrency policy.
- Claiming global exactly-once effects across a database and external provider.
- Treating a repeated idempotent request as requiring byte-identical responses.
- Using `409` for every concurrency case without distinguishing a failed `If-Match` precondition.
- Treating `Deprecation` and `Sunset` as synonyms or assuming deprecation immediately changes behavior.
- Assuming added response fields cannot break strict consumers.

## Knowledge checks with answers

1. **Why include a unique tie-breaker in cursor ordering?** To produce a total order and an unambiguous continuation boundary when primary sort values tie.
2. **Does keyset pagination provide snapshot consistency?** No. It stabilizes seeking but the underlying dataset may change unless the API/database uses a snapshot contract.
3. **Can the same idempotency key be reused with a changed body?** The API should compare a request fingerprint and reject or explicitly define changed-input behavior.
4. **What does HTTP idempotency guarantee?** The same intended effect when repeated, not identical response bytes or exactly one server execution.
5. **What does `If-Match` prevent?** Applying a mutation based on a stale representation; a mismatch normally yields 412.
6. **How do Deprecation and Sunset differ?** Deprecation marks lifecycle status while it may continue functioning; Sunset announces a likely unavailability date.
7. **Is `Idempotency-Key` middleware built into ASP.NET Core or a published RFC?** No. The HTTPAPI document is an active Internet-Draft as of 2026-11-20; the header still requires an application/library implementation with persistent concurrency/replay rules.

## Sources

- [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)
- [Web Linking, RFC 8288](https://www.rfc-editor.org/rfc/rfc8288.html)
- [Additional HTTP Status Codes, RFC 6585](https://www.rfc-editor.org/rfc/rfc6585.html)
- [Deprecation HTTP Response Header, RFC 9745](https://www.rfc-editor.org/rfc/rfc9745.html)
- [Sunset HTTP Header, RFC 8594](https://www.rfc-editor.org/rfc/rfc8594.html)
- [API implementation guidance](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-implementation)
- [IETF Idempotency-Key Internet-Draft -08](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/08/)

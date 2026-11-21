# HTTP gRPC GraphQL and messaging comparisons — Reference: HTTP resource interaction, request methods, and shared semantics

Sources: [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 5789: PATCH](https://www.rfc-editor.org/rfc/rfc5789.html), and [RFC 10008: The HTTP QUERY Method](https://www.rfc-editor.org/rfc/rfc10008.html).

## Scope and version

This lesson describes HTTP resource semantics and method properties. RFC 10008 standardized QUERY in June 2026; deployment support must be checked. Wire framing for each HTTP version is separate.

## How this group fits the mental model

HTTP gives intermediaries and clients shared semantics for requests and responses. Consistent method/status/cache behavior enables interoperability, while application-specific authorization and business rules remain the server’s responsibility.

## Supplied names explained

### HTTP resource

An abstract target identified by a URI, not necessarily a file or database row. Resources expose representations and operations through HTTP semantics.

### HTTP request

A client message with method, target, fields, and optional content. Validate size, authorization, and representation according to the operation.

### HTTP response

A server message with status, fields, and optional content describing the outcome or representation. Status codes have shared meaning; application error details need a compatible body contract.

### HTTP field

Metadata carried in request/response headers, such as content type, cache policy, or conditional validators. Define and parse fields according to their syntax and semantics.

### HTTP status code

A numeric response classification for success, redirection, client error, or server error. Clients and intermediaries use its semantics; do not encode every result as 200 with hidden error text.

### HTTP content negotiation

Selection of representation based on request preferences and available formats, typically using Accept-related fields. Return the selected media type and handle unsupported choices explicitly.

### HTTP caching semantics

Rules for storing/reusing responses based on cache directives, freshness, validators, and request variation. Private/user-specific data needs appropriate cache controls and keys.

### HTTP conditional request

A request carrying validators such as entity tags or modification times to avoid unnecessary transfer or protect updates. Preconditions can prevent lost updates; interpret the relevant status response.

### HTTP safe method

A method whose defined semantics are read-only with respect to requested state changes. Incidental logging/metrics can occur; safety does not mean zero side effects of every kind.

### HTTP idempotent method

Repeated identical requests have the same intended effect as one request. Responses may differ and incidental effects can occur. Idempotency supports retry decisions but does not make all failures unambiguous.

### `GET`

Requests a representation of a target resource. It is safe and idempotent by semantics; avoid request content because its semantics are not generally defined for GET.

### `HEAD`

Like GET but asks for response metadata without representation content. Useful for checking headers/availability; server should provide metadata corresponding to GET where applicable.

### `POST`

Asks the target resource to process enclosed content according to resource-specific semantics. It is not inherently idempotent; clients must not blindly repeat operations that may have completed.

### `PUT`

Creates or replaces the state of the target resource with the supplied representation according to the resource contract. It is idempotent by method semantics; partial updates are generally PATCH’s role.

### `DELETE`

Requests removal of the target resource association/state. It is idempotent in intended effect even if responses differ; deletion may be logical or domain-specific.

### `CONNECT`

Establishes a tunnel to the target authority, commonly through a proxy. It has specialized semantics and security implications rather than ordinary resource representation behavior.

### `OPTIONS`

Requests communication options for a target/server. It can support capability discovery and is used by CORS preflight; a response is not itself authorization to perform an operation.

### `TRACE`

Requests a loop-back diagnostic of the received message. It can expose sensitive request data and is commonly disabled; do not use it for application functionality.

### `PATCH`

Applies a partial modification described by the request content. The patch format defines how changes apply; PATCH is not inherently idempotent, though a specific patch can be designed idempotently.

### `QUERY`

RFC 10008 safe, idempotent method whose enclosed content is processed to produce a result. It supports query payloads that do not fit a URI. Verify server, proxy, gateway, client-library, and cache support before adoption.

### `Accept-Query` response field

RFC 10008 field indicating query media types accepted by a resource for QUERY requests. It advertises capability; it does not establish support through every intermediary.

### HTTP method discovery

Discovering supported methods/capabilities, often via OPTIONS and documented contracts. Do not infer authorization or complete business behavior solely from a method list.

### HTTP redirection

A response instructing a client to use another target/representation or method behavior depending on status. Redirect status semantics differ; consider method/body preservation and avoid leaking credentials to an untrusted target.

### HTTP range request

Requests a portion of a representation using range semantics, often for large downloads/resume. Support is resource-dependent; validate range size and response status/content-range behavior.

## Cross-item comparison

Safe concerns intended state change; idempotent concerns repeat effect. GET is safe/idempotent; PUT and DELETE are idempotent but not safe; POST/PATCH behavior depends on method semantics and resource contract; QUERY is specified safe/idempotent but support may vary.

## Examples

Use GET for a cacheable product representation. Use PUT when the client replaces a known resource representation; use PATCH with a defined patch document for partial changes. For a complex search body, QUERY may fit where the whole HTTP path supports RFC 10008; otherwise POST search is a common interoperable contract.

## Common mistakes

- Treating idempotency as identical responses or exactly-once execution.
- Assuming QUERY is supported by every proxy/client.
- Sending secrets in a GET URI where logs/caches may retain them.
- Using PATCH without defining patch-document semantics.
- Treating OPTIONS discovery as an authorization decision.

## Knowledge checks with answers

1. **Is PUT safe?** No; it changes/replaces resource state, though idempotent.
2. **What is QUERY’s adoption caveat?** Standardization does not guarantee ecosystem support.
3. **What does a conditional request help with?** Efficient validation or concurrency preconditions.

### Exact terms covered

- `HTTP resource`
- `HTTP request`
- `HTTP response`
- `HTTP field`
- `HTTP status code`
- `HTTP content negotiation`
- `HTTP caching semantics`
- `HTTP conditional request`
- `HTTP safe method`
- `HTTP idempotent method`
- `GET`
- `HEAD`
- `POST`
- `PUT`
- `DELETE`
- `CONNECT`
- `OPTIONS`
- `TRACE`
- `PATCH`
- `QUERY`
- `Accept-Query response field`
- `HTTP method discovery`
- `HTTP redirection`
- `HTTP range request`

# HTTP gRPC GraphQL and messaging comparisons — Reference: GraphQL transport and boundaries with HTTP and alternative API contracts

Sources: [GraphQL September 2026 Specification](https://spec.graphql.org/September2026/), [GraphQL over HTTP Working Draft](https://http-spec.graphql.org/), [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), and [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/).

## Scope and version

The September 2026 GraphQL language specification is separate from the GraphQL-over-HTTP Working Draft dated November 12, 2026. This group covers the HTTP boundary and protocol comparisons, not pagination, federation, or upload conventions.

## How this group fits the mental model

GraphQL defines a schema and execution language independent of transport. HTTP adds request method, media type, status, and response rules; those rules are evolving in a separate draft and must be identified by status.

## Supplied names explained

### GraphQL transport independence

GraphQL language and execution can be carried over more than one transport. The schema/query language does not itself specify HTTP method/status behavior.

### GraphQL over HTTP

A transport integration describing how HTTP requests carry GraphQL operations and how responses/media types/statuses behave. Follow the current versioned document and implementation; do not infer the transport contract from the language specification.

### GraphQL-over-HTTP Working Draft

The November 12, 2026 prerelease Working Draft gives interoperability conventions but is not a final standard. Its language/requirements may change. Pin the edition used by an API and label conformance accordingly.

### GraphQL HTTP GET request

Can carry a GraphQL query through URL parameters under the transport draft. URLs may be logged, cached, or length-limited; avoid sensitive variable values and use only for operations allowed by the contract. Mutations should not be sent as GET.

### GraphQL HTTP POST request

Carries a GraphQL request body and supports larger documents/variables. The HTTP transport defines media type and response handling. POST does not automatically mean a mutation; operation type is in the GraphQL document.

### `application/graphql-response+json`

A GraphQL response media type designed to clarify response handling and status semantics for GraphQL over HTTP. Clients should negotiate/parse according to the adopted specification version.

### `application/json` GraphQL response media type

The widely used legacy response media type. Existing deployments have compatibility conventions; status handling may differ from the newer response media type. Do not assume both have identical HTTP status semantics.

### GraphQL request parameters query operationName variables extensions

The transport’s request envelope fields: query document, optional selected operation name, variable values, and extensions. Extensions are implementation-specific and should not be treated as portable semantics without agreement.

### GraphQL HTTP status-code handling

How HTTP statuses represent transport, parse/validation, and execution outcomes depends on the adopted GraphQL-over-HTTP media type/spec version. Clients should inspect media type and GraphQL response body; a single 200/4xx rule is not universal across legacy deployments and drafts.

### GraphQL subscriptions transport

Subscriptions require a long-lived/event-capable delivery mechanism; the GraphQL language defines source and response streams, but does not prescribe one transport.

### GraphQL WebSocket transport

A family of WebSocket subprotocols carries subscription operations/results. Protocol names and initialization/ack/error/completion semantics depend on the selected specification/library; matching subprotocol support is required.

### GraphQL Server-Sent Events transport

Carries a server-to-client event stream over HTTP using SSE framing, often with a separate HTTP request for client-side mutations. Reconnection, authorization, and event IDs are implementation/contract concerns.

### Resource-oriented HTTP API

Models resources and uses standard methods, status codes, caching, and conditional semantics. It is broadly interoperable and cache-friendly but may require multiple calls or endpoint-specific representations.

### Operation-oriented RPC API

Exposes named operations with explicit request/response contracts. It maps naturally to commands and service-to-service calls but can couple clients to operation/version contracts and network failure semantics.

### Client-selected GraphQL response shape

The client chooses fields/nesting within the schema for one response. This reduces over/under-fetching but requires query complexity limits, resolver efficiency, schema governance, and field-level authorization.

### API schema compatibility

Whether schema changes preserve existing clients. Adding nullable fields is often additive; removing/renaming fields, changing nullability, or changing enum exhaustiveness can break consumers. Measure usage before removal and follow an explicit deprecation/version policy.

### Protocol boundary authorization

Authentication identifies a caller; authorization decides whether that caller can invoke an operation or access each resource/field. A valid GraphQL document, gRPC method, or HTTP route does not itself authorize access.

### Protocol boundary observability

Capture useful operation identity, latency, outcome, and correlation without leaking secrets or high-cardinality payloads. For GraphQL, field-level tracing/query labels may be needed; for gRPC, method/status metadata; for HTTP, method/route/status.

### Request size and query-cost limits

Bound body size, depth, aliases, fragments, resolver fan-out, and execution cost where applicable. GraphQL’s flexible selection means a small request can create expensive work. Enforce limits before resource exhaustion.

## Cross-item comparison

The GraphQL language spec defines executable documents; the HTTP draft defines transport conventions. GET can aid caching but exposes URL parameters; POST carries larger bodies. WebSocket and SSE address streaming differently. Resource HTTP, RPC, and GraphQL optimize different contract shapes.

## Examples

A GraphQL GET query can be cached only when URI, authorization, and cache policy make reuse safe. A mutation uses POST under the HTTP integration. A subscription may use the agreed WebSocket subprotocol or SSE, with per-user authorization and cancellation semantics.

## Common mistakes

- Calling the GraphQL-over-HTTP draft a final standard.
- Treating GraphQL GET as safe for mutations.
- Assuming HTTP 200 means the GraphQL operation had no errors.
- Exposing introspection/fields without authorization analysis.
- Applying no query-cost limits because request bodies are small.

## Knowledge checks with answers

1. **Does GraphQL specify its HTTP transport?** No; that is a separate document.
2. **What status is the checked transport document?** Working Draft, not final standard.
3. **What makes GraphQL cost risky?** Small documents can trigger deep, high-fan-out resolver work.

### Exact terms covered

- `GraphQL transport independence`
- `GraphQL over HTTP`
- `GraphQL-over-HTTP Working Draft`
- `GraphQL HTTP GET request`
- `GraphQL HTTP POST request`
- `application/graphql-response+json`
- `application/json GraphQL response media type`
- `GraphQL request parameters query operationName variables extensions`
- `GraphQL HTTP status-code handling`
- `GraphQL subscriptions transport`
- `GraphQL WebSocket transport`
- `GraphQL Server-Sent Events transport`
- `Resource-oriented HTTP API`
- `Operation-oriented RPC API`
- `Client-selected GraphQL response shape`
- `API schema compatibility`
- `Protocol boundary authorization`
- `Protocol boundary observability`
- `Request size and query-cost limits`

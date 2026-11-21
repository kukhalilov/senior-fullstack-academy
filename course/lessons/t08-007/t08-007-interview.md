# HTTP gRPC GraphQL and messaging comparisons — Interview questions and reasoning

Sources: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [HTTP QUERY RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [GraphQL September 2026](https://spec.graphql.org/September2026/), and [GraphQL over HTTP](https://http-spec.graphql.org/).

## Core questions

Describe the interaction contract, not just the transport. State client capabilities, call shape, data consistency, error/retry semantics, compatibility, security, observability, and operational cost.

## Concise interview answers

HTTP provides resource semantics across multiple wire versions. gRPC provides typed named RPC contracts and four call forms. GraphQL defines a typed client-selected query language independent of transport. Messaging decouples producers and consumers in time. None supplies business authorization or safe retry semantics automatically.

## Deep follow-up answers

### How do HTTP/1.1, HTTP/2, and HTTP/3 differ?

They carry common HTTP semantics with different framing and transport. HTTP/2 multiplexes streams over TCP; HTTP/3 uses QUIC streams. Application method/status semantics remain defined separately.

### Safe versus idempotent?

Safe means the method’s intended semantics do not change server state; idempotent means repeating it has the same intended effect. PUT/DELETE are idempotent but not safe. Responses may differ, and a timeout can leave execution ambiguous.

### What changed with HTTP QUERY?

RFC 10008 standardized a safe/idempotent method with query content and the `Accept-Query` response field. Support across clients, proxies, and servers must be verified; standardization does not guarantee broad deployment.

### Compare gRPC streaming forms.

Unary exchanges one request/response; server-streaming returns many server messages; client-streaming sends many client messages then one response; bidirectional allows both sides to stream. Define order, flow control, deadlines, cancellation, and partial outcomes.

### Does GraphQL own HTTP behavior?

No. The GraphQL language/schema/execution spec is transport-independent. GraphQL-over-HTTP is a separate Working Draft as of November 12, 2026. Media type and status handling depend on the adopted transport version and compatibility contract.

### Why can GraphQL be expensive?

Nested fields and resolver fan-out can generate high work from a small document. Enforce request size/depth/complexity limits, optimize data access, authorize fields/resources, and observe operations safely.

## Scenario questions

### Browser client needs several related resources

Compare stable REST resources, GraphQL’s selected shape plus query-cost governance, and a BFF tailored to the browser. Choose from client diversity, caching, ownership, and operational capacity.

### Internal service needs continuous records

gRPC server streaming may fit a live bounded call; an event stream may fit retained/replayable consumption; pub-sub may fit fan-out. Clarify lifecycle, durability, replay, and ordering requirements.

### Long-running export

Use an asynchronous job/message with status/result correlation when users can wait later. Define deduplication and expiry. Use synchronous streaming only if client remains connected and partial progress is useful.

## Tradeoffs and alternatives

HTTP is interoperable/cache-friendly; gRPC is strongly typed and efficient for service calls; GraphQL gives flexible client response selection but needs cost/governance; messaging decouples time but adds delivery operations. A simpler HTTP endpoint can be better than any specialized protocol.

## Common weak answers

- “GraphQL is always faster because it avoids overfetching.”
- “HTTP/2 changes GET/POST semantics.”
- “gRPC retries are automatically safe.”
- “Messages are exactly once.”
- “GraphQL-over-HTTP is finalized.”
- “A small query body cannot be expensive.”

## Self-check rubric

Did you name client constraints, interaction shape, mutability/idempotency, error and timeout behavior, cache/stream semantics, compatibility status, and operational risks?

## Senior-level signals


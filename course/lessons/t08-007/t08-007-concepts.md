# HTTP gRPC GraphQL and messaging comparisons — Core concepts and how they fit together

Sources: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9112](https://www.rfc-editor.org/rfc/rfc9112.html), [RFC 9113](https://www.rfc-editor.org/rfc/rfc9113.html), [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html), [HTTP QUERY RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [proto3](https://protobuf.dev/programming-guides/proto3/), [Protocol Buffers Editions](https://protobuf.dev/programming-guides/editions/), [GraphQL September 2026](https://spec.graphql.org/September2026/), and [GraphQL over HTTP](https://http-spec.graphql.org/).

## Learning objectives

Distinguish HTTP semantics from wire versions; explain gRPC service and streaming contracts; understand GraphQL operations, schema, validation, execution, and transport; and choose synchronous APIs versus asynchronous messages based on interaction needs.

## Prerequisites

Know web requests, schemas, serialization, APIs, and distributed communication basics. Authentication, authorization, and broker-specific guarantees are covered in separate tracks/topics.

## Core concepts

HTTP semantics include methods, status codes, fields, content negotiation, caching, conditional requests, and ranges. HTTP/1.1, HTTP/2, and HTTP/3 carry those semantics using different connection/framing/transport mechanisms. HTTP QUERY is a standardized safe, idempotent method for carrying query content when supported; do not presume intermediaries accept it. Safe means intended not to change server state; idempotent means repeated requests have the same intended effect, not that responses are identical.

gRPC defines services and methods in Protocol Buffers schemas. Generated stubs and server interfaces reduce manual contract code. Unary calls have one request/response; server-streaming, client-streaming, and bidirectional streaming exchange sequences. Ordering is within a stream; deadlines, cancellation, status, metadata, flow control, health checking, and reflection remain important operational contracts. gRPC typically runs over HTTP/2; browsers/intermediaries may require gRPC-Web or gateways, beyond this protocol inventory.

GraphQL defines a typed schema and executable language. Query, mutation, and subscription are root operation types with different semantics; selections, fields, arguments, variables, fragments, directives, types, extensions, and introspection define operations and validation. Execution invokes resolvers. Mutation root fields execute serially; query field execution may be parallel according to implementation. A subscription is a source stream whose events each produce response results. Partial data can accompany execution errors. Schema language is distinct from GraphQL-over-HTTP transport rules.

The September 2026 GraphQL edition permits empty selection sets and adds the supplied directive-definition location and OneOf inhabitability rules. Built-in `@oneOf` is not introduced in that edition. The GraphQL-over-HTTP document checked Nov 12, 2026 is a Working Draft; label it as such, not a final standard.

Synchronous request-response couples caller latency and availability to the responder. Asynchronous messaging decouples time and can support one-way commands/events, queues, fan-out, and event streams, but adds delivery, ordering, retries, duplicate handling, and correlation. These broker semantics belong to the messaging topic. Protocol boundaries do not automatically provide authorization, compatibility, observability, resource limits, or safe retries.

## Mechanisms and relationships

```text
HTTP semantics ≠ HTTP wire protocol
GraphQL language/schema ≠ GraphQL-over-HTTP draft
gRPC service contract → generated stubs → RPC call shape/stream
command/event message → async queue/topic/stream → eventual consumer
```

## Worked examples

For an image metadata lookup, `GET /images/{id}` is cacheable resource access. A service-to-service thumbnail pipeline may use server streaming for progress/results. A dashboard may use GraphQL for a client-selected composite response but enforce query depth/cost limits. A long-running export can return a job ID and later publish completion rather than holding a synchronous request open.

## Misconceptions and edge cases

- HTTP/2 does not change HTTP method semantics; it changes wire framing and multiplexing.
- gRPC streaming has flow-control and deadline semantics; it is not simply a WebSocket.
- GraphQL does not require HTTP, and GraphQL-over-HTTP is separately specified.
- GraphQL selection flexibility can create expensive queries and N+1 resolver work.
- HTTP QUERY standardization does not mean universal intermediary support.
- An asynchronous message is not a request-response API with a longer timeout; completion/correlation are explicit.

## Knowledge checks with answers

1. **What stays common across HTTP versions?** HTTP semantics such as methods/status/fields.
2. **What are gRPC’s four call forms?** Unary, server-streaming, client-streaming, bidirectional-streaming.
3. **Is GraphQL-over-HTTP the GraphQL language spec?** No; transport conventions are a separate document.
4. **What does messaging decouple?** Producer and consumer in time, with added delivery responsibilities.

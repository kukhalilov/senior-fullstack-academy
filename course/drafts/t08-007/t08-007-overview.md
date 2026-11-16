# HTTP gRPC GraphQL and messaging comparisons — Big-picture orientation and mental model

Sources: [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112.html), [HTTP/2](https://www.rfc-editor.org/rfc/rfc9113.html), [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html), [HTTP QUERY](https://www.rfc-editor.org/rfc/rfc10008.html), [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [Protocol Buffers proto3](https://protobuf.dev/programming-guides/proto3/), [Protocol Buffers Editions](https://protobuf.dev/programming-guides/editions/), [GraphQL September 2026](https://spec.graphql.org/September2026/), and [GraphQL over HTTP](https://http-spec.graphql.org/).

## Problem and purpose

An application boundary needs a contract for exchanging requests, results, and failures. HTTP APIs, gRPC, GraphQL, and messaging offer different interaction shapes and operational tradeoffs; popularity alone does not select the right one.

## Plain-language mental model

HTTP defines shared request/response semantics carried by multiple wire versions. Resource-oriented APIs expose resource operations. RPC exposes named methods with typed messages. GraphQL lets a client select fields from a typed schema. Messaging separates producer and consumer in time. Each still needs explicit authorization, compatibility, observability, limits, and failure semantics.

## How the parts fit together

```text
client intent → protocol contract → transport/wire → server boundary
resource state   HTTP semantics       HTTP/1.1,2,3
named operation  gRPC + protobuf      typically HTTP/2
selected fields  GraphQL language     HTTP or another transport
async work/fact  message contract     broker/stream (t08-008)
```

GraphQL is transport-independent; GraphQL-over-HTTP adds a separate contract and remains a Working Draft at this lesson’s checked date. HTTP QUERY was standardized in June 2026, but ecosystem support is not universal. gRPC streaming uses four call shapes; client/browser intermediaries may need compatible transports.

## Concept map

HTTP method semantics define safety/idempotency, status, fields, caching, conditionals, ranges, and negotiation independently from HTTP wire framing. gRPC defines typed services and generated code with deadlines, cancellation, metadata, status, and flow control. GraphQL separates schema/language validation from execution and transport; partial data can coexist with execution errors. Async messages add queue/pub-sub/event-stream timing and delivery concerns.

## End-to-end walkthrough

A web client requests an order view. Resource HTTP can use a cacheable GET response; a gRPC client may call `GetOrder` with a typed message; GraphQL can select only needed nested fields. If order creation must notify another subsystem asynchronously, publish an event/message rather than keeping the request open for downstream work. The contract must define authorization, limits, error meaning, and compatibility regardless of protocol.

## When to use it and tradeoffs

Choose resource HTTP for broad interoperability, caches, and standard web semantics. Choose gRPC for typed service-to-service RPC and streaming where HTTP/2 and code generation fit. Choose GraphQL when multiple clients need flexible composition and the team can control query cost and schema evolution. Choose messaging for asynchronous time decoupling, queues, or fan-out; it introduces delivery/ordering/retry design.

## What later lessons cover

References cover HTTP semantics and wire versions, gRPC contracts/calls, GraphQL language and HTTP boundary, and protocol/message choice. Broker product specifics and detailed security implementations remain separate topics.

## Version notes

HTTP QUERY is standardized by RFC 10008 (June 2026); client, proxy, and server support must be checked. GraphQL September 2026 is the current edition referenced here; GraphQL-over-HTTP is a separate November 12, 2026 Working Draft, not a final standard.

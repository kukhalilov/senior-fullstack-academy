# HTTP gRPC GraphQL and messaging comparisons — Reference: gRPC service contracts, generated code, and RPC call forms

Sources: [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [Protocol Buffers proto3](https://protobuf.dev/programming-guides/proto3/), and [Protocol Buffers Editions](https://protobuf.dev/programming-guides/editions/).

## Scope and version

This lesson covers protocol-level gRPC and Protocol Buffers contracts. It does not enumerate language-specific generated APIs or broker delivery guarantees.

## How this group fits the mental model

Define typed service/method/message contracts in a schema, generate client/server code, then select a call shape and explicitly manage deadlines, cancellation, status, and flow control.

## Supplied names explained

### Remote Procedure Call (RPC)

A client invokes a named operation on a remote service as if calling a method, though the network adds latency, partial failure, serialization, and timeout ambiguity. Model remote failure explicitly.

### Protocol Buffers Interface Definition Language (proto3)

The `.proto` schema language using proto3 syntax to describe messages and services. Field numbers are wire identities; preserve them and reserve deleted numbers/names to avoid incompatible reuse.

### Protocol Buffers Editions

A newer configuration model for protobuf schemas that selects feature behavior by edition and explicit features, rather than relying only on syntax-version defaults. Check generator/runtime support across languages.

### gRPC service

A named collection of RPC methods defined in the schema. It is a contract, not necessarily one deployed process or one scaling unit.

### gRPC method

A named operation with declared request and response message types and one of the supported stream shapes. Define errors, idempotency, deadlines, and authorization separately.

### Protocol Buffers message

A typed structured value encoded with protobuf rules. Unknown fields and presence/default semantics affect compatibility; schema changes must preserve wire meaning.

### Protocol Buffers field number

A numeric tag identifying a message field on the wire. Never renumber or reuse a number that has been deployed; reserve removed values when supported by schema conventions.

### Generated client stub

Generated code exposing service methods to a client language. It handles serialization/transport plumbing, not business retry safety or authorization policy.

### Generated server interface

The language-specific contract a server implementation must satisfy, produced from the service definition. Generated interface details vary by language/runtime.

### Unary RPC

One request and one response. It is the closest shape to a conventional request-response call but still needs deadline and partial-failure handling.

### Server-streaming RPC

One request followed by a sequence of server messages. The client must consume/cancel the stream and handle midstream failure after partial results.

### Client-streaming RPC

A sequence of client messages followed by one server result. The protocol should define completion, validation, and what happens if the client stops early.

### Bidirectional-streaming RPC

Both sides send message sequences over one RPC. Reads and writes can proceed independently; define correlation and application-level ordering.

### Message ordering within one gRPC stream

Messages in each direction of a stream preserve their order. This does not order messages across separate RPCs or independent streams.

### gRPC over HTTP/2

The standard gRPC protocol maps RPC metadata, messages, and status onto HTTP/2. Intermediaries must preserve required trailers/stream semantics; HTTP/2 support alone does not imply full gRPC compatibility.

### gRPC channel

A client-side abstraction for connecting to a service target and managing transport/subchannels. It may outlive individual RPCs. Channel pooling, name resolution, TLS, and health affect lifecycle.

### gRPC metadata

Key/value call metadata, commonly used for authentication context, tracing, or custom headers. Avoid placing large or sensitive payloads there; define propagation and trust boundaries.

### gRPC status code

A standardized RPC outcome category, such as invalid argument, unavailable, or deadline exceeded. Map errors deliberately; status does not carry all application-domain semantics by itself.

### Deadline propagation

Passing the caller’s remaining time budget to downstream calls so work stops when the user deadline expires. Avoid assigning each hop a fresh full timeout that exceeds the end-to-end budget.

### RPC cancellation

Signals that a caller no longer needs the result or deadline expired. Server work should observe cancellation where possible; cancellation does not prove a side effect was rolled back.

### Flow control for streaming RPCs

Bounds in-flight messages/bytes so a fast sender does not overwhelm a slower receiver. Application code must read/write responsibly and account for buffering.

### gRPC health checking

A standard service contract for reporting service health/readiness to clients or infrastructure. Health status should reflect the capability being routed and not merely process existence.

### gRPC reflection

A service that exposes schema/service descriptors at runtime for tools such as exploration clients. Restrict exposure appropriately; reflection is not required by the core RPC contract.

## Cross-item comparison

Unary is one exchange; the other three shapes include a stream on at least one side. Streaming can reduce repeated setup and support incremental data but introduces cancellation, partial-result, ordering, and backpressure behavior.

## Examples

Use unary `GetAccount` for a bounded lookup. Use server streaming for a large export with incremental records. If a client uploads chunks and then receives a receipt, client-streaming can fit. A live collaborative session may use bidirectional streaming with explicit per-message correlation.

## Common mistakes

- Treating RPC as a local method with no network failure.
- Reusing protobuf field numbers after removing fields.
- Blindly retrying a command whose side effect may already have completed.
- Assuming messages from separate streams are globally ordered.
- Forgetting cancellation and deadlines for long-lived streams.

## Knowledge checks with answers

1. **What are the four call shapes?** Unary, server-streaming, client-streaming, bidirectional-streaming.
2. **What ordering is guaranteed?** Within each gRPC stream direction, not across RPCs.
3. **What do generated stubs not decide?** Business semantics, auth policy, or retry safety.

### Exact terms covered

- `Remote Procedure Call (RPC)`
- `Protocol Buffers Interface Definition Language (proto3)`
- `Protocol Buffers Editions`
- `gRPC service`
- `gRPC method`
- `Protocol Buffers message`
- `Protocol Buffers field number`
- `Generated client stub`
- `Generated server interface`
- `Unary RPC`
- `Server-streaming RPC`
- `Client-streaming RPC`
- `Bidirectional-streaming RPC`
- `Message ordering within one gRPC stream`
- `gRPC over HTTP/2`
- `gRPC channel`
- `gRPC metadata`
- `gRPC status code`
- `Deadline propagation`
- `RPC cancellation`
- `Flow control for streaming RPCs`
- `gRPC health checking`
- `gRPC reflection`

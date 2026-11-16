# HTTP gRPC GraphQL and messaging comparisons — Exercises and worked solutions

Sources: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), [HTTP QUERY RFC 10008](https://www.rfc-editor.org/rfc/rfc10008.html), [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [GraphQL September 2026](https://spec.graphql.org/September2026/), and [GraphQL over HTTP](https://http-spec.graphql.org/).

## Goals

Choose protocol contracts from client and interaction requirements, identify current standards/drafts, and specify limits, errors, and consistency.

## Worked example

A browser needs a personalized dashboard combining account, alerts, and preferences. GraphQL can let the client select a response shape, but requires resolver efficiency, query-cost limits, field authorization, and schema policy. A REST resource endpoint may be simpler if the shape is stable. Internal bulk export can use gRPC streaming or an asynchronous job/message depending on duration and client needs.

## Exercises

### Exercise 1: Classify the HTTP method

A client replaces a known document resource with a complete representation and retries after a timeout. Which method semantics fit, and what does the timeout leave uncertain?

#### Worked solution

PUT is idempotent by intended effect and fits replacement. A timeout does not prove the server failed to apply it; a retry should produce the same intended resource state. Verify conditional/version semantics if concurrent updates matter.

### Exercise 2: QUERY adoption

A team wants to send a large search document in an HTTP QUERY body. What must be checked before release?

#### Worked solution

RFC 10008 defines QUERY as safe/idempotent, but confirm client libraries, server, gateway, proxy, caches, WAFs, and observability tools accept it. Define accepted content types and response behavior. Fall back to a documented POST search contract if support is insufficient.

### Exercise 3: Choose gRPC call shape

A telemetry client uploads a finite batch of readings and receives one validation summary. Which RPC shape may fit? What if the server should send progress records too?

#### Worked solution

Client-streaming RPC can accept a sequence and return one summary. For progress back to the client while it sends, bidirectional streaming may fit. Define flow control, cancellation, deadlines, and whether partial ingestion is committed.

### Exercise 4: GraphQL mutation semantics

An operation has three top-level mutation fields. Does GraphQL serial execution guarantee all-or-nothing behavior?

#### Worked solution

No. Top-level fields execute serially, but the specification does not create one encompassing database transaction or undo earlier side effects when a later field fails. Design explicit transaction/idempotency behavior.

### Exercise 5: GraphQL transport status

An existing service returns `application/json` and HTTP 200 for validation errors. A new client expects the newer response media type and status handling. What should the migration plan include?

#### Worked solution

Pin the GraphQL-over-HTTP document version/status, negotiate or configure response media types, update clients and gateways, and test parse/validation/execution errors. The 2026 document is a Working Draft; maintain compatibility with existing conventions rather than claiming universal final-standard behavior.

### Exercise 6: Pick async versus sync

A report takes 90 seconds and can be checked later. Should the API wait for completion?

#### Worked solution

Prefer an asynchronous job command returning an accepted/job identifier, then provide status/result or completion event. Define duplicate submissions, correlation, expiration, and failure reporting. A long synchronous call ties up resources and couples availability.

## Progressive hints

Identify the client environment, response timing need, payload shape, cache/freshness need, and whether the operation mutates state. Then ask what happens on timeout, duplicate, partial result, and intermediary incompatibility.

## Complete solutions

Each exercise includes one defensible answer. Provider/platform support can change; validate protocol behavior against deployed clients and intermediaries.

## Tests and edge cases

Test HTTP retries and conditional writes, large request bodies, QUERY intermediary handling, gRPC stream cancellation/backpressure, protobuf schema compatibility, GraphQL partial errors and query-cost rejection, media type/status combinations, WebSocket/SSE reconnects, and asynchronous duplicate delivery.

## Reflection questions

Which part of the contract is standardized and which is application-specific? What client or intermediary limits could invalidate the design? What level of compatibility commitment does the team own?

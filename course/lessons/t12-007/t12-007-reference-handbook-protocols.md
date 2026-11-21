# system design technology landscape and selection — Reference: Protocols

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [gRPC concepts and lifecycle](https://grpc.io/docs/what-is-grpc/core-concepts/), [gRPC-Web](https://github.com/grpc/grpc-web), [GraphQL introduction](https://graphql.org/learn/introduction/), [GraphQL schemas and types](https://graphql.org/learn/schema/), [GraphQL best practices](https://graphql.org/learn/best-practices/), [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), [WebSocket server guide](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers).

## Scope and version

This lesson compares gRPC, GraphQL, and WebSockets as API communication choices. They solve different layers of the problem: RPC contracts, client-shaped data queries, and a persistent bidirectional transport. A production design still needs authentication, authorization, rate limits, timeouts, observability, version compatibility, and an error contract.

## How this group fits the mental model

Start by identifying who calls whom, what data shape is exchanged, whether the interaction is request/response or continuous, what clients are supported, and what latency/reliability budget applies. A protocol defines message exchange; it does not define whether a business operation is idempotent or whether a response is durable. The caller may time out while a server-side effect succeeds, so retries need a correctness policy.

## Supplied names explained

- **gRPC** — An RPC framework in which services and method signatures are defined through an interface description, commonly Protocol Buffers (`.proto`). Tooling generates client/server code. It supports unary calls, client streaming, server streaming, and bidirectional streaming. gRPC commonly uses HTTP/2 and provides deadlines, status codes, metadata, and ordered messages within an individual stream/RPC. Native browser environments cannot use all standard gRPC features directly; gRPC-Web with a compatible server/proxy is a common browser path. Schema evolution needs compatible field-number/type discipline and coordinated deployment.
- **GraphQL** — A query language and server runtime for APIs, with a schema of types and fields. Clients specify the fields they need; the server validates and resolves them against application code/data sources. A GraphQL API is not tied to one database and is not automatically a caching layer. Queries can fan out into expensive resolver work, so implementations need batching, pagination, depth/complexity limits, authorization at field/object boundaries, and performance observability. Subscriptions are a GraphQL operation concept, but transport behavior is implementation-specific; they often use a persistent protocol such as WebSockets.
- **WebSockets** — A protocol/API for a persistent, bidirectional communication session, initiated through an HTTP handshake and then used for messages in both directions. It is useful for chat, presence, collaborative updates, and live dashboards. WebSockets provide a connection and message framing, not durable delivery, replay, application acknowledgements, or built-in backpressure in the browser WebSocket API. The application must handle reconnect/resume, heartbeat, flow control, ordering semantics across reconnects, authorization, and fan-out.

## Cross-item comparison

| Need | Good starting point | Advantages | Costs and limits |
|---|---|---|---|
| Internal typed service-to-service call, including streaming | gRPC | Generated contracts, efficient binary messages, deadlines, streaming RPC forms | Tooling/HTTP2 awareness, browser gRPC-Web path, schema rollout discipline |
| Multiple web/mobile clients need different nested data views | GraphQL | Typed query schema and client-selected response shape | Resolver complexity, query cost control, caching/invalidation, authorization discipline |
| Server and client exchange continuous events both ways | WebSockets | One long-lived bidirectional channel | Connection capacity, reconnect state, backpressure, delivery/replay built by application |
| Conventional resource CRUD and broad interoperability | HTTP REST/JSON is a common alternative | Familiar tooling, stateless request/response, cache semantics | Multiple endpoints or over/under-fetching; streaming may need another mechanism |
| One-way server-to-browser events | SSE is a common alternative | HTTP-based unidirectional event stream with reconnect support in browsers | Client-to-server messages use normal HTTP; proxy buffering/timeouts require setup |

Do not compare only wire speed. Evaluate client support, contract ownership, gateway compatibility, cache behavior, load-balancing, streaming limits, and team tooling.

## Examples

### Internal inventory lookup

An order service calls an inventory service with a typed request and deadline. gRPC code is generated from a `.proto` contract, and additive field changes are deployed compatibly. The order service propagates a deadline smaller than its own request budget. If it receives a timeout, it does not assume the inventory reservation failed; a reservation ID/idempotency key supports retry or status lookup.

### Search page data

A browser requests a product page through GraphQL and selects product name, price, and a bounded set of reviews. Resolvers batch product/review access to avoid N+1 queries. Authorization applies to each protected product/review, and a complexity limit rejects queries that request unbounded nested lists. Public cacheable fields and user-specific data are not accidentally mixed into a shared cached response.

### Live collaboration

A WebSocket connection carries presence and cursor updates. The server authenticates during connection setup, checks authorization for each room subscription, caps per-client queued messages, and disconnects slow consumers. Durable document changes are written to a database/event log first; reconnecting clients request missed changes from a sequence number rather than assuming the socket retained them.

## Common mistakes

- Treating a gRPC timeout as proof that the server did not perform the operation.
- Exposing a schema through GraphQL without field-level authorization or query cost limits.
- Assuming GraphQL itself specifies a subscription wire protocol or that it eliminates caching concerns.
- Treating a WebSocket connection as a reliable durable queue.
- Ignoring browser/proxy compatibility for native gRPC or long-lived sockets.
- Using one protocol for every boundary even when clients, payload shape, and interaction pattern differ.

## Knowledge checks with answers

1. **Which gRPC method types exist?** Unary, server-streaming, client-streaming, and bidirectional-streaming RPCs.
2. **Does GraphQL require a specific database?** No. Resolvers can connect to any suitable code or data source.
3. **Does WebSocket guarantee that messages sent during a disconnect will be replayed?** No. The application needs a durable cursor/history or reconciliation mechanism.
4. **What should a client do after an RPC timeout with an unknown result?** Use an idempotency key or query operation status before repeating a non-idempotent effect.

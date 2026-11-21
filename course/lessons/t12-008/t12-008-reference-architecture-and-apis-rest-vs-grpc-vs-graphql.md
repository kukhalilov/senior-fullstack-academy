# system design tradeoffs and decision methods — Reference: REST vs gRPC vs GraphQL

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [gRPC core concepts](https://grpc.io/docs/what-is-grpc/core-concepts/), [GraphQL specification](https://spec.graphql.org/October2021/), [gRPC-Web](https://github.com/grpc/grpc-web).

## Scope and version

REST, gRPC, and GraphQL are different abstractions. REST is an architectural style commonly implemented over HTTP; gRPC is an RPC framework with generated contracts and a common HTTP/2 transport; GraphQL is a query language and execution model exposed through a schema. A system can use more than one at different boundaries.

## How this group fits the mental model

Start from the caller's job. A browser loading a public resource benefits from standard HTTP caching and links. A service-to-service caller may benefit from typed generated clients and streaming RPC. A UI that needs different combinations of fields across screens may benefit from a graph query. Ask how clients discover operations, how payload shape evolves, what intermediaries can cache, how failures and retries behave, and how access is authorized.

## Supplied names explained

**REST-style HTTP:** model resources and use HTTP methods/status codes/cache semantics. It fits browsers, public APIs, CDN/proxy caching, and linkable resources well when the resource model is natural. REST does not require JSON, and “REST API” labels often describe only a subset of Fielding's constraints. Clients can still suffer from multiple round trips or over/under-fetching.

**gRPC:** define services and messages in Protocol Buffers, generate clients/servers, and use unary or streaming calls. The common gRPC protocol uses HTTP/2; native browser use may require a proxy/translation layer such as gRPC-Web. Schema evolution requires compatible field-number practices. Streaming, deadlines, cancellation, status codes, metadata, and retry policy must be designed deliberately.

**GraphQL:** define a schema and let a request select fields; the server resolves those fields. This can reduce UI-specific round trips and payload overfetching, but introduces resolver planning, authorization at field boundaries, query-cost/depth controls, caching complexity, and potential N+1 backend calls. GraphQL can run over HTTP and is not a replacement for every internal RPC.

## Cross-item comparison

| Need | Good starting point | Main design cost |
|---|---|---|
| Cacheable, resource-oriented public interface | HTTP/REST style | Resource/API evolution and round trips |
| Typed internal calls, generated clients, streaming | gRPC | Browser/intermediary support and RPC operations |
| Flexible UI-selected data graph | GraphQL | Resolver efficiency, field authorization, query cost, caching |

All three need authentication, authorization, observability, version/evolution rules, idempotency where needed, and explicit timeout/retry behavior. No style guarantees performance or security by itself.

## Examples

For a product page, a browser may call a cacheable GET /products/42; a mobile app may query product, seller, and availability through one GraphQL operation; an internal checkout service may call typed ReserveInventory and AuthorizePayment gRPC methods. For each, trace an expired credential, a timeout after the server applied a mutation, a retry, and a slow downstream service. Decide how the caller determines whether the mutation committed and how sensitive fields are authorized.

## Common mistakes

- Calling every JSON-over-HTTP API RESTful without checking resource semantics and HTTP behavior.
- Assuming gRPC works directly in every browser or that HTTP/2 removes network failure modes.
- Assuming GraphQL avoids backend fan-out; poorly batched resolvers can create N+1 requests.
- Applying retries to non-idempotent mutations without an idempotency or outcome-reconciliation design.
- Assuming client-selected GraphQL fields make field-level authorization optional.

## Knowledge checks with answers

1. **Which option offers a schema-driven query where callers select fields?** GraphQL.
2. **What makes a timed-out mutation retry dangerous in any of these styles?** The server may have applied it even though the response was lost; use idempotency or reconcile outcome.
3. **Why may browser gRPC need an adaptation layer?** Browser APIs do not expose all native HTTP/2 behavior required by the standard gRPC transport; gRPC-Web/proxies address that boundary.

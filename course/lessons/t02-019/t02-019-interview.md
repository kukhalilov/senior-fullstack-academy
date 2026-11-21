# SignalR transports hubs connection lifetime groups security scaling — Interview questions and reasoning

## Core questions

These questions test the purpose and core lifetime model of SignalR. [SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) [Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Concise interview answers

Use these as short first responses before expanding into tradeoffs and evidence.

## Deep follow-up answers

The detailed explanations below add operating constraints, failure cases, and version boundaries.

## Scenario questions

Use the later architecture and failure questions to reason from a concrete deployment.

## Tradeoffs and alternatives

Compare SignalR features with raw WebSockets, durable application storage, Redis forwarding, and a managed service only for the specific requirement being discussed.

## 1. What does SignalR provide beyond a raw WebSocket?

**Answer.** SignalR provides a logical connection abstraction, transport negotiation/fallback, a Hub Protocol, hub method invocation, client callbacks, groups/users routing, streaming, and client libraries with lifecycle support. A raw WebSocket only provides a bidirectional framed byte channel; the application would need to design framing, correlation, reconnect, dispatch, authorization hooks, and client APIs. SignalR still does not provide durable event storage, exactly-once delivery, or business-level authorization automatically.

## 2. Why should a hub instance not hold application state?

**Answer.** Hub objects are transient and created per hub invocation. A later invocation on the same connection can use a different instance, and concurrent calls can overlap. Store durable/business state in application services or a database. Connection-specific ephemeral values may use connection-scoped structures, but they need cleanup and do not survive reconnect or process loss.

## 3. How do `Clients.User`, `Clients.Client`, and `Clients.Group` differ?

**Answer.** `Client(connectionId)` targets one current connection, `User(userId)` targets all connections mapped to that user, and `Group(groupName)` targets connections currently in a routing group. A user may have multiple connections. Connection IDs change on reconnect. Groups are not access-control boundaries, and user IDs must be stable and unique. Authorization belongs in the server-side operation that chooses recipients and permits membership.

## 4. When use a typed hub?

**Answer.** `Hub<TClient>` and `IHubClients<TClient>` give server code compile-time checked client method names and argument types. They improve refactoring and contract clarity, but do not validate a separately deployed client at compile time or eliminate serialization/version compatibility concerns. Untyped client proxies are more dynamic but shift errors toward runtime.

## 5. What is the difference between `SendAsync` and client-result invocation?

**Answer.** `SendAsync` tells SignalR to send a one-way client method invocation and does not return a client value. `InvokeAsync<T>` on a single-client proxy waits for a result from that client and is subject to timeout, disconnect, and client implementation behavior. Client-result invocation is not a reliable distributed transaction: a timeout can leave uncertainty about whether the client acted.

## 6. How do automatic reconnect and stateful reconnect differ?

**Answer.** Automatic reconnect is a client retry policy that establishes a new logical connection after loss; applications must handle the new connection and rejoin groups. Stateful reconnect uses bounded message buffers and acknowledgements when both server endpoint and client opt in, allowing short interruptions to resume with limited replay. It is finite and not durable. If every message matters, persist application events and resume by cursor.

## 7. Why is a group not a security boundary?

**Answer.** Group membership controls message routing, not permission to read a domain resource. A group name may be guessed and membership may outlive a policy change. Authorize before adding a connection, derive group names server-side, revalidate or remove membership after revocation, and authorize the underlying resource independently.

## 8. What does authentication on a SignalR connection mean for later invocations?

**Answer.** The connection principal and claims are normally established during connection authentication and can remain stale for the connection lifetime. A hub or method policy protects invocation, but resource authorization should use current server-side data. Decide how token expiry/revocation is handled through disconnect, reconnect, or supported authentication refresh.

## 9. What is significant about ASP.NET Core 11 SignalR authentication refresh?

**Answer.** The .NET and JavaScript clients can request an in-place authentication refresh; the server reauthenticates the refresh request and replaces claims without changing the connection ID. The refreshed principal must map to the same SignalR user identifier, and a callback cannot override that invariant. New calls use the refreshed principal while in-flight calls keep their original principal. Refresh failure is surfaced but does not itself close or automatically retry the connection; the application chooses recovery.

## 10. What does a hub-method cancellation token guarantee in .NET 11?

**Answer.** The .NET client can cancel a non-streaming `InvokeAsync` and SignalR sends a cancellation message. A hub method that declares `CancellationToken` can cooperatively stop by observing/passing it to operations. The client task may cancel before server work stops, and cancellation cannot roll back committed side effects. It is not the same as cancelling `SendAsync`, and the release feature is .NET-client-only.

## 11. Why are browser bearer tokens sometimes in a query string?

**Answer.** Browser WebSocket and Server-Sent Events APIs do not allow arbitrary authorization headers, so SignalR may use `access_token` on the URL for those transports. URLs are often logged. HTTPS and careful redaction are essential. CORS is not WebSocket origin security; configure allowed origins and WebSocket handling separately.

## 12. How do you authorize a hub operation on a specific resource?

**Answer.** A class-level `[Authorize]` verifies the configured policy at the hub/method boundary, but an invoice or document ID passed by the client still needs resource authorization. Load it through trusted data access, verify current tenant/ownership/action permission, then mutate. Never infer permission from a group name or client-supplied claim.

## 13. What role does `IHubContext` play?

**Answer.** It allows controllers, background workers, and other services to send through a hub's client and group proxies outside an active hub method. A hub should not be manually instantiated to send messages because its invocation context and proxies are framework-managed.

## 14. When are sticky sessions needed?

**Answer.** In a self-hosted multi-server deployment, subsequent requests for a connection generally need to reach the node that owns that connection, so configure affinity. Documented exceptions include Azure SignalR Service and a constrained WebSockets-only `SkipNegotiation` arrangement. A Redis backplane forwards messages across nodes but does not by itself remove the need for affinity.

## 15. What does a Redis backplane guarantee?

**Answer.** It forwards SignalR messages between app-server nodes through Redis pub/sub. It is not durable storage; messages during a Redis outage are not retained for replay. It also does not store application state or guarantee delivery to disconnected clients. Persist important events elsewhere and use a reconnect cursor/snapshot protocol.

## 16. How would you protect a SignalR endpoint from resource exhaustion?

**Answer.** Bound incoming message size and per-client parallel invocations; validate payloads; use streaming and bounded backpressure for large data; apply domain quotas and rate controls; and cap connections/queues at infrastructure and application layers. Observe socket, memory, CPU, fan-out, and outbound bandwidth. `MaximumParallelInvocationsPerClient` is not a global rate limiter.

## 17. What should be measured in production?

**Answer.** Active connections by node/transport, connection start/close and reconnect rates, handshake/auth failures, message/invocation volume, send errors, latency, backplane/service health, and CPU/memory/socket/network use. Correlate SignalR traces with HTTP and application traces while redacting access tokens, query strings, and private payloads.

## 18. How do you version a hub contract?

**Answer.** Treat client method names, argument shapes, serialization protocol, and auth expectations as a distributed contract. Prefer additive changes, tolerate optional/unknown fields where appropriate, deploy compatible server/client combinations, and define migration windows. JSON and MessagePack are distinct Hub Protocol choices; a serializer feature for JSON does not automatically apply to MessagePack. ASP.NET Core 11 JSON Hub Protocol support for C# unions is an example of a protocol-specific capability.

## Common weak answers

- “SignalR guarantees delivery.” It provides connection and messaging abstractions, not a durable event log.
- “A group is a room permission.” A group is routing membership; resource authorization is separate.
- “Reconnect resumes the same connection.” Ordinary automatic reconnect establishes a new connection; stateful reconnect is bounded and opt-in.
- “The Redis backplane queues missed messages.” Redis pub/sub forwards live messages and does not replay outage traffic.
- “Cancelling the client token stops the server.” It sends a cooperative cancellation request; server work may continue or already have committed.
- “Valid refreshed token means the user can change.” Refresh enforces the same SignalR user identity.

## Self-check rubric

Score each answer from 0 to 2: **0** misses the distinction or makes an incorrect promise; **1** states the correct feature but omits an important boundary; **2** names the mechanism, its limit, and a design consequence. Strong interview readiness means scoring 2 on routing vs authorization, reconnect vs durable recovery, refresh identity, cancellation, affinity/backplane, and resource limits.

## Sources

[SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) · [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) · [Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) · [Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) · [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

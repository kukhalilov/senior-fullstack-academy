# SignalR transports hubs connection lifetime groups security scaling — Exercises and worked solutions

## Goals

Practice choosing a SignalR topology, separating delivery from durability, and applying authorization and resource limits to live connections. The solutions include the failure mode each design choice prevents. [SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) [Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) [Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Worked example

A chat service needs to notify clients across three app nodes and promise that users can recover missed messages after a deployment. Use `IHubContext` to publish to connected recipients, affinity plus a backplane or a managed SignalR service for live scale-out, and a durable message store with sequence IDs for recovery. SignalR reconnect and Redis pub/sub do not provide durable replay. Each group join checks current conversation membership. This layered design separates live routing, authorization, and durable history.

## Exercises

## Progressive hints

For each scenario, first identify which object owns the connection, then separate routing from authorization and transient recovery from durable storage. Check whether client input is trusted, whether the operation has already committed, and whether a reconnect preserves the old connection.

## Complete solutions

The worked solutions appear immediately after each exercise so the reasoning can be checked while practicing. Try each prompt before reading its answer; compare your response against the ownership, security, lifecycle, and durability properties stated there.

## Tests and edge cases

Before production, test two tabs for one user, reconnect with new connection IDs, unauthorized group joins, token expiry and refresh to a different user, cancellation during a database operation, Redis outage, node drain, proxy timeout, oversized payload, and fan-out to many recipients. Confirm that retries are idempotent and that durable recovery detects gaps.

## Reflection questions

1. Which delivery promises in your design are durable, and which last only while a connection is healthy?
2. What is the exact authorization check before a user joins each group?
3. If cancellation arrives after a database commit, what result should the client observe?
4. How can operations identify a transport or backplane incident without logging credentials?

## Exercise 1 — Send from a background worker

A background service must send `PriceChanged` to every client subscribed to a product. It currently constructs `PriceHub` with `new PriceHub()` and calls a hub method. Explain the design error and sketch the right shape.

### Worked solution

Hub instances are transient and created by SignalR for invocations. Manually constructing one leaves its caller context, client proxies, and group manager uninitialized. Inject `IHubContext<PriceHub, IPriceClient>` into the worker (or untyped `IHubContext<PriceHub>`), then send using `Clients.Group(productGroup).PriceChanged(update)` or `Clients.Group(...).SendAsync(...)`. Keep pricing/domain state in application services. The group should contain only connections authorized for that product; the group name is not an access check.

## Exercise 2 — A group name is not authorization

The client invokes `JoinRoom("tenant-42-payroll")`; the hub immediately calls `Groups.AddToGroupAsync(Context.ConnectionId, room)`. Identify two attack paths and fix the flow.

### Worked solution

An authenticated user can guess another tenant's room or change the room argument, because client input is untrusted. Authenticate the connection, load the room/tenant from a trusted store, authorize `Context.User` for that resource, and only then add the connection to a server-derived group name. Revalidate membership after permission changes, remove it when access is revoked, and ensure reconnect code repeats authorization. Do not expose secrets merely because a client is in a group.

## Exercise 3 — Route to the user, not a guessed connection

A user has two browser tabs. A notification should reach both. The application stores one connection ID from the last `OnConnectedAsync`. What is the problem, and what must be true for `Clients.User(id)` to be safe?

### Worked solution

The stored ID represents only one connection and becomes stale after reconnect. A user can have multiple live connections. Use `Clients.User(stableId)` to target all active connections mapped to that user, or maintain an explicit device registry if only selected devices should receive the message. Ensure the `IUserIdProvider` result is stable and globally unique; a collision cross-routes messages. Default mapping uses `ClaimTypes.NameIdentifier`. A user ID is still a routing key, so authorization for the notification belongs in application logic.

## Exercise 4 — Choose a transport with a constrained proxy

Users are behind a corporate proxy that blocks WebSocket upgrades but permits ordinary HTTPS requests. Which transport fallback makes SignalR more likely to work? What operational costs follow?

### Worked solution

Keep negotiation and allow fallback to Server-Sent Events or long polling as supported by the client/server environment. WebSockets is generally preferred, but cannot be assumed through that proxy. Long polling issues repeated HTTP requests and increases request/connection overhead; SSE is server-to-client over HTTP with client-to-server traffic on separate HTTP requests. Configure proxy timeouts and ensure the selected transport reaches the same server when self-hosting multiple nodes. Do not set `SkipNegotiation` when fallback is needed.

## Exercise 5 — Cancellation is not rollback

The .NET client calls `InvokeAsync("Transfer", token)` and cancels after five seconds. The server hub method accepts `CancellationToken` but calls a database operation without passing the token, then writes a transfer record. What can the client conclude? Improve the server method.

### Worked solution

The client can conclude its invocation task was cancelled and a cancellation message was sent; it cannot conclude the server stopped or rolled back. Pass the token to cancellable I/O and check it before irreversible work. Use a database transaction and idempotency key so retries cannot duplicate a transfer. Once a commit succeeds, cancellation cannot undo it automatically. The server method should define exactly when the operation becomes committed and return a durable operation ID/state when appropriate.

## Exercise 6 — Deploy two app nodes

Two self-hosted app nodes sit behind a load balancer. A client connects to node A; a later poll/request may go to node B. Messages from node A also need to reach clients on node B. Name the two separate requirements and a suitable arrangement.

### Worked solution

The transport requests need session affinity so the connection is handled by its owning node. Cross-node message sends need a backplane such as the Redis backplane. Register `Microsoft.AspNetCore.SignalR.StackExchangeRedis` with `AddStackExchangeRedis`, configure a prefix when sharing Redis, and monitor Redis/network health. Redis pub/sub forwards messages but does not persist them during an outage. Alternatively use Azure SignalR Service, whose managed connection model changes the affinity and scale-out design. Verify proxy WebSocket upgrades, idle timeouts, and failover behavior.

## Exercise 7 — Refresh a token in place

An ASP.NET Core 11 connection refreshes to a correctly signed token whose `NameIdentifier` maps to a different person. Should `OnAuthenticationRefresh` approve it to avoid reconnecting? What happens to running work?

### Worked solution

No. Authentication refresh requires the refreshed principal to map to the same SignalR user identity; the callback can impose further restrictions but cannot override that invariant. A different account needs a new connection. Successful same-user refresh replaces the connection principal for later invocations and runs `Hub.OnAuthenticationRefreshedAsync`; invocations already in progress retain the principal they captured when they began. Keep sensitive resource checks current, because same identity does not guarantee unchanged permissions.

## Exercise 8 — Diagnose missing updates after a Redis interruption

The Redis backplane was unavailable for one minute. A connected client on node B did not receive events published from node A during that period. Can stateful reconnect or automatic reconnect replay all of them? Design reliable recovery.

### Worked solution

No. Redis pub/sub does not persist/replay outage messages. Automatic reconnect creates connectivity but does not replay application messages. Stateful reconnect buffers only a bounded transient window between SignalR endpoints and is not durable delivery. Persist domain events or a current snapshot in an application-owned durable store. Give events sequence numbers; when reconnecting, the client presents its last applied cursor and fetches missing events (or a new snapshot). Make processing idempotent and define retention/gap behavior.

## Exercise 9 — Protect an authorization-sensitive hub

A hub has `[Authorize]`, but method `ApproveInvoice(int invoiceId)` loads an invoice and approves it. Is the class attribute sufficient? Where do filters fit?

### Worked solution

The attribute establishes a broad authentication/authorization requirement, but does not prove the current user can approve this invoice. Load the invoice through trusted data access and perform resource authorization for the specific invoice and current state before mutating it. A hub filter can centralize logging or generic validation, but its `HubInvocationContext` arguments are untrusted and filters do not replace resource checks. Avoid logging sensitive invocation arguments.

## Exercise 10 — Size and concurrency controls

An app raises `MaximumReceiveMessageSize` to 20 MB and `MaximumParallelInvocationsPerClient` to 100 to accommodate a slow client. Explain why this can worsen the outage. Propose alternatives.

### Worked solution

Large messages raise per-message parsing and memory costs; high parallelism permits one connection to consume more CPU, database connections, and queued work. These values are not global rate limits. Prefer small messages or streaming with bounded backpressure, validate payload schemas and quotas, limit concurrency to workload needs, use application queues with bounded capacity, and monitor connection/fan-out resources. Large uploads belong in an HTTP/object-storage upload flow, with SignalR carrying progress and completion notifications.

## Exercise 11 — Trace without leaking credentials

The browser uses `accessTokenFactory`, and the reverse proxy logs complete request URLs. Which risk exists for WebSocket/SSE and how should the operational setup change?

### Worked solution

Browser WebSocket and Server-Sent Events limitations can cause SignalR to send the bearer credential in an `access_token` query parameter. Query strings may appear in proxy and diagnostic logs. Use HTTPS, redact that parameter at every logging layer, restrict log access/retention, and never emit raw tokens or full private payloads in hub filters. Configure CORS and WebSocket origin restrictions separately; CORS does not secure the WebSocket upgrade.

## Exercise 12 — Decide whether automatic reconnect is enough

A chat product enables `WithAutomaticReconnect` and promises users they will never miss a message during network switching. Is that promise valid? What layers are needed?

### Worked solution

No. Automatic reconnect is opt-in and establishes a new connection according to its retry policy; it does not replay messages. Stateful reconnect can bridge only bounded short interruptions if both endpoints opt in and buffers suffice. To promise recoverability, persist messages, assign monotonically increasing IDs, authenticate and authorize history fetches, and let clients resume after their last acknowledged ID. Define retention, duplicate handling, and gaps when history has expired.

## Sources

[SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) · [Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) · [Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) · [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

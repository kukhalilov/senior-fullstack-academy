# SignalR transports hubs connection lifetime groups security scaling — Core concepts and how they fit together

## Learning objectives

You should be able to distinguish a hub instance from a connection, choose a transport and protocol, route to a user/connection/group safely, manage streaming/reconnect behavior, enforce per-method authorization, and explain the delivery and scale guarantees of SignalR, Redis backplanes, and managed SignalR services.

## Prerequisites

Know ASP.NET Core endpoint routing, authentication/authorization principals, asynchronous C#, HTTP/WebSocket basics, and distributed-system failure semantics. This lesson treats connection interruption as normal and distinguishes local cancellation from remote completion.

## Core concepts

### Hubs are transient RPC endpoints over a logical connection

A hub method is invoked by a client through a SignalR message; a server can call client methods through generated/string-named proxies. The framework creates a hub instance for invocations and connection callbacks; do not keep durable connection state in hub fields. Use scoped/durable services for application state and `IHubContext<THub>` for sends from controllers, hosted services, or domain-facing components. A strongly typed `Hub<TClient>` catches client method name/signature errors at compile time on the server side but does not validate runtime payloads or authorization.

Hub method arguments are untrusted input. Bind only the arguments needed, validate size and domain rules, authorize the user against the target resource, and avoid sending detailed exception text to clients. An `IHubFilter` can centralize logging/validation/cross-cutting behavior, but it is not a replacement for resource authorization.

### Connection, user, and group are different identifiers

A connection ID identifies one logical connection. A user ID is produced by `IUserIdProvider` and normally defaults to `ClaimTypes.NameIdentifier`. A user can have multiple simultaneous connections (browser tabs/devices), so `Clients.User` targets all matching connections. Groups are dynamic routing sets; group membership can be lost on reconnect and is not automatically revalidated when permissions change. Never accept a client-provided user ID as the authority for `Clients.User` or group membership. [Hub APIs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)

### Transport and protocol are separate layers

The negotiate endpoint selects/allocates a connection and the client/server choose a compatible transport. WebSockets is full-duplex and preferred where supported; Server-Sent Events carries server-to-client messages while client-to-server messages use HTTP; long polling is a compatibility fallback with repeated HTTP requests. Reverse proxies must permit WebSocket upgrades and keep long-lived connections alive. Transport choice does not change Hub Protocol semantics.

The JSON Hub Protocol is broadly interoperable and can serialize .NET 11 C# unions through `System.Text.Json`. MessagePack uses compact binary encoding but needs matching package/configuration and compatible types on both sides. Protocols are not wire-compatible with classic ASP.NET SignalR; current ASP.NET Core clients/server must be used. [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

### Reconnection is not durability

`WithAutomaticReconnect` is opt-in and, by itself, starts a new logical connection after a break; applications should handle `Reconnecting`, `Reconnected`, and `Closed`, rejoin authorized groups, and reconcile missed state. Stateful reconnect (available since .NET 8) is opt-in on both endpoint and client; it temporarily buffers and acknowledges messages and replays within a bounded buffer for short interruptions. Buffer exhaustion or a longer outage ends that guarantee. For durable business events, persist an event/job and let the client query/replay through a durable API or log. [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

### Security follows identity and resource ownership

`[Authorize]` can protect a hub or method, but a broad authenticated policy does not prove the user owns the requested document/order/room. Perform resource authorization inside the method or an appropriate filter/policy using server-trusted data. Authorize group join and leave operations, and remove/revalidate membership when access changes. Browser WebSocket/SSE clients may send bearer tokens in the query string because browser APIs cannot set arbitrary Authorization headers; require HTTPS and prevent query strings from entering logs. CORS and WebSocket origin checks are separate from authentication and authorization. [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)

In ASP.NET Core 11, authentication refresh can update the connection principal if the refreshed principal maps to the same SignalR user. It does not change `UserIdentifier` or reroute the existing connection. A currently executing hub method keeps the principal it began with; later invocations see the refreshed principal. The .NET client can cancel non-streaming calls, but the server must observe the supplied `CancellationToken`; the caller's task may cancel before server work has actually stopped. [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11) [Authentication refresh](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)

### Scale-out changes connection ownership

Without a backplane/service, each app process knows only its own connections. In a server farm, SignalR generally requires session affinity so HTTP requests for a connection reach the owning process. Redis backplane forwards messages between app processes but does not persist/replay messages during an outage; Azure SignalR Service proxies client connections and changes which component holds connection resources. Neither option substitutes for durable business-event storage. [SignalR scale-out](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) [Redis backplane](https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane)

## Mechanisms and relationships

| Concern | Mechanism | Limitation |
|---|---|---|
| Server pushes live updates | Hub client proxies / `IHubContext` | Only connected clients receive the send; no retained event log |
| Direct to a connection | Connection ID routing | ID changes on reconnect and represents one connection |
| Direct to a user | User identifier routing | Can target multiple connections; identifier must be unique and trusted |
| Target a set | Group routing | Membership is transient and not an authorization rule |
| Short-disconnect continuity | Stateful reconnect | Bounded buffers, opt-in, not durable replay |
| Reconnect after break | Automatic reconnect policy | Creates a new logical connection; app must restore subscriptions/state |
| Cross-process routing | Redis backplane or managed service | Backplane outages lose ephemeral forwarding; topology differs by service |
| Slow/long result | Streaming hub method | Requires cancellation/backpressure and bounded stream buffers |

## Worked examples

### Example 1: authorize before joining an order group

An invocation accepts an order ID, loads the order through a scoped service, verifies the authenticated principal can read it, then joins a group named from a canonical server-side identifier. Do not trust a client-supplied group string or assume a user remains authorized indefinitely. If permission is revoked, remove connections from the group or recheck authorization before sensitive sends.

### Example 2: durable event with live notification

Commit the order change and outbox/event record first. A background publisher sends a small SignalR notification containing the event/order sequence ID. If a client was disconnected or the SignalR send failed, the client reconnects and fetches missed events from the durable endpoint. This separates business delivery from best-effort push.

### Example 3: cancellation of a report invocation

A .NET client passes a cancellation token to `InvokeAsync`; the hub declares a `CancellationToken` parameter and passes it into database/HTTP work. The client task cancels when it sends the cancel message, not when the server confirms all effects have stopped. Use an idempotent report operation or explicit operation-status lookup for uncertain outcomes.

## Misconceptions and edge cases

- **“A hub instance lives as long as the connection.”** Hub instances are created for individual invocations/callbacks; store shared state in services.
- **“Group membership grants authorization.”** It only routes messages. Check policy/resource access and revalidate on access changes.
- **“A user has one connection ID.”** One user may have several tabs/devices and connection IDs.
- **“Automatic reconnect resumes the same connection.”** It establishes a new logical connection; connection ID, groups, and server-side state may need restoration.
- **“Stateful reconnect makes SignalR durable.”** It buffers a limited short-disconnect window only.
- **“A successful send means a client persisted the event.”** It does not provide application-level acknowledgement or durable storage.
- **“Redis backplane persists messages.”** It forwards pub/sub traffic between servers and does not replay messages lost during outage.
- **“CORS secures WebSocket connections.”** CORS response-sharing rules and WebSocket origin/authentication controls are separate.
- **“Token refresh can switch the connection to another user.”** The server rejects refresh when identity maps to a different SignalR user.
- **“Cancelling `InvokeAsync` means the hub method stopped.”** Cancellation is cooperative; the client task can cancel first.
- **“Bigger `MaximumReceiveMessageSize` is harmless.”** Every buffered message consumes memory and can increase DoS risk.
- **“Only HTTP negotiation needs proxy routing.”** Long-lived WebSockets, `/refresh` when enabled, and fallback send/poll/delete routes all need appropriate forwarding/timeouts.

## Knowledge checks with answers

1. **Where should persistent hub/business state live?** In durable/scoped services, not transient hub fields.
2. **When use `IHubContext`?** When sending from code outside an active hub invocation.
3. **How does a user differ from a connection?** A user identifier can map to multiple connection IDs.
4. **Why isn't a group a security boundary?** Membership only controls routing; the app must authorize joins and revalidate access.
5. **What does stateful reconnect guarantee?** Bounded temporary buffering/ack/replay for short interruptions, not durable event delivery.
6. **Why can browser tokens appear in query strings?** Browser WebSocket/SSE APIs constrain custom headers; use HTTPS and redacted logs.
7. **What does Redis backplane not do?** Persist/replay messages across its outage.
8. **What happens to `UserIdentifier` on auth refresh?** It remains fixed for that connection; changing routed identity requires reconnect.
9. **Can JS cancel a non-streaming `invoke` the same way as .NET 11?** No; the .NET 11 non-streaming cancellation feature is .NET-client-only.

## Sources

- [Use hubs in ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)
- [ASP.NET Core SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
- [ASP.NET Core SignalR .NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client)
- [ASP.NET Core SignalR JavaScript client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)
- [ASP.NET Core SignalR scale-out](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

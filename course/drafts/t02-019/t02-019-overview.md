# SignalR transports hubs connection lifetime groups security scaling — Big-picture orientation and mental model

## Problem and purpose

Ordinary HTTP request/response is a poor fit when a server must push updates as they happen or both sides need to exchange messages over a long-lived connection. ASP.NET Core SignalR gives an application a logical connection, hub method calls, client callbacks, groups, and several transport choices. It handles protocol framing and connection management, but it does not turn messages into a durable event log or guarantee exactly-once delivery. [SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

## Plain-language mental model

Think of SignalR as a live switchboard. A transport (usually WebSockets when available) carries framed messages. The Hub Protocol describes those messages. A hub exposes server methods and client callbacks; the hub object itself is short-lived, while a logical connection can last much longer. `IHubContext` is the outside switchboard that background services/controllers use to send to clients without creating a hub instance.

SignalR distinguishes a **connection ID**, an authenticated **user ID**, and a **group**. A user may have multiple connections; a group is a routing list, not an access-control rule. A server must authorize every operation and every group join against trusted identity/resource data. Automatic reconnect establishes a new connection; stateful reconnect can buffer and replay within bounded short-disconnect limits. Neither is durable delivery.

## How the parts fit together

| Part | Responsibility | Main design question |
|---|---|---|
| Transport | Moves bytes using WebSockets, SSE, or long polling | What can browsers, proxies, and firewalls support? |
| Hub Protocol | Frames invocations, completions, and stream items | Do server/client packages agree on protocol and serialization? |
| Hub | Maps client invocations to server methods and sends callbacks | Is the method authorized and safe to invoke concurrently? |
| `IHubContext` | Sends from code outside a hub invocation | Which connection/user/group is the intended recipient? |
| User identity | Routes to a stable authenticated user | Is the identifier unique and trusted? |
| Group | Routes to a dynamic set of connections | Who is allowed to join, and when is membership revoked? |
| Reconnect | Restores client connectivity after a break | Is a new connection sufficient, or is bounded replay useful? |
| Backplane/managed service | Shares messages or manages client connections across nodes | Which component owns affinity, connection scale, and outage behavior? |

In .NET 11, SignalR adds authentication refresh for eligible connections without reconnecting, cancellation of non-streaming invocations from the .NET client, and C# union serialization through the JSON Hub Protocol. These features have important boundaries: refresh cannot change the connection's routed user; invocation cancellation is cooperative and only supported from the .NET client; union support depends on JSON serialization and does not imply MessagePack support. [ASP.NET Core 11 changes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## Concept map

```text
authenticated client ─ negotiate ─ choose transport ─ Hub Protocol messages
        │                                      │
        ├── invoke server hub method           ├── server -> client callback
        ├── stream values                      ├── user/connection/group routing
        └── reconnect/refresh                  └── server filters + authorization
                                                  │
                          local process ─ backplane or managed SignalR service ─ clients
                          (not durable by itself; persistence/acks are app concerns)
```

## End-to-end walkthrough

Suppose a user watches a live order dashboard.

1. The client authenticates and negotiates the SignalR connection. It chooses WebSockets when available or a supported fallback transport/protocol.
2. The server establishes a connection ID and user identifier from trusted claims. The application authorizes the user against the order resource before adding the connection to an order-specific group.
3. An order service changes persisted state, commits it, then uses injected `IHubContext` to broadcast a lightweight update. SignalR sends to currently connected group members; it does not persist the notification.
4. If the client drops briefly, automatic reconnect may create a new connection that must rejoin authorized groups. Opt-in stateful reconnect can replay bounded buffered data for a brief interruption, but a prolonged outage still needs application resynchronization from the order API/event store.
5. At scale, every process has only its local connection state. Use required session affinity plus a Redis backplane, or use Azure SignalR Service which proxies client connections and changes the affinity/topology model.
6. If the update must never be missed, treat SignalR as a notification channel. Persist the order/event and let the client fetch/replay from a durable API or event stream.

## When to use it and tradeoffs

- Use SignalR for interactive updates, collaborative features, live status, and server-initiated notifications where currently connected clients matter.
- Prefer WebSockets for full-duplex low-latency traffic when the deployment path supports upgrades; retain fallback transports only when required.
- Use groups as convenient routing after authorization, never as the authorization decision itself.
- Bound incoming message sizes, parallel invocations, stream buffers, and connection counts. Raising limits increases memory and denial-of-service exposure.
- Use a backplane or managed service when scaling across processes; neither creates application-level durable delivery guarantees.
- Persist important state/events elsewhere and use SignalR to reduce notification latency.

## What later lessons cover

The concepts lesson explains hub invocation, identity, transient hub lifetime, transport negotiation, reconnect, security, scale-out, and delivery semantics. References cover Hub/client/group APIs; transports/protocol/streaming/reconnect; authentication and invocation limits; .NET 11 refresh/cancellation changes; and scale-out/observability. Practice analyzes authorization, reconnection, dropped messages, and cluster topology. Interview lessons focus on durability, identity, transports, security, and deployment tradeoffs.

## Sources

- [Use hubs in ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)
- [ASP.NET Core SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
- [ASP.NET Core SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)
- [ASP.NET Core SignalR hosting and scaling](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

# SignalR transports hubs connection lifetime groups security scaling — Reference: server affinity backplanes cloud scale and operational telemetry

## Scope and version

A SignalR connection is held by a server process unless a managed service owns the client connection. When a later HTTP request or transport poll lands on another node, that node may not know the connection's state. A deployment therefore needs **session affinity** (sticky sessions) in most multi-server configurations. The primary exceptions documented by ASP.NET Core are Azure SignalR Service, and WebSockets-only deployments that disable negotiation with `SkipNegotiation` and use a topology where the client connects directly to one server. The latter sacrifices transport fallback and is not a generic load-balancer workaround. [Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) [Redis backplane](https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane)

## How this group fits the mental model

First decide who owns each client socket. Self-hosted nodes own their own connections; Azure SignalR Service proxies/manages client connections. Then decide how requests reach that owner and how messages cross nodes. Affinity addresses connection ownership; a Redis backplane addresses cross-node live forwarding. Durable recovery is a separate application responsibility.

Affinity and a backplane solve different problems. Affinity keeps a client's requests associated with the process that owns its connection. A backplane forwards messages between server processes so a send from node A can reach a client connected to node B. A Redis backplane does not by itself make every transport request stateless or remove affinity requirements.

## Redis backplane

Install `Microsoft.AspNetCore.SignalR.StackExchangeRedis` and register it with `AddStackExchangeRedis` as part of SignalR service configuration. A channel prefix separates applications or environments sharing Redis. The backplane uses Redis pub/sub to forward SignalR messages among app servers; it is message forwarding, not a durable queue, database, or replay log. If Redis is unavailable, cross-node fan-out is disrupted. Messages published during an outage are not persisted for later replay. Choose Redis location and network latency carefully; a distant backplane can add latency to every cross-node send.

Use TLS and credentials, isolate the Redis instance or key/channel namespace, and limit connectivity to app servers. Size Redis, app servers, client connections, and outbound fan-out together. A backplane distributes delivery to connected clients; it does not coordinate application state, make groups durable, or guarantee that disconnected clients receive missed updates. If clients must recover missed state, persist domain events or snapshots in an application-owned durable store and let reconnecting clients resume from a version/cursor.

## Azure SignalR Service

Azure SignalR Service is a managed scale-out option that proxies and manages client connections so app servers can focus on hub logic. ASP.NET Core applications connect to the service, and the service handles client-facing connections and distributes messages. Its connection and routing model means server affinity to a specific app instance is not required in the same way as self-hosted multi-node SignalR. It remains an external dependency with service limits, network paths, configuration, and availability considerations; choose the correct service mode and deployment topology from current Azure guidance.

Redis backplane and Azure SignalR Service are alternatives with different ownership and operations, not interchangeable switches. Redis leaves client sockets on app servers and forwards messages; Azure SignalR Service owns/proxies client connections. Compare cost, operations, latency, connectivity, and failure mode. Neither supplies a domain event store or exactly-once semantics.

## Reverse proxies, affinity, and transports

Configure the load balancer or reverse proxy for WebSocket upgrades, long-lived connection timeouts, forwarded headers, and affinity cookies/headers as required by the hosting platform. Ensure HTTP negotiate and follow-up transport requests reach the correct node. A WebSockets-only `SkipNegotiation` design works only when WebSockets are available and the client can connect directly to the selected server; it removes fallback and must be reviewed with authentication, proxy, and deployment constraints. Test failover rather than assuming a healthy WebSocket is migrated to another node.

## Observability and capacity

SignalR exposes built-in metrics through the `Microsoft.AspNetCore.Http.Connections` meter. In ASP.NET Core 11, `signalr.server.active_connections` is an `UpDownCounter` of active connections, and `signalr.server.connection.duration` is a `Histogram`; both carry `signalr.transport`, with closure status also on the duration metric. Register the meter with the metrics/OpenTelemetry pipeline to collect it. General HTTP request metrics are separate hosting instruments; they do not measure every SignalR hub invocation or application message. Track app-level invocation/message volume and outcomes explicitly where needed. Correlate these with failed handshakes, reconnects, send failures, backplane latency/errors, CPU, memory, socket/file-descriptor usage, network egress, Redis metrics, and managed-service telemetry. Do not log tokens, full private payloads, or unredacted query strings.

Signals should lead to an operational response: sudden active-connection drops can indicate proxy timeout or service interruption; rising reconnects may point to network instability; increased per-connection send volume can expose fan-out amplification; Redis publish failures can make cross-node messages disappear while local sends still succeed. Alert on error rate and user-visible impact, not only raw connection count. Load-test realistic transport mix, payload sizes, group fan-out, reconnect storms, and node drains.

Stateful reconnect can preserve a bounded short-disconnect window using acknowledgements and finite buffers when enabled at both endpoint and client. It can smooth transient breaks but does not promise durable delivery, survive arbitrary server loss, or replace application persistence. Automatic reconnect, stateful reconnect, affinity, backplanes, and durable event recovery are separate mechanisms.

## Cross-item comparison

Sticky sessions preserve connection ownership, whereas a backplane forwards live messages between owners. Azure SignalR Service changes the ownership model by moving client-facing connections to a managed service. Stateful reconnect buffers a limited transient window; none of these mechanisms stores domain events for later replay. Choose the smallest combination that matches the hosting topology, then add durable application storage only when the product promises recovery.

## Examples

For two self-hosted nodes, configure load-balancer affinity, allow WebSocket upgrades, set appropriate idle timeouts, and register a Redis backplane so a send from either node can reach users connected to the other. Set a channel prefix if environments share Redis. During a Redis outage, cross-node sends are not replayed; have clients fetch durable events from the application's store after reconnect.

For Azure SignalR Service, configure the app server connection to the service and route clients through the service. Review its current capacity, network, and failover settings. Do not also assume the self-hosted sticky-session design applies unchanged.

## Common mistakes

- Adding Redis and assuming it makes every HTTP request stateless or removes session affinity.
- Treating Redis pub/sub as a persistent queue that replays during outages.
- Using WebSockets-only `SkipNegotiation` when proxy clients need fallback transports.
- Assuming a live connection automatically migrates when its owning process fails.
- Treating stateful reconnect as a durable delivery or server-loss recovery mechanism.
- Measuring only active connections while ignoring reconnect rates, fan-out, backplane health, and socket/memory saturation.
- Logging tokens or private message bodies while investigating transport failures.

## Knowledge checks with answers

1. **What does affinity solve?** It keeps requests associated with the node owning a self-hosted connection.
2. **What does Redis solve?** It forwards live SignalR sends between app-server nodes; it does not persist missed messages.
3. **What restores messages missed during an outage?** An application-owned durable event/history store with a cursor or snapshot protocol.

## Supplied names explained

| Supplied name or concept | Explanation |
|---|---|
| Sticky sessions and session affinity | Routes a client's requests to the server that owns its connection state. |
| Sticky sessions are not required with Azure SignalR Service | The managed service owns/proxies the client connection and handles routing. |
| Sticky sessions exception for WebSockets-only with SkipNegotiation | A constrained direct-WebSocket topology; no transport fallback. |
| Redis backplane package Microsoft.AspNetCore.SignalR.StackExchangeRedis | Package integrating the Redis backplane. |
| AddStackExchangeRedis | Registers the Redis message-forwarding backplane. |
| Redis backplane channel prefix | Namespaces pub/sub channels across apps/environments. |
| Redis backplane pub/sub message forwarding | Distributes sends across app-server nodes. |
| Redis backplane does not persist or replay messages during outage | Pub/sub is not a durable event log. |
| Azure SignalR Service scale-out and client connection proxy | Managed service handles client-facing connections and distribution. |
| Redis backplane versus Azure SignalR Service | Self-hosted sockets plus forwarding versus managed/proxied client connections. |
| SignalR scale-out with sticky sessions and Redis backplane | Affinity and cross-node message forwarding address separate needs. |
| SignalR server affinity and reverse-proxy configuration | Aligns negotiation, transport, upgrades, timeouts, and node ownership. |
| SignalR built-in active connection and request metrics | Operational signals for load, connection health, and transport activity. |
| `Microsoft.AspNetCore.Http.Connections` meter | Built-in SignalR HTTP-connection metrics meter; register this meter with the metrics pipeline to collect its instruments. |
| `signalr.server.active_connections` | ASP.NET Core 11 UpDownCounter for active SignalR connections, tagged with transport and connection status dimensions. |
| `signalr.server.connection.duration` | ASP.NET Core 11 Histogram for SignalR connection duration, with transport and closure-status dimensions. |
| HTTP request metrics versus SignalR hub invocation metrics | Hosting request metrics do not count every invocation/message on a long-lived WebSocket. Add application instrumentation for hub method volume and outcomes. |
| Microsoft.AspNetCore.Http.Connections meter for SignalR metrics | The meter contains the built-in SignalR connection instruments; add its exact name to the collector's meter list. |
| signalr.server.active_connections UpDownCounter | Measures the current number of active SignalR connections. |
| signalr.server.connection.duration Histogram | Records SignalR connection duration. |
| SignalR built-in metric transport and connection status dimensions | The metrics identify the transport, and the duration/active-connection instruments include connection closure status. |
| HTTP request metrics do not count every SignalR hub invocation or message | HTTP hosting counters and histograms describe HTTP requests; instrument hub method calls/application messages separately. |
| SignalR connection and message tracing | Correlates SignalR behavior with distributed diagnostics while avoiding private payloads. |
| SignalR stateful reconnect does not provide durable message delivery | Bounded transient buffer/ack behavior cannot replace persistence. |

## Sources

[Scale SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale) · [Redis backplane](https://learn.microsoft.com/en-us/aspnet/core/signalr/redis-backplane) · [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) · [ASP.NET Core built-in HTTP metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/http?view=aspnetcore-11.0) · [ASP.NET Core metrics](https://learn.microsoft.com/en-us/aspnet/core/metrics/overview?view=aspnetcore-11.0)

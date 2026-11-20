# SignalR transports hubs connection lifetime groups security scaling — Reference: web transport negotiation protocols hub streaming and reconnection behavior

## Scope and version

This reference covers the supplied server and client transport, protocol, connection, streaming, and reconnect surface. Defaults can change with the ASP.NET Core/client package version, so treat numeric defaults as versioned configuration. The version-specific notes focus on stateful reconnect (.NET 8+) and .NET 11 cancellation/JSON union support. [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) [.NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client) [.NET 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)

## How this group fits the mental model

Negotiation establishes a logical connection and transport choice. The transport moves bytes; a Hub Protocol frames calls, completions, and streams. Client and server package versions must agree on features. Reconnect behavior is a policy layered on a connection: ordinary automatic reconnect creates a new logical connection; stateful reconnect can buffer/ack/replay within finite memory limits. Neither is an event store.

## Supplied names explained

### Negotiation, transports, and wire protocols

| Supplied name | Meaning and use |
|---|---|
| `SignalR negotiate endpoint` | HTTP endpoint that exchanges connection/transport information before transport establishment in the normal flow. Proxies and auth policies must allow it. |
| `HttpTransportType.WebSockets` | Full-duplex transport with lowest overhead when browser, server, proxy, and network permit upgrade. |
| `HttpTransportType.ServerSentEvents` | HTTP streaming transport for server-to-client messages; client-to-server calls use separate HTTP requests. |
| `HttpTransportType.LongPolling` | Compatibility transport that repeatedly requests data over HTTP; more request overhead/latency than a persistent WebSocket. |
| `HttpTransportType.None` | Zero transport flags; useful when representing no enabled transport, not a usable connection choice by itself. |
| `HttpTransportType.All` | Combined flag enabling the supported transports. Clients can negotiate/fallback among enabled options. |
| `HttpTransportType enum flags` | Transport values are combinable flags; use bitwise composition when restricting or enabling multiple transports. |
| `WebSockets transport` | Bidirectional persistent connection. Reverse proxies must forward the upgrade and support long-lived connections. |
| `Server-Sent Events transport` | Server-push stream with one-way transport semantics and separate client requests. Browser credential/header constraints still apply. |
| `Long Polling transport` | Repeated HTTP wait/read cycle that works through more restrictive networks but consumes more request/connection overhead. |
| `WebSocket versus HTTP transport proxy and firewall constraints` | WebSockets need upgrade support; SSE/long polling need appropriate streaming/poll routes and proxy timeout/buffering behavior. Test the actual deployment chain. |
| `WebSocket upgrade and reverse-proxy forwarding requirements` | The proxy must pass upgrade/connection headers and maintain the upstream socket; an HTTP 101 response and long-lived duplex path are required. |
| `SignalR JSON Hub Protocol` | Text protocol commonly used by .NET and JavaScript clients. Serialization types/options must align; ASP.NET Core 11 adds C# union support through `System.Text.Json`. |
| `SignalR MessagePack Hub Protocol` | Binary protocol requiring MessagePack integration/configuration on both sides. JSON-specific serialization behavior does not transfer automatically. |
| `IHubProtocol` | Server protocol abstraction used to parse/serialize SignalR messages; normally the framework chooses a configured protocol during handshake. |
| `AddJsonProtocol` | Configures JSON Hub Protocol serialization options on the server. Keep naming/converter behavior compatible with clients. |
| `AddMessagePackProtocol package integration` | Adds/configures MessagePack Hub Protocol through its package integration. Clients must also support/use the same protocol. |

### Server hub limits and connection state

| Supplied name | Meaning and use |
|---|---|
| `HubOptions.SupportedProtocols` | Collection of protocol names accepted by a hub. Removing one protocol can reduce attack/surface/compatibility options for that endpoint. |
| `HubOptions.MaximumReceiveMessageSize` | Maximum single incoming hub message size; increasing it raises per-connection memory/DoS exposure. Prefer uploading large files over HTTP/blob storage. |
| `HubOptions.StreamBufferCapacity` | Maximum buffered client-upload stream items before processing applies backpressure. Tune with item size and processing rate. |
| `HubOptions.HandshakeTimeout` | Maximum time allowed for the client to send its initial protocol handshake before the connection is closed. |
| `HubOptions.KeepAliveInterval` | Server ping interval when there has been no outgoing traffic. Coordinate client server-timeout to be comfortably larger (commonly at least twice the interval). |
| `HubOptions.ClientTimeoutInterval` | Server inactivity threshold for receiving client messages/keep-alives before considering it disconnected. Coordinate with keep-alive and network delays. |
| `HubOptions.EnableDetailedErrors` | When enabled, includes detailed hub exception information in client errors. Leave off in production unless disclosure is explicitly safe. |
| `HubOptions.MaximumParallelInvocationsPerClient` | Limits concurrent non-streaming hub method invocations per connection before queueing. It does not apply to streaming calls; enforce stream concurrency separately. |
| `HubOptions.DisableImplicitFromServicesParameters` | Controls implicit DI binding of hub method parameters that match services. Explicitly mark/shape parameters when client arguments could otherwise be confused with DI services. |
| `HubOptions.StatefulReconnectBufferSize` | Server-side bytes buffered per connection for stateful reconnect. It has no effect unless endpoint stateful reconnect is enabled; memory scales with connected clients. |
| `HubConnectionState` | Client-side lifecycle state enum. Use it for UI/operation decisions, not as a durable server session record. |
| `HubConnectionState.Disconnected` | Client has no active connection. A later `StartAsync` or reconnect policy may establish one. |
| `HubConnectionState.Connecting` | Client is attempting to establish a connection/handshake. |
| `HubConnectionState.Connected` | Client has an established logical connection. This does not prove application data was persisted. |
| `HubConnectionState.Reconnecting` | Client is attempting recovery after an established connection was lost. |

### .NET client lifecycle and calls

| Supplied name | Meaning and use |
|---|---|
| `HubConnection.StartAsync` | Starts the logical connection; cancellation bounds client startup. Automatic reconnect does not automatically retry an initial failed start. |
| `HubConnection.StopAsync` | Stops the connection and triggers normal close behavior. |
| `HubConnection.DisposeAsync` | Asynchronously releases connection/client resources. Use `await using` when its lifecycle is bounded. |
| `HubConnectionExtensions.On<T> event handler registration` | Registers a named server-to-client callback accepting one typed payload; dispose the returned subscription when no longer needed. |
| `HubConnectionExtensions.On<T1,T2> event handler registration` | Registers a callback with two typed payload values; the name and argument shape must match server sends. |
| `HubConnection.Remove handler registration` | Removes registrations for a client method name. Disposing the returned registration handle is usually more targeted. |
| `HubConnectionExtensions.InvokeAsync<T> request-response call` | Invokes a server hub method and awaits its result/completion. In .NET 11, a cancellation token can send a server invocation-cancel message; cancellation remains cooperative. |
| `HubConnectionExtensions.SendAsync one-way call` | Sends a hub invocation without waiting for its server method result. It cannot cancel server execution through the same tracked-invocation mechanism. |
| `HubConnectionExtensions.StreamAsync<T>` | Calls a server streaming hub method and exposes items as an async stream. Consume with cancellation and dispose/complete enumeration. |
| `HubConnectionExtensions.StreamAsChannelAsync<T>` | Exposes a server stream through `ChannelReader<T>`; read until completion/cancellation and observe errors. |
| `HubConnection.Closed event` | Notifies when the connection is closed. Use it to update UI/worker state and decide whether to restart. |
| `HubConnection.Reconnecting event` | Notifies that automatic reconnect is underway; pause interactions or show degraded state. |
| `HubConnection.Reconnected event` | Notifies successful reconnection. Reconcile application state/groups as required; stateful reconnect may preserve a short window but does not replace durable sync. |
| `HubConnectionBuilder` | Builder for a .NET SignalR client connection and its transport/options/services. |
| `HubConnectionBuilderExtensions.WithUrl` | Sets hub URL and HTTP connection options, including transport and access token provider. |
| `HubConnectionBuilderExtensions.WithAutomaticReconnect` | Enables opt-in reconnect after an established connection is lost using the default policy. It does not retry initial `StartAsync` failure by itself. |
| `HubConnectionBuilderExtensions.WithAutomaticReconnect(IRetryPolicy)` | Enables reconnect with a supplied retry delay policy. Return `null` to stop reconnect attempts according to the policy contract. |
| `IRetryPolicy.NextRetryDelay` | Selects the next reconnect delay based on retry context; include a finite stopping policy or deliberate indefinite-retry behavior. |
| `HubConnectionBuilderExtensions.WithStatefulReconnect` | Opts the .NET client into stateful reconnect. The server endpoint must also allow it. |
| `HubConnectionBuilder.Build` | Creates the configured `HubConnection`; it does not connect until `StartAsync` runs. |
| `HttpConnectionOptions.Transports` | Client-side allowed transports. It must overlap with server/proxy-supported transports. |
| `HttpConnectionOptions.SkipNegotiation` | Skips the negotiate request only when using WebSockets as the only transport, and is not supported with Azure SignalR Service. It can also affect affinity requirements. |
| `HttpConnectionOptions.AccessTokenProvider` | Async provider for bearer tokens used by .NET client HTTP requests. Return the current token and protect token storage/logging. |
| `HttpConnectionOptions.UseStatefulReconnect` | Enables stateful reconnect on the .NET client; coordinate with endpoint opt-in and buffer configuration. |
| `HubConnectionOptions.StatefulReconnectBufferSize` | Client-side buffer size for stateful reconnect; bounded memory, independent from server-side buffer setting. |

### Streaming and reconnection semantics

| Supplied name | Meaning and use |
|---|---|
| `IAsyncEnumerable<T> hub server-to-client streaming` | Hub method returns an async sequence that the client consumes. Observe cancellation and release enumerators/resources. |
| `ChannelReader<T> hub server-to-client streaming` | Hub method writes items into a channel for streaming to the client. Complete/fault the writer so the client sees stream termination. |
| `IAsyncEnumerable<T> hub client-to-server streaming` | Client uploads values as an async sequence to a hub method. Server processing/backpressure determines producer progress. |
| `ChannelReader<T> hub client-to-server streaming` | Hub method receives client items through a channel reader; process asynchronously and handle completion/cancellation. |
| `CancellationToken in streaming hub methods` | Streaming hub methods can observe cancellation when client/server stops the stream or the connection ends. Pass it to underlying work. |
| `HubConnection.StreamAsync cancellation` | Cancellation stops the client-side streaming invocation and signals cancellation through supported server streaming semantics. |
| `StreamItem and Completion hub protocol messages` | Protocol frames carrying a stream value and ending/completing a stream (possibly with an error). They are protocol-level messages, not business acknowledgements. |
| `Backpressure in streaming hub methods` | Stream buffers and consumer speed constrain producer throughput. Avoid unbounded internal buffers and make cancellation responsive. |
| `Stateful reconnect ACK and bounded message buffers` | Server and client acknowledge received messages and retain a finite resend window for temporary disconnects. Buffer exhaustion loses seamless recovery. |
| `Stateful reconnect requires opt-in on server endpoint and client` | Configure server `AllowStatefulReconnects` and the client stateful reconnect option; enabling only one side is insufficient. |
| `Stateful reconnect versus automatic reconnect` | Stateful reconnect attempts bounded continuity of a logical connection; automatic reconnect creates a new connection and requires app-level reinitialization/reconciliation. |
| `SignalR connection lifetime is separate from HTTP request lifetime` | A WebSocket/SignalR connection can outlive the negotiate request. Do not attach request-scoped resources to it without explicit lifetime handling. |
| `SignalR client cancellation of non-streaming hub invocations in ASP.NET Core 11` | .NET 11 lets the .NET client send cancellation for a tracked `InvokeAsync` call. Older servers only cancelled the local wait. |
| `HubConnectionExtensions.InvokeAsync CancellationToken client cancellation` | Pass the cancellation token as the final invocation argument to cancel a non-streaming call. The server method must expose its own token parameter. |
| `CancellationToken parameter on non-streaming hub method for client cancellation` | SignalR supplies this special parameter; the client must not send it as a serialized business argument. The method must pass it into cancellable work. |
| `Client invocation task cancels before server method finishes` | The .NET caller task cancels when it sends the cancellation message; server cancellation is cooperative and may finish later. |
| `Non-streaming hub invocation cancellation supported by .NET client only` | JavaScript/Java/Swift clients' ordinary invoke methods do not accept a cancellation token for this .NET 11 feature; streaming cancellation is separate. |
| `SignalR cancellation differs from SendAsync one-way call` | `InvokeAsync` tracks an invocation ID and can send a cancellation message; `SendAsync` does not await the hub method and has no tracked result to cancel. |
| `C# union types supported by SignalR JSON Hub Protocol in ASP.NET Core 11` | C# unions participate in JSON Hub Protocol serialization through `System.Text.Json`; this does not imply MessagePack support. |
| `JsonUnionAttribute` and `JsonUnionTypeStructuralClassifier` | .NET 11 `System.Text.Json` tools for disambiguating union cases that could serialize to the same JSON shape. The classifier is relevant when a SignalR hub uses C# unions with the JSON protocol; it does not add union support to MessagePack. |
| `JsonUnionAttribute.TypeClassifier` | Selects a union-case classifier for one C# union type; use it when default token-based classification cannot distinguish cases. |
| `JSON union classifier for ambiguous SignalR union cases` | A classifier resolves deserialization where multiple union cases have the same JSON shape. `JsonUnionTypeStructuralClassifier` uses object structure; validate that its selected case matches your wire contract. |

## Cross-item comparison

| Feature | Automatic reconnect | Stateful reconnect |
|---|---|---|
| Connection behavior | Re-establishes after interruption | Resumes within acknowledged/buffered short-disconnect window |
| Data recovery | App must resync/rejoin | Replays bounded buffered messages if continuity fits buffers |
| Server/client opt-in | Client policy | Both endpoint and client opt in |
| Durable guarantee | None | None |

WebSockets is preferred for full-duplex messaging when supported. SSE and long polling broaden compatibility with different directionality/overhead. JSON is easier to inspect/interoperate; MessagePack can reduce payload overhead but requires matching serializer support.

## Examples

### Enable stateful reconnect on both sides

```csharp
app.MapHub<ChatHub>("/chat", options => options.AllowStatefulReconnects = true);

var connection = new HubConnectionBuilder()
    .WithUrl("https://example.com/chat")
    .WithStatefulReconnect()
    .Build();
```

This enables bounded reconnect buffers; it does not replace durable history or application-level recovery after a longer outage. [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

### Cancel a non-streaming .NET invocation

```csharp
public Task<Report> GenerateReport(int reportId, CancellationToken cancellationToken) =>
    reportService.GenerateAsync(reportId, cancellationToken);

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));
var report = await connection.InvokeAsync<Report>("GenerateReport", reportId, cts.Token);
```

The server receives cancellation only if it observes the token; the client task may cancel before the server method stops. This feature is available for the .NET client against an ASP.NET Core 11+ server. [SignalR .NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client)

## Common mistakes

- Assuming negotiation success means WebSocket upgrade will pass the reverse proxy.
- Setting client timeout below the server keep-alive interval and causing false disconnects.
- Increasing message-size and stream buffers without modeling concurrent memory use.
- Treating `SkipNegotiation` as safe with fallback transports or Azure SignalR Service.
- Assuming `WithAutomaticReconnect` retries initial start failures.
- Enabling stateful reconnect on only one side.
- Treating server/client reconnect buffers as durable application history.
- Assuming .NET 11 non-streaming invocation cancellation works from JavaScript clients.
- Expecting cancellation to wait until server-side work has stopped.
- Using `SendAsync` when a tracked response/cancellation contract is required.

## Knowledge checks with answers

1. **What differs between transport and Hub Protocol?** Transport moves bytes; the Hub Protocol frames typed SignalR messages over it.
2. **Which transport is full duplex?** WebSockets; SSE is server-to-client with separate HTTP requests for client calls.
3. **Does stateful reconnect survive a week-long outage?** No; it is a bounded short-interruption buffer/replay mechanism.
4. **Does automatic reconnect retry failed initial `StartAsync`?** No; startup retry must be handled separately.
5. **What must be true for .NET 11 invocation cancellation?** The .NET client passes a token, the server is ASP.NET Core 11+, and the hub method observes its supplied token.
6. **Does a canceled client task prove server completion?** No; the server may still be cooperatively stopping.
7. **Does C# union support imply MessagePack support?** No, the stated .NET 11 support is through the JSON Hub Protocol/System.Text.Json.

## Sources

- [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
- [SignalR .NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client)
- [SignalR JavaScript client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11)
- [System.Text.Json union serialization](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/union-types)
- [JsonUnionAttribute API](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.serialization.jsonunionattribute?view=net-11.0-pp)
- [JsonUnionTypeStructuralClassifier API](https://learn.microsoft.com/en-us/dotnet/api/system.text.json.serialization.jsonuniontypestructuralclassifier?view=net-11.0-pp)

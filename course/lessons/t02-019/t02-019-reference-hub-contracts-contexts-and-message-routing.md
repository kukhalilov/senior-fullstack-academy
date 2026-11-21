# SignalR transports hubs connection lifetime groups security scaling — Reference: Hub Hub<T> invocation context client proxies groups and user routing

## Scope and version

This reference covers the supplied ASP.NET Core SignalR hub, context, client-proxy, group, user-routing, filter, and endpoint registration names. The hub instance is transient per invocation; connection state has a longer lifetime and belongs in connection-scoped storage or application services. The server API is distinct from classic ASP.NET SignalR. [Use hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs) [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)

## How this group fits the mental model

The hub is the application-facing RPC layer over SignalR's logical connection. `Context` identifies the current connection and principal; `Clients` selects recipients; `Groups` changes routing membership. Server-side code outside a hub call uses `IHubContext`, not a manually constructed hub. A user may own several connections, and a group is only a route set—not a permission check.

## Supplied names explained

### Hub instances and invocation context

| Supplied name | Meaning and use |
|---|---|
| `Hub` | Base class for server-side hub methods and connection callbacks. Keep methods stateless across invocations. |
| `Hub<TClient>` | Strongly typed hub whose client contract `TClient` provides compile-time client method calls. It does not add runtime authorization. |
| `Hub.Clients` | Proxy selector for connected clients targeted by the current invocation. |
| `Hub.Context` | Current connection context: connection ID, user, cancellation, and connection-scoped items/features. |
| `Hub.Groups` | Manager for adding/removing the current or another connection from groups. Authorize membership changes separately. |
| `Hub.OnConnectedAsync` | Server callback after a new connection is established. Use for bounded setup; any user/group action must be authorized. |
| `Hub.OnDisconnectedAsync` | Callback when a connection ends, optionally with an exception. It is best-effort cleanup, not a durable workflow hook. |
| `HubException` | Deliberate hub exception whose message can be sent to the client. Do not put secrets or internal diagnostics in it. |
| `HubCallerContext` | Abstraction for the current hub connection and its caller. |
| `HubCallerContext.ConnectionId` | Identifier for one logical connection; it can change after reconnect. Avoid treating it as a durable user key. |
| `HubCallerContext.User` | Authenticated `ClaimsPrincipal` associated with this connection. Treat claims as the server's authentication result, then authorize the requested resource. |
| `HubCallerContext.UserIdentifier` | SignalR routing identifier supplied by `IUserIdProvider`; default comes from `NameIdentifier`. |
| `HubCallerContext.Items` | Key/value state associated with the connection across hub invocations. It is process/connection-scoped, not durable or distributed. |
| `HubCallerContext.Features` | Connection feature collection for framework/integration capabilities; most application code does not need to inspect it. |
| `HubCallerContext.ConnectionAborted` | Cancellation token signaled when the connection is aborted. Propagate it to connection-bound operations. |
| `HubCallerContext.Abort` | Aborts the current connection. Use for an explicit protocol/security decision, not as normal business validation. |
| `Hub method parameter binding and JSON serialization` | Hub arguments are serialized/deserialized according to the negotiated Hub Protocol. Validate untrusted values and keep protocol/client contract versions compatible. |
| `Hub method overload and naming constraints` | Hub method targets are resolved by name in the protocol; overloading a hub method name is unsupported. Use distinct method names or an explicit contract rather than relying on C# overload resolution. |
| `Hub method overloads are not supported in ASP.NET Core SignalR` | The Hub Protocol target is a method name, not a CLR signature; two hub methods cannot safely expose the same invocation name. |
| `HubMethodNameAttribute` | Maps a public hub method to a client-facing invocation name when the CLR method name should differ. |
| `HubMethodNameAttribute.Name` | The explicit SignalR method name clients invoke; keep it stable when evolving client/server contracts. |
| `Hub instances are transient and created per hub invocation` | SignalR creates hub instances for operations; fields do not persist across calls or represent one connection's durable state. |
| `HubException error propagation and detailed error policy` | A deliberate `HubException` can return a controlled error; detailed unhandled exceptions are disabled by default because they can disclose sensitive server information. |

### Recipients, proxies, and results

| Supplied name | Meaning and use |
|---|---|
| `IHubClients` | Non-generic target selector for client proxies. |
| `IHubClients<TClient>` | Strongly typed selector returning proxies implementing `TClient`. |
| `HubClientsExtensions.All` | Targets every connection connected to this hub server/service scope. |
| `HubClientsExtensions.Caller` | Targets the connection that invoked the current hub method. |
| `HubClientsExtensions.Others` | Targets all connections except the current caller. |
| `HubClientsExtensions.AllExcept` | Targets all connections except a supplied set of connection IDs. Treat IDs as routing data, not authorization. |
| `HubClientsExtensions.Client` | Targets one connection ID. The connection may disconnect before delivery. |
| `HubClientsExtensions.Clients` | Targets a supplied collection of connection IDs. |
| `HubClientsExtensions.Group` | Targets current members of one group. Membership is transient routing state. |
| `HubClientsExtensions.Groups` | Targets members of several groups. Review overlap/duplicate semantics and avoid sending sensitive data to overly broad groups. |
| `HubClientsExtensions.OthersInGroup` | Targets members of one group except the invoking connection. |
| `HubClientsExtensions.User` | Targets all connections associated with a user identifier; users can have multiple connections. |
| `HubClientsExtensions.Users` | Targets connections for a supplied set of user identifiers. Ensure IDs come from trusted application data. |
| `IClientProxy.SendCoreAsync` | Low-level send of a client method name, argument array, and cancellation token. Prefer typed proxies or convenience extensions when possible. |
| `ClientProxyExtensions.SendAsync` | Convenience API to send a named client method with arguments. Completion means the send was processed locally, not that a client durably handled it. |
| `ISingleClientProxy.InvokeCoreAsync<T>` | Invokes a client method expecting a result from one client. Client-result calls can wait/timeout and should not be used as durable workflow coordination. |
| `ClientProxyExtensions.InvokeAsync<T> client results` | Convenience form of a client result invocation. Bound the wait and handle client disconnect/timeout. |
| `SendAsync fire-and-forget client invocation` | Server sends without awaiting an application-level client result. It is not an acknowledgement that the UI persisted or acted on the message. |
| `Client result invocation and client timeout behavior` | The server waits for a client result and can fail/timed-out if that client disconnects or does not respond; keep this out of critical durable workflows. |

### Groups, contexts, and user identity

| Supplied name | Meaning and use |
|---|---|
| `IGroupManager.AddToGroupAsync` | Adds a connection ID to a group asynchronously. Authorize the resource before calling it. |
| `IGroupManager.RemoveFromGroupAsync` | Removes a connection from a group. Use when access is revoked or a user leaves the resource. |
| `IHubContext<THub>` | DI service for sending to a hub's clients from outside hub invocations. |
| `IHubContext<THub>.Clients` | Client-target selector exposed by the outside-hub context. |
| `IHubContext<THub>.Groups` | Group manager exposed by the outside-hub context. |
| `IHubContext<THub,TClient>` | Strongly typed outside-hub context for a typed client contract. |
| `IUserIdProvider` | Strategy that maps an authenticated connection to a SignalR user-routing identifier. |
| `IUserIdProvider.GetUserId` | Returns the identifier for a connection. Use a stable value unique across all users. |
| `DefaultUserIdProvider` | Default implementation that reads the `ClaimTypes.NameIdentifier` claim. |
| `ClaimTypes.NameIdentifier as default SignalR user identifier` | Default source for `Context.UserIdentifier`; a missing/nonunique claim undermines user routing. |
| `User identifier uniqueness requirement` | The chosen identifier must be unique or messages can be delivered to the wrong principal. Validate issuer/tenant scoping if identifiers are not globally unique. |
| `Multiple SignalR connections per authenticated user` | One user can have multiple tabs/devices; user targeting may deliver to all of them. |
| `Groups are connection routing sets rather than authorization rules` | Group membership only chooses recipients. Validate every join and remove membership when permissions change. |
| `Typed hub contract via Hub<TClient>` | Declares server-to-client method signatures as a C# interface for compile-time checking. |
| `Strongly typed hub client proxy method signatures` | Makes server sends compiler-checked against the interface, reducing misspelled names but not checking client implementation at runtime. |

### Filters, registration, and endpoint mapping

| Supplied name | Meaning and use |
|---|---|
| `Hub filter pipeline` | Cross-cutting invocation/connect/disconnect pipeline for logging, validation, and policy hooks. Explicit authorization remains required. |
| `IHubFilter` | Interface for a SignalR filter. Register globally or per hub through hub options. |
| `IHubFilter.InvokeMethodAsync` | Wraps a hub method invocation; call `next` exactly as intended and preserve exceptions/cancellation. |
| `IHubFilter.OnConnectedAsync` | Filter hook around connection establishment. Avoid assuming successful connect implies resource authorization. |
| `IHubFilter.OnDisconnectedAsync` | Filter hook around disconnect handling. Do not depend on it to persist business-critical cleanup. |
| `AddSignalR` | Registers server SignalR services and optionally configures hub-wide options/protocols. |
| `HubEndpointRouteBuilderExtensions.MapHub<THub>` | Maps a typed hub to an endpoint path and can configure endpoint-specific dispatcher options. |
| `MapHub configureOptions callback Action<HttpConnectionDispatcherOptions>` | Endpoint callback for transport, stateful reconnect, authentication expiration/refresh, and related HTTP-connection behavior. |
| `HttpConnectionDispatcherOptions.Transports` | Restricts available transports. A client must be able to use one enabled transport. |
| `HttpConnectionDispatcherOptions.AllowStatefulReconnects` | Enables server endpoint participation in stateful reconnect; the client must also opt in. |
| `HttpConnectionDispatcherOptions.CloseOnAuthenticationExpiration` | Closes the connection when its authentication ticket expires; in .NET 11 this is commonly paired with refresh for token-authenticated connections. |

## Cross-item comparison

| Routing selector | Target | Key limitation |
|---|---|---|
| `Client` / `Clients` | Specific connection IDs | IDs are ephemeral and per connection |
| `User` / `Users` | One or more user identifiers | May fan out to multiple connections per user |
| `Group` / `Groups` | Dynamic group membership | Membership is transient and not authorization |
| `All` / `Others` | Broad hub audience | Easy to overshare; keep payloads appropriate for every recipient |

Use `IHubContext` when the sender is outside a hub invocation. `Hub.Context` exists only for the current call and connection. A typed hub improves compile-time contracts; an untyped proxy is flexible but string names are easier to mistype.

## Examples

### Send from a background service without constructing a hub

```csharp
public sealed class OrderNotifier(IHubContext<OrdersHub, IOrdersClient> hub)
{
    public Task NotifyAsync(string authorizedOrderGroup, OrderUpdate update) =>
        hub.Clients.Group(authorizedOrderGroup).OrderChanged(update);
}
```

The group name must be selected by trusted application code after authorization; do not accept an arbitrary group name from the caller. The send is ephemeral—persist the order update separately if clients must recover it later.

### Authorize a group join

```csharp
public async Task JoinOrder(string orderId)
{
    var order = await orders.FindAsync(orderId, Context.ConnectionAborted);
    if (order is null || !await access.CanViewAsync(Context.User!, order))
        throw new HubException("Not authorized for this order.");

    await Groups.AddToGroupAsync(Context.ConnectionId, GroupName.ForOrder(order.Id));
}
```

Do not disclose whether a protected order exists if that is sensitive. Recheck/revoke membership when access changes; authorization at join time does not automatically update a long-lived connection.

## Common mistakes

- Storing chat/order state in hub fields.
- Manually constructing or retaining a hub instead of injecting `IHubContext`.
- Treating a send completion as a client acknowledgement or durable delivery.
- Using a nonunique username/email as a user identifier without tenant/issuer protection.
- Trusting client-supplied group names or user IDs.
- Treating group membership as permission and failing to remove members after revocation.
- Broadcasting sensitive payloads to `All` or large groups.
- Enabling `EnableDetailedErrors` in production and exposing implementation details.
- Assuming `ConnectionId` survives reconnect or identifies a user.
- Running non-thread-safe `DbContext` calls concurrently from parallel hub invocations.
- Using a client-result invocation as a substitute for a durable acknowledgement workflow.

## Knowledge checks with answers

1. **When use `IHubContext`?** When sending from outside an active hub call, such as a controller or worker.
2. **How long does a hub instance live?** A hub instance is created for an invocation/callback, not retained as connection state.
3. **What does `Clients.User(id)` target?** All current connections mapped to that user identifier.
4. **Why authorize before `AddToGroupAsync`?** A group routes messages but is not a security boundary.
5. **What does a `Hub<TClient>` add?** Compile-time checked server calls against a client interface.
6. **Does `SendAsync` prove the browser rendered a message?** No; it does not provide application-level client acknowledgement.

## Sources

- [Use hubs in ASP.NET Core SignalR](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)
- [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration)
- [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)
- [SignalR Hub Protocol specification](https://github.com/dotnet/aspnetcore/blob/main/src/SignalR/docs/specs/HubProtocol.md)

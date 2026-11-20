# SignalR transports hubs connection lifetime groups security scaling — Reference: ASP.NET Core 11 authentication refresh and invocation cancellation

## Scope and version

Before refresh support, updating a bearer token did not update the principal attached to an already established SignalR connection. Applications often had to reconnect, interrupting in-flight work. ASP.NET Core 11 adds a protocol for refreshing the authentication state in place, with a strict same-user identity invariant. It also adds cooperative cancellation for non-streaming invocations in the .NET client, so a caller can ask the server method to stop when its wait is cancelled. These features do not make authorization automatic: the application must still choose when to refresh, what changed claims mean, and how server work observes cancellation. [ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11) [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) [.NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client) [JavaScript client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)

## Server side: enable, validate, and preserve identity

Enable the feature for the mapped endpoint through `HttpConnectionDispatcherOptions.EnableAuthenticationRefresh`. `HttpConnectionDispatcherOptions.OnAuthenticationRefresh` receives an `AuthenticationRefreshContext` containing `PreviousUser`, `NewUser`, `NewExpiration`, `ConnectionId`, and `HttpContext`. The normal request authentication pipeline produces the refreshed principal; the callback can inspect it and reject changes that violate application policy. It cannot approve a principal that maps to a different SignalR user ID. This invariant keeps existing user and group routing coherent.

The opt-in endpoint is `POST /{hub-path}/refresh` and identifies the connection with its `id` query parameter. The hub's endpoint authorization metadata and normal authentication middleware apply. A rejected identity or callback returns 403; an unknown connection token returns 404; malformed/missing IDs, protocol version 0, or Windows-identity cases return 400. Configure proxies, WAFs, route-scoped authorization and CORS to allow this route. An exception thrown by `OnAuthenticationRefresh` propagates from the request and leaves the connection's current principal unchanged.

The built-in same-identity check compares the first matching `sub`, `ClaimTypes.NameIdentifier`, or `ClaimTypes.Upn` claim, in that order. When comparing a matching identity claim, both its value and issuer must match; other claims such as roles, scopes, or tenant can change unless the application callback rejects those changes. If neither principal has a supported identity claim, authenticated identities must match in their identity metadata and claims; the special unauthenticated-to-unauthenticated case is allowed. The check also requires the refreshed principal to map to the same SignalR user identifier. The connection's `Context.UserIdentifier` is fixed at connect time, so reconnect if the routing identity itself must change.

`HttpConnectionDispatcherOptions.MaximumAuthenticationExpiration` caps the refreshed ticket's expiration relative to the refresh time, including when a credential has no expiration; that cap can also provide a known lifetime for automatic scheduling. It must be greater than zero and does not apply to Windows authentication. The `/refresh` request is a real endpoint request, so reverse proxies, WAFs, ingress rules, and firewalls must permit it and preserve the authentication context. Use HTTPS and the application's existing token/cookie validation. Refresh must not become a way to elevate identity or silently switch tenants.

After a successful replacement, `Hub.OnAuthenticationRefreshedAsync` runs with the refreshed connection principal. Use it for connection-scoped bookkeeping only when appropriate. In-flight hub invocations retain the principal captured when they began, avoiding a mid-method identity change. New invocations see the refreshed principal. `ConnectionId` and the user-routing identifier remain the same; authorization must still check resource access and account for revocations.

## .NET client API

Automatic refresh is enabled by default when the server reports a token lifetime. Configure `HubConnectionBuilderExtensions.WithAuthenticationRefresh` with `AuthenticationRefreshOptions` to turn scheduling off or change its timing: `EnableAutoRefresh` controls scheduling and `RefreshBeforeExpiration` chooses how early to refresh relative to the reported lifetime. A configured `MaximumAuthenticationExpiration` can give a credential without its own expiration a server-reported lifetime. The application supplies refreshed credentials through its normal token provider and should avoid racing independent token refresh systems.

`HubConnection.RefreshAuthenticationAsync` requests a refresh explicitly and returns the new token lifetime reported by the server. The client exposes `AuthenticationRefreshed` after success and `AuthenticationRefreshFailed` on failure. The latter receives `AuthenticationRefreshFailedContext`, with `Exception` and `HubConnection` for diagnostics and recovery decisions. A failed refresh is surfaced; it does not itself close the connection and the client does not automatically retry it. The existing credentials remain in effect until they expire; if `CloseOnAuthenticationExpiration` is enabled (recommended with refresh), the connection then closes. Decide whether to prompt sign-in, stop the connection, or retry after credentials are renewed. Avoid infinite retry loops.

## JavaScript client API

The JavaScript client uses `HubConnectionBuilder.withAuthenticationRefresh` and `HubConnection.refreshAuthentication`. Register callbacks with `HubConnection.onAuthenticationRefreshed` and `HubConnection.onAuthenticationRefreshFailed`. `IAuthenticationRefreshOptions.enableAutoRefresh` toggles scheduling; `refreshBeforeExpirationInMilliseconds` gives the early-refresh interval in milliseconds. The `accessTokenFactory` remains the credential source for HTTP requests. Ensure it can return a current token when `/refresh` is requested, including after the browser tab has been suspended or the user's session has expired.

The .NET and JavaScript names differ in casing and units. Do not copy `RefreshBeforeExpiration` code into TypeScript, or mistake milliseconds for a `TimeSpan`. Browser proxy configuration must route the refresh endpoint as well as negotiate and transport requests.

## Same-user invariant and failure modes

The refreshed principal must resolve to the same SignalR user identifier as the current principal. This is stronger than “the token signature is valid”: a valid token for a different account must not take over the live connection. The optional callback may impose stricter checks, such as tenant or session version constraints, but cannot override the built-in user match. If the refreshed identity differs, establish a new authenticated connection rather than changing the existing connection's owner.

Authentication refresh is not a blanket authorization refresh for every in-flight operation. Long-running work began under its original principal. Newly invoked methods use the refreshed principal. Sensitive operations should reauthorize against current application state, especially where permissions can be revoked quickly. Refresh failure leaves connection lifecycle decisions to the application; monitor the failure event and apply an explicit bounded response.

## ASP.NET Core 11 invocation cancellation

The .NET SignalR client can pass a `CancellationToken` to a non-streaming `HubConnectionExtensions.InvokeAsync` overload. When cancelled, it sends a cancellation message for that invocation. The hub method must declare a `CancellationToken` parameter; SignalR supplies it as framework metadata rather than binding it as a client-supplied argument. The method must pass the token into database, HTTP, delay, and other cancellable operations and check it around non-cancellable work.

Cancellation is cooperative. The client-side invocation task can become cancelled once the cancellation signal is sent, while the server method may still be running or may already have committed side effects. Use transactions/idempotency for operations where duplicate or partial effects matter. This support is for non-streaming invocations from the .NET client; it does not make JavaScript non-streaming invocations cancellable through the same API. Streaming methods already have their own cancellation behavior. A one-way `SendAsync` has no response task whose normal cancellation means “cancel that server method.”

## Quick comparison

| Concern | Authentication refresh | Invocation cancellation |
|---|---|---|
| Purpose | Replace connection claims/token without reconnecting | Ask a running hub method to stop cooperatively |
| Client support | .NET and JavaScript clients | .NET client for non-streaming `InvokeAsync` |
| Server hook | Endpoint option, refresh callback, post-refresh hub callback | `CancellationToken` parameter on the hub method |
| Important invariant | Refreshed principal must remain the same SignalR user | Server observes token; caller cancellation does not prove server stopped |
| Failure behavior | Reported to client; no automatic retry or disconnect solely due to failure; expiration can close the connection when configured | Client task can cancel before server completes |

## How this group fits the mental model

SignalR keeps a logical connection alive after its initial HTTP authentication. Refresh replaces that connection's principal under the same-user invariant; invocation cancellation sends a cooperative request to stop one unit of hub work. Neither changes the transport's durability. Keep token acquisition, resource authorization, cancellation observation, and persistence as explicit application responsibilities.

## Supplied names explained

| Supplied name | Explanation |
|---|---|
| ASP.NET Core 11 SignalR authentication refresh | Reauthenticates an existing logical connection in place, preserving its SignalR user identity. |
| Hub.OnAuthenticationRefreshedAsync | Server callback after the connection principal has been replaced. |
| Authentication refresh preserves SignalR user identity and routing | Prevents a live connection from changing owner while retaining connection and group state. |
| HttpConnectionDispatcherOptions.EnableAuthenticationRefresh | Enables refresh for a mapped hub endpoint. |
| HttpConnectionDispatcherOptions.OnAuthenticationRefresh | Optional server callback to accept or reject additional principal changes. |
| HttpConnectionDispatcherOptions.MaximumAuthenticationExpiration | Caps the period allowed before authentication must be refreshed. |
| AuthenticationRefreshContext | Refresh callback context containing old/new identities, expiration, connection, and HTTP request context. |
| AuthenticationRefreshContext.PreviousUser | Principal authenticated for the existing connection before refresh. |
| AuthenticationRefreshContext.NewUser | Principal produced by authenticating the refresh request. |
| AuthenticationRefreshContext.NewExpiration | Refreshed credential expiration information used to schedule subsequent refresh. |
| AuthenticationRefreshContext.ConnectionId | Existing SignalR connection ID undergoing refresh. |
| AuthenticationRefreshContext.HttpContext | HTTP context for the refresh request, including request services and authentication features. |
| POST /{hub-path}/refresh endpoint and connection id query parameter | The opt-in endpoint accepts POST and uses the existing SignalR connection token in `id` to select the connection being reauthenticated. |
| Authentication refresh endpoint uses normal authentication and hub authorization metadata | The refresh request passes through the app's normal authentication/authorization pipeline and is subject to the mapped hub's authorization metadata. |
| Authentication refresh 400 403 and 404 outcomes | A rejected identity or callback returns 403; unknown connection token returns 404; malformed/missing ID, protocol v0, or Windows identity returns 400. |
| Built-in authentication refresh identity claim selection order: sub, NameIdentifier, Upn | The first matching claim type in this order is used by the built-in identity check. |
| Authentication refresh same identity claim value and issuer check | A matching claim must have the same value and issuer. A different tenant/role/scope claim can still be refreshed unless application policy rejects it. |
| Authentication refresh identity-less principal comparison behavior | If neither side has a supported identity claim, unauthenticated-to-unauthenticated is allowed; otherwise identity metadata and claims must match. |
| Windows identity unsupported by SignalR authentication refresh | Windows identities aren't tracked/refreshed by the feature and are rejected for refresh. |
| OnAuthenticationRefresh callback exception propagates and preserves existing principal | SignalR doesn't swallow callback exceptions; the refresh request fails and the current connection principal remains in place. |
| AuthenticationRefreshContext.NewExpiration includes MaximumAuthenticationExpiration cap | The context exposes the accepted ticket expiration after applying the configured cap; it can be null when no expiration is available. |
| `POST /{hub-path}/refresh` and connection `id` query parameter | The opt-in refresh endpoint accepts POST and uses the existing SignalR connection token to select the connection being reauthenticated. |
| Authentication refresh endpoint authorization and status codes | Normal authentication/authorization and hub metadata apply; rejected refresh is 403, unknown connection token 404, and malformed/incompatible requests 400. |
| Authentication refresh same-identity claim selection | The built-in comparison uses the first `sub`, `ClaimTypes.NameIdentifier`, or `ClaimTypes.Upn` claim and requires matching value/issuer; application policy should additionally inspect tenant, roles, scopes, or account state when needed. |
| Windows identity authentication refresh limitation | Windows identities aren't tracked/refreshed by this feature; refresh requests using Windows identities are rejected. |
| OnAuthenticationRefresh callback exception behavior | An exception propagates from the refresh HTTP request and leaves the existing connection principal unchanged. |
| HubConnectionBuilderExtensions.WithAuthenticationRefresh | Configures the .NET client refresh behavior. |
| AuthenticationRefreshOptions | .NET client settings for automatic refresh timing. |
| AuthenticationRefreshOptions.EnableAutoRefresh | Enables client scheduling when the server reports expiry. |
| AuthenticationRefreshOptions.RefreshBeforeExpiration | .NET `TimeSpan` interval for refreshing before expiry. |
| HubConnection.RefreshAuthenticationAsync | Requests refresh explicitly from a running .NET client connection. |
| HubConnection.AuthenticationRefreshed event | Signals successful client-side refresh. |
| HubConnection.AuthenticationRefreshFailed event | Signals a failed refresh for application handling. |
| AuthenticationRefreshFailedContext | Failure event context for .NET clients. |
| AuthenticationRefreshFailedContext.Exception | Exception explaining the refresh failure. |
| AuthenticationRefreshFailedContext.HubConnection | Connection associated with the failed refresh. |
| HubConnectionBuilder.withAuthenticationRefresh JavaScript client | Configures the TypeScript/JavaScript client refresh options. |
| HubConnection.refreshAuthentication JavaScript client | Explicitly requests a refresh. |
| HubConnection.onAuthenticationRefreshed JavaScript client | Registers the successful-refresh callback. |
| HubConnection.onAuthenticationRefreshFailed JavaScript client | Registers the failure callback. |
| IAuthenticationRefreshOptions.enableAutoRefresh | JavaScript automatic scheduling switch. |
| IAuthenticationRefreshOptions.refreshBeforeExpirationInMilliseconds | JavaScript early-refresh interval, expressed in milliseconds. |
| Authentication refresh requires the refreshed principal to retain the same SignalR user identity | Built-in security invariant; a different user requires a new connection. |
| Authentication refresh callback can reject but cannot override the built-in same-user check | Application callback adds restrictions, not identity takeover. |
| Authentication refresh automatic scheduling requires server-reported token lifetime | The server can report a lifetime from the authentication ticket or a configured maximum expiration cap. |
| Authentication refresh failure does not close the connection or automatically retry | Existing credentials remain until expiry; `CloseOnAuthenticationExpiration` can then close the connection. |
| Authentication refresh /refresh route must pass through proxy and firewall configuration | Refresh is an HTTP request that must reach the hub server. |
| Hub.OnAuthenticationRefreshedAsync runs after the connection principal is replaced | New invocations see the replacement principal; callback observes refreshed state. |
| In-flight hub invocations retain the principal captured when they began | Prevents one invocation from changing identity midway through execution. |
| ASP.NET Core 11 non-streaming invocation cancellation | .NET client can request cancellation of a server invocation. |
| `HubConnectionExtensions.InvokeAsync` CancellationToken | Client overload that sends cancellation when its token is cancelled. |
| CancellationToken parameter on non-streaming hub method | Framework-supplied cooperative token; not an ordinary wire argument. |
| Client invocation task cancels before server method finishes | Client cancellation signal is not proof of server termination. |
| Non-streaming cancellation supported by .NET client only | Do not claim equivalent JavaScript feature in this release. |
| Cancellation differs from `SendAsync` | One-way send has no invocation result to cancel in this manner. |

## Cross-item comparison

Authentication refresh updates connection identity for future invocations while retaining the same SignalR user; cancellation asks one invocation to stop and does not change connection identity. Both cross a client/server boundary and both have failure modes the application must observe. Refresh failure is an authentication lifecycle event; cancellation is a cooperative execution signal. Neither should be mistaken for a durable transaction or rollback.

## Examples

```csharp
public Task UpdateProfile(int profileId, CancellationToken cancellationToken)
    => profiles.UpdateAsync(Context.User!, profileId, cancellationToken);
```

The .NET client can call a non-streaming `InvokeAsync` overload with its token. If it is cancelled, the server method receives cancellation only if it declares the special token parameter and SignalR can deliver the cancellation message. Pass it into the operation; still make writes idempotent because cancellation may race with commit.

For refresh, configure the endpoint's authentication-refresh option and the client refresh option together. Keep `AccessTokenProvider` or `accessTokenFactory` connected to the same credential refresh system that can authenticate `/refresh`; allow that route through ingress and proxy rules.

## Common mistakes

- Assuming a valid refreshed credential can change the user or tenant on the existing connection.
- Assuming automatic refresh can be scheduled when the server reports no token lifetime and no maximum expiration cap is configured.
- Assuming a refresh failure automatically retries or immediately disconnects the connection; expiration closure depends on `CloseOnAuthenticationExpiration`.
- Blocking `/refresh` at an ingress rule while ordinary negotiate and transport routes work.
- Treating a client-side cancelled task as proof that server side effects were undone.
- Declaring a token but failing to pass it to cancellable I/O or observe it before commits.
- Applying the .NET invocation cancellation overload to JavaScript `Invoke` or one-way `SendAsync`.

## Knowledge checks with answers

1. **Can the refresh callback approve a different SignalR user?** No. It may reject additional changes but cannot override the built-in identity match.
2. **Do in-flight invocations immediately see refreshed claims?** No. They retain the principal captured when they began; subsequent invocations use the refreshed principal.
3. **If the client task cancels, is the server method finished?** Not necessarily. Cancellation is cooperative and can arrive after the client task has already completed as cancelled.

## Sources

[ASP.NET Core 11 release notes](https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-11) · [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) · [Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) · [.NET client](https://learn.microsoft.com/en-us/aspnet/core/signalr/dotnet-client) · [JavaScript client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)

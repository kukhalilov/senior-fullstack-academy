# SignalR transports hubs connection lifetime groups security scaling — Reference: hub authorization identity claims and invocation protection

## Scope and version

SignalR authenticates a connection and then invokes hub methods over that long-lived connection. Authentication answers who the principal is; authorization answers whether that principal may invoke a hub or perform a particular operation on a particular resource. A successful connection is not blanket permission for every later message. Claims can also become stale while a connection remains open, so sensitive operations need deliberate freshness and revocation policies. [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) [SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)

## How this group fits the mental model

`[Authorize]` on a hub class protects every hub method by default; `[Authorize]` on an individual method adds a method-level requirement. Policies and roles use the normal ASP.NET Core authorization machinery. A method that accepts a document ID still needs resource authorization after binding: load the resource using trusted server-side services, then authorize the current principal against that resource. Never treat a client-selected group name, tenant ID, or record ID as proof of access.

`HubCallerContext.User` is the authenticated `ClaimsPrincipal` associated with the connection. It is appropriate for identity and claims checks, but it is not a substitute for checking current ownership or current database policy. A connection's claims are normally established at connection time. If an account is disabled or access is revoked, choose an explicit strategy: short connection lifetime, abort/reconnect, application-level revocation, or the ASP.NET Core 11 authentication-refresh feature described in the companion lesson.

`HubInvocationContext` gives a hub filter the `Context`, `HubMethodName`, and `HubMethodArguments` for an invocation. These are useful for structured logs, metrics, generic validation, and cross-cutting rules. Arguments remain untrusted and may contain sensitive values: avoid logging secrets, tokens, or full payloads. A filter can reject an invocation, but authorization should stay explicit and resource-aware; filters do not automatically create a complete authorization policy.

## Groups and identity are security-sensitive routing

The default user identifier comes from `ClaimTypes.NameIdentifier`; `DefaultUserIdProvider` implements that mapping. `IUserIdProvider.GetUserId` can define a different stable identifier. It must be unique across users. A collision can route one user's messages to another user's connections. Do not use mutable display names, email addresses that can be reassigned, or untrusted client input as a user ID.

One authenticated user may have multiple concurrent SignalR connections, such as browser tabs and devices. `Clients.User(id)` therefore targets all mapped connections for that user; it does not mean “the current tab.” Groups are connection routing sets. Membership is not a durable authorization record, may need to be reconstructed after reconnect, and should be added only after checking access. Revalidate or remove membership when privileges or resource ownership change. Never rely on obscurity of a group name.

## Browser tokens, cookies, and transport caveats

The .NET client supplies bearer tokens with `AccessTokenProvider`; the JavaScript client uses `accessTokenFactory`. For browser WebSocket and Server-Sent Events transports, browser APIs cannot set arbitrary authorization headers, so SignalR may carry the access token in the `access_token` query parameter. HTTPS is mandatory for such bearer tokens. Query strings commonly appear in proxy, server, and diagnostic logs; configure logging to redact them and never record the token. Long polling can generally use authorization headers, but client and server behavior depends on the selected transport and browser.

Cookie authentication can authenticate browser SignalR connections automatically, but cookie ambient authority makes cross-site request protections and origin controls important. CORS and WebSocket origin validation are distinct: CORS governs browser HTTP requests and does not itself protect a WebSocket upgrade. Use HTTPS, restrict allowed origins, configure credentials narrowly, and validate the deployment's proxy behavior. These SignalR-specific facts complement the dedicated ASP.NET Core CORS, cookies, and bearer-token lessons.

## Invocation and resource protections

`HubOptions.MaximumReceiveMessageSize` limits the size of an incoming hub message. A larger value may be required for a real payload, but increasing it raises memory and denial-of-service exposure. Prefer small messages, streaming for large data, quotas, and application-level validation. `EnableDetailedErrors` can expose exception details to clients and should remain disabled in production unless carefully controlled.

`HubOptions.MaximumParallelInvocationsPerClient` limits concurrent invocations from one client. It is not a global rate limiter and does not cap total connections or all CPU/database work. Add appropriate quotas, bounded queues, resource timeouts, and infrastructure connection limits. SignalR maintains long-lived sockets and per-connection buffers, so connection count, memory, file descriptors, and outbound fan-out all matter. Backpressure and cancellation must be observed by the application; a client disconnect does not undo a database write already committed.

Use `HubException` only for intentional, safe client-facing errors. Unhandled exception details are hidden by default for security; sending detailed errors broadly can reveal implementation and sensitive data. Log the server-side exception with a correlation identifier, then return a concise domain error where the client needs to react.

## Review checklist

1. Is the hub or method protected with the appropriate policy?
2. Does every resource operation check current ownership/tenant access server-side?
3. Are group joins authorized, revalidated, and removed when access changes?
4. Is the user identifier stable, unique, and derived from a trusted claim?
5. Are query-string tokens protected by HTTPS and redacted from logs?
6. Are CORS and WebSocket origin controls both configured for the deployment?
7. Are message size, concurrency, rate, connection, memory, and fan-out limits appropriate?
8. Are detailed errors disabled and logs free of credentials and private payloads?

## Cross-item comparison

Authentication and authorization answer different questions: identity is established for the connection, while policies and resource checks decide whether each hub operation is allowed. Hub-level `[Authorize]` establishes a broad boundary; resource authorization evaluates the actual entity and action. Likewise, user routing and group routing select recipients but grant no domain permission. Message-size and per-client concurrency settings bound different resource dimensions and neither is a complete rate limiter.

## Examples

```csharp
[Authorize]
public sealed class InvoiceHub(IInvoiceStore invoices, IAuthorizationService authorization) : Hub
{
    public async Task Approve(int invoiceId, CancellationToken cancellationToken)
    {
        var invoice = await invoices.FindAsync(invoiceId, cancellationToken)
            ?? throw new HubException("Invoice not found.");
        var decision = await authorization.AuthorizeAsync(Context.User!, invoice, "Approve");
        if (!decision.Succeeded) throw new HubException("Not allowed.");
        await invoices.ApproveAsync(invoice, cancellationToken);
    }
}
```

The class attribute requires an authenticated/authorized caller under the configured policy; the resource check still decides whether this caller may approve this particular invoice. In production, translate domain errors to safe client-visible responses and log details without credentials.

## Common mistakes

- Treating a successful connection or hub-level policy as authorization for every resource.
- Adding client-selected groups without checking membership against current server data.
- Using a non-unique user identifier, which can cross-route private messages.
- Assuming CORS validates WebSocket origins or that query-string tokens are absent from logs.
- Raising message/concurrency limits without considering per-connection memory and system-wide work.
- Returning detailed exceptions or logging access tokens and full private payloads.

## Knowledge checks with answers

1. **Does `[Authorize]` on the hub authorize access to every invoice ID?** No. It applies its configured policy; the method must still authorize the specific invoice and action.
2. **Can a group name serve as a secret capability?** No. Group membership routes connections and must be granted only after authorization.
3. **Does `MaximumParallelInvocationsPerClient` impose a global request rate?** No. It bounds concurrent hub invocations per client; use quotas/rate controls and infrastructure limits too.

## Supplied names explained

| Supplied name or concept | Meaning and practical use |
|---|---|
| AuthorizeAttribute on a hub class | Applies authentication/authorization requirements across hub methods. |
| AuthorizeAttribute on an individual hub method | Protects a particular operation with its own policy or role requirement. |
| HubInvocationContext | Filter input describing the current invocation and hub context. |
| HubInvocationContext.HubMethodName | Method name for diagnostics or cross-cutting decisions; do not use as the only authorization rule. |
| HubInvocationContext.HubMethodArguments | Bound arguments, still untrusted and potentially sensitive. |
| HubInvocationContext.Context | Connection context associated with the invocation. |
| HubCallerContext.User authorization principal | Authenticated principal available to hub code. |
| Resource authorization inside a hub method | Checks current user access to the specific entity or tenant. |
| Group membership authorization and revalidation | Prevents routing membership from becoming an accidental access grant. |
| Authenticate during SignalR connection negotiation | Establishes identity for the long-lived connection; keep middleware and endpoint ordering correct. |
| AccessTokenProvider for .NET client bearer tokens | Supplies a token when the client needs to authenticate HTTP requests. |
| accessTokenFactory for JavaScript client bearer tokens | Supplies or refreshes the browser client's token for requests. |
| Browser WebSocket and Server-Sent Events query-string access_token behavior | A browser transport constraint with token logging risk. |
| HTTPS and query-string token logging risk | Encrypts tokens in transit and prevents credential leakage through logs. |
| SignalR CORS and WebSocket origin validation are separate controls | CORS alone does not secure WebSocket upgrades. |
| Cookie authentication for browser SignalR clients | Uses browser cookies; requires careful origin and cross-site protections. |
| Bearer token authentication for non-browser clients | Explicit credential flow suited to native/server clients. |
| Connection identity and claims are normally cached for connection lifetime | Explains stale claims and the need for refresh or revocation policy. |
| Hub filters for invocation logging validation and cross-cutting policy | Centralizes selected concerns while keeping resource authorization explicit. |
| Hub filters do not replace authorization checks | Prevents mistaken global-filter security. |
| SignalR message size limit and denial-of-service control | Bounds memory and parsing cost per incoming message. |
| SignalR detailed errors and production information disclosure | Avoids returning stack traces or internals to clients. |
| SignalR message rate and per-client invocation limits | Controls concurrency but does not serve as a full rate limiter. |
| SignalR connection count and TCP resource limits | Long-lived connections consume sockets, memory, and infrastructure capacity. |

## Sources

[Authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz) · [SignalR configuration](https://learn.microsoft.com/en-us/aspnet/core/signalr/configuration) · [SignalR hubs](https://learn.microsoft.com/en-us/aspnet/core/signalr/hubs)

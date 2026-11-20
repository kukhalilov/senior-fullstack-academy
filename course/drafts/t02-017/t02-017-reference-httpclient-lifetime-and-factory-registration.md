# IHttpClientFactory resilience retries and timeouts — Reference: HttpClient connection pooling factory lifetime named and typed clients

## Scope and version

This reference covers `HttpClient`, request/response objects, factory registration, handler pooling, and socket/DNS lifetime controls. It follows the current .NET 11 API surface; `Microsoft.Extensions.Http` and resilience packages are independently versioned, so pin compatible package versions rather than equating package and runtime versions. [IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory) [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)

## How this group fits the mental model

`HttpClient` carries per-client settings and sends requests through an `HttpMessageHandler`. A handler generally owns the actual connection pool. `IHttpClientFactory` creates short-lived clients while pooling/rotating handlers. DNS changes are observed when a new connection is created, so handler/connection lifetime—not constructing a new `HttpClient` on every request—controls how promptly a new address can be used.

## Supplied names explained

### Requesting with HttpClient and message objects

| Supplied name | Meaning and use |
|---|---|
| `HttpClient` | High-level API for sending HTTP requests and receiving responses. Each client is associated with a handler/connection pool, directly or through factory management. |
| `HttpClient.BaseAddress` | Base URI used to resolve relative request URIs. A trailing slash changes relative URI combination behavior; understand path replacement when composing endpoints. |
| `HttpClient.DefaultRequestHeaders` | Headers applied to requests sent by the client. Use for stable client-wide values, not per-user/per-request mutable data shared across concurrent calls. |
| `HttpClient.Timeout` | Client-level request timeout, 100 seconds by default. It races caller cancellation and resilience timeouts; only the shorter effective timeout matters, so define one coherent deadline hierarchy. With `ResponseHeadersRead`, it stops applying once headers arrive. |
| `HttpClient.MaxResponseContentBufferSize` | Maximum response content buffering limit, 2 GiB by default, for operations that buffer content. Streaming with `ResponseHeadersRead` avoids full-body buffering but still requires disposal and an application-enforced size limit. |
| `HttpClient.SendAsync` | Sends an `HttpRequestMessage` asynchronously and returns an `HttpResponseMessage`. Select completion behavior when streaming and pass cancellation where appropriate. |
| `HttpClient.GetAsync` | Convenience method for GET. By default it commonly buffers response content before completion; use a streaming completion option for large bodies. |
| `HttpClient.GetStringAsync` | Sends GET and returns the response body as a string, buffering/deserializing the full body. Avoid for unbounded/large responses. |
| `HttpClient.GetStreamAsync` | Sends GET and exposes the response body stream. Dispose the stream/associated response lifetime promptly so the connection can be released/reused. |
| `HttpClient.PostAsync` | Convenience method for POST content. The call returns an HTTP response, not proof that the server applied a domain operation exactly once. |
| `HttpClient.Send` | Synchronous send API. Blocking synchronous HTTP can consume worker threads; prefer asynchronous APIs in server code. |
| `HttpClient.SendAsync cancellation token overloads` | Overloads that accept a `CancellationToken` so caller cancellation/deadlines can stop local sending/reading work. Propagate the same token through the operation chain. |
| `HttpRequestMessage` | One outgoing request object holding method, URI, headers, content, and request options. Create a fresh request for each retry/attempt unless the pipeline explicitly clones/replays it. |
| `HttpRequestMessage.Method` | HTTP method for the request. Method semantics inform retry safety but do not guarantee the server implementation has no side effects. |
| `HttpRequestMessage.RequestUri` | Absolute or relative URI for the request. Relative values are resolved against `BaseAddress` with standard URI path rules. |
| `HttpRequestMessage.Headers` | Per-request headers. Prefer this for caller-specific authorization/correlation values rather than mutating shared default headers. |
| `HttpRequestMessage.Content` | Optional request body content. Content may be non-replayable (for example a consumed stream), which constrains retries/redirects. |
| `HttpResponseMessage` | Response status, headers, and content. Dispose it when finished to release the response/connection resources. |
| `HttpResponseMessage.StatusCode` | HTTP status returned by the server. Interpret expected 4xx/429/business statuses explicitly rather than always converting them to exceptions. |
| `HttpResponseMessage.Headers` | Response headers, including cache, retry, and correlation metadata. Content-specific headers may live on `Content.Headers`. |
| `HttpResponseMessage.Content` | Response body content. It owns buffering/stream access; consuming/disposal timing affects connection reuse. |
| `HttpResponseMessage.EnsureSuccessStatusCode` | Throws when the response is outside the success range. Use only if every non-success response is exceptional for the application contract. |
| `HttpResponseMessage.Dispose` | Releases response/content resources. Dispose after reading/streaming; do not abandon a live response while expecting its connection to return promptly. |
| `HttpCompletionOption.ResponseContentRead` | Completes send after response content has been buffered. Convenient for small bodies, but can use substantial memory. |
| `HttpCompletionOption.ResponseHeadersRead` | Completes after response headers arrive and leaves body reading to the caller. Useful for streaming; the caller must read/dispose the response/stream. |
| `ResponseHeadersRead HttpClient.Timeout only covers headers` | When the send method returns at headers, `HttpClient.Timeout` no longer times the later content read. Pass a cancellation token or use a separate body-read deadline. |
| `ResponseHeadersRead MaxResponseContentBufferSize is not enforced during later body reads` | The automatic buffer limit is enforced for `ResponseContentRead`; with streaming, enforce an application-level byte limit while consuming the body. |

### Factory, registration, and handler configuration

| Supplied name | Meaning and use |
|---|---|
| `IHttpClientFactory` | DI service that creates configured clients and manages pooled handler lifetime by logical client name. |
| `IHttpClientFactory.CreateClient` | Creates a new short-lived client configured for a named client. Disposing the client is safe; the factory owns pooled handler cleanup. |
| `IHttpMessageHandlerFactory.CreateHandler` | Creates/returns a configured handler pipeline for a named client. Use for specialized client/handler composition, with explicit handler lifetime ownership. |
| `IServiceCollection.AddHttpClient` | Registers the factory and configures named or typed clients through returned builders. |
| `IHttpClientBuilder` | Fluent registration object for client configuration, primary/additional handlers, typed client construction, and handler lifetime. |
| `IHttpClientBuilder.Name` | Logical client name used to select the configuration/handler pool. Names are not secrets or access controls. |
| `IHttpClientBuilder.Services` | Service collection associated with the builder, allowing related service registrations. |
| `IHttpClientBuilder.ConfigureHttpClient` | Adds client configuration such as base address/default headers. Keep request-specific mutable values out of shared configuration. |
| `IHttpClientBuilder.ConfigureHttpClientDefaults` | Configures defaults for subsequently registered/all factory clients according to service registration. Review callback order so client-specific values intentionally override or extend defaults. |
| `IHttpClientBuilder.AddAsKeyed` | .NET 9+ opt-in that registers the named `HttpClient` as a keyed DI service using the client name as key; the default keyed lifetime is scoped. Current Microsoft guidance recommends considering keyed DI instead of typed clients, while named and typed patterns remain supported. |
| `IHttpClientBuilder.AddAsKeyed(ServiceLifetime)` | Selects the keyed `HttpClient` service lifetime. Avoid transient keyed clients: DI may retain disposable instances; singleton or long-lived scoped clients can outlive handler rotation and miss DNS updates. |
| `IHttpClientBuilder.RemoveAsKeyed` | Removes keyed registration for that named client, including opting a client out of global `AddAsKeyed` defaults. Registration ordering determines the effective setting. |
| `IHttpClientBuilder.UseSocketsHttpHandler` | Configures the factory's `SocketsHttpHandler` through the supported builder API. Use it when transport-specific properties such as `PooledConnectionLifetime` are needed; do not cast the default handler to `HttpClientHandler`. |
| `IHttpClientBuilder.SetHandlerLifetime` | Sets how long a pooled handler is considered active for new clients before recycling. Existing clients remain attached to their handler, so captive clients can miss rotation. |
| `IHttpClientBuilder.ConfigurePrimaryHttpMessageHandler` | Configures the innermost transport handler, commonly `SocketsHttpHandler`, for connection/TLS/cookie behavior. |
| `IHttpClientBuilder.AddHttpMessageHandler` | Adds an outgoing `DelegatingHandler` to the client pipeline. The handler type must be created per pipeline and be safe under pooling. |
| `IHttpClientBuilder.RedactLoggedHeaders` | Marks sensitive header names for redaction in factory logging. Add authorization/cookie/custom secret headers and avoid logging sensitive bodies. |
| `IHttpClientBuilder.AddTypedClient` | Associates a typed client service with the configured `HttpClient` builder. |
| `AddHttpClient named-client overloads` | Registration overloads for named clients with optional client configuration and builder callbacks. Choose a stable name and configure it in one predictable place. |
| `AddHttpClient typed-client overloads` | Registration overloads that create a typed client with an injected `HttpClient` and optionally configure the client. |
| `AddHttpClient<TClient,TImplementation>` | Registers an implementation as the typed client for an abstraction and supplies a configured `HttpClient` to its construction. |
| `AddHttpClient<TClient>` | Registers a concrete typed client using its constructor that accepts `HttpClient`. |
| `IHttpClientBuilder.ConfigurePrimaryHttpMessageHandler<THandler>` | Configures the primary handler through a registered handler type, allowing DI construction for transport settings. Ensure handler type/lifetime matches factory expectations. |
| `ConfigureHttpClientDefaults callback ordering` | Global defaults and client-specific callbacks are composed during registration; later/typed configuration can change earlier values. Inspect the resulting registration rather than assuming order across extension calls. |
| `IHttpMessageHandlerBuilderFilter` | Extension point that wraps handler-builder configuration, often used by logging/diagnostic integrations. Filters can affect pipeline order. |
| `HttpMessageHandlerBuilder` | Factory builder object that assembles the primary handler and additional delegating handlers into a pipeline. |
| `HttpMessageHandlerBuilder.PrimaryHandler` | Innermost transport handler that performs network I/O. |
| `HttpMessageHandlerBuilder.AdditionalHandlers` | Ordered outgoing `DelegatingHandler` collection that wraps the primary handler. Order affects which handler sees requests/responses first. |
| `HttpMessageHandlerBuilderFilter ordering` | Filters wrap/modify handler construction and their ordering affects the final pipeline. Avoid hidden cross-cutting behavior that changes security/diagnostic ordering unexpectedly. |
| `HttpMessageHandlerLifetime and handler recycling` | Factory-controlled period for caching/replacing a handler pipeline. Recycling can refresh pools/DNS but does not forcibly cancel active requests on the old handler. |
| `HttpClientFactory .NET 9 default SocketsHttpHandler and PooledConnectionLifetime alignment` | On supported platforms, .NET 9+ factory defaults to `SocketsHttpHandler` and sets its pooled connection lifetime to match the configured handler lifetime. This helps even when a client is captured too long, but fresh clients are still needed for handler-pipeline rotation and custom handlers can change behavior. |
| `HttpClientFactory default primary handler differs from HttpClientHandler on modern .NET` | Since .NET 9, the factory's default primary handler on supported platforms is `SocketsHttpHandler`; code that casts it to `HttpClientHandler` can fail. Configure the intended handler explicitly or use `UseSocketsHttpHandler`. |
| `IHttpClientFactory keyed DI introduced in .NET 9` | `AddAsKeyed` became available with .NET 9 and `Microsoft.Extensions.Http`/DI packages 9.0+. It lets consumers inject a named client through standard keyed-service APIs. |
| `Keyed HttpClient registration lifetime defaults to Scoped` | `AddAsKeyed()` registers the keyed client as scoped by default; an explicit lifetime overload is available. The lifetime applies to the `HttpClient` object, not to the factory-managed handler chain. |
| `FromKeyedServicesAttribute for HttpClient injection` | `[FromKeyedServices("name")]` injects the configured client whose `AddAsKeyed` registration uses that key. A key typo can resolve an unconfigured named client when defaults are globally keyed. |
| `IServiceProvider.GetRequiredKeyedService<HttpClient>` | Resolves the keyed client from a service provider; it fails for a key that was not registered as keyed unless a global `AnyKey` default registration applies. |
| `Keyed HttpClient scoped lifetime does not scope the pooled handler chain` | Different request scopes can receive separate keyed scoped `HttpClient` objects while reusing the same pooled handler and its separate handler DI scope. Never put per-request state in pooled handler dependencies. |
| `AddAsKeyed transient HttpClient disposal capture and memory leak risk` | A transient keyed `HttpClient` resolved repeatedly from a long-lived scope can be captured for disposal by DI, retaining clients/handlers. Prefer scoped or factory-created clients, with lifetimes designed for the consumer. |
| `AddAsKeyed on a typed client keys the underlying named HttpClient only` | Adding keyed registration to a typed-client builder does not convert the typed client itself into a keyed service; the typed wrapper remains transient. |
| `Keyed HttpClient captive dependency and DNS rotation risk` | Keyed singleton or long-lived scoped clients can outlive the handler lifetime. If a genuinely long-lived client is required, configure connection lifetime intentionally and understand the primary handler behavior. |
| `IHttpClientBuilder.AddAsKeyed and RemoveAsKeyed precedence` | The last per-client setting wins; defaults are applied before per-name settings, so a named override can add or remove keyed registration. |
| `ConfigureHttpClientDefaults AddAsKeyed AnyKey unknown-client caveat` | Global keyed defaults use an any-key registration. An unknown name may silently produce a default-configured client; explicitly validate names when configuration selection is security- or correctness-sensitive. |

### Sockets, DNS, and factory boundaries

| Supplied name | Meaning and use |
|---|---|
| `SocketsHttpHandler.PooledConnectionLifetime` | Maximum age for pooled connections after which a new connection is used; it enables later DNS/network re-resolution. It is connection-level lifetime, not a DNS TTL. |
| `SocketsHttpHandler.PooledConnectionIdleTimeout` | Maximum idle time before a pooled connection is considered for removal. It controls idle reuse, not active request deadline. |
| `SocketsHttpHandler.MaxConnectionsPerServer` | Maximum concurrent connections per server for that handler. It can constrain HTTP/1.1 connection growth; HTTP/2 multiplexing has different request/stream behavior. |
| `SocketsHttpHandler.ConnectTimeout` | Maximum time allowed for establishing a connection. It is distinct from response/total request timeout. |
| `HttpClient connection pool reuse` | Reuses handler-owned connections to reduce socket/TLS/DNS setup cost. Reusing a connection means DNS is not checked again until a later connection is established. |
| `DNS changes and pooled connection lifetime` | DNS updates are observed when new connections are opened. Set handler/connection rotation based on expected network changes; do not create one handler per call. |
| `HttpClientFactory handler pooling versus HttpClient object lifetime` | Factory-created `HttpClient` objects are short-lived, but their underlying handlers/pools are cached and reused. Disposing a client does not dispose the shared handler. |
| `Named client selection and configuration aggregation` | `CreateClient(name)` selects the settings and handler pool associated with that name; defaults and name-specific settings are composed during registration. |
| `Typed client short-lived DI lifetime` | A typed client contains a particular `HttpClient`, so keep it short-lived like a factory client rather than retaining it beyond handler rotation. |
| `Captive typed client inside singleton service` | A singleton retaining a typed client can keep using its old handler and miss DNS/handler updates. Inject the factory into the singleton and create a client when needed, or use a long-lived client with connection lifetime controls. |
| `Handler DI scope differs from incoming request scope` | Factory creates a handler DI scope separate from the ASP.NET request scope. Pooled handler dependencies may outlive and be reused across requests. |
| `Scoped state leakage through pooled DelegatingHandler` | Storing request/user/tenant state in a pooled handler can leak it across unrelated calls. Put request data on `HttpRequestMessage` or use a per-request wrapper. |
| `CookieContainer sharing across pooled handlers` | A pooled handler can share its `CookieContainer` among clients/requests using that handler, which may leak cookies between logical clients. Avoid factory pooling for workflows requiring isolated cookie state. |
| `Cookie loss when handler lifetime expires` | When a handler with a `CookieContainer` is recycled, its in-memory cookies are lost. Do not rely on pooled handler cookies for durable user sessions. |
| `IHttpClientFactory logging and header redaction` | Factory clients emit centralized logs/diagnostics. Redact authorization, cookies, API keys, and sensitive custom headers before production logging. |
| `Generated clients and external client-generator integrations` | Generated API clients can be registered as typed/named clients and use factory handlers. Generated code does not remove the need for correct lifetime, cancellation, response disposal, and resilience configuration. |

## Cross-item comparison

| Pattern | Appropriate lifetime model | DNS/connection control |
|---|---|---|
| Factory-created named, typed, or keyed client | Prefer short-lived clients; factory-managed handler pool | Handler lifetime; .NET 9+ default handler also aligns `PooledConnectionLifetime` |
| Manually managed long-lived client | Long-lived client and handler | Set `PooledConnectionLifetime` to a workload-appropriate interval |
| New manually owned handler per request | Avoid | Causes connection churn/socket pressure |

Factory-created clients are safe to dispose because handler lifetime is managed separately. A long-lived client is not inherently wrong when its connection lifetime is configured. The two patterns should not be blended into “create and dispose a new handler for every request.”

## Examples

### Register a typed client and rotate connections deliberately

```csharp
builder.Services.AddHttpClient<CatalogClient>(client =>
    client.BaseAddress = new Uri("https://catalog.example/api/"))
    .ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(3)
    });
```

This is a registration excerpt; `CatalogClient` accepts an `HttpClient`. Select the connection lifetime from expected DNS/network changes and deployment behavior. On modern .NET factory defaults already align `PooledConnectionLifetime` with handler lifetime; override it only for a deliberate refresh policy. [IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)

### Inject a named client through keyed DI (.NET 9+)

```csharp
builder.Services.AddHttpClient("catalog", client =>
    client.BaseAddress = new Uri("https://catalog.example/api/"))
    .AddAsKeyed();

app.MapGet("/items", async (
    [FromKeyedServices("catalog")] HttpClient client,
    CancellationToken cancellationToken) =>
    await client.GetFromJsonAsync<Item[]>("items", cancellationToken));
```

The keyed `HttpClient` defaults to scoped lifetime. It still uses the factory's pooled handler chain, whose DI scope is separate from the request scope. Avoid keyed transient disposable clients and long-lived captive keyed clients; a typo under global any-key registration can also return an unconfigured client. [Keyed DI support](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-keyed-di)

### Do not mutate shared headers per request

```csharp
using var request = new HttpRequestMessage(HttpMethod.Get, "items/42");
request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
using var response = await client.SendAsync(request, cancellationToken);
```

The token belongs on this request, not a shared client's `DefaultRequestHeaders`, when it varies by caller. Ensure logs redact the authorization header and dispose the request/response. [Factory troubleshooting](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)

## Common mistakes

- Creating/disposing a new manually owned client/handler per request.
- Capturing a typed client in a singleton and assuming factory rotation still affects it.
- Confusing `HandlerLifetime` with a per-request timeout or DNS TTL.
- Assuming a new factory client always gets a new handler/connection pool.
- Casting the factory's .NET 9+ default primary handler to `HttpClientHandler`.
- Assuming a keyed scoped `HttpClient` gives its pooled handler the same request scope.
- Registering a keyed transient `HttpClient` and resolving it repeatedly from a long-lived scope.
- Capturing `HttpContext` or user state inside a pooled `DelegatingHandler`.
- Sharing handler `CookieContainer` state between unrelated users/services.
- Mutating `DefaultRequestHeaders` concurrently for request-specific tokens.
- Buffering unbounded content with `GetStringAsync`/`ResponseContentRead`.
- Leaving `HttpResponseMessage`/stream undisposed and reducing connection reuse.
- Logging authorization/cookie/API-key headers.
- Treating `MaxConnectionsPerServer` as a total request concurrency limit for every HTTP version.

## Knowledge checks with answers

1. **What is pooled by `IHttpClientFactory`?** The message handlers and their connection pools; `HttpClient` objects are created per request to the factory.
2. **What refreshes DNS for a long-lived client?** New connections after configured connection lifetime; an existing connection does not continually re-resolve DNS.
3. **Why avoid a typed client in a singleton?** It holds a specific client/handler and can outlive handler rotation.
4. **Why are handler scopes dangerous for request identity?** They differ from incoming request scopes and are pooled/reused across requests.
5. **When is factory pooling unsuitable?** When the app relies on isolated/durable per-user cookie-container state.
6. **What changed in .NET 9 for factory clients?** Keyed DI became available through `AddAsKeyed`; on supported platforms the default primary handler also changed to `SocketsHttpHandler` and aligns pooled connection lifetime with handler lifetime.
7. **Does `ResponseHeadersRead` keep `HttpClient.Timeout` active while the body is read?** No. The caller must bound body consumption separately and dispose the response/stream.

## Sources

- [Use IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory)
- [Troubleshoot IHttpClientFactory issues](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-troubleshooting)
- [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines)
- [IHttpClientFactory API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.ihttpclientfactory)
- [HttpClient API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient)
- [Keyed DI support in IHttpClientFactory](https://learn.microsoft.com/en-us/dotnet/core/extensions/httpclient-factory-keyed-di)
- [HttpClientFactory .NET 9 handler change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/networking/9.0/default-handler)
- [SocketsHttpHandler API](https://learn.microsoft.com/en-us/dotnet/api/system.net.http.socketshttphandler)

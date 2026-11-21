
# streams file system serialization sockets and HTTP clients — Reference: DNS endpoints, sockets, TCP and UDP helpers, HttpClient request/response, and safe transport use

# Scope and version

This lesson covers the complete `network-socket-and-http-client` inventory for .NET 11. Network behavior also depends on the operating system, network, protocol, and remote service. Sources: [sockets overview](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/sockets/sockets-overview), [TCP classes](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/sockets/tcp-classes), [HttpClient guidelines](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/http/httpclient-guidelines), and [HTTP client factory](https://learn.microsoft.com/en-us/dotnet/core/extensions/http-client).

# How this group fits the mental model

DNS maps names to addresses; endpoints combine address and port; sockets implement transports. TCP is a connection-oriented ordered byte stream, so application framing remains necessary. UDP sends discrete datagrams without TCP's delivery guarantees. HTTP libraries build request/response semantics over pooled transports. Timeouts, cancellation, retries, body-size limits, status handling, and disposal must be designed together.

# Supplied names explained

| Supplied name | Meaning and important behavior |
|---|---|
| `IPAddress` | Represents an IPv4/IPv6 network address. |
| `IPAddress.Parse(String)` | Parses textual address or throws on invalid input; user input should usually use `TryParse`. |
| `IPAddress.TryParse(String,IPAddress)` | Attempts to parse and returns success plus parsed address; modern nullable annotations may indicate null on failure. |
| `IPAddress.Any` | IPv4 wildcard address for binding a socket to all local IPv4 interfaces. |
| `IPAddress.IPv6Any` | IPv6 wildcard address; dual-mode behavior is a separate socket setting. |
| `IPAddress.Loopback` | IPv4 loopback address for the local host. |
| `IPAddress.IPv6Loopback` | IPv6 loopback address. |
| `IPEndPoint` | Combines an IP address and port; port range and address-family compatibility matter. |
| `Dns.GetHostAddressesAsync(String,CancellationToken)` | Asynchronously resolves a host name to addresses; DNS caching/ordering and network errors are outside application control. |
| `Dns.GetHostEntryAsync(String,CancellationToken)` | Asynchronously resolves host information, potentially including aliases/address list. |
| `Dns.GetHostName()` | Returns the local machine's host name; not necessarily a public DNS name. |
| `AddressFamily.InterNetwork` | IPv4 address family. |
| `AddressFamily.InterNetworkV6` | IPv6 address family. |
| `SocketType.Stream` | Stream-oriented socket type commonly used with TCP. |
| `SocketType.Dgram` | Datagram socket type commonly used with UDP. |
| `ProtocolType.Tcp` | TCP transport protocol selector. |
| `ProtocolType.Udp` | UDP transport protocol selector. |
| `Socket` | Low-level transport endpoint API for binding, connecting, accepting, and sending/receiving. |
| `Socket.Bind(EndPoint)` | Associates a local endpoint (address/port) with the socket. |
| `Socket.Listen(Int32)` | Marks a bound stream socket as listening with a backlog hint. |
| `Socket.AcceptAsync(CancellationToken)` | Asynchronously accepts an incoming connection and returns a new connected socket. |
| `Socket.ConnectAsync(EndPoint,CancellationToken)` | Asynchronously connects to a remote endpoint; handle timeout/cancellation and connection errors. |
| `Socket.SendAsync(ReadOnlyMemory<Byte>,SocketFlags,CancellationToken)` | Sends some bytes and returns count; loop for full application message when required. |
| `Socket.ReceiveAsync(Memory<Byte>,SocketFlags,CancellationToken)` | Receives available bytes; TCP may return a partial message or zero on graceful shutdown. |
| `Socket.SendToAsync(ReadOnlyMemory<Byte>,SocketFlags,EndPoint,CancellationToken)` | Sends a datagram to an endpoint; datagram size/network limits apply. |
| `Socket.ReceiveFromAsync(Memory<Byte>,SocketFlags,EndPoint,CancellationToken)` | Receives a datagram and reports sender endpoint; buffer truncation/packet size must be handled. |
| `Socket.Shutdown(SocketShutdown)` | Disables send, receive, or both directions on a connected socket; it is distinct from disposal. |
| `Socket.Disconnect(Boolean)` | Disconnects a socket and optionally permits reuse where supported; protocol state must be reset. |
| `Socket.Connected stale state limitation` | Reports last known connection state, not a live guarantee; the next I/O can still fail. |
| `Socket.NoDelay` | Disables Nagle's algorithm for TCP to reduce small-write latency at possible packet/overhead cost. |
| `Socket.ReceiveBufferSize` | Configures/request receive-buffer size; OS may adjust and it is not an application framing limit. |
| `Socket.SendBufferSize` | Configures/request send-buffer size; OS buffering does not mean remote delivery. |
| `Socket.LingerState` | Controls close behavior for unsent data; blocking linger can delay disposal and semantics vary. |
| `SocketOptionName.ReuseAddress` | Platform-specific socket reuse behavior; do not assume identical security or binding semantics across OSes. |
| `SocketAsyncEventArgs` | Event-based async socket pattern useful for high-throughput reusable operations; lifecycle and concurrent-use rules are explicit. |
| `TcpClient` | Higher-level TCP client that owns a socket and exposes a `NetworkStream`. |
| `TcpClient.ConnectAsync(String,Int32,CancellationToken)` | Resolves/connects to host and port asynchronously; handle DNS and connection cancellation separately as needed. |
| `TcpClient.GetStream()` | Returns a stream over the connected socket; TCP message framing remains the caller's protocol responsibility. |
| `TcpClient.NoDelay` | Controls TCP Nagle behavior on its socket. |
| `TcpClient.ReceiveTimeout` | Timeout for synchronous receive operations; async cancellation tokens are the appropriate async timeout mechanism. |
| `TcpClient.SendTimeout` | Timeout for synchronous sends; not a replacement for async cancellation. |
| `TcpClient.Dispose()` | Closes/releases client and its owned socket/stream. |
| `TcpListener` | Higher-level TCP server listener. |
| `TcpListener.Start(Int32)` | Starts listening with a backlog hint. |
| `TcpListener.AcceptTcpClientAsync(CancellationToken)` | Async accepts a connection wrapped in `TcpClient`. |
| `TcpListener.AcceptSocketAsync(CancellationToken)` | Async accepts a raw connected `Socket`. |
| `TcpListener.Stop()` | Stops listening and closes the listening socket; accepted clients are separate resources. |
| `NetworkStream` | Stream wrapper over a connected socket; normally non-seekable and does not add framing. |
| `NetworkStream.ReadTimeout` | Timeout for synchronous reads; async reads should use cancellation. |
| `NetworkStream.WriteTimeout` | Timeout for synchronous writes; async writes should use cancellation. |
| `NetworkStream.Socket` | Underlying socket, whose state/lifetime can affect the stream. |
| `NetworkStream ownsSocket option` | Constructor option determines whether disposing the stream closes the socket; choose a single clear owner. |
| `UdpClient` | Convenience wrapper for UDP datagrams and endpoint handling. |
| `UdpClient.SendAsync(Byte[],Int32,IPEndPoint)` | Sends the specified byte count as a datagram to an endpoint; not a byte-stream write. |
| `UdpClient.ReceiveAsync(CancellationToken)` | Receives one datagram with sender information; cancellation and maximum datagram size matter. |
| `UdpClient.Connect(String,Int32)` | Sets a default remote peer for send/receive filtering; UDP connect performs no TCP-style handshake. |
| `UdpClient.Client` | Exposes the underlying socket; mixing direct operations with wrapper operations requires coordination. |
| `HttpClient` | High-level HTTP client using a handler and connection pool; reuse long-lived clients or use factory-managed clients. |
| `HttpClient.BaseAddress` | Base URI used to resolve relative request URIs; set before requests and understand URI combination rules. |
| `HttpClient.DefaultRequestHeaders` | Headers applied to requests; avoid mutating shared defaults concurrently or setting per-user state globally. |
| `HttpClient.Timeout` | Overall timeout for operations unless overridden by per-request cancellation; timeout exceptions can surface as cancellation-related failures. |
| `HttpClient.DefaultRequestVersion` | Default HTTP version requested for outgoing requests. |
| `HttpClient.DefaultVersionPolicy` | Controls whether the requested version is exact, lower, or higher preference according to policy. |
| `HttpClient.GetAsync(Uri,HttpCompletionOption,CancellationToken)` | Sends GET and returns response; completion option controls whether content is buffered first. |
| `HttpClient.GetStringAsync(Uri,CancellationToken)` | GET convenience that reads entire content as a string and checks success; avoid unbounded bodies. |
| `HttpClient.GetByteArrayAsync(Uri,CancellationToken)` | GET convenience that buffers entire body into an array. |
| `HttpClient.GetStreamAsync(Uri,CancellationToken)` | GET convenience returning response content stream; dispose it and enforce read limits. |
| `HttpClient.SendAsync(HttpRequestMessage,HttpCompletionOption,CancellationToken)` | Sends a request with explicit completion policy and cancellation; dispose request and response according to ownership. |
| `HttpClient.Send(HttpRequestMessage,HttpCompletionOption,CancellationToken)` | Synchronous send API; blocks caller and should be avoided in scalable async code. |
| `HttpRequestMessage` | Mutable request description with method, URI, headers, and content; dispose after use. |
| `HttpRequestMessage.Method` | HTTP method token such as GET/POST. |
| `HttpRequestMessage.RequestUri` | Target URI; validate untrusted destinations to prevent SSRF. |
| `HttpRequestMessage.Headers` | Request headers excluding content headers; do not place secrets in URLs/logs. |
| `HttpRequestMessage.Content` | Optional request body; content has its own headers and disposal behavior. |
| `HttpResponseMessage` | Response status, headers, and content; dispose to release resources/connection reuse promptly. |
| `HttpResponseMessage.StatusCode` | Numeric/enum HTTP status; application must decide which statuses are expected. |
| `HttpResponseMessage.IsSuccessStatusCode` | True for 2xx status codes. |
| `HttpResponseMessage.EnsureSuccessStatusCode()` | Throws when status is not successful; call only when non-2xx is exceptional and preserve useful error context. |
| `HttpResponseMessage.Headers` | Response headers not associated with content; values may be multiple/typed. |
| `HttpResponseMessage.Content` | Body content abstraction; bound reads and dispose response/content. |
| `HttpResponseMessage.Dispose()` | Disposes response and content resources, enabling timely connection resource release. |
| `HttpContent.ReadAsStringAsync(CancellationToken)` | Buffers and decodes the entire body to a string; avoid for unbounded input. |
| `HttpContent.ReadAsByteArrayAsync(CancellationToken)` | Buffers full body into a byte array. |
| `HttpContent.ReadAsStreamAsync(CancellationToken)` | Returns a content stream for incremental processing; caller manages response lifetime. |
| `HttpContent.CopyToAsync(Stream,CancellationToken)` | Copies content to a destination stream; caller should enforce maximum bytes if source is untrusted. |
| `StringContent` | HTTP content from text with configured media type/encoding. |
| `ByteArrayContent` | HTTP content backed by a byte array; retain it until request is sent/disposed. |
| `StreamContent` | HTTP content backed by a stream; stream lifetime/rewindability affects retries and resends. |
| `FormUrlEncodedContent` | Encodes key/value pairs as `application/x-www-form-urlencoded`. |
| `MultipartFormDataContent` | Constructs multipart form-data content and boundaries; dispose nested content and validate upload sizes. |
| `HttpMethod.Get` | Standard safe/idempotent retrieval method by definition, though server behavior must still be correct. |
| `HttpMethod.Post` | Common method for submission/action; not inherently idempotent, so retries may duplicate effects. |
| `HttpMethod.Put` | Typically replaces target representation and is defined as idempotent, but actual service semantics must honor it. |
| `HttpMethod.Patch` | Partial update method; idempotency depends on the patch operation and API contract. |
| `HttpMethod.Delete` | Requests deletion; HTTP method semantics are idempotent but responses/state may vary. |
| `HttpCompletionOption.ResponseContentRead` | Default-style behavior buffers response content before the send task completes. |
| `HttpCompletionOption.ResponseHeadersRead` | Completes after headers; caller streams body and is responsible for bounded read/disposal. |
| `SocketsHttpHandler` | Primary modern HTTP transport handler; configures pooling, lifetime, decompression, proxies, TLS, and other transport behavior. |
| `SocketsHttpHandler.PooledConnectionLifetime` | Maximum reuse lifetime for pooled connections; rotate connections so DNS changes can be observed after expiry. |
| `SocketsHttpHandler.PooledConnectionIdleTimeout` | Closes idle pooled connections after a configured interval. |
| `SocketsHttpHandler.MaxConnectionsPerServer` | Limits concurrent connections per server; queueing/capacity behavior should be matched to workload. |
| `SocketsHttpHandler.AutomaticDecompression` | Enables decompression of supported encodings; still enforce a limit on expanded body bytes. |
| `IHttpClientFactory.CreateClient(String)` | Creates a configured client using managed handler lifetime/pooling; clients are intended to be short-lived and lightweight. |
| `IHttpClientBuilder.AddHttpMessageHandler` | Adds a delegating handler for cross-cutting request/response behavior; handler lifetime and thread safety matter. |
| `IHttpClientBuilder.ConfigurePrimaryHttpMessageHandler` | Configures the underlying transport handler, often `SocketsHttpHandler`. |
| `IHttpClientBuilder.SetHandlerLifetime` | Sets how long factory-managed handlers are pooled before rotation. |
| `Named HttpClient` | Factory-configured client selected by a string name for a particular remote service/configuration. |
| `Typed HttpClient` | Client class with dependencies/configuration injected by the factory, providing a typed API boundary. |
| `HttpClient handler connection pool lifetime` | Connection reuse belongs to the underlying handler; disposing clients does not necessarily immediately dispose a factory-pooled handler. |
| `DNS refresh and PooledConnectionLifetime` | Existing connections do not continuously re-resolve DNS; finite connection lifetime enables new connections to observe changed addresses. |
| `HttpClient per-request construction socket exhaustion risk` | Repeatedly creating/disposing handlers can churn connections and exhaust ephemeral ports; reuse handlers/client pools. |
| `HttpClient.Timeout versus CancellationToken timeout` | Global client timeout and per-operation token can race/compose; use a clear end-to-end deadline and propagate cancellation. |
| `HttpRequestException.StatusCode` | Optional HTTP status associated with an exception, useful for status failures; transport failures may have none. |
| `HttpRequestError` | Categorizes HTTP request failures in current .NET; use it for diagnostics, not as a replacement for handling exceptions/statuses. |
| `HttpVersion.Version20` | HTTP/2 version identifier. |
| `HttpVersion.Version30` | HTTP/3 version identifier. |
| `HttpVersionPolicy.RequestVersionOrHigher` | Requests the specified version or a higher supported version according to negotiated transport. |
| `HTTP retry idempotency boundary` | Retry only when repeated execution is safe under method/API semantics and request content can be replayed. |
| `HTTP response body size limit` | Enforce cumulative bytes while streaming; declared content length can be absent or inaccurate. |
| `HTTP content streaming with ResponseHeadersRead` | Read response body incrementally after headers, enabling backpressure and explicit limits. |
| `HTTP content decompression limit` | Limit decompressed bytes; automatic decompression does not prevent expansion attacks. |
| `Socket framing over TCP byte stream` | Add protocol framing (length prefix/delimiter) because TCP reads/writes do not correspond to messages. |
| `TCP delivery order and connection semantics` | TCP provides reliable ordered bytes while a connection is viable, but connection failure and application-level acknowledgement still matter. |
| `UDP datagram boundaries and delivery limitations` | Each receive returns a datagram, but UDP does not guarantee delivery, ordering, or duplicate suppression. |
| `TLS transport versus application authentication` | TLS protects/authenticates a transport endpoint according to certificate validation; user identity/authorization is an application concern. |
| `Cancellation and timeout propagation to network operations` | Pass tokens through DNS/connect/send/read; define a total deadline so nested phases do not each consume a full independent timeout. |

# Cross-item comparison

| Choice | Best fit | Important caution |
|---|---|---|
| `Socket` | Custom transport control/high-throughput protocols. | More lifecycle, framing, partial-send, and platform work. |
| `TcpClient`/`TcpListener` | Common TCP client/server patterns. | Still a byte stream; define message framing. |
| `UdpClient` | Datagram protocols. | Loss, duplication, reordering, and size constraints. |
| Long-lived `HttpClient` + `PooledConnectionLifetime` | Stable client configuration with DNS-aware connection rotation. | Manage client/handler lifetime deliberately. |
| `IHttpClientFactory` | DI apps needing named/typed configuration and handler pooling. | Avoid capturing typed clients in singletons beyond handler policy. |
| `ResponseContentRead` / `ResponseHeadersRead` | Small bounded body / large or bounded streaming body. | Streaming makes caller responsible for content limits and disposal. |

# Examples

```csharp
using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

static async Task DownloadAsync(
    HttpClient client,
    Uri uri,
    Stream destination,
    long maximumBytes,
    CancellationToken cancellationToken)
{
    using var request = new HttpRequestMessage(HttpMethod.Get, uri);
    using HttpResponseMessage response = await client.SendAsync(
        request,
        HttpCompletionOption.ResponseHeadersRead,
        cancellationToken);

    response.EnsureSuccessStatusCode();
    await using Stream body = await response.Content.ReadAsStreamAsync(cancellationToken);
    byte[] buffer = new byte[8192];
    long total = 0;
    while (true)
    {
        int read = await body.ReadAsync(buffer, cancellationToken);
        if (read == 0) break;
        total += read;
        if (total > maximumBytes)
            throw new InvalidDataException("Response exceeded the configured limit.");
        await destination.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
    }
}
```

Configure one reused client/handler or factory-managed client. Validate untrusted destination URIs, include a total timeout/deadline, and decide whether non-2xx statuses need structured error bodies.

# Common mistakes

- Treating TCP writes as framed messages or assuming one send/receive transfers the full buffer.
- Trusting `Socket.Connected` as a live health check.
- Creating a new `HttpClient`/handler for every request.
- Reading an untrusted body fully with `GetStringAsync`/`GetByteArrayAsync`.
- Retrying a non-idempotent request after an ambiguous failure.
- Forgetting to dispose `HttpRequestMessage`, `HttpResponseMessage`, content, or owned stream.
- Using `HttpClient.Timeout` without propagating cancellation into body processing.
- Assuming automatic decompression prevents a large expansion.
- Confusing TLS server validation with application authorization.

# Knowledge checks with answers

1. **What does `Socket.Connected` prove?** Only last-known state; subsequent I/O can fail.
2. **Why does TCP need framing?** It is an ordered stream with no application message boundaries.
3. **When use `ResponseHeadersRead`?** For incremental body processing and explicit memory/size controls.
4. **How do long-lived clients handle DNS updates?** Rotate pooled connections with finite lifetime or use factory-managed handler lifetimes.
5. **When is automatic retry unsafe?** When the operation may have applied a side effect and is not idempotent or safely deduplicated.

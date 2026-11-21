# end-to-end system design case studies — Reference: SSE token streaming

Sources: [WHATWG HTML: Server-sent events](https://html.spec.whatwg.org/multipage/server-sent-events.html), [MDN: Using server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events), [RFC 9110: HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110).

## Scope and version

Server-sent events (SSE) is a browser-friendly, one-way event stream from server to client over HTTP. It is suitable for token-by-token text output, status updates, notifications, and progress events when the client does not need to send messages over the same stream. The browser `EventSource` API and HTTP server implementation have practical constraints; proxy buffering, timeouts, authentication, and hosting behavior must be verified in the target environment.

## How this group fits the mental model

Use SSE when the client opens a request and the server needs to push a sequence of updates. The response uses the `text/event-stream` media type. Each event is text with fields such as `data:`, optional `event:`, `id:`, and `retry:`, followed by a blank line. A comment line beginning with `:` can serve as a heartbeat and is ignored by the event consumer.

SSE uses ordinary HTTP request/response semantics and works with standard web infrastructure when intermediaries allow a long-lived streaming response. Unlike WebSocket, SSE is unidirectional; the client sends commands through normal HTTP requests. Unlike polling, it avoids repeated request setup while connected. For bidirectional low-latency interaction, compare WebSocket or WebTransport. For simple updates where delay is acceptable, polling or long polling may be operationally easier.

## Supplied names explained

- **SSE**: the server-sent events protocol carried as a long-lived HTTP response with `text/event-stream` content.
- **`EventSource`**: the browser API that consumes the stream and reconnects according to the event-stream rules.
- **`data`**, **`event`**, **`id`**, and **`retry`**: event-stream fields for payload, event type, resume identifier, and suggested reconnection delay.
- **`Last-Event-ID`**: a reconnect cursor sent by the client; the server must implement persistence and replay for it to recover missed events.

## Cross-item comparison

SSE is usually simpler than WebSocket for one-way server updates and uses HTTP response semantics. WebSocket supports bidirectional messages on a persistent connection. Polling is easier to reason about when updates are infrequent or short-lived but adds repeated requests and latency. Webhooks deliver server events to another server, not directly to a browser session.

## Examples

### Event format and browser behavior

An event can contain one or more `data:` lines; multiple lines are joined with newline characters. `event:` sets a named event type, `id:` sets the last-event ID, and `retry:` gives a reconnection delay in milliseconds. The stream is UTF-8. An empty line dispatches the accumulated event. A server should send complete event boundaries and flush output promptly; generating a token does not mean the browser receives it if a proxy buffers the response.

The browser’s `EventSource` reconnects after a dropped connection by default. It can send `Last-Event-ID` on reconnect when the stream uses event IDs. That header is only a resume hint: the server must retain and replay the corresponding events if lossless continuation is required. Without a durable event log or replay cursor, reconnection merely opens a new stream and may skip or duplicate application-level output. The standard also defines a way to close reconnection with an HTTP 204 response.

Native `EventSource` commonly uses a URL and does not expose arbitrary request-header configuration in the way `fetch` does. Authentication options include same-origin cookies, short-lived scoped stream URLs, or a fetch-based streaming client that parses the event format. Avoid long-lived bearer tokens in query strings because URLs can be logged or copied. Apply CORS, CSRF, authorization, and cache-control rules appropriate to the endpoint.

## Streaming generated tokens

For an AI response, the backend can translate model-provider chunks into application events such as `event: token` with `data:` content, followed by a terminal `event: done` or a structured `event: error`. Define how partial output, cancellation, moderation, tool-call updates, and provider errors appear. Do not assume one provider chunk equals one user-visible token; transport chunk boundaries and tokenizer boundaries are different.

The client should render incremental text safely. If output is Markdown or HTML, do not insert partial untrusted text as executable HTML. Buffer and sanitize according to the rendering policy. Let users cancel by sending a separate authenticated request; the server should cancel upstream generation where supported and release resources. Handle disconnects, but do not assume a disconnected browser means the generation must stop if the operation is meant to continue.

## Backpressure and scaling

A slow client can cause buffers to grow. Bound per-connection memory, detect write backpressure, and decide whether to pause the upstream producer, drop nonessential progress events, or terminate the stream. Set idle timeouts and send heartbeats before intermediary timeouts. For large numbers of concurrent connections, budget file descriptors, memory, load-balancer connection limits, and server worker model. Keep event payloads small and avoid broadcasting every internal token to every subscriber.

If multiple application instances serve reconnects, event replay needs shared durable state or sticky routing with carefully bounded failure assumptions. A pub/sub bus can distribute live events but often does not retain them for replay. A durable log with offsets can support resume, but introduces retention and authorization concerns. Use per-user or per-job authorization on every reconnect; event IDs are not secret capabilities.

### Example event stream

```text
retry: 3000
: connected

event: token
data: Hello

event: token
data:  world

id: response-42:3
event: done
data: {"finishReason":"stop"}

```

The client treats the `token` events as incremental content and the `done` event as the logical completion marker. For resumable output, the server must associate the ID with stored output and decide whether reconnect replays the final event or resumes after it. Define duplicate handling at the application level.

## Common mistakes

- Assuming SSE is bidirectional.
- Assuming TCP chunk boundaries or provider token boundaries match SSE event boundaries.
- Believing `Last-Event-ID` automatically replays missing data.
- Forgetting proxy buffering, idle timeouts, and connection limits.
- Sending sensitive credentials in stream URLs or leaking user-specific events through shared caches.
- Rendering streamed output as trusted HTML.
- Leaving upstream model generation running after client cancellation when cancellation is expected.

## Knowledge checks with answers

1. **What is the SSE response media type?** `text/event-stream`.
2. **Does automatic reconnect guarantee no event loss?** No. The application must persist and replay events using IDs or another cursor.
3. **When choose WebSocket instead?** When both sides need frequent messages over one persistent bidirectional connection or the protocol requires richer interaction.
4. **What does a blank line do in an SSE stream?** It terminates and dispatches the currently accumulated event.

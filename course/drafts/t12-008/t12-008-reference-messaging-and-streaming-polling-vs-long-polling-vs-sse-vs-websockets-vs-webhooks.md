# system design tradeoffs and decision methods — Reference: Polling vs long-polling vs SSE vs WebSockets vs webhooks

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [HTTP Semantics, RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [WHATWG Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html), [WebSocket Protocol, RFC 6455](https://www.rfc-editor.org/rfc/rfc6455), [WHATWG WebSockets](https://websockets.spec.whatwg.org/).

## Scope and version

These are ways to deliver updates across a network. Decide who initiates communication, direction, latency, connection count, replay/recovery, authentication, and what happens when the client or receiver is offline.

## How this group fits the mental model

**Polling:** client repeatedly requests current state. It is simple and works through ordinary HTTP infrastructure, but creates repeated requests and latency tied to the interval.

**Long polling:** the server holds a request until an update or timeout, then the client reconnects. It reduces empty responses but still uses repeated HTTP requests and needs proxy timeouts/reconnect handling.

**SSE:** server-to-client event stream over HTTP, with browser EventSource reconnection and event IDs. It is one-way; clients send commands separately. Define replay retention and authentication; reconnect does not itself guarantee durable delivery.

**WebSocket:** upgraded persistent, bidirectional framed connection. It suits interactive two-way messages, but needs connection lifecycle, heartbeats, backpressure, auth expiry, fan-out, and reconnect/resume logic at the application layer.

**Webhook:** server makes an HTTP callback to a registered receiver, usually for server-to-server events. Delivery can be delayed/duplicated/failed; sign requests, retry with bounds, include event IDs, and provide replay/verification.

## Supplied names explained

None guarantees that every business event is processed exactly once. Design event IDs, acknowledgements where applicable, idempotency, durable queues, ordering scope, and replay independently from the transport.

## Cross-item comparison

| Need | Fit to consider | Key operational issue |
|---|---|---|
| Simple low-rate refresh | Polling | Empty traffic and interval latency |
| Wait for one update then request again | Long polling | Connection/proxy timeout and reconnect |
| Continuous server-to-browser updates | SSE | One-way channel, replay and auth policy |
| Interactive two-way session | WebSocket | Persistent connection scale and backpressure |
| Notify another server of an event | Webhook | Retry, signing, idempotency, receiver availability |

## Examples

An order-status page can use SSE for server-to-browser updates and a normal HTTP command to cancel; if the tab disconnects, reconnect with a last event ID and fetch the current order snapshot to close gaps. A payment provider webhook should be signature-verified, stored durably before acknowledgement, deduplicated by event ID, and retried/reconciled if delivery fails. A WebSocket is justified if the browser also sends frequent interactive messages over the same session.

## Common mistakes

- Choosing WebSockets for one-way notifications without needing bidirectional interaction.
- Assuming SSE reconnect guarantees the server retained and replayed every missed event.
- Treating a webhook as a synchronous RPC or assuming one delivery only.
- Omitting backpressure, connection limits, proxy timeouts, heartbeat, auth expiry, and resume behavior.

## Knowledge checks with answers

1. **Which option is one-way server-to-browser over HTTP?** SSE.
2. **Which options require the client to initiate or register delivery?** Polling/long polling initiate requests; webhooks require a registered callback endpoint.
3. **What should an SSE client do after reconnect to avoid a gap?** Use event IDs/replay when supported and reconcile with an authoritative snapshot.

# system design foundations and infrastructure building blocks — Reference: Network path and transport behavior

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.rfc-editor.org/rfc/rfc9846), [reference 3](https://www.rfc-editor.org/rfc/rfc9293), [reference 4](https://www.rfc-editor.org/rfc/rfc6455), [reference 5](https://www.rfc-editor.org/rfc/rfc9000), [reference 6](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 7](https://hld.handbook.academy/curriculum/prerequisites/), [reference 8](https://hld.handbook.academy/curriculum/building-blocks/), [reference 9](https://man7.org/linux/man-pages/man7/epoll.7.html), [reference 10](https://man7.org/linux/man-pages/man7/io_uring.7.html), [reference 11](https://man.freebsd.org/cgi/man.cgi?query=kqueue), [HTTP/2](https://www.rfc-editor.org/rfc/rfc9113), [HTTP/3](https://www.rfc-editor.org/rfc/rfc9114), [TLS service identity](https://www.rfc-editor.org/rfc/rfc9525), [TLS deployment guidance](https://www.rfc-editor.org/rfc/rfc9325), [WHATWG Server-Sent Events](https://html.spec.whatwg.org/multipage/server-sent-events.html), [HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112), [HTTP/1.1 upgrade security update](https://www.rfc-editor.org/rfc/rfc9931), [WebSocket over HTTP/2](https://www.rfc-editor.org/rfc/rfc8441), [DNS standards](https://www.rfc-editor.org/rfc/rfc1034).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

TLS 1.3 is specified by RFC 9846 (July 2026), which obsoletes RFC 8446 while retaining version number 1.3 and backward compatibility. Relative to RFC 8446, it clarifies and tightens requirements, forbids KeyShare reuse between connections, and forbids negotiating TLS 1.0 or TLS 1.1. This is a short edition note; use the current specification and implementation guidance for deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `DNS` — Maps a hostname to address records; caching, TTLs, and resolver behavior affect change propagation and lookup latency.
- `TCP` — Reliable ordered byte stream with connection establishment and congestion control; application messages need framing.
- `TLS` — Establishes a secure channel designed to protect confidentiality and integrity and detect tampering. Authentication is performed through certificates or another mechanism selected by the application protocol; clients must validate the intended peer identity, and mutual client authentication is optional.
- `HTTP/1.1` — Text-based request/response messaging with persistent connections and optional pipelining. Requests on one connection are sequential, so pipelining has application-level head-of-line blocking. RFC 9931 (2026) updates transition-security requirements: clients and proxies must not optimistically treat untrusted bytes as the new protocol before an HTTP/1.1 upgrade or CONNECT is accepted.
- `HTTP/2` — Multiplexes streams over one connection and compresses headers; packet loss can still delay all streams at the transport layer.
- `HTTP/3` — Maps HTTP semantics onto QUIC over UDP, reducing transport-level head-of-line blocking between streams while retaining network and server constraints.
- `WebSocket` — Provides full-duplex, framed messages after an opening handshake. The classic RFC 6455 mechanism uses HTTP/1.1 Upgrade; RFC 8441 defines bootstrapping WebSocket over HTTP/2 using extended CONNECT. Support depends on both endpoints and intermediaries. Connection lifetime, authorization, heartbeats, replay, backpressure, and fan-out remain application responsibilities.
- `Server-Sent Events (SSE)` — Provides a one-way server-to-client event stream over HTTP; reconnect and event IDs can aid recovery, while client-to-server actions use another request path.

## Cross-item comparison

DNS finds an address; it does not prove the destination is trustworthy. TCP provides an ordered byte stream, while TLS protects that stream and authenticates identities according to the negotiated certificate and application checks. HTTP defines request/response semantics. HTTP/1.1, HTTP/2, and HTTP/3 carry those semantics using different message and transport arrangements: HTTP/2 multiplexes streams over TCP, so packet loss can stall progress for all streams on that connection; HTTP/3 uses QUIC streams to reduce transport-level blocking between streams, but they still share connection capacity and congestion control. WebSocket suits ongoing two-way messages; SSE suits a server-to-browser event stream when client commands can use ordinary HTTP requests. Both still require reconnect, authorization, backpressure, and fan-out design.

## Examples

For a live catalog, resolve `shop.example`, establish a validated TLS connection, and fetch product data over HTTP. If the browser also needs stock-change notifications, compare SSE with WebSocket: stock updates flow mostly server-to-client, but a chat or collaborative editor needs frequent messages in both directions. Simulate DNS cache expiry, a certificate for the wrong host, lost TCP connectivity, and a reconnecting event client. State what the user sees and how missed updates are recovered.

## Common mistakes

- Assuming a successful DNS lookup authenticates the server; the client must validate the TLS identity.
- Treating TCP as a message protocol; application framing is needed to delimit messages in a byte stream.
- Assuming HTTP/2 removes transport-level head-of-line blocking on TCP, or HTTP/3 eliminates all shared-capacity contention.
- Choosing WebSocket for every live update; one-way SSE may be simpler, while neither protocol provides application authorization or durable event history by itself.

## Knowledge checks with answers

1. **Why can packet loss delay multiple HTTP/2 streams on one connection?** They share TCP's ordered byte stream; later bytes wait behind missing earlier bytes.
2. **What does HTTP/3 improve, and what does it not remove?** QUIC streams avoid transport-level blocking between independent streams, but share connection capacity and can still be limited by congestion or server resources.
3. **When is SSE a reasonable fit over WebSocket?** When the server mainly pushes updates to the client and client actions can use ordinary HTTP requests.

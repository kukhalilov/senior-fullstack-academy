# End-to-end browser navigation and web request lifecycle — Reference: DNS, address selection, transport, and TLS

## Scope and version

Protocol setup varies with cached state, browser implementation, proxy topology, and negotiated HTTP version. Do not teach a single handshake count as universal.

## How this group fits the mental model

The browser must reach an endpoint and authenticate it before sending protected HTTP. Name resolution, address selection, transport, TLS, and application protocol negotiation answer different questions.

## Supplied names explained

- `DNS resolver cache` — A resolver or browser may reuse a recent answer within its lifetime. Cache state changes whether a lookup is visible in a request waterfall.
- `Recursive DNS resolution` — A recursive resolver obtains DNS answers on behalf of a client by consulting the DNS hierarchy or its cache. Client-to-resolver and resolver-to-authority traffic are distinct network paths.
- `A and AAAA address records` — DNS record types that map a name to IPv4 and IPv6 addresses respectively. A name may return multiple addresses or one family only.
- `Happy Eyeballs address racing` — A client strategy that starts connection attempts across address families with a controlled delay to avoid a broken IPv6 path blocking a usable IPv4 path, or vice versa.
- `TCP three-way handshake` — TCP establishes a reliable byte stream with SYN, SYN-ACK, and ACK exchange. It is separate from TLS and HTTP negotiation.
- `QUIC connection establishment` — QUIC provides a secure multiplexed transport over UDP and integrates TLS 1.3 handshake use. Resumption, address validation, and connection migration alter details; do not equate its setup to TCP then TLS.
- `TLS handshake` — The peers negotiate cryptographic parameters, authenticate the server as configured, and derive traffic keys. Session resumption and protocol versions change the exchange.
- `Certificate chain and hostname validation` — The client checks a certificate path to a trusted anchor and that the certificate identity matches the requested host. A valid chain alone does not prove a hostname match.
- `ALPN protocol negotiation` — TLS peers can negotiate an application protocol such as HTTP/2 or HTTP/1.1, subject to supported options. HTTP/3 uses QUIC’s protocol negotiation path.
- `TLS session resumption` — A prior session can be resumed to reduce handshake work. It does not mean an unauthenticated or unencrypted connection.
- `SNI and encrypted client hello boundary` — SNI traditionally indicates the requested hostname during TLS setup; Encrypted Client Hello can protect the true server name when the client, DNS configuration, and server support it. Destination IP and traffic metadata can remain observable.
- `HTTP/1.1 connection reuse` — Multiple sequential requests can share a persistent connection when its rules and state permit. It generally does not multiplex independent responses like HTTP/2.
- `HTTP/2 multiplexing` — Multiple streams can share one HTTP/2 connection. Stream-level concurrency does not remove all connection-level network effects.
- `HTTP/3 over QUIC` — HTTP/3 maps HTTP semantics onto QUIC streams over UDP, rather than TCP. Support and negotiation depend on browser, server, and network path.

## Cross-item comparison

DNS finds addresses; Happy Eyeballs chooses among paths; TCP or QUIC supplies transport; TLS authenticates and protects traffic; ALPN or QUIC negotiation selects HTTP. HTTP/1.1 reuse, HTTP/2 multiplexing, and HTTP/3 over QUIC have distinct connection models.

## Examples

If a cold request shows DNS, connect, and TLS timing, investigate each component. If a warm request shows zero DNS or connection setup, the browser may have reused state. If IPv6 attempts stall while IPv4 succeeds, inspect address-family reachability and racing. Do not infer a certificate failure solely from a connection timeout.

## Common mistakes

- Counting TCP plus TLS round trips as a fixed delay for every request.
- Saying HTTP/2 always uses one connection for all origins.
- Saying HTTP/3 is HTTP/2 with a different header compression scheme.
- Treating DNS as a direct single query from browser to authoritative server.
- Confusing certificate chain trust with hostname verification.

## Knowledge checks with answers

1. Which protocol uses QUIC over UDP? HTTP/3.
2. What does ALPN help negotiate? An application protocol over a TLS connection.
3. Why can a warm request have no visible DNS/connect/TLS? Cached DNS or a reused connection may avoid those stages.

### Sources

- [RFC 1034: Domain names](https://www.rfc-editor.org/rfc/rfc1034.html)
- [RFC 8305: Happy Eyeballs v2](https://www.rfc-editor.org/rfc/rfc8305.html)
- [RFC 9293: TCP](https://www.rfc-editor.org/rfc/rfc9293.html)
- [RFC 9000: QUIC](https://www.rfc-editor.org/rfc/rfc9000.html)
- [RFC 9114: HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)
- [RFC 9846: TLS 1.3](https://www.rfc-editor.org/rfc/rfc9846.html)

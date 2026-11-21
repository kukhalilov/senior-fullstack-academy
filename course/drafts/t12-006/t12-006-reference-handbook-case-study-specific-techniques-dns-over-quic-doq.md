# end-to-end system design case studies — Reference: DNS over QUIC (DoQ)

Sources: [RFC 9250: DNS over Dedicated QUIC Connections](https://www.rfc-editor.org/rfc/rfc9250.html), [RFC 7858: DNS over TLS](https://www.rfc-editor.org/rfc/rfc7858.html), [RFC 8310: DNS privacy usage profiles](https://www.rfc-editor.org/rfc/rfc8310.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html).

## Scope and version

DNS over QUIC (DoQ) is standardized by RFC 9250 as DNS messages mapped directly onto dedicated QUIC connections. It can serve stub-to-recursive, recursive-to-authoritative, and nameserver-to-nameserver scenarios. DoQ is distinct from DNS over HTTP/3: both can use QUIC, but DoH retains HTTP request/response semantics while DoQ uses its own DNS-to-QUIC stream mapping. Verify current resolver/client implementation support and authentication profile.

## How this group fits the mental model

QUIC provides encrypted transport with multiplexed streams. RFC 9250 maps each DNS query/response transaction to a separate QUIC stream, allowing independent transactions to complete without waiting for earlier streams blocked by packet loss. A connection can be reused for multiple queries. The design aims for privacy properties similar to DoT and latency characteristics similar to DNS over UDP, but real performance depends on connection reuse, network loss, server location, and implementation.

Encrypted transport does not hide the query from the recursive resolver, which must resolve it. A client must authenticate the resolver under its chosen usage profile; otherwise encryption alone may not prevent active endpoint substitution. DoQ also does not prevent a network from blocking QUIC or port 853. Define an explicit fallback policy and understand whether it can send queries in cleartext.

## Supplied names explained

- **DoQ**: DNS-over-QUIC mapping defined in RFC 9250. It uses dedicated QUIC connections, not HTTP semantics.
- **QUIC connection**: encrypted transport connection supporting independent streams, congestion control, connection IDs, and migration behavior. Connection lifecycle and resource limits are operational concerns.
- **DNS transaction stream**: RFC 9250 maps a query/response transaction to a QUIC stream so parallel DNS responses need not be delivered in query order.
- **Port selection**: RFC 9250 reserves UDP port 853 for DoQ; a mutually agreed alternative such as UDP 443 may be operationally useful but requires shared configuration/discovery.
- **Server authentication**: DoQ follows DNS privacy usage-profile guidance for authenticating the intended resolver. The resolver still sees and can log queries.
- **0-RTT/session resumption**: QUIC can reduce connection setup latency on resumed sessions. Early data has replay/privacy considerations; clients and servers should follow RFC 9250’s guidance rather than enabling it without review.
- **Fallback**: if DoQ connection establishment fails, clients may use DoT or another configured transport depending on policy. Fallback to cleartext DNS weakens confidentiality and must be an intentional choice.

## Cross-item comparison

DoQ is a direct DNS mapping over QUIC with independent stream delivery. DoT maps DNS over TLS over TCP and uses a dedicated TCP service, conventionally port 853. DoH maps DNS messages into HTTP exchanges and may use HTTP/3, gaining HTTP proxy/cache behavior while adding HTTP semantics. Classic UDP DNS has low setup overhead but no transport confidentiality and can be modified by on-path actors.

The preferred protocol depends on client/resolver support, enterprise firewall policy, endpoint discovery, connection behavior, and privacy requirements. QUIC’s reduced head-of-line blocking does not guarantee lower DNS latency when the connection is cold or the resolver is far away.

## Examples

A stub sends simultaneous A and AAAA queries over a reused DoQ connection. Each transaction uses its own stream, so loss affecting one stream need not block delivery of the other transaction’s response. The resolver validates and processes both, then returns DNS messages over their respective streams. The client authenticates the configured resolver, handles errors, and applies DNS cache TTLs as usual.

For a mobile client changing networks, QUIC connection migration may help retain connectivity where supported, but it can reveal network changes and has privacy considerations. Test IPv4/IPv6, UDP blocking, captive portals, connection reuse, 0-RTT behavior, resolver failover, and fallback policy. Monitor connection establishment failures and latency separately from DNS resolution failures.

## Common mistakes

- Calling DNS over HTTP/3 “DoQ”; RFC 9250 defines a direct DNS/QUIC mapping.
- Assuming the resolver cannot see queries because QUIC encrypts the connection.
- Assuming DoQ cannot be blocked by middleboxes.
- Enabling 0-RTT without considering replay and privacy guidance.
- Falling back to cleartext without making the privacy trade-off explicit.
- Treating QUIC’s stream independence as a guarantee of faster DNS in every network.
- Forgetting endpoint authentication and resolver identity configuration.
- Assuming classic DNSSEC validation behavior is replaced by DoQ.

## Knowledge checks with answers

1. **What is the key DoQ transport?** Dedicated QUIC connections with DNS transactions mapped to streams.
2. **Does DoQ use HTTP semantics?** No. DoH does; DoQ defines its own mapping over QUIC.
3. **Can the recursive resolver inspect the question?** Yes. Encryption protects the transport path to that resolver, not the resolver from the query.
4. **Why specify fallback carefully?** A fallback may change privacy, authentication, and availability properties, especially if it uses cleartext DNS.

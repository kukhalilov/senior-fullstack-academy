# end-to-end system design case studies — Reference: DNS over HTTPS (DoH)

Sources: [RFC 8484: DNS Queries over HTTPS](https://www.rfc-editor.org/rfc/rfc8484.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html).

## Scope and version

DNS over HTTPS (DoH), specified by RFC 8484, maps DNS query/response pairs into HTTP exchanges. The standard defines a DNS message media type and HTTP request/response behavior; service discovery, browser policy, proxy configuration, and resolver selection are deployment concerns. DoH can use HTTP versions including HTTP/2 and, where supported, HTTP/3. It encrypts the client-to-DoH-resolver connection but does not conceal queries from that resolver.

## How this group fits the mental model

DoH makes DNS look like an HTTPS application exchange to the network path. This can help it traverse networks that allow ordinary web traffic and lets it use HTTP features such as connection reuse, proxies, caching, and content negotiation. The privacy benefit is protection from passive on-path observation and tampering when TLS authentication is valid. The trade-off is that network operators may have less visibility and control, while the DoH provider gains query visibility.

DoH is not merely arbitrary DNS bytes tunneled through a web page. RFC 8484 defines media types and request forms. A client can send a DNS message using HTTP GET with a base64url-encoded `dns` parameter or HTTP POST with the DNS message in the body and the specified content type. HTTP response status, cache headers, redirects, and content negotiation have defined effects and must be handled correctly.

## Supplied names explained

- **DoH**: DNS query/response mapping over HTTPS as defined in RFC 8484.
- **DoH endpoint**: an HTTPS URI identifying a resolver service and DNS path. Resolver discovery and policy are outside the basic wire protocol and must be securely configured.
- **GET request**: carries a base64url-encoded DNS message in the `dns` query parameter. URLs may be recorded in browser, proxy, and server logs, so request logging and cache policy matter.
- **POST request**: carries the DNS wire-format message in the request body with the DoH media type. It avoids putting the raw query in the URL but still requires careful logging and privacy controls.
- **DNS media type**: `application/dns-message` identifies the DNS message payload; HTTP content negotiation and response type validation are part of the protocol.
- **Resolver identity**: TLS certificate validation authenticates the HTTPS endpoint name. A trusted TLS connection says which resolver endpoint answered, not that every answer is correct or DNSSEC validated.
- **HTTP cache and proxy behavior**: DoH responses can use HTTP caching semantics, but caches must respect DNS TTLs and HTTP directives. Shared caches must not mix responses incorrectly across query names, classes, or types.

## Cross-item comparison

DoH uses HTTP and can share port 443 with websites, gaining compatibility with HTTP proxies and infrastructure. DoT uses a dedicated DNS-over-TLS service, conventionally port 853. DoQ uses a direct DNS mapping over QUIC. DoH can use HTTP/3 and QUIC, but its semantics remain an HTTP mapping, not RFC 9250 DoQ. All three encrypt the client-to-resolver hop when authenticated and leave the resolver able to see queries.

For managed networks, centralized DoH endpoint policy can provide control if clients honor enterprise configuration. Unmanaged browser-level DoH can bypass OS resolver settings and filtering. Decide whether application, OS, or network policy owns resolver choice and make fallback behavior explicit.

## Examples

A browser sends `www.example.test A` as a DoH POST to its configured resolver. It validates the TLS server identity and response content type, then parses the DNS message and returns the result to the application. If a response is cached, the cache honors DNS TTL and HTTP cache directives. If the resolver returns a redirect, the client follows only according to a safe resolver policy; accepting arbitrary redirects could disclose queries to another endpoint.

An enterprise configures a known DoH endpoint and prevents unmanaged resolver overrides through device/browser policy. The endpoint authenticates clients as required, applies rate limits, protects query logs, and monitors latency, errors, cache correctness, and abuse. A fallback to system DNS during endpoint failure is either explicitly allowed or denied; it is never assumed to preserve the same privacy policy.

## Common mistakes

- Assuming HTTPS hides queries from the DoH provider.
- Treating DoH as DNSSEC or a guarantee that answers are correct.
- Assuming all browsers use the operating system’s configured resolver.
- Ignoring query strings in GET URLs and their potential logging exposure.
- Caching responses without respecting DNS and HTTP cache semantics.
- Following redirects to untrusted resolver endpoints.
- Claiming DoH is equivalent to DoQ just because HTTP/3 can run over QUIC.
- Failing to define resolver discovery, enterprise policy, and plaintext fallback.

## Knowledge checks with answers

1. **What does RFC 8484 map to an HTTP exchange?** Each DNS query/response pair.
2. **Which DoH methods carry the DNS message?** GET encodes it in the `dns` URL parameter; POST carries it in the request body.
3. **Can a network resolver provider read a DoH query?** Yes; it terminates the connection and processes the DNS message.
4. **Is DoH the same protocol as DoQ?** No. DoH is DNS over HTTP; DoQ is a dedicated DNS mapping over QUIC.

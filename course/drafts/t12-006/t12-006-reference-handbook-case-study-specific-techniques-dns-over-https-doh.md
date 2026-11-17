# end-to-end system design case studies — Reference: DNS over HTTPS (DoH)

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 8484: DNS Queries over HTTPS](https://www.rfc-editor.org/rfc/rfc8484.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html), [RFC 8932: Recommendations for DNS Privacy Service Operators](https://www.rfc-editor.org/rfc/rfc8932.html), [RFC 4033: DNSSEC introduction and requirements](https://www.rfc-editor.org/rfc/rfc4033.html).

## Scope and version

This lesson covers DNS messages sent to a recursive resolver using the standardized DNS-over-HTTPS protocol in RFC 8484. The RFC specifies DNS message encodings over HTTP, including GET and POST forms. Browser/vendor policies, resolver discovery, caching, HTTP versions, and endpoint configuration can vary; verify current support and implementation settings.

## How this group fits the mental model

DoH carries DNS queries and responses as HTTPS requests to a resolver endpoint. TLS protects the client-to-resolver transport when the client validates the intended endpoint. Because it uses HTTP, DoH can use web infrastructure and ports, but network operators may have less visibility or control over DNS requests, and endpoint policy becomes important. The chosen resolver sees the query; encryption is not anonymity and does not guarantee that queries are not logged.

DoH is a transport for DNS, not a replacement for DNSSEC. DNSSEC provides origin authentication and integrity for signed DNS data; DoH provides confidentiality/integrity in transit on the client-resolver connection. They solve different problems and can be used together.

## Supplied names explained

- **DoH endpoint:** an HTTPS URI serving DNS queries according to the RFC-defined media types and behavior; clients need to know which resolver endpoint to use.
- **DNS wire format:** the DNS message representation carried in the HTTP request/response body or encoded for the defined GET form.
- **HTTP GET form:** carries a DNS message in the URI’s `dns` parameter using base64url encoding; query length can interact with URI limits, logging, and caching.
- **HTTP POST form:** carries the DNS message in the request body with the defined DNS message content type; intermediaries and servers must support the protocol behavior.
- **Resolver policy:** controls endpoint choice, query logging, retention, filtering, and client configuration. A private transport to an untrusted resolver still exposes query contents to that resolver.
- **DNSSEC:** validates authenticated DNS data; independent of whether the DNS message travelled over DoH.

## Cross-item comparison

| Option | Transport and operational effect | Design caution |
| --- | --- | --- |
| DoH | DNS over HTTPS/TLS; compatible with HTTP infrastructure and web connection behavior | Can be difficult for an enterprise to distinguish/control; resolver endpoint and policy must be explicitly managed |
| DoT | DNS over TLS/TCP, commonly port 853 | A distinct transport with different network visibility and blocking behavior |
| DoQ | DNS over QUIC/UDP, commonly port 853 | Requires QUIC/UDP support and has protocol-specific connection behavior |
| DNSSEC validation | Validates data signatures and chain of trust | Does not encrypt queries or hide them from the resolver/network path |

Do not claim one transport universally wins in speed, privacy, reliability, or compatibility. Compare actual client support, connection reuse, network blocking, endpoint discovery, policy enforcement, and user expectations.

## Examples

A browser configured for a public DoH endpoint sends `example.org` as a DNS query inside an HTTPS exchange. A local Wi-Fi operator may see a connection to the resolver and timing/volume metadata, but not the DNS message contents in a correctly authenticated TLS session. The selected resolver still learns the queried name. If the device also uses a corporate VPN or policy-managed resolver, browser-level DoH may bypass expected filtering or split-DNS rules unless the deployment explicitly controls endpoint selection.

For a managed enterprise service, choose an authenticated endpoint, document logging/retention and jurisdiction, configure browser/OS policy to avoid conflicting resolvers, ensure split-horizon names and captive portal behavior are handled, monitor HTTP and DNS-level error rates, and define failure/fallback behavior. Check whether GET URIs may be exposed in intermediary or endpoint logs; use the supported request form and logging practices carefully.

## Common mistakes

- Assuming HTTPS means the resolver cannot see or retain the DNS query.
- Treating encrypted DNS as DNSSEC; one protects transport, the other validates signed DNS data.
- Letting browser-level DoH silently bypass enterprise DNS controls, split-horizon resolution, or incident response policy.
- Assuming the network cannot infer anything; resolver IP, timing, volume, and connection metadata can remain observable.
- Ignoring DNS message caching, HTTP caching semantics, content types, GET URI length/logging, or POST support.
- Providing multiple encrypted resolvers without clarifying which one receives sensitive queries or how failure fallback works.
- Assuming all operating systems, browsers, resolvers, and networks support the same DoH profile or discovery behavior.
- Forgetting that a malicious or compromised resolver can return false answers even though the HTTPS transport is encrypted; use DNSSEC validation where the threat model requires it.

## Knowledge checks with answers

1. **Does DoH hide a requested domain from the selected recursive resolver?** No. The resolver must process the query; endpoint logging and retention are policy issues.
2. **What does DoH protect from a local passive observer?** The DNS message contents on the authenticated HTTPS connection; connection metadata may still be visible.
3. **Can DoH replace DNSSEC?** No. DoH protects a transport segment, while DNSSEC validates DNS data origin/integrity through its trust chain.
4. **Why can centrally enabled browser DoH break internal services?** It may send internal names to a public resolver or bypass split-horizon DNS and enterprise policies unless endpoint selection and internal name behavior are designed.

## Review status

The protocol framing is checked against RFC 8484; transport semantics against RFC 9110; privacy and DNSSEC distinction against RFC 8932/RFC 4033. This lesson remains pending full claim-by-claim audit and manifest omission check.

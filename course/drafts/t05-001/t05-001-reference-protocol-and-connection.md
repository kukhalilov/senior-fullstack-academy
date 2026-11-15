<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Reference: HTTP over TLS, handshake, protocol negotiation, and replay boundaries

## Scope and version
This lesson explains the assigned protocol and connection names in the manifest. The current TLS 1.3 specification is [RFC 9846 (July 2026)](https://datatracker.ietf.org/doc/html/rfc9846), which obsoletes RFC 8446. The scope is conceptual; exact cipher configuration depends on maintained platform guidance.

## How this group fits the mental model
Think in layers: HTTP defines what the client asks; HTTPS places that HTTP exchange inside TLS; the handshake establishes the protected channel and authenticates the server; browser identity checks decide whether the presented identity matches the requested service. Protocol negotiation can select how the application conversation proceeds. Early data creates a replay boundary that application code must respect.

## Supplied names explained
- `HTTP request and response` — A request identifies a method, target, fields, and possibly content; a response communicates a status, fields, and possibly content. HTTP semantics are shared across versions; see [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).
- `HTTPS` — HTTP carried over a connection protected by TLS. It protects the browser-to-TLS-endpoint segment; it does not itself prove that the application is trustworthy.
- `TLS` — A protocol family for protecting client/server communications against eavesdropping, tampering, and message forgery, subject to correct configuration and secure endpoints. The IETF describes these aims in [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846).
- `TLS 1.2` — An earlier TLS version. RFC 9846 specifies new requirements affecting TLS 1.2 implementations as well as TLS 1.3; avoid treating legacy configuration advice as timeless.
- `TLS 1.3` — The newer version specified by RFC 9846. The protocol version remains 1.3; RFC 9846 supersedes the prior TLS 1.3 document RFC 8446.
- `TLS handshake` — The negotiation and authentication exchange that establishes shared traffic keys and connection parameters before protected application data. A failed handshake prevents a usable secure channel.
- `Server authentication` — The client obtains evidence that the server controls the private key associated with an accepted identity. This authenticates a service endpoint, not the human user logging in.
- `Certificate path validation` — The client checks whether a presented certificate can form an acceptable signed path to a trust anchor under its policy and current time/usage constraints. A mathematically valid signature alone is insufficient.
- `Trust anchor` — A locally trusted starting point for path validation, commonly configured through the client's trust store. The trust decision ultimately depends on client policy.
- `Subject Alternative Name (SAN)` — Certificate extension carrying identities, such as DNS names, against which the client can compare the requested host. Do not infer a match from the organization name or a different host in the chain.
- `Hostname verification` — The separate check that the identity requested by the client matches a certificate identity according to applicable rules. Disabling it defeats a central part of server authentication.
- `Certificate expiration` — A certificate is valid only within its encoded time interval under ordinary validation. Expiry can break every client connection even when no code changed; monitor renewal and deployment.
- `Certificate revocation status` — Information that a certificate may no longer be trusted before its end time. Clients and ecosystems vary in whether and how they obtain and enforce status, so do not promise uniform real-time revocation behavior.
- `Forward secrecy` — A key-establishment property intended to limit retrospective disclosure of past sessions after later compromise of long-term authentication keys, under the protocol's assumptions. It does not defend compromised endpoints or leaked session secrets.
- `Cipher suite` — A named set of cryptographic choices negotiated for a TLS connection. TLS 1.3 uses a different, narrower cipher-suite organization than TLS 1.2; do not copy a TLS 1.2 suite string into TLS 1.3 configuration.
- `ALPN` — Application-Layer Protocol Negotiation, a TLS extension through which peers agree on an application protocol. Negotiating a protocol does not authorize a request.
- `SNI` — Server Name Indication, a TLS extension that lets a client indicate the intended hostname during handshake so a server can select an appropriate configuration/certificate. The client still verifies the returned identity.
- `TLS 1.3 early data (0-RTT) replay risk` — Resumption-based early application data may be replayed. Exclude unsafe state changes or design explicit replay defenses; ordinary application idempotency assumptions must be examined rather than presumed.
- `HTTP-to-HTTPS redirect` — A response that points a client from an HTTP URL to an HTTPS URL. Since the first request was cleartext, a redirect alone cannot protect it against interception or modification.
- `Mixed content` — An HTTPS page loading an HTTP resource. The insecure resource can undermine confidentiality or integrity of the page; browsers may block some kinds and treat others differently.

## Cross-item comparison
`TLS 1.2` and `TLS 1.3` are protocol versions, not interchangeable configuration labels. RFC 9846 specifies TLS 1.3 and updates requirements for TLS 1.2 implementations. An `HTTP-to-HTTPS redirect` acts after a request reaches a server; HSTS acts in a browser before later requests are sent. `Certificate expiration` is a time-window failure; a hostname mismatch is an identity failure. Both should cause validation failure, but require different diagnosis.

## Examples
If a browser requests `https://store.example` and the server presents a trusted chain for `login.example`, path validation may succeed while hostname verification fails. Correct the deployed certificate identity; do not disable verification. If a POST transfers funds, do not allow it as TLS early data unless the service has a sound replay-safe design. For a first visit to `http://store.example`, a redirect can upgrade the navigation, but the initial request was still exposed. RFC 9846 covers TLS handshake and 0-RTT behavior; [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) defines HTTP semantics.

## Common mistakes
- Treating encryption as proof of correct hostname or user authorization.
- Assuming every client checks revocation identically.
- Assuming early data is automatically safe because TLS protects it from network modification; replay is a different threat.
- Treating SNI as certificate verification or ALPN as authorization.
- Fixing certificate errors by suppressing validation rather than repairing identity, chain, time, or trust configuration.

## Knowledge checks with answers
1. A chain ends at a trusted root, but SAN excludes the URL host. **Reject: hostname verification fails.**
2. Does a redirect protect the original cleartext request? **No.** It only instructs the client after the request arrives.
3. What property makes 0-RTT special? **Potential replay of early data, especially dangerous for state-changing actions.**

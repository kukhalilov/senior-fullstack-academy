<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Core concepts and how they fit together

## Learning objectives
By the end, you can trace a browser's secure request, explain what certificate checks establish, distinguish TLS protection from application security, and diagnose common deployment failures.

## Prerequisites
Know that a client and server exchange requests over a network, and that DNS names identify services. A public key can be shared; its matching private key must remain controlled. TLS uses cryptographic algorithms to authenticate peers and protect records, but this lesson does not teach cryptographic implementation.

## Core concepts
HTTP defines request/response semantics. TLS establishes a connection security context around application traffic. HTTPS is HTTP over TLS, conventionally identified by an `https` URI. Encryption provides confidentiality against observers on the protected segment; integrity detects modification; server authentication helps the client know which service it reached. These guarantees stop at the TLS endpoint. If a proxy decrypts traffic, it becomes a security-critical endpoint.

A certificate contains a public key and identity-related fields signed within a certification system. A client validates a path from the presented certificate through intermediates to a configured trust anchor, checks validity constraints, and checks that the requested host matches an identity such as a DNS name in SAN. A chain that is trusted for some other name still fails hostname verification. A valid name with an expired certificate fails time validity. Revocation-status mechanisms have ecosystem-specific availability and failure behavior; do not assume every client performs a live, definitive revocation check.

## Mechanisms and relationships
During a TLS handshake, peers negotiate supported parameters and establish keys. The server proves possession of the private key associated with its certificate as part of the authenticated handshake. TLS 1.3 changed the handshake and available cipher-suite structure compared with TLS 1.2; current TLS 1.3 requirements are in [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846), which was published July 2026 and obsoletes RFC 8446. Implementations should use maintained platform defaults rather than hand-picking cryptographic parameters without expertise. OWASP provides operational [TLS configuration guidance](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

Forward secrecy means later compromise of a long-term authentication key does not, under the relevant ephemeral key-exchange design and assumptions, automatically reveal previously recorded sessions. It is not a promise against endpoint compromise or every key-management failure. ALPN negotiates an application protocol over TLS; SNI helps a server select the intended virtual host during the handshake. Neither replaces certificate identity validation.

TLS 1.3 early data (0-RTT) allows some data to be sent before a fresh handshake fully completes, using resumption state. Such data can be replayed; applications must not use it for operations whose replay could cause harm. A safe default is to avoid early data for non-idempotent actions. TLS itself cannot decide whether an HTTP operation is safe to repeat.

An HTTP redirect is a server response after a cleartext request has already reached it. HSTS is a browser policy learned over HTTPS that upgrades future requests before cleartext is sent. Mixed content occurs when an HTTPS page loads insecure HTTP resources, weakening page integrity or confidentiality. These controls address different points in the request lifecycle.

## Worked examples
**Wrong name:** a trusted certificate for `api.example` does not authenticate `admin.example`; hostname verification must fail for the latter.

**Wrong time:** a certificate can have a trusted chain and matching SAN but still be expired. Renewing it fixes that condition; changing the hostname does not.

**Replay-sensitive action:** a read-only catalog request may tolerate replay better than “transfer money.” The latter must not be accepted as early data without a robust replay-safe design.

## Misconceptions and edge cases
- A padlock does not mean the site is honest or the user is authorized; it says the browser established a protected connection to the validated identity.
- A redirect is not encryption: the initial HTTP request can be observed or altered. HSTS helps only after policy is learned, unless preload applies.
- A proxy's forwarded scheme header is user-controlled unless trusted-proxy configuration restricts who can supply it.
- TLS on the browser-to-proxy segment does not automatically protect proxy-to-app traffic.

## Knowledge checks with answers
1. Does a trusted chain prove that the certificate is for the requested host? **No.** The client must also verify the hostname.
2. Why can TLS 1.3 early data be risky? **A request may be replayed, so state-changing operations need special protection or exclusion.**
3. Which protects a first visit before the server responds: redirect or learned HSTS? **Neither reliably; preload can cover a preloaded domain, while a redirect happens after the HTTP request.**

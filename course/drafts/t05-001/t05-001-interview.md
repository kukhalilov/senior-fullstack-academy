<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Interview questions and reasoning

## Core questions
1. What is the difference between HTTP, TLS, and HTTPS?
2. What does certificate validation establish?
3. Why is a redirect insufficient as the only HTTPS control?

## Concise interview answers
1. HTTP defines application requests and responses; TLS secures a connection; HTTPS is HTTP carried over TLS. RFC 9846 is the current July 2026 TLS 1.3 specification at Proposed Standard maturity and retains protocol version 1.3.
2. A client validates a path to a trusted anchor, validity constraints, and the requested host identity, then checks proof of private-key possession in the handshake. This authenticates the service endpoint under the client's trust policy.
3. A redirect happens after a cleartext request reaches the server, so an attacker may interfere with that first exchange. HSTS protects future browser requests after policy is learned; preload can cover first visits for listed hosts after separate list enrollment. See [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846) and [OWASP HSTS guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html).
4. What does Encrypted Client Hello protect, and what does it not hide?

It encrypts selected sensitive fields in the inner ClientHello, notably the true SNI, when client, DNS/configuration, and server support it. The destination IP, timing, packet sizes, and some outer metadata remain visible; privacy depends on a shared anonymity set. It does not replace certificate validation. See [RFC 9849](https://www.rfc-editor.org/rfc/rfc9849.html).
5. What is the practical difference between RFC 8446 and RFC 9846?

RFC 9846 replaces RFC 8446 as TLS 1.3's current specification but keeps the negotiated version TLS 1.3. It clarifies requirements and makes targeted updates such as prohibiting KeyShare reuse across connections, tightening PSK/HelloRetryRequest rules, and updating TLS 1.2 requirements; it is not a new protocol version.

## Deep follow-up answers
**A certificate chain validates but the browser still errors.** Check hostname/SAN, time validity, usage constraints, trust-store differences, and whether the server sent required intermediates. Do not disable verification to suppress the symptom.

**What changes when TLS ends at a load balancer?** The balancer becomes a TLS endpoint and can see plaintext. Protect the backend path as needed, restrict it to the balancer, and trust forwarded scheme/client metadata only from configured hops.

**Can 0-RTT be used for every request?** No. TLS 1.3 early data can be replayed; HTTP safe-method labels alone do not prove an endpoint has no side effects. Exclude non-repeatable actions or apply end-to-end replay defenses. Current specification is [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846).

## Scenario questions
- A certificate renews successfully but some users still see expiry. Investigate all serving nodes, caches, certificate chain delivery, and deployment propagation.
- A subdomain breaks after HSTS rollout. Check whether `includeSubDomains` or preload covers it and whether it has working HTTPS; rollback may not instantly erase preload policy.
- An API client calls HTTP and receives a redirect. Prefer making HTTPS the documented endpoint and avoid relying on clients to preserve credentials or request bodies safely across redirects.

## Tradeoffs and alternatives
TLS termination at the edge simplifies certificate operations but moves plaintext handling to that edge. Termination at the application host reduces intermediaries that see plaintext but distributes key operations. Choose based on threat model, operational capability, network isolation, and monitoring. Redirects ease migration; HSTS enforces browser policy after learning. Neither fixes application authorization or compromised endpoints.

## Common weak answers
- “The certificate encrypts the data.” The certificate helps authenticate a key; the TLS handshake establishes traffic protection.
- “HTTPS means the site is safe.” It protects a connection to a validated host, not its business logic.
- “We use a redirect, so no HTTP risk exists.” The initial request is still HTTP.
- “The proxy sets the scheme header, so we can trust it.” Only if the sender is constrained to trusted proxies.

## Self-check rubric
You can trace connection, certificate, and request stages; separate chain validation from hostname matching; explain HSTS learning and 0-RTT replay; identify the exact TLS endpoint; and propose fixes that preserve verification rather than disabling it.

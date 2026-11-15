<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Interview questions and reasoning

## Core questions
1. What is the difference between HTTP, TLS, and HTTPS?
2. What does certificate validation establish?
3. Why is a redirect insufficient as the only HTTPS control?

## Concise interview answers
1. HTTP defines application requests and responses; TLS secures a connection; HTTPS is HTTP carried over TLS.
2. A client validates a path to a trusted anchor, validity constraints, and the requested host identity, then checks proof of private-key possession in the handshake. This authenticates the service endpoint under the client's trust policy.
3. A redirect happens after a cleartext request reaches the server, so an attacker may interfere with that first exchange. HSTS protects future browser requests after policy is learned; preload can cover first visits for listed hosts. See [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846) and [OWASP HSTS guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html).

## Deep follow-up answers
**A certificate chain validates but the browser still errors.** Check hostname/SAN, time validity, usage constraints, trust-store differences, and whether the server sent required intermediates. Do not disable verification to suppress the symptom.

**What changes when TLS ends at a load balancer?** The balancer becomes a TLS endpoint and can see plaintext. Protect the backend path as needed, restrict it to the balancer, and trust forwarded scheme/client metadata only from configured hops.

**Can 0-RTT be used for every request?** No. TLS 1.3 early data can be replayed; a state-changing operation needs exclusion or explicit replay-safe semantics. Current specification and its 0-RTT discussion are in [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846).

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

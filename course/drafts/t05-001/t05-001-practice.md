<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Exercises and worked solutions

## Goals
Practice diagnosing independent transport-security failures and choosing controls that act at the correct point in the request path.

## Worked example
A browser requests `https://api.example`; TLS negotiation succeeds but the certificate is expired. This is a certificate validity failure even if the key, chain, and hostname are otherwise correct. Renew and deploy the certificate, verify all instances serve it, and monitor expiry. Do not disable validation. See [OWASP TLS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html).

## Exercises
1. The certificate chain is trusted and current, but the requested name is absent from SAN. Identify the failed check and a correct fix.
2. A site redirects HTTP to HTTPS. Explain what an attacker can still affect on the first visit and how HSTS changes later browser visits.
3. An API uses TLS 1.3 early data for a payment-creation POST. Identify the risk and two safe design choices.
4. A reverse proxy terminates TLS. The app trusts `X-Forwarded-Proto` from any sender. Describe an attack and the configuration boundary needed.
5. A privacy review says TLS 1.3 hides the website name from the network. Explain which newer feature can help and what remains visible.
6. A deployment team adds `preload` to its HSTS header and assumes every browser now forces HTTPS. Correct the assumption and identify a rollout risk.

## Progressive hints
1. Chain trust and host identity are separate tests. 2. The redirect arrives only after the cleartext request. 3. Consider replay, not only confidentiality. 4. Headers are ordinary client input until a trusted hop is established. 5. Consider Encrypted Client Hello and metadata outside ClientHello. 6. The preload token is not itself list enrollment.

## Complete solutions
1. Hostname verification fails. Issue/deploy a certificate with the correct service identity and keep validation enabled.
2. The initial HTTP request can be observed or modified, including the response that carries the redirect. Once a browser learns HSTS over HTTPS, it upgrades subsequent requests for the covered host before sending them. A preloaded host can receive this protection on the first visit; a normal newly learned policy cannot. See [OWASP HSTS guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html).
3. Early data may be replayed. Do not permit the payment operation as early data, or use a rigorously designed replay-resistant mechanism with idempotency and deduplication whose guarantees cover the full request path. Ordinary TLS integrity does not prevent replay.
4. An attacker who can reach the app directly can forge the header and make the app believe a request used HTTPS, potentially affecting secure-cookie or redirect decisions. Restrict backend reachability and configure forwarded metadata trust only for known proxy addresses/hops.
5. Encrypted Client Hello (ECH, RFC 9849) encrypts sensitive inner ClientHello values such as the true SNI when the client, DNS/configuration source, and service all support it. The IP address, timing, packet sizes, and provider may remain visible; privacy also depends on a sufficiently large and indistinguishable anonymity set.
6. `preload` indicates consent/request for a browser-maintained preload program; operators must separately meet current criteria and submit the domain. Preload and `includeSubDomains` can make HTTP-only subdomains unreachable, and removal may not take effect quickly.

## Tests and edge cases
- Trusted chain + wrong SAN: reject.
- Correct SAN + expired leaf: reject until a valid replacement is deployed.
- HSTS `max-age=0` received over HTTPS: clear learned dynamic policy; separately maintained preload status is not changed by this response.
- ECH configuration unavailable or rejected: do not claim the true SNI was protected; the rejected public-name connection is not usable for application data. Validate RFC 9849 retry/error behavior and avoid silent fallback that exposes the origin name.
- API client receives HTTP redirect with a body: do not assume every client safely resends credentials/body to the HTTPS target; make public API HTTPS the normal endpoint.
- Proxy is trusted but app is also directly reachable: the trust boundary is still bypassable; network reachability matters.

## Reflection questions
Which check would catch a certificate for the wrong host? Which control protects a browser before it sends a later request? Where does TLS protection end in your deployment? What business operations must never be replayed?

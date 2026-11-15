<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Reference: Certificate lifecycle, HSTS, proxy termination, and secure cookies

## Scope and version
This assigned group concerns certificate operations and deployment boundaries. TLS protocol context follows [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846); operational guidance is in the [OWASP TLS](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) and [HSTS](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) sheets. No platform-specific API is required here.

## How this group fits the mental model
TLS setup is only reliable if certificates are issued, deployed, renewed, and protected correctly. Browsers can remember an HTTPS-only policy. Proxies may terminate TLS and forward requests to applications, which means trusted metadata and cookie security need deliberate boundaries.

## Supplied names explained
- `X.509 certificate` — A structured certificate format that binds a public key to identity and validity information under a signature chain. Acceptance depends on client validation policy, not the file format alone.
- `Certificate chain` — The leaf certificate plus certificates that help a client build a path to a trusted anchor. Servers commonly need to send necessary intermediates; the root is generally already in client trust configuration.
- `Intermediate certificate` — A CA certificate between the leaf and a trust anchor. Omitting a needed intermediate can make the chain unbuildable for clients that do not already have it cached.
- `Certificate authority` — An entity whose signing key is trusted to issue certificates under defined controls. A CA signature does not make every issued service safe; the client still checks identity and use constraints.
- `Private-key protection` — Restrict access to the private key, minimize copying, use appropriate platform protections, monitor access, and plan rotation after suspected compromise. A public certificate may be distributed; its corresponding private key must not be.
- `Certificate renewal` — Replacing a certificate before expiry and deploying the replacement correctly. Renewal includes validating names, chain, key handling, and every serving endpoint, not just obtaining a new file.
- `Certificate pinning risk` — Pinning narrows accepted keys beyond normal trust validation but can lock out legitimate renewed or rotated keys and make outages difficult to recover. It requires carefully managed backup pins and lifecycle ownership; it is not a casual substitute for normal validation.
- `Certificate Transparency` — Publicly auditable logging of many publicly trusted certificate issuances, helping domain owners and monitors discover unexpected certificates. It is a detection/accountability mechanism, not a replacement for TLS validation.
- `HSTS` — A browser policy learned from a valid HTTPS response that directs future connections to use HTTPS for the host. It cannot secure the first visit before learning, except where preload already covers the host.
- `Strict-Transport-Security response header` — The HTTPS response field that communicates HSTS policy. Browsers ignore it when received over insecure HTTP; it should be sent consistently from the HTTPS origin.
- `HSTS max-age directive` — The policy lifetime in seconds. A short initial lifetime permits cautious rollout; `max-age=0` tells a browser to remove the learned policy when received over HTTPS. Do not assume that removes a separately maintained preload entry.
- `HSTS includeSubDomains directive` — Extends the host's policy to its subdomains. Enable only when every affected subdomain can serve HTTPS; otherwise legitimate services may become unreachable in browsers.
- `HSTS preload list` — A browser-maintained list that causes HTTPS upgrading before the site has delivered HSTS. Enrollment/removal processes and browser behavior are operationally separate from merely sending a header, and removal can take time.
- `Secure cookie attribute` — Tells a browser to send the cookie only over secure transport. It reduces exposure over HTTP but does not alone prevent script access, CSRF, theft from a compromised endpoint, or authorization errors.
- `TLS termination at reverse proxy` — The proxy decrypts client TLS and forwards a request to the application. Protect and trust the proxy-to-app path according to the threat model; the app should not assume the original client connected directly.
- `Forwarded scheme` — Metadata indicating the original request scheme, often provided by an intermediary. It is trustworthy only when accepted from known proxies; a direct client must not be allowed to spoof it.
- `Trusted proxy boundary` — The configured set of proxy hops or addresses allowed to provide forwarded metadata. If the boundary is too broad, attackers can forge scheme or address information; if too narrow, legitimate metadata may be ignored.
- `Certificate renewal automation` — Automated issuance and deployment can reduce missed expirations, but automation must alert on failures and verify the certificate is active on every endpoint. “Renewed” does not mean “correctly installed.”
- `HTTP redirect status code` — HTTP status codes can instruct a client to navigate to another URI; redirect semantics and method handling differ by status. A redirect to HTTPS is useful but occurs only after the HTTP request is received. See HTTP semantics in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).
- `API-only HTTPS endpoint behavior` — An API should require HTTPS at its public boundary and should not rely on a browser redirect as its security mechanism. Non-browser clients may reject redirects, replay bodies, or mishandle credentials; fail safely or document a deliberate migration response.

## Cross-item comparison
Certificate renewal automation reduces routine expiry risk but does not replace monitoring or deployment verification. A redirect reacts after a cleartext request; HSTS upgrades browser requests before sending them after policy is known. TLS termination at an edge proxy centralizes certificate handling but creates an internal trust boundary; termination at the application host keeps TLS protection closer to the app but changes key distribution and operations. [OWASP's HSTS guidance](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) cautions that HSTS needs a deliberate rollout.

## Examples
For `app.example`, first inventory every subdomain, deploy valid HTTPS to each, and test redirects. Begin with a conservative HSTS lifetime, monitor behavior, then increase it. Add `includeSubDomains` only after every subdomain is ready; evaluate preload as a separate commitment. At a proxy, accept original-scheme metadata only from that proxy, and ensure direct external traffic cannot reach a backend that trusts arbitrary forwarded headers.

## Common mistakes
- Sending HSTS over HTTP and expecting browsers to learn it.
- Enabling broad subdomain policy before checking abandoned or legacy hosts.
- Treating certificate transparency as a browser trust decision or a prevention control.
- Assuming `Secure` cookie means a cookie is safe against all web attacks.
- Trusting forwarded headers from any network peer.
- Automating renewal without alerting, deployment checks, or rollback.

## Knowledge checks with answers
1. What does `includeSubDomains` require? **Readiness for HTTPS across all affected subdomains.**
2. Does `Secure` prevent JavaScript access? **No; it limits sending to secure transport.**
3. What must be trusted at a proxy? **Only metadata arriving from configured proxy hops.**

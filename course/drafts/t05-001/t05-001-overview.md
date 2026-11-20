<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# HTTP HTTPS TLS certificates HSTS and transport security — Big-picture orientation and mental model

## Problem and purpose
Web requests cross networks and intermediaries that the application developer does not control. Without transport protection, an observer may read or alter traffic, and a fake endpoint may impersonate the service. Transport security creates an authenticated, encrypted channel for each connection and helps browsers keep later visits on that channel.

## Plain-language mental model
HTTP is the conversation format: a client asks for a resource and a server returns a response. TLS is a sealed, authenticated tunnel around that conversation. HTTPS means HTTP carried through TLS. A certificate is evidence used during setup to decide whether the peer controls a key for the requested host. The browser, not the certificate alone, makes that decision using its trust configuration and hostname checks.

## How the parts fit together
The browser resolves and connects to a service, negotiates TLS, validates the server identity and certificate path, then sends HTTP inside the protected connection. ECH can encrypt the true server name in ClientHello when the client, DNS/configuration, and service support it; the destination IP and traffic patterns remain visible. The server may redirect an initial HTTP request, while HSTS teaches a browser to upgrade later requests before sending them. In a common deployment, TLS ends at a reverse proxy; the proxy-to-app hop and the metadata that describes the original scheme remain part of the security boundary. HTTP semantics are described in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html); TLS 1.3 in [RFC 9846](https://datatracker.ietf.org/doc/html/rfc9846); ECH in [RFC 9849](https://www.rfc-editor.org/rfc/rfc9849.html).

## Concept map
- **Channel:** TLS negotiation selects cryptographic parameters and establishes traffic keys.
- **Identity:** Certificate path validation and hostname verification answer different questions: is the chain trusted, and does the identity match the host?
- **Browser policy:** Redirects help a first HTTP visit reach HTTPS; HSTS protects subsequent visits after the browser has learned the policy.
- **Deployment:** Certificate lifecycle, private-key security, proxy trust, and application behavior must work together.

## End-to-end walkthrough
Suppose a browser requests `https://shop.example/orders`. It connects to the service and negotiates TLS. The server presents its certificate chain. The browser checks time validity, builds a path to a trusted root under its rules, and checks that the requested host matches a certificate identity. If checks succeed, both sides derive keys and the browser sends the HTTP request through the encrypted channel. The application authenticates the user and authorizes access separately. If TLS terminates at a proxy, the proxy reports the original scheme to the application; the application must accept that report only from a configured trusted proxy. After a valid HTTPS response carries HSTS, the browser can upgrade later HTTP URLs for the remembered period.

## When to use it and tradeoffs
Use HTTPS for every production web endpoint, including APIs and login flows. Redirect cleartext requests as a migration and usability measure, then deploy HSTS after confirming all affected hosts support HTTPS. HSTS cannot protect a first visit before policy is learned unless the host is already in a browser preload list. `includeSubDomains` and preload can break subdomains that are not ready, so roll out deliberately. TLS protects data in transit between its endpoints; it does not encrypt data after termination or prevent application authorization flaws. OWASP's [transport security](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html) and [HSTS](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html) guidance describe deployment concerns.

## What later lessons cover
The next lesson builds the connection and identity model, then the reference lessons explain the frozen protocol and deployment inventories. Practice applies the checks to realistic failures; interview questions test distinctions such as encryption versus authentication and redirect versus HSTS.

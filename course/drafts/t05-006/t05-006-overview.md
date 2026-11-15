<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Big-picture orientation and mental model

## Problem and purpose
Web applications cross several trust boundaries: a browser may attach credentials automatically, data may be interpreted as markup or code, a server may build queries from input, and an outbound request may reach internal networks. “Validate input” is not one universal defense because each boundary interprets data differently.

## Plain-language mental model
Treat every value according to the interpreter that consumes it. A string printed as text must remain text; a value used in a database query must remain data rather than syntax; a URL fetched by a server must point only to an intended destination. Separately, protect browser actions that rely on ambient cookies and stop other sites from framing sensitive interfaces.

## How the parts fit together
CSRF tricks a browser into sending an authenticated state-changing request. XSS runs attacker-controlled code in the trusted origin and can often bypass client-side protections. Context-aware output encoding keeps data from becoming HTML, JavaScript, CSS, or URL syntax; sanitization is for intentionally accepted markup. CSP limits resource execution as defense in depth. SSRF abuses server-side network authority; robust defense checks parsed/canonical destinations, DNS results, redirects, and egress. [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), and [SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html) guidance address these separate boundaries.

## Concept map
- **Browser authority:** CSRF, SameSite, antiforgery proof, origin checks, clickjacking defenses.
- **Browser interpretation:** XSS types, output encoding by context, safe sanitization, Trusted Types, CSP.
- **Server interpreters:** SQL/command/template/LDAP/NoSQL injection; use parameterized or structured APIs.
- **Server networking and navigation:** SSRF destination controls, safe redirects, request parsing boundaries.

## End-to-end walkthrough
A comment form accepts text and later displays it. Store input as data; when rendering in an HTML text position, encode for that context. If the product intentionally allows limited markup, sanitize with a maintained allowlist sanitizer. A restrictive CSP adds another barrier but cannot repair unsafe rendering. When the same user clicks “delete account,” require an antiforgery proof or equivalent control because the browser may automatically attach its cookie. When the backend fetches a user-provided image URL, parse and canonicalize it, enforce an allowlist, resolve and check addresses, constrain redirects, and limit network egress.

## When to use it and tradeoffs
Use defenses that fit the exact sink and threat. Output encoding preserves plain text; sanitization preserves a defined safe subset of markup. Parameterization separates query structure from values. URL string checks alone are insufficient against normalization, DNS rebinding, and redirects. Security headers help but do not replace safe application behavior. CSP Level 3 is a [W3C Working Draft dated 27 October 2026](https://www.w3.org/TR/CSP3/), not a finalized Recommendation; distinguish draft status from stable browser behavior.

## What later lessons cover
Reference lessons explain browser attacks/CSP, server-side injection/SSRF, and redirects/request-boundary controls. Practice builds defensive reasoning without assuming one encoding or validation rule works everywhere.

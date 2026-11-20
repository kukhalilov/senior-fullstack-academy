<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Core concepts and how they fit together

## Learning objectives
Map common web attacks to their trust boundary; choose context-aware XSS defenses; distinguish CSRF from XSS; explain CSP's limits; and build SSRF controls that account for parsing, DNS, redirects, and network reachability.

## Prerequisites
Know how browsers send requests, how a server renders HTML, and how an application calls databases or outbound services. An attacker may control values, URLs, request timing, or which browser origin initiates an action.

## Core concepts
CSRF exploits a browser's ambient authority: a victim is logged in, and a cross-site action causes the browser to send cookies. XSS exploits unsafe interpretation so attacker-controlled script executes in the trusted origin. XSS can act as the victim and often defeats client-side CSRF defenses; therefore these attacks need separate controls. OWASP describes CSRF mitigations in its [CSRF Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

Injection occurs when untrusted data is interpreted as part of a command or language grammar. Parameterized queries preserve the separation between structure and values for SQL. For other interpreters, prefer safe structured APIs and strict allowlists; escaping is context-specific and fragile. Unsafe deserialization can execute or instantiate attacker-controlled behavior depending on the format and framework.

## Mechanisms and relationships
For XSS, select encoding for the exact output context: HTML text differs from attribute, JavaScript, URL, and CSS contexts. Avoid dangerous contexts or APIs that parse strings as code/markup. Sanitization is appropriate only when accepting rich markup and must preserve a safe allowlist. Trusted Types can restrict certain DOM injection sinks in supporting browsers. CSP limits resource sources and inline execution as defense in depth; it does not make unsafe string-to-DOM code safe. The [OWASP XSS Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) explains context-specific rules.

SSRF occurs when a server makes a request influenced by an attacker, potentially reaching internal services or metadata endpoints. Parse and canonicalize first; allow only intended schemes/hosts/ports; resolve candidate addresses and block prohibited IPv4/IPv6 destinations (including mapped and NAT64 paths) as appropriate; ensure the checked address is the one the client connects to; re-check after redirects; and use network egress controls as a final layer. One raw-string URL regex or a separate DNS lookup cannot supply all these guarantees. See [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

Fetch Metadata request headers such as `Sec-Fetch-Site` can help servers identify cross-site request contexts. They are not present in every client/context, so they need an explicit fallback such as origin checks or anti-forgery tokens. They also do not address client-side CSRF, where same-origin JavaScript converts attacker-controlled input into a privileged request. [OWASP's CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html) describes both cases; the [Fetch Metadata specification](https://www.w3.org/TR/fetch-metadata/) is a Working Draft.

Clickjacking overlays or frames an interface so a user activates an action they did not intend. `frame-ancestors` in CSP is a modern control; X-Frame-Options remains relevant for compatibility. Open redirects let an attacker use a trusted domain to send victims elsewhere; exact allowlists or relative-route identifiers are safer than suffix checks.

## Worked examples
**Unsafe query:** concatenating `name` into `SELECT ... WHERE name='...'` lets syntax alter query meaning. Parameterize the value; validation alone is not a substitute.

**CSRF:** a cross-site form submits a bank transfer while the browser attaches the victim's cookie. Require a server-validated unpredictable antiforgery token and/or origin checks; use SameSite as defense in depth.

**SSRF:** a URL passes a string allowlist for `example.com` but redirects to `127.0.0.1`. Validate each resolved destination and control redirect following and egress.

## Misconceptions and edge cases
- Input validation checks acceptable business values; output encoding controls interpretation at a sink. They are complementary.
- CORS is not CSRF protection; it primarily controls whether browser scripts can read cross-origin responses.
- CSP is not the primary XSS control and Report-Only does not block.
- A URL suffix check like `endsWith("example.com")` can accept attacker-controlled hostnames.
- DNS can change between validation and connection; pin/check the address used for the actual connection where feasible.
- A trusted user action can still be clickjacked.

## Knowledge checks with answers
1. What defense should match an HTML output context? **Context-aware encoding, or sanitization if intentionally accepting markup.**
2. Does SameSite eliminate every CSRF risk? **No; use it with tokens/origin controls according to the application.**
3. Why inspect redirects in SSRF defense? **A permitted host can redirect to a prohibited address.**

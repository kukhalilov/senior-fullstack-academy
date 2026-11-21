
# CSRF XSS CSP injection SSRF open redirects and clickjacking — Reference: CSRF, XSS, CSP, and clickjacking

## Scope and version
This reference covers the browser-side inventory. OWASP guidance: [CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), and [clickjacking](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html). CSP Level 3 is a W3C Working Draft dated 27 October 2026, not a Recommendation: [W3C CSP3 status](https://www.w3.org/TR/CSP3/).

## How this group fits the mental model
The browser has rules for origin isolation, automatic credentials, parsing, and framing. CSRF abuses automatic authority; XSS breaks trusted-origin content integrity; clickjacking misuses visual interaction. Anti-forgery proof, safe rendering, and frame controls address different weaknesses.

## Supplied names explained
- `Cross-Site Request Forgery (CSRF)` — Causing an authenticated browser to submit an unwanted state-changing request to a site where credentials are automatically attached. Require an anti-forgery proof and validate request origin as appropriate.
- `Same-origin policy` — Browser isolation rule limiting script access between different origins. It does not stop a cross-origin form from submitting requests, which is why CSRF remains possible.
- `Ambient browser credentials` — Credentials such as cookies automatically attached by the browser based on request destination/context. This convenience creates CSRF exposure.
- `Synchronizer token pattern` — Server stores an unpredictable token associated with the session and requires it in a state-changing request. Validate server-side and avoid putting the token in URLs or logs.
- `Signed double-submit cookie pattern` — Sends a CSRF value in a cookie and request, with a server-verifiable signature/binding to prevent attacker cookie injection. Naive equality-only double submit is vulnerable in some deployments.
- `Origin header validation` — Compare the browser-supplied Origin to the expected origin for sensitive requests. Handle absent/opaque origins deliberately and use as defense in depth with a token strategy.
- `Referer header validation` — Check the referring URL's origin when Origin is absent or as an additional signal. Referrer policy/privacy can omit or reduce it, so missing data must have a deliberate fail/alternate policy.
- `SameSite cookie attribute` — Browser control limiting cross-site cookie sending. It reduces CSRF exposure but does not replace tokens for every workflow and does not stop same-site attacks or XSS-driven actions.
- `Fetch Metadata request headers` — Browser-supplied context headers, especially `Sec-Fetch-Site`, that let a server reject obviously cross-site unsafe requests. Treat them as defense in depth and retain an Origin/Referer or token fallback when headers are absent; the W3C specification is a Working Draft.
- `Sec-Fetch-Site` — Describes the relationship between the request initiator and target (`cross-site`, `same-site`, `same-origin`, or `none`). A common policy rejects cross-site non-safe methods; do not assume header presence for every client or request context.
- `Sec-Fetch-Mode` — Describes the request mode. It can refine a Fetch Metadata policy, but is not by itself proof that an action is user-authorized.
- `Sec-Fetch-Dest` — Describes the request destination type and can refine resource-specific policy. Choose behavior based on the endpoint rather than treating a destination value as authentication.
- `Client-side CSRF` — Vulnerable same-origin JavaScript turns attacker-controlled inputs (for example URL fragments, window name, or messages) into authenticated requests. CSRF tokens do not fix code that lets an attacker choose the endpoint or operation; constrain those inputs and map them to fixed operations.
- `Safe HTTP methods and CSRF` — GET, HEAD, and OPTIONS should not cause state changes. If an application changes state on a nominally safe method, browser navigation or prefetch can trigger it and CSRF defenses become unreliable.
- `Cross-Site Scripting (XSS)` — Injection that executes attacker-controlled script in a trusted origin. It can read accessible data and make authenticated requests; prevent unsafe interpretation at output sinks.
- `Reflected XSS` — Untrusted request data is immediately included unsafely in a response and executes when a victim follows a crafted link.
- `Stored XSS` — Untrusted data is persisted and later rendered unsafely to users, potentially at scale.
- `DOM-based XSS` — Client-side script moves attacker-controlled data into a dangerous DOM/code sink. Server-only encoding may not address the client-side flow.
- `Context-aware output encoding` — Transform data for the exact parser context so it remains data rather than markup/code. One encoder is not correct for every context.
- `HTML text encoding` — Encodes special characters for safe insertion into HTML text content. It does not make a value safe in a script, style, or URL context.
- `HTML attribute encoding` — Encodes data for an appropriately quoted HTML attribute value; avoid event-handler or other executable attributes because encoding alone may not make them safe.
- `JavaScript string encoding` — Encodes for a JavaScript string context. Prefer not embedding untrusted values into executable script; HTML encoding is not a replacement.
- `URL component encoding` — Encodes one URL component's data, not an entire URL/HTML context. Validate scheme and destination separately.
- `CSS context encoding` — Encoding for safe placement in CSS contexts is difficult and limited; avoid interpolating untrusted data into CSS syntax.
- `HTML sanitization` — Parses markup and removes/disallows unsafe constructs while preserving an allowed subset. Use a maintained sanitizer with a strict policy only when rich markup is a product requirement.
- `Trusted Types` — Browser mechanism that can require typed/trusted values for certain injection-sensitive DOM sinks. It reduces accidental unsafe assignments but needs application policy and does not replace safe design.
- `Content Security Policy (CSP)` — Browser policy controlling resource loading and some execution behaviors. It is defense in depth, not a substitute for output encoding. CSP3 status is a W3C Working Draft, not final Recommendation ([W3C](https://www.w3.org/TR/CSP3/)).
- `Content-Security-Policy header` — Enforcing response header that tells a browser to apply policy. Roll out carefully and test compatibility; an overly broad source list weakens value.
- `Content-Security-Policy-Report-Only header` — Reports policy violations without blocking them. Useful during rollout but provides no enforcement until an enforcing header is sent.
- `default-src` — Fallback source list for many fetch directives when a more specific directive is absent. It does not replace explicit policy review of all relevant resource types.
- `script-src` — Controls valid script sources and inline execution rules for applicable script requests. Prefer nonces/hashes and remove unsafe inline patterns rather than broad host wildcards.
- `script-src-elem` — More specific directive for script elements; when present it overrides `script-src` for those requests.
- `script-src-attr` — Controls inline event-handler attributes. Prefer removing inline handlers and using event listeners; do not assume a script-src policy automatically solves every DOM injection.
- `style-src` — Controls style resources and inline style behavior for applicable contexts. Allowing broad inline style weakens restrictions.
- `object-src` — Controls plugin/object resource loading. Setting a restrictive policy (often none) reduces legacy embedded-content risks.
- `base-uri` — Restricts document base URL changes that can alter how relative URLs resolve. A restrictive policy helps prevent injected `<base>` elements from redirecting resource/form targets.
- `frame-ancestors` — Controls which origins may embed the page in frames. It is the CSP mechanism for clickjacking defense and must be delivered as a response header.
- `form-action` — Restricts destinations to which forms on the page may submit. It can reduce impact of injected forms but is not a general CSRF defense.
- `connect-src` — Restricts script-initiated connections such as fetch/WebSocket targets. It does not prevent all data exfiltration channels.
- `img-src` — Restricts image sources; data leakage can sometimes use image requests, so source lists matter.
- `font-src` — Restricts font sources loaded by the document.
- `worker-src` — Restricts worker, shared worker, and service worker script sources according to CSP processing rules and fallback behavior.
- `'nonce-' source expression` — Allows a specific inline script/style carrying a matching unpredictable per-response nonce. Generate fresh unpredictable values per response and do not reuse them across pages.
- `'sha256-' hash source expression` — Allows inline content whose hash matches the policy. Any content change requires a new hash; it is suitable for stable inline blocks.
- `'strict-dynamic' source expression` — In supporting CSP implementations, trust from a nonce/hash-authorized script can propagate to scripts it loads. It changes the meaning of host/source allowlists and requires careful loader security.
- `'unsafe-inline' source expression` — Broadly permits inline script or style in its applicable directive and weakens protection. Avoid it for scripts where possible; legacy compatibility may require staged remediation.
- `report-to directive` — Associates CSP reports with a Reporting API reporting endpoint group. Browser/reporting support and configuration must be verified.
- `report-uri directive` — Legacy CSP reporting destination directive. It has compatibility and deprecation history; use current reporting behavior appropriate to supported browsers and don't depend on reports as enforcement.
- `Clickjacking` — Tricking a user into activating a framed/overlaid interface control. Prevent unauthorized framing and design sensitive confirmations carefully.
- `X-Frame-Options` — Legacy response header controlling framing with options such as DENY or SAMEORIGIN in supporting browsers. CSP `frame-ancestors` offers more expressive policy; sending both may help compatibility.
- `X-Frame-Options ALLOW-FROM` — This historical value attempted to allow a named framing origin, but it is obsolete and unsupported by modern browsers. Use CSP `frame-ancestors` for an explicit allowlist; the legacy interoperable values are `DENY` and `SAMEORIGIN`.
- `frame-ancestors CSP directive` — CSP directive controlling allowed parent origins for embedding. It is not inherited from `default-src`; set it explicitly when framing must be restricted.
- `CSP frame-ancestors response-header requirement` — `frame-ancestors` is enforced from the HTTP response policy; a `<meta http-equiv>` element cannot provide this framing defense.
- `DoubleClickjacking` — A UI-redress attack that can trick a user into activating a sensitive control during a double-click in a top-level window. Frame restrictions do not stop it; enforce sensitive actions server-side and require transaction-specific authorization where appropriate.

## Cross-item comparison
CSRF abuses ambient credentials; XSS executes within the trusted origin and may bypass CSRF tokens available to script. Output encoding prevents data interpretation at a sink; CSP limits execution as a fallback barrier. Report-Only observes and reports but does not block; enforcing CSP blocks according to policy. `frame-ancestors` is more expressive than `X-Frame-Options`, while the older header can help legacy compatibility. Sources: [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html), [OWASP CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html), [OWASP Clickjacking](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html).

## Examples
For a user profile displayed as text, render it as text with the framework's contextual HTML encoding. For an intentionally rich biography, sanitize using a maintained allowlist. Deploy CSP first in Report-Only to discover breakage, then fix violations and enforce. Set `frame-ancestors` to the intended framing policy; do not rely only on client-side frame-busting script.

## Common mistakes
- Using HTML text encoding for JavaScript or URL contexts.
- Trusting `SameSite` as the only CSRF defense without considering cross-site flows and same-site subdomains.
- Treating Report-Only as blocking.
- Using CSP `unsafe-inline` and broad wildcard hosts while claiming strong XSS mitigation.
- Forgetting that XSS can often issue requests with the user's session.
- Assuming `default-src` controls `frame-ancestors`.
- Treating `SameSite` as a framing control; same-site sibling origins can still frame a page, so restrict ancestors explicitly.
- Assuming frame restrictions prevent every UI-redress attack, including double-click-based attacks.

## Knowledge checks with answers
1. Does CSP replace context encoding? **No.** 2. Does Report-Only block? **No, it reports.** 3. Which directive controls who can frame a page? **`frame-ancestors`.**

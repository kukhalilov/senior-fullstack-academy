<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Exercises and worked solutions

## Goals
Choose defenses for the correct sink and boundary, and avoid relying on a single header or validation step.

## Worked example
A profile name is inserted into a `<script>` block by string concatenation. HTML text encoding is not a safe replacement for JavaScript-context handling. Prefer passing data through a safe serialization boundary or render it as text outside executable script. OWASP's [XSS guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) explains context-specific encoding and dangerous contexts.

## Exercises
1. A bank transfer endpoint accepts cookie-authenticated POSTs without anti-forgery proof. Identify the attack and a layered mitigation.
2. A comments page allows limited formatting and uses CSP. Why can CSP alone not make this safe?
3. A backend fetcher accepts `https://images.example/logo`, follows redirects, and checks only the initial DNS answer. Identify at least three bypass paths.
4. A post-login redirect checks `target.EndsWith("company.example")`. Show the flaw and propose a safer design.
5. An API enables permissive CORS and assumes CSRF is impossible. Explain the misconception.
6. A server rejects `Sec-Fetch-Site: cross-site` but accepts requests with no Fetch Metadata headers and has no fallback. What clients or contexts can bypass the policy, and what should the server do?
7. A payment page cannot be framed, but a malicious page can position a new top-level window under a double-click. Which class of attack is this, and which control must protect the payment itself?

## Progressive hints
1. The browser automatically attaches credentials. 2. Think unsafe content parsing and CSP gaps. 3. Consider DNS changes, IPv6/NAT64, redirects, canonicalization, and internal ranges. 4. Host boundaries need exact parsed comparison. 5. CORS read permission differs from request sending. 6. Older/embedded clients or request contexts may omit the headers. 7. Framing and top-level double-click UI redress are different threat models.

## Complete solutions
1. CSRF. Require a server-validated synchronizer token or signed double-submit pattern; validate Origin/Referer where appropriate and use SameSite as defense in depth. Ensure state-changing methods do not rely on GET. See [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
2. CSP can be misconfigured, unsupported, or bypassed and is a defense-in-depth control. Sanitize intentional rich markup, use safe rendering, and encode according to the output context. Do not place user input in executable contexts.
3. It may resolve to a private/loopback/link-local/metadata address; DNS may change between check and connection; IPv6 or mapped addresses may bypass IPv4-only checks; a redirect may target an internal host; URL parser normalization may change the checked host. Parse/canonicalize, validate all resolved/connected addresses, recheck redirects, restrict schemes/ports, and enforce egress policy. See [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).
4. `evilcompany.example` can satisfy the raw suffix check. Parse the URL and compare exact normalized host boundaries, or preferably accept a server-side route key and map it to a fixed local destination. Reject scheme-relative and userinfo forms. See [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).
5. CORS mainly controls whether cross-origin scripts can read responses; forms and other requests may still be sent. Cookie-authenticated state-changing endpoints still need CSRF defenses.
6. Missing `Sec-Fetch-*` headers cannot be treated as proof of a same-origin request. Retain a deliberate fallback such as strict Origin validation (Referer when Origin is absent) and/or a server-validated CSRF token, and reject ambiguous requests to sensitive endpoints according to the application's client support policy. The W3C Fetch Metadata document is a Working Draft; treat the headers as a useful signal, not identity or intent proof.
7. This is double-clickjacking; frame restrictions do not apply because the target is top-level. Enforce authorization on the server for the exact payment details and require transaction-specific confirmation/authorization. A generic extra click alone is not a sufficient security boundary.

## Tests and edge cases
- HTML text, quoted attribute, JavaScript string, URL component, and CSS contexts each require appropriate handling; dangerous contexts should be avoided.
- Report-Only CSP reports but does not block; a restrictive enforcing policy must be tested before production.
- A redirect to a private IP after an allowed initial URL must be rejected.
- Requests with absent Fetch Metadata headers must follow an explicit fallback policy; do not silently treat absence as same-origin.
- IPv4-mapped IPv6 addresses must receive equivalent range checks.
- A DNS validation lookup must constrain the address actually used by the connector; check mapped IPv6 and NAT64 paths, and disable or revalidate redirects.
- `frame-ancestors` does not protect a top-level page from double-click-based UI redress; sensitive actions need server-side authorization tied to the transaction.
- Missing Origin/Referer should follow a deliberate policy, not silently disable all CSRF validation.
- Open redirect tests should include `//host`, encoded separators, userinfo, deceptive suffixes, and multi-hop redirect chains.

## Reflection questions
Which parser consumes each user-controlled value? At which exact point is it encoded or validated? Does your outbound request policy constrain the actual socket destination? Which controls fail open when headers are missing?

<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Reference: Open redirects, request parsing, and defense in depth

## Scope and version
This group covers redirect and cross-boundary terms. Redirect safety follows [OWASP Unvalidated Redirects guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html); request parsing/injection uses [OWASP Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html); CSP3 status is [W3C Working Draft, 27 October 2026](https://www.w3.org/TR/CSP3/).

## How this group fits the mental model
Every redirect, forwarded request, and header-derived URL crosses a trust boundary. Validate using the representation actually consumed, enforce a narrow destination policy, and treat headers and parser behavior as security-sensitive.

## Supplied names explained
- `Redirect URI allowlist` — A fixed set of permitted redirect destinations or application-local routes. Prefer identifiers mapped server-side to destinations rather than accepting arbitrary URLs.
- `Open redirect` — A trusted application redirects to an attacker-selected location. Attackers may abuse the trusted domain in phishing or leak authorization codes/tokens.
- `Unvalidated redirect parameter` — User-controlled destination input used without strict verification. Reject external destinations or map a safe route key to a known location.
- `Scheme-relative redirect URL` — URL beginning with `//` that inherits the current scheme but supplies a different host. Naive checks for `https:` can miss this external redirect form.
- `Host-header poisoning` — Attacker-controlled Host/forwarded-host values affect links, redirects, password-reset URLs, or cache keys. Validate accepted hosts at the edge and trust forwarded values only from known proxies.
- `Request smuggling boundary` — Disagreement between HTTP intermediaries about request framing allows bytes to be interpreted as different requests. Keep parser/proxy behavior aligned and follow current protocol/server hardening guidance; it is not solved by application input validation alone.
- `Output encoding versus input validation` — Input validation enforces business constraints; output encoding prevents a value from becoming syntax in a particular output context. Use both where relevant; one does not replace the other.
- `Defense-in-depth security header` — A response header adding a browser-enforced restriction such as CSP or framing policy. It reduces risk but cannot repair unsafe server logic or unsupported clients.
- `CSP report-only rollout` — Deploying CSP in a non-enforcing reporting mode to discover violations before enforcement. Reports may be noisy or incomplete and do not block attacks.
- `DoubleClickjacking` — A user-interface redress technique targeting a sensitive action in a top-level window during a double-click. `frame-ancestors` and `X-Frame-Options` address framing; they do not stop this separate interaction pattern. Use server-enforced transaction authorization for sensitive operations.
- `Content injection` — Untrusted content inserted into an interpreted document or response. It can lead to XSS or altered behavior depending on context; use safe rendering and sanitization where rich content is intentional.
- `Origin confusion` — Mistaking the security origin of a request due to untrusted or inconsistently parsed scheme/host/port information. Compare canonical origins and distrust spoofable forwarding headers.
- `URL suffix allowlist flaw` — Checking that a hostname string ends with an allowed domain can accept attacker-controlled values such as `trusted.example.attacker.test`. Parse hostname and compare exact host or a dot-delimited subdomain boundary.
- `Redirect chain validation` — Revalidating every target in a sequence of redirects rather than only the initial URL. Later hops can move to an untrusted destination.
- `CORS is not CSRF protection` — CORS controls browser script access to cross-origin responses, but a browser can still send some cross-origin requests. Protect state-changing endpoints with anti-forgery controls.
- `CSP is not a replacement for safe rendering` — CSP can block some script execution paths, but policies can be misconfigured, bypassed, or unsupported. Prevent injection through context-aware encoding and safe APIs first.

## Cross-item comparison
An exact redirect allowlist compares a parsed destination to permitted values; a suffix check compares ambiguous text and can be bypassed. Output encoding prevents interpretation at a sink; input validation checks whether a value is acceptable business data. CORS and CSRF address different browser behaviors. CSP is defense in depth while safe rendering is primary. See [OWASP redirect](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) and [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) guidance.

## Examples
For a post-login destination, accept a route key such as `dashboard` and map it to a fixed relative path. If external redirects are necessary, parse and compare exact normalized origins against a narrow list. Reject scheme-relative URLs, userinfo tricks, and encoded separators. For password reset links, construct the public host from trusted configuration rather than the incoming Host header.

## Common mistakes
- Accepting any URL that starts with `https://trusted.example` (userinfo or host confusion).
- Using `endsWith` on raw host text.
- Validating only the first redirect hop.
- Trusting Host or forwarded-host headers from untrusted clients.
- Treating `frame-ancestors` or SameSite as complete clickjacking/UI-redress protection.
- Treating CORS as CSRF protection.
- Relying on a security header while leaving unsafe HTML sinks.

## Knowledge checks with answers
1. Is `//evil.example` an external redirect risk? **Yes; it is scheme-relative.** 2. Does CORS stop every state-changing cross-origin request? **No.** 3. Why revalidate redirect chains? **A later hop can leave the allowed destination.**

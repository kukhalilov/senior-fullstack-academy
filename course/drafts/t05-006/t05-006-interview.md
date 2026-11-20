<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CSRF XSS CSP injection SSRF open redirects and clickjacking — Interview questions and reasoning

## Core questions
1. Distinguish CSRF and XSS.
2. Why isn't input validation enough to prevent injection?
3. Why does SSRF require more than URL validation?

## Concise interview answers
1. CSRF abuses a browser's ambient credentials to submit an unwanted request; XSS executes attacker-controlled code in the trusted origin. XSS can often act as the user and bypass client-side CSRF defenses.
2. A valid business value can still contain syntax in its output context. Encode for the exact sink, sanitize only intentionally accepted markup, and use parameterized/structured APIs for interpreters. See [OWASP XSS](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html) and [Injection guidance](https://cheatsheetseries.owasp.org/cheatsheets/Injection_Prevention_Cheat_Sheet.html).
3. DNS rebinding, redirects, IPv6 forms, parser normalization, and network reachability can bypass raw-string checks. Validate the canonical destination and actual connection, recheck redirects, and restrict egress. See [OWASP SSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

## Deep follow-up answers
**What is CSP's role?** It restricts resource loading and execution and can limit impact, but it is defense in depth. Safe rendering and context-aware encoding remain primary. CSP Level 3 is currently a W3C Working Draft, not a final Recommendation; see [W3C status](https://www.w3.org/TR/CSP3/).

**How do CSRF tokens work?** A server issues an unpredictable token bound to a session/request and requires it on state-changing operations. SameSite and origin checks add layers. XSS may read a token or act from the origin, so preventing XSS is still critical.

**How do you prevent clickjacking?** Use CSP `frame-ancestors` to define allowed framing origins and X-Frame-Options where legacy support is needed. Avoid relying on frame-busting JavaScript.

**Can Fetch Metadata replace CSRF tokens?** It can reject many cross-site requests using `Sec-Fetch-Site`, but headers are not present in every client/context and do not stop client-side CSRF caused by vulnerable same-origin JavaScript. Keep an explicit fallback and use endpoint-specific policy.

**Does `frame-ancestors` stop double-clickjacking?** No. It controls embedding; double-clickjacking targets a top-level interaction. Protect sensitive operations with server-side authorization and transaction-specific confirmation.

## Scenario questions
- A fetch service allows an external hostname that resolves to a public IP but redirects to a private IP. Revalidate each hop and constrain network egress.
- A rich-text field strips `<script>` but permits unsafe attributes/URLs. Use a maintained sanitizer with an explicit allowlist and test browser parsing behavior.
- A CSP report-only policy logs violations. Explain why the site is not yet protected by that policy.

## Tradeoffs and alternatives
Encoding preserves data as text; sanitization allows a constrained subset of markup. Parameterization prevents query-grammar injection; validation enforces business constraints. CSP and security headers reduce residual risk but do not replace safe code. SSRF allowlists are strict and can limit product flexibility; where arbitrary URLs are required, isolate fetching, constrain egress, cap time/size, and validate each connection/redirect.

## Common weak answers
- “We validate all inputs.” Which grammar and sink?
- “CORS stops CSRF.” It does not stop every cross-origin request from being sent.
- “CSP prevents XSS.” It can mitigate some execution but safe rendering is primary.
- “We block localhost.” Private ranges, DNS changes, IPv6, redirects, and metadata addresses remain.
- “The URL ends with our domain.” Raw suffix checks are not host validation.

## Self-check rubric
You can identify the attacker-controlled input, the parser/sink, the right encoding or safe API, and the full network/browser boundary. You explain defense in depth without claiming a header solves unsafe application behavior.

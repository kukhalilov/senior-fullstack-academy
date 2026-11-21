
# cookies sessions token and JWT lifecycle tradeoffs — Reference: Browser cookies, session identifiers, and server-side session controls

## Scope and version
This group covers browser cookie transport and server-side session lifecycle. Cookie and session guidance follows the [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). OAuth/JWT issuance is in the separate reference group.

## How this group fits the mental model
The cookie tells the browser what value to send and when. The session identifier lets the server locate state. Cookie attributes constrain browser behavior; server-side lifecycle controls constrain the authority represented by the identifier.

## Supplied names explained
- `HTTP cookie` — A browser-managed state value associated with a host and sending rules. Treat authentication cookies as bearer credentials because possession can enable session use.
- `Set-Cookie` — A response field instructing a user agent to store or update a cookie and its attributes. Each cookie should be set with deliberate scope, security flags, and lifetime.
- `Cookie request header` — The browser's request field carrying applicable stored cookie pairs. It generally does not echo the original attributes, so the server cannot infer that a cookie was Secure or SameSite merely from this header.
- `Secure cookie attribute` — Restricts browser sending to secure transport. It does not prevent script access or all CSRF/XSS attacks.
- `HttpOnly cookie attribute` — Prevents ordinary client-side scripts from reading the cookie value. It does not prevent injected script from making authenticated requests as the user.
- `SameSite=Strict` — Restricts sending the cookie in cross-site contexts more strongly, which can disrupt legitimate cross-site navigations and login flows. Test application behavior before choosing it.
- `SameSite=Lax` — Allows cookies in a more limited set of cross-site situations, commonly including some top-level safe navigations. It is not a blanket CSRF defense for all application patterns.
- `SameSite=None` — Allows cross-site cookie use and requires Secure in modern cookie behavior. Cross-site use should have an explicit need and appropriate CSRF defenses.
- `Domain cookie attribute` — Broadens cookie availability to the named domain and eligible subdomains. Omitting it creates a host-only cookie and is usually narrower; broad domain scope can expose sibling services.
- `Path cookie attribute` — Limits which request paths cause the browser to send a cookie. It is not a robust isolation boundary between mutually untrusted applications on one host.
- `Expires cookie attribute` — Sets an absolute cookie expiration date. Client expiration is not server-side session invalidation.
- `Max-Age cookie attribute` — Sets a relative cookie lifetime and generally takes precedence over Expires when both are present. Server-side expiry still needs its own policy.
- `Cookie prefixes __Host- and __Secure-` — Browser-enforced naming conventions that impose constraints on Secure and, for `__Host-`, host-only scope/path. They help prevent some cookie injection/scope mistakes when correctly used; support and exact constraints follow user-agent rules.
- `Session identifier entropy` — Unpredictability of the identifier. Use a cryptographically secure generator and sufficient entropy (OWASP specifies at least 64 bits; its implementation guidance favors at least 128 bits when generating a session ID yourself); do not embed user IDs, timestamps, or other guessable meaning.
- `Session fixation` — An attacker causes a victim to use an identifier the attacker knows, then benefits after the victim authenticates. Issue a new identifier on authentication and privilege changes.
- `Session hijacking` — An attacker reuses a stolen valid identifier. Protect transport and storage, limit lifetime, detect suspicious use where appropriate, and invalidate compromised sessions.
- `Session rotation after authentication` — Replacing the pre-authentication identifier with a fresh one after successful login or privilege elevation. This breaks fixation continuity.
- `Idle timeout` — Ends a session after a period without activity. It limits unattended exposure but should reflect user workflows and risk.
- `Absolute session lifetime` — Caps total session age regardless of activity. It complements idle timeout and can require reauthentication.
- `Server-side session store` — Holds session state keyed by an opaque identifier. Central state enables revocation and updates but requires availability, access control, and scaling strategy.
- `Session revocation` — Server-side denial of a previously issued session identifier, such as after account compromise or permission change. Design a reliable mechanism across nodes.
- `Logout invalidation` — Clearing the browser cookie and invalidating server-side session state. Clearing only the cookie may leave a stolen copy valid.
- `Session identifier in URL risk` — URLs leak through history, referrers, logs, screenshots, and copied links. Do not put session credentials in URLs.
- `localStorage session-token persistence risk` — OWASP now advises against storing session identifiers or authentication tokens in `localStorage` or `sessionStorage`: any JavaScript executing in the origin can read them, so an XSS flaw can exfiltrate credentials. Prefer an HttpOnly cookie or a backend-for-frontend pattern where suitable; HttpOnly reduces credential readability but does not stop injected code from acting through the user session, and cookie use still requires CSRF defenses. See [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- `Session verifier hash` — Storing a hash/verifier of a random session secret can reduce the value of a database read compromise, because the raw bearer value is not stored directly. Use a suitable one-way hash and compare safely; protect the verifier store as security-critical.

## Cross-item comparison
`Secure` and `HttpOnly` constrain different access paths: network transport versus script readability. `SameSite` concerns cross-site sending. `Expires`/`Max-Age` control browser persistence; `Idle timeout` and `Absolute session lifetime` control server acceptance. A host-only cookie is narrower than a Domain-scoped cookie. OWASP's [session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) covers these controls together.

## Examples
After login, rotate the session identifier, store only an opaque random handle, and set a host-only Secure/HttpOnly cookie with an intentional SameSite and lifetime policy. On logout, revoke the server record and expire the browser cookie. If multiple application nodes serve requests, use a shared protected store or another coordinated revocation mechanism.

## Common mistakes
- Treating browser cookie expiry as server revocation.
- Using Domain or Path as if they were strong same-origin isolation.
- Believing HttpOnly eliminates XSS impact.
- Persisting bearer tokens in URLs or logs.
- Setting SameSite=None without Secure and CSRF analysis.
- Reusing an anonymous session ID after successful authentication.

## Knowledge checks with answers
1. What does Secure do? **Limits browser sending to secure transport.** 2. What prevents a stolen session from staying valid after logout? **Server-side invalidation.** 3. Why rotate at login? **To prevent fixation of a known pre-authentication identifier.**

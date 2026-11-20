<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# cookies sessions token and JWT lifecycle tradeoffs — Big-picture orientation and mental model

## Problem and purpose
After authentication, a service needs a way to recognize later requests. Browsers can carry a session identifier in a cookie; APIs can accept bearer tokens. Both are credentials: anyone who obtains one may act with its authority until it expires or is revoked.

## Plain-language mental model
A session identifier is like a claim ticket: the server looks it up to find state. A self-contained token is more like a signed pass containing assertions that a verifier checks. A signed pass is not secret; anyone holding it may present it, and its claims may be readable. The central design question is how to limit, protect, refresh, and revoke authority.

## How the parts fit together
The server authenticates the user, then issues a browser cookie or token. On each request the credential is transported, validated, and mapped to an identity; authorization then decides what that identity may do. Cookies are automatically attached in some browser contexts, which creates CSRF considerations. Bearer tokens are generally sent explicitly, but theft enables replay. A JWT has signed/encrypted structure, but decoding is not validation. OWASP's [Session Management guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html), [JWT Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725), and OAuth security guidance in [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) frame these boundaries.

## Concept map
- **Browser state:** cookie attributes limit when and how a browser sends values; the server-side session store enables revocation.
- **Token semantics:** access tokens authorize resource access; ID tokens communicate authentication to an OIDC client; refresh tokens obtain new tokens.
- **Validation:** verify integrity, algorithm, issuer, audience, lifetime, and key according to the token's intended type.
- **Lifecycle:** short access lifetime, refresh rotation, revocation lookup, and sender constraints solve different problems.

## End-to-end walkthrough
At sign-in, the server rotates the session identifier so an attacker cannot fix a pre-login value and inherit the authenticated session. It stores session state server-side and sends an `HttpOnly`, `Secure` cookie with an appropriate `SameSite` policy and bounded lifetime. On each request, the browser sends the cookie over HTTPS; the server resolves it and checks session expiry. On logout, it invalidates the server record and clears the cookie. By contrast, a JWT-based API validates the token protection and expected claims on every request; without a revocation lookup, a stolen token can remain usable until expiry.

## When to use it and tradeoffs
Server-side sessions make revocation and permission changes straightforward but require shared storage or affinity in scaled deployments. Self-contained JWTs can be verified without a central session lookup, but revocation and freshness are harder. Do not choose JWT merely to avoid designing session storage. Keep tokens out of URLs and avoid long-lived browser-accessible storage when script compromise is in the threat model. Cookie flags reduce specific exposures but do not stop XSS or eliminate CSRF.

## What later lessons cover
The next lesson explains cookie/session controls; the token reference explains token types and JWT validation names. The OAuth/OIDC topic explains how tokens are issued and what each is for.

<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# cookies sessions token and JWT lifecycle tradeoffs — Interview questions and reasoning

## Core questions
1. Compare an opaque server session with a self-contained JWT.
2. What must an API validate in a JWT?
3. What distinguishes an access token from an ID token?

## Concise interview answers
1. An opaque session ID looks up server state and is easy to revoke centrally, but requires coordinated storage. A JWT can be validated locally but has harder immediate revocation and freshness.
2. Restrict allowed algorithms; verify integrity with a trusted key; validate issuer, audience, lifetime, and intended token type/purpose. RFC 8725 outlines JWT best practices: [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725).
3. An access token is intended for a resource server to authorize access; an ID token is an OIDC assertion for the client about authentication. They are not interchangeable.

## Deep follow-up answers
**Does signing hide JWT contents?** No. JWS protects integrity/authenticity; payload remains readable. Use a JWE where confidentiality is required, but still validate its recipient, issuer, purpose, and claims. [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) defines JWT structures.

**How can you revoke a token?** Options include central state/introspection, denylisting, short expiration, refresh-token family revocation, or sender constraint. Key rotation can invalidate many tokens but has broad effects and is not a fine-grained routine strategy. Choose based on required revocation latency and availability.

**What is the value of refresh rotation?** Replacing a refresh token and detecting reuse of a consumed token can reveal theft. This requires server-side tracking and a defined response for the whole grant/session. OAuth BCP [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) discusses current security guidance.

## Scenario questions
- A token verifies but has an unexpected `aud`: reject it at that resource server.
- A user logs out, but a stateless access token remains valid: explain the remaining validity window and revocation design.
- XSS steals a localStorage token: explain why signature does not stop theft and compare safer storage tradeoffs.

## Tradeoffs and alternatives
Cookies are convenient for browsers and can use Secure/HttpOnly/SameSite restrictions, but ambient sending creates CSRF concerns. Explicit bearer headers avoid some ambient-cookie behavior but token storage remains sensitive. Server sessions offer central control; JWTs can reduce lookup cost but add validation and revocation complexity. OWASP covers session controls in its [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

## Common weak answers
- “JWT is encrypted.” Usually a signed token is only encoded and signed.
- “The signature makes it safe.” It does not validate issuer, audience, lifetime, token type, or authorization.
- “We deleted it on logout.” A copied self-contained token may still work.
- “Refresh tokens are just longer access tokens.” They have a different recipient and purpose and should not be sent to resource APIs.

## Self-check rubric
You distinguish credential transport from server state, token types by purpose, parsing from validation, and statelessness from revocability. You can describe how rotation, expiry, and sender constraints address different risks.

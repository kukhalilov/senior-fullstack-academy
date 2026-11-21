
# OAuth 2.0 OIDC flows scopes PKCE and token storage — Interview questions and reasoning

## Core questions
1. Is OAuth a login protocol?
2. Why use Authorization Code with PKCE?
3. Distinguish access and ID tokens.

## Concise interview answers
1. OAuth delegates authorization to access resources; OIDC adds an identity layer for authentication assertions.
2. The code is returned through a browser redirect; PKCE binds redemption to the client that started the request, mitigating intercepted-code reuse. Current recommendation: [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700), PKCE mechanics: [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636).
3. An access token is intended for a resource server; an ID token is intended for the OIDC relying party and asserts authentication/subject claims.

## Deep follow-up answers
**What do state and nonce protect?** State correlates the authorization transaction and helps reject unsolicited/cross-site responses; nonce binds an ID token to an OIDC request. They are not substitutes for each other or PKCE.

**Why exact redirect matching?** A loose redirect can deliver a code or token to an attacker-controlled destination. Even a registered URI can contain an open redirector that forwards the response; both authorization-server and client redirect surfaces matter.

**How does a public client authenticate?** It cannot prove possession of a static secret shipped to users. Use PKCE and appropriate platform registration; use a confidential client only when a server-side environment can keep credentials secret.

**What changed in browser OAuth guidance recently?** RFC 10017, published August 2026, is a browser-based application BCP. It requires public browser clients to use PKCE and distinguishes browser-only clients, token-mediating backends, and backend-for-frontend designs; it does not turn browser code into a confidential client.

**Is OIDC `sub` globally stable, and can UserInfo claims be merged blindly?** No. `sub` is locally unique within an issuer and may be pairwise for privacy. UserInfo is called with an access token, and its `sub` must match the ID Token `sub` before the RP combines the returned claims.

## Scenario questions
- A token signature is valid but issuer or audience is unexpected: reject.
- A browser app embeds a secret: classify as public; remove the secret and use PKCE.
- A code flow's state value is present but mismatched: reject the response and do not create a session.
- A team proposes OAuth 2.1 as final: explain that this curriculum relies on RFC 9700 BCP and does not assume OAuth 2.1 finalized without standards-status verification.

## Tradeoffs and alternatives
Redirect-based code flow avoids returning access tokens through the front channel. PKCE adds per-transaction state but prevents an intercepted code from being sufficient. A backend-for-frontend can keep tokens server-side but adds server operations and session management. Discovery improves interoperability but the issuer and metadata origin must be trusted. Current recommendations are in [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) and OIDC specifications.

## Common weak answers
- “OAuth logs the user in.” It delegates authorization; OIDC adds identity.
- “The client secret is hidden in JavaScript.” Users can inspect it.
- “PKCE handles the whole flow security.” It does not replace state, redirect, issuer, nonce, or audience validation.
- “Any token from our provider is acceptable.” Audience and token purpose matter.

## Self-check rubric
You can identify actors and token recipients; trace code/PKCE; explain state, nonce, redirect, issuer, and audience as separate checks; and distinguish BCP recommendations from draft or provider-specific features.

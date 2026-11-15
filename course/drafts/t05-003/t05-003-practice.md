<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# cookies sessions token and JWT lifecycle tradeoffs — Exercises and worked solutions

## Goals
Diagnose session and token failures, apply validation boundaries, and select a lifecycle approach that matches revocation needs.

## Worked example
A service decodes a JWT, sees `"role":"admin"`, and permits deletion. The service has parsed attacker-controlled text but has not established who issued it or whether it was changed. Verify the signature using a configured issuer key and algorithm, then validate issuer, audience, time claims, and expected token type before authorization. [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725) gives JWT security practice.

## Exercises
1. A validly signed token for `billing-api` is accepted by `files-api`. Which check is missing?
2. A browser logout clears its cookie, but the server session remains active. What can an attacker with a copied cookie still do?
3. A developer stores access tokens in localStorage and says HttpOnly is unnecessary because the JWT is signed. Identify two errors.
4. A refresh token is exchanged repeatedly but old values remain usable. What property of rotation is missing?
5. The token header's `kid` value is concatenated into a filesystem path. Explain the risk and a safer lookup model.

## Progressive hints
1. Signature and intended recipient differ. 2. Think possession of bearer credentials. 3. Signing does not hide or protect against script theft. 4. Rotation needs old-token invalidation/reuse tracking. 5. Header fields are untrusted input.

## Complete solutions
1. Audience validation. The API must check that it is an intended recipient; signature validity alone is insufficient.
2. The copied bearer session can remain usable until server-side expiration/revocation. Logout should invalidate server state and clear the client cookie.
3. A signed JWT payload is readable, and signing does not prevent XSS from reading localStorage and exfiltrating the token. HttpOnly cookies prevent ordinary script reads but do not stop injected script from making authenticated requests; cookie use also requires CSRF analysis. See [OWASP session guidance](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
4. The issuer must invalidate the consumed refresh token and track the token family/reuse so replay of an old token can be detected and handled. Rotation without server-side state is not meaningful revocation.
5. An attacker may manipulate path resolution or cause unintended key lookup. Treat `kid` as a selector within a trusted, preconfigured issuer key set; reject unknown identifiers and never derive arbitrary paths or URLs from it.

## Tests and edge cases
- Wrong issuer: reject even if key/signature are valid.
- Wrong audience: reject at the resource server.
- Expired or not-yet-valid token: reject within the documented clock-skew policy.
- Logout then replay old cookie: reject after server-side invalidation.
- Refresh-token reuse: trigger the configured family response, commonly revoking the related grant/session.
- Multiple JWT types from one issuer: validate expected type and purpose to prevent token substitution.

## Reflection questions
What needs immediate revocation in your application? Which credential can renew another credential? Where can browser scripts read it? What claims are actually checked at each resource server?

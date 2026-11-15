<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# OAuth 2.0 OIDC flows scopes PKCE and token storage — Exercises and worked solutions

## Goals
Trace a code flow, diagnose boundary mistakes, and select correct token audiences and client protections.

## Worked example
A native app receives an authorization code through its redirect. Another app intercepted it. With PKCE, the interceptor cannot redeem it without the verifier held by the original client. This assumes the client used a fresh verifier and the server enforced the challenge. PKCE is specified in [RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636).

## Exercises
1. A SPA embeds `client_secret=...` and claims it is confidential because minified. What is the client type and fix?
2. An ID token's signature verifies, but its `aud` is another app's client ID. Should the RP accept it?
3. The client validates a returned `state` only for presence, not equality to the stored request value. What is missing?
4. An authorization server uses exact redirects, but the client callback has `/redirect?next=` open redirect behavior. Explain the risk.
5. A client requests `admin.read admin.write profile` for a read-only page. What principle applies?

## Progressive hints
1. Who can inspect browser code? 2. Who is the intended ID-token recipient? 3. Correlation requires matching transaction values. 4. A code can be forwarded after reaching a trusted endpoint. 5. Limit delegated authority.

## Complete solutions
1. Browser-delivered code is a public client and cannot keep a static secret. Remove the secret and use Authorization Code with PKCE; consider a backend-for-frontend if server-side token custody is needed.
2. No. The RP must validate audience against its own registered client identity as well as issuer, signature, time, and nonce/transaction context. OIDC validation is specified in [OpenID Connect Core](https://openid.net/specs/openid-connect-core-1_0.html).
3. Compare the returned state with the unpredictable value stored for the initiating transaction, then consume it. Presence alone does not bind the response.
4. The authorization server may return the code to the registered callback, which then redirects it to an attacker-controlled destination. Remove the open redirect or allow only a strict set of destinations and avoid forwarding credentials.
5. Least-privilege scope: request only the read scope and any profile data needed. OAuth scope semantics are defined by the issuer/resource; broader grants increase exposure. See [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700).

## Tests and edge cases
- Wrong issuer response: reject before token exchange or acceptance according to the flow's issuer binding.
- Wrong state: reject and do not create a local session.
- Wrong nonce in ID token: reject the authentication response.
- Wrong audience: reject token for this RP/API.
- Code reused after exchange: reject; authorization codes are short-lived and single-use in the protocol design.
- Refresh token replay after rotation: trigger the configured reuse response.

## Reflection questions
Which value is held only by the initiating client? Which values bind response, identity assertion, destination, and resource recipient? Can any browser-delivered secret truly remain secret?

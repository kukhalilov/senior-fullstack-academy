
# cookies sessions token and JWT lifecycle tradeoffs — Core concepts and how they fit together

## Learning objectives
Trace a session and token lifecycle, distinguish cookie transport from session state, understand signed versus encrypted JWTs, name essential validation dimensions, and compare revocation and refresh strategies.

## Prerequisites
Understand authentication and HTTPS. A bearer credential grants authority by possession; protecting the channel does not prevent later theft from a compromised browser, logs, or endpoint.

## Core concepts
A cookie is a browser-managed name/value transport mechanism. It may carry an opaque session identifier that the server looks up. The identifier must be unpredictable and treated as a secret. Session fixation occurs when an attacker causes a victim to authenticate using a known identifier; rotate the identifier after authentication and privilege changes. Session hijacking is unauthorized use of a stolen valid session. Idle timeout limits inactivity; absolute lifetime limits total duration even with activity. Logout must invalidate server-side authority, not merely hide the client cookie.

A bearer access token is usable by whoever possesses it. An opaque token has no application-readable claims and is interpreted by its issuer/resource server or an introspection mechanism. A JWT is a compact claims representation. A JWS provides integrity/authenticity under a signature or MAC; a JWE encrypts content. Base64url encoding is not encryption. `ID token`, `access token`, and `refresh token` have distinct audiences and purposes; never substitute one based only on its shape.

## Mechanisms and relationships
JWT verification is more than parsing. Select an allowed algorithm from trusted configuration, verify the cryptographic operation and key, then validate required issuer, audience, and time claims for the expected token type. Reject `alg=none` where signed tokens are required and guard against algorithm confusion. The `kid` header can help select a key from a trusted configured set but must not allow arbitrary key retrieval. Nested JWT structures need explicit processing rules. RFC 8725 gives security recommendations; [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519) defines the format.

Stateless validation avoids a per-request session lookup but makes immediate revocation and privilege freshness difficult. Short access-token lifetime limits the exposure window; refresh-token rotation detects reuse under a properly designed server-side family/state model; a revocation list or introspection adds central state; sender-constrained tokens reduce usefulness to a thief who lacks the bound key. These measures are complementary, not synonyms. OAuth security BCP [RFC 9700](https://datatracker.ietf.org/doc/html/rfc9700) discusses token theft and rotation.

## Worked examples
**JWT decoded but not verified:** an attacker changes `role` and re-encodes the JSON. The service must verify the signature and claims before use; decoding alone gives no trust.

**Wrong audience:** a validly signed token issued for service A is presented to service B. Signature success does not make it acceptable to B; audience validation must fail.

**Logout with self-contained access token:** deleting a browser copy does not revoke a stolen copy. Expiry, revocation state, or sender constraint determines remaining exposure.

## Misconceptions and edge cases
- `HttpOnly` prevents JavaScript from reading the cookie through ordinary script APIs; it does not make XSS harmless because injected code may still act as the user.
- `SameSite` reduces some cross-site cookie sending but does not replace CSRF design for every flow.
- Cookie `Path` is routing scope, not a strong security isolation boundary.
- Refresh rotation only detects reuse if the server tracks token family/reuse state and responds appropriately.
- A valid signature is not equivalent to correct issuer, audience, lifetime, or token purpose.

## Knowledge checks with answers
1. Does a signed JWT hide its payload? **No; signing protects integrity/authentication, while JWE is the encrypted form.**
2. Which token is intended to be presented to an API? **The access token, with the API validating its issuer, audience, lifetime, and expected type.**
3. Does deleting a cookie revoke the server session? **Only if the server invalidates the corresponding session; clearing client state alone may not.**

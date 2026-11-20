<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CORS browser origins preflight and credential policy — Exercises and worked solutions

## Goals
Trace browser CORS behavior and distinguish response sharing from request sending and server authorization.

## Worked example
A page sends a cross-origin JSON PUT. The browser first sends OPTIONS with intended method and headers. If the server's preflight response permits them, the browser sends PUT; it still checks the actual response before exposing it to script. The Fetch Standard defines the algorithm: [WHATWG Fetch](https://fetch.spec.whatwg.org/).

## Exercises
1. An API returns no CORS headers for a simple cross-origin GET. Was the GET necessarily blocked before reaching the server?
2. A cookie-credentialed request receives `Access-Control-Allow-Origin: *` and `Access-Control-Allow-Credentials: true`. Why can't the page read it?
3. An origin allowlist uses `origin.EndsWith("example.com")`. Give a bypass and a safer approach.
4. A developer exposes CORS only on `/admin` and assumes this prevents curl access. What security boundary remains necessary?
5. A team implements `Access-Control-Allow-Private-Network` based on the draft and assumes every browser enforces it. What should be changed in that assumption?
6. A credentialed cross-origin `PUT` works in curl but fails in a browser because the API returns 401 to OPTIONS. Why, and where should authentication still be enforced?
7. A request uses `Content-Type: application/json` with `POST`. Is the method safelisted, and does that guarantee there will be no preflight?

## Progressive hints
1. CORS can block response sharing after a simple request is sent. 2. Credentials require explicit origin. 3. Think attacker-controlled longer hostname. 4. Browser policy does not authenticate. 5. Check standards status and implementations.

## Complete solutions
1. No. A simple request may be sent, then the browser blocks JavaScript from reading the response because sharing headers are absent. The server must not rely on CORS to prevent state changes.
2. Wildcard origin is incompatible with credentialed response sharing. Return the exact allowed origin and allow credentials explicitly, with appropriate `Vary: Origin` behavior.
3. `https://example.com.attacker.test` or `https://evil-example.com` can satisfy naive suffix logic depending on string input. Parse and normalize the origin, then compare exact configured origins or a carefully validated dot-boundary subdomain.
4. Authentication and authorization on the server are still required. CORS does not restrict non-browser clients or direct requests.
5. Treat it as evolving proposal behavior, not a universal stable contract. The current linked PNA document is a Draft Community Group Report, not a W3C Standard: [PNA status](https://wicg.github.io/private-network-access/). Verify browser support and do not rely on it as the only protection.
6. The browser's preflight OPTIONS request does not include cookies or HTTP authentication, so authentication middleware may reject it before the real request. Configure the CORS/preflight path to answer the protocol check without requiring user credentials; enforce authentication and authorization on the actual PUT. CORS permission itself is not user authorization. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
7. `POST` is a safelisted method, but the `application/json` content type is not a safelisted Content-Type essence. The browser normally preflights the request because of the header, so the method alone does not determine the outcome. [WHATWG Fetch](https://fetch.spec.whatwg.org/).

## Tests and edge cases
- `http` vs `https`, alternate port, and hostname produce distinct origins.
- Request from an unlisted origin: JavaScript cannot read response; server auth still applies.
- Simple state-changing request without preflight: server still requires CSRF protection where applicable.
- Credentialed allowed origin: explicit concrete ACAO, allow-credentials, and cache variation where relevant.
- Origin containing attacker-controlled suffix, null/opaque, malformed, or unexpected port: reject unless explicitly supported by policy.
- Policy changed while preflight is cached: test browser cache behavior and do not assume immediate propagation.
- Credentialed preflight: OPTIONS arrives without cookie/auth credentials; actual request is still authorized server-side.
- Safelist boundary: `text/plain` may qualify by media type while `application/json` does not; header value constraints also apply.

## Reflection questions
What happens at the browser, and what happens at the server? Does a failed CORS check prevent mutation? Which exact origin strings are trusted? What authentication protects the same endpoint from non-browser clients?

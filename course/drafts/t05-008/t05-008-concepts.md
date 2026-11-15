<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CORS browser origins preflight and credential policy — Core concepts and how they fit together

## Learning objectives
Explain same-origin isolation and CORS response sharing, distinguish simple and preflighted requests, configure credentialed CORS safely, and recognize failures that do not block server-side actions.

## Prerequisites
Know that browsers run scripts with an origin and can send HTTP requests to other origins. A cross-origin request is not automatically an unauthorized request; server authentication and authorization remain separate.

## Core concepts
An origin consists of scheme, host, and port. `https://app.example` and `http://app.example` differ by scheme; different ports are different origins too. The same-origin policy restricts script access to many cross-origin responses. CORS is a protocol in which the server opts browser origins into response sharing. The [Fetch Standard](https://fetch.spec.whatwg.org/) defines CORS; the MDN [CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) provides browser-oriented examples.

Some “simple” requests meet safelisted method/header/content-type criteria and can be sent without a preflight. A non-simple request often triggers preflight: the browser sends OPTIONS with intended method/header names and waits for permission. A successful preflight is not the actual operation; it authorizes the browser to send it. The actual response also needs valid CORS permission before JavaScript can read it.

## Mechanisms and relationships
For credentialed CORS, the client must opt into credentials and the server must explicitly allow credentials and echo an allowed origin. `Access-Control-Allow-Origin: *` is incompatible with credentialed response sharing. If the response varies by Origin, include `Vary: Origin` so shared caches do not deliver one origin's CORS response to another. CORS response headers do not authenticate the caller; browsers can be bypassed by curl, backend clients, or malicious direct calls. Require server authentication/authorization independently.

Preflight responses may be cached according to `Access-Control-Max-Age`, subject to browser caps and cache rules. Policy changes may therefore appear delayed for a client. Redirects in CORS flows have browser/spec behavior that has evolved; avoid fragile redirect-dependent cross-origin designs and use canonical API endpoints. Private Network Access proposes additional protections for public-to-private network requests, but its published document is a Draft Community Group Report, not a W3C Standard; verify current browser implementation before relying on it ([PNA draft](https://wicg.github.io/private-network-access/)).

## Worked examples
**Read-only simple request:** the browser may send a safelisted GET to an API. If the response lacks allowed-origin headers, JavaScript cannot read it; the server still received the request.

**JSON PUT:** browser preflights with requested method and header names. If denied, browser does not send the actual PUT. The API still must validate auth and permissions because non-browser clients can call it directly.

**Credentialed fetch:** browser sends cookies only when client credentials mode and cookie policy permit; the server returns exact allowed origin and `Access-Control-Allow-Credentials: true`. Wildcard origin cannot authorize credentialed response sharing.

## Misconceptions and edge cases
- CORS is not a firewall: direct non-browser clients do not enforce browser CORS rules.
- A blocked response does not prove the request never reached the server.
- Preflight permission is distinct from authorization of the actual operation.
- Origin is scheme/host/port; path is not part of origin.
- Allowing every subdomain with a naive suffix check may include an attacker-controlled hostname.
- CORS is not CSRF protection; simple requests may be sent without a preflight.
- PNA draft headers should not be taught as stable universal browser behavior.

## Knowledge checks with answers
1. What does CORS primarily control? **Whether browser code may access a cross-origin response.**
2. Does failed CORS always mean no request was sent? **No; a simple request may have reached the server.**
3. Can a credentialed response use wildcard allowed origin? **No.**

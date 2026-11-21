# End-to-end browser navigation and web request lifecycle — Reference: Browser credentials, origins, and request visibility

## Scope and version

This reference separates browser sharing policy from server access control. Exact request behavior depends on Fetch mode, credentials mode, method, headers, and browser policy.

## How this group fits the mental model

The browser may send a request, attach credentials, and still prevent script from reading the response. Conversely, a preflight can fail before the actual request is sent. Inspect the Network panel and server evidence instead of inferring the path from one console message.

## Supplied names explained

- `Cookie attachment rules` — The browser selects cookies using host/domain, path, expiry, secure transport, SameSite, and request context. A cookie is an ambient credential and requires CSRF-aware design.
- `Secure HttpOnly SameSite cookie attributes` — `Secure` limits sending to secure transport; `HttpOnly` prevents script APIs from reading the cookie; `SameSite` constrains cross-site sending in defined contexts. These attributes reduce specific risks but do not replace authorization or XSS defenses.
- `CORS simple request` — A cross-origin request that meets Fetch’s safelisted method/header/content-type conditions may be sent without preflight. The browser still checks whether script may read the response.
- `CORS preflight OPTIONS request` — For some cross-origin requests, the browser first sends OPTIONS describing the requested method/headers. If the server policy rejects it, the browser generally does not send the actual request.
- `Access-Control-Allow-Origin` — A response field that identifies an origin allowed to read the response. Credentialed sharing requires an explicit origin rather than `*`.
- `Access-Control-Allow-Credentials` — A response field that indicates credentialed response sharing is permitted for a compatible request. It does not authenticate or authorize the user.
- `Credentialed cross-origin fetch` — A Fetch request configured to include eligible credentials across origins. Cookie SameSite and browser privacy policy still affect whether credentials are sent; server CORS headers govern script access to the response.
- `CSRF versus CORS distinction` — CSRF abuses automatically attached credentials to cause an unwanted state change; CORS controls script access to cross-origin responses. CORS is not a general CSRF defense.
- `Content Security Policy` — A response policy that restricts sources and capabilities available to a document, reducing some injection impact. It does not make unsafe application output harmless or replace authorization.
- `Mixed content blocking` — Browsers restrict insecure subresource requests from secure pages according to resource and browser rules. Fix the resource URL and deployment rather than weakening the secure page.
- `Fetch response exposure versus network delivery` — The browser can send a request but block script from reading its response due to CORS. Preflight failure is a different case in which the actual request may not be sent.
- `AbortController cancellation` — A signal can abort supported Fetch work and response-body consumption. It does not guarantee that a server which already received the request rolls back work.

## Cross-item comparison

Preflight governs whether certain requests proceed; CORS response fields govern whether script can access the result. Cookies determine ambient credential attachment. Authentication/authorization are server decisions. CSRF defenses address unwanted state changes; CSP constrains document capabilities.

## Examples

For an API call with an `Authorization` header, the browser may issue OPTIONS first. Allow the intended origin, method, and header through a narrowly configured CORS policy. Then the actual request is authenticated and authorized by the server. If cookies are used, configure credentials and SameSite/CSRF protections separately.

## Common mistakes

- Returning `Access-Control-Allow-Origin: *` with credentials.
- Enabling every origin and method to “fix CORS.”
- Believing CORS prevents non-browser clients from calling an endpoint.
- Believing `HttpOnly` prevents XSS from performing authenticated actions.
- Treating a CORS console error as proof the API did no work.

## Knowledge checks with answers

1. Does CORS decide whether the user has permission? No; server authorization does.
2. Can a request be sent even if script cannot read the response? Yes, for some cross-origin request types.
3. What often precedes a failed preflight? The browser sends OPTIONS; the actual request may not follow.

### Sources

- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-11.0)
- [Set-Cookie reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)

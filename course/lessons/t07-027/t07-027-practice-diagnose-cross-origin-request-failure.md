# End-to-end browser navigation and web request lifecycle — Problem: Diagnose a cross-origin API request failure

## Goals

Differentiate preflight failure, CORS response exposure, authentication, and authorization. Propose the smallest safe configuration change supported by evidence.

## Worked example

A browser sends OPTIONS and receives 401. The POST is absent from API logs. This is evidence that the preflight did not pass and the actual POST likely was not sent. Investigate middleware/proxy ordering and the intended CORS policy before changing token validation.

## Exercises

1. What evidence distinguishes a preflight failure from a response that script cannot read?
2. Which values should the server allow for origin, method, and requested headers?
3. How does the answer change when the request uses cookies?
4. Why is a wildcard origin unsafe or invalid for credentialed sharing?
5. What server checks still apply after CORS succeeds?

## Progressive hints

1. Inspect OPTIONS and the actual method as separate requests.
2. A preflight asks permission for a planned method and headers.
3. Credentialed requests require explicit origin and credential support, plus eligible cookie policy.
4. CORS does not authenticate the request or grant resource access.
5. Authentication and authorization still run on the actual endpoint request.

## Complete solutions

Inspect the browser Network panel and proxy/API logs. If OPTIONS receives 401 and no actual method appears, configure the intended CORS policy so preflight can be answered before endpoint authorization that expects the actual request’s credentials. Allow only the application origin, required method, and required headers. For cookie credentials, use an explicit origin and credential allowance, and review SameSite and CSRF protections. Then confirm the POST arrives and separately validate token/cookie authentication and endpoint authorization. Do not solve the issue by allowing every origin or by disabling authorization. If the actual request did reach the server but script cannot read its response, correct the response-sharing headers while retaining server authorization.

## Tests and edge cases

- OPTIONS allowed, actual POST unauthorized: should return a proper authorization error visible to the client.
- Preflight denied: actual POST should not be sent by the browser.
- Credentialed request with wildcard origin: verify browser rejects credentialed sharing.
- Non-browser client: confirm server authorization still protects data without CORS enforcement.
- Actual request returns a 500 without CORS headers: add appropriate policy headers to error responses where intended, but do not misdiagnose it as the original endpoint returning a CORS-specific status.

## Reflection questions

1. What does the CORS policy allow, and what does the authorization policy allow?
2. Why might the server receive a request even when the browser reports CORS failure?
3. Which least-privilege CORS values does this application actually require?

### Sources

- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [ASP.NET Core CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-11.0)

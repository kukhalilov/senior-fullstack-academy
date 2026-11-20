<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# CORS browser origins preflight and credential policy — Reference: Origins, response headers, preflight, credentials, and failure behavior

## Scope and version
This reference follows the [WHATWG Fetch Living Standard](https://fetch.spec.whatwg.org/), last updated 14 November 2026, and the [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). Private Network Access remains a [Draft Community Group Report](https://wicg.github.io/private-network-access/), not a W3C Standard; behavior is evolving.

## How this group fits the mental model
The browser decides whether a script may share/read a cross-origin response based on server policy. A preflight checks some requests before the actual request; response-sharing checks still happen after the actual response. Credentials, cache variation, redirects, and evolving private-network rules add constraints.

## Supplied names explained
- `Same-origin policy` — Browser isolation that restricts scripts from reading many resources from a different origin. It does not prevent every cross-origin request from being sent.
- `Origin tuple (scheme, host, port)` — The three components that define an origin. Scheme, hostname, or port differences yield distinct origins; path is not part of the tuple.
- `Origin request header` — Browser-supplied header identifying the request's origin context. Treat it as a browser protocol signal, not authentication; non-browser clients can forge it.
- `Access-Control-Allow-Origin` — Response header naming an origin allowed to access the response, or a wildcard in eligible non-credentialed cases. Compare exact normalized origins and avoid unsafe reflections.
- `Access-Control-Allow-Credentials` — Response header permitting credentialed browser response sharing when set to the required value. It does not itself make the browser send cookies; client mode and cookie rules matter.
- `Access-Control-Allow-Methods` — Preflight response header listing methods permitted for the actual cross-origin request. It is not an authorization rule for direct clients.
- `Access-Control-Allow-Headers` — Preflight response header allowing requested non-safelisted request headers. Allow only headers the browser app needs.
- `Access-Control-Expose-Headers` — Response header listing non-safelisted response headers browser scripts may read. It does not expose `Set-Cookie` to script.
- `Access-Control-Max-Age` — Response header controlling how long a successful preflight result may be cached, subject to browser limits. Policy changes may not affect an existing cached preflight immediately.
- `Access-Control-Request-Method` — Preflight request header naming the method the browser intends to use for the actual request.
- `Access-Control-Request-Headers` — Preflight request header listing non-safelisted header names intended for the actual request.
- `Preflight request` — Browser OPTIONS permission check sent before certain non-simple CORS requests. It states intended method/headers; it is not the business operation itself.
- `Preflight request excludes credentials` — Fetch preflight requests use same-origin credentials mode and do not carry cookies or HTTP authentication, even when the subsequent actual request will be credentialed. The preflight response still has to pass the relevant CORS check for the actual request's credential mode. A server must not require a user cookie to answer the preflight; authenticate and authorize the actual request independently. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `OPTIONS preflight response` — Server response to the preflight. It must satisfy the requested origin/method/header/credential checks for the browser to continue with the actual request.
- `CORS simple request` — Informal term for a request meeting CORS safelist conditions that can be sent without a preflight. It can still be sent even if the response later fails CORS sharing.
- `CORS safelisted method` — Method allowed without preflight under Fetch's CORS safelist rules. Do not infer that such a method is safe or authorized for the application.
- `CORS safelisted methods (GET, HEAD, POST)` — These are the exact methods in the Fetch CORS method safelist. Other methods, such as `PUT`, require preflight. Safelisted does not mean safe or authorized for the endpoint. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `CORS safelisted request header` — Request header permitted by CORS safelist constraints without preflight. The set and value restrictions follow the current Fetch algorithm.
- `CORS safelisted request header names and value constraints` — The names are `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, and `Range`, but each has value/format constraints: values are limited to 128 bytes; `Accept` and `Content-Type` disallow particular unsafe bytes; language headers use a restricted character set; `Content-Type` must parse to an allowed essence; and `Range` is limited to a single byte range. A name alone does not guarantee safelisting. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `Safelisted Content-Type media types` — A safelisted `Content-Type` must have essence `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain` (with the standard's value constraints). JSON content type such as `application/json` triggers preflight. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `CORS safelisted response header` — Response header browser scripts can read without listing it in `Access-Control-Expose-Headers`. Other response headers remain hidden from script.
- `CORS safelisted response-header names` — By default script can read `Cache-Control`, `Content-Language`, `Content-Length`, `Content-Type`, `Expires`, `Last-Modified`, and `Pragma`, plus other permitted names explicitly exposed by policy. `Set-Cookie` is a forbidden response-header name and is not exposed to script even with `Access-Control-Expose-Headers`. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `Credentialed CORS request` — Cross-origin browser request configured to include credentials under the API's credential mode and applicable cookie policy. Server must explicitly allow the requesting origin and credentials.
- `Wildcard origin and credentials incompatibility` — A wildcard allowed origin cannot authorize credentialed response sharing. The server must return a concrete allowed origin rather than `*` for credentialed access.
- `Credential mode and wildcard semantics for allow headers/methods/exposed headers` — Fetch treats `*` as a wildcard for `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`, and `Access-Control-Expose-Headers` only when credentials mode is not `include`; with included credentials, list the names explicitly. `Access-Control-Allow-Credentials` must be exactly lowercase `true`. This is separate from browser cookie policy such as SameSite and third-party-cookie restrictions. [WHATWG Fetch](https://fetch.spec.whatwg.org/).
- `Vary: Origin` — HTTP cache directive indicating the response varies by Origin. Use it when CORS response headers differ by request origin to prevent cache confusion across origins.
- `CORS network error` — Browser-visible failure state used when CORS checks fail; script generally receives a network-style error without detailed cross-origin response contents. The server may have processed a simple request.
- `CORS response-sharing check` — Browser algorithm checking response headers against request origin, credentials, and relevant policy before exposing the response to script. It is not server authentication/authorization.
- `CORS redirect behavior` — Fetch/CORS rules governing redirects during cross-origin flows. Browser behavior and restrictions have evolved; use canonical endpoints and test supported browsers rather than relying on a redirect chain to repair CORS.
- `Private Network Access preflight` — Proposed additional preflight behavior for requests from less-private to more-private address spaces. The current referenced PNA document is a Draft Community Group Report, not a W3C Standard; browser implementation/status can vary.
- `Origin allowlist normalization` — Parsing and canonicalizing origins before exact comparison, including scheme, hostname, and port. Do not compare arbitrary strings or accept malformed origins.
- `Subdomain suffix allowlist flaw` — A raw `EndsWith("example.com")` test accepts `evil-example.com` because that string ends in `example.com`; a naive `EndsWith(".example.com")` can still miss the apex or mishandle normalization. Parse the origin and compare the exact host or a dot-boundary subdomain beneath a domain you control; also account for attacker-controlled subdomains and takeovers.
- `CORS is not authentication` — CORS response permission does not establish user/service identity. Authenticate requests and authorize every operation on the server.
- `CORS is not server-to-server access control` — Non-browser clients do not enforce CORS. Protect server endpoints with authentication, authorization, network policy, and rate limits as needed.
- `CORS preflight cache` — Browser cache of successful preflight permission, scoped under Fetch rules and browser caps. It reduces OPTIONS traffic but can delay policy-change visibility.
- `Access-Control-Allow-Private-Network draft boundary` — A response header name discussed in the evolving PNA proposal. Do not treat it as a finalized cross-browser contract; the PNA document is a draft community report ([PNA status](https://wicg.github.io/private-network-access/)).

## Cross-item comparison
Same-origin policy is the browser's default isolation; CORS is an explicit server opt-in for response sharing. A simple request may reach the server before response sharing is denied; a preflighted request waits for permission before sending the actual request. Wildcard origins are convenient for public non-credentialed resources; explicit origin allowlists are necessary for credentialed response sharing. CORS does not replace authentication/authorization. See [Fetch](https://fetch.spec.whatwg.org/) and [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS).

## Examples
For a browser app at `https://portal.example:443`, parse and serialize the URL origin before comparing it with configured values (a default HTTPS port normalizes away). If allowed, return the exact serialized origin and `Vary: Origin` when response policy depends on it. For credentialed requests, also allow credentials explicitly; never emit wildcard origin. If requested method/header is not permitted in preflight, the browser does not send the actual request, but the server must still authorize direct calls.

## Common mistakes
- Reflecting any Origin value into `Access-Control-Allow-Origin`.
- Using `*` with credentials.
- Requiring cookies or an authenticated user on the preflight OPTIONS request; browsers do not send preflight credentials.
- Assuming any value under a safelisted header name is safelisted, or that `Access-Control-Allow-Headers: *` is a wildcard for credentialed requests.
- Assuming CORS hides the endpoint from curl/server clients.
- Assuming a simple request is never sent when CORS fails.
- Omitting `Vary: Origin` when response headers change by origin.
- Treating PNA draft response headers as universally stable.

## Knowledge checks with answers
1. Is path part of origin? **No.** 2. Does preflight authorize the user? **No; it only allows browser protocol progression and carries no credentials.** 3. Is PNA a W3C Standard? **No, the referenced document is a draft community report.** 4. Which methods are safelisted? **GET, HEAD, and POST.** 5. Is `application/json` a safelisted content type? **No; it normally causes preflight.**

# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Exercises and worked solutions

## Goals

Practice separating browser response access, CSRF intent, API authorization, load shedding, and TLS/header behavior. Each scenario asks you to identify which control addresses the stated threat and which control must still be applied.

## Worked example

### Scenario

A browser SPA at `https://portal.example.com` calls `https://api.example.com` with a cookie. It sends JSON `POST /orders` and a custom antiforgery header. The service runs behind two TLS-terminating proxies and three app replicas.

### Design the sequence

1. Register a CORS policy for the exact portal origin, required methods/headers, and credentials only if needed. The SPA opts into credentials. Do not use wildcard origin with credentials.
2. Run routing, CORS, authentication, authorization, rate limiting (after authentication if partitioned by user), antiforgery validation, then endpoint execution in the framework-appropriate order.
3. Issue the request token only to the portal through a same-origin trusted response; require it for cookie-authenticated writes. CORS permission does not substitute for that token.
4. Configure a per-user or per-tenant quota for the order operation and a concurrency cap for expensive downstream work. A built-in per-process limiter applies separately on each replica; use edge or distributed coordination if a fleet-wide quota is required.
5. Trust forwarded headers only from the known proxy chain. Determine whether the edge or app owns HTTPS redirect and HSTS so the app sees the correct external scheme and does not loop.
6. Share compatible Data Protection keys/configuration across replicas so antiforgery tokens can be validated regardless of which node serves the follow-up request.
7. Keep authorization, order validation, and domain rules in place after all these transport controls.

The key lesson is that each control sees a different boundary: browser origin, browser intent, user permission, process capacity, or transport. [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0) [Rate limiting](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit) [HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

## Exercises

### Exercise 1: CORS or CSRF?

A user is signed in to a site using cookies. An attacker page submits a simple cross-origin form that changes the user's email address. The attacker cannot read the response because of same-origin policy. Which control is missing and why doesn't CORS solve it?

### Exercise 2: credentialed CORS policy review

A code review finds this conceptual configuration: “allow any origin, allow credentials, and reflect the incoming Origin header if the browser sends a cookie.” Identify the policy flaw and give a safer rule.

### Exercise 3: choose a limiter

For each workload, choose fixed window, sliding window, token bucket, concurrency limiter, or a combination, and explain the tradeoff:

1. A cheap public endpoint needs a coarse per-minute count.
2. A login endpoint should allow a small controlled burst but constrain repeated attempts over time.
3. A report endpoint runs a slow database query and the database must have at most five such queries in flight.
4. A fair API quota should be separate for each authenticated tenant.

### Exercise 4: diagnose a TLS redirect loop

The browser uses HTTPS to reach a load balancer. The load balancer forwards HTTP to Kestrel. The app calls `UseHttpsRedirection`, but forwarded headers are not processed. Explain the loop and list the trust/configuration fixes.

### Exercise 5: API preflight fails after adding HTTPS redirect

An HTTP CORS preflight receives a redirect to HTTPS and the browser reports a CORS error. Why is this fragile, and what deployment design should be preferred?

### Exercise 6: service registration versus middleware

A Minimal API project calls `AddAntiforgery`, configures a form endpoint, and assumes all requests are validated. What additional pipeline/endpoint pieces are needed? How does the answer differ for MVC/Razor Pages?

### Exercise 7: CSP rollout

A team wants to deploy `default-src 'self'` immediately to a web app that uses a third-party payment script, inline bootstrap code, a CDN font, and a worker. Outline a safer rollout and mention what report data must be treated carefully.

## Progressive hints

1. Check whether a classic paired token is required for the chosen compatibility/threat model, and remember ASP.NET Core 11 also checks browser request metadata for form-processing endpoints.
2. Credentialed CORS needs a specific origin. Do not convert any arbitrary Origin header into an allowed value.
3. Fixed/sliding/token algorithms constrain time-based volume; concurrency caps in-flight operations. Tenant partitioning requires a trustworthy, stable tenant key.
4. The backend thinks the request is HTTP because it does not trust/process the proxy's scheme information. Do not trust forwarded headers from every client.
5. Browsers do not reliably follow preflight redirects. Serve HTTPS directly/redirect at the edge before the browser performs cross-origin calls.
6. Separate ASP.NET Core 11's default request-metadata CSRF protection from token antiforgery. `AddAntiforgery` registers token services; `UseAntiforgery` runs token validation, and its validation result must be enforced before mutation.
7. Observe first with report-only, then tune/test the policy. CSP reports can contain sensitive URLs and attacker-controlled fields.

## Complete solutions

### Solution 1: add antiforgery validation

The missing control is CSRF protection on the state-changing cookie-authenticated operation. The browser may send the cookie with a simple form request; CORS primarily controls whether the attacker's JavaScript can read a response. ASP.NET Core 11's automatic request-metadata middleware normally rejects an untrusted cross-site form submission when the form consumer enforces its verdict. Token-based validation is a separate defense and may also be required for legacy-browser support, supplemental token data, or a compliance requirement. Authentication and authorization still run independently. [ASP.NET Core 11 guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

### Solution 2: use an explicit trusted origin list

Allowing every origin with credentials is unsafe and the combination is rejected/invalid in the built-in CORS policy. Reflecting an arbitrary `Origin` merely recreates that unsafe wildcard behavior with a concrete-looking header. Configure an explicit list of exact trusted origins; allow credentials only for those origins and only when required. Keep allowed methods/headers narrow and retain antiforgery validation for cookie-authenticated mutations. [CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors)

### Solution 3: choose based on cost and fairness

1. **Fixed window** is reasonable for a coarse low-cost per-minute count, with the caveat that boundary bursts can occur.
2. **Token bucket plus account/IP abuse controls** allows a limited burst while bounding sustained attempts. Partition keys and lockout behavior must resist account-enumeration/denial-of-service abuse; rate limiting is not the only login defense.
3. **Concurrency limiter** caps the five in-flight report operations. Add a time-based quota separately if repeated request volume also needs a bound.
4. **Partitioned named policy by authenticated tenant** gives separate quota state for each tenant. Run after routing and authentication, validate the tenant identity from trusted server-side claims/lookup, and ensure attacker-created partition keys cannot exhaust state.

The built-in process-local limiter will be multiplied across replicas; for a global tenant quota, use an upstream/distributed coordination design.

### Solution 4: correct proxy scheme handling

The proxy terminates TLS and forwards HTTP, so the app sees `Request.Scheme == "http"` and redirects even though the external browser connection is already HTTPS. The browser repeats the same path and the proxy again forwards HTTP, producing a loop.

Configure forwarded headers middleware before redirection/security middleware and trust only the known proxy addresses/networks. Verify the proxy sets the external scheme and host correctly. Alternatively, let the proxy own HTTPS redirection and HSTS and disable duplicate app behavior. Ensure the proxy-to-app hop is protected as required by the network threat model. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

### Solution 5: redirect at the edge or serve HTTPS directly

Preflight `OPTIONS` requests can fail when the browser encounters a redirect; browser handling is not reliable for preflight redirects. Prefer making the API's public HTTPS endpoint directly available and redirecting/rejecting plain HTTP at the edge before the browser begins cross-origin interaction. CORS must answer the HTTPS preflight with the exact origin/method/header permissions.

### Solution 6: add the required validation integration

For ASP.NET Core 11 Minimal APIs that bind form data, the framework adds automatic CSRF metadata protection and the form consumer enforces an untrusted-origin verdict. If using classic token validation as well, register token services and add `UseAntiforgery`; issue/send the paired token and ensure the form consumer or explicit endpoint code enforces an invalid token before state changes. The middleware only records its token validation result. Plain JSON endpoints do not automatically bind forms and do not gain the same metadata by default.

MVC/Razor Pages commonly use `ValidateAntiForgeryToken` or `AutoValidateAntiforgeryToken` filters; they do not require the antiforgery middleware for that filter behavior. Both styles still need request token generation/transport and separate authorization. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

### Solution 7: test and enforce CSP in stages

Start with a report-only policy and a secured reporting receiver. Inventory actual scripts, inline bootstrapping, CDN fonts, worker sources, images, connections, and payment integration requirements. Use nonces/hashes where appropriate rather than broad inline allowances. Test all app routes and browser flows, refine the policy, review reports, and then enforce it gradually.

Reports can include URLs, query values, document locations, and attacker-controlled strings. Treat them as untrusted, limit retention/access, and redact sensitive values. CSP is defense in depth; output encoding and safe DOM/HTML handling remain necessary. [CSP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

## Tests and edge cases

- A simple cross-origin request can reach the server while its response is hidden from the calling script.
- Credentialed CORS succeeds only for the exact configured origin; wildcard-plus-credentials configuration is rejected/unsafe.
- Preflight allows only configured methods and headers; actual endpoint authorization remains effective.
- ASP.NET Core 11 cross-origin form submission from an untrusted browser origin is rejected by the form consumer; a trusted credentialed CORS origin is accepted by the automatic CSRF verdict.
- Token-based cookie-backed POST without a request token is rejected by a filter/form consumer or explicit validation path, while the same-origin form/header token succeeds.
- Bearer-token API endpoints do not accidentally rely on browser CORS as their access control.
- Minimal API antiforgery endpoint fails when middleware or required endpoint metadata is absent/misconfigured.
- A user/tenant limiter does not collapse all authenticated callers into one anonymous partition.
- An untrusted forwarded IP/origin cannot create unbounded partitions or spoof proxy context.
- Fixed-window boundary burst and token-bucket burst capacity match the intended quota.
- A concurrency limiter returns permits after completion and does not cap total requests per period.
- Multi-replica traffic demonstrates the difference between per-process and fleet-wide quota.
- Proxy-forwarded HTTPS does not redirect in a loop; HSTS is emitted only through the intended TLS termination layer.
- CSP report-only violations are reviewed before enforcement and reporting data is treated as untrusted.

## Reflection questions

1. Which controls depend on a browser and which are enforced by the server for every client?
2. Which endpoints use ambient cookies for state changes, and where is their antiforgery token validated?
3. Which origin, method, header, and credential combinations does each browser client actually need?
4. Which expensive operations need time-based quotas, concurrency caps, or both?
5. Are rate-limit partition keys stable, trusted, bounded in cardinality, and available at the middleware's execution point?
6. Which layer owns TLS termination, redirect, HSTS, and forwarded-header trust?
7. How will CSP violations be observed and safely handled before enforcing a restrictive policy?

## Sources

- [CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
- [Antiforgery in ASP.NET Core 11](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [Rate limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [Enforce HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to explain what CORS does in the browser, why cookie-authenticated writes need antiforgery protection, select a rate-limiting algorithm based on the resource being protected, and reason about HTTPS/HSTS behavior behind a reverse proxy.

## Prerequisites

You should know HTTP origins, cookies, browser requests, middleware order, authentication, and basic reverse-proxy/TLS terminology. This lesson assumes the app already has server-side authentication and authorization rules.

## Core concepts

### CORS controls browser response access

An origin is the scheme, host, and port tuple. Same-origin restrictions are enforced by browsers. CORS is a server response protocol that tells a browser whether JavaScript from a specified origin may access a cross-origin response. A simple cross-origin request may be sent even if the browser later blocks the calling script from reading the response. A preflight request asks permission before the browser sends certain actual requests.

Therefore CORS is not authentication, authorization, or a firewall. A command-line client, native app, or server-to-server caller does not rely on browser CORS enforcement. A CORS allowlist should identify exact trusted origins and needed methods/headers. Credentialed requests cannot safely use `Access-Control-Allow-Origin: *`; use explicit origins and allow credentials only when required. Avoid reflecting arbitrary `Origin` values. [CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors)

### Antiforgery proves intent for ambient credentials

Browsers automatically attach cookies for matching sites. A hostile site can cause a victim's browser to submit a request with those cookies even when it cannot read the response. Antiforgery uses a request token paired with an antiforgery cookie (a synchronizer/double-submit style defense in ASP.NET Core's protected implementation). The server checks that the request carries a valid token associated with the browser/session before performing an unsafe state change.

Antiforgery does not prove that the user is authorized to update an object; it only mitigates cross-site request forgery. Keep authorization and domain checks. `SameSite` cookie restrictions help but are not a universal replacement for token validation, particularly with cross-site login, browser behavior, and multi-origin architectures.

ASP.NET Core's antiforgery services can be registered by `AddAntiforgery` or higher-level framework registrations, but **service registration is not middleware insertion**. MVC and Razor Pages commonly validate through filters. Blazor and Minimal APIs require `UseAntiforgery` in the pipeline when endpoint metadata requires validation. In recent ASP.NET Core, the middleware belongs after authentication/authorization and before endpoints according to the documented pipeline. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

### Rate limiting matches an algorithm to a resource

Time-window algorithms constrain request counts over time. Fixed window resets the full permit count at a boundary and is simple, but can allow a burst straddling adjacent windows. Sliding window divides time into segments and recycles capacity more smoothly. Token bucket replenishes tokens at a fixed rate and permits controlled bursts up to bucket capacity. Concurrency limiting caps simultaneous in-flight work; it does not cap how many requests arrive over a minute.

Partitioning gives each key its own limiter state, such as a user ID, API key, tenant, or client IP. The key must be trustworthy and have bounded cardinality; attacker-controlled unique keys can exhaust memory. IP partitioning behind proxies depends on correctly trusted forwarded headers. Queue length and processing order are part of the policy: a large queue can merely move overload into latency and memory. The built-in limiter is generally process-local; multiple replicas each have their own limits unless a distributed coordination strategy is used. [Rate-limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)

### HTTPS and HSTS have different timing

HTTPS redirection receives an HTTP request and responds with a redirect to HTTPS. HSTS is a response header delivered over HTTPS that teaches supporting browsers to make future requests to the host using HTTPS. HSTS does not protect the initial HTTP visit before the browser learns the policy and does not force non-browser clients to use TLS. APIs should be configured to serve only HTTPS where possible; redirects can cause CORS preflight failures because preflight redirects are not consistently followed.

When TLS terminates at a reverse proxy, the backend may see HTTP even though the client connection was HTTPS. Trusted forwarded headers must update the request scheme before redirection, cookie security, HSTS, and redirect URI logic. Trust forwarded headers only from known proxies/networks; accepting arbitrary `X-Forwarded-Proto` or host headers lets clients spoof the external request context and can cause redirect loops. The proxy may already perform redirect/HSTS, so configure the edge and app as one system. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

### Security headers are browser policy inputs

Headers such as `X-Content-Type-Options`, frame restrictions, and Content Security Policy influence browser interpretation. `X-Content-Type-Options: nosniff` prevents certain MIME sniffing behavior. Framing restrictions can reduce clickjacking. CSP can restrict script, style, image, connection, and other resource sources, but its correct directives depend on the app's assets, nonces/hashes, inline behavior, and third-party integrations. ASP.NET Core does not have a universal CSP value that is safe for every app.

Headers complement server-side output encoding, safe HTML handling, authorization, and TLS. A strict CSP that is not tested can break legitimate app behavior; a permissive CSP copied from a blog may offer little protection. Deploy with reporting/monitoring and staged enforcement where appropriate. [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

## Mechanisms and relationships

| Threat | Main defense | Additional controls |
|---|---|---|
| Hostile site tries to read cross-origin response | CORS policy enforced by browser | Authentication, authorization, no arbitrary origin reflection |
| Hostile site triggers cookie-authenticated write | Antiforgery validation | SameSite, origin checks, authorization, safe state changes |
| Request flood consumes CPU/DB/remote service | Rate limits and concurrency caps | Per-user/tenant quotas, load shedding, upstream edge controls |
| Network observer reads/modifies HTTP traffic | HTTPS/TLS | HSTS, secure cookies, trusted proxy configuration |
| Browser misinterprets resource or frames sensitive page | Security headers | Output encoding, CSP testing, clickjacking-conscious UI |

## Worked examples

### Example 1: browser CORS with cookies

A browser app at one origin calls an API at another origin and needs cookies. The browser must opt into credentials, and the API must return a specific allowed origin plus credentials permission. The API must not combine wildcard origin with credentials. Cookie-authenticated write operations still need antiforgery validation; CORS does not establish user intent.

### Example 2: rate limit a costly endpoint

A report endpoint performs expensive database aggregation. A concurrency limiter can cap simultaneous reports and protect the database from many long-running requests. A per-user time-based quota can separately limit repeated report generation. Use both only if their combined lease behavior and rejection ordering are understood; a concurrency cap alone does not impose a daily quota.

### Example 3: TLS termination at a proxy

The edge proxy accepts HTTPS and forwards HTTP to the app. If the app does not process trusted forwarded scheme headers first, it may think the client used HTTP and redirect again, producing a loop. Configure the proxy source as trusted, process forwarded headers early, and decide whether the proxy or app owns redirection and HSTS. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

## Misconceptions and edge cases

- **“CORS blocks a request.”** Often the browser sends the request and blocks JavaScript from reading the response; preflight can prevent some actual requests, but CORS is not a general request firewall.
- **“CORS protects the API from curl.”** Non-browser clients are not constrained by browser CORS rules.
- **“CORS prevents CSRF.”** CORS response-sharing rules and antiforgery intent tokens address different problems.
- **“The wildcard origin is fine with cookies.”** Credentialed CORS must name an allowed origin; wildcard credentials is invalid/unsafe.
- **“AddAntiforgery adds middleware.”** It registers services only. Minimal APIs/Blazor need explicit middleware when required; MVC/Razor Pages use filters.
- **“A concurrency limiter is a requests-per-minute limit.”** It caps concurrent operations only.
- **“Partitioning by request IP is automatically trustworthy.”** Proxy trust and forwarded-header configuration determine the observed client IP.
- **“An in-process rate limit protects a multi-replica fleet globally.”** Each process commonly maintains separate counters.
- **“HSTS redirects HTTP.”** The server's redirect middleware does that; HSTS informs a browser after it receives the header over HTTPS.
- **“The app must always redirect behind a proxy.”** The proxy may own redirect/HSTS; duplicate misconfiguration can loop.
- **“CSP can be copied universally.”** The policy must match the application's resource graph and be tested.

## Knowledge checks with answers

1. **Can a non-browser caller bypass CORS?** CORS is browser-enforced; server-to-server/native clients do not rely on it. Authentication and authorization must still protect the API.
2. **Why can a same-site cookie request need antiforgery?** The browser may attach the cookie automatically to a request induced by a hostile page.
3. **Which limiter caps active in-flight operations?** Concurrency limiting; it does not cap requests per time period.
4. **How is HSTS different from HTTPS redirection?** HSTS is a browser instruction learned over HTTPS; redirection is a server response to an HTTP request.
5. **Why must forwarded headers be restricted to known proxies?** Otherwise callers can spoof the scheme/host context that security middleware and redirect generation trust.
6. **Does a successful CORS preflight authenticate the caller?** No. It is a browser cross-origin policy check; normal authentication and authorization still apply.

## Sources

- [CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
- [Antiforgery in ASP.NET Core 11](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [Rate limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [Enforce HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Content-Security-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

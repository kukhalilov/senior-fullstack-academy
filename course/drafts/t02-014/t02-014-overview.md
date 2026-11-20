# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Big-picture orientation and mental model

## Problem and purpose

Web security controls solve different threats. Cross-Origin Resource Sharing (CORS) controls whether a browser lets one origin read a cross-origin response. Antiforgery protects cookie-authenticated state changes through token validation and, in ASP.NET Core 11, automatic browser request-metadata checks for form-processing endpoints. Rate limiting caps request consumption. HTTPS protects data in transit; HSTS tells a browser to keep using HTTPS. Security headers ask browsers to apply additional restrictions. Treating any one of these as “the security middleware” leaves gaps.

This topic covers the trust boundaries and pipeline behavior for each control so you can compose them without confusing their purposes. [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0) [Rate limiting](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)

## Plain-language mental model

Think of a web application as a venue with several controls. CORS is a **browser's response-reading rule**: it decides whether JavaScript running on another origin may see the response. It does not stop that request from being sent and does not identify the caller. Antiforgery uses a **paired request token** in classic flows and, in ASP.NET Core 11, an **automatic browser-context check** for form-processing endpoints; neither grants user permissions. Rate limiting is a **capacity gate** that controls how many or how many simultaneous operations can proceed. HTTPS is the **protected delivery channel**; HSTS is the browser's **remembered preference for that channel**. Security headers are **browser instructions** that restrict selected behaviors.

The controls should be layered: the server authenticates and authorizes the caller; antiforgery protects ambient-cookie mutations; CORS limits browser cross-origin access; rate limiting slows abuse and protects capacity; TLS protects transport; and headers constrain browser interpretation. None replaces server-side authorization or input validation. [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

## How the parts fit together

| Control | Protects against | Does not do |
|---|---|---|
| CORS | Browser JavaScript reading responses from an origin not allowed by the server | Authentication, authorization, or a general firewall against scripts/clients |
| CSRF defenses (token pair and ASP.NET Core 11 request-metadata checks) | A hostile site causing a victim browser to submit cookie-authenticated state changes | Authorization of the user or protection of bearer-token APIs that do not use ambient credentials |
| Rate limiter | Excess request volume or concurrent work within its configured scope | Distributed/global fairness unless designed across instances; correctness or authorization |
| HTTPS redirection | Continued use of HTTP by redirecting to HTTPS | HSTS memory or encryption on a proxy-to-app hop |
| HSTS | Future browser requests to a host over HTTP after the policy is learned | Redirecting the initial HTTP request or protecting non-browser callers |
| Security headers | Selected browser behaviors such as MIME sniffing, framing, or resource loading | A substitute for safe server logic, CSP design, or output encoding |

Pipeline order matters. CORS middleware must run where it can handle preflight and decorate responses, generally after routing and before authorization; static-file and response-caching placement can change whether CORS headers are present. Antiforgery service registration is not always middleware registration: MVC/Razor Pages use filters, while Minimal APIs and Blazor require explicit `UseAntiforgery` where their endpoint metadata needs it. Forwarded scheme headers must be trusted from known proxies before HTTPS redirection/HSTS decisions. [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0) [HTTPS](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

## Concept map

```text
browser request ── origin + method + headers ──► CORS policy ── browser may read response?
       │
       ├─ ambient cookie + state change ──────► antiforgery validation ── expected app intent?
       │
       ├─ request volume/concurrency ─────────► rate limiter ── capacity permit available?
       │
       ├─ HTTP / proxy scheme ─────────────────► HTTPS redirect + HSTS ── secure transport?
       │
       └─ response metadata ───────────────────► browser security headers ── safe browser behavior?

Every accepted operation still passes server authentication, authorization, validation, and business rules.
```

## End-to-end walkthrough

Suppose a browser app at `https://portal.example` sends a state-changing request to `https://api.example` using a cookie.

1. The browser may send a preflight `OPTIONS` request if the method/headers require it. CORS evaluates the exact origin and requested method/headers and returns the required policy headers.
2. The browser sends the actual request with credentials only if the client and server both opt into credentialed CORS and the server uses a specific allowed origin. Wildcard origin plus credentials is invalid/unsafe.
3. ASP.NET Core 11's default request-metadata CSRF protection records whether the browser submission comes from an allowed context, and the form-processing endpoint enforces a denied verdict. If the app also uses token-based antiforgery, it validates the request token paired with its cookie before the state change.
4. A rate limiter admits or rejects the request according to the configured algorithm and partition. If rejected, the app returns the configured rejection response (commonly 429).
5. Authentication, authorization, model validation, and domain rules still determine whether the operation is allowed.
6. HTTPS protects the browser-to-edge connection. If TLS terminates at a reverse proxy, trusted forwarded scheme information must be applied before app middleware decides whether the request is secure. The browser may later enforce HSTS for the host.

CORS is not the antiforgery proof: allowing a browser to read an API response and preventing a hostile page from submitting a cookie-authenticated action are separate decisions. [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

## When to use it and tradeoffs

- Use a narrowly scoped CORS policy for known browser origins, methods, and headers. Credentialed browser calls require explicit origins and increase the impact of origin mistakes.
- Use antiforgery validation for cookie-authenticated unsafe operations. For APIs using explicit bearer tokens rather than ambient cookies, CSRF exposure is different, but XSS/token theft and authorization risks remain.
- Choose rate-limiter algorithm by workload: fixed windows are simple but boundary bursts occur; sliding windows smooth boundaries; token buckets permit controlled bursts; concurrency limits cap simultaneous work but not requests per time period.
- Partition limits by trustworthy user/API key/IP signals as appropriate. Behind proxies, IP identity is trustworthy only after forwarded headers are correctly configured. In-process limiters are per process/instance, not automatically global.
- Use HTTPS and HSTS intentionally. The edge proxy may already redirect and emit HSTS; duplicate or misconfigured app behavior can create loops or conflicting headers.
- Add security headers that match the app. Content Security Policy requires an app-specific resource policy; a copied blanket header can break functionality or create false confidence.

## What later lessons cover

The concepts lesson separates the browser origin model, CSRF token pair, limiter algorithms, proxy-aware HTTPS, and response headers. Reference lessons cover exact CORS APIs/order, antiforgery APIs and endpoint integration, limiter algorithms/partitioning/queues/rejection, and HTTPS/HSTS/headers. Practice diagnoses a mixed browser/API deployment; the interview lesson tests threat-model boundaries and pipeline placement.

## Sources

- [Enable CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
- [Prevent CSRF attacks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [Rate limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [Enforce HTTPS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Content-Security-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

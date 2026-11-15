# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Reference: HTTPS redirection, HSTS, proxy termination, and browser response security headers

## Scope and version

This reference covers HTTPS redirection, HSTS, proxy-forwarded scheme trust, and browser response headers. ASP.NET Core and the reverse proxy may both implement redirect/HSTS behavior; configure the edge and app as one system. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl) [CSP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

## How this group fits the mental model

HTTPS redirection reacts to an HTTP request by redirecting it. HSTS is learned from a secure response and tells a supporting browser to use HTTPS for later requests. Reverse proxies may terminate TLS and forward a request internally over HTTP; trusted forwarded scheme metadata must be processed before the app decides whether to redirect or emit secure-only behavior. Security headers then influence browser interpretation of the response.

## Supplied names explained

### HTTPS and HSTS middleware

| Supplied name | Meaning and use |
|---|---|
| `AddHttpsRedirection` | Registers/configures HTTPS redirection options. It does not add redirect middleware by itself. |
| `UseHttpsRedirection` | Redirects HTTP requests to an HTTPS endpoint according to configured port/status. Avoid duplicate proxy/app redirects that loop. |
| `HttpsRedirectionOptions` | Settings for redirect target port and response status. |
| `HttpsRedirectionOptions.HttpsPort` | HTTPS port used to construct the redirect target when it cannot be inferred from hosting configuration. Configure for the public-facing topology, not blindly for an internal backend port. |
| `HttpsRedirectionOptions.RedirectStatusCode` | HTTP status used for the redirect. Choose behavior consistent with the app/proxy and clients; permanent redirects may be cached. |
| `HttpsRedirectionMiddleware` | Middleware implementation that redirects requests it considers insecure. It relies on the request scheme and HTTPS-port configuration. |
| `AddHsts` | Registers/configures HSTS options. The framework template commonly enables HSTS outside development. |
| `UseHsts` | Adds the Strict-Transport-Security header to eligible HTTPS responses so supporting browsers remember HTTPS policy. It does not redirect the current HTTP request. |
| `HstsOptions` | Configuration for HSTS duration, subdomain coverage, preload declaration, and exclusions. |
| `HstsOptions.MaxAge` | Duration browsers should remember the HSTS policy. A long value makes mistakes harder to roll back quickly. |
| `HstsOptions.IncludeSubDomains` | Asks browsers to apply HSTS to subdomains. Enable only when every covered subdomain is ready for HTTPS and certificate management. |
| `HstsOptions.Preload` | Adds the preload directive indicating intent to be considered for browser preload lists. Setting it does not automatically submit or guarantee inclusion. |
| `HstsOptions.ExcludedHosts` | Hostnames excluded from the generated HSTS policy. Use narrowly; an exclusion can leave a host without the expected browser upgrade behavior. |
| `HstsMiddleware` | Middleware that emits the HSTS response header on HTTPS responses when configured. |
| `Strict-Transport-Security response header` | Header carrying HSTS `max-age` and optional subdomain/preload directives. Browsers ignore it over insecure HTTP. |
| `HTTP Strict Transport Security (HSTS)` | Browser policy that upgrades future requests to HTTPS and refuses certificate-error bypasses after a valid HTTPS response teaches it the policy. It does not protect the first visit before policy is learned. |
| `HTTPS redirect versus HSTS` | Redirect is an immediate server/proxy response to an HTTP request; HSTS is a browser's stored rule for future requests. They are complementary but not interchangeable. |
| `HTTPS_PORT configuration key` | Configuration key ASP.NET Core can use to determine the HTTPS redirect port in hosting environments. Ensure it refers to the externally reachable HTTPS port. |
| `ASPNETCORE_HTTPS_PORT environment variable` | Environment-variable form of HTTPS-port configuration used by ASP.NET Core hosting. Configure it when automatic port discovery is unavailable. |
| `Forwarded scheme behind trusted proxy` | The app may need a trusted forwarded-protocol header to know the browser used HTTPS at the proxy. Accept forwarded headers only from known proxies/networks. |
| `HTTPS termination at reverse proxy` | TLS is decrypted at the edge and the backend connection may be HTTP. The proxy-to-app hop also needs appropriate network protection when it crosses an untrusted boundary. |
| `HSTS only over HTTPS response` | Browsers ignore HSTS headers received over HTTP. The first secure response establishes the policy for later navigation. |
| `HSTS preload enrollment consequence` | Preloaded browsers may force HTTPS before the first visit, including covered subdomains if configured. Removal from preload lists is slow; meet all requirements before opting in. |

### Browser security headers

| Supplied name | Meaning and use |
|---|---|
| `Content-Security-Policy response header` | Enforced browser policy controlling allowed resource sources and selected behaviors. Design directives around the app's real assets; an overly broad policy weakens protection and a strict untested one can break the site. |
| `Content-Security-Policy-Report-Only response header` | Reports policy violations without blocking the resources. Use to observe a candidate policy before enforcement, while treating reports as untrusted input. |
| `X-Content-Type-Options nosniff` | Tells browsers not to infer a different MIME type in supported contexts. Set correct `Content-Type` values as well. |
| `X-Frame-Options DENY` | Prevents a page from being displayed in frames in browsers honoring the header. It may conflict with legitimate embedding requirements. |
| `X-Frame-Options SAMEORIGIN` | Allows framing by pages from the same origin under browser behavior. It is less expressive than CSP `frame-ancestors`. |
| `frame-ancestors CSP directive` | CSP directive controlling which ancestors may embed the page. It is the modern flexible framing control and should be aligned with application embedding needs. |
| `Referrer-Policy response header` | Controls how much referrer information the browser sends on navigations/requests. Choose a policy that limits sensitive URL leakage while preserving needed analytics/navigation. |
| `Permissions-Policy response header` | Controls access to selected browser features for the document and embedded frames. Restrict features the app does not need, with syntax supported by target browsers. |
| `Cross-Origin-Opener-Policy response header` | Isolates a browsing context group from cross-origin documents when compatible, with implications for popup/opener integrations. |
| `Cross-Origin-Resource-Policy response header` | Allows a resource to declare which origins may load it in certain contexts. It complements CORS and can affect cross-origin resource embedding. |
| `Cross-Origin-Embedder-Policy response header` | Controls whether a document may load cross-origin resources without appropriate cross-origin permission. It is commonly needed with compatible opener policy for cross-origin isolation. |
| `Cache-Control no-store for sensitive responses` | Requests that caches not store a response, useful for sensitive account pages/tokens. It is not encryption or a substitute for correct cache configuration. |
| `Security headers middleware` | Application middleware or proxy configuration that consistently emits response security headers. Avoid conflicting duplicate values from multiple layers. |
| `CSP nonce-based script policy` | Uses a fresh unpredictable per-response nonce in CSP and on explicitly authorized script tags. Never reuse a nonce across responses or derive it from user input. |
| `CSP report-to reporting configuration` | Configures CSP violation reporting through the Reporting API endpoint/group mechanism. Reports may contain sensitive URLs and attacker-controlled fields; secure and sanitize the collector. |
| `CSP report-uri deprecated directive` | Legacy CSP reporting directive retained by browsers for compatibility but superseded by Reporting API mechanisms. Do not make it the only future reporting path without checking browser support. |
| `Header value variation by environment` | Development, staging, and production can need different CSP/reporting/HTTPS policies. Keep development exceptions from leaking into production configuration. |
| `Avoid duplicate proxy and app HTTPS redirects` | If both edge and app redirect without correct forwarded scheme, the backend can redirect repeatedly. Decide which layer owns the behavior and test the deployed path. |
| `HSTS development environment exclusion` | Local development often uses changing/self-signed certificates and should not teach a long-lived browser HSTS policy accidentally. Enable production behavior deliberately. |
| `CSP compatibility testing before enforcement` | Validate the policy in report-only mode and test legitimate assets, inline scripts/styles, workers, APIs, and third-party integrations before blocking. |
| `Security header does not replace output encoding` | Headers are browser-side defense in depth. Contextual output encoding and safe content handling are still required to prevent script injection. |

## Cross-item comparison

- Redirection handles the current insecure request; HSTS affects future browser requests after learning the policy over HTTPS.
- `X-Frame-Options` offers simpler frame controls; CSP `frame-ancestors` is more expressive and can list trusted embedders.
- `Content-Security-Policy-Report-Only` observes; `Content-Security-Policy` enforces.
- The reverse proxy and application can each emit headers; duplicate values can change/negate behavior, so choose one owner or verify the combined output.

## Examples

### Configure production HSTS and HTTPS behavior

```csharp
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseHttpsRedirection();
```

The host must know the public HTTPS port and the observed request scheme. Behind a proxy, trust and process forwarded headers before these middleware components, or configure redirect/HSTS at the proxy and avoid duplicate app behavior. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

### Start CSP in report-only mode

```http
Content-Security-Policy-Report-Only: default-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
```

This is an illustrative policy, not a universal copy/paste value. Test the app's legitimate scripts, styles, images, fonts, connections, embedded content, and reporting endpoint. Move to enforcing mode only after reviewing violations and compatibility. [CSP header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

## Common mistakes

- Assuming HSTS redirects an HTTP request or protects a browser before it has learned the policy.
- Enabling `IncludeSubDomains` when one subdomain cannot serve HTTPS.
- Setting a long HSTS/preload policy before all affected hosts are ready.
- Trusting arbitrary forwarded headers and allowing a client to spoof `Request.Scheme` or host context.
- Enabling both proxy and app redirects without forwarded-scheme correctness, causing a loop.
- Assuming TLS termination means the proxy-to-app hop is automatically encrypted.
- Copying a strict CSP that blocks necessary scripts or a weak CSP that uses broad unsafe allowances.
- Treating report-only CSP reports as trusted telemetry; attackers can generate reports and URLs may be sensitive.
- Sending duplicate/conflicting security headers from app and proxy.
- Treating headers as replacements for output encoding and server-side authorization.

## Knowledge checks with answers

1. **When does a browser learn HSTS?** From a valid HSTS header received over HTTPS.
2. **What does `UseHttpsRedirection` do?** Redirects a request the app sees as HTTP to a configured HTTPS endpoint.
3. **Why configure forwarded headers only from known proxies?** Otherwise an external caller can spoof the scheme/host metadata the app uses for security decisions and redirects.
4. **What is a risk of `IncludeSubDomains`?** Every covered subdomain must support HTTPS; one unprepared subdomain can become inaccessible.
5. **What is the difference between report-only CSP and enforcing CSP?** Report-only records/communicates violations without blocking; enforcing policy blocks disallowed behavior.

## Sources

- [Enforce HTTPS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Content-Security-Policy header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

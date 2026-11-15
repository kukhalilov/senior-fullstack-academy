# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Interview questions and reasoning

## Core questions

1. What does CORS protect, and what does it not protect?
2. Why can a simple request still need antiforgery validation?
3. What is the difference between a fixed window, sliding window, token bucket, and concurrency limiter?
4. What should be considered when partitioning limits by user, tenant, or IP?
5. How do HTTPS redirection and HSTS differ?
6. Why can a reverse proxy cause HTTPS redirect loops?
7. Does `AddAntiforgery` add middleware to every hosting model?
8. How should an application roll out a Content Security Policy?

## Concise interview answers

1. CORS is a browser-enforced response-sharing protocol for cross-origin JavaScript. It is not authentication, authorization, or a firewall against non-browser clients.
2. A browser can attach cookies automatically to a cross-site form/request even when the attacker cannot read the response. A valid request token is needed to prove expected app context for unsafe cookie-backed operations.
3. Fixed window counts in rigid intervals; sliding window recycles segmented history to smooth boundaries; token bucket replenishes a bounded burst allowance; concurrency limiter caps active requests only.
4. The key must be trustworthy, stable, bounded in cardinality, and available when the limiter runs. IP keys depend on known trusted proxies; user keys require authentication before evaluation.
5. HTTPS redirection responds to the current HTTP request with an HTTPS redirect. HSTS is learned over HTTPS and tells a browser to use HTTPS for later requests.
6. The proxy terminates TLS and forwards HTTP, so the backend thinks the request is insecure and redirects again. Process trusted forwarded scheme headers before redirect middleware or let the proxy own the behavior.
7. No. It registers services. MVC/Razor Pages commonly validate with filters; Minimal APIs and Blazor need `UseAntiforgery` where endpoint metadata requires it.
8. Start with report-only, inventory legitimate resources, inspect violations, refine policy, test all flows, then enforce. Treat reports as untrusted and potentially sensitive.

## Deep follow-up answers

### Why does CORS not replace antiforgery?

CORS determines whether a browser exposes a response to a script. A simple request may still be sent; state can change even when the attacker cannot read the response. Antiforgery validates a request token paired with the browser's antiforgery cookie before performing a state change. Authentication and authorization remain separate. [CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

### Why is a per-user limiter placed after authentication?

The policy needs a trusted user identity to choose a stable partition. If the limiter executes before authentication, `HttpContext.User` may be anonymous, causing all callers to share one bucket or letting the key default incorrectly. Endpoint-specific metadata also requires routing to have selected the endpoint. A global limiter is earlier and should generally use request data that is safe and available at that point.

### Why is HSTS a deployment decision?

Browsers persist HSTS policy. Long max-age, subdomain coverage, and preload behavior can make later rollback slow and can block users from reaching an unprepared subdomain. The proxy may already emit HSTS. Decide which layer owns it, start with an appropriate duration, and include every covered hostname in rollout planning. [HTTPS enforcement](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)

### How should a team reason about “secure headers”?

Headers influence browser behavior but cannot make unsafe server logic safe. CSP must reflect the actual script/style/worker/resource graph; `nosniff` complements correct media types; frame restrictions should match embedding needs; cache controls should match sensitive response semantics. Verify the final response emitted after both app and proxy processing, and test compatibility before enforcement.

## Scenario questions

### Scenario 1: CORS works from browser but curl still accesses data

**Reasoning:** CORS is not server authorization. Require a valid authenticated principal and policy/resource authorization for the endpoint. CORS only governs browser response sharing.

### Scenario 2: browser POST changes account settings from a hostile page

**Reasoning:** If the browser attaches an application cookie, require antiforgery validation on the unsafe operation. Keep authorization and input validation. CORS may hide the response but cannot be assumed to prevent the request.

### Scenario 3: app throttles each user but attacker rotates millions of partition keys

**Reasoning:** Partition cardinality is unbounded, likely exhausting limiter state. Use trusted stable identities, cap/expire partitions or use a bounded distributed store/edge strategy, and include upstream abuse controls.

### Scenario 4: app receives HTTPS from clients but gets stuck in redirect loop

**Reasoning:** Check TLS termination and forwarded headers. Trust only the known proxy, process the external scheme before redirection, configure the correct public HTTPS port, or assign redirects to one layer.

### Scenario 5: adding antiforgery breaks JSON form submission

**Reasoning:** The client must obtain a request token through a trusted same-origin response and send it in the configured header along with the matching cookie. Ensure CORS allows that header for the explicit origin, preflight is handled by middleware, and endpoint validation runs before the handler.

## Tradeoffs and alternatives

| Control | Useful boundary | Tradeoff |
|---|---|---|
| CORS allowlist | Browser origin response access | Too broad origin/credentials configuration exposes cross-origin response data |
| Antiforgery token | Cookie-backed unsafe browser operations | Requires token issuance/transport and correct framework integration |
| Time-based limiter | Requests over intervals | Boundary/segment/bucket semantics affect burst behavior |
| Concurrency limiter | Slow or costly in-flight work | Does not cap total requests in a time window |
| App HTTPS/HSTS middleware | Direct edge hosting or app-owned policy | Proxy configuration can duplicate or loop redirects/headers |
| Proxy-owned HTTPS/HSTS | TLS termination at a controlled edge | Backend trust and internal hop security must be configured |
| CSP | Browser resource execution/loading restrictions | Incorrect policy can break features; weak policy gives false confidence |

## Common weak answers

- “CORS secures the API.” It does not authenticate the caller.
- “The attacker cannot read the response, so CSRF is impossible.” A state-changing request can still be sent.
- “A concurrency limit means 100 requests per minute.” It only caps active requests.
- “The built-in limiter is global across replicas.” Its state is generally per process.
- “HSTS redirects HTTP.” The redirect middleware/proxy does; HSTS affects future browser requests after learning the header.
- “AddAntiforgery is sufficient.” It does not insert middleware or automatically place a token in every client request.
- “Forwarded headers can be trusted from any IP.” Only configured trusted proxies/networks should supply them.
- “Use a strict CSP template everywhere.” CSP depends on the app's resources and must be tested.
- “A security header replaces output encoding.” It is defense in depth, not safe output construction.

## Self-check rubric

Score each item 0–2: **0** = unable to explain; **1** = names the mechanism but misses a boundary; **2** = explains the threat, pipeline location, and tradeoff.

- Separates CORS, CSRF, authorization, and authentication.
- Explains why credentialed CORS needs explicit origins.
- Selects a rate-limit algorithm for throughput versus concurrency and explains queue effects.
- Designs bounded, trusted partition keys and recognizes per-process scope.
- Explains HTTPS redirect versus HSTS and proxy-forwarded scheme trust.
- Describes framework-specific antiforgery registration and middleware/filter integration.
- Plans CSP report-only validation and safe reporting before enforcement.
- Checks final headers and controls across proxy and application layers.

Suggested interpretation: 14–16 is ready for focused interview discussion; 10–13 needs targeted review; below 10, revisit the concepts and reference lessons.

## Sources

- [CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
- [Antiforgery in ASP.NET Core 11](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [Rate-limiting middleware](https://learn.microsoft.com/en-us/aspnet/core/performance/rate-limit)
- [Enforce HTTPS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/enforcing-ssl)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

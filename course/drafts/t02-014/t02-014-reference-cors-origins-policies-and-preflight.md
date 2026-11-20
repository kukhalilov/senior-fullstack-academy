# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Reference: Origin model, named/default policies, builders, endpoint metadata, and middleware order

## Scope and version

This reference covers ASP.NET Core CORS configuration and browser behavior. CORS is enforced by browsers using response headers; it is not API authentication, authorization, or a network firewall. The server should allow only the origins and operations the browser clients require. [CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors) [CorsPolicyBuilder API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.cors.infrastructure.corspolicybuilder)

## How this group fits the mental model

The browser sends an `Origin` and, for preflight, the requested method/headers. ASP.NET Core selects a named/default/endpoint CORS policy and emits response headers describing allowed origins, methods, headers, and credentials. The browser decides whether calling JavaScript may access the response. A request may still reach the server; normal authentication, authorization, antiforgery, and validation remain necessary.

## Supplied names explained

### Register and build policies

| Supplied name | Meaning and use |
|---|---|
| `AddCors` | Registers CORS services and optional policy configuration with dependency injection. It does not by itself place CORS middleware in the request pipeline. |
| `CorsOptions` | Options holding named policies and a default policy. |
| `CorsOptions.AddPolicy` | Registers a named CORS policy through a builder callback or policy object. Use stable names and keep the origin list explicit. |
| `CorsOptions.AddDefaultPolicy` | Configures the default policy used when middleware is enabled without naming a policy. Avoid broad defaults that accidentally apply to unrelated endpoints. |
| `CorsOptions.DefaultPolicyName` | Name constant used by the framework for the default CORS policy. |
| `CorsPolicy` | Immutable policy describing origins, methods, headers, exposed response headers, credentials, and preflight cache duration. |
| `CorsPolicyBuilder` | Fluent builder that accumulates CORS permissions and creates a policy. |
| `CorsPolicyBuilder.WithOrigins` | Adds specific allowed origins. Origin matching includes scheme, host, and port; do not include path components. |
| `WithOrigins exact origin matching and trailing slash normalization` | A configured URL must not end in `/`; ASP.NET Core documents that the trailing slash causes the origin comparison to fail and omits CORS headers. |
| `WithOrigins` trailing slash rule | Microsoft documents that configured origin URLs must not end in `/`; a trailing slash causes exact comparison to fail and no CORS header to be emitted. |
| `CorsPolicyBuilder.AllowAnyOrigin` | Allows any requesting origin. This is broad and unsafe for credentialed browser requests; use only when public cross-origin response access is truly intended. |
| `CorsPolicyBuilder.WithMethods` | Allows selected HTTP methods for cross-origin requests. Use the smallest method set required by the client. |
| `CorsPolicyBuilder.AllowAnyMethod` | Allows any method within the browser CORS contract. Broad method access still does not authorize a server operation, but expands cross-origin reach. |
| `CorsPolicyBuilder.WithHeaders` | Allows selected request headers requested by the browser during preflight. Header matching follows the framework/browser CORS rules. |
| `CorsPolicyBuilder.AllowAnyHeader` | Allows any requested header in the CORS policy. This is convenient but broad; it is not an authentication mechanism. |
| `CorsPolicyBuilder.WithExposedHeaders` | Names response headers browser JavaScript may read beyond the CORS safelisted response headers. It does not make those headers available to non-browser code; those callers can already inspect HTTP responses. |
| `CorsPolicyBuilder.AllowCredentials` | Allows browsers to include credentials for matching cross-origin requests. Pair with exact allowed origins; credentialed CORS cannot use wildcard origin. |
| `CorsPolicyBuilder.DisallowCredentials` | Explicitly omits permission for credentialed cross-origin requests. The browser will not expose credentialed responses under this policy. |
| `CorsPolicyBuilder.SetIsOriginAllowed` | Supplies a custom origin predicate. Keep the predicate a strict allowlist; reflecting all origins while allowing credentials is unsafe. |
| `CorsPolicyBuilder.SetIsOriginAllowedToAllowWildcardSubdomains` | Enables wildcard-subdomain matching for configured origins. A trusted parent-domain allowlist extends trust to its matching subdomains, so do not use where subdomains host untrusted content. |
| `CorsPolicyBuilder.SetPreflightMaxAge` | Sets how long a browser may cache a successful preflight result. Longer caching can delay policy changes taking effect in clients. |
| `CorsPolicyBuilder.Build` | Produces the configured `CorsPolicy`. |

### Middleware and endpoint metadata

| Supplied name | Meaning and use |
|---|---|
| `UseCors` | Adds CORS middleware using the default policy or endpoint metadata. In endpoint routing apps, place it after routing and before authorization, with attention to response caching/static files. |
| `UseCors(String)` | Adds CORS middleware using a named policy. The policy applies to requests processed by the middleware. |
| `UseCors(Action<CorsPolicyBuilder>)` | Adds middleware with an inline policy configuration. Prefer named reusable policies where several endpoints share the same trusted origins. |
| `EnableCorsAttribute` | Declarative metadata that selects or configures CORS behavior for MVC endpoints. Avoid overlapping it with middleware policies unless combination behavior is understood. |
| `DisableCorsAttribute` | Metadata intended to disable CORS for selected MVC actions/controllers in supported configuration styles. Endpoint-routing middleware and attributes can interact differently; verify the exact hosting model rather than assuming it overrides every policy. |
| `ICorsMetadata` | Marker metadata type used by endpoint routing to identify CORS-related endpoint metadata. |
| `ICorsPolicyMetadata` | Endpoint metadata contract that exposes a CORS policy or policy information for middleware selection. |
| `RequireCors` | Endpoint convention that requires CORS handling for an endpoint using named or inline policy metadata. |
| `RequireCors(String)` | Adds metadata selecting a named CORS policy on the endpoint. |
| `RequireCors(Action<CorsPolicyBuilder>)` | Adds endpoint CORS configuration via a policy-builder callback. Keep the resulting origin/method/header permissions narrow. |
| `CorsMiddleware` | Middleware implementation that evaluates the request origin/method/headers and appends CORS response headers. |
| `CorsMiddlewareExtensions` | Extension methods that add CORS middleware to an application pipeline. |
| `ICorsService` | Abstraction for evaluating a request against a CORS policy and applying the corresponding result to a response. |
| `ICorsPolicyProvider` | Abstraction that resolves a default, named, or endpoint-selected policy for the request. |
| `CorsService` | Framework service implementation that evaluates policies and produces CORS response behavior. |
| `CorsPolicyProvider` | Framework provider for resolving registered CORS policies by name. |
| `CorsResult` | Evaluation result describing whether the origin is allowed and which CORS response values should be emitted. |
| `CorsResult.IsOriginAllowed` | Indicates whether the request's origin passed policy matching. It does not indicate that authentication or authorization succeeded. |
| `CorsResult.AllowedOrigin` | Origin value that should be written to `Access-Control-Allow-Origin`, often the matched request origin for explicit/credentialed policies. |
| `CorsResult.SupportsCredentials` | Indicates the policy allows credentialed browser requests and can emit the relevant credential response permission. |
| `CorsResult.AllowedMethods` | Methods the policy allows for the CORS request. |
| `CorsResult.AllowedHeaders` | Request headers allowed by the policy. |
| `CorsResult.PreflightMaxAge` | Cached duration advertised for preflight results. |
| `CorsPolicyServiceCollectionExtensions.AddCors` | Extension surface for registering CORS services and named/default policy configuration in dependency injection. |

### Browser origin and CORS wire behavior

| Supplied name | Meaning and use |
|---|---|
| `Same-origin tuple scheme host port` | Browser origin identity is the tuple of scheme, host, and effective port. A path difference does not create a different origin; a scheme or port change does. |
| `Cross-origin browser request` | Browser request from a page whose origin differs from the target origin. The browser applies same-origin/CORS response-access rules. |
| `Origin header and serialized origin value` | `Origin` identifies the initiating origin (scheme, host, port, no path) and can also be `null`. Treat it as untrusted input and compare against an allowlist. |
| `Fetch credentials mode same-origin omit include` | Fetch's `credentials` option has `omit`, `same-origin` (the default), and `include`. Cross-origin credentials require `include` plus compatible server CORS response and remain subject to cookie SameSite/privacy rules. |
| `Origin request header` | Identifies the origin initiating a CORS request; its serialized value has scheme/host/port and no path, and may be the special value `null`. Treat it as untrusted input and compare against an explicit allowlist. |
| `Fetch credentials mode` | Fetch uses `omit`, `same-origin` (default), or `include`. Cross-origin cookies/HTTP authentication require the client credentials mode and a compatible server CORS response; cookie SameSite and browser privacy rules independently affect whether cookies are sent. |
| `XMLHttpRequest.withCredentials` | Enables credentials on cross-origin XHR when true. It does not bypass server CORS permission or browser cookie policy. |
| `CORS simple request` | Legacy name for a request that meets the safelist conditions and can be sent without preflight. Typical constraints include GET/HEAD/POST, safelisted author headers, and restricted Content-Type media types; a simple request can still mutate server state even if its response is hidden. |
| `CORS-safelisted methods GET HEAD POST` | These three methods can qualify for a no-preflight request when the other safelist requirements are satisfied; this is not permission to mutate state without CSRF protection. |
| `CORS does not stop simple request side effects` | A safelisted cross-origin request may be sent and processed before the browser blocks response access. Protect unsafe cookie-authenticated actions independently. |
| `CORS-safelisted request headers and Content-Type media types` | Fetch defines the request-header safelist and value restrictions. Common header names include Accept, Accept-Language, Content-Language, Content-Type, and Range, but not every value qualifies; Content-Type's common safelisted media types are form-urlencoded, multipart/form-data, and text/plain. |
| `CORS-safelisted response headers` | JavaScript can read a limited set by default, including Cache-Control, Content-Language, Content-Length, Content-Type, Expires, Last-Modified, and Pragma under Fetch's current list; use `WithExposedHeaders` for other response headers. |
| `Fetch credentials mode no-cors` | Produces an opaque response that calling JavaScript cannot inspect; it is not a workaround for reading a blocked API response and severely restricts request behavior. |
| `Opaque response and fetch mode no-cors limitations` | `no-cors` yields an opaque, unreadable response and restricts methods/headers; it does not enable JavaScript to read a blocked resource. |
| `CORS preflight OPTIONS request` | Browser-generated permission check carrying the intended method and author headers. Per Fetch, a preflight itself is sent without credentials; its response must still allow credentials for a subsequent credentialed actual request. The actual request is sent only if the preflight succeeds. |
| `Access-Control-Allow-Origin` | Response header naming the permitted requesting origin, or `*` only for non-credentialed broad access. Never reflect arbitrary input as a trusted origin. |
| `Access-Control-Allow-Credentials` | Response header indicating credentials may be included for the allowed origin. It must be paired with an explicit allowed origin, not `*`. |
| `Access-Control-Allow-Methods` | Response header listing methods allowed for the cross-origin request/preflight. It does not grant application authorization. |
| `Access-Control-Allow-Headers` | Response header listing permitted request headers for preflight. |
| `Access-Control-Expose-Headers` | Response header listing non-safelisted response headers JavaScript may read. |
| `Access-Control-Max-Age` | Response header telling the browser how long to cache preflight permission, subject to browser limits. |
| `Credentialed CORS cannot use wildcard origin` | Browser credential rules reject `Access-Control-Allow-Origin: *` when credentials are allowed. Configure a known explicit origin list instead. |
| `Vary Origin cache correctness` | When responses vary the allowed-origin header based on request `Origin`, caches need `Vary: Origin` so one origin's response is not reused for another. |
| `CORS does not authenticate caller` | CORS controls browser response sharing. Any non-browser client can call the server directly, so use authentication and authorization for protected operations. |
| `UseCors after UseRouting and before UseAuthorization` | Endpoint routing must first select metadata; CORS must then handle preflight and response headers before authorization can short-circuit. Follow documented pipeline order for the hosting model. |
| `UseCors before UseResponseCaching` | CORS should run before response caching so cached responses retain correct CORS headers and origin variation. Configure cache variation as required. |
| `Static-file CORS middleware order` | Static files served before CORS middleware do not receive CORS headers from that middleware. Place CORS before static-file serving only when cross-origin assets need it. |
| `RequireCors preflight handling limitation` | Endpoint-level `RequireCors` metadata alone does not provide the same automatic preflight handling as the CORS middleware. Use `UseCors` in middleware for reliable preflight processing. |
| `Automatic CORS preflight handling` | ASP.NET Core handles preflight when CORS middleware is applied globally or a supported `[EnableCors]` policy applies. With endpoint routing, `RequireCors` selects metadata for middleware; it is not a replacement for `UseCors`. |
| `Automatic OPTIONS preflight when CORS middleware or supported attribute policy is applied` | ASP.NET Core CORS middleware automatically responds to applicable browser preflight requests. Endpoint metadata must be evaluated by the middleware in the configured pipeline. |
| `CORS preflight does not include credentials in the ordinary Fetch model` | Fetch sends the OPTIONS preflight without credentials. For a credentialed actual request, the preflight response still needs valid explicit-origin and credentials permission. |
| `Credentialed response requires client credentials mode and server AllowCredentials` | Both sides opt in: the client uses Fetch `credentials: "include"` or XHR `withCredentials=true`, and the server allows credentials for the explicit origin. Cookies can still be withheld by browser cookie rules. |
| `Access-Control-Allow-Origin wildcard for noncredentialed access` | `*` allows any origin only for requests without credentials mode; a credentialed response must name one allowed origin. |
| `Vary Origin and intermediary cache behavior` | If the server selects a response header based on `Origin`, shared caches must vary on `Origin` to avoid serving one origin's policy-bearing response to another. |
| `Private Network Access preflight and browser support caveat` | Browser requests from public to more-private network address spaces have evolving PNA-related preflight behavior. Treat browser support as version-specific and never use it as authorization. |
| `Access-Control-Request-Private-Network and Access-Control-Allow-Private-Network browser protocol caveat` | These fields appear in some PNA implementations/proposals; confirm current browser requirements before use because this is evolving and not a general ASP.NET Core policy API. |
| `Access-Control-Request-Private-Network` | A browser-protocol header used in Private Network Access preflight proposals/implementations. Support and requirements are evolving and browser-dependent; do not rely on it as an authorization boundary. |
| `Access-Control-Allow-Private-Network` | Response field associated with Private Network Access preflight behavior in some browser implementations. Verify current browser and standards status before configuring; it is not a general ASP.NET Core policy feature. |
| `AllowAnyOrigin` and `AllowCredentials` | ASP.NET Core rejects/returns an invalid response for this combination. Bypassing it with `SetIsOriginAllowed(_ => true)` is equally unsafe. |
| `Credentialed CORS wildcard method/header/exposed header nuance` | The CORS protocol's wildcard semantics for methods, request headers, and exposed headers are also restricted when credentials mode is true. Prefer explicit lists rather than assuming the origin wildcard is the only issue. |
| `Do not combine endpoint CORS attributes and policies without understanding policy combination` | Multiple CORS metadata sources can make effective permissions hard to infer. Prefer one clear configuration style per endpoint group and test preflight/actual responses. |

## Cross-item comparison

- **Allowed origin** controls which browser page can read a response; **allowed method/header** controls which CORS request shapes can proceed; **credentials** permits ambient browser credentials; none of these checks who the user is.
- **Preflight** is an `OPTIONS` permission exchange. A simple request may reach the server without it, so a CORS policy is not a CSRF defense.
- **Named middleware policy** is easier to apply consistently and handles preflight. Endpoint metadata can select policy behavior but should not be assumed to replace middleware responsibilities.

## Examples

### Configure a narrow credentialed browser policy

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("PortalBrowser", policy =>
        policy.WithOrigins("https://portal.example.com")
              .WithMethods("GET", "POST", "PUT")
              .WithHeaders("Content-Type", "X-CSRF-TOKEN")
              .AllowCredentials()
              .WithExposedHeaders("X-Request-Id")
              .SetPreflightMaxAge(TimeSpan.FromMinutes(5)));
});

var app = builder.Build();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
```

This is a policy-registration/pipeline snippet; the browser app must also opt into credentials (`credentials: "include"` in Fetch). The configured origin has no trailing slash. Cookie eligibility also depends on cookie attributes and browser policy. Unsafe cookie-authenticated methods still require the applicable CSRF defense. [CORS guidance](https://learn.microsoft.com/en-us/aspnet/core/security/cors)

### Inspect a preflight

A browser may send `OPTIONS` with `Origin`, `Access-Control-Request-Method`, and `Access-Control-Request-Headers`. The server answers with the allowed origin, methods, headers, and optional max-age. The browser then sends the actual request if permitted. Do not interpret a successful preflight as login or permission to access a record.

## Common mistakes

- Using `AllowAnyOrigin` with cookies/credentials or reflecting every `Origin` through a custom predicate.
- Treating a successful preflight as authentication or authorization.
- Assuming CORS prevents curl, mobile apps, or server-to-server callers.
- Forgetting `Vary: Origin` when a cache stores origin-dependent CORS responses.
- Placing `UseCors` after authorization, preventing CORS headers on short-circuited responses.
- Relying only on `RequireCors` metadata for automatic `OPTIONS` preflight processing.
- Assuming static files need CORS when same-origin only; place CORS before static-file middleware only when cross-origin asset retrieval requires it.
- Configuring `WithOrigins("https://portal.example.com/")` with a trailing slash; the exact comparison then fails.
- Assuming `credentials: "include"` forces cookies to be sent despite SameSite/third-party-cookie restrictions.
- Combining middleware policies and endpoint attributes without checking the effective policy.
- Using wildcard subdomains across hosts that serve untrusted user content.

## Knowledge checks with answers

1. **What makes two URLs different origins?** A difference in scheme, host, or port.
2. **Does CORS stop a command-line client from calling an API?** No. It is enforced by browsers, not a server-side authorization boundary.
3. **Can a credentialed CORS response use wildcard origin?** No. It must identify a specific permitted origin.
4. **Why does `UseCors` need to run before authorization?** Authorization may short-circuit the response; CORS must be able to process requests and attach headers.
5. **Why is `Vary: Origin` important?** A cache must not reuse an origin-specific allow response for a different requesting origin.

## Sources

- [Enable Cross-Origin Requests (CORS) in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
- [CorsPolicyBuilder API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.cors.infrastructure.corspolicybuilder)
- [MDN CORS guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)

# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Reference: CSRF threat model, token creation/storage, validation APIs, and endpoint integration

## Scope and version

This reference covers two separate ASP.NET Core protections: the long-standing token-based antiforgery system and the automatic request-metadata CSRF protection introduced in ASP.NET Core 11. The latter is enabled by default in apps built with `WebApplication.CreateBuilder`, does not issue or validate tokens, and records a verdict that form-processing components enforce. Both mechanisms can coexist. [ASP.NET Core 11 antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0) [Migration from .NET 10 to 11](https://learn.microsoft.com/en-us/aspnet/core/migration/100-to-110?view=aspnetcore-10.0) [IAntiforgery API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery)

## How this group fits the mental model

Cookies are ambient credentials: a browser automatically attaches them to matching requests. A hostile page may therefore cause a victim's browser to submit an authenticated state-changing request. ASP.NET Core issues a protected antiforgery cookie token and a separate request token; the server requires both in the expected pairing. Authentication still identifies the user, and authorization still decides whether that user may perform the operation.

ASP.NET Core 11 also evaluates `Sec-Fetch-Site` and `Origin` request metadata automatically. It allows safe methods; same-origin/user-initiated traffic; and cross-origin requests whose resolved CORS policy trusts the origin and permits credentials. Other cross-site submissions are recorded as denied. The middleware itself does not end the request: form consumers such as Minimal API form binding and Blazor SSR enforce the invalid verdict, commonly with `400 Bad Request`. Plain JSON endpoints do not gain form-validation metadata automatically. This is not a token check, and headers can be absent or spoofed by non-browser clients; CSRF is a browser threat, so the metadata mechanism explicitly treats requests lacking both browser headers as non-browser traffic. Use authentication/authorization for every caller and tokens when their guarantees or compatibility are required. [Automatic CSRF protection](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

## Supplied names explained

### Services, options, token issuance, and validation

| Supplied name | Meaning and use |
|---|---|
| `AddAntiforgery` | Registers antiforgery services/options. It does not itself insert `AntiforgeryMiddleware` into the pipeline. |
| `ASP.NET Core 11 automatic CSRF protection middleware` | Default middleware in apps built with `WebApplication.CreateBuilder`. It inspects `Sec-Fetch-Site` and `Origin`, records an allow/deny verdict, and issues or validates no tokens. Form-processing components enforce a denied verdict. |
| `ICsrfProtection` | ASP.NET Core 11 service abstraction for the automatic request-metadata protection decision. A custom implementation can replace the default decision logic; it should preserve a defensible browser threat model. |
| `CsrfProtectionResult` | ASP.NET Core 11 result representing an allowed or denied CSRF-protection verdict. The middleware records it for downstream consumers. |
| `DisableCsrfProtection` configuration key | ASP.NET Core 11 opt-out for the automatic header-based CSRF middleware. Disabling it globally removes this default layer; evaluate endpoint exposure and retain another defense where needed. |
| `Sec-Fetch-Site` | Fetch Metadata request header indicating same-origin, same-site, cross-site, or user-initiated (`none`) context. ASP.NET Core 11 uses it as an input to automatic CSRF protection. It is not authentication and non-browser clients can forge or omit it. |
| `Origin` CSRF fallback | When `Sec-Fetch-Site` is absent, ASP.NET Core 11 can compare the supplied origin with the request origin; requests with neither browser metadata header are treated as non-browser clients. |
| `IAntiforgeryValidationFeature.Error` | Exposes token-validation error information when present. Do not send token internals to clients. |
| `ASP.NET Core 11 deferred CSRF enforcement` | The automatic middleware stores its verdict rather than short-circuiting. A form consumer decides whether to reject the submission. |
| `ASP.NET Core 11 CSRF and credentialed CORS interaction` | A request from an origin trusted by the resolved CORS policy with credentials enabled can be accepted by the automatic CSRF check. CORS permission is not user authorization; retain authentication and authorization. |
| `ASP.NET Core 11 token and metadata defenses coexist` | `UseAntiforgery` adds token validation in addition to the automatic request-metadata check. When token validation runs, its result is authoritative for the shared validation feature. |
| `RequireAntiforgeryTokenAttribute` | Metadata attribute used with antiforgery middleware to require validation for an API-controller endpoint, including form-bound endpoints. |
| `IAntiforgeryMetadata.RequiresValidation` | Metadata signal that an endpoint requires token-based antiforgery validation when applicable middleware runs. |
| `RequireAntiforgeryTokenAttribute(false)` | Blazor SSR opt-out for token metadata where explicitly justified. It does not provide a replacement security check. |
| `AntiforgeryOptions` | Configuration for antiforgery cookie properties, hidden form field/header names, and related behavior. |
| `AntiforgeryOptions.Cookie` | Cookie builder settings for the protected antiforgery cookie token, including `Name`, `Domain`, `Path`, `HttpOnly`, `SecurePolicy`, `SameSite`, and `IsEssential`. Verify the actual defaults for the targeted framework and flow instead of assuming authentication-cookie defaults. |
| `AntiforgeryOptions.FormFieldName` | Name of the form field containing the request token for ordinary form posts. Keep model binding and generated forms aligned. |
| `AntiforgeryOptions.HeaderName` | Header name used to submit the request token for JavaScript/AJAX requests. A custom header often triggers CORS preflight cross-origin, but that does not remove server token validation. |
| `AntiforgeryOptions.SuppressXFrameOptionsHeader` | Suppresses antiforgery's default `X-Frame-Options: SAMEORIGIN` header when true. If suppressed, configure appropriate framing protection elsewhere. |
| `IAntiforgery` | Service for generating, storing, reading, and validating antiforgery tokens. Inject it where the application needs an explicit token endpoint or custom integration. |
| `IAntiforgery.GetAndStoreTokens` | Generates/gets a token set and stores the cookie token in the response when needed. Put the request token in a same-origin form or trusted client response. |
| `IAntiforgery.GetTokens` | Returns token material without automatically storing the cookie token in the response. Ensure the paired cookie is established through the appropriate flow. |
| `IAntiforgery.SetCookieTokenAndHeader` | Ensures the antiforgery cookie token is set and applies configured cache-control header behavior for token-bearing responses. Use the API contract for the target framework when building custom issuance flows. |
| `IAntiforgery.IsRequestValidAsync` | Checks whether the current request has valid antiforgery data and returns a Boolean result. It is useful for non-throwing validation decisions. |
| `IAntiforgery.ValidateRequestAsync` | Validates the current request and throws `AntiforgeryValidationException` when validation fails. Let framework filters/middleware handle failures where possible. |
| `AntiforgeryTokenSet` | Container for request/cookie token values and configured form/header names. Treat token strings as secrets that authorize a request when paired correctly. |
| `AntiforgeryTokenSet.RequestToken` | Token value sent with the unsafe request in a hidden field or configured header. Do not expose it to an untrusted origin. |
| `AntiforgeryTokenSet.CookieToken` | Token value placed in the antiforgery cookie. The cookie and request token are validated as a pair. |
| `AntiforgeryTokenSet.FormFieldName` | Configured name to use when rendering the request token in an HTML form. |
| `AntiforgeryTokenSet.HeaderName` | Configured name to use when sending the request token in a header. |
| `AntiforgeryValidationException` | Exception representing invalid/missing antiforgery data. Convert it to the expected safe client response without disclosing internal token details. |
| `AntiforgeryOptions.CookieBuilder` | CookieBuilder configuration surface associated with the antiforgery cookie. Use HTTPS and appropriate SameSite/scope settings for the flow. |
| `AntiforgeryMiddleware` | Middleware that exposes/executes antiforgery validation for endpoint metadata requiring validation. Service registration alone does not put it in the pipeline. |
| `UseAntiforgery` | Adds antiforgery middleware to a Minimal API/Blazor pipeline when required. Place it according to the framework pipeline, generally after authentication/authorization and before endpoint execution. |
| `RequireAntiforgery` | Endpoint convention that marks an endpoint as requiring antiforgery validation. It does not issue the request token to a client. |
| `DisableAntiforgery` | Endpoint convention that marks an endpoint as not requiring antiforgery validation where a convention otherwise applies. Use narrowly and only when the endpoint's credential threat model justifies it. |
| `IAntiforgeryValidationFeature` | Request feature exposing the outcome of antiforgery validation performed by middleware. |
| `IAntiforgeryValidationFeature.IsValid` | Indicates whether validation succeeded for the current request feature. An endpoint requiring validation must reject an invalid/missing token. |

### MVC/Razor Pages and token transport

| Supplied name | Meaning and use |
|---|---|
| `ValidateAntiForgeryTokenAttribute` | MVC/Razor Pages filter attribute that validates antiforgery data for the action/page request. Apply to unsafe operations or use an appropriate global convention. |
| `AutoValidateAntiforgeryTokenAttribute` | Filter that automatically validates antiforgery for unsafe HTTP methods while excluding safe methods. It is commonly used broadly in non-API MVC scenarios. |
| `IgnoreAntiforgeryTokenAttribute` | Filter metadata that suppresses antiforgery validation for a selected action/page. Use only after understanding its containing/global filters and endpoint threat model. |
| `ValidateAntiForgeryToken filter` | Filter execution that rejects a request when its antiforgery token pair is missing/invalid. It runs within MVC/Razor Pages rather than as general authentication. |
| `AutoValidateAntiforgeryToken MVC filter` | Automatically validates relevant unsafe MVC requests, helping cover POST/PUT/PATCH/DELETE-style changes without requiring a per-action attribute. |
| `AntiforgeryValidationExceptionFilter` | Filter integration that handles antiforgery validation errors within MVC's result pipeline. Configure safe status/error behavior without echoing token values. |
| `Antiforgery token cookie and request token pair` | In token mode, the server validates a request token together with the protected cookie token. A request token alone or cookie alone is insufficient. This is separate from ASP.NET Core 11's metadata-based CSRF verdict. |
| `Hidden form field token` | HTML form transport for the request token, typically generated by framework form helpers/tag helpers. Include it in each unsafe form submission. |
| `AJAX header token` | JavaScript transport for the request token in a configured header. Obtain it from a same-origin response/form and never make token retrieval available to untrusted origins. |
| `Cookie-authenticated CSRF threat` | A hostile page may cause the browser to send an authenticated cookie even when same-origin policy prevents the attacker from reading the response. Validate antiforgery tokens on unsafe cookie-backed operations. |
| `SameSite cookie is defense in depth` | SameSite limits some cross-site cookie sends but can have exceptions/compatibility requirements and does not replace antiforgery token validation for the app's threat model. |
| `Antiforgery does not replace authorization` | A valid token demonstrates request context/intent, not permission. The authenticated principal still needs endpoint/resource authorization. |
| `Blazor and Minimal API UseAntiforgery requirement` | Explicit `UseAntiforgery` is required to run token-based validation for endpoint metadata. ASP.NET Core 11's automatic metadata-based CSRF protection is separate and is enabled by default in `WebApplication.CreateBuilder` apps. |
| `MVC/Razor Pages antiforgery filter behavior` | MVC/Razor Pages use framework filters to validate relevant requests and do not require antiforgery middleware for that filter behavior. |
| `Form token generation through IAntiforgery` | Applications can explicitly obtain tokens with `IAntiforgery` and render the request token in a form/header while the cookie token is stored. Prefer framework form helpers where available. |
| `Data Protection shared key ring for farm antiforgery` | Antiforgery tokens use Data Protection; multiple app instances must share compatible protected keys/configuration to validate tokens issued by another node. |
| `Antiforgery token middleware result must be enforced by endpoint/filter or explicit application check` | The token middleware sets `IAntiforgeryValidationFeature`; it does not short-circuit the pipeline, so endpoint code can still run even when the feature says invalid. Use framework filters/form-binding enforcement or explicitly reject an invalid result before performing state changes. |
| `Antiforgery validation before state-changing operation` | Ensure the form consumer/filter or explicit application check rejects an invalid verdict before the operation changes state. Middleware execution alone is not proof that an endpoint was stopped. |
| `HttpMethodOverrideMiddleware antiforgery ordering bypass` | Form-field method override placed before token middleware can convert POST to DELETE or another method the middleware does not validate. Place method override after validation where possible or validate explicitly. |
| `IAntiforgeryAdditionalDataProvider` | Extension point for adding and validating supplemental data embedded in generated request tokens, such as a timestamp or nonce. Configure both generation and validation; absent provider configuration does not validate arbitrary supplemental data. |
| `GetAdditionalData` and `ValidateAdditionalData` | Provider callbacks that create and validate the additional token data. They are not replacements for user authorization or token-pair validation. |
| `Windows Authentication and CSRF` | Windows/browser authentication is ambient in relevant configurations; protect state-changing browser requests from CSRF just as with authentication cookies. |
| `ASP.NET Core 10 to 11 static SSR migration` | In .NET 11, Blazor static SSR can rely on the automatic CSRF verdict when token middleware is absent, and in that configuration stops generating token fields. Keeping `UseAntiforgery` retains token-based generation/validation as an additional mechanism. |
| `Cross-origin token exfiltration boundary` | A hostile origin must not be able to read a token issued to the trusted app. Restrict credentialed CORS and prevent XSS; an XSS on the trusted origin can generally access same-origin tokens. |
| `Safe methods should not mutate state` | GET/HEAD/OPTIONS/TRACE semantics should not change application state. If a “read” endpoint mutates state, browser prefetching/crawlers and CSRF assumptions become unsafe. |

### Remaining named API and protocol entries

The manifest names below are included explicitly. Their behavior and surrounding tradeoffs are explained in the relevant sections above; use the linked official references to follow overloads and target-framework differences.

| Supplied name | Coverage note |
|---|---|
| `ASP.NET Core 11 automatic CSRF middleware default WebApplication.CreateBuilder registration` | The default middleware is wired by the standard web builder; the DisableCsrfProtection setting turns this layer off globally. |
| `ASP.NET Core 11 automatic cross-origin CSRF verdict` | Allowed/denied outcome based on safe method, browser Fetch Metadata, Origin fallback, and trusted credentialed CORS policy. |
| `ASP.NET Core 11 form-processing components enforce invalid CSRF verdict` | Form consumers enforce the recorded denied result, commonly with HTTP 400; the middleware itself does not terminate the pipeline. |
| `ASP.NET Core 11 Sec-Fetch-Site and Origin evaluation order` | Safe method, then same-origin/none, then trusted credentialed CORS, then deny cross-site/same-site; absent Fetch Metadata falls back to Origin comparison, and absence of both is treated as non-browser. |
| `ASP.NET Core 11 trusted credentialed CORS origin interaction` | The resolved CORS policy must trust the origin and enable credentials; CORS still does not authenticate or authorize the caller. |
| `ASP.NET Core 11 ICsrfProtection and CsrfProtectionResult customization` | ICsrfProtection.ValidateAsync returns a CsrfProtectionResult; custom logic replaces the default request-metadata decision and must maintain a reviewed allowlist/trust model. |
| `ASP.NET Core 11 DisableCsrfProtection configuration key` | Global switch for the automatic request-metadata middleware; disabling it removes the default CSRF layer. |
| `ASP.NET Core 11 DisableAntiforgery and IgnoreAntiforgeryToken opt-out metadata` | Endpoint metadata opts out of CSRF validation; use only for non-browser or non-cookie-authenticated endpoints after threat-model review. |
| `ASP.NET Core 11 same-origin, same-site, cross-site and user-initiated request verdicts` | Same-origin and user-initiated none are allowed; same-site is not automatically trusted, and cross-site requires the trusted credentialed CORS path. |
| `ASP.NET Core 11 legacy Origin-only and no-browser-metadata fallback` | If Sec-Fetch-Site is absent, compare Origin to request origin; if both are absent, the request is treated as a non-browser client. |
| `ASP.NET Core 11 deferred validation by form-processing component` | Middleware records the verdict; form-processing endpoint code decides whether to reject it. |
| `ASP.NET Core 11 automatic CSRF protection does not issue or validate tokens` | This path uses Sec-Fetch-Site/Origin and has no token issuance, antiforgery cookie, or token-pair validation. |
| `ASP.NET Core 11 automatic and token-based CSRF protections coexist` | Both may run. When token middleware is enabled, its token result replaces the earlier metadata verdict in the shared validation feature. |
| `ASP.NET Core 10 to 11 static SSR antiforgery migration behavior` | Without UseAntiforgery, .NET 11 Blazor SSR relies on automatic CSRF verdicts and stops emitting token fields; with it, token generation/validation remains active. |
| `IAntiforgeryAdditionalDataProvider.GetAdditionalData` | Called to produce supplemental data embedded in a generated token. |
| `IAntiforgeryAdditionalDataProvider.ValidateAdditionalData` | Called to validate supplemental data when the token is checked. |
| `RequireAntiforgeryTokenAttribute(bool) opt-out for Blazor SSR` | Boolean false opts the endpoint out of token validation; do so only after confirming another suitable CSRF defense. |
| `Antiforgery validation middleware does not itself short-circuit` | UseAntiforgery records IAntiforgeryValidationFeature; framework filters/form consumers or explicit code must enforce rejection. |
| `AntiforgeryOptions.Cookie.SecurePolicy` | CookieBuilder setting that controls Secure flag policy; antiforgery defaults to None, so configure Always for HTTPS-only production. |
| `AntiforgeryOptions.Cookie.HttpOnly` | CookieBuilder setting that prevents JavaScript reading the protected cookie; default true. |
| `AntiforgeryOptions.Cookie.SameSite` | CookieBuilder setting; antiforgery defaults to Strict. |
| `AntiforgeryOptions.Cookie.Name` | Overrides the generated cookie name; otherwise ASP.NET Core creates a unique default-prefixed name. |
| `AntiforgeryOptions.Cookie.Path` | Limits which request paths receive the cookie. |
| `AntiforgeryOptions.Cookie.Domain` | Sets cookie domain scope; parent-domain scope includes more subdomains. |
| `AntiforgeryOptions.Cookie.IsEssential` | Defaults true because antiforgery is necessary to cookie-authenticated app security. |
| `IAntiforgery.GetAndStoreTokens(HttpContext)` | Context overload returns a token set and stores the cookie token as needed. |
| `IAntiforgery.GetTokens(HttpContext)` | Context overload returns tokens without the same response cookie-storage behavior. |
| `IAntiforgery.SetCookieTokenAndHeader(HttpContext)` | Generates/stores a cookie token when one is absent or invalid and writes related response header behavior. |
| `IAntiforgery.GetAndStoreTokens Set-Cookie behavior` | Adds a Set-Cookie value when a new/valid cookie token must be established; not necessarily on every call. |
| `IAntiforgery.GetTokens token generation without response storage` | Obtains token values without ensuring the cookie token is written on the response. |
| `Antiforgery cookie default SecurePolicy and production configuration` | `SecurePolicy` defaults to `None`; Microsoft's guidance shows setting `Always` for non-Development HTTPS deployments. |
| `Antiforgery cookie default HttpOnly behavior` | `HttpOnly` defaults to true for the protected antiforgery cookie. A separately published request-token copy may be intentionally readable by same-origin JavaScript. |
| `Antiforgery cookie default SameSite behavior` | Antiforgery cookie `SameSite` defaults to `Strict`; test cross-site login and browser flows before changing it. |
| `Antiforgery cookie HttpOnly and readable request-token transport` | Keep protected cookie HttpOnly; if SPA JavaScript needs the request token, publish only that token through a deliberate same-origin channel. |
| `Windows Authentication ambient credentials and CSRF` | Browser-supplied Windows authentication is ambient and state-changing endpoints still need CSRF protection. |

## Cross-item comparison

- `GetAndStoreTokens` creates/stores the cookie half and returns request-token material; `GetTokens` returns values without the same automatic cookie-storage behavior.
- MVC/Razor Pages commonly validate via filters. Minimal APIs/Blazor use endpoint metadata plus `UseAntiforgery` middleware when required.
- ASP.NET Core 11 automatic CSRF protection uses browser request metadata, not tokens; consumers enforce the verdict. Token middleware records its result and does not itself short-circuit Minimal API execution.
- The request token proves cross-site request context; authentication identifies the user; authorization grants/denies an action. All three may be needed.

## Examples

### Render a form token

```cshtml
<form method="post">
    @Html.AntiForgeryToken()
    <button type="submit">Save</button>
</form>
```

With MVC/Razor Pages integration, the Form Tag Helper automatically emits a request token for a POST form when `action` is omitted or empty; `IHtmlHelper.BeginForm` also emits one by default for non-GET forms. The corresponding antiforgery cookie is sent by the browser. The action must use the configured validation filter/convention. The POST must still validate authorization and input. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

### Configure a header for JavaScript requests

```csharp
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "Academy.Antiforgery";
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
});
```

This is a configuration snippet; the app must still issue the request token through a trusted same-origin form/page/endpoint and validate it on unsafe requests. For a Minimal API endpoint with antiforgery metadata, add the middleware explicitly. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

## Common mistakes

- Calling `AddAntiforgery` and assuming it adds middleware to Minimal APIs/Blazor.
- Assuming token-based `UseAntiforgery` short-circuits an invalid Minimal API request; it records a result for downstream enforcement.
- Treating ASP.NET Core 11 automatic `Sec-Fetch-Site`/`Origin` protection as token generation or token validation.
- Assuming automatic CSRF metadata protection applies identically to plain JSON endpoints; form-processing metadata is central to its deferred enforcement model.
- Protecting only HTML forms while leaving cookie-authenticated AJAX writes unvalidated.
- Sending a request token in a URL where logs/referrers can leak it.
- Exposing token retrieval through credentialed CORS to arbitrary origins.
- Assuming a valid antiforgery token authorizes the user to change a resource.
- Mutating state on GET and relying on unsafe-method token filters.
- Forgetting to share Data Protection keys across replicas.
- Disabling antiforgery for a cookie-authenticated endpoint because its route is “API-like.”
- Treating SameSite as a complete replacement for request-token validation.

## Knowledge checks with answers

1. **Why are there two values in token-based antiforgery?** The protected cookie token and request token must be paired, so a hostile site cannot simply cause the browser to attach ambient cookies and forge the request token.
2. **Does `AddAntiforgery` add token middleware?** No. It registers services; call `UseAntiforgery` where token-based endpoint integration requires it. ASP.NET Core 11 automatic CSRF protection is separate and is enabled by default in `WebApplication.CreateBuilder` apps.
3. **Does a valid token prove authorization?** No. It mitigates CSRF; authorization still checks the user and resource.
4. **Why should GET not change data?** Browsers and intermediaries may trigger safe-method requests automatically, while antiforgery filters generally target unsafe methods.
5. **What must be shared in a farm?** Compatible Data Protection keys and application configuration used to protect/validate the tokens.
6. **Does ASP.NET Core 11 automatic CSRF middleware stop a request itself?** No. It records a verdict from Fetch Metadata/Origin; form-processing components enforce it. Token middleware also records a result rather than short-circuiting the endpoint pipeline.

## Sources

- [Prevent CSRF attacks in ASP.NET Core 11](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [IAntiforgery API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery)

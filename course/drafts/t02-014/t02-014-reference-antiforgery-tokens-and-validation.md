# ASP.NET Core CORS antiforgery rate limiting HTTPS and security headers — Reference: CSRF threat model, token creation/storage, validation APIs, and endpoint integration

## Scope and version

This reference covers the ASP.NET Core antiforgery token pair and validation surfaces. Current ASP.NET Core 11 guidance distinguishes service registration, MVC/Razor Pages filters, and middleware integration for Minimal APIs/Blazor. Registering services alone does not add middleware. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0) [IAntiforgery API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery)

## How this group fits the mental model

Cookies are ambient credentials: a browser automatically attaches them to matching requests. A hostile page may therefore cause a victim's browser to submit an authenticated state-changing request. ASP.NET Core issues a protected antiforgery cookie token and a separate request token; the server requires both in the expected pairing. Authentication still identifies the user, and authorization still decides whether that user may perform the operation.

## Supplied names explained

### Services, options, token issuance, and validation

| Supplied name | Meaning and use |
|---|---|
| `AddAntiforgery` | Registers antiforgery services/options. It does not itself insert `AntiforgeryMiddleware` into the pipeline. |
| `AntiforgeryOptions` | Configuration for antiforgery cookie properties, hidden form field/header names, and related behavior. |
| `AntiforgeryOptions.Cookie` | Cookie builder settings for the protected antiforgery cookie token. Configure secure transport, scope, and SameSite behavior for the app's topology. |
| `AntiforgeryOptions.FormFieldName` | Name of the form field containing the request token for ordinary form posts. Keep model binding and generated forms aligned. |
| `AntiforgeryOptions.HeaderName` | Header name used to submit the request token for JavaScript/AJAX requests. A custom header often triggers CORS preflight cross-origin, but that does not remove server token validation. |
| `AntiforgeryOptions.SuppressXFrameOptionsHeader` | Controls whether antiforgery processing emits its default `X-Frame-Options` header. If suppressed, configure appropriate framing protection elsewhere. |
| `IAntiforgery` | Service for generating, storing, reading, and validating antiforgery tokens. Inject it where the application needs an explicit token endpoint or custom integration. |
| `IAntiforgery.GetAndStoreTokens` | Generates/gets a token set and writes the cookie token to the response when needed. The returned request token is rendered into a form or returned to a trusted client. |
| `IAntiforgery.GetTokens` | Gets token values without necessarily writing the cookie to the response. Use when storage is managed separately and ensure the matching cookie token exists. |
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
| `Antiforgery token cookie and request token pair` | The server validates the request token together with the protected cookie token. A request token alone or cookie alone is insufficient. |
| `Hidden form field token` | HTML form transport for the request token, typically generated by framework form helpers/tag helpers. Include it in each unsafe form submission. |
| `AJAX header token` | JavaScript transport for the request token in a configured header. Obtain it from a same-origin response/form and never make token retrieval available to untrusted origins. |
| `Cookie-authenticated CSRF threat` | A hostile page may cause the browser to send an authenticated cookie even when same-origin policy prevents the attacker from reading the response. Validate antiforgery tokens on unsafe cookie-backed operations. |
| `SameSite cookie is defense in depth` | SameSite limits some cross-site cookie sends but can have exceptions/compatibility requirements and does not replace antiforgery token validation for the app's threat model. |
| `Antiforgery does not replace authorization` | A valid token demonstrates request context/intent, not permission. The authenticated principal still needs endpoint/resource authorization. |
| `Blazor and Minimal API UseAntiforgery requirement` | In current guidance, explicit `UseAntiforgery` is required for Blazor/Minimal API paths that use antiforgery metadata; `AddAntiforgery` alone only registers services. |
| `MVC/Razor Pages antiforgery filter behavior` | MVC/Razor Pages use framework filters to validate relevant requests and do not require antiforgery middleware for that filter behavior. |
| `Form token generation through IAntiforgery` | Applications can explicitly obtain tokens with `IAntiforgery` and render the request token in a form/header while the cookie token is stored. Prefer framework form helpers where available. |
| `Data Protection shared key ring for farm antiforgery` | Antiforgery tokens use Data Protection; multiple app instances must share compatible protected keys/configuration to validate tokens issued by another node. |
| `Antiforgery validation before endpoint execution` | Validation must occur before application code performs the state-changing operation. Middleware/filter ordering and endpoint metadata determine where it runs. |
| `Cross-origin token exfiltration boundary` | A hostile origin must not be able to read a token issued to the trusted app. Restrict credentialed CORS and prevent XSS; an XSS on the trusted origin can generally access same-origin tokens. |
| `Safe methods should not mutate state` | GET/HEAD/OPTIONS/TRACE semantics should not change application state. If a “read” endpoint mutates state, browser prefetching/crawlers and CSRF assumptions become unsafe. |

## Cross-item comparison

- `GetAndStoreTokens` creates/stores the cookie half and returns request-token material; `GetTokens` returns values without the same automatic cookie-storage behavior.
- MVC/Razor Pages commonly validate via filters. Minimal APIs/Blazor use endpoint metadata plus `UseAntiforgery` middleware when required.
- The request token proves cross-site request context; authentication identifies the user; authorization grants/denies an action. All three may be needed.

## Examples

### Render a form token

```cshtml
<form method="post">
    @Html.AntiForgeryToken()
    <button type="submit">Save</button>
</form>
```

With the MVC/Razor Pages integration, the form helper emits the request token and the browser sends the corresponding antiforgery cookie. The action must use the configured validation filter/convention. The POST must still validate authorization and input. [Antiforgery guidance](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)

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
- Protecting only HTML forms while leaving cookie-authenticated AJAX writes unvalidated.
- Sending a request token in a URL where logs/referrers can leak it.
- Exposing token retrieval through credentialed CORS to arbitrary origins.
- Assuming a valid antiforgery token authorizes the user to change a resource.
- Mutating state on GET and relying on unsafe-method token filters.
- Forgetting to share Data Protection keys across replicas.
- Disabling antiforgery for a cookie-authenticated endpoint because its route is “API-like.”
- Treating SameSite as a complete replacement for request-token validation.

## Knowledge checks with answers

1. **Why are there two tokens?** The protected cookie token and request token must be paired, so a hostile site cannot simply cause the browser to attach ambient cookies and forge the request token.
2. **Does `AddAntiforgery` add Minimal API middleware?** No. It registers services; call `UseAntiforgery` where the endpoint integration requires it.
3. **Does a valid token prove authorization?** No. It mitigates CSRF; authorization still checks the user and resource.
4. **Why should GET not change data?** Browsers and intermediaries may trigger safe-method requests automatically, while antiforgery filters generally target unsafe methods.
5. **What must be shared in a farm?** Compatible Data Protection keys and application configuration used to protect/validate the tokens.

## Sources

- [Prevent CSRF attacks in ASP.NET Core 11](https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-11.0)
- [IAntiforgery API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.antiforgery.iantiforgery)

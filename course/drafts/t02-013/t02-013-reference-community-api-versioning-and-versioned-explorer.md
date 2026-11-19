# API versioning OpenAPI contracts Problem Details validation pagination and idempotency — Reference: Asp.Versioning packages, readers, version metadata, endpoint conventions, and explorer

## Scope and version

ASP.NET Core does not supply API version negotiation as a built-in framework feature. This reference describes the separate `Asp.Versioning` package family documented for ASP.NET Core. Use the HTTP package with Minimal APIs and the MVC package with controllers; API Explorer support is an additional package. The old `Microsoft.AspNetCore.Mvc.Versioning` family is deprecated. Pin compatible package versions and confirm exact extension availability in the selected package. [Asp.Versioning documentation](https://dotnet.github.io/aspnet-api-versioning/) [Configuration](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/config/overview.html)

Package release numbers are independent of the .NET runtime and can differ across the family. On 2026-11-20, NuGet listed `Asp.Versioning.Abstractions`, `.Mvc`, and `.Mvc.ApiExplorer` at 10.2.1, and `.Http` and `.OpenApi` at 10.2.3. These are a dated snapshot, not a recommendation to force every package to one number; check each package's target-framework and dependency constraints when upgrading. The 10.2 release also added API-version range support and compiler analyzers; in 10.2 the analyzers are enabled by default, so an upgrade can surface build diagnostics that need triage. [Project releases](https://github.com/dotnet/aspnet-api-versioning/releases) [Abstractions on NuGet](https://www.nuget.org/packages/Asp.Versioning.Abstractions) [MVC API Explorer on NuGet](https://www.nuget.org/packages/Asp.Versioning.Mvc.ApiExplorer) [HTTP on NuGet](https://www.nuget.org/packages/Asp.Versioning.Http) [OpenAPI on NuGet](https://www.nuget.org/packages/Asp.Versioning.OpenApi)

## How this group fits the mental model

Versioning assigns version metadata to logical API endpoints/controllers, reads a requested version from a chosen location, selects a matching endpoint, and can report supported/deprecated versions. `Asp.Versioning.Mvc.ApiExplorer` turns version metadata into grouped API descriptions that OpenAPI tooling can document. The package does not define the product's compatibility policy, authorization, route semantics, or retirement schedule. For Minimal APIs, use versioned endpoint groups and conventions rather than MVC attributes. [How to version your service](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/how-to/overview.html) [Version discovery](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/version-discovery.html)

## Supplied names explained

| Supplied name | Meaning and use |
|---|---|
| `Asp.Versioning.Abstractions package` | Shared core abstractions and types such as API versions and readers used by package-specific integrations. |
| `Asp.Versioning.Http package` | Integration for Minimal APIs and HTTP endpoint routing. |
| `Asp.Versioning.Mvc package` | Integration for ASP.NET Core MVC/controllers; it brings controller attributes and conventions. |
| `Asp.Versioning.Mvc.ApiExplorer package` | MVC/API Explorer integration that groups descriptions by API version for document generation. |
| `Asp.Versioning.OpenApi package` | OpenAPI integration for versioned APIs, used with compatible current Asp.Versioning/OpenAPI packages. Check the project's documented package matrix before installation. |
| `Microsoft.AspNetCore.Mvc.Versioning deprecated package family` | Older package naming/version family superseded by `Asp.Versioning`; do not start new projects on it. |
| `AddApiVersioning` | Registers versioning services and returns an `IApiVersioningBuilder` for further configuration/integration. |
| `IApiVersioningBuilder` | Builder returned by versioning registration to add MVC/API Explorer integration and related services. |
| `IApiVersioningBuilder.AddMvc` | Adds MVC integration to versioning configuration. Do not call it for a Minimal API-only app. |
| `IApiVersioningBuilder.AddApiExplorer` | Adds versioned API Explorer support so descriptions can be grouped and substituted for documents. |
| `ApiVersioningOptions` | Central configuration for default/missing versions, version reporting, request reader, and selector. |
| `ApiVersioningOptions.DefaultApiVersion` | Version used in configured fallback/default behavior; it is not automatically a safe substitute for explicit versioning unless the app chooses that policy. |
| `ApiVersioningOptions.AssumeDefaultVersionWhenUnspecified` | Controls whether an omitted version may be mapped to a default. Enabling it can hide client mistakes and should be paired with a clear migration/reporting policy. |
| `ApiVersioningOptions.ReportApiVersions` | Enables response headers advertising supported and deprecated versions. Reporting is disabled by default in the documented package behavior. |
| `ApiVersioningOptions.ApiVersionReader` | Strategy that extracts the requested version from the request. The reader is part of the public contract and should be documented consistently. |
| `ApiVersioningOptions.ApiVersionSelector` | Selects a version when the configured behavior needs a default/selection. Selection policy must not silently route clients to an incompatible contract. |
| `DefaultApiVersionSelector` | Selects the configured `DefaultApiVersion` when a missing request version is allowed and a selector is used. It does not override an explicitly requested version. |
| `ConstantApiVersionSelector` | Selects one configured version regardless of the available model; use only when this is an intentional, stable fallback policy. |
| `CurrentImplementationApiVersionSelector` | Selects the highest implemented version without a status, falling back to the default when no such version exists. A moving default can surprise clients, so implicit-version use must be deliberate. |
| `LowestImplementedApiVersionSelector` | Selects the lowest implemented version without a status, with fallback to the configured default. It is another implicit-selection policy, not a negotiated replacement for an explicit client version. |
| `ApiVersionRange` | Version-range type added in Asp.Versioning 10.2. It uses package-style interval notation: `1.0` means versions ≥ 1.0, `[1.0]` means exactly 1.0, `(1.0,)` means > 1.0, `(,1.0]` means ≤ 1.0, and `[1.0,2.0)` means 1.0 ≤ version < 2.0. Multiple rules combine with logical OR; `Any` and `Empty` represent the degenerate cases. A range matches versions but does not declare that the API implements them. |
| `ApiVersionRange.Any` / `ApiVersionRange.Empty` | Special ranges matching any version or no version, respectively. These are range predicates, not declarations of supported endpoint versions. |
| `VisibleInApiVersionAttribute` | Asp.Versioning 10.2 attribute that makes a model member visible only in specified API-version ranges. It changes serialized contract shape; it is not authorization, input validation, or a substitute for declaring endpoint versions. |
| `Versioned model member filtering` | Asp.Versioning can omit selected response model members for API versions outside their configured visibility range. Verify serialization and schema output for every version, and do not use filtering to hide data from unauthorized callers. |
| `IAnnotation<TKey,TValue>` | Asp.Versioning 10.2 abstraction for associating out-of-band metadata with a member. It is an extension-oriented library API rather than an endpoint-version declaration. |
| `Asp.Versioning analyzers` | Compiler analyzers shipped with the package family to flag versioning misuse. In 10.2 they are enabled by default; review new diagnostics on upgrade and fix configuration errors instead of suppressing them broadly. |
| `EnableApiVersioningAnalyzers` | MSBuild property for opting out of the package's default-enabled analyzers when a temporary migration requires it. Prefer fixing findings and keep any suppression narrow and documented. |
| `ApiVersioningOptions.UnsupportedApiVersionStatusCode` | Configures the status used for an unsupported version. The default is 400, while URL-segment routing may produce 404 because no route matches. Set this intentionally when clients depend on a stable error contract. |
| `ApiVersioningOptions.Policies` | Builds standardized lifecycle metadata for a requested version. Policies report status and links; they do not remove endpoints or schedule shutdown. |
| `ApiVersion` | Value type representing a service API version, commonly major/minor and optionally status metadata. |
| `ApiVersionAttribute` | MVC attribute declaring one or more versions supported by a controller. |
| `ApiVersionNeutralAttribute` | MVC attribute marking an endpoint/controller as not bound to a particular API version. Use only where behavior is intentionally version-neutral. |
| `MapToApiVersionAttribute` | MVC action attribute mapping an action to a specific version declared by its controller. |
| `AdvertiseApiVersionsAttribute` | MVC metadata advertising versions through version discovery without mapping that endpoint as a full implementation of them. |
| `ReportApiVersionsAttribute` | MVC attribute enabling supported/deprecated version response headers for a controller/service. |
| `ApiVersionSet` | Logical set of versions associated with a group of Minimal API endpoints. |
| `NewApiVersionSet` | Creates a builder for defining a Minimal API version set. |
| `ApiVersionSetBuilder` | Builder for supported versions and reporting metadata used to construct the set. |
| `ApiVersionSetBuilder.HasApiVersion` | Adds a supported version to the set. Endpoints still need matching version metadata. |
| `ApiVersionSetBuilder.ReportApiVersions` | Enables supported/deprecated version reporting for the version set. |
| `NewVersionedApi` | Creates a version-aware Minimal API group, optionally with a logical name to identify the service. |
| `HasApiVersion` | Convention attaching supported version metadata to an endpoint or API group. |
| `MapToApiVersion` | Convention mapping a Minimal API endpoint to one of the group's versions. |
| `WithApiVersionSet` | Associates endpoints with a previously built `ApiVersionSet`, enabling negotiation against that set. |
| `ApiVersionMetadata` | Endpoint metadata recording declared/supported/implemented versions and mapping behavior for selection/exploration. |
| `IApiVersionReader` | Contract for extracting requested version(s) from an HTTP request. Custom readers can be added when built-in locations are insufficient. |
| `QueryStringApiVersionReader` | Reads a version from a query parameter (commonly `api-version`). Easy to adopt, but exposed in URLs/logs and caches. |
| `UrlSegmentApiVersionReader` | Reads a version from a route segment such as `/v2/orders`; version is visible in links and route space. |
| `HeaderApiVersionReader` | Reads a version from a request header; clients and proxies must preserve the header. |
| `MediaTypeApiVersionReader` | Reads a version parameter from content negotiation media types; requires careful request/response media-type documentation. |
| `ApiVersionReader.Combine` | Combines multiple readers. Define ambiguity/precedence and advertise accepted locations; multiple mechanisms increase contract complexity. |
| `ApiVersionParser` | Parses textual version representations into `ApiVersion` values. Prefer framework parsing and reject malformed/unsupported values consistently. |
| `IApiVersionSelector` | Strategy interface for choosing a version in default-selection scenarios. Selection should be explicit and stable. |
| `DefaultApiVersionSelector` | Built-in selector implementation for configured default behavior. Do not mistake default selection for negotiation with client capability. |
| `DeprecationPolicy` | Describes RFC 9745 deprecation metadata for a version, including its effective time and optional policy links. |
| `SunsetPolicy` | Describes RFC 8594 sunset metadata for a version. It may include a date and links; a published date is a lifecycle announcement, not an automated deletion schedule. |
| `ApiVersioningOptions.Policies.Deprecate` | Starts a deprecation policy for a specified API version. Policies are emitted for requests to the relevant version when version reporting is enabled. |
| `ApiVersioningOptions.Policies.Sunset` | Starts a sunset policy for a specified API version. A link-only policy is possible when no sunset date is known. |
| `Version policy Effective` | Sets the instant when deprecation or sunset policy takes effect. The policy API serializes the value according to the corresponding RFC field syntax. |
| `Version policy Link` | Adds a Web Linking relation to policy or migration information. The configured policy links use the deprecation or sunset relation. |
| `Version policy Link.Title` | Adds a human-readable title to the policy link. |
| `Version policy Link.Type` | Adds the link target's media type, such as `text/html` or `application/json`. |
| `IApiVersionDescriptionProvider` | API Explorer service exposing discovered version descriptions for document configuration. |
| `ApiVersionDescription` | Description of one discovered version, commonly including group name and deprecated state. |
| `AddApiExplorer` | Adds version-aware API Explorer services; available through builder/integration setup. |
| `ApiExplorerOptions.GroupNameFormat` | Format for version group names used by API Explorer, such as version placeholders. Keep it stable for document routes. |
| `ApiExplorerOptions.SubstituteApiVersionInUrl` | Replaces version route placeholders with concrete version values in generated descriptions. |
| `WithDocumentPerVersion` | Convention/helper for defining an OpenAPI document per discovered API version in supported integrations. Confirm current package API because this surface is package/version specific. |
| `VersionedApiExplorer` | Version-aware explorer integration that organizes API descriptions per version. |
| `API version negotiation` | Process of reading the client version and selecting a compatible endpoint/version. It is separate from authentication and authorization. |
| `API version reporting response headers` | `api-supported-versions` and `api-deprecated-versions` multi-value headers advertise current support/deprecation. They are not a replacement for published migration guidance. |
| `Version-neutral endpoint` | Endpoint that deliberately operates independent of version selection, often for invariant metadata/health behavior. Do not use neutrality to bypass incompatible response contracts. |
| `Deprecated API version metadata` | Marks a version as still implemented but planned for retirement. Pair it with a migration date, replacement information, usage telemetry, and client communication. |
| `Deprecation and sunset policies apply to the requested API version` | A request for one version receives that version's policy. API Explorer descriptions can carry policies at API or version scope; verify both where policies differ. |
| `API version deprecation response header RFC 9745` | The `Deprecation` response field signals that a resource has been or will be deprecated. RFC 9745 uses a Structured Field date; the field does not itself change resource behavior. |
| `API version sunset response header RFC 8594` | The `Sunset` field communicates an expected date after which the resource may become unresponsive, using HTTP-date syntax. It does not force shutdown. |
| `Unsupported API version response` | Response when requested version/location is malformed or unsupported. Choose/document the package behavior and ensure consistent machine-readable error semantics. |
| `Missing API version response` | Behavior when the configured reader finds no version. By default the package does not silently assume a default; configure implicit selection intentionally if desired. |
| `Malformed API version response` | Behavior when the supplied version cannot be parsed or reader values conflict. Reject it clearly and avoid silently selecting a different contract. |
| `Unsupported API version default response status 400` | The documented default unsupported-version status is Bad Request (400), subject to configured status and routing behavior. |
| `URL segment unsupported API version response status 404` | With a URL-segment reader, an unsupported value commonly fails route matching and yields 404 rather than the generic unsupported-version status. |
| `Media type unsupported API version response status 406 or 415` | Media-type versioning can surface as 406 when the response representation is unacceptable or 415 when the request content type is unsupported; distinguish negotiation failure from unsupported version handling. |
| `Versioning Minimal APIs with Asp.Versioning.Http` | Use `AddApiVersioning`, `NewVersionedApi` or version sets, and endpoint conventions such as `HasApiVersion`/`MapToApiVersion`. |
| `Versioning controllers with Asp.Versioning.Mvc` | Use controller/action attributes or conventions to declare supported/implemented versions. Routes can overlap only when version metadata disambiguates endpoints. |
| `Versioned OpenAPI document grouping` | Combine API Explorer's version-specific groups with OpenAPI document registrations so each document exposes the intended version contract. |
| `Old Microsoft.AspNetCore.Mvc.Versioning package names` | Legacy package IDs/names retained in old tutorials. New projects should use the current `Asp.Versioning.*` package family and current docs. |

## Cross-item comparison

| Reader | Example contract location | Benefits | Tradeoffs |
|---|---|---|---|
| Query string | `?api-version=2.0` | Easy to add without route changes | Can be logged/cached as URL; global query conventions must be clear |
| URL segment | `/api/v2/orders` | Highly visible and linkable | Version becomes route structure; route templates and links need coordination |
| Header | `api-version: 2.0` | Keeps route stable | Less visible in browser/client tooling; proxies and caches must include header in key as appropriate |
| Media type | `Accept: application/json;v=2.0` | Version tied to representation negotiation | More complex content negotiation and documentation |

Version a logical API, not merely one route template. Two controller actions can share a route if version metadata distinguishes them; without it, ordinary routing can consider duplicate routes ambiguous. Minimal APIs use route groups and endpoint metadata instead of controller attributes. [Versioning overview](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/how-to/overview.html)

## Examples

### Minimal API version set

```csharp
builder.Services.AddApiVersioning(options =>
{
    options.ReportApiVersions = true;
});

var app = builder.Build();
var versions = app.NewApiVersionSet()
    .HasApiVersion(1.0)
    .HasApiVersion(2.0)
    .ReportApiVersions()
    .Build();

var orders = app.MapGroup("/orders").WithApiVersionSet(versions);
orders.MapGet("/", () => "v1 orders").MapToApiVersion(1.0);
orders.MapGet("/", () => "v2 orders").MapToApiVersion(2.0);
```

Use the package examples for the exact reader/configuration and extension chaining. A real endpoint should declare request/response metadata and authorization separately. [Asp.Versioning Minimal API overview](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/how-to/overview.html)

### Report supported versions

`ReportApiVersions` adds headers such as `api-supported-versions` and `api-deprecated-versions`. A deprecation header is a discovery signal, not enough by itself: publish replacement guidance, measure usage, communicate retirement, and stop advertising a version once it is no longer supported. [Version discovery](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/version-discovery.html)

## Common mistakes

- Assuming API versioning is built into ASP.NET Core rather than supplied by a package.
- Mixing old `Microsoft.AspNetCore.Mvc.Versioning` instructions with current `Asp.Versioning.*` packages.
- Adding `.AddMvc()` to a Minimal API app when MVC integration is not used.
- Assuming a missing version silently maps to the desired version; configure default behavior explicitly.
- Supporting several version readers without defining how conflicting versions are handled.
- Treating a supported/deprecated header as a migration plan or guarantee that clients noticed it.
- Assuming an unsupported version response is always the same status/body across package versions and custom error handlers.
- Assuming versioned OpenAPI grouping occurs automatically without API Explorer/document configuration.
- Using version-neutral metadata for a route whose response changes incompatibly.

## Knowledge checks with answers

1. **Is `AddApiVersioning` built into ASP.NET Core?** No; it comes from the separate `Asp.Versioning` package family.
2. **Which integration is needed for Minimal APIs?** `Asp.Versioning.Http`; controller version attributes come from the MVC integration.
3. **What do the supported/deprecated headers tell clients?** Which versions remain supported or are deprecated; they do not themselves explain how to migrate.
4. **When is `AssumeDefaultVersionWhenUnspecified` appropriate?** Only when the product deliberately supports implicit selection and documents the compatibility consequences; otherwise require explicit selection.
5. **Why add API Explorer integration?** To expose versioned descriptions/group names that can drive per-version documentation.
6. **Does version selection imply permission?** No. Authentication and authorization are independent checks.

## Sources

- [Asp.Versioning documentation](https://dotnet.github.io/aspnet-api-versioning/)
- [How to version your service](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/how-to/overview.html)
- [Configure API versioning](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/config/overview.html)
- [Requested API version](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/how-to/requested-version.html)
- [Version discovery](https://dotnet.github.io/aspnet-api-versioning/aspnet-core/version-discovery.html)

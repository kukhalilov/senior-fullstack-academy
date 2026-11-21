# ASP.NET Core endpoint routing route patterns constraints and binding — Reference: Endpoint data source, matching phases, selection, metadata, and URL generation

## Scope and version

Sources: Microsoft's [routing docs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), [LinkGenerator API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.linkgenerator?view=aspnetcore-11.0), [RoutePattern API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.routepattern?view=aspnetcore-11.0), and [route constraints API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.routing.constraints?view=aspnetcore-11.0). .NET 11 GA shipped 2026-11-10. Treat internals as implementation details and rely on documented behavior for the selected framework version.

## How this group fits the mental model

Endpoints are descriptions plus metadata; a matcher finds candidates and an endpoint selector chooses one. Endpoint execution happens later. URL generation uses endpoint addresses/metadata to construct a path and is a separate reverse operation.

## Supplied names explained

- `Endpoint routing` — ASP.NET Core routing system that matches requests to endpoint metadata and selects an endpoint before execution.
- `Endpoint` — request-handling delegate plus metadata representing one routable operation.
- `EndpointDataSource` — source exposing a collection of endpoints to routing; MVC/Minimal APIs and custom integrations can contribute sources.
- `RouteEndpoint` — endpoint associated with a parsed route pattern and order value.
- `RouteEndpointBuilder` — builder for creating a route endpoint, including route pattern, order, display name, and metadata.
- `EndpointBuilder` — base builder for endpoint request delegate and metadata before endpoint creation.
- `EndpointMetadataCollection` — immutable ordered metadata collection attached to an endpoint; consumers query metadata types to affect behavior.
- `EndpointSelector` — component selecting the best endpoint from the candidate set after matching/policy application; ambiguous best candidates fail rather than rely on accidental source order.
- `EndpointSelectorPolicy` — policy extension used during candidate selection to apply endpoint-level selection behavior.
- `MatcherPolicy` — route-matching policy extension that can influence which candidates remain eligible; prefer documented public policies over custom internals.
- `Endpoint routing matching phase` — stage that evaluates HTTP method, route pattern, constraints and policies to produce candidates; it precedes endpoint invocation and model binding.
- `Route pattern matching` — matching of URL path segments against literals, parameter parts, catch-alls, and associated policies.
- `Route candidate set` — endpoints that satisfy initial matching and have not yet been rejected by applicable policies; later selection resolves the best candidate.
- `Endpoint Order` — explicit priority value evaluated before route-template precedence; a lower `RouteEndpoint.Order` has higher priority. Use it sparingly rather than to hide ambiguous route design.
- `RouteEndpoint.Order` — `RouteEndpoint` property exposing its order value; endpoint selection prioritizes lower values before comparing route-template precedence.
- `Route precedence` — specificity ordering derived from route template structure so more specific patterns generally outrank less specific patterns; it is not simply declaration order.
- `RoutePattern` — parsed representation of a route template with segments and parts used for matching/generation.
- `RoutePatternFactory` — API for parsing/building `RoutePattern` objects from strings or parts.
- `RoutePatternParameterPart` — parsed route-template part representing a named parameter and its defaults/policies/optionality.
- `RoutePatternLiteralPart` — parsed literal text part of a route segment.
- `RoutePatternSeparatorPart` — parsed separator used by complex route segments, such as a literal period between parameter pieces.
- `RoutePatternParameterPolicyReference` — parsed reference to a route parameter policy such as constraint or transformer; actual policy resolution is separate.
- `RouteValueDictionary` — key/value collection of values extracted from route matching or used for URL generation.
- `HttpRequest.RouteValues` — request property exposing route values after routing has matched; values are typically text/object representations, not already validated business models.
- `HttpContext.GetEndpoint()` — extension that returns the endpoint selected for the current request after routing middleware has run, or null earlier/no match.
- `Endpoint.Metadata` — metadata attached to an endpoint that filters, authorization, binding, diagnostics, and link generation can inspect.
- `IDataTokensMetadata` — metadata interface exposing data tokens associated with an endpoint, commonly for compatibility with MVC routing conventions.
- `IEndpointNameMetadata` — endpoint metadata interface carrying a stable endpoint name for URL generation and endpoint discovery.
- `IEndpointRouteBuilder` — builder abstraction exposing route data sources and services for mapping endpoints.
- `IEndpointConventionBuilder` — convention builder used to attach metadata/conventions to mapped endpoints before application startup completes.
- `IEndpointRouteBuilder.DataSources` — collection of endpoint data sources contributing routable endpoints to the route builder.
- `Endpoint name` — stable endpoint identifier used by URL-generation APIs and diagnostics; names must be unique where required by the routing setup.
- `Endpoint display name` — human-readable endpoint label used in diagnostics/logging and not generally a stable public URL identifier.
- `Endpoint metadata` — typed annotations attached during mapping/conventions that influence framework behavior; metadata presence does not automatically mean an operation is performed.
- `Endpoint filter metadata` — metadata representing filters attached to endpoints, used by Minimal API endpoint filter infrastructure.
- `Route handler metadata` — metadata inferred or added for a route handler, such as parameter/response information for diagnostics or API description.
- `LinkGenerator` — DI service that generates paths/URIs from endpoint addresses and route values without requiring MVC `ActionContext`.
- `LinkGenerator.GetPathByAddress` — generates a path for an address (such as endpoint name) plus route values; returns null when no compatible path can be generated.
- `LinkGenerator.GetUriByAddress` — generates an absolute URI for an address and values using configured scheme/host/context information; validate trusted host/scheme inputs.
- `LinkGenerator.GetPathByName` — convenience generation of a path targeting a named endpoint with route values.
- `LinkGenerator.GetUriByName` — convenience generation of an absolute URI targeting a named endpoint; respect forwarded-host trust and deployment path base.
- `IUrlHelper` — MVC URL-generation abstraction associated with action context and MVC route values.
- `IUrlHelper.Action` — generates a URL for an MVC controller/action from route values and optional protocol/host/fragment.
- `IUrlHelper.RouteUrl` — generates a URL using a named MVC route and values.
- `IUrlHelper.Link` — generates an absolute URL using a route name and values.
- `IUrlHelperFactory` — creates an MVC `IUrlHelper` for an action context.
- `IUrlHelper.ActionContext` — context passed to MVC URL helpers containing routing, action, and HTTP context information.
- `SuppressLinkGenerationMetadata` — metadata that indicates endpoint should be excluded from outbound link generation while it may still be routable inbound.
- `AmbiguousMatchException` — exception raised when multiple matching endpoints remain equally best and selection cannot choose uniquely.
- `Ambiguous endpoint match` — routing failure caused by equivalent candidate endpoints; resolve with clearer patterns, HTTP methods, constraints/policies, or intentional order where supported.
- `Endpoint routing diagnostics` — logging/diagnostic events and endpoint metadata useful for identifying candidates, matches, and selection; use framework diagnostics and redact sensitive request data.
- `Route pattern parser` — parsing logic/API that transforms template text into a route pattern representation and reports malformed syntax during application setup.

## Cross-item comparison

`Endpoint Order` is compared before `Route precedence`: lower order wins first, and specificity breaks ties among matching endpoints with the same order. `MapControllerRoute` and related conventional-route mapping APIs assign order based on invocation sequence as a documented compatibility behavior. `EndpointSelector` chooses among candidates, while endpoint execution invokes the chosen delegate later. `LinkGenerator` is endpoint-address/DI based; `IUrlHelper` is MVC/action-context oriented. Inbound selection and outbound URL generation are separate.

## Examples

Give an endpoint a stable name during mapping and use `LinkGenerator.GetPathByName` to create links. Test that the target name exists, all required route values are supplied, and path base/host behavior is correct. If `GetPathByName` returns null, inspect endpoint name metadata and route values rather than assuming the inbound route is broken.

For ambiguous `/items/{value}` and `/items/{id}` endpoints with the same HTTP method and equivalent template, choose distinct path structure or a documented policy/constraint based on semantic URL requirements. Do not rely on which endpoint was registered first.

## Common mistakes

- Assuming mapping order alone determines the selected endpoint.
- Using endpoint display names as stable URL-generation names.
- Calling `GetEndpoint` before routing and expecting the final endpoint.
- Treating route metadata as an execution/authorization action by itself.
- Using untrusted forwarded host/scheme values to generate absolute URLs.
- Debugging a generated-link failure by changing inbound route constraints without checking endpoint address metadata.

## Knowledge checks with answers

1. **What is selected from a candidate set?** A matching endpoint, before its delegate/action executes.
2. **What resolves ambiguous best candidates?** Redesign patterns or selection metadata/policies; routing does not choose arbitrary source order.
3. **What does `GetPathByName` require?** A name/addressable endpoint and enough compatible route values.
4. **Can an endpoint be inbound-routable but excluded from link generation?** Yes; metadata can suppress outbound link generation.

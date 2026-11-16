# ASP.NET Core MVC controllers actions filters conventions and results — Reference: Controller types, action discovery, attributes, conventions, and application model

Sources: Microsoft's [controllers](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [actions](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/actions?view=aspnetcore-11.0), [application model](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-11.0),.

## From assemblies to actions

MVC's discovery pipeline starts from registered application parts, usually the app assembly and explicitly added feature assemblies. `ApplicationPartManager` coordinates parts and feature providers. The controller feature provider identifies eligible controller types. MVC then creates an `ApplicationModel`, invokes model providers and conventions, and derives action descriptors/endpoints. This is startup-time metadata construction; it is separate from matching one incoming URL.

By convention a controller is a public, non-abstract class that is eligible for MVC and commonly has a name ending in `Controller` (or is marked with `[Controller]`). `[NonController]` excludes a class. `ControllerBase` is the base for API controllers; `Controller` adds view-related helpers. Controller discovery does not mean every public method is an action: special method rules, `[NonAction]`, visibility, framework-supplied methods, and application-model changes affect eligibility. A controller instance is created for request processing through its activator/factory; do not put per-request mutable state into a shared static or singleton object.

## Action names, routes, and metadata

An action is an invokable MVC method. Its action name may be changed by `[ActionName]`; area and route metadata can shape endpoint identity and URL generation. `[Route]` adds route templates, while HTTP method attributes such as `[HttpGet]` and `[HttpPost]` add method metadata. `[AcceptVerbs]` and `HttpMethodAttribute` represent broader/more generic method selection. The endpoint-routing lesson explains template syntax, precedence, and constraints.

Other attributes affect binding, filters, API description, antiforgery, or endpoint metadata: `[FromServices]` obtains a parameter from DI; `[BindProperty]` and `[BindProperties]` opt properties into binding where supported; antiforgery attributes control token validation metadata; filter attributes attach filter factories; `[ApiExplorerSettings]`, `[Produces]`, `[Consumes]`, and response-type attributes influence API metadata and/or behavior. Distinguish metadata from enforcement: documentation attributes do not replace validation, authorization, or tests. `[ApiController]` applies an API-oriented application convention, including behaviors described in the Web API topic; it is not equivalent to merely adding a route attribute.

## Application model and conventions

`ApplicationModel` is a structured representation of controllers, actions, parameters, selectors, and attributes before final action descriptors are built. `IApplicationModelProvider` participates in model construction; `IApplicationModelConvention`, `IControllerModelConvention`, `IActionModelConvention`, and `IParameterModelConvention` customize progressively narrower scopes through their `Apply` methods. Use these APIs to implement consistent policy such as naming, metadata, or filters across a controller set. Avoid surprising implicit transformations; they make endpoint contracts harder to find and can interact with other providers.

Action constraints and selector metadata help choose among candidate actions after route matching. `IActionConstraintMetadata` marks metadata; an `IActionConstraint` can evaluate a candidate, and `IActionConstraintFactory` can create one. `ActionConstraintAttribute` and `ActionMethodSelectorAttribute` offer attribute-based selection hooks. `IActionHttpMethodProvider` and `IActionNameProvider` expose discovery metadata contracts. These selection mechanisms should resolve deliberate action distinctions; routing templates and endpoint conventions remain the usual way to express URL/method shape.

`IActionDescriptorCollectionProvider` exposes the current action descriptor collection and version; `IActionDescriptorChangeProvider` lets providers signal that descriptors should be rebuilt. `ControllerActionDescriptor` is the MVC-specific descriptor, while `ActionDescriptor` is the shared abstraction used by MVC infrastructure and endpoint metadata. Do not cache a descriptor forever if a dynamic provider can change the collection.

## Application parts and modular controllers

`ApplicationPart` is a discoverable feature source. `ApplicationPartAttribute`, `ApplicationPartManager.ApplicationParts`, `AddApplicationPart`, and `ConfigureApplicationPartManager` control how an app adds feature assemblies or configures providers. `IApplicationFeatureProvider<TFeature>` is a generic extension point; `ControllerFeature` holds discovered controller types and `ControllerFeatureProvider` supplies the default controller discovery behavior. Modular discovery is useful for plugin-like MVC features, but should be deterministic and constrained to trusted assemblies.

## Diagnostic sequence

When an expected endpoint is missing, inspect: (1) assembly/application-part registration; (2) controller eligibility and exclusion attributes; (3) action eligibility and action name; (4) route and HTTP-method selector metadata; (5) conventions/providers that altered models; and (6) the final action descriptor and endpoint metadata. This sequence separates “not discovered” from “discovered but not selected.”

## Complete declared API and concept inventory

The following index is the manifest's complete declared inventory for this reference. It is a coverage checklist; explanations above group related members by their role.

### Exact terms covered

- `Controller`
- `ControllerBase`
- `Controller class discovery`
- `Controller suffix convention`
- `NonControllerAttribute`
- `ApiControllerAttribute`
- `NonActionAttribute`
- `ActionNameAttribute`
- `AreaAttribute`
- `ApiExplorerSettingsAttribute`
- `ProducesAttribute`
- `ConsumesAttribute`
- `ProducesResponseTypeAttribute`
- `ProducesDefaultResponseTypeAttribute`
- `FromServicesAttribute`
- `BindPropertiesAttribute`
- `BindPropertyAttribute`
- `ValidateAntiForgeryTokenAttribute`
- `AutoValidateAntiforgeryTokenAttribute`
- `IgnoreAntiforgeryTokenAttribute`
- `ServiceFilterAttribute`
- `TypeFilterAttribute`
- `MiddlewareFilterAttribute`
- `ControllerAttribute`
- `RouteAttribute`
- `HttpMethodAttribute`
- `AcceptVerbsAttribute`
- `HttpGetAttribute`
- `HttpPostAttribute`
- `HttpPutAttribute`
- `HttpPatchAttribute`
- `HttpDeleteAttribute`
- `HttpHeadAttribute`
- `HttpOptionsAttribute`
- `Action selector`
- `Action method`
- `Action descriptor`
- `ControllerActionDescriptor`
- `ActionDescriptor`
- `IActionDescriptorCollectionProvider`
- `IActionDescriptorChangeProvider`
- `ApplicationModel`
- `IApplicationModelProvider`
- `IApplicationModelConvention`
- `IControllerModelConvention`
- `IActionModelConvention`
- `IParameterModelConvention`
- `IApplicationModelConvention.Apply`
- `IActionModelConvention.Apply`
- `IControllerModelConvention.Apply`
- `IParameterModelConvention.Apply`
- `IActionConstraint`
- `IActionConstraintMetadata`
- `IActionConstraintFactory`
- `ActionConstraintAttribute`
- `ActionMethodSelectorAttribute`
- `ActionMethodSelectorAttribute.IsValidForRequest`
- `IActionHttpMethodProvider`
- `IActionNameProvider`
- `ApplicationPart`
- `ApplicationPartManager`
- `IApplicationFeatureProvider<TFeature>`
- `ControllerFeature`
- `ControllerFeatureProvider`
- `ApplicationPartAttribute`
- `ApplicationPartManager.ApplicationParts`
- `AddApplicationPart`
- `ConfigureApplicationPartManager`
- `Action discovery convention`
- `Controller feature provider`
## Scope and version
Targets ASP.NET Core 11 MVC discovery and application-model APIs. Route-template matching is covered in t02-004.

## How this group fits the mental model
The inventory here describes how MVC creates and modifies action metadata before a request selects an endpoint.

## Supplied names explained
The paragraphs above group and explain all declared names: controller types and exclusions; action and HTTP metadata; binding/filter/antiforgery/API-description attributes; descriptors; model providers/conventions; selection constraints; and application-part discovery.

## Cross-item comparison
`ControllerBase` is API-oriented; `Controller` adds views. `ActionDescriptor` is generic metadata; `ControllerActionDescriptor` adds MVC details. Local attributes are visible at declaration sites; conventions apply repeatable rules at model construction.

## Examples
To add controllers from a feature assembly, ensure its application part is registered, then inspect the discovered action descriptor and endpoint metadata. For an opt-out helper method use `[NonAction]`; for an ineligible helper type use `[NonController]`.

## Common mistakes
Do not assume all public methods are actions; do not confuse descriptor metadata with routing selection; do not add dynamic parts without considering descriptor invalidation; do not use constraints as domain validation.

## Knowledge checks with answers
1. **Where is a controller candidate discovered?** Through application parts and feature providers.
2. **What edits action models?** Providers and conventions, before descriptors/endpoints are produced.
3. **Does an action descriptor prove a request can select it?** No; route/method/constraint selection still applies.


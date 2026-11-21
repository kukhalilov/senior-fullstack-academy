# ASP.NET Core MVC controllers actions filters conventions and results — Reference: MVC service registration, options, global filters, and conventions

Sources: Microsoft's [controller services and configuration](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0), [application model](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-11.0), [Web API behavior](https://learn.microsoft.com/en-us/aspnet/core/web-api/?view=aspnetcore-11.0), and [ASP.NET Core 11 MVC compatibility API removal](https://learn.microsoft.com/en-us/aspnet/core/breaking-changes/11/mvc-compatibility-options-removed?view=aspnetcore-11.0).

## Registration shapes

`AddControllers` registers services for API controllers without the full view/Razor Pages surface. `AddControllersWithViews` adds controller and view services; `AddMvc` is the broader MVC registration. `AddMvcCore` is a lower-level, intentionally minimal starting point: applications must add needed features explicitly. They are not interchangeable shorthand. Choose the registration matching endpoints and rendering features the application uses. `AddControllersAsServices` makes controller activation go through DI registrations; lifetimes then matter and controllers should not be singleton objects holding request state.

`AddMvcOptions` and options configuration customize `MvcOptions`. `IConfigureOptions<MvcOptions>` applies configuration; `IPostConfigureOptions<MvcOptions>` applies a later adjustment after regular configuration. Keep configuration deterministic and avoid hidden environment-specific divergence. `MvcOptions.Filters` and `.Conventions` provide global filter and model-convention hooks. Formatters, model binder providers, metadata providers, and model-binding messages/limits also live in options. A global change may affect every controller, so test representative endpoint families.

## Behavior-sensitive options

`RespectBrowserAcceptHeader` changes how browser-style Accept headers participate in negotiation. `ReturnHttpNotAcceptable` can make unsupported requested representations produce 406 instead of a fallback. `SuppressAsyncSuffixInActionNames` controls action-name treatment of async method suffixes. `EnableEndpointRouting` remains a compatibility option whose default is true; modern applications should use endpoint routing and avoid reviving legacy routing patterns without a specific migration need. ASP.NET Core 11 removes `CompatibilityVersion`, `SetCompatibilityVersion`, and related MVC compatibility APIs; they had no runtime effect since ASP.NET Core 3.0, so remove those calls during migration rather than replacing them. `MaxModelBindingCollectionSize` is a resource guard; tune it based on expected payload sizes and service capacity. `ModelBindingMessageProvider` changes user-facing binding messages, which should be clear without exposing sensitive internals.

## Controller activation and context

`IControllerActivator` creates/releases controller instances; `DefaultControllerActivator` uses request services for constructor dependencies. `ServiceBasedControllerActivator` resolves controllers from DI when registered as services. `IControllerFactory` participates in controller creation and release; `DefaultControllerFactory` combines selection and activator behavior. Activation/disposal should follow DI scope semantics. Controllers are normally activated per request and are not thread-safe shared services. Keep them thin; delegate business rules and persistence to appropriately scoped services.

`ControllerContext` supplies MVC request-specific information: the action descriptor, `HttpContext`, route data, `ModelState`, value-provider factories, metadata provider, and controller instance. `ActionDescriptor.EndpointMetadata` links MVC's action description with endpoint metadata. Avoid storing the context beyond the request or assuming a test-created context has all production services. The registered action-result executors and MVC infrastructure services are part of the MVC service graph; replacing them is an advanced extension point requiring integration tests.

## Filters and API behavior configuration

Application-level filters belong in MVC filter options or filter-provider configuration; they differ from middleware that wraps the whole application pipeline. `IFilterProvider` and `DefaultFilterProvider` participate in constructing applicable filters. Ordering among filter providers and filter stages should not be confused with HTTP endpoint ordering. An authorization filter's place in the MVC filter sequence does not make it equivalent to authorization middleware or endpoint authorization policies.

The `[ApiController]` application convention is configurable through `ApiBehaviorOptions`. `SuppressModelStateInvalidFilter` disables the automatic invalid-model-state response; if disabled, the action must handle `ModelState` intentionally. `InvalidModelStateResponseFactory` customizes that automatic response. `ClientErrorMapping` maps client error statuses to metadata such as links/titles; `SuppressMapClientErrors` disables that mapping behavior. `SuppressConsumesConstraintForFormFileParameters` controls inferred consumes constraints in applicable API-controller scenarios. `SuppressInferBindingSourcesForParameters` disables binding-source inference, making explicit sources necessary in affected cases. These switches change observable API behavior; document them and cover them with integration tests.

## Practical configuration example

```csharp
builder.Services.AddControllers(options =>
{
    options.ReturnHttpNotAcceptable = true;
    options.Filters.Add<AuditActionFilter>();
    options.Conventions.Add(new ConsistentApiConvention());
});
builder.Services.AddScoped<AuditActionFilter>();
```

An option's API being available does not mean the sample is universally right: global auditing can be expensive, async-aware filter behavior matters, and authentication/audit guarantees often belong in established middleware or infrastructure. Keep conventions and filters narrowly scoped where possible.

## Complete declared API and concept inventory

The following index is the manifest's complete declared inventory for this reference. It is a coverage checklist; registration and lifetime consequences are explained above.

### Exact terms covered

- `AddControllers`
- `AddControllersWithViews`
- `AddMvc`
- `AddMvcCore`
- `AddControllersAsServices`
- `AddMvcOptions`
- `MvcOptions`
- `MvcOptions.Filters`
- `MvcOptions.Conventions`
- `MvcOptions.InputFormatters`
- `MvcOptions.OutputFormatters`
- `MvcOptions.ModelBinderProviders`
- `MvcOptions.ModelMetadataDetailsProviders`
- `MvcOptions.RespectBrowserAcceptHeader`
- `MvcOptions.ReturnHttpNotAcceptable`
- `MvcOptions.SuppressAsyncSuffixInActionNames`
- `MvcOptions.EnableEndpointRouting`
- `MvcOptions.Filters.Add`
- `MvcOptions.Conventions.Add`
- `MvcOptions.ModelBindingMessageProvider`
- `MvcOptions.MaxModelBindingCollectionSize`
- `IConfigureOptions<MvcOptions>`
- `IPostConfigureOptions<MvcOptions>`
- `IControllerActivator`
- `DefaultControllerActivator`
- `ServiceBasedControllerActivator`
- `IControllerFactory`
- `DefaultControllerFactory`
- `ControllerContext`
- `ControllerContext.ActionDescriptor`
- `ControllerContext.HttpContext`
- `ControllerContext.RouteData`
- `ControllerContext.ModelState`
- `ControllerContext.ValueProviderFactories`
- `ControllerContext.ModelMetadataProvider`
- `ControllerContext.Controller`
- `ControllerContext.ActionDescriptor.EndpointMetadata`
- `Controller action result executor registration`
- `Controller as DI service`
- `Controller activation and disposal`
- `Controller thread safety`
- `Controller instance per request`
- `Application-level filter registration`
- `FilterProvider`
- `IFilterProvider`
- `DefaultFilterProvider`
- `IAsyncAuthorizationFilter ordering`
- `ApiController application convention`
- `ApiBehaviorOptions`
- `ApiBehaviorOptions.SuppressModelStateInvalidFilter`
- `ApiBehaviorOptions.InvalidModelStateResponseFactory`
- `ApiBehaviorOptions.ClientErrorMapping`
- `ApiBehaviorOptions.SuppressMapClientErrors`
- `ApiBehaviorOptions.SuppressConsumesConstraintForFormFileParameters`
- `ApiBehaviorOptions.SuppressInferBindingSourcesForParameters`
## Scope and version
Targets ASP.NET Core 11 MVC service registration and options; confirm migration-specific behavior for older applications.

## How this group fits the mental model
Registration creates the MVC infrastructure used for discovery, activation, filter construction, binding, and result execution; options/conventions tune those stages.

## Supplied names explained
The preceding sections explain every declared registration method, options member, configuration interface, activator/factory/context, filter provider, API behavior option, and lifetime/convention concern.

## Cross-item comparison
`AddControllers` is suited to API controllers; `AddControllersWithViews` includes views; `AddMvcCore` is low-level. `DefaultControllerActivator` uses request services; service-based activation resolves registered controller services and therefore respects their configured lifetimes.

## Examples
Register a global filter only when it genuinely applies to all MVC actions; add an application-model convention for a uniform rule; configure `InvalidModelStateResponseFactory` when the automatic API error envelope needs customization.

## Common mistakes
Do not assume registration methods are equivalent, make controllers singleton, set `EnableEndpointRouting` to an obsolete mode casually, or turn off automatic model-state responses without owning replacement behavior.

## Knowledge checks with answers
1. **Where do global MVC filters belong?** In MVC filter options/provider configuration.
2. **How is automatic API 400 customized?** Through the configured invalid-model-state response factory and API behavior options.
3. **Why test conventions?** They alter many generated action descriptors and endpoint metadata at once.

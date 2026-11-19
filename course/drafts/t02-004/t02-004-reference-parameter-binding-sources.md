# ASP.NET Core endpoint routing route patterns constraints and binding — Reference: MVC model binding sources, attributes, value providers, and binding results

## Scope and version

Sources: Microsoft's [MVC model binding guide](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-11.0), [routing guide](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing?view=aspnetcore-11.0), and [.NET 11 model-binding API reference](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/model-binding?view=aspnetcore-11.0). This lesson covers MVC/controller binding; Minimal API source inference is covered separately. Body formatters, validation, and API error policy are related but distinct concerns.

## How this group fits the mental model

After routing selects a controller action, MVC model binding reads request sources and converts values to action/property/constructor types. Binding results and errors are stored in ModelState; validation and response policy determine what happens next.

## Supplied names explained

- `Model binding` — process that obtains values from request sources and converts them into action parameters or model properties.
- `ModelBinder` — general term for an MVC component that performs binding; it is not one specific public attribute/type named `ModelBinder`. `ModelBinderAttribute` selects a binder and/or model name for a parameter or property.
- `IModelBinder` — custom binder contract that reads a `ModelBindingContext` and reports a successful or failed binding result.
- `IModelBinderProvider` — provider that selects an `IModelBinder` for model metadata and binder context.
- `ModelMetadata` — description of a model/parameter/property type and its binding, validation, display, and nullability characteristics.
- `ModelBindingContext` — per-binding-operation context containing model metadata, value providers, ModelState, model name, and result state.
- `ModelStateDictionary` — stores attempted values and binding/validation errors for request models.
- `ModelStateEntry` — per-key ModelState record holding raw/attempted values, validation state, and errors.
- `ModelError` — error information recorded when binding or validation cannot accept a value.
- `IValueProvider` — abstraction that supplies request values for model names/keys.
- `IValueProviderFactory` — creates value providers for a request, for example from route, query, form, or headers.
- `RouteValueProvider` — value provider exposing route values to MVC binding.
- `QueryStringValueProvider` — value provider exposing query-string values.
- `FormValueProvider` — value provider exposing parsed form fields.
- `JQueryFormValueProvider` — compatibility provider that handles jQuery-style form key naming/index conventions for collection/complex binding.
- `HeaderValueProvider` — framework implementation detail used for `[FromHeader]` binding in MVC, not a public reusable value-provider API; application code should use `[FromHeader]` or implement/register its own provider when adding a custom source.
- `BindingSource` — metadata describing where a parameter/model can be supplied from, such as path, query, body, form, header, services, or custom.
- `BindingSource.Path` — source metadata for route/path values; route matching has already selected an endpoint before typed conversion.
- `BindingSource.Query` — source metadata for query-string values.
- `BindingSource.Header` — source metadata for HTTP request headers.
- `BindingSource.Form` — source metadata for parsed form fields/files.
- `BindingSource.Body` — source metadata for request body input formatting; body binding consumes the request body and should generally have one owner.
- `BindingSource.Services` — source metadata for resolving a parameter from dependency injection rather than request data.
- `BindingSource.Custom` — source metadata used by custom binding systems/providers.
- `FromRouteAttribute` — explicitly binds a parameter/property from route values and can specify a route key name.
- `FromQueryAttribute` — explicitly binds from the query string and can specify the query key.
- `FromHeaderAttribute` — explicitly binds from a request header and can specify the header name.
- `FromFormAttribute` — explicitly binds from form fields/files; form uploads need correct multipart encoding and security limits.
- `FromBodyAttribute` — directs a parameter to an input formatter reading the request body; avoid multiple body-bound parameters.
- `FromServicesAttribute` — explicitly resolves the parameter from DI rather than request values.
- `BindAttribute` — limits/renames properties participating in model binding, mainly for form/value-provider scenarios; it is not a substitute for DTO design or authorization.
- `BindNeverAttribute` — excludes a property/model from model binding, preventing request values from setting it through that binder path.
- `BindRequiredAttribute` — adds a binding requirement for a value-provider-bound property; it is not a general business validation attribute.
- `ModelBinderAttribute` — selects a binder/type and/or model name for a parameter/property.
- `ModelNameAttribute` — supplies the external model key/name used during binding when it differs from the CLR member name.
- `PrefixContainer` — helper representing available model-name prefixes for matching complex binding keys.
- `Complex type model binding` — recursively binds object properties from value providers using prefixes/property names; absent fields may leave defaults and must not be mistaken for trusted values.
- `Simple type model binding` — converts a single value-provider value to a simple CLR type using supported binders/culture rules.
- `Collection model binding` — binds repeated/indexed values to collection elements; index conventions and maximum collection sizes matter.
- `Dictionary model binding` — binds keyed entries into dictionary keys/values from request field-name conventions.
- `Record type model binding` — supports constructor-based binding for record types using constructor parameter metadata and property naming rules.
- `Constructor parameter model binding` — supplies values to model constructors when the binding system supports that model shape; constructor/property metadata must align.
- `TryUpdateModelAsync` — asynchronously updates a model instance from value providers, applying prefixes/property filters and returning whether binding/validation succeeded.
- `TryUpdateModelAsync<TModel>` — generic typed overload family for updating an existing `TModel`; constrain allowed properties to avoid overposting.
- `IModelNameProvider` — metadata interface that exposes a model name used by binding/discovery conventions.
- `IPropertyFilterProvider` — metadata interface that supplies a property filter controlling which model properties are eligible for binding.
- `IModelNameProvider.Name` — property on `IModelNameProvider` containing the binding/model name.
- `Empty prefix` — fallback binding prefix when the expected model-name prefix is absent; it can affect whether property keys bind and should be covered by tests.
- `Model binding prefix` — key prefix used to associate request fields with a complex parameter/property, often from parameter/property name or explicit model name.
- `Value provider precedence` — ordering used when multiple providers can supply a value. Explicit source attributes reduce ambiguity; do not rely on hidden precedence when keys collide.
- `Request body input formatter` — MVC component that deserializes the request body into a model, typically selected using content type.
- `InputFormatter` — base abstraction for reading/deserializing a request body into a model and reporting formatter errors.
- `IInputFormatter` — contract for checking content-type support and reading the request body into a model.
- `SystemTextJsonInputFormatter` — MVC input formatter that uses System.Text.Json for JSON request bodies according to configured serializer options.
- `BindingContext.Result` — binding result slot on the model-binding context indicating success/failure and possibly the bound model.
- `ModelBindingResult.Success` — factory/member pattern indicating a successful binding with a model value, including cases where the value may be null depending on binder semantics.
- `ModelBindingResult.Failed` — result indicating the binder could not bind a value; failure differs from a successful binding of a default/null value.
- `ModelState.IsValid` — indicates whether ModelState contains binding/validation errors; application/controller policy decides the response when false.
- `ModelState validation error` — error recorded for invalid bound input or validation failure; it can include attempted values, so avoid reflecting sensitive input in logs/responses.

## Cross-item comparison

`FromRouteAttribute`, `FromQueryAttribute`, `FromHeaderAttribute`, and `FromFormAttribute` select value providers; `FromBodyAttribute` invokes an input formatter; `FromServicesAttribute` resolves a DI service. `BindingSource` describes source metadata, while `IModelBinder` performs conversion. `ModelBindingResult.Failed` differs from `ModelBindingResult.Success(null)`. `BindRequiredAttribute` concerns source binding, while validation rules check acceptable values.

## Examples

```csharp
public sealed record SearchRequest(string Term, int Page);

[HttpGet("search")]
public IActionResult Search([FromQuery] SearchRequest request)
{
    if (!ModelState.IsValid)
    {
        return BadRequest(ModelState);
    }

    return Ok(new { request.Term, request.Page });
}
```

This demonstrates query-source intent; actual record binding behavior, missing values, validation, and automatic response conventions depend on configured MVC/API behavior. Use a request DTO and allowlist fields rather than binding a database entity directly.

## Common mistakes

- Binding persistence entities directly and allowing overposting of fields the caller should not control.
- Using `BindRequiredAttribute` as a replacement for semantic validation.
- Binding two parameters from a body or expecting a body formatter to bind a form.
- Assuming missing values and invalid conversions produce the same ModelState state.
- Trusting client-provided route/query IDs as authorization.
- Returning raw attempted values/errors that expose passwords, tokens, or personal data.

## Knowledge checks with answers

1. **Which component converts a source value?** An MVC model binder; an input formatter handles body deserialization.
2. **What does `FromServicesAttribute` mean?** Resolve the parameter from DI, not from HTTP input.
3. **Why use a DTO rather than an entity?** It limits the externally bindable shape and reduces overposting risk.
4. **Does `ModelState.IsValid` prove authorization?** No; it reports binding/validation status, not access permission.

# ASP.NET Core MVC controllers actions filters conventions and results — Exercises and worked solutions

Sources: Microsoft's [controllers and actions](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0), [application model](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-11.0), and [action return types](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-11.0).

## Exercise 1 — Why does the controller not appear?

An endpoint in `BillingController` is missing after the team moved it into `Billing.Endpoints.dll`. The class is public, derives from `ControllerBase`, and its method has `[HttpGet("invoices")]`. Diagnose in order.

### Worked solution

1. Check the assembly is available and added as an application part through the MVC application-part manager. A type in an unregistered feature assembly may not be discovered.
2. Check the type is eligible: not abstract, not excluded by `[NonController]`, and recognized as a controller (conventional name or `[Controller]`).
3. Check the method is public and not marked `[NonAction]`; inspect custom action-discovery conventions and application-model providers.
4. Inspect the built action descriptor and endpoint metadata. If present, the failure is endpoint selection, not discovery: check route prefix, method, constraints, and ambiguity.
5. Add an integration test that requests the route and a metadata-level test if the app has custom discovery. Avoid adding a second route until the discovery cause is known.

## Exercise 2 — Place cross-cutting code at the right boundary

The requirement is: (a) attach a correlation ID to every request, including Minimal APIs and static files; (b) cache the result of one expensive MVC report before model binding; (c) measure action execution; (d) normalize errors from controllers, minimal endpoints, and middleware.

### Worked solution

- Put (a) in middleware, since it must cover all request types and early failures.
- Consider a resource filter for (b) only if the cache key is trustworthy and the cache response can be produced before binding. A middleware cache may be better if it is endpoint-agnostic. Ensure authorization and cache partitioning prevent data leakage; a resource filter's position relative to authorization and binding must be considered.
- Use an async action filter for (c) if the metric specifically concerns MVC action invocation; otherwise use middleware for end-to-end request latency. Do not synchronously block.
- Use exception-handling middleware for (d), then map known exceptions to stable Problem Details. MVC exception filters do not catch failures before MVC or all result/middleware execution failures.

## Exercise 3 — Return the correct API result

Implement `GET /api/products/{id}` where success returns a `ProductDto`, missing product returns 404, and invalid identifier format should not invoke the action. Explain the result type and tests.

### Worked solution

```csharp
[ApiController]
[Route("api/products")]
public sealed class ProductsController(IProductService products) : ControllerBase
{
    [HttpGet("{id:int}")]
    [ProducesResponseType<ProductDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductDto>> Get(int id, CancellationToken cancellationToken)
    {
        var product = await products.FindAsync(id, cancellationToken);
        return product is null ? NotFound() : product;
    }
}
```

`ActionResult<ProductDto>` expresses the typed success value plus an alternate MVC result. The route constraint makes a non-integer segment fail endpoint matching rather than reach this action; that commonly yields 404, while a valid integer for an absent product takes the explicit 404 branch. Tests should cover both cases, the 200 JSON body/content type, and OpenAPI metadata. The API annotations describe intended responses; they do not enforce the action branches.

## Exercise 4 — Filter order and short-circuiting

A controller-scoped action filter logs “before” and “after.” A global action filter sets a cached result without calling its continuation. Which code runs? What changes if the cache is a resource filter?

### Worked solution

The global short-circuit prevents the action and filters nested inside it from executing. Whether the controller filter's callbacks run depends on actual scope/order nesting and on the particular sync/async implementation's short-circuit contract; do not guess from registration order—write a focused pipeline test. A resource filter can short-circuit earlier, before model binding and action filters, which can save binding work. It still runs inside MVC and should not be mistaken for middleware. Cache keys and authorization partitioning must be designed to prevent cross-user data exposure.

## Exercise 5 — Content negotiation and 406

An endpoint returns an object through `Ok(value)`. A client sends `Accept: application/x-unknown`. Explain what determines the response and how to make behavior explicit.

### Worked solution

`Ok(value)` produces an object result, which MVC executes using output formatter selection. The registered formatters, request `Accept`, result content types, and `MvcOptions.RespectBrowserAcceptHeader`/`ReturnHttpNotAcceptable` influence the outcome. If the API must reject unsupported representations, configure `ReturnHttpNotAcceptable` and add an integration test that checks 406, headers, and body. If the API contract is JSON-only, make that contract explicit, register only intended formatters, and verify the actual response. `[Produces]` or response metadata alone does not guarantee a formatter can serialize every runtime value.

## Exercise 6 — Is this filter safe to reuse?

An engineer marks a `TypeFilterAttribute` reusable. Its filter constructor captures an `IHttpContextAccessor` and stores the current user's ID in a field. Identify the problem and fix.

### Worked solution

Reusability is only a hint and does not make mutable request state safe. If MVC reuses the filter instance, simultaneous requests can observe stale or cross-user state. Keep the filter stateless and read request-scoped data from the current context during each invocation; preferably inject a correctly scoped service or pass request data through the action/filter context. Do not retain `HttpContext`, scoped services, or user data after invocation. Add concurrent integration coverage if the filter has mutable behavior.

## Exercise 7 — API controller automatic 400 behavior

An action's breakpoint is not hit when a required request value is missing. The controller has `[ApiController]`. Explain the behavior and design options.

### Worked solution

`[ApiController]` enables automatic invalid-model-state responses by default in the standard configuration. Binding/validation can produce an invalid `ModelState`, and the API behavior filter returns a client error before action invocation. Inspect the response and validation errors. Keep the automatic behavior when it matches the API contract; customize `InvalidModelStateResponseFactory` for a consistent error envelope. If `SuppressModelStateInvalidFilter` is set, the action becomes responsible for handling invalid state. Do not disable the behavior merely to make a breakpoint hit; test invalid and valid requests.

## Exercise 8 — Design a controller convention

The API team wants every controller in `Admin` to have a stable `admin` route prefix and a documented authorization metadata policy. Should this be a custom application-model convention or copied attributes?

### Worked solution

If the rule is truly uniform and belongs to a coherent controller set, an application-model convention can avoid drift. Ensure it selects controllers narrowly, composes predictably with explicit routes/attributes, and adds the intended metadata rather than pretending to authorize by naming alone. Authorization still needs a policy/requirement enforced by the authorization system. Add tests that enumerate endpoint metadata for both included and excluded controllers. If only a few endpoints differ, explicit attributes are easier to understand than a global convention.
## Goals
Practice separating discovery, routing, binding, MVC filters, result execution, and API metadata. For each scenario, state the stage, evidence, and regression test.

## Worked example
If an action returns an object but the client sees an unexpected media type, inspect the result class, formatter registrations, Accept header, content type metadata, and relevant MVC options; then verify with an HTTP-level test.

## Exercises
Complete the eight scenarios below: missing endpoint, boundary choice, typed result, short-circuit, negotiation, reusable filter, automatic 400, and convention design.

## Progressive hints
First identify the pipeline stage. Then name the descriptor/context/result responsible. Finally ask what an integration test must observe at the HTTP boundary.

## Complete solutions
The complete reasoning and implementation for each exercise follow under its own worked-solution heading. Prefer the narrowest mechanism that meets the requirement and test its boundary behavior.

## Tests and edge cases
Cover missing and malformed inputs, 404 versus 400 contracts, short-circuit nesting, async exceptions, formatter mismatch/406, concurrent request safety, response metadata, redirects, file ranges, and output headers.

## Reflection questions
Which behavior belongs in middleware rather than an MVC filter? What API contract is implicit in the return type? How could a convention change endpoints unexpectedly? Which HTTP-level test would catch that?

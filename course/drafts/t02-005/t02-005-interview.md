# ASP.NET Core MVC controllers actions filters conventions and results — Interview questions and reasoning

Sources: Microsoft's [controllers and actions](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/?view=aspnetcore-11.0), [filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-11.0), [application model](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/application-model?view=aspnetcore-11.0), and [action return types](https://learn.microsoft.com/en-us/aspnet/core/web-api/action-return-types?view=aspnetcore-11.0).

## 1. Walk through a controller request from startup to response.

**Strong answer:** MVC discovers controllers from application parts, builds application/action/parameter models, applies providers and conventions, and exposes action descriptors and endpoint metadata. Routing selects an endpoint; MVC binds and validates inputs, runs applicable filters, invokes the action, then executes its action result through a result executor/formatter to produce status, headers, and body. Distinguish endpoint selection, model binding, action execution, and response serialization.

## 2. How do `Controller`, `ControllerBase`, and `[ApiController]` differ?

**Strong answer:** `ControllerBase` supplies controller/API helpers without view support; `Controller` adds view-related functionality. `[ApiController]` marks API-oriented behavior/conventions such as binding inference, API metadata conventions, and automatic invalid-model-state responses under standard configuration. It does not itself implement authentication, domain validation, or a guarantee that every response is JSON.

## 3. When would you return a concrete DTO, `IActionResult`, or `ActionResult<T>`?

**Strong answer:** Use a concrete DTO when the return contract is a single shape and status handling is elsewhere; `IActionResult` when several result types are chosen; `ActionResult<T>` when the API has a primary typed response and alternate status results. Explain that result execution happens later, and test the HTTP response because a unit test of a returned object does not exercise formatting.

## 4. Explain MVC filter order and compare filters with middleware.

**Strong answer:** Filters execute inside MVC after endpoint selection. Authorization is first; resource filters can wrap model binding; action filters wrap the action; exception filters handle a narrow MVC exception boundary; result filters wrap result execution, with always-run variants for certain short-circuit paths. Middleware wraps broader pipeline stages and can cover Minimal APIs and pre-MVC failures. Choose based on scope and available context, not familiarity.

## 5. How do filter scope and `Order` interact? What should be tested?

**Strong answer:** Global, controller, and action scopes contribute nesting/order; `IOrderedFilter.Order` provides explicit ordering. Short-circuiting prevents inner work. Do not infer execution solely from source declaration order. Use a focused test to assert before/after nesting, behavior on short-circuit, and exception paths.

## 6. Compare `ServiceFilterAttribute` and `TypeFilterAttribute`.

**Strong answer:** Service filter resolves an already registered filter from DI. Type filter specifies an implementation type, creates it through a factory, and resolves constructor dependencies; optional arguments can be supplied. Reuse flags are hints, and neither pattern makes request-specific mutable state safe. Prefer stateless filters and correct dependency lifetimes.

## 7. Which failures can an MVC exception filter catch?

**Strong answer:** It handles exceptions in the MVC action/result-creation region subject to filter execution boundaries. It will not catch earlier middleware failures and is not universal for exceptions during all response writing or outside MVC. Use exception-handling middleware for consistent application-wide handling; filters are useful for MVC-specific behavior.

## 8. What does content negotiation depend on?

**Strong answer:** For object results, formatter capability and registration, Accept headers, result content types/declared type, metadata, and MVC options all matter. `JsonResult` differs from a general negotiated `ObjectResult`. `ReturnHttpNotAcceptable` affects unsupported Accept behavior. Verify with HTTP integration tests including status, headers, and serialized payload.

## 9. How would you diagnose a missing controller endpoint?

**Strong answer:** Verify the assembly is an application part; controller eligibility and exclusions; action visibility/`NonAction`/name; route and HTTP method metadata; custom providers/conventions; then inspect action descriptors and endpoint metadata. If the endpoint exists, investigate routing selection rather than discovery. Add a regression test at the correct layer.

## 10. What are application-model conventions good for, and what risks do they introduce?

**Strong answer:** They implement consistent transformations across controllers/actions/parameters, such as metadata or route conventions. They amplify both intended policy and mistakes, can obscure local contracts, and can conflict with explicit metadata. Keep them deterministic and narrow; test final descriptors/endpoints and retain explicit authorization enforcement.

## 11. Why is a controller generally not a singleton service?

**Strong answer:** Controller instances hold request context and are designed for request processing. A singleton can be concurrently accessed, capture scoped services incorrectly, leak request data, or retain `HttpContext`. Keep controllers transient/per-request and thin; put reusable logic into services with deliberate lifetimes.

## 12. A request returns 400 before the action breakpoint. What do you inspect?

**Strong answer:** Check binding and validation, `[ApiController]` automatic invalid-model-state behavior, inferred binding sources, custom filters, and the configured `InvalidModelStateResponseFactory`. Inspect the actual response. Do not confuse route mismatch (often 404) with invalid bound input (typically a client error) or domain-rule failure.

## 13. How should an API express creation and asynchronous acceptance?

**Strong answer:** A completed create commonly returns 201 with a representation and, where useful, a location (`CreatedAtAction`/route). Work accepted for later completion commonly returns 202 and a way to inspect operation status. Choose semantics that reflect resource state, not convenience; document and integration-test status, headers, and payload.

## 14. What makes a file result safe and scalable?

**Strong answer:** Avoid buffering large files into byte arrays when streaming is appropriate, manage stream lifetime, restrict physical paths, authorize access, set content type/download name, and deliberately enable range/conditional behavior. Test large-file, range, and authorization cases.

## 15. How would you make interview answers precise?

**Strong answer:** State the pipeline stage first, name the contract/interface, then describe what it can and cannot observe, and finish with a concrete test or tradeoff. For example, “a resource filter can short-circuit before model binding, but it is MVC-specific; middleware is broader, so I would choose based on whether Minimal APIs and static requests must also be covered.”
## Core questions
The fifteen prompts below cover pipeline walkthrough, controller types, result contracts, filters, registration, discovery, status choices, and file delivery.

## Concise interview answers
Lead with the boundary: discovery is startup metadata; routing selects; MVC binds and filters; action returns a description; result execution writes the response.

## Deep follow-up answers
Explain exact behavior for ordering, short circuits, formatter selection, API behavior options, and exception boundaries. State when behavior is configuration-sensitive.

## Scenario questions
Use the missing endpoint, invalid model state, unsupported Accept, filter cache, and file delivery scenarios below to demonstrate diagnosis rather than memorized names.

## Tradeoffs and alternatives
Compare middleware and filters by scope; concrete DTO, `IActionResult`, and `ActionResult<T>` by response variability; local attributes and conventions by consistency versus discoverability.

## Common weak answers
Avoid claims that declaration order always controls filters, `[ApiController]` authenticates requests, `Produces` forces serialization, or exception filters catch every exception.

## Self-check rubric
A strong answer names the stage and abstraction, describes its limits, accounts for configuration, and proposes an observable test. Score one point for each; revisit any answer missing a boundary or verification step.

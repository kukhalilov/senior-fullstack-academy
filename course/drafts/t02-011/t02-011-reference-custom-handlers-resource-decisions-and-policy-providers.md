# ASP.NET Core authentication principals claims roles authorization policies and handlers — Reference: Requirement handlers, resource authorization, dynamic policy providers, and evaluation diagnostics

## Scope and version

This reference covers custom requirements and handlers, resource-based imperative checks, dynamic policy providers, and evaluation results. The handler model is extensible, but security rules should remain explicit, testable, and tied to trusted data. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

## How this group fits the mental model

A requirement names a rule; one or more handlers evaluate it using the principal and possibly a resource. A handler may succeed a requirement, leave it pending so another handler can act, or explicitly fail the authorization context. `IAuthorizationService` creates the evaluation context and returns a result. Policy providers supply policies by name, statically or dynamically.

## Supplied names explained

### Requirements, handlers, and evaluation context

| Supplied name | Meaning and use |
|---|---|
| `IAuthorizationRequirement` | Marker contract for a policy requirement. A custom requirement should carry the minimal immutable data needed to express its rule. |
| `IAuthorizationHandler` | Contract for a service that evaluates authorization requirements in a context. Register handlers with a lifetime appropriate to their dependencies. |
| `IAuthorizationHandler.HandleAsync` | Invoked with an authorization context so the handler can inspect pending requirements/user/resource and record success or failure. |
| `AuthorizationHandler<TRequirement>` | Base class for handling a requirement type without a strongly typed resource parameter. |
| `AuthorizationHandler<TRequirement,TResource>` | Base class that receives a requirement and typed resource, reducing unsafe casts in resource-specific handlers. |
| `AuthorizationHandlerContext` | Mutable evaluation state containing the principal, resource, requirements, pending requirements, and success/failure state. Do not cache it beyond the evaluation. |
| `AuthorizationHandlerContext.User` | Principal being evaluated. Validate claim source/type/value according to the rule rather than assuming any claim is trusted. |
| `AuthorizationHandlerContext.Resource` | Object or endpoint resource supplied for evaluation. It may vary by hosting model; check its type and handle absent/wrong resource safely. |
| `AuthorizationHandlerContext.Requirements` | Complete set of requirements for the current policy evaluation. |
| `AuthorizationHandlerContext.PendingRequirements` | Requirements not yet marked successful. A handler should act on requirements it understands and leave unrelated ones for other handlers. |
| `AuthorizationHandlerContext.HasSucceeded` | Indicates every requirement has been satisfied and authorization has not been explicitly failed. |
| `AuthorizationHandlerContext.Fail` | Explicitly marks the context failed. It is a hard denial that prevents later success; use only when the policy decision truly must fail regardless of other handlers. |
| `AuthorizationHandlerContext.Succeed` | Marks one specific requirement successful. Succeeding one requirement does not satisfy other requirements in the policy. |
| `AuthorizationHandlerContext.Fail(AuthorizationFailureReason)` | Marks failure while attaching a structured reason for diagnostics. Do not put secrets or protected resource contents in the reason. |
| `AuthorizationFailureReason.Handler` | Identifies the handler responsible for a failure reason. It supports diagnostics, not a client-visible disclosure of internal rule details. |
| `IAuthorizationHandlerProvider` | Abstraction that supplies the handlers to run for an evaluation. |
| `IAuthorizationHandlerProvider.GetHandlersAsync` | Retrieves the handler collection for the current authorization evaluation. |
| `IAuthorizationEvaluator` | Converts the completed handler context into an authorization result/failure object. |
| `IAuthorizationEvaluator.Evaluate` | Evaluates the final state after handler execution, including pending requirements and explicit failure. |

### Authorization service and resource decisions

| Supplied name | Meaning and use |
|---|---|
| `IAuthorizationService` | High-level service for evaluating a principal against a named policy or supplied requirement(s), optionally with a resource. |
| `IAuthorizationService.AuthorizeAsync(ClaimsPrincipal,Object,String)` | Evaluates a named policy for a principal and resource. Use after loading the actual resource when the decision depends on ownership/state. |
| `IAuthorizationService.AuthorizeAsync(ClaimsPrincipal,Object,AuthorizationPolicy)` | Evaluates a concrete policy against a principal and resource. |
| `IAuthorizationService.AuthorizeAsync(ClaimsPrincipal,Object,IAuthorizationRequirement)` | Evaluates a specific requirement against the principal/resource without requiring a registered named policy. |
| `AuthorizationService` | Framework implementation that resolves the policy, creates context, invokes handlers, and evaluates the result. |
| `IAuthorizationHandlerContextFactory` | Abstraction that creates an evaluation context for the user, resource, and requirements. |
| `OperationAuthorizationRequirement` | Reusable requirement representation for a named operation such as read, update, or delete. The handler determines what each operation means for the supplied resource. |
| `OperationAuthorizationRequirement.Name` | Operation label carried by the requirement. Compare against a closed set of trusted operation names, not arbitrary request text. |
| `Resource-based authorization` | Authorization decision using a loaded application object such as a document, invoice, or file. Usually performed imperatively because endpoint attributes run before the object is loaded. |
| `Resource loaded before authorization` | Required ordering when permission depends on actual persisted owner/classification/state: load and validate the resource, then evaluate access before returning or mutating it. |
| `Imperative authorization check` | Explicit call to the authorization service in endpoint/controller/application code. Ensure every code path that exposes or changes the resource performs the check. |

### Policy providers and result diagnostics

| Supplied name | Meaning and use |
|---|---|
| `IAuthorizationPolicyProvider` | Contract for resolving a named policy and default/fallback policies. A custom provider can generate policies dynamically from validated names. |
| `IAuthorizationPolicyProvider.GetPolicyAsync` | Resolves a named authorization policy, returning no policy for unsupported names according to the provider's design. Unknown names must not silently become permissive. |
| `IAuthorizationPolicyProvider.GetDefaultPolicyAsync` | Returns the policy applied to bare authorization metadata according to the configured provider. |
| `IAuthorizationPolicyProvider.GetFallbackPolicyAsync` | Returns the fallback policy used when endpoint metadata does not otherwise produce a policy. |
| `DefaultAuthorizationPolicyProvider` | Framework provider backed by registered `AuthorizationOptions` policies, default, and fallback policy. A custom provider often delegates non-dynamic names to it. |
| `Custom policy provider` | Application implementation that can parse a constrained policy-name grammar and construct requirements at runtime. Validate syntax and values and preserve registered/default policies. |
| `IAuthorizationRequirementData` | Metadata contract that can expose requirements directly from endpoint metadata in supported framework endpoint models. Verify version/hosting support for the target app. |
| `AuthorizeAttribute requirements metadata` | Authorization metadata participates in policy construction; newer requirement-bearing metadata may also contribute requirements. It still cannot inspect an object that has not yet been loaded. |
| `Authorization handler DI registration` | Adds handler services to dependency injection, commonly through `AddSingleton`, `AddScoped`, or `AddTransient` as dependencies require. A handler using scoped data access must not be singleton. |
| `Multiple handlers for one requirement` | Handlers can cooperate on one requirement; one may succeed it while others leave it pending. A policy still requires every distinct requirement. |
| `Handler succeeds requirement` | Calls context success for a particular requirement, allowing `HasSucceeded` only when all other requirements also succeed and no hard failure occurred. |
| `Handler fails authorization context` | Records an explicit hard failure; later handlers cannot turn that evaluation into success. Prefer leaving a requirement pending for normal denial when another handler may satisfy it. |
| `Handler returns without deciding` | Leaves the requirement pending. This is not automatically a denial if another handler can handle it; final evaluation fails if requirements remain pending. |
| `InvokeHandlersAfterFailure` | `AuthorizationOptions` setting controlling whether handler invocation continues after explicit failure. Keep handlers free of order-dependent side effects either way. |
| `AuthorizationResult` | Final outcome from authorization service: success or failure, optionally with diagnostic details. |
| `AuthorizationResult.Succeeded` | Indicates that all requirements were met and authorization succeeded. |
| `AuthorizationResult.Failure` | Failure object describing the failed evaluation when authorization is unsuccessful. |
| `AuthorizationResult.FailureReasons` | Structured reasons attached by handlers for diagnostics. Do not expose internal reasoning or sensitive fields indiscriminately. |
| `AuthorizationResult.FailedRequirements` | Requirements that were not satisfied or were part of a failed evaluation, useful for tests and safe diagnostics. |
| `AuthorizationFilterContext` | MVC filter context used by authorization filters, exposing the current HTTP context and MVC action context. |
| `IAsyncAuthorizationFilter` | MVC filter contract for asynchronous authorization filter logic. Prefer policy/handler mechanisms where possible so authorization remains reusable and testable. |
| `IAuthorizationFilter` | MVC filter contract for synchronous authorization filter logic. Avoid blocking I/O or duplicating resource authorization rules here. |
| `Endpoint authorization metadata` | Metadata attached to a routed endpoint and consumed by authorization middleware to build the policy. Inspect endpoint conventions and groups when debugging effective rules. |

## Cross-item comparison

| Handler action | Meaning | Final consequence |
|---|---|---|
| Succeed a requirement | This handler's rule is satisfied | Other requirements still must pass |
| Return without decision | Leave requirement pending | Another handler may satisfy it; otherwise final evaluation fails |
| Fail context | Record an explicit hard failure | Authorization fails even if another handler later succeeds a requirement |

Use `Fail` sparingly. Most handlers should simply not succeed a requirement when their conditions are not met; the final evaluator will deny if no handler succeeds it. Use explicit failure when the handler knows a non-negotiable violation occurred.

## Examples

### Requirement handler for document ownership

```csharp
public sealed class DocumentOwnerRequirement : IAuthorizationRequirement { }

public sealed class DocumentOwnerHandler
    : AuthorizationHandler<DocumentOwnerRequirement, Document>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DocumentOwnerRequirement requirement,
        Document resource)
    {
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId is not null && resource.OwnerUserId == userId)
            context.Succeed(requirement);

        return Task.CompletedTask;
    }
}
```

The `Document` must be loaded from a trusted repository before this handler runs. The caller must not be allowed to supply the authoritative owner ID. This example is a C# 12+ class declaration; target syntax/runtime to the application's selected C# version. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

### Call the service after loading the resource

```csharp
var document = await repository.FindAsync(id);
if (document is null)
    return Results.NotFound();

var decision = await authorization.AuthorizeAsync(
    httpContext.User, document, "DocumentOwner");

if (!decision.Succeeded)
    return Results.Forbid();

return Results.Ok(document);
```

The authorization call occurs after the resource is known. For mutations, perform the check before changing state, and ensure the resource cannot change between authorization and update in a way that bypasses the policy. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

### Strictly parse a dynamic policy name

A custom provider may recognize a closed grammar such as `Permission:Invoices.Read`. It should reject empty values, unknown resource/action combinations, unexpected separators, and malformed casing according to the app's contract. Build an explicit requirement from validated components and delegate all names outside that grammar to the default provider. A missing policy must fail closed.

## Common mistakes

- Returning from every handler without succeeding and expecting an implicit permit.
- Calling `Fail` for a normal non-match when another handler may satisfy the same requirement.
- Assuming a handler's `Resource` is always one concrete type across MVC, endpoint routing, and other hosting models.
- Making a handler singleton while injecting a scoped database context.
- Loading a resource after a declarative attribute and assuming that attribute already checked ownership.
- Authorizing against a client-supplied object rather than the persisted object.
- Omitting a resource check on an alternate update/delete path.
- Letting a dynamic policy provider accept arbitrary names or return a permissive policy for unknown names.
- Logging failure reasons containing personal data or resource details.
- Assuming handler order is a stable policy language.

## Knowledge checks with answers

1. **What must be true for `HasSucceeded`?** All requirements must be marked successful and the context must not have been explicitly failed.
2. **What does leaving a requirement pending mean?** This handler did not decide it; another handler may succeed it, otherwise final authorization fails.
3. **When should a resource handler run?** After the application has loaded and validated the actual resource, before returning or changing it.
4. **Can a custom policy provider make unknown names permissive?** It could technically, but it must not; unknown policy names should fail safely or delegate to a strict default provider.
5. **What DI lifetime fits a handler that uses a scoped database context?** A scoped or transient handler compatible with the scoped dependency, not a singleton.

## Sources

- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)
- [IAuthorizationService API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authorization.iauthorizationservice)

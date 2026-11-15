# ASP.NET Core authentication principals claims roles authorization policies and handlers — Interview questions and reasoning

## Core questions

1. What is the difference between authentication and authorization?
2. What does an authentication scheme name identify?
3. Distinguish authenticate, challenge, and forbid.
4. How do default and fallback authorization policies differ?
5. How are multiple requirements in one policy combined?
6. How can two handlers cooperate on one requirement?
7. Why is resource-based authorization often imperative?
8. What are the risks of using claims and roles as the only authorization data?
9. How do authorization requirements on multiple endpoint metadata declarations combine?
10. What should a dynamic authorization policy provider validate?

## Concise interview answers

1. Authentication validates a presented credential and produces a principal. Authorization evaluates that principal against requirements for an endpoint or resource.
2. A scheme name identifies a handler and its options for a credential protocol, and can select authenticate/challenge/forbid behavior.
3. Authenticate attempts to produce a principal; challenge asks an unauthenticated caller to authenticate; forbid rejects an authenticated caller who lacks permission.
4. Default policy applies to bare authorization metadata. Fallback applies when authorization middleware processes a request with no metadata producing a policy. Fallback is not automatically added to named/default policies.
5. All distinct requirements in a policy must succeed.
6. One handler can succeed a requirement while another leaves it pending. An explicit `Fail()` is a hard failure and cannot be undone by another handler.
7. Endpoint attributes run before a resource is loaded. The app must load the object and then ask `IAuthorizationService` whether this principal may access that specific object.
8. Claims may be stale or issued by different authorities; roles may be too broad for resource-specific rules. Validate issuer/type/value and perform current resource checks for sensitive actions.
9. Endpoint metadata can combine policies, schemes, and role requirements; multiple declarations normally add requirements rather than replacing each other. A roles list in one declaration is alternatives.
10. Validate a closed grammar, known resource/action pairs, separators, casing, and unknown-name behavior. Unknown/malformed names must fail safely rather than becoming permissive.

## Deep follow-up answers

### What happens when an endpoint has a named policy and a fallback policy is configured?

The named policy is selected; fallback is not automatically combined. If every protected endpoint must require authentication, include that baseline requirement in each named policy or compose policies through a deliberate shared convention. Test bare metadata, named policies, explicit policy objects, roles, schemes, anonymous metadata, and route groups because policy construction combines several metadata forms. Static files served before authorization middleware are not protected by fallback policy. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

### Why is a resource ID in the route insufficient for ownership authorization?

The route ID identifies which resource the caller asks for; it does not prove ownership. Load the authoritative resource from trusted storage, then compare its owner/tenant/classification with claims from a trusted principal or another policy source. Perform the check before returning data or mutating state. Consider concurrency so authorization is not invalidated between check and write. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

### What is the difference between a handler leaving a requirement pending and calling `Fail()`?

Leaving it pending means this handler did not decide; another handler may satisfy it. If it remains pending after all handlers run, authorization fails. Calling `Fail()` records an explicit non-negotiable failure. Whether handlers continue after explicit failure depends on `InvokeHandlersAfterFailure`, but later `Succeed` calls cannot erase the failure. Use pending for ordinary non-matches and hard failure only when the rule demands it.

### Can `ClaimsPrincipal.IsInRole` prove the user currently has a role in the database?

No. It checks role claims on the principal using each identity's configured role-claim type. The principal may be a snapshot from a cookie/token that predates a role change. Use claim/role data for suitable coarse decisions and revalidate or query current authorization state when freshness is required.

### Does `AllowAnonymous` prevent authentication from running?

No. It tells authorization middleware not to enforce authorization failure for the endpoint. Authentication may already have run and populated `HttpContext.User`, so a public route can still personalize content for a signed-in caller.

## Scenario questions

### Scenario 1: API routes redirect to an HTML login page

**Reasoning:** Inspect `DefaultChallengeScheme` and endpoint policy scheme selection. An API endpoint should challenge with the bearer scheme or produce the API's intended 401 contract, not blindly use the cookie/OIDC interactive redirect scheme. Keep browser routes' redirect behavior where appropriate.

### Scenario 2: a file download is protected with a fallback policy but users can still fetch it anonymously

**Reasoning:** Determine whether static-file middleware serves the file before `UseAuthorization`. If so, that response does not pass through endpoint authorization. Move sensitive files behind an authorization-aware endpoint or storage mechanism and ensure public assets are intentionally public.

### Scenario 3: deleting a user's role does not immediately stop access

**Reasoning:** The cookie/JWT principal may contain a role snapshot. Set an acceptable freshness/revocation window using security-stamp validation or short lifetimes, and perform current resource/policy checks for high-impact actions. Decide the latency versus store-load/user-experience tradeoff.

### Scenario 4: a document handler denies everyone, even document owners

**Reasoning:** Verify that authorization is invoked with the actual loaded `Document`, not a different endpoint resource such as routing metadata. Confirm the principal has the expected stable user identifier claim and that the handler is registered. Check whether a separate requirement is still pending or the context was explicitly failed by another handler.

## Tradeoffs and alternatives

| Approach | Strength | Limitation |
|---|---|---|
| Roles | Simple broad grouping and familiar policy syntax | Can become coarse/stale and do not inherently express ownership |
| Claims | Flexible facts/permissions from trusted authorities | Issuer, mapping, freshness, and claim proliferation must be managed |
| Named policies | Central, testable reusable endpoint rules | Named policies must include all intended baseline requirements |
| Fallback policy | Default-protects middleware-covered endpoints without explicit policy metadata | Does not combine with named policy or protect earlier middleware responses |
| Custom requirement/handler | Encapsulates a meaningful rule and can use injected services/resources | Requires careful DI lifetime, tests, and failure-state semantics |
| Resource authorization | Checks the actual persisted resource after loading | Must be called on every relevant code path and coordinated with data changes |
| Custom policy provider | Supports constrained dynamic policy families | Adds parsing/caching/diagnostic complexity and must fail closed |

## Common weak answers

- “Authorization checks the password.” Authentication validates credentials; authorization checks permissions.
- “Default and fallback policies are both applied to every request.” They are selected under different metadata conditions.
- “All handlers must succeed.” All requirements must succeed; multiple handlers may cooperate on one requirement.
- “A handler returning means denial.” It may leave the requirement pending for another handler.
- “The role was deleted, so old cookies cannot authorize.” Claims already issued can remain until revalidation/expiry.
- “The URL contains the owner ID.” Caller-controlled route/body data is not authoritative ownership.
- “A 401 and 403 are the same.” 401 is authentication challenge; 403 is authenticated denial.
- “Fallback auth protects all files.” Middleware order determines whether the file request reaches authorization.
- “Unknown dynamic policies can fall back to authenticated-only.” Unknown names should fail safely, not reduce intended authorization.

## Self-check rubric

Score each item 0–2: **0** = unable to explain; **1** = states a rule but misses a boundary; **2** = explains mechanism, failure mode, and tradeoff.

- Distinguish authentication, authorization, scheme, handler, principal, challenge, and forbid.
- Explain default versus fallback policy selection and static-file coverage.
- Predict AND behavior for combined requirements and alternatives in one role list.
- Explain pending requirement versus explicit failure.
- Place resource authorization after loading authoritative data.
- Explain claim/role issuer mapping and snapshot freshness.
- Design correct 401/403 behavior across browser and API routes.
- Describe strict dynamic policy-name parsing and fail-safe unknown behavior.

Suggested interpretation: 14–16 is ready for a focused interview discussion; 10–13 calls for review of the missed areas; below 10, revisit the concepts and policy references before repeating the scenarios.

## Sources

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims)
- [Role-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

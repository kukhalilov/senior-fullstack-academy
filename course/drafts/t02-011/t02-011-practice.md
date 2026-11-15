# ASP.NET Core authentication principals claims roles authorization policies and handlers — Exercises and worked solutions

## Goals

Practice tracing authentication and authorization as separate stages, predicting how endpoint metadata selects policies, and placing resource-based checks after loading the actual resource. The exercises use the failure modes most likely to produce an accidental allow or a misleading 401/403 response.

## Worked example

### Scenario

An API endpoint loads invoice 842 and should allow either the owner or a user with `billing.admin`. The caller must be authenticated. The database has an owner identifier; the access token may contain a `permission` claim. The route is `GET /invoices/842`.

### Decide the checks in order

1. The API bearer scheme validates the access token and produces the request principal. Missing/invalid authentication results in a challenge (typically 401).
2. A named endpoint policy requires an authenticated principal and a trusted permission claim for the invoice-management route family.
3. The endpoint loads invoice 842 from the repository. Do not trust a caller-supplied owner identifier.
4. Resource-based authorization receives the actual invoice and permits either `billing.admin` or a matching persisted owner identifier.
5. If neither rule passes, the API forbids the authenticated caller (typically 403). Do not return the invoice first and authorize later.

The policy combines all its distinct requirements with AND semantics, while the custom resource requirement can deliberately express an OR between administrator permission and ownership. A role requirement and an ownership requirement would be separate gates and both would have to pass. [Policy authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) [Resource authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

## Exercises

### Exercise 1: classify the response

For each request, choose whether the natural result is authenticate, challenge, forbid, or continue to the endpoint:

1. No bearer token is supplied to an endpoint requiring an API access token.
2. An expired token is presented.
3. A valid token authenticates the caller, but the caller lacks a required role.
4. A valid employee principal passes the coarse policy but fails ownership authorization for the loaded document.
5. A public endpoint has anonymous metadata but the request also includes a valid cookie.

### Exercise 2: policy-selection table

An app has a fallback policy requiring authentication and a default policy requiring authentication. Predict what applies to:

1. An endpoint with no authorization metadata.
2. An endpoint with bare `RequireAuthorization()`.
3. An endpoint with `RequireAuthorization("Reports.Read")`.
4. An endpoint marked anonymous.
5. A static file served by middleware before authorization middleware.

### Exercise 3: role-list semantics

An endpoint has one authorization declaration with `Roles = "Editor,Reviewer"` and another declaration requiring a `department=finance` claim. Is a user with only the `Reviewer` role and the finance claim sufficient? What if the second declaration requires a different named policy with a permission claim the user lacks?

### Exercise 4: find the resource authorization bug

```csharp
app.MapPut("/documents/{id}", async (int id, EditRequest request, ClaimsPrincipal user,
    IDocumentRepository repository) =>
{
    var document = new Document { Id = id, OwnerId = request.OwnerId, Text = request.Text };
    document.Text = request.Text;
    await repository.SaveAsync(document);
    return Results.Ok();
}).RequireAuthorization("Authenticated");
```

Identify at least four security/correctness problems and outline a safe ordering.

### Exercise 5: handler composition

One policy contains requirements `EmployeeRequirement` and `CanReadDocumentRequirement`. A first handler succeeds `EmployeeRequirement`; a second handler returns without deciding `CanReadDocumentRequirement`; a third handler succeeds it. Explain the final result. Then explain what changes if a handler calls `Fail()` before the third handler succeeds its requirement.

### Exercise 6: custom policy provider

The application accepts names of the form `Permission:<resource>.<action>`. Give four validation rules for the name grammar and explain what the provider should do with an unknown or malformed name.

## Progressive hints

1. A challenge relates to missing/invalid identity; forbid relates to an authenticated but disallowed identity. Anonymous metadata skips authorization failure enforcement even if authentication still runs.
2. Fallback is selected only when no endpoint metadata produced another policy. Static files served earlier do not pass through that middleware.
3. A comma-separated list inside one role declaration is alternatives; separate declarations can add additional requirements.
4. The client cannot choose persisted ownership. Load the actual resource, authorize it, and only then mutate/save it.
5. Every requirement must succeed. Leaving one pending allows another handler to satisfy it; an explicit failure is a hard denial.
6. Parse a closed grammar; allow only known resources/actions, reject extra separators/empty components, and fail safely when a policy name is not recognized.

## Complete solutions

### Solution 1: classify the response

1. **Challenge.** The endpoint requires an authenticated API principal and none is present; an API bearer scheme commonly responds with 401 and `WWW-Authenticate` information.
2. **Challenge/authentication failure.** The token was presented but invalid, so authentication fails. The API should not create an anonymous success principal from the same rejected credential.
3. **Forbid.** The token is valid and the caller is authenticated, but the role requirement fails; commonly return 403.
4. **Forbid.** The coarse endpoint rule passed, but the loaded-resource rule denies this document.
5. **Continue as anonymous or authenticated depending on the handler result.** Anonymous metadata means authorization middleware does not enforce an authorization failure. Authentication may still populate `HttpContext.User` from the valid cookie for personalization.

### Solution 2: policy selection

1. **Fallback policy**, if authorization middleware processes the request and the fallback is configured. It requires authentication in this scenario.
2. **Default policy.** Bare authorization metadata selects default policy; fallback is not added to it.
3. **Named `Reports.Read` policy.** The fallback is not automatically combined; the named policy must include every baseline requirement it needs.
4. **Authorization failure is bypassed for that endpoint.** The request can still be authenticated for personalization.
5. **No fallback authorization from this middleware.** The static-file middleware returned the response before `UseAuthorization` ran. Protect sensitive assets through an authorization-aware endpoint or storage policy.

### Solution 3: role-list semantics

Yes. The roles listed in a single roles declaration are alternatives: `Reviewer` is enough to satisfy that role requirement. The separate department declaration adds another requirement, so the finance claim must also be present. If a second declaration names a policy requiring an additional permission claim, the requirements combine; the user is denied unless that policy's permission requirement also succeeds. Policy combination is not an OR across separate declarations. [Policy authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) [Role authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)

### Solution 4: fix the resource authorization bug

Problems include:

- `request.OwnerId` is caller-controlled and is used as authoritative ownership.
- A new object is created instead of loading the persisted document, so existing ownership/classification/version state can be overwritten or bypassed.
- No resource-based check compares the authenticated principal with the persisted document.
- The document is saved before authorization of the actual resource.
- The endpoint validates neither existence nor concurrency/state constraints.
- The named `Authenticated` policy may only authenticate a caller and says nothing about permission to edit this particular document.

Safe order: authenticate through the intended scheme; load the persisted document by route ID; decide the 404/403 information-disclosure behavior; call resource authorization with the actual document and principal; reject if not successful; apply only allowed fields from the request; save with concurrency controls; return the appropriate result. Never bind a client-supplied owner field into the authoritative entity.

### Solution 5: handler composition

The first handler satisfies `EmployeeRequirement`. The second leaves `CanReadDocumentRequirement` pending; that is not automatically a hard failure. The third succeeds it, so if no explicit failure occurred and no other requirement remains pending, the policy succeeds. If a handler called `Fail()`, the context records a hard failure; succeeding a requirement later does not make the context successful. Reserve explicit failure for a non-negotiable denial rather than an ordinary non-match.

### Solution 6: custom policy provider

Validation rules should include:

1. Require the exact `Permission:` prefix and reject empty suffixes.
2. Require exactly one separator between non-empty resource and action components.
3. Allow only resource/action pairs from a server-owned registry, not arbitrary client-supplied values.
4. Apply an explicit casing/normalization rule and reject whitespace, control characters, or unexpected extra punctuation.

For a malformed or unknown name, return no policy or delegate to the default provider so normal policy resolution fails safely. Never convert an unrecognized name into an authenticated-only or allow-all policy. Consider logging a safe policy identifier for diagnosis without disclosing protected resource details.

## Tests and edge cases

- Missing credential, malformed credential, and valid credential with insufficient permission should produce distinct authentication/authorization outcomes.
- Test that a valid token for the wrong issuer/audience cannot reach the endpoint as an authenticated principal.
- Test policy selection for no metadata, bare authorization, named policy, explicit policy, role metadata, and anonymous metadata.
- Verify a named policy still includes required baseline authentication when a fallback policy is configured.
- Verify static files served before authorization middleware are either intentionally public or served through a protected path.
- Test role alternatives within one metadata declaration and AND behavior across multiple declarations.
- Test resource access for owner, administrator, unrelated user, deleted resource, and changed ownership.
- Pass a forged owner ID in a request body and confirm persisted ownership is unchanged.
- Test each handler outcome: succeed, pending/no decision, and explicit failure.
- Test malformed/unknown dynamic policy names fail closed.

## Reflection questions

1. Which handler should authenticate each endpoint, and which scheme should challenge it?
2. What claims are trusted, who issued them, and how long can they remain stale?
3. Which routes intentionally allow anonymous access, including files served by earlier middleware?
4. Which authorization decisions depend on loaded resources rather than endpoint-level facts?
5. Does every mutation path perform authorization before changing state?
6. In which cases is a hard `Fail()` semantically required rather than leaving a requirement pending?
7. What failure behavior should a dynamic policy provider use for unknown names?

## Sources

- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)
- [Claims-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/claims)
- [Role-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/roles)

# ASP.NET Core authentication principals claims roles authorization policies and handlers — Big-picture orientation and mental model

## Problem and purpose

Every protected request has two separate security questions: **who is calling?** and **may this caller perform this action on this resource?** Authentication creates a request principal from a credential. Authorization evaluates that principal against a policy or resource rule. Treating the questions as one check leads to familiar errors: accepting the wrong credential format, trusting a claim from the wrong issuer, or assuming a signed-in user can access every object.

ASP.NET Core supplies scheme-based authentication handlers, endpoint authorization metadata, policy evaluation, requirement handlers, and resource-based authorization services. These parts compose into the request pipeline, but their order and policy-selection rules matter. [Authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/) [Authorization introduction](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction)

## Plain-language mental model

Imagine a building with a reception desk and locked rooms. The authentication handler is reception: it examines the credential presented at the entrance and creates a badge (the `ClaimsPrincipal`) describing the verified identity. A policy is a room's rule: for example, the badge must belong to an employee and include an approved department claim. A resource-based check is the room attendant comparing the badge to the actual item or file being requested: this person may edit **this** document because they own it or have a specific permission.

The badge is not the rule, and a successful identity check is not permission. A scheme names the handler that knows how to read a particular kind of badge. A cookie handler and a JWT bearer handler have different protocols. **Authenticate** builds a principal; **challenge** asks an unauthenticated caller to provide credentials; **forbid** says an authenticated caller is not allowed. [Authentication overview](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)

## How the parts fit together

| Stage | ASP.NET Core part | Question answered |
|---|---|---|
| Choose credential protocol | Authentication scheme | Which handler should inspect the request? |
| Read/validate credential | Authentication handler | Is this credential valid under this scheme? |
| Build request identity | `ClaimsPrincipal` / `ClaimsIdentity` | Which identities and claims did the trusted handler produce? |
| Select authorization rule | Endpoint metadata and policy provider | Which requirements apply to this endpoint? |
| Evaluate requirements | Authorization service and handlers | Do all required rules succeed? |
| Check loaded object | Resource-based imperative authorization | May this principal act on this actual document/order/file? |
| Produce HTTP result | Challenge/forbid and endpoint behavior | Should the caller authenticate (401/challenge) or be denied (403/forbid)? |

The pipeline runs authentication before authorization so `HttpContext.User` is available. Endpoint metadata selects the policy. A policy may require authentication plus claims, roles, or custom requirements. Requirements compose with **AND** semantics: every requirement must succeed, though several handlers may cooperate to satisfy a single requirement. To authorize a resource loaded inside an action, invoke the authorization service after loading it; declarative attributes run before the resource is available. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

## Concept map

```text
request credential
      │
      ▼
scheme selects handler ── authenticate ──► ClaimsPrincipal
      │                                       │
      │ challenge if absent/invalid            ▼
      │                                 endpoint policy selected
      │                                       │
      └───────────────────────────────────────┤
                                              ▼
                                   requirements + handlers
                                      │             │
                                all succeed     failure/pending
                                      │             │
                                  continue      forbid/challenge
                                              
loaded resource ── imperative authorization against actual owner/state
```

Policy selection is distinct from requirement evaluation. A named policy, the default policy, a fallback policy, role metadata, explicit policy metadata, and anonymous metadata can affect which rules apply. A fallback policy applies only to requests that pass through authorization middleware; static files served earlier in the pipeline are outside it. [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)

## End-to-end walkthrough

Consider `GET /documents/42` where a user may read a document only if it is public, owned by the user, or the caller has an approved staff permission.

1. The request presents a cookie or bearer token. The configured authentication scheme selects the handler appropriate to that credential.
2. The handler validates the credential and builds `HttpContext.User`. If no acceptable identity is established, the endpoint challenges the caller.
3. Endpoint metadata selects the coarse policy, perhaps requiring an authenticated user and a permission claim.
4. The application loads document 42. A simple `[Authorize]` check could not inspect this document because it runs before the method loads it.
5. The app calls resource-based authorization with the principal, the loaded document, and a requirement such as read access.
6. A resource handler compares the document's actual owner/classification with trusted user claims and application state. If allowed, the endpoint returns the document; if not, it forbids access.

This flow avoids trusting the route ID, a client-supplied owner ID, or a role name as proof of ownership. [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

## When to use it and tradeoffs

- Use a named policy for reusable endpoint-level rules such as a permission claim or required authentication scheme.
- Use claims for facts issued by a trusted authority and needed in a principal. Keep claims small and define claim types/issuers consistently.
- Use roles for broad grouping when role membership is the intended business model; avoid turning every resource permission into a sprawling role list.
- Use custom requirements/handlers when a rule has domain meaning, needs dependency injection, or must inspect a resource.
- Use a fallback policy as a default-deny safety net only after auditing middleware order and public endpoints/static assets. It does not protect requests served before authorization middleware.
- Use dynamic policy providers only when policy names represent a well-defined parameterized family and are validated strictly. A provider can make policy selection flexible but complicates caching, diagnostics, and naming rules.

Policies improve consistency, but no attribute can reason about data it has not loaded. Conversely, imperative authorization must be called on every relevant path; forgetting the call creates a bypass. Define a clear boundary in controllers, endpoint handlers, or application services and test both allowed and denied cases.

## What later lessons cover

The concepts lesson explains schemes, principals, policy selection, requirement combination, and resource checks in prerequisite order. Reference lessons cover middleware and scheme APIs, endpoint metadata and defaults/fallback behavior, claims/roles and built-in requirement helpers, and custom handlers/providers/diagnostics. Practice applies the rules to mixed browser/API endpoints, public routes, and document ownership. Interview lessons exercise 401/403 semantics, claims trust, fallback coverage, handler composition, and resource-based authorization.

## Sources

- [Overview of ASP.NET Core authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
- [Introduction to authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction)
- [Policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
- [Resource-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased)

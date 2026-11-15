<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# authentication versus authorization identities claims and roles — Big-picture orientation and mental model

## Problem and purpose
Applications need to know who is making a request and whether that requester may perform the requested operation. Confusing these questions creates a common security flaw: a successful login is treated as permission to access every record or action.

## Plain-language mental model
Authentication is the checkpoint that asks, “Which identity is presenting acceptable proof?” Authorization is the guard at a specific door that asks, “May this identity perform this action on this resource now?” A user can prove who they are and still be denied access to a particular invoice.

## How the parts fit together
Credentials are evaluated by an authentication mechanism. The result is represented as an identity/principal and may contain claims: statements such as a subject identifier or role, associated with an issuer. Authorization evaluates those facts together with the requested operation and resource. A broad role may be enough for a simple feature, while ownership, tenant, state, or property checks often require a resource-aware decision. The server must enforce the decision on every protected operation. OWASP recommends least privilege, deny-by-default, and per-request checks in its [Authorization guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html); its [Authentication guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) treats proving identity as a separate concern.

## Concept map
- **Credential to identity:** Authentication validates evidence and constructs a principal for the request.
- **Facts to policy:** Claims and roles provide facts; a policy defines which combination is sufficient.
- **Policy to resource:** Some permissions depend on an object, its owner, tenant, or current state.
- **Decision to response:** Missing/invalid authentication generally triggers a challenge; an authenticated but forbidden request is denied. HTTP defines status semantics in [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html).

## End-to-end walkthrough
Alice signs in. The authentication system validates her credential and creates an authenticated principal with a stable subject identifier and tenant claim. Alice requests `/invoices/42`. The server loads invoice 42, then checks that the principal belongs to the invoice's tenant and either owns it or has a narrowly defined accounting permission. If the request has no valid authentication, the system challenges the client. If Alice is authenticated but fails the access rule, it forbids the operation. Hiding the invoice link in the UI does not replace the server-side check.

## When to use it and tradeoffs
Use roles for coarse job categories when membership maps cleanly to broad permissions; use policies for decisions that combine several facts; use resource checks when access depends on a particular object's owner, tenant, or state. Keep permissions narrow, default to denial, and re-evaluate after privilege changes. Caching authorization can improve speed, but stale decisions can preserve access after a role or ownership change, so invalidation and cache lifetime are security decisions.

## What later lessons cover
The next lesson explains identity construction and claims. The reference lessons cover exact terms for authentication and authorization models. Other topics cover password/MFA mechanics, sessions/tokens, OAuth/OIDC, and ASP.NET Core implementation details.

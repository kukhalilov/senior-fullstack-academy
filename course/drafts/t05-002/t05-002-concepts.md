<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# authentication versus authorization identities claims and roles — Core concepts and how they fit together

## Learning objectives
Separate identity proof from permission decisions; explain how identities and claims feed a policy; choose when a resource check is needed; distinguish an authentication challenge from authorization denial; and recognize tenant and object-level failure modes.

## Prerequisites
Understand HTTP requests and server-side application routes. A principal is the application’s representation of a requester for a decision; it should be derived from trusted authentication processing, not copied from arbitrary request fields.

## Core concepts
Authentication evaluates credentials or another proof under an authentication scheme and constructs an identity for the request. Authorization evaluates whether that identity may perform an operation on a resource. Neither a role string from a query parameter nor a hidden UI button is proof or enforcement.

Claims are statements attached to an identity, with an issuer and meaning. A claim’s value is not automatically trustworthy just because the word “claim” appears in a framework type: the application must know which authentication system issued it, what the value means, and whether it is current. Roles are a convention for one kind of coarse membership; they are not a complete permission model.

## Mechanisms and relationships
The flow is: request arrives → authentication handler for the selected scheme evaluates the credential → an authentication ticket/context yields a principal → authorization policy checks requirements → handlers may evaluate resource facts → the server allows or denies the operation. ASP.NET Core’s conceptual model is described in [Microsoft authorization documentation](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-11.0); protocol- and security-level guidance on authorization is in [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

Declarative authorization attaches a rule to an endpoint or operation so it is visible and consistently invoked. Imperative authorization calls a decision at runtime, useful when a resource must first be loaded. These can complement each other: require authentication/ broad policy declaratively, then evaluate ownership or state against the loaded object. A role check may answer “is an administrator?” but does not necessarily answer “may this tenant's administrator read this record?”

Default-deny means an operation remains inaccessible unless an explicit rule grants it. Least privilege limits both the set of allowed actions and the duration/freshness of the grant. Tenant isolation must be applied to data selection and authorization; checking a client-supplied tenant ID without binding it to the authenticated identity is unsafe. Function-level checks gate an operation; object-level checks gate a particular record; property-level checks govern fields in a returned or updated object.

HTTP’s `401 Unauthorized` name is historically confusing: it indicates that the request lacks valid authentication credentials and a challenge is required by HTTP semantics. `403 Forbidden` means the server understood the request but refuses it; re-authentication is not necessarily a remedy. See [RFC 9110 sections 15.5.2 and 15.5.4](https://www.rfc-editor.org/rfc/rfc9110.html).

## Worked examples
**Coarse rule:** any authenticated employee may view a public staff directory. An authenticated principal is sufficient.

**Resource rule:** a user may read an invoice only if the invoice belongs to the user's tenant and the user owns it or has a permission to review invoices. Load the invoice through a tenant-constrained query, then evaluate the operation against its data.

**Stale cache:** an administrator's permission is removed, but a cached allow decision remains. Invalidate affected entries or use a cache strategy with an acceptable bounded stale-access window.

## Misconceptions and edge cases
- Authentication success does not mean authorization success.
- A role is not inherently a permission and may be too broad for object-level access.
- Random or unguessable object IDs do not replace access checks.
- An authorization handler that fails to complete a requirement must not accidentally imply an allow; the overall policy must have an explicit successful decision.
- UI filtering improves usability, not server security.
- Challenge and forbid are framework decision outcomes; exact response behavior depends on scheme and endpoint configuration, while HTTP status semantics remain distinct.

## Knowledge checks with answers
1. A user can log in but cannot open invoice 42. **Authentication succeeded; resource authorization denied access.**
2. Should a client-provided `role=admin` grant access? **No; permission facts must come from trusted server-side authentication/authorization state.**
3. What is the difference between function- and object-level access? **One governs whether an operation is available; the other whether it may be applied to this particular object.**

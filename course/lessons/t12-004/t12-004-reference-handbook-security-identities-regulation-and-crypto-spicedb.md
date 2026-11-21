# architecture patterns multi-region tenancy and reliability — Reference: SpiceDB

Sources: [SpiceDB documentation](https://authzed.com/docs), [schema language](https://authzed.com/docs/spicedb/concepts/schema), [querying data](https://authzed.com/docs/spicedb/concepts/querying-data), [consistency and ZedTokens](https://authzed.com/docs/spicedb/concepts/consistency), [caveats](https://authzed.com/docs/spicedb/concepts/caveats), [best practices](https://authzed.com/docs/spicedb/best-practices), [Google Zanzibar paper](https://research.google/pubs/zanzibar-googles-consistent-global-authorization-system/).

## Scope and version

This is a product-specific conceptual guide to SpiceDB, AuthZed’s open-source Zanzibar-inspired authorization database, based on its official documentation on 2026-11-20. Self-hosted and managed offerings can differ in availability, operations, and features; check the current release and deployment documentation before selecting a service. The lesson focuses on the authorization model, relationship data, checks/lookups, caveats, consistency, and application integration.

## How this group fits the mental model

Traditional role checks are often easy at first: “is this user an administrator?” They become awkward when access depends on a resource hierarchy—an editor of a parent folder can edit a child document, a team member inherits access through a group, or an organization administrator can manage its projects. Putting every derived rule in application code duplicates policy and risks inconsistent decisions.

SpiceDB stores relationships and evaluates a schema-defined graph of relations and permissions. The application asks a question such as “can user U view document D?” The system evaluates direct relationships and the paths/rules that derive the permission. The application remains responsible for authenticating the caller, mapping the caller to the correct subject ID, enforcing the result, and keeping relationship data synchronized with authoritative business state.

## Supplied names explained

- **SpiceDB** is a relationship-based authorization service inspired by Google Zanzibar. Its main concepts are:
  - **Object definition:** a type of resource, such as `document`, `folder`, `organization`, or `user`.
  - **Relation:** a stored relationship from a subject/userset to an object, such as `document:123#editor@user:42`.
  - **Permission:** a computed subject set, defined from relations and other permissions; treat it as the application-facing authorization API.
  - **Schema:** declares object types, allowed relation subjects, permissions, and optional caveat definitions.
  - **Relationship tuple:** an instance of a relation, typically written/deleted through the API.
  - **Caveat:** a named, typed CEL expression attached to a relationship and evaluated with request context.
  - **ZedToken:** an opaque datastore revision token that allows later checks to be at least as fresh as a prior write/check result.

Example schema shape (illustrative, not a complete production model):

```zed
definition user {}

definition folder {
  relation parent: folder
  relation viewer: user | group#member
  permission view = viewer + parent->view
}

definition group {
  relation member: user
}

definition document {
  relation parent: folder
  relation editor: user | group#member
  permission edit = editor
  permission view = editor + parent->view
}
```

The schema computes what relationships mean; it does not automatically populate them. When a user joins a group, the application or a reliable synchronization process must write the corresponding tuple. When membership is revoked, the tuple must be removed or changed, and the application must choose a consistency policy for subsequent reads.

## Main API operations and decision semantics

- **CheckPermission:** asks whether a subject has a named permission on one resource. This is the core enforcement path for an API request.
- **BulkCheckPermissions:** evaluates multiple permission checks in one request where supported, reducing round trips for a page that needs several decisions.
- **LookupResources:** finds resources for which a subject has a permission; use carefully at large scale and paginate/shape queries appropriately.
- **LookupSubjects:** finds subjects that have a permission on a resource.
- **ReadRelationships / WriteRelationships / DeleteRelationships:** inspect or mutate relationship facts. Application authorization should generally call permission checks rather than reconstructing policy by reading raw tuples.
- **ReadSchema / WriteSchema:** inspect and version-control the authorization model. Treat schema rollout as a policy migration, test before production, and preserve model history.
- **Caveated results:** a permission can be conditional when required context is missing. Do not treat “conditional/unknown” as an allow; supply validated context or deny according to policy.

## Consistency and the New Enemy Problem

Authorization changes can race with cached checks. A user may lose access while a stale permission result still grants it—the “New Enemy Problem.” SpiceDB exposes consistency choices and ZedTokens so the caller can trade latency for freshness:

- `minimize_latency` favors cache reuse and may return an older view.
- `at_least_as_fresh` requires a result no older than a supplied ZedToken; newer data can be used.
- `at_exact_snapshot` reads one specified revision and can fail if that snapshot has expired; it is useful for short paginated reads that must share one view.
- `fully_consistent` uses the latest available datastore state at the start of the request and bypasses cache, generally at higher latency. It does not include writes that occur after that request begins.

Documented defaults on the current API include fully consistent writes/schema operations and latency-minimizing behavior for other calls. Do not depend on defaults for a security-sensitive operation: set the consistency requirement explicitly. After changing resource content or access, store the returned ZedToken with the authoritative application state and require at-least-as-fresh checks for reads that must observe that change. A ZedToken is opaque; clients should not parse it or treat it as a credential.

## Caveats and request context

Caveats add conditions, such as “the user is a viewer only before the grant expiration” or “the request IP is in an allowed network.” A caveat declares typed parameters and a CEL expression; some values can be stored with the relationship and others supplied in the permission request. SpiceDB can return a conditional permission and identify missing context fields rather than guessing.

Use caveats for genuinely dynamic predicates, not as a substitute for relationships that can be modeled directly. Context must come from trusted server-side sources; accepting caller-supplied claims without validation turns the condition into attacker-controlled policy input. Caveated relationships can add computation and caching complexity. Validate schema and test missing, malformed, boundary, and timezone cases.

## Application architecture example

For a multi-tenant document service, keep document rows and tenant ownership in the main database. Maintain authorization tuples for organization membership, folder hierarchy, and per-document grants. On each API request, derive the subject from the authenticated identity, load the resource’s tenant context from trusted data, then call `CheckPermission` for `view` or `edit` before returning or mutating the document.

When a document moves to another folder, update the business row and relationship graph with an outbox/retry strategy so failures are observable and repairable. The application should avoid a state where content is moved but access tuples silently remain stale. For revocation-sensitive operations, use a fresh-enough consistency token or full consistency; for low-risk reads, a bounded staleness policy may be acceptable. Measure check latency, datastore load, cache hit behavior, graph depth, and error/conditional rates.

## Modeling and operational guidance

- Keep relations as stored facts and permissions as computed public decisions; name permissions as actions (`view`, `edit`, `delete`).
- Model tenant boundaries explicitly. Test that cross-tenant paths cannot be composed accidentally.
- Prefer a small understandable schema over a single deeply recursive permission expression. Beware of cycles and unbounded graph walks.
- Add schema assertions and expected-relations tests for positive and negative cases, including nested groups, parent inheritance, revoked access, and caveats.
- Restrict who can write tuples and schemas; authorization data is security-critical state. Audit schema deployment and relationship mutations.
- Design synchronization for retries, duplicates, ordering, and partial failure. Idempotent writes and reconciliation jobs help repair drift.
- Protect SpiceDB’s API with service authentication, network controls, TLS, backups, datastore capacity planning, and monitoring. A permission engine outage needs an explicit fail-closed or carefully bounded fallback decision.
- Do not expose raw internal object IDs or relationship data unless the application’s privacy model allows it.

## Cross-item comparison

- **SpiceDB and OpenFGA** both use Zanzibar-inspired relationship tuples and graph-derived authorization. Compare schema language, API behavior, consistency controls, deployment model, operational tooling, and required scale; syntax and semantics are not drop-in compatible.
- **RBAC** is simpler when permissions are primarily role membership. ReBAC handles resource relationships and inheritance more naturally. Many systems combine roles with relationship checks.
- **ABAC** evaluates attributes and context. SpiceDB caveats can express conditional rules, but dynamic attributes still need trusted sourcing and careful evaluation.
- **Application/database checks** avoid a separate service for simpler systems, but policy logic can duplicate and become inconsistent. Externalizing authorization adds network, synchronization, consistency, and operations costs.

## Common mistakes

- Assuming schema definitions automatically synchronize with application data.
- Using raw relationship reads as a substitute for computed permission checks.
- Treating stale `minimize_latency` decisions as current after revocation.
- Failing open when the service errors, times out, or returns conditional permission.
- Trusting client-provided caveat context.
- Treating ZedTokens as permanent revisions, secret credentials, or parseable values.
- Modeling every dynamic rule as a caveat, creating expensive graphs and cache misses.
- Forgetting that permission data must be updated when business resources move, are deleted, or change tenant.

## Knowledge checks with answers

1. **What is stored and what is computed?** Relationship tuples are stored facts; permissions are computed sets derived from the schema and those facts.
2. **A revocation was just written. Which token use helps a later check observe it?** Use the returned ZedToken with `at_least_as_fresh` (or choose full consistency when appropriate); latency-minimizing reads alone may be stale.
3. **What should the app do with a conditional permission caused by missing context?** Obtain validated context and reevaluate, or deny; do not silently allow.
4. **Does a schema update rewrite old relationship data?** No. Schema and tuple lifecycle are distinct; plan migrations and test compatibility.
5. **Who owns the truth for tenant membership?** The application’s authoritative identity/tenant system; SpiceDB stores an authorization representation that must be synchronized and audited.

## Examples

Suppose a user is removed from a group that grants access to a document. The membership system commits the removal and an outbox worker deletes the corresponding tuple. A subsequent sensitive download check must observe that revocation using an appropriate consistency token or full consistency; if the tuple write is delayed or fails, the system monitors and reconciles the mismatch rather than silently relying on stale access.

## Practice exercise

Model `organization`, `group`, `folder`, `document`, and `user`. Define `view` and `edit` including inherited folder access. Add a time-limited grant caveat. Write tests for cross-tenant denial, nested group access, missing caveat context, and revocation followed by a consistency-token check. Describe how an outbox reconciles the application database with tuple writes.

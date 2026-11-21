# architecture patterns multi-region tenancy and reliability — Reference: OpenFGA

Sources: [OpenFGA documentation](https://openfga.dev/docs), [modeling](https://openfga.dev/docs/modeling), [authorization concepts](https://openfga.dev/docs/concepts), [Check API](https://openfga.dev/api/service#/Relationship%20Queries/Check), [contextual tuples](https://openfga.dev/docs/interacting/contextual-tuples), [conditions](https://openfga.dev/docs/modeling/conditions), [consistency options](https://openfga.dev/blog/query-consistency-options-announcement), [testing models](https://openfga.dev/docs/modeling/testing).

## Scope and version

This lesson explains OpenFGA’s model and API concepts documented on 2026-11-20. OpenFGA is a relationship-based authorization service inspired by Google Zanzibar. It supports versioned authorization models, relationship tuples, query APIs, contextual tuples, conditions, and configurable query consistency. Hosted products and self-hosted server releases may differ; consult current release docs for operational options and API compatibility.

## How this group fits the mental model

Simple role checks work until permissions depend on resource relationships: team members can see team documents; folder viewers inherit access to child files; organization admins manage projects. OpenFGA separates these policy relationships from business code. The application asks whether a subject may perform a relation/action on an object, and the model explains how direct and inherited relationships combine.

This service is not an identity provider or a complete application authorization boundary. Your API must authenticate the caller, map identity to a stable OpenFGA user ID, authorize the exact object/action, and enforce the decision on every relevant read and write. Your business system remains authoritative for membership and resource lifecycle unless you deliberately choose OpenFGA as the source of those facts.

## Supplied names explained

- **Store:** tenant-like boundary for authorization data, models, and tuples. Design store isolation and retention deliberately.
- **Authorization model:** versioned type/relation definitions and rules used to compute whether a relationship exists.
- **Type:** category of object, such as `user`, `group`, or `document`.
- **Relation:** a named relationship possible between users/usersets and objects, such as `reader` or `parent`.
- **Relationship tuple:** stored fact `(user, relation, object)`, optionally with a condition. For example `user:42 editor document:9`.
- **Userset:** a set of users identified through a relationship such as `group:finance#member`.
- **Permission:** often modeled as a computed relation using unions, intersections, exclusions, and tuple-to-userset traversal.
- **Condition:** typed expression evaluated with stored and request context to qualify a tuple.
- **Contextual tuple:** request-scoped relationship used for one authorization query; it is not persisted.
- **Authorization model ID:** identifies the exact model version used for an operation. Pinning it avoids silent behavior changes when “latest” changes.

Illustrative schema 1.1:

```fga
model
  schema 1.1

type user
type group
  relations
    define member: [user]
type folder
  relations
    define viewer: [user, group#member]
    define parent: [folder]
    define can_view: viewer or can_view from parent
type document
  relations
    define editor: [user, group#member]
    define parent: [folder]
    define can_edit: editor
    define can_view: editor or can_view from parent
```

Tuple data expresses facts; the model describes how facts imply access. The relationship graph must be synchronized with authoritative application state. Avoid writing permissions into tuples as if they were ordinary relations unless the model explicitly defines that relationship.

## APIs and query behavior

- **Write / Delete:** add or remove tuples. Writes are validated against the selected model; design retries and duplicate handling explicitly.
- **Check:** evaluate whether a user/userset has a relation to an object. Include the intended authorization model ID in security-critical requests.
- **BatchCheck:** evaluate multiple checks in one request when a screen or operation needs multiple decisions; bound batch size and observe latency.
- **ListObjects:** find objects of a type accessible to a user under a relation.
- **ListUsers:** find users/usersets that can relate to an object for a relation, subject to model and API support.
- **Expand:** explain a relationship tree for diagnostics; it is not a substitute for access checks and may reveal sensitive graph structure.
- **ReadChanges:** consume tuple changes for downstream systems such as permission-aware indexes; ensure consumers handle cursors, replay, and lag.
- **Contextual tuples:** add temporary facts to Check and supported query APIs. OpenFGA documentation lists Check, BatchCheck, ListObjects, ListUsers, and Expand in current behavior; confirm the endpoint/version you deploy. A contextual tuple with the same key can take precedence over stored data for that request, so only construct these tuples from trusted server-side inputs.
- **Conditions:** schema-defined typed expressions can require request values, for example expiration/time or matching a stored tenant attribute. Supply all needed parameters; missing condition context can produce an evaluation error rather than a safe allow.

Current OpenFGA supports consistency options on query APIs (introduced in server versions beginning with 1.5.7). Choose between latency-oriented and higher-consistency reads using the current API enum; do not assume a write is immediately visible to every query unless the chosen consistency contract guarantees it. Pin server and SDK versions and test read-after-write behavior.

## Example: multi-tenant document API

The .NET API authenticates a request, resolves the subject from a stable identity key, loads the document’s tenant ID from its primary database, then sends `Check(user, can_view, document)` with the model version required by the deployed policy. Only after `allowed` is true does it return the document. A client-supplied `tenantId` must not override the resource’s stored tenant.

When a team membership changes, the authoritative membership service writes or removes the corresponding tuple. An outbox or durable event/retry process prevents a database commit and tuple write from silently diverging. Revocation-sensitive actions use an appropriate consistency option or explicit recheck. A React UI may call a backend endpoint that checks access to render controls, but hiding a button is only usability; the .NET API still checks authorization on the protected request.

## Modeling, testing, and operating

- Begin with the simplest policy and examples in plain language. Model direct relationships first; add inheritance only when the domain needs it.
- Keep permission names action-oriented and distinguish stored facts (`editor`) from computed decisions (`can_edit`).
- Test positive and negative cases, nested group membership, object hierarchy, wildcard/public relations, exclusions, conditions with missing values, and cross-tenant denial. Use model tests and fixtures before rollout.
- Version authorization models and deploy them like code. Write tests against the candidate model, then pin the selected model ID in release paths.
- Make writes idempotent at the application boundary and reconcile tuple state against the system of record. OpenFGA APIs may report conflicts for duplicate/nonexistent tuple mutations; do not assume every write operation is idempotent by default.
- Keep model complexity, graph depth, request size, and query latency observable. Cache only with a documented revocation/staleness bound.
- Protect store/API credentials and network access. Define fail-closed behavior for authorization timeouts; a cache fallback is safe only under explicit risk and freshness rules.
- Treat authorization change streams as eventually consumed data. Search indexes and UI caches can lag; still enforce access at the authoritative API.

## Cross-item comparison

- **OpenFGA and SpiceDB** both use Zanzibar-inspired relationship tuples and computed graph permissions. Their model syntax, API semantics, consistency controls, and operations are not interchangeable; compare on real policy and scale tests.
- **RBAC** is compact for role-centric policies. **ReBAC** naturally represents object/group relationships and inheritance. Systems often combine both.
- **ABAC** evaluates attributes and context; OpenFGA conditions and contextual tuples can represent some contextual rules, but attributes must come from trusted sources and the model remains graph-oriented.
- **Policy engines** such as OPA can evaluate general request/document policies; OpenFGA specializes in relationship graphs. Choose based on data model and decision workload, not naming.

## Common mistakes

- Treating OpenFGA as an identity provider or trusting a user ID supplied by the browser.
- Hiding controls in React but failing to check the protected API operation.
- Failing to specify model ID and unintentionally changing authorization when a new model becomes latest.
- Letting client input create contextual tuples or condition context.
- Treating missing context, timeout, or stale check as allow.
- Assuming tuple writes and application database commits are one atomic transaction.
- Treating a permission-aware search index as the final authority for protected data.
- Modeling all policy as roles and losing resource-level inheritance—or adding arbitrary graph complexity without tests.

## Knowledge checks with answers

1. **What is a tuple versus a model?** A tuple is a relationship fact; the model defines types and how facts derive authorization.
2. **Why include an authorization model ID?** To make the policy version used for a decision explicit and reproducible.
3. **Do contextual tuples persist?** No. They apply to the specific supported query request and are not stored.
4. **Can a React component’s hidden button protect a resource?** No. The backend must check the exact requested object/action.
5. **What prevents membership state drift?** A durable synchronization design such as an outbox, idempotent/retryable tuple operations, monitoring, and reconciliation.

## Examples

For `document:budget`, user `user:anne` may inherit `can_view` through membership in `group:finance#member`, while an unrelated user is denied. If the model version changes the inheritance rule, a request that pins the old model remains reproducible; deployment canary checks compare both versions before promotion.

## Practice exercise

Model organization membership, nested groups, folder inheritance, and document editing. Write tests proving a user from tenant A cannot access a tenant B document even when the client supplies tenant A’s ID. Then simulate tuple-write lag after membership revocation and document the selected consistency and cache behavior.

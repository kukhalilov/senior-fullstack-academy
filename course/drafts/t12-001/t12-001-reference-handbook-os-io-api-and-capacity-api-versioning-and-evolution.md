# system design foundations and infrastructure building blocks — Reference: API versioning and evolution

Sources: [Microsoft API design and versioning guidance](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design), [Google API backward-compatibility guidance](https://google.aip.dev/180), [Microsoft Web API versioning strategies](https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design), [HTTP Deprecation header](https://www.rfc-editor.org/rfc/rfc9745), [HTTP Sunset header](https://www.rfc-editor.org/rfc/rfc8594).

## Scope and version

This lesson covers how to evolve a client/server API while deployed clients may use old contracts. It applies to public and internal APIs, REST, GraphQL, gRPC, and event/message schemas, with protocol-specific details varying. Versioning policy is a product and compatibility contract; the exact route/header/schema mechanism is a separate implementation choice.

## How this group fits the mental model

An API is a promise consumed by independently deployed clients. A server can be updated while mobile apps, partner integrations, cached clients, and old service instances continue using previous assumptions. Safe evolution starts by identifying what consumers can observe, preserving behavior when possible, and introducing an explicit migration path when a change cannot remain compatible.

## Supplied names explained

- `API versioning and evolution` — Compatibility practices and explicit contract selection that let APIs add capabilities and eventually make breaking changes without silently changing behavior for existing clients.

## Compatibility is more than the JSON shape

A change can break a client by altering:

- **Syntax:** fields, types, enum values, method signatures, required parameters, or wire encoding.
- **Semantics:** meaning, default, ordering, nullability, error behavior, authorization, pagination, or side effects.
- **Operational behavior:** rate limits, deadlines, consistency, idempotency, or deprecation/removal timing.

An unchanged schema can still be breaking if the server changes what a field means. Conversely, adding an optional response field is often compatible when consumers ignore unknown fields, but not if a strict client parser rejects them. “Additive is safe” is a useful default only after checking actual consumers and their parsing behavior.

## Classify changes before shipping

Usually lower risk, but still verify clients:

- Add an optional request field while preserving old default behavior.
- Add a response field when clients tolerate unknown fields.
- Add a new endpoint/method without changing existing behavior.
- Add an enum value only if clients handle unknown values safely.

Potentially breaking:

- Remove or rename a field/method, make an optional field required, or change a type.
- Change units, meaning, default, ordering, error/status behavior, or side effects.
- Narrow accepted inputs or broaden outputs in ways consumers do not expect.
- Add enum values where generated clients use exhaustive switches or reject unknown values.
- Change pagination, consistency, authorization, or idempotency semantics.

Compatibility is directional. A new server accepting an old client’s requests is backward compatibility; an old server accepting a new client’s requests is forward compatibility. Rollout safety often needs both directions temporarily because old and new binaries coexist during deployment. Test the actual combinations that will exist during rolling upgrades.

## Evolve with expand, migrate, contract

For a breaking field change, use staged deployment:

1. **Expand:** add the new field/behavior while keeping the old contract. Make servers accept both forms where practical.
2. **Migrate:** update clients and producers; measure adoption and compare old/new behavior. Backfill persisted data if needed.
3. **Contract:** after usage reaches an agreed threshold and consumers have been notified, remove the old form in a planned version or deprecation window.

This pattern applies to databases too: deploy schema changes compatible with both old and new application versions, migrate reads/writes, then remove obsolete columns. An API gateway cannot rescue an incompatible database rollout unless translation behavior is explicit and tested.

## Choosing a versioning mechanism

- **Major version in path** (`/v1/...`, `/v2/...`): visible, easy to route and document, but duplicates routes and clients must migrate endpoints.
- **Version header or media type:** keeps resource URI stable and supports negotiation, but is less visible and caches must vary by the version header/media type.
- **Query parameter:** easy to try and route, but can complicate caching, signatures, and URL hygiene.
- **Schema/IDL evolution without explicit API versions:** often works when compatibility rules are strong, such as carefully evolving Protocol Buffers; breaking changes still need coordinated versioning or a new method/package contract.
- **GraphQL schema evolution:** commonly adds fields and deprecates old fields while clients select fields. Removing a field remains breaking for clients that use it; measure field usage and communicate removal.

No mechanism removes the cost of supporting old behavior. Multiple live versions increase code, testing, documentation, telemetry, and incident-response work. Version only when a genuine contract break or product need justifies that cost; do not bump versions for internal implementation changes clients cannot observe.

## Deprecation and retirement

Deprecation is a communication and migration phase, not deletion. Publish replacement guidance, dates or criteria, supported-client policy, security exceptions, and contact paths. Track requests by version and client identity where lawful and reliable; unknown or anonymous clients complicate retirement. Give mobile and partner consumers realistic update windows. Stop retirement if critical consumers remain unless risk or security requires it, and provide a migration/compatibility plan.

For HTTP resources, RFC 9745 defines the `Deprecation` response field as lifecycle information that does not itself change resource behavior; RFC 8594 defines `Sunset` to communicate when a resource is expected to become unavailable. These signals are optional communication aids, not a substitute for migration documentation, telemetry, or a retirement plan. Ensure documentation and SDKs state which versions are supported. Keep emergency security changes possible under a documented policy.

## Compatibility testing and rollout

Use contract tests for representative old and new consumers, schema-diff checks, generated-client compilation, and integration tests across rolling deployment combinations. Test unknown response fields/enums, omitted optional request values, malformed/unsupported version identifiers, and routing/caching behavior. Deploy behind a canary or gradual rollout; monitor errors, latency, version adoption, and semantic differences. Rollback must be safe with data already written by the new version.

For events, consumers may lag much longer than request/response clients. Keep schemas readable by old consumers during migration, handle unknown fields and event versions, and use upcasters or a new event type when semantics genuinely change. Do not rewrite an immutable event’s meaning in place.

## Cross-item comparison

| Strategy | Strong fit | Main cost or risk |
|---|---|---|
| Compatible additive evolution | Most routine improvements | Consumer parsers and semantics may still make additions unsafe |
| Explicit major API version | Intentional breaking contract | Parallel support, migration, routing, and eventual retirement |
| Header/media-type negotiation | Stable resource URI with negotiated representations | Less discoverable; cache key variation must be correct |
| GraphQL deprecate-and-measure | Field-oriented clients selecting subsets | Removal still breaks clients using deprecated fields |
| Event schema evolution | Independently deployed producers/consumers | Long-lived old consumers and replay history extend compatibility window |

## Examples

A mobile API changes `displayName` into structured `givenName` and `familyName`. First add the new response fields and allow both old and new request forms, preserving `displayName` derivation. Release clients that use the structured fields; collect versioned usage metrics. Backfill stored data and verify parity. After the published support window and consumer checks, retire the old field in a new major contract. During rollout, old servers must still tolerate new clients if deployment order allows it, or routing must ensure the compatible pair.

A GraphQL service wants to remove `legacyStatus`. Mark it deprecated with replacement documentation, instrument field usage by client/operation, contact owners, and wait for usage to reach the removal policy. Then remove in a coordinated schema change; a deprecation annotation alone does not stop clients from requesting the field.

## Common mistakes

- Calling every additive change nonbreaking without testing real client parsers and semantics.
- Versioning every implementation release, creating unnecessary parallel contracts.
- Removing deprecated behavior based only on elapsed time without consumer telemetry.
- Changing defaults, enum behavior, ordering, or error semantics without treating them as contract changes.
- Deploying a new client before any server version can handle it during a rolling rollout.
- Forgetting cache variation for header/media-type version negotiation.
- Rewriting historical events so replayed data changes meaning.
- Treating a version number or deprecation header as a complete migration plan.
- Rolling back application code after new writes have made the old version incompatible.

## Knowledge checks with answers

1. **Is adding a response field always backward-compatible?** No. It depends on client parsing and semantics; strict decoders may reject unknown fields.
2. **Why use expand/migrate/contract?** It lets old and new consumers coexist while the new representation is introduced, adopted, and eventually retired safely.
3. **Should every implementation deployment create an API version?** No. Version externally observable contract changes, not internal code changes that preserve the contract.
4. **Does deprecating a GraphQL field remove it from clients?** No. Clients can keep using it until it is removed; measure usage and communicate migration.
5. **What compatibility directions matter in rolling deployments?** New servers handling old clients and, where rollout order requires it, old servers handling new clients.

## Practice

A service renames a required request field, changes an enum, and changes the default sort order. Propose a rollout that supports mobile clients updating slowly, internal services deployed independently, and cached responses. Include tests and a retirement criterion.

**Suggested answer:** Treat all three as potential breaking changes. Add the new request field while accepting the old field; define precedence and validation when both are supplied. Add new enum values while ensuring old consumers have a safe unknown-value path, or expose them only under a new contract. Keep the old default order for old clients and introduce the new order explicitly or by a new major version. Use staged expand/migrate/contract deployment, compatibility tests across old/new binaries, cache variation for negotiated versions, client-version telemetry, and canary metrics. Retire old behavior only after published notice and evidence that supported consumers have migrated, except for documented security/emergency cases.

# architecture patterns multi-region tenancy and reliability — Reference: Backstage

Sources: [HLD Handbook](https://hld.handbook.academy/), [Backstage documentation](https://backstage.io/docs/), [Software Catalog](https://backstage.io/docs/features/software-catalog/), [Software Templates](https://backstage.io/docs/features/software-templates/), [TechDocs](https://backstage.io/docs/features/techdocs/), [Backstage architecture overview](https://backstage.io/docs/overview/architecture-overview/).

## Scope and version

Backstage is an open-source framework for building an internal developer portal. It is not a turnkey internal developer platform or a product that automatically standardizes every company’s delivery process. This lesson covers core concepts; plugins and APIs evolve, so use documentation matching the version and plugins actually deployed.

## How this group fits the mental model

In a growing engineering organization, teams need to discover services, owners, APIs, documentation, templates, and operational links. Backstage provides a portal shell and plugin ecosystem that can connect these pieces. Its Software Catalog maintains metadata about software entities, commonly sourced from descriptor files alongside source repositories. Templates can scaffold new components; TechDocs supports docs-like-code workflows. The portal is a presentation and integration layer over systems of record, not automatically the authority for source code, permissions, deployment state, or runtime health.

An internal developer portal is useful when it reduces repeated discovery and setup work. It can become a costly, stale “dashboard of dashboards” if metadata has no owner, plugins duplicate source-of-truth data, or every workflow requires portal-specific support. Start from developer journeys and platform capabilities, then measure task completion, onboarding time, ownership completeness, and maintenance burden.

## Supplied names explained

- **Backstage** — An extensible framework for building a developer portal, including the Software Catalog, Software Templates/scaffolder, TechDocs, and a plugin model for integrating engineering systems.

### Main capabilities and their boundaries

- **Software Catalog:** records entities such as components, APIs, systems, resources, users, and groups, with ownership and relationships. Metadata YAML stored with code can make repository-backed ownership reviewable. A catalog is only trustworthy when ingestion, validation, lifecycle, and stale-entity cleanup are managed.
- **Software Templates/scaffolder:** presents inputs and executes configured actions to create or modify repositories and related resources. A template is reusable automation; its owner, allowed actions, secret handling, idempotency, and generated defaults require review. A template’s catalog owner is responsibility metadata, not runtime authorization.
- **TechDocs:** generates and presents documentation through a docs-like-code model, often associated with catalog entities. Decide build/publish ownership, access control, versioning, and how stale docs are reported.
- **Plugins and integrations:** expose tools or data from CI, cloud, source control, observability, and ticket systems. Prefer linking to the authoritative system for operations that require its full context; avoid silently creating a second state store.
- **Portal platform:** the organization must operate the Backstage app, plugin compatibility, authentication/authorization, database, secrets, upgrades, backups, and availability. Open source does not mean no operational ownership.

## Cross-item comparison

| Term | Meaning | Example question |
|---|---|---|
| Developer portal | A discovery and workflow interface for engineers | Can a developer find owner, docs, API, and safe next action? |
| Internal developer platform (IDP) | A set of supported capabilities and workflows enabling product teams to self-serve | Can the team provision and operate a compliant service without a manual ticket? |
| Backstage | A framework that can implement parts of a portal/IDP experience | Which catalog, template, and plugin workflows should this instance own? |
| Source of truth | System authoritative for a particular fact | Does ownership come from repo metadata, HR directory, or another governed source? |

Backstage can be the interface to platform capabilities but is not by itself the platform’s underlying cloud resources or policies. Avoid confusing a successful portal page with a reliable self-service capability.

## Examples

**New service onboarding.** A catalog entity points to the repository, owning team, API, docs, deployment dashboard, and support runbook. A vetted template creates a repository with approved CI, health endpoint, telemetry, security defaults, and a catalog descriptor. CI validates metadata and provisioned resources. The team can still work through source control and deployment tools; the portal streamlines discovery and starts the workflow.

**Catalog data drift.** A team renames a service but does not update its catalog metadata. The portal shows a stale owner and incident link. A useful design validates metadata in CI, imports authoritative ownership where appropriate, flags entities with missing/old data, and offers a documented correction path. It does not treat the catalog UI as a source that automatically fixes the repository.

## Common mistakes

- Calling Backstage the whole IDP when provisioning, policy, runtime operations, and team support are missing.
- Installing plugins without a user journey, owner, support model, upgrade plan, or data provenance.
- Treating catalog metadata as true without validation, ownership, and stale-data handling.
- Letting a template create insecure defaults or expose credentials through generated repositories/logs.
- Using a catalog owner field as an access-control decision; metadata ownership and authorization are distinct.
- Duplicating live operational state instead of linking to its authoritative system.
- Building a custom portal for a small organization before establishing that discovery and repeated workflows are genuine bottlenecks.

## Knowledge checks with answers

1. **What is Backstage?** A framework for creating a developer portal using catalog, template, documentation, and plugin capabilities; an organization still designs and operates its platform.
2. **Where can catalog metadata live?** Commonly in YAML files in source control, which Backstage ingests and displays; other integrations are possible.
3. **Does `spec.owner` automatically authorize a user to deploy?** No. Ownership metadata helps people discover responsibility; runtime authorization must be enforced by the relevant system.
4. **How do you know a portal is useful?** Measure whether it improves real developer journeys and platform outcomes, while monitoring data freshness and portal maintenance cost.

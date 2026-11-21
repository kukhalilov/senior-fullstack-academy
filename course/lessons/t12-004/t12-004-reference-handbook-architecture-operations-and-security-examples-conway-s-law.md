# architecture patterns multi-region tenancy and reliability — Reference: Conway's Law

Sources: [HLD Handbook](https://hld.handbook.academy/), [Conway, “How Do Committees Invent?” (1968)](https://www.melconway.com/Home/Committees_Paper.html), [Team Topologies: team interaction modeling](https://teamtopologies.com/key-concepts-content/team-interaction-modeling-with-team-topologies), [Microsoft Azure architecture styles](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/).

## Scope and version

This lesson treats Conway's Law as an organizational observation used to reason about system boundaries, not as a deterministic formula. The original essay dates to 1968; modern team-design language changes, but the underlying question remains: how do communication paths and ownership influence interfaces and dependencies?

## How this group fits the mental model

An architecture is created and operated by people who exchange information, make decisions, and own changes. If two components require frequent coordination but their teams rarely communicate, the software boundary can turn that coordination problem into slow releases, duplicated assumptions, or fragile integration. Conversely, a boundary that aligns with stable ownership can let a team change one part without synchronizing every release with another team.

The useful direction of reasoning is: product capabilities and quality requirements identify responsibilities; responsibilities suggest ownership boundaries; ownership and communication paths influence interfaces; observed delivery friction tells you whether the boundaries work. Do not begin by drawing a team chart and mechanically copying it into the code. Technical cohesion, data ownership, security boundaries, deployment needs, and team cognitive load remain constraints.

## Supplied names explained

- **Conway's Law** — Organizations that design systems tend to produce designs reflecting their communication structures. The original statement is an empirical design observation. It does not say every architecture must exactly mirror the org chart, that team structure is the sole cause of architecture, or that changing a team chart automatically improves a system.

### Practical implications

1. **Boundaries carry communication cost.** A call or event across a service boundary also creates coordination about schemas, failures, ownership, and change. Count that cost alongside runtime latency and infrastructure spend.
2. **Ownership should follow a useful capability boundary.** A team that owns a service should normally be able to build, deploy, observe, and support its behavior without obtaining routine permission from several other teams.
3. **Interfaces make coordination explicit.** Stable APIs, event contracts, compatibility rules, and service-level expectations let teams coordinate asynchronously. They do not eliminate the need to agree on semantics or incident response.
4. **A reorganization has architectural side effects.** Merging teams or creating a new platform group can alter review paths, incentives, and operational ownership. Map actual communication and decision paths before interpreting the change as purely administrative.
5. **Architecture also shapes communication.** A shared database, central approval queue, or synchronous dependency can force teams to coordinate even when the org chart says they are independent. Conway’s Law is useful as a feedback loop, not a one-way law.

## Cross-item comparison

| Lens | Main question | Example signal |
|---|---|---|
| Conway's Law | What system structure is likely to emerge from communication and ownership? | Multiple services change together because decisions are split across teams |
| Domain boundary | Which business rules and data belong together? | Two concepts change for different reasons and have separate invariants |
| Team interaction design | How should teams collaborate while delivering? | A platform team provides a supported capability instead of a ticket queue |
| Modular monolith or microservices | What deployment and runtime boundary is justified? | Independent scaling, isolation, or release cadence is a real requirement |

These lenses inform one another but are not synonyms. Conway’s observation cannot by itself justify microservices. A single product team may own a modular monolith; several teams may collaborate on a shared platform; a service boundary may be technically necessary even when it crosses team ownership.

## Examples

**Checkout and catalog.** Two teams own checkout and catalog. If checkout repeatedly needs catalog schema changes to release, the causes might be a poorly designed contract, unclear product ownership, a shared database, or a genuinely coupled capability. First identify the invariant and change frequency. Possible fixes include a stable read API, a versioned event, transferring a cohesive capability to one team, or keeping the components together. Splitting the database alone does not settle the ownership question.

**Platform team.** Several product teams need secure deployment pipelines. A platform team can offer a paved path with self-service templates, identity, policy checks, and diagnostics. This improves the architecture only if product teams can use and evolve the platform without a manual gate for every ordinary deployment. Measure onboarding time, failure rates, adoption, and platform support burden; a central ticket queue may simply encode a new bottleneck.

## Common mistakes

- Quoting the law as proof that a particular microservice decomposition is correct.
- Reorganizing teams around the current code structure without checking whether that structure serves product and operational goals.
- Creating a separate team for every technical layer, causing routine cross-team handoffs for every feature.
- Assuming a documented API removes the need for ownership, compatibility, observability, and incident agreements.
- Treating team autonomy as zero interaction; healthy teams still coordinate on shared standards and end-to-end outcomes.
- Ignoring architecture-to-organization feedback: system coupling can force coordination and make a nominally autonomous team ineffective.

## Knowledge checks with answers

1. **Does Conway's Law prove that every team should own one microservice?** No. It is a lens for anticipating how communication influences design; service count and boundaries need workload, cohesion, data, security, and operation evidence.
2. **Two teams regularly need synchronized releases. What should you inspect first?** The shared invariant, data ownership, interface semantics, and actual decision/review path. Then decide whether to stabilize the contract, change ownership, or keep the capability together.
3. **How can a platform team reduce organizational coupling?** By offering a well-supported self-service capability with clear ownership and feedback, rather than inserting itself as a manual approval hop for normal work.
4. **Can architecture influence team communication?** Yes. Shared resources and tightly coupled deploys create coordination demand; stable boundaries and tooling can reduce or redirect it.

<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# threat modeling secure design audit logging and incident response — Reference: Assets, trust boundaries, threat identification, and risk treatment

## Scope and version
This lesson covers the assigned threat-modeling and design terms. The scope is a practical application of [OWASP threat modeling](https://owasp.org/www-community/Threat_Modeling), including continuous updates as features and architecture change.

## How this group fits the mental model
Model the system and what matters, identify plausible failures, assess consequences, and choose controls. Use structured categories to broaden thinking, then prioritize based on actual business context and risk.

## Supplied names explained
- `Asset` — Data, service, capability, or business function whose loss or misuse matters. Identify owners and consequences before selecting controls.
- `Security objective` — Desired security property for an asset, such as confidentiality, integrity, availability, or accountability. Make it specific enough to verify.
- `Threat actor` — Person, group, system, or event capable of causing harm, with goals and capabilities relevant to the model. Avoid assuming every threat requires a named human attacker.
- `Attack surface` — Interfaces, components, identities, and paths an actor may use to influence the system. It changes as features and dependencies change.
- `Trust boundary` — Point where data/control crosses between parties with different trust or authority. Authentication does not remove the need to validate data across it.
- `Data-flow diagram` — Visual model of processes, stores, external entities, and flows. Mark trust boundaries and data classifications so threat discovery has concrete structure.
- `Data-flow process` — Component that transforms, validates, stores, or forwards data. Processes can introduce trust transitions even when hosted in one service.
- `Data store` — Persistent or temporary location holding data, including databases, queues, caches, logs, and object storage. Consider access, retention, backup, and deletion.
- `External entity` — Actor or system outside the modeled boundary that sends or receives data. Treat its outputs as untrusted until validated.
- `Threat scenario` — Concrete account of actor/capability, target, action, and consequence. Specific scenarios lead to testable controls better than generic “hacking” labels.
- `Abuse case` — Description of how functionality can be misused contrary to intended rules, such as exporting another tenant's records. It complements normal use cases.
- `Spoofing` — Impersonating a user, service, or component. Consider authentication, key management, and identity propagation.
- `Tampering` — Unauthorized change to data, code, or messages. Consider integrity checks, authorization, immutable evidence, and safe update APIs.
- `Repudiation` — Denial that an action occurred or was performed by a subject. Reliable audit context can support investigation, but logs need integrity and identity quality.
- `Information disclosure` — Exposure of data to an unauthorized party. Include logs, backups, error messages, caches, and side channels in the model.
- `Denial of service` — Making a service or resource unavailable or too costly to use. Consider rate limits, capacity, dependencies, and recovery.
- `Elevation of privilege` — Gaining authority beyond intended permissions. Model tenant boundaries, role assignment, confused deputy paths, and administration.
- `STRIDE threat categories` — A mnemonic grouping Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, and Elevation of privilege. Use it to brainstorm; it is neither exhaustive nor a risk score.
- `Attack tree` — Hierarchical breakdown of attacker goals into subgoals/paths, useful for understanding alternatives and dependencies.
- `Attack path` — Sequence of weaknesses/actions that could reach an attacker objective. Breaking any essential step may reduce the path's viability.
- `Threat likelihood` — Contextual estimate of how plausible a scenario is, given actor capability, exposure, existing controls, and evidence. Do not present false numerical precision.
- `Impact assessment` — Estimate of consequences if the scenario succeeds, including confidentiality, integrity, availability, safety, privacy, operations, and trust.
- `Risk treatment` — Decision to mitigate, accept, transfer/share, or avoid a risk within proper authority. Record assumptions, owner, and review trigger.
- `Security control` — Safeguard or process intended to prevent, detect, or correct a security failure. Define evidence of effectiveness rather than checking only its presence.
- `Defense in depth` — Multiple complementary controls so failure of one does not immediately expose the asset. Avoid redundant controls that share the same failure mode.
- `Least privilege` — Give identities and components only the authority needed, for only as long as needed. Reassess permissions after role or system changes.
- `Fail-safe defaults` — Deny access or operation unless an explicit condition grants it. Ensure errors, missing policy data, and dependency failures do not silently allow.
- `Secure by design` — Integrating security objectives, threat analysis, and protective decisions into architecture and development from the outset and throughout change.
- `Security requirement` — Verifiable statement of required security behavior, such as denying cross-tenant access or redacting tokens from logs. Link it to risks and tests.
- `Misuse case` — Scenario describing system use that violates intended policy or harms an asset. Use it to derive requirements and abuse tests.
- `Supply-chain threat` — Risk from dependencies, build systems, deployment pipelines, or vendors that can alter or expose the product. Include update and provenance boundaries.
- `Privacy threat` — Risk of inappropriate collection, inference, exposure, or use of personal data. Minimize collection and model downstream access/retention.
- `Threat-model review trigger` — Change or event that should prompt model review, such as new feature, architecture/infrastructure change, incident, new dependency, or changed trust assumption. OWASP recommends continuous refinement ([OWASP overview](https://owasp.org/www-community/Threat_Modeling)).

## Cross-item comparison
`Threat` is a possible harmful event; `Vulnerability` is a weakness; `Risk` combines likelihood and impact in context. STRIDE categorizes threat ideas; an attack tree explores how goals can be achieved. A preventive control reduces occurrence; detective controls provide signal; corrective controls limit or recover from impact. OWASP suggests threat models be updated through the lifecycle as features and incidents change the system ([OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)).

## Examples
For a multi-tenant report service, list customer data as an asset, draw user/API/database/export-storage flows, mark tenant and cloud boundaries, and model a malicious authenticated user altering a tenant ID. Define the objective “a user cannot read another tenant's export,” add resource authorization and tenant-constrained queries, and test the cross-tenant abuse case.

## Common mistakes
- Starting with a tool-generated list before defining assets and scope.
- Treating all STRIDE entries equally without likelihood/impact reasoning.
- Modeling only the happy path and omitting operations, logs, vendors, and recovery.
- Treating a control's existence as evidence that it works.
- Failing to update assumptions after architectural change or incident.

## Knowledge checks with answers
1. Does STRIDE produce a risk score? **No.** 2. What differentiates vulnerability from threat? **A vulnerability is a weakness; threat is a possible harmful event/action.** 3. When revisit a model? **After meaningful feature, architecture, dependency, or incident changes.**

# incident response on-call and post-incident learning — Reference: Security response boundaries, evidence handling, and operational governance

# Scope and version

This lesson covers security-oriented incident response, evidence handling, business continuity, and recovery governance. The current general NIST incident-response publication is SP 800-61 Rev. 3 final, published April 2025; it supersedes Rev. 2, withdrawn in April 2025. CISA’s federal incident response playbooks are scoped to U.S. federal civilian executive branch agencies. Legal and regulatory duties vary by jurisdiction and event; use designated counsel and organizational policy. Checked 2026-11-17. [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) [CISA playbooks](https://www.cisa.gov/resources-tools/resources/incident-response-playbooks)

# How this group fits the mental model

Security response adds preservation, containment, eradication, and governance requirements to ordinary service recovery. Restoring availability is not enough if an attacker retains access or evidence is destroyed. Business continuity and disaster recovery prepare the organization to sustain and restore operations; they do not replace incident command, forensic handling, or legal/privacy decision-making.

# Supplied names explained

## Security command and containment

- `Security incident response plan` — The documented policy and procedures for preparing, identifying, analyzing, containing, eradicating, recovering from, and learning from security incidents. NIST Rev. 3 integrates response into broader cybersecurity risk management rather than treating the plan as a standalone checklist.
- `Security incident commander` — The designated coordinator for a security response, with authority defined by organizational policy. They coordinate security, IT, service owners, legal/privacy, and leadership without displacing specialist evidence or regulatory responsibilities.
- `Containment versus eradication` — Containment limits spread or impact; eradication removes the threat or its persistence. A rushed eradication can destroy evidence, while containment alone leaves the threat present.
- `Credential revocation` — Invalidating credentials or tokens suspected of compromise. Coordinate dependent services and preserve audit records; revocation may disrupt workloads or be incomplete if alternate credentials remain.
- `Key rotation during incident` — Replacing cryptographic keys potentially exposed or misused. Plan re-encryption, dependent service rollout, previous-key invalidation, and evidence preservation; rotation alone does not prove attacker access ended.
- `Compromised identity` — A user, workload, service, or privileged identity whose credentials or control may be abused. Determine scope, active sessions, permissions, linked tokens/keys, and audit history before declaring containment.

## Evidence preservation and privacy

- `Forensic image` — A bit-for-bit or otherwise documented capture of a storage device or system state for forensic analysis. Collection method and chain-of-custody requirements depend on policy, system type, and legal context.
- `Chain of custody` — The documented history of who collected, handled, transferred, accessed, and stored evidence. It supports integrity and accountability but must follow the organization’s evidentiary procedures.
- `Evidence integrity` — Confidence that collected evidence has not been altered or that changes are detectable. Use controlled access, cryptographic verification where appropriate, timestamps, provenance, and protected originals.
- `Security log preservation` — Retaining relevant identity, network, application, and infrastructure logs for investigation. Avoid overwriting or changing retention while preserving legal/privacy controls and access auditability.
- `Data breach assessment` — A structured determination of whether protected data was accessed, disclosed, altered, or exfiltrated. It requires evidence and designated privacy/legal/security decision-makers; exposure cannot be inferred from availability symptoms alone.
- `Privacy incident assessment` — Evaluation of possible personal-data impact, scope, affected people, and applicable obligations. Escalate to the privacy function; do not make an unsupported legal conclusion in the technical channel.
- `Legal hold` — An instruction to preserve specified information for a legal matter. Follow counsel’s scope and retention controls, prevent routine deletion where directed, and document preservation actions.
- `Regulatory reporting timeline` — The deadline or schedule that may apply for notifying a regulator. It is determined by applicable laws/regulations and incident facts; there is no universal deadline for all incidents.
- `Third-party incident notification` — A notice from or to a vendor/customer about a relevant incident. Verify authenticity, scope, contractual channels, evidence needs, and internal escalation before sharing sensitive details.
- `Incident access log` — Records of who accessed incident channels, systems, evidence, or privileged capabilities. It helps reconstruct actions and detect unauthorized access; protect the log itself.
- `Incident communications approval` — The review/authorization process for internal, customer, regulator, or public statements. Keep it timely and audience-specific; avoid a bottleneck that prevents required urgent notification.
- `Incident data classification` — Labeling incident artifacts by sensitivity, such as customer personal data, credentials, or forensic findings. Classification determines storage, access, sharing, and retention.
- `Sensitive incident channel` — A restricted communication space for security-sensitive information. Limit membership, but ensure responders have a reliable access path and preserve a controlled record.

## Preparedness and continuity

- `Incident tabletop exercise` — A discussion-based simulation where participants walk through roles, decisions, communications, and plans without necessarily changing production systems. Record gaps and assign verified follow-up.
- `Business continuity plan` — Procedures for maintaining critical business functions during disruption, potentially using alternate processes or facilities. It is broader than a technical restore procedure.
- `Disaster recovery plan` — Procedures and technical capabilities to recover systems, infrastructure, and data after major disruption. It should align with business priorities and be tested through actual recovery exercises.
- `Business impact analysis` — An assessment of critical functions, dependencies, impact over time, and recovery priorities. It informs continuity and recovery targets; assumptions need validation with business owners.
- `Recovery point objective (RPO)` — The maximum targeted data-loss interval after disruption. It is a planning objective and depends on backup/replication and transaction recovery capability.
- `Maximum tolerable downtime` — The longest period a business process can be unavailable before consequences become unacceptable, as determined by the organization. It informs but is not identical to RTO.
- `Crisis communications plan` — Predefined roles, audiences, approval paths, channels, and message patterns for major events. Test alternate channels because the primary service or collaboration platform may be affected.
- `Service dependency map` — A representation of upstream/downstream services and critical dependencies. It helps evaluate blast radius and failover paths; keep it current and distinguish observed from assumed edges.
- `Incident contact tree` — An ordered list of people/roles and alternate ways to contact them. Validate it regularly and protect personal contact details.
- `Vendor escalation contact` — A verified channel or representative for urgent supplier support. Keep contracts, support entitlements, customer/account identifiers, and escalation steps available offline if necessary.

# Cross-item comparison

| Plan or control | Main purpose | Not a substitute for |
| --- | --- | --- |
| Security response plan | Coordinate cybersecurity risk response | Service recovery design or applicable legal advice |
| Business continuity plan | Sustain critical business functions | Technical restore validation |
| Disaster recovery plan | Restore systems/data after disruption | Security eradication or evidence preservation |
| RPO | Bound intended data-loss interval | Maximum outage duration |
| Maximum tolerable downtime | Business limit for unavailable process | Automatically achievable RTO |

Containment can precede eradication; service recovery may occur before the investigation is fully complete if the system is trusted and policy permits. A business continuity workaround may keep a process operating while disaster recovery restores underlying systems. NIST Rev. 3 superseded Rev. 2; do not cite the withdrawn version as current. [NIST status](https://csrc.nist.gov/pubs/sp/800/61/r2/final)

# Examples

A workload identity may have been exposed in a build log. The team restricts access to the log, preserves its original evidence and audit trail, identifies all tokens/keys reachable by the identity, revokes or rotates them using a coordinated plan, and checks for use across relevant services. The security commander coordinates containment and eradication; service owners verify dependent workloads recover; legal/privacy roles assess data exposure and notification duties. The team records chain of custody and keeps the sensitive investigation in an access-controlled channel. The exact report deadlines come from applicable requirements, not a generic incident template.

# Common mistakes

- Treating the withdrawn NIST Rev. 2 as the latest version.
- Rotating one visible key while overlooking derived tokens, alternate credentials, or persistence.
- Reimaging a compromised system before authorized responders preserve evidence.
- Treating a forensic image as trustworthy without collection provenance and integrity controls.
- Posting customer identifiers or credentials into a broad incident channel.
- Claiming that a breach occurred or did not occur without a defined assessment and evidence.
- Assuming CISA’s federal playbook is mandatory for all organizations.
- Treating a backup restore as a complete disaster recovery exercise.
- Equating RPO, RTO, and maximum tolerable downtime.

# Knowledge checks with answers

1. Which revision of SP 800-61 is current? **Rev. 3 final, April 2025; Rev. 2 was withdrawn.**
2. Why preserve evidence before eradication? **Cleanup may overwrite volatile state, logs, or artifacts needed to determine scope and sequence.**
3. Does rotating a key prove containment? **No; assess sessions, derived credentials, alternate access, and observed attacker activity.**
4. Is there one universal regulatory notification deadline? **No; applicable obligations depend on jurisdiction, data, contracts, and event facts.**
5. What does an RPO describe? **The targeted maximum interval of data loss, not the time to restore service.**

# Sources

[NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) · [NIST Rev. 2 withdrawn status](https://csrc.nist.gov/pubs/sp/800/61/r2/final) · [NIST incident response publications](https://csrc.nist.gov/Projects/incident-response/publications) · [CISA incident response playbooks](https://www.cisa.gov/resources-tools/resources/incident-response-playbooks) · [CISA federal playbook PDF](https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cybersecurity_Incident_and_Vulnerability_Response_Playbooks_508C.pdf)

<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# threat modeling secure design audit logging and incident response — Core concepts and how they fit together

## Learning objectives
Build a scoped threat model from assets and data flows, distinguish threat/vulnerability/risk, select controls, design useful safe logs, and explain incident response phases and evidence handling.

## Prerequisites
Understand basic application architecture, users, services, data stores, and security controls. Threat modeling is a decision process, not a guarantee that every attack has been enumerated.

## Core concepts
An asset is something worth protecting; a security objective describes the desired property. A threat actor has goals and capabilities; an attack surface is where the system can be influenced. A trust boundary marks a change in control/trust. A data-flow diagram makes processes, stores, external entities, and data paths visible. Threat scenarios describe plausible harmful events; abuse cases describe system use contrary to intended policy.

Threat, vulnerability, and risk differ: a threat is a potential harmful event/actor action; a vulnerability is a weakness that can enable it; risk combines likelihood and impact in a context. STRIDE categories help brainstorm spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege. They are prompts, not an exhaustive model. OWASP recommends scoped, continuous threat modeling; revisit after new features, incidents, or architecture changes in its [Threat Modeling overview](https://owasp.org/www-community/Threat_Modeling).

## Mechanisms and relationships
For each scenario, choose risk treatment: mitigate through a security control, accept within authority, transfer/share, or avoid/eliminate the risky activity. Preventive controls reduce occurrence; detective controls expose it; corrective controls contain or restore after failure. Defense in depth layers controls so one failure does not expose the whole asset. Least privilege limits authority; fail-safe defaults deny unless allowed. A security requirement states an observable condition that tests and reviews can verify.

Logs support detection, troubleshooting, audit, and investigation. Record events with consistent time, actor/subject, action, target, outcome, and correlation context appropriate to the system. Do not record passwords, bearer tokens, session IDs, or other secrets. Protect logs from unauthorized read, modification, and deletion; control retention and access; centralize collection where useful. Log injection and excessive sensitive data are also risks. [OWASP Logging guidance](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

Incident response is prepared before an event. NIST SP 800-61 Rev. 3 (April 2025) supersedes Rev. 2 and organizes response through CSF 2.0's six connected functions: Govern, Identify, Protect, Detect, Respond, and Recover. Govern/Identify/Protect/Detect support continuous risk management and preparation; Respond and Recover stay ready and are used when incidents occur. Containment, eradication, recovery, and post-incident learning remain useful operational actions, but Rev. 3 does not present Rev. 2's four-phase model as its formal lifecycle. See [NIST Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) and [CSF 2.0](https://nvlpubs.nist.gov/nistpubs/CSWP/NIST.CSWP.29.pdf). Triage/severity establish scope and urgency; preserve evidence and chain of custody when investigations may require it.

## Worked examples
**Spoofing:** attacker uses a stolen credential to impersonate a customer. Prevent with stronger authentication and detect unusual use; model recovery and session revocation too.

**Tampering:** attacker alters an export job parameter to cross tenant boundaries. Validate authorization at the resource boundary and log denied/privileged actions safely.

**Incident:** exposed API key appears in logs. Restrict access, revoke/rotate the key, determine which systems it reached, preserve relevant logs, restore service, and fix redaction/secret handling.

## Misconceptions and edge cases
- A threat model is not a checklist completed once; assumptions change with architecture and adversary capability.
- STRIDE categories do not assign risk automatically or replace abuse cases/business context.
- Logging every request body may create a second sensitive-data breach.
- Containment can disrupt service; choose proportional actions and preserve evidence where needed.
- Eradication and recovery are different: restoring service before removing persistence can repeat compromise.
- Breach notification decisions have legal/jurisdictional requirements; this lesson does not generalize them.

## Knowledge checks with answers
1. What does a data-flow diagram show? **Processes, stores, external entities, and flows across boundaries.**
2. Why exclude tokens from logs? **Logs can become a credential theft path.**
3. What follows containment? **Eradication, then recovery and review, with ordering adapted to incident needs.**


# threat modeling secure design audit logging and incident response — Interview questions and reasoning

## Core questions
1. How do you start a threat model?
2. What should security logs contain and exclude?
3. Distinguish containment, eradication, and recovery.

## Concise interview answers
1. Scope the system, identify assets and objectives, draw data flows and trust boundaries, identify actors/threat scenarios, assess likelihood and impact, then choose and validate controls. OWASP recommends updating the model as the system changes: [Threat Modeling](https://owasp.org/www-community/Threat_Modeling).
2. Include relevant actor, action, target, time, outcome, and correlation context; exclude passwords, tokens, session IDs, and other secrets. Protect log access, integrity, transport, and retention. See [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
3. Containment limits active impact; eradication removes persistence/root cause; recovery restores trustworthy service and monitors for recurrence. Current NIST guidance is SP 800-61 Rev. 3, April 2025: [NIST publication](https://csrc.nist.gov/pubs/sp/800/61/r3/final).

## Deep follow-up answers
**How do you prioritize STRIDE findings?** STRIDE is a brainstorming taxonomy. Prioritize with scenario-specific likelihood, impact, exposure, existing controls, and business context. Record assumptions and risk treatment rather than assigning equal urgency.

**Does one threat-modeling method cover every concern?** No. Choose by objective: STRIDE for technical design, attack trees for multi-step goals, LINDDUN for privacy harms, PASTA for application threats tied to business impact, OCTAVE for organization-wide critical-asset risk, and VAST for scaling application/operational modeling across teams. Methods can complement one another; record scope and gaps.

**How do you keep logs useful but safe?** Define events based on response questions, use structured fields, minimize personal/sensitive data, redact secrets centrally, synchronize clocks, correlate across components, restrict access, protect integrity, and set a retention period. Test failure and debug paths.

**What's current in incident-response guidance?** NIST SP 800-61 Rev. 3 was finalized April 2025 and supersedes Rev. 2. It organizes response through CSF 2.0's six connected functions: Govern, Identify, Protect, Detect, Respond, and Recover. The familiar containment/eradication/recovery actions still apply but are not Rev. 3's formal four phases. CSF 2.0 adds Govern to the five functions in CSF 1.1. It is guidance; legal notification duties depend on jurisdiction and facts.

## Scenario questions
- A cloud key is leaked: contain by revoking it, identify scope, preserve logs, rotate downstream credentials, eradicate unauthorized access, recover, and review leak controls.
- A threat model misses a new data export flow: add the process/store/boundaries, model cross-tenant access and exfiltration, implement checks and tests.
- Logs show user IDs but no timestamps/correlation: improve clock synchronization and event context while excluding credentials.

## Tradeoffs and alternatives
Formal threat analysis provides rigor for complex systems but can be costly; scale methods to risk and change. Detailed logs aid forensics but increase privacy and breach exposure; record minimally sufficient data and protect it. Immediate containment can affect availability; response plans should define decision authority and acceptable tradeoffs in advance.

## Common weak answers
- “We use STRIDE, so the model is complete.” It is a prompt set, not exhaustive.
- “Log everything.” Logs can become a second sensitive-data store.
- “We restored from backup, so the incident is over.” Persistence and root cause may remain.
- “Notification is always required/never required.” Duties depend on jurisdiction and facts.

## Self-check rubric
You can explain assets, boundaries, threat scenarios, risk treatment, and evidence; identify log data that must be redacted; sequence response actions; and cite current NIST Rev. 3 without overgeneralizing legal duties.

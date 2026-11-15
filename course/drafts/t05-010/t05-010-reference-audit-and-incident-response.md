<!-- GENERATED DRAFT: authored locally from the frozen manifest; source-backed facts are cited near the claim. -->

# threat modeling secure design audit logging and incident response — Reference: Security events, protected logs, response lifecycle, and recovery

## Scope and version
This lesson covers audit events, log protection, and response lifecycle. Logging practices follow the [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html). Incident response uses [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final), published April 2025 and superseding Rev. 2. Rev. 3 integrates response recommendations into CSF 2.0 cybersecurity risk management.

## How this group fits the mental model
Logs provide operational and security evidence. A response plan turns detection into coordinated triage, containment, eradication, recovery, and learning. Evidence is useful only if it is relevant, trustworthy, available, and protected from becoming a new source of secrets or privacy exposure.

## Supplied names explained
- `Security audit event` — Structured record of a security-relevant action or outcome. Include enough context for detection and investigation without logging secrets.
- `Authentication success event` — Record that a principal successfully authenticated, with useful context such as time, scheme, and outcome. Avoid credentials, codes, and tokens.
- `Authentication failure event` — Record failed authentication attempts and relevant safe context. Avoid logging submitted passwords or making logs an account-enumeration source.
- `Authorization failure event` — Record a denied access decision with subject, action, target, and policy context appropriate for investigation. Ensure the event itself does not reveal sensitive resource data.
- `Privileged action event` — Record administrative or elevated actions, their actor, target, time, and result. Alert on unexpected patterns and protect records from alteration.
- `Sensitive data access event` — Record access to sensitive data where audit needs justify it. Minimize fields and avoid copying the underlying sensitive content into the log.
- `Input validation failure event` — Record rejected inputs or validation categories to detect abuse. Sanitize values to prevent log injection and avoid storing full sensitive payloads.
- `Security log redaction` — Removing or masking secrets and unnecessary sensitive data before logging. Apply centrally and test error paths and structured properties.
- `Secret and token exclusion` — Never record passwords, access/refresh tokens, session identifiers, private keys, or equivalent bearer secrets. Redact authorization headers and query parameters.
- `Correlation identifier` — Identifier linking related requests/events across components. Treat caller-supplied IDs as untrusted; generate or validate them and avoid using them as identity proof.
- `Clock synchronization` — Keeping system clocks sufficiently aligned for event ordering and investigation. Record timezone/clock assumptions and account for skew.
- `Log integrity protection` — Controls preventing or detecting alteration/deletion of logs, such as access separation, append-oriented storage, integrity monitoring, and protected central collection.
- `Log access control` — Limiting who can read, write, export, or delete logs. Logs may contain sensitive metadata and can affect investigations.
- `Log retention period` — Duration logs are kept before deletion or archival. Set according to operational, security, privacy, and applicable policy needs; avoid indefinite collection by default.
- `Centralized log collection` — Aggregating events from services into a controlled system for search/correlation/alerting. Protect transport, tenant separation, availability, and ingestion limits.
- `Alert threshold` — Condition or rate that triggers investigation. Tune to event volume and consequence; thresholds are signals, not incident proof.
- `False-positive tuning` — Adjusting detection rules to reduce noise without hiding meaningful attacks. Reassess after system or attack-pattern changes.
- `Incident response plan` — Defined roles, communication, escalation, decision authority, tools, and procedures for suspected security incidents. Maintain and exercise it before incidents.
- `Incident severity classification` — Categorization of urgency/impact to guide escalation and resource allocation. Define criteria and allow reclassification as facts emerge.
- `Incident triage` — Initial validation, scope, impact, priority, and immediate action assessment. Preserve relevant evidence and avoid delaying urgent containment for perfect certainty.
- `Containment` — Limiting an incident's spread or impact, such as isolating a workload or revoking a credential. Balance service continuity, evidence, and risk.
- `Eradication` — Removing attacker access, persistence, malicious artifacts, or root cause after containment. Closing one account without addressing persistence may be insufficient.
- `Recovery` — Restoring systems/data to trusted operation, validating controls, and monitoring for recurrence. Restore only from known-good sources and verify dependencies.
- `Post-incident review` — Structured review of what happened, response effectiveness, and improvements without blame-driven concealment. Track actions to completion.
- `Evidence preservation` — Maintaining original logs/artifacts and metadata so they remain useful and trustworthy for analysis. Limit handling and document acquisition.
- `Chain of custody` — Record of who collected, handled, transferred, and stored evidence and when. It supports integrity and accountability where formal investigation requires it.
- `Breach notification decision` — Assessment by authorized legal/privacy/security stakeholders whether and when notification duties apply. Requirements vary by jurisdiction and facts; this lesson does not give generalized legal rules.
- `Credential rotation during response` — Revoking/replacing exposed credentials and updating dependent systems. Prioritize credentials by impact and verify old credentials no longer work.
- `Vulnerability disclosure process` — Defined intake, validation, communication, remediation, and coordination for vulnerability reports. Provide a route for good-faith reports and track affected versions.
- `NIST SP 800-61 Rev. 3` — NIST publication finalized April 2025, superseding Rev. 2 and integrating incident response into CSF 2.0 risk management. It is guidance for cybersecurity risk management, not a universal legal mandate.
- `Tabletop exercise` — Discussion-based simulation where responders walk through a scenario, roles, decisions, communications, and gaps without executing live changes. Record and address lessons.

## Cross-item comparison
`Containment` limits ongoing impact; `Eradication` removes the cause/access; `Recovery` restores trustworthy operations. Preventive controls reduce likelihood; detective controls surface activity; corrective controls limit consequences or restore service. Logs must exclude secrets while preserving enough correlation context. NIST Rev. 3 broadens response integration into organizational risk management; it supersedes Rev. 2 ([NIST publication](https://csrc.nist.gov/pubs/sp/800/61/r3/final)).

## Examples
An alert detects repeated use of a leaked API key. Triage determines which systems accepted it; contain by restricting/revoking the key and isolating affected workloads; preserve relevant audit logs; eradicate unauthorized access/persistence; rotate dependent credentials; restore and monitor; then review how the key entered logs and improve redaction/scanning. Do not include the token value in incident tickets.

## Common mistakes
- Logging request bodies or headers wholesale.
- Treating an alert as confirmed incident or, conversely, waiting for certainty while compromise spreads.
- Rotating one credential but leaving copied credentials valid at downstream services.
- Deleting logs during cleanup before preserving relevant evidence.
- Recovering from compromised backups or restoring before persistence is removed.
- Treating NIST guidance as jurisdiction-independent notification law.

## Knowledge checks with answers
1. Which phase limits spread? **Containment.** 2. Which removes persistence/root cause? **Eradication.** 3. What should never appear in logs? **Passwords, bearer tokens, session identifiers, and similar secrets.**

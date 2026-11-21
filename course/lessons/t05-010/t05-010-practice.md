
# threat modeling secure design audit logging and incident response — Exercises and worked solutions

## Goals
Turn a system change into concrete threats, controls, safe evidence, and a coordinated response sequence.

## Worked example
A worker exports data after receiving a queue message. Draw the API, queue, worker, database, and object storage. Mark user-to-API, API-to-queue, worker-to-database, and worker-to-storage trust boundaries. A threat scenario is “a user crafts a message that causes export of another tenant's records.” Require tenant-scoped authorization and server-generated export parameters, then log actor, tenant, job ID, outcome, and correlation ID without payload/token values. OWASP describes iterative threat modeling in its [Threat Modeling overview](https://owasp.org/www-community/Threat_Modeling).

## Exercises
1. An audit log stores full `Authorization` headers for debugging. Identify the risk and a safer logging design.
2. A new file-upload feature changes trust boundaries, but the threat model is two years old. What should trigger review?
3. An exposed database credential is found in a build log. Order the main response activities and name a common omission.
4. STRIDE produces six threats; the team treats each as equal priority. What information is missing?
5. A service stores logs forever “just in case.” What should determine a retention policy?
6. A privacy-sensitive multi-tenant system needs both abuse analysis and organization-wide risk prioritization. Which threat-model perspectives could complement each other?
7. A team presents “preparation, detection/analysis, containment/eradication/recovery, post-incident activity” as NIST Rev. 3's formal phases. What should be corrected?

## Progressive hints
1. Bearer secrets can be replayed. 2. Features and architecture change attack surfaces. 3. Stop ongoing access before broad cleanup. 4. Threat categories are prompts, not risk scores. 5. Include purpose, policy, privacy, and investigative needs. 6. Use different methods to answer different risk questions. 7. Compare Rev. 2's older phase model with Rev. 3's CSF 2.0 functions.

## Complete solutions
1. Authorization headers may contain reusable bearer tokens. Redact the header at the logging boundary; record scheme, actor, request ID, target, and outcome as appropriate. Check logs, backups, and downstream sinks for existing exposure. OWASP lists secrets/tokens among data to exclude in its [Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
2. Review the threat model because a new feature changes flows/attack surface. Also revisit after architecture/infrastructure changes, dependencies, incidents, or changed assumptions; update controls and tests.
3. Triage scope and impact; contain by revoking/restricting the credential and relevant access; preserve logs/evidence; eradicate unauthorized access/persistence; rotate dependent credentials; recover and monitor; perform a post-incident review. A common omission is failing to revoke the credential at the database or leaving downstream copies valid. Use [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) as current response guidance.
4. Likelihood and impact in the system context, plus existing controls, exposure, actor capability, and business objectives. STRIDE does not assign priority automatically.
5. Define retention from operational/security investigation needs, privacy/data minimization, policy, system constraints, and applicable requirements. Protect access and integrity and securely dispose of logs at end of retention.
6. STRIDE can prompt technical abuse/security scenarios, LINDDUN adds privacy-specific harms, and OCTAVE can help prioritize organizational risk to critical assets. The methods are complementary; choose and scope them deliberately rather than claiming one is exhaustive.
7. Rev. 2 used that four-phase model. Rev. 3 supersedes it and organizes incident response through CSF 2.0's Govern, Identify, Protect, Detect, Respond, and Recover functions; containment, eradication, and recovery remain useful actions within that broader model.

## Tests and edge cases
- Logs never contain credentials in success, failure, exception, or debug paths.
- Correlation IDs link events across services but cannot be used to impersonate a user.
- Incident plan names decision makers and alternate contacts when primary staff are unavailable.
- Containment action is tested for impact and rollback where feasible.
- Recovery verifies known-good code/data and monitors for recurrence.
- Threat model is revisited after material architecture changes and incidents.

## Reflection questions
What is the highest-value asset in your current feature? Which boundary changed? Which event would reveal abuse? How would you contain a leaked credential within minutes?

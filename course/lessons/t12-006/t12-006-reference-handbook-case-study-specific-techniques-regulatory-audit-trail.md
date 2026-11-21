# end-to-end system design case studies — Reference: Regulatory audit trail

Sources: [NIST SP 800-53 Rev. 5, AU controls](https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final), [NIST SP 800-92 log management](https://csrc.nist.gov/pubs/sp/800/92/final), [NIST SP 800-92 Rev. 1 project](https://csrc.nist.gov/projects/log-management).

## Scope and version

An audit trail is a protected record of events needed to reconstruct significant actions and support accountability, investigation, and control evidence. The exact events, fields, retention periods, and safeguards depend on the system’s threat model, contracts, and applicable laws or standards. NIST SP 800-92 Rev. 1 is published as an initial public draft in the cited project material, while the 2006 SP 800-92 remains the final older publication; neither is a substitute for current legal or sector-specific requirements.

## How this group fits the mental model

Operational logs help diagnose runtime behavior; audit records answer who performed which security- or business-significant action, on which object, when, and with what result. A mature design defines auditable events before choosing a storage product. It captures records at trusted service boundaries, protects them from unauthorized changes, routes them to separately controlled storage, and provides a query path for authorized reviewers.

An audit trail is not automatically legally admissible, nonrepudiable, complete, or compliant merely because it is append-only or stored in a cloud service. Identity assurance, clock quality, event coverage, access controls, integrity evidence, retention policy, and operational procedures all matter. Document residual gaps, especially actions that occur in external systems or during partial outages.

## Supplied names explained

- **Auditable event**: a defined action or state transition worth recording, such as authentication changes, permission grants, data exports, approvals, payment state changes, or administrative overrides. Avoid logging every low-value event without a use case.
- **Actor and subject**: the authenticated user, service, or delegated agent that initiated an action, plus the target account, record, or resource. Preserve delegation context where needed and avoid trusting a client-supplied actor name.
- **Event outcome**: success, failure, denial, or indeterminate result. For timeouts, record that the result is unknown until reconciled rather than asserting failure.
- **Event context**: timestamp, event type, object identifier, source/service, request or transaction ID, relevant before/after state or change summary, and reason/approval reference where appropriate. Minimize payloads that contain secrets or unnecessary personal data.
- **Integrity protection**: access controls, cryptographic hashes or signatures, append-only/WORM storage where appropriate, and separation of duties that make unauthorized alteration detectable or difficult. A hash chain alone does not prove the source was truthful or prevent an attacker from rewriting the entire chain if keys and anchors are compromised.
- **Time synchronization**: a common time source and recorded clock uncertainty help order events. Wall-clock timestamps can drift; include sequence/version or transaction IDs when exact ordering matters.
- **Retention and disposal**: a governed duration and deletion process balancing investigation needs, data minimization, legal holds, storage cost, and applicable rules. There is no single correct retention period for all systems.
- **Audit pipeline health**: evidence that sources are enabled and records arrive. Missing logs, queue saturation, dropped records, parser errors, or clock skew should alert operators; a silent logging outage is a control failure.

## Cross-item comparison

Application debug logs are often high volume and developer-oriented; audit records should be deliberately scoped, structured, access-controlled, and retained according to defined policy. An event-sourcing log records domain changes to rebuild application state; an audit trail records accountability evidence and may reference domain events without replacing the system of record. Security information and event management (SIEM) tools aggregate and analyze telemetry, but they do not make upstream records complete or tamper-resistant by default.

Centralized storage improves search and separation from source systems but creates a sensitive concentration of data. Write-once storage and cryptographic integrity controls can strengthen evidence but make correction, deletion, legal hold, and retention expiration more complex. Design lifecycle and access policies together with the audit schema.

## Examples

When an administrator changes a customer’s access role, emit an audit event from the authoritative service after validating the caller and committing the change. Include the authenticated actor/service identity, target account, old and new role or a safe change summary, event time, request ID, result, and any approval reference. Send it through a bounded durable outbox or equivalent so a database commit and an audit-record loss cannot silently diverge. If delivery is delayed, expose and alert on the pending state.

For a payment authorization that times out, record the request ID and outcome as unknown, then reconcile with the payment provider. Later record the provider result as a linked event. Do not overwrite the first record; a reviewer should see both the uncertainty and the resolution. Keep payment secrets and full card data out of the audit stream.

## Common mistakes

- Treating ordinary debug logs as a complete audit trail.
- Accepting actor identity or timestamps directly from an untrusted client.
- Recording secrets, full credentials, or excessive personal data.
- Claiming legal compliance from a storage feature without mapping required controls.
- Calling hash chaining or append-only storage proof that the event producer was truthful.
- Silently dropping audit events when a downstream sink is unavailable.
- Failing to monitor source coverage, pipeline lag, and dropped-event counts.
- Overwriting uncertain outcomes instead of appending a linked reconciliation event.
- Choosing retention without considering legal holds, privacy, and secure deletion.

## Knowledge checks with answers

1. **What should an audit record establish?** Who or what performed which significant action on which subject, when, and with what outcome, within the system’s defined scope.
2. **Does a hash chain guarantee that the original event is truthful?** No. It can help detect alteration under key and anchoring assumptions, but it cannot prove the producer reported reality.
3. **How should a timeout be recorded when the effect may have succeeded?** As indeterminate or unknown, followed by a linked reconciliation event when the outcome is learned.
4. **Is there one universal audit retention period?** No. Determine it from applicable requirements, investigation needs, privacy constraints, and approved policy.

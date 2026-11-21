# end-to-end system design case studies — Reference: Design RFC and Architecture Decision Record (ADR)

Sources: [AWS Prescriptive Guidance: Architectural Decision Records](https://docs.aws.amazon.com/prescriptive-guidance/latest/architectural-decision-records/), [UK Government Digital Service: Documenting architecture decisions](https://gds-way.digital.cabinet-office.gov.uk/standards/architecture-decisions.html), [MADR: Markdown Architectural Decision Records](https://adr.github.io/madr/), [Michael Nygard: Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

## Scope and version

A design RFC (request for comments) is a proposal shared for discussion and review; an architecture decision record (ADR) is a concise record of one significant decision and why it was made. Teams use these terms and templates differently. This lesson compares their common roles and describes lightweight decision documentation, not a mandated process. Sources checked 2026-11-21.

## How this group fits the mental model

Architecture decisions create consequences that may outlast the people who made them. A proposal helps stakeholders reason before committing; a decision record preserves what was chosen, the context, and the trade-offs after discussion. The goal is not more paperwork. Record the decision when future work could reasonably revisit it and would otherwise lack the rationale.

## Supplied names explained

- **Design RFC / proposal:** a reviewable document that frames the problem, goals/non-goals, requirements, options, proposed approach, interfaces or data flow, risks, rollout, and open questions. It invites alternatives and feedback before a decision is final. “RFC” can mean different things across organizations and is unrelated to the status or authority of IETF standards documents unless explicitly stated.
- **ADR:** a focused record of one architecturally significant decision. A common Nygard-style format includes title, status, context, decision, and consequences. MADR and other templates may add decision drivers, considered options, pros/cons, or validation. There is no single required universal template.
- **Context:** state the facts and constraints that make the decision necessary: user needs, scale, reliability/security requirements, current system boundaries, and relevant alternatives.
- **Decision:** record the chosen direction clearly, including scope and conditions. Distinguish the decision from implementation tasks and from options that remain open.
- **Consequences:** include benefits and costs, risks, operational burden, migration implications, and follow-up work. A decision record should make trade-offs visible rather than presenting the choice as universally best.
- **Status and history:** common statuses include proposed, accepted, deprecated, or superseded, but teams define their lifecycle. When a decision changes, preserve the historical record and link the replacement; update in place only when the earlier record was never adopted and local practice permits it.
- **Ownership and review:** agree who owns a proposal, who must be consulted, how feedback is resolved, and who records acceptance. A document alone does not create consensus or authority.
- **Repository and links:** teams often keep ADRs near the code or in a discoverable architecture repository and link them to design docs, issues, and implementation. Choose a location with durable ownership and history.

## Cross-item comparison

| Artifact | Main purpose | Typical level of detail |
| --- | --- | --- |
| Design RFC/proposal | Explore a problem and solicit review before commitment | Broader problem, goals, options, design, risks, rollout, questions |
| ADR | Preserve one decision and rationale | Short context, decision, status, consequences, links |
| Architecture overview | Explain the system as it exists or is intended to exist | Components, boundaries, flows, deployment, ownership |
| Meeting notes | Capture discussion and actions | Useful record of conversation; not necessarily a clear decision |

An RFC can result in one or more ADRs; an ADR can link to a longer proposal. Avoid duplicating the full architecture in every decision record. The exact workflow is a team convention.

## Examples

An RFC proposes how a service will support idempotent payment requests. It states the duplicate-charge requirement, client retry behavior, provider constraints, alternatives (database uniqueness, idempotency-key table, or provider-side key), failure races, rollout, monitoring, and open questions. Reviewers challenge the retention period and multi-region behavior. After agreement, an ADR records: “We persist an idempotency key scoped to account and operation, return the prior result for matching retries, and reject key reuse with a different request.” Its consequences include storage/retention cost, a required uniqueness constraint, and reconciliation behavior for uncertain provider outcomes. The implementation ticket links to both documents.

## Common mistakes

- Treating a proposal as already accepted or an ADR as a complete design specification.
- Recording the decision without context, alternatives, consequences, or constraints that could invalidate it later.
- Writing one massive ADR that bundles unrelated decisions and cannot be superseded cleanly.
- Updating history so readers cannot tell what was previously accepted and why it changed.
- Assuming “RFC,” “ADR,” or a status label has identical meaning across companies.
- Requiring an ADR for every small implementation choice and creating process overhead.
- Treating approval of a document as proof that implementation, testing, migration, or operational ownership is complete.

## Knowledge checks with answers

1. **How does a design RFC differ from an ADR?** A proposal invites review of a broader problem and options; an ADR records a specific decision and its rationale.
2. **What minimum context should an ADR preserve?** The decision’s context, the decision itself, and its consequences; a template may add status and options.
3. **What should happen when an accepted decision changes?** Preserve the history and record/link the replacement according to team convention.
4. **Does an ADR replace an architecture overview?** No. It documents a decision, not the entire system.
5. **When is decision documentation useful?** When a future engineer could revisit a consequential choice and needs its rationale, constraints, and costs.

## Review status

Reviewed 2026-11-21. Replaced the generic placeholder with an evidence-based distinction between proposal/RFC and ADR. Checked AWS, UK Government, MADR, and Nygard materials for minimum sections, consequences, lifecycle, and variation between templates. Corrected the risk of treating RFC as one standardized artifact or ADR as a full architecture document. No material omission remains in the supplied topic scope.

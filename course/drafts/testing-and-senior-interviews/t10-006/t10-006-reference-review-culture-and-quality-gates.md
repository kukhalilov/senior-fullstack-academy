# code review refactoring and legacy modernization — Reference: Team conventions, ownership, automated checks, and learning

# Scope and version

This lesson describes team mechanisms for consistent review and change safety. Ownership, response-time targets, required gates, and approval policy are organization-specific. Automated checks should be treated as evidence for the exact code revision and configuration that ran. The names below are the complete assigned group.

# How this group fits the mental model

Repeatable checks catch classes of defects consistently; human review supplies context, intent, and judgment. Team conventions help people coordinate without re-negotiating every change. Healthy culture lets reviewers raise risks and authors explain tradeoffs while the team remains accountable for outcomes. Google’s guidance presents review as both quality control and knowledge sharing, not only defect hunting. [Google Engineering Practices](https://google.github.io/eng-practices/)

# Supplied names explained

- `Code ownership` — A declaration of people or teams responsible for particular code or decisions. Ownership can route reviews and incidents, but should not become a knowledge bottleneck or imply that others need no responsibility.
- `Reviewer rotation` — Distributing review work among qualified team members. Rotation broadens knowledge and reduces queue concentration; sensitive or specialized changes may still require designated expertise.
- `Review service level` — A team expectation for response or queue time. It should make waiting visible and encourage healthy flow, not reward superficial approval or force unsafe deadlines.
- `Style guide` — A shared set of conventions for writing and organizing code. Rules that can be checked mechanically should usually be automated to keep human review focused on meaningful choices.
- `Formatting check` — A tool or CI step that detects or applies formatting conventions. Formatting changes should be isolated from behavior changes when mixed output would obscure review.
- `Static analysis check` — Automated inspection of code without running the full program, such as compiler diagnostics or configured analyzers. Results depend on rules, configuration, and what the analyzer can infer; teams should tune signal and ownership for findings.
- `Unit test gate` — A rule requiring a selected unit-test suite to pass before integration or release. It can catch local logic regressions but cannot establish cross-service or production behavior alone.
- `Integration test gate` — A rule requiring a system-boundary test suite to pass. It checks interactions and wiring but may be slower, more environment-sensitive, or less isolated than unit tests.
- `Security scan gate` — A required automated security check, such as dependency or static analysis scanning. It can identify known issue patterns but does not prove a system secure; triage and timely remediation ownership are necessary.
- `Continuous integration status` — The reported result of automated checks for a particular revision. Confirm the status corresponds to the current commit and required workflows; stale, skipped, or misconfigured checks do not establish safety.
- `Review checklist maintenance` — Updating review prompts when incidents, architecture, or requirements reveal recurring risks. A checklist should stay short and actionable; stale or enormous lists become ritual.
- `Psychological safety in review` — A working environment where people can raise concerns, ask questions, admit uncertainty, and disagree without humiliation or retaliation. It supports learning while preserving clear accountability for decisions and systems.
- `Blameless review` — Analysis focused on conditions, incentives, information, and system defenses rather than assigning moral fault to an individual. Blamelessness does not mean avoiding ownership or corrective actions.
- `Review retrospective` — A periodic examination of review flow and quality: wait times, repeated misunderstandings, escaped defects, load, and usefulness of feedback. Use evidence to improve the process rather than rank people by simplistic counts.
- `Review culture` — The shared norms and behaviors around how changes are proposed, examined, discussed, and learned from. It is shaped by leadership, workload, tooling, response patterns, and whether people act on feedback.
- `Trust boundary review` — A focused examination of where data or authority crosses between principals, processes, services, or networks. Check identity, authorization, validation, secret handling, privacy, and audit needs relevant to the change.
- `Documentation update` — A change to user, developer, operator, or architecture documentation needed to keep it aligned with behavior. Identify the audience and update the durable source; comments in the diff may not reach users or operators.
- `Release note update` — A summary of user- or operator-relevant changes for a release. Include migration, deprecation, compatibility, or operational actions when they affect consumers.
- `Follow-up issue` — A tracked item for work intentionally outside the current scope. It should have an outcome, owner or owning team, and enough context to avoid becoming an unsearchable promise.
- `Architecture Decision Record` — A concise record of an important architecture decision, its context, alternatives, consequences, and status. It captures why a choice was made, not only what the code now does.

# Cross-item comparison

| Mechanism | Strong at | Limitation |
| --- | --- | --- |
| Style guide and formatting check | Shared conventions and mechanical consistency. | Neither evaluates whether the design solves the right problem. |
| Static analysis and unit/integration gates | Repeatable checks over code or configured behavior. | They only cover encoded rules and exercised paths. |
| Security scan and trust-boundary review | Finding known patterns and reasoning about authority/data flow. | A scanner does not understand every business permission or threat; a human may need specialist help. |
| Ownership and reviewer rotation | Routing responsibility and spreading context. | Overly narrow ownership creates silos; rotation without expertise can miss high-risk issues. |
| Blameless review and accountability | Learning without personal blame while assigning system improvements. | “Blameless” must not be used to leave actions unowned or ignore deliberate misconduct where policy requires a separate process. |
| Follow-up issue and ADR | Follow-up issue tracks work; ADR records a decision and rationale. | A decision record is not a task list; a task without context may lose why it matters. |

# Examples

### Add a gate after a recurring failure

Two releases mishandle tenant authorization in the same service boundary. The team adds a focused integration test for cross-tenant access, makes that test part of the required gate, assigns an owner for failures, and reviews whether the test protects the actual boundary. The checklist now reminds reviewers to inspect authorization for data-fetch changes. A retrospective checks whether the gate catches the intended regression without adding a large amount of flaky suite time.

### Record a decision and work separately

The team decides that a legacy adapter will remain until all supported clients use the new API. An ADR records context, alternatives, compatibility consequences, and the decision. A follow-up issue records the telemetry needed to confirm client migration and the removal task. The ADR explains why; the issue drives work.

# Common mistakes

- Measuring review quality by comment count, approval speed, or number of lines changed.
- Requiring every check on every change without considering risk and feedback time.
- Allowing a failing or flaky gate to become routinely ignored.
- Treating code ownership as permission to block all contributors or as a single point of failure.
- Using checklists to replace reading and understanding the change.
- Calling a review blameless while assigning vague actions such as “team should be more careful.”
- Writing an ADR without its decision context or leaving it marked current after the decision is superseded.
- Adding a follow-up issue with no owner, outcome, or link to the risk it mitigates.
- Updating internal developer notes while leaving affected users or operators with stale documentation.

# Knowledge checks with answers

1. **What does a green CI status mean?** Configured checks passed for a particular revision and environment; it does not prove the requirements or checks are complete.
2. **Why separate mechanical style rules from human judgment?** Automation applies repetitive rules consistently and preserves reviewer attention for correctness, context, and design.
3. **What is the difference between an ADR and a follow-up issue?** An ADR preserves decision context and consequences; an issue tracks a concrete piece of work.
4. **Can blameless analysis still assign owners?** Yes. It avoids personal blame while assigning accountable owners for system improvement actions.
5. **What should a review service level optimize?** Healthy response and flow while preserving review quality and routing appropriate expertise—not approval speed alone.

# Sources

- [Google Engineering Practices](https://google.github.io/eng-practices/)
- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google author guide](https://google.github.io/eng-practices/review/developer/)
- [Fowler: blameless postmortem culture](https://sre.google/sre-book/postmortem-culture/)
- [Fowler: evolutionary database design](https://martinfowler.com/articles/evodb.html)

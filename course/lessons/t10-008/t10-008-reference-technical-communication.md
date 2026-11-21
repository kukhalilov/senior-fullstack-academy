# mentorship communication estimation planning and leadership — Reference: Written, synchronous, asynchronous, and cross-functional communication

# Scope and version

This lesson explains the assigned communication artifacts and behaviors. Channel selection and documentation policy depend on the audience, urgency, sensitivity, and organization. The names below are the complete assigned group.

# How this group fits the mental model

Communication helps people share a decision and its context. Put the main point early, explain the evidence and assumptions, surface risks, and give a next step. Choose a medium that lets the intended audience respond and preserves important decisions. Google’s documentation guidance emphasizes useful, current documents and updating documentation with code changes when relevant. [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)

# Supplied names explained

- `Audience analysis` — Identifying who needs the message, what they know, what they need to decide or do, and what detail is appropriate. It helps avoid both unexplained jargon and unnecessary simplification.
- `Executive summary` — A brief statement of outcome, decision, impact, and major risk for readers who need the essential point first. It should be supported by deeper detail when needed.
- `Decision statement` — A direct statement of what is decided, proposed, or requested and who owns the decision. Do not bury the ask in background.
- `Context and rationale` — The relevant situation and reasoning that explain why a decision or request is needed. Include enough to evaluate it, not a full history dump.
- `Assumption statement` — Explicitly identifying a belief treated as true for planning or design, plus how it may be checked. This lets others challenge uncertainty before it becomes a hidden dependency.
- `Risk statement` — A concise description of a possible adverse event, its impact, likelihood or uncertainty, and response/owner where appropriate. “There is risk” without consequence or trigger is not actionable.
- `Tradeoff summary` — Benefits accepted and costs or risks incurred by a choice. State why the balance fits the current constraints and what evidence might cause reconsideration.
- `Written design proposal` — A durable explanation of problem, goals, constraints, options, proposed design, failure behavior, rollout, and open questions. Invite feedback before implementation locks in expensive decisions.
- `Architecture Decision Record (ADR)` — A concise record of architectural context, decision, alternatives, and consequences. It is a historical decision artifact, not necessarily a current implementation specification.
- `Status update` — A short current report of outcome, progress, blocker/risk, next action, owner, and when the next update is expected. Distinguish completed facts from forecast.
- `Progress report` — A more structured account of progress against a goal, including delivered evidence, remaining work, changes, and outlook. It should report outcomes rather than only busy activity.
- `Escalation message` — A request for help or decision when impact, risk, or delay exceeds current authority. State the needed decision, deadline, context, options, consequences, and recommendation.
- `Technical explanation` — An account of mechanisms, interfaces, constraints, and evidence at a level useful to technical readers. Define unfamiliar terms and relate details to the decision.
- `Plain-language explanation` — An explanation using familiar words and concrete consequences for readers who do not need implementation detail. Do not remove important uncertainty or misrepresent technical facts.
- `Asynchronous communication` — Communication that participants can read and answer at different times, usually through a durable written channel. It supports schedule flexibility and thoughtful review but may slow urgent clarification.
- `Meeting agenda` — A plan for the meeting’s purpose, topics, preparation, and decisions needed. It lets participants decide whether they need to attend and prepare.
- `Decision log` — A findable record of decisions, date/context, owner, and consequences, especially when decisions evolve. Link to full ADRs for substantial choices.
- `Meeting notes` — A concise record of discussion outcomes, decisions, open questions, actions, owners, and dates. A transcript is rarely a substitute for a useful summary.
- `Cross-functional collaboration` — Working with people from different disciplines toward a shared outcome. Clarify vocabulary, constraints, interfaces, and decision rights instead of assuming every function optimizes the same measure.
- `Stakeholder alignment` — Shared understanding of goals, constraints, responsibilities, and decisions among affected parties. Alignment is not identical agreement with every implementation detail.
- `Disagreement framing` — Presenting a difference around goals, evidence, assumptions, or tradeoffs rather than personal motives. Invite correction and distinguish a decision from unresolved risk.
- `Question clarification` — Asking what outcome, scope, or condition an ambiguous request means. Concrete examples and counterexamples often expose different interpretations.
- `Communication channel choice` — Selecting synchronous, asynchronous, written, or live discussion based on urgency, complexity, sensitivity, access, and need for a record.
- `Feedback invitation` — Explicitly asking for critique or missing perspectives, ideally with a focus question and a useful response window. “Any thoughts?” may be too vague to elicit meaningful feedback.

# Cross-item comparison

| Channel or artifact | Best for | Pair with |
| --- | --- | --- |
| Asynchronous message | Proposals, status, broad participation, thoughtful review. | A clear question, response date, and follow-up meeting if ambiguity remains. |
| Meeting | High ambiguity, negotiation, sensitive conflict, rapid back-and-forth. | Agenda, decision owner, and written notes with actions. |
| ADR and decision log | Preserving rationale and discoverability of decisions. | Updated implementation docs and tasks where work remains. |
| Executive summary and technical explanation | Different reader needs around one decision. | Consistent facts so simplification does not change meaning. |
| Status update and progress report | Quick state and broader evidence against an outcome. | Explicit facts, forecast, owner, risk, and next update. |

# Examples

### Escalation message

“Decision needed by Thursday: keep the current vendor through the launch or delay launch to switch. The new vendor sandbox rejects a field required by two current customers. We can ship the existing integration and migrate next release, or pause rollout while the vendor confirms support. I recommend the first option because it avoids customer disruption; risk is continued contract cost for one month. I own the technical comparison; product owns the launch decision.”

### Plain-language and technical versions

Plain language: “The import may show a customer’s old address until the next sync, so support should not promise an immediate update.”

Technical detail: “The importer processes updates asynchronously. The current queue delay is up to five minutes; until the write acknowledgement is available, the API reads from the prior projection. We should expose a pending state rather than return a stale success.”

Both statements express the same behavior at different detail levels.

# Common mistakes

- Starting with a long history before stating the decision or request.
- Using an executive summary that hides material uncertainty or downside.
- Sending an urgent escalation without saying what decision is needed or by when.
- Choosing a meeting to avoid writing down a proposal or rationale.
- Recording meeting notes with discussion but no decisions, owners, or next steps.
- Using plain language to overstate certainty or omit meaningful technical constraints.
- Asking “thoughts?” without identifying the question or relevant expertise desired.
- Treating stakeholder alignment as universal consensus on implementation details.
- Keeping an ADR without marking it superseded when the decision changes.

# Knowledge checks with answers

1. **What should appear early in a decision message?** The decision/request, owner, and deadline if there is one, followed by context, rationale, risks, and options.
2. **When should a meeting be followed by written notes?** When decisions, actions, or open questions need to be discoverable and actionable afterward.
3. **How does plain-language explanation differ from removing technical truth?** It changes vocabulary and level of detail while preserving behavior, uncertainty, and consequence.
4. **What turns an escalation into an actionable request?** A specific decision/help needed, deadline, options and consequences, owner, and recommendation.
5. **Does alignment require consensus?** No. People can understand the goal and decision path while a named owner decides after consultation.

# Sources

- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)
- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)

# mentorship communication estimation planning and leadership — Reference: Technical leadership, decision making, influence, and follow-through

# Scope and version

This lesson covers engineering leadership behaviors independent of job title. Authority and escalation paths vary by organization; identify local decision rights. The names below are the complete assigned group.

# How this group fits the mental model

Leadership aligns people to an outcome, surfaces uncertainty, clarifies who decides, and follows through. It combines technical judgment with communication and coordination. The Microsoft planning material emphasizes team focus, transparency, and outcome measures as examples of planning culture; those practices should be adapted rather than copied as universal rules. [Microsoft planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)

# Supplied names explained

- `Technical leadership` — Guiding technical choices and team capability toward useful outcomes, including context setting, risk surfacing, decision support, and follow-through. It can come from an engineer without a manager title.
- `Influence without authority` — Helping others consider an option without relying on formal control. Understand their goals, share evidence, invite concerns, and propose a low-cost test where possible.
- `Decision owner` — The person or role accountable for making a decision and communicating it. Consultation may be broad, but ownership should be explicit.
- `Decision deadline` — The latest useful time for a decision before delay constrains options, cost, or delivery. Explain the consequence of missing it.
- `Reversible decision` — A choice that can be changed at a known cost and within a known period. Reversibility is relative; data writes, external contracts, and user behavior can make apparent switches costly.
- `Disagree and commit` — A practice of raising concerns before a decision, then supporting the selected direction after it is made, while still escalating material safety or ethical issues. It does not require pretending agreement or hiding risk.
- `Consensus decision` — A decision reached with shared agreement among a group. It can improve commitment but may be slow, and the group must still know who records or acts on the result.
- `Consultative decision` — A decision where the owner seeks input from affected or knowledgeable people but retains authority to decide. The owner should explain how important input shaped the outcome.
- `Escalation threshold` — A condition that requires a higher authority or different owner, such as unacceptable impact, policy conflict, unresolved risk, or missed decision deadline. Define triggers before urgent situations where practical.
- `Ownership boundary` — The limit of a person or team’s responsibility and authority. Clear boundaries reduce gaps and duplicated work, but interfaces between owners need explicit coordination.
- `Cross-team coordination` — Aligning teams on dependencies, contracts, timing, operational ownership, and shared outcomes. Make the interface and next action concrete.
- `Dependency negotiation` — Agreeing on the needed work, sequence, service level, or alternative with a team or external party. Bring mutual impacts and options rather than treating another team as a task queue.
- `Conflict de-escalation` — Reducing personal threat and returning a disagreement to facts, goals, constraints, and choices. It may involve a pause, a private conversation, neutral facilitation, or escalation through policy.
- `Credit sharing` — Accurately acknowledging the people and teams whose work contributed to an outcome. It supports trust and gives a truthful account of how delivery happened.
- `Accountability` — Owning responsibilities, decisions, communications, and follow-through, including surfacing when a commitment is at risk. It is compatible with examining systemic conditions.
- `Commitment tracking` — Recording who agreed to what, by when, and the evidence of completion. Keep it lightweight and update it when conditions change.
- `Follow-through` — Completing agreed actions, closing feedback loops, or explicitly renegotiating when unable. Silence after accepting an action damages trust.
- `Risk communication` — Explaining a possible adverse event, impact, uncertainty, trigger, mitigation, and owner to the people who need to decide or respond.
- `Technical debt negotiation` — Discussing the cost and timing of quality work in terms of delivery friction, reliability, security, or future risk, and agreeing on an investment or guardrail. It is not a demand to rewrite all imperfect code.
- `Engineering principle` — A shared decision guide, such as favoring explicit contracts or reversible changes. Principles support consistency but need context and can conflict; explain how a principle applies.
- `Team learning review` — A reflection on outcomes, process, and system conditions that identifies changes to try. It should not become a search for an individual to blame.
- `Constructive challenge` — Questioning an assumption or decision with evidence and respect, focused on the goal and consequences. It gives the owner a chance to respond and may include an alternative.
- `Servant leadership` — A leadership approach emphasizing removing impediments, enabling people, and supporting team effectiveness. It does not mean avoiding hard decisions, technical direction, or accountability.

# Cross-item comparison

| Decision approach | How it works | Tradeoff |
| --- | --- | --- |
| Consensus | Group works toward a shared decision. | Can build commitment but may take longer or blur ownership. |
| Consultative | Owner gathers input and decides. | Faster, with clear accountability, but requires the owner to explain how input was considered. |
| Disagree and commit | Concerns are surfaced, decision made, then execution aligned. | Prevents endless debate, but material safety/ethical concerns still require escalation. |
| Influence without authority | Uses evidence, trust, and options rather than command. | Requires understanding others’ incentives and may not control the result. |
| Decision owner and ownership boundary | Person accountable for choice versus defined scope of responsibility. | Both must be clear or decisions fall between teams. |

# Examples

### Escalate a delayed security decision

“The release decision is needed by Wednesday because the exposure window continues after that. Option A delays deployment while we complete the access review. Option B ships only the non-sensitive path behind a disabled flag. I recommend B if security confirms the boundary test; otherwise we delay. I own the technical assessment; the security owner decides acceptability.” This message identifies decision, deadline, options, consequence, recommendation, and ownership.

### Negotiate technical debt investment

Instead of “this module is messy,” show that a repeated manual data repair takes several engineer-hours each release and has caused two support escalations. Propose a bounded validation step and estimate its effect, then compare it with current feature demand. If the team defers the work, agree on a guardrail and a signal that would trigger reconsideration.

# Common mistakes

- Treating a title as the only source of technical leadership.
- Calling a decision consultative while ignoring all input without explanation.
- Invoking “disagree and commit” to suppress serious safety, legal, or ethical concerns.
- Escalating a problem without a decision request, options, or recommendation.
- Recording commitments but not updating them as evidence changes.
- Using engineering principles as slogans instead of explaining the relevant tradeoff.
- Treating technical debt as a moral failing rather than a consequence and investment choice.
- Confusing servant leadership with refusing to set direction or standards.
- Taking credit for a shared outcome or failing to recognize behind-the-scenes work.

# Knowledge checks with answers

1. **How do consensus and consultative decisions differ?** Consensus seeks shared agreement; consultative decision-making gathers input while a named owner decides.
2. **What information belongs in an escalation?** Needed decision, deadline, context, impact, options, consequences, owner, and recommendation.
3. **When should “disagree and commit” not end discussion?** When unresolved safety, ethical, legal, or material risk must be escalated under policy.
4. **How can technical debt be discussed constructively?** Connect the cost to outcomes, evidence and tradeoffs; propose a bounded investment or guardrail.
5. **What does follow-through require when a commitment becomes impossible?** Communicate early, explain changed evidence, and renegotiate scope/date/ownership rather than silently missing it.

# Sources

- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)
- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
- [Microsoft: formalize development practices](https://learn.microsoft.com/en-us/power-platform/well-architected/operational-excellence/formalize-development-practices)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)

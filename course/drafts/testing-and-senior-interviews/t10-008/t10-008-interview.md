# mentorship communication estimation planning and leadership — Interview questions and reasoning

# Core questions

1. How do you mentor an engineer without taking over their work?
2. How do you estimate a project with substantial unknowns?
3. How do you communicate a schedule change to stakeholders?
4. How do you decide between consensus and a consultative decision?
5. How do you influence another team when you do not manage them?
6. How do you delegate a risky technical task?
7. How do you balance technical debt and feature delivery?
8. What makes a useful technical status update?
9. How do you handle disagreement in a team?
10. What is the difference between an estimate, a forecast, and a commitment?

# Concise interview answers

1. **Mentorship:** I start with the learner’s goal and current understanding, share context, and adjust support to risk. I ask them to reason and make safe decisions, then reduce scaffolding as their capability grows.
2. **Unknowns:** I define the outcome and scope, expose assumptions and dependencies, use a range and confidence level, and timebox spikes for the highest-impact unknowns. I reforecast when evidence changes.
3. **Schedule change:** I communicate early with the evidence, affected outcome, revised range, options, tradeoffs, and decision needed. I do not hide the change to preserve a date.
4. **Decision mode:** I use consensus when broad agreement materially improves implementation and time allows. I use a consultative decision when input matters but a named owner must decide by a deadline.
5. **Influence:** I first understand the other team’s goals and constraints, then present shared impact, evidence, and options. I negotiate an interface or small experiment rather than treating the team as a task queue.
6. **Risky delegation:** I define outcome, decision authority, safety boundaries, escalation triggers, support, and review points. I may retain irreversible or policy decisions while delegating implementation ownership.
7. **Technical debt:** I connect the debt to delivery friction, reliability, security, or operational cost and propose a bounded investment or guardrail. I compare that against current outcomes instead of arguing from aesthetics.
8. **Status update:** Outcome, current facts, forecast, blocker/risk, next step, owner, and next update time. Separate completed work from expected work.
9. **Disagreement:** I clarify the shared goal, separate evidence from preference, explain tradeoffs, listen, and identify the decision owner. I escalate unresolved material risk rather than making it personal.
10. **Estimate/forecast/commitment:** An estimate is a view of work or uncertainty; a forecast predicts delivery under current evidence; a commitment is a prioritization and ownership decision. None eliminates uncertainty.

# Deep follow-up answers

## How do you handle a teammate who repeatedly asks you to make decisions?

First determine whether the boundary, context, or confidence is missing. Clarify the outcome and decisions they own, share relevant examples, and ask for their recommendation with evidence. Let them make reversible, low-risk decisions and check in at milestones. For high-risk or irreversible choices, provide a clear escalation path. If the pattern persists, discuss the support relationship and workload rather than framing it as a character flaw.

## What if leadership wants a fixed date before discovery is complete?

Explain what is known and unknown, provide a conditional range or scenarios, and identify the decisions needed to improve confidence. Offer scope options or an early milestone that delivers value. If leadership chooses a target, document the assumptions and risks and keep reforecasting; do not describe an uncertain date as guaranteed.

## How do you avoid planning ceremonies becoming overhead?

Start with the decisions and coordination needs the team actually has. Use a lightweight artifact or meeting when it reduces confusion, exposes dependencies, or improves learning. Remove reporting that measures activity without informing a decision. Review whether the process shortens feedback loops and makes outcomes clearer.

## How do you build psychological safety while maintaining standards?

Respond respectfully when people raise uncertainty or report mistakes, make expectations explicit, and focus feedback on observable behavior and impact. Invite disagreement before decisions and protect time to learn. Then follow through on quality requirements and agreed actions. Safety is not absence of challenge; it makes useful challenge more likely.

## How do you measure mentorship success?

Use the learner’s goals and evidence of growing independence: they can explain choices, handle a broader task, ask earlier questions, or teach someone else. Ask for their feedback about the support. Avoid using a single output or promotion outcome as proof, since many factors affect both.

# Scenario questions

## A dependency owner says your request is not a priority

Clarify their constraints and your actual need. Offer minimum viable options, explain customer and schedule impact, identify whether a workaround changes risk, and ask for a decision or owner. If the risk exceeds local authority, escalate with options and consequences. Do not promise another team’s capacity.

## A teammate made a mistake in a production change

Stabilize the system and protect users first. Communicate facts without blame, assign immediate actions according to incident roles, and preserve evidence. Later, review what information and safeguards were available, how the change was reviewed and rolled out, and what concrete system improvement can reduce recurrence. Support the teammate without hiding accountability or process gaps.

## Your estimate is challenged in a planning meeting

Explain assumptions, comparable work, and confidence, then ask which assumption or evidence others disagree with. Update the range if new facts warrant it. If the group needs a commitment, identify what scope or risk it is accepting and who owns that decision.

# Tradeoffs and alternatives

| Choice | Useful benefit | Tradeoff |
| --- | --- | --- |
| Pairing | Fast feedback and shared context. | Uses two people’s attention and may reduce independent practice if the mentor dominates. |
| Asynchronous proposal | Durable context and flexible participation. | Slower when ambiguity or tension requires live clarification. |
| Consensus | Can increase shared commitment. | May be slow and can obscure accountability. |
| Consultative owner | Clear decision responsibility and timely choice. | The owner must genuinely consider input and explain the decision. |
| Point estimate | Simple to communicate. | Hides uncertainty; a range is more informative when evidence is incomplete. |
| Vertical slice | Early end-to-end learning and value. | May require enabling interfaces or careful sequencing before it is possible. |

# Common weak answers

- “I always know what the team should do.” This does not show uncertainty handling or listening.
- “I let the junior engineer figure it out.” This confuses autonomy with withholding context or support.
- “The team committed to three weeks, so we must deliver in three weeks.” This ignores forecast evidence and changes in assumptions.
- “I use Agile and have daily standups.” Ceremonies alone do not demonstrate outcome-oriented planning.
- “I escalated it to management.” Explain what decision was needed, what options were offered, and why escalation was warranted.
- “I convinced them.” Explain the other team’s concern, evidence, tradeoffs, and how the decision was made.
- “I fix technical debt whenever I see it.” Explain prioritization, impact, scope, and how the work supports outcomes.

# Self-check rubric

Score each dimension 0–2 (missing, partial, clear):

- Did I state the outcome and decision before process detail?
- Did I distinguish facts, assumptions, estimates, forecasts, and commitments?
- Did I explain audience, dependencies, risks, and next actions?
- Did I preserve learner or team ownership where safe?
- Did I identify who decides and how disagreement is handled?
- Did I connect technical choices to user, delivery, or operational consequences?
- Did I describe how evidence will change the plan?
- Did I show follow-through without implying that all uncertainty is controllable?

Use the rubric to find one improvement for the next answer; it is not a company hiring score.

# Sources

- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)
- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)

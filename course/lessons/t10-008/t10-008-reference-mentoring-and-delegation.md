# mentorship communication estimation planning and leadership — Reference: Coaching, pairing, delegation, growth, and psychological safety

# Scope and version

This lesson covers practical mentorship and delegation behaviors; it does not define a universal management or career framework. Adapt support to risk, learner goals, and organizational responsibilities. The names below are the complete assigned group.

# How this group fits the mental model

Mentorship should increase the learner’s capability and judgment. The mentor adjusts support to the task, explains reasoning, and leaves decisions with the learner where safe. During urgent or high-risk work, a mentor may need to direct action, then return to teaching and practice after the immediate risk is controlled. Psychological safety makes it possible to ask questions and surface mistakes early; standards and accountability still matter. [Google’s review collaboration guidance](https://google.github.io/eng-practices/review/developer/handling-comments.html)

# Supplied names explained

- `Technical mentorship` — A working relationship that helps someone grow technical skills, judgment, and professional confidence through context, practice, feedback, and reflection. It is not the mentor making every choice.
- `Coaching question` — An open question that helps a learner inspect evidence and choose a next step, such as “What have you observed?” or “Which failure mode worries you most?” Avoid using questions as a trick when direct instruction is needed.
- `Active listening` — Paying attention to the learner’s words, assumptions, concerns, and context; checking understanding before advising. It is not passive agreement.
- `Pair programming` — Two people collaborate at one workstation or shared session, often alternating driver and navigator roles. It provides rapid feedback and shared context, but should not become one person typing while the other watches silently.
- `Mob programming` — Several people work together on one task with shared input and a rotating driver/facilitator. It can spread understanding for complex work but uses many people’s time, so use it when shared exploration is worth the cost.
- `Guided discovery` — Helping a learner derive an answer through questions, evidence, and experiments instead of immediately supplying the conclusion. It must remain supportive, not become an exam or a way to withhold necessary context.
- `Scaffolded task` — Work structured with examples, guardrails, milestones, or review points that can be reduced as capability grows. A scaffold protects safety while preserving meaningful learner choices.
- `Delegation` — Assigning work and responsibility to another person with clear outcomes, constraints, authority, and support. It transfers appropriate ownership, not accountability for the leader’s whole system.
- `Delegation boundary` — The explicit line between choices the delegate may make, choices they should discuss, and choices that remain with another owner. Include safety, scope, and escalation conditions.
- `Decision ownership` — Clear accountability for making or maintaining a decision. Input may be shared; ownership should still be discoverable.
- `Stretch assignment` — A task that develops a skill beyond the learner’s current comfort while keeping the risk and support appropriate. It should not be an unbounded high-stakes assignment disguised as growth.
- `Skill development goal` — A specific capability the learner wants to build and evidence that would show progress. It should be negotiated and relevant to their direction.
- `Growth feedback` — Specific feedback on behavior, outcome, and next practice, delivered so the person can act. Separate observed facts from interpretation and offer a conversation, not a verdict about character.
- `Mentor check-in` — A planned conversation about goals, blockers, learning, and support. Its frequency should fit the task and person; checking in should not become surveillance or reclaiming delegated decisions.
- `Learning review` — Reflection after a task on what was learned, what changed, and what practice comes next. It is distinct from a performance rating.
- `Knowledge sharing` — Making useful understanding available through pairing, walkthroughs, documentation, examples, or teaching. It reduces single-person dependence when knowledge is discoverable and maintained.
- `Documentation as enablement` — Writing durable instructions, rationale, examples, and boundaries that let others act without waiting for the author. Documentation should be usable and updated with relevant changes.
- `Psychological safety` — A team condition where people can ask, challenge, admit uncertainty, and report mistakes without interpersonal punishment. It enables learning but does not remove clear expectations or respectful behavior.
- `Inclusive mentoring` — Support that respects different backgrounds, communication styles, access needs, and opportunities. Ask about preferences rather than assuming everyone learns or advances in the same way.
- `Career conversation` — A discussion of a person’s goals, interests, strengths, constraints, and development options. It should distinguish the mentor’s perspective from promises about promotion or organizational outcomes they cannot control.
- `Succession knowledge transfer` — Deliberately spreading critical context, ownership, and operational knowledge so work can continue when people change roles or leave. It includes practice and access, not just a handoff document.
- `Avoiding learned dependency` — Preventing a pattern where the learner waits for the mentor’s answer rather than building independent judgment. Ask for proposed next steps, let the learner perform safe work, and gradually reduce scaffolding.

# Cross-item comparison

| Pair | Difference and useful boundary |
| --- | --- |
| Mentoring, coaching, and managing | Mentoring shares experience and development support; coaching facilitates a learner’s reasoning; managing sets organizational expectations and owns team outcomes. One person may do all three, but the roles should be clear. |
| Pair and mob programming | Pairing uses two collaborators; mob programming involves a larger group. Both need active roles and a task where live collaboration justifies the attention cost. |
| Delegating a task and a decision | A person may implement a task while the manager retains the design decision. Say what authority moves and what remains. |
| Guided discovery and direct instruction | Discovery builds reasoning when time and risk permit; direct instruction is appropriate for urgent safety or essential missing context. |
| Stretch assignment and unsafe assignment | A stretch has a learning goal, bounds, review, and support; an unsafe assignment transfers unmanageable risk without enablement. |

# Examples

### Scaffold a first production-adjacent task

A new teammate is assigned a small dashboard improvement. The mentor explains the service boundary and safe local test setup, asks the teammate to propose the metric and failure cases, then reviews the query before it reaches production. The teammate owns the implementation and presents the rollout plan. Afterward they discuss what the test missed and update the onboarding notes. The mentor avoids taking over when the first draft is imperfect.

### Use coaching questions without withholding help

Learner: “The integration test times out. What should I change?”

Mentor: “What is the last completed step, and does the timeout happen before or after the request reaches the test server?” If the learner cannot see the relevant trace, the mentor helps add it. The question guides investigation; it does not presume the learner should already know the answer.

# Common mistakes

- Taking the keyboard at the first mistake and leaving the learner with no practice.
- Asking leading questions to make a learner guess a hidden answer.
- Delegating outcomes without describing authority, constraints, or support.
- Giving stretch work that carries production risk but no review or rollback.
- Treating psychological safety as avoiding hard feedback or standards.
- Mentoring only people who communicate or learn like the mentor.
- Promising career outcomes the mentor cannot control.
- Holding critical system knowledge privately while describing oneself as a helpful expert.
- Running a check-in as status surveillance instead of a conversation about blockers and growth.

# Knowledge checks with answers

1. **How should a mentor choose between coaching and direct instruction?** Consider urgency, safety, learner context, and opportunity to practice; urgent hazards may need direct instruction followed by learning later.
2. **What should a delegation boundary include?** Outcome, choices the delegate owns, constraints, escalation conditions, and support/check-in points.
3. **Why is a stretch task different from dumping work?** A stretch has a deliberate growth goal, bounded risk, and support.
4. **Does psychological safety mean there is no accountability?** No. It supports speaking up while retaining clear standards and ownership.
5. **How can knowledge transfer be verified?** The recipient can independently perform or explain the task with the necessary access and documentation, not merely acknowledge a handoff.

# Sources

- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
- [Microsoft: formalize development practices](https://learn.microsoft.com/en-us/power-platform/well-architected/operational-excellence/formalize-development-practices)
- [LeadDev: continuous feedback](https://leaddev.com/management/how-grow-your-engineers-through-continuous-feedback)
- [LeadDev: open and constructive feedback](https://leaddev.com/management/engineering-managers-guide-open-honest-and-constructive-feedback)

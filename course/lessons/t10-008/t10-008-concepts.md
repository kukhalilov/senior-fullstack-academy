# mentorship communication estimation planning and leadership — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to mentor while preserving learner ownership, adapt technical communication to audience and channel, produce a plan that exposes dependencies and uncertainty, distinguish estimates from forecasts and commitments, and lead decisions with clear ownership and follow-through.

# Prerequisites

You should understand how software work moves from a need to implementation, testing, release, and operation. A dependency is work or a decision that another task requires. A forecast estimates a possible outcome based on current evidence. A decision owner is accountable for making a choice after relevant people are consulted.

# Core concepts

## Mentorship builds capability, not dependence

Start with the learner’s goal and current understanding. A mentor can explain, demonstrate, ask coaching questions, pair, or create a scaffolded task. The level of support should match the task’s risk and the learner’s readiness, then decrease as capability grows. During an outage or safety-critical change, direct instruction may be necessary; afterwards, discuss why and provide a chance to practice safely.

Delegation means assigning work and clarifying expected results, authority, constraints, and check-in points. Delegating a task does not always delegate the decision. Explicitly state which decisions the learner can make, which need consultation, and which remain with another owner. A stretch assignment should be challenging but bounded, with support and a real opportunity to own the result. Psychological safety means people can ask for help and raise concerns without humiliation; it does not mean avoiding standards or accountability.

Avoid learned dependency: if the mentor answers every question or takes the keyboard whenever uncertainty appears, the learner gets less practice. Ask what they have tried, what they observe, and what next step they would choose. Share reasoning rather than only the answer. Check in to learn, not to reclaim ownership.

## Communication starts with audience and decision

Lead with the decision, request, or outcome needed. Then give enough context and rationale for the audience, state assumptions and risks, and offer a path for questions. Executives may need impact, options, cost, and decision deadline; engineers may need interfaces, failure modes, evidence, and implementation constraints. Plain language is not less technical; it makes the core point accessible before detail.

Written communication supports asynchronous review, durable decisions, and participation across schedules. Synchronous discussion helps when ambiguity is high, trust is strained, or a fast exchange can resolve a complex disagreement. Meetings need an agenda and decision question; publish notes with decisions and actions afterward. An ADR records a durable architectural choice and its consequences. Status updates should identify outcome, current state, risk/blocker, next step, owner, and when new information will arrive.

Choose the channel by urgency, sensitivity, complexity, audience access, and need for a record. For a high-stakes disagreement, a short live conversation may reduce tone ambiguity, followed by a written summary. For a simple decision with a clear proposal, asynchronous communication can be more inclusive and efficient. [Google’s documentation guidance](https://google.github.io/styleguide/docguide/best_practices.html) encourages clear, useful, current documentation.

## Plans coordinate work; estimates express uncertainty

Begin with an outcome and scope boundary. Break work into pieces that can be verified and, where possible, delivered vertically through a user-visible or operational path. Map dependencies, critical path, release dependencies, and unknowns. Include testing, documentation, observability, deployment, and operational readiness rather than estimating code alone.

An estimate is a forecast based on assumptions and comparable work. A range communicates uncertainty better than a false-precision point value. Confidence should reflect evidence and unknowns. A reference-class estimate compares with similar completed work; a three-point estimate uses optimistic, most likely, and pessimistic cases; planning poker is a group discussion and relative estimation technique. Story points express relative size within a team’s chosen method; they are not universal hours. Ideal time excludes interruptions, while calendar time includes elapsed delays and coordination. Neither is the same as a delivery commitment.

A delivery forecast combines scope, capacity, dependencies, and uncertainty to estimate when outcomes may be available. A commitment is a decision to prioritize and take responsibility for a target; it does not remove uncertainty. Maintain an assumption register and risk buffer where useful. A spike is a bounded investigation with a question and exit result, not an open-ended research task. Unknown unknowns cannot be listed in advance; reduce exposure with small increments, early feedback, and reforecasting when new evidence appears.

Work in progress limits reduce context switching and reveal queues. Capacity planning should account for support load, leave, review, operational work, and interruptions; it should not assume every person is fully available for planned feature work. Microsoft’s planning material discusses outcome measures and planning practices, but its specific cadence is an organizational example rather than a universal template. [Microsoft planning guidance](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)

## Leadership makes decision paths explicit

Technical leadership aligns people around outcomes, provides context, surfaces risk, makes decisions or routes them to the right owner, and follows through. Influence without authority depends on understanding stakeholder goals, evidence, trust, and workable options. Decision ownership should be clear even when input is broad.

Consensus means the group reaches a shared decision; it may take time and can hide lack of ownership if nobody can decide. A consultative decision gathers input while an identified owner decides. Disagree and commit means people can voice concerns and then support the chosen direction within appropriate safety and ethical boundaries; it does not require concealing unresolved risk. Reversible decisions can be made faster with a test and rollback path; irreversible decisions deserve more evidence and deliberate review.

Escalate when impact, risk, conflict, or decision delay exceeds the authority or tolerance of the current group. Escalation should carry the decision needed, options, consequences, deadline, and recommendation—not just the problem. Credit sharing, commitment tracking, and follow-through build trust. Technical debt negotiation should link the cost of delay to delivery or operational outcomes rather than arguing that old code is aesthetically displeasing.

# Mechanisms and relationships

Use a lightweight leadership loop:

1. Define the outcome and who benefits.
2. Identify audience, decision owner, collaborators, constraints, and assumptions.
3. Break work into verifiable slices; make dependencies, risk, and unknowns explicit.
4. Forecast effort and calendar timing with a range and confidence; separate that forecast from commitment.
5. Communicate the decision or request first, then rationale, risks, and next steps in a suitable channel.
6. Delegate bounded ownership and support learning without taking the task back.
7. Track decisions, actions, blockers, and changes to assumptions.
8. Reforecast and communicate when evidence changes; review both delivery and learning afterward.

# Worked examples

## Reforecast after an unknown dependency

A team initially estimates an API migration at two to four weeks with medium confidence, assuming the old API supports bulk reads. A spike finds that the endpoint is rate-limited and lacks a bulk operation. The team reports the new evidence, revises the range, compares batching with a provider change, and asks the decision owner to choose based on cost and user impact. It does not hide the discovery to preserve the original date. The original estimate was a forecast under an assumption, not a promise that the assumption was true.

## Delegate with a decision boundary

“Please own the first adapter endpoint and its tests. You can choose the internal method structure and test fixtures. Keep the public response contract unchanged, do not enable production traffic yet, and ask me before changing retry semantics. Let’s check in after the contract test is drafted; you will present the rollout recommendation.” This assigns meaningful ownership while preserving an explicit safety boundary.

# Misconceptions and edge cases

- **“A mentor should always give the answer.”** Direct teaching has a place, but repeated answer-giving can prevent independent judgment.
- **“Delegation means the person owns every decision.”** Task ownership and decision authority must be stated separately.
- **“An estimate is a commitment.”** It is a forecast under assumptions; a commitment is a prioritization decision and still carries uncertainty.
- **“Story points equal hours.”** They are relative units within a team’s practice and should not be converted universally into individual productivity.
- **“Consensus is always best.”** It can improve alignment but costs time and may obscure who is accountable for a choice.
- **“A meeting is enough documentation.”** Decisions and actions should be recorded where absent participants and future teammates can find them.
- **“A risk buffer means padding.”** It is an explicit response to uncertainty; explain the risk it covers and revise it as evidence changes.
- **“Psychological safety means no challenge.”** Respectful challenge and clear standards can coexist with safety.

# Knowledge checks with answers

1. **How does mentorship differ from taking over?** Mentorship shares reasoning and support while preserving appropriate learner decisions and practice.
2. **What makes an estimate credible?** Assumptions, comparable evidence, range, confidence, known dependencies, and updates when evidence changes.
3. **How is a forecast different from a commitment?** A forecast describes expected timing under current evidence; a commitment is a decision to prioritize and own a target.
4. **When is asynchronous communication preferable?** When the decision can be explained clearly in writing, participants need flexible time, and a durable record helps.
5. **When should a risk be escalated?** When impact or decision delay exceeds current authority or agreed tolerance; bring options and a specific decision request.
6. **Why define a delegation boundary?** It lets the learner act independently while identifying decisions or risks that require consultation.

# Sources

- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)
- [Google: handling reviewer comments](https://google.github.io/eng-practices/review/developer/handling-comments.html)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)
- [Microsoft: formalize development practices](https://learn.microsoft.com/en-us/power-platform/well-architected/operational-excellence/formalize-development-practices)

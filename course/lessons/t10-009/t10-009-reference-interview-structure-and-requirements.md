# architecture interviews tradeoffs requirements and constraints — Reference: Collaborative framing, user journeys, scope, and quality targets

## Scope and version

This is a version-independent interview method. See [Microsoft technical interview guidance](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html) and the [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework).

## How this group fits the mental model

Design starts by deciding what success means. A diagram drawn before understanding users, constraints, and quality targets can be technically polished and still solve the wrong problem.

## Supplied names explained

- **System-design interview** — Collaborative exercise to clarify a product, reason about a high-level architecture, evaluate tradeoffs, and communicate decisions.
- **Problem restatement** — Briefly state the requested system and expected user outcome; invite correction before committing to scope.
- **Clarifying question** — A question whose answer can alter scope, data model, consistency, scale, failure handling, or cost.
- **Functional requirement** — A capability a user or system must perform, such as uploading a file or searching a catalog.
- **Nonfunctional requirement** — A quality or operating constraint such as latency, availability, security, privacy, or cost.
- **Primary user journey** — The main sequence of actions and system responses that must work end to end.
- **User persona** — A representative actor with needs or permissions that change system behavior.
- **Use case** — A named interaction with a goal, normal path, and relevant failure paths.
- **Out-of-scope feature** — A capability deliberately deferred so the design remains focused; record it rather than silently forgetting it.
- **Constraint** — A fixed boundary such as a regulation, deadline, existing platform, team size, or budget.
- **Assumption** — A provisional value used when facts are unavailable; state it and note whether changing it changes the design.
- **Requirement priority** — The ranking of must-have, should-have, and optional behavior under time or capacity limits.
- **Acceptance criterion** — Observable condition used to decide whether behavior meets the requirement.
- **Availability target** — A stated fraction or time window for successful service, including how “available” is measured.
- **Latency target** — A time bound for an operation, commonly expressed at a percentile and under a defined workload.
- **Durability target** — Required likelihood that acknowledged data survives failures and the recovery point the product accepts.
- **Consistency requirement** — Which reads must reflect which writes and when; define the relevant operation and user-visible guarantee.
- **Security boundary** — Trust boundary that determines identity, authorization, validation, and secret access.
- **Privacy requirement** — Rules for collecting, using, exposing, retaining, and deleting personal data.
- **Data residency constraint** — Geographic or legal requirement governing where data is stored or processed.
- **Cost ceiling** — Maximum spend or resource budget that constrains the design and its operational choices.
- **Operational constraint** — Limits on team skills, on-call capacity, deployment windows, support, or platform availability.
- **Success metric** — Measurable signal that the intended product or service outcome is achieved.
- **Failure scenario** — A concrete event such as a zone outage, provider timeout, bad deployment, or duplicate request used to test behavior.
- **Interview time budget** — Time available for discovery, design, deep dives, and summary; manage it explicitly.

## Cross-item comparison

Functional requirements describe behavior; nonfunctional requirements qualify it. A latency target needs a workload and percentile; an availability target needs a definition of successful operation. An assumption is not a fact and should remain visible. Acceptance criteria and success metrics make requirements testable, while priority and out-of-scope decisions keep the interview bounded.

## Examples

For “design a chat system,” ask whether one-to-one, group chat, attachments, presence, and search are in scope; what message delivery/read guarantees matter; expected group size; retention and privacy requirements; and which client platforms exist. If the interviewer provides no numbers, state a reasonable active-user and peak-traffic assumption and continue. Do not spend ten minutes estimating a feature that is explicitly out of scope.

## Common mistakes

- Asking many questions that do not change the architecture.
- Treating “high availability” or “low latency” as measurable without a target and workload.
- Silently treating assumptions as requirements.
- Designing for every persona and feature before identifying the primary journey.
- Ignoring security, privacy, legal, or operational constraints until the end.
- Spending the whole interview in discovery without presenting a baseline design.

## Knowledge checks with answers

1. **What is a high-value clarifying question?** One whose possible answers lead to materially different designs.
2. **How is a success metric different from an acceptance criterion?** A metric tracks outcomes over time; an acceptance criterion checks a defined behavior or condition.
3. **What should you do when a requirement is unknown?** State an assumption, explain its effect, and invite correction.

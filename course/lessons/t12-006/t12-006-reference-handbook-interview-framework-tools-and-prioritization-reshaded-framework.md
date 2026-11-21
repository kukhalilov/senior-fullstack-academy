# end-to-end system design case studies — Reference: RESHADED framework

Sources: [HLD Handbook: Interview Frameworks Compared](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [Educative: Use RESHADED for system design interviews](https://www.educative.io/blog/use-reshaded-for-system-design-interviews), [Educative: System analysis versus system design](https://www.educative.io/courses/grokking-the-system-design-interview/system-analysis-vs-system-design), [HLD Handbook: How to Approach a System Design Question](https://hld.handbook.academy/curriculum/core-fundamentals/how-to-approach-design-questions/).

## Scope and version

RESHADED is an interview-answer structure promoted in Educative's system-design material. It expands to **Requirements, Estimation, Storage schema, High-level design, API design, Detailed design, Evaluation, Distinctive component/feature**. The source sometimes calls the schema step optional; skip or compress it when it does not help the problem. This is a practice aid, not a formal standard, required industry method, or evidence that using the acronym alone improves interview outcomes. Sources were checked on 2026-11-21; interview formats vary by company, interviewer, level, and allotted time.

## How this group fits the mental model

The framework is a sequence for making your reasoning visible: first define the problem, then size the workload enough to guide decisions, shape data and interfaces, sketch the architecture, deepen the highest-risk parts, and evaluate the result. It guards against spending the entire interview on requirements or jumping into boxes before agreeing what the system must do.

Use the sequence flexibly. An interviewer may redirect you toward a bottleneck, failure mode, or trade-off. Follow that signal and return to any skipped point later if time permits. The goal is a coherent design conversation, not reciting eight headings. You can revisit earlier decisions when an estimate or deep dive changes your assumptions.

## Supplied names explained

- **R — Requirements:** ask for primary user journeys, core read/write behavior, scale boundaries, latency/availability expectations, consistency, security/privacy, and explicit non-goals. State assumptions and prioritize the few requirements that change architecture.
- **E — Estimation:** estimate only quantities that influence a design choice: requests per second, peak/average ratio, data growth, retention, bandwidth, fan-out, or hot-key concentration. Use transparent assumptions and order-of-magnitude math; update estimates when assumptions change.
- **S — Storage schema:** identify entities, relationships, access patterns, keys, indexes, and ownership/consistency requirements. This step is optional or brief for problems where data modeling does not drive the architecture; do not invent a detailed schema before requirements are clear.
- **H — High-level design:** draw the major components and the main write/read paths. Identify the source of truth, synchronous versus asynchronous boundaries, and critical dependencies. Start with the simplest design that satisfies the stated requirements.
- **A — API design:** define a small set of request/response or event contracts, identity/authorization, pagination, idempotency, validation, and error behavior. API detail can happen before or after the broad diagram depending on which clarifies the design.
- **D — Detailed design:** choose one or two areas whose behavior controls success: a hot partition, feed fan-out, payment correctness, cache invalidation, multi-region writes, recovery, or a specific protocol. Explain state transitions and failure handling, not just product names.
- **E — Evaluation:** revisit functional and nonfunctional requirements; discuss capacity, latency, cost, bottlenecks, availability, consistency, privacy/security, observability, and recovery. Name a trade-off and why it is acceptable under stated assumptions.
- **D — Distinctive component/feature:** cover the system-specific challenge that generic boxes do not explain. Examples include celebrity fan-out, duplicate payment prevention, video transcoding, abuse detection, or collaborative conflict resolution. Skip it when the deep dive has already covered the defining challenge.

## A practical interview flow

1. **Clarify and prioritize.** Ask a few questions, state assumptions, and agree on the one or two core user journeys. Avoid cataloguing every possible feature.
2. **Estimate selectively.** Show formulas and round numbers. If the estimate does not alter a decision, state that and move on.
3. **Model the core data and API.** Define only entities/contracts needed to reason about ownership, writes, reads, and idempotency.
4. **Draw the simplest end-to-end architecture.** Walk one write and one read path. Label synchronous calls, queues, caches, and data stores.
5. **Deep-dive where the interviewer or requirements point.** Explain ordering, consistency, partitioning, backpressure, retries, cache behavior, or failure recovery at the relevant boundary.
6. **Evaluate and close.** Tie choices back to requirements; state the largest remaining risk, how you would measure it, and what you would change if a key assumption changed.

Timebox this flow to the interview rather than assigning fixed minutes to every letter. A 45-minute interview and a 60-minute interview may need different depth; interviewer questions and the problem's complexity matter more than a rigid schedule.

## Cross-item comparison

| Framework style | Emphasis | Useful when | Watch out for |
| --- | --- | --- | --- |
| RESHADED | Names eight rubric areas, including estimation, schema, API, evaluation, and a problem-specific feature | You want an explicit coverage checklist | Eight steps can feel mechanical; schema and API may be compressed or reordered |
| PEDALS | Compact sequence often presented around problem, estimation, data model, architecture, trade-offs, and scaling | You want a shorter mnemonic with data modeling visible | Published expansions and step ordering vary by source; use the version you practiced |
| ADEPT | Compact interview mnemonic emphasizing problem/requirements, design, evaluation, and trade-offs | You prefer fewer stage labels | Less detailed as a coverage checklist; you must remember omitted API/data/recovery areas |
| Alex Xu-style four-step | Requirements, high-level design, detailed design, wrap-up | You want a short, flexible scaffold | Individual implementations may make data/API/estimation explicit inside those stages |
| Hello Interview delivery structure | Conversational, time-aware sequence with explicit interview communication guidance | You want a natural spoken flow | It may label fewer discrete rubric items; ensure you still cover relevant data, API, scale, and failure concerns |

These are alternative ways to organize largely overlapping reasoning. Their labels and expansions are not universally standardized, so verify the source/version you study. No framework guarantees a passing result; technical correctness, prioritization, communication, and responsiveness to interviewer direction still matter.

## Examples

### Design a photo-sharing feed

**Requirements:** users publish photos and see a following feed; prioritize feed read latency and media durability. **Estimation:** estimate feed reads, photo storage growth, and hot celebrity follower counts because these affect fan-out and storage. **Schema/API:** user, follow edge, post, media object, feed cursor; define `POST /posts` and paginated `GET /feed`. **High-level design:** upload service/object storage, metadata store, feed generation, cache, CDN. **Detailed/Distinctive:** compare fan-out-on-write for ordinary users with fan-out-on-read or hybrid handling for celebrities. **Evaluation:** check feed freshness, hot-user behavior, object durability, privacy, and cache invalidation. If the interviewer asks about celebrity feeds early, jump to that deep dive instead of finishing the acronym in order.

### Design a ticket purchase system

Clarify scarce-inventory and fairness requirements; estimate peak demand and inventory size; model event, seat, reservation, order, payment; define reserve/confirm APIs with idempotency; sketch inventory, queue, reservation store, payment, and notification services; deep-dive the atomic reservation/expiry and payment-timeout race; evaluate oversell risk, queue waiting, recovery, and abuse controls. The distinctive issue is the inventory/payment state transition. If it is already the main deep dive, do not repeat it under the final D.

## Common mistakes

- Treating the acronym as a strict linear checklist and ignoring interviewer steering.
- Spending too long collecting requirements without prioritizing or making assumptions explicit.
- Producing false precision in estimates instead of showing assumptions and useful order of magnitude.
- Forcing a storage schema into a problem where it adds no value or drawing it before access patterns are understood.
- Drawing a high-level architecture without explaining a read/write path or source of truth.
- Listing endpoints without explaining authorization, idempotency, pagination, and failure behavior where relevant.
- Deep-diving many components superficially instead of explaining one critical trade-off in depth.
- Treating the Distinctive step as a requirement to invent a novel feature.
- Claiming fixed minute allocations or pass-rate improvements as universal facts.
- Switching frameworks mid-answer because the current structure feels unfamiliar.

## Knowledge checks with answers

1. **Is the Storage schema step mandatory?** No. The source presents it as optional; include only enough data modeling to support the design decisions.
2. **Must the API step follow the high-level diagram?** No. The acronym gives a memory order, but move API details earlier when they clarify requirements or later when the architecture is clearer.
3. **What belongs in the Distinctive component step?** The problem-specific hard part not already explained, such as hot-key fan-out or an atomic payment/inventory transition; do not invent novelty for its own sake.
4. **Should you always finish all eight letters?** No. Cover the relevant rubric, follow interviewer direction, and use remaining time for the most consequential design issue.
5. **Does RESHADED guarantee interview success?** No. It is a structure for organizing a response; it does not replace technical judgment, clear communication, or adapting to the interview.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder content with a complete, qualified explanation of the eight RESHADED steps and their use in interviews. Educative's source confirms the acronym and step intent; the HLD Handbook supplies comparison context. The lesson clarifies the optional schema step, warns that framework labels/order vary, and removes unsupported universal timing or success claims. No material omissions remain in the supplied topic scope.

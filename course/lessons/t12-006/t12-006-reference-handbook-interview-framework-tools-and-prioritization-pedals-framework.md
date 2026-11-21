# end-to-end system design case studies — Reference: PEDALS framework

Sources: [Lewis Lin: PEDALS Method](https://www.lewis-lin.com/posts/pedals-method/), [Lewis Lin: The System Design Interview](https://www.lewis-lin.com/the-system-design-interview-lewis-lin/), [HLD Handbook: Interview Frameworks Compared](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/).

## Scope and version

PEDALS is a named six-part interview framework published by Lewis C. Lin and Shivam P. Patel. It is a checklist for structuring a time-limited design conversation, not a formal engineering standard or a universal company rubric. This lesson covers its six steps, how they connect, where it leaves room for interviewer steering, and how to avoid treating its labels as a substitute for engineering reasoning. Sources checked 2026-11-21.

## How this group fits the mental model

An interview prompt is usually broad and underspecified. PEDALS moves from the problem to a plausible design and then asks how that design changes under scale. Its value is memory support: each step reminds you to cover a different decision. It does not dictate a particular database, cloud, or architecture. Start with requirements and workload; add a component only when it satisfies a requirement or removes a demonstrated bottleneck.

## Supplied names explained

- **P — Process requirements:** clarify the core user actions, what is in and out of scope, and the important quality constraints. Ask questions that can change the design: read/write behavior, freshness, correctness, latency, availability, privacy, and expected scale. Summarize assumptions aloud.
- **E — Estimate:** make rough capacity estimates when they can guide a decision: request rate, peak-to-average ratio, storage growth, bandwidth, or hot-key concentration. Lin presents estimation as optional in some prompts. Show the assumptions and order of magnitude; do not spend time on arithmetic that cannot affect the design.
- **D — Design the service:** describe the service behavior and its main interfaces. Identify operations and a few API or event contracts, including authentication, pagination, idempotency, and error behavior where relevant. Do not equate one endpoint with one database table.
- **A — Articulate the data model:** identify entities, ownership, relationships, access patterns, and consistency needs. Choose a storage model only after explaining the reads and writes it must support. The source’s older examples focus on tables; modern designs may also use documents, key-value stores, object storage, search indexes, or event logs.
- **L — List architectural components:** draw the major components and the path of important operations. Explain why each cache, queue, load balancer, database, CDN, or worker exists. Distinguish the logical architecture from a list of vendor products.
- **S — Scale:** trace likely bottlenecks from the workload and data model. Consider partitioning, replication, caching, asynchronous work, backpressure, capacity, availability, and operational cost. State the new trade-off each scaling change introduces.

The source describes a sequence, but real interviews are interactive. Revisit requirements when new information changes a decision; move estimation earlier or later; go deep where the interviewer asks. PEDALS does not give a complete named step for failure analysis, security, API contracts, or trade-off wrap-up, so include those explicitly when relevant.

## Cross-item comparison

| Framework | What its labels make salient | What you must still supply |
| --- | --- | --- |
| PEDALS | Requirements, estimate, service behavior, data model, components, scale | Explicit failure/security analysis, trade-off summary, and interviewer-driven reprioritization |
| RESHADED | Adds explicit API, evaluation, and problem-specific distinctive area | Flexible ordering and a concise time budget |
| Alex Xu four-step | Scope, high-level design, deep dive, wrap-up | Make APIs, data, estimates, and failure cases visible inside those broader steps |
| Hello Interview delivery | Core entities, API/system interface, high-level design, deep dives | Estimation when useful and a deliberate close |

These frameworks overlap but are not interchangeable word-for-word. Names and expansions belong to their authors or teaching sources; there is no universal official interview sequence. Pick one scaffold to practice, then adapt it to the interviewer and time available instead of switching mnemonics mid-answer.

## Examples

For a ticket reservation system, first clarify whether the goal is a small venue or a large on-sale, whether overselling is forbidden, and how long a reservation may hold inventory. Estimate peak attempts per seat and reservation duration if this affects queueing or storage. Define reserve, confirm, cancel, and status operations with idempotency keys. Model event, seat, hold, order, and payment state. Draw the write path through inventory ownership and payment. Then scale the on-sale with admission control, a waiting room, partitioning by event, and read caches while preserving one authoritative reservation decision. Close by discussing payment timeouts, hold expiry, fairness, abuse, and which assumption would change the design.

## Common mistakes

- Reciting the acronym without making decisions or explaining user flows.
- Treating estimates as mandatory detailed math even when no choice depends on them.
- Turning every API operation into a table or choosing a database before identifying access patterns.
- Listing cloud products without explaining data flow, ownership, and failure behavior.
- Equating scaling with adding replicas; ignore hotspots, writes, consistency, backpressure, and operational cost.
- Omitting security, privacy, failure handling, or trade-offs because PEDALS does not name them as separate letters.
- Treating the published order as more important than interviewer questions or newly clarified constraints.

## Knowledge checks with answers

1. **Does PEDALS require a capacity estimate in every prompt?** No. The source describes estimation as optional in some contexts; do it when it informs a design choice.
2. **Does “List Architectural Components” mean naming cloud products?** No. Explain the logical component and data flow first; specific products are examples if useful.
3. **What is the difference between “Design the Service” and “Articulate the Data Model”?** The first clarifies behavior and interfaces; the second explains the state and access patterns needed to implement that behavior.
4. **Where do failure modes and trade-offs belong?** Wherever they affect the proposed design, and explicitly in the close. The acronym does not remove those responsibilities.
5. **Should you finish all six steps in order if the interviewer redirects you?** No. Follow the conversation and return to important omitted concerns when time allows.

## Review status

Reviewed 2026-11-21. Replaced generic placeholder material with the six steps grounded in Lewis Lin’s current PEDALS description. Added limits around estimation, schema assumptions, product naming, failure/security coverage, and adaptation to the interview. Compared only framework characteristics supported by their named sources; made no pass-rate or universal timing claims. No material omission remains in the supplied topic scope.

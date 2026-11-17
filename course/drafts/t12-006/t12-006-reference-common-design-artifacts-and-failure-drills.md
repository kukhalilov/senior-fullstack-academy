# end-to-end system design case studies — Reference: Reusable design artifacts and validation

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE workbook: eliminating toil and operating services](https://sre.google/workbook/table-of-contents/), [Google SRE: service level objectives](https://sre.google/sre-book/service-level-objectives/), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework).

## Scope and version

These are lightweight artifacts for reasoning about and communicating system designs, in interviews and real projects. They are not mandatory document templates or substitutes for measurement, operational testing, threat modeling, or product-specific requirements. Tailor their depth to the decision and keep them current as assumptions change.

## How this group fits the mental model

Good system design starts by making assumptions visible. A small set of artifacts lets a team agree on what the product must do, what scale and failure conditions it must handle, where data is authoritative, how work flows, and how the result will be operated. Draw only enough detail to expose a decision or risk. A polished diagram that hides data ownership, retries, capacity, or failure behavior is not a complete design.

Use a sequence: requirements and SLOs → workload model → data/entities and ownership → API/read/write paths → architecture and trade-offs → capacity/security/failure analysis → decision record and operational runbook. Revisit earlier artifacts when later analysis invalidates an assumption.

## Supplied names explained

- **Requirements table:** user behavior, priority, measurable quality target, constraints, and acceptance test. Separate functional requirements from latency, availability, consistency, privacy, recovery, and cost goals.
- **Workload model:** average/peak/burst request rates, concurrency, payload sizes, read/write mix, fan-out, retention, and growth. Record units, time interval, assumptions, and uncertainty.
- **Entity and ownership map:** entities, IDs, relationships, invariants, and the system allowed to author each fact. Distinguish authoritative records from caches and projections.
- **API contract:** operations, schemas, authorization, pagination, versioning, idempotency, errors, retry behavior, and compatibility expectations.
- **Read path:** route from client/query through cache, service, indexes, and data stores; include freshness and cache-miss/failure behavior.
- **Write path:** validation, authorization, invariant enforcement, transaction, durable acknowledgement, event publication, and asynchronous work; identify what happens if a response is lost.
- **Failure matrix:** component/event, user impact, signal, containment, recovery, and possible data-loss/duplicate effects. Include dependencies and operator mistakes, not only server crashes.
- **Capacity estimate:** arithmetic from workload to CPU, memory, storage, network, queues, replication, and headroom. Show assumptions and sensitivity, not false precision.
- **Architecture decision record (ADR):** context, decision, alternatives considered, reasons, consequences, risks, owner/date, and evidence or trigger that would reopen the decision.
- **Operational runbook:** symptom, dashboards/alerts, diagnostic steps, safe mitigation, escalation, rollback/failover, and verification that service/data integrity recovered.

## Cross-item comparison

| Artifact | Question it should answer | Failure when omitted |
| --- | --- | --- |
| Requirements + SLOs | What must users experience and how will success be measured? | Teams optimize a different problem or promise unmeasured availability/latency |
| Workload/capacity model | What load and headroom must the design support? | Arbitrary technology selection and unexpected hot spots/costs |
| Ownership + read/write paths | Who owns each fact and what does each request do? | Conflicting sources of truth, lost writes, stale reads, unsafe retries |
| Failure matrix/runbook | How will the system and responders behave when components fail? | Unbounded retries, untested recovery, slow or unsafe incident actions |
| ADR | Why was this choice made and when should it change? | Repeated debate or assumptions silently becoming permanent |

## Examples

For a ticket-reservation service, requirements say a seat must never be sold twice, a user can see available inventory, and checkout may take a defined maximum time. The workload model estimates peak browsing and purchase rates separately. The ownership map names one authoritative reservation/seat state. The API specifies an idempotency key and expiration behavior. The read path may cache seat-map presentation but labels it as possibly stale. The write path atomically reserves a seat with an expiry and records payment workflow state. The failure matrix asks what happens if payment succeeds but the response is lost, the reservation expires during a payment delay, or the queue backlog grows. Capacity assumptions include hot events and surge traffic. The ADR records why a reservation/queue policy was chosen. The runbook explains how to pause sales, reconcile reservations, and resume safely.

In an interview, narrate the same path before drawing a collection of products: requirement → scale estimate → data ownership → request flow → bottleneck/failure → measured trade-off. Use a concise diagram only after the entities and arrows have meaning. Explain where a calculation is an estimate and what measurement would update it.

## Failure drills

For each critical write, inject or reason about: request delivered twice; request accepted but response lost; service crashes before or after commit; queue duplicates or delays a message; database/region is unavailable; cache is stale; one tenant creates a hot key; deployment overlaps old and new schema; credential provider fails; restore uses an old backup. For every case, state user-visible result, data invariant, signal, recovery action, and whether the operation can safely be retried.

## Common mistakes

- Treating a diagram, service list, or ADR as proof the design meets its goals.
- Writing unmeasurable requirements such as “fast” or “highly available.”
- Estimating throughput without units, peak/burst behavior, fan-out, or uncertainty.
- Drawing a cache or replica without stating staleness, ownership, and failure behavior.
- Describing the happy path but omitting duplicate delivery, ambiguous timeout, recovery, and operator response.
- Creating documents once and allowing them to contradict the deployed system.
- Over-documenting low-risk choices while leaving high-impact decisions and recovery steps vague.
- Presenting a precise capacity number that depends on unverified assumptions as a fact.

## Knowledge checks with answers

1. **Which artifact answers who may change a particular fact?** The entity and ownership map, supported by the write path and API authorization contract.
2. **What should follow a lost acknowledgement after a write?** The failure analysis should identify an idempotency/status-check strategy or explicitly show how duplicate effects are prevented.
3. **Why do SLOs belong near functional requirements?** They turn qualities such as latency and availability into measurable user-facing goals that guide architecture and operations.
4. **What makes a capacity estimate useful if it is uncertain?** Explicit units/assumptions, ranges or sensitivities, and a plan to validate the dominant unknown with measurement/load testing.
5. **When should an ADR be revisited?** When the evidence, workload, constraints, or trigger recorded in the decision changes materially.

## Review status

The SLO and operational-artifact framing is cross-checked against Google SRE and cloud Well-Architected guidance. This lesson remains pending full claim-by-claim audit and manifest omission check.

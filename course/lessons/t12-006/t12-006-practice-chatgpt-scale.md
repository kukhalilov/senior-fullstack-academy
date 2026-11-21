# end-to-end system design case studies — Problem: Design a conversational AI service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice session state, streaming generation, inference capacity, safety, and cost; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a conversational assistant that streams responses, supports conversation history, and serves many tenants under model-provider limits.

**Worked design.** Authenticate each session and keep conversation history under explicit retention and privacy policy. Stream output through a gateway that enforces per-tenant quotas, deadlines, token budgets, and provider routing. Separate durable conversation state from transient generation state; handle client disconnect without assuming inference instantly stops. Queue or reject overload predictably and offer a safe fallback. Apply safety and tool authorization outside model text. Measure time-to-first-token, completion latency, tokens/cost, provider errors, and abuse outcomes.

## Exercises

1. **Specify the contract.** From this case — Design a conversational assistant that streams responses, supports conversation history, and serves many tenants under model-provider limits. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with session state, streaming generation, inference capacity, safety, and cost. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A client reconnects after losing acknowledgements while membership, privacy, or source permissions have changed. Reconcile cursor/version, deduplicate replay, and recheck current authorization before delivery. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to session state, streaming generation, inference capacity, safety, and cost. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design a conversational AI service, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (session state, streaming generation, inference capacity, safety, and cost), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Authenticate each session and keep conversation history under explicit retention and privacy policy. Stream output through a gateway that enforces per-tenant quotas, deadlines, token budgets, and provider routing. Separate durable conversation state from transient generation state; handle client disconnect without assuming inference instantly stops. Queue or reject overload predictably and offer a safe fallback. Apply safety and tool authorization outside model text. Measure time-to-first-token, completion latency, tokens/cost, provider errors, and abuse outcomes.

## Tests and edge cases

Test provider rate limit, stream disconnect, duplicate turn submission, long context, tenant quota exhaustion, and unsafe tool request.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

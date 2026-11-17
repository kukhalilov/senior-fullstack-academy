# end-to-end system design case studies — Problem: Design a conversational AI service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice session state, streaming generation, inference capacity, safety, and cost; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a conversational assistant that streams responses, supports conversation history, and serves many tenants under model-provider limits.

**Worked design.** Authenticate each session and keep conversation history under explicit retention and privacy policy. Stream output through a gateway that enforces per-tenant quotas, deadlines, token budgets, and provider routing. Separate durable conversation state from transient generation state; handle client disconnect without assuming inference instantly stops. Queue or reject overload predictably and offer a safe fallback. Apply safety and tool authorization outside model text. Measure time-to-first-token, completion latency, tokens/cost, provider errors, and abuse outcomes.

## Exercises

1. Write the top functional requirements and the quality objective that most changes the architecture.
2. Estimate demand, storage growth, and the likely hot key or constrained resource. State assumptions.
3. Define authoritative data, identifiers, API behavior, and transaction boundary.
4. Trace a write and a read, including a timeout or duplicate request.
5. Describe one scaling change and its consistency, cost, and operational tradeoffs.

## Progressive hints

Start with the invariant and user-visible outcome. Separate write and read paths. Identify a simpler baseline before adding distributed components. Make one failure case concrete.

## Complete solutions

1. Prioritize user-visible correctness and measurable latency, availability, freshness, durability, or cost for the relevant path.
2. Use ranges for traffic and growth. Identify skew and fan-out rather than assuming uniform keys. Validate the sensitive estimate with a representative benchmark.
3. Name one authoritative owner for each critical fact. Specify idempotency and compatibility when callers may retry or remain old.
4. Treat missing acknowledgements as unknown outcomes. Retry only with idempotency or verify state; make asynchronous effects deduplicable.
5. Add replication, caching, partitioning, or queueing only to meet a stated need; explain the operations burden and recovery plan.

### Case-specific design answer

Authenticate each session and keep conversation history under explicit retention and privacy policy. Stream output through a gateway that enforces per-tenant quotas, deadlines, token budgets, and provider routing. Separate durable conversation state from transient generation state; handle client disconnect without assuming inference instantly stops. Queue or reject overload predictably and offer a safe fallback. Apply safety and tool authorization outside model text. Measure time-to-first-token, completion latency, tokens/cost, provider errors, and abuse outcomes.

## Tests and edge cases

Test provider rate limit, stream disconnect, duplicate turn submission, long context, tenant quota exhaustion, and unsafe tool request.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

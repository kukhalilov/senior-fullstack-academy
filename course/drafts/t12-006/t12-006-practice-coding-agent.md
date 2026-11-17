# end-to-end system design case studies — Problem: Design a coding agent service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice repository indexing, isolated tools, patch review, and session streaming; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design an assistant that indexes repositories, answers code questions, and can propose or apply changes through tools.

**Worked design.** Authorize repository access before indexing and at every tool action. Version the index against commit/tree IDs and refresh incrementally. Run shell/build/test tools in isolated, resource-limited sandboxes with read/write scopes; never grant model output ambient host credentials. Stream progress but persist a durable session/event record sufficient for reconnect. Treat generated patches as untrusted changes requiring diff review and tests. Measure indexing freshness, tool failure, sandbox escape controls, cost, and user-approved completion.

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

Authorize repository access before indexing and at every tool action. Version the index against commit/tree IDs and refresh incrementally. Run shell/build/test tools in isolated, resource-limited sandboxes with read/write scopes; never grant model output ambient host credentials. Stream progress but persist a durable session/event record sufficient for reconnect. Treat generated patches as untrusted changes requiring diff review and tests. Measure indexing freshness, tool failure, sandbox escape controls, cost, and user-approved completion.

## Tests and edge cases

Test repository permission revocation, malicious prompt in source comments, runaway command, stale index, interrupted stream, and patch conflict.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

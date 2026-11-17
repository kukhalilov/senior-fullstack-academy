# end-to-end system design case studies — Problem: Design a CI/CD platform

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice workflow scheduling, ephemeral runners, artifact integrity, secrets, and tenant isolation; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a hosted build platform that executes customer workflows with caches, artifacts, secrets, and concurrent jobs.

**Worked design.** Parse workflow definitions into a validated DAG and schedule jobs with fair tenant quotas. Execute untrusted build code on isolated ephemeral runners; scope credentials to the minimum step and never expose secrets to untrusted fork workflows. Store artifacts by immutable digest with provenance and access policy. Cache keys include relevant inputs and tenant boundaries. Cancellation and retries must not duplicate release side effects. Observe queue wait, runner saturation, cache hits, artifact integrity, and secret-access audit.

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

Parse workflow definitions into a validated DAG and schedule jobs with fair tenant quotas. Execute untrusted build code on isolated ephemeral runners; scope credentials to the minimum step and never expose secrets to untrusted fork workflows. Store artifacts by immutable digest with provenance and access policy. Cache keys include relevant inputs and tenant boundaries. Cancellation and retries must not duplicate release side effects. Observe queue wait, runner saturation, cache hits, artifact integrity, and secret-access audit.

## Tests and edge cases

Test malicious workflow, forked pull request, runner reuse leak, cache poisoning, artifact substitution, and cancellation during publish.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

# end-to-end system design case studies — Problem: Design a content moderation system

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice classifier cascades, pre-publish latency, human review, appeals, and audit; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design moderation for user-generated text and media with fast high-confidence decisions and human handling of uncertain cases.

**Worked design.** Classify content under a documented policy and route by confidence and impact. Apply fast rules/models on the pre-publish path, sending uncertain or high-severity cases to a prioritized review queue. Provide appeals and preserve decision evidence with model/policy version. Avoid treating one classifier score as a universal truth; evaluate by language, modality, and affected group. Recheck media asynchronously when deeper models are slow, while user-visible state remains explicit. Protect reviewers and minimize sensitive data retention.

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

Classify content under a documented policy and route by confidence and impact. Apply fast rules/models on the pre-publish path, sending uncertain or high-severity cases to a prioritized review queue. Provide appeals and preserve decision evidence with model/policy version. Avoid treating one classifier score as a universal truth; evaluate by language, modality, and affected group. Recheck media asynchronously when deeper models are slow, while user-visible state remains explicit. Protect reviewers and minimize sensitive data retention.

## Tests and edge cases

Test model outage, high review backlog, adversarial content, language imbalance, appeal reversal, and delayed scan result.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

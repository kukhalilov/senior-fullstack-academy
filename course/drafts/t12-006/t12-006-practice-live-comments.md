# end-to-end system design case studies — Problem: Design live comments for a large broadcast

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice hot-stream fan-out, moderation, batching, ordering, and slow clients; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design comments for a live event with millions of viewers but far fewer commenters, including moderation and replay.

**Worked design.** Partition comment ingestion by stream and assign accepted sequence IDs. Moderate before broad fan-out where policy requires; a fast initial filter may be followed by deeper review and removal events. Batch delivery and isolate slow consumers so one connection cannot back up the stream. Persist enough for replay and moderation audit, while presence and transient reactions remain ephemeral. A single celebrity stream is a hot partition; shard fan-out and aggregate counts. Measure moderation latency, fan-out lag, drops, and reconnect recovery.

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

Partition comment ingestion by stream and assign accepted sequence IDs. Moderate before broad fan-out where policy requires; a fast initial filter may be followed by deeper review and removal events. Batch delivery and isolate slow consumers so one connection cannot back up the stream. Persist enough for replay and moderation audit, while presence and transient reactions remain ephemeral. A single celebrity stream is a hot partition; shard fan-out and aggregate counts. Measure moderation latency, fan-out lag, drops, and reconnect recovery.

## Tests and edge cases

Test celebrity hotspot, slow viewer, moderation reversal, duplicate comment, stream reconnect, and sudden viewer surge.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

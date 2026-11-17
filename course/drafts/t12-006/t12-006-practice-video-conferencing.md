# end-to-end system design case studies — Problem: Design a video-conferencing service

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice media routing, latency budgets, signaling, recording, and network adaptation; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design meetings with interactive audio/video, screen sharing, recording, and participants joining from unreliable networks.

**Worked design.** Separate control-plane signaling and room authorization from real-time media forwarding. Select peer-to-peer, selective forwarding, or mixing topology based on group size, client capabilities, bandwidth, and server cost. Route media regionally and adapt bitrate to congestion; audio usually has stricter latency needs than archival recording. Handle reconnect, mute, participant permissions, and recording consent. Monitor packet loss, jitter, round-trip time, join time, and quality by region and device.

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

Separate control-plane signaling and room authorization from real-time media forwarding. Select peer-to-peer, selective forwarding, or mixing topology based on group size, client capabilities, bandwidth, and server cost. Route media regionally and adapt bitrate to congestion; audio usually has stricter latency needs than archival recording. Handle reconnect, mute, participant permissions, and recording consent. Monitor packet loss, jitter, round-trip time, join time, and quality by region and device.

## Tests and edge cases

Test NAT/firewall restrictions, large meeting fan-out, region loss, bandwidth drop, participant permission change, and recording interruption.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

# end-to-end system design case studies — Problem: Design a real-time voice agent

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice streaming audio, turn-taking, interruption, latency budgets, and privacy; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a voice assistant that listens, responds with generated speech, and supports barge-in while maintaining low conversational delay.

**Worked design.** Budget end-to-end latency across capture, transport, speech recognition, model, and speech synthesis. Stream intermediate audio/text where supported and allow interruption to cancel or supersede prior generation. Use session sequence IDs to prevent late audio from playing after a new turn. Separate ephemeral media from retained transcripts and obtain consent for recording. Handle packet loss, reconnect, and device echo. Monitor turn latency, interruption success, recognition quality, and dropped audio by network cohort.

## Exercises

1. **Specify the contract.** From this case — Design a voice assistant that listens, responds with generated speech, and supports barge-in while maintaining low conversational delay. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with streaming audio, turn-taking, interruption, latency budgets, and privacy. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A regional media path degrades during a peak. Describe what stays available, how the client detects and recovers, what old events are discarded, and how you prevent overload from cascading. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to streaming audio, turn-taking, interruption, latency budgets, and privacy. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design a real-time voice agent, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (streaming audio, turn-taking, interruption, latency budgets, and privacy), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Budget end-to-end latency across capture, transport, speech recognition, model, and speech synthesis. Stream intermediate audio/text where supported and allow interruption to cancel or supersede prior generation. Use session sequence IDs to prevent late audio from playing after a new turn. Separate ephemeral media from retained transcripts and obtain consent for recording. Handle packet loss, reconnect, and device echo. Monitor turn latency, interruption success, recognition quality, and dropped audio by network cohort.

## Tests and edge cases

Test barge-in, partial transcription correction, network loss, duplicate turn, background noise, and consent withdrawal.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?

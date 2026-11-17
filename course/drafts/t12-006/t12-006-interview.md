# end-to-end system design case studies — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 3](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://www.rfc-editor.org/rfc/rfc9110), [reference 6](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [reference 7](https://hld.handbook.academy/curriculum/case-studies/), [reference 8](https://hld.handbook.academy/curriculum/interview-framework/frameworks-compared/), [reference 9](https://www.rfc-editor.org/rfc/rfc9309), [reference 10](https://www.rfc-editor.org/rfc/rfc5322), [reference 11](https://www.rfc-editor.org/rfc/rfc8216).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

What must be correct under concurrency? What is the source of truth? What happens when an acknowledgement is lost? Which workload dominates? What is the hot key? How stale may a read be? How are tenants isolated? What is the recovery target? How does the team detect and reverse a bad change? These cross-case questions expose whether a diagram is operationally complete.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- Fan-out-on-write vs Fan-out-on-read: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- At-most-once vs At-least-once delivery: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Strong reservation vs Best-effort availability: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Object bytes vs Object metadata: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Synchronous response vs Durable asynchronous acceptance: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

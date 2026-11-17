# system design tradeoffs and decision methods — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/trade-offs/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [reference 5](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

For every proposed mechanism, answer: what requirement does it meet; what is the simpler alternative; what guarantee is actually provided; what fails during timeout, partition, retry, or recovery; how is it operated; and what evidence would change the decision? Avoid false dichotomies: hybrids are valid when boundaries and guarantees are clear.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- SQL vs NoSQL vs B-tree vs LSM-tree vs Range vs hash vs consistent-hash vs directory partitioning vs Normalization vs denormalization vs ACID vs BASE: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Strong vs eventual consistency vs CAP and PACELC applied vs Leader-follower vs multi-leader vs leaderless replication vs 2PC vs saga vs TCC vs Optimistic vs pessimistic concurrency control: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Latency vs throughput vs Vertical vs horizontal scaling vs Cache-aside vs write-through vs write-behind vs Token bucket vs sliding-window rate limiting vs Single-region vs multi-region deployment: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Monolith vs microservices vs REST vs gRPC vs GraphQL vs Load balancer vs reverse proxy vs API gateway: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Batch vs stream processing vs Lambda vs Kappa architecture vs Polling vs long-polling vs SSE vs WebSockets vs webhooks vs Push vs pull delivery and fan-out: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

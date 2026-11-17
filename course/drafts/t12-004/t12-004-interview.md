# architecture patterns multi-region tenancy and reliability — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

Senior answers connect product invariants, ownership, operating model, and failure behavior. Explain why a boundary exists, who owns its data, how to evolve the contract, how to contain a tenant or dependency failure, and how you would know the change improved the user outcome. Avoid “microservices for scale” and “multi-region for availability” without targets and tested recovery.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- Modular monolith vs Microservices: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- CQRS vs Event sourcing: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Single-region deployment vs Multi-zone deployment vs Multi-region deployment: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Active-passive multi-region vs Active-active multi-region: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- RED method vs USE method: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Canary deployment vs Expand-and-contract migration: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

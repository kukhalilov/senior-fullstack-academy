# data systems storage engines analytics streams and search — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://hld.handbook.academy/curriculum/data-systems/).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

Explain why the source of truth, transaction boundary, derived projections, and event retention are separate design choices. Walk through duplicate delivery, consumer restart, schema change, late event, rebuild, and reconciliation. Strong answers make freshness visible and explain who owns correction.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- OLTP vs OLAP: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- B-tree vs Log-structured merge tree (LSM tree): select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Batch processing vs Stream processing: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Lambda architecture vs Kappa architecture: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Data lake vs Data warehouse vs Lakehouse: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Inverted index vs Vector database: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

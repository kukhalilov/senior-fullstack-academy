# ai and machine learning system design — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://platform.openai.com/docs/guides/production-best-practices), [reference 2](https://cloud.google.com/architecture/framework/ai-ml), [reference 3](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 4](https://owasp.org/www-project-api-security/).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

Explain the complete request path, data boundaries, model and retrieval versions, evaluation gates, budget controls, unsafe output handling, and fallback. A strong answer separates probabilistic generation from deterministic authorization and transaction logic, explains how quality will be measured, and treats prompt injection as a system threat rather than a wording problem.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- RAG vs Fine-tuning: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Offline evaluation vs Online evaluation: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Batch inference vs Real-time inference: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- LLM-as-judge vs Human review: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.
- Agent vs Deterministic workflow: select based on the workload, correctness guarantee, and operating cost rather than treating either choice as universally superior.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

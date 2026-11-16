# architecture interviews tradeoffs requirements and constraints — Big-picture orientation and mental model

## Problem and purpose

A system-design interview asks you to turn an incomplete product request into a defensible design under time, scale, reliability, security, and cost constraints. The interviewer is evaluating how you reason and collaborate as much as the final boxes in a diagram. A strong answer makes assumptions visible, traces real user operations, and adds complexity only when a requirement justifies it.

## Plain-language mental model

Treat the interview as a guided investigation. First establish what a user must accomplish and what failure or delay is unacceptable. Estimate enough workload to expose likely bottlenecks. Draw a simple design that can serve the main journey. Then follow a write and a read through the components, asking where data is authoritative and what happens when each dependency is slow or unavailable. Add a cache, queue, replica, partition, or region only when it addresses a demonstrated need.

## How the parts fit together

Clarifying questions produce requirements and constraints. Those requirements set targets such as latency, durability, consistency, privacy, and cost. Capacity estimates translate users and actions into approximate request, storage, and traffic loads. The high-level design assigns ownership and gives APIs, data stores, and asynchronous components specific jobs. Failure analysis checks the design against timeouts, duplicate work, stale reads, outages, and recovery objectives. Tradeoff communication explains why the chosen design meets the goals and what it costs.

The design loop is iterative: state an assumption, sketch the minimum viable path, trace it, find its limiting constraint, and revise only that part. Keep the interviewer involved so a mistaken assumption is cheap to correct. See the [Google Cloud Well-Architected Framework](https://docs.cloud.google.com/architecture/framework) and [Microsoft technical interview guidance](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html).

## Concept map

| Interview question | Evidence to establish | Design consequence |
|---|---|---|
| What must the user do? | Primary journeys, actors, acceptance criteria | Endpoints, entities, permissions |
| How well must it work? | Latency, availability, durability, consistency | Synchronous boundaries, redundancy, storage |
| How much work arrives? | Average and peak RPS, payload, retention, fan-out | Capacity, indexing, queues, partitioning |
| Who owns each fact? | Source of truth and update rules | Database boundaries, event contracts, cache policy |
| What fails? | Dependency and regional failure scenarios | Timeouts, retries, idempotency, degradation, recovery |
| Why this design? | Alternatives and operational cost | Explicit tradeoff and next bottleneck |

## End-to-end walkthrough

For a file-sharing service, clarify whether users upload large files, share with named users or public links, and need previews or version history. Estimate uploads and downloads, average file size, retention, and peak activity. A simple design can use an API for authorization and metadata, object storage for bytes, and a relational database for ownership and share records. Upload through a short-lived authorized URL if direct transfer reduces API load; the API still decides who may receive it. A background worker can create previews. Trace upload and download separately, including partial failures, malware checks, expiration, and deletion. Introduce a CDN only after accounting for access revocation, private caching, and geographic demand.

## When to use it and tradeoffs

This process fits open-ended architecture interviews and design reviews. It avoids premature microservices and infrastructure shopping. Its estimates are approximations, not capacity guarantees; label assumptions and refine the numbers that could change a design decision. A sound interview design is not necessarily the only valid design. What matters is that its choices satisfy stated requirements and that its failure modes are understood.

## What later lessons cover

The references teach interview framing, estimation, high-level flow, reliability/scaling, and tradeoff communication. Three scenario exercises practice the browser critical rendering path, end-to-end search suggestions, and safe full-stack deployment. Related technologies and detailed architecture patterns live in the system-design and operations topics.

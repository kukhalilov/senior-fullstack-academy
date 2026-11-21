# architecture patterns multi-region tenancy and reliability — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 3](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://csrc.nist.gov/pubs/sp/800/207/final), [reference 6](https://owasp.org/www-project-api-security/), [reference 7](https://opentelemetry.io/docs/concepts/), [reference 8](https://hld.handbook.academy/curriculum/architecture-patterns/), [reference 9](https://hld.handbook.academy/curriculum/reliability-and-operations/), [reference 10](https://hld.handbook.academy/curriculum/security-at-scale/), [reference 11](https://hld.handbook.academy/curriculum/emerging-patterns/), [reference 12](https://csrc.nist.gov/pubs/fips/203/final), [reference 13](https://csrc.nist.gov/pubs/fips/204/final).

## Problem and purpose

Choose boundaries around cohesive business capabilities and data ownership. A modular monolith is a useful baseline when one deployment meets the need. Split services when independent ownership, scaling, isolation, or release cadence justifies the distributed-system cost. Then make tenancy, region placement, identity, failure budgets, recovery, observability, and release compatibility explicit across the whole system.

## Plain-language mental model

First understand the promise to the user. Then trace data and control from the user to the authoritative state and back. Treat every network hop as a possible delay or failure. Separate synchronous work needed for the response from durable asynchronous work that can finish later.

## How the parts fit together

```text
user goal → requirements + workload → simplest correct end-to-end path
          → ownership + contracts → capacity, consistency, and security
          → failure behavior + observability → measured iteration
```

## Concept map

The major choices fall into five connected questions: where requests enter and how they are routed; where authoritative and derived data live; how work is coordinated across processes; which guarantees users observe during delay or failure; and how the service is operated, secured, and evolved. A component is useful only when it answers one of those questions.

## A repeatable first pass

In a design discussion, first state the user journey and the boundary of the service. Ask for the peak load, geographic footprint, sensitive data, and the failure the business can tolerate. Turn vague words into measurable statements such as “99.9% of successful checkout attempts complete in under 800 ms at the API boundary during the stated peak.” Confirm the measurement window and which failures count; the number is an example target, not a universal standard.

Next draw one successful request from the client to authoritative state and back. Mark every synchronous dependency, durable write, asynchronous handoff, identity check, and user-visible fallback. Estimate traffic and storage with round numbers, identify the likely constrained resource, and choose the simplest architecture that can meet the constraints. Then explain what happens when each dependency is slow, unavailable, duplicated, or restored. Finish with an operating plan: signals, alerts, rollout, backup/restore, and an experiment that can invalidate the design assumptions.

## End-to-end walkthrough

A SaaS application begins as a modular API and a relational database. A background email workload threatens interactive latency, so it moves to a bounded queue and worker. Later, a team-owned search service is extracted with its own read model. Each operation has a deadline and trace context; the database remains authoritative for account membership. A rolling release uses compatible schema changes. A region outage follows tested recovery objectives rather than an untested “fail over” button.

For example, suppose the product expects 400 requests/second at peak and a request reads 5 KB of data. The rough response data volume is 2 MB/second before protocol overhead, caching, and fan-out. This estimate does not tell you database QPS: measure how many reads each request causes, what can be cached, and the actual payload distribution. The purpose is to expose assumptions and guide the next measurement, not to pretend a napkin estimate is a benchmark.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

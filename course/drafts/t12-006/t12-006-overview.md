# end-to-end system design case studies — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://sre.google/sre-book/table-of-contents/), [reference 2](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 3](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://www.rfc-editor.org/rfc/rfc9110), [reference 6](https://learn.microsoft.com/en-us/ef/core/saving/transactions).

## Problem and purpose

Practice different workload shapes rather than memorizing one architecture. A URL shortener stresses key allocation and redirect reads; chat stresses persistent connections and ordering; feeds stress fan-out; payments stress idempotency and reconciliation; file sync stresses object durability and metadata; notifications stress preferences and provider retries. For each, clarify product rules, estimate demand, define authoritative state, trace a write and read, then analyze failure and cost.

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

## End-to-end walkthrough

For a notification platform, accept a request with an idempotency key, validate policy and preferences, persist a durable job, and return an accepted result. Workers select a provider, honor per-channel quotas and deadlines, and record attempt state. Provider timeouts create an unknown-delivery outcome, so deduplication and reconciliation are needed. The user can query status and change preferences. A queue absorbs bursts, but age-of-oldest-job and dead-letter review are as important as queue depth.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

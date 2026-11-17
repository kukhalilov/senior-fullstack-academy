# data systems storage engines analytics streams and search — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [reference 5](https://hld.handbook.academy/curriculum/data-systems/).

## Problem and purpose

Start with the authoritative record and the operations that must be atomic. Then consider how the data is read, reported, searched, retained, and recovered. A transactional database supports consistent updates; an analytical warehouse optimizes broad scans and aggregates; a search index supports text retrieval; an event log enables independent consumers and replay. These systems often coexist, but the source of truth and acceptable propagation delay must be clear.

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

An order service commits an order and an outbox event in the same database transaction. A publisher sends the event to a broker; consumers update analytics and search projections idempotently. If a consumer is offline, it resumes from its offset. The read model may lag the order write, so the UI confirms the order from the authoritative transaction and labels analytics as delayed. Rebuilding a projection from retained events is possible only if event schemas and retention support it.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

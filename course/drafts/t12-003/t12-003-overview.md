# data systems storage engines analytics streams and search — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [PostgreSQL MVCC](https://www.postgresql.org/docs/current/mvcc.html), [Kafka design](https://kafka.apache.org/36/design/design/), [Azure data-store choices](https://learn.microsoft.com/azure/architecture/data-guide/technology-choices/data-storage), [Azure CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs), [Azure event-sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html), [HLD Handbook data systems syllabus](https://hld.handbook.academy/curriculum/data-systems/).

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

An order service commits an order and an outbox event in the same database transaction. A publisher sends the event to a broker; consumers update analytics and search projections idempotently. If a consumer is offline, it resumes from its offset. The read model may lag the order write, so the UI confirms the order from the authoritative transaction and labels analytics as delayed. Rebuilding a projection from retained events is possible only if event schemas and retention support it. If the product has low volume and no independent consumers, start with the relational database and scheduled/report queries; introduce the broker and projections only when freshness, isolation, or measured load justifies them.

## First-pass design questions

Before selecting a product, write down: (1) the invariant and authoritative write; (2) the read/query shapes; (3) latency and freshness targets per read; (4) volume, skew, retention, and growth; (5) recovery point and recovery time; (6) who can read each copy and how deletion/access changes propagate. These questions separate required behavior from implementation fashion. A data copy used for search or analytics needs a rebuild path and a way to identify how stale it is.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

# system design technology landscape and selection — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/technologies/), [reference 1](https://www.postgresql.org/docs/current/), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://grpc.io/about/), [reference 4](https://grpc.io/docs/what-is-grpc/core-concepts/), [reference 5](https://graphql.org/learn/), [reference 6](https://cloud.google.com/spanner), [reference 7](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [reference 8](https://vitess.io/docs/24.0/overview/whatisvitess/), [reference 9](https://docs.scylladb.com/manual/master/using-scylla/cassandra-compatibility.html).

## Problem and purpose

Start with capabilities and constraints, not product names. A relational database, a distributed SQL platform, a cache, a search index, a stream broker, and an object store solve different jobs. Products within a category still differ in consistency, query model, managed operation, compatibility, limits, and cost. This index provides a bounded set of named examples from the HLD Handbook; it is not a ranking or a complete market survey. Confirm version-specific behavior and service limits in current vendor documentation.

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

For a multi-region commerce service, keep transactional order state in a store whose transaction and consistency model matches the order invariants. Use a broker for durable asynchronous events, an analytical store for reporting, object storage for large immutable media, and a search index for derived discovery queries only if measured product requirements justify them. PostgreSQL, MySQL, SQL Server, and distributed SQL products are not interchangeable by label; Kafka, RabbitMQ, SQS, and other messaging systems have different delivery, retention, and operating contracts. Keep source of truth and rebuildable projections distinct, and test recovery from each dependency.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

## Review status

Reviewed 2026-11-21. Checked the orientation against the HLD Handbook technology index and the linked official database, messaging, RPC, query, and cloud documentation. The overview distinguishes product categories and source-of-truth data from rebuildable projections, and makes no ranking or complete-market-survey claim. The examples are illustrative system-design guidance rather than vendor guarantees. No material omission remains in the supplied overview scope.

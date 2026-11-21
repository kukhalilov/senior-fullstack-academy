# system design tradeoffs and decision methods — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/trade-offs/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [reference 5](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Problem and purpose

System design interviews and production reviews often revisit the same decision families: data models, consistency, replication, scaling, caching, interfaces, and event delivery. The correct answer depends on workload and consequences. Terms such as NoSQL, strong consistency, microservices, and exactly once are too broad to justify a design unless translated into specific contracts.

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

For a ticket reservation, first state the invariant that one seat cannot be sold twice. A strongly coordinated inventory write may be appropriate even if browsing uses a stale cache. A payment workflow spanning an external processor cannot share one ordinary database transaction; model reservation, payment outcome, timeout, compensation, and reconciliation. This combines several tradeoffs without pretending one architecture label resolves them.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

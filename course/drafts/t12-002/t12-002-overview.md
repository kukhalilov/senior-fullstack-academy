# distributed systems consistency coordination and convergence — Big-picture orientation and mental model

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://hld.handbook.academy/curriculum/distributed-systems-theory/).

## Problem and purpose

Replicas improve locality and availability, but they create coordination questions: which write wins, what can a reader observe, and how does a node recover after isolation? Stronger ordering usually requires coordination and can increase latency or reduce availability during partitions. Weaker guarantees can improve responsiveness when the application can tolerate stale or mergeable state. Pick a guarantee from user-visible invariants, then choose mechanisms that implement it.

## Plain-language mental model

First understand the promise to the user. Then trace data and control from the user to the authoritative state and back. Treat every network hop as a possible delay or failure. Separate synchronous work needed for the response from durable asynchronous work that can finish later.

### Start with the story of one saved change

Suppose you edit your profile on a phone. The phone sends the change to a server, the server saves it, and the phone shows the updated name. Later you open a laptop and expect to see the same name. That is the core problem: there may be several copies of the data, and messages between them take time or fail. First decide what the user is promised: must every screen show the new value immediately, or is a short delay acceptable? What should happen if the phone loses its connection just after saving?

Keep that story in mind before learning terms such as replica, quorum, clock, or consensus. A replica is simply another copy. Consistency describes which copy a reader may see. Coordination is how copies agree on important decisions. A clock gives each machine a local estimate of time; it does not automatically tell all machines which user action truly happened last. The technical methods in later sections are tools for implementing the user-visible promise, not the goal by themselves.

### Apply the idea before naming a protocol

1. Write the rule the product must protect, such as “a payment is recorded once” or “a profile may be briefly stale.”
2. Identify which copy is allowed to decide the result.
3. Trace what a reader sees after a save, during a delay, and after a connection returns.
4. Decide whether a lost response means “try again,” “check the result,” or “show an unknown status.”
5. Choose a protocol only after you know which of those behaviors the product requires.

For example, profile display may tolerate a short delay and later refresh. Deducting money or claiming the last ticket usually needs one authoritative decision before success is shown. The same database or replication technique should not be chosen for both just because both store data.

## How the parts fit together

```text
user goal → requirements + workload → simplest correct end-to-end path
          → ownership + contracts → capacity, consistency, and security
          → failure behavior + observability → measured iteration
```

## Concept map

The major choices fall into five connected questions: where requests enter and how they are routed; where authoritative and derived data live; how work is coordinated across processes; which guarantees users observe during delay or failure; and how the service is operated, secured, and evolved. A component is useful only when it answers one of those questions.

## End-to-end walkthrough

Two regions accept edits to a shared profile while temporarily disconnected. If the invariant is “a user may have only one active subscription,” both regions cannot independently accept conflicting transitions without coordination or later conflict handling. For a set of liked items, additions and removals may instead be merged with a CRDT-style operation if the chosen data type preserves the intended semantics. The design must document what users observe during the partition and how reconciliation is surfaced.

## When to use it and tradeoffs

Use these concepts when defining a new service, reviewing a scaling proposal, investigating an incident, or preparing an architecture interview. Prefer the smallest design that meets measured goals. Distribution improves some forms of scale and isolation but adds network failure, partial success, consistency choices, and on-call burden.

## What later lessons cover

The concepts lesson develops the decision process and failure reasoning. Reference lessons explain each named item in bounded groups. Practice and interview lessons apply the ideas to realistic scenarios. Existing .NET, React, SQL, security, and operations tracks remain the place for framework-specific APIs and configuration.

# system design tradeoffs and decision methods — Reference: CAP and PACELC applied

Sources: [Gilbert and Lynch, Brewer's conjecture and the feasibility of consistent, available, partition-tolerant web services](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [Abadi, Consistency Tradeoffs in Modern Distributed Database System Design](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf), [CAP twelve years later](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/).

## How this group fits the mental model

Imagine a customer transfers money between two accounts while the network link between database replicas is broken. The system cannot both confirm every operation immediately at every side of that broken link and guarantee that every read observes one globally ordered, up-to-date history. You must decide which requests can wait or fail, which can be accepted locally, and how the product explains the outcome. That product promise—not the CAP acronym—drives the design.

## Supplied names explained

- **Consistency (CAP sense):** the formal property commonly called atomic consistency or linearizability: each completed operation appears to take effect at one instant between invocation and response, respecting real-time order. This is stronger and more specific than the broad everyday use of “consistent data.”
- **Availability (CAP sense):** every request received by a non-failing node eventually receives a non-error response. Returning an error or waiting indefinitely does not satisfy this definition. A system may remain reachable while rejecting some writes, so ordinary product “uptime” is not identical to this formal property.
- **Partition tolerance:** operation continues despite messages being lost or delayed across a network partition. A partition is a failure condition, not a setting an application can disable.
- **CAP result:** when a partition occurs, a distributed service cannot guarantee both linearizable consistency and availability for all requests. It can reject, defer, or limit operations to preserve consistency, or serve/accept operations that can diverge and reconcile later. This statement is about the specified model and guarantees; it does not say every distributed database is permanently “CP” or “AP.”
- **PACELC:** extends the question: if there is a partition (P), choose between availability (A) and consistency (C); else (E), choose between lower latency (L) and consistency (C). This is a useful lens for systems whose normal request path also trades coordination delay for stronger ordering.

These are reasoning models, not vendor certifications. A product can expose multiple consistency levels, transaction scopes, or read/write paths. Evaluate the exact operation, configuration, topology, and failure model rather than assigning one label to a whole database.

## Cross-item comparison

Suppose a shopping cart or account balance is written in one region and read from another.

| Choice under a broken inter-region link | User-visible behavior | Main cost or risk |
| --- | --- | --- |
| Require a single globally ordered result | The isolated side may reject or wait on writes and some reads until it can coordinate | Requests fail or stall during the partition; latency can also rise during healthy operation when coordination crosses regions |
| Let each reachable side accept local writes | Users can keep making progress on both sides | Reads can be stale and concurrent writes can conflict; merge rules must preserve business invariants and explain any resolution |
| Keep only some operations available | Low-risk reads or cart edits may continue while transfers or inventory reservations wait | The application needs explicit per-operation policy and must avoid presenting partial success as a completed transaction |

The third row is often a practical product design: different operations have different invariants. For example, browsing a product description can tolerate a short stale view; selling the last unit or moving money may require a single authoritative decision. A conflict-resolution rule such as “last write wins” can discard a valid business action and is not a substitute for defining the invariant.

## Examples

Even with no partition, a read may contact a nearby replica for low latency or coordinate with a leader/quorum for a stronger freshness/order guarantee. The choice depends on the data and the request contract. A read-after-write promise, a globally unique reservation, and an approximate view counter need not share one policy. Stronger consistency often requires coordination, but the exact latency and availability depend on protocol, topology, quorum placement, and implementation; PACELC does not calculate them for you.

For a specific request, write down:

1. The invariant that must never be violated.
2. What the caller may observe after a successful write, including from another region.
3. What the service does during a partition: reject, wait, read stale data, accept a mergeable write, or allow only selected operations.
4. The maximum acceptable normal-path latency and the failure behavior when a quorum or leader cannot be reached.
5. How retries, duplicate submissions, timeouts, and reconciliation behave. A timeout means the caller may not know whether the write committed; use idempotency or queryable operation state where appropriate.

## Common mistakes

- Saying “pick any two of consistency, availability, partition tolerance.” In CAP, the relevant unavoidable choice is between consistency and availability when a partition is occurring; a distributed network must account for partitions.
- Treating “consistent” as a synonym for valid data, schema consistency, or ACID transactions without stating the formal property.
- Treating a product as universally CP or AP without naming operation, consistency level, configuration, and failure scenario.
- Assuming low latency and strong consistency are always incompatible or always compatible. PACELC asks you to investigate coordination and topology; it is not a universal product ranking.
- Forgetting application-level invariants, conflict behavior, retry ambiguity, and the user experience when requests are delayed or refused.

## Worked interview answer

“For a balance transfer, accepting independent writes on both sides of a partition could overspend the same funds. I would preserve one authoritative decision for that invariant, even if the isolated region must reject or queue transfers. For product browsing, I could serve a nearby, slightly stale read if the UI states and refreshes appropriately. In normal operation I would measure cross-region coordination latency and select a consistency level per operation. I would test partition, delayed response, duplicate retry, and recovery paths; the CAP/PACELC labels help frame those tests, but the database’s documented contract and our invariant determine the design.”

## Knowledge checks with answers

1. **A replica is reachable but cannot contact the leader. Can it return a successful, linearizable write immediately?** Not while preserving the single global ordering guarantee unless the protocol can safely elect/confirm an authority under its stated rules; otherwise it must wait or reject, or relax the guarantee.
2. **Does CAP mean the service must choose between consistency and availability on ordinary healthy requests?** No. The CAP tension is specifically during a partition; PACELC separately highlights normal-operation latency versus consistency.
3. **Can one application use different choices for different endpoints?** Yes, if each endpoint’s invariants and API promise are explicit and the underlying data/transaction boundaries support them.

## Scope and version

The formal CAP definitions and impossibility result are from Gilbert and Lynch. PACELC's normal-operation latency/consistency distinction is from Abadi. The “CAP twelve years later” discussion helps avoid the oversimplified slogan; product-specific guarantees still require the primary product documentation.

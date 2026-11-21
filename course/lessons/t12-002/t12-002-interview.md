# distributed systems consistency coordination and convergence — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://hld.handbook.academy/curriculum/distributed-systems-theory/).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

When asked whether a system is strongly or eventually consistent, first name the operation and invariant. Explain the allowed stale read, whether a session sees its own write, what a partition means, and whether coordination is needed. Consensus orders decisions; replication copies state; quorums are protocol parameters; clocks help reason about order but do not replace the protocol.

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- A database commit may have succeeded although the caller timed out. What is your recovery protocol?
- Traffic grows tenfold but only one tenant drives it. How do you protect other tenants and determine whether partitioning is needed?
- The queue is healthy by depth but users report delayed work. Which time-based signal and end-to-end trace do you inspect?
- A deployment changes both API and schema while old instances remain. How do you sequence compatible changes and rollback?
- Two regions accept conflicting writes. Which operations can merge, and which need a single authority or coordination?

## Tradeoffs and alternatives

- **Linearizability vs sequential consistency vs eventual consistency:** Linearizability respects real-time precedence across completed operations; sequential consistency preserves each process’s program order but not cross-process real-time order; eventual consistency promises convergence only if updates stop and communication/reconciliation continue. State the exact stale-read or ordering rule the user needs before selecting one.
- **Lamport clock vs vector clock vs hybrid logical clock:** Lamport clocks cheaply preserve happened-before in one direction but cannot detect concurrency from scalar order. Vector clocks can distinguish causality from concurrency for tracked replicas, at metadata and membership cost. HLC combines logical ordering with a value near physical time under stated assumptions, but is neither consensus nor a perfect wall clock.
- **State-based CRDT vs operation-based CRDT:** State-based designs merge semilattice states and tolerate duplicate/reordered state exchange when merge is correct, often at higher payload cost. Operation-based designs disseminate operations and can be more compact, but need delivery/commutativity assumptions such as causal delivery. Compare the library’s actual transport and metadata contract.
- **Consistent hashing vs rendezvous hashing:** A ring maps keys to token positions and supports successor walks/virtual nodes; rendezvous (highest-random-weight) scores candidate nodes per key and chooses the highest score. Both can limit remapping when membership changes, but differ in lookup cost, weights, replication selection, and operational membership data. Neither solves hot-key skew by itself.
- **Consensus vs two-phase commit (2PC):** Consensus safely replicates a decision or log among a fault-tolerant group; classic 2PC coordinates one atomic commit decision across transaction participants and can block prepared participants when the coordinator fails. They solve different problems. Consensus can be used to replicate a commit decision (Paxos Commit), but ordinary 2PC is not consensus and local consensus in each service does not make a cross-service transaction atomic.

In an interview, compare the guarantee first, then name the assumptions and cost that matter for the scenario. Avoid presenting a mechanism as a universal substitute for another.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.

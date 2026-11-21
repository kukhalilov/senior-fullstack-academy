# distributed systems consistency coordination and convergence — Reference: Consistency, transactions, and consensus

## Scope and version

This is a concept lesson, not an implementation guide. It covers the eight manifest items: linearizability, sequential consistency, eventual consistency, read-your-writes, quorum read/write, consensus, Raft, and two-phase commit. The model descriptions are general; Raft behavior is grounded in the original paper, and the example of two-phase commit is the classical blocking protocol.

## How this group fits the mental model

Start with the user-visible rule. Must a customer immediately see a completed payment? Must a bank transfer never create or destroy money? Can a social feed briefly show old data? The rule determines what reads may observe, how writes are ordered, and how the system behaves when a network path or process fails. “Strong consistency” is too vague unless you say which operations and which history must be allowed.

Replication copies data; it does not by itself specify how replicas agree. Consensus orders a shared sequence or chooses a value under a fault model. A transaction protocol coordinates a decision across participants. These mechanisms can be combined, but one does not automatically give the other’s guarantees.

## Supplied names explained

### Linearizability

An operation appears to take effect at one instant between its invocation and response, and real-time precedence is respected: if operation A has completed before B begins, A must appear before B in the legal sequential history. Overlapping operations may be ordered either way if the object’s sequential rules allow it. Linearizability is useful for objects such as a lock or account balance when callers need a current, globally coherent view, but it can require coordination and make operations unavailable or slower during partitions.

### Sequential consistency

Operations appear in one legal total order that preserves each process’s own program order. Unlike linearizability, that total order need not respect real time across different processes. For example, a write may return to one client before another client starts a read, yet a sequentially consistent history can place that read before the write if the clients’ per-process orders are preserved. This weaker condition may allow more implementation freedom, but applications must not assume “completed before started” visibility.

### Eventual consistency

If updates stop and the system continues to communicate and reconcile, replicas are expected to converge. This phrase alone does not promise how stale a read may be, when convergence occurs, which conflicting value wins, or that every read sees a monotonic progression. Those properties require additional contracts, such as bounded staleness, read-your-writes, versioning, or a merge rule. Do not treat “eventually” as a latency bound.

### Read-your-writes

A session guarantee: after a client’s write has completed successfully, subsequent reads in that session reflect that write or a later compatible state. A system can implement it by routing the session to an appropriate replica, waiting for replication, or carrying a version/consistency token. It does not automatically guarantee that another client sees the write, that all objects are transactionally consistent, or that the write was durable under every failure.

### Quorum read/write

A client or coordinator asks a selected number of replicas to participate. In a simple fixed replica set of size `N`, read quorum `R` and write quorum `W` intersect when `R + W > N`; write quorums intersect each other when `2W > N`. These arithmetic conditions alone do not establish linearizability. The full protocol must define replica membership, version ordering, how stale values are reconciled, concurrent writes, failures, and whether the read gathers sufficient state. Sloppy quorums that use substitute replicas do not necessarily preserve the fixed-set intersection argument.

Quorums trade response availability and latency against the number of reachable replicas and the consistency protocol. “Quorum” is not one universal guarantee: name the system’s read/write protocol and assumptions.

### Consensus

Consensus is a problem family: distributed participants decide on a value or an ordered log while satisfying safety (no conflicting decisions) and, under the protocol’s assumptions, liveness (progress). In crash-fault protocols such as Paxos and Raft, quorum intersection is central to safety. Progress generally requires a reachable quorum and timing conditions that let a leader or proposer make progress. Consensus does not mean every replica is instantly identical, nor does it automatically make an arbitrary multi-service transaction atomic.

### Raft

Raft is a leader-based consensus algorithm for maintaining a replicated log. Servers elect a leader; clients’ commands are appended and replicated, and committed entries are applied to the state machine in order. Terms, votes, log-matching rules, and a majority protect safety. If no leader can reach a majority, the cluster cannot commit new entries, even if some nodes remain reachable to clients. Elections and network delays can pause progress. The paper also treats membership changes and log compaction; these are part of a real implementation’s correctness and operations, not optional trivia.

### Two-phase commit (2PC)

Two-phase commit coordinates one transaction among participants using a coordinator. In the prepare/vote phase, participants record enough state to promise they can commit and vote yes or no. In the decision phase, the coordinator records and distributes commit or abort. A participant that voted yes may have to wait if the coordinator fails before it learns the durable decision: it cannot safely guess whether the transaction committed. Thus classical 2PC can block under coordinator failure. Durable logs and recovery protocols are required; 2PC is not the same algorithm as consensus and does not provide replicated-log ordering by itself.

## Cross-item comparison

### Compare by the rule you need

| Guarantee or mechanism | Main question answered | Important limit |
| --- | --- | --- |
| Linearizability | Does each operation look atomic and respect real-time precedence? | Coordination can cost latency or availability |
| Sequential consistency | Is there one legal order preserving each process’s local order? | Cross-client real-time precedence may be violated |
| Eventual consistency | Can replicas converge after updates stop and repair continues? | No freshness bound or conflict policy implied |
| Read-your-writes | Does my session observe its own completed write? | No general guarantee for other clients or unrelated state |
| Quorum read/write | Which replicas must participate for an operation? | Intersection arithmetic needs the protocol’s assumptions |
| Consensus / Raft | Can replicas agree on one value or log order? | Needs a quorum for progress; not a general distributed transaction |
| 2PC | Can participants make one atomic commit/abort decision? | May block while participants await a failed coordinator’s decision |

## Examples

### Reservation across services

An inventory service and payment service must both participate in a reservation.

1. A single inventory read may require linearizability if overselling is forbidden. A stale replica read that sees “one unit remains” after another purchase completed can violate the business rule.
2. If the feed showing recent reservations can lag, eventual consistency may be acceptable. Add read-your-writes if the buyer must see their own reservation immediately.
3. A replicated inventory log can use Raft to agree on the order of inventory commands. The majority must be reachable to commit a new command.
4. If inventory and payment are separate transactional participants, Raft in each service does not automatically make the cross-service operation atomic. 2PC is one approach when all participants support the protocol and its blocking/recovery tradeoffs are acceptable. A saga with compensating actions is another application-level design, but it has different semantics: intermediate outcomes may be visible and compensation is not the same as rollback.
5. Define what the customer sees after timeout. The request may have committed even if its response was lost. Use an idempotency key or a status lookup before retrying a non-idempotent charge.

### Quorum arithmetic is not the full guarantee

Suppose a fixed set has `N = 5` replicas, with `W = 3` and `R = 3`. Any three-member read set intersects any three-member write set because `R + W = 6 > 5`. This makes intersection available as one ingredient in a protocol argument. It does not alone say which value the read returns, whether concurrent writes are ordered, whether a write is acknowledged before durable storage, or what happens if membership changes or a sloppy quorum writes to substitutes. Check the entire protocol before calling it linearizable.

## Common mistakes

- Saying “strong consistency” without naming the consistency model and operations covered.
- Assuming sequential consistency preserves real-time order across clients.
- Reading “eventual consistency” as “stale for at most a short time.”
- Treating read-your-writes as global visibility or cross-object transactionality.
- Applying `R + W > N` arithmetic after membership changes or sloppy quorum substitution without rechecking assumptions.
- Confusing a consensus log with atomic commit across independent services.
- Assuming Raft can make progress without a majority or that elections imply the latest command was committed.
- Treating 2PC as nonblocking consensus or retrying an uncertain transaction as if it definitely aborted.

## Knowledge checks with answers

1. **A completed write returns before another client starts a read. Which model requires the read to include it?** Linearizability does. Sequential consistency preserves each client’s own order but does not require that cross-client real-time relationship.
2. **Does eventual consistency say the data becomes fresh within five seconds?** No. It promises convergence only under conditions such as updates stopping and communication/reconciliation continuing; a time bound must be separately specified.
3. **For `N=5`, `R=3`, `W=3`, do the simple replica sets intersect?** Yes, because `R+W>N`. That fact is only one part of the consistency proof.
4. **If a Raft leader loses contact with a majority, can it commit new entries?** No. It may remain alive and reachable to some clients, but it cannot safely commit without the required quorum.
5. **Why can 2PC participants wait after the coordinator crashes?** A participant that voted yes may not know whether a commit decision was durably made and sent elsewhere; guessing could split the outcome.
6. **Does local Raft in each microservice make a payment plus inventory update atomic?** No. Cross-service coordination or a workflow with explicitly different intermediate/compensation semantics is still needed.

## Sources and scope

- Herlihy and Wing, “Linearizability: A Correctness Condition for Concurrent Objects”: [paper](https://www.cs.columbia.edu/~wing/publications/HerlihyWing90.pdf)
- Lamport, “How to Make a Multiprocessor Computer That Correctly Executes Multiprocess Programs”: [paper](https://pages.cs.wisc.edu/~markhill/restricted/toc79_sc.pdf)
- Terry et al., “Session Guarantees for Weakly Consistent Replicated Data”: [paper](https://www.cs.cornell.edu/courses/cs734/2000FA/cached%20papers/SessionGuaranteesPDIS_1.html)
- Bailis et al., “Coordination Avoidance in Database Systems”: [technical report](https://www.cs.cornell.edu/lorenzo/papers/cac-tr.pdf)
- Lamport, “Paxos Made Simple”: [paper](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf)
- Ongaro and Ousterhout, “In Search of an Understandable Consensus Algorithm (Raft)”: [paper](https://web.stanford.edu/~ouster/cgi-bin/papers/raft-extended.pdf)
- Gray and Lamport, “Consensus on Transaction Commit” (explains classical 2PC blocking and Paxos Commit): [paper](https://arxiv.org/abs/cs/0408036)
- Gilbert and Lynch, “Brewer’s Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services”: [paper](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf)
- Abadi, “Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story”: [paper](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf)

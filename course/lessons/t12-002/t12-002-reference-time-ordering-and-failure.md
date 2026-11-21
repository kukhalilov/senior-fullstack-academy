# distributed systems consistency coordination and convergence — Reference: Time, failure detection, and anti-entropy

## Scope and version

This conceptual lesson explains the eight names supplied by the curriculum manifest. It is not a vendor API guide: implementations may use different metadata formats, clocks, detection policies, and repair procedures. The concrete repair example below is labeled as Cassandra-specific.

## How this group fits the mental model

## Start with the practical problem

Suppose two services accept edits while they cannot talk to each other. When they reconnect, the system must decide whether one edit followed the other, whether the edits were independent, which node may be unavailable, and how to find the data that replicas missed. A timestamp, a membership protocol, and a repair mechanism answer different parts of that problem. None creates a trustworthy global clock or makes a timeout proof that a machine has failed.

Use the simplest mechanism that satisfies the product rule. If the requirement is “show approximately when a user acted,” a wall-clock timestamp may be enough. If it is “do not apply a dependent update before its prerequisite,” track causality or use a datastore with the required transaction/consistency guarantee. If the requirement is “eventually discover a replica that missed writes,” plan explicit repair and retention windows.

## Supplied names explained

The remaining sections explain and compare each supplied name in realistic system behavior.

## Cross-item comparison

The table below summarizes the main choice among time representations; the sections that follow compare detection and repair mechanisms.

## Examples

### A small event story

1. Replica A records that an item is available, and sends that update to B.
2. A user reserves the item at B. If B received the availability update first, the reservation causally depends on it. A Lamport or hybrid logical clock can preserve this happens-before relation in its ordering.
3. Two users edit different fields while disconnected. Neither edit caused the other. A scalar timestamp can still sort them, but that arbitrary order does not prove one was based on the other. A vector clock can represent the concurrency when its participant model is practical; the application still needs a conflict policy or merge rule.
4. B does not answer a probe. A membership detector suspects B; a slow process, packet loss, overload, or a network partition can look the same as a crash. The system should make removal and recovery policy explicit.
5. When B returns, hints may replay some missed writes, while anti-entropy compares replicas and repairs remaining divergence. A Merkle tree can narrow the comparison to differing ranges.

## Time and causality

### Wall-clock timestamp

A wall clock estimates civil/physical time and is useful for logs, user-visible dates, retention deadlines, and approximate chronology. Machines can disagree because clocks are imperfectly synchronized; clocks may also be corrected or jump backward. When timestamp uncertainty overlaps, timestamp order cannot tell which event came first. Do not treat a timestamp as a causal proof, a globally unique identifier, or a safe last-write-wins rule unless the system specifies clock assumptions, tie-breaking, and consequences of skew.

### Lamport clock

A Lamport clock is a logical counter. A process increments it for local events and includes it in messages; on receipt it advances beyond both its local value and the received value. If event `a` happened before event `b`, Lamport timestamps order them consistently. The converse is false: `a` having a lower timestamp does not prove `a` caused `b`. Concurrent events may receive different scalar timestamps and be given a deterministic total order, but that order is a tie-breaking convention rather than discovered causality. A node identifier can break equal-counter ties when an application needs a deterministic order.

### Vector clock

A vector clock keeps a logical counter per tracked process (or replica). Nodes increment their own component and merge the component-wise maxima they have learned. Comparing vectors component by component can distinguish “before,” “after,” and “concurrent”: if neither vector is component-wise no greater than the other, the versions are concurrent. This supports conflict detection, but does not decide how to resolve a conflict. Metadata grows with the tracked membership model; dynamic membership, compacting old participants, and long-lived disconnected replicas require explicit rules. Implementations may use dotted version vectors or other compressed schemes, so the simple fixed-vector model should not be assumed to describe every product.

### Hybrid logical clock (HLC)

An HLC combines a physical-time component with logical information. In the published design, it preserves the happened-before ordering property while remaining close to the node’s NTP clock under the design’s assumptions. That makes its values useful for causal ordering and approximate time-oriented operations. “Close to NTP” does not mean the physical clock is correct, synchronized within a universal bound, or suitable for every deadline or security decision. HLC is an ordering aid, not consensus and not a replacement for defining transaction semantics.

### Choosing a time representation

| Need | Suitable starting point | Key limit |
| --- | --- | --- |
| Human-facing approximate date | Wall-clock timestamp | Skew, uncertainty, and clock correction |
| Order events that are known to be causally related | Lamport clock | Cannot detect concurrency from scalar values alone |
| Detect causality versus concurrency among tracked replicas | Vector clock or a suitable version-vector variant | Metadata and membership management |
| Preserve causal ordering while keeping values near physical time | HLC | Still inherits assumptions and limitations of physical clocks |

Do not pick “latest timestamp wins” just because an API needs a single value. If data loss from concurrent updates matters, preserve versions or use a domain-specific merge/transaction rule.

## Failure detection and membership

### Failure detector

A failure detector produces a suspicion or estimate from observations such as missed heartbeats, probe timeouts, or delayed responses. In a fully asynchronous network, a slow process and a failed process cannot always be distinguished from observations alone. Real systems therefore make timing assumptions and accept a chosen tradeoff between detection speed and false suspicion. The classic failure-detector model makes completeness and accuracy explicit; some detector classes can make mistakes and still be useful to algorithms that tolerate them.

Treat `suspected` as an operational state with defined consequences. For example, stop sending new work to a suspected node, but avoid irreversible ownership transfer until a fencing token, lease rule, quorum, or other authority check prevents the old owner from acting later. A membership list is not automatically a consensus log or a safe leader-election mechanism.

### Gossip protocol and SWIM

Gossip (epidemic dissemination) spreads updates by having participants exchange information with selected peers repeatedly. It can scale dissemination without asking one central process to send every update, but convergence takes time and replicas can temporarily disagree. Message loss, partitions, and competing updates still require versioning and reconciliation rules.

SWIM is a specific membership-protocol design, not a synonym for every gossip system. It separates randomized probing for failure detection from dissemination of membership changes. Its design uses direct and indirect probes, and a suspicion period can let a temporarily delayed process refute an early suspicion before it is declared failed. These choices reduce some false positives but cannot make network-based failure detection infallible. SWIM membership alone does not provide replicated-data consistency or consensus.

### Phi-accrual detector

A phi-accrual detector converts heartbeat-arrival history into a continuous suspicion score. A consumer chooses a threshold appropriate to its failure policy; the score is not a calibrated probability that a process is dead. Network jitter, pauses, load, and the observed heartbeat distribution affect the score. Using a detector therefore means choosing and monitoring a threshold, not asking the detector for certainty.

## Anti-entropy and Merkle trees

### Anti-entropy

Anti-entropy is a background reconciliation process: replicas compare what they hold and exchange missing or differing state. It repairs divergence that foreground replication, retries, or hints did not resolve. It costs storage reads, CPU, disk I/O, and network bandwidth, so operators need a schedule, scope, throttling, progress visibility, and a plan that covers the intended replicas and data ranges. Anti-entropy is not necessarily immediate, and “eventual” repair only holds if the process runs successfully before data needed for reconciliation is discarded.

Do not confuse three recovery paths:

- **Hinted handoff** stores a temporary reminder or copy for an unavailable replica and replays it later, subject to that system’s durability and expiration rules.
- **Read repair** reconciles versions observed by a read path; its scope is generally the data participating in that read.
- **Anti-entropy repair** compares broader replica ranges independently of a user read. In Cassandra, repair uses Merkle trees and streams differing data; its command scope and cluster-wide coverage must be planned explicitly.

These mechanisms complement one another. A hint is not a full reconciliation guarantee, and a read that repairs one row is not proof that all partitions are synchronized.

### Merkle tree

A Merkle tree is a hierarchy in which parent hashes summarize child hashes and ultimately a range of records. Replicas can compare hashes from the root downward and focus on subranges whose summaries differ, avoiding a record-by-record comparison when large ranges match. Matching hashes provide evidence that the compared inputs match with high confidence under the hash assumptions; they do not identify which replica has the correct value, select a conflict winner, or prove that the compared range and snapshot were complete. The repair protocol must define range boundaries, stable comparison input, version reconciliation, and data transfer.

## Walkthrough: a replica returns after an outage

1. The application writes to the replicas required by its chosen acknowledgement rule. A timeout leaves the caller uncertain whether the remote write happened; retries need idempotency or duplicate-safe semantics.
2. Membership probing may mark the unreachable replica suspected or unavailable. Route around it according to the availability policy, while preserving a single-owner or fencing rule for writes that must not split-brain.
3. The recovered replica receives any retained hints. Treat them as best-effort recovery bounded by the product’s actual persistence and retention behavior.
4. Anti-entropy compares the required replica ranges. A Merkle tree identifies ranges with different summaries; the repair implementation reconciles and streams differing data.
5. Observe repair lag and completion, and make the repair plan cover every required node and range. If tombstones, logs, or version metadata expire before repair, convergence may no longer be able to reconstruct the intended state.

## Common mistakes

- Sorting wall-clock timestamps and calling the result causality.
- Treating Lamport scalar order as proof of dependency.
- Assuming vector clocks resolve conflicts; they can expose concurrency, while the application still needs a merge or choice policy.
- Treating HLC as perfect physical time or a consensus mechanism.
- Treating a heartbeat timeout, SWIM suspicion, or phi score as proof of a crash.
- Using gossip membership as the authority for exclusive writes without a fencing or consensus rule.
- Assuming hints or read repair replace scheduled anti-entropy coverage.
- Treating matching Merkle hashes as a conflict-resolution policy or skipping range/snapshot scope checks.

## Knowledge checks with answers

1. **A timestamp on replica A is lower than one on B. Does A’s update precede B’s?** Not necessarily. Clock skew can reverse physical order; even Lamport order only implies causality in one direction.
2. **Two vector timestamps are incomparable. What does that mean?** Under the tracked-participant model, neither version is known to have caused the other. Choose a domain merge, preserve both, or apply an explicit conflict policy.
3. **A node missed three probes. Can it be safely deleted as dead?** The detector can suspect it under its timing assumptions. Before transferring exclusive ownership, use the system’s authority and fencing/lease protocol so a delayed old owner cannot continue acting.
4. **A returning node receives hints. Is repair complete?** No. Hints may be partial or expire. The system still needs reconciliation across the intended data ranges and replicas.
5. **What does a Merkle-tree mismatch tell you?** The compared summaries differ, so inspect/transfer the corresponding range using the repair protocol. It does not itself say which value is correct.

## Sources and scope

This lesson covers the eight named items in the topic manifest: wall-clock timestamp, Lamport clock, vector clock, hybrid logical clock, failure detector, gossip protocol, anti-entropy, and Merkle tree. These are conceptual algorithms rather than a vendor API/version inventory. The cited papers establish the foundational models; Cassandra documentation is a concrete example of repair behavior, not a universal contract for every database.

- Lamport, “Time, Clocks, and the Ordering of Events in a Distributed System”: [paper](https://lamport.azurewebsites.net/pubs/time-clocks.pdf)
- Mattern, “Virtual Time and Global States of Distributed Systems”: [paper](https://cse.msu.edu/~cse812/fall03/Slides/VectorClocksMattern.pdf)
- Kulkarni et al., “Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases”: [technical report](https://cse.buffalo.edu/tech-reports/2014-04.pdf)
- Das, Gupta, and Motivala, “SWIM: Scalable Weakly-consistent Infection-style Process Group Membership Protocol”: [paper](https://courses.grainger.illinois.edu/cs425/fa2022/dsn02-SWIM.pdf)
- Hayashibara et al., “The φ Accrual Failure Detector”: [JAIST technical report](https://dspace.jaist.ac.jp/dspace/bitstream/10119/4784/1/IS-RR-2004-010.pdf)
- Chandra and Toueg, “Unreliable Failure Detectors for Reliable Distributed Systems”: [Cornell technical report](https://ecommons.cornell.edu/entities/publication/7948ff49-7263-49f8-a29b-d062e7cbb240)
- Cassandra 5.0, [repair documentation](https://cassandra.apache.org/doc/stable/cassandra/managing/operating/repair.html)

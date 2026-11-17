# distributed systems consistency coordination and convergence — Reference: Multi-Paxos

Sources: [Lamport, Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf), [Chandra, Griesemer, and Redstone, Paxos Made Live](https://static.googleusercontent.com/media/research.google.com/en/us/archive/paxos_made_live.pdf), [Ongaro and Ousterhout, Raft extended paper](https://raft.github.io/raft.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Multi-Paxos` — A practical form of Paxos that amortizes leader establishment across many consensus instances. Classic Paxos decides one value; a replicated state machine needs a sequence of commands, often called log slots. After Phase 1 establishes a ballot and recovers prior accepted state for the relevant slots, a stable coordinator can use Phase 2 for later commands in those slots without a fresh prepare round for every command. If a higher ballot appears, a new coordinator must run Phase 1 and preserve the highest-numbered accepted value it learns for each affected slot.

## Safety intuition and operating cost

Paxos safety relies on intersecting quorums and ballot ordering. A proposer gathers promises from a quorum and must carry forward the highest-numbered previously accepted value it learns for the slot; this is what prevents a later successful proposal from contradicting an earlier chosen value. Quorum intersection does not mean every node has the latest log entry, and consensus does not itself provide application-level transactions across unrelated systems.

Multi-Paxos implementations must persist promises and acceptances before sending protocol responses that rely on them. They also need log catch-up, snapshots/compaction, leader changes, membership reconfiguration, and client retry/deduplication. These details are essential to a production replicated log and are not specified by the phrase “Multi-Paxos” alone. A stable leader reduces normal-case coordination rounds; partitions or leader churn can stall progress until a quorum can communicate.

### Recover a leader and fill log gaps

Each log slot is a separate Paxos instance, even when one coordinator drives many slots. On takeover, the new coordinator runs Phase 1 for the slots it needs to recover, learns accepted values from a quorum, and carries forward the highest-numbered accepted value for each slot. It may discover chosen commands beyond a gap. Those later commands cannot be applied in order until the missing slots are resolved; a system can propose a no-op in a genuinely unconstrained slot, but it must preserve any value that Phase 1 reports as already accepted. Practical systems also let lagging replicas fetch log entries or snapshots from up-to-date replicas. Batching several client commands into one instance can improve throughput, but changes the unit of ordering and recovery.

## Cross-item comparison

Raft and Multi-Paxos both implement replicated-log consensus. Raft has an explicit strong leader and a defined joint-consensus membership-change method in its paper; Multi-Paxos describes a family of Paxos-based implementations whose practical details vary. Compare the actual implementation, durability, reconfiguration, operational maturity, and latency path rather than assuming all products called Paxos behave identically.

## Examples

Three acceptors A/B/C use majority quorum 2. A coordinator establishes ballot 7 with A/B and sends command `x` for slot 10, but crashes before any acceptor accepts it. A later coordinator establishes ballot 8 and proposes `y`; only A accepts it before that coordinator also fails. A new proposer at ballot 9 must learn prior accepted state from a quorum and preserve `y` for slot 10 if that is the highest accepted value it learns. If the earlier value had already been accepted by a quorum, Paxos safety would require a correct later proposer to preserve that chosen value instead. Walk through what happens if a proposal reaches only one acceptor, the leader crashes before learning whether a quorum accepted, and a client retries with the same request identifier.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a leader’s local append as committed; a value is chosen by the protocol's quorum rule, and replicas/clients may learn that fact later.
- Assuming leader stability eliminates quorum communication or that every implementation has identical reconfiguration semantics.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Why can a stable leader speed up repeated decisions?** After Phase 1 establishes authority and recovers state for the relevant slots, it can use Phase 2 for later proposals without repeating Phase 1 each time.
2. **What must a new proposer preserve?** The highest-numbered accepted value for a slot that it learns from its Phase 1 quorum.
3. **Does Paxos tell a client whether its business operation ran twice?** No; client request identity and deduplication are application/protocol integration concerns.

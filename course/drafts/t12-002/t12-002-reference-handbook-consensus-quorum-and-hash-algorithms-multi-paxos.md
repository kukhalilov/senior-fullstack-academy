# distributed systems consistency coordination and convergence — Reference: Multi-Paxos

Sources: [Lamport, Paxos Made Simple](https://lamport.azurewebsites.net/pubs/paxos-simple.pdf), [Ongaro and Ousterhout, Raft extended paper](https://web.stanford.edu/~ouster/cgi-bin/papers/raft-extended.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Multi-Paxos` — A practical form of Paxos that amortizes leader establishment across many consensus instances. Classic Paxos decides one value; a replicated state machine needs a sequence of commands, often called log slots. A leader/proposer that has completed Phase 1 for a ballot can use the established ballot for subsequent slots (Phase 2) while it remains valid, avoiding a fresh prepare round for every command. If leadership is contested or a higher ballot is observed, a proposer must re-establish authority and preserve any value already accepted by a quorum.

## Safety intuition and operating cost

Paxos safety relies on intersecting quorums and ballot ordering. A proposer gathers promises from a quorum and must carry forward the highest-numbered previously accepted value it learns for the slot; this is what prevents a later successful proposal from contradicting an earlier chosen value. Quorum intersection does not mean every node has the latest log entry, and consensus does not itself provide application-level transactions across unrelated systems.

Multi-Paxos implementations must define stable storage before acknowledging protocol messages, log catch-up, snapshots/compaction, leader changes, membership reconfiguration, and client retry/deduplication. These details are essential to a production replicated log and are not specified by the phrase “Multi-Paxos” alone. A stable leader reduces normal-case coordination rounds; partitions or leader churn can stall progress until a quorum can communicate.

## Cross-item comparison

Raft and Multi-Paxos both implement replicated-log consensus. Raft has an explicit strong leader and a defined joint-consensus membership-change method in its paper; Multi-Paxos describes a family of Paxos-based implementations whose practical details vary. Compare the actual implementation, durability, reconfiguration, operational maturity, and latency path rather than assuming all products called Paxos behave identically.

## Examples

Three acceptors A/B/C use majority quorum 2. A leader first establishes ballot 7 with A/B, then proposes command x for slot 10. Later, A has accepted y at ballot 8 while B has not; a new proposer at ballot 9 must learn prior accepted state from a quorum and preserve y for slot 10 if that is the highest accepted value it learns. Walk through what happens if only one acceptor receives a proposal, the leader crashes before learning the outcome, and a client retries with the same request identifier.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a leader’s local append as committed; commitment requires the protocol’s quorum/learning rules and durable state.
- Assuming leader stability eliminates quorum communication or that every implementation has identical reconfiguration semantics.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Why can a stable leader speed up repeated decisions?** It can reuse an established ballot and avoid a new Phase 1 for every slot.
2. **What must a new proposer preserve?** The highest-numbered accepted value for a slot that it learns from its Phase 1 quorum.
3. **Does Paxos tell a client whether its business operation ran twice?** No; client request identity and deduplication are application/protocol integration concerns.

# system design tradeoffs and decision methods — Reference: Strong vs eventual consistency

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Herlihy and Wing, linearizability](https://www.cs.cmu.edu/~wing/publications/HerlihyWing90.pdf), [Vogels, Eventually Consistent](https://www.cs.cornell.edu/lorenzo/papers/cac-tr.pdf), [Gilbert and Lynch, CAP](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [Abadi, PACELC](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Scope and version

“Strong consistency” is an umbrella phrase; name the actual model, such as linearizability or serializability. Eventual consistency is a convergence promise under stated assumptions, not a bounded-staleness promise. This comparison focuses on linearizable operations versus eventual convergence.

## How this group fits the mental model

For a bank balance or unique username, a caller may need a read to reflect every completed write before another operation proceeds. Linearizability gives each operation an instantaneous point between invocation and response while preserving real-time order of non-overlapping operations. Implementations often coordinate with a leader/quorum, which adds network dependency and can reject or delay requests when the required authority is unreachable.

## Supplied names explained

Eventual consistency says that, if updates stop and replicas communicate/reconcile under the model's assumptions, replicas eventually converge. It does not by itself specify how long convergence takes, what a read sees meanwhile, whether writes can conflict, or whether a client sees its own write. Systems may add read-your-writes, monotonic reads, causal consistency, bounded staleness, or conflict resolution; state those separately.

“Strong” does not mean every operation is globally serializable: linearizability is per-object/history semantics, while serializability is a transaction property. A system can provide different models for different operations. CAP applies a particular atomic-consistency/availability tension during partitions; PACELC also describes latency/consistency choices without a partition.

## Cross-item comparison

Choose based on invariant and user-visible consequences. A uniqueness check or inventory reservation may need coordination to prevent two callers both succeeding. A view count or activity feed may tolerate temporary lag if the product communicates it and convergence is monitored. Relaxing consistency can improve availability/latency, but requires conflict handling and application logic for stale reads. Stronger models cost coordination, tail latency, and sometimes availability during failures; neither choice is free.

## Examples

Replica A accepts a profile update while replica B is temporarily disconnected. Under an eventual model, B may return its older value before replication catches up; define whether the writer is routed back to A for read-your-writes and what happens if another user edits the same field. For an inventory decrement, two isolated replicas accepting the same final unit could oversell; use a coordinating authority, escrow rights, or another mechanism that preserves the invariant.

## Common mistakes

- Saying “strong consistency” without naming the operation-level model.
- Treating eventual consistency as “it will be fresh within a few seconds” without a documented bound.
- Equating eventual consistency with eventual correctness; conflicts can converge to an undesirable value.
- Assuming CAP labels explain normal-operation latency choices; use PACELC or explicit requirements.

## Knowledge checks with answers

1. **What does linearizability add beyond eventual convergence?** A single legal operation order that also respects real time for non-overlapping operations.
2. **Does eventual consistency set a maximum staleness period?** No, not by itself.
3. **What should be specified before choosing a model?** The invariant, allowed stale/conflicting observations, failure behavior, and measurable latency/availability target.

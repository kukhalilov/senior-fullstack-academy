# distributed systems consistency coordination and convergence — Reference: Observed-Remove Set (OR-Set)

Sources: [Handbook CRDT module](https://hld.handbook.academy/curriculum/distributed-systems-theory/crdts/), [Shapiro et al., comprehensive study of convergent and commutative replicated data types](https://www.lip6.fr/Marc.Shapiro/papers/2011/Comprehensive-CRDTs-RR7506-2011-01.pdf), [Shapiro et al., optimized conflict-free replicated set](https://arxiv.org/abs/1210.3368).

## Scope and version

This lesson uses the common add-wins observed-remove set (OR-Set) model. CRDT libraries differ in tag representation, causal metadata, and compaction; consult the implementation's contract.

## How this group fits the mental model

Replicated sets need a rule for concurrent add and remove operations. In an OR-Set, every add creates a unique tag for that element. A remove deletes the tags for that element which the removing replica has observed. If another replica concurrently adds the same element with a new tag, that tag was not observed by the remove and remains after merge. Thus this common OR-Set is add-wins for a concurrent unseen add.

## Supplied names explained

The state-based representation carries add tags and enough removal metadata to prevent deleted tags from reappearing when older state arrives. The operation-based form can instead disseminate add/remove operations under delivery assumptions such as causal order. These are related implementations of an observed-remove semantic rule, not an excuse to omit the library's delivery and garbage-collection requirements.

Remove followed by a later add is different from a concurrent add: the later add creates a fresh tag and the element is present. Metadata can grow as tags and removal knowledge accumulate. Safe compaction requires causal stability or another proof that removed tags cannot return from an old replica or backup.

## Cross-item comparison

An OR-Set permits removal and re-addition, unlike a two-phase set whose tombstoned element cannot be re-added. Compared with a last-write-wins set, OR-Set semantics are based on observed add identities rather than a timestamp winner, but carry more metadata. Pick the conflict rule that matches product intent: “a concurrent invite should survive” differs from “a removal always wins.”

## Examples

Replica A and replica B both initially lack “blue.” A adds blue with tag a1 and B, without seeing it, adds blue with tag b1. A removes blue and therefore removes only a1. After merging, b1 remains and blue is present. If B had observed a1 before the remove and had not added b1, the remove would remove the observed addition and blue would be absent. A later add creates a new tag and makes it present again.

## Common mistakes

- Assuming remove always wins against an unseen concurrent add.
- Removing an element without tracking which add instances were observed.
- Dropping tombstones or tags before old replicas can no longer reintroduce stale state.
- Assuming two OR-Set libraries share the same wire format, causal assumptions, or compaction strategy.

## Knowledge checks with answers

1. **What does a remove operation target in an OR-Set?** The unique add tags for that element observed by the removing replica.
2. **What happens to an unseen concurrent add?** Its new tag survives, so the common OR-Set is add-wins for that race.
3. **Why can removed-tag metadata not be discarded arbitrarily?** An old replica could later send stale state that reintroduces the removed addition.

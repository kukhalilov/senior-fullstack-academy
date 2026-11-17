# distributed systems consistency coordination and convergence — Reference: PN-Counter

Sources: [Handbook CRDT module](https://hld.handbook.academy/curriculum/distributed-systems-theory/crdts/), [Shapiro et al., Conflict-free Replicated Data Types](https://pages.lip6.fr/Marc.Shapiro/papers/CRDTs_SSS-2011.pdf).

## Scope and version

This lesson explains the positive-negative counter construction from the CRDT model. Implementations may encode or compact it differently; verify their merge, identity, and persistence guarantees.

## How this group fits the mental model

A grow-only counter can merge increments but cannot decrement. A PN-Counter builds a counter with increments and decrements from two grow-only counters: P records positive increments and N records negative increments. The visible value is the sum of P minus the sum of N. Each replica owns a component in each vector and only increases its own components; replicas merge vectors by component-wise maximum.

## Supplied names explained

Because both component vectors only grow and merge with maximum, repeated and reordered state merges converge. A replica's increment increases its own P component; a decrement increases its own N component. It must not directly reduce a component. The classic state-based construction assumes known, stable component identities and no integer overflow. A restarted or reincarnated replica must preserve/transfer its component state or receive a fresh identity; blindly reusing an identity with a lower component can overwrite prior information during max-merge.

The mathematical type permits the visible value to become negative. It does not enforce a lower bound, an inventory invariant, or “decrement only if positive.” Concurrently checking a balance and decrementing it requires coordination or a bounded/escrow construction that allocates rights so disconnected replicas cannot spend more than their assigned share.

## Cross-item comparison

Compared with a G-Counter, PN-Counter supports negative operations by tracking a second monotone vector, which increases metadata and still does not enforce business constraints. Compared with a serialized database counter, it can accept local updates during disconnection but reads may be stale until state exchanges; a database transaction can enforce invariants by coordinating with an authority.

## Examples

Replicas A and B start with P=[0,0] and N=[0,0]. A increments twice: P becomes [2,0]. B decrements once: N becomes [0,1]. After exchanging states, both merge to P=[2,0], N=[0,1], and display 1. Repeating the exchange changes nothing. If A and B both see a displayed value of 1 and each decrements, both may do so while disconnected; after merge the result is -1. That is convergence, but it may violate the product rule.

## Common mistakes

- Subtracting directly from a component instead of increasing a component of N.
- Assuming convergence prevents a negative result or enforces a quota.
- Reusing replica identities without preserving or transferring their component state.
- Treating the displayed value as globally current while replicas are disconnected.
- Treating escrow rights as an ordinary PN-Counter feature; rights allocation is an additional protocol with transfer and recovery rules.

## Knowledge checks with answers

1. **How is the visible PN-Counter value calculated?** Sum the P components and subtract the sum of N components.
2. **How do replicas merge?** Take component-wise maximum of P and separately of N.
3. **Can two disconnected replicas each decrement a balance they observe as 1?** Yes; after merge the value can be -1. Use coordination or allocated rights if non-negativity is a hard invariant.

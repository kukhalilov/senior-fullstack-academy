# distributed systems consistency coordination and convergence — Reference: Bounded-load consistent hashing

Sources: [Handbook module 3.9](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Mirrokni, Thorup, and Zadimoghaddam, Consistent Hashing with Bounded Loads](https://arxiv.org/abs/1608.01350), [SIAM publication](https://epubs.siam.org/doi/10.1137/1.9781611975031.39).

## Scope and version

This lesson explains the bounded-load variant of consistent hashing. It focuses on the original theoretical scheme and its stated guarantees; production variants can differ. Check the design and workload assumptions before applying a bound to real traffic.

## How this group fits the mental model

Ordinary consistent hashing limits how many keys move when a server set changes, but a skewed key distribution can still overload one server. Bounded-load hashing adds a capacity rule: a key follows its consistent-hash assignment unless that server reaches a specified load threshold, then it is assigned elsewhere. This improves the worst-case load at the cost of some extra movement and a more involved assignment rule.

## Supplied names explained

The published bounded-load construction treats keys as balls and servers as bins. Each key has a preferred server from the consistent-hash ordering. If that bin reaches its capacity bound, the key proceeds to another candidate according to the construction. In the paper’s setting with n keys (balls) and n servers (bins), the balancing parameter c=2 gives a maximum load of 2 and expected constant movement per single key/server insertion or deletion. More generally, with m keys and n servers, it guarantees per-bin capacity ⌈c·m/n⌉ for a chosen c>1 while bounding expected movement relative to lower bounds; exact bounds depend on c. The analysis assumes updates are processed one at a time and the system can finish moving keys before the next update. This is a theorem under the paper’s model, not a blanket guarantee for arbitrary weighted servers, changing request rates, replication, or hot keys.

“Load” must be defined. The theoretical result bounds the number of assigned keys under its assumptions; it does not automatically bound bytes, CPU, request rate, or latency. A single popular key can dominate traffic even when the number of keys per server is balanced.

## Cross-item comparison

Compared with ordinary ring hashing, bounded-load hashing gives a formal capacity bound in its model, but can forward keys away from preferred bins and moves additional keys to maintain the invariant. The capacity parameter trades tighter balance against movement. Compared with adding virtual nodes or weights, it has a different balancing mechanism and guarantee. Before adopting it, verify that its load metric matches the bottleneck and model the cost of reassignment, metadata, replication, and movement.

## Examples

Suppose 1,000 equally sized cache keys map to four servers, but one server's preferred keys exceed the configured capacity. Ordinary ring assignment can preserve the preferred ownership and leave that server overloaded. A bounded-load assignment redirects overflow keys to alternative eligible servers. If one server is added, reassignment should remain limited by the construction; measure how many cache entries must be warmed again and whether the bound concerns key count or actual request load.

## Common mistakes

- Assuming the paper's maximum key-count bound also caps bytes, CPU, or request rate.
- Treating a theoretical construction as a vendor implementation guarantee without checking its exact variant.
- Assuming concurrent membership/key updates are covered when the paper assumes serialized updates with time to restore capacity between them.
- Ignoring the operational cost of relocating keys, warming caches, or updating replicas.
- Applying bounded-load placement to a hot key that remains a single serialized owner.

## Knowledge checks with answers

1. **What problem does bounded-load hashing add to consistent hashing?** It limits the maximum assigned key count per server under the construction’s assumptions, while keeping reassignment limited as membership changes.
2. **Does a cap on key count guarantee equal request rate?** No. Key popularity and object size can be highly skewed.
3. **What operational work follows when overflow keys move?** Data or cache movement, replica updates, and warming may be needed; measure this against the benefit of the cap.

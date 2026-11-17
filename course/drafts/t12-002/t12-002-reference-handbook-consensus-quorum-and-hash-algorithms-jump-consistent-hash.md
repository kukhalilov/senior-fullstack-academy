# distributed systems consistency coordination and convergence — Reference: Jump consistent hash

Sources: [Handbook module 3.9](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Lamping and Veach, A Fast, Minimal Memory, Consistent Hash Algorithm](https://arxiv.org/abs/1406.2294).

## Scope and version

This lesson covers the original Jump Consistent Hash algorithm and its bucket model. Implementations must use compatible arithmetic and hashing to produce identical assignments.

## How this group fits the mental model

Jump consistent hash maps a key directly to one of a numbered sequence of buckets, `0` through `bucketCount - 1`. Instead of storing a ring or a table, it uses a deterministic pseudorandom sequence to find the last bucket jump for that key. The result is fast and memory-light, while changing the bucket count moves only the keys that jump to the newly added bucket.

## Supplied names explained

The algorithm's central constraint is that buckets are numbered consecutively and the count changes by adding or removing the final bucket. It is not a direct fit for arbitrary node identities, removal of a middle bucket, or weighted heterogeneous servers. One common deployment maps bucket numbers to physical shards through a separate assignment layer, but changing that mapping can introduce additional movement. The hash/key encoding and integer behavior must be consistent across clients.

The paper compares the algorithm with ring-based consistent hashing: Jump uses very little memory and is fast, while the ring naturally represents named nodes, virtual nodes, and replica successors. Neither method solves hot-key load skew or data movement itself; they determine placement.

## Cross-item comparison

For sequentially numbered storage buckets, Jump can be simpler and cheaper than maintaining ring positions. If servers have arbitrary identities, weights, or replica successor requirements, a ring or rendezvous scheme may better match the membership model. If strict load bounds matter, use a scheme that explicitly provides them rather than assuming Jump balances every operational measure.

## Examples

Suppose a key-value service has 10,000 logical buckets, and the algorithm maps key `customer-42` to bucket 731. Adding bucket 10,000 may move a subset of keys to the new bucket while other keys keep their bucket. The storage service still has to create and place that bucket, copy or backfill the moved data, route reads during migration, and retire the old copy safely. The hash function answers “which bucket?”; it does not perform the migration protocol.

## Common mistakes

- Applying Jump directly to arbitrary backend IDs or weighted nodes without an extra mapping scheme.
- Assuming low remapping means no data copy or routing change is required.
- Using different hash encodings or integer arithmetic in different clients.
- Assuming balanced bucket counts imply balanced request volume or byte storage.

## Knowledge checks with answers

1. **What bucket model does Jump require?** Consecutively numbered buckets from zero; bucket-count changes add or remove the last bucket.
2. **Does adding a bucket automatically move the stored records?** No. It changes computed placement; a separate migration and dual-read/write or cutover plan is required.
3. **When is a ring a better fit?** When destinations have arbitrary identities, weights/virtual nodes, or a natural successor walk for replicas.

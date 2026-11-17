# linked lists, pointer rewiring, reversal, and cycles — Reference: Merging, identity, and implementation tradeoffs

## Scope and version

This reference explains the seven supplied merge and tradeoff terms. Complexity distinguishes auxiliary references, recursion stack, and newly allocated output nodes.

## How this group fits the mental model

Merging follows ordered links and rewires a result chain. Identity questions inspect shared references; implementation choice compares traversal and locality with contiguous storage.

## Supplied names explained

- `Merge two sorted lists` — Repeatedly link the smaller current node, advance that source, then append the remaining suffix. Sorted inputs guarantee the merged order.
- `Dummy-node merge` — Start output at a dummy node with a moving tail. Each emitted node is attached after tail; return dummy.Next. It avoids a special first-node branch.
- `Recursive list traversal` — Process a node and recurse to its successor or solve the suffix then link back. It can express simple algorithms, but O(n) recursion depth consumes stack and may overflow for long lists.
- `Node intersection by identity` — Two lists intersect only if their paths reach the same node object, after which their suffixes are shared. Compare references, not equal values.
- `Hash-set cycle detection` — Store visited node references; a repeated reference proves a cycle. It uses O(n) memory, unlike Floyd's O(1)-space method.
- `Array versus linked-list indexing` — Arrays/dynamic arrays provide O(1) indexed access and locality; linked lists require O(n) traversal to index but can rewire known nodes in O(1).
- `Sequential memory locality` — Array elements are typically adjacent, aiding cache-friendly scans. Linked nodes may be scattered, so pointer traversal can incur cache misses and allocation overhead despite O(n) asymptotic traversal.

## Cross-item comparison

`Merge two sorted lists` is the goal; `Dummy-node merge` is a construction technique. `Recursive list traversal` trades iterative state for call-stack depth. `Node intersection by identity` is a semantic rule. `Hash-set cycle detection` uses extra memory while Floyd uses constant references. `Array versus linked-list indexing` includes `Sequential memory locality`, not just big-O access costs.

## Examples

Merge 1→4→8 and 2→3: append 1,2,3,4, then attach the remaining 8 suffix. If values 4 appear in two distinct lists, output may contain both nodes; equal value does not mean shared identity.

## Common mistakes

- Dropping the remaining suffix after one list ends.
- Allocating new nodes when the contract expects reuse, or reusing nodes when a deep copy is required.
- Comparing values to detect intersection.
- Using recursive traversal on unbounded input without considering stack depth.
- Claiming a linked list is faster for indexed reads because insertion is cheap.
- Counting the output list as O(1) auxiliary space when it allocates nodes.

## Knowledge checks with answers

1. **What do you do when one merge input is exhausted?** Attach or consume the other remaining suffix.
2. **How is intersection tested?** Reference identity.
3. **What space does recursive traversal use?** O(n) call stack in the worst case.
4. **Why can an array scan be faster than a linked scan?** Better locality and fewer pointer-dependent memory accesses.

Sources: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527013510/html/ListLinked.html), [Microsoft Learn: LinkedList<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1).

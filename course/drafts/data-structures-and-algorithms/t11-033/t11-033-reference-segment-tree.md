# Fenwick trees, segment trees, and static range queries — Reference: Segment tree and range aggregates

## Scope and version

This lesson covers standard recursive and iterative segment trees, associative aggregates, and identities. See [Competitive Programmer's Handbook range queries](https://usaco.guide/CPH.pdf).

## How this group fits the mental model

Each tree node summarizes one interval. A query decomposes its target interval into canonical node intervals; an update changes the leaf and recomputes summaries on the path to the root.

## Supplied names explained

- **Segment tree node interval** — The contiguous range of input positions summarized by one node. State whether endpoints are inclusive or half-open throughout the implementation.
- **Build tree** — Initialize leaves from input, then combine children bottom-up. For non-power-of-two iterative trees, unused leaves must contain the operation identity.
- **Point update** — Replace one leaf's value, then recompute each ancestor with the combine operation in the correct left-to-right order.
- **Range query** — Return the aggregate over a requested interval by combining fully covered node summaries and descending only into partially covered nodes; time is `O(log n)` for standard segment-tree operations.
- **Associative combine operation** — The node operation `⊗` must satisfy `(a⊗b)⊗c=a⊗(b⊗c)` so arbitrary tree grouping preserves the answer. It need not be commutative, so query order can matter.
- **Identity element** — Value `e` with `e⊗x=x⊗e=x`; examples are 0 for sum, 1 for product, positive infinity for minimum, and negative infinity for maximum.
- **Recursive interval split** — Split `[l,r)` at `mid=l+(r-l)/2`; recurse into children intersecting the query. A leaf interval has length one.
- **Iterative segment tree** — Store leaves at offsets `n..2n-1`, build parents, and query with two moving endpoints. Non-power-of-two layouts are valid, but ordered aggregates require preserving left and right accumulation order.
- **Non-power-of-two array size** — Recursive trees handle arbitrary `n`; iterative layouts may also use exactly `2n` cells, or pad to a power of two. Padding requires identity values and capacity calculations must avoid overflow.
- **O(log n) point update and range query** — A point has one ancestor per level; a range has only a constant number of canonical nodes per level, so both visit logarithmically many levels.

## Cross-item comparison

Fenwick trees are specialized for prefix decompositions and often simpler for sums/counts. Segment trees support any associative aggregate with an identity and can be extended with lazy tags. Iterative trees avoid recursion overhead; recursive trees make interval reasoning and lazy propagation more direct.

## Examples

For range minimum over `[4,2,7,1]`, a node covering `[0,2)` stores `min(4,2)=2`. Query `[1,4)` combines the leaf value 2 with the aggregate minimum 1 over the right portion, yielding 1. The identity for min is a value larger than every valid item.

## Common mistakes

- Choosing an identity that changes results for empty/padded segments.
- Reversing combine order for noncommutative operations.
- Updating an ancestor without recomputing from both children.
- Mixing inclusive and half-open boundaries.
- Assuming every iterative layout requires power-of-two padding.

## Knowledge checks with answers

1. **Must a segment-tree combine be commutative?** No, but it must be associative, and query accumulation must preserve order.
2. **What identity does range sum use?** Zero.
3. **Why can padding use the identity?** Combining it with a real aggregate leaves that aggregate unchanged.

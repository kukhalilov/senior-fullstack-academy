# binary search tree ordering, lookup, and mutation — Reference: Validation, edge cases, and representations

## Scope and version

This reference covers validating global order and choosing safe representations for bounds, links, node identity, and traversal state.

## How this group fits the mental model

The invariant is about all descendants, so validation carries allowed bounds down the tree. Representation choices must preserve that invariant at integer extremes, empty links, and mutations.

## Supplied names explained

- **Validate with inherited bounds:** recurse with an allowed interval; a strict BST requires `lower < node.Value < upper`.
- **Duplicate key handling:** reject, store a count, or define a consistent inclusive-side rule; validation and mutation must use the same policy.
- **Empty tree:** represented by a null root; search returns null, insertion creates a root, deletion remains null, and validation may treat it as valid.
- **Single-node tree:** root has no children; deleting its key yields an empty tree.
- **Integer minimum and maximum bounds:** sentinel values must not accidentally exclude legal keys; use nullable bounds or a wider integer type.
- **Node identity:** copying a successor value is valid for value-oriented exercises, but externally observed references may require node transplantation.
- **Recursive versus iterative search:** recursion follows the tree directly but uses O(h) call stack; iteration uses O(1) auxiliary space for search.
- **Mutation link update:** recursive mutation must return the possibly changed subtree root so the caller reconnects the correct child/root reference.
- **Sorted array versus BST tradeoff:** arrays provide compact storage and O(log n) static binary search but O(n) insertion shifts; BSTs can update in O(h) and support ordered traversal but may skew.

## Cross-item comparison

Nullable lower/upper limits avoid arithmetic sentinels. Using `long.MinValue` and `long.MaxValue` also safely encloses `int` keys. For `long` keys, use nullable bounds rather than adding or subtracting one. Value-copy deletion is simpler; transplantation retains object identity.

## Examples

With `int.MinValue` as a legal root, initializing a strict lower bound to `int.MinValue` and requiring `value > lower` incorrectly rejects the root. A nullable lower bound means “no lower constraint yet,” avoiding that error.

## Common mistakes

- Updating a recursive child result without assigning it back to the parent link.
- Forgetting that the root reference itself may change.
- Using `key-1` or `key+1` bounds and overflowing at integer limits.
- Assuming null means invalid in validation when an empty tree should satisfy the recursive invariant.
- Copying a replacement key when callers depend on the original node object's identity.

## Knowledge checks with answers

1. **Why pass bounds from ancestors?** A descendant can violate a distant ancestor while still comparing correctly with its parent.
2. **How do you safely represent “no lower bound”?** Use a nullable bound or an explicit boolean, rather than an in-range sentinel.
3. **What must a recursive delete return?** The updated root of the current subtree.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/).

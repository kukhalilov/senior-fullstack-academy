# monotonic stacks and monotonic queues — Reference: Stack invariants and nearest-element queries

## Scope and version

This reference covers four classic monotonic-stack forms and their equality behavior. The algorithms are timeless and independent of language-specific stack APIs.

## How this group fits the mental model

The stack stores only candidates not yet disproved by a closer, more useful value. The invariant and pop rule explain why removed candidates can never answer a later query.

## Supplied names explained

- **Monotonically increasing stack:** values from bottom to top are nondecreasing; use it to retain candidates relevant to smaller boundaries, subject to the chosen equality rule.
- **Monotonically decreasing stack:** values from bottom to top are nonincreasing; useful for larger-boundary queries and window maxima.
- **Value stack:** stores values when the answer needs no original position. Equal values may be indistinguishable.
- **Index stack:** stores positions so the algorithm can compute distances, restore values, expire windows, or preserve duplicates.
- **Pop-dominated-candidates rule:** remove a top candidate when the current value is at least as useful and closer for all future queries covered by the invariant.
- **Next greater element:** first strictly greater value to the right (or in specified circular traversal). Pop unresolved indices when a greater value arrives.
- **Next smaller element:** first strictly smaller value in the chosen direction. Reverse the inequality and prove the analogous rule.
- **Previous greater element:** nearest qualifying greater value before the current position; a left-to-right scan can answer using the surviving stack top.
- **Previous smaller element:** nearest smaller predecessor; pop larger or equal candidates according to whether the query is strict.
- **Strict versus non-strict comparison:** `>` and `>=` differ on equal values; the correct operator is part of the query contract.
- **Duplicate-value tie handling:** retain or discard equal candidates based on whether the closest index, earliest index, or unique contribution ownership is required.

## Cross-item comparison

Increasing versus decreasing describes value order, not scan direction. Previous-element queries often scan left to right; next-element queries can scan left to right while unresolved indices wait, or right to left while maintaining a suffix candidate stack. Storing indices supports both styles and makes distance computation explicit.

## Examples

For values `[2,1,3]`, a decreasing unresolved stack first stores indices 0 and 1. On 3, it pops index 1 then 0, assigning next-greater value 3 to both. A candidate popped earlier is dominated because the new greater value is both closer and at least as useful for those unresolved queries.

For previous smaller values, scan left to right and pop while top value is greater than or equal to the current value. The remaining top, if any, is the closest strictly smaller predecessor because all later candidates are above it on the stack and all popped candidates are invalidated by a closer no-larger value.

## Common mistakes

- Describing order without saying whether it is bottom-to-top or top-to-bottom.
- Storing values when the answer requires an index or distance.
- Using `>` where `>=` is required, leaving an equal candidate that breaks the intended boundary.
- Treating the nearest smaller or greater answer as “any” qualifying element.
- Popping without stating the dominance argument.

## Knowledge checks with answers

1. **What must be specified to define a monotonic stack?** Scan direction, stored item, bottom-to-top value order, and exact pop inequality.
2. **Why can a closer equal value replace an earlier equal value for a next-greater query?** It is at least as useful and closer; strictness of the greater relation still means equality does not resolve the query.
3. **When is a value-only stack insufficient?** When output needs original indices, distances, expiration, or distinct equal-value ownership.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks).

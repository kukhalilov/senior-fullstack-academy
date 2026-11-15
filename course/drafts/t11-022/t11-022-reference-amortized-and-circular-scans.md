# monotonic stacks and monotonic queues — Reference: Scan direction, circular arrays, and amortized proof

## Scope and version

This reference explains scan choices and aggregate work for nearest-element algorithms, including a logical second pass for circular arrays.

## How this group fits the mental model

These techniques specify how candidates arrive and leave the structure. The scan direction determines which side has already been considered; the push/pop accounting establishes total cost.

## Supplied names explained

- **Left-to-right unresolved-index scan:** push indices that have not found their answer; a new value resolves eligible stack tops.
- **Right-to-left nearest-boundary scan:** process a current index with a stack of later candidates, discarding candidates that cannot be its nearest boundary.
- **Circular-array scan by index modulo n:** visit logical positions `0..2n-1` and map each to `i % n` to simulate wraparound.
- **Each-index-pushed-once argument:** charge each push to its original index; no index enters the stack more than once.
- **Each-index-popped-once argument:** once removed, an index never returns; total pops are at most n.
- **Aggregate O(n) analysis:** n pushes plus at most n pops and n loop steps yield O(n) total work despite nested loops.
- **Unresolved candidates after final scan:** stack entries can remain when no qualifying value exists; their result retains the problem's sentinel or default.

## Cross-item comparison

A left-to-right unresolved scan naturally fills answers when a future value appears. A right-to-left boundary scan naturally gives a current index access to its nearest surviving suffix candidate. Circular traversal extends the search horizon but must avoid pushing the same index twice. Both linear-time arguments rely on bounded candidate lifetime, not on every individual iteration doing constant work.

## Examples

For circular next-greater values `[1,2,1]`, scan indices 0 through 2 to establish unresolved candidates. A second logical pass visits indices 0 and 1 to resolve the last 1 with value 2. Do not push those second-pass indices; otherwise the stack can contain duplicate copies of the same original index.

For a strictly decreasing input in a next-greater scan, each new value may pop no indices and all remain unresolved; for a strictly increasing input, one new value may pop many indices. Across both patterns every index still enters once and exits at most once.

## Common mistakes

- Claiming each iteration is O(1) worst case when one can pop O(n) entries.
- Forgetting to bound circular processing to two logical passes.
- Pushing indices during the wraparound pass when the method only needs to resolve candidates.
- Returning an unresolved stack entry as a valid answer.
- Counting each pop as nested O(n) work without noticing that popped entries cannot be popped again.

## Knowledge checks with answers

1. **What bounds total pops?** Each original index is removed at most once.
2. **Why is a two-pass circular scan linear?** It examines at most 2n positions and each index is pushed/popped a bounded number of times.
3. **What should happen to unresolved entries?** Leave their output at its specified default, such as 0 or -1.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks), [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/).

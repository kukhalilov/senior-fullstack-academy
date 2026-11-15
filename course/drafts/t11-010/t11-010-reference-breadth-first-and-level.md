# binary trees, recursion, and traversal patterns — Reference: Breadth-first and level-based traversal

## Scope and version

This lesson explains the seven supplied BFS and level traversal concepts.

## How this group fits the mental model

Breadth-first traversal processes nodes in nondecreasing distance from the root. A FIFO queue preserves discovery order; capturing the queue size identifies the current level boundary.

## Supplied names explained

- Level-order traversal — Emit values from top to bottom, left to right within each level.
- Queue-based breadth-first traversal — Dequeue a node, visit it, enqueue its non-null children in the desired order.
- Process one level by queue-size snapshot — Save queue count before processing a level, then remove exactly that many nodes.
- Zigzag level order — Alternate left-to-right and right-to-left output direction while preserving BFS levels; direction can be applied at storage time or output time.
- Right-side view — Record the last node in each left-to-right level, or the first node when visiting right-first.
- Minimum depth and first-leaf reasoning — BFS reaches shallowest leaves first; first encountered leaf has minimum node-count depth.
- Queue space proportional to tree width — Peak queue storage is O(maximum level width), potentially O(n) for a broad tree.

## Cross-item comparison

DFS storage follows a path/stack and is typically O(height); BFS stores a frontier and is O(width). A balanced tree can have width much larger than height. For a minimum-depth question, BFS can stop at the first leaf; DFS must potentially inspect the whole tree.

## Examples

For levels [3], [9,20], [15,7], initialize a queue with 3. Snapshot count 1, process 3 and enqueue 9,20. Next snapshot 2; process exactly those two, leaving 15,7 for the next level.

## Common mistakes

- Iterating while queue is nonempty without a per-level count, which flattens levels together.
- Including null children in the queue and then dereferencing them.
- Reversing enqueue order instead of only output direction when implementing zigzag.
- Claiming BFS always uses less memory than DFS.

## Knowledge checks with answers

1. **Why snapshot count?** It freezes the current frontier size while new children are appended.
2. **What ends a minimum-depth search?** The first leaf dequeued or visited under BFS.
3. **What determines peak queue memory?** Maximum width.
4. **How obtain right-side view?** Select the rightmost value from each normal left-to-right level.

Source: [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).

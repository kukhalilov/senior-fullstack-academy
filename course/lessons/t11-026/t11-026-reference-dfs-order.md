# directed acyclic graphs and topological ordering — Reference: DFS postorder algorithm and cycle detection

## Scope and version

This reference explains the DFS finishing-time method and the state needed to detect directed cycles.

## How this group fits the mental model

DFS follows dependencies before finishing the current vertex. Finishing order places dependents before prerequisites; reversing that list gives prerequisite-first order.

## Supplied names explained

- **`DFS postorder`:** append a vertex only after recursively or iteratively exploring its outgoing neighbors.
- **`Reverse postorder`:** reverse the finish list; in a DAG, every source appears before its destination.
- **`Unvisited/active/finished states`:** unvisited means not entered; active means on the current DFS path; finished means all reachable descendants were processed. Three distinct states prevent both missed cycles and false positives.
- **`Recursion-stack cycle detection`:** encountering an active vertex means the current path has returned to an ancestor and therefore forms a directed cycle.
- **`Back edge`:** directed edge from a vertex to an ancestor active in DFS; this proves a cycle.
- **`Directed-cycle detection`:** reject when DFS finds an edge to an active vertex; alternatively use Kahn's processed count.
- **`Iterative DFS alternative`:** store frames with a vertex and its next-neighbor position, mark active on push, and append only when all neighbors finish; this simulates recursion without runtime call-stack depth.

## Cross-item comparison

Postorder alone is reverse-topological for a DAG, so the list must be reversed. The active state distinguishes a back edge from an edge to a finished shared descendant. Kahn's algorithm avoids recursion and detects cycles by incomplete processing, while DFS naturally exposes a cycle path if parent links are also stored.

## Examples

For A -> B, DFS from A finishes B first, then A, producing postorder [B,A]. Reversing gives [A,B], which respects the edge. For A -> B -> A, B reaches active A and detects a back edge before a full order can be returned.

## Common mistakes

- Using only one visited boolean and confusing a finished vertex with an active ancestor.
- Appending on entry and calling that order topological without reversing or checking edge direction.
- Marking a vertex finished before all outgoing neighbors complete.
- Forgetting to visit disconnected components by starting DFS from each unvisited vertex.
- Using recursive DFS on a deep chain when stack depth is unsafe.

## Knowledge checks with answers

1. **Why reverse postorder?** A vertex's descendants finish before it, so reversing puts the vertex first.
2. **Which state identifies a cycle edge?** The destination is active on the current path.
3. **Why use an explicit frame rather than a plain vertex stack for iterative postorder?** It records which neighbor remains so the vertex is appended only after all descendants finish.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule](https://leetcode.com/problems/course-schedule/).

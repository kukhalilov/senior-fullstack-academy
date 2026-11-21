# directed acyclic graphs and topological ordering — Core concepts and how they fit together

## Learning objectives

- Model prerequisite relations as directed edges from prerequisite to dependent.
- Distinguish a valid DAG ordering from a cycle-containing graph.
- Explain Kahn's algorithm, DFS reverse postorder, and their cycle checks.
- Use topological layers for unlimited-resource schedules and DAG dynamic programming.

## Prerequisites

Know vertices, directed edges, adjacency lists, indegree (incoming-edge count), outdegree (outgoing-edge count), and DFS/BFS traversal. A vertex is reachable from another if some directed path connects them.

## Core concepts

### DAGs and dependency meaning

A directed acyclic graph (DAG) is a directed graph with no directed cycle. A directed cycle is a path of one or more directed edges that returns to its starting vertex; a self-loop is a cycle of length one. If edge u -> v means “u must be completed before v,” a directed cycle demands that each task happen before itself through a chain, making a complete schedule impossible.

A topological ordering is a linear sequence of all vertices such that every edge points from an earlier position to a later one. It is a total ordering that extends the graph's reachability-based precedence relation: some pairs are constrained by a path, while incomparable vertices may appear in either order. The graph's listed edges need not include every transitive consequence. A DAG has at least one topological order, and every finite DAG has at least one current zero-indegree vertex.

### Kahn's indegree-frontier method

Compute each vertex's indegree. Enqueue all zero-indegree vertices. Repeatedly remove one, append it to the output, and decrement the indegree of every outgoing neighbor. A neighbor becomes ready exactly when its count reaches zero. If fewer than V vertices are emitted, a directed cycle exists among the unprocessed remainder; vertices downstream of a cycle may remain too, so leftovers are not necessarily all cycle members.

A FIFO queue makes arbitrary choices among simultaneously ready vertices. Replacing it with a min-priority queue returns the lexicographically smallest available vertex at every step, producing the lexicographically smallest topological ordering. The extra cost is typically O(log V) per frontier operation instead of O(1).

### DFS reverse postorder

In DFS, append a vertex only after every outgoing neighbor has finished; this is postorder. Reversing the postorder makes each prerequisite precede its dependents. To detect cycles, distinguish three states: unvisited, active (on the current recursion path), and finished. An edge to an active vertex is a back edge and proves a directed cycle. An edge to a finished vertex is harmless. An iterative DFS uses explicit (vertex, next-neighbor-index) frames to preserve recursive finishing order without call-stack depth risk.

### Orders, layers, and dynamic programming

Many valid orders may exist because unrelated tasks can swap positions. If every ready course can be taken in the same semester and there is no per-semester capacity, process the entire current frontier as one layer. The number of layers equals one plus the maximum number of edges on a dependency path, which is the minimum semester count. For weighted durations with unlimited parallelism, process in topological order and set each finish time to its duration plus the maximum predecessor finish time.

A DAG dynamic program can process each vertex after all predecessors. For example, longest path lengths update a successor from each completed predecessor. This does not mean every graph DP is a topological DP: the graph must be acyclic and the recurrence's dependencies must follow the chosen edge direction.

### Related frontier problems and boundaries

Eventual safe states can be found by reversing edges, starting with terminal vertices, and removing predecessor edges as their remaining outdegree falls to zero. This is Kahn-style elimination on a reverse graph, not a topological order of the original graph. Minimum Height Trees repeatedly removes leaves from an undirected tree until one or two centers remain; it also uses a frontier but is neither a DAG nor a topological sort.

## Mechanisms and relationships

Kahn's and DFS algorithms both take O(V+E) time with adjacency lists, but expose different useful state: indegree counts and a ready frontier versus traversal colors and finishing times. A successful output must contain all V vertices. A partial list is not a complete schedule. If the frontier min-heap is used, deterministic smallest-ready selection changes which valid answer is chosen, not whether an order exists.

## Worked examples

For words ["wrt","wrf"], the first differing letters are t and f, giving edge t -> f. Equal prefixes before the first difference add no constraint, and later characters after that first mismatch add none either. For words ["abc","ab"], the second word is a prefix of the first, but shorter words sort first; the evidence is contradictory before any graph is topologically sorted.

## Misconceptions and edge cases

- A topological ordering does not exist for a directed cycle; do not return the partial output as success.
- Unrelated vertices can appear in multiple positions; a valid order need not be unique.
- A zero-indegree frontier can contain multiple vertices; FIFO order does not imply lexicographic order.
- In a course pair [course, prerequisite], the edge direction must be reversed to prerequisite -> course.
- Alien Dictionary must retain characters with no edges and deduplicate repeated constraints before indegree counting.
- A word that is a strict prefix of the preceding word is invalid even though no differing-letter edge is found.
- Tree leaf trimming and eventual-safe elimination resemble Kahn's frontier but answer different graph questions.

## Knowledge checks with answers

1. **What does an edge u -> v mean in a prerequisite graph?** u must occur before v.
2. **What does Kahn's processed count below V prove?** A directed cycle prevents a complete topological order.
3. **Why can a priority queue change the answer but not its validity?** It chooses a different currently ready vertex; every ready vertex already has all prerequisites processed.
4. **Why does a safe-state algorithm reverse the edges?** It starts at terminal vertices and propagates safety backward to vertices whose every outgoing path is already known safe.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/), [Find Eventual Safe States](https://leetcode.com/problems/find-eventual-safe-states/).

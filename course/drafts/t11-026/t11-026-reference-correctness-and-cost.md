# directed acyclic graphs and topological ordering — Reference: Correctness, complexity, and applications

## Scope and version

This reference summarizes the proof obligations, asymptotic costs, and dependency applications in this module.

## How this group fits the mental model

An algorithm is useful only if emitted vertices are ready, every edge is processed once, and cycles cannot be mistaken for a complete schedule.

## Supplied names explained

- **`Every emitted vertex has no remaining prerequisite`:** Kahn's frontier invariant proves each output choice is legal at the moment it is selected.
- **`O(V+E) time`:** adjacency-list Kahn and DFS visits each vertex and edge a constant number of times.
- **`O(V) auxiliary storage`:** indegrees, states, queue/stack, and output use O(V), with the graph representation itself using O(V+E). Explicitly distinguish auxiliary algorithm state from stored input graph.
- **`Cycle means no complete ordering`:** a directed cycle requires each member to precede itself transitively, which no linear ordering can satisfy.
- **`Build-system dependency order`:** compile or generate prerequisite targets before their dependents; a dependency cycle indicates an invalid or unsupported build graph.
- **`Course prerequisite order`:** a course edge from prerequisite to dependent gives a valid enrollment sequence when all vertices emit.
- **`DAG shortest or longest path processing`:** process vertices in topological order and relax/update outgoing states after predecessor values are final; weighted edges are allowed, but negative-weight cycles cannot exist in a DAG.
- **`Partial output is not a valid complete schedule`:** if the task asks to finish every vertex, a prefix emitted before Kahn stalls must be rejected, not returned as a successful result.

## Cross-item comparison

The proof invariant explains correctness; complexity explains scalability; the processed count converts the same invariant into cycle detection. A partial list can still describe a valid prefix of some work but fails a contract requiring all vertices.

## Examples

For build edges compiler -> library -> app, emitting the app before the library violates an incoming prerequisite. If a cycle library -> app -> library exists, processing any unrelated compiler tasks does not fix the impossible remainder; report failure after the frontier empties.

## Common mistakes

- Claiming O(V+E) while using repeated full scans for the next zero-indegree vertex, which can cost O(V²+E).
- Omitting graph storage from an auxiliary-space statement without saying what “auxiliary” excludes.
- Processing weighted DAG paths before every predecessor is finalized.
- Treating independent task concurrency as proof that every topological layer is a unique schedule.
- Returning a prefix when the contract requires a full order.

## Knowledge checks with answers

1. **What work is counted in O(V+E)?** Each vertex and each adjacency edge is processed a constant number of times.
2. **Does a DAG shortest-path algorithm require nonnegative edge weights?** No; acyclicity allows topological relaxation even with negative weights.
3. **Why isn't partial Kahn output a complete answer?** Some prerequisites remain unresolved and at least one directed cycle prevents completing the order.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Parallel Courses](https://leetcode.com/problems/parallel-courses/), [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/).

# directed acyclic graphs and topological ordering — Reference: DAG properties and partial orders

## Scope and version

This reference defines the graph and order relationships that make topological processing possible.

## How this group fits the mental model

The graph encodes only required precedence. A topological order chooses one linear schedule consistent with every directed dependency; unconstrained pairs remain free to swap.

## Supplied names explained

- **`Directed acyclic graph`:** a directed graph with no directed cycle. Every finite DAG has at least one source (zero-indegree vertex) unless it has no vertices, and has at least one topological ordering.
- **`Directed cycle`:** a directed path that returns to its starting vertex; it makes a full prerequisite ordering impossible. A self-loop is a one-edge cycle.
- **`Topological ordering`:** a permutation of every vertex where each directed edge's source appears earlier than its target. The order may not be unique.
- **`Edge points forward in valid order`:** for each edge `u -> v`, `position[u] < position[v]`. This simple invariant is enough to verify a candidate ordering.
- **`Prerequisite dependency`:** if u is required before v, represent it by `u -> v`; for input pairs `[course, prerequisite]`, reverse the pair when constructing the graph.
- **`Partial order`:** a relation that is reflexive, antisymmetric, and transitive; the strict reachability relation in a DAG is irreflexive and transitive. Some vertex pairs are incomparable.
- **`Multiple valid topological orders`:** independent vertices can swap as long as every edge still points forward. A FIFO frontier chooses one arbitrary valid order.
- **`DAG dynamic programming`:** compute a state after its predecessor states by visiting vertices in topological order; this works when dependencies follow DAG edges.

## Cross-item comparison

A directed graph may contain cycles, whereas a DAG cannot. A partial order can leave pairs incomparable, whereas a topological order extends those constraints into one total sequence. The graph need not contain a direct edge for every ordered pair implied by a path.

## Examples

With edges A -> C and B -> C, A and B are incomparable. Both [A,B,C] and [B,A,C] are valid. The order must contain C after both, even though no edge connects A and B.

## Common mistakes

- Reading course -> prerequisite when the required processing edge is prerequisite -> course.
- Assuming an edge list is transitively closed.
- Calling a directed graph acyclic merely because no self-loop is visible; longer cycles also matter.
- Treating one computed ordering as the only valid order.
- Applying topological DP to a cyclic graph without first handling its cycle.

## Knowledge checks with answers

1. **What must be true for every edge in a valid order?** Its source position is less than its destination position.
2. **Can two unrelated vertices appear in either order?** Yes, if neither ordering violates another path constraint.
3. **Does every directed graph have a topological order?** No; only DAGs do.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule](https://leetcode.com/problems/course-schedule/).

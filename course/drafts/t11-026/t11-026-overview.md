# directed acyclic graphs and topological ordering — Big-picture orientation and mental model

## Problem and purpose

Many tasks have prerequisites: compile a library before its dependents, take one course before another, or process a state only after its inputs. A directed acyclic graph (DAG) represents these constraints. Topological ordering arranges every vertex so each prerequisite appears before the task that depends on it.

## Plain-language mental model

Imagine tasks as cards with arrows from prerequisite to dependent. A card with no remaining incoming arrows is ready. Do any ready task, remove its outgoing arrows, and new tasks may become ready. If cards remain but none is ready, the dependency rules contain a cycle and no complete order exists.

## How the parts fit together

| Question | Graph idea |
| --- | --- |
| Is there a complete dependency order? | Try to emit all vertices |
| What is one valid order? | Kahn's frontier queue or DFS reverse postorder |
| Why does processing stall? | A directed cycle blocks remaining prerequisites |
| What is the smallest available label order? | Use a min-priority frontier |
| Which vertices eventually reach terminal states? | Reverse edges and peel zero-outdegree vertices |
| How many unlimited-resource semesters? | Process each topological layer |
| What roots minimize a tree's height? | Repeatedly trim undirected leaves to find center(s) |

## Concept map

An edge u -> v means u must come before v. A DAG has no directed cycle, so at least one vertex has indegree zero unless the graph is empty. Kahn's algorithm removes that frontier iteratively. DFS can instead append vertices after exploring descendants and reverse the postorder; active-stack revisits reveal cycles. Independent vertices may be emitted in multiple valid orders. A topological order also provides a safe sequence for DAG dynamic programming.

## End-to-end walkthrough

For prerequisites 0 -> 1, 0 -> 2, 1 -> 3, and 2 -> 3, only 0 is initially ready. Remove it; 1 and 2 become ready. Either can come next. After both are removed, 3 becomes ready. Both [0,1,2,3] and [0,2,1,3] are valid. If instead 1 and 3 depended on each other, neither could be fully scheduled; a complete topological algorithm detects that not all vertices were emitted.

## When to use it and tradeoffs

Use topological ordering when precedence constraints form a directed graph and the order must respect every edge. It does not optimize a cost by itself; it supplies a legal processing order. Kahn's algorithm is iterative and reports cycles by output count. DFS reverse postorder is concise but recursive depth may reach V unless implemented iteratively. A FIFO queue returns any available ordering; a min-priority frontier pays extra time to choose the smallest available vertex.

## What later lessons cover

The references cover DAG/partial-order properties, Kahn's indegree frontier, DFS states and reverse postorder, and proof/cost/application patterns. Six problems apply cycle detection, order construction, letter-order inference, eventual safety, semester layers, and tree-center trimming. Minimum Height Trees is an undirected tree problem that uses a similar leaf-removal frontier; it is not topological sorting.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule](https://leetcode.com/problems/course-schedule/), [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/).

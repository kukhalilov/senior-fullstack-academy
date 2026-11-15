# directed acyclic graphs and topological ordering — Interview questions and reasoning

## Core questions

1. What is a topological ordering, and when does one exist?
2. How does Kahn's algorithm decide which vertex is ready?
3. Why does incomplete Kahn processing prove a cycle?
4. How does DFS reverse postorder construct an order?
5. Why does directed DFS need active and finished states?
6. How can you obtain the lexicographically smallest valid order?
7. How do topological layers yield a minimum number of unlimited-resource semesters?
8. How do eventual-safe vertices relate to outdegree elimination?
9. Why is Minimum Height Trees not a topological sort?
10. What special validation does Alien Dictionary require?

## Concise interview answers

- A topological order is a permutation in which each directed edge points forward. It exists exactly when the directed graph is acyclic.
- Kahn maintains indegree, the number of incoming prerequisites not yet processed. Zero-indegree vertices are ready.
- If the queue empties before V vertices are emitted, remaining vertices still depend on one another through a cycle; the returned prefix is not a complete order.
- DFS appends a vertex after its outgoing neighbors finish. Reversing postorder puts prerequisites first.
- An edge to an active vertex reaches an ancestor on the current path and proves a cycle. A finished vertex can be reached from another branch without forming a cycle.
- Replace the FIFO frontier with a min-priority queue and always remove the smallest ready key.
- Process the entire current frontier as one semester layer. Every layer is the earliest possible time for those courses; the number of layers is the longest prerequisite path length in vertices.
- Reverse edges and begin at terminal nodes. A predecessor becomes safe only after every outgoing successor has been shown safe.
- MHT is an undirected tree problem; it trims degree-one leaves to retain the diameter center(s), rather than ordering directed dependencies.
- Compare adjacent words and use only their first mismatch. Reject a longer word that precedes its own prefix, include isolated observed characters, deduplicate edges, and reject cycles.

## Deep follow-up answers

### Why does every DAG have a zero-indegree vertex?

If every vertex had an incoming edge, repeatedly follow an incoming edge. In a finite graph this sequence must revisit a vertex, forming a directed cycle. Therefore an acyclic finite graph has a zero-indegree vertex. Removing it leaves a smaller DAG, so induction yields a complete topological order.

### Is a topological ordering unique?

Not necessarily. If Kahn's frontier ever contains more than one vertex, choosing different ready vertices may produce different valid outputs. A DAG has a unique topological order only when the next choice is forced at every step, equivalently when the frontier has size one at every Kahn step.

### Why does a min-priority frontier give the smallest order?

At each output position, every valid continuation must choose one currently zero-indegree vertex. Choosing the smallest such label gives the smallest possible next element. Removing it and applying the same argument inductively minimizes the whole sequence lexicographically.

### What are the exact time and memory costs?

With adjacency lists, building the graph and indegrees takes O(V+E). Kahn and DFS each examine every vertex and edge a constant number of times for O(V+E) total. Indegree/state arrays, frontier, and output take O(V) auxiliary space; the graph itself adds O(V+E). A min-priority frontier adds O(V log V) queue work.

### How do semester layers relate to a longest path?

With unlimited capacity and unit course duration, each course's earliest semester is one plus the maximum earliest semester of its prerequisites. Processing a full frontier layer computes those levels. The minimum total semester count equals one plus the maximum number of edges on any prerequisite path. If capacity is limited, this greedy layer rule need not minimize total semesters.

### How is DAG dynamic programming different from simply sorting?

Topological order supplies a safe sequence; the recurrence still defines what state is propagated. For longest path, update each successor with max(current value + edge weight). For shortest path, update with min. Acyclicity permits each state to be finalized after predecessors, even if some edge weights are negative.

## Scenario questions

### The returned course order is shorter than the number of courses

Report impossible completion. Do not return the prefix as a valid schedule. For diagnosis, DFS active states can produce a concrete cycle if parent links are recorded.

### Many vertices become ready at once

Any ready vertex preserves correctness. Use FIFO for O(1) queue work, or a min-priority queue if the contract requires the lexicographically smallest order or reproducibility.

### Alien Dictionary says the graph is acyclic but output misses a character

Check that every distinct character from every input word was initialized as a graph vertex, including letters with no inferred edges. Then verify edge deduplication and processed-count comparison.

### Every course can be taken in parallel except a long chain

The longest dependency chain determines the number of semesters when there is no capacity limit. Independent branches overlap; counting all vertices would overestimate the answer.

## Tradeoffs and alternatives

- Kahn is iterative, naturally detects cycles by output count, and exposes ready work.
- DFS reverse postorder can be compact and can reveal a back-edge cycle, but recursive implementations may reach depth V.
- A min-priority frontier adds deterministic smallest-choice behavior at logarithmic queue cost.
- Eventual-safe elimination works on the reversed graph using remaining outdegree.
- MHT leaf trimming finds tree centers; two BFS/DFS traversals can find a diameter and its midpoint(s).

## Common weak answers

- “Run BFS” without stating indegree initialization, edge direction, and the zero transition.
- “A cycle exists if some node has indegree greater than zero at the end” without distinguishing which nodes are cyclic; leftovers may only depend on cycles.
- “DFS visited means cycle.” Only an edge to an active vertex proves a back edge; reaching a finished vertex is safe.
- “Topological sort returns the only order.” Independent vertices can swap.
- “Minimum semesters equals the number of courses.” With unlimited concurrency it equals longest dependency-chain length.
- “Alien Dictionary compares all character pairs.” Only adjacent words and their first mismatch supply constraints.

## Self-check rubric

Rate each as **not yet**, **with a prompt**, or **independently**:

- I can choose and explain edge direction from a prerequisite statement.
- I can implement Kahn and distinguish its complete order from a partial prefix.
- I can explain both Kahn and DFS cycle tests.
- I can reason about multiple valid orders and the min-priority tie choice.
- I can derive layer counts, DAG DP costs, and all V/E complexity terms.
- I can explain Alien Dictionary's first-mismatch and prefix cases.
- I can distinguish safe-state elimination and tree leaf trimming from topological sorting.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/), [Alien Dictionary](https://leetcode.com/problems/alien-dictionary/), [Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/).

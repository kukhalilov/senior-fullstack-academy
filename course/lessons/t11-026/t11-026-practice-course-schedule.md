# directed acyclic graphs and topological ordering — Problem: Course Schedule

## Goals
- Translate prerequisite pairs into directed edges with the correct direction.
- Use Kahn's algorithm to decide whether every course can be emitted.
- Treat a partial order as failure when a cycle blocks completion.

## Problem statement
There are courses numbered from 0 to numCourses-1. Each pair [course, prerequisite] means the prerequisite must be completed first. Return true if it is possible to complete every course.

## Input constraints
- 1 <= numCourses <= 2,000.
- 0 <= prerequisites.Length <= 5,000.
- Every pair has length 2; course labels are in range.
- All prerequisite pairs are unique.

## Examples with expected output
- numCourses=2, prerequisites=[[1,0]] -> true.
- numCourses=2, prerequisites=[[1,0],[0,1]] -> false.
- numCourses=1, prerequisites=[] -> true.

## Clarifying assumptions
- Add edge prerequisite -> course, because that is the required execution order.
- Isolated courses still count toward completion and begin with indegree zero.
- The constraints forbid duplicate pairs but a self-prerequisite would still be detected as a cycle if generalized.

## Progressive hints
1. A valid course order is a topological ordering.
2. Count incoming prerequisites and start with courses that have none.
3. If the queue empties before numCourses courses are removed, return false.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static bool CanFinish(int numCourses, int[][] prerequisites)
    {
        var outgoing = new List<int>[numCourses];
        for (int i = 0; i < numCourses; i++) outgoing[i] = new List<int>();
        var indegree = new int[numCourses];

        foreach (int[] pair in prerequisites)
        {
            int course = pair[0], prerequisite = pair[1];
            outgoing[prerequisite].Add(course);
            indegree[course]++;
        }

        var ready = new Queue<int>();
        for (int course = 0; course < numCourses; course++)
            if (indegree[course] == 0) ready.Enqueue(course);

        int processed = 0;
        while (ready.Count > 0)
        {
            int current = ready.Dequeue();
            processed++;
            foreach (int next in outgoing[current])
                if (--indegree[next] == 0) ready.Enqueue(next);
        }
        return processed == numCourses;
    }

    static void Check(bool expected, int n, int[][] prerequisites)
    {
        bool actual = CanFinish(n, prerequisites);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(true, 2, new[] { new[] { 1, 0 } });
        Check(false, 2, new[] { new[] { 1, 0 }, new[] { 0, 1 } });
        Check(true, 1, Array.Empty<int[]>());
        Check(true, 4, new[] { new[] { 2, 1 } });
        Check(false, 1, new[] { new[] { 0, 0 } });
        Console.WriteLine("Course Schedule checks passed.");
    }
}
```

## Correctness argument
The queue contains exactly courses whose unprocessed prerequisite count is zero. Removing such a course is legal and releases each dependent by decrementing its indegree. Every course is enqueued at most once, when its final prerequisite is processed. If all numCourses are removed, their removal sequence is a valid course order. If processing stops sooner, every remaining course has at least one remaining prerequisite; following these dependencies in a finite graph eventually repeats a vertex, proving a directed cycle.

## Step-by-step dry run
For edge 0 -> 1, indegrees are [0,1]. Queue starts with 0. Remove 0 and decrement course 1 to zero; enqueue it and remove it. Two courses were processed, so completion is possible.

## Time complexity
O(V+E), where V is numCourses and E is prerequisite count.

## Space complexity
O(V+E) including adjacency lists; O(V) additional state and queue beyond the graph.

## Alternatives and tradeoffs
- DFS with unvisited/active/finished states detects a back edge and therefore a cycle.
- To return an actual course order instead of a boolean, record each removed course as in Course Schedule II.
- A plain recursive DFS may reach depth V; iterative Kahn avoids recursion.

## Common mistakes and gotchas

- Creating edge course -> prerequisite instead of prerequisite -> course.
- Ignoring courses with no edges.
- Returning true just because at least one course was processed.
- Using an ordinary visited bit for directed cycle detection without an active state.
- Deduplicating constraints inconsistently: if duplicate edges are accepted, both indegree increments and decrements must count each occurrence.

## Edge-case tests

- No prerequisites.
- A chain containing all courses.
- A disconnected acyclic component alongside a cycle.
- A self-loop in a generalized input.

## Reflection questions

1. Why does a nonempty Kahn remainder imply a cycle?
2. What invariant does each indegree represent during processing?
3. How would the solution change to return an ordering?

## Source
- [Course Schedule](https://leetcode.com/problems/course-schedule/)

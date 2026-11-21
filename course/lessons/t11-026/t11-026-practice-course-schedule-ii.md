# directed acyclic graphs and topological ordering — Problem: Course Schedule II

## Goals
- Build a full topological ordering, not only a cycle boolean.
- Validate the returned order against every prerequisite edge.
- Return an empty array if any course remains blocked.

## Problem statement
Given numCourses and prerequisite pairs [course, prerequisite], return any ordering of all courses where every prerequisite appears before its course. Return an empty array if no complete order exists.

## Input constraints
- 1 <= numCourses <= 2,000.
- 0 <= prerequisites.Length <= numCourses * (numCourses - 1).
- Every pair has length 2, labels are in range, endpoints differ, and all pairs are distinct.

## Examples with expected output
- numCourses=2, prerequisites=[[1,0]] -> [0,1].
- numCourses=4, prerequisites=[[1,0],[2,0],[3,1],[3,2]] -> [0,2,1,3] is one valid answer.
- numCourses=1, prerequisites=[] -> [0].

## Clarifying assumptions
- Multiple valid orderings may exist; tests must check constraints, not a single exact sequence.
- Edge direction is prerequisite -> dependent.
- An empty result means failure; a valid input with zero courses is excluded by the stated constraints.

## Progressive hints
1. Use the same zero-indegree frontier as the boolean version.
2. Append each removed course to a result array.
3. Return the array only when its length equals numCourses.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int[] FindOrder(int numCourses, int[][] prerequisites)
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

        var order = new List<int>(numCourses);
        while (ready.Count > 0)
        {
            int current = ready.Dequeue();
            order.Add(current);
            foreach (int next in outgoing[current])
                if (--indegree[next] == 0) ready.Enqueue(next);
        }
        return order.Count == numCourses ? order.ToArray() : Array.Empty<int>();
    }

    static bool IsValidOrder(int[] order, int numCourses, int[][] prerequisites)
    {
        if (order.Length != numCourses) return false;
        var position = new int[numCourses];
        var seen = new bool[numCourses];
        for (int i = 0; i < order.Length; i++)
        {
            int course = order[i];
            if (course < 0 || course >= numCourses || seen[course]) return false;
            seen[course] = true;
            position[course] = i;
        }
        foreach (int[] pair in prerequisites)
            if (position[pair[1]] >= position[pair[0]]) return false;
        return true;
    }

    static void Check(int numCourses, int[][] prerequisites, bool possible)
    {
        int[] actual = FindOrder(numCourses, prerequisites);
        if (possible != IsValidOrder(actual, numCourses, prerequisites))
            throw new InvalidOperationException("Course ordering result was invalid.");
    }

    static void Main()
    {
        Check(2, new[] { new[] { 1, 0 } }, true);
        Check(4, new[] { new[] { 1, 0 }, new[] { 2, 0 }, new[] { 3, 1 }, new[] { 3, 2 } }, true);
        Check(1, Array.Empty<int[]>(), true);
        Check(2, new[] { new[] { 1, 0 }, new[] { 0, 1 } }, false);
        Console.WriteLine("Course Schedule II checks passed.");
    }
}
```

## Correctness argument
Kahn's ready invariant is unchanged: every queued course has no remaining prerequisite. Appending each dequeued course therefore places all of its predecessors earlier. When all vertices are appended, every prerequisite edge points forward, so the result is a valid topological ordering. If the result is shorter than numCourses, a cycle blocks at least one course, so the contract requires an empty array.

## Step-by-step dry run
For 0 -> 1, 0 -> 2, 1 -> 3, 2 -> 3, initially only 0 is ready. Removing 0 makes 1 and 2 ready. They may be removed in either order; only after both decrements does 3 reach indegree zero. The output is one valid order.

## Time complexity
O(V+E) for adjacency-list construction and Kahn processing.

## Space complexity
O(V+E) including graph and output; O(V) additional indegree and queue state.

## Alternatives and tradeoffs
- DFS reverse postorder returns another valid order and detects cycles with active states.
- A min-priority queue can choose the smallest ready course at each step for a deterministic lexicographically smallest ordering, at O((V+E) plus V log V) cost.
- Course Schedule uses the same graph and cycle test but discards the order.

## Common mistakes and gotchas

- Requiring one exact order in tests when the prompt accepts any valid result.
- Returning the partial list on a cycle.
- Forgetting isolated courses; every course must appear in the result.
- Reversing prerequisite pair direction.
- Checking only that output length equals V without ensuring each vertex appears once and each edge points forward.

## Edge-case tests

- One course and no edges.
- Multiple independent courses.
- A cycle plus otherwise schedulable courses.
- A diamond dependency where two middle courses can swap.

## Reflection questions

1. Why is every sequence of zero-indegree removals a valid order?
2. How can you verify an arbitrary returned order in O(V+E)?
3. What data structure change gives the lexicographically smallest valid order?

## Source
- [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/)

# directed acyclic graphs and topological ordering — Problem: Parallel Courses

## Goals
- Process all currently ready courses as one semester layer.
- Distinguish course ordering from minimum parallel semester count.
- Detect a prerequisite cycle by incomplete processing.

## Problem statement
Courses are labeled 1 through n. Each relation [before, after] means before must be completed before after. In each semester, any number of courses may be taken if all their prerequisites were completed in earlier semesters. Return the minimum number of semesters needed, or -1 if the graph contains a cycle.

## Input constraints
- 1 <= n <= 5,000.
- 1 <= relations.Length <= 5,000.
- Each relation has length 2; labels are in [1,n].
- Endpoints differ and directed pairs are unique.

## Examples with expected output
- n=3, relations=[[1,3],[2,3]] -> 2.
- n=3, relations=[[1,2],[2,3],[3,1]] -> -1.
- n=4, relations=[[1,3],[2,3],[3,4]] -> 3.

## Clarifying assumptions
- Any number of courses can be taken concurrently; there is no per-semester limit.
- A course may begin only in a later semester after all prerequisites completed in earlier semesters.
- The official problem is premium-gated; its statement and constraints are frozen from the cited LeetCode Wiki page as well as its official page.

## Progressive hints
1. Treat each relation as a directed prerequisite edge from before to after.
2. Courses with indegree zero begin the current semester.
3. Snapshot the queue size before processing the semester so newly ready courses wait for the next layer.
4. If not all courses are processed, a cycle exists.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int MinimumSemesters(int n, int[][] relations)
    {
        var outgoing = new List<int>[n];
        for (int i = 0; i < n; i++) outgoing[i] = new List<int>();
        var indegree = new int[n];
        foreach (int[] relation in relations)
        {
            int before = relation[0] - 1, after = relation[1] - 1;
            outgoing[before].Add(after);
            indegree[after]++;
        }

        var ready = new Queue<int>();
        for (int course = 0; course < n; course++)
            if (indegree[course] == 0) ready.Enqueue(course);

        int completed = 0, semesters = 0;
        while (ready.Count > 0)
        {
            int coursesThisSemester = ready.Count;
            semesters++;
            for (int i = 0; i < coursesThisSemester; i++)
            {
                int course = ready.Dequeue();
                completed++;
                foreach (int next in outgoing[course])
                    if (--indegree[next] == 0) ready.Enqueue(next);
            }
        }
        return completed == n ? semesters : -1;
    }

    static void Check(int expected, int n, int[][] relations)
    {
        int actual = MinimumSemesters(n, relations);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, 3, new[] { new[] { 1, 3 }, new[] { 2, 3 } });
        Check(-1, 3, new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 1 } });
        Check(3, 4, new[] { new[] { 1, 3 }, new[] { 2, 3 }, new[] { 3, 4 } });
        Check(1, 4, Array.Empty<int[]>());
        Console.WriteLine("Parallel Courses checks passed.");
    }
}
```

## Correctness argument
At the start of a semester, the queue contains exactly courses whose prerequisites were completed in earlier semesters. Snapshotting its size prevents a course unlocked during this semester from being taken until the next one, as required. Processing every course in that layer decrements outgoing neighbors; newly zero-indegree courses form the next layer. Inductively, each layer is the earliest possible semester for its courses. Thus the number of layers is minimum. If the process emits fewer than n courses, a cycle blocks the remainder and the answer is -1.

## Step-by-step dry run
For 1 -> 3 and 2 -> 3, the initial queue has 1 and 2. Process both in semester one; course 3 reaches indegree zero, but because the initial layer size was two it remains queued for semester two. The answer is 2.

## Time complexity
O(V+E), since each course and relation is processed a constant number of times.

## Space complexity
O(V+E) including adjacency lists; O(V) auxiliary counts and queue.

## Alternatives and tradeoffs
- A topological order can be computed first, then longest-path depth propagated in that order; this also yields the minimum semester count.
- If semesters have capacity limits, taking every available course is no longer necessarily optimal; a different scheduling problem is required.
- A plain topological sequence alone does not reveal minimum semester layers unless depth is also tracked.

## Common mistakes and gotchas

- Processing courses enqueued during the current semester in the same layer.
- Counting each course as its own semester even when independent courses can be concurrent.
- Forgetting isolated courses; if any exist, they can be taken in the first semester.
- Returning the number of completed layers when a cycle left courses unprocessed.
- Assuming that a minimum-semester schedule is unique.

## Edge-case tests

- All courses independent.
- A long chain.
- Several independent prerequisites unlocking one course.
- A directed cycle and a disconnected acyclic component.

## Reflection questions

1. Why must the queue size be snapshotted at the start of a semester?
2. Why does topological layer count equal the longest dependency chain in edges plus one?
3. What changes when the number of courses per semester is limited?

## Source
- [Parallel Courses](https://leetcode.com/problems/parallel-courses/)
- [LeetCode Wiki: Parallel Courses statement and constraints](https://leetcode.doocs.org/en/lc/1136/)

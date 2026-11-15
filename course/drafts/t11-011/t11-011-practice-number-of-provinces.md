# graph models, representations, and traversal — Problem: Number of Provinces

## Goals

- Interpret a symmetric adjacency matrix as an undirected graph.
- Count connected components by restarting traversal at every unseen city.
- Avoid scanning both matrix triangles unnecessarily.

## Problem statement

Given an n-by-n matrix where entry 1 means two cities are directly connected, return the number of provinces, where direct and indirect connections belong to one group.

## Input constraints

- 1 <= n <= 200.
- The matrix is n-by-n and entries are 0 or 1.
- Diagonal entries are 1 and the matrix is symmetric.

## Examples with expected output

1. [[1,1,0],[1,1,0],[0,0,1]] -> 2.
2. [[1,0,0],[0,1,0],[0,0,1]] -> 3.
3. [[1,1,0],[1,1,1],[0,1,1]] -> 1.

## Clarifying assumptions

- Symmetry makes the relation undirected.
- A city is marked when pushed onto the explicit DFS stack.
- Diagonal self entries do not create a new component.

## Progressive hints

1. Each unseen city starts a new component.
2. Explore all matrix neighbors connected to it.
3. Mark neighbors before pushing.
4. After finishing one component, continue the outer scan.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int FindCircleNum(int[][] isConnected)
    {
        if (isConnected is null) throw new ArgumentNullException(nameof(isConnected));
        int n = isConnected.Length;
        for (int i = 0; i < n; i++)
            if (isConnected[i] is null || isConnected[i].Length != n)
                throw new ArgumentException("Matrix must be square.", nameof(isConnected));

        var visited = new bool[n];
        var stack = new Stack<int>();
        int provinces = 0;
        for (int city = 0; city < n; city++)
        {
            if (visited[city]) continue;
            provinces++;
            visited[city] = true;
            stack.Push(city);
            while (stack.Count > 0)
            {
                int current = stack.Pop();
                for (int neighbor = 0; neighbor < n; neighbor++)
                {
                    if (isConnected[current][neighbor] == 1 && !visited[neighbor])
                    {
                        visited[neighbor] = true;
                        stack.Push(neighbor);
                    }
                }
            }
        }
        return provinces;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(FindCircleNum(new[] { new[] { 1, 1, 0 }, new[] { 1, 1, 0 }, new[] { 0, 0, 1 } }), 2, "Example 1");
        Equal(FindCircleNum(new[] { new[] { 1, 0, 0 }, new[] { 0, 1, 0 }, new[] { 0, 0, 1 } }), 3, "Example 2");
        Equal(FindCircleNum(new[] { new[] { 1, 1, 0 }, new[] { 1, 1, 1 }, new[] { 0, 1, 1 } }), 1, "connected chain");
        Console.WriteLine("All Number of Provinces checks passed.");
    }
}
```

## Correctness argument

The outer loop starts a traversal exactly when it encounters a city not reached by prior traversals. The traversal follows every matrix edge from each popped city and marks each neighbor before pushing; therefore it reaches exactly all cities connected to that start. Such a traversal is one connected component. No city is marked twice, and every city is eventually scanned, so the number of starts equals the number of provinces.

## Step-by-step dry run

For [[1,1,0],[1,1,0],[0,0,1]], start at city 0 and visit 1. After that stack empties, city 1 is already visited. City 2 is unseen, so it starts a second traversal. The count is 2.

## Time complexity

O(n²), because each visited city scans its entire matrix row.

## Space complexity

O(n) for visited state and stack.

## Alternatives and tradeoffs

- Converting to adjacency lists reduces traversal work on a sparse graph but adds preprocessing and storage.
- Disjoint-set union can count components while processing edges, but is covered separately.

## Common mistakes and gotchas

- Counting only direct neighbors rather than transitive connectivity.
- Treating the matrix as directed despite its symmetry contract.
- Omitting the outer loop and missing disconnected cities.
- Marking on pop and inserting duplicate stack entries.

## Edge-case tests

- One city.
- All isolated cities.
- One connected component.
- Several multi-city components.

## Reflection questions

1. Why is the matrix symmetric?
2. Why does each new unvisited start correspond to one province?
3. What is the cost of scanning a matrix row?
4. When would an adjacency list be more memory-efficient?

Source: [LeetCode: Number of Provinces](https://leetcode.com/problems/number-of-provinces/).

# graph models, representations, and traversal — Problem: Keys and Rooms

## Goals

- Model room keys as directed reachability edges.
- Explore from room zero, the only initially unlocked room.
- Count visited rooms without revisiting cycles.

## Problem statement

Rooms are labeled 0 through n-1; only room 0 is initially unlocked. Each room contains keys that unlock other rooms. Return whether every room can be visited.

## Input constraints

- 2 <= n <= 1000.
- Each key is a valid room label.
- Keys within one room are distinct.
- Total keys is at most 3000.

## Examples with expected output

1. [[1],[2],[3],[]] -> true.
2. [[1,3],[3,0,1],[2],[0]] -> false.
3. [[1],[1],[]] -> false.

## Clarifying assumptions

- A key in room u creates a directed reachability edge from u to the unlocked room.
- Room 0 is considered visited at the start.
- Repeated keys are harmless in a defensive implementation.

## Progressive hints

1. Begin only at room zero.
2. Use a stack or queue as the frontier.
3. Mark each room when discovered.
4. Compare visited count with total room count.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static bool CanVisitAllRooms(IList<IList<int>> rooms)
    {
        if (rooms is null) throw new ArgumentNullException(nameof(rooms));
        if (rooms.Count == 0) return true;
        int n = rooms.Count;
        var visited = new bool[n];
        var stack = new Stack<int>();
        visited[0] = true;
        stack.Push(0);
        int count = 0;

        while (stack.Count > 0)
        {
            int room = stack.Pop();
            count++;
            foreach (int key in rooms[room])
            {
                if (key < 0 || key >= n) throw new ArgumentException("Key references an invalid room.", nameof(rooms));
                if (visited[key]) continue;
                visited[key] = true;
                stack.Push(key);
            }
        }
        return count == n;
    }

    private static IList<IList<int>> Rooms(params int[][] values)
    {
        var rooms = new List<IList<int>>();
        foreach (int[] row in values) rooms.Add(row);
        return rooms;
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(CanVisitAllRooms(Rooms(new[] { 1 }, new[] { 2 }, new[] { 3 }, Array.Empty<int>())), true, "Example 1");
        Equal(CanVisitAllRooms(Rooms(new[] { 1, 3 }, new[] { 3, 0, 1 }, new[] { 2 }, new[] { 0 })), false, "Example 2");
        Equal(CanVisitAllRooms(Rooms(new[] { 1 }, new[] { 1 }, Array.Empty<int>())), false, "unreachable room");
        Equal(CanVisitAllRooms(Rooms(new[] { 1 }, new[] { 0 })), true, "cycle reaches all");
        Console.WriteLine("All Keys and Rooms checks passed.");
    }
}
```

## Correctness argument

The stack begins with room 0, the only initially accessible room. Whenever a room is visited, every key it contains is examined; an unseen room is marked before being pushed, so each room is processed once. By induction, every reachable room is eventually visited. No unreachable room can be pushed because keys are the only transitions. Therefore all rooms are visitable exactly when the processed count equals n.

## Step-by-step dry run

For [[1],[2],[3],[]], visit 0 and discover 1; visit 1 and discover 2; visit 2 and discover 3; visit 3. Count is four of four. In the second example, traversal from 0 reaches 1 and 3, but no available key reaches 2, so return false.

## Time complexity

O(V+K), where K is the total number of keys examined.

## Space complexity

O(V) for visited state and frontier.

## Alternatives and tradeoffs

- BFS gives the same reachability result; shortest path length is not requested.
- Recursive DFS uses O(height) calls but cycles require visited state and can create deep recursion.

## Common mistakes and gotchas

- Starting from every room, which incorrectly grants access to locked rooms.
- Treating the keys as undirected edges.
- Forgetting to mark before pushing and inserting duplicate work.
- Checking only whether room n-1 is reachable instead of every room.

## Edge-case tests

- All rooms reachable in a chain.
- One inaccessible room.
- Cyclic keys.
- Empty room key lists.
- Duplicate key in a generalized input.

## Reflection questions

1. Why is traversal directed here?
2. What is the only initial start vertex?
3. Why does visited count prove the answer?
4. When would shortest-path BFS information be useful?

Source: [LeetCode: Keys and Rooms](https://leetcode.com/problems/keys-and-rooms/).

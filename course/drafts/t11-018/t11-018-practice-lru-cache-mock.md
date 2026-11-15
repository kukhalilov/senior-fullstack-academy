# timed mock interviews and spaced problem rehearsal — Problem: LRU Cache

## Goals
- Translate average O(1) lookup and recency updates into a data-structure design.
- Maintain a bijection between keys and linked-list nodes.
- Explain eviction and update behavior precisely.

## Problem statement
Implement an LRU cache with positive capacity. `Get(key)` returns the value if present, otherwise `-1`, and marks a hit as most recently used. `Put(key,value)` inserts or updates a key, marks it most recently used, and evicts the least recently used key if capacity is exceeded.

## Input constraints
- Capacity is from 1 through 3,000.
- Keys are from 0 through 10,000; values from 0 through 100,000.
- At most 200,000 calls are made.
- Get and put must have average O(1) time.

## Examples with expected output
- Capacity 2: `Put(1,1), Put(2,2), Get(1)->1, Put(3,3), Get(2)->-1, Put(4,4), Get(1)->-1, Get(3)->3, Get(4)->4`.
- Capacity 1: `Put(7,8), Put(7,9), Get(7)->9`.

## Clarifying assumptions
- `-1` is the specified miss result; stored values are nonnegative.
- Updating an existing key changes its value and makes it most recently used.
- Only successful `Get` calls change recency.

## Progressive hints
1. A dictionary gives average O(1) lookup but does not track order.
2. A linked list tracks order, but finding an arbitrary key in it is linear.
3. Store each key's linked-list node in the dictionary; then remove and move a node in O(1).
4. Keep most recently used at the front and least recently used at the back.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class LRUCache
{
    private readonly int capacity;
    private readonly Dictionary<int, LinkedListNode<(int Key, int Value)>> nodes = new();
    private readonly LinkedList<(int Key, int Value)> order = new();

    public LRUCache(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        this.capacity = capacity;
    }

    public int Get(int key)
    {
        if (!nodes.TryGetValue(key, out var node)) return -1;
        order.Remove(node);
        order.AddFirst(node);
        return node.Value.Value;
    }

    public void Put(int key, int value)
    {
        if (nodes.TryGetValue(key, out var existing))
        {
            existing.Value = (key, value);
            order.Remove(existing);
            order.AddFirst(existing);
            return;
        }

        var node = order.AddFirst((key, value));
        nodes.Add(key, node);
        if (nodes.Count > capacity)
        {
            var leastRecent = order.Last!;
            order.RemoveLast();
            nodes.Remove(leastRecent.Value.Key);
        }
    }
}

static class Program
{
    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var cache = new LRUCache(2);
        cache.Put(1, 1); cache.Put(2, 2); Check(1, cache.Get(1));
        cache.Put(3, 3); Check(-1, cache.Get(2));
        cache.Put(4, 4); Check(-1, cache.Get(1));
        Check(3, cache.Get(3)); Check(4, cache.Get(4));

        var one = new LRUCache(1);
        one.Put(7, 8); one.Put(7, 9); Check(9, one.Get(7));
        one.Put(8, 1); Check(-1, one.Get(7)); Check(1, one.Get(8));
        Console.WriteLine("LRU Cache checks passed.");
    }
}
```

## Correctness argument
The dictionary maps every resident key to its unique list node. The list contains exactly the resident entries, most recent first and least recent last. A hit moves its existing node to the front; an update changes that node's value and also moves it to the front. A new insertion adds one node at the front. If capacity is exceeded, removing the tail deletes exactly the least recently used entry from both structures. These operations preserve the mapping/list correspondence and required policy.

## Step-by-step dry run
With capacity 2, after `Put(1), Put(2)`, order is `[2,1]`. `Get(1)` changes it to `[1,2]`. `Put(3)` gives `[3,1,2]`, then evicts 2, leaving `[3,1]`.

## Time complexity
Average O(1) per operation under expected hash-table behavior; linked-list node operations are O(1).

## Space complexity
O(capacity) entries in the dictionary and list.

## Alternatives and tradeoffs
- A dictionary plus a custom doubly linked list gives explicit sentinel nodes and fine control, but more pointer code.
- `LinkedList<T>` already provides O(1) removal when the node reference is known. Searching for a value in the list would be O(n) and would not meet the requirement.
- A sorted list or timestamp scan simplifies recency reasoning but makes updates or eviction linear.

## Common mistakes and gotchas
- Updating dictionary value but leaving the old list node/value in place.
- Moving a key on a cache miss.
- Evicting the head instead of the tail under this chosen ordering.
- Removing a node but forgetting its dictionary entry.
- Creating duplicate list nodes when updating an existing key.

## Edge-case tests
- Capacity one.
- Update an existing key and verify new value and recency.
- Miss does not alter the eviction order.
- Repeated hits reorder entries.
- Evict exactly one least-recent entry on each over-capacity insertion.

## Reflection questions
1. Why must the map point to list nodes rather than just values?
2. Which invariant links the dictionary and list?
3. What would change if the cache needed thread safety?

## Source
- [LRU Cache](https://leetcode.com/problems/lru-cache/)

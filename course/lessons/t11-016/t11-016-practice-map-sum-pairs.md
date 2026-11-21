# tries, prefix trees, and string dictionaries — Problem: Map Sum Pairs

## Goals
- Store integer values by string key and query sums for a prefix.
- Maintain aggregate sums along trie paths.
- Handle replacement of an existing key without double-counting its old value.

## Problem statement
Design MapSum with Insert(key,value), replacing a previous value for the same key, and Sum(prefix), returning the total values of all keys beginning with prefix.

## Input constraints
- Key and prefix lengths are 1 through 50 and contain lowercase English letters.
- 1 <= value <= 1,000.
- At most 50 insert and sum calls are made.

## Examples with expected output
- Insert("apple",3), Sum("ap") -> 3.
- Insert("app",2), Sum("ap") -> 5.
- Insert("apple",2) after its value was 3, Sum("ap") -> 4.

## Clarifying assumptions
- Re-inserting a key overwrites its prior value.
- Prefix sums include a key that exactly equals the prefix.
- Empty prefixes are outside the official constraints; this implementation also supports them by aggregating at the root.

## Progressive hints
1. Each node can store the sum of all key values whose paths pass through it.
2. On insert, compute delta = newValue - oldValue and add delta along the key path.
3. Store current key values so replacement can find oldValue.
4. Prefix sum follows the prefix path and returns its node aggregate.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MapSum
{
    private sealed class Node
    {
        public Node?[] Children { get; } = new Node?[26];
        public long Sum { get; set; }
        public int? Value { get; set; }
    }

    private readonly Node root = new();
    private readonly Dictionary<string, int> values = new(StringComparer.Ordinal);

    public void Insert(string key, int value)
    {
        int oldValue = values.GetValueOrDefault(key);
        int delta = value - oldValue;
        values[key] = value;

        Node current = root;
        current.Sum += delta;
        foreach (char ch in key)
        {
            int index = ch - 'a';
            current.Children[index] ??= new Node();
            current = current.Children[index]!;
            current.Sum += delta;
        }
        current.Value = value;
    }

    public int Sum(string prefix)
    {
        Node current = root;
        foreach (char ch in prefix)
        {
            Node? next = current.Children[ch - 'a'];
            if (next is null) return 0;
            current = next;
        }
        return checked((int)current.Sum);
    }
}

static class Program
{
    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var map = new MapSum();
        map.Insert("apple", 3);
        Check(3, map.Sum("ap"));
        map.Insert("app", 2);
        Check(5, map.Sum("ap"));
        map.Insert("apple", 2);
        Check(4, map.Sum("ap"));
        Check(4, map.Sum(""));
        Check(0, map.Sum("z"));
        Console.WriteLine("Map Sum checks passed.");
    }
}
```

## Correctness argument

Maintain the invariant that each node's Sum equals the sum of current values for keys whose paths pass through that node. Inserting key with old value old and new value value changes every prefix aggregate on its path by delta=value-old; all other key paths are unchanged. The root is updated too for the defensive empty-prefix case. The key-value dictionary ensures an overwrite applies only the difference, not the full new value. Sum traverses exactly the queried prefix path; its node aggregate therefore contains precisely keys beginning with that prefix. A missing node has no matching key, so the sum is zero.

## Step-by-step dry run

Insert apple=3. Root, a, ap, app, appl, and apple nodes each gain 3. Insert app=2; root and nodes a, ap, app gain 2, so Sum("ap") is 5. Replace apple by 2; delta=-1 is subtracted from root through apple, producing Sum("ap")=4.

## Time complexity

Insert and Sum each take O(L) trie steps for key or prefix length L, plus expected O(1) hash lookup for overwrite tracking.

## Space complexity

O(total distinct key prefixes) nodes with 26 child references each, plus O(number of distinct keys) map entries.

## Alternatives and tradeoffs

- Recompute prefix sums by scanning a key-value dictionary: less node bookkeeping but O(number of keys times key length) per query.
- Store terminal values and DFS the subtree for each Sum: simpler insert/update but query cost depends on all descendants.
- Prefix aggregates make queries fast but every overwrite must propagate a correct delta along its path.

## Common mistakes and gotchas

- Adding the full replacement value instead of its delta.
- Updating only the terminal node and not prefix ancestors.
- Returning terminal value rather than subtree aggregate.
- Forgetting that a key equal to the queried prefix contributes.
- Using int aggregation without bounding cumulative values.

## Edge-case tests

- Insert one key and query a shared prefix.
- Insert a second key with the same prefix.
- Overwrite a key with a larger and then a smaller value.
- Query an absent prefix.
- Query empty prefix defensively.

## Reflection questions
1. Why is delta sufficient to update every prefix sum?
2. Why does the prefix node's aggregate include a key ending exactly there?
3. What extra work would deletion require?

## Source
- [Map Sum Pairs](https://leetcode.com/problems/map-sum-pairs/)
